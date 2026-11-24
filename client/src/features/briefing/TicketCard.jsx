import { FileCode2 } from 'lucide-react';
import Badge from '../../components/ui/Badge.jsx';
import { DIFFICULTY_LABELS } from '../../lib/constants.js';

/** The ticket as written by the AI Engineering Manager. `compact` is used in the workspace sidebar. */
export default function TicketCard({ ticket, compact = false }) {
  return (
    <article className="space-y-5">
      <header>
        <div className="mb-2 flex flex-wrap items-center gap-2">
          <Badge tone="blue">{ticket.issueId}</Badge>
          <Badge>{ticket.area}</Badge>
          <Badge tone="amber">{DIFFICULTY_LABELS[ticket.difficulty]}</Badge>
        </div>
        <h1 className={`${compact ? 'text-base' : 'text-2xl'} font-semibold tracking-tight text-slate-900`}>
          {ticket.title}
        </h1>
      </header>

      <Section title="What is happening">
        <p>{ticket.summary}</p>
      </Section>

      <Section title="Why it matters">
        <p>{ticket.businessImpact}</p>
      </Section>

      <Section title="Done when">
        <ul className="space-y-1.5">
          {ticket.acceptanceCriteria.map((criterion) => (
            <li key={criterion} className="flex gap-2">
              <span className="mt-2 size-1.5 shrink-0 rounded-full bg-blue-500" aria-hidden />
              {criterion}
            </li>
          ))}
        </ul>
      </Section>

      <Section title="Start looking at">
        <ul className="space-y-1">
          {ticket.relevantFiles.map((file) => (
            <li key={file} className="flex items-center gap-2 font-mono text-xs text-slate-700">
              <FileCode2 className="size-3.5 text-slate-400" aria-hidden />
              {file}
            </li>
          ))}
        </ul>
      </Section>
    </article>
  );
}

function Section({ title, children }) {
  return (
    <section>
      <h2 className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-slate-500">{title}</h2>
      <div className="text-sm leading-relaxed text-slate-700">{children}</div>
    </section>
  );
}
