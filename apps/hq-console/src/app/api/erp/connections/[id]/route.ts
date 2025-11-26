import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

interface RouteContext {
  params: {
    id: string;
  };
}

// DELETE /api/erp/connections/[id]
// Deletes a single ERP connection (and its sync history via cascade)
export async function DELETE(_request: NextRequest, context: RouteContext) {
  try {
    const { id } = context.params;

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Missing connection id' },
        { status: 400 },
      );
    }

    await prisma.eRPConnection.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error deleting ERP connection:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to delete ERP connection',
      },
      { status: 500 },
    );
  }
}


