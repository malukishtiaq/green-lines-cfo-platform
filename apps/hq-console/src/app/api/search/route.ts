import { NextResponse } from 'next/server';
import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/search - Global search across entities
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    
    const query = searchParams.get('q') || '';
    const category = searchParams.get('category') || 'ALL'; // ALL | CUSTOMERS | PLANS | TASKS | PARTNERS
    const userId = searchParams.get('userId') || 'default-user-id';
    const limit = parseInt(searchParams.get('limit') || '50');
    
    if (!query || query.length < 2) {
      return NextResponse.json({
        results: [],
        totalCount: 0,
      });
    }
    
    const searchTerm = `%${query}%`;
    let results: any[] = [];
    
    // Search Customers
    if (category === 'ALL' || category === 'CUSTOMERS') {
      const customers = await prisma.customer.findMany({
        where: {
          OR: [
            { name: { contains: query, mode: 'insensitive' } },
            { email: { contains: query, mode: 'insensitive' } },
            { company: { contains: query, mode: 'insensitive' } },
            { industry: { contains: query, mode: 'insensitive' } },
          ],
        },
        take: Math.ceil(limit / 4),
        select: {
          id: true,
          name: true,
          email: true,
          company: true,
          industry: true,
          country: true,
        },
      });
      
      results.push(
        ...customers.map((c) => ({
          id: c.id,
          type: 'CUSTOMER',
          title: c.name,
          subtitle: c.company || c.email,
          description: `${c.industry || 'No industry'} • ${c.country}`,
          link: `/customers/${c.id}`,
        }))
      );
    }
    
    // Search Plans
    if (category === 'ALL' || category === 'PLANS') {
      const plans = await prisma.servicePlan.findMany({
        where: {
          OR: [
            { name: { contains: query, mode: 'insensitive' } },
            { description: { contains: query, mode: 'insensitive' } },
          ],
        },
        take: Math.ceil(limit / 4),
        include: {
          customer: {
            select: {
              name: true,
              company: true,
            },
          },
        },
      });
      
      results.push(
        ...plans.map((p) => ({
          id: p.id,
          type: 'PLAN',
          title: p.name,
          subtitle: p.customer.company || p.customer.name,
          description: `${p.type} • ${p.status}`,
          link: `/plans/${p.id}`,
        }))
      );
    }
    
    // Search Tasks
    if (category === 'ALL' || category === 'TASKS') {
      const tasks = await prisma.task.findMany({
        where: {
          OR: [
            { title: { contains: query, mode: 'insensitive' } },
            { description: { contains: query, mode: 'insensitive' } },
          ],
        },
        take: Math.ceil(limit / 4),
        include: {
          customer: {
            select: {
              name: true,
              company: true,
            },
          },
        },
      });
      
      results.push(
        ...tasks.map((t) => ({
          id: t.id,
          type: 'TASK',
          title: t.title,
          subtitle: t.customer.company || t.customer.name,
          description: `${t.type} • ${t.status} • ${t.priority}`,
          link: `/tasks/${t.id}`,
        }))
      );
    }
    
    // Search Partners
    if (category === 'ALL' || category === 'PARTNERS') {
      const partners = await prisma.partner.findMany({
        where: {
          OR: [
            { name: { contains: query, mode: 'insensitive' } },
            { email: { contains: query, mode: 'insensitive' } },
            { domain: { contains: query, mode: 'insensitive' } },
          ],
        },
        take: Math.ceil(limit / 4),
      });
      
      results.push(
        ...partners.map((p) => ({
          id: p.id,
          type: 'PARTNER',
          title: p.name,
          subtitle: p.domain,
          description: `${p.role} • ${p.country} • ${p.city || 'No city'}`,
          link: `/partners/${p.id}`,
        }))
      );
    }
    
    // Sort results by relevance (exact matches first)
    results.sort((a, b) => {
      const aExact = a.title.toLowerCase() === query.toLowerCase();
      const bExact = b.title.toLowerCase() === query.toLowerCase();
      if (aExact && !bExact) return -1;
      if (!aExact && bExact) return 1;
      return 0;
    });
    
    // Limit results
    results = results.slice(0, limit);
    
    // Log search
    await prisma.searchLog.create({
      data: {
        userId,
        query,
        category,
        resultsCount: results.length,
      },
    });
    
    return NextResponse.json({
      results,
      totalCount: results.length,
      query,
      category,
    });
  } catch (error) {
    console.error('Error performing search:', error);
    return NextResponse.json(
      { error: 'Failed to perform search' },
      { status: 500 }
    );
  }
}

