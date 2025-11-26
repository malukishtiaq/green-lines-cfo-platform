import { NextResponse } from 'next/server';
import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/notifications/preferences - Get notification preferences
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    
    // For now, hardcode userId (later get from session)
    const userId = searchParams.get('userId') || 'default-user-id';
    
    const preferences = await prisma.notificationPreference.findMany({
      where: { userId },
      orderBy: {
        notificationType: 'asc',
      },
    });
    
    return NextResponse.json(preferences);
  } catch (error) {
    console.error('Error fetching notification preferences:', error);
    return NextResponse.json(
      { error: 'Failed to fetch notification preferences' },
      { status: 500 }
    );
  }
}

// PATCH /api/notifications/preferences - Update notification preferences
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, notificationType, emailEnabled, pushEnabled, smsEnabled, inAppEnabled } = body;
    
    const preference = await prisma.notificationPreference.upsert({
      where: {
        userId_notificationType: {
          userId,
          notificationType,
        },
      },
      update: {
        emailEnabled,
        pushEnabled,
        smsEnabled,
        inAppEnabled,
      },
      create: {
        userId,
        notificationType,
        emailEnabled,
        pushEnabled,
        smsEnabled,
        inAppEnabled,
      },
    });
    
    return NextResponse.json(preference);
  } catch (error) {
    console.error('Error updating notification preferences:', error);
    return NextResponse.json(
      { error: 'Failed to update notification preferences' },
      { status: 500 }
    );
  }
}

