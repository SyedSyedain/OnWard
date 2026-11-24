import { DIFFICULTY_LABELS } from '../../lib/constants.js';
import FileIcon from '../codespace/components/FileIcon.jsx';

/** The ticket as written by the AI Engineering Manager, laid out as a document to read before work starts. */
export default function TicketCard({ ticket }) {
  return (
    <article className="font-ui text-[15px] leading-relaxed text-ink-2">
      <header className="border-b border-line px-6 pb-6 pt-6 sm:px-8">
        <div className="mb-3 flex flex-wrap items-center gap-1.5 text-xs">
          <span className="rounded-md bg-ink px-1.5 py-0.5 font-mono text-paper-2">{ticket.issueId}</span>
          <span className="rounded-md bg-paper-3 px-1.5 py-0.5 text-ink-2">{ticket.area}</span>
          <span className="rounded-md bg-accent-soft px-1.5 py-0.5 text-ink">
            {DIFFICULTY_LABELS[ticket.difficulty]}
          </span>
        </div>
        <h1 className="max-w-[24ch] font-display text-2xl font-semibold leading-tight tracking-tight text-ink sm:text-[28px]">
          {ticket.title}
        </h1>
      </header>

      <div className="space-y-6 px-6 py-6 sm:px-8">
        <Section title="What is happening">
          <p>{ticket.summary}</p>
        </Section>

        <Section title="Why it matters">
          <p>{ticket.businessImpact}</p>
        </Section>

        <Section title="Done when">
          <ol className="space-y-2">
            {ticket.acceptanceCriteria.map((criterion, index) => (
              <li key={criterion} className="flex gap-3">
                <span className="mt-0.5 grid size-5 shrink-0 place-items-center rounded-md bg-paper-3 font-mono text-[11px] text-ink-2">
                  {index + 1}
                </span>
                {criterion}
              </li>
            ))}
          </ol>
        </Section>

        <Section title="Start looking at">
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
        </Section>
      </div>
    </article>
  );
}

function Section({ title, children }) {
  return (
    <section>
      <h2 className="mb-1.5 text-[13px] font-medium text-muted">{title}</h2>
      {children}
    </section>
  );
}
