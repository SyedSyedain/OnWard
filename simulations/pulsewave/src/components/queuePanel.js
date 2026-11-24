/**
 * The upcoming-tracks panel.
 * @module components/queuePanel
 */

import { escapeHtml } from '../lib/html.js';
import { formatDuration } from '../lib/format.js';

/**
 * @param {{ tracks: object[] }} props
 * @returns {string}
 */
export function queuePanel({ tracks }) {
  const items = tracks.length
    ? tracks
        .map(
          (track, index) => `<li class="queue-item">
  <span class="queue-title">${escapeHtml(track.title)}</span>
  <span class="queue-duration">${formatDuration(track.durationSec)}</span>
  <button data-action="remove-from-queue" data-index="${index}" aria-label="Remove ${escapeHtml(track.title)} from queue">Remove</button>
</li>`,
        )
        .join('\n')
    : '<li class="empty">Your queue is empty.</li>';
  return `<aside class="queue" aria-label="Play queue">
  <h2>Up next</h2>
  <ol>
${items}
  </ol>
</aside>`;
}
