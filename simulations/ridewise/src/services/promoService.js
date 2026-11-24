/**
 * Promo code validation and redemption. Each rider can use a promo code once.
 */

import { NotFoundError, ValidationError } from '../lib/errors.js';

/**
 * @param {ReturnType<import('../repositories/createStore.js').createStore>} store
 */
export function createPromoService(store) {
  function findPromo(rawCode) {
    if (typeof rawCode !== 'string' || rawCode.trim() === '') {
      throw new ValidationError('promo code is required');
    }
    const promo = store.promos.get(rawCode.trim().toUpperCase());
    if (!promo) throw new NotFoundError(`Promo code ${rawCode} not found`);
    return promo;
  }

  return {
    /**
     * Validates a promo code for a rider, records the redemption and returns the discount.
     * The discount is a percentage of the fare, capped at the promo's maximum.
     *
     * @param {{code: string, riderId: string, fareInPaise: number, at: number}} input
     * @returns {{code: string, discountInPaise: number}}
     */
    redeem({ code, riderId, fareInPaise, at }) {
      const promo = findPromo(code);
      if (promo.expiresAt <= at) {
        throw new ValidationError(`Promo code ${promo.code} has expired`);
      }
      const alreadyUsed = store.redemptions.some(
        (r) => r.code === promo.code && r.riderId === riderId,
      );
      if (alreadyUsed) {
        throw new ValidationError(`Promo code ${promo.code} has already been used`);
      }

      const discountInPaise = Math.min(
        Math.floor((fareInPaise * promo.percentOff) / 100),
        promo.maxDiscountInPaise,
      );
      store.redemptions.push({ code, riderId, at });
      return { code: promo.code, discountInPaise };
    },
  };
}
