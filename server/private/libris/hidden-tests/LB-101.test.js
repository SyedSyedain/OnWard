import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createTestLibrary } from '../helpers.js';
import { ConflictError } from '../../src/lib/errors.js';

test('[acceptance] a member who is at their borrowing limit cannot borrow another book', () => {
  const { loans } = createTestLibrary();
  loans.checkout('m-1', 'b-1', '2024-03-01');
  loans.checkout('m-1', 'b-2', '2024-03-01');
  loans.checkout('m-1', 'b-3', '2024-03-01');
  assert.throws(() => loans.checkout('m-1', 'b-4', '2024-03-01'), ConflictError);
});

test('[acceptance] a member can borrow up to exactly their limit', () => {
  const { loans, members } = createTestLibrary();
  loans.checkout('m-3', 'b-1', '2024-03-01');
  loans.checkout('m-3', 'b-2', '2024-03-01');
  assert.equal(members.listActiveLoans('m-3').length, 2);
});

test('[acceptance] returning a book makes room to borrow again', () => {
  const { loans } = createTestLibrary();
  const first = loans.checkout('m-3', 'b-1', '2024-03-01');
  loans.checkout('m-3', 'b-2', '2024-03-01');
  loans.returnCopy(first.id, '2024-03-05');
  const third = loans.checkout('m-3', 'b-3', '2024-03-06');
  assert.equal(third.bookId, 'b-3');
});
