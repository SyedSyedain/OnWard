import AppHeader from './AppHeader.jsx';

export default function PageLayout({ headerActions, width = 'max-w-6xl', children }) {
  return (
    <div className="min-h-screen bg-slate-50/60">
      <AppHeader>{headerActions}</AppHeader>
      <main className={`mx-auto ${width} px-4 py-8 sm:px-6`}>{children}</main>
    </div>
  );
}
