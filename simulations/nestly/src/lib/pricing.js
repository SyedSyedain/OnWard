/**
 * Stay pricing.
 */

import { nightsBetween, validateStay } from './dates.js';

const SERVICE_FEE_RATE = 0.1;

/**
 * Builds a price quote for a stay, or returns null when the stay is not valid.
 * @param {{pricePerNight: number, cleaningFee: number, maxGuests: number}} listing
 * @param {{checkIn: string, checkOut: string, guests: number}} stay
 * @param {string} today `YYYY-MM-DD`
 * @returns {{nights: number, nightly: number, subtotal: number, cleaningFee: number, serviceFee: number, total: number}|null}
 */
export function quoteStay(listing, stay, today) {
  if (validateStay(stay, listing, today).length > 0) return null;
  const nights = nightsBetween(stay.checkIn, stay.checkOut);
  const subtotal = listing.pricePerNight * nights;
  const serviceFee = Math.round(subtotal * SERVICE_FEE_RATE);
  const total = subtotal + listing.cleaningFee + serviceFee;
  return { nights, nightly: listing.pricePerNight, subtotal, cleaningFee: listing.cleaningFee, serviceFee, total };
}
