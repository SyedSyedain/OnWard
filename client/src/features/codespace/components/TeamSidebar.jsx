import { ArrowLeft, ChevronRight, Lightbulb, PanelRightClose } from 'lucide-react';
import { useEffect, useState } from 'react';
import { sessionsApi } from '../../../api/sessionsApi.js';
import { TEAMMATES, TEAMMATES_BY_ID, roleTitle, threadFor } from '../teammates.js';
import Avatar from './Avatar.jsx';
import ChatThread from './ChatThread.jsx';
import Composer from './Composer.jsx';

/**
 * The AI teammates. The list shows who is on the team; picking someone opens
 * their own conversation. Replies come from the server, which gives each teammate
 * the ticket, the file you share and only the hint level you have unlocked.
 *
 * `request` ({ teammateId, text }) opens a teammate with a question ready to send.
 */
export default function TeamSidebar({ session, onSessionChange, activePath, failingCheck, aiMode, request, onClose }) {
  const [selectedId, setSelectedId] = useState(null);
  const [typingId, setTypingId] = useState(null);
  const [shareFile, setShareFile] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (request) setSelectedId(request.teammateId);
  }, [request]);

  async function ask(teammateId, { message = '', requestHint = false }) {
    setTypingId(teammateId);
    setError(null);
    // Show the question straight away; the server's copy replaces it when the reply arrives.
    const pending = {
      author: 'student',
      teammate: teammateId,
      text: message || 'Can I get a hint?',
      sentAt: 'pending',
    };
    onSessionChange((current) => ({ ...current, teammateMessages: [...current.teammateMessages, pending] }));
    try {
      const { messages, hintLevel } = await sessionsApi.askTeammate(session.id, {
        teammate: teammateId,
        message,
        requestHint,
        filePath: shareFile && activePath ? activePath : undefined,
      });
      onSessionChange((current) => ({ ...current, teammateMessages: messages, hintLevel }));
      return true;
    } catch (askError) {
      onSessionChange((current) => ({
        ...current,
        teammateMessages: current.teammateMessages.filter((entry) => entry !== pending),
      }));
      setError(askError.message);
      return false;
    } finally {
      setTypingId(null);
    }
  }

  const selected = selectedId ? TEAMMATES_BY_ID[selectedId] : null;
  const online = aiMode === 'gemini';

  return (
    <aside className="flex h-full min-h-0 flex-col bg-paper" aria-label="AI teammates">
      <header className="flex h-11 shrink-0 items-center gap-2 border-b border-line px-3">
        {selected ? (
          <button
            type="button"
            onClick={() => setSelectedId(null)}
            className="flex items-center gap-1.5 rounded-md px-1.5 py-1 font-ui text-[13px] text-muted hover:bg-paper-3 hover:text-ink focus-visible:outline-2 focus-visible:outline-accent"
          >
            <ArrowLeft className="size-4" aria-hidden />
            Team
          </button>
        ) : (
          <h2 className="px-1.5 font-ui text-[13px] font-medium text-ink">Your team</h2>
        )}
        <span className="ml-auto" />
        <button
          type="button"
          onClick={onClose}
          aria-label="Hide the team panel"
          className="grid size-7 place-items-center rounded-md text-muted hover:bg-paper-3 hover:text-ink focus-visible:outline-2 focus-visible:outline-accent"
        >
          <PanelRightClose className="size-4" aria-hidden />
        </button>
      </header>

      {selected ? (
        <Conversation
          key={selected.id}
          teammate={selected}
          session={session}
          online={online}
          typing={typingId === selected.id}
          busy={typingId !== null}
          error={error}
          prefill={request?.teammateId === selected.id ? request : null}
          suggestions={selected.suggestions({ fileName: activePath?.split('/').pop(), failingCheck })}
          shareFile={shareFile}
          onShareFile={setShareFile}
          activePath={activePath}
          onAsk={(options) => ask(selected.id, options)}
        />
      ) : (
        <div className="min-h-0 flex-1 overflow-y-auto animate-[fade-in_160ms_ease-out]">
          <p className="px-4 pb-2 pt-3 font-ui text-xs text-muted">
            They know your ticket and the file you share. They guide you; they will not write the fix.
          </p>
          <ul className="px-2">
            {TEAMMATES.map((teammate) => {
              const thread = threadFor(session.teammateMessages, teammate.id);
              return (
                <li key={teammate.id}>
                  <button
                    type="button"
                    onClick={() => setSelectedId(teammate.id)}
                    className="flex w-full items-center gap-3 rounded-lg px-2 py-2.5 text-left transition-colors hover:bg-paper-3/70 focus-visible:outline-2 focus-visible:outline-accent"
                  >
                    <span className="relative">
                      <Avatar id={teammate.id} name={teammate.name} />
                      <StatusDot online={online} />
                    </span>
                    <span className="min-w-0 flex-1 font-ui">
                      <span className="flex items-baseline gap-2">
                        <span className="text-sm font-medium text-ink">{teammate.name}</span>
                        <span className="truncate text-xs text-muted">{roleTitle(teammate, session.roleId)}</span>
                      </span>
                      <span className="block truncate text-xs text-faint">
                        {thread.length ? lastLine(thread) : teammate.helpsWith}
                      </span>
                    </span>
                    {typingId === teammate.id ? (
                      <span className="text-[11px] text-muted">typing…</span>
                    ) : (
                      <ChevronRight className="size-4 text-faint" aria-hidden />
                    )}
                  </button>
                </li>
              );
            })}
          </ul>
          <p className="mx-4 mt-3 rounded-lg border border-line bg-paper-2 px-3 py-2 font-ui text-xs text-muted">
            {online
              ? 'Live AI is on. Replies are generated for your ticket and code.'
              : 'Live AI is not configured on this server, so replies are written guidance and unlocked hints, not generated answers.'}
          </p>
        </div>
      )}
    </aside>
  );
}

