import { ArrowLeft, CheckCircle2, CircleDashed, Flag, Loader2, XCircle } from 'lucide-react';
import { useState } from 'react';
import Avatar from './Avatar.jsx';

const ASPECTS = [
  { id: 'edgeCases', label: 'Edge cases' },
  { id: 'reliability', label: 'Reliability' },
  { id: 'maintainability', label: 'Maintainability' },
];

/**
 * The AI reviewer's verdict on one review attempt. Task completion and test results
 * come from the real test run; quality and the three aspects come from the reviewer.
 * From here the student either goes back to improve the work or finishes the simulation.
 */
export default function ReviewView({ review, attempt, onBack, onFinish }) {
  const [confirmingFinish, setConfirmingFinish] = useState(false);
  const [finishing, setFinishing] = useState(false);
  const [error, setError] = useState(null);
  const { testResult, review: verdict, changedFiles } = review;
  const resolved = testResult.allPassed;
  const failedChecks = testResult.tests.filter((test) => test.kind === 'acceptance' && !test.passed);
  const live = verdict.generatedBy === 'gemini';

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
    <div className="absolute inset-0 z-30 overflow-y-auto bg-paper font-ui animate-[fade-in_180ms_ease-out]">
      <div className="mx-auto max-w-4xl px-4 pb-16 pt-6 sm:px-8">
        <button
          type="button"
          onClick={onBack}
          className="mb-6 inline-flex items-center gap-1.5 rounded-md px-1.5 py-1 text-sm text-muted hover:bg-paper-3 hover:text-ink focus-visible:outline-2 focus-visible:outline-accent"
        >
          <ArrowLeft className="size-4" aria-hidden />
          Back to the Codespace
        </button>

        <header className="flex flex-wrap items-start gap-4">
          <Avatar id="reviewer" name="Reviewer" />
          <div className="min-w-0 flex-1">
            <p className="text-xs text-muted">
              AI Reviewer · review {attempt} ·{' '}
              {new Date(review.reviewedAt).toLocaleTimeString([], { timeStyle: 'short' })}
              {!live && ' · template review (live AI is not configured)'}
            </p>
            <h1 className="mt-1 font-display text-2xl font-semibold tracking-tight text-ink">
              {resolved ? 'Ready to ship' : 'Not resolved yet'}
            </h1>
            <p className="mt-2 max-w-2xl text-[15px] leading-relaxed text-ink-2">{verdict.summary}</p>
          </div>
          <span
            className={`inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-sm font-medium ${
              resolved ? 'bg-ok-soft text-ok' : 'bg-bad-soft text-bad'
            }`}
          >
            {resolved ? <CheckCircle2 className="size-4" aria-hidden /> : <XCircle className="size-4" aria-hidden />}
            {resolved ? 'All checks pass' : 'Changes requested'}
          </span>
        </header>

        <section aria-label="Scorecard" className="mt-8 grid grid-cols-2 gap-3 md:grid-cols-3">
          <Metric
            label="Task completion"
            value={`${testResult.acceptancePassed}/${testResult.acceptanceTotal}`}
            note="Acceptance checks passed"
            tone={
              testResult.acceptancePassed === testResult.acceptanceTotal && testResult.acceptanceTotal > 0
                ? 'ok'
                : 'bad'
            }
          />
          <Metric
            label="Test results"
            value={`${testResult.passedCount}/${testResult.totalCount}`}
            note="All tests, including existing ones"
            tone={resolved ? 'ok' : 'bad'}
          />
          <Metric
            label="Code quality"
            value={`${verdict.qualityScore}/25`}
            note={live ? 'Scored by the reviewer' : 'Template estimate'}
            tone={verdict.qualityScore >= 18 ? 'ok' : verdict.qualityScore >= 10 ? 'neutral' : 'bad'}
          />
          {ASPECTS.map((aspect) => {
            const rating = verdict.aspects?.[aspect.id];
            return rating ? (
              <Metric
                key={aspect.id}
                label={aspect.label}
                value={`${rating.rating}/5`}
                note={rating.note}
                tone={rating.rating >= 4 ? 'ok' : rating.rating >= 3 ? 'neutral' : 'bad'}
              />
            ) : (
              <Metric
                key={aspect.id}
                label={aspect.label}
                value="Not rated"
                note="Needs the live AI reviewer"
                tone="none"
              />
            );
          })}
        </section>

        <div className="mt-8 grid gap-6 md:grid-cols-2">
          <List title="What you did well" items={verdict.strengths} empty="Nothing to highlight yet." icon="ok" />
          <List title="What needs improvement" items={verdict.improvements} empty="Nothing important." icon="bad" />
          <List
            title="Failed acceptance criteria"
            items={failedChecks.map((test) => test.name)}
            empty={testResult.acceptanceTotal ? 'Every acceptance check passed.' : 'The checks did not run.'}
            icon="bad"
          />
          <List
            title="Suggested next steps"
            items={nextSteps({ testResult, changedFiles, verdict })}
            icon="step"
            ordered
          />
        </div>

        <p className="mt-6 text-xs text-muted">
          Reviewed {changedFiles.length} changed file{changedFiles.length === 1 ? '' : 's'}
          {changedFiles.length ? `: ${changedFiles.join(', ')}` : ''}.
        </p>

        <footer className="mt-10 flex flex-wrap items-center gap-3 border-t border-line pt-6">
          <button
            type="button"
            onClick={onBack}
            className="h-10 rounded-lg bg-ink px-4 text-sm font-medium text-paper-2 hover:bg-ink-2 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
          >
            {resolved ? 'Keep improving' : 'Return and improve'}
          </button>
          {confirmingFinish ? (
            <span className="flex flex-wrap items-center gap-2 text-sm text-ink-2">
              {resolved
                ? 'Finish and issue your signed work record?'
                : 'Your record will show this ticket as not resolved. Finish anyway?'}
              <button
                type="button"
                onClick={finish}
                disabled={finishing}
                className="inline-flex h-10 items-center gap-2 rounded-lg bg-accent px-4 font-medium text-ink hover:bg-accent-strong disabled:opacity-60 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink"
              >
                {finishing && <Loader2 className="size-4 animate-spin" aria-hidden />}
                Yes, finish
              </button>
              <button
                type="button"
                onClick={() => setConfirmingFinish(false)}
                disabled={finishing}
                className="h-10 rounded-lg px-3 text-muted hover:bg-paper-3 focus-visible:outline-2 focus-visible:outline-accent"
              >
                Cancel
              </button>
            </span>
          ) : (
            <button
              type="button"
              onClick={() => setConfirmingFinish(true)}
              className="inline-flex h-10 items-center gap-2 rounded-lg border border-line bg-paper-2 px-4 text-sm font-medium text-ink hover:border-ink-3 focus-visible:outline-2 focus-visible:outline-accent"
            >
              <Flag className="size-4" aria-hidden />
              Finish the simulation
            </button>
          )}
          {error && <p className="w-full text-sm text-bad">{error}</p>}
        </footer>
      </div>
    </div>
  );
}

