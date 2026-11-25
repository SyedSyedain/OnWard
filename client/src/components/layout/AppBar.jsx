import { Link } from 'react-router-dom';
import { ROLES } from '../../lib/constants.js';
import Mark from '../brand/Mark.jsx';

/** The dark OnWard bar above the briefing and results pages: logo, where you are, and the page's actions. */
export default function AppBar({ session, note, children }) {
  const role = session ? (ROLES.find((item) => item.id === session.roleId)?.title ?? session.roleId) : null;

  return (
    <header className="sticky top-0 z-10 bg-ink font-ui text-paper-2 print:hidden">
      <div className="mx-auto flex h-12 max-w-6xl items-center gap-3 px-4 sm:px-6">
        <Link
          to="/"
          className="flex items-center gap-2 rounded-md py-1 font-display text-[15px] font-semibold focus-visible:outline-2 focus-visible:outline-accent"
          aria-label="OnWard home"
        >
          <Mark className="size-6" ringClassName="fill-paper-2" arrowClassName="fill-accent" />
          <span className="hidden sm:inline">OnWard</span>
        </Link>
        {session && (
          <>
            <span className="hidden h-5 w-px bg-ink-3 sm:block" aria-hidden />
            <p className="hidden min-w-0 flex-col leading-tight sm:flex">
              <span className="truncate text-[13px] font-medium">{session.simulationName}</span>
              <span className="truncate text-[11px] text-faint">{role}</span>
            </p>
          </>
        )}
        <span className="flex-1" />
        {note && <span className="hidden text-xs text-faint md:inline">{note}</span>}
        {children}
      </div>
    </header>
  );
}
