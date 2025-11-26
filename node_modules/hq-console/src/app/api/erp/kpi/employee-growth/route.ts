import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { EncryptionService } from '@/infrastructure/services/EncryptionService';
import axios from 'axios';

/**
 * GET /api/erp/kpi/employee-growth
 * 
 * Calculates Employee Growth Rate % KPI from Odoo data
 * Formula: ((Employees_current - Employees_previous) / Employees_previous) × 100
 * 
 * Query Parameters:
 * - connectionId: ERP connection ID
 * - currentDate: Current period date (YYYY-MM-DD)
 * - previousDate: Previous period date (YYYY-MM-DD)
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const connectionId = searchParams.get('connectionId');
    const currentDate = searchParams.get('currentDate') || new Date().toISOString().split('T')[0];
    const previousDate = searchParams.get('previousDate') || new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

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

    const currentEmployees = await fetchEmployeeCount(
      credentials.odooUrl,
      credentials.odooDatabase,
      credentials.odooUsername,
      credentials.odooPassword,
      currentDate
    );

    const previousEmployees = await fetchEmployeeCount(
      credentials.odooUrl,
      credentials.odooDatabase,
      credentials.odooUsername,
      credentials.odooPassword,
      previousDate
    );

    const employeeGrowth = previousEmployees !== 0 
      ? ((currentEmployees - previousEmployees) / previousEmployees) * 100
      : currentEmployees > 0 ? 100 : 0;

    return NextResponse.json({
      success: true,
      data: {
        kpiCode: 'HR.EMP_GROWTH%',
        kpiName: 'Employee Growth Rate %',
        currentPeriod: {
          date: currentDate,
          employees: currentEmployees,
        },
        previousPeriod: {
          date: previousDate,
          employees: previousEmployees,
        },
        employeeGrowth: parseFloat(employeeGrowth.toFixed(2)),
        formula: '((Employees_current - Employees_previous) / Employees_previous) × 100',
        calculation: `((${currentEmployees} - ${previousEmployees}) / ${previousEmployees}) × 100 = ${employeeGrowth.toFixed(2)}%`,
      },
    });
  } catch (error: any) {
    console.error('Employee Growth KPI Error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to calculate employee growth' },
      { status: 500 }
    );
  }
}

async function fetchEmployeeCount(
  odooUrl: string,
  database: string,
  username: string,
  password: string,
  asOfDate: string
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

  // Fetch active employees as of date
  const domain = [
    '|',
    ['departure_date', '=', false],
    ['departure_date', '>', asOfDate],
  ];
  const fields = ['id', 'name'];

  const records = await fetchHREmployeeWithFallback(
    axiosInstance,
    baseUrl,
    sessionId,
    domain,
    fields
  );

  return records.length;
}

async function fetchHREmployeeWithFallback(
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
        params: { model: 'hr.employee', domain, fields, limit: 10000, sort: '', context: {} },
      },
    },
    {
      url: `${baseUrl}/web/dataset/call_kw`,
      payload: {
        jsonrpc: '2.0',
        method: 'call',
        params: { model: 'hr.employee', method: 'search_read', args: [], kwargs: { domain, fields } },
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

