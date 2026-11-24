/**
 * HTTP layer for sessions. Controllers translate requests into service calls
 * and shape responses; they contain no business rules.
 */

import * as sessionService from '../services/session.service.js';
import * as submissionService from '../services/submission.service.js';
import * as workspace from '../services/workspace.service.js';

const { SESSION_STATUS } = sessionService;

export async function createSession(req, res) {
  const session = await sessionService.createSession(req.valid.body);
  res.status(201).json({ session: sessionService.toPublicSession(session) });
}

export function getSession(req, res) {
  const session = sessionService.getSession(req.params.sessionId);
  res.json({ session: sessionService.toPublicSession(session) });
}

export async function sendManagerMessage(req, res) {
  const session = await sessionService.askManager(req.params.sessionId, req.valid.body.message);
  res.status(201).json({ messages: session.managerMessages });
}

export function startWork(req, res) {
  const session = sessionService.startWork(req.params.sessionId);
  res.status(201).json({ session: sessionService.toPublicSession(session) });
}

export function listFiles(req, res) {
  const session = requireInProgress(req.params.sessionId);
  res.json({ files: workspace.listFiles(session.id) });
}

export function readFile(req, res) {
  const session = requireInProgress(req.params.sessionId);
  const { path } = req.valid.query;
  res.json({ path, content: workspace.readFile(session.id, path) });
}

export function saveFile(req, res) {
  const session = requireInProgress(req.params.sessionId);
  const { path, content } = req.valid.body;
  workspace.writeFile(session.id, path, content);
  res.json({ path, savedAt: new Date().toISOString() });
}

export async function runTests(req, res) {
  const testResult = await submissionService.runTests(req.params.sessionId);
  res.status(201).json({ testResult });
}

export async function sendTeammateMessage(req, res) {
  const session = await sessionService.askTeammate(req.params.sessionId, req.valid.body);
  res.status(201).json({ messages: session.teammateMessages, hintLevel: session.hintLevel });
}

export function listChanges(req, res) {
  res.json({ changedFiles: submissionService.listChanges(req.params.sessionId) });
}

export async function requestReview(req, res) {
  const review = await submissionService.requestReview(req.params.sessionId);
  res.status(201).json({ review });
}

export async function submit(req, res) {
  const session = await submissionService.submit(req.params.sessionId);
  res.status(201).json({ session: sessionService.toPublicSession(session) });
}

function requireInProgress(sessionId) {
  const session = sessionService.getSession(sessionId);
  sessionService.assertStatus(session, SESSION_STATUS.IN_PROGRESS);
  return session;
}
