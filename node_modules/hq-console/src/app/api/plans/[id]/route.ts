import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET single service plan
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const plan = await prisma.servicePlan.findUnique({
      where: { id },
      include: {
        customer: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            country: true,
            company: true,
          },
        },
        tasks: {
          select: {
            id: true,
            title: true,
            type: true,
            status: true,
            priority: true,
            dueDate: true,
          },
        },
        assignments: {
          include: {
            partner: {
              select: {
                id: true,
                name: true,
                email: true,
                role: true,
                domain: true,
              },
            },
          },
        },
        kpis: true,
      },
    });

    if (!plan) {
      return NextResponse.json({ error: 'Service plan not found' }, { status: 404 });
    }

    return NextResponse.json(plan);
  } catch (error) {
    console.error('Error fetching service plan:', error);
    return NextResponse.json({ error: 'Failed to fetch service plan' }, { status: 500 });
  }
}

// PUT update service plan
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const data = await request.json();

    // Check if plan exists
    const existingPlan = await prisma.servicePlan.findUnique({
      where: { id },
    });

    if (!existingPlan) {
      return NextResponse.json({ error: 'Service plan not found' }, { status: 404 });
    }

    // If customer is being changed, check if new customer exists
    if (data.customerId && data.customerId !== existingPlan.customerId) {
      const customer = await prisma.customer.findUnique({
        where: { id: data.customerId },
      });

      if (!customer) {
        return NextResponse.json(
          { error: 'Customer not found' },
          { status: 404 }
        );
      }
    }

    const plan = await prisma.servicePlan.update({
      where: { id },
      data: {
        name: data.name,
        description: data.description || null,
        type: data.type,
        status: data.status,
        price: data.price ? parseFloat(data.price) : null,
        currency: data.currency,
        duration: data.duration ? parseInt(data.duration) : null,
        features: data.features || null,
        erpConnection: data.erpConnection || null,
        dataDomains: data.dataDomains || [],
        governancePolicy: data.governancePolicy || null,
        customerId: data.customerId,
      },
      include: {
        customer: {
          select: {
            id: true,
            name: true,
            email: true,
            country: true,
          },
        },
      },
    });

    return NextResponse.json(plan);
  } catch (error) {
    console.error('Error updating service plan:', error);
    return NextResponse.json({ error: 'Failed to update service plan' }, { status: 500 });
  }
}

// DELETE service plan
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    // Check if plan has active tasks or assignments
    const plan = await prisma.servicePlan.findUnique({
      where: { id },
      include: {
        tasks: {
          where: { status: { in: ['PENDING', 'IN_PROGRESS'] } },
        },
        assignments: {
          where: { status: { in: ['ASSIGNED', 'IN_PROGRESS'] } },
        },
      },
    });

    if (!plan) {
      return NextResponse.json({ error: 'Service plan not found' }, { status: 404 });
    }

    if (plan.tasks.length > 0) {
      return NextResponse.json(
        { error: 'Cannot delete plan with active tasks' },
        { status: 400 }
      );
    }

    if (plan.assignments.length > 0) {
      return NextResponse.json(
        { error: 'Cannot delete plan with active assignments' },
        { status: 400 }
      );
    }

    await prisma.servicePlan.delete({
      where: { id },
    });

    return NextResponse.json({ message: 'Service plan deleted successfully' });
  } catch (error) {
    console.error('Error deleting service plan:', error);
    return NextResponse.json({ error: 'Failed to delete service plan' }, { status: 500 });
  }
}
