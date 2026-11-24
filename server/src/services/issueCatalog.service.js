/**
 * Access to the private issue manifest of each simulation.
 * Only `toPublicIssue` output may ever leave the server.
 */

import fs from 'node:fs';
import path from 'node:path';
import { config } from '../config/env.js';
import { AppError } from '../lib/AppError.js';

const manifestCache = new Map();

function loadManifest(simulationId) {
  if (!manifestCache.has(simulationId)) {
    const manifestPath = path.join(config.paths.privateData, simulationId, 'manifest.json');
    if (!fs.existsSync(manifestPath)) {
      throw AppError.notFound(`Simulation "${simulationId}" does not exist.`, 'SIMULATION_NOT_FOUND');
    }
    manifestCache.set(simulationId, JSON.parse(fs.readFileSync(manifestPath, 'utf8')));
  }
  return manifestCache.get(simulationId);
}

export function getSimulationName(simulationId) {
  return loadManifest(simulationId).simulationName;
}

export function pickIssue(simulationId, difficulty) {
  const candidates = loadManifest(simulationId).issues.filter((issue) => issue.difficulty === difficulty);
  if (candidates.length === 0) {
    throw AppError.badRequest(`No ${difficulty} tasks are available yet.`, 'NO_ISSUE_AVAILABLE');
  }
  return candidates[Math.floor(Math.random() * candidates.length)];
}

export function getIssue(simulationId, issueId) {
  const issue = loadManifest(simulationId).issues.find((candidate) => candidate.id === issueId);
  if (!issue) {
    throw AppError.notFound(`Issue "${issueId}" does not exist.`, 'ISSUE_NOT_FOUND');
  }
  return issue;
}

/** The fields a student is allowed to see. Hints and hidden tests are excluded. */
export function toPublicIssue(issue) {
  const { id, difficulty, area, title, symptoms, relevantFiles, acceptanceCriteria } = issue;
  return { id, difficulty, area, title, symptoms, relevantFiles, acceptanceCriteria };
}

/** Returns the hint for a level from 1 to 4, or null for level 0. */
export function getHint(issue, level) {
  return level > 0 ? issue.hints[Math.min(level, issue.hints.length) - 1] : null;
}

export function getHiddenTestPath(simulationId, issue) {
  return path.join(config.paths.privateData, simulationId, 'hidden-tests', issue.hiddenTest);
}

export const MAX_HINT_LEVEL = 4;
