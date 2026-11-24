import { ChevronDown, ChevronUp, FlaskConical, Loader2 } from 'lucide-react';

const TABS = [
  { id: 'terminal', label: 'Terminal' },
  { id: 'tests', label: 'Test results' },
  { id: 'problems', label: 'Problems' },
];

/** The panel under the editor. Its header stays visible when it is collapsed. */
export default function BottomPanel({ open, onToggle, tab, onTab, counts, testing, onRunTests, children }) {
  function selectTab(id) {
    onTab(id);
    if (!open) onToggle();
  }

  return (
    <section
      aria-label="Terminal, tests and problems"
      className={`flex shrink-0 flex-col border-t border-line bg-paper transition-[height] duration-200 ease-out ${
        open ? 'h-[min(260px,38vh)]' : 'h-10'
      }`}
    >
      <div className="flex h-10 shrink-0 items-center gap-1 px-2">
        <div role="tablist" aria-label="Panels" className="flex min-w-0 flex-1 items-center gap-0.5 overflow-x-auto">
          {TABS.map((item) => {
            const active = open && tab === item.id;
            const count = counts[item.id];
            return (
              <button
                key={item.id}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => selectTab(item.id)}
                className={`flex h-7 shrink-0 items-center gap-1.5 rounded-md px-2.5 font-ui text-[13px] transition-colors focus-visible:outline-2 focus-visible:outline-accent ${
                  active ? 'bg-paper-3 text-ink' : 'text-muted hover:text-ink'
                }`}
              >
                {item.label}
                {count && (
                  <span
                    className={`rounded px-1.5 text-[11px] font-medium leading-4 ${
                      count.tone === 'bad'
                        ? 'bg-bad-soft text-bad'
                        : count.tone === 'ok'
                          ? 'bg-ok-soft text-ok'
                          : 'bg-paper-3 text-muted'
                    }`}
                  >
                    {count.label}
                  </span>
                )}
              </button>
            );
          })}
        </div>
        <button
          type="button"
          onClick={onRunTests}
          disabled={testing}
          aria-label="Run tests"
          className="flex h-7 shrink-0 items-center gap-1.5 rounded-md px-2.5 font-ui text-[13px] text-ink-2 hover:bg-paper-3 disabled:text-faint focus-visible:outline-2 focus-visible:outline-accent"
        >
          {testing ? (
            <Loader2 className="size-3.5 animate-spin" aria-hidden />
          ) : (
            <FlaskConical className="size-3.5" aria-hidden />
          )}
          <span className="hidden sm:inline">Run tests</span>
        </button>
        <button
          type="button"
          onClick={onToggle}
          aria-expanded={open}
          aria-label={open ? 'Collapse panel' : 'Expand panel'}
          className="grid size-7 shrink-0 place-items-center rounded-md text-muted hover:bg-paper-3 hover:text-ink focus-visible:outline-2 focus-visible:outline-accent"
        >
          {open ? <ChevronDown className="size-4" aria-hidden /> : <ChevronUp className="size-4" aria-hidden />}
        </button>
      </div>
      {open && <div className="min-h-0 flex-1 overflow-y-auto border-t border-line bg-paper-2">{children}</div>}
    </section>
  );
}
