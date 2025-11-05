import { NextResponse } from 'next/server';
import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const period = searchParams.get('period') || 'monthly'; // monthly or quarterly
    const selectedRegion = searchParams.get('region');
    const industry = searchParams.get('industry');
    const planType = searchParams.get('planType');
    const status = searchParams.get('status');
    
    // Map regions to countries
    const regionToCountries: { [key: string]: string[] } = {
      'GCC': ['UAE', 'Saudi Arabia', 'Kuwait', 'Qatar', 'Bahrain', 'Oman'],
      'MENA': ['Egypt', 'Jordan', 'Lebanon', 'Morocco', 'Tunisia', 'Algeria', 'Iraq', 'Yemen'],
      'APAC': ['India', 'Pakistan', 'Bangladesh', 'Philippines', 'Singapore', 'Malaysia', 'Indonesia', 'Thailand', 'Vietnam', 'China', 'Japan', 'South Korea', 'Australia'],
      'EU': ['United Kingdom', 'Germany', 'France', 'Italy', 'Spain', 'Netherlands', 'Poland', 'Belgium', 'Sweden', 'Austria']
    };
    
    // Build where clause for filters
    const whereClause: any = {
      createdAt: { gte: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000) } // Last 12 months
    };
    
    if (planType) {
      whereClause.type = planType;
    }
    
    if (selectedRegion && regionToCountries[selectedRegion]) {
      whereClause.customer = {
        country: { in: regionToCountries[selectedRegion] }
      };
      if (industry) {
        whereClause.customer.industry = industry;
      }
    } else if (industry) {
      whereClause.customer = {
        industry
      };
    }
    
    // Get plans initiated and closed over time
    // Group by month or quarter
    const dateField = period === 'quarterly' ? 
      `DATE_TRUNC('quarter', "createdAt")` : 
      `DATE_TRUNC('month', "createdAt")`;
    
    const plansInitiated = await prisma.$queryRaw<Array<{ period: Date; count: number }>>`
      SELECT 
        ${dateField} as period,
        COUNT(*) as count
      FROM "service_plans"
      WHERE "createdAt" >= NOW() - INTERVAL '12 months'
      GROUP BY ${dateField}
      ORDER BY period ASC
    `;
    
    const plansClosed = await prisma.$queryRaw<Array<{ period: Date; count: number }>>`
      SELECT 
        ${dateField} as period,
        COUNT(*) as count
      FROM "service_plans"
      WHERE "createdAt" >= NOW() - INTERVAL '12 months'
        AND status = 'COMPLETED'
      GROUP BY ${dateField}
      ORDER BY period ASC
    `;
    
    // Merge the data
    const periodMap = new Map<string, { period: string; initiated: number; closed: number; conversionRate: number }>();
    
    plansInitiated.forEach(item => {
      const key = item.period.toISOString();
      periodMap.set(key, {
        period: key,
        initiated: Number(item.count),
        closed: 0,
        conversionRate: 0
      });
    });
    
    plansClosed.forEach(item => {
      const key = item.period.toISOString();
      const existing = periodMap.get(key);
      if (existing) {
        existing.closed = Number(item.count);
        existing.conversionRate = existing.initiated > 0 
          ? Math.round((existing.closed / existing.initiated) * 100) 
          : 0;
      }
    });
    
    const formattedData = Array.from(periodMap.values());
    
    // Return empty array if no data
    return NextResponse.json(formattedData);
  } catch (error) {
    console.error('Error fetching plans trend:', error);
    
    // Return empty array on error
    return NextResponse.json([]);
  }
}

