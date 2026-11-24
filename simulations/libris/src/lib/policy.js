/**
 * Library lending policy. Change a number here to change it for every service.
 */

export const LOAN_DAYS = 14;
export const RENEWAL_DAYS = 7;
export const MAX_RENEWALS = 2;
export const FINE_PER_DAY_IN_PAISE = 200;

/** Default borrowing limit by member type. */
export const BORROW_LIMITS = {
  student: 3,
  faculty: 6,
};
