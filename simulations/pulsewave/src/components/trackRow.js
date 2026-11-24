/**
 * One row in a playlist.
 * @module components/trackRow
 */

import { escapeHtml } from '../lib/html.js';
import { formatDuration } from '../lib/format.js';

/**
 * @param {{ track: object, isCurrent?: boolean }} props
 * @returns {string}
 */
export function trackRow({ track, isCurrent = false }) {
  const title = escapeHtml(track.title);
  const likeLabel = track.liked ? `Unlike ${track.title}` : `Like ${track.title}`;
  return `<li class="track-row${isCurrent ? ' is-current' : ''}" data-track-id="${escapeHtml(track.id)}">
  <button class="track-play" data-action="play" aria-label="Play ${title}">${title}</button>
  <span class="track-artist">${escapeHtml(track.artist)}</span>
  <span class="track-duration">${formatDuration(track.durationSec)}</span>
  <button class="track-like" data-action="like" aria-pressed="${track.liked ? 'true' : 'false'}" aria-label="${escapeHtml(likeLabel)}">${track.liked ? '♥' : '♡'}</button>
  <button class="track-queue" data-action="play-next" aria-label="Play ${title} next">Play next</button>
</li>`;
}
