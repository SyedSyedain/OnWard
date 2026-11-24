import { Link } from 'react-router-dom';

export default function AppHeader({ children }) {
  return (
    <header className="sticky top-0 z-10 border-b border-slate-200 bg-white/90 backdrop-blur">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6">
        <Link to="/" className="flex items-center gap-2 font-semibold text-slate-900">
          <img src="/favicon.svg" alt="" className="size-7" />
          OnWard
        </Link>
        <div className="flex items-center gap-2">{children}</div>
      </div>
    </header>
  );
}
