import { ArrowUpRight, CheckCircle2, Lightbulb, X, XCircle } from 'lucide-react';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { DIFFICULTY_LABELS } from '../../lib/constants.js';
import { dayKey } from '../../lib/profile.js';

const FILTERS = [
  { id: 'all', label: 'All', test: () => true },
  { id: 'resolved', label: 'Resolved', test: (entry) => entry.resolved },
  { id: 'open', label: 'Not resolved', test: (entry) => !entry.resolved },
];

/** Every submitted ticket, filterable by outcome and by the day picked on the activity grid. */
export default function TicketList({ history, day, onClearDay }) {
  const [filterId, setFilterId] = useState('all');
  const onDay = day ? history.filter((entry) => dayKey(new Date(entry.submittedAt)) === day) : history;
  const filter = FILTERS.find((item) => item.id === filterId);
  const shown = onDay.filter(filter.test);
  const dayLabel = day && new Date(`${day}T00:00:00`).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });

  return (
    <section className="flex flex-1 flex-col rounded-2xl border border-line bg-paper-2 p-4">
      <header className="mb-2 flex flex-wrap items-center gap-2">
        <h2 className="mr-auto font-display text-base font-semibold">Tickets</h2>
        {day && (
          <button
            type="button"
            onClick={onClearDay}
            className="flex items-center gap-1 rounded-full bg-ink px-2.5 py-1 text-xs text-paper-2 hover:bg-ink-2 focus-visible:outline-2 focus-visible:outline-accent"
          >
            {dayLabel}
            <X className="size-3.5" aria-label="Show every day" />
          </button>
        )}
        <div className="flex rounded-full bg-paper-3 p-0.5" role="group" aria-label="Filter tickets">
          {FILTERS.map((item) => {
            const count = onDay.filter(item.test).length;
            return (
              <button
                key={item.id}
                type="button"
                aria-pressed={filterId === item.id}
                onClick={() => setFilterId(item.id)}
                className={`rounded-full px-3 py-1 text-xs transition-colors focus-visible:outline-2 focus-visible:outline-accent ${
                  filterId === item.id ? 'bg-paper-2 text-ink shadow-sm' : 'text-muted hover:text-ink'
                }`}
              >
                {item.label} <span className="tabular-nums text-faint">{count}</span>
              </button>
            );
          })}
        </div>
      </header>

      {history.length === 0 ? (
        <div className="grid place-items-center gap-3 py-10 text-center">
          <p className="max-w-[36ch] text-sm text-muted">Submit your first ticket and it will show up here, with its score.</p>
          <Link
            to="/?start"
            className="rounded-full bg-accent px-4 py-2 text-sm font-medium text-ink hover:bg-accent-strong focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink"
          >
            Start your first ticket
          </Link>
        </div>
      ) : shown.length === 0 ? (
        <p className="py-8 text-center text-sm text-muted">No tickets match this filter.</p>
      ) : (
        <ol className="-mx-1 max-h-[420px] divide-y divide-line overflow-y-auto">
          {shown.map((entry, index) => (
            <TicketRow key={entry.sessionId} entry={entry} index={index} />
          ))}
        </ol>
      )}
    </section>
  );
}

function TicketRow({ entry, index }) {
  const date = new Date(entry.submittedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
  const total = entry.score.total;
  return (
    <li className="motion-safe:animate-[rise-in_320ms_ease-out_both]" style={{ animationDelay: `${Math.min(index, 8) * 40}ms` }}>
      <Link
        to={`/sessions/${entry.sessionId}/review`}
        className="group flex items-center gap-3 rounded-xl px-2 py-3 transition-colors hover:bg-paper-3/60 focus-visible:outline-2 focus-visible:outline-accent"
      >
        {entry.resolved ? (
          <CheckCircle2 className="size-5 shrink-0 text-ok" aria-label="Resolved" />
        ) : (
          <XCircle className="size-5 shrink-0 text-bad" aria-label="Not resolved" />
        )}
        <span className="hidden shrink-0 rounded-md bg-ink px-1.5 py-0.5 font-mono text-[11px] text-paper-2 sm:inline">{entry.issueId}</span>
        <span className="min-w-0 flex-1">
          <span className="block truncate text-sm font-medium text-ink">{entry.title}</span>
          <span className="flex flex-wrap items-center gap-x-2 text-xs text-muted">
            <span className="font-mono text-ink-2 sm:hidden">{entry.issueId}</span>
            <span>{entry.simulationName}</span>
            <span className="rounded bg-paper-3 px-1.5">{DIFFICULTY_LABELS[entry.difficulty] ?? entry.difficulty}</span>
            {entry.hintsUsed > 0 && (
              <span className="flex items-center gap-0.5">
                <Lightbulb className="size-3" aria-hidden />
                {entry.hintsUsed} {entry.hintsUsed === 1 ? 'hint' : 'hints'}
              </span>
            )}
            <span className="sm:hidden">{date}</span>
          </span>
        </span>
        <span className="hidden text-xs text-muted sm:block">{date}</span>
        <span className="flex w-14 shrink-0 flex-col items-end gap-1 sm:w-20">
          <span className="font-display text-xl font-semibold leading-none tabular-nums">{total}</span>
          <span className="block h-1 w-full overflow-hidden rounded-full bg-paper-3" aria-hidden>
            <span
              className={`block h-full rounded-full ${entry.resolved ? 'bg-accent' : 'bg-bad/60'}`}
              style={{ width: `${Math.max(2, total)}%` }}
            />
          </span>
        </span>
        <ArrowUpRight
          className="hidden size-4 shrink-0 text-faint opacity-0 transition-all sm:block group-hover:-translate-y-0.5 group-hover:text-ink group-hover:opacity-100 group-focus-visible:opacity-100"
          aria-hidden
        />
      </Link>
    </li>
  );
}
