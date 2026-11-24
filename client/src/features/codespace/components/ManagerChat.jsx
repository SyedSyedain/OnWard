import { useState } from 'react';
import { sessionsApi } from '../../../api/sessionsApi.js';
import Avatar from './Avatar.jsx';
import ChatThread from './ChatThread.jsx';
import Composer from './Composer.jsx';

const SUGGESTIONS = ['Who is affected by this?', 'Is there anything out of scope?', 'How urgent is it?'];

/**
 * The conversation with the Engineering Manager, continued from the briefing.
 * The manager clarifies requirements and priority; the teammates help with code.
 */
export default function ManagerChat({ session, onSessionChange }) {
  const [typing, setTyping] = useState(false);
  const [error, setError] = useState(null);

  async function send(message) {
    setTyping(true);
    setError(null);
    try {
      const { messages } = await sessionsApi.askManager(session.id, message);
      onSessionChange((current) => ({ ...current, managerMessages: messages }));
      return true;
    } catch (sendError) {
      setError(sendError.message);
      return false;
    } finally {
      setTyping(false);
    }
  }

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="flex shrink-0 items-center gap-3 border-b border-line px-4 py-3">
        <Avatar id="manager" name="Manager" />
        <div className="font-ui">
          <p className="text-sm font-medium text-ink">Engineering Manager</p>
          <p className="text-xs text-muted">Wrote your ticket · requirements and priority</p>
        </div>
      </div>
      <ChatThread
        messages={session.managerMessages}
        them="Your manager"
        typing={typing}
        empty="Your briefing conversation continues here. Ask about requirements, users or priority."
      />
      {error && <p className="shrink-0 px-4 pb-2 font-ui text-xs text-bad">{error}</p>}
      <Composer
        placeholder="Ask your manager…"
        suggestions={session.managerMessages.length < 2 ? SUGGESTIONS : []}
        disabled={typing}
        onSend={send}
      />
    </div>
  );
}
