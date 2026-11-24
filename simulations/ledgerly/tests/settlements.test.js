import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createTestGroup, balanceMap } from './helpers.js';
import { NotFoundError, ValidationError } from '../src/lib/errors.js';

function groupWithDinner() {
  const ctx = createTestGroup();
  ctx.app.expenseService.addExpense(ctx.groupId, { description: 'Dinner', amountInPaise: 90000, paidBy: ctx.asha });
  return ctx;
}

test('a partial settle-up reduces what the payer owes', () => {
  const { app, groupId, asha, bala, chitra } = groupWithDinner();
  app.settlementService.settleUp(groupId, { from: bala, to: asha, amountInPaise: 10000 });
  assert.deepEqual(balanceMap(app, groupId), { [asha]: 50000, [bala]: -20000, [chitra]: -30000 });
});

test('settling the exact amount clears the payer', () => {
  const { app, groupId, asha, bala } = groupWithDinner();
  app.settlementService.settleUp(groupId, { from: bala, to: asha, amountInPaise: 30000 });
  assert.equal(balanceMap(app, groupId)[bala], 0);
  assert.equal(app.settlementService.listSettlements(groupId).length, 1);
});

test('settle-up input is validated', () => {
  const { app, groupId, asha, bala } = groupWithDinner();
  const settle = (input) => () => app.settlementService.settleUp(groupId, { from: bala, to: asha, amountInPaise: 100, ...input });
  assert.throws(settle({ amountInPaise: 0 }), ValidationError);
  assert.throws(settle({ amountInPaise: -5 }), ValidationError);
  assert.throws(settle({ to: bala }), ValidationError);
  assert.throws(settle({ to: 'm-999' }), NotFoundError);
});

test('suggested settlements clear every balance', () => {
  const { app, groupId, asha, bala, chitra } = groupWithDinner();
  const payments = app.balanceService.suggestSettlements(groupId);
  assert.deepEqual(payments, [
    { from: bala, to: asha, amountInPaise: 30000 },
    { from: chitra, to: asha, amountInPaise: 30000 },
  ]);
});
