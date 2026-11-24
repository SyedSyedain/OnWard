import { ClipboardCheck, MessagesSquare } from 'lucide-react';
import { DIFFICULTY_LABELS } from '../../../lib/constants.js';
import FileIcon from './FileIcon.jsx';

const SUBMISSION_STEPS = [
  'Make your change in the editor. Files save automatically.',
  'Run the tests. Project tests must keep passing; the acceptance checks decide the ticket.',
  'Submit for review. The AI reviewer reads your change and the results.',
  'Improve and resubmit if you need to, then finish to receive your signed work record.',
];

/** The assigned ticket, always one click away, with a route back to the manager. */
export default function TaskPanel({ ticket, lastReview, onOpenFile, onAskManager, onOpenReview }) {
  return (
    <div className="space-y-5 px-4 pb-6 pt-3 font-ui text-[13.5px] leading-relaxed text-ink-2">
      <header>
        <div className="mb-2 flex flex-wrap items-center gap-1.5 text-xs">
          <span className="rounded-md bg-ink px-1.5 py-0.5 font-mono text-paper-2">{ticket.issueId}</span>
          <span className="rounded-md bg-paper-3 px-1.5 py-0.5 text-ink-2">{ticket.area}</span>
          <span className="rounded-md bg-accent-soft px-1.5 py-0.5 text-ink">
            {DIFFICULTY_LABELS[ticket.difficulty]}
          </span>
        </div>
        <h2 className="font-display text-lg font-semibold leading-snug tracking-tight text-ink">{ticket.title}</h2>
      </header>

      <Section title="Business context">
        <p>{ticket.businessImpact}</p>
      </Section>

      <Section title="The problem">
        <p>{ticket.summary}</p>
      </Section>

      <Section title="Requirements and acceptance criteria">
        <ol className="space-y-1.5">
          {ticket.acceptanceCriteria.map((criterion, index) => (
            <li key={criterion} className="flex gap-2">
              <span className="mt-px font-mono text-xs text-faint">{index + 1}.</span>
              {criterion}
            </li>
          ))}
        </ol>
      </Section>

      <Section title="Where to start">
        <ul className="space-y-0.5">
          {ticket.relevantFiles.map((file) => (
            <li key={file}>
              <button
                type="button"
                onClick={() => onOpenFile(file)}
                className="-mx-1.5 flex items-center gap-1.5 rounded-md px-1.5 py-1 font-mono text-xs text-ink hover:bg-paper-3 focus-visible:outline-2 focus-visible:outline-accent"
              >
                <FileIcon path={file} className="size-3.5 text-muted" />
                {file}
              </button>
            </li>
          ))}
        </ul>
      </Section>

      <Section title="How to submit">
        <ol className="space-y-1">
          {SUBMISSION_STEPS.map((step, index) => (
            <li key={step} className="flex gap-2">
              <span className="mt-px font-mono text-xs text-faint">{index + 1}.</span>
              {step}
            </li>
          ))}
        </ol>
      </Section>

      <div className="space-y-2 border-t border-line pt-4">
        <button
          type="button"
          onClick={onAskManager}
          className="flex w-full items-center gap-2 rounded-lg border border-line bg-paper-2 px-3 py-2.5 text-left text-ink hover:border-ink-3 focus-visible:outline-2 focus-visible:outline-accent"
        >
          <MessagesSquare className="size-4 text-muted" aria-hidden />
          <span className="flex-1">
            Ask your manager
            <span className="block text-xs text-muted">Clarify requirements, not code.</span>
          </span>
        </button>
        {lastReview && (
          <button
            type="button"
            onClick={onOpenReview}
            className="flex w-full items-center gap-2 rounded-lg border border-line bg-paper-2 px-3 py-2.5 text-left text-ink hover:border-ink-3 focus-visible:outline-2 focus-visible:outline-accent"
          >
            <ClipboardCheck className="size-4 text-muted" aria-hidden />
            <span className="flex-1">
              Read your last review
              <span className="block text-xs text-muted">
                {lastReview.testResult.allPassed ? 'All checks passed' : 'Some checks still failing'}
              </span>
            </span>
          </button>
        )}
      </div>
    </div>
  );
}

function Section({ title, children }) {
  return (
    <section>
      <h3 className="mb-1 text-xs font-medium text-muted">{title}</h3>
      {children}
    </section>
  );
}
