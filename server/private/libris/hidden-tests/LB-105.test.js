import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createTestLibrary } from '../helpers.js';

function bookOutWithHolds(...holders) {
  const lib = createTestLibrary();
  const loan = lib.loans.checkout('m-1', 'b-1', '2024-03-01');
  holders.forEach((memberId, i) => lib.holds.placeHold(memberId, 'b-1', `2024-03-0${i + 2}`));
  return { ...lib, loan };
}

test('[acceptance] a returned copy is set aside when someone is waiting for it', () => {
  const { loans, loan, store, catalogue, holds } = bookOutWithHolds('m-2');
  const result = loans.returnCopy(loan.id, '2024-03-10');
  assert.equal(result.copy.status, 'on_hold_shelf');
  assert.equal(store.copies.get('b-1-c1').status, 'on_hold_shelf');
  assert.equal(catalogue.countAvailable('b-1'), 0);
  assert.equal(holds.listQueue('b-1').length, 0);
});

test('[acceptance] the member who has waited longest gets the returned copy', () => {
  const { loans, loan, holds } = bookOutWithHolds('m-2', 'm-3');
  loans.returnCopy(loan.id, '2024-03-10');
  assert.equal(holds.findReadyHold('m-2', 'b-1').copyId, 'b-1-c1');
  assert.equal(holds.findReadyHold('m-3', 'b-1'), null);
  assert.deepEqual(holds.listQueue('b-1').map((h) => h.memberId), ['m-3']);
  const next = loans.checkout('m-2', 'b-1', '2024-03-11');
  assert.equal(next.copyId, 'b-1-c1');
});

test('[acceptance] a returned copy with nobody waiting goes back on the open shelf', () => {
  const { loans, store, catalogue } = createTestLibrary();
  const loan = loans.checkout('m-1', 'b-1', '2024-03-01');
  const result = loans.returnCopy(loan.id, '2024-03-10');
  assert.equal(result.copy.status, 'available');
  assert.equal(store.copies.get('b-1-c1').status, 'available');
  assert.equal(catalogue.countAvailable('b-1'), 1);
});
