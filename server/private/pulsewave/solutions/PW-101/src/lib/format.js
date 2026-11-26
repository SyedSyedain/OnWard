/**
 * Formatting helpers for track and playlist lengths.
 * @module lib/format
 */

/**
 * Formats a track length as m:ss, for example 185 becomes "3:05".
 * @param {number} totalSeconds
 * @returns {string}
 */
export function formatDuration(totalSeconds) {
  if (!Number.isFinite(totalSeconds) || totalSeconds < 0) return '0:00';
  const whole = Math.floor(totalSeconds);
  const minutes = Math.floor(whole / 60);
  const seconds = whole % 60;
  return `${minutes}:${String(seconds).padStart(2, '0')}`;
}

/**
 * Formats a playlist length in words, for example "1 hr 5 min" or "13 min".
 * @param {number} totalSeconds
 * @returns {string}
 */
export function formatTotalDuration(totalSeconds) {
  const whole = Math.max(0, Math.floor(totalSeconds || 0));
  const hours = Math.floor(whole / 3600);
  const minutes = Math.floor((whole % 3600) / 60);
  return hours > 0 ? `${hours} hr ${minutes} min` : `${minutes} min`;
}
