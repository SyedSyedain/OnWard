import { test } from 'node:test';
import assert from 'node:assert/strict';
import { makeAppointments, makeState } from '../helpers.js';
import { paginate } from '../../src/lib/pagination.js';
import { selectAppointmentsPage } from '../../src/state/selectors.js';

const numbers = (count) => Array.from({ length: count }, (_, i) => i + 1);

test('[acceptance] each page holds exactly one page of items', () => {
  assert.deepEqual(paginate(numbers(12), 1, 5).items, [1, 2, 3, 4, 5]);
  assert.deepEqual(paginate(numbers(12), 2, 5).items, [6, 7, 8, 9, 10]);
});

test('[acceptance] no appointment appears on two pages', () => {
  const state = (page) => makeState({ appointments: makeAppointments(12), appointmentPage: page });
  const seen = [1, 2, 3].flatMap((page) => selectAppointmentsPage(state(page)).items.map((a) => a.id));
  assert.equal(seen.length, 12);
  assert.equal(new Set(seen).size, 12);
});

test('[acceptance] the last page and short lists are unchanged', () => {
  assert.deepEqual(paginate(numbers(12), 3, 5).items, [11, 12]);
  assert.deepEqual(paginate(numbers(3), 1, 5).items, [1, 2, 3]);
  assert.equal(paginate(numbers(12), 3, 5).totalPages, 3);
});
