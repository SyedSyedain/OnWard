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
takes longer than 20 seconds, or the output is invalid. Each role then uses a deterministic fallback:

| Role | Fallback |
|---|---|
| Manager: ticket | The issue's own title and symptoms |
| Manager: chat | Restates the acceptance criteria and points to the Teammate |
| Teammates | Return the approved hint text, or a short written prompt in that teammate's voice at level 0 |
| Reviewer | A rule-based summary; quality 18 if resolved and focused, otherwise 10; 0 for an empty diff |

Because tests, not the AI, decide correctness, a fallback never changes whether a ticket is resolved.
