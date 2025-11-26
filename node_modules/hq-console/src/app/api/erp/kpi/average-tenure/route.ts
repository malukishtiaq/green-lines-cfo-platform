import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { EncryptionService } from '@/infrastructure/services/EncryptionService';
import axios from 'axios';

/**
 * GET /api/erp/kpi/average-tenure
 * 
 * Calculates Average Employee Tenure KPI from Odoo data
 * Formula: Average(Current Date - Hire Date) for all active employees
 * Result in months
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

    const employees = await fetchActiveEmployees(
      credentials.odooUrl,
      credentials.odooDatabase,
      credentials.odooUsername,
      credentials.odooPassword,
      asOfDate
    );

    const asOfTime = new Date(asOfDate).getTime();
    let totalTenureMonths = 0;
    let employeeCount = 0;

    for (const employee of employees) {
      if (employee.hire_date) {
        const hireTime = new Date(employee.hire_date).getTime();
        const tenureMonths = (asOfTime - hireTime) / (1000 * 60 * 60 * 24 * 30.44);
        if (tenureMonths >= 0) {
          totalTenureMonths += tenureMonths;
          employeeCount++;
        }
      }
    }

    const averageTenure = employeeCount > 0 ? totalTenureMonths / employeeCount : 0;

    return NextResponse.json({
      success: true,
      data: {
        kpiCode: 'HR.AVG_TENURE',
        kpiName: 'Average Tenure (months)',
        asOfDate,
        totalEmployees: employeeCount,
        averageTenureMonths: parseFloat(averageTenure.toFixed(2)),
        formula: 'Average(Current Date - Hire Date) for all active employees',
        calculation: `Total tenure: ${totalTenureMonths.toFixed(2)} months / ${employeeCount} employees = ${averageTenure.toFixed(2)} months`,
      },
    });
  } catch (error: any) {
    console.error('Average Tenure KPI Error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to calculate average tenure' },
      { status: 500 }
    );
  }
}

async function fetchActiveEmployees(
  odooUrl: string,
  database: string,
  username: string,
  password: string,
  asOfDate: string
): Promise<any[]> {
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
    '|',
    ['departure_date', '=', false],
    ['departure_date', '>', asOfDate],
  ];
  const fields = ['id', 'name', 'hire_date'];

  const records = await fetchHREmployeeWithFallback(
    axiosInstance,
    baseUrl,
    sessionId,
    domain,
    fields
  );

  return records;
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

