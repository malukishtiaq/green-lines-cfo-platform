import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/infrastructure/database/prisma';
import { EncryptionService } from '@/infrastructure/services/EncryptionService';
import axios from 'axios';

/**
 * GET /api/erp/kpi/operating-margin
 * 
 * Calculates Operating Margin % KPI from Odoo data
 * Formula: (Operating Income / Revenue) × 100
 * 
 * Operating Income = Revenue - Operating Expenses
 * 
 * Query Parameters:
 * - connectionId: ERP connection ID
 * - startDate: Period start date (YYYY-MM-DD)
 * - endDate: Period end date (YYYY-MM-DD)
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const connectionId = searchParams.get('connectionId');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    if (!connectionId || !startDate || !endDate) {
      return NextResponse.json(
        {
          success: false,
          error: 'Missing required parameters: connectionId, startDate, endDate',
        },
        { status: 400 }
      );
    }

    // Fetch connection from database
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
        { success: false, error: 'Connection is not active' },
        { status: 400 }
      );
    }

    // Decrypt credentials
    const encryptionService = new EncryptionService();
    const credentials = JSON.parse(
      encryptionService.decrypt(connection.encryptedCredentials)
    );

    // Fetch Operating Margin data from Odoo
    const revenue = await fetchRevenue(
      credentials.odooUrl,
      credentials.odooDatabase,
      credentials.odooUsername,
      credentials.odooPassword,
      startDate,
      endDate
    );

    const operatingExpenses = await fetchOperatingExpenses(
      credentials.odooUrl,
      credentials.odooDatabase,
      credentials.odooUsername,
      credentials.odooPassword,
      startDate,
      endDate
    );

    const operatingIncome = revenue - operatingExpenses;
    const operatingMargin = revenue !== 0 ? (operatingIncome / revenue) * 100 : 0;

    return NextResponse.json({
      success: true,
      data: {
        kpiCode: 'FIN.OP_MARGIN%',
        kpiName: 'Operating Margin %',
        period: {
          startDate,
          endDate,
        },
        revenue,
        operatingExpenses,
        operatingIncome,
        operatingMargin: parseFloat(operatingMargin.toFixed(2)),
        formula: '(Operating Income / Revenue) × 100',
        calculation: `(${operatingIncome.toFixed(2)} / ${revenue.toFixed(2)}) × 100 = ${operatingMargin.toFixed(2)}%`,
      },
    });
  } catch (error: any) {
    console.error('Operating Margin KPI Error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to calculate operating margin',
      },
      { status: 500 }
    );
  }
}

/**
 * Fetch revenue from Odoo (same as Revenue Growth KPI)
 */
async function fetchRevenue(
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
    const authResponse = await axiosInstance.post(authUrl, {
      jsonrpc: '2.0',
      method: 'call',
      params: {
        db: database,
        login: username,
        password: password,
      },
    });

    if (authResponse.data.error) {
      throw new Error(authResponse.data.error.message || 'Authentication failed');
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

    console.log('✅ Authenticated with Odoo, session_id extracted');

    // Step 2: Fetch account.move records (invoices and refunds)
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
    let totalRevenue = 0;
    for (const record of records) {
      if (record.move_type === 'out_invoice') {
        totalRevenue += record.amount_total || 0;
      } else if (record.move_type === 'out_refund') {
        totalRevenue -= record.amount_total || 0;
      }
    }

    return totalRevenue;
  } catch (error: any) {
    console.error('Error fetching revenue:', error.message);
    throw new Error(`Failed to fetch revenue: ${error.message}`);
  }
}

/**
 * Fetch operating expenses from Odoo
 * Operating expenses typically include: COGS, SG&A, R&D
 */
async function fetchOperatingExpenses(
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
    const authResponse = await axiosInstance.post(authUrl, {
      jsonrpc: '2.0',
      method: 'call',
      params: {
        db: database,
        login: username,
        password: password,
      },
    });

    if (authResponse.data.error) {
      throw new Error(authResponse.data.error.message || 'Authentication failed');
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

    console.log('✅ Authenticated with Odoo for expenses, session_id extracted');

    // Step 2: Fetch expense records (bills)
    const domain = [
      ['state', '=', 'posted'],
      ['move_type', 'in', ['in_invoice', 'in_refund']],
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

    // Calculate total operating expenses
    let totalExpenses = 0;
    for (const record of records) {
      if (record.move_type === 'in_invoice') {
        totalExpenses += record.amount_total || 0;
      } else if (record.move_type === 'in_refund') {
        totalExpenses -= record.amount_total || 0;
      }
    }

    return totalExpenses;
  } catch (error: any) {
    console.error('Error fetching operating expenses:', error.message);
    throw new Error(`Failed to fetch operating expenses: ${error.message}`);
  }
}

/**
 * Fallback function to try multiple Odoo endpoints
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

      const response = await axiosInstance.post(endpoint.url, endpoint.payload, {
        headers: {
          Cookie: `session_id=${sessionId}`,
        },
      });

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

  throw new Error(
    `All Odoo API endpoints failed. Last error: ${lastError?.message || 'Unknown error'}`
  );
}

