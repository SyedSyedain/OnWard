import { useEffect, useRef } from 'react';

/**
 * A conversation: the student's messages on the right, the colleague's on the left.
 * Replies written from a server template (no live AI configured) say so under the bubble.
 */
export default function ChatThread({ messages, them, typing, empty }) {
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, [messages.length, typing]);

  return (
    <ol
      className="flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto px-4 py-4 font-ui text-[13.5px]"
      aria-live="polite"
    >
      {messages.length === 0 && !typing && <li className="text-muted">{empty}</li>}
      {messages.map((message, index) => {
        const mine = message.author === 'student';
        return (
          <li key={`${message.sentAt}-${index}`} className={`flex flex-col ${mine ? 'items-end' : 'items-start'}`}>
            <p
              className={`max-w-[88%] whitespace-pre-line rounded-xl px-3.5 py-2.5 leading-relaxed ${
                mine ? 'rounded-br-sm bg-ink text-paper-2' : 'rounded-bl-sm border border-line bg-paper-2 text-ink-2'
              }`}
            >
              {message.text}
            </p>
            {!mine && message.generatedBy === 'template' && (
              <span className="mt-1 text-[11px] text-faint">Offline guidance: live AI is not configured</span>
            )}
            {!mine && message.hintLevel > 0 && (
              <span className="mt-1 text-[11px] text-warn">Hint level {message.hintLevel}</span>
            )}
          </li>
        );
      })}
      {typing && (
        <li className="flex items-center gap-2 text-xs text-muted" aria-label={`${them} is typing`}>
          <span className="flex gap-1 rounded-xl rounded-bl-sm border border-line bg-paper-2 px-3 py-3">
            {[0, 1, 2].map((dot) => (
              <span
                key={dot}
                className="size-1.5 animate-bounce rounded-full bg-faint"
                style={{ animationDelay: `${dot * 140}ms`, animationDuration: '900ms' }}
              />
            ))}
          </span>
          {them} is typing
        </li>
      )}
      <li ref={bottomRef} aria-hidden />
    </ol>
  );
}
