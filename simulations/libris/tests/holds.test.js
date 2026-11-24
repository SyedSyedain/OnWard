import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createTestLibrary } from './helpers.js';
import { ConflictError } from '../src/lib/errors.js';

function libraryWithBookOut() {
  const lib = createTestLibrary();
  const loan = lib.loans.checkout('m-1', 'b-1', '2024-03-01');
  return { ...lib, loan };
}

test('a hold cannot be placed while a copy is on the shelf', () => {
  const { holds } = createTestLibrary();
  assert.throws(() => holds.placeHold('m-2', 'b-1', '2024-03-02'), ConflictError);
});

test('a hold can be placed when every copy is out', () => {
  const { holds } = libraryWithBookOut();
  const hold = holds.placeHold('m-2', 'b-1', '2024-03-02');
  assert.equal(hold.status, 'waiting');
  assert.equal(holds.queuePosition('b-1', 'm-2'), 1);
});

test('a member cannot hold the same book twice', () => {
  const { holds } = libraryWithBookOut();
  holds.placeHold('m-2', 'b-1', '2024-03-02');
  assert.throws(() => holds.placeHold('m-2', 'b-1', '2024-03-03'), ConflictError);
});

test('the queue lists holds oldest first', () => {
  const { holds } = libraryWithBookOut();
  holds.placeHold('m-2', 'b-1', '2024-03-02');
  holds.placeHold('m-3', 'b-1', '2024-03-03');
  assert.deepEqual(holds.listQueue('b-1').map((h) => h.memberId), ['m-2', 'm-3']);
  assert.equal(holds.queuePosition('b-1', 'm-3'), 2);
  assert.equal(holds.queuePosition('b-1', 'm-1'), null);
});

test('cancelling a hold removes it from the queue', () => {
  const { holds } = libraryWithBookOut();
  const hold = holds.placeHold('m-2', 'b-1', '2024-03-02');
  holds.cancelHold(hold.id);
  assert.equal(holds.listQueue('b-1').length, 0);
  assert.throws(() => holds.cancelHold(hold.id), ConflictError);
});

test('renewing is refused while another member is waiting', () => {
  const { holds, loans, loan } = libraryWithBookOut();
  holds.placeHold('m-2', 'b-1', '2024-03-02');
  assert.throws(() => loans.renew(loan.id, '2024-03-10'), ConflictError);
});
