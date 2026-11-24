import { test } from 'node:test';
import assert from 'node:assert/strict';
import { makeAppointments, makeState } from '../helpers.js';
import { reducer } from '../../src/state/reducer.js';
import { selectAppointmentsPage } from '../../src/state/selectors.js';

test('[acceptance] cancelling does not modify the previous state', () => {
  const previous = makeState({ appointments: makeAppointments(3), cancelTargetId: 'a-2' });
  const next = reducer(previous, { type: 'cancel/confirmed' });
  assert.equal(previous.appointments[1].status, 'booked');
  assert.notEqual(next.appointments, previous.appointments);
  assert.equal(next.appointments[1].status, 'cancelled');
  assert.equal(previous.cancelTargetId, 'a-2');
});

test('[acceptance] cancelling the only appointment on the last page moves back a page', () => {
  const previous = makeState({ appointments: makeAppointments(6), appointmentPage: 2, cancelTargetId: 'a-6' });
  const next = reducer(previous, { type: 'cancel/confirmed' });
  const page = selectAppointmentsPage(next);
  assert.equal(page.page, 1);
  assert.deepEqual(page.items.map((a) => a.id), ['a-1', 'a-2', 'a-3', 'a-4', 'a-5']);
});

test('[acceptance] cancelling elsewhere keeps the page, closes the dialog and shows a notice', () => {
  const onFirst = reducer(makeState({ appointments: makeAppointments(7), appointmentPage: 1, cancelTargetId: 'a-2' }), { type: 'cancel/confirmed' });
  assert.equal(onFirst.appointmentPage, 1);
  assert.equal(onFirst.cancelTargetId, null);
  assert.ok(onFirst.notice);
  assert.deepEqual(onFirst.appointments.map((a) => a.status), ['booked', 'cancelled', 'booked', 'booked', 'booked', 'booked', 'booked']);

  const onSecond = reducer(makeState({ appointments: makeAppointments(7), appointmentPage: 2, cancelTargetId: 'a-6' }), { type: 'cancel/confirmed' });
  assert.equal(onSecond.appointmentPage, 2);
  assert.deepEqual(selectAppointmentsPage(onSecond).items.map((a) => a.id), ['a-7']);
});
