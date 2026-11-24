/**
 * A session is one student working on one ticket, from briefing to submission.
 *
 *   briefing ──start work──▶ in_progress ──submit──▶ submitted
 */

import { AppError } from '../lib/AppError.js';
import { sessionsCollection } from '../store/index.js';
import { createId } from '../utils/ids.js';
import * as issueCatalog from './issueCatalog.service.js';
import * as manager from './ai/manager.service.js';
import * as teammate from './ai/teammate.service.js';
import * as workspace from './workspace.service.js';

export const SESSION_STATUS = Object.freeze({
  BRIEFING: 'briefing',
  IN_PROGRESS: 'in_progress',
  SUBMITTED: 'submitted',
});

export async function createSession({ studentName, difficulty, roleId }) {
  const { simulationId, issue } = issueCatalog.pickTicket(roleId, difficulty);
  const simulationName = issueCatalog.getSimulationName(simulationId);
  const ticket = await manager.writeTicket({ simulationName, publicIssue: issueCatalog.toPublicIssue(issue) });

  return sessionsCollection.save({
    id: createId('ses'),
    studentName,
    roleId,
    simulationId,
    simulationName,
    issueId: issue.id,
    status: SESSION_STATUS.BRIEFING,
    ticket,
    managerMessages: [],
    teammateMessages: [],
    hintLevel: 0,
    testRuns: [],
    result: null,
    createdAt: new Date().toISOString(),
    startedAt: null,
    submittedAt: null,
  });
}

export function getSession(sessionId) {
  const session = sessionsCollection.get(sessionId);
  if (!session) {
    throw AppError.notFound('This session does not exist.', 'SESSION_NOT_FOUND');
  }
  return session;
}

export function saveSession(session) {
  return sessionsCollection.save(session);
}

export function assertStatus(session, expectedStatus) {
  if (session.status !== expectedStatus) {
    throw AppError.conflict(`This action is not available while the session is "${session.status}".`, 'INVALID_SESSION_STATE');
  }
}

export async function askManager(sessionId, message) {
  const session = getSession(sessionId);
  if (session.status === SESSION_STATUS.SUBMITTED) {
    throw AppError.conflict('This ticket is already submitted.', 'INVALID_SESSION_STATE');
  }

  const issue = issueCatalog.getIssue(session.simulationId, session.issueId);
  const reply = await manager.answerQuestion({
    ticket: session.ticket,
    context: issueCatalog.getContext(issue),
    history: session.managerMessages,
    message,
  });
  session.managerMessages.push(chatMessage('student', message), {
    ...chatMessage('manager', reply.text),
    generatedBy: reply.generatedBy,
  });
  return saveSession(session);
}

export function startWork(sessionId) {
  const session = getSession(sessionId);
  assertStatus(session, SESSION_STATUS.BRIEFING);

  workspace.createWorkspace(session.id, session.simulationId);
  session.status = SESSION_STATUS.IN_PROGRESS;
  session.startedAt = new Date().toISOString();
  return saveSession(session);
}

export async function askTeammate(sessionId, { teammate: teammateId, message, filePath, requestHint }) {
  const session = getSession(sessionId);
  assertStatus(session, SESSION_STATUS.IN_PROGRESS);

  if (requestHint) {
    session.hintLevel = Math.min(session.hintLevel + 1, issueCatalog.MAX_HINT_LEVEL);
  }

  const issue = issueCatalog.getIssue(session.simulationId, session.issueId);
  const studentMessage = message || 'Can I get a hint?';

  // Each teammate keeps their own thread. Messages from before teammates had names belong to Alex.
  const history = session.teammateMessages.filter((entry) => (entry.teammate ?? 'alex') === teammateId);

  const reply = await teammate.reply({
    teammateId,
    roleId: session.roleId,
    ticket: session.ticket,
    guide: issueCatalog.getGuide(issue, teammateId),
    history,
    message: studentMessage,
    hintLevel: session.hintLevel,
    hint: issueCatalog.getHint(issue, session.hintLevel),
    filePath,
    fileContent: filePath ? workspace.readFile(session.id, filePath) : null,
  });

  session.teammateMessages.push(
    { ...chatMessage('student', studentMessage), teammate: teammateId },
    {
      ...chatMessage('teammate', reply.text),
      teammate: teammateId,
      hintLevel: session.hintLevel,
      generatedBy: reply.generatedBy,
    },
  );
  return saveSession(session);
}

/** The session as the client may see it. */
export function toPublicSession(session) {
  const { issueId, reviews = [], ...visible } = session;
  return {
    ...visible,
    reviews: reviews.map(toPublicReview),
    maxHintLevel: issueCatalog.MAX_HINT_LEVEL,
  };
}

/** A review attempt as the client may see it (the diff fingerprint stays on the server). */
export function toPublicReview(attempt) {
  const { diffHash, ...visible } = attempt;
  return visible;
}

function chatMessage(author, text) {
  return { author, text, sentAt: new Date().toISOString() };
}
