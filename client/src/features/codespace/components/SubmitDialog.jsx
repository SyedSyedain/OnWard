import { Check, FileDiff, Loader2, TriangleAlert, X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { sessionsApi } from '../../../api/sessionsApi.js';

const STEPS = [
  { id: 'tests', label: 'Running the project tests and hidden checks' },
  { id: 'review', label: 'The AI reviewer is reading your change' },
];

/**
 * Submit for review: confirm the changed files, then run the tests and the review for real.
 * Each step is marked done only when its request returns.
 *
 * `prepare()` saves open files and resolves to the changed file list.
 */
export default function SubmitDialog({ sessionId, prepare, onTestResult, onReviewed, onClose }) {
  const [phase, setPhase] = useState('loading');
  const [changedFiles, setChangedFiles] = useState([]);
  const [done, setDone] = useState([]);
  const [error, setError] = useState(null);
  const dialogRef = useRef(null);

  useEffect(() => {
    let cancelled = false;
    prepare()
      .then((files) => {
        if (cancelled) return;
        setChangedFiles(files);
        setPhase('confirm');
      })
      .catch((prepareError) => {
        if (cancelled) return;
        setError(prepareError.message);
        setPhase('error');
      });
    return () => {
      cancelled = true;
    };
    // Prepares once when the dialog opens.
  }, []);

  useEffect(() => {
    dialogRef.current?.querySelector('[data-autofocus]')?.focus();
  }, [phase]);

  useEffect(() => {
    const handleKey = (event) => event.key === 'Escape' && phase !== 'running' && onClose();
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [phase, onClose]);

  async function submit() {
    setPhase('running');
    setDone([]);
    setError(null);
    try {
      const { testResult } = await sessionsApi.runTests(sessionId);
      onTestResult(testResult);
      setDone(['tests']);
      const { review } = await sessionsApi.requestReview(sessionId);
      setDone(['tests', 'review']);
      onReviewed(review);
    } catch (submitError) {
      setError(submitError.message);
      setPhase('error');
    }
  }

  const running = phase === 'running';

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-ink/40 p-4 animate-[fade-in_150ms_ease-out]">
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="submit-title"
        className="w-full max-w-md rounded-xl border border-line bg-paper-2 font-ui shadow-[0_24px_60px_-20px_oklch(18%_0.006_60/0.5)] animate-[rise-in_180ms_ease-out]"
      >
        <header className="flex items-center justify-between border-b border-line px-5 py-4">
          <h2 id="submit-title" className="font-display text-base font-semibold text-ink">
            {running ? 'Reviewing your work' : 'Request a code review'}
          </h2>
          {!running && (
            <button
              type="button"
              onClick={onClose}
              aria-label="Close"
              className="grid size-7 place-items-center rounded-md text-muted hover:bg-paper-3 hover:text-ink focus-visible:outline-2 focus-visible:outline-accent"
            >
              <X className="size-4" aria-hidden />
            </button>
          )}
        </header>

        <div className="px-5 py-4 text-sm text-ink-2">
          {phase === 'loading' && (
            <p className="flex items-center gap-2 text-muted">
              <Loader2 className="size-4 animate-spin" aria-hidden />
              Saving your files and collecting your changes…
            </p>
          )}

          {phase === 'confirm' && (
            <>
              <p>The reviewer will run every test and read these changes. You can keep working afterwards.</p>
              <h3 className="mb-1.5 mt-4 text-xs font-medium text-muted">Modified files ({changedFiles.length})</h3>
              {changedFiles.length ? (
                <ul className="divide-y divide-line rounded-lg border border-line bg-paper">
                  {changedFiles.map((file) => (
                    <li key={file} className="flex items-center gap-2 px-3 py-2 font-mono text-xs text-ink">
                      <FileDiff className="size-3.5 text-warn" aria-hidden />
                      {file}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="flex items-start gap-2 rounded-lg bg-warn-soft p-3 text-ink-2">
                  <TriangleAlert className="mt-0.5 size-4 shrink-0 text-warn" aria-hidden />
                  You have not changed any files yet. The review will say there is nothing to assess.
                </p>
              )}
            </>
          )}

          {running && (
            <ol className="space-y-3" aria-live="polite">
              {STEPS.map((step, index) => {
                const finished = done.includes(step.id);
                const active = !finished && done.length === index;
                return (
                  <li
                    key={step.id}
                    className={`flex items-center gap-3 ${finished || active ? 'text-ink' : 'text-faint'}`}
                  >
                    <span
                      className={`grid size-6 shrink-0 place-items-center rounded-full ${
                        finished ? 'bg-ok-soft text-ok' : active ? 'bg-accent-soft text-ink' : 'bg-paper-3'
                      }`}
                    >
                      {finished ? (
                        <Check className="size-3.5" aria-hidden />
                      ) : active ? (
                        <Loader2 className="size-3.5 animate-spin" aria-hidden />
                      ) : (
                        <span className="text-xs">{index + 1}</span>
                      )}
                    </span>
                    {step.label}
                  </li>
                );
              })}
              <li className="h-1 overflow-hidden rounded-full bg-paper-3" aria-hidden>
                <span
                  className="block h-full rounded-full bg-accent transition-[width] duration-500 ease-out"
                  style={{ width: `${15 + (done.length / STEPS.length) * 85}%` }}
                />
              </li>
            </ol>
          )}

          {phase === 'error' && (
            <p className="flex items-start gap-2 rounded-lg bg-bad-soft p-3 text-ink-2">
              <TriangleAlert className="mt-0.5 size-4 shrink-0 text-bad" aria-hidden />
              {error}
            </p>
          )}
        </div>

        {(phase === 'confirm' || phase === 'error') && (
          <footer className="flex justify-end gap-2 border-t border-line px-5 py-3">
            <button
              type="button"
              onClick={onClose}
              className="h-9 rounded-lg px-3 text-sm text-ink-2 hover:bg-paper-3 focus-visible:outline-2 focus-visible:outline-accent"
            >
              Keep working
            </button>
            <button
              type="button"
              data-autofocus
              onClick={submit}
              className="h-9 rounded-lg bg-accent px-4 text-sm font-medium text-ink hover:bg-accent-strong focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink"
            >
              {phase === 'error' ? 'Try again' : 'Request a code review'}
            </button>
          </footer>
        )}
      </div>
    </div>
  );
}
