# AI roles

OnWard uses three AI roles. Each has a narrow job and sees only the data that job needs.
All prompts are in `server/src/prompts/` as Markdown templates.

| Role | Job | Sees | Never sees |
|---|---|---|---|
| Engineering Manager | Writes the ticket, answers requirement questions | Public issue fields, the ticket, the chat | Hints, hidden tests, code |
| Teammates (Alex, Sarah, Daniel) | Guide the student from three angles: reading and debugging code (Alex, Senior Backend Developer), edge cases and failing tests (Sarah, QA Engineer), concepts and graded hints (Daniel, Technical Mentor). Each keeps a separate thread. | The ticket, the approved hint for the current level, the file the student shares | The solution, hidden tests, higher-level hints |
| Reviewer | Explains the change and rates code quality (0 to 25) | The ticket, the diff, test counts | Hidden test source |

## Hint ladder

Each issue in the private manifest has four hints, from a nudge to a near-solution:

| Level | Style |
|---|---|
| 0 | Questions only: reproduce and narrow the problem |
| 1 | Where to look |
| 2 | What is wrong in principle |
| 3 | The shape of the fix |
| 4 | The exact change, described in words |

The student unlocks the next level by pressing **Unlock next hint** in Daniel's conversation. Each teammate only gets the hint for the
current level and is told not to go beyond it. Every level lowers the independence score.

## Structured output

Every AI response is requested as JSON and validated with a zod schema
(`server/src/schemas/ai.schemas.js`). Responses that fail validation are discarded.

## Fallbacks

`geminiClient.generateStructured` returns `null` when there is no API key, the request fails, it
takes longer than 12 seconds on every model, or the output is invalid. A model that is overloaded, rate
limited or slow is skipped for a minute and the next one in `GEMINI_FALLBACK_MODELS` is tried. When none
answers, each role uses a deterministic fallback built from the ticket's prepared material:

| Role | Fallback |
|---|---|
| Manager: ticket | The issue's own title and symptoms |
| Manager: chat | Matches the question to a topic (who is affected, priority, scope, how to reproduce, done, why, code) and answers from the issue's `context` |
| Teammates | The teammate's own note for this ticket (`guide`: a code tour, edge cases or the concept), the unlocked hint when asked, and never the same reply twice in a row |
| Reviewer | Rule-based checks on the diff (debug output, TODOs, commented-out code, size, files outside the ticket, tests added) that rate edge cases, reliability and maintainability; 0 for an empty diff |

Because tests, not the AI, decide correctness, a fallback never changes whether a ticket is resolved.
