import {
  ArrowLeft,
  CheckCircle2,
  FileCode2,
  Loader2,
  Send,
  ThumbsUp,
  TrendingUp,
  XCircle,
} from 'lucide-react';
import { useState } from 'react';
import Avatar from './Avatar.jsx';

const ASPECTS = [
  { id: 'edgeCases', label: 'Edge cases' },
  { id: 'reliability', label: 'Reliability' },
  { id: 'maintainability', label: 'Maintainability' },
];

/**
 * A code review inside the Codespace: what to fix next, the reviewer's notes, and how this attempt
 * compares with the last one. Nothing is scored here; the final submission happens from the footer.
 */
export default function ReviewView({ review, reviews, onSelect, onBack, onOpenFile, onFinish }) {
  const [confirming, setConfirming] = useState(false);
  const [finishing, setFinishing] = useState(false);
  const [error, setError] = useState(null);

  const index = Math.max(0, reviews.findIndex((entry) => entry.id === review.id));
  const previous = index > 0 ? reviews[index - 1] : null;
  const { testResult, review: verdict, changedFiles } = review;
  const resolved = testResult.allPassed;
  const acceptance = testResult.tests.filter((test) => test.kind === 'acceptance');
  const failing = acceptance.filter((test) => !test.passed);
  const live = verdict.generatedBy !== 'template';
  const steps = nextSteps({ testResult, changedFiles, verdict });

  async function finish() {
    setFinishing(true);
    setError(null);
    try {
      await onFinish();
    } catch (finishError) {
      setError(finishError.message);
      setFinishing(false);
    }
  }

  return (
    <div className="absolute inset-0 z-30 flex flex-col bg-paper font-ui animate-[fade-in_180ms_ease-out]">
      <div className="min-h-0 flex-1 overflow-y-auto">
        <div className="mx-auto max-w-6xl space-y-4 px-4 py-5 sm:px-6">
          <header className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={onBack}
              className="inline-flex items-center gap-1.5 rounded-md px-1.5 py-1 text-sm text-muted hover:bg-paper-3 hover:text-ink focus-visible:outline-2 focus-visible:outline-accent"
            >
              <ArrowLeft className="size-4" aria-hidden /> Code
            </button>
            <span className="h-5 w-px bg-line" aria-hidden />
            <Avatar id="reviewer" name="Reviewer" size="sm" />
            <p className="text-sm">
              <span className="font-medium text-ink">Code review {index + 1}</span>
              <span className="text-muted">
                {' '}
                at {new Date(review.reviewedAt).toLocaleTimeString([], { timeStyle: 'short' })}
              </span>
            </p>
            <span
              className="rounded bg-paper-3 px-1.5 py-0.5 text-[11px] text-muted"
              title={live ? 'Written by the AI reviewer.' : 'The AI reviewer was busy, so automatic checks rated your change.'}
            >
              {live ? 'AI reviewer' : 'Automatic checks'}
            </span>
            <span className="ml-auto text-xs text-faint">Fix what it flags, then review again or submit.</span>
          </header>

          <section className="grid items-center gap-5 rounded-2xl border border-line bg-paper-2 p-5 md:grid-cols-[minmax(0,1fr)_auto]">
            <div className="flex min-w-0 items-start gap-4">
              <span
                className={`grid size-12 shrink-0 place-items-center rounded-full ${resolved ? 'bg-ok-soft text-ok' : 'bg-bad-soft text-bad'}`}
              >
                {resolved ? <CheckCircle2 className="size-6" aria-hidden /> : <XCircle className="size-6" aria-hidden />}
              </span>
              <div className="min-w-0">
                <h1 className="font-display text-2xl font-semibold tracking-tight text-ink">
                  {resolved ? 'Ready to submit' : changedFiles.length ? 'Almost there' : 'Nothing changed yet'}
                </h1>
                <p className="mt-0.5 line-clamp-2 text-[14.5px] text-ink-2">{verdict.summary}</p>
              </div>
            </div>
            <dl className="flex gap-3">
              <Gauge
                label="Checks"
                value={testResult.acceptancePassed}
                max={testResult.acceptanceTotal}
                before={previous?.testResult.acceptancePassed}
              />
              <Gauge
                label="Tests"
                value={testResult.passedCount}
                max={testResult.totalCount}
                before={previous?.testResult.passedCount}
              />
              <Gauge label="Quality" value={verdict.qualityScore} max={25} before={previous?.review.qualityScore} />
            </dl>
          </section>

          <div className="grid gap-4 lg:grid-cols-3">
            <Card title={failing.length ? 'Fix next' : 'Checks'}>
              <ul className="space-y-2">
                {[...failing, ...acceptance.filter((test) => test.passed)].map((test) => (
                  <li key={test.name} className="flex gap-2 text-[13.5px] leading-snug text-ink-2">
                    {test.passed ? (
                      <CheckCircle2 className="mt-px size-4 shrink-0 text-ok" aria-label="Passed" />
                    ) : (
                      <XCircle className="mt-px size-4 shrink-0 text-bad" aria-label="Failing" />
                    )}
                    {test.name}
                  </li>
                ))}
              </ul>
              {steps.length > 0 && (
                <ol className="mt-4 space-y-1.5 border-t border-line pt-3">
                  {steps.map((step, stepIndex) => (
                    <li key={step} className="flex gap-2 text-[13px] leading-snug text-muted">
                      <span className="grid size-4 shrink-0 place-items-center rounded bg-paper-3 font-mono text-[10px] text-ink-2">
                        {stepIndex + 1}
                      </span>
                      {step}
                    </li>
                  ))}
                </ol>
              )}
            </Card>

            <Card title="Reviewer notes">
              {verdict.aspects ? (
                <dl className="space-y-3">
                  {ASPECTS.map((aspect) => {
                    const rating = verdict.aspects[aspect.id];
                    return (
                      <div key={aspect.id}>
                        <dt className="flex items-center justify-between text-[13px] font-medium text-ink">
                          {aspect.label}
                          <Meter rating={rating.rating} />
                        </dt>
                        <dd className="mt-0.5 line-clamp-2 text-[12.5px] leading-snug text-muted">{rating.note}</dd>
                      </div>
                    );
                  })}
                </dl>
              ) : (
                <p className="text-[13px] text-muted">Ratings appear once you change some code.</p>
              )}
              <ul className="mt-4 space-y-1.5 border-t border-line pt-3 text-[13px] leading-snug">
                {verdict.strengths.slice(0, 2).map((item) => (
                  <li key={item} className="flex gap-2 text-ink-2">
                    <ThumbsUp className="mt-0.5 size-3.5 shrink-0 text-ok" aria-hidden />
                    {item}
                  </li>
                ))}
                {verdict.improvements.slice(0, 2).map((item) => (
                  <li key={item} className="flex gap-2 text-ink-2">
                    <TrendingUp className="mt-0.5 size-3.5 shrink-0 text-warn" aria-hidden />
                    {item}
                  </li>
                ))}
              </ul>
            </Card>

            <Card title="Your change">
              {changedFiles.length ? (
                <ul className="flex flex-wrap gap-2">
                  {changedFiles.map((file) => (
                    <li key={file}>
                      <button
                        type="button"
                        onClick={() => onOpenFile(file)}
                        title="Open in the editor"
                        className="flex items-center gap-1.5 rounded-md border border-line bg-paper px-2 py-1 font-mono text-xs text-ink hover:border-ink-3 focus-visible:outline-2 focus-visible:outline-accent"
                      >
                        <FileCode2 className="size-3.5 text-muted" aria-hidden />
                        {file}
                      </button>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-[13px] text-muted">No files changed yet.</p>
              )}

              {reviews.length > 1 && (
                <div className="mt-4 border-t border-line pt-3">
                  <p className="mb-2 text-[13px] font-medium text-ink">Checks passing, review by review</p>
                  <ol className="flex h-20 items-end gap-1.5">
                    {reviews.map((entry, entryIndex) => {
                      const { acceptancePassed, acceptanceTotal } = entry.testResult;
                      const share = acceptanceTotal ? acceptancePassed / acceptanceTotal : 0;
                      const current = entry.id === review.id;
                      return (
                        <li key={entry.id} className="flex h-full flex-1 flex-col items-center justify-end gap-1">
                          <button
                            type="button"
                            onClick={() => onSelect(entry)}
                            aria-label={`Review ${entryIndex + 1}: ${acceptancePassed} of ${acceptanceTotal} checks`}
                            aria-current={current || undefined}
                            className={`w-full max-w-10 rounded-t-md focus-visible:outline-2 focus-visible:outline-accent ${
                              current ? 'bg-accent' : 'bg-paper-3 hover:bg-line'
                            }`}
                            style={{ height: `${Math.max(8, share * 100)}%` }}
                          />
                          <span className="text-[11px] tabular-nums text-muted">{entryIndex + 1}</span>
                        </li>
                      );
                    })}
                  </ol>
                </div>
              )}
            </Card>
          </div>
        </div>
      </div>

      <footer className="border-t border-line bg-paper-2">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-3 px-4 py-3 sm:px-6">
          <button
            type="button"
            onClick={onBack}
            className="h-9 rounded-lg bg-ink px-4 text-sm font-medium text-paper-2 hover:bg-ink-2 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
          >
            Back to the code
          </button>
          <span className="flex-1" />
          {error && <p className="text-sm text-bad">{error}</p>}
          {confirming ? (
            <span className="flex flex-wrap items-center gap-2 text-sm text-ink-2">
              {resolved ? 'Submit and get your scorecard?' : 'Checks are still failing. Submit anyway?'}
              <button
                type="button"
                onClick={() => setConfirming(false)}
                disabled={finishing}
                className="h-9 rounded-lg px-3 text-muted hover:bg-paper-3 focus-visible:outline-2 focus-visible:outline-accent"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={finish}
                disabled={finishing}
                className="inline-flex h-9 items-center gap-2 rounded-lg bg-accent px-4 font-medium text-ink hover:bg-accent-strong disabled:opacity-60 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink"
              >
                {finishing && <Loader2 className="size-4 animate-spin" aria-hidden />}
                Yes, submit
              </button>
            </span>
          ) : (
            <button
              type="button"
              onClick={() => setConfirming(true)}
              className={`inline-flex h-9 items-center gap-2 rounded-lg px-4 text-sm font-medium focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent ${
                resolved ? 'bg-accent text-ink hover:bg-accent-strong' : 'border border-line bg-paper text-ink hover:border-ink-3'
              }`}
            >
              <Send className="size-4" aria-hidden /> Submit final
            </button>
          )}
        </div>
      </footer>
    </div>
  );
}

function Card({ title, children }) {
  return (
    <section className="rounded-2xl border border-line bg-paper-2 p-4">
      <h2 className="mb-3 font-display text-base font-semibold text-ink">{title}</h2>
      {children}
    </section>
  );
}

/** A small ring with value/max and, after the first review, the change since the last one. */
function Gauge({ label, value, max, before }) {
  const radius = 26;
  const circumference = 2 * Math.PI * radius;
  const share = max ? value / max : 0;
  const delta = before === undefined ? 0 : value - before;
  const tone = share === 1 ? 'stroke-ok' : share >= 0.5 ? 'stroke-accent' : 'stroke-bad';

  return (
    <div className="flex w-20 flex-col items-center">
      <dt className="mb-1 text-xs text-muted">
        {label} <span className="tabular-nums text-faint">/{max}</span>
      </dt>
      <dd className="flex flex-col items-center">
        <span className="relative size-16">
          <svg viewBox="0 0 64 64" className="size-full -rotate-90" aria-hidden>
            <circle cx="32" cy="32" r={radius} fill="none" strokeWidth="6" className="stroke-paper-3" />
            <circle
              cx="32"
              cy="32"
              r={radius}
              fill="none"
              strokeWidth="6"
              strokeLinecap="round"
              className={`${tone} transition-[stroke-dashoffset] duration-700 ease-out`}
              strokeDasharray={circumference}
              strokeDashoffset={circumference * (1 - share)}
            />
          </svg>
          <span className="absolute inset-0 grid place-items-center font-display text-[15px] font-semibold tabular-nums text-ink">
            {value}
          </span>
        </span>
        {delta !== 0 && (
          <span className={`mt-1 text-[11px] font-medium tabular-nums ${delta > 0 ? 'text-ok' : 'text-bad'}`}>
            {delta > 0 ? `+${delta}` : delta} since last
          </span>
        )}
      </dd>
    </div>
  );
}

function Meter({ rating }) {
  return (
    <span className="flex gap-0.5" role="img" aria-label={`${rating} out of 5`}>
      {[1, 2, 3, 4, 5].map((step) => (
        <span key={step} className={`h-1.5 w-3 rounded-sm ${step <= rating ? 'bg-accent' : 'bg-paper-3'}`} />
      ))}
    </span>
  );
}

/** Up to three next steps that follow from the real results, most urgent first. */
function nextSteps({ testResult, changedFiles, verdict }) {
  const steps = [];
  if (changedFiles.length === 0) steps.push('Open the files from the ticket and make your fix.');
  if (testResult.status === 'syntax_error') {
    steps.push(`Fix the syntax error in ${testResult.syntaxErrors[0]?.file ?? 'your code'} first.`);
  }
  const failingAcceptance = testResult.tests.some((test) => test.kind === 'acceptance' && !test.passed);
  const failingProject = testResult.tests.some((test) => test.kind === 'project' && !test.passed);
  if (failingAcceptance) steps.push('Take the failing checks one at a time; ask Sarah which case each one tests.');
  if (failingProject) steps.push('An existing test broke: keep your change inside the ticket.');
  if (testResult.allPassed) steps.push('All checks pass. Submit when you are happy with the code.');
  return [...new Set(steps)].slice(0, 3);
}
