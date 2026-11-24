import { useEffect, useRef } from 'react';
import Avatar from './Avatar.jsx';

/**
 * A conversation: the colleague's messages on the left with their avatar, the student's on the right.
 * Consecutive messages from the same side are grouped under one name and avatar. Replies written from
 * prepared guidance (no live AI) carry a small "offline" tag.
 *
 * `who` is { id, name } for the colleague, matching Avatar's ids.
 */
export default function ChatThread({ messages, who, typing, empty }) {
  const listRef = useRef(null);

  // Scroll the conversation itself, never the page around it.
  useEffect(() => {
    const list = listRef.current;
    list?.scrollTo({ top: list.scrollHeight, behavior: 'smooth' });
  }, [messages.length, typing]);

  return (
    <ol
      ref={listRef}
      className="flex min-h-0 flex-1 flex-col gap-1 overflow-y-auto bg-paper px-3 py-4 font-ui text-[13.5px]"
      aria-live="polite"
    >
      {messages.length === 0 && !typing && (
        <li className="m-auto flex max-w-[30ch] flex-col items-center gap-3 py-6 text-center text-muted">
          <Avatar id={who.id} name={who.name} />
          <p className="leading-relaxed">{empty}</p>
        </li>
      )}

      {messages.map((message, index) => {
        const mine = message.author === 'student';
        const startsGroup = index === 0 || (messages[index - 1].author === 'student') !== mine;
        return (
          <li
            key={`${message.sentAt}-${index}`}
            className={`flex gap-2 ${mine ? 'flex-row-reverse' : ''} ${startsGroup && index > 0 ? 'mt-3' : ''}`}
          >
            {!mine && (
              <span className="w-7 shrink-0">{startsGroup && <Avatar id={who.id} name={who.name} size="sm" />}</span>
            )}
            <div className={`flex min-w-0 max-w-[85%] flex-col ${mine ? 'items-end' : 'items-start'}`}>
              {startsGroup && (
                <span className="mb-1 flex items-center gap-1.5 px-1 text-[11px] text-muted">
                  <span className="font-medium text-ink-2">{mine ? 'You' : who.name}</span>
                  <time dateTime={message.sentAt}>{formatTime(message.sentAt)}</time>
                  {!mine && message.generatedBy === 'template' && (
                    <span
                      className="rounded bg-paper-3 px-1 text-[10px] text-muted"
                      title="Live AI is busy or not configured, so this reply comes from prepared guidance for your ticket."
                    >
                      offline
                    </span>
                  )}
                  {!mine && message.hintLevel > 0 && (
                    <span className="rounded bg-warn-soft px-1 text-[10px] text-warn">hint {message.hintLevel}</span>
                  )}
                </span>
              )}
              <p
                className={`whitespace-pre-line break-words rounded-2xl px-3.5 py-2.5 leading-relaxed ${
                  mine
                    ? 'rounded-tr-md bg-ink text-paper-2'
                    : 'rounded-tl-md bg-paper-2 text-ink-2 shadow-[0_1px_0_oklch(88%_0.013_85),0_0_0_1px_oklch(90%_0.012_85)]'
                }`}
              >
                {message.text}
              </p>
            </div>
          </li>
        );
      })}

      {typing && (
        <li className="mt-3 flex items-center gap-2 text-xs text-muted" aria-label={`${who.name} is typing`}>
          <Avatar id={who.id} name={who.name} size="sm" />
          <span className="flex gap-1 rounded-2xl rounded-tl-md bg-paper-2 px-3 py-3 shadow-[0_0_0_1px_oklch(90%_0.012_85)]">
            {[0, 1, 2].map((dot) => (
              <span
                key={dot}
                className="size-1.5 animate-bounce rounded-full bg-faint"
                style={{ animationDelay: `${dot * 140}ms`, animationDuration: '900ms' }}
              />
            ))}
          </span>
        </li>
      )}
    </ol>
  );
}

function formatTime(iso) {
  return new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}
