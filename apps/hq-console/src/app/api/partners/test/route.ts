import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// Test endpoint to diagnose partner API issues
export async function GET() {
  try {
    // Test database connection
    const dbTest = await prisma.$queryRaw`SELECT 1 as test`;
    
    // Test simple partner count
    const partnerCount = await prisma.partner.count();
    
    // Test partner fetch with minimal fields
    const partners = await prisma.partner.findMany({
      select: {
        id: true,
        name: true,
      },
      take: 1,
    });
    
    return NextResponse.json({
      status: 'ok',
      dbConnection: 'working',
      partnerCount,
      samplePartner: partners[0] || null,
    });
  } catch (error: any) {
    console.error('Partner API test error:', error);
    return NextResponse.json(
      {
        status: 'error',
        error: error.message,
        stack: error.stack,
      },
      { status: 500 }
    );
  }
}

