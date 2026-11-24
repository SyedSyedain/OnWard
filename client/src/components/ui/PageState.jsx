import { Loader2 } from 'lucide-react';
import ErrorBanner from './ErrorBanner.jsx';

/** Full-page loading or error state shown while a page's data is not ready. */
export default function PageState({ error }) {
  return (
    <div className="flex min-h-[60vh] items-center justify-center px-4">
      {error ? (
        <div className="w-full max-w-md">
          <ErrorBanner error={error} />
        </div>
      ) : (
        <Loader2 className="size-6 animate-spin text-slate-400" aria-label="Loading" />
      )}
    </div>
  );
}
