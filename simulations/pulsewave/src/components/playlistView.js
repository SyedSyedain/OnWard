/**
 * The open playlist with its tracks.
 * @module components/playlistView
 */

import { escapeHtml } from '../lib/html.js';
import { formatTotalDuration } from '../lib/format.js';
import { trackRow } from './trackRow.js';

/**
 * @param {{ playlist: object, tracks: object[], totalSeconds: number, currentId: string | null }} props
 * @returns {string}
 */
export function playlistView({ playlist, tracks, totalSeconds, currentId }) {
  const rows = tracks.length
    ? tracks.map((track) => trackRow({ track, isCurrent: track.id === currentId })).join('\n')
    : '<li class="empty">No tracks match your search.</li>';
  return `<section class="playlist" aria-labelledby="playlist-title">
  <h2 id="playlist-title">${escapeHtml(playlist.name)}</h2>
  <p class="playlist-meta">${playlist.trackIds.length} tracks, ${formatTotalDuration(totalSeconds)}</p>
  <ul class="track-list">
${rows}
  </ul>
</section>`;
}
