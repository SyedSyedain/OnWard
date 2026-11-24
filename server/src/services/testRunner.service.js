/**
 * Runs a workspace's tests, plus the hidden acceptance test, in a child process.
 *
 * Safety rules:
 * - Student code never runs inside the API process.
 * - The run happens in a throw-away copy in the OS temp directory.
 * - The child gets a minimal environment (no API keys) and a hard timeout.
 * - Only test names and pass/fail are returned, never test source or raw output.
 */

import { spawn } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { config } from '../config/env.js';

const ACCEPTANCE_PREFIX = '[acceptance] ';
const MAX_OUTPUT_BYTES = 1024 * 1024;

export async function runWorkspaceTests({ workspaceDirectory, hiddenTestPath }) {
  const runDirectory = fs.mkdtempSync(path.join(os.tmpdir(), 'onward-run-'));
  const startedAt = Date.now();

  try {
    fs.cpSync(workspaceDirectory, runDirectory, { recursive: true });

    const syntaxErrors = await findSyntaxErrors(runDirectory);
    if (syntaxErrors.length > 0) {
      return buildResult({ tests: [], syntaxErrors, timedOut: false, startedAt });
    }

    const hiddenDirectory = path.join(runDirectory, 'tests', 'hidden');
    fs.mkdirSync(hiddenDirectory, { recursive: true });
    fs.copyFileSync(hiddenTestPath, path.join(hiddenDirectory, path.basename(hiddenTestPath)));

    const { stdout, timedOut } = await runNode(
      ['--test', '--test-reporter=tap', '--test-isolation=none', '--test-timeout=5000', 'tests/**/*.test.js'],
      runDirectory,
    );

    return buildResult({ tests: parseTap(stdout), syntaxErrors: [], timedOut, startedAt });
  } finally {
    fs.rmSync(runDirectory, { recursive: true, force: true });
  }
}

/** Checks every source file with `node --check` so students get readable syntax errors. */
async function findSyntaxErrors(projectDirectory) {
  const sourceDirectory = path.join(projectDirectory, 'src');
  const files = fs
    .readdirSync(sourceDirectory, { recursive: true })
    .filter((file) => file.endsWith('.js'));

  const errors = [];
  for (const file of files) {
    const { exitCode, stderr } = await runNode(['--check', path.join('src', file)], projectDirectory);
    if (exitCode !== 0) {
      errors.push({ file: `src/${file}`, message: firstErrorLine(stderr) });
    }
  }
  return errors;
}

function runNode(args, cwd) {
  return new Promise((resolve) => {
    const child = spawn(process.execPath, args, {
      cwd,
      env: { PATH: process.env.PATH, NODE_ENV: 'test' },
      stdio: ['ignore', 'pipe', 'pipe'],
    });

    let stdout = '';
    let stderr = '';
    let timedOut = false;

    const timer = setTimeout(() => {
      timedOut = true;
      child.kill('SIGKILL');
    }, config.testRunTimeoutMs);

    child.stdout.on('data', (chunk) => {
      if (stdout.length < MAX_OUTPUT_BYTES) stdout += chunk;
    });
    child.stderr.on('data', (chunk) => {
      if (stderr.length < MAX_OUTPUT_BYTES) stderr += chunk;
    });
    child.on('close', (exitCode) => {
      clearTimeout(timer);
      resolve({ exitCode, stdout, stderr, timedOut });
    });
  });
}

/** Reads top-level "ok N - name" / "not ok N - name" lines from TAP output. */
export function parseTap(output) {
  return output
    .split('\n')
    .map((line) => line.match(/^(not )?ok \d+ - (.+?)(?: # .*)?$/))
    .filter(Boolean)
    .map(([, notOk, rawName]) => {
      const isAcceptance = rawName.startsWith(ACCEPTANCE_PREFIX);
      return {
        name: isAcceptance ? rawName.slice(ACCEPTANCE_PREFIX.length) : rawName,
        kind: isAcceptance ? 'acceptance' : 'project',
        passed: !notOk,
      };
    });
}

function buildResult({ tests, syntaxErrors, timedOut, startedAt }) {
  const passedCount = tests.filter((test) => test.passed).length;
  const acceptance = tests.filter((test) => test.kind === 'acceptance');
  const loaded = tests.length > 0 && acceptance.length > 0;

  return {
    status: syntaxErrors.length > 0 ? 'syntax_error' : timedOut ? 'timed_out' : loaded ? 'completed' : 'load_error',
    allPassed: loaded && !timedOut && passedCount === tests.length,
    passedCount,
    totalCount: tests.length,
    acceptancePassed: acceptance.filter((test) => test.passed).length,
    acceptanceTotal: acceptance.length,
    tests,
    syntaxErrors,
    durationMs: Date.now() - startedAt,
  };
}

function firstErrorLine(stderr) {
  const lines = stderr.split('\n').map((line) => line.trim()).filter(Boolean);
  const location = lines[0] ?? '';
  const message = lines.find((line) => /Error:/.test(line)) ?? 'Syntax error';
  return `${message} (${location.replace(/^.*?\/src\//, 'src/')})`;
}
