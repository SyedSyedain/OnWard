import { request } from './httpClient.js';

const sessionPath = (sessionId) => `/sessions/${encodeURIComponent(sessionId)}`;

export const sessionsApi = {
  create: ({ studentName, difficulty }) => request('POST', '/sessions', { studentName, difficulty }),
  get: (sessionId) => request('GET', sessionPath(sessionId)),
  askManager: (sessionId, message) => request('POST', `${sessionPath(sessionId)}/manager/messages`, { message }),
  startWork: (sessionId) => request('POST', `${sessionPath(sessionId)}/workspace`),

  listFiles: (sessionId) => request('GET', `${sessionPath(sessionId)}/files`),
  readFile: (sessionId, path) =>
    request('GET', `${sessionPath(sessionId)}/files/content?path=${encodeURIComponent(path)}`),
  saveFile: (sessionId, path, content) => request('PUT', `${sessionPath(sessionId)}/files/content`, { path, content }),

  runTests: (sessionId) => request('POST', `${sessionPath(sessionId)}/test-runs`),
  askTeammate: (sessionId, { teammate, message, filePath, requestHint }) =>
    request('POST', `${sessionPath(sessionId)}/teammate/messages`, { teammate, message, filePath, requestHint }),

  listChanges: (sessionId) => request('GET', `${sessionPath(sessionId)}/changes`),
  requestReview: (sessionId) => request('POST', `${sessionPath(sessionId)}/reviews`),
  submit: (sessionId) => request('POST', `${sessionPath(sessionId)}/submission`),
};
