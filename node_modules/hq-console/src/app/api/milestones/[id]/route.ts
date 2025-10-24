import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/infrastructure/database';

// DELETE /api/milestones/[id] - Delete specific milestone
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: milestoneId } = await params;

    // Check if milestone exists
    const existingMilestone = await prisma.milestone.findUnique({
      where: { id: milestoneId },
    });

    if (!existingMilestone) {
      return NextResponse.json(
        { success: false, error: 'Milestone not found' },
        { status: 404 }
      );
    }

    // Delete milestone
    await prisma.milestone.delete({
      where: { id: milestoneId },
    });

    return NextResponse.json({
      success: true,
      message: 'Milestone deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting milestone:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete milestone' },
      { status: 500 }
    );
  }
}
