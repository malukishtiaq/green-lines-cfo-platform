import { NextRequest, NextResponse } from 'next/server';
import { TestERPConnectionUseCase } from '@/application/use-cases/erp';
import { ERPType, ERPCredentials } from '@/domain/entities/ERPIntegration';

/**
 * POST /api/erp/test-connection
 * 
 * Test ERP credentials without saving to database
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { erpType, credentials } = body;

    // Validate required fields
    if (!erpType || !credentials) {
      return NextResponse.json(
        { error: 'Missing required fields: erpType, credentials' },
        { status: 400 }
      );
    }

    // Execute use case
    const useCase = new TestERPConnectionUseCase();
    const result = await useCase.execute(erpType as ERPType, credentials as ERPCredentials);

    if (result.success) {
      return NextResponse.json({
        success: true,
        message: result.message,
        serverInfo: result.serverInfo,
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
    console.error('Error in test-connection API:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Internal server error',
      },
      { status: 500 }
    );
  }
}

