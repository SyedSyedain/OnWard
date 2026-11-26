/**
 * Driver availability and nearest-driver matching.
 */

import { NotFoundError } from '../lib/errors.js';
import { distanceKm } from '../lib/geo.js';

/**
 * @param {ReturnType<import('../repositories/createStore.js').createStore>} store
 */
export function createDriverService(store) {
  function getDriver(driverId) {
    const driver = store.drivers.get(driverId);
    if (!driver) throw new NotFoundError(`Driver ${driverId} not found`);
    return driver;
  }

  return {
    getDriver,

    /**
     * Finds the closest driver who is currently available.
     * @param {{lat: number, lng: number}} location
     * @returns {object|null} the driver, or null when nobody is available
     */
    findNearestAvailable(location) {
      let best = null;
      let bestDistance = Infinity;
      for (const driver of store.drivers.values()) {
        if (driver.status !== 'available') continue;
        const d = distanceKm(driver.location, location);
        if (d < bestDistance) {
          best = driver;
          bestDistance = d;
        }
      }
      return best;
    },

    /** Marks a driver as busy with a ride. */
    markBusy(driverId) {
      const driver = getDriver(driverId);
      driver.status = 'busy';
      return driver;
    },

    /**
     * Makes a driver available again. When a location is given the driver is now there
     * (for example the drop-off point of the ride they just finished).
     * @param {string} driverId
     * @param {{lat: number, lng: number}} [location]
     */
    releaseDriver(driverId, location) {
      const driver = getDriver(driverId);
      driver.status = 'available';
      if (location) {
        driver.location = location;
      }
      return driver;
    },
  };
}
