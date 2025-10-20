import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    // Get dashboard stats
    const totalCustomers = await prisma.customer.count();
    const totalContracts = await prisma.servicePlan.count();
    const totalTasks = await prisma.task.count();
    const pendingTasks = await prisma.task.count({
      where: { status: 'PENDING' }
    });
    const completedTasks = await prisma.task.count({
      where: { status: 'COMPLETED' }
    });

    const stats = {
      totalCustomers,
      activeContracts: totalContracts,
      pendingTasks,
      completedTasks,
      taskCompletionRate: totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0,
    };

    return NextResponse.json(stats);
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch dashboard stats' },
      { status: 500 }
    );
  }
}

