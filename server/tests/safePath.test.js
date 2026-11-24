import { test } from 'node:test';
import assert from 'node:assert/strict';
import path from 'node:path';
import { resolveInside } from '../src/utils/safePath.js';

const base = path.resolve('/tmp/workspace');

test('resolves a normal relative path', () => {
  assert.equal(resolveInside(base, 'src/app.js'), path.join(base, 'src/app.js'));
});

test('rejects paths that escape the base directory', () => {
  for (const attempt of ['../secret.txt', 'src/../../etc/passwd', '/etc/passwd']) {
    assert.throws(() => resolveInside(base, attempt), { code: 'INVALID_PATH' });
  }
});

test('rejects a sibling directory with the same prefix', () => {
  assert.throws(() => resolveInside(base, '../workspace-other/file.js'), { code: 'INVALID_PATH' });
});
