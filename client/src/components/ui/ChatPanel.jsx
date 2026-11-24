import { SendHorizontal } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import Button from './Button.jsx';

/**
 * A simple chat thread with an input box.
 * `authors` maps a message author to { name, tone } for display.
 */
export default function ChatPanel({ messages, authors, placeholder, emptyText, onSend, sending, footer }) {
  const [draft, setDraft] = useState('');
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }, [messages.length]);

  async function handleSubmit(event) {
    event.preventDefault();
    const message = draft.trim();
    if (!message || sending) return;
    const sent = await onSend(message);
    if (sent !== false) setDraft('');
  }

  return (
    <div className="flex h-full min-h-0 flex-col">
      <ol className="min-h-0 flex-1 space-y-3 overflow-y-auto pr-1">
        {messages.length === 0 && <li className="text-sm text-slate-500">{emptyText}</li>}
        {messages.map((message, index) => {
          const author = authors[message.author];
          const isStudent = message.author === 'student';
          return (
            <li key={index} className={`flex flex-col ${isStudent ? 'items-end' : 'items-start'}`}>
              <span className="mb-1 text-xs font-medium text-slate-500">{author.name}</span>
              <p
                className={`max-w-[90%] whitespace-pre-line rounded-xl px-3.5 py-2.5 text-sm leading-relaxed ${
                  isStudent ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-800'
                }`}
              >
                {message.text}
              </p>
            </li>
          );
        })}
        <li ref={bottomRef} aria-hidden />
      </ol>

      <form onSubmit={handleSubmit} className="mt-4 flex gap-2">
        <input
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          placeholder={placeholder}
          maxLength={1000}
          className="h-10 min-w-0 flex-1 rounded-lg border border-slate-200 px-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
        />
        <Button
          type="submit"
          icon={SendHorizontal}
          loading={sending}
          disabled={!draft.trim()}
          aria-label="Send message"
        />
      </form>
      {footer}
    </div>
  );
}
