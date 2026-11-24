import { Award, ChevronDown, Download, RotateCcw } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link, Navigate, useParams } from 'react-router-dom';
import AppBar from '../../components/layout/AppBar.jsx';
import PageState from '../../components/ui/PageState.jsx';
import { useSession } from '../../hooks/useSession.js';
import { DIFFICULTY_LABELS } from '../../lib/constants.js';
import { pathForSession } from '../../lib/sessionRoutes.js';
import DiffView from './DiffView.jsx';
import TestResultsPanel from './TestResultsPanel.jsx';

const PARTS = [
  {
    key: 'correctness',
    label: 'Correctness',
    max: 60,
    explain: (session) =>
      session.result.testResult.allPassed
        ? 'Every acceptance check passed, so you earn the full 60. The checks are hidden tests: no person or AI decides this part.'
        : 'Some acceptance checks still fail, so this part is 0. An unresolved ticket can never score above 25 overall.',
  },
  {
    key: 'quality',
    label: 'Code quality',
    max: 25,
    explain: (session) =>
      session.result.review.generatedBy === 'gemini'
        ? 'The AI reviewer read your diff and rated how it is written: edge cases, reliability and maintainability.'
        : 'Rated by automatic checks on your diff: leftovers like debug output, the size of the change, whether it stays in the ticket’s files, and tests.',
  },
  {
    key: 'independence',
    label: 'Independence',
    max: 15,
    explain: (session) =>
      `You used ${session.hintLevel} of ${session.maxHintLevel} hints. Each hint lowers this part; asking questions does not.`,
  },
];

const TABS = [
  { id: 'review', label: 'Review' },
  { id: 'checks', label: 'Checks' },
  { id: 'changes', label: 'Your changes' },
];

const ASPECTS = [
  { key: 'edgeCases', label: 'Edge cases' },
  { key: 'reliability', label: 'Reliability' },
  { key: 'maintainability', label: 'Maintainability' },
];

