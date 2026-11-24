/**
 * The bar pinned to the bottom of the page with playback controls.
 * @module components/nowPlayingBar
 */

import { escapeHtml } from '../lib/html.js';
import { formatDuration } from '../lib/format.js';

/**
 * @param {{ track?: object, isPlaying: boolean, shuffle: boolean, repeat: string }} props
 * @returns {string}
 */
export function nowPlayingBar({ track, isPlaying, shuffle, repeat }) {
  if (!track) {
    return '<footer class="now-playing is-empty"><p>Pick a track to start listening.</p></footer>';
  }
  return `<footer class="now-playing">
  <div class="now-playing-info">
    <strong class="now-playing-title">${escapeHtml(track.title)}</strong>
    <span class="now-playing-artist">${escapeHtml(track.artist)}</span>
    <span class="now-playing-length">${formatDuration(track.durationSec)}</span>
  </div>
  <div class="now-playing-controls">
    <button data-action="toggle-shuffle" aria-pressed="${shuffle ? 'true' : 'false'}" aria-label="Shuffle">Shuffle</button>
    <button data-action="previous" aria-label="Previous track">&#9198;</button>
    <button data-action="toggle-play" class="play-toggle">${isPlaying ? '&#9208;' : '&#9654;'}</button>
    <button data-action="next" aria-label="Next track">&#9197;</button>
    <button data-action="cycle-repeat" aria-label="Repeat: ${escapeHtml(repeat)}">Repeat</button>
  </div>
</footer>`;
}
