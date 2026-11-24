/**
 * Booking rides and moving them through their lifecycle.
 */

import { AVERAGE_SPEED_KMPH } from '../config.js';
import { ConflictError, NotFoundError, ValidationError } from '../lib/errors.js';
import { distanceKm, isValidPoint } from '../lib/geo.js';
import { estimateFare, cancellationFee } from './fareService.js';

const TRANSITIONS = {
  requested: ['accepted', 'cancelled'],
  accepted: ['started', 'cancelled'],
  started: ['completed'],
  completed: [],
  cancelled: [],
};

function assertTransition(ride, next) {
  if (!TRANSITIONS[ride.status].includes(next)) {
    throw new ConflictError(`Ride ${ride.id} cannot go from ${ride.status} to ${next}`);
  }
}

/**
 * @param {ReturnType<import('../repositories/createStore.js').createStore>} store
 * @param {{driverService: object, promoService: object}} deps
 */
export function createRideService(store, { driverService, promoService }) {
  function getRide(rideId) {
    const ride = store.rides.get(rideId);
    if (!ride) throw new NotFoundError(`Ride ${rideId} not found`);
    return ride;
  }

  return {
    getRide,

    /**
     * Books a ride: prices the trip, applies an optional promo code and stores the request.
     *
     * @param {{riderId: string, pickup: object, dropoff: object, surgeMultiplier?: number,
     *   promoCode?: string, at: number}} request
     * @returns {object} the new ride in the `requested` status
     */
    requestRide({ riderId, pickup, dropoff, surgeMultiplier = 1, promoCode, at }) {
      if (!riderId) throw new ValidationError('riderId is required');
      if (!isValidPoint(pickup) || !isValidPoint(dropoff)) {
        throw new ValidationError('pickup and dropoff must be valid coordinates');
      }

      const km = distanceKm(pickup, dropoff);
      const durationMinutes = Math.ceil((km / AVERAGE_SPEED_KMPH) * 60);
      const fare = estimateFare({ distanceKm: km, durationMinutes, surgeMultiplier });

      let discountInPaise = 0;
      let appliedPromo = null;
      if (promoCode) {
        const redemption = promoService.redeem({
          code: promoCode,
          riderId,
          fareInPaise: fare.totalInPaise,
          at,
        });
        discountInPaise = redemption.discountInPaise;
        appliedPromo = redemption.code;
      }

      const ride = {
        id: store.nextId('ride'),
        riderId,
        pickup,
        dropoff,
        status: 'requested',
        driverId: null,
        fareInPaise: fare.totalInPaise - discountInPaise,
        discountInPaise,
        promoCode: appliedPromo,
        requestedAt: at,
        acceptedAt: null,
        startedAt: null,
        completedAt: null,
        cancelledAt: null,
        cancellationFeeInPaise: 0,
      };
      store.rides.set(ride.id, ride);
      return ride;
    },

    /**
     * Matches the nearest available driver to the pickup point and accepts the ride.
     * @param {string} rideId
     * @param {{at: number}} options
     */
    acceptRide(rideId, { at }) {
      const ride = getRide(rideId);
      assertTransition(ride, 'accepted');
      const driver = driverService.findNearestAvailable(ride.pickup);
      if (!driver) throw new ConflictError('No drivers are available right now');

      driverService.markBusy(driver.id);
      ride.driverId = driver.id;
      ride.status = 'accepted';
      ride.acceptedAt = at;
      return ride;
    },

    /** The driver has picked the rider up. */
    startRide(rideId, { at }) {
      const ride = getRide(rideId);
      assertTransition(ride, 'started');
      ride.status = 'started';
      ride.startedAt = at;
      return ride;
    },

    /** The rider has been dropped off. The driver becomes available at the drop-off point. */
    completeRide(rideId, { at }) {
      const ride = getRide(rideId);
      assertTransition(ride, 'completed');
      ride.status = 'completed';
      ride.completedAt = at;
      driverService.releaseDriver(ride.driverId, ride.dropoff);
      return ride;
    },

    /**
     * Cancels a ride and charges a cancellation fee when it applies.
     * @param {string} rideId
     * @param {{at: number}} options
     */
    cancelRide(rideId, { at }) {
      const ride = getRide(rideId);
      if (ride.status === 'cancelled') {
        throw new ConflictError(`Ride ${ride.id} is already cancelled`);
      }

      ride.cancellationFeeInPaise = cancellationFee({
        acceptedAt: ride.acceptedAt,
        cancelledAt: at,
      });
      ride.status = 'cancelled';
      ride.cancelledAt = at;
      return ride;
    },
  };
}
