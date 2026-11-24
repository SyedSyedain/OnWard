/**
 * End-to-end API flow in fallback mode (no Gemini key): create a session,
 * start work, run tests on the untouched project, submit, verify the record.
 */

import { after, before, test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

const dataDirectory = fs.mkdtempSync(path.join(os.tmpdir(), 'onward-api-test-'));
process.env.DATA_DIRECTORY = dataDirectory;
process.env.GEMINI_API_KEY = '';

const { createApp } = await import('../src/app.js');

let server;
let baseUrl;

before(async () => {
  server = createApp().listen(0);
  await new Promise((resolve) => server.once('listening', resolve));
  baseUrl = `http://127.0.0.1:${server.address().port}/api`;
});

after(() => {
  server.close();
  fs.rmSync(dataDirectory, { recursive: true, force: true });
});

async function call(method, route, body) {
  const response = await fetch(`${baseUrl}${route}`, {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: body ? JSON.stringify(body) : undefined,
  });
  return { status: response.status, body: await response.json() };
}

test('full session flow issues a verifiable work record', async () => {
  const created = await call('POST', '/sessions', { studentName: 'Test Student', difficulty: 'easy' });
  assert.equal(created.status, 201);
  const { session } = created.body;
  assert.equal(session.status, 'briefing');
  assert.equal(session.issueId, undefined, 'internal issue id must not be exposed');
  assert.ok(session.ticket.acceptanceCriteria.length > 0);

  const question = await call('POST', `/sessions/${session.id}/manager/messages`, { message: 'Who is affected?' });
  assert.equal(question.body.messages.length, 2);

  const started = await call('POST', `/sessions/${session.id}/workspace`);
  assert.equal(started.body.session.status, 'in_progress');

  const files = await call('GET', `/sessions/${session.id}/files`);
  assert.ok(files.body.files.includes('src/services/productService.js'));
  assert.ok(!files.body.files.some((file) => file.includes('hidden')), 'hidden tests must not be in the workspace');

  const escape = await call('GET', `/sessions/${session.id}/files/content?path=../../private/shopsphere/manifest.json`);
  assert.equal(escape.status, 400);

  const hint = await call('POST', `/sessions/${session.id}/teammate/messages`, { requestHint: true });
  assert.equal(hint.body.hintLevel, 1);

  const sarahReply = await call('POST', `/sessions/${session.id}/teammate/messages`, {
    teammate: 'sarah',
    message: 'Which edge cases should I test?',
  });
  const sarahThread = sarahReply.body.messages.filter((message) => message.teammate === 'sarah');
  assert.equal(sarahThread.length, 2, 'each teammate keeps a separate thread');
  assert.equal(sarahThread[1].generatedBy, 'template', 'fallback replies are labelled as templates');

  const unchanged = await call('GET', `/sessions/${session.id}/changes`);
  assert.deepEqual(unchanged.body.changedFiles, []);

  const servicePath = 'src/services/productService.js';
  const original = await call('GET', `/sessions/${session.id}/files/content?path=${servicePath}`);
  await call('PUT', `/sessions/${session.id}/files/content`, {
    path: servicePath,
    content: `${original.body.content}\n// reviewed\n`,
  });
  const changed = await call('GET', `/sessions/${session.id}/changes`);
  assert.deepEqual(changed.body.changedFiles, [servicePath]);

  const review = await call('POST', `/sessions/${session.id}/reviews`);
  assert.equal(review.status, 201);
  assert.deepEqual(review.body.review.changedFiles, [servicePath]);
  assert.equal(review.body.review.diffHash, undefined, 'the diff fingerprint stays on the server');
  const stillOpen = await call('GET', `/sessions/${session.id}`);
  assert.equal(stillOpen.body.session.status, 'in_progress', 'a review does not end the session');
  assert.equal(stillOpen.body.session.reviews.length, 1);

  const run = await call('POST', `/sessions/${session.id}/test-runs`);
  assert.equal(run.body.testResult.status, 'completed');
  assert.equal(run.body.testResult.allPassed, false, 'the planted issue should fail before it is fixed');

  const submitted = await call('POST', `/sessions/${session.id}/submission`);
  const { result } = submitted.body.session;
  assert.equal(submitted.body.session.status, 'submitted');
  assert.equal(result.score.correctness, 0, 'an unresolved submission earns no correctness points');
  assert.ok(result.score.total <= 25, 'an unresolved submission can never score above 25');

  const record = await call('GET', `/records/${result.recordId}`);
  assert.equal(record.body.verified, true);
  assert.equal(record.body.record.outcome, 'not_resolved');
});

test('a tampered record fails verification', async () => {
  const { issueRecord, isAuthentic } = await import('../src/services/record.service.js');
  const record = issueRecord({ studentName: 'Another Student', score: { total: 40 } });

  assert.equal(isAuthentic(record), true);
  assert.equal(isAuthentic({ ...record, score: { total: 100 } }), false);
});

test('invalid input returns a structured error', async () => {
  const response = await call('POST', '/sessions', { studentName: 'A', difficulty: 'impossible' });
  assert.equal(response.status, 400);
  assert.equal(response.body.error.code, 'VALIDATION_ERROR');
});
