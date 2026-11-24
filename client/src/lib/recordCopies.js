/**
 * Signed copies of work records, so a record survives the API losing its data (the free host
 * wipes its disk when it restarts). The student's browser keeps a copy of each record it has seen,
 * and a record's link carries one after the # (never sent to any server), so a recruiter's link
 * keeps working too. The server re-checks the signature before trusting a copy.
 */

const STORAGE_KEY = 'onward:records';
const MAX_COPIES = 50;
const HASH_PREFIX = '#r=';

export function keepRecordCopy(record) {
  if (!record?.id || !record.signature) return;
  try {
    const copies = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '{}');
    copies[record.id] = record;
    const newest = Object.values(copies)
      .sort((a, b) => String(b.issuedAt).localeCompare(String(a.issuedAt)))
      .slice(0, MAX_COPIES);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(Object.fromEntries(newest.map((copy) => [copy.id, copy]))));
  } catch {
    // Storage unavailable: the link still carries a copy.
  }
}

export function readRecordCopy(recordId) {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '{}')[recordId] ?? null;
  } catch {
    return null;
  }
}

/** The copy carried in this page's link, if it is for this record. */
export function recordCopyFromHash(recordId) {
  const { hash } = window.location;
  if (!hash.startsWith(HASH_PREFIX)) return null;
  try {
    const bytes = Uint8Array.from(atob(hash.slice(HASH_PREFIX.length).replace(/-/g, '+').replace(/_/g, '/')), (char) =>
      char.charCodeAt(0),
    );
    const copy = JSON.parse(new TextDecoder().decode(bytes));
    return copy?.id === recordId ? copy : null;
  } catch {
    return null;
  }
}

/** Puts a copy of the record in the address bar, so copying the link shares one that survives restarts. */
export function putRecordCopyInLink(record) {
  const bytes = new TextEncoder().encode(JSON.stringify(record));
  let binary = '';
  bytes.forEach((byte) => {
    binary += String.fromCharCode(byte);
  });
  const encoded = btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  window.history.replaceState(window.history.state, '', `${window.location.pathname}${HASH_PREFIX}${encoded}`);
}
