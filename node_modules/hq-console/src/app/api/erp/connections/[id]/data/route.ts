import { NextRequest, NextResponse } from 'next/server';
import { GetERPDataUseCase } from '@/application/use-cases/erp';

/**
 * GET /api/erp/connections/[id]/data
 * 
 * Get synced data from ERP
 * 
 * Query params:
 * - type: 'customers' | 'invoices' | 'payments' | 'transactions' | 'salesOrders'
 * - startDate: ISO date string (optional)
 * - endDate: ISO date string (optional)
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const connectionId = params.id;
    const { searchParams } = new URL(request.url);
    
    const type = searchParams.get('type') as 'customers' | 'invoices' | 'payments' | 'transactions' | 'salesOrders';
    const startDateStr = searchParams.get('startDate');
    const endDateStr = searchParams.get('endDate');

    // Validate required fields
    if (!type) {
      return NextResponse.json(
        { error: 'Missing required query parameter: type' },
        { status: 400 }
      );
    }

    // Parse dates if provided
    const startDate = startDateStr ? new Date(startDateStr) : undefined;
    const endDate = endDateStr ? new Date(endDateStr) : undefined;

    // Execute use case
    const useCase = new GetERPDataUseCase();
    const result = await useCase.execute(connectionId, type, startDate, endDate);

    if (result.success) {
      return NextResponse.json({
        success: true,
        data: result.data,
        count: result.data?.length || 0,
        message: result.message,
      });
    } else {
      return NextResponse.json(
        {
          success: false,
          error: result.message,
        },
        { status: 400 }
      );
    }
  } catch (error: any) {
    console.error('Error fetching ERP data:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Internal server error',
      },
      { status: 500 }
    );
  }
}

