import { useEffect, useRef, useState } from 'react';

const LINE_TONES = {
  command: 'text-paper-2',
  info: 'text-[oklch(78%_0.012_80)]',
  out: 'text-[oklch(86%_0.008_80)]',
  pass: 'text-[oklch(78%_0.13_150)]',
  fail: 'text-[oklch(72%_0.16_30)]',
  error: 'text-[oklch(72%_0.16_30)]',
  warn: 'text-[oklch(80%_0.12_75)]',
};

/** The terminal: output above, a prompt below. Up and down walk through earlier commands. */
export default function TerminalView({ terminal }) {
  const [draft, setDraft] = useState('');
  const [cursor, setCursor] = useState(null);
  const bottomRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ block: 'end' });
  }, [terminal.lines.length]);

  function handleKeyDown(event) {
    const { history } = terminal;
    if (event.key === 'Enter') {
      event.preventDefault();
      terminal.run(draft);
      setDraft('');
      setCursor(null);
    } else if (event.key === 'ArrowUp' && history.length) {
      event.preventDefault();
      const next = cursor === null ? history.length - 1 : Math.max(0, cursor - 1);
      setCursor(next);
      setDraft(history[next]);
    } else if (event.key === 'ArrowDown' && cursor !== null) {
      event.preventDefault();
      const next = cursor + 1;
      setCursor(next >= history.length ? null : next);
      setDraft(next >= history.length ? '' : history[next]);
    }
  }

  return (
    // Clicking anywhere in the output puts the cursor back on the prompt.
    <div
      className="h-full overflow-y-auto bg-ink px-4 py-3 font-mono text-[12.5px] leading-[1.65]"
      onClick={() => window.getSelection()?.isCollapsed && inputRef.current?.focus()}
    >
      <ol aria-live="polite" aria-label="Terminal output">
        {terminal.lines.map((line, index) => (
          <li key={index} className={`whitespace-pre-wrap break-words ${LINE_TONES[line.kind] ?? LINE_TONES.out}`}>
            {line.text || ' '}
          </li>
        ))}
      </ol>
      <label className="mt-1 flex items-center gap-2 text-paper-2">
        <span className="shrink-0 text-accent">{terminal.prompt}</span>
        <span className="sr-only">Terminal command</span>
        <input
          ref={inputRef}
          value={draft}
          disabled={terminal.busy}
          onChange={(event) => setDraft(event.target.value)}
          onKeyDown={handleKeyDown}
          spellCheck={false}
          autoComplete="off"
          placeholder={terminal.busy ? 'Running…' : ''}
          className="min-w-0 flex-1 bg-transparent text-paper-2 caret-accent outline-none placeholder:text-faint"
        />
      </label>
      <span ref={bottomRef} />
    </div>
  );
}
