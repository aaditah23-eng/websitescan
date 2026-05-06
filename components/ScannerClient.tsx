'use client';

import { useState } from 'react';
import type { ScanResult } from '@/lib/types';
import Icon from './Icon';
import Report from './Report';

export default function ScannerClient({ initialResult }: { initialResult: ScanResult }) {
  const [domain, setDomain] = useState(initialResult.domain);
  const [result, setResult] = useState<ScanResult>(initialResult);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function runScan(nextDomain = domain) {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/scan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ domain: nextDomain }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Scan failed.');
        return;
      }
      setDomain(data.domain);
      setResult(data);
    } catch {
      setError('Unable to connect to scanner API.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <section className="relative px-5 py-8 md:px-8 md:py-10">
        <nav className="mx-auto flex max-w-7xl items-center justify-between rounded-3xl border border-white/10 bg-white/[0.035] px-5 py-4 backdrop-blur-xl">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-emerald-400/30 bg-emerald-400/10 text-emerald-300"><Icon name="shield" size={21} /></div>
            <div><div className="font-semibold tracking-tight">QuantumShield</div><div className="text-xs text-zinc-500">Post-Quantum Readiness Scanner</div></div>
          </div>
          <a href="#report" className="rounded-full border border-white/10 bg-white/[0.05] px-4 py-2 text-sm text-zinc-200 hover:bg-white/10">View Report</a>
        </nav>

        <div className="mx-auto grid max-w-7xl items-center gap-12 py-16 lg:grid-cols-[0.9fr_1.1fr] lg:py-24">
          <div>
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-400/10 px-4 py-2 text-sm text-emerald-300">
              <Icon name="radar" size={16} /> Live MVP scanner
            </div>
            <h1 className="text-5xl font-semibold leading-[0.95] tracking-tight md:text-7xl">Know your quantum risk before attackers do.</h1>
            <p className="mt-7 max-w-2xl text-lg leading-8 text-zinc-400">
              Scan public domains for TLS readiness, certificate posture, security headers, DNS email security, and post-quantum migration gaps.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              {['stripe.com', 'cloudflare.com', 'openai.com', 'github.com'].map((item) => (
                <button key={item} onClick={() => runScan(item)} className="rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-sm text-zinc-300 hover:border-emerald-400/40 hover:bg-emerald-400/10 hover:text-emerald-200">Scan {item}</button>
              ))}
            </div>
          </div>

          <div className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-4 shadow-2xl shadow-emerald-950/30 backdrop-blur-xl md:p-6">
            <div className="rounded-[1.5rem] border border-white/10 bg-black/70 p-5">
              <div className="mb-5 flex items-center justify-between"><div className="flex items-center gap-2"><span className="h-3 w-3 rounded-full bg-red-400" /><span className="h-3 w-3 rounded-full bg-yellow-400" /><span className="h-3 w-3 rounded-full bg-green-400" /></div><div className="text-xs text-zinc-500">/api/scan</div></div>
              <div className="rounded-3xl border border-emerald-400/20 bg-emerald-400/[0.06] p-4">
                <div className="mb-4 flex items-center gap-3"><div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-400/10 text-emerald-300"><Icon name="globe" size={22} /></div><div><div className="font-medium">Domain Scanner</div><div className="text-sm text-zinc-500">External cryptographic assessment</div></div></div>
                <div className="flex flex-col gap-3 sm:flex-row">
                  <input value={domain} onChange={(e) => setDomain(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && runScan()} className="min-w-0 flex-1 rounded-2xl border border-white/10 bg-black px-4 py-3 text-sm outline-none placeholder:text-zinc-600 focus:border-emerald-400/50" placeholder="company.com" />
                  <button onClick={() => runScan()} disabled={loading} className="flex items-center justify-center gap-2 rounded-2xl bg-emerald-400 px-5 py-3 text-sm font-semibold text-black transition hover:bg-emerald-300 disabled:opacity-60">{loading ? <Icon name="loader" size={17} /> : <Icon name="radar" size={17} />}{loading ? 'Scanning' : 'Run Scan'}</button>
                </div>
                {error && <div className="mt-3 rounded-2xl border border-red-400/20 bg-red-400/10 px-4 py-3 text-sm text-red-200">{error}</div>}
              </div>

              <div className="mt-5 grid gap-4 md:grid-cols-2">
                <MiniMetric label="Readiness" value={`${result.score}/100`} />
                <MiniMetric label="Risk" value={result.riskLevel} />
                <MiniMetric label="TLS" value={result.tlsProtocol || 'Unknown'} />
                <MiniMetric label="PQC signal" value={result.pqcDetected ? 'Detected' : 'Not detected'} />
              </div>
              {result.id && <a href={`/report/${result.id}`} className="mt-5 flex items-center justify-center gap-2 rounded-2xl border border-white/10 px-4 py-3 text-sm text-zinc-200 hover:bg-white/10">Open saved report <Icon name="arrow" size={16} /></a>}
            </div>
          </div>
        </div>
      </section>
      <section id="report" className="relative mx-auto max-w-7xl px-5 pb-24 md:px-8"><Report result={result} /></section>
    </>
  );
}

function MiniMetric({ label, value }: { label: string; value: string }) {
  return <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4"><div className="text-xs text-zinc-500">{label}</div><div className="mt-1 break-words text-xl font-semibold">{value}</div></div>;
}
