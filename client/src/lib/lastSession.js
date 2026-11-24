/**
 * Remembers, in this browser, the visitor's unfinished session and their latest work record,
 * so the home page can offer a way back in. Only ids and status are kept: a convenience,
 * never the source of truth.
 */

import { recordsApi } from '../api/recordsApi.js';
import { addToHistory } from './profile.js';
import { keepRecordCopy, readRecordCopy } from './recordCopies.js';

const STORAGE_KEY = 'onward:return';

export function rememberSession(session) {
  const saved = readStore();
  const next = { ...saved };

  if (session.status === 'submitted') {
    addToHistory(session);
    if (session.result?.recordId) {
      next.recordId = session.result.recordId;
      keepCopyOf(session.result.recordId);
    }
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

/** Forgets the unfinished session, e.g. when the server no longer has it. */
export function forgetActiveSession(sessionId) {
  const saved = readStore();
  if (saved.active?.id !== sessionId) return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...saved, active: null }));
  } catch {
    // Nothing to forget when storage is unavailable.
  }
}

/** Saves a signed copy of a new record in this browser, so it outlives a server restart. */
function keepCopyOf(recordId) {
  if (readRecordCopy(recordId)) return;
  recordsApi
    .get(recordId)
    .then(({ record, verified }) => verified && keepRecordCopy(record))
    .catch(() => {});
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
