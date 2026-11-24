import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createTestGroup, balanceMap } from '../helpers.js';
import { ConflictError } from '../../src/lib/errors.js';

function groupWithDinner() {
  const ctx = createTestGroup();
  ctx.app.expenseService.addExpense(ctx.groupId, { description: 'Dinner', amountInPaise: 90000, paidBy: ctx.asha });
  return ctx;
}

test('[acceptance] settling more than the payer owes is rejected with a ConflictError', () => {
  const { app, groupId, asha, bala } = groupWithDinner();
  assert.throws(() => app.settlementService.settleUp(groupId, { from: bala, to: asha, amountInPaise: 30001 }), ConflictError);
});

test('[acceptance] a member who owes nothing cannot settle up, and nothing is recorded', () => {
  const { app, groupId, asha, bala, chitra } = groupWithDinner();
  assert.throws(() => app.settlementService.settleUp(groupId, { from: asha, to: bala, amountInPaise: 100 }), ConflictError);
  assert.equal(app.settlementService.listSettlements(groupId).length, 0);
  assert.deepEqual(balanceMap(app, groupId), { [asha]: 60000, [bala]: -30000, [chitra]: -30000 });
});

test('[acceptance] settling exactly what is owed still works', () => {
  const { app, groupId, asha, bala, chitra } = groupWithDinner();
  app.settlementService.settleUp(groupId, { from: bala, to: asha, amountInPaise: 30000 });
  assert.deepEqual(balanceMap(app, groupId), { [asha]: 30000, [bala]: 0, [chitra]: -30000 });
});
