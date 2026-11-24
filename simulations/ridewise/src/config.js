/**
 * Pricing and cancellation constants. All money values are in paise.
 */

export const PRICING = {
  baseFareInPaise: 5000,
  perKmInPaise: 1200,
  perMinuteInPaise: 150,
  minimumFareInPaise: 8000,
};

export const CANCELLATION = {
  /** Riders can cancel for free within this many seconds of a driver accepting. */
  freeWindowSeconds: 120,
  feeInPaise: 5000,
};

/** Average city speed used to turn a distance into an estimated duration. */
export const AVERAGE_SPEED_KMPH = 24;
