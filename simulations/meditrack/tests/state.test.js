import { test } from 'node:test';
import assert from 'node:assert/strict';
import { filterDoctors, listSpecialties } from '../src/lib/filtering.js';
import { paginate } from '../src/lib/pagination.js';
import { createStore } from '../src/lib/store.js';
import { reducer } from '../src/state/reducer.js';
import {
  selectBookedSlotIds,
  selectSlotsByDay,
  selectUpcomingAppointments,
  selectVisibleDoctors,
} from '../src/state/selectors.js';
import { defaultDoctors, makeAppointment, makeAppointments, makeSlot, makeState } from './helpers.js';

test('filterDoctors returns everyone with no filters', () => {
  assert.equal(filterDoctors(defaultDoctors(), {}).length, 4);
});

test('filterDoctors filters by specialty alone', () => {
  const names = filterDoctors(defaultDoctors(), { specialty: 'Dermatology' }).map((d) => d.name);
  assert.deepEqual(names, ['Arjun Rao', 'Anita Desai']);
});

test('filterDoctors searches names case-insensitively', () => {
  const names = filterDoctors(defaultDoctors(), { query: '  RAO ' }).map((d) => d.name);
  assert.deepEqual(names, ['Arjun Rao']);
});

test('listSpecialties is sorted and unique', () => {
  assert.deepEqual(listSpecialties(defaultDoctors()), ['Cardiology', 'Dermatology', 'Pediatrics']);
});

test('paginate reports total pages and paging flags', () => {
  const result = paginate(Array.from({ length: 11 }, (_, i) => i), 1, 5);
  assert.equal(result.totalPages, 3);
  assert.equal(result.totalItems, 11);
  assert.equal(result.hasPrev, false);
  assert.equal(result.hasNext, true);
});

test('paginate returns the last partial page and handles an empty list', () => {
  const last = paginate(Array.from({ length: 11 }, (_, i) => i), 3, 5);
  assert.deepEqual(last.items, [10]);
  assert.equal(last.hasNext, false);
  const empty = paginate([], 1, 5);
  assert.equal(empty.totalPages, 1);
  assert.deepEqual(empty.items, []);
});

test('store notifies subscribers when state changes', () => {
  const store = createStore(reducer, makeState());
  const seen = [];
  const unsubscribe = store.subscribe((s) => seen.push(s.filters.query));
  store.dispatch({ type: 'filters/changed', changes: { query: 'mee' } });
  unsubscribe();
  store.dispatch({ type: 'filters/changed', changes: { query: 'meer' } });
  assert.deepEqual(seen, ['mee']);
});

test('selecting a doctor clears the selected slot', () => {
  const state = makeState({ selectedSlotId: 's-1' });
  const next = reducer(state, { type: 'doctor/selected', doctorId: 'd-2' });
  assert.equal(next.selectedDoctorId, 'd-2');
  assert.equal(next.selectedSlotId, null);
});

test('booking adds an appointment and clears the slot', () => {
  const state = makeState({ selectedSlotId: 's-1' });
  const next = reducer(state, { type: 'booking/submitted', appointment: makeAppointment() });
  assert.equal(next.appointments.length, 1);
  assert.equal(next.selectedSlotId, null);
  assert.equal(state.appointments.length, 0);
});

test('selectVisibleDoctors applies the filters in state', () => {
  const state = makeState({ filters: { query: '', specialty: 'Pediatrics' } });
  assert.deepEqual(selectVisibleDoctors(state).map((d) => d.id), ['d-3']);
});

test('selectSlotsByDay groups and sorts slots, and frees cancelled bookings', () => {
  const state = makeState({
    selectedDoctorId: 'd-1',
    slots: [
      makeSlot({ id: 's-3', date: '2026-12-03', time: '10:00' }),
      makeSlot({ id: 's-2', date: '2026-12-02', time: '14:00' }),
      makeSlot({ id: 's-1', date: '2026-12-02', time: '09:00' }),
      makeSlot({ id: 's-9', doctorId: 'd-2' }),
    ],
    appointments: [makeAppointment({ slotId: 's-2', status: 'cancelled' })],
  });
  const groups = selectSlotsByDay(state);
  assert.deepEqual(groups.map((g) => g.date), ['2026-12-02', '2026-12-03']);
  assert.deepEqual(groups[0].slots.map((s) => s.id), ['s-1', 's-2']);
  assert.equal(groups[0].slots[1].available, true);
});

test('selectBookedSlotIds only counts booked appointments', () => {
  const state = makeState({
    appointments: [makeAppointment({ slotId: 's-1' }), makeAppointment({ id: 'a-2', slotId: 's-2', status: 'cancelled' })],
  });
  assert.deepEqual([...selectBookedSlotIds(state)], ['s-1']);
});

test('selectUpcomingAppointments hides past and cancelled ones and sorts by time', () => {
  const state = makeState({
    appointments: [
      makeAppointment({ id: 'late', date: '2026-12-05' }),
      makeAppointment({ id: 'past', date: '2026-11-20' }),
      makeAppointment({ id: 'gone', status: 'cancelled' }),
      makeAppointment({ id: 'soon', date: '2026-12-01' }),
    ],
  });
  assert.deepEqual(selectUpcomingAppointments(state).map((a) => a.id), ['soon', 'late']);
});

test('requesting and dismissing a cancel toggles the dialog target', () => {
  const state = makeState({ appointments: makeAppointments(2) });
  const asked = reducer(state, { type: 'cancel/requested', appointmentId: 'a-2' });
  assert.equal(asked.cancelTargetId, 'a-2');
  assert.equal(reducer(asked, { type: 'cancel/dismissed' }).cancelTargetId, null);
});

test('confirming a cancel marks the appointment cancelled and closes the dialog', () => {
  const state = makeState({ appointments: makeAppointments(3), cancelTargetId: 'a-2' });
  const next = reducer(state, { type: 'cancel/confirmed' });
  assert.equal(next.cancelTargetId, null);
  assert.deepEqual(next.appointments.map((a) => a.status), ['booked', 'cancelled', 'booked']);
});
