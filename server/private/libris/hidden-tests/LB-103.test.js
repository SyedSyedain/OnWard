import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createTestLibrary } from '../helpers.js';

test('[acceptance] a fine never exceeds the price of the book', () => {
  const { loans } = createTestLibrary();
  const loan = loans.checkout('m-1', 'b-cheap', '2024-03-01');
  assert.equal(loans.returnCopy(loan.id, '2024-04-14').fine, 1000);
});

test('[acceptance] the capped fine is the one stored on the loan', () => {
  const { loans } = createTestLibrary();
  const loan = loans.checkout('m-1', 'b-cheap', '2024-03-01');
  const result = loans.returnCopy(loan.id, '2024-06-01');
  assert.equal(result.loan.fine, 1000);
  assert.equal(loans.getLoan(loan.id).fine, 1000);
});

test('[acceptance] a fine below the book price is charged in full', () => {
  const { loans } = createTestLibrary();
  const loan = loans.checkout('m-1', 'b-1', '2024-03-01');
  assert.equal(loans.returnCopy(loan.id, '2024-03-25').fine, 2000);
  const cheap = loans.checkout('m-2', 'b-cheap', '2024-03-01');
  assert.equal(loans.returnCopy(cheap.id, '2024-03-20').fine, 1000);
});
