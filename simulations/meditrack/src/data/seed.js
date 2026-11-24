/**
 * Sample data used when the app starts in the browser.
 */

export const seedDoctors = [
  { id: 'd-1', name: 'Meera Iyer', specialty: 'Cardiology', experienceYears: 14 },
  { id: 'd-2', name: 'Arjun Rao', specialty: 'Dermatology', experienceYears: 9 },
  { id: 'd-3', name: 'Farah Khan', specialty: 'Pediatrics', experienceYears: 11 },
  { id: 'd-4', name: 'Rohan Mehta', specialty: 'Orthopedics', experienceYears: 17 },
  { id: 'd-5', name: 'Anita Desai', specialty: 'Dermatology', experienceYears: 6 },
];

const SLOT_TIMES = ['09:00', '09:30', '11:30', '12:30', '14:00', '16:30'];
const SLOT_DATES = ['2026-12-01', '2026-12-02', '2026-12-03'];

/** One slot per time on each date for every doctor. */
export const seedSlots = seedDoctors.flatMap((doctor) =>
  SLOT_DATES.flatMap((date) =>
    SLOT_TIMES.map((time) => ({ id: `${doctor.id}-${date}-${time}`, doctorId: doctor.id, date, time })),
  ),
);

export const seedAppointments = [
  ['2026-12-01', '09:00', 'Chest pain follow-up'],
  ['2026-12-01', '11:30', 'Annual check-up'],
  ['2026-12-02', '09:30', 'Skin rash'],
  ['2026-12-02', '14:00', 'Blood pressure review'],
  ['2026-12-03', '09:00', 'Back pain'],
  ['2026-12-03', '12:30', 'Vaccination'],
  ['2026-12-03', '16:30', 'Knee pain'],
].map(([date, time, reason], index) => {
  const doctorId = seedDoctors[index % seedDoctors.length].id;
  return {
    id: `a-${index + 1}`,
    doctorId,
    slotId: `${doctorId}-${date}-${time}`,
    date,
    time,
    patientName: 'Sample Patient',
    phone: '9876543210',
    reason,
    status: 'booked',
  };
});
