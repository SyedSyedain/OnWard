/**
 * Builds a fresh, isolated set of services for each test.
 */

import { createRidewise } from '../src/index.js';

export const T0 = Date.parse('2026-03-01T10:00:00Z');
export const seconds = (n) => n * 1000;

export const CENTER = { lat: 12.9716, lng: 77.5946 };
export const NEAR = { lat: 12.9726, lng: 77.5956 };
export const FAR = { lat: 13.0358, lng: 77.597 };
export const DROPOFF = { lat: 12.9352, lng: 77.6245 };

export function defaultDrivers() {
  return [
    { id: 'd-near', name: 'Asha', status: 'available', location: NEAR },
    { id: 'd-far', name: 'Imran', status: 'available', location: FAR },
    { id: 'd-busy', name: 'Lakshmi', status: 'busy', location: CENTER },
  ];
}

export function defaultPromos() {
  return [
    {
      code: 'SAVE20',
      percentOff: 20,
      maxDiscountInPaise: 10000,
      expiresAt: Date.parse('2027-01-01T00:00:00Z'),
    },
    {
      code: 'OLD10',
      percentOff: 10,
      maxDiscountInPaise: 5000,
      expiresAt: Date.parse('2026-01-01T00:00:00Z'),
    },
  ];
}

export function createTestServices({ drivers = defaultDrivers(), promos = defaultPromos() } = {}) {
  return createRidewise({ drivers, promos });
}

export function bookRide(services, overrides = {}) {
  return services.rideService.requestRide({
    riderId: 'rider-1',
    pickup: CENTER,
    dropoff: DROPOFF,
    at: T0,
    ...overrides,
  });
}
