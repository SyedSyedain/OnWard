import { CheckCircle2, CircleAlert, XCircle } from 'lucide-react';
import Badge from '../../components/ui/Badge.jsx';

const STATUS_MESSAGES = {
  syntax_error: 'Your code has a syntax error, so the tests could not run.',
  timed_out: 'The tests took too long and were stopped. Look for an infinite loop.',
  load_error: 'The tests could not load your code. Check your imports and exports.',
};

export default function TestResultsPanel({ testResult }) {
  if (!testResult) {
    return (
      <p className="text-sm text-slate-500">
        Run the tests to check your work. Project tests protect existing behaviour; acceptance checks come from the
        ticket and decide whether it is resolved.
      </p>
    );
  }

  const acceptance = testResult.tests.filter((test) => test.kind === 'acceptance');
  const project = testResult.tests.filter((test) => test.kind === 'project');

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-slate-900">
          {testResult.passedCount} of {testResult.totalCount} passing
        </p>
        <Badge tone={testResult.allPassed ? 'green' : 'red'}>{testResult.allPassed ? 'All passing' : 'Failing'}</Badge>
      </div>

      {STATUS_MESSAGES[testResult.status] && (
        <div className="flex gap-2 rounded-lg bg-amber-50 p-3 text-sm text-amber-900">
          <CircleAlert className="mt-0.5 size-4 shrink-0" aria-hidden />
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

      <TestGroup title="Acceptance checks" tests={acceptance} />
      <TestGroup title="Project tests" tests={project} />
    </div>
  );
}

function TestGroup({ title, tests }) {
  if (tests.length === 0) return null;
  return (
    <section>
      <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">{title}</h3>
      <ul className="space-y-1.5">
        {tests.map((test) => (
          <li key={test.name} className="flex items-start gap-2 text-sm text-slate-700">
            {test.passed ? (
              <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-emerald-600" aria-label="Passed" />
            ) : (
              <XCircle className="mt-0.5 size-4 shrink-0 text-rose-600" aria-label="Failed" />
            )}
            {test.name}
          </li>
        ))}
      </ul>
    </section>
  );
}
