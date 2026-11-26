import { ArrowLeft, ClipboardList, Files, KeyRound, MessagesSquare, PanelLeftClose } from 'lucide-react';
import ManagerChat from './ManagerChat.jsx';
import ProjectExplorer from './ProjectExplorer.jsx';
import TaskPanel from './TaskPanel.jsx';

export const LEFT_VIEWS = [
  { id: 'files', label: 'Explorer', icon: Files },
  { id: 'task', label: 'Task', icon: ClipboardList },
  { id: 'manager', label: 'Manager', icon: MessagesSquare },
];

/** Shown only when the server runs in demo mode. */
export const SOLUTION_VIEW = { id: 'solution', label: 'Solution (demo)', icon: KeyRound };

const viewsFor = (demo) => (demo ? [...LEFT_VIEWS, SOLUTION_VIEW] : LEFT_VIEWS);

/** The left column: the project explorer, the task, or the manager conversation. */
export default function LeftPanel({ view, onView, onClose, showSwitcher, explorer, task, manager, solution }) {
  const views = viewsFor(Boolean(solution));
  const current = views.find((entry) => entry.id === view) ?? views[0];

  return (
    <div className="flex h-full min-h-0 flex-col bg-paper">
      <header className="flex h-11 shrink-0 items-center gap-1 border-b border-line px-2">
        {view === 'manager' && (
          <button
            type="button"
            onClick={() => onView('task')}
            aria-label="Back to the task"
            className="grid size-7 place-items-center rounded-md text-muted hover:bg-paper-3 hover:text-ink focus-visible:outline-2 focus-visible:outline-accent"
          >
            <ArrowLeft className="size-4" aria-hidden />
          </button>
        )}
        {showSwitcher ? (
          <div role="tablist" aria-label="Side panel" className="flex gap-0.5">
            {views.map((entry) => (
              <button
                key={entry.id}
                type="button"
                role="tab"
                aria-selected={entry.id === view}
                onClick={() => onView(entry.id)}
                className={`h-7 rounded-md px-2.5 font-ui text-[13px] focus-visible:outline-2 focus-visible:outline-accent ${
                  entry.id === view ? 'bg-paper-3 text-ink' : 'text-muted hover:text-ink'
                }`}
              >
                {entry.label}
              </button>
            ))}
          </div>
        ) : (
          <h2 className="px-1.5 font-ui text-[13px] font-medium text-ink">{current.label}</h2>
        )}
        <span className="flex-1" />
        <button
          type="button"
          onClick={onClose}
          aria-label="Hide the side panel"
          className="grid size-7 place-items-center rounded-md text-muted hover:bg-paper-3 hover:text-ink focus-visible:outline-2 focus-visible:outline-accent"
        >
          <PanelLeftClose className="size-4" aria-hidden />
        </button>
      </header>

      <div key={view} className="min-h-0 flex-1 overflow-y-auto animate-[fade-in_140ms_ease-out]">
        {view === 'files' && <div className="py-2">{explorer}</div>}
        {view === 'task' && task}
        {view === 'manager' && manager}
        {view === 'solution' && solution}
      </div>
    </div>
  );
}

/** The narrow icon strip beside the left column on wide screens. */
export function ActivityBar({ view, open, onSelect, demo = false }) {
  return (
    <nav
      aria-label="Workspace views"
      className="flex w-11 shrink-0 flex-col items-center gap-1 border-r border-line bg-paper py-2"
    >
      {viewsFor(demo).map((entry) => {
        const Icon = entry.icon;
        const active = open && entry.id === view;
        return (
          <button
            key={entry.id}
            type="button"
            title={entry.label}
            aria-label={entry.label}
            aria-pressed={active}
            onClick={() => onSelect(entry.id)}
            className={`relative grid size-9 place-items-center rounded-md transition-colors focus-visible:outline-2 focus-visible:outline-accent ${
              active ? 'bg-paper-3 text-ink' : 'text-faint hover:text-ink'
            }`}
          >
            {active && <span className="absolute -left-1 top-2 bottom-2 w-0.5 rounded-full bg-accent" aria-hidden />}
            <Icon className="size-[18px]" aria-hidden />
          </button>
        );
      })}
    </nav>
  );
}
