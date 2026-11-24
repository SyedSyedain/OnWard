import { Loader2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { onServerWaking, wakeServer } from '../../api/httpClient.js';

/**
 * Wakes the API when the app opens, and shows a small note while a request waits on it,
 * so a slow first load reads as "starting up", not as broken.
 */
export default function ServerWakeNotice() {
  const [waking, setWaking] = useState(false);

  useEffect(() => {
    wakeServer();
    return onServerWaking(setWaking);
  }, []);

  if (!waking) return null;
  return (
    <div
      role="status"
      className="fixed bottom-4 left-1/2 z-[1000] flex w-[min(92vw,420px)] -translate-x-1/2 items-center gap-3 rounded-2xl bg-ink px-4 py-3 font-ui text-sm text-paper-2 shadow-[0_18px_40px_-16px] shadow-ink/60 animate-[rise-in_200ms_ease-out]"
    >
      <Loader2 className="size-4 shrink-0 animate-spin text-accent" aria-hidden />
      <span>Waking up the server. The first load can take up to a minute.</span>
    </div>
  );
}
