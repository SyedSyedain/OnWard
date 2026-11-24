/**
 * Public entry point: wires the repositories and services together.
 */

import { createStore } from './repositories/createStore.js';
import { createDriverService } from './services/driverService.js';
import { createPromoService } from './services/promoService.js';
import { createRideService } from './services/rideService.js';
import { seedDrivers, seedPromos } from './data/seed.js';

/**
 * @param {{drivers?: object[], promos?: object[]}} [initial] defaults to the seed data
 */
export function createRidewise(initial = { drivers: seedDrivers, promos: seedPromos }) {
  const store = createStore(initial);
  const driverService = createDriverService(store);
  const promoService = createPromoService(store);
  const rideService = createRideService(store, { driverService, promoService });
  return { store, driverService, promoService, rideService };
}

export * as errors from './lib/errors.js';
