import { NextRequest, NextResponse } from 'next/server';
import { runDomainScan } from '@/lib/scan';
import { saveScan } from '@/lib/db';

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const result = await runDomainScan(body.domain || '');
    const id = await saveScan(result);
    return NextResponse.json({ ...result, id: id || undefined, saved: Boolean(id) });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Scan failed. Please try again.' },
      { status: 400 }
    );
  }
}
