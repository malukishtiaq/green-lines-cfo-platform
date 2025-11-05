import { NextResponse } from 'next/server';
import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    
    // Get filter parameters
    const selectedRegion = searchParams.get('region');
    const industry = searchParams.get('industry');
    const partnerTier = searchParams.get('partnerTier');
    const dateCreated = searchParams.get('dateCreated');
    
    // Build where clause
    const whereClause: any = {};
    if (industry) {
      whereClause.industry = industry;
    }
    if (dateCreated) {
      whereClause.createdAt = { gte: new Date(dateCreated) };
    }
    
    // Get clients grouped by region/country
    const clientsByRegion = await prisma.customer.groupBy({
      by: ['country'],
      _count: { id: true },
      where: whereClause
    });
    
    // Map countries to regions (GCC, MENA, APAC, EU)
    const regionMapping: { [key: string]: string } = {
      // GCC Countries
      'UAE': 'GCC',
      'Saudi Arabia': 'GCC',
      'Kuwait': 'GCC',
      'Qatar': 'GCC',
      'Bahrain': 'GCC',
      'Oman': 'GCC',
      
      // MENA (Middle East & North Africa)
      'Egypt': 'MENA',
      'Jordan': 'MENA',
      'Lebanon': 'MENA',
      'Morocco': 'MENA',
      'Tunisia': 'MENA',
      'Algeria': 'MENA',
      'Iraq': 'MENA',
      'Yemen': 'MENA',
      
      // APAC (Asia Pacific)
      'India': 'APAC',
      'Pakistan': 'APAC',
      'Bangladesh': 'APAC',
      'Philippines': 'APAC',
      'Singapore': 'APAC',
      'Malaysia': 'APAC',
      'Indonesia': 'APAC',
      'Thailand': 'APAC',
      'Vietnam': 'APAC',
      'China': 'APAC',
      'Japan': 'APAC',
      'South Korea': 'APAC',
      'Australia': 'APAC',
      
      // EU (Europe)
      'United Kingdom': 'EU',
      'Germany': 'EU',
      'France': 'EU',
      'Italy': 'EU',
      'Spain': 'EU',
      'Netherlands': 'EU',
      'Poland': 'EU',
      'Belgium': 'EU',
      'Sweden': 'EU',
      'Austria': 'EU',
    };
    
    // Aggregate by region
    const regionData = new Map<string, { region: string; count: number; countries: { country: string; count: number }[] }>();
    
    clientsByRegion.forEach(item => {
      const region = regionMapping[item.country] || 'Other';
      const existing = regionData.get(region);
      
      if (existing) {
        existing.count += item._count.id;
        existing.countries.push({
          country: item.country,
          count: item._count.id
        });
      } else {
        regionData.set(region, {
          region,
          count: item._count.id,
          countries: [{
            country: item.country,
            count: item._count.id
          }]
        });
      }
    });
    
    let formattedData = Array.from(regionData.values()).sort((a, b) => b.count - a.count);
    
    // Filter by selected region if provided
    if (selectedRegion) {
      formattedData = formattedData.filter(item => item.region === selectedRegion);
    }
    
    // If no data, return empty array (user needs to seed database)
    if (formattedData.length === 0) {
      return NextResponse.json([]);
    }
    
    return NextResponse.json(formattedData);
  } catch (error) {
    console.error('Error fetching clients by region:', error);
    return NextResponse.json({ error: 'Failed to fetch data' }, { status: 500 });
  }
}

// Generate mock data for demonstration
function generateMockRegionData() {
  return [
    {
      region: 'GCC',
      count: 45,
      countries: [
        { country: 'UAE', count: 28 },
        { country: 'Saudi Arabia', count: 12 },
        { country: 'Kuwait', count: 3 },
        { country: 'Qatar', count: 2 }
      ]
    },
    {
      region: 'MENA',
      count: 32,
      countries: [
        { country: 'Egypt', count: 18 },
        { country: 'Jordan', count: 8 },
        { country: 'Lebanon', count: 4 },
        { country: 'Morocco', count: 2 }
      ]
    },
    {
      region: 'APAC',
      count: 28,
      countries: [
        { country: 'India', count: 12 },
        { country: 'Pakistan', count: 7 },
        { country: 'Singapore', count: 5 },
        { country: 'Malaysia', count: 4 }
      ]
    },
    {
      region: 'EU',
      count: 15,
      countries: [
        { country: 'United Kingdom', count: 6 },
        { country: 'Germany', count: 5 },
        { country: 'France', count: 3 },
        { country: 'Netherlands', count: 1 }
      ]
    }
  ];
}

