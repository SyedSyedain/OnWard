import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createTestLibrary } from '../helpers.js';

test('[acceptance] renewing before the due date extends from the old due date', () => {
  const { loans } = createTestLibrary();
  const loan = loans.checkout('m-1', 'b-1', '2024-03-01');
  assert.equal(loans.renew(loan.id, '2024-03-10').dueOn, '2024-03-22');
});

test('[acceptance] a second early renewal extends from the new due date', () => {
  const { loans } = createTestLibrary();
  const loan = loans.checkout('m-1', 'b-1', '2024-03-01');
  loans.renew(loan.id, '2024-03-10');
  const second = loans.renew(loan.id, '2024-03-12');
  assert.equal(second.dueOn, '2024-03-29');
  assert.equal(second.renewals, 2);
});

test('[acceptance] renewing on the due date still adds seven days', () => {
  const { loans } = createTestLibrary();
  const loan = loans.checkout('m-1', 'b-1', '2024-03-01');
  const renewed = loans.renew(loan.id, '2024-03-15');
  assert.equal(renewed.dueOn, '2024-03-22');
  assert.equal(renewed.renewals, 1);
});
