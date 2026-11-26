/**
 * Late-fine calculation. Fines are in paise.
 */

import { daysBetween } from '../lib/dates.js';
import { FINE_PER_DAY_IN_PAISE } from '../lib/policy.js';

/**
 * Fine for a book returned on `returnedOn` that was due on `dueOn`.
 * The fine is charged per full day late.
 *
 * @param {{ dueOn: string, returnedOn: string }} loan
 * @param {{ priceInPaise: number }} book
 * @returns {number} fine in paise
 */
export function calculateFine(loan, book) {
  const daysLate = daysBetween(loan.dueOn, loan.returnedOn);
  if (daysLate <= 0) return 0;
  return daysLate * FINE_PER_DAY_IN_PAISE;
}
