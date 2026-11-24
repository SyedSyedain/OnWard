/**
 * Application state and the actions that change it.
 */

import { ALL_SPECIALTIES } from '../lib/filtering.js';

/**
 * Builds the initial state.
 * @param {{doctors?: object[], slots?: object[], appointments?: object[], today: string}} data
 */
export function createInitialState({ doctors = [], slots = [], appointments = [], today }) {
  return {
    today,
    doctors,
    slots,
    appointments,
    filters: { query: '', specialty: ALL_SPECIALTIES },
    selectedDoctorId: null,
    selectedSlotId: null,
    appointmentPage: 1,
    cancelTargetId: null,
    notice: null,
  };
}

/**
 * Applies an action to the state and returns the next state.
 * @param {object} state
 * @param {{type: string, [key: string]: unknown}} action
 * @returns {object}
 */
export function reducer(state, action) {
  switch (action.type) {
    case 'filters/changed':
      return { ...state, filters: { ...state.filters, ...action.changes } };

    case 'doctor/selected':
      return { ...state, selectedDoctorId: action.doctorId, selectedSlotId: null, notice: null };

    case 'slot/selected':
      return { ...state, selectedSlotId: action.slotId };

    case 'booking/submitted':
      return {
        ...state,
        appointments: [...state.appointments, action.appointment],
        selectedSlotId: null,
        notice: 'Your appointment is booked.',
      };

    case 'appointments/pageChanged':
      return { ...state, appointmentPage: action.page };

    case 'cancel/requested':
      return { ...state, cancelTargetId: action.appointmentId };

    case 'cancel/dismissed':
      return { ...state, cancelTargetId: null };

    case 'cancel/confirmed': {
      const target = state.appointments.find((a) => a.id === state.cancelTargetId);
      if (target) target.status = 'cancelled';
      return { ...state, cancelTargetId: null, notice: 'Your appointment was cancelled.' };
    }

    default:
      return state;
  }
}
