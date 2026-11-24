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

`llm.generateStructured` tries OpenAI first (`OPENAI_API_KEY`, `OPENAI_MODEL`), then Gemini
(`GEMINI_API_KEY`, then each model in `GEMINI_FALLBACK_MODELS`). A provider that fails, is rate limited or
returns invalid output is skipped for a while so students are not kept waiting; Gemini gives up after 10
seconds in total. Every reply records which provider wrote it (`generatedBy`). When none answers, each
role uses its prepared answers (`server/src/services/ai/questionBank.js`):

| Role | Fallback |
|---|---|
| Manager: ticket | The issue's own title and symptoms |
| Manager: chat | Ten suggested questions (who is affected, urgency, how to reproduce, scope, done, why, files, refactoring, tests, who to ask), each with its own answer from the issue's `context`; typed questions are matched by their words |
| Teammates | Seven or eight suggested questions each (Alex: reading code and errors; Sarah: edge cases and checks; Daniel: concepts, hints, approach), built from the teammate's `guide`, the unlocked hint and the shared file |
| Reviewer | Rule-based checks on the diff (debug output, TODOs, commented-out code, size, files outside the ticket, tests added) that rate edge cases, reliability and maintainability; 0 for an empty diff |

Because tests, not the AI, decide correctness, a fallback never changes whether a ticket is resolved.

Each prepared answer has two wordings, so a repeated question gets a different reply, and a reply already
given in the thread is never sent again word for word. The suggested questions are sent with the session
(`suggestions`), and the chat shows the next three the student has not asked yet.
