import { Check, CircleAlert, FlaskConical, Loader2, PanelLeft, Send, Users } from 'lucide-react';
import { Link } from 'react-router-dom';
import Mark from '../../../components/brand/Mark.jsx';
import { ROLES } from '../../../lib/constants.js';

const STATUS_TONES = {
  ok: 'bg-ok-soft text-ok',
  bad: 'bg-bad-soft text-bad',
  neutral: 'bg-paper-3 text-ink-2',
  busy: 'bg-accent-soft text-ink',
};

/** The Codespace header: where you are, how the task stands, and the actions that move it on. */
export default function TopBar({
  session,
  taskStatus,
  saveStatus,
  testing,
  narrow,
  teamOpen,
  onToggleFiles,
  onOpenTask,
  onToggleTeam,
  onRunTests,
  onSubmit,
}) {
  return (
    <header className="flex h-12 min-w-0 shrink-0 items-center gap-2 overflow-hidden bg-ink px-2 font-ui text-paper-2 sm:gap-3 sm:px-3">
      {narrow && (
        <IconButton label="Files and task" onClick={onToggleFiles}>
          <PanelLeft className="size-4" aria-hidden />
        </IconButton>
      )}

      <Link
        to="/"
        className="flex shrink-0 items-center gap-2 rounded-md px-1 py-1 font-display text-[15px] font-semibold focus-visible:outline-2 focus-visible:outline-accent"
        aria-label="OnWard home"
      >
        <Mark className="size-6" ringClassName="fill-paper-2" arrowClassName="fill-accent" />
        <span className="hidden sm:inline">OnWard</span>
      </Link>

      <span className="hidden h-5 w-px bg-ink-3 md:block" aria-hidden />
      <p className="hidden min-w-0 flex-col leading-tight md:flex">
        <span className="truncate text-[13px] font-medium">{session.simulationName}</span>
        <span className="truncate text-[11px] text-faint">{ROLES.find((role) => role.id === session.roleId)?.title ?? session.roleId}</span>
      </p>

      <button
        type="button"
        onClick={onOpenTask}
        title="Open the task"
        className="ml-1 flex min-w-0 items-center gap-2 rounded-md border border-ink-3 px-2 py-1 hover:border-faint focus-visible:outline-2 focus-visible:outline-accent"
      >
        <span className="font-mono text-xs">{session.ticket.issueId}</span>
        <span
          className={`hidden rounded px-1.5 text-[11px] font-medium leading-5 sm:inline ${STATUS_TONES[taskStatus.tone]}`}
        >
          {taskStatus.label}
        </span>
      </button>

      <span className="flex-1" />

      <p className="hidden shrink-0 items-center gap-1.5 text-xs text-faint xl:flex" role="status">
        {saveStatus.tone === 'busy' && <Loader2 className="size-3.5 animate-spin" aria-hidden />}
        {saveStatus.tone === 'ok' && <Check className="size-3.5" aria-hidden />}
        {saveStatus.tone === 'bad' && <CircleAlert className="size-3.5 text-[oklch(72%_0.16_30)]" aria-hidden />}
        {saveStatus.label}
      </p>

      <button
        type="button"
        onClick={onRunTests}
        disabled={testing}
        className="hidden h-8 shrink-0 items-center gap-1.5 rounded-md border border-ink-3 px-2.5 text-[13px] hover:border-faint disabled:text-faint md:flex focus-visible:outline-2 focus-visible:outline-accent"
      >
        {testing ? (
          <Loader2 className="size-3.5 animate-spin" aria-hidden />
        ) : (
          <FlaskConical className="size-3.5" aria-hidden />
        )}
        Run tests
      </button>

      <IconButton label={teamOpen ? 'Hide the team' : 'Show the team'} pressed={teamOpen} onClick={onToggleTeam}>
        <Users className="size-4" aria-hidden />
      </IconButton>

      <button
        type="button"
        onClick={onSubmit}
        className="flex h-8 shrink-0 items-center gap-1.5 rounded-md bg-accent px-3 text-[13px] font-medium text-ink hover:bg-accent-strong focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-paper-2"
      >
        <Send className="size-3.5" aria-hidden />
        Get review
      </button>
    </header>
  );
}

function IconButton({ label, pressed, children, ...props }) {
  return (
    <button
      type="button"
      title={label}
      aria-label={label}
      aria-pressed={pressed}
      className={`grid size-8 shrink-0 place-items-center rounded-md transition-colors focus-visible:outline-2 focus-visible:outline-accent ${
        pressed ? 'bg-ink-3 text-paper-2' : 'text-faint hover:bg-ink-2 hover:text-paper-2'
      }`}
      {...props}
    >
      {children}
    </button>
  );
}
