import { SendHorizontal } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

/**
 * The message box under a conversation, with suggested questions above it.
 * Enter sends; Shift+Enter starts a new line. `prefill` replaces the draft when it changes.
 */
export default function Composer({ placeholder, suggestions = [], disabled, onSend, prefill, children }) {
  const [draft, setDraft] = useState('');
  const inputRef = useRef(null);

  useEffect(() => {
    if (prefill?.text) {
      setDraft(prefill.text);
      inputRef.current?.focus();
    }
  }, [prefill]);

  async function send(text) {
    const message = text.trim();
    if (!message || disabled) return;
    const sent = await onSend(message);
    if (sent !== false) setDraft('');
  }

  return (
    <div className="shrink-0 border-t border-line bg-paper px-3 pb-3 pt-2.5">
      {suggestions.length > 0 && (
        <div className="mb-2 flex flex-wrap gap-1.5" role="group" aria-label="Suggested questions">
          {suggestions.map((suggestion) => (
            <button
              key={suggestion}
              type="button"
              disabled={disabled}
              onClick={() => send(suggestion)}
              className="rounded-md border border-line bg-paper-2 px-2 py-1 text-left font-ui text-xs text-ink-2 transition-colors hover:border-ink-3 hover:text-ink disabled:cursor-not-allowed disabled:text-faint focus-visible:outline-2 focus-visible:outline-accent"
            >
              {suggestion}
            </button>
          ))}
        </div>
      )}
      <form
        onSubmit={(event) => {
          event.preventDefault();
          send(draft);
        }}
        className="flex items-end gap-2 rounded-lg border border-line bg-paper-2 p-1.5 focus-within:border-ink-3"
      >
        <textarea
          ref={inputRef}
          value={draft}
          rows={1}
          maxLength={1000}
          placeholder={placeholder}
          onChange={(event) => setDraft(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === 'Enter' && !event.shiftKey) {
              event.preventDefault();
              send(draft);
            }
          }}
          className="max-h-28 min-h-8 min-w-0 flex-1 resize-none bg-transparent px-1.5 py-1 font-ui text-[13.5px] text-ink outline-none placeholder:text-faint"
        />
        <button
          type="submit"
          disabled={disabled || !draft.trim()}
          aria-label="Send message"
          className="grid size-8 shrink-0 place-items-center rounded-md bg-accent text-ink transition-colors hover:bg-accent-strong disabled:bg-paper-3 disabled:text-faint focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink"
        >
          <SendHorizontal className="size-4" aria-hidden />
        </button>
      </form>
      {children}
    </div>
  );
}
