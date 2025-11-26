import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { EncryptionService } from '@/infrastructure/services/EncryptionService';
import axios from 'axios';

/**
 * GET /api/erp/kpi/revenue-growth
 * 
 * Calculate Revenue Growth KPI from Odoo account.move data
 * Formula: (Revenue_t - Revenue_{t-1}) / Revenue_{t-1} x 100
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const connectionId = searchParams.get('connectionId');
    const startDate = searchParams.get('startDate') || '2024-01-01';
    const endDate = searchParams.get('endDate') || '2024-12-31';

    if (!connectionId) {
      return NextResponse.json(
        { success: false, error: 'Connection ID is required' },
        { status: 400 }
      );
    }

    // Get connection from database
    const connection = await prisma.eRPConnection.findUnique({
      where: { id: connectionId },
    });

    if (!connection) {
      return NextResponse.json(
        { success: false, error: 'Connection not found' },
        { status: 404 }
      );
    }

    if (connection.status !== 'CONNECTED') {
      return NextResponse.json(
        { success: false, error: `Connection is ${connection.status}` },
        { status: 400 }
      );
    }

    // Decrypt credentials
    const credentials = EncryptionService.decrypt(connection.credentialsEncrypted);
    const { odooUrl, odooDatabase, odooUsername, odooPassword } = credentials;

    // Calculate date range for current period
    const currentStart = new Date(startDate);
    const currentEnd = new Date(endDate);
    
    // Calculate date range for previous period (same duration, one period back)
    const periodDays = Math.ceil((currentEnd.getTime() - currentStart.getTime()) / (1000 * 60 * 60 * 24));
    const previousEnd = new Date(currentStart);
    previousEnd.setDate(previousEnd.getDate() - 1);
    const previousStart = new Date(previousEnd);
    previousStart.setDate(previousStart.getDate() - periodDays);

    // Format dates for Odoo (YYYY-MM-DD)
    const formatDate = (date: Date) => date.toISOString().split('T')[0];

    // Fetch current period revenue
    const currentRevenue = await fetchAccountMoveRevenue(
      odooUrl,
      odooDatabase,
      odooUsername,
      odooPassword,
      formatDate(currentStart),
      formatDate(currentEnd)
    );

    // Fetch previous period revenue
    const previousRevenue = await fetchAccountMoveRevenue(
      odooUrl,
      odooDatabase,
      odooUsername,
      odooPassword,
      formatDate(previousStart),
      formatDate(previousEnd)
    );

    // Calculate Revenue Growth %
    let revenueGrowth = 0;
    if (previousRevenue > 0) {
      revenueGrowth = ((currentRevenue - previousRevenue) / previousRevenue) * 100;
    } else if (currentRevenue > 0) {
      revenueGrowth = 100; // Infinite growth (from 0 to positive)
    }

    return NextResponse.json({
      success: true,
      data: {
        kpiCode: 'FIN.REV_GROWTH',
        kpiName: 'Revenue Growth %',
        currentPeriod: {
          startDate: formatDate(currentStart),
          endDate: formatDate(currentEnd),
          revenue: currentRevenue,
        },
        previousPeriod: {
          startDate: formatDate(previousStart),
          endDate: formatDate(previousEnd),
          revenue: previousRevenue,
        },
        revenueGrowth: Math.round(revenueGrowth * 100) / 100, // Round to 2 decimal places
        formula: `(Revenue_t - Revenue_{t-1}) / Revenue_{t-1} x 100`,
        calculation: `(${currentRevenue} - ${previousRevenue}) / ${previousRevenue} x 100 = ${revenueGrowth.toFixed(2)}%`,
      },
    });
  } catch (error: any) {
    console.error('Error calculating Revenue Growth KPI:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to calculate Revenue Growth KPI',
      },
      { status: 500 }
    );
  }
}

/**
 * Fetch revenue from account.move using Odoo API
 * Follows the pattern: authenticate -> get session_id -> use in Cookie header
 */
