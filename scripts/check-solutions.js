/**
 * Checks the demo solutions in server/private/<codebase>/solutions/<ticket>/.
 * For each ticket: the hidden test must fail on the untouched codebase, and the
 * codebase with the solution files copied over must pass every test, hidden one included.
 *
 * Usage: node scripts/check-solutions.js [codebase ...]
 */

import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

const root = path.resolve(import.meta.dirname, '..');
const simulations = path.join(root, 'simulations');
const privateData = path.join(root, 'server', 'private');
const only = process.argv.slice(2);
const problems = [];
let checked = 0;

function run(directory) {
  const result = spawnSync(
    process.execPath,
    ['--test', '--test-isolation=none', '--test-timeout=5000', 'tests/**/*.test.js'],
    { cwd: directory, encoding: 'utf8', env: { PATH: process.env.PATH, NODE_ENV: 'test' }, timeout: 30_000 },
  );
  return result.status === 0;
}

function prepare(codebase, issue, solutionDirectory) {
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'onward-solution-'));
  fs.cpSync(path.join(simulations, codebase), directory, {
    recursive: true,
    filter: (source) => !['node_modules', 'package-lock.json'].includes(path.basename(source)),
  });
  fs.mkdirSync(path.join(directory, 'tests', 'hidden'), { recursive: true });
  fs.copyFileSync(
    path.join(privateData, codebase, 'hidden-tests', issue.hiddenTest),
    path.join(directory, 'tests', 'hidden', path.basename(issue.hiddenTest)),
  );
  if (solutionDirectory) {
    fs.cpSync(solutionDirectory, directory, { recursive: true });
  }
  return directory;
}

for (const codebase of fs.readdirSync(privateData).sort()) {
  const manifestPath = path.join(privateData, codebase, 'manifest.json');
  if (!fs.existsSync(manifestPath) || (only.length && !only.includes(codebase))) continue;
  const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));

  for (const issue of manifest.issues) {
    checked += 1;
    const solutionDirectory = path.join(privateData, codebase, 'solutions', issue.id);
    if (!fs.existsSync(solutionDirectory)) {
      problems.push(`${issue.id}: no solution`);
      continue;
    }
    const before = prepare(codebase, issue, null);
    const after = prepare(codebase, issue, solutionDirectory);
    try {
      if (run(before)) problems.push(`${issue.id}: tests already pass without the solution`);
      if (!run(after)) problems.push(`${issue.id}: tests fail with the solution`);
      else console.log(`ok ${issue.id}`);
    } finally {
      fs.rmSync(before, { recursive: true, force: true });
      fs.rmSync(after, { recursive: true, force: true });
    }
  }
}

if (problems.length) {
  console.error(`\n${problems.length} of ${checked} tickets have problems:\n${problems.join('\n')}`);
  process.exit(1);
}
console.log(`\nAll ${checked} solutions check out.`);
