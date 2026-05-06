import { NextRequest, NextResponse } from 'next/server';
import { getScan } from '@/lib/db';

export const runtime = 'nodejs';

export async function GET(_req: NextRequest, { params }: { params: { scanId: string } }) {
  const scan = await getScan(params.scanId);
  if (!scan) {
    return NextResponse.json({ error: 'Scan not found or database is not configured.' }, { status: 404 });
  }
  return NextResponse.json(scan);
}
