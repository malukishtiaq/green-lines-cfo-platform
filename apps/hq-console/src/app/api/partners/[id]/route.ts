import { NextRequest, NextResponse } from 'next/server';
import { RepositoryFactory } from '@/infrastructure/database';

export async function GET(_: NextRequest, { params }: { params: { id: string } }) {
  const repo = RepositoryFactory.getPartnerRepository();
  const data = await repo.findById(params.id);
  return NextResponse.json({ data });
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const repo = RepositoryFactory.getPartnerRepository();
  const body = await req.json();
  const updated = await repo.update(params.id, body);
  return NextResponse.json({ data: updated });
}

export async function DELETE(_: NextRequest, { params }: { params: { id: string } }) {
  const repo = RepositoryFactory.getPartnerRepository();
  await repo.delete(params.id);
  return NextResponse.json({ success: true });
}


