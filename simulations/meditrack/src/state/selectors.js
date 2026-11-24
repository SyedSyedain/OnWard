/**
 * Derived data computed from the app state.
 */

import { filterDoctors, listSpecialties } from '../lib/filtering.js';
import { formatDay, formatTime } from '../lib/format.js';
import { paginate } from '../lib/pagination.js';

export const APPOINTMENTS_PAGE_SIZE = 5;

/** @returns {Array<object>} doctors matching the current search and specialty */
export function selectVisibleDoctors(state) {
  return filterDoctors(state.doctors, state.filters);
}

/** @returns {string[]} specialties available in the filter drop-down */
export function selectSpecialties(state) {
  return listSpecialties(state.doctors);
}

/** @returns {object|undefined} the doctor currently selected for booking */
export function selectSelectedDoctor(state) {
  return state.doctors.find((doctor) => doctor.id === state.selectedDoctorId);
}

/** @returns {Set<string>} ids of slots that already have a booked appointment */
export function selectBookedSlotIds(state) {
  return new Set(state.appointments.filter((a) => a.status === 'booked').map((a) => a.slotId));
}

/**
 * Groups the selected doctor's slots by day, earliest first.
 * @returns {Array<{date: string, label: string, slots: Array<{id: string, time: string, label: string, available: boolean}>}>}
 */
export function selectSlotsByDay(state) {
  const booked = selectBookedSlotIds(state);
  const slots = state.slots
    .filter((slot) => slot.doctorId === state.selectedDoctorId)
    .sort((a, b) => `${a.date} ${a.time}`.localeCompare(`${b.date} ${b.time}`));

  const groups = [];
  for (const slot of slots) {
    let group = groups.find((g) => g.date === slot.date);
    if (!group) {
      group = { date: slot.date, label: formatDay(slot.date), slots: [] };
      groups.push(group);
    }
    group.slots.push({
      id: slot.id,
      time: slot.time,
      label: formatTime(slot.time),
      available: !booked.has(slot.id),
    });
  }
  return groups;
}

/** @returns {Array<object>} booked appointments from today onwards, soonest first */
export function selectUpcomingAppointments(state) {
  return state.appointments
    .filter((a) => a.status === 'booked' && a.date >= state.today)
    .sort((a, b) => `${a.date} ${a.time}`.localeCompare(`${b.date} ${b.time}`));
}

/** @returns {ReturnType<typeof paginate>} the current page of upcoming appointments */
export function selectAppointmentsPage(state) {
  return paginate(selectUpcomingAppointments(state), state.appointmentPage, APPOINTMENTS_PAGE_SIZE);
}
