import { CheckCircle2, FileCode2, FlaskConical, Send, Wand2 } from 'lucide-react';
import { useState } from 'react';
import { sessionsApi } from '../../../api/sessionsApi.js';

/**
 * Demo mode only: loads the ticket's predefined fix so a presenter can show the evaluation.
 * Run the tests first (the hidden checks fail), apply the fix, run them again, then submit.
 */
export default function SolutionPanel({ sessionId, onApply, onRunTests, onSubmit, testing }) {
  const [state, setState] = useState({ phase: 'idle', files: [], error: null });

  async function apply() {
    setState({ phase: 'loading', files: [], error: null });
    try {
      const { files } = await sessionsApi.getSolution(sessionId);
      for (const file of files) {
        await onApply(file.path, file.content);
      }
      setState({ phase: 'applied', files, error: null });
    } catch (error) {
      setState({ phase: 'idle', files: [], error });
    }
  }

  const applied = state.phase === 'applied';

  return (
    <div className="flex flex-col gap-4 p-3 font-ui text-[13px] text-ink-2">
      <p className="rounded-md bg-accent-soft px-2.5 py-2 text-xs text-ink">
        Demo mode. This panel shows how the evaluation reacts to a correct fix. Students never see it.
      </p>

      <ol className="flex flex-col gap-3">
        <Step number="1" done={false} title="Run the tests on the original code">
          The ticket’s hidden checks fail, because the bug is still there.
          <ActionButton onClick={onRunTests} disabled={testing} icon={FlaskConical}>
            {testing ? 'Running…' : 'Run tests'}
          </ActionButton>
        </Step>

        <Step number="2" done={applied} title="Apply the predefined solution">
          Writes the fixed files into this workspace, as if a student had typed them.
          <ActionButton onClick={apply} disabled={state.phase === 'loading'} icon={Wand2} primary>
            {state.phase === 'loading' ? 'Applying…' : applied ? 'Apply again' : 'Apply solution'}
          </ActionButton>
          {state.error && (
            <span role="alert" className="mt-1 block text-xs text-bad">
              {state.error.message}
            </span>
          )}
          {applied && (
            <ul className="mt-2 flex flex-col gap-1">
              {state.files.map((file) => (
                <li key={file.path} className="flex items-center gap-1.5 text-xs text-muted">
                  <FileCode2 className="size-3.5 shrink-0" aria-hidden />
                  <span className="truncate">{file.path}</span>
                </li>
              ))}
            </ul>
          )}
        </Step>

        <Step number="3" done={false} title="Run the tests again">
          Every test and hidden check should now pass.
          <ActionButton onClick={onRunTests} disabled={testing || !applied} icon={FlaskConical}>
            {testing ? 'Running…' : 'Run tests'}
          </ActionButton>
        </Step>

        <Step number="4" done={false} title="Submit for the scorecard">
          The review scores correctness, code quality and independence, then signs the work record.
          <ActionButton onClick={onSubmit} disabled={!applied} icon={Send}>
            Submit for review
          </ActionButton>
        </Step>
      </ol>
    </div>
  );
}

function Step({ number, done, title, children }) {
  return (
    <li className="flex gap-2.5">
      <span
        className={`mt-0.5 grid size-5 shrink-0 place-items-center rounded-full text-[11px] font-semibold ${
          done ? 'bg-ok text-paper-2' : 'bg-paper-3 text-ink'
        }`}
        aria-hidden
      >
        {done ? <CheckCircle2 className="size-3.5" /> : number}
      </span>
      <div className="min-w-0">
        <p className="font-medium text-ink">{title}</p>
        <div className="mt-0.5 text-xs leading-relaxed text-muted">{children}</div>
      </div>
    </li>
  );
}

function ActionButton({ icon: Icon, primary, children, ...props }) {
  return (
    <button
      type="button"
      className={`mt-2 flex h-8 items-center gap-1.5 rounded-md px-3 text-xs font-medium transition-colors disabled:opacity-40 focus-visible:outline-2 focus-visible:outline-accent ${
        primary ? 'bg-accent text-white hover:bg-accent-strong' : 'border border-line text-ink hover:bg-paper-3'
      }`}
      {...props}
    >
      <Icon className="size-3.5" aria-hidden />
      {children}
    </button>
  );
}
