/**
 * Test runs and final submission: tests decide correctness, the reviewer
 * explains, and a signed Work Record is issued.
 */

import { createHash } from 'node:crypto';
import { createId } from '../utils/ids.js';
import * as issueCatalog from './issueCatalog.service.js';
import * as recordService from './record.service.js';
import * as reviewer from './ai/reviewer.service.js';
import * as workspace from './workspace.service.js';
import { calculateScore } from './scoring.service.js';
import { runWorkspaceTests } from './testRunner.service.js';
import { SESSION_STATUS, assertStatus, getSession, saveSession, toPublicReview } from './session.service.js';

const ROLE_TITLES = { 'frontend-developer': 'Frontend Developer', 'backend-developer': 'Backend Developer' };

export async function runTests(sessionId) {
  const session = getSession(sessionId);
  assertStatus(session, SESSION_STATUS.IN_PROGRESS);

  const testResult = await runForSession(session);
  session.testRuns.push(summarizeRun(testResult));
  saveSession(session);

  return testResult;
}

/** Files the student has changed so far, compared with the original project. */
export function listChanges(sessionId) {
  const session = getSession(sessionId);
  assertStatus(session, SESSION_STATUS.IN_PROGRESS);
  return workspace.diffAgainstOriginal(session.id, session.simulationId).changedFiles;
}

/**
 * A review before the final submission: the tests run, the reviewer reads the change,
 * and the student can go back, improve it and ask again. Nothing is issued yet.
 */
export async function requestReview(sessionId) {
  const session = getSession(sessionId);
  assertStatus(session, SESSION_STATUS.IN_PROGRESS);

  const testResult = await runForSession(session);
  const diff = workspace.diffAgainstOriginal(session.id, session.simulationId);
  const review = await reviewer.reviewSubmission({ ticket: session.ticket, diff, testResult });

  const attempt = {
    id: createId('rev'),
    reviewedAt: new Date().toISOString(),
    changedFiles: diff.changedFiles,
    diffHash: hashPatch(diff.patch),
    testResult,
    review,
  };
  session.testRuns.push(summarizeRun(testResult));
  session.reviews = [...(session.reviews ?? []), attempt];
  saveSession(session);

  return toPublicReview(attempt);
}

export async function submit(sessionId) {
  const session = getSession(sessionId);
  assertStatus(session, SESSION_STATUS.IN_PROGRESS);

  const testResult = await runForSession(session);
  const diff = workspace.diffAgainstOriginal(session.id, session.simulationId);
  // If nothing changed since the last review, keep that review rather than asking again.
  const lastReview = session.reviews?.at(-1);
  const review =
    lastReview?.diffHash === hashPatch(diff.patch)
      ? lastReview.review
      : await reviewer.reviewSubmission({ ticket: session.ticket, diff, testResult });
  const score = calculateScore({
    resolved: testResult.allPassed,
    qualityScore: review.qualityScore,
    hintLevel: session.hintLevel,
  });

  const submittedAt = new Date();
  const record = recordService.issueRecord({
    studentName: session.studentName,
    role: ROLE_TITLES[session.roleId],
    simulation: session.simulationName,
    task: {
      id: session.ticket.issueId,
      title: session.ticket.title,
      area: session.ticket.area,
      difficulty: session.ticket.difficulty,
    },
    outcome: testResult.allPassed ? 'resolved' : 'not_resolved',
    tests: {
      passed: testResult.passedCount,
      total: testResult.totalCount,
      acceptancePassed: testResult.acceptancePassed,
      acceptanceTotal: testResult.acceptanceTotal,
    },
    score,
    process: {
      hintLevelUsed: session.hintLevel,
      managerQuestions: session.managerMessages.filter((message) => message.author === 'student').length,
      teammateMessages: session.teammateMessages.filter((message) => message.author === 'student').length,
      testRuns: session.testRuns.length,
      filesChanged: diff.changedFiles,
      minutesSpent: Math.max(1, Math.round((submittedAt - new Date(session.startedAt)) / 60000)),
    },
    review: {
      summary: review.summary,
      strengths: review.strengths,
      improvements: review.improvements,
      // Only when present: an undefined key would not survive storage and would break the signature.
      ...(review.aspects && { aspects: review.aspects }),
    },
  });

  session.status = SESSION_STATUS.SUBMITTED;
  session.submittedAt = submittedAt.toISOString();
  session.testRuns.push(summarizeRun(testResult));
  session.result = { recordId: record.id, score, review, testResult, diff };
  return saveSession(session);
}

function runForSession(session) {
  const issue = issueCatalog.getIssue(session.simulationId, session.issueId);
  return runWorkspaceTests({
    workspaceDirectory: workspace.getWorkspaceDirectory(session.id),
    hiddenTestPath: issueCatalog.getHiddenTestPath(session.simulationId, issue),
  });
}

function summarizeRun(testResult) {
  return {
    ranAt: new Date().toISOString(),
    status: testResult.status,
    passedCount: testResult.passedCount,
    totalCount: testResult.totalCount,
  };
}

function hashPatch(patch) {
  return createHash('sha256').update(patch).digest('hex');
}
