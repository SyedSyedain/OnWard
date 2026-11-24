import { CheckCircle2, CircleAlert, XCircle } from 'lucide-react';
import { useState } from 'react';

const STATUS_MESSAGES = {
  syntax_error: 'Your code has a syntax error, so the tests could not run.',
  timed_out: 'The tests took too long and were stopped. Look for an infinite loop.',
  load_error: 'The tests could not load your code. Check your imports and exports.',
};

/** The acceptance checks and project tests of one run, with a filter for the failing ones. */
export default function TestResultsPanel({ testResult }) {
  const [failingOnly, setFailingOnly] = useState(false);

  if (!testResult) {
    return <p className="text-sm text-muted">Run the tests to check your work.</p>;
  }

  const visible = testResult.tests.filter((test) => !failingOnly || !test.passed);
  const acceptance = visible.filter((test) => test.kind === 'acceptance');
  const project = visible.filter((test) => test.kind === 'project');
  const failing = testResult.tests.filter((test) => !test.passed).length;

  return (
    <div className="space-y-5 font-ui">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm">
          <strong className="font-display text-lg">{testResult.passedCount}</strong>
          <span className="text-muted"> of {testResult.totalCount} passing</span>
        </p>
        {failing > 0 && (
          <label className="flex items-center gap-2 text-xs text-muted">
            <input
              type="checkbox"
              checked={failingOnly}
              onChange={(event) => setFailingOnly(event.target.checked)}
              className="accent-accent"
            />
            Show failing only ({failing})
          </label>
        )}
      </div>

      {STATUS_MESSAGES[testResult.status] && (
        <div className="flex gap-2 rounded-lg bg-warn-soft p-3 text-sm text-ink-2">
          <CircleAlert className="mt-0.5 size-4 shrink-0 text-warn" aria-hidden />
          <div>
            <p>{STATUS_MESSAGES[testResult.status]}</p>
            {testResult.syntaxErrors.map((syntaxError) => (
              <p key={syntaxError.file} className="mt-1 font-mono text-xs">
                {syntaxError.message}
              </p>
            ))}
          </div>
        </div>
      )}

      <TestGroup
        title="Acceptance checks"
        note="From the ticket. These decide whether it is resolved."
        tests={acceptance}
      />
      <TestGroup title="Project tests" note="Existing behaviour that must keep working." tests={project} />
    </div>
  );
}

function TestGroup({ title, note, tests }) {
  if (tests.length === 0) return null;
  return (
    <section>
      <h3 className="text-sm font-medium text-ink">{title}</h3>
      <p className="mb-2 text-xs text-muted">{note}</p>
      <ul className="divide-y divide-line overflow-hidden rounded-xl border border-line bg-paper">
        {tests.map((test) => (
          <li key={test.name} className="flex items-start gap-2.5 px-3 py-2 text-[13.5px] text-ink-2">
            {test.passed ? (
              <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-ok" aria-label="Passed" />
            ) : (
              <XCircle className="mt-0.5 size-4 shrink-0 text-bad" aria-label="Failed" />
            )}
            {test.name}
          </li>
        ))}
      </ul>
    </section>
  );
}
