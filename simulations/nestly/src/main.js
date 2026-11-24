/**
 * Browser entry point: mounts the app and wires up events.
 */

import { listings } from './data/listings.js';
import { createStore } from './lib/store.js';
import { createInitialState, reducer } from './state/reducer.js';
import { filterListings, sortListings, paginate, selectFavouriteListings } from './state/selectors.js';
import { searchFilters } from './components/searchFilters.js';
import { listingGrid } from './components/listingCard.js';
import { listingDetail } from './components/listingDetail.js';

const PAGE_SIZE = 6;
const root = document.getElementById('app');
const store = createStore(createInitialState(), reducer);
const today = new Date().toISOString().slice(0, 10);

function render() {
  const state = store.getState();
  const selected = listings.find((listing) => listing.id === state.selectedId);
  if (selected) {
    root.innerHTML = listingDetail(selected, state, today);
    return;
  }
  const results = sortListings(filterListings(listings, state.filters), state.filters.sort);
  const pageData = paginate(results, state.page, PAGE_SIZE);
  root.innerHTML = `${searchFilters(state.filters)}\n${listingGrid(pageData.items, state)}
<h2>Saved stays</h2>
${listingGrid(selectFavouriteListings(state, listings), state)}`;
}

root.addEventListener('click', (event) => {
  const target = event.target.closest('[data-action]');
  if (!target) return;
  if (target.dataset.action === 'toggle-favourite') store.dispatch({ type: 'favourites/toggle', id: target.dataset.id });
  if (target.dataset.action === 'open-listing') store.dispatch({ type: 'listing/select', id: target.dataset.id });
  if (target.dataset.action === 'back') store.dispatch({ type: 'listing/select', id: null });
  event.preventDefault();
});

root.addEventListener('change', (event) => {
  const form = event.target.form;
  if (!form) return;
  const data = new FormData(form);
  if (form.classList.contains('filters')) {
    store.dispatch({
      type: 'filters/set',
      changes: {
        query: data.get('query'),
        minPrice: data.get('minPrice') === '' ? null : Number(data.get('minPrice')),
        maxPrice: data.get('maxPrice') === '' ? null : Number(data.get('maxPrice')),
        guests: Number(data.get('guests')) || 1,
        amenities: data.getAll('amenity'),
        sort: data.get('sort'),
      },
    });
  } else if (form.classList.contains('booking')) {
    store.dispatch({
      type: 'stay/set',
      changes: { checkIn: data.get('checkIn'), checkOut: data.get('checkOut'), guests: Number(data.get('guests')) || 1 },
    });
  }
});

store.subscribe(render);
render();
