/**
 * Runs the visible test suite of every simulation codebase in simulations/.
 * The hidden acceptance tests live on the server and are not run here.
 */

import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

const simulationsDirectory = path.resolve(import.meta.dirname, '..', 'simulations');
const failed = [];

for (const name of fs.readdirSync(simulationsDirectory).sort()) {
  const directory = path.join(simulationsDirectory, name);
  if (!fs.existsSync(path.join(directory, 'package.json'))) continue;

  console.log(`\n▶ ${name}`);
  const result = spawnSync(process.execPath, ['--test', 'tests/**/*.test.js'], { cwd: directory, stdio: 'inherit' });
  if (result.status !== 0) failed.push(name);
}

if (failed.length > 0) {
  console.error(`\nFailing simulations: ${failed.join(', ')}`);
  process.exit(1);
}
