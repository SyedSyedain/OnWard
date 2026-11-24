/**
 * Remembers, in this browser, the visitor's unfinished session and their latest work record,
 * so the home page can offer a way back in. Only ids and status are kept: a convenience,
 * never the source of truth.
 */

const STORAGE_KEY = 'onward:return';

export function rememberSession(session) {
  const saved = readStore();
  const next = { ...saved };

  if (session.status === 'submitted') {
    if (session.result?.recordId) next.recordId = session.result.recordId;
    if (saved.active?.id === session.id) next.active = null;
  } else {
    next.active = { id: session.id, status: session.status, issueId: session.ticket.issueId };
  }
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch {
    // Storage can be unavailable (private windows, blocked site data); the app works without it.
  }
}

/** @returns {{ active: { id, status, issueId } | null, recordId: string | null }} */
export function readReturnPoint() {
  const saved = readStore();
  return { active: saved.active ?? null, recordId: saved.recordId ?? null };
}

function readStore() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) ?? {};
  } catch {
    return {};
  }
}
