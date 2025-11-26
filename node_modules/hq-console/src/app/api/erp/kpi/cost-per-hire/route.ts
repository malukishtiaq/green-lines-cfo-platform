import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

/**
 * GET /api/erp/kpi/cost-per-hire
 * 
 * Calculates Cost per Hire KPI
 * Formula: Total Recruiting Costs / Number of Hires
 * 
 * Note: Placeholder implementation - requires recruitment module data
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

    // Placeholder values
    const totalRecruitingCosts = 25000;
    const numberOfHires = 5;
    const costPerHire = numberOfHires > 0 ? totalRecruitingCosts / numberOfHires : 0;

    return NextResponse.json({
      success: true,
      data: {
        kpiCode: 'HR.COST_PER_HIRE',
        kpiName: 'Cost per Hire',
        period: {
          startDate,
          endDate,
        },
        totalRecruitingCosts,
        numberOfHires,
        costPerHire: parseFloat(costPerHire.toFixed(2)),
        formula: 'Total Recruiting Costs / Number of Hires',
        calculation: `${totalRecruitingCosts.toFixed(2)} / ${numberOfHires} = ${costPerHire.toFixed(2)}`,
        note: 'Placeholder implementation - requires recruitment module configuration',
      },
    });
  } catch (error: any) {
    console.error('Cost per Hire KPI Error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to calculate cost per hire' },
      { status: 500 }
    );
  }
}

