/**
 * Per-session copies of a simulation project that the student edits.
 * All paths coming from the client go through `resolveInside`.
 */

import fs from 'node:fs';
import path from 'node:path';
import { createTwoFilesPatch } from 'diff';
import { config } from '../config/env.js';
import { AppError } from '../lib/AppError.js';
import { resolveInside } from '../utils/safePath.js';

const IGNORED_NAMES = new Set(['node_modules', '.DS_Store', 'package-lock.json']);
const EDITABLE_EXTENSIONS = new Set(['.js', '.json', '.md']);
const MAX_FILE_BYTES = 200 * 1024;

export function getWorkspaceDirectory(sessionId) {
  return resolveInside(config.paths.workspaces, sessionId);
}

function getSimulationDirectory(simulationId) {
  return resolveInside(config.paths.simulations, simulationId);
}

export function createWorkspace(sessionId, simulationId) {
  const target = getWorkspaceDirectory(sessionId);
  fs.rmSync(target, { recursive: true, force: true });
  fs.cpSync(getSimulationDirectory(simulationId), target, {
    recursive: true,
    filter: (source) => !IGNORED_NAMES.has(path.basename(source)),
  });
}

export function listFiles(sessionId) {
  return walk(getWorkspaceDirectory(sessionId));
}

export function readFile(sessionId, relativePath) {
  const filePath = resolveInside(getWorkspaceDirectory(sessionId), relativePath);
  if (!fs.existsSync(filePath) || !fs.statSync(filePath).isFile()) {
    throw AppError.notFound(`File "${relativePath}" does not exist.`, 'FILE_NOT_FOUND');
  }
  return fs.readFileSync(filePath, 'utf8');
}

export function writeFile(sessionId, relativePath, content) {
  const filePath = resolveInside(getWorkspaceDirectory(sessionId), relativePath);

  if (!EDITABLE_EXTENSIONS.has(path.extname(filePath))) {
    throw AppError.badRequest('Only .js, .json and .md files can be edited.', 'FILE_NOT_EDITABLE');
  }
  if (Buffer.byteLength(content, 'utf8') > MAX_FILE_BYTES) {
    throw AppError.badRequest('The file is larger than 200 KB.', 'FILE_TOO_LARGE');
  }

  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, content, 'utf8');
}

/** Unified diff of the workspace against the original simulation project. */
export function diffAgainstOriginal(sessionId, simulationId) {
  const originalDirectory = getSimulationDirectory(simulationId);
  const workspaceDirectory = getWorkspaceDirectory(sessionId);
  const allPaths = new Set([...walk(originalDirectory), ...walk(workspaceDirectory)]);

  const changedFiles = [];
  const patches = [];

  for (const relativePath of [...allPaths].sort()) {
    const before = readIfExists(path.join(originalDirectory, relativePath));
    const after = readIfExists(path.join(workspaceDirectory, relativePath));
    if (before !== after) {
      changedFiles.push(relativePath);
      patches.push(createTwoFilesPatch(`a/${relativePath}`, `b/${relativePath}`, before, after, '', '', { context: 3 }));
    }
  }

  return { changedFiles, patch: patches.join('\n') };
}

function walk(directory, prefix = '') {
  if (!fs.existsSync(directory)) {
    return [];
  }
  return fs
    .readdirSync(directory, { withFileTypes: true })
    .filter((entry) => !IGNORED_NAMES.has(entry.name))
    .flatMap((entry) => {
      const relativePath = prefix ? `${prefix}/${entry.name}` : entry.name;
      return entry.isDirectory() ? walk(path.join(directory, entry.name), relativePath) : [relativePath];
    })
    .sort();
}

function readIfExists(filePath) {
  return fs.existsSync(filePath) ? fs.readFileSync(filePath, 'utf8') : '';
}
