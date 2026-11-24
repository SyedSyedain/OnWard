import { ArrowRight, Loader2 } from 'lucide-react';
import { useState } from 'react';
import { Navigate, useNavigate, useParams } from 'react-router-dom';
import { sessionsApi } from '../../api/sessionsApi.js';
import AppBar from '../../components/layout/AppBar.jsx';
import PageState from '../../components/ui/PageState.jsx';
import { useSession } from '../../hooks/useSession.js';
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
    <div className="min-h-dvh bg-paper lg:flex lg:h-dvh lg:flex-col">
      <AppBar session={session} note="Briefing">
        {startButton('Start working')}
      </AppBar>

      <main className="mx-auto grid w-full max-w-6xl items-start gap-4 px-4 py-5 sm:px-6 lg:min-h-0 lg:flex-1 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)] lg:items-stretch">
        <section className="flex min-h-0 flex-col overflow-hidden rounded-2xl border border-line bg-paper-2">
          <div className="min-h-0 flex-1 overflow-y-auto">
            <TicketCard ticket={session.ticket} />
          </div>
          {startError && (
            <p role="alert" className="border-t border-line bg-bad-soft px-6 py-3 font-ui text-[13px] text-bad">
              {startError}
            </p>
          )}
        </section>

        <section
          aria-label="Conversation with your Engineering Manager"
          className="flex h-[520px] flex-col overflow-hidden rounded-2xl border border-line bg-paper-2 lg:h-auto lg:min-h-0"
        >
          <ManagerChat
            session={session}
            onSessionChange={setSession}
            empty="Ask about users, priority or scope. The code is yours to read."
          />
        </section>
      </main>
    </div>
  );
}
