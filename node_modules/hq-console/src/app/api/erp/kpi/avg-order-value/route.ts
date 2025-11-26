import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { EncryptionService } from '@/infrastructure/services/EncryptionService';
import axios from 'axios';

/**
 * GET /api/erp/kpi/avg-order-value
 * 
 * Calculates Average Order Value KPI from Odoo data
 * Formula: Total Revenue / Number of Orders
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
        { success: false, error: 'Missing required parameters: connectionId, startDate, endDate' },
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

    const { totalRevenue, numberOfOrders } = await fetchRevenueAndOrders(
      credentials.odooUrl,
      credentials.odooDatabase,
      credentials.odooUsername,
      credentials.odooPassword,
      startDate,
      endDate
    );

    const avgOrderValue = numberOfOrders > 0 ? totalRevenue / numberOfOrders : 0;

    return NextResponse.json({
      success: true,
      data: {
        kpiCode: 'SALES.AVG_ORDER_VALUE',
        kpiName: 'Average Order Value',
        period: {
          startDate,
          endDate,
        },
        totalRevenue,
        numberOfOrders,
        avgOrderValue: parseFloat(avgOrderValue.toFixed(2)),
        formula: 'Total Revenue / Number of Orders',
        calculation: `${totalRevenue.toFixed(2)} / ${numberOfOrders} = ${avgOrderValue.toFixed(2)}`,
      },
    });
  } catch (error: any) {
    console.error('Average Order Value KPI Error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to calculate average order value' },
      { status: 500 }
    );
  }
}

async function fetchRevenueAndOrders(
  odooUrl: string,
  database: string,
  username: string,
  password: string,
  startDate: string,
  endDate: string
): Promise<{ totalRevenue: number; numberOfOrders: number }> {
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
    ['state', '=', 'posted'],
    ['move_type', '=', 'out_invoice'],
    ['date', '>=', startDate],
    ['date', '<=', endDate],
  ];
  const fields = ['id', 'amount_total'];

  const records = await fetchAccountMoveWithFallback(
    axiosInstance,
    baseUrl,
    sessionId,
    domain,
    fields
  );

  let totalRevenue = 0;
  for (const record of records) {
    totalRevenue += record.amount_total || 0;
  }

  return {
    totalRevenue,
    numberOfOrders: records.length,
  };
}

async function fetchAccountMoveWithFallback(
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
        params: { model: 'account.move', domain, fields, limit: 10000, sort: '', context: {} },
      },
    },
    {
      url: `${baseUrl}/web/dataset/call_kw`,
      payload: {
        jsonrpc: '2.0',
        method: 'call',
        params: { model: 'account.move', method: 'search_read', args: [], kwargs: { domain, fields } },
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

