/**
 * Derived values computed from the state.
 * @module state/selectors
 */

/**
 * Returns the track with the given id, if any.
 * @param {object} state
 * @param {string | null} id
 */
export function selectTrackById(state, id) {
  return state.tracks.find((track) => track.id === id);
}

/**
 * Keeps the tracks whose title or artist contains the search text.
 * @param {object[]} tracks
 * @param {string} query
 */
export function filterTracks(tracks, query) {
  const text = (query ?? '').trim().toLowerCase();
  if (!text) return tracks;
  return tracks.filter(
    (track) => track.title.toLowerCase().includes(text) || track.artist.toLowerCase().includes(text),
  );
}

/** @param {object} state */
export function selectActivePlaylist(state) {
  return state.playlists.find((playlist) => playlist.id === state.activePlaylistId);
}

/**
 * Tracks of the open playlist that match the current search.
 * @param {object} state
 */
export function selectVisibleTracks(state) {
  const playlist = selectActivePlaylist(state);
  if (!playlist) return [];
  const tracks = playlist.trackIds.map((id) => selectTrackById(state, id)).filter(Boolean);
  return filterTracks(tracks, state.query);
}

/**
 * Total length in seconds of every track in the open playlist.
 * @param {object} state
 */
export function selectPlaylistDuration(state) {
  const playlist = selectActivePlaylist(state);
  if (!playlist) return 0;
  return playlist.trackIds.reduce((sum, id) => sum + (selectTrackById(state, id)?.durationSec ?? 0), 0);
}

/** @param {object} state */
export function selectQueueTracks(state) {
  return state.queue.map((id) => selectTrackById(state, id)).filter(Boolean);
}

/** @param {object} state */
export function selectLikedTracks(state) {
  return state.tracks.filter((track) => track.liked);
}

/** @param {object} state */
export function selectNowPlaying(state) {
  return state.currentId === null ? undefined : selectTrackById(state, state.currentId);
}
