import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const [
      totalCustomers,
      activeContracts,
      totalTasks,
      pendingTasks,
      completedTasks,
      revenueAgg,
    ] = await Promise.all([
      prisma.customer.count(),
      prisma.servicePlan.count(),
      prisma.task.count(),
      prisma.task.count({ where: { status: 'PENDING' } }),
      prisma.task.count({ where: { status: 'COMPLETED' } }),
      prisma.servicePlan.aggregate({
        _sum: { price: true },
      }),
    ]);

    const taskCompletionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
    const revenue = (revenueAgg._sum.price as unknown as number) || 0;

    return NextResponse.json({
      totalCustomers,
      activeContracts,
      pendingTasks,
      completedTasks,
      taskCompletionRate,
      revenue,
    });
  } catch (error) {
    console.error('Error fetching dashboard metrics:', error);
    return NextResponse.json({ error: 'Failed to fetch metrics' }, { status: 500 });
  }
}


