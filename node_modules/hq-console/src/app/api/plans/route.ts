import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET all service plans
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search');
    const customerId = searchParams.get('customerId');
    const type = searchParams.get('type');
    const status = searchParams.get('status');

    const where: any = {};

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (customerId) {
      where.customerId = customerId;
    }

    if (type) {
      where.type = type;
    }

    if (status) {
      where.status = status;
    }

    const plans = await prisma.servicePlan.findMany({
      where,
      include: {
        customer: {
          select: {
            id: true,
            name: true,
            email: true,
            country: true,
          },
        },
        _count: {
          select: {
            tasks: true,
            assignments: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(plans);
  } catch (error) {
    console.error('Error fetching service plans:', error);
    return NextResponse.json({ error: 'Failed to fetch service plans' }, { status: 500 });
  }
}

// POST create new service plan
export async function POST(request: Request) {
  try {
    const data = await request.json();

    // Validate required fields
    if (!data.name || !data.customerId || !data.type) {
      return NextResponse.json(
        { error: 'Name, customer, and type are required' },
        { status: 400 }
      );
    }

    // Check if customer exists
    const customer = await prisma.customer.findUnique({
      where: { id: data.customerId },
    });

    if (!customer) {
      return NextResponse.json(
        { error: 'Customer not found' },
        { status: 404 }
      );
    }

    const plan = await prisma.servicePlan.create({
      data: {
        name: data.name,
        description: data.description || null,
        type: data.type,
        status: data.status || 'ACTIVE',
        price: data.price ? parseFloat(data.price) : null,
        currency: data.currency || 'AED',
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

    return NextResponse.json(plan, { status: 201 });
  } catch (error) {
    console.error('Error creating service plan:', error);
    return NextResponse.json({ error: 'Failed to create service plan' }, { status: 500 });
  }
}
