import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createTestLibrary } from '../helpers.js';

test('[acceptance] a book returned on its due date has no fine', () => {
  const { loans } = createTestLibrary();
  const loan = loans.checkout('m-1', 'b-1', '2024-03-01');
  assert.equal(loans.returnCopy(loan.id, '2024-03-15').fine, 0);
});

test('[acceptance] a book returned before its due date has no fine', () => {
  const { loans } = createTestLibrary();
  const loan = loans.checkout('m-1', 'b-1', '2024-03-01');
  const result = loans.returnCopy(loan.id, '2024-03-14');
  assert.equal(result.fine, 0);
  assert.equal(result.loan.fine, 0);
});

test('[acceptance] a book one day late is fined for one day', () => {
  const { loans } = createTestLibrary();
  const loan = loans.checkout('m-1', 'b-1', '2024-03-01');
  assert.equal(loans.returnCopy(loan.id, '2024-03-16').fine, 200);
});
