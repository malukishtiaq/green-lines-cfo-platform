import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { EncryptionService } from '@/infrastructure/services/EncryptionService';
import axios from 'axios';

/**
 * GET /api/erp/kpi/debt-equity
 * 
 * Calculates Debt-to-Equity Ratio KPI from Odoo data
 * Formula: Total Debt / Total Equity
 * 
 * Note: Requires balance sheet data from GL accounts
 * 
 * Query Parameters:
 * - connectionId: ERP connection ID
 * - asOfDate: Balance sheet date (YYYY-MM-DD)
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const connectionId = searchParams.get('connectionId');
    const asOfDate = searchParams.get('asOfDate') || new Date().toISOString().split('T')[0];

    if (!connectionId) {
      return NextResponse.json(
        {
          success: false,
          error: 'Missing required parameter: connectionId',
        },
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

    // For simplified implementation, we'll use placeholder values
    // In a full implementation, this would fetch from account.account model
    const totalDebt = 50000; // Placeholder
    const totalEquity = 100000; // Placeholder
    
    const debtEquityRatio = totalEquity !== 0 ? totalDebt / totalEquity : 0;

    return NextResponse.json({
      success: true,
      data: {
        kpiCode: 'FIN.DEBT_EQUITY',
        kpiName: 'Debt-to-Equity Ratio',
        asOfDate,
        totalDebt,
        totalEquity,
        debtEquityRatio: parseFloat(debtEquityRatio.toFixed(2)),
        formula: 'Total Debt / Total Equity',
        calculation: `${totalDebt.toFixed(2)} / ${totalEquity.toFixed(2)} = ${debtEquityRatio.toFixed(2)}`,
        note: 'Placeholder implementation - requires GL account configuration',
      },
    });
  } catch (error: any) {
    console.error('Debt-to-Equity KPI Error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to calculate debt-to-equity ratio',
      },
      { status: 500 }
    );
  }
}

