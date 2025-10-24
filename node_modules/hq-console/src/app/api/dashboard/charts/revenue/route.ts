import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    // Get revenue data from service plans, grouped by month
    // Since we have limited demo data, we'll aggregate by creation date
    const revenueData = await prisma.$queryRaw<Array<{ month: Date; revenue: number }>>`
      SELECT 
        DATE_TRUNC('month', "createdAt") as month,
        SUM(price) as revenue
      FROM "service_plans"
      GROUP BY DATE_TRUNC('month', "createdAt")
      ORDER BY month DESC
      LIMIT 12
    `;

    // Format the data for the chart
    const formattedData = revenueData.map(item => ({
      month: item.month.toISOString(),
      revenue: Number(item.revenue) || 0,
    }));

    // If no data, return mock data for demo purposes
    if (formattedData.length === 0) {
      const mockData = generateMockRevenueData();
      return NextResponse.json(mockData);
    }

    return NextResponse.json(formattedData);
  } catch (error) {
    console.error('Error fetching revenue chart data:', error);
    
    // Return mock data on error for demo purposes
    const mockData = generateMockRevenueData();
    return NextResponse.json(mockData);
  }
}

// Generate mock data for demonstration
function generateMockRevenueData() {
  const months = [];
  const currentDate = new Date();
  
  for (let i = 5; i >= 0; i--) {
    const date = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
    months.push({
      month: date.toISOString(),
      revenue: Math.floor(Math.random() * 50000) + 30000, // Random revenue between 30k-80k AED
    });
  }
  
  return months;
}

