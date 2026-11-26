/**
 * Expenses: validating them, splitting them between members and keeping
 * balances and the activity feed up to date.
 */

import { NotFoundError, ValidationError } from '../lib/errors.js';
import { splitByShares, splitEqually, formatRupees } from '../lib/money.js';
import { requireText } from '../lib/validation.js';

/**
 * @param {ReturnType<import('../repositories/createStore.js').createStore>} store
 * @param {ReturnType<import('./groupService.js').createGroupService>} groupService
 * @param {ReturnType<import('./balanceService.js').createBalanceService>} balanceService
 * @param {ReturnType<import('./activityService.js').createActivityService>} activityService
 */
export function createExpenseService(store, groupService, balanceService, activityService) {
  function resolveSplits(group, amountInPaise, split = { type: 'equal' }) {
    if (split.type === 'equal') {
      const participants = split.participants ?? group.members.map((m) => m.id);
      if (participants.length === 0 || new Set(participants).size !== participants.length) {
        throw new ValidationError('Participants must be a non-empty list without duplicates');
      }
      participants.forEach((id) => groupService.requireMember(group, id));
      return splitEqually(amountInPaise, participants);
    }
    if (split.type === 'shares') {
      const ids = Object.keys(split.shares ?? {});
      if (ids.length === 0) throw new ValidationError('Shares are required');
      for (const id of ids) {
        groupService.requireMember(group, id);
        if (!Number.isInteger(split.shares[id]) || split.shares[id] <= 0) {
          throw new ValidationError('Each share must be a positive whole number');
        }
      }
      return splitByShares(amountInPaise, split.shares);
    }
    throw new ValidationError(`Unknown split type: ${split.type}`);
  }

  /**
   * Adds an expense to a group and updates balances.
   * @param {string} groupId
   * @param {{
   *   description: string,
   *   amountInPaise: number,
   *   paidBy: string,
   *   split?: { type: 'equal', participants?: string[] } | { type: 'shares', shares: Record<string, number> }
   * }} input
   */
  function addExpense(groupId, input = {}) {
    const group = groupService.requireGroup(groupId);
    const description = requireText(input.description, 'Description');
    const { amountInPaise, paidBy } = input;
    if (!Number.isInteger(amountInPaise) || amountInPaise <= 0) {
      throw new ValidationError('Amount must be a positive whole number of paise');
    }
    const payer = groupService.requireMember(group, paidBy);
    const splits = resolveSplits(group, amountInPaise, input.split);

    const expense = {
      id: store.nextId('e'),
      groupId,
      description,
      amountInPaise,
      paidBy,
      splits,
      createdAt: store.clock(),
    };
    store.expenses.set(expense.id, expense);
    balanceService.applyExpense(group, expense);
    activityService.record(groupId, 'expense.added', `${payer.name} paid ${formatRupees(amountInPaise)} for ${description}`);
    return expense;
  }

  /**
   * Lists the expenses of a group in the order they were added.
   * @param {string} groupId
   */
  function listExpenses(groupId) {
    groupService.requireGroup(groupId);
    return [...store.expenses.values()].filter((e) => e.groupId === groupId);
  }

  /**
   * Deletes an expense.
   * @param {string} groupId
   * @param {string} expenseId
   * @throws {NotFoundError}
   */
  function deleteExpense(groupId, expenseId) {
    groupService.requireGroup(groupId);
    const expense = store.expenses.get(expenseId);
    if (!expense || expense.groupId !== groupId) {
      throw new NotFoundError(`Expense ${expenseId} not found`);
    }
    store.expenses.delete(expenseId);
    activityService.record(groupId, 'expense.deleted', `Deleted expense: ${expense.description}`);
  }

  return { addExpense, listExpenses, deleteExpense };
}
