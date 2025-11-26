import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    // Get task counts by status
    const tasksByStatus = await prisma.task.groupBy({
      by: ['status'],
      _count: {
        status: true,
      },
    });

    // Calculate total tasks for percentage
    const totalTasks = tasksByStatus.reduce((sum, item) => sum + item._count.status, 0);

    // Format the data for the bar chart
    const formattedData = tasksByStatus.map(item => ({
      status: item.status,
      count: item._count.status,
      percentage: totalTasks > 0 ? Math.round((item._count.status / totalTasks) * 100) : 0,
    }));

    // Ensure all status types are represented (even with 0 count)
    const allStatuses = ['PENDING', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'];
    const completeData = allStatuses.map(status => {
      const existing = formattedData.find(item => item.status === status);
      return existing || { status, count: 0, percentage: 0 };
    });

    return NextResponse.json(completeData);
  } catch (error) {
    console.error('Error fetching task completion data:', error);
    
    // Return mock data on error
    return NextResponse.json([
      { status: 'PENDING', count: 5, percentage: 33 },
      { status: 'IN_PROGRESS', count: 4, percentage: 27 },
      { status: 'COMPLETED', count: 6, percentage: 40 },
      { status: 'CANCELLED', count: 0, percentage: 0 },
    ]);
  }
}

