/**
 * The student's profile and ticket history, kept in this browser (no account, no database).
 * The profile is a name, an email and a role. The history is one summary per submitted ticket,
 * so the profile page can show totals, a streak and past results even after the API restarts.
 */

import { useSyncExternalStore } from 'react';

const PROFILE_KEY = 'onward:profile';
const HISTORY_KEY = 'onward:history';
const MAX_HISTORY = 200;
const listeners = new Set();

/** @returns {{ name: string, email: string, roleId: string, createdAt: string } | null} */
export function readProfile() {
  return read(PROFILE_KEY, null);
}

export function saveProfile({ name, email, roleId }) {
  const existing = readProfile();
  write(PROFILE_KEY, {
    name: name.trim(),
    email: email.trim(),
    roleId,
    createdAt: existing?.createdAt ?? new Date().toISOString(),
  });
}

/** Submitted tickets, newest first. */
export function readHistory() {
  return read(HISTORY_KEY, []);
}

/** Adds a submitted session to the history once. */
export function addToHistory(session) {
  if (session.status !== 'submitted' || !session.result) return;
  const history = readHistory();
  if (history.some((entry) => entry.sessionId === session.id)) return;

  const { score, testResult, recordId } = session.result;
  const entry = {
    sessionId: session.id,
    recordId,
    issueId: session.ticket.issueId,
    title: session.ticket.title,
    simulationName: session.simulationName,
    roleId: session.roleId,
    difficulty: session.ticket.difficulty,
    score,
    resolved: testResult.allPassed,
    hintsUsed: session.hintLevel,
    submittedAt: session.submittedAt ?? new Date().toISOString(),
  };
  const sorted = [entry, ...history].sort((a, b) => b.submittedAt.localeCompare(a.submittedAt));
  write(HISTORY_KEY, sorted.slice(0, MAX_HISTORY));
}

/** Re-renders when the profile or history changes, in this tab or another. */
export function useProfile() {
  const profile = useSyncExternalStore(subscribe, () => localStorageSnapshot(PROFILE_KEY));
  const history = useSyncExternalStore(subscribe, () => localStorageSnapshot(HISTORY_KEY));
  return { profile: parse(profile, null), history: parse(history, []) };
}

/** Totals for the profile page. */
export function summarise(history) {
  const resolved = history.filter((entry) => entry.resolved);
  const days = activityByDay(history);
  return {
    tickets: history.length,
    resolved: resolved.length,
    average: history.length ? Math.round(history.reduce((sum, entry) => sum + entry.score.total, 0) / history.length) : 0,
    best: history.reduce((best, entry) => Math.max(best, entry.score.total), 0),
    ...streaks(days),
    days,
  };
}

/** Number of submitted tickets per local day, keyed "YYYY-MM-DD". */
export function activityByDay(history) {
  const days = new Map();
  for (const entry of history) {
    const key = dayKey(new Date(entry.submittedAt));
    days.set(key, (days.get(key) ?? 0) + 1);
  }
  return days;
}

/** The current streak counts back from today, or from yesterday if nothing is done yet today. */
function streaks(days) {
  const has = (date) => days.has(dayKey(date));
  const cursor = new Date();
  if (!has(cursor)) cursor.setDate(cursor.getDate() - 1);
  let current = 0;
  while (has(cursor)) {
    current += 1;
    cursor.setDate(cursor.getDate() - 1);
  }

  const sorted = [...days.keys()].sort();
  let longest = 0;
  let run = 0;
  let previous = null;
  for (const key of sorted) {
    const date = new Date(`${key}T00:00:00`);
    run = previous && (date - previous) / 86_400_000 === 1 ? run + 1 : 1;
    longest = Math.max(longest, run);
    previous = date;
  }
  return { currentStreak: current, longestStreak: longest };
}

export function dayKey(date) {
  const pad = (value) => String(value).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

export function initials(name = '') {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0].toUpperCase())
    .join('');
}

// ── storage ──

function subscribe(listener) {
  listeners.add(listener);
  const onStorage = (event) => {
    if (event.key === PROFILE_KEY || event.key === HISTORY_KEY) listener();
  };
  window.addEventListener('storage', onStorage);
  return () => {
    listeners.delete(listener);
    window.removeEventListener('storage', onStorage);
  };
}

function localStorageSnapshot(key) {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

function read(key, fallback) {
  return parse(localStorageSnapshot(key), fallback);
}

function parse(raw, fallback) {
  try {
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function write(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Storage can be unavailable (private windows, blocked site data); the app still works.
  }
  listeners.forEach((listener) => listener());
}
