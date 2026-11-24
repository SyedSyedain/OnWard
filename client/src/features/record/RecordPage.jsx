import { ShieldAlert, ShieldCheck } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { recordsApi } from '../../api/recordsApi.js';
import PageLayout from '../../components/layout/PageLayout.jsx';
import Badge from '../../components/ui/Badge.jsx';
import PageState from '../../components/ui/PageState.jsx';
import { DIFFICULTY_LABELS } from '../../lib/constants.js';

export default function RecordPage() {
  const { recordId } = useParams();
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    recordsApi.get(recordId).then(setData).catch(setError);
  }, [recordId]);

  if (!data) return <PageState error={error} />;

  const { record, verified } = data;
  const issuedOn = new Date(record.issuedAt).toLocaleDateString('en-IN', { dateStyle: 'long' });

  return (
    <PageLayout width="max-w-3xl">
      <article className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm sm:p-10">
        <header className="flex flex-wrap items-start justify-between gap-6 border-b border-slate-100 pb-6">
          <div>
            <p className="text-sm font-semibold text-blue-600">Verified Work Record</p>
            <h1 className="mt-1 text-3xl font-bold tracking-tight text-slate-900">{record.studentName}</h1>
            <p className="mt-1 text-slate-600">
              {record.role} · {record.simulation} simulation
            </p>
          </div>
          <VerificationBadge verified={verified} />
        </header>

        <section className="grid gap-6 border-b border-slate-100 py-6 sm:grid-cols-[1fr_auto]">
          <div>
            <div className="mb-2 flex flex-wrap gap-2">
              <Badge tone="blue">{record.task.id}</Badge>
              <Badge>{record.task.area}</Badge>
              <Badge tone="amber">{DIFFICULTY_LABELS[record.task.difficulty]}</Badge>
              <Badge tone={record.outcome === 'resolved' ? 'green' : 'red'}>
                {record.outcome === 'resolved' ? 'Resolved' : 'Not resolved'}
              </Badge>
            </div>
            <h2 className="font-semibold text-slate-900">{record.task.title}</h2>
            <p className="mt-2 text-sm leading-relaxed text-slate-600">{record.review.summary}</p>
          </div>
          <div className="text-right">
            <p className="text-4xl font-bold text-slate-900">{record.score.total}</p>
            <p className="text-xs text-slate-500">score out of 100</p>
          </div>
        </section>

        <dl className="grid grid-cols-2 gap-x-6 gap-y-4 py-6 text-sm sm:grid-cols-3">
          <Fact label="Tests passed" value={`${record.tests.passed} / ${record.tests.total}`} />
          <Fact
            label="Acceptance checks"
            value={`${record.tests.acceptancePassed} / ${record.tests.acceptanceTotal}`}
          />
          <Fact label="Hint level used" value={`${record.process.hintLevelUsed} of 4`} />
          <Fact label="Questions to manager" value={record.process.managerQuestions} />
          <Fact label="Test runs" value={record.process.testRuns} />
          <Fact label="Time spent" value={`${record.process.minutesSpent} min`} />
        </dl>

        <footer className="flex flex-wrap items-end justify-between gap-6 border-t border-slate-100 pt-6">
          <div className="text-xs text-slate-500">
            <p>Issued {issuedOn}</p>
            <p className="mt-1 font-mono">Record ID {record.id}</p>
            <p className="mt-1 max-w-sm">
              The tests decide the outcome. This record is signed by OnWard; any change to it breaks the signature.
            </p>
          </div>
          <QRCodeSVG value={window.location.href} size={88} aria-label="QR code linking to this record" />
        </footer>
      </article>
      <p className="mt-6 text-center text-sm text-slate-500">
        Earned on OnWard, where students practise a real engineering job before they get one.{' '}
        <Link to="/?start" className="font-medium text-slate-900 underline underline-offset-4 hover:text-slate-700">
          Try a ticket yourself
        </Link>
      </p>
    </PageLayout>
  );
}

function VerificationBadge({ verified }) {
  const Icon = verified ? ShieldCheck : ShieldAlert;
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-sm font-medium ${
        verified ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'
      }`}
    >
      <Icon className="size-4" aria-hidden />
      {verified ? 'Signature verified' : 'Signature invalid'}
    </span>
  );
}

function Fact({ label, value }) {
  return (
    <div>
      <dt className="text-slate-500">{label}</dt>
      <dd className="mt-0.5 font-medium text-slate-900">{value}</dd>
    </div>
  );
}
