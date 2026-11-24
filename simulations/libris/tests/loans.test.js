import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createTestLibrary } from './helpers.js';
import { ConflictError, NotFoundError, ValidationError } from '../src/lib/errors.js';

test('checkout creates a loan due 14 days later and takes the copy off the shelf', () => {
  const { loans, store } = createTestLibrary();
  const loan = loans.checkout('m-1', 'b-1', '2024-03-01');
  assert.equal(loan.dueOn, '2024-03-15');
  assert.equal(loan.returnedOn, null);
  assert.equal(store.copies.get('b-1-c1').status, 'on_loan');
});

test('checkout fails when no copy is on the shelf', () => {
  const { loans } = createTestLibrary();
  loans.checkout('m-1', 'b-1', '2024-03-01');
  assert.throws(() => loans.checkout('m-2', 'b-1', '2024-03-02'), ConflictError);
});

test('checkout rejects unknown members, unknown books and bad dates', () => {
  const { loans } = createTestLibrary();
  assert.throws(() => loans.checkout('ghost', 'b-1', '2024-03-01'), NotFoundError);
  assert.throws(() => loans.checkout('m-1', 'nope', '2024-03-01'), NotFoundError);
  assert.throws(() => loans.checkout('m-1', 'b-1', '01/03/2024'), ValidationError);
});

test('a member cannot borrow two copies of the same book', () => {
  const { loans } = createTestLibrary({ copiesPerBook: 2 });
  loans.checkout('m-1', 'b-1', '2024-03-01');
  assert.throws(() => loans.checkout('m-1', 'b-1', '2024-03-02'), ConflictError);
});

test('a member below the limit can keep borrowing', () => {
  const { loans } = createTestLibrary();
  loans.checkout('m-3', 'b-1', '2024-03-01');
  const second = loans.checkout('m-3', 'b-2', '2024-03-01');
  assert.equal(second.memberId, 'm-3');
});

test('returning on time costs nothing and frees the copy', () => {
  const { loans, store } = createTestLibrary();
  const loan = loans.checkout('m-1', 'b-1', '2024-03-01');
  const result = loans.returnCopy(loan.id, '2024-03-10');
  assert.equal(result.fine, 0);
  assert.equal(result.loan.returnedOn, '2024-03-10');
  assert.equal(store.copies.get('b-1-c1').status, 'available');
});

test('a loan cannot be returned twice', () => {
  const { loans } = createTestLibrary();
  const loan = loans.checkout('m-1', 'b-1', '2024-03-01');
  loans.returnCopy(loan.id, '2024-03-02');
  assert.throws(() => loans.returnCopy(loan.id, '2024-03-03'), ConflictError);
});

test('three days late costs three days of fine', () => {
  const { loans } = createTestLibrary();
  const loan = loans.checkout('m-1', 'b-1', '2024-03-01');
  assert.equal(loans.returnCopy(loan.id, '2024-03-18').fine, 600);
});

test('renewing on the due date adds seven days', () => {
  const { loans } = createTestLibrary();
  const loan = loans.checkout('m-1', 'b-1', '2024-03-01');
  const renewed = loans.renew(loan.id, '2024-03-15');
  assert.equal(renewed.dueOn, '2024-03-22');
  assert.equal(renewed.renewals, 1);
});

test('renewing an overdue loan is refused', () => {
  const { loans } = createTestLibrary();
  const loan = loans.checkout('m-1', 'b-1', '2024-03-01');
  assert.throws(() => loans.renew(loan.id, '2024-03-16'), ConflictError);
});

test('a loan can be renewed at most twice', () => {
  const { loans } = createTestLibrary();
  const loan = loans.checkout('m-1', 'b-1', '2024-03-01');
  loans.renew(loan.id, '2024-03-15');
  loans.renew(loan.id, '2024-03-22');
  assert.throws(() => loans.renew(loan.id, '2024-03-29'), ConflictError);
});
