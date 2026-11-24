import { test } from 'node:test';
import assert from 'node:assert/strict';
import { parseTap } from '../src/services/testRunner.service.js';

test('parses top-level TAP results and separates acceptance checks', () => {
  const output = [
    'TAP version 13',
    'ok 1 - adds a new product to an empty cart',
    '    ok 1 - nested subtest is ignored',
    'not ok 2 - [acceptance] a failed checkout leaves stock unchanged',
    'ok 3 - skipped one # SKIP',
  ].join('\n');

  assert.deepEqual(parseTap(output), [
    { name: 'adds a new product to an empty cart', kind: 'project', passed: true },
    { name: 'a failed checkout leaves stock unchanged', kind: 'acceptance', passed: false },
    { name: 'skipped one', kind: 'project', passed: true },
  ]);
});
