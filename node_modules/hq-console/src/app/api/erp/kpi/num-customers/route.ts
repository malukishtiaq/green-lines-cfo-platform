import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { EncryptionService } from '@/infrastructure/services/EncryptionService';
import axios from 'axios';

/**
 * GET /api/erp/kpi/num-customers
 * 
 * Calculates Number of Customers KPI from Odoo data
 * Formula: Count of active customers (partners with customer = true)
 * 
 * Query Parameters:
 * - connectionId: ERP connection ID
 * - asOfDate: Calculate as of this date (YYYY-MM-DD)
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const connectionId = searchParams.get('connectionId');
    const asOfDate = searchParams.get('asOfDate') || new Date().toISOString().split('T')[0];

    if (!connectionId) {
      return NextResponse.json(
        { success: false, error: 'Missing required parameter: connectionId' },
        { status: 400 }
      );
    }

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

    const encryptionService = new EncryptionService();
    const credentials = JSON.parse(
      encryptionService.decrypt(connection.encryptedCredentials)
    );

    const numberOfCustomers = await fetchCustomerCount(
      credentials.odooUrl,
      credentials.odooDatabase,
      credentials.odooUsername,
      credentials.odooPassword
    );

    return NextResponse.json({
      success: true,
      data: {
        kpiCode: 'SALES.NUM_CUSTOMERS',
        kpiName: 'Number of Customers',
        asOfDate,
        numberOfCustomers,
        formula: 'Count of active customers',
        calculation: `Total customers: ${numberOfCustomers}`,
      },
    });
  } catch (error: any) {
    console.error('Number of Customers KPI Error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to calculate number of customers' },
      { status: 500 }
    );
  }
}

async function fetchCustomerCount(
  odooUrl: string,
  database: string,
  username: string,
  password: string
): Promise<number> {
  const baseUrl = odooUrl.split('?')[0].replace(/\/$/, '');
  const axiosInstance = axios.create({
    timeout: 30000,
    headers: { 'Content-Type': 'application/json' },
  });

  const authUrl = `${baseUrl}/web/session/authenticate`;
  const authResponse = await axiosInstance.post(authUrl, {
    jsonrpc: '2.0',
    method: 'call',
    params: { db: database, login: username, password: password },
  });

  if (authResponse.data.error) {
    throw new Error(authResponse.data.error.message || 'Authentication failed');
  }

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

  if (!sessionId) throw new Error('Failed to extract session_id');

  const domain = [
    ['customer_rank', '>', 0],
    ['active', '=', true],
  ];
  const fields = ['id', 'name'];

  const records = await fetchPartnerWithFallback(
    axiosInstance,
    baseUrl,
    sessionId,
    domain,
    fields
  );

  return records.length;
}

async function fetchPartnerWithFallback(
  axiosInstance: any,
  baseUrl: string,
  sessionId: string,
  domain: any[],
  fields: string[]
): Promise<any[]> {
  const endpoints = [
    {
      url: `${baseUrl}/web/dataset/search_read`,
      payload: {
        jsonrpc: '2.0',
        method: 'call',
        params: { model: 'res.partner', domain, fields, limit: 10000, sort: '', context: {} },
      },
    },
    {
      url: `${baseUrl}/web/dataset/call_kw`,
      payload: {
        jsonrpc: '2.0',
        method: 'call',
        params: { model: 'res.partner', method: 'search_read', args: [], kwargs: { domain, fields } },
      },
    },
  ];

  let lastError: any = null;

  for (const endpoint of endpoints) {
    try {
      const response = await axiosInstance.post(endpoint.url, endpoint.payload, {
        headers: { Cookie: `session_id=${sessionId}` },
      });

      if (response.data.error) {
        lastError = new Error(response.data.error.message);
        continue;
      }

      if (response.data.result) {
        return response.data.result;
      }
    } catch (error: any) {
      lastError = error;
      continue;
    }
  }

  throw new Error(`All Odoo API endpoints failed. Last error: ${lastError?.message || 'Unknown error'}`);
}

