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

/** Every simulation on disk, as { id, name, roleId, description, issueCount }. */
export function listSimulations() {
  return fs
    .readdirSync(config.paths.privateData, { withFileTypes: true })
    .filter((entry) => entry.isDirectory() && fs.existsSync(path.join(config.paths.privateData, entry.name, 'manifest.json')))
    .map((entry) => {
      const manifest = loadManifest(entry.name);
      return {
        id: manifest.simulationId,
        name: manifest.simulationName,
        roleId: manifest.roleId ?? 'backend-developer',
        description: manifest.description ?? '',
        issueCount: manifest.issues.length,
      };
    })
    .sort((a, b) => a.name.localeCompare(b.name));
}

/** Picks a codebase for the role that has a ticket at this difficulty, then a ticket in it. */
export function pickTicket(roleId, difficulty) {
  const candidates = listSimulations()
    .filter((simulation) => simulation.roleId === roleId)
    .flatMap((simulation) =>
      loadManifest(simulation.id)
        .issues.filter((issue) => issue.difficulty === difficulty)
        .map((issue) => ({ simulationId: simulation.id, issue })),
    );
  if (candidates.length === 0) {
    throw AppError.badRequest(`No ${difficulty} tasks are available for this role yet.`, 'NO_ISSUE_AVAILABLE');
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

/**
 * Requirement-level background the manager may share: who is affected, priority, scope
 * and how to reproduce. It never describes the cause or the fix.
 */
export function getContext(issue) {
  return issue.context ?? null;
}

/** A teammate's prepared note for this ticket (a code tour, edge cases or the concept), never the fix. */
export function getGuide(issue, teammateId) {
  return issue.guide?.[teammateId] ?? null;
}

/** Returns the hint for a level from 1 to 4, or null for level 0. */
export function getHint(issue, level) {
  return level > 0 ? issue.hints[Math.min(level, issue.hints.length) - 1] : null;
}

export function getHiddenTestPath(simulationId, issue) {
  return path.join(config.paths.privateData, simulationId, 'hidden-tests', issue.hiddenTest);
}

/**
 * The predefined solution of a ticket, as full file contents, so the Codespace can
 * apply a correct fix and show how the evaluation reacts to it.
 */
export function getSolution(simulationId, issue) {
  const directory = path.join(config.paths.privateData, simulationId, 'solutions', issue.id);
  if (!fs.existsSync(directory)) {
    throw AppError.notFound('This ticket has no solution yet.', 'SOLUTION_NOT_FOUND');
  }
  return fs
    .readdirSync(directory, { recursive: true })
    .map((file) => String(file).split(path.sep).join('/'))
    .filter((file) => fs.statSync(path.join(directory, file)).isFile())
    .sort()
    .map((file) => ({ path: file, content: fs.readFileSync(path.join(directory, file), 'utf8') }));
}

export const MAX_HINT_LEVEL = 4;
