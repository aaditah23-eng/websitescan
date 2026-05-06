import type { ScanResult } from '@/lib/types';
import Icon from './Icon';
import ScoreRing from './ScoreRing';

function statusClass(status: string) {
  if (status === 'pass') return 'text-emerald-300 bg-emerald-400/10 border-emerald-400/20';
  if (status === 'warning') return 'text-yellow-300 bg-yellow-400/10 border-yellow-400/20';
  if (status === 'fail') return 'text-red-300 bg-red-400/10 border-red-400/20';
  return 'text-zinc-300 bg-white/5 border-white/10';
}

export default function Report({ result }: { result: ScanResult }) {
  return (
    <div className="space-y-6">
      <div className="grid gap-5 lg:grid-cols-[0.85fr_1.15fr]">
        <ScoreRing score={result.score} risk={result.riskLevel} />
        <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm uppercase tracking-[0.25em] text-emerald-300">Executive Summary</p>
              <h2 className="mt-2 text-3xl font-semibold tracking-tight">{result.domain}</h2>
              <p className="mt-4 text-sm leading-7 text-zinc-400">
                This public scan gives a first-pass view of TLS, certificates, security headers,
                email DNS security, and post-quantum migration signals. It does not prove complete
                internal quantum safety; it helps prioritize the migration conversation.
              </p>
            </div>
            <span className={`rounded-full px-3 py-1 text-sm ${result.riskLevel === 'High' ? 'bg-red-400/10 text-red-300' : result.riskLevel === 'Medium' ? 'bg-yellow-400/10 text-yellow-300' : 'bg-emerald-400/10 text-emerald-300'}`}>
              {result.riskLevel} risk
            </span>
          </div>

          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            <Metric label="TLS" value={result.tlsProtocol || 'Unavailable'} />
            <Metric label="Cipher" value={result.cipher || 'Unknown'} />
            <Metric label="Cert issuer" value={result.certificateIssuer || 'Unknown'} />
            <Metric label="Cert expiry" value={result.daysUntilExpiry === null ? 'Unknown' : `${result.daysUntilExpiry} days`} />
          </div>
        </div>
      </div>

      <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-6">
        <h3 className="text-xl font-semibold">Checks</h3>
        <div className="mt-5 grid gap-4 md:grid-cols-2">
          {result.checks.map((check) => (
            <div key={check.name} className="rounded-2xl border border-white/10 bg-black/40 p-4">
              <div className="flex items-center justify-between gap-3">
                <div className="font-medium">{check.name}</div>
                <span className={`rounded-full border px-2.5 py-1 text-xs ${statusClass(check.status)}`}>{check.status}</span>
              </div>
              <p className="mt-3 text-sm leading-6 text-zinc-500">{check.description}</p>
              <p className="mt-3 text-xs text-zinc-600">{check.pointsAwarded}/{check.maxPoints} points</p>
            </div>
          ))}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-6">
          <div className="flex items-center gap-2 text-emerald-300"><Icon name="alert" size={18} /> Recommendations</div>
          <ul className="mt-5 space-y-3 text-sm leading-6 text-zinc-300">
            {result.recommendations.map((rec) => <li key={rec}>• {rec}</li>)}
          </ul>
        </div>
        <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-6">
          <div className="flex items-center gap-2 text-emerald-300"><Icon name="file" size={18} /> 30 / 60 / 90 day roadmap</div>
          <Roadmap title="Next 30 days" items={result.roadmap.days30} />
          <Roadmap title="Next 60 days" items={result.roadmap.days60} />
          <Roadmap title="Next 90 days" items={result.roadmap.days90} />
        </div>
      </div>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return <div className="rounded-2xl border border-white/10 bg-black/40 p-4"><div className="text-xs text-zinc-500">{label}</div><div className="mt-1 break-words text-sm text-zinc-100">{value}</div></div>;
}
function Roadmap({ title, items }: { title: string; items: string[] }) {
  return <div className="mt-5"><h4 className="text-sm font-medium text-white">{title}</h4><ul className="mt-2 space-y-2 text-sm leading-6 text-zinc-400">{items.map((item) => <li key={item}>• {item}</li>)}</ul></div>;
}
