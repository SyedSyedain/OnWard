import { CheckCircle2, Clock, FlaskConical, Lightbulb, MessageSquare, ShieldAlert, ShieldCheck } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { recordsApi } from '../../api/recordsApi.js';
import AppBar from '../../components/layout/AppBar.jsx';
import { ScoreRing, ScoreSplit, SkillRadar, Stat, gradeFor } from '../../components/score/ScoreVisuals.jsx';
import PageState from '../../components/ui/PageState.jsx';
import { DIFFICULTY_LABELS } from '../../lib/constants.js';

/** The signed record a student shares with a recruiter: who, what, the score and how it was earned, on one screen. */
export default function RecordPage() {
  const { recordId } = useParams();
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    recordsApi.get(recordId).then(setData).catch(setError);
  }, [recordId]);

  if (!data) return <PageState error={error} />;

  const { record, verified } = data;
  const resolved = record.outcome === 'resolved';
  const issuedOn = new Date(record.issuedAt).toLocaleDateString('en-IN', { dateStyle: 'medium' });
  const questions = record.process.managerQuestions + (record.process.teammateMessages ?? 0);

  return (
    <div className="min-h-dvh bg-paper font-ui text-ink">
      <AppBar note="Verified work record">
        <Link
          to="/?start"
          className="flex h-9 items-center rounded-md bg-accent px-3.5 text-sm font-medium text-ink hover:bg-accent-strong focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-paper-2 print:hidden"
        >
          Try a ticket
        </Link>
      </AppBar>

      <main className="mx-auto max-w-6xl px-4 py-5 sm:px-6">
        <article className="rounded-2xl border border-line bg-paper-2 p-5 sm:p-7">
          <header className="flex flex-wrap items-start justify-between gap-4">
            <div className="min-w-0">
              <h1 className="font-display text-4xl font-semibold tracking-tight sm:text-5xl">{record.studentName}</h1>
              <p className="mt-1 text-[15px] text-muted">
                {record.role} on {record.simulation}
              </p>
            </div>
            <span
              className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-sm font-medium ${
                verified ? 'bg-ok-soft text-ok' : 'bg-bad-soft text-bad'
              }`}
            >
              {verified ? <ShieldCheck className="size-4" aria-hidden /> : <ShieldAlert className="size-4" aria-hidden />}
              {verified ? 'Verified' : 'Signature invalid'}
            </span>
          </header>

          <div className="mt-5 flex flex-wrap items-center gap-1.5 text-xs">
            <span className="rounded-md bg-ink px-1.5 py-0.5 font-mono text-paper-2">{record.task.id}</span>
            <span className="rounded-md bg-paper-3 px-1.5 py-0.5 text-ink-2">{record.task.area}</span>
            <span className="rounded-md bg-accent-soft px-1.5 py-0.5">{DIFFICULTY_LABELS[record.task.difficulty]}</span>
            <span className="ml-1 text-sm text-ink-2">{record.task.title}</span>
          </div>

          <div className="mt-6 grid items-center gap-6 border-y border-line py-6 md:grid-cols-[auto_minmax(0,1fr)] lg:grid-cols-[auto_minmax(0,1fr)_300px]">
            <div className="flex flex-col items-center gap-2">
              <ScoreRing total={record.score.total} resolved={resolved} />
              <span className={`text-sm font-medium ${resolved ? 'text-ok' : 'text-bad'}`}>
                {gradeFor(record.score.total, resolved)}
              </span>
            </div>
            <div className="min-w-0 space-y-5">
              <ScoreSplit score={record.score} />
              <dl className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                <Stat
                  icon={CheckCircle2}
                  label="Acceptance checks"
                  value={`${record.tests.acceptancePassed}/${record.tests.acceptanceTotal}`}
                />
                <Stat icon={FlaskConical} label="Tests passing" value={`${record.tests.passed}/${record.tests.total}`} />
                <Stat icon={Lightbulb} label="Hints used" value={`${record.process.hintLevelUsed}/4`} />
                <Stat icon={Clock} label="Minutes" value={record.process.minutesSpent} />
                <Stat icon={FlaskConical} label="Test runs" value={record.process.testRuns} />
                <Stat icon={MessageSquare} label="Questions asked" value={questions} />
              </dl>
            </div>
            <div className="mx-auto aspect-square w-full max-w-[300px]">
              <SkillRadar score={record.score} aspects={record.review.aspects} />
            </div>
          </div>

          <footer className="mt-5 flex flex-wrap items-end justify-between gap-5">
            <p className="line-clamp-2 max-w-[62ch] text-[14.5px] leading-snug text-ink-2">{record.review.summary}</p>
            <div className="flex items-center gap-3 text-right text-xs text-muted">
              <p>
                Issued {issuedOn}
                <br />
                <span className="font-mono">{record.id}</span>
              </p>
              <QRCodeSVG value={window.location.href} size={64} aria-label="QR code linking to this record" />
            </div>
          </footer>
        </article>
      </main>
    </div>
  );
}
