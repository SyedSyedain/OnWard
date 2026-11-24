/**
 * Renders the whole page from the current state.
 * @module app
 */

import {
  selectActivePlaylist,
  selectNowPlaying,
  selectPlaylistDuration,
  selectQueueTracks,
  selectVisibleTracks,
} from './state/selectors.js';
import { escapeHtml } from './lib/html.js';
import { searchBox } from './components/searchBox.js';
import { playlistView } from './components/playlistView.js';
import { queuePanel } from './components/queuePanel.js';
import { nowPlayingBar } from './components/nowPlayingBar.js';

/**
 * @param {object} state
 * @returns {string}
 */
export function renderApp(state) {
  const playlist = selectActivePlaylist(state);
  const nav = state.playlists
    .map(
      (p) =>
        `<button data-action="open-playlist" data-playlist-id="${escapeHtml(p.id)}"${p.id === state.activePlaylistId ? ' aria-current="true"' : ''}>${escapeHtml(p.name)}</button>`,
    )
    .join('\n');
  const main = playlist
    ? playlistView({
        playlist,
        tracks: selectVisibleTracks(state),
        totalSeconds: selectPlaylistDuration(state),
        currentId: state.currentId,
      })
    : '<p class="empty">Select a playlist.</p>';
  return `<header><h1>Pulsewave</h1><nav aria-label="Playlists">${nav}</nav></header>
<main>
${searchBox({ query: state.query })}
${main}
${queuePanel({ tracks: selectQueueTracks(state) })}
</main>
${nowPlayingBar({
  track: selectNowPlaying(state),
  isPlaying: state.isPlaying,
  shuffle: state.shuffle,
  repeat: state.repeat,
})}`;
}
