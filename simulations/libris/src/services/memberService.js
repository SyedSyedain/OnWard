/**
 * Members of the library and their borrowing limits.
 */

import { NotFoundError, ValidationError } from '../lib/errors.js';
import { BORROW_LIMITS } from '../lib/policy.js';

/**
 * @param {ReturnType<import('../repositories/createStore.js').createStore>} store
 */
export function createMemberService(store) {
  /** Registers a member. `type` decides the default borrowing limit. */
  function registerMember({ id, name, type = 'student', borrowLimit }) {
    if (typeof id !== 'string' || id.trim() === '') throw new ValidationError('Member id is required');
    if (typeof name !== 'string' || name.trim() === '') throw new ValidationError('Name is required');
    if (!(type in BORROW_LIMITS)) throw new ValidationError(`Unknown member type: ${type}`);
    if (store.members.has(id)) throw new ValidationError(`Member ${id} already exists`);
    const limit = borrowLimit ?? BORROW_LIMITS[type];
    if (!Number.isInteger(limit) || limit < 1) throw new ValidationError('Borrow limit must be at least 1');
    const member = { id, name: name.trim(), type, borrowLimit: limit };
    store.members.set(id, member);
    return { ...member };
  }

  /** Returns a member or throws NotFoundError. */
  function getMember(memberId) {
    const member = store.members.get(memberId);
    if (!member) throw new NotFoundError(`Member ${memberId} not found`);
    return { ...member };
  }

  /** Returns the member's loans that have not been returned yet. */
  function listActiveLoans(memberId) {
    getMember(memberId);
    return [...store.loans.values()].filter((l) => l.memberId === memberId && l.returnedOn === null);
  }

  return { registerMember, getMember, listActiveLoans };
}