async function fetchAccountMoveRevenue(
  odooUrl: string,
  database: string,
  username: string,
  password: string,
  startDate: string,
  endDate: string
): Promise<number> {
  try {
    const baseUrl = odooUrl.split('?')[0].replace(/\/$/, '');
    const axiosInstance = axios.create({
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Step 1: Authenticate and get session_id
    const authUrl = `${baseUrl}/web/session/authenticate`;
    console.log('🔐 Authenticating with Odoo for Revenue Growth:', {
      url: authUrl,
      database,
      username,
    });

    const authResponse = await axiosInstance.post(authUrl, {
      jsonrpc: '2.0',
      method: 'call',
      params: {
        db: database,
        login: username,
        password: password,
      },
    });

    if (!authResponse.data.result || !authResponse.data.result.uid) {
      throw new Error('Failed to authenticate with Odoo');
    }

    // Extract session_id from cookies
    let sessionId = '';
    const cookies = authResponse.headers['set-cookie'];
    if (cookies) {
      for (const cookie of cookies) {
        const match = cookie.match(/session_id=([^;]+)/);
        if (match) {
          sessionId = match[1];
          break;
        }
      }
    }

    if (!sessionId) {
      throw new Error('Failed to extract session_id from authentication response');
    }

    console.log('✅ Authenticated with session_id:', sessionId.substring(0, 10) + '...');

    // Step 2: Fetch account.move records using session-based authentication
    // Try different endpoints for Odoo v18 compatibility
    const domain = [
      ['state', '=', 'posted'],
      ['move_type', 'in', ['out_invoice', 'out_refund']],
      ['date', '>=', startDate],
      ['date', '<=', endDate],
    ];
    const fields = ['id', 'amount_total', 'date', 'move_type'];
    
    const records = await fetchAccountMoveWithFallback(
      axiosInstance,
      baseUrl,
      sessionId,
      domain,
      fields
    );

    // Calculate total revenue
    // out_invoice is positive, out_refund is negative
    let totalRevenue = 0;
    for (const record of records) {
      if (record.move_type === 'out_invoice') {
        totalRevenue += record.amount_total || 0;
      } else if (record.move_type === 'out_refund') {
        totalRevenue -= record.amount_total || 0;
      }
    }

    console.log(`✅ Fetched ${records.length} records, total revenue: ${totalRevenue}`);

    return totalRevenue;
  } catch (error: any) {
    console.error('Error fetching account.move revenue:', error);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    }
    throw new Error(`Failed to fetch revenue from Odoo: ${error.message}`);
  }
}

/**
 * Fetch account.move records with fallback for different Odoo versions
 * Tries multiple endpoints until one succeeds
 */
async function fetchAccountMoveWithFallback(
  axiosInstance: any,
  baseUrl: string,
  sessionId: string,
  domain: any[],
  fields: string[]
): Promise<any[]> {
  const endpoints = [
    // Option 1: /web/dataset/search_read (Odoo v15+)
    {
      url: `${baseUrl}/web/dataset/search_read`,
      payload: {
        jsonrpc: '2.0',
        method: 'call',
        params: {
          model: 'account.move',
          domain,
          fields,
          limit: 10000,
          sort: '',
          context: {},
        },
      },
    },
    // Option 2: /web/dataset/call_kw (Odoo v14+)
    {
      url: `${baseUrl}/web/dataset/call_kw`,
      payload: {
        jsonrpc: '2.0',
        method: 'call',
        params: {
          model: 'account.move',
          method: 'search_read',
          args: [],
          kwargs: {
            domain,
            fields,
          },
        },
      },
    },
    // Option 3: /web/dataset/call_kw/account.move/search_read (Odoo v13)
    {
      url: `${baseUrl}/web/dataset/call_kw/account.move/search_read`,
      payload: {
        jsonrpc: '2.0',
        method: 'call',
        params: {
          model: 'account.move',
          method: 'search_read',
          args: [],
          kwargs: {
            domain,
            fields,
          },
        },
      },
    },
  ];

  let lastError: any = null;

  for (const endpoint of endpoints) {
    try {
      console.log(`📡 Trying endpoint: ${endpoint.url}`);
      
      const response = await axiosInstance.post(
        endpoint.url,
        endpoint.payload,
        {
          headers: {
            Cookie: `session_id=${sessionId}`,
          },
        }
      );

      if (response.data.error) {
        console.log(`❌ Endpoint failed with error: ${response.data.error.message}`);
        lastError = new Error(response.data.error.message);
        continue;
      }

      if (response.data.result) {
        console.log(`✅ Endpoint succeeded: ${endpoint.url}`);
        console.log(`   Fetched ${response.data.result.length} records`);
        return response.data.result;
      }
    } catch (error: any) {
      console.log(`❌ Endpoint ${endpoint.url} failed: ${error.message}`);
      lastError = error;
      continue;
    }
  }

  // If all endpoints failed, throw the last error
  throw new Error(
    `All Odoo API endpoints failed. Last error: ${lastError?.message || 'Unknown error'}`
  );
}

