import { Play } from 'lucide-react';
import { useState } from 'react';
import { Navigate, useNavigate, useParams } from 'react-router-dom';
import { sessionsApi } from '../../api/sessionsApi.js';
import PageLayout from '../../components/layout/PageLayout.jsx';
import Button from '../../components/ui/Button.jsx';
import Card from '../../components/ui/Card.jsx';
import ChatPanel from '../../components/ui/ChatPanel.jsx';
import ErrorBanner from '../../components/ui/ErrorBanner.jsx';
import PageState from '../../components/ui/PageState.jsx';
import { useSession } from '../../hooks/useSession.js';
import { pathForSession } from '../../lib/sessionRoutes.js';
import TicketCard from './TicketCard.jsx';

const MANAGER_AUTHORS = {
  student: { name: 'You' },
  manager: { name: 'Engineering Manager' },
};

export default function BriefingPage() {
  const { sessionId } = useParams();
  const navigate = useNavigate();
  const { session, setSession, error } = useSession(sessionId);
  const [sending, setSending] = useState(false);
  const [starting, setStarting] = useState(false);
  const [actionError, setActionError] = useState(null);

  if (!session) return <PageState error={error} />;
  if (session.status !== 'briefing') return <Navigate to={pathForSession(session)} replace />;

  async function sendQuestion(message) {
    setSending(true);
    setActionError(null);
    try {
      const { messages } = await sessionsApi.askManager(session.id, message);
      setSession({ ...session, managerMessages: messages });
      return true;
    } catch (sendError) {
      setActionError(sendError);
      return false;
    } finally {
      setSending(false);
    }
  }

  async function startWorking() {
    setStarting(true);
    setActionError(null);
    try {
      const { session: updated } = await sessionsApi.startWork(session.id);
      navigate(pathForSession(updated));
    } catch (startError) {
      setActionError(startError);
      setStarting(false);
    }
  }

  return (
    <PageLayout
      headerActions={
        <Button icon={Play} loading={starting} onClick={startWorking}>
          Start working
        </Button>
      }
    >
      <p className="mb-6 text-sm text-slate-500">
        Welcome to the {session.simulationName} backend team, {session.studentName}. Read your ticket and ask your
        manager anything that is unclear before you start.
      </p>

      <div className="mb-6">
        <ErrorBanner error={actionError} />
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        <Card>
          <TicketCard ticket={session.ticket} />
        </Card>
        <Card title="Ask your Engineering Manager" className="flex h-[560px] flex-col [&>div]:min-h-0 [&>div]:flex-1">
          <ChatPanel
            messages={session.managerMessages}
            authors={MANAGER_AUTHORS}
            sending={sending}
            onSend={sendQuestion}
            placeholder="e.g. Which customers are affected?"
            emptyText="Ask about requirements, priority or expected behaviour. Your manager will not explain the code: that is your job."
          />
        </Card>
      </div>
    </PageLayout>
  );
}
