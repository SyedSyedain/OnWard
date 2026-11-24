/**
 * Doctor search and specialty filtering.
 */

export const ALL_SPECIALTIES = 'all';

/**
 * Filters doctors by a search query (matched against the name) and a specialty.
 * @param {Array<{name: string, specialty: string}>} doctors
 * @param {{query?: string, specialty?: string}} filters
 * @returns {Array<object>}
 */
export function filterDoctors(doctors, { query = '', specialty = ALL_SPECIALTIES } = {}) {
  const text = query.trim().toLowerCase();

  if (text) {
    return doctors.filter((doctor) => doctor.name.toLowerCase().includes(text));
  }
  if (specialty !== ALL_SPECIALTIES) {
    return doctors.filter((doctor) => doctor.specialty === specialty);
  }
  return doctors;
}

/**
 * Returns the sorted, unique specialties of a doctor list.
 * @param {Array<{specialty: string}>} doctors
 * @returns {string[]}
 */
export function listSpecialties(doctors) {
  return [...new Set(doctors.map((doctor) => doctor.specialty))].sort();
}
