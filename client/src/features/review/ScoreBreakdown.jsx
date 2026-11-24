const PARTS = [
  { key: 'correctness', label: 'Correctness', max: 60, hint: 'All checks must pass' },
  { key: 'quality', label: 'Code quality', max: 25, hint: 'From the AI review' },
  { key: 'independence', label: 'Independence', max: 15, hint: 'Fewer hints, higher score (resolved only)' },
];

export default function ScoreBreakdown({ score }) {
  return (
    <div>
      <p className="text-5xl font-bold tracking-tight text-slate-900">
        {score.total}
        <span className="text-2xl font-medium text-slate-400"> / 100</span>
      </p>
      <dl className="mt-6 space-y-4">
        {PARTS.map(({ key, label, max, hint }) => (
          <div key={key}>
            <div className="flex items-baseline justify-between text-sm">
              <dt className="font-medium text-slate-700">
                {label} <span className="font-normal text-slate-400">· {hint}</span>
              </dt>
              <dd className="tabular-nums text-slate-900">
                {score[key]} / {max}
              </dd>
            </div>
            <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-slate-100">
              <div className="h-full rounded-full bg-blue-600" style={{ width: `${(score[key] / max) * 100}%` }} />
            </div>
          </div>
        ))}
      </dl>
    </div>
  );
}
