import { useEffect, useState } from 'react';

/** How the 100 points are split. Shared by the results page and the work record. */
export const SCORE_PARTS = [
  { key: 'correctness', label: 'Correctness', max: 60 },
  { key: 'quality', label: 'Code quality', max: 25 },
  { key: 'independence', label: 'Independence', max: 15 },
];

const ASPECTS = [
  { key: 'edgeCases', label: 'Edge cases' },
  { key: 'reliability', label: 'Reliability' },
  { key: 'maintainability', label: 'Maintainability' },
];

const reducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/** 0 → 1 over `duration` ms once on mount (straight to 1 for reduced motion). */
function useProgress(duration = 900, delay = 0) {
  const [progress, setProgress] = useState(0);
  useEffect(() => {
    if (reducedMotion()) {
      setProgress(1);
      return undefined;
    }
    let frame;
    const started = performance.now() + delay;
    const tick = (now) => {
      const t = Math.min(1, Math.max(0, (now - started) / duration));
      setProgress(1 - (1 - t) ** 3);
      if (t < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [duration, delay]);
  return progress;
}

export function gradeFor(total, resolved) {
  if (!resolved) return 'Not resolved';
  if (total >= 90) return 'Excellent';
  if (total >= 75) return 'Strong';
  if (total >= 60) return 'Solid';
  return 'Resolved with help';
}

/** The big total: a ring that fills and a number that counts up. */
export function ScoreRing({ total, resolved, size = 'size-44' }) {
  const progress = useProgress();
  const shown = Math.round(total * progress);
  const radius = 56;
  const circumference = 2 * Math.PI * radius;

  return (
    <div className={`relative shrink-0 ${size}`} role="img" aria-label={`Score ${total} out of 100`}>
      <svg viewBox="0 0 128 128" className="size-full -rotate-90">
        <circle cx="64" cy="64" r={radius} fill="none" strokeWidth="9" className="stroke-paper-3" />
        <circle
          cx="64"
          cy="64"
          r={radius}
          fill="none"
          strokeWidth="9"
          strokeLinecap="round"
          className={resolved ? 'stroke-accent' : 'stroke-bad'}
          strokeDasharray={circumference}
          strokeDashoffset={circumference * (1 - (total / 100) * progress)}
        />
      </svg>
      <span className="absolute inset-0 grid place-items-center text-center leading-none">
        <span>
          <span className="block font-display text-6xl font-semibold tabular-nums tracking-tight">{shown}</span>
          <span className="mt-1 block text-sm text-muted">/ 100</span>
        </span>
      </span>
    </div>
  );
}

/** The 100 points as three slots sized 60 / 25 / 15, each filled by what was earned. */
export function ScoreSplit({ score }) {
  const progress = useProgress(900, 150);
  return (
    <div>
      <div className="flex gap-1.5" aria-hidden>
        {SCORE_PARTS.map((part) => (
          <span key={part.key} className="h-3 overflow-hidden rounded-full bg-paper-3" style={{ flex: part.max }}>
            <span
              className="block h-full origin-left rounded-full bg-accent"
              style={{ transform: `scaleX(${(score[part.key] / part.max) * progress})` }}
            />
          </span>
        ))}
      </div>
      <dl className="mt-3 grid grid-cols-3 gap-2">
        {SCORE_PARTS.map((part) => (
          <div key={part.key} className="flex min-w-0 flex-col-reverse">
            <dt className="text-xs text-muted">{part.label}</dt>
            <dd className="font-display text-xl font-semibold tabular-nums">
              {score[part.key]}
              <span className="text-sm font-normal text-faint">/{part.max}</span>
            </dd>
          </div>
        ))}
      </dl>
    </div>
  );
}

/** Six skills on one shape: the three score parts plus the reviewer's three ratings. */
export function SkillRadar({ score, aspects }) {
  const progress = useProgress(1000, 250);
  const axes = [
    ...SCORE_PARTS.map((part) => ({ label: part.label, value: score[part.key] / part.max })),
    ...ASPECTS.map((aspect) => ({ label: aspect.label, value: (aspects?.[aspect.key]?.rating ?? 0) / 5 })),
  ];
  const center = 120;
  const radius = 86;
  const point = (index, scale) => {
    const angle = (Math.PI * 2 * index) / axes.length - Math.PI / 2;
    return [center + Math.cos(angle) * radius * scale, center + Math.sin(angle) * radius * scale];
  };
  const ring = (scale) => axes.map((_, index) => point(index, scale).join(',')).join(' ');
  const shape = axes.map((axis, index) => point(index, Math.max(0.04, axis.value) * progress).join(',')).join(' ');

  return (
    <svg
      viewBox="-58 6 356 228"
      className="size-full max-h-full"
      role="img"
      aria-label={axes.map((axis) => `${axis.label} ${Math.round(axis.value * 100)}%`).join(', ')}
    >
      {[0.25, 0.5, 0.75, 1].map((scale) => (
        <polygon key={scale} points={ring(scale)} fill="none" className="stroke-line" strokeWidth="1" />
      ))}
      {axes.map((_, index) => {
        const [x, y] = point(index, 1);
        return <line key={index} x1={center} y1={center} x2={x} y2={y} className="stroke-line" strokeWidth="1" />;
      })}
      <polygon points={shape} className="fill-accent/25 stroke-accent" strokeWidth="2" strokeLinejoin="round" />
      {axes.map((axis, index) => {
        const [x, y] = point(index, Math.max(0.04, axis.value) * progress);
        return <circle key={axis.label} cx={x} cy={y} r="3" className="fill-accent" />;
      })}
      {axes.map((axis, index) => {
        const [x, y] = point(index, 1.2);
        const anchor = Math.abs(x - center) < 4 ? 'middle' : x > center ? 'start' : 'end';
        return (
          <text
            key={axis.label}
            x={x}
            y={y}
            textAnchor={anchor}
            dominantBaseline="middle"
            className="fill-muted font-ui text-[12px]"
          >
            {axis.label}
          </text>
        );
      })}
    </svg>
  );
}

/** One big number with a small label under it. */
export function Stat({ label, value, icon: Icon }) {
  return (
    <div className="flex flex-col-reverse rounded-xl border border-line bg-paper-2 px-3.5 py-3">
      <dt className="mt-1.5 text-xs text-muted">{label}</dt>
      <dd className="flex items-center gap-2 font-display text-2xl font-semibold tabular-nums leading-none">
        {Icon && <Icon className="size-4 text-faint" aria-hidden />}
        {value}
      </dd>
    </div>
  );
}
