import { CircleCheck, Flame } from 'lucide-react';
import { DIFFICULTY_LABELS } from '../../lib/constants.js';
import FileIcon from '../codespace/components/FileIcon.jsx';

/** The ticket from the Engineering Manager: the problem, why it matters, when it is done and where to look. */
export default function TicketCard({ ticket }) {
  return (
    <article className="px-6 py-5 font-ui text-[15px] leading-relaxed text-ink-2">
      <div className="mb-2 flex flex-wrap items-center gap-1.5 text-xs">
        <span className="rounded-md bg-ink px-1.5 py-0.5 font-mono text-paper-2">{ticket.issueId}</span>
        <span className="rounded-md bg-paper-3 px-1.5 py-0.5 text-ink-2">{ticket.area}</span>
        <span className="rounded-md bg-accent-soft px-1.5 py-0.5 text-ink">{DIFFICULTY_LABELS[ticket.difficulty]}</span>
      </div>
      <h1 className="font-display text-2xl font-semibold leading-tight tracking-tight text-ink sm:text-[28px]">
        {ticket.title}
      </h1>
      <p className="mt-3">{ticket.summary}</p>
      <p className="mt-3 flex gap-2 rounded-lg bg-accent-soft/60 px-3 py-2 text-[14px] text-ink-2">
        <Flame className="mt-1 size-4 shrink-0 text-accent-strong" aria-label="Why it matters" />
        {ticket.businessImpact}
      </p>

      <h2 className="mb-2 mt-5 font-display text-base font-semibold text-ink">Done when</h2>
      <ul className="space-y-1.5">
        {ticket.acceptanceCriteria.map((criterion) => (
          <li key={criterion} className="flex gap-2">
            <CircleCheck className="mt-1 size-4 shrink-0 text-faint" aria-hidden />
            {criterion}
          </li>
        ))}
      </ul>

      <h2 className="mb-2 mt-5 font-display text-base font-semibold text-ink">Start in</h2>
      <ul className="flex flex-wrap gap-2">
        {ticket.relevantFiles.map((file) => (
          <li
            key={file}
            className="flex items-center gap-1.5 rounded-md border border-line bg-paper px-2 py-1 font-mono text-xs text-ink"
          >
            <FileIcon path={file} className="size-3.5 text-muted" />
            {file}
          </li>
        ))}
      </ul>
    </article>
  );
}
