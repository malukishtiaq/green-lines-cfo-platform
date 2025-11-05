import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    // For now, return the admin user
    // TODO: Replace with actual session-based auth
    const adminUser = await prisma.user.findUnique({
      where: { email: 'admin@greenlines.com' },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
      },
    });

    if (!adminUser) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(adminUser);
  } catch (error) {
    console.error('Error fetching current user:', error);
    return NextResponse.json(
      { error: 'Failed to fetch current user' },
      { status: 500 }
    );
  }
}

