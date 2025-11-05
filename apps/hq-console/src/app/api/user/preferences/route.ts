import { NextResponse } from 'next/server';
import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/user/preferences - Get user preferences
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    
    // For now, hardcode userId (later get from session)
    const userId = searchParams.get('userId') || 'default-user-id';
    
    let preference = await prisma.userPreference.findUnique({
      where: { userId },
    });
    
    // If no preference exists, create default one
    if (!preference) {
      preference = await prisma.userPreference.create({
        data: {
          userId,
          language: 'en',
          currency: 'AED',
          timezone: 'Asia/Dubai',
          dateFormat: 'DD/MM/YYYY',
          defaultRegion: null,
          defaultDateRange: 'THIS_MONTH',
          emailNotifications: true,
          pushNotifications: true,
          smsNotifications: false,
          sidebarCollapsed: false,
        },
      });
    }
    
    return NextResponse.json(preference);
  } catch (error) {
    console.error('Error fetching user preferences:', error);
    return NextResponse.json(
      { error: 'Failed to fetch user preferences' },
      { status: 500 }
    );
  }
}

// PATCH /api/user/preferences - Update user preferences
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      userId,
      language,
      currency,
      timezone,
      dateFormat,
      defaultRegion,
      defaultOrg,
      defaultDateRange,
      emailNotifications,
      pushNotifications,
      smsNotifications,
      sidebarCollapsed,
      dashboardLayout,
    } = body;
    
    const preference = await prisma.userPreference.upsert({
      where: { userId },
      update: {
        ...(language !== undefined && { language }),
        ...(currency !== undefined && { currency }),
        ...(timezone !== undefined && { timezone }),
        ...(dateFormat !== undefined && { dateFormat }),
        ...(defaultRegion !== undefined && { defaultRegion }),
        ...(defaultOrg !== undefined && { defaultOrg }),
        ...(defaultDateRange !== undefined && { defaultDateRange }),
        ...(emailNotifications !== undefined && { emailNotifications }),
        ...(pushNotifications !== undefined && { pushNotifications }),
        ...(smsNotifications !== undefined && { smsNotifications }),
        ...(sidebarCollapsed !== undefined && { sidebarCollapsed }),
        ...(dashboardLayout !== undefined && { dashboardLayout }),
      },
      create: {
        userId,
        language: language || 'en',
        currency: currency || 'AED',
        timezone: timezone || 'Asia/Dubai',
        dateFormat: dateFormat || 'DD/MM/YYYY',
        defaultRegion,
        defaultOrg,
        defaultDateRange: defaultDateRange || 'THIS_MONTH',
        emailNotifications: emailNotifications !== undefined ? emailNotifications : true,
        pushNotifications: pushNotifications !== undefined ? pushNotifications : true,
        smsNotifications: smsNotifications !== undefined ? smsNotifications : false,
        sidebarCollapsed: sidebarCollapsed !== undefined ? sidebarCollapsed : false,
        dashboardLayout,
      },
    });
    
    return NextResponse.json(preference);
  } catch (error) {
    console.error('Error updating user preferences:', error);
    return NextResponse.json(
      { error: 'Failed to update user preferences' },
      { status: 500 }
    );
  }
}

// POST /api/user/preferences/reset - Reset preferences to defaults
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId } = body;
    
    const preference = await prisma.userPreference.upsert({
      where: { userId },
      update: {
        language: 'en',
        currency: 'AED',
        timezone: 'Asia/Dubai',
        dateFormat: 'DD/MM/YYYY',
        defaultRegion: null,
        defaultOrg: null,
        defaultDateRange: 'THIS_MONTH',
        emailNotifications: true,
        pushNotifications: true,
        smsNotifications: false,
        sidebarCollapsed: false,
        dashboardLayout: null,
      },
      create: {
        userId,
        language: 'en',
        currency: 'AED',
        timezone: 'Asia/Dubai',
        dateFormat: 'DD/MM/YYYY',
        defaultDateRange: 'THIS_MONTH',
        emailNotifications: true,
        pushNotifications: true,
        smsNotifications: false,
        sidebarCollapsed: false,
      },
    });
    
    return NextResponse.json(preference);
  } catch (error) {
    console.error('Error resetting user preferences:', error);
    return NextResponse.json(
      { error: 'Failed to reset user preferences' },
      { status: 500 }
    );
  }
}

