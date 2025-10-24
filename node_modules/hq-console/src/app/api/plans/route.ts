import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/infrastructure/database';

// GET /api/plans - Get all plans
export async function GET(request: NextRequest) {
  try {
    
    // Get query parameters
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const industry = searchParams.get('industry');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search');

    // Build where clause
    const where: any = {};
    
    if (status && status !== 'all') {
      where.status = status;
    }
    
    if (industry && industry !== 'all') {
      where.industry = industry;
    }
    
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { customer: { contains: search, mode: 'insensitive' } },
      ];
    }

    // Get plans with pagination
    const [plans, total] = await Promise.all([
      prisma.plan.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
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
      }),
      prisma.plan.count({ where }),
    ]);

    return NextResponse.json({
      success: true,
      data: plans,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching plans:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch plans' },
      { status: 500 }
    );
  }
}

// POST /api/plans - Create new plan
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    console.log('Received plan data:', body);

    // Validate required fields
    const requiredFields = ['name', 'industry', 'companySize'];
    for (const field of requiredFields) {
      if (!body[field]) {
        console.log(`Missing required field: ${field}, value:`, body[field]);
        return NextResponse.json(
          { success: false, error: `Missing required field: ${field}` },
          { status: 400 }
        );
      }
    }

    // Use demo customer if no customerId provided
    let customerId = body.customerId;
    if (!customerId) {
      // Get the first customer from the database as a demo
      const firstCustomer = await prisma.customer.findFirst();
      if (!firstCustomer) {
        console.log('No customers found in database');
        return NextResponse.json(
          { success: false, error: 'No customers found. Please create a customer first.' },
          { status: 400 }
        );
      }
      customerId = firstCustomer.id;
      console.log('Using customer:', customerId);
    }

    // Create plan with milestones
    console.log('Creating plan with data:', {
      name: body.name,
      customerId: customerId,
      industry: body.industry,
      companySize: body.companySize,
      milestones: body.milestones?.length || 0,
    });
    
    const plan = await prisma.plan.create({
      data: {
        name: body.name,
        description: body.description,
        customerId: customerId,
        industry: body.industry,
        companySize: body.companySize,
        durationType: body.durationType || 'WEEKS',
        durationWeeks: body.durationWeeks,
        startDate: body.startDate ? new Date(body.startDate) : null,
        workingDays: body.workingDays || 5,
        address: body.address,
        siteType: body.siteType,
        accessRequirements: body.accessRequirements,
        status: body.status ? body.status.toUpperCase() : 'DRAFT',
        currentStage: body.currentStage || 1,
        totalBudget: body.totalBudget || 0,
        currency: body.currency || 'SAR',
        notes: body.notes,
        // Create milestones if provided
        milestones: body.milestones ? {
          create: body.milestones.map((milestone: any) => ({
            sequence: milestone.sequence || 1,
            name: milestone.name,
            description: milestone.description,
            durationWeeks: milestone.durationWeeks || 1,
            budgetAllocation: parseFloat(milestone.budgetPercent || milestone.budgetAllocation || 0),
            deliverables: milestone.deliverables,
            dependencies: Array.isArray(milestone.dependencies) ? milestone.dependencies.join(',') : milestone.dependencies,
            isCriticalPath: milestone.criticalPath || milestone.isCriticalPath || false,
          }))
        } : undefined,
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
      data: plan,
    }, { status: 201 });
  } catch (error) {
    console.error('❌ Error creating plan:', error);
    console.error('Error details:', JSON.stringify(error, Object.getOwnPropertyNames(error)));
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to create plan',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
