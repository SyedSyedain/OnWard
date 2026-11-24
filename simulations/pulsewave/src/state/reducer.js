/**
 * The actions the player understands.
 * Tracks are referred to by id in playlists, the queue and the player.
 * @module state/reducer
 */

import { shuffle } from '../lib/shuffle.js';

const REPEAT_MODES = ['off', 'all', 'one'];

/**
 * Builds the starting state for a catalogue.
 * @param {{ tracks: object[], playlists: object[] }} seed
 */
export function createInitialState(seed) {
  return {
    tracks: seed.tracks,
    playlists: seed.playlists,
    activePlaylistId: seed.playlists[0]?.id ?? null,
    query: '',
    queue: [],
    currentId: null,
    isPlaying: false,
    shuffle: false,
    repeat: 'off',
  };
}

/**
 * Creates the reducer for a catalogue. The seed is kept so a session reset can start over.
 * @param {{ tracks: object[], playlists: object[] }} seed
 * @returns {(state: object, action: object) => object}
 */
export function createAppReducer(seed) {
  return function reducer(state, action) {
    switch (action.type) {
      case 'library/search':
        return { ...state, query: action.query };

      case 'playlist/open':
        return { ...state, activePlaylistId: action.playlistId, query: '' };

      case 'player/play':
        return { ...state, currentId: action.trackId, isPlaying: true };

      case 'player/toggle':
        if (state.currentId === null) return state;
        return { ...state, isPlaying: !state.isPlaying };

      case 'player/next': {
        if (state.repeat === 'one' && state.currentId !== null) return state;
        const [nextId, ...rest] = state.queue;
        if (nextId === undefined) return { ...state, isPlaying: false };
        return { ...state, currentId: nextId, queue: rest, isPlaying: true };
      }

      case 'player/toggleShuffle':
        return { ...state, shuffle: !state.shuffle };

      case 'player/cycleRepeat': {
        const index = REPEAT_MODES.indexOf(state.repeat);
        return { ...state, repeat: REPEAT_MODES[(index + 1) % REPEAT_MODES.length] };
      }

      case 'queue/add':
        return { ...state, queue: [...state.queue, action.trackId] };

      case 'queue/playNext':
        return { ...state, queue: [...state.queue, action.trackId] };

      case 'queue/remove':
        return { ...state, queue: state.queue.filter((_, index) => index !== action.index) };

      case 'queue/clear':
        return { ...state, queue: [] };

      case 'queue/shuffle':
        return { ...state, queue: shuffle(state.queue, action.random) };

      case 'track/toggleLike': {
        const track = state.tracks.find((t) => t.id === action.trackId);
        if (!track) return state;
        track.liked = !track.liked;
        return { ...state, tracks: [...state.tracks] };
      }

      case 'session/reset':
        return createInitialState(seed);

      default:
        return state;
    }
  };
}