/** The results of a submitted ticket: the score, how it was earned, the review, the checks and the diff. */
export default function ReviewPage() {
  const { sessionId } = useParams();
  const { session, error } = useSession(sessionId);
  const [tab, setTab] = useState('review');
  const [openPart, setOpenPart] = useState(null);

  if (!session) return <PageState error={error} />;
  if (session.status !== 'submitted') return <Navigate to={pathForSession(session)} replace />;

  const { score, review, testResult, diff, recordId } = session.result;
  const resolved = testResult.allPassed;

  return (
    <div className="min-h-screen bg-paper font-ui text-ink">
      <AppBar session={session} note="Results">
        <Link
          to="/?start"
          className="hidden h-9 items-center gap-1.5 rounded-md px-3 text-sm text-paper-2 hover:bg-ink-2 sm:flex focus-visible:outline-2 focus-visible:outline-accent"
        >
          <RotateCcw className="size-4" aria-hidden /> Another ticket
        </Link>
        <Link
          to={`/records/${recordId}`}
          className="flex h-9 items-center gap-2 rounded-md bg-accent px-3.5 text-sm font-medium text-ink hover:bg-accent-strong focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-paper-2"
        >
          <Award className="size-4" aria-hidden /> Work record
        </Link>
      </AppBar>

      <main className="mx-auto max-w-6xl px-4 pb-14 pt-8 sm:px-6 sm:pt-10">
        <section className="grid items-center gap-8 rounded-2xl border border-line bg-paper-2 p-6 sm:p-8 md:grid-cols-[auto_minmax(0,1fr)]">
          <ScoreRing total={score.total} resolved={resolved} />
          <div className="min-w-0">
            <div className="mb-2 flex flex-wrap items-center gap-1.5 text-xs">
              <span className="rounded-md bg-ink px-1.5 py-0.5 font-mono text-paper-2">{session.ticket.issueId}</span>
              <span className="rounded-md bg-paper-3 px-1.5 py-0.5 text-ink-2">{session.ticket.area}</span>
              <span className="rounded-md bg-accent-soft px-1.5 py-0.5">{DIFFICULTY_LABELS[session.ticket.difficulty]}</span>
              <span className={`rounded-md px-1.5 py-0.5 ${resolved ? 'bg-ok-soft text-ok' : 'bg-bad-soft text-bad'}`}>
                {resolved ? 'Resolved' : 'Not resolved'}
              </span>
            </div>
            <h1 className="font-display text-2xl font-semibold leading-tight tracking-tight sm:text-3xl">
              {gradeFor(score.total, resolved)}
            </h1>
            <p className="mt-1 max-w-[60ch] text-[15px] text-muted">{session.ticket.title}</p>
            <Stats session={session} />
            <button
              type="button"
              onClick={() => window.print()}
              className="mt-5 inline-flex items-center gap-1.5 rounded-md border border-line bg-paper px-3 py-1.5 text-sm text-ink-2 hover:border-ink-3 print:hidden focus-visible:outline-2 focus-visible:outline-accent"
            >
              <Download className="size-4" aria-hidden /> Save scorecard as PDF
            </button>
          </div>
        </section>

        <div className="mt-6 grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.5fr)]">
          <section className="rounded-2xl border border-line bg-paper-2 p-5 sm:p-6">
            <h2 className="mb-4 font-display text-lg font-semibold">Scorecard</h2>
            <ul className="space-y-2">
              {PARTS.map((part, index) => {
                const open = openPart === part.key;
                return (
                  <li key={part.key} className="rounded-xl border border-line bg-paper">
                    <button
                      type="button"
                      aria-expanded={open}
                      onClick={() => setOpenPart(open ? null : part.key)}
                      className="w-full rounded-xl px-4 py-3 text-left focus-visible:outline-2 focus-visible:outline-accent"
                    >
                      <span className="flex items-baseline justify-between gap-3 text-sm">
                        <span className="font-medium">{part.label}</span>
                        <span className="flex items-center gap-2 tabular-nums">
                          <span>
                            <strong className="text-base">{score[part.key]}</strong>
                            <span className="text-muted"> / {part.max}</span>
                          </span>
                          <ChevronDown
                            className={`size-4 text-muted transition-transform ${open ? 'rotate-180' : ''}`}
                            aria-hidden
                          />
                        </span>
                      </span>
                      <Bar value={score[part.key]} max={part.max} delay={index * 120} />
                    </button>
                    {open && (
                      <p className="animate-[fade-in_160ms_ease-out] px-4 pb-3 text-[13px] leading-relaxed text-muted">
                        {part.explain(session)}
                      </p>
                    )}
                  </li>
                );
              })}
            </ul>
            <p className="mt-4 flex items-baseline justify-between border-t border-line pt-3 text-sm">
              <span className="text-muted">Total</span>
              <span className="tabular-nums">
                <strong className="font-display text-xl">{score.total}</strong>
                <span className="text-muted"> / 100</span>
              </span>
            </p>
          </section>

          <section className="rounded-2xl border border-line bg-paper-2">
            <div role="tablist" aria-label="Result details" className="flex gap-1 border-b border-line px-3 pt-3 print:hidden">
              {TABS.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  role="tab"
                  aria-selected={tab === item.id}
                  onClick={() => setTab(item.id)}
                  className={`-mb-px rounded-t-lg border-b-2 px-3 py-2 text-sm transition-colors focus-visible:outline-2 focus-visible:outline-accent ${
                    tab === item.id ? 'border-accent font-medium text-ink' : 'border-transparent text-muted hover:text-ink'
                  }`}
                >
                  {item.label}
                  {item.id === 'checks' && (
                    <span className="ml-1.5 tabular-nums text-xs text-muted">
                      {testResult.passedCount}/{testResult.totalCount}
                    </span>
                  )}
                  {item.id === 'changes' && (
                    <span className="ml-1.5 tabular-nums text-xs text-muted">{diff.changedFiles.length}</span>
                  )}
                </button>
              ))}
            </div>
            <div role="tabpanel" className="animate-[fade-in_160ms_ease-out] p-5 sm:p-6" key={tab}>
              {tab === 'review' && <ReviewTab review={review} />}
              {tab === 'checks' && <TestResultsPanel testResult={testResult} />}
              {tab === 'changes' && <DiffView patch={diff.patch} />}
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}

function ScoreRing({ total, resolved }) {
  const [shown, setShown] = useState(0);
  const radius = 54;
  const circumference = 2 * Math.PI * radius;

  // Count up once on arrival; reduced-motion users get the final number at once.
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setShown(total);
      return undefined;
    }
    const started = performance.now();
    let frame;
    const tick = (now) => {
      const progress = Math.min(1, (now - started) / 900);
      setShown(Math.round(total * (1 - (1 - progress) ** 3)));
      if (progress < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [total]);

  return (
    <div className="relative mx-auto size-36 shrink-0" role="img" aria-label={`Score ${total} out of 100`}>
      <svg viewBox="0 0 128 128" className="size-full -rotate-90">
        <circle cx="64" cy="64" r={radius} fill="none" strokeWidth="10" className="stroke-paper-3" />
        <circle
          cx="64"
          cy="64"
          r={radius}
          fill="none"
          strokeWidth="10"
          strokeLinecap="round"
          className={resolved ? 'stroke-accent' : 'stroke-bad'}
          strokeDasharray={circumference}
          strokeDashoffset={circumference * (1 - shown / 100)}
        />
      </svg>
      <span className="absolute inset-0 grid place-items-center">
        <span className="text-center leading-none">
          <span className="block font-display text-4xl font-semibold tabular-nums">{shown}</span>
          <span className="text-xs text-muted">out of 100</span>
        </span>
      </span>
    </div>
  );
}

