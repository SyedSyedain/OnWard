# Security

## Secrets

- The Gemini key lives only in `server/.env`, which is ignored by Git. `server/.env.example` documents
  the variables with empty values.
- The client never receives the key. Its only environment variable is `VITE_API_BASE_URL`.
- The key is never logged or returned in a response. The test-runner child process gets a minimal
  environment (`PATH` and `NODE_ENV`), so student code cannot read it.

## Private evaluation data

- Issue manifests (hints) and hidden tests live in `server/private/`. They are never copied into a
  student workspace and never returned by the API.
- `toPublicIssue` defines exactly which issue fields can leave the server.
- Test results expose only test names and pass/fail. Raw test output is not returned, so student code
  cannot print hidden test source back to the browser.
- In this repository `server/private/` is public so judges and contributors can run the project. In a
  real deployment it would be stored separately from the public code.

## Running student code

Student code is never executed inside the API process. Each test run:

1. copies the workspace into a fresh directory under the OS temp folder,
2. runs `node --check` on each source file, then `node --test` in a **child process**,
3. kills the process after `TEST_RUN_TIMEOUT_SECONDS` (default 20),
4. caps captured output at 1 MB,
5. deletes the temporary directory.

## File access

Every path from the client goes through `resolveInside` (`server/src/utils/safePath.js`), which rejects
anything that resolves outside the session's workspace (for example `../../private`). Only `.js`,
`.json` and `.md` files up to 200 KB can be written.

## Known limits and next steps

This is a hackathon prototype. Before production use:

- Run test processes in containers (or Node's permission model) with no network and a read-only file
  system outside the run directory.
- Add authentication so sessions belong to verified users.
- Move storage from JSON files to a database.
- Rotate `RECORD_SECRET` with key IDs so old records stay verifiable.