const METRIC_TONES = {
  ok: 'text-ok',
  bad: 'text-bad',
  neutral: 'text-ink',
  none: 'text-faint',
};

function Metric({ label, value, note, tone }) {
  return (
    <div className="rounded-xl border border-line bg-paper-2 p-4">
      <p className="text-xs text-muted">{label}</p>
      <p className={`mt-1 font-display text-xl font-semibold tabular-nums ${METRIC_TONES[tone]}`}>{value}</p>
      <p className="mt-1 text-xs leading-snug text-muted">{note}</p>
    </div>
  );
}

function List({ title, items, empty, icon, ordered }) {
  const Tag = ordered ? 'ol' : 'ul';
  return (
    <section>
      <h2 className="mb-2 text-sm font-medium text-ink">{title}</h2>
      {items.length === 0 ? (
        <p className="text-sm text-muted">{empty}</p>
      ) : (
        <Tag className="space-y-2">
          {items.map((item, index) => (
            <li key={item} className="flex gap-2 text-sm leading-relaxed text-ink-2">
              {icon === 'ok' && <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-ok" aria-hidden />}
              {icon === 'bad' && <CircleDashed className="mt-0.5 size-4 shrink-0 text-bad" aria-hidden />}
              {icon === 'step' && <span className="mt-px w-4 shrink-0 font-mono text-xs text-muted">{index + 1}.</span>}
              <span>{item}</span>
            </li>
          ))}
        </Tag>
      )}
    </section>
  );
}

/** Next steps follow from the real results, most urgent first. */
function nextSteps({ testResult, changedFiles, verdict }) {
  const steps = [];
  if (changedFiles.length === 0) steps.push('Make a change that addresses the ticket, then submit again.');
  if (testResult.status === 'syntax_error') {
    steps.push(
      `Fix the syntax error in ${testResult.syntaxErrors[0]?.file ?? 'your code'} first: nothing else can run.`,
    );
  }
  const failingAcceptance = testResult.tests.filter((test) => test.kind === 'acceptance' && !test.passed).length;
  const failingProject = testResult.tests.filter((test) => test.kind === 'project' && !test.passed).length;
  if (failingAcceptance) {
    steps.push('Work through the failing acceptance checks one at a time, running the tests after each change.');
    steps.push('Ask Sarah which edge case a failing check is testing.');
  }
  if (failingProject)
    steps.push('Some existing tests broke. Make sure your change does not alter behaviour outside the ticket.');
  // The reviewer's first suggestion, unless failing checks already set the priority.
  if (verdict.improvements[0] && !failingAcceptance) steps.push(verdict.improvements[0]);
  if (testResult.allPassed) {
    steps.push('Consider a test of your own for the case you fixed.');
    steps.push('Finish the simulation to receive your signed work record.');
  }
  return [...new Set(steps)].slice(0, 5);
}
