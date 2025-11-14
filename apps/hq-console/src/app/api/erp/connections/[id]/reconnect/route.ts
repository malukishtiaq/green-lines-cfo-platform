import { NextRequest, NextResponse } from 'next/server';
import { ReconnectERPUseCase } from '@/application/use-cases/erp';

interface RouteContext {
  params: Promise<{
    id?: string;
  }>;
}

export async function POST(_request: NextRequest, context: RouteContext) {
  try {
    const { id: connectionId } = await context.params;

    if (!connectionId) {
      return NextResponse.json(
        {
          success: false,
          error: 'Missing connection id',
        },
        { status: 400 },
      );
    }

    const useCase = new ReconnectERPUseCase();
    const result = await useCase.execute(connectionId);

    if (!result.success) {
      return NextResponse.json(
        {
          success: false,
          error: result.message,
          connection: result.connection,
        },
        { status: 400 },
      );
    }

    return NextResponse.json({
      success: true,
      message: result.message,
      connection: result.connection,
    });
  } catch (error: any) {
    console.error('Error reconnecting ERP session:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to reconnect ERP session',
      },
      { status: 500 },
    );
  }
}


