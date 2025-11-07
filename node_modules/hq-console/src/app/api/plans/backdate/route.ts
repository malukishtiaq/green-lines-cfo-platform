import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

/**
 * Utility API to backdate plans for testing the dashboard trend chart
 * This helps demonstrate the trend visualization with multiple data points
 */
export async function POST() {
  try {
    // Get all plans
    const plans = await prisma.servicePlan.findMany({
      orderBy: { createdAt: 'asc' }
    });

    if (plans.length === 0) {
      return NextResponse.json({ message: 'No plans found' }, { status: 404 });
    }

    // Backdate plans to create a trend
    // Plan 1: 3 months ago
    // Plan 2: 2 months ago  
    // Plan 3: 1 month ago (current)
    const updates = [];
    const now = new Date();

    for (let i = 0; i < Math.min(plans.length, 3); i++) {
      const plan = plans[i];
      const monthsAgo = plans.length - i; // 3, 2, 1
      const backdatedDate = new Date(now);
      backdatedDate.setMonth(backdatedDate.getMonth() - monthsAgo);

      updates.push(
        prisma.servicePlan.update({
          where: { id: plan.id },
          data: { createdAt: backdatedDate }
        })
      );
    }

    await Promise.all(updates);

    console.log(`✅ Successfully backdated ${updates.length} plans`);

    return NextResponse.json({ 
      message: `Successfully backdated ${updates.length} plans to create a trend`,
      updatedCount: updates.length 
    });
  } catch (error) {
    console.error('❌ Error backdating plans:', error);
    return NextResponse.json({ 
      error: 'Failed to backdate plans',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

