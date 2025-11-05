import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET all partners
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search');
    const region = searchParams.get('region');
    const domain = searchParams.get('domain');
    const role = searchParams.get('role');
    const availability = searchParams.get('availability');

    const where: any = {};

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { domain: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (domain) {
      where.domain = { contains: domain, mode: 'insensitive' };
    }

    if (role) {
      where.role = role;
    }

    if (availability) {
      where.availability = availability;
    }

    // Map region to countries
    if (region) {
      const regionToCountries: { [key: string]: string[] } = {
        'GCC': ['UAE', 'Saudi Arabia', 'Kuwait', 'Qatar', 'Bahrain', 'Oman'],
        'MENA': ['Egypt', 'Jordan', 'Lebanon', 'Morocco', 'Tunisia', 'Algeria', 'Iraq', 'Yemen'],
        'APAC': ['India', 'Pakistan', 'Bangladesh', 'Philippines', 'Singapore', 'Malaysia', 'Indonesia', 'Thailand', 'Vietnam', 'China', 'Japan', 'South Korea', 'Australia'],
        'EU': ['United Kingdom', 'Germany', 'France', 'Italy', 'Spain', 'Netherlands', 'Poland', 'Belgium', 'Sweden', 'Austria']
      };
      
      if (regionToCountries[region]) {
        where.country = { in: regionToCountries[region] };
      }
    }

    const partners = await prisma.partner.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        _count: {
          select: { assignments: true }
        }
      }
    });

    return NextResponse.json(partners);
  } catch (error) {
    console.error('Error fetching partners:', error);
    return NextResponse.json({ error: 'Failed to fetch partners' }, { status: 500 });
  }
}

// POST create new partner
export async function POST(request: Request) {
  try {
    const data = await request.json();

    // Validate required fields
    if (!data.name || !data.country || !data.domain || !data.role) {
      return NextResponse.json(
        { error: 'Name, country, domain, and role are required' },
        { status: 400 }
      );
    }

    // Check if email already exists (if provided)
    if (data.email) {
      const existingPartner = await prisma.partner.findFirst({
        where: { email: data.email },
      });

      if (existingPartner) {
        return NextResponse.json(
          { error: 'Partner with this email already exists' },
          { status: 400 }
        );
      }
    }

    const partner = await prisma.partner.create({
      data: {
        name: data.name,
        email: data.email || null,
        phone: data.phone || null,
        country: data.country,
        city: data.city || null,
        address: data.address || null,
        latitude: data.latitude ? parseFloat(data.latitude) : null,
        longitude: data.longitude ? parseFloat(data.longitude) : null,
        domain: data.domain,
        role: data.role,
        specialties: data.specialties || null,
        rating: data.rating ? parseFloat(data.rating) : 0,
        activeEngagements: data.activeEngagements || 0,
        availability: data.availability || 'AVAILABLE',
        remoteOk: data.remoteOk || false,
        notes: data.notes || null,
      },
    });

    return NextResponse.json(partner, { status: 201 });
  } catch (error) {
    console.error('Error creating partner:', error);
    return NextResponse.json({ error: 'Failed to create partner' }, { status: 500 });
  }
}
