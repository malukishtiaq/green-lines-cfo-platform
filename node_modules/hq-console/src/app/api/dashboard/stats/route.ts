import { NextResponse } from 'next/server';
import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    console.log('📊 Dashboard Stats API called');
    const searchParams = request.nextUrl.searchParams;
    
    // Get filter parameters
    const dateRangeParam = searchParams.get('dateRange') || 'ALL';
    const selectedRegion = searchParams.get('region');
    const industry = searchParams.get('industry');
    const partnerTier = searchParams.get('partnerTier');
    const planType = searchParams.get('planType');
    const status = searchParams.get('status');
    
    console.log('Filters:', { dateRangeParam, selectedRegion, industry });

    // Map regions to countries
    const regionToCountries: { [key: string]: string[] } = {
      'GCC': ['UAE', 'Saudi Arabia', 'Kuwait', 'Qatar', 'Bahrain', 'Oman'],
      'MENA': ['Egypt', 'Jordan', 'Lebanon', 'Morocco', 'Tunisia', 'Algeria', 'Iraq', 'Yemen'],
      'APAC': ['India', 'Pakistan', 'Bangladesh', 'Philippines', 'Singapore', 'Malaysia', 'Indonesia', 'Thailand', 'Vietnam', 'China', 'Japan', 'South Korea', 'Australia'],
      'EU': ['United Kingdom', 'Germany', 'France', 'Italy', 'Spain', 'Netherlands', 'Poland', 'Belgium', 'Sweden', 'Austria']
    };

    // Calculate date range
    let startDate: Date | undefined;
    const currentDate = new Date();
    
    switch (dateRangeParam) {
      case 'THIS_MONTH':
        startDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
        break;
      case 'QTD':
        const quarter = Math.floor(currentDate.getMonth() / 3);
        startDate = new Date(currentDate.getFullYear(), quarter * 3, 1);
        break;
      case 'YTD':
        startDate = new Date(currentDate.getFullYear(), 0, 1);
        break;
      case 'CUSTOM':
        const customStart = searchParams.get('startDate');
        if (customStart) {
          startDate = new Date(customStart);
        }
        break;
      default:
        startDate = undefined;
    }

    // Build where clause for customers
    const customerWhereClause: any = {};
    if (selectedRegion && regionToCountries[selectedRegion]) {
      customerWhereClause.country = { in: regionToCountries[selectedRegion] };
    }
    if (industry) {
      customerWhereClause.industry = industry;
    }

    // Build where clause for service plans
    const planWhereClause: any = {};
    if (startDate) {
      planWhereClause.createdAt = { gte: startDate };
    }
    if (Object.keys(customerWhereClause).length > 0) {
      planWhereClause.customer = customerWhereClause;
    }
    if (planType) {
      planWhereClause.type = planType;
    }
    if (status) {
      planWhereClause.status = status;
    }

    // Get dashboard stats according to spec
    console.log('Executing Prisma queries...');
    const [
      totalPlansInitiated,
      totalOpenPlans,
      totalClosedPlans,
      totalPartners,
      plansByRegion,
      plansByStatus
    ] = await Promise.all([
      // Total Plans Initiated
      prisma.servicePlan.count({
        where: planWhereClause
      }),
      // Total Open Plans (status = ACTIVE or IN_PROGRESS)
      prisma.servicePlan.count({
        where: {
          ...planWhereClause,
          status: { in: ['ACTIVE'] }
        }
      }),
      // Total Closed Plans (status = COMPLETED)
      prisma.servicePlan.count({
        where: {
          ...planWhereClause,
          status: 'COMPLETED'
        }
      }),
      // Total Partners (active partners)
      prisma.partner.count({
        where: {
          availability: { not: 'UNAVAILABLE' }
        }
      }),
      // Plans by Region for chart
      prisma.customer.groupBy({
        by: ['country'],
        _count: { id: true },
        where: customerWhereClause
      }),
      // Plans by Status for trends
      prisma.servicePlan.groupBy({
        by: ['status'],
        _count: { id: true },
        where: planWhereClause
      })
    ]);

    console.log('Prisma queries completed successfully');

    // Calculate conversion rate (% closed / initiated)
    const conversionRate = totalPlansInitiated > 0 
      ? Math.round((totalClosedPlans / totalPlansInitiated) * 100) 
      : 0;

    const stats = {
      totalPlansInitiated,
      totalOpenPlans,
      totalClosedPlans,
      totalPartners,
      conversionRate,
      plansByRegion: plansByRegion.map(r => ({
        region: r.country,
        count: r._count.id
      })),
      plansByStatus: plansByStatus.map(s => ({
        status: s.status,
        count: s._count.id
      }))
    };

    console.log('📊 Returning stats:', stats);
    return NextResponse.json(stats);
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch dashboard stats' },
      { status: 500 }
    );
  }
}

