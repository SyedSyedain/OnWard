/**
 * Browser entry point: mounts the app and turns clicks into actions.
 * @module main
 */

import { createSeed } from './data/seed.js';
import { createStore } from './state/store.js';
import { createAppReducer, createInitialState } from './state/reducer.js';
import { renderApp } from './app.js';

const seed = createSeed();
const store = createStore(createInitialState(seed), createAppReducer(seed));
const root = document.getElementById('app');

function render() {
  root.innerHTML = renderApp(store.getState());
}

root.addEventListener('click', (event) => {
  const button = event.target.closest('[data-action]');
  if (!button) return;
  const trackId = button.closest('[data-track-id]')?.dataset.trackId;
  switch (button.dataset.action) {
    case 'play': return store.dispatch({ type: 'player/play', trackId });
    case 'like': return store.dispatch({ type: 'track/toggleLike', trackId });
    case 'play-next': return store.dispatch({ type: 'queue/playNext', trackId });
    case 'toggle-play': return store.dispatch({ type: 'player/toggle' });
    case 'next': return store.dispatch({ type: 'player/next' });
    case 'toggle-shuffle': return store.dispatch({ type: 'player/toggleShuffle' });
    case 'cycle-repeat': return store.dispatch({ type: 'player/cycleRepeat' });
    case 'open-playlist': return store.dispatch({ type: 'playlist/open', playlistId: button.dataset.playlistId });
    case 'remove-from-queue': return store.dispatch({ type: 'queue/remove', index: Number(button.dataset.index) });
  }
});

root.addEventListener('input', (event) => {
  if (event.target.id === 'search-input') store.dispatch({ type: 'library/search', query: event.target.value });
});

store.subscribe(render);
render();
