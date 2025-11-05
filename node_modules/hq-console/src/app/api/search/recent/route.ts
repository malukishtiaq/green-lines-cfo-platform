import { NextResponse } from 'next/server';
import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/search/recent - Get recent searches
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    
    const userId = searchParams.get('userId') || 'default-user-id';
    const limit = parseInt(searchParams.get('limit') || '5');
    
    const recentSearches = await prisma.searchLog.findMany({
      where: { userId },
      orderBy: {
        createdAt: 'desc',
      },
      take: limit,
      distinct: ['query'], // Only unique queries
    });
    
    return NextResponse.json(recentSearches);
  } catch (error) {
    console.error('Error fetching recent searches:', error);
    return NextResponse.json(
      { error: 'Failed to fetch recent searches' },
      { status: 500 }
    );
  }
}

