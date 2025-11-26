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
    
    console.log('📊 Fetching plans trend data...');
    
    // Map regions to countries
    const regionToCountries: { [key: string]: string[] } = {
      'GCC': ['UAE', 'Saudi Arabia', 'Kuwait', 'Qatar', 'Bahrain', 'Oman'],
      'MENA': ['Egypt', 'Jordan', 'Lebanon', 'Morocco', 'Tunisia', 'Algeria', 'Iraq', 'Yemen'],
      'APAC': ['India', 'Pakistan', 'Bangladesh', 'Philippines', 'Singapore', 'Malaysia', 'Indonesia', 'Thailand', 'Vietnam', 'China', 'Japan', 'South Korea', 'Australia'],
      'EU': ['United Kingdom', 'Germany', 'France', 'Italy', 'Spain', 'Netherlands', 'Poland', 'Belgium', 'Sweden', 'Austria']
    };
    
    // Get all plans from the last 12 months
    const twelveMonthsAgo = new Date();
    twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 12);
    
    const plans = await prisma.servicePlan.findMany({
      where: {
        createdAt: {
          gte: twelveMonthsAgo
        }
      },
      include: {
        customer: true
      },
      orderBy: {
        createdAt: 'asc'
      }
    });
    
    console.log(`📈 Found ${plans.length} plans in the last 12 months`);
    
    // Group plans by period (month or quarter)
    const periodMap = new Map<string, { period: string; initiated: number; closed: number; conversionRate: number }>();
    
    plans.forEach(plan => {
      const date = new Date(plan.createdAt);
      let periodKey: string;
      
      if (period === 'quarterly') {
        const quarter = Math.floor(date.getMonth() / 3) + 1;
        const year = date.getFullYear();
        periodKey = `${year}-Q${quarter}`;
      } else {
        // Monthly
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        periodKey = `${year}-${month}`;
      }
      
      // Initialize period if not exists
      if (!periodMap.has(periodKey)) {
        periodMap.set(periodKey, {
          period: periodKey,
          initiated: 0,
          closed: 0,
          conversionRate: 0
        });
      }
      
      const periodData = periodMap.get(periodKey)!;
      periodData.initiated++;
      
      if (plan.status === 'COMPLETED') {
        periodData.closed++;
      }
      
      // Calculate conversion rate
      periodData.conversionRate = periodData.initiated > 0 
        ? Math.round((periodData.closed / periodData.initiated) * 100) 
        : 0;
    });
    
    const formattedData = Array.from(periodMap.values()).sort((a, b) => 
      a.period.localeCompare(b.period)
    );
    
    console.log(`✅ Returning ${formattedData.length} data points for chart`);
    console.log('Chart data:', formattedData);
    
    return NextResponse.json(formattedData);
  } catch (error) {
    console.error('❌ Error fetching plans trend:', error);
    
    // Return empty array on error
    return NextResponse.json([]);
  }
}

