/**
 * Browser entry point: creates the store, renders the app and wires up events.
 */

import { createStore } from './lib/store.js';
import { reducer, createInitialState } from './state/reducer.js';
import {
  selectAppointmentsPage,
  selectSelectedDoctor,
  selectSlotsByDay,
  selectSpecialties,
  selectVisibleDoctors,
} from './state/selectors.js';
import { seedAppointments, seedDoctors, seedSlots } from './data/seed.js';
import { validateBooking } from './lib/validation.js';
import { formatDay, formatTime } from './lib/format.js';
import { renderDoctorList } from './components/doctorList.js';
import { renderSlotPicker } from './components/slotPicker.js';
import { renderBookingForm } from './components/bookingForm.js';
import { renderAppointmentList } from './components/appointmentList.js';
import { renderCancelDialog } from './components/cancelDialog.js';

const root = document.getElementById('app');
const today = new Date().toISOString().slice(0, 10);
const store = createStore(
  reducer,
  createInitialState({ doctors: seedDoctors, slots: seedSlots, appointments: seedAppointments, today }),
);

let formValues = {};
let formErrors = {};

function render() {
  const state = store.getState();
  const doctor = selectSelectedDoctor(state);
  const groups = selectSlotsByDay(state);
  const slot = groups.flatMap((g) => g.slots.map((s) => ({ ...s, date: g.date }))).find((s) => s.id === state.selectedSlotId);
  const target = state.appointments.find((a) => a.id === state.cancelTargetId);

  root.innerHTML = [
    state.notice ? `<p role="status" class="notice">${state.notice}</p>` : '',
    renderDoctorList({
      doctors: selectVisibleDoctors(state),
      specialties: selectSpecialties(state),
      filters: state.filters,
      selectedDoctorId: state.selectedDoctorId,
    }),
    renderSlotPicker({ doctor, groups, selectedSlotId: state.selectedSlotId }),
    renderBookingForm({
      slotLabel: slot ? `${formatDay(slot.date)}, ${formatTime(slot.time)}` : null,
      values: formValues,
      errors: formErrors,
    }),
    renderAppointmentList({ pageData: selectAppointmentsPage(state), doctors: state.doctors }),
    renderCancelDialog({ appointment: target, doctor: state.doctors.find((d) => d.id === target?.doctorId) }),
  ].join('');
}

root.addEventListener('input', (event) => {
  if (event.target.id === 'doctor-search') {
    store.dispatch({ type: 'filters/changed', changes: { query: event.target.value } });
    const input = document.getElementById('doctor-search');
    input.focus();
    input.setSelectionRange(input.value.length, input.value.length);
  }
});

root.addEventListener('change', (event) => {
  if (event.target.id === 'specialty-filter') {
    store.dispatch({ type: 'filters/changed', changes: { specialty: event.target.value } });
  }
});

root.addEventListener('click', (event) => {
  const button = event.target.closest('[data-action]');
  if (!button) return;
  const { action, id, page } = button.dataset;
  const actions = {
    'select-doctor': { type: 'doctor/selected', doctorId: id },
    'select-slot': { type: 'slot/selected', slotId: id },
    page: { type: 'appointments/pageChanged', page: Number(page) },
    'request-cancel': { type: 'cancel/requested', appointmentId: id },
    'dismiss-cancel': { type: 'cancel/dismissed' },
    'confirm-cancel': { type: 'cancel/confirmed' },
  };
  if (actions[action]) store.dispatch(actions[action]);
});

root.addEventListener('submit', (event) => {
  event.preventDefault();
  const data = new FormData(event.target);
  formValues = { name: data.get('name'), phone: data.get('phone'), reason: data.get('reason') };
  const { valid, errors } = validateBooking(formValues);
  formErrors = errors;
  if (!valid) return render();

  const state = store.getState();
  const slot = state.slots.find((s) => s.id === state.selectedSlotId);
  store.dispatch({
    type: 'booking/submitted',
    appointment: {
      id: `a-${state.appointments.length + 1}`,
      doctorId: slot.doctorId,
      slotId: slot.id,
      date: slot.date,
      time: slot.time,
      patientName: formValues.name.trim(),
      phone: formValues.phone,
      reason: formValues.reason.trim(),
      status: 'booked',
    },
  });
  formValues = {};
});

store.subscribe(render);
render();
