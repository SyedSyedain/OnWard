import { CheckCircle2, CircleAlert, MessageCircleQuestion, XCircle } from 'lucide-react';

const STATUS_MESSAGES = {
  syntax_error: 'A file has a syntax error, so the tests could not run.',
  timed_out: 'The tests took too long and were stopped. Look for a loop that never ends.',
  load_error: 'The tests could not load your code. Check your imports and exports.',
};

/**
 * Results of the latest real test run: project tests (existing behaviour) and the
 * ticket's acceptance checks (hidden tests, reported by name only).
 */
export default function TestResults({ result, source, running, onRun, onAskAboutCheck }) {
  if (running) {
    return <p className="p-4 font-ui text-sm text-muted">Running the project tests and the hidden checks…</p>;
  }
  if (!result) {
    return (
      <div className="flex flex-wrap items-center gap-3 p-4 font-ui text-sm text-muted">
        No test run yet.
        <button
          type="button"
          onClick={onRun}
          className="rounded-md border border-line bg-paper-2 px-2.5 py-1 text-ink hover:border-ink-3 focus-visible:outline-2 focus-visible:outline-accent"
        >
          Run tests
        </button>
      </div>
    );
  }

  const acceptance = result.tests.filter((test) => test.kind === 'acceptance');
  const project = result.tests.filter((test) => test.kind === 'project');

  return (
    <div className="space-y-4 p-4 font-ui text-sm">
      <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
        <span
          className={`inline-flex items-center gap-1.5 rounded-md px-2 py-0.5 text-xs font-medium ${
            result.allPassed ? 'bg-ok-soft text-ok' : 'bg-bad-soft text-bad'
          }`}
        >
          {result.allPassed ? 'All passing' : 'Failing'}
        </span>
        <span className="text-ink">
          {result.passedCount} of {result.totalCount} tests passed
        </span>
        <span className="text-muted">
          {result.acceptancePassed} of {result.acceptanceTotal} acceptance checks
        </span>
        {source && <span className="text-xs text-faint">{source}</span>}
      </div>

      {STATUS_MESSAGES[result.status] && (
        <div className="flex gap-2 rounded-lg bg-warn-soft p-3 text-ink-2">
          <CircleAlert className="mt-0.5 size-4 shrink-0 text-warn" aria-hidden />
          <div>
            <p>{STATUS_MESSAGES[result.status]}</p>
            {result.syntaxErrors.map((error) => (
              <p key={error.file} className="mt-1 font-mono text-xs">
                {error.file}: {error.message}
              </p>
            ))}
          </div>
        </div>
      )}

      <TestGroup
        title="Acceptance checks"
        note="Hidden tests from the ticket. Only their names and results are shown."
        tests={acceptance}
        onAsk={onAskAboutCheck}
      />
      <TestGroup title="Project tests" note="Existing behaviour that must keep working." tests={project} />
    </div>
  );
}

function TestGroup({ title, note, tests, onAsk }) {
  if (tests.length === 0) return null;
  return (
    <section>
      <h3 className="text-xs font-medium text-ink">{title}</h3>
      <p className="mb-1.5 text-xs text-faint">{note}</p>
      <ul className="divide-y divide-line/70 rounded-lg border border-line bg-paper-2">
        {tests.map((test) => (
          <li key={test.name} className="flex items-start gap-2 px-3 py-2 text-ink-2">
            {test.passed ? (
              <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-ok" aria-label="Passed" />
            ) : (
              <XCircle className="mt-0.5 size-4 shrink-0 text-bad" aria-label="Failed" />
            )}
            <span className="min-w-0 flex-1">{test.name}</span>
            {!test.passed && onAsk && (
              <button
                type="button"
                onClick={() => onAsk(test.name)}
                className="inline-flex shrink-0 items-center gap-1 rounded-md px-1.5 py-0.5 text-xs text-muted hover:bg-paper-3 hover:text-ink focus-visible:outline-2 focus-visible:outline-accent"
              >
                <MessageCircleQuestion className="size-3.5" aria-hidden />
                Ask Sarah
              </button>
            )}
          </li>
        ))}
      </ul>
    </section>
  );
}
