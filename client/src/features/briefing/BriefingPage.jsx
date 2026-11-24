import { ArrowRight, Loader2 } from 'lucide-react';
import { useState } from 'react';
import { Link, Navigate, useNavigate, useParams } from 'react-router-dom';
import { sessionsApi } from '../../api/sessionsApi.js';
import Mark from '../../components/brand/Mark.jsx';
import PageState from '../../components/ui/PageState.jsx';
import { useSession } from '../../hooks/useSession.js';
import { ROLES } from '../../lib/constants.js';
import { pathForSession } from '../../lib/sessionRoutes.js';
import ManagerChat from '../codespace/components/ManagerChat.jsx';
import TicketCard from './TicketCard.jsx';

/**
 * Step one of a simulation: read the ticket, ask the manager about anything unclear,
 * then move into the Codespace, where the ticket and this conversation carry on.
 */
export default function BriefingPage() {
  const { sessionId } = useParams();
  const navigate = useNavigate();
  const { session, setSession, error } = useSession(sessionId);
  const [starting, setStarting] = useState(false);
  const [startError, setStartError] = useState(null);

  if (!session) return <PageState error={error} />;
  if (session.status !== 'briefing') return <Navigate to={pathForSession(session)} replace />;

  const role = ROLES.find((item) => item.id === session.roleId)?.title ?? session.roleId;

  async function startWorking() {
    setStarting(true);
    setStartError(null);
    try {
      const { session: updated } = await sessionsApi.startWork(session.id);
      navigate(pathForSession(updated));
    } catch (failure) {
      setStartError(failure.message);
      setStarting(false);
    }
  }

  const startButton = (label, className = '') => (
    <button
      type="button"
      onClick={startWorking}
      disabled={starting}
      className={`flex h-9 shrink-0 items-center gap-2 rounded-md bg-accent px-3.5 font-ui text-sm font-medium text-ink transition-colors hover:bg-accent-strong disabled:cursor-wait disabled:opacity-80 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink ${className}`}
    >
      {label}
      {starting ? <Loader2 className="size-4 animate-spin" aria-hidden /> : <ArrowRight className="size-4" aria-hidden />}
    </button>
  );

  return (
    <div className="min-h-screen bg-paper">
      <header className="sticky top-0 z-10 bg-ink font-ui text-paper-2">
        <div className="mx-auto flex h-12 max-w-6xl items-center gap-3 px-4 sm:px-6">
          <Link
            to="/"
            className="flex items-center gap-2 rounded-md py-1 font-display text-[15px] font-semibold focus-visible:outline-2 focus-visible:outline-accent"
            aria-label="OnWard home"
          >
            <Mark className="size-6" ringClassName="fill-paper-2" arrowClassName="fill-accent" />
            <span className="hidden sm:inline">OnWard</span>
          </Link>
          <span className="hidden h-5 w-px bg-ink-3 sm:block" aria-hidden />
          <p className="hidden min-w-0 flex-col leading-tight sm:flex">
            <span className="truncate text-[13px] font-medium">{session.simulationName}</span>
            <span className="truncate text-[11px] text-faint">{role}</span>
          </p>
          <span className="flex-1" />
          <span className="hidden text-xs text-faint md:inline">Briefing, then the Codespace</span>
          {startButton('Start working')}
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 pb-12 pt-8 sm:px-6 sm:pt-10">
        <div className="mb-6 max-w-2xl font-ui">
          <p className="font-display text-xl font-semibold tracking-tight text-ink">
            Welcome to the team, {session.studentName}.
          </p>
          <p className="mt-1 text-[15px] text-muted">
            Your manager has assigned you a ticket on {session.simulationName}. Read it, ask about anything unclear,
            then start working.
          </p>
        </div>

        <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1.45fr)_minmax(0,1fr)]">
          <section className="overflow-hidden rounded-xl border border-line bg-paper-2">
            <TicketCard ticket={session.ticket} />
            <footer className="flex flex-col gap-3 border-t border-line bg-paper px-6 py-4 font-ui sm:flex-row sm:items-center sm:justify-between sm:px-8">
              <p className="text-[13px] text-muted">The ticket and your manager stay with you in the Codespace.</p>
              {startButton('Open the Codespace', 'self-start sm:self-auto')}
            </footer>
            {startError && (
              <p role="alert" className="border-t border-line bg-bad-soft px-6 py-3 font-ui text-[13px] text-bad sm:px-8">
                {startError}
              </p>
            )}
          </section>

          <section
            aria-label="Conversation with your Engineering Manager"
            className="flex h-[520px] flex-col overflow-hidden rounded-xl border border-line bg-paper-2 lg:sticky lg:top-20 lg:h-[calc(100vh-7rem)] lg:max-h-[640px]"
          >
            <ManagerChat
              session={session}
              onSessionChange={setSession}
              empty="Ask about requirements, users or priority. Your manager will not explain the code: that is your job."
            />
          </section>
        </div>
      </main>
    </div>
  );
}
