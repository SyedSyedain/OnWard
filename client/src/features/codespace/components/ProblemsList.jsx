import { CircleAlert, TriangleAlert } from 'lucide-react';

/**
 * Errors and warnings: syntax problems the editor finds as you type,
 * plus syntax errors reported by the last test run. Clicking one jumps to it.
 */
export default function ProblemsList({ problems, onGoTo }) {
  if (problems.length === 0) {
    return <p className="p-4 font-ui text-sm text-muted">No problems found in your open files.</p>;
  }

  return (
    <ul className="py-1 font-ui text-[13px]">
      {problems.map((problem) => {
        const Icon = problem.severity === 'error' ? CircleAlert : TriangleAlert;
        return (
          <li key={problem.id}>
            <button
              type="button"
              onClick={() => onGoTo(problem.path, problem.line, problem.column)}
              className="flex w-full items-start gap-2 px-4 py-1.5 text-left hover:bg-paper-3/60 focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-accent"
            >
              <Icon
                className={`mt-0.5 size-4 shrink-0 ${problem.severity === 'error' ? 'text-bad' : 'text-warn'}`}
                aria-label={problem.severity}
              />
              <span className="min-w-0 flex-1 text-ink-2">{problem.message}</span>
              <span className="shrink-0 font-mono text-xs text-muted">
                {problem.path}
                {problem.line ? `:${problem.line}:${problem.column ?? 1}` : ''}
              </span>
              <span className="shrink-0 text-xs text-faint">{problem.source}</span>
            </button>
          </li>
        );
      })}
    </ul>
  );
}
