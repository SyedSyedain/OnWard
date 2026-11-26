/**
 * Loans: checking books out, returning them and renewing them.
 */

import { ConflictError, NotFoundError, ValidationError } from '../lib/errors.js';
import { addDays, isIsoDate } from '../lib/dates.js';
import { LOAN_DAYS, MAX_RENEWALS, RENEWAL_DAYS } from '../lib/policy.js';
import { calculateFine } from './fineService.js';

function requireDate(value) {
  if (!isIsoDate(value)) throw new ValidationError('A valid date (YYYY-MM-DD) is required');
}

/**
 * @param {ReturnType<import('../repositories/createStore.js').createStore>} store
 * @param {{ catalogue: object, members: object, holds: object }} deps
 */
export function createLoanService(store, { catalogue, members, holds }) {
  function getLoan(loanId) {
    const loan = store.loans.get(loanId);
    if (!loan) throw new NotFoundError(`Loan ${loanId} not found`);
    return loan;
  }

  /**
   * Checks a book out to a member. A member with a copy set aside for them
   * receives that copy; everyone else takes a copy from the shelf.
   */
  function checkout(memberId, bookId, today) {
    requireDate(today);
    const member = members.getMember(memberId);
    catalogue.getBook(bookId);

    const activeLoans = members.listActiveLoans(memberId);
    if (activeLoans.length > member.borrowLimit) {
      throw new ConflictError(`Borrowing limit of ${member.borrowLimit} books reached`);
    }
    if (activeLoans.some((l) => l.bookId === bookId)) {
      throw new ConflictError('Member already has this book on loan');
    }

    const readyHold = holds.findReadyHold(memberId, bookId);
    let copy;
    if (readyHold) {
      copy = store.copies.get(readyHold.copyId);
      readyHold.status = 'fulfilled';
    } else {
      copy = [...store.copies.values()].find((c) => c.bookId === bookId && c.status === 'available');
      if (!copy) throw new ConflictError('No copy of this book is available');
    }

    copy.status = 'on_loan';
    const loan = {
      id: store.nextId('loan'),
      copyId: copy.id,
      bookId,
      memberId,
      borrowedOn: today,
      dueOn: addDays(today, LOAN_DAYS),
      returnedOn: null,
      renewals: 0,
      fine: 0,
    };
    store.loans.set(loan.id, loan);
    return { ...loan };
  }

  /**
   * Records a return, works out the late fine and puts the copy back:
   * on the holds shelf if somebody is waiting, otherwise on the open shelf.
   */
  function returnCopy(loanId, today) {
    requireDate(today);
    const loan = getLoan(loanId);
    if (loan.returnedOn !== null) throw new ConflictError('Loan was already returned');

    const book = catalogue.getBook(loan.bookId);
    loan.returnedOn = today;
    loan.fine = calculateFine(loan, book);

    const copy = store.copies.get(loan.copyId);
    const hold = holds.nextWaitingHold(loan.bookId);
    if (hold) {
      holds.reserveCopy(hold, copy);
    } else {
      copy.status = 'available';
    }

    return { loan: { ...loan }, fine: loan.fine, copy: { ...copy } };
  }

  /** Extends a loan by the renewal period. */
  function renew(loanId, today) {
    requireDate(today);
    const loan = getLoan(loanId);
    if (loan.returnedOn !== null) throw new ConflictError('Loan was already returned');
    if (today > loan.dueOn) throw new ConflictError('Overdue loans cannot be renewed');
    if (loan.renewals >= MAX_RENEWALS) throw new ConflictError('Renewal limit reached');
    if (holds.listQueue(loan.bookId).length > 0) {
      throw new ConflictError('Another member is waiting for this book');
    }
    loan.dueOn = addDays(today, RENEWAL_DAYS);
    loan.renewals += 1;
    return { ...loan };
  }

  return { checkout, returnCopy, renew, getLoan };
}
