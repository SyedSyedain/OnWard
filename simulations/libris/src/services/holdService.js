/**
 * Holds (reservations). Members queue for a book whose copies are all out;
 * when a copy comes back it is set aside for the first member in the queue.
 */

import { ConflictError, NotFoundError } from '../lib/errors.js';

/**
 * @param {ReturnType<import('../repositories/createStore.js').createStore>} store
 * @param {{ getBook(id: string): object, countAvailable(id: string): number }} catalogue
 * @param {{ getMember(id: string): object }} members
 */
export function createHoldService(store, catalogue, members) {
  /** Returns the waiting holds for a book, oldest first. */
  function listQueue(bookId) {
    return [...store.holds.values()]
      .filter((h) => h.bookId === bookId && h.status === 'waiting')
      .sort((a, b) => a.seq - b.seq)
      .map((h) => ({ ...h }));
  }

  /** Returns a member's 1-based place in the queue for a book, or null. */
  function queuePosition(bookId, memberId) {
    const index = listQueue(bookId).findIndex((h) => h.memberId === memberId);
    return index === -1 ? null : index + 1;
  }

  /** Places a hold on a book that currently has no copy on the shelf. */
  function placeHold(memberId, bookId, today) {
    members.getMember(memberId);
    catalogue.getBook(bookId);
    if (catalogue.countAvailable(bookId) > 0) {
      throw new ConflictError('A copy is on the shelf, borrow it instead of placing a hold');
    }
    const existing = [...store.holds.values()].find(
      (h) => h.bookId === bookId && h.memberId === memberId && (h.status === 'waiting' || h.status === 'ready'),
    );
    if (existing) throw new ConflictError('Member already has a hold on this book');
    store.counters.hold += 1;
    const hold = {
      id: `hold-${store.counters.hold}`,
      seq: store.counters.hold,
      bookId,
      memberId,
      placedOn: today,
      status: 'waiting',
      copyId: null,
    };
    store.holds.set(hold.id, hold);
    return { ...hold };
  }

  /** Cancels a waiting or ready hold. A copy set aside for it goes back on the shelf. */
  function cancelHold(holdId) {
    const hold = store.holds.get(holdId);
    if (!hold) throw new NotFoundError(`Hold ${holdId} not found`);
    if (hold.status !== 'waiting' && hold.status !== 'ready') {
      throw new ConflictError('Hold is no longer active');
    }
    if (hold.status === 'ready') {
      const copy = store.copies.get(hold.copyId);
      copy.status = 'available';
      hold.copyId = null;
    }
    hold.status = 'cancelled';
    return { ...hold };
  }

  /** Returns the hold that should receive the next free copy of a book, or null. */
  function nextWaitingHold(bookId) {
    const waiting = [...store.holds.values()].filter((h) => h.bookId === bookId && h.status === 'waiting');
    return waiting.reduce((best, h) => (best === null || h.seq > best.seq ? h : best), null);
  }

  /** Sets a returned copy aside for a hold. Returns the updated hold. */
  function reserveCopy(hold, copy) {
    hold.status = 'ready';
    hold.copyId = copy.id;
    copy.status = 'on_hold_shelf';
    return { ...hold };
  }

  /** Returns the ready hold a member has on a book, or null. */
  function findReadyHold(memberId, bookId) {
    const hold = [...store.holds.values()].find(
      (h) => h.memberId === memberId && h.bookId === bookId && h.status === 'ready',
    );
    return hold ?? null;
  }

  return { listQueue, queuePosition, placeHold, cancelHold, nextWaitingHold, reserveCopy, findReadyHold };
}
