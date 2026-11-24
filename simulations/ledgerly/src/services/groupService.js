/**
 * Groups and their members.
 */

import { NotFoundError } from '../lib/errors.js';
import { requireText } from '../lib/validation.js';

/**
 * @param {ReturnType<import('../repositories/createStore.js').createStore>} store
 * @param {ReturnType<import('./activityService.js').createActivityService>} activityService
 */
export function createGroupService(store, activityService) {
  /**
   * Returns the live group record or throws.
   * @throws {NotFoundError}
   */
  function requireGroup(groupId) {
    const group = store.groups.get(groupId);
    if (!group) throw new NotFoundError(`Group ${groupId} not found`);
    return group;
  }

  /**
   * Returns the member of a group or throws.
   * @throws {NotFoundError}
   */
  function requireMember(group, memberId) {
    const member = group.members.find((m) => m.id === memberId);
    if (!member) throw new NotFoundError(`Member ${memberId} is not in this group`);
    return member;
  }

  /**
   * Adds a member to a group and starts their balance at zero.
   * @param {string} groupId
   * @param {{ name: string }} input
   */
  function addMember(groupId, { name } = {}) {
    const group = requireGroup(groupId);
    const member = { id: store.nextId('m'), name: requireText(name, 'Member name') };
    group.members.push(member);
    group.balances[member.id] = 0;
    activityService.record(groupId, 'member.added', `${member.name} joined the group`);
    return { ...member };
  }

  /**
   * Creates a group, optionally with starting members.
   * @param {{ name: string, members?: string[] }} input
   */
  function createGroup({ name, members = [] } = {}) {
    const group = { id: store.nextId('g'), name: requireText(name, 'Group name'), members: [], balances: {} };
    store.groups.set(group.id, group);
    for (const memberName of members) addMember(group.id, { name: memberName });
    return getGroup(group.id);
  }

  /**
   * Returns a snapshot of a group.
   * @throws {NotFoundError}
   */
  function getGroup(groupId) {
    const group = requireGroup(groupId);
    return {
      id: group.id,
      name: group.name,
      members: group.members.map((m) => ({ ...m })),
      balances: { ...group.balances },
    };
  }

  return { createGroup, addMember, getGroup, requireGroup, requireMember };
}
