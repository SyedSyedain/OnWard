/**
 * Calendar-date helpers. Dates are plain 'YYYY-MM-DD' strings so that they sort
 * and compare correctly as text and never depend on a time zone.
 */

const MS_PER_DAY = 24 * 60 * 60 * 1000;

function toUtc(isoDate) {
  return Date.parse(`${isoDate}T00:00:00Z`);
}

/** Returns true when the value looks like a real 'YYYY-MM-DD' date. */
export function isIsoDate(value) {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  return new Date(toUtc(value)).toISOString().slice(0, 10) === value;
}

/** Returns the date `days` days after `isoDate` (negative values go back). */
export function addDays(isoDate, days) {
  return new Date(toUtc(isoDate) + days * MS_PER_DAY).toISOString().slice(0, 10);
}

/** Whole days from `from` to `to`. Positive when `to` is later. */
export function daysBetween(from, to) {
  return Math.round((toUtc(to) - toUtc(from)) / MS_PER_DAY);
}
