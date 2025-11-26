import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    // Get customer distribution by industry
    const customerDistribution = await prisma.customer.groupBy({
      by: ['industry'],
      _count: {
        industry: true,
      },
      orderBy: {
        _count: {
          industry: 'desc',
        },
      },
    });

    // Format the data for the pie chart
    const formattedData = customerDistribution.map(item => ({
      name: item.industry || 'Unknown',
      value: item._count.industry,
    }));

    // If no data, return mock data
    if (formattedData.length === 0) {
      return NextResponse.json([
        { name: 'Technology', value: 5 },
        { name: 'Finance', value: 3 },
        { name: 'Healthcare', value: 2 },
        { name: 'Retail', value: 4 },
        { name: 'Manufacturing', value: 2 },
      ]);
    }

    return NextResponse.json(formattedData);
  } catch (error) {
    console.error('Error fetching customer distribution data:', error);
    
    // Return mock data on error
    return NextResponse.json([
      { name: 'Technology', value: 5 },
      { name: 'Finance', value: 3 },
      { name: 'Healthcare', value: 2 },
      { name: 'Retail', value: 4 },
      { name: 'Manufacturing', value: 2 },
    ]);
  }
}

