import { NextRequest, NextResponse } from 'next/server';
import { PrismaService } from '@/infrastructure/repositories';

// GET /api/plans/[id] - Get specific plan
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const prisma = PrismaService.getInstance();
    const planId = params.id;

    const plan = await prisma.plan.findUnique({
      where: { id: planId },
      include: {
        customer: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            address: true,
          },
        },
        milestones: {
          orderBy: { sequence: 'asc' },
        },
        resources: true,
        attachments: true,
      },
    });

    if (!plan) {
      return NextResponse.json(
        { success: false, error: 'Plan not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: plan,
    });
  } catch (error) {
    console.error('Error fetching plan:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch plan' },
      { status: 500 }
    );
  }
}

// PUT /api/plans/[id] - Update plan
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const prisma = PrismaService.getInstance();
    const planId = params.id;
    const body = await request.json();

    // Check if plan exists
    const existingPlan = await prisma.plan.findUnique({
      where: { id: planId },
    });

    if (!existingPlan) {
      return NextResponse.json(
        { success: false, error: 'Plan not found' },
        { status: 404 }
      );
    }

    // Update plan
    const updatedPlan = await prisma.plan.update({
      where: { id: planId },
      data: {
        name: body.name,
        description: body.description,
        industry: body.industry,
        companySize: body.companySize,
        durationType: body.durationType,
        durationWeeks: body.durationWeeks,
        startDate: body.startDate ? new Date(body.startDate) : null,
        workingDays: body.workingDays,
        address: body.address,
        siteType: body.siteType,
        accessRequirements: body.accessRequirements,
        status: body.status,
        currentStage: body.currentStage,
        totalBudget: body.totalBudget,
        currency: body.currency,
        notes: body.notes,
        updatedAt: new Date(),
      },
      include: {
        customer: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        milestones: {
          orderBy: { sequence: 'asc' },
        },
      },
    });

    return NextResponse.json({
      success: true,
      data: updatedPlan,
    });
  } catch (error) {
    console.error('Error updating plan:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update plan' },
      { status: 500 }
    );
  }
}

// DELETE /api/plans/[id] - Delete plan
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const prisma = PrismaService.getInstance();
    const planId = params.id;

    // Check if plan exists
    const existingPlan = await prisma.plan.findUnique({
      where: { id: planId },
    });

    if (!existingPlan) {
      return NextResponse.json(
        { success: false, error: 'Plan not found' },
        { status: 404 }
      );
    }

    // Delete plan (this will cascade delete related records)
    await prisma.plan.delete({
      where: { id: planId },
    });

    return NextResponse.json({
      success: true,
      message: 'Plan deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting plan:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete plan' },
      { status: 500 }
    );
  }
}
