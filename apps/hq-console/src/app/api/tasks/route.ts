import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const tasks = await prisma.task.findMany({
      take: 10,
      orderBy: {
        createdAt: 'desc'
      },
      include: {
        customer: true,
        assignments: {
          include: {
            user: true
          }
        }
      }
    });

    // Prisma Decimal fields (budget, actualCost) serialize as objects/strings.
    // Normalize to plain numbers for the client to consume safely.
    const normalized = tasks.map((t: any) => ({
      ...t,
      budget: t.budget != null ? Number(t.budget) : null,
      actualCost: t.actualCost != null ? Number(t.actualCost) : null,
    }));

    return NextResponse.json(normalized);
  } catch (error) {
    console.error('Error fetching tasks:', error);
    return NextResponse.json(
      { error: 'Failed to fetch tasks' },
      { status: 500 }
    );
  }
}

