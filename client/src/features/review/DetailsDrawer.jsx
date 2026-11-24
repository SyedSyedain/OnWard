import { X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import DiffView from './DiffView.jsx';
import TestResultsPanel from './TestResultsPanel.jsx';

/** Every check and the full diff, in a side drawer so the results page itself stays on one screen. */
export default function DetailsDrawer({ open, onClose, testResult, diff }) {
  const dialogRef = useRef(null);
  const [tab, setTab] = useState('checks');

  useEffect(() => {
    const dialog = dialogRef.current;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  const tabs = [
    { id: 'checks', label: 'Checks', count: `${testResult.passedCount}/${testResult.totalCount}` },
    { id: 'changes', label: 'Your changes', count: diff.changedFiles.length },
  ];

  return (
    <dialog
      ref={dialogRef}
      onClose={onClose}
      onClick={(event) => event.target === dialogRef.current && onClose()}
      className="m-0 ml-auto h-dvh max-h-none w-[min(44rem,100%)] max-w-none bg-paper font-ui text-ink backdrop:bg-ink/40 print:hidden"
    >
      <div className="flex h-full flex-col">
        <header className="flex items-center gap-1 border-b border-line px-3 pt-3">
          <div role="tablist" aria-label="Details" className="flex gap-1">
            {tabs.map((item) => (
              <button
                key={item.id}
                type="button"
                role="tab"
                aria-selected={tab === item.id}
                onClick={() => setTab(item.id)}
                className={`-mb-px border-b-2 px-3 py-2 text-sm focus-visible:outline-2 focus-visible:outline-accent ${
                  tab === item.id ? 'border-accent font-medium' : 'border-transparent text-muted hover:text-ink'
                }`}
              >
                {item.label} <span className="ml-1 text-xs tabular-nums text-muted">{item.count}</span>
              </button>
            ))}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="mb-1 ml-auto rounded-md p-1.5 text-muted hover:bg-paper-3 hover:text-ink focus-visible:outline-2 focus-visible:outline-accent"
            aria-label="Close"
          >
            <X className="size-4" aria-hidden />
          </button>
        </header>
        <div role="tabpanel" className="min-h-0 flex-1 overflow-y-auto p-5">
          {tab === 'checks' ? <TestResultsPanel testResult={testResult} /> : <DiffView patch={diff.patch} />}
        </div>
      </div>
    </dialog>
  );
}
