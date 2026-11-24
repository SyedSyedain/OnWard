import { useCallback, useEffect, useState } from 'react';
import { sessionsApi } from '../api/sessionsApi.js';
import { forgetActiveSession, rememberSession } from '../lib/lastSession.js';

/** Loads a session and exposes a setter so pages can apply server updates. */
export function useSession(sessionId) {
  const [session, setSession] = useState(null);
  const [error, setError] = useState(null);

  const reload = useCallback(async () => {
    try {
      const data = await sessionsApi.get(sessionId);
      setSession(data.session);
      setError(null);
    } catch (loadError) {
      if (loadError.status === 404) forgetActiveSession(sessionId);
      setError(loadError);
    }
  }, [sessionId]);

  useEffect(() => {
    reload();
  }, [reload]);

  useEffect(() => {
    if (session) rememberSession(session);
  }, [session?.id, session?.status]);

  return { session, setSession, error, reload };
}
