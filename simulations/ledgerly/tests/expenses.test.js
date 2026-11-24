import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createTestGroup, balanceMap } from './helpers.js';
import { NotFoundError, ValidationError } from '../src/lib/errors.js';
import { splitByShares, splitEqually } from '../src/lib/money.js';

test('an equal expense is split between all members and credited to the payer', () => {
  const { app, groupId, asha, bala, chitra } = createTestGroup();
  const expense = app.expenseService.addExpense(groupId, { description: 'Dinner', amountInPaise: 90000, paidBy: asha });
  assert.equal(expense.splits.length, 3);
  assert.deepEqual(balanceMap(app, groupId), { [asha]: 60000, [bala]: -30000, [chitra]: -30000 });
});

test('an equal expense can be limited to some participants', () => {
  const { app, groupId, asha, bala, chitra } = createTestGroup();
  app.expenseService.addExpense(groupId, {
    description: 'Taxi',
    amountInPaise: 20000,
    paidBy: bala,
    split: { type: 'equal', participants: [asha, bala] },
  });
  assert.deepEqual(balanceMap(app, groupId), { [asha]: -10000, [bala]: 10000, [chitra]: 0 });
});

test('an expense can be split by shares', () => {
  const { app, groupId, asha, bala, chitra } = createTestGroup();
  app.expenseService.addExpense(groupId, {
    description: 'Hotel',
    amountInPaise: 100000,
    paidBy: asha,
    split: { type: 'shares', shares: { [asha]: 1, [bala]: 1, [chitra]: 2 } },
  });
  assert.deepEqual(balanceMap(app, groupId), { [asha]: 75000, [bala]: -25000, [chitra]: -50000 });
});

test('splitByShares always adds up to the total', () => {
  const parts = splitByShares(100, { a: 1, b: 1, c: 1 });
  assert.equal(parts.reduce((sum, p) => sum + p.amountInPaise, 0), 100);
});

test('splitEqually divides an exact amount evenly', () => {
  assert.deepEqual(splitEqually(300, ['a', 'b', 'c']).map((p) => p.amountInPaise), [100, 100, 100]);
});

test('invalid expenses are rejected', () => {
  const { app, groupId, asha } = createTestGroup();
  const add = (input) => () => app.expenseService.addExpense(groupId, { description: 'Snacks', paidBy: asha, amountInPaise: 500, ...input });
  assert.throws(add({ amountInPaise: -100 }), ValidationError);
  assert.throws(add({ amountInPaise: 10.5 }), ValidationError);
  assert.throws(add({ description: '  ' }), ValidationError);
  assert.throws(add({ split: { type: 'equal', participants: [] } }), ValidationError);
  assert.throws(add({ paidBy: 'm-999' }), NotFoundError);
});

test('expenses are listed per group and can be deleted', () => {
  const { app, groupId, asha } = createTestGroup();
  const first = app.expenseService.addExpense(groupId, { description: 'Lunch', amountInPaise: 30000, paidBy: asha });
  app.expenseService.addExpense(groupId, { description: 'Tea', amountInPaise: 6000, paidBy: asha });
  app.expenseService.deleteExpense(groupId, first.id);
  assert.deepEqual(app.expenseService.listExpenses(groupId).map((e) => e.description), ['Tea']);
  assert.throws(() => app.expenseService.deleteExpense(groupId, first.id), NotFoundError);
});
