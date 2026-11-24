import { AlertCircle } from 'lucide-react';

export default function ErrorBanner({ error }) {
  if (!error) return null;
  return (
    <div
      role="alert"
      className="flex items-start gap-2 rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800"
    >
      <AlertCircle className="mt-0.5 size-4 shrink-0" aria-hidden />
      <span>{error.message}</span>
    </div>
  );
}
