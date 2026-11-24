# API reference

Base URL: `http://localhost:5050/api`. All bodies are JSON. Errors use
`{ "error": { "code": string, "message": string } }`.

## Health

### `GET /health`

```json
{ "status": "ok", "ai": "openai" }
```

`ai` is the first configured provider (`"openai"` or `"gemini"`), or `"fallback"` when no AI key is set.

### `GET /simulations`

The codebases students can be placed in, without any ticket details:
`{ "simulations": [{ "id", "name", "roleId", "description", "issueCount" }] }`.

## Sessions

### `POST /sessions`

Creates a session and its ticket.

```json
{ "studentName": "Asha Rao", "difficulty": "easy", "roleId": "frontend-developer" }
```

`difficulty` is `easy`, `medium` or `hard`. `roleId` is `frontend-developer` or `backend-developer`
(default `backend-developer`); the server picks a codebase for that role with a ticket at that
difficulty. Returns `201 { "session": Session }`.

### `GET /sessions/:sessionId`

Returns `{ "session": Session }`. `session.suggestions` lists the suggested questions for the
manager and each teammate (`manager`, `alex`, `sarah`, `daniel`).

### `POST /sessions/:sessionId/manager/messages`

```json
{ "message": "Which customers are affected?" }
```

Returns `201 { "messages": ChatMessage[] }`.

### `POST /sessions/:sessionId/workspace`

Starts work: copies the simulation into a workspace and moves the session to `in_progress`.
Returns `201 { "session": Session }`.

### `GET /sessions/:sessionId/files`

Returns `{ "files": ["README.md", "src/app.js", ...] }`.

### `GET /sessions/:sessionId/files/content?path=src/app.js`

Returns `{ "path": string, "content": string }`.

### `PUT /sessions/:sessionId/files/content`

```json
{ "path": "src/services/cartService.js", "content": "..." }
```

Only `.js`, `.json` and `.md` files up to 200 KB. Returns `{ "path": string, "savedAt": string }`.

### `POST /sessions/:sessionId/test-runs`

Runs project tests plus the hidden acceptance checks. Returns `201 { "testResult": TestResult }`.

```json
{
  "status": "completed",
  "allPassed": false,
  "passedCount": 11,
  "totalCount": 12,
  "acceptancePassed": 2,
  "acceptanceTotal": 3,
  "tests": [{ "name": "adds a new product to an empty cart", "kind": "project", "passed": true }],
  "syntaxErrors": [],
  "durationMs": 412
}
```

`status` is `completed`, `syntax_error`, `timed_out` or `load_error`.

### `POST /sessions/:sessionId/teammate/messages`

```json
{ "teammate": "sarah", "message": "Which edge cases should I test?", "filePath": "src/services/cartService.js", "requestHint": false }
```

`teammate` is `alex` (Senior Backend Developer, the default), `sarah` (QA Engineer) or `daniel`
(Technical Mentor). Each keeps a separate thread; messages carry a `teammate` field, and replies carry
`generatedBy: "openai" | "gemini" | "template"`. `requestHint: true` unlocks the next hint level (maximum 4),
shared by all three. Returns `201 { "messages": ChatMessage[], "hintLevel": number }`.

### `GET /sessions/:sessionId/changes`

Files that differ from the original project. Returns `{ "changedFiles": string[] }`.

### `POST /sessions/:sessionId/reviews`

A review before the final submission: runs the tests and asks the reviewer to read the diff. The session
stays `in_progress`, so the student can improve the work and ask again. Returns
`201 { "review": { id, reviewedAt, changedFiles, testResult, review } }` and appends it to `session.reviews`.
`review.aspects` rates edge cases, reliability and maintainability (1 to 5, with a note) when live AI is
configured. Template reviews fill it from rule-based checks on the diff and say so in the summary.

### `POST /sessions/:sessionId/submission`

Runs tests, reviews the diff (reusing the last review if nothing changed since), scores the work and issues
a record. Returns `201 { "session": Session }` with `session.result = { recordId, score, review, testResult, diff }`.

## Records

### `GET /records/:recordId`

Returns `{ "record": WorkRecord, "verified": boolean }`.

### `POST /records/restore`

Body `{ "record": WorkRecord }`: a signed copy the client kept, for when the server has lost the record
(the free host wipes its disk on restart). The server re-checks the signature. A matching copy is stored
again and returned with `verified: true`; an edited copy is returned with `verified: false` and never stored.
If the server still has the record, its own copy is returned.

## Rate limits

| Endpoints | Limit |
|---|---|
| Session creation, manager, teammate, reviews, submission | 20 requests per minute per IP |
| Test runs | 10 per minute per IP |
| Record restore | 30 per minute per IP |
