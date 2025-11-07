import { NextRequest, NextResponse } from 'next/server';
import { ConnectERPUseCase } from '@/application/use-cases/erp';
import { ERPType, ERPCredentials } from '@/domain/entities/ERPIntegration';
import { prisma } from '@/lib/prisma';

/**
 * GET /api/erp/connections
 * 
 * List all ERP connections, optionally filtered by customerId
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const customerId = searchParams.get('customerId');

    const where = customerId ? { customerId } : {};

    const connections = await prisma.eRPConnection.findMany({
      where,
      include: {
        customer: {
          select: {
            id: true,
            name: true,
            email: true,
            company: true,
          },
        },
        syncHistory: {
          orderBy: {
            createdAt: 'desc',
          },
          take: 5, // Last 5 sync attempts
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    // Don't return encrypted credentials
    const sanitizedConnections = connections.map((conn) => ({
      id: conn.id,
      customerId: conn.customerId,
      customerName: conn.customer.name,
      customerEmail: conn.customer.email,
      erpType: conn.erpType,
      status: conn.status,
      lastSyncDate: conn.lastSyncDate,
      lastSyncStatus: conn.lastSyncStatus,
      lastSyncError: conn.lastSyncError,
      mappingHealth: conn.mappingHealth,
      dataDomains: conn.dataDomains,
      createdAt: conn.createdAt,
      updatedAt: conn.updatedAt,
      syncHistory: conn.syncHistory,
    }));

    return NextResponse.json({
      success: true,
      connections: sanitizedConnections,
    });
  } catch (error: any) {
    console.error('Error fetching ERP connections:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Internal server error',
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/erp/connections
 * 
 * Create new ERP connection
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { customerId, erpType, credentials } = body;

    // Validate required fields
    if (!customerId || !erpType || !credentials) {
      return NextResponse.json(
        { error: 'Missing required fields: customerId, erpType, credentials' },
        { status: 400 }
      );
    }

    // Execute use case
    const useCase = new ConnectERPUseCase();
    const result = await useCase.execute(
      customerId,
      erpType as ERPType,
      credentials as ERPCredentials
    );

    if (result.success) {
      return NextResponse.json({
        success: true,
        connection: result.connection,
        message: result.message,
      }, { status: 201 });
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
    console.error('Error creating ERP connection:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Internal server error',
      },
      { status: 500 }
    );
  }
}

