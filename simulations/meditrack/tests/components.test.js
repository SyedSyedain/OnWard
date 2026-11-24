import { test } from 'node:test';
import assert from 'node:assert/strict';
import { renderDoctorList } from '../src/components/doctorList.js';
import { renderSlotPicker } from '../src/components/slotPicker.js';
import { renderBookingForm } from '../src/components/bookingForm.js';
import { renderAppointmentList } from '../src/components/appointmentList.js';
import { renderCancelDialog } from '../src/components/cancelDialog.js';
import { paginate } from '../src/lib/pagination.js';
import { defaultDoctors, makeAppointment, makeDoctor } from './helpers.js';

const filters = { query: '', specialty: 'all' };

test('doctor list renders one button per doctor and marks the selected one', () => {
  const html = renderDoctorList({ doctors: defaultDoctors(), specialties: ['Cardiology'], filters, selectedDoctorId: 'd-2' });
  assert.equal((html.match(/data-action="select-doctor"/g) ?? []).length, 4);
  assert.match(html, /data-id="d-2"[^>]*aria-pressed="true"/);
  assert.match(html, /Dr\. Meera Iyer/);
});

test('doctor list shows an empty message and escapes the search text', () => {
  const html = renderDoctorList({ doctors: [], specialties: [], filters: { query: '<script>', specialty: 'all' }, selectedDoctorId: null });
  assert.match(html, /No doctors match/);
  assert.ok(!html.includes('<script>'));
  assert.match(html, /&lt;script&gt;/);
});

test('doctor list escapes doctor names', () => {
  const doctors = [makeDoctor({ name: '<img src=x>' })];
  const html = renderDoctorList({ doctors, specialties: [], filters, selectedDoctorId: null });
  assert.ok(!html.includes('<img src=x>'));
});

test('slot picker asks for a doctor first', () => {
  const html = renderSlotPicker({ doctor: undefined, groups: [], selectedSlotId: null });
  assert.match(html, /Choose a doctor/);
});

test('slot picker renders a heading per day and disables unavailable slots', () => {
  const groups = [
    { date: '2026-12-02', label: 'Wed, 2 Dec', slots: [{ id: 's-1', label: '9:00 AM', available: true }, { id: 's-2', label: '3:00 PM', available: false }] },
  ];
  const html = renderSlotPicker({ doctor: makeDoctor(), groups, selectedSlotId: 's-1' });
  assert.match(html, /<h3>Wed, 2 Dec<\/h3>/);
  assert.match(html, /data-id="s-1"[^>]*aria-pressed="true"/);
  assert.match(html, /data-id="s-2"[^>]*disabled/);
});

test('booking form renders nothing until a slot is chosen', () => {
  assert.equal(renderBookingForm({ slotLabel: null }), '');
});

test('booking form shows field errors and keeps typed values escaped', () => {
  const html = renderBookingForm({
    slotLabel: 'Wed, 2 Dec, 9:00 AM',
    values: { name: '"Asha"' },
    errors: { phone: 'Enter a valid 10-digit phone number.' },
  });
  assert.match(html, /Enter a valid 10-digit phone number\./);
  assert.match(html, /&quot;Asha&quot;/);
  assert.match(html, /<button type="submit">Book appointment<\/button>/);
});

test('appointment list renders each appointment with a cancel button and a pager', () => {
  const pageData = paginate([makeAppointment({ id: 'a-1' }), makeAppointment({ id: 'a-2', reason: '<b>pain</b>' })], 1, 5);
  const html = renderAppointmentList({ pageData, doctors: defaultDoctors() });
  assert.equal((html.match(/data-action="request-cancel"/g) ?? []).length, 2);
  assert.match(html, /Page 1 of 1/);
  assert.match(html, /Wed, 2 Dec at 9:00 AM/);
  assert.ok(!html.includes('<b>pain</b>'));
});

test('appointment list shows an empty state', () => {
  const html = renderAppointmentList({ pageData: paginate([], 1, 5), doctors: [] });
  assert.match(html, /no upcoming appointments/);
});

test('cancel dialog is hidden without a target', () => {
  assert.equal(renderCancelDialog({}), '');
});

test('cancel dialog is an accessible modal with both choices', () => {
  const html = renderCancelDialog({ appointment: makeAppointment(), doctor: makeDoctor() });
  assert.match(html, /role="dialog"/);
  assert.match(html, /aria-modal="true"/);
  assert.match(html, /aria-labelledby="cancel-title"/);
  assert.match(html, /data-action="dismiss-cancel"/);
  assert.match(html, /data-action="confirm-cancel"/);
});
