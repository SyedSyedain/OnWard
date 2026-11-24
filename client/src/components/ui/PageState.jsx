import { Loader2 } from 'lucide-react';
import ErrorBanner from './ErrorBanner.jsx';

/** Full-page loading or error state shown while a page's data is not ready. */
export default function PageState({ error }) {
  return (
    <div className="flex min-h-dvh items-center justify-center bg-paper px-4 font-ui">
      {error ? (
        <div className="w-full max-w-md">
          <ErrorBanner error={error} />
        </div>
      ) : (
        <Loader2 className="size-6 animate-spin text-faint" aria-label="Loading" />
      )}
    </div>
  );
}
