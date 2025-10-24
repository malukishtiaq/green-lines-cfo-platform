import { NextRequest, NextResponse } from 'next/server';
import { RepositoryFactory } from '@/infrastructure/database';

export async function GET() {
  const repo = RepositoryFactory.getPartnerRepository();
  const data = await repo.findAll();
  return NextResponse.json({ data });
}

export async function POST(req: NextRequest) {
  const repo = RepositoryFactory.getPartnerRepository();
  const body = await req.json();
  const created = await repo.create(body);
  return NextResponse.json({ data: created });
}