function Conversation({
  teammate,
  session,
  online,
  typing,
  busy,
  error,
  prefill,
  suggestions,
  shareFile,
  onShareFile,
  activePath,
  onAsk,
}) {
  const thread = threadFor(session.teammateMessages, teammate.id);
  const hintsLeft = session.hintLevel < session.maxHintLevel;

  return (
    <div className="flex min-h-0 flex-1 flex-col animate-[slide-in_180ms_ease-out]">
      <div className="flex shrink-0 items-center gap-3 border-b border-line px-4 py-3">
        <span className="relative">
          <Avatar id={teammate.id} name={teammate.name} />
          <StatusDot online={online} />
        </span>
        <div className="min-w-0 font-ui">
          <p className="text-sm font-medium text-ink">{teammate.name}</p>
          <p className="truncate text-xs text-muted">
            {roleTitle(teammate, session.roleId)} · {online ? 'Online' : 'Offline guidance'}
          </p>
        </div>
      </div>

      {teammate.id === 'daniel' && (
        <div className="flex shrink-0 items-center gap-3 border-b border-line bg-paper-2 px-4 py-2 font-ui text-xs text-muted">
          <span className="flex items-center gap-1.5">
            Hints
            <span className="flex gap-0.5" aria-hidden>
              {Array.from({ length: session.maxHintLevel }, (_, index) => (
                <span
                  key={index}
                  className={`h-1.5 w-3.5 rounded-sm ${index < session.hintLevel ? 'bg-accent' : 'bg-paper-3'}`}
                />
              ))}
            </span>
            <span className="tabular-nums">
              {session.hintLevel}/{session.maxHintLevel}
            </span>
          </span>
          <button
            type="button"
            disabled={busy || !hintsLeft}
            onClick={() => onAsk({ requestHint: true })}
            className="ml-auto inline-flex items-center gap-1 rounded-md border border-line bg-paper-2 px-2 py-1 text-ink-2 hover:border-ink-3 disabled:cursor-not-allowed disabled:text-faint focus-visible:outline-2 focus-visible:outline-accent"
          >
            <Lightbulb className="size-3.5" aria-hidden />
            {hintsLeft ? 'Unlock next hint' : 'All hints used'}
          </button>
        </div>
      )}

      <ChatThread
        messages={thread}
        who={{ id: teammate.id, name: teammate.name }}
        typing={typing}
        empty={`Ask ${teammate.name} about ${teammate.helpsWith.toLowerCase()}.${
          teammate.id === 'daniel' ? ' Each hint you unlock lowers your independence score a little.' : ''
        }`}
      />

      {error && <p className="shrink-0 px-4 pb-2 font-ui text-xs text-bad">{error}</p>}

      <Composer
        placeholder={`Message ${teammate.name}…`}
        suggestions={thread.length < 4 ? suggestions : []}
        disabled={busy}
        prefill={prefill}
        onSend={(message) => onAsk({ message })}
      >
        <label className="mt-2 flex items-center gap-2 font-ui text-xs text-muted">
          <input
            type="checkbox"
            checked={shareFile}
            onChange={(event) => onShareFile(event.target.checked)}
            className="accent-accent"
          />
          Share the open file{activePath ? ` (${activePath.split('/').pop()})` : ''}
        </label>
      </Composer>
    </div>
  );
}

function StatusDot({ online }) {
  return (
    <span
      className={`absolute -bottom-0.5 -right-0.5 size-3 rounded-full border-2 border-paper ${online ? 'bg-ok' : 'bg-warn'}`}
      aria-hidden
    />
  );
}

function lastLine(thread) {
  const last = thread.at(-1);
  return `${last.author === 'student' ? 'You: ' : ''}${last.text}`;
}
