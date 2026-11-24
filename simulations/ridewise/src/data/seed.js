/**
 * Sample data for local experiments.
 */

export const seedDrivers = [
  { id: 'd-1', name: 'Asha', status: 'available', location: { lat: 12.9716, lng: 77.5946 } },
  { id: 'd-2', name: 'Imran', status: 'available', location: { lat: 12.9352, lng: 77.6245 } },
  { id: 'd-3', name: 'Lakshmi', status: 'busy', location: { lat: 12.9784, lng: 77.6408 } },
];

export const seedPromos = [
  {
    code: 'WELCOME20',
    percentOff: 20,
    maxDiscountInPaise: 10000,
    expiresAt: Date.parse('2027-01-01T00:00:00Z'),
  },
];
