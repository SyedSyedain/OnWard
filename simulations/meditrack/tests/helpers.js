/**
 * Factory helpers: every test builds its own fresh data.
 */

import { createInitialState } from '../src/state/reducer.js';

export const TODAY = '2026-12-01';

export function makeDoctor(overrides = {}) {
  return { id: 'd-1', name: 'Meera Iyer', specialty: 'Cardiology', experienceYears: 10, ...overrides };
}

export function makeSlot(overrides = {}) {
  const base = { id: 's-1', doctorId: 'd-1', date: '2026-12-02', time: '09:00' };
  return { ...base, ...overrides };
}

export function makeAppointment(overrides = {}) {
  return {
    id: 'a-1',
    doctorId: 'd-1',
    slotId: 's-1',
    date: '2026-12-02',
    time: '09:00',
    patientName: 'Test Patient',
    phone: '9876543210',
    reason: 'Check-up',
    status: 'booked',
    ...overrides,
  };
}

/** Builds `count` booked upcoming appointments a-1 … a-N on consecutive days. */
export function makeAppointments(count) {
  return Array.from({ length: count }, (_, i) =>
    makeAppointment({
      id: `a-${i + 1}`,
      slotId: `s-${i + 1}`,
      date: `2026-12-${String(2 + i).padStart(2, '0')}`,
    }),
  );
}

export function defaultDoctors() {
  return [
    makeDoctor({ id: 'd-1', name: 'Meera Iyer', specialty: 'Cardiology' }),
    makeDoctor({ id: 'd-2', name: 'Arjun Rao', specialty: 'Dermatology' }),
    makeDoctor({ id: 'd-3', name: 'Farah Khan', specialty: 'Pediatrics' }),
    makeDoctor({ id: 'd-4', name: 'Anita Desai', specialty: 'Dermatology' }),
  ];
}

export function makeState(overrides = {}) {
  const { doctors = defaultDoctors(), slots = [], appointments = [], today = TODAY, ...rest } = overrides;
  return { ...createInitialState({ doctors, slots, appointments, today }), ...rest };
}
