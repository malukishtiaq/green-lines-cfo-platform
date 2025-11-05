import { NextResponse } from 'next/server';
import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/notifications - List notifications with pagination and filters
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    
    // Get pagination parameters
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const skip = (page - 1) * limit;
    
    // Get filter parameters
    const isRead = searchParams.get('isRead');
    const type = searchParams.get('type');
    const priority = searchParams.get('priority');
    
    // For now, hardcode userId (later get from session)
    const userId = searchParams.get('userId') || 'default-user-id';
    
    // Build where clause
    const whereClause: any = {
      userId,
    };
    
    if (isRead !== null && isRead !== undefined && isRead !== '') {
      whereClause.isRead = isRead === 'true';
    }
    
    if (type) {
      whereClause.type = type;
    }
    
    if (priority) {
      whereClause.priority = priority;
    }
    
    // Get notifications with pagination
    const [notifications, totalCount] = await Promise.all([
      prisma.notification.findMany({
        where: whereClause,
        orderBy: {
          createdAt: 'desc',
        },
        take: limit,
        skip,
      }),
      prisma.notification.count({
        where: whereClause,
      }),
    ]);
    
    // Get unread count
    const unreadCount = await prisma.notification.count({
      where: {
        userId,
        isRead: false,
      },
    });
    
    return NextResponse.json({
      notifications,
      pagination: {
        page,
        limit,
        totalCount,
        totalPages: Math.ceil(totalCount / limit),
      },
      unreadCount,
    });
  } catch (error) {
    console.error('Error fetching notifications:', error);
    return NextResponse.json(
      { error: 'Failed to fetch notifications' },
      { status: 500 }
    );
  }
}

