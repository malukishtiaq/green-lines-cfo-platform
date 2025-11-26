import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET single partner
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const partner = await prisma.partner.findUnique({
      where: { id },
      include: {
        assignments: {
          include: {
            servicePlan: {
              select: {
                id: true,
                name: true,
                type: true,
                status: true,
              }
            }
          }
        },
      },
    });

    if (!partner) {
      return NextResponse.json({ error: 'Partner not found' }, { status: 404 });
    }

    return NextResponse.json(partner);
  } catch (error) {
    console.error('Error fetching partner:', error);
    return NextResponse.json({ error: 'Failed to fetch partner' }, { status: 500 });
  }
}

// PUT update partner
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const data = await request.json();

    // Check if partner exists
    const existingPartner = await prisma.partner.findUnique({
      where: { id },
    });

    if (!existingPartner) {
      return NextResponse.json({ error: 'Partner not found' }, { status: 404 });
    }

    // If email is being changed, check for duplicates
    if (data.email && data.email !== existingPartner.email) {
      const emailExists = await prisma.partner.findFirst({
        where: { email: data.email },
      });

      if (emailExists) {
        return NextResponse.json(
          { error: 'Partner with this email already exists' },
          { status: 400 }
        );
      }
    }

    const partner = await prisma.partner.update({
      where: { id },
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
        rating: data.rating ? parseFloat(data.rating) : null,
        activeEngagements: data.activeEngagements || 0,
        availability: data.availability,
        remoteOk: data.remoteOk,
        notes: data.notes || null,
      },
    });

    return NextResponse.json(partner);
  } catch (error) {
    console.error('Error updating partner:', error);
    return NextResponse.json({ error: 'Failed to update partner' }, { status: 500 });
  }
}

// DELETE partner
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    // Check if partner has active assignments
    const partner = await prisma.partner.findUnique({
      where: { id },
      include: {
        assignments: {
          where: { status: { in: ['ASSIGNED', 'IN_PROGRESS'] } },
        },
      },
    });

    if (!partner) {
      return NextResponse.json({ error: 'Partner not found' }, { status: 404 });
    }

    if (partner.assignments.length > 0) {
      return NextResponse.json(
        { error: 'Cannot delete partner with active assignments' },
        { status: 400 }
      );
    }

    await prisma.partner.delete({
      where: { id },
    });

    return NextResponse.json({ message: 'Partner deleted successfully' });
  } catch (error) {
    console.error('Error deleting partner:', error);
    return NextResponse.json({ error: 'Failed to delete partner' }, { status: 500 });
  }
}
