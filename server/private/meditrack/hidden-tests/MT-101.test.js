import { test } from 'node:test';
import assert from 'node:assert/strict';
import { makeAppointment, makeSlot, makeState } from '../helpers.js';
import { formatTime } from '../../src/lib/format.js';
import { selectSlotsByDay } from '../../src/state/selectors.js';

test('[acceptance] noon slots show 12 as the hour in the afternoon', () => {
  assert.equal(formatTime('12:30'), '12:30 PM');
  assert.equal(formatTime('12:00'), '12:00 PM');
  const state = makeState({ selectedDoctorId: 'd-1', slots: [makeSlot({ id: 's-1', time: '12:30' })], appointments: [makeAppointment({ slotId: 'x' })] });
  assert.equal(selectSlotsByDay(state)[0].slots[0].label, '12:30 PM');
});

test('[acceptance] midnight times show 12 as the hour in the morning', () => {
  assert.equal(formatTime('00:15'), '12:15 AM');
  assert.equal(formatTime('00:00'), '12:00 AM');
});

test('[acceptance] other times are formatted as before', () => {
  assert.equal(formatTime('09:05'), '9:05 AM');
  assert.equal(formatTime('11:59'), '11:59 AM');
  assert.equal(formatTime('13:00'), '1:00 PM');
  assert.equal(formatTime('23:30'), '11:30 PM');
});
