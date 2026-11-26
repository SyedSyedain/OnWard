/**
 * The student's profile and ticket history, kept in this browser (no account, no database).
 * The profile is a name, an email and a role. The history is one summary per submitted ticket,
 * kept per email, so logging out and back in with the same email brings the tickets back.
 */

import { useSyncExternalStore } from 'react';

const PROFILE_KEY = 'onward:profile';
const LEGACY_HISTORY_KEY = 'onward:history';
const RETURN_KEY = 'onward:return';
const MAX_HISTORY = 200;
const listeners = new Set();

const historyKey = (email) => `onward:history:${(email ?? 'guest').trim().toLowerCase()}`;

/** @returns {{ name: string, email: string, roleId: string, createdAt: string } | null} */
export function readProfile() {
  return read(PROFILE_KEY, null);
}

export function saveProfile({ name, email, roleId }) {
  const existing = readProfile();
  const sameEmail = existing && existing.email.toLowerCase() === email.trim().toLowerCase();
  // A changed email takes its tickets along, unless that email already has some here.
  if (existing && !sameEmail && read(historyKey(email), []).length === 0) {
    write(historyKey(email), read(historyKey(existing.email), []));
  }
  write(PROFILE_KEY, {
    name: name.trim(),
    email: email.trim(),
    roleId,
    createdAt: sameEmail ? existing.createdAt : new Date().toISOString(),
  });
  migrateLegacyHistory();
}

/** Submitted tickets for the signed-in student, newest first. */
export function readHistory() {
  return read(currentHistoryKey(), []);
}

/** Adds a submitted session to the history once. */
export function addToHistory(session) {
  if (session.status !== 'submitted' || !session.result) return;
  const key = currentHistoryKey();
  const history = read(key, []);
  if (history.some((entry) => entry.sessionId === session.id)) return;

  const { score, testResult, recordId } = session.result;
  const entry = {
    sessionId: session.id,
    recordId,
    studentName: session.studentName,
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
  write(key, sorted.slice(0, MAX_HISTORY));
}

/**
 * The profile shown when nobody has saved one: the name from their latest ticket
 * (or "Guest"), their latest role, and the date of their first ticket.
 */
export function guestProfile(history) {
  const latest = history[0];
  const first = history.at(-1);
  return {
    name: latest?.studentName && latest.studentName !== 'Guest' ? latest.studentName : 'Guest',
    email: '',
    roleId: latest?.roleId ?? 'frontend-developer',
    createdAt: first?.submittedAt ?? new Date().toISOString(),
  };
}

/** Re-renders when the profile or history changes, in this tab or another. */
export function useProfile() {
  const profile = useSyncExternalStore(subscribe, () => localStorageSnapshot(PROFILE_KEY));
  const history = useSyncExternalStore(subscribe, () => localStorageSnapshot(currentHistoryKey()));
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

// ── progress ──

const LEVEL_XP = 150;
const LEVEL_TITLES = ['Intern', 'Junior', 'Associate', 'Engineer', 'Senior', 'Staff', 'Principal'];

/** Every point scored is one XP; each level takes 150. */
export function levelFor(history) {
  const xp = history.reduce((sum, entry) => sum + entry.score.total, 0);
  const level = Math.floor(xp / LEVEL_XP) + 1;
  return {
    xp,
    level,
    title: LEVEL_TITLES[Math.min(level, LEVEL_TITLES.length) - 1],
    into: xp % LEVEL_XP,
    toNext: LEVEL_XP - (xp % LEVEL_XP),
    span: LEVEL_XP,
  };
}

/** Badges, each with how close the student is to earning it. */
export function badgesFor(history, stats) {
  const resolved = history.filter((entry) => entry.resolved);
  const roles = new Set(resolved.map((entry) => entry.roleId));
  const best = stats.best;
  return [
    { id: 'first', name: 'First ticket', goal: 'Submit a ticket', have: Math.min(history.length, 1), need: 1 },
    { id: 'fix', name: 'First fix', goal: 'Resolve a ticket', have: Math.min(resolved.length, 1), need: 1 },
    { id: 'streak', name: 'On a roll', goal: 'Work 3 days in a row', have: Math.min(stats.longestStreak, 3), need: 3 },
    { id: 'sharp', name: 'Sharp', goal: 'Score 90 or more', have: Math.min(best, 90), need: 90 },
    {
      id: 'solo',
      name: 'Solo',
      goal: 'Resolve a ticket with no hints',
      have: resolved.some((entry) => !entry.hintsUsed) ? 1 : 0,
      need: 1,
    },
    {
      id: 'deep',
      name: 'Deep end',
      goal: 'Resolve a hard ticket',
      have: resolved.some((entry) => entry.difficulty === 'hard') ? 1 : 0,
      need: 1,
    },
    { id: 'stack', name: 'Full stack', goal: 'Resolve a frontend and a backend ticket', have: roles.size, need: 2 },
    { id: 'ten', name: 'Ten down', goal: 'Submit 10 tickets', have: Math.min(history.length, 10), need: 10 },
  ].map((badge) => ({ ...badge, earned: badge.have >= badge.need }));
}

// ── storage ──

function subscribe(listener) {
  listeners.add(listener);
  const onStorage = (event) => {
    if (event.key === PROFILE_KEY || event.key?.startsWith('onward:history')) listener();
  };
  window.addEventListener('storage', onStorage);
  return () => {
    listeners.delete(listener);
    window.removeEventListener('storage', onStorage);
  };
}

/** Where the signed-in student's tickets live. */
function currentHistoryKey() {
  return historyKey(readProfile()?.email);
}

/** History saved before tickets were kept per email moves to the signed-in student, once. */
function migrateLegacyHistory() {
  try {
    const profile = readProfile();
    const legacy = localStorage.getItem(LEGACY_HISTORY_KEY);
    if (!profile || !legacy) return;
    const key = historyKey(profile.email);
    if (!localStorage.getItem(key)) localStorage.setItem(key, legacy);
    localStorage.removeItem(LEGACY_HISTORY_KEY);
  } catch {
    // Storage unavailable: nothing to move.
  }
}

migrateLegacyHistory();

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
