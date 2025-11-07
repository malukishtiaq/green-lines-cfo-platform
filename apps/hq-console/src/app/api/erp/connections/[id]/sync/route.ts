import { NextRequest, NextResponse } from 'next/server';
import { SyncERPDataUseCase } from '@/application/use-cases/erp';

/**
 * POST /api/erp/connections/[id]/sync
 * 
 * Trigger data sync for an ERP connection
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const connectionId = params.id;
    const body = await request.json();
    const { domains, triggeredBy } = body;

    // Validate required fields
    if (!domains || !Array.isArray(domains) || domains.length === 0) {
      return NextResponse.json(
        { error: 'Missing required field: domains (array)' },
        { status: 400 }
      );
    }

    // Execute use case
    const useCase = new SyncERPDataUseCase();
    const result = await useCase.execute(connectionId, domains, triggeredBy);

    if (result.success) {
      return NextResponse.json({
        success: true,
        syncResult: result.syncResult,
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
    console.error('Error syncing ERP data:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Internal server error',
      },
      { status: 500 }
    );
  }
}

