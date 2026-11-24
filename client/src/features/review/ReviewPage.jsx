import { Award, CheckCircle2, XCircle } from 'lucide-react';
import { Link, Navigate, useParams } from 'react-router-dom';
import PageLayout from '../../components/layout/PageLayout.jsx';
import Card from '../../components/ui/Card.jsx';
import PageState from '../../components/ui/PageState.jsx';
import { useSession } from '../../hooks/useSession.js';
import { pathForSession } from '../../lib/sessionRoutes.js';
import TestResultsPanel from './TestResultsPanel.jsx';
import DiffView from './DiffView.jsx';
import ScoreBreakdown from './ScoreBreakdown.jsx';

export default function ReviewPage() {
  const { sessionId } = useParams();
  const { session, error } = useSession(sessionId);

  if (!session) return <PageState error={error} />;
  if (session.status !== 'submitted') return <Navigate to={pathForSession(session)} replace />;

  const { score, review, testResult, diff, recordId } = session.result;
  const resolved = testResult.allPassed;

  return (
    <PageLayout
      headerActions={
        <>
          <Link
            to="/?start"
            className="inline-flex h-10 items-center rounded-lg px-3 text-sm font-medium text-slate-600 hover:bg-slate-100"
          >
            Try another ticket
          </Link>
          <Link
            to={`/records/${recordId}`}
            className="inline-flex h-10 items-center gap-2 rounded-lg bg-blue-600 px-4 text-sm font-medium text-white hover:bg-blue-700"
          >
            <Award className="size-4" aria-hidden /> View work record
          </Link>
        </>
      }
    >
      <div className="mb-8 flex items-center gap-3">
        {resolved ? (
          <CheckCircle2 className="size-8 text-emerald-600" aria-hidden />
        ) : (
          <XCircle className="size-8 text-rose-600" aria-hidden />
        )}
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
            {resolved ? 'Ticket resolved' : 'Ticket not resolved yet'}
          </h1>
          <p className="text-sm text-slate-500">
            {session.ticket.issueId} · {session.ticket.title}
          </p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_1.3fr]">
        <div className="space-y-6">
          <Card title="Score">
            <ScoreBreakdown score={score} />
          </Card>
          <Card title="Test results">
            <TestResultsPanel testResult={testResult} />
          </Card>
        </div>

        <div className="space-y-6">
          <Card title="Code review">
            <p className="text-sm leading-relaxed text-slate-700">{review.summary}</p>
            <ReviewList title="What went well" items={review.strengths} />
            <ReviewList title="What to improve" items={review.improvements} />
          </Card>
          <Card title={`Your changes (${diff.changedFiles.length} file${diff.changedFiles.length === 1 ? '' : 's'})`}>
            <DiffView patch={diff.patch} />
          </Card>
        </div>
      </div>
    </PageLayout>
  );
}

function ReviewList({ title, items }) {
  if (items.length === 0) return null;
  return (
    <section className="mt-5">
      <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">{title}</h3>
      <ul className="list-disc space-y-1.5 pl-5 text-sm text-slate-700">
        {items.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </section>
  );
}
