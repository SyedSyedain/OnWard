import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createTestApp, createTestGroup, balanceMap } from './helpers.js';
import { NotFoundError, ValidationError } from '../src/lib/errors.js';

test('a group is created with its members at zero balance', () => {
  const { app, groupId } = createTestGroup();
  const group = app.groupService.getGroup(groupId);
  assert.equal(group.name, 'Goa Trip');
  assert.deepEqual(group.members.map((m) => m.name), ['Asha', 'Bala', 'Chitra']);
  assert.ok(Object.values(group.balances).every((b) => b === 0));
});

test('members can be added later', () => {
  const { app, groupId } = createTestGroup();
  const member = app.groupService.addMember(groupId, { name: 'Dev' });
  assert.equal(balanceMap(app, groupId)[member.id], 0);
  assert.equal(app.groupService.getGroup(groupId).members.length, 4);
});

test('group and member names are required', () => {
  const app = createTestApp();
  assert.throws(() => app.groupService.createGroup({ name: '' }), ValidationError);
  const group = app.groupService.createGroup({ name: 'Flat 4B' });
  assert.throws(() => app.groupService.addMember(group.id, { name: '   ' }), ValidationError);
});

test('unknown groups are not found', () => {
  const app = createTestApp();
  assert.throws(() => app.groupService.getGroup('g-404'), NotFoundError);
});

test('getGroup returns a snapshot that does not change the group', () => {
  const { app, groupId } = createTestGroup();
  const snapshot = app.groupService.getGroup(groupId);
  snapshot.members.pop();
  assert.equal(app.groupService.getGroup(groupId).members.length, 3);
});
