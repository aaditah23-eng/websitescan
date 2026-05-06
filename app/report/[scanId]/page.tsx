import Link from 'next/link';
import Report from '@/components/Report';
import { getScan } from '@/lib/db';
import { makeDemoScan } from '@/lib/demo';

export default async function ReportPage({ params }: { params: { scanId: string } }) {
  const saved = await getScan(params.scanId);
  const result = saved || makeDemoScan('example.com');

  return (
    <main className="min-h-screen bg-[#050505] px-5 py-8 text-white md:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 flex items-center justify-between rounded-3xl border border-white/10 bg-white/[0.035] px-5 py-4">
          <div>
            <div className="font-semibold">QuantumShield Report</div>
            <div className="text-xs text-zinc-500">{saved ? 'Saved scan' : 'Demo fallback because database is not configured or scan was not found'}</div>
          </div>
          <Link href="/" className="rounded-full border border-white/10 px-4 py-2 text-sm text-zinc-200 hover:bg-white/10">New scan</Link>
        </div>
        <Report result={result} />
      </div>
    </main>
  );
}
