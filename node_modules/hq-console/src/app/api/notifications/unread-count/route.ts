import { NextResponse } from 'next/server';
import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/notifications/unread-count - Get count of unread notifications
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    
    // For now, hardcode userId (later get from session)
    const userId = searchParams.get('userId') || 'default-user-id';
    
    const unreadCount = await prisma.notification.count({
      where: {
        userId,
        isRead: false,
      },
    });
    
    return NextResponse.json({ unreadCount });
  } catch (error) {
    console.error('Error fetching unread count:', error);
    return NextResponse.json(
      { error: 'Failed to fetch unread count' },
      { status: 500 }
    );
  }
}

