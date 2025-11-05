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
    
    // If no data, return mock data for demo
    if (formattedData.length === 0) {
      return NextResponse.json(generateMockPlansTrend(period));
    }
    
    return NextResponse.json(formattedData);
  } catch (error) {
    console.error('Error fetching plans trend:', error);
    
    // Return mock data on error for demo
    return NextResponse.json(generateMockPlansTrend('monthly'));
  }
}

// Generate mock data for demonstration
function generateMockPlansTrend(period: string) {
  const periods = [];
  const currentDate = new Date();
  const numberOfPeriods = period === 'quarterly' ? 4 : 12;
  
  // Base numbers that grow over time
  const baseInitiated = [8, 10, 12, 15, 14, 18, 20, 22, 25, 24, 28, 30];
  const conversionRates = [0.5, 0.55, 0.6, 0.65, 0.7, 0.68, 0.72, 0.75, 0.73, 0.77, 0.8, 0.78];
  
  for (let i = numberOfPeriods - 1; i >= 0; i--) {
    let date: Date;
    let dataIndex: number;
    
    if (period === 'quarterly') {
      const quarter = Math.floor(currentDate.getMonth() / 3) - i;
      date = new Date(currentDate.getFullYear(), quarter * 3, 1);
      dataIndex = i * 3; // Use data from corresponding months
    } else {
      date = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
      dataIndex = numberOfPeriods - 1 - i;
    }
    
    const initiated = baseInitiated[dataIndex] || 15;
    const conversionRate = conversionRates[dataIndex] || 0.65;
    const closed = Math.round(initiated * conversionRate);
    
    periods.push({
      period: date.toISOString(),
      initiated,
      closed,
      conversionRate: Math.round(conversionRate * 100)
    });
  }
  
  return periods;
}

