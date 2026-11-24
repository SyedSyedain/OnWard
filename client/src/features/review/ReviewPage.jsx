import {
  Award,
  CheckCircle2,
  Clock,
  Download,
  FlaskConical,
  Lightbulb,
  ListChecks,
  MessageSquare,
  RotateCcw,
  ThumbsUp,
  TrendingUp,
  XCircle,
} from 'lucide-react';
import { useState } from 'react';
import { Link, Navigate, useParams } from 'react-router-dom';
import AppBar from '../../components/layout/AppBar.jsx';
import { ScoreRing, ScoreSplit, SkillRadar, Stat, gradeFor } from '../../components/score/ScoreVisuals.jsx';
import PageState from '../../components/ui/PageState.jsx';
import { useSession } from '../../hooks/useSession.js';
import { DIFFICULTY_LABELS } from '../../lib/constants.js';
import { pathForSession } from '../../lib/sessionRoutes.js';
import DetailsDrawer from './DetailsDrawer.jsx';

const barButton =
  'flex h-9 items-center gap-1.5 rounded-md px-3 text-sm text-paper-2 hover:bg-ink-2 focus-visible:outline-2 focus-visible:outline-accent';

/** The results of a submitted ticket on one screen: the score, how it splits, the skills, the checks and the review. */
export default function ReviewPage() {
  const { sessionId } = useParams();
  const { session, error } = useSession(sessionId);
  const [detailsOpen, setDetailsOpen] = useState(false);

  if (!session) return <PageState error={error} />;
  if (session.status !== 'submitted') return <Navigate to={pathForSession(session)} replace />;

  const { score, review, testResult, diff, recordId } = session.result;
  const resolved = testResult.allPassed;
  const acceptance = testResult.tests.filter((test) => test.kind === 'acceptance');
  const project = testResult.tests.filter((test) => test.kind === 'project');

  return (
    <div className="min-h-dvh bg-paper font-ui text-ink lg:flex lg:h-dvh lg:flex-col">
      <AppBar session={session}>
        <button type="button" onClick={() => window.print()} className={barButton} aria-label="Save scorecard as PDF">
          <Download className="size-4" aria-hidden /> <span className="hidden md:inline">PDF</span>
        </button>
        <Link to="/?start" className={`${barButton} hidden sm:flex`}>
          <RotateCcw className="size-4" aria-hidden /> Another ticket
        </Link>
        <Link
          to={`/records/${recordId}`}
          className="flex h-9 items-center gap-2 rounded-md bg-accent px-3.5 text-sm font-medium text-ink hover:bg-accent-strong focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-paper-2"
        >
          <Award className="size-4" aria-hidden /> Work record
        </Link>
      </AppBar>

      <main className="mx-auto grid w-full max-w-6xl gap-4 px-4 py-5 sm:px-6 lg:min-h-0 lg:flex-1 lg:grid-cols-[340px_minmax(0,1fr)]">
        <section className="flex flex-col items-center rounded-2xl border border-line bg-paper-2 p-6 text-center">
          <div className="flex flex-wrap justify-center gap-1.5 text-xs">
            <span className="rounded-md bg-ink px-1.5 py-0.5 font-mono text-paper-2">{session.ticket.issueId}</span>
            <span className="rounded-md bg-accent-soft px-1.5 py-0.5">{DIFFICULTY_LABELS[session.ticket.difficulty]}</span>
            <span className={`rounded-md px-1.5 py-0.5 ${resolved ? 'bg-ok-soft text-ok' : 'bg-bad-soft text-bad'}`}>
              {resolved ? 'Resolved' : 'Not resolved'}
            </span>
          </div>
          <div className="my-auto py-5">
            <ScoreRing total={score.total} resolved={resolved} />
          </div>
          <h1 className="font-display text-3xl font-semibold tracking-tight">{gradeFor(score.total, resolved)}</h1>
          <p className="mt-1 line-clamp-2 text-sm text-muted">{session.ticket.title}</p>
          <div className="mt-6 w-full text-left">
            <ScoreSplit score={score} />
          </div>
        </section>

        <div className="grid min-h-0 gap-4 lg:grid-rows-[auto_minmax(0,1fr)_auto]">
          <dl className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <Stat icon={Clock} label="Minutes" value={minutesSpent(session)} />
            <Stat icon={FlaskConical} label="Test runs" value={session.testRuns.length} />
            <Stat icon={MessageSquare} label="Questions" value={questionsAsked(session)} />
            <Stat icon={Lightbulb} label="Hints" value={`${session.hintLevel}/${session.maxHintLevel}`} />
          </dl>

          <div className="grid min-h-0 gap-4 md:grid-cols-2">
            <Panel title="Skills">
              <div className="relative min-h-0 flex-1 [&>svg]:absolute [&>svg]:inset-0">
                <SkillRadar score={score} aspects={review.aspects} />
              </div>
            </Panel>

            <Panel
              title="Acceptance checks"
              aside={`${testResult.acceptancePassed}/${testResult.acceptanceTotal}`}
              action={
                <button
                  type="button"
                  onClick={() => setDetailsOpen(true)}
                  className="flex items-center gap-1 rounded-md px-1.5 py-0.5 text-xs text-muted hover:bg-paper-3 hover:text-ink focus-visible:outline-2 focus-visible:outline-accent"
                >
                  <ListChecks className="size-3.5" aria-hidden /> All checks and code
                </button>
              }
            >
              <div className="mb-4 flex items-end gap-3">
                <p className="font-display text-4xl font-semibold leading-none tabular-nums">
                  {testResult.passedCount}
                  <span className="text-xl font-normal text-faint">/{testResult.totalCount}</span>
                </p>
                <p className="pb-0.5 text-sm text-muted">tests passing</p>
              </div>
              <span className="mb-4 flex h-2 overflow-hidden rounded-full bg-bad-soft" aria-hidden>
                <span
                  className="h-full rounded-full bg-ok"
                  style={{ width: `${(testResult.passedCount / Math.max(1, testResult.totalCount)) * 100}%` }}
                />
              </span>
              <ul className="min-h-0 flex-1 space-y-2 overflow-y-auto">
                {acceptance.map((test) => (
                  <Check key={test.name} test={test} />
                ))}
              </ul>
              <p className="mt-3 flex items-center gap-2 border-t border-line pt-3 text-sm text-muted">
                {project.every((test) => test.passed) ? (
                  <CheckCircle2 className="size-4 text-ok" aria-hidden />
                ) : (
                  <XCircle className="size-4 text-bad" aria-hidden />
                )}
                Existing tests {project.filter((test) => test.passed).length}/{project.length}
                <span className="ml-auto">
                  {diff.changedFiles.length} {diff.changedFiles.length === 1 ? 'file' : 'files'} changed
                </span>
              </p>
            </Panel>
          </div>

          <section className="rounded-2xl border border-line bg-paper-2 p-4">
            <p className="line-clamp-2 text-[14.5px] leading-snug text-ink-2">
              <span className="mr-2 rounded bg-paper-3 px-1.5 py-0.5 text-[11px] text-muted">
                {review.generatedBy === 'gemini' ? 'AI review' : 'Auto review'}
              </span>
              {review.summary}
            </p>
            {(review.strengths[0] || review.improvements[0]) && (
              <div className="mt-3 grid gap-2 text-[13px] sm:grid-cols-2">
                {review.strengths[0] && <Note icon={ThumbsUp} tone="ok" text={review.strengths[0]} />}
                {review.improvements[0] && <Note icon={TrendingUp} tone="warn" text={review.improvements[0]} />}
              </div>
            )}
          </section>
        </div>
      </main>

      <DetailsDrawer open={detailsOpen} onClose={() => setDetailsOpen(false)} testResult={testResult} diff={diff} />
    </div>
  );
}

