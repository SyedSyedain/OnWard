/**
 * "Settle up" payments: one member paying another to clear what they owe.
 */

import { ConflictError, ValidationError } from '../lib/errors.js';
import { formatRupees } from '../lib/money.js';

/**
 * @param {ReturnType<import('../repositories/createStore.js').createStore>} store
 * @param {ReturnType<import('./groupService.js').createGroupService>} groupService
 * @param {ReturnType<import('./balanceService.js').createBalanceService>} balanceService
 * @param {ReturnType<import('./activityService.js').createActivityService>} activityService
 */
export function createSettlementService(store, groupService, balanceService, activityService) {
  /**
   * Records a payment from one member to another.
   * @param {string} groupId
   * @param {{ from: string, to: string, amountInPaise: number }} input
   */
  function settleUp(groupId, { from, to, amountInPaise } = {}) {
    const group = groupService.requireGroup(groupId);
    const payer = groupService.requireMember(group, from);
    const receiver = groupService.requireMember(group, to);
    if (from === to) throw new ValidationError('A member cannot settle up with themselves');
    if (!Number.isInteger(amountInPaise) || amountInPaise <= 0) {
      throw new ValidationError('Amount must be a positive whole number of paise');
    }
    const owed = -group.balances[from];
    if (owed <= 0) {
      throw new ConflictError(`${payer.name} does not owe anything`);
    }
    if (amountInPaise > owed) {
      throw new ConflictError(`${payer.name} only owes ${formatRupees(owed)}`);
    }

    const settlement = {
      id: store.nextId('s'),
      groupId,
      from,
      to,
      amountInPaise,
      createdAt: store.clock(),
    };
    store.settlements.push(settlement);
    balanceService.applyTransfer(group, from, to, amountInPaise);
    activityService.record(groupId, 'settlement.recorded', `${payer.name} paid ${receiver.name} ${formatRupees(amountInPaise)}`);
    return settlement;
  }

  /**
   * Lists the settlements of a group, oldest first.
   * @param {string} groupId
   */
  function listSettlements(groupId) {
    groupService.requireGroup(groupId);
    return store.settlements.filter((s) => s.groupId === groupId);
  }

  return { settleUp, listSettlements };
}
