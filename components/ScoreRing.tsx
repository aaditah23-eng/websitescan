export default function ScoreRing({ score, risk }: { score: number; risk: string }) {
  const circumference = 2 * Math.PI * 46;
  const offset = circumference - (score / 100) * circumference;
  const riskClass = risk === 'Low' ? 'text-emerald-300' : risk === 'Medium' ? 'text-yellow-300' : 'text-red-300';

  return (
    <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-5 text-center">
      <div className="relative mx-auto h-36 w-36">
        <svg className="h-full w-full -rotate-90" viewBox="0 0 120 120">
          <circle cx="60" cy="60" r="46" stroke="rgba(255,255,255,0.08)" strokeWidth="10" fill="none" />
          <circle cx="60" cy="60" r="46" stroke="currentColor" strokeWidth="10" fill="none" strokeLinecap="round" className="text-emerald-400 transition-all duration-700" strokeDasharray={circumference} strokeDashoffset={offset} />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <div className="text-4xl font-semibold">{score}</div>
          <div className="text-xs text-zinc-500">/100</div>
        </div>
      </div>
      <div className="mt-3 text-sm text-zinc-500">Quantum Readiness</div>
      <div className={`mt-1 font-medium ${riskClass}`}>{risk} Risk</div>
    </div>
  );
}
