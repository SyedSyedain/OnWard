/**
 * Fare estimates and cancellation fees.
 */

import { PRICING, CANCELLATION } from '../config.js';
import { ValidationError } from '../lib/errors.js';

/**
 * Estimates the fare for a trip.
 *
 * fare = (base + distance charge + time charge) * surge, never below the minimum fare.
 *
 * @param {{distanceKm: number, durationMinutes: number, surgeMultiplier?: number}} trip
 * @returns {{baseFareInPaise: number, distanceFareInPaise: number, timeFareInPaise: number,
 *   surgeMultiplier: number, totalInPaise: number}}
 */
export function estimateFare({ distanceKm, durationMinutes, surgeMultiplier = 1 }) {
  if (!Number.isFinite(distanceKm) || distanceKm < 0) {
    throw new ValidationError('distanceKm must be zero or more');
  }
  if (!Number.isFinite(durationMinutes) || durationMinutes < 0) {
    throw new ValidationError('durationMinutes must be zero or more');
  }
  if (!Number.isFinite(surgeMultiplier) || surgeMultiplier < 1) {
    throw new ValidationError('surgeMultiplier must be at least 1');
  }

  const distanceFareInPaise = Math.round(distanceKm * PRICING.perKmInPaise);
  const timeFareInPaise = Math.round(durationMinutes * PRICING.perMinuteInPaise);
  const surgedBase = Math.round(PRICING.baseFareInPaise * surgeMultiplier);
  const surgedFare = surgedBase + distanceFareInPaise + timeFareInPaise;
  const totalInPaise = Math.max(surgedFare, PRICING.minimumFareInPaise);

  return {
    baseFareInPaise: PRICING.baseFareInPaise,
    distanceFareInPaise,
    timeFareInPaise,
    surgeMultiplier,
    totalInPaise,
  };
}

/**
 * Fee for cancelling a ride. Rides cancelled before a driver accepts are free, and so are
 * cancellations made within the free window after acceptance.
 *
 * @param {{acceptedAt?: number|null, cancelledAt: number}} input timestamps in milliseconds
 * @returns {number} fee in paise
 */
export function cancellationFee({ acceptedAt, cancelledAt }) {
  if (acceptedAt == null) return 0;
  const elapsedSeconds = (cancelledAt - acceptedAt) / 1000;
  return elapsedSeconds <= CANCELLATION.freeWindowSeconds ? 0 : CANCELLATION.feeInPaise;
}