function Bar({ value, max, delay }) {
  const [width, setWidth] = useState(0);
  useEffect(() => {
    const timer = setTimeout(() => setWidth((value / max) * 100), 80 + delay);
    return () => clearTimeout(timer);
  }, [value, max, delay]);

  return (
    <span className="mt-2 block h-1.5 overflow-hidden rounded-full bg-paper-3">
      <span
        className="block h-full origin-left rounded-full bg-accent transition-transform duration-700 ease-out"
        style={{ transform: `scaleX(${width / 100})` }}
      />
    </span>
  );
}

function Stats({ session }) {
  const minutes =
    session.startedAt && session.submittedAt
      ? Math.max(1, Math.round((new Date(session.submittedAt) - new Date(session.startedAt)) / 60000))
      : null;
  const questions =
    session.managerMessages.filter((message) => message.author === 'student').length +
    session.teammateMessages.filter((message) => message.author === 'student').length;

  const facts = [
    { label: 'Time spent', value: minutes ? `${minutes} min` : '–' },
    { label: 'Test runs', value: session.testRuns.length },
    { label: 'Questions asked', value: questions },
    { label: 'Hints used', value: `${session.hintLevel} of ${session.maxHintLevel}` },
    { label: 'Reviews requested', value: session.reviews?.length ?? 0 },
  ];

  return (
    <dl className="mt-5 grid grid-cols-2 gap-x-6 gap-y-3 sm:grid-cols-5">
      {facts.map((fact) => (
        <div key={fact.label}>
          <dt className="text-xs text-muted">{fact.label}</dt>
          <dd className="font-display text-lg font-semibold tabular-nums">{fact.value}</dd>
        </div>
      ))}
    </dl>
  );
}

function ReviewTab({ review }) {
  return (
    <div className="space-y-6 text-[14.5px] leading-relaxed text-ink-2">
      <div>
        <p className="mb-1 text-xs text-muted">
          {review.generatedBy === 'gemini' ? 'AI reviewer' : 'Automatic review checks'}
        </p>
        <p>{review.summary}</p>
      </div>

      {review.aspects && (
        <dl className="grid gap-3 sm:grid-cols-3">
          {ASPECTS.map(({ key, label }) => (
            <div key={key} className="rounded-xl border border-line bg-paper p-3">
              <dt className="flex items-center justify-between text-sm font-medium text-ink">
                {label}
                <span className="flex gap-0.5" aria-label={`${review.aspects[key].rating} out of 5`}>
                  {[1, 2, 3, 4, 5].map((step) => (
                    <span
                      key={step}
                      className={`h-1.5 w-3 rounded-sm ${step <= review.aspects[key].rating ? 'bg-accent' : 'bg-paper-3'}`}
                    />
                  ))}
                </span>
              </dt>
              <dd className="mt-1.5 text-[13px] text-muted">{review.aspects[key].note}</dd>
            </div>
          ))}
        </dl>
      )}

      <ReviewList title="What went well" tone="ok" items={review.strengths} />
      <ReviewList title="What to improve" tone="warn" items={review.improvements} />
    </div>
  );
}

function ReviewList({ title, tone, items }) {
  if (items.length === 0) return null;
  return (
    <section>
      <h3 className="mb-2 text-sm font-medium text-ink">{title}</h3>
      <ul className="space-y-2">
        {items.map((item) => (
          <li key={item} className="flex gap-2.5">
            <span className={`mt-2 size-1.5 shrink-0 rounded-full ${tone === 'ok' ? 'bg-ok' : 'bg-warn'}`} aria-hidden />
            {item}
          </li>
        ))}
      </ul>
    </section>
  );
}

function gradeFor(total, resolved) {
  if (!resolved) return 'Not resolved yet';
  if (total >= 90) return 'Excellent work';
  if (total >= 75) return 'Strong work';
  if (total >= 60) return 'Resolved';
  return 'Resolved, with help';
}
