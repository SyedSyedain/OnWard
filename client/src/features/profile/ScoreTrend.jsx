import { useState } from 'react';
import { Link } from 'react-router-dom';

const SHOWN = 12;

/** The last twelve scores as bars, oldest on the left, with the average as a line. Each bar opens its review. */
export default function ScoreTrend({ history }) {
  const [hovered, setHovered] = useState(null);
  const recent = history.slice(0, SHOWN).reverse();
  const average = recent.length ? Math.round(recent.reduce((sum, entry) => sum + entry.score.total, 0) / recent.length) : 0;
  const focus = hovered ?? recent.at(-1);

  return (
    <section className="rounded-2xl border border-line bg-paper-2 p-4">
      <header className="mb-3 flex items-baseline justify-between gap-2">
        <h2 className="font-display text-base font-semibold">Score trend</h2>
        {recent.length > 0 && <span className="text-xs text-muted">Average {average}</span>}
      </header>

      {recent.length === 0 ? (
        <p className="grid h-36 place-items-center rounded-xl bg-paper text-center text-sm text-muted">
          Your scores will show here.
        </p>
      ) : (
        <>
          <div className="relative h-36 border-b border-line" onMouseLeave={() => setHovered(null)}>
            <span
              className="pointer-events-none absolute inset-x-0 border-t border-dashed border-ink-3/40"
              style={{ bottom: `${average}%` }}
              aria-hidden
            />
            <ol className="absolute inset-0 flex items-end gap-1.5">
              {Array.from({ length: SHOWN - recent.length }, (_, index) => (
                <li key={`empty-${index}`} className="h-full flex-1" aria-hidden />
              ))}
              {recent.map((entry, index) => (
                <li key={entry.sessionId} className="flex h-full flex-1 items-end">
                  <Link
                    to={`/sessions/${entry.sessionId}/review`}
                    aria-label={`${entry.issueId}, score ${entry.score.total}`}
                    onMouseEnter={() => setHovered(entry)}
                    onFocus={() => setHovered(entry)}
                    className={`block w-full origin-bottom rounded-t-md transition-[filter,opacity] motion-safe:animate-[grow-up_700ms_cubic-bezier(.2,.8,.2,1)_both] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent ${
                      entry.resolved ? 'bg-accent' : 'bg-bad/50'
                    } ${hovered && hovered !== entry ? 'opacity-45' : ''}`}
                    style={{ height: `${Math.max(3, entry.score.total)}%`, animationDelay: `${index * 50}ms` }}
                  />
                </li>
              ))}
            </ol>
          </div>
          <p className="mt-2 flex items-center justify-between gap-2 text-xs" aria-live="polite">
            <span className="min-w-0 truncate text-muted">
              <span className="font-mono text-ink-2">{focus.issueId}</span> {focus.title}
            </span>
            <span className="shrink-0 font-display text-base font-semibold tabular-nums text-ink">{focus.score.total}</span>
          </p>
        </>
      )}
    </section>
  );
}