function Panel({ title, aside, action, children }) {
  return (
    <section className="flex min-h-[260px] flex-col rounded-2xl border border-line bg-paper-2 p-4 lg:min-h-0">
      <header className="mb-3 flex items-center gap-2">
        <h2 className="font-display text-base font-semibold">{title}</h2>
        {aside && <span className="font-display text-base tabular-nums text-muted">{aside}</span>}
        <span className="ml-auto">{action}</span>
      </header>
      {children}
    </section>
  );
}

function Check({ test }) {
  const Icon = test.passed ? CheckCircle2 : XCircle;
  return (
    <li className="flex items-start gap-2 text-[13.5px] leading-snug text-ink-2">
      <Icon
        className={`mt-px size-4 shrink-0 ${test.passed ? 'text-ok' : 'text-bad'}`}
        aria-label={test.passed ? 'Passed' : 'Failed'}
      />
      {test.name}
    </li>
  );
}

function Note({ icon: Icon, tone, text }) {
  return (
    <p className={`flex gap-2 rounded-lg px-2.5 py-2 ${tone === 'ok' ? 'bg-ok-soft' : 'bg-warn-soft'}`}>
      <Icon className={`mt-0.5 size-3.5 shrink-0 ${tone === 'ok' ? 'text-ok' : 'text-warn'}`} aria-hidden />
      <span className="line-clamp-2 text-ink-2">{text}</span>
    </p>
  );
}

function minutesSpent(session) {
  if (!session.startedAt || !session.submittedAt) return '–';
  return Math.max(1, Math.round((new Date(session.submittedAt) - new Date(session.startedAt)) / 60000));
}

function questionsAsked(session) {
  const mine = (messages) => messages.filter((message) => message.author === 'student').length;
  return mine(session.managerMessages) + mine(session.teammateMessages);
}
