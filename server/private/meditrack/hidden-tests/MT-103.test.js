import { test } from 'node:test';
import assert from 'node:assert/strict';
import { defaultDoctors, makeState } from '../helpers.js';
import { filterDoctors } from '../../src/lib/filtering.js';
import { selectVisibleDoctors } from '../../src/state/selectors.js';

test('[acceptance] typing a search keeps the selected specialty filter applied', () => {
  const names = filterDoctors(defaultDoctors(), { query: 'a', specialty: 'Dermatology' }).map((d) => d.name);
  assert.deepEqual(names, ['Arjun Rao', 'Anita Desai']);
  assert.deepEqual(filterDoctors(defaultDoctors(), { query: 'meera', specialty: 'Dermatology' }), []);
});

test('[acceptance] the visible doctors in the app state respect both filters', () => {
  const state = makeState({ filters: { query: 'an', specialty: 'Dermatology' } });
  assert.deepEqual(selectVisibleDoctors(state).map((d) => d.id), ['d-4']);
});

test('[acceptance] search alone and specialty alone still work', () => {
  assert.deepEqual(filterDoctors(defaultDoctors(), { query: 'khan', specialty: 'all' }).map((d) => d.id), ['d-3']);
  assert.deepEqual(filterDoctors(defaultDoctors(), { query: '', specialty: 'Pediatrics' }).map((d) => d.id), ['d-3']);
  assert.equal(filterDoctors(defaultDoctors(), { query: '', specialty: 'all' }).length, 4);
});
