/**
 * Prepared answers for when no live AI is available.
 *
 * Every colleague has a list of suggested questions, each with its own answer built from
 * the ticket and its private background (never hints the student has not unlocked, never
 * the solution). Free-typed questions are matched to the closest entry by their words.
 * Each entry has two wordings, so asking again gets a different reply, and a reply that
 * has already been given is never repeated word for word.
 */

/** Builds the facts every answer can use. */
function factsFor({ ticket, context, roleId }) {
  const criteria = ticket.acceptanceCriteria;
  const files = ticket.relevantFiles;
  return {
    ticket,
    roleId,
    frontend: roleId === 'frontend-developer',
    criteria,
    criteriaList: criteria.map((criterion) => `• ${criterion}`).join('\n'),
    files: files.join(', '),
    firstFile: files[0] ?? 'the files named in the ticket',
    affected: context?.affected ?? `Anyone using the ${ticket.area.toLowerCase()} area. ${ticket.summary}`,
    priority: context?.priority ?? `It needs to be fixed before the next release. ${ticket.businessImpact}`,
    outOfScope:
      context?.outOfScope ?? 'Anything outside this ticket: no refactors, no new features, no unrelated fixes.',
    reproduce: context?.reproduce ?? ticket.summary,
  };
}

// ── Engineering Manager ──────────────────────────────────────────────────────

const MANAGER = [
  {
    question: 'Who is affected by this?',
    words: ['who', 'affect', 'user', 'customer', 'people', 'impact', 'how many', 'everyone', 'guest'],
    answers: (f) => [
      f.affected,
      `In short: ${firstSentence(f.affected)} That is why it is on your board now and not in the backlog.`,
    ],
  },
  {
    question: 'How urgent is it?',
    words: ['urgent', 'priority', 'deadline', 'when', 'soon', 'asap', 'important', 'release', 'sprint', 'time', 'quick'],
    answers: (f) => [
      f.priority,
      `${firstSentence(f.priority)} If you are blocked for more than half an hour, tell me rather than waiting.`,
    ],
  },
  {
    question: 'How do I reproduce it?',
    words: ['reproduce', 'steps', 'repro', 'see it', 'happen', 'example', 'show me', 'replicate', 'trigger'],
    answers: (f) => [
      `Here is how QA reproduced it:\n${f.reproduce}`,
      `Follow QA's steps:\n${f.reproduce}\nOnce you can see it yourself, you know your fix is aimed at the right thing.`,
    ],
  },
  {
    question: 'What is out of scope?',
    words: ['scope', 'out of', 'also', 'anything else', 'extra', 'other', 'touch', 'allowed'],
    answers: (f) => [
      `Keep the change focused. ${f.outOfScope}`,
      `${f.outOfScope} If you spot something else worth fixing, write it down and we will make it a separate ticket.`,
    ],
  },
  {
    question: 'How do I know when it is done?',
    words: ['done', 'accept', 'criteria', 'finish', 'complete', 'expected', 'requirement', 'definition', 'success'],
    answers: (f) => [
      `It is done when all of these are true:\n${f.criteriaList}`,
      `${countWord(f.criteria.length)}, and the acceptance checks test exactly these:\n${f.criteriaList}`,
    ],
  },
  {
    question: 'Why does this matter to the business?',
    words: ['why', 'matter', 'business', 'reason', 'value', 'care', 'cost', 'money'],
    answers: (f) => [f.ticket.businessImpact, `${f.ticket.businessImpact} ${firstSentence(f.affected)}`],
  },
  {
    question: 'Which files should I look at?',
    words: ['file', 'files', 'where', 'start', 'look', 'folder', 'module', 'codebase'],
    answers: (f) => [
      `The ticket points at ${f.files}. Finding the exact line is your part; Alex can walk you through how those files fit together.`,
      `Start in ${f.firstFile}. I will not point at the line: finding it is the job, and it is how you learn the codebase.`,
    ],
  },
  {
    question: 'Can I refactor nearby code while I am there?',
    words: ['refactor', 'clean', 'tidy', 'rewrite', 'improve', 'while i', 'restructure', 'rename'],
    answers: (f) => [
      `Not in this ticket. Small, focused changes are easier to review and safer to ship. ${f.outOfScope}`,
      'Keep this one surgical. Note the clean-up idea for later and we can plan it as its own ticket.',
    ],
  },
  {
    question: 'Should I add my own tests?',
    words: ['test', 'tests', 'unit', 'coverage', 'write a test', 'testing'],
    answers: () => [
      'Yes, if you can. The acceptance checks run for you, but a test of your own for the case you fixed shows the reviewer you thought it through. Sarah can suggest cases.',
      'The hidden checks decide whether it is resolved, and a test you write yourself counts towards code quality. One focused test is enough.',
    ],
  },
  {
    question: 'Who should I ask if I get stuck?',
    words: ['stuck', 'help', 'ask', 'blocked', 'who should', 'confused', 'lost', 'support'],
    answers: () => [
      'Alex for reading the code, Sarah for test cases and failing checks, Daniel for the idea behind the bug and step-by-step hints. Hints lower your independence score a little; questions do not.',
      'Ask early. Alex knows the code, Sarah knows how it breaks, Daniel explains the concept. Questions are free; only hints cost points.',
    ],
  },
  {
    words: ['cause', 'fix', 'line', 'function', 'bug', 'implement', 'solution', 'answer', 'wrong', 'broken', 'code'],
    answers: (f) => [
      `That is the part I want you to find. Start in ${f.firstFile}, and ask Alex to walk you through it.`,
      `I am not going to hand you the fix, but you are looking in the right place: ${f.files}. Sarah can help you find an input that shows the bug.`,
    ],
  },
  {
    words: ['hi', 'hello', 'hey', 'good morning', 'good afternoon', 'good evening'],
    answers: (f) => [
      `Hi, welcome to the team. Your ticket is “${f.ticket.title}”. Ask me anything about the requirements, the users or the priority.`,
      'Hello again. What would you like to know about the ticket?',
    ],
  },
  {
    words: ['thanks', 'thank you', 'got it', 'great', 'cool', 'okay', 'ok', 'understood', 'makes sense'],
    answers: () => [
      'You are welcome. Shout if anything in the ticket is unclear.',
      'Good. Ask for a code review when you think it is ready.',
    ],
  },
];

const MANAGER_UNKNOWN = (f) => [
  `I do not have a firm answer to that one. What I can tell you: ${f.ticket.summary} If it changes what you build, make a sensible call and mention it in your review.`,
  `That has not been decided by product, so stick to the ticket. It is done when:\n${f.criteriaList}`,
  'I would rather not guess. For anything about the code itself, Alex is your best bet; for how it could break, ask Sarah.',
  `Let me check with the team and come back to you. In the meantime the priority stays the same: ${firstSentence(f.priority)}`,
];

// ── Teammates ────────────────────────────────────────────────────────────────

const ALEX = [
  {
    question: 'Where should I start reading?',
    words: ['start', 'begin', 'where', 'first', 'read'],
    answers: (f) => [
      f.guide,
      `Open ${f.firstFile} first. Read the function names before the bodies, then follow the one this ticket is about.`,
    ],
  },
  {
    question: 'How do these files connect?',
    words: ['connect', 'flow', 'import', 'together', 'relate', 'calls', 'used', 'depend'],
    answers: (f) => [
      `The ticket names ${f.files}. In ${f.firstFile}, note what it exports, then search the project for those names to see who calls them. ${
        f.frontend
          ? 'In the browser, data usually comes in through an event handler and leaves through what gets rendered.'
          : 'On the server, a request usually comes in through a route, goes through a service and leaves as the response.'
      }`,
      `Follow one real value through the code: where it is created, every function it passes through, and where it ends up. ${f.guide}`,
    ],
  },
  {
    question: 'Walk me through this file.',
    words: ['walk', 'what does', 'this file', 'explain the file', 'overview', 'does this'],
    answers: (f) => {
      const names = exportedNames(f.fileContent);
      if (!f.filePath || names.length === 0) {
        return [
          'Share the file with me (tick “share the open file” under the chat) and I will walk you through it.',
          `Open ${f.firstFile} and share it with me, then I can tell you what each part does.`,
        ];
      }
      return [
        `${f.filePath} exports ${listOf(names)}. Read ${names[0]} first: what does it take in, and what does it hand back?`,
        `${f.filePath} has ${numberWord(names.length)} ${names.length === 1 ? 'export' : 'exports'}: ${listOf(names)}. Pick the one the ticket's behaviour runs through and trace a real input through it line by line.`,
      ];
    },
  },
  {
    question: 'How do I read the error I am getting?',
    words: ['error', 'exception', 'stack', 'trace', 'crash', 'undefined', 'null', 'typeerror', 'red'],
    answers: () => [
      'Read the first line: it says what went wrong. Then find the first line of the stack trace that points into this project, not into node_modules. That file and line is where to look.',
      'An error is a clue, not a verdict. What did the code expect, and what did it get? Put the input from the failing test into that function in your head and step through it.',
    ],
  },
  {
    question: 'Which function is most likely wrong?',
    words: ['which function', 'culprit', 'most likely', 'suspect', 'narrow'],
    answers: (f) => [
      `${firstSentence(f.guide)} From there, find the function the ticket's behaviour runs through and test it with the input from the ticket.`,
      f.hint
        ? `Here is what I can say: ${f.hint}`
        : 'Unlock a hint if you want me to narrow it down further. Until then, follow the data from the ticket into the code.',
    ],
  },
  {
    question: 'How do I debug this?',
    words: ['debug', 'log', 'console', 'inspect', 'breakpoint', 'print', 'investigate'],
    answers: () => [
      'Run the tests and take the first failing check. Add one temporary log just before the value goes wrong, run again, and read what it prints. Remove the log before you ask for a review.',
      'Debug with one question at a time: “is the value right here?” Move the question forward through the code until the answer changes. That line is your bug.',
    ],
  },
  {
    question: 'Can you check my approach?',
    words: ['approach', 'check my', 'correct', 'does this look', 'good idea', 'my change', 'is this right'],
    answers: () => [
      'Tell me in two lines what you changed and why. Then run npm test: if the acceptance checks pass and the existing tests still pass, ask for a code review.',
      'Good habit to check. Ask yourself: does my change fix the cause or only hide the symptom? Would it still work for the edge cases Sarah would try?',
    ],
  },
  {
    question: 'Can you write the fix for me?',
    words: ['write it', 'for me', 'give me the code', 'just fix', 'do it', 'the answer'],
    answers: () => [
      'No, but I will sit with you while you write it. Tell me which function you think is wrong and what it should do instead.',
      'That would not help you on the job. Write your best attempt, run the tests, and show me what fails.',
    ],
  },
];

const SARAH = [
  {
    question: 'Which edge cases should I test?',
    words: ['edge', 'case', 'cases', 'inputs', 'boundary', 'scenario', 'try'],
    answers: (f) => [
      f.guide,
      `Beyond the normal path, try: an empty or missing value, the smallest and largest sensible values, and the same action twice. Each of these should still match the ticket:\n${f.criteriaList}`,
    ],
  },
  {
    question: 'What should I verify before I submit?',
    words: ['verify', 'before i submit', 'checklist', 'ready', 'submit', 'double check'],
    answers: (f) => [
      `Check each of these yourself, then run the full test suite so nothing old breaks:\n${f.criteriaList}`,
      'Three things: every acceptance check passes, every existing test still passes, and you removed any debugging logs. Then ask for a code review.',
    ],
  },
  {
    question: 'How could this break in production?',
    words: ['production', 'break', 'real users', 'live', 'risk', 'worst'],
    answers: (f) => [
      `${f.affected} With real data it shows up in the unusual cases: empty values, very large ones, or the same action twice. Try each of those.`,
      'Think about what real users do that tests forget: they double-click, they leave fields empty, they come back later. Your fix should survive all three.',
    ],
  },
  {
    question: 'What is a failing check looking for?',
    words: ['check', 'failing', 'fail', 'acceptance', 'looking for', 'expect'],
    answers: (f) => {
      const closest = closestCriterion(f.message, f.criteria);
      return [
        `Each check is one line of the ticket. This one maps to: “${closest}” Find the smallest input that breaks it and run the tests after each change.`,
        `Read the check name as a sentence about behaviour, then find that behaviour in the ticket: “${closest}” What input would prove it?`,
      ];
    },
  },
  {
    question: 'How do I reproduce the bug?',
    words: ['reproduce', 'steps', 'repro', 'see the bug', 'replicate'],
    answers: (f) => [
      `QA's steps were:\n${f.reproduce}`,
      `Do it by hand first:\n${f.reproduce}\nIf you cannot see the bug, you cannot be sure you fixed it.`,
    ],
  },
  {
    question: 'Should I write my own test?',
    words: ['write a test', 'own test', 'unit test', 'add a test', 'new test'],
    answers: () => [
      'Yes. Copy the shape of an existing test in the tests folder, change the input to the case you fixed, and assert the result the ticket expects.',
      'One test for the exact case in the ticket is enough. Name it after the behaviour, not the function, so the reviewer knows what it protects.',
    ],
  },
  {
    question: 'How do I run the tests?',
    words: ['run', 'npm test', 'how do i test', 'terminal', 'run the tests'],
    answers: () => [
      'Click “Run tests” at the top, or type npm test in the terminal. The acceptance checks are listed first; the rest are the existing tests.',
      'npm test in the terminal runs everything. Run it after every change, not only at the end.',
    ],
  },
];

const DANIEL = [
  {
    question: 'What concept is behind this bug?',
    words: ['concept', 'idea', 'theory', 'understand', 'behind', 'explain', 'why does'],
    answers: (f) => [
      f.guide,
      `${firstSentence(f.guide)} Once you can say the rule the code should follow in one sentence, the fix usually follows.`,
    ],
  },
  {
    question: 'How should I approach this ticket?',
    words: ['approach', 'plan', 'how should', 'strategy', 'where do i begin', 'steps'],
    answers: (f) => [
      `Four steps: reproduce it, find where the data goes wrong in ${f.firstFile}, make the smallest change that fixes the cause, then run every test.`,
      'Understand before you change. Say the bug in one sentence, name the rule the code breaks, then change only what enforces that rule.',
    ],
  },
  {
    question: 'Am I on the right track?',
    words: ['right track', 'on track', 'am i', 'good so far', 'going well', 'progress'],
    answers: () => [
      'Ask yourself three things: can you reproduce the bug, can you point to the line where it goes wrong, and does your change fix the cause? If yes to all three, you are on track.',
      'Run the tests. Count the acceptance checks passing now versus before your change. More passing and nothing new failing means you are heading the right way.',
    ],
  },
  {
    question: 'Can I get a hint?',
    words: ['hint', 'clue', 'nudge', 'tip'],
    answers: (f) => [
      f.hint ?? 'Use the hint button below the chat. Each hint points a bit closer and costs a little of your independence score.',
      f.hint
        ? `That is the hint you have so far: ${f.hint} Unlock the next one if you need me to go further.`
        : 'No hint unlocked yet. Try once more on your own first; then unlock one.',
    ],
  },
  {
    question: 'I am stuck. What now?',
    words: ['stuck', 'lost', 'confused', 'blocked', 'no idea', 'give up', 'help'],
    answers: () => [
      'Explain the problem to me as if I had never seen the code: what should happen, what happens instead, and where you looked. Saying it out loud often shows the gap.',
      'Step back to the ticket. Pick the first acceptance check that fails and work on that one alone. Small wins get you unstuck.',
    ],
  },
  {
    question: 'How do I explain my fix in a pull request?',
    words: ['pr', 'pull request', 'explain my fix', 'describe', 'commit message', 'write up'],
    answers: (f) => [
      `Three short parts: the problem (“${f.ticket.title}”), the cause you found, and what you changed. Add how you tested it.`,
      'Write it for someone who has not read the ticket: what was wrong, why, what you changed, and the test that proves it.',
    ],
  },
  {
    question: 'What should I take away from this bug?',
    words: ['learn', 'take away', 'lesson', 'next time', 'avoid'],
    answers: (f) => [
      `${firstSentence(f.guide)} Remember the pattern: next time you see a bug like this, you will know where to look first.`,
      'Every bug is a missing rule. Write down the rule this code forgot, and check for it in code reviews from now on.',
    ],
  },
];

const TEAMMATE_UNKNOWN = {
  alex: () => [
    'Let us keep it concrete. Is your question about where to start, what a file does, or an error you are seeing?',
    'Share the file you are in and tell me which function you are looking at. I will help you read it.',
  ],
  sarah: () => [
    'From a testing angle: what input would show this going wrong? Start there, and I will help you think of more.',
    'Run the tests and tell me which check fails first. Then we can work out what it is checking.',
  ],
  daniel: () => [
    'Say the bug back to me in one sentence, in your own words. Then name the one rule the code should enforce.',
    'Take it one step at a time. What do you understand so far, and where does it stop making sense?',
  ],
};

const BANKS = { manager: MANAGER, alex: ALEX, sarah: SARAH, daniel: DANIEL };

/** The suggested questions per colleague, in order. */
export function suggestedQuestions() {
  return Object.fromEntries(
    Object.entries(BANKS).map(([id, entries]) => [id, entries.filter((entry) => entry.question).map((entry) => entry.question)]),
  );
}

export function managerAnswer({ ticket, context, roleId, history, message }) {
  const facts = factsFor({ ticket, context, roleId });
  const entry = match(MANAGER, message);
  return choose(entry ? entry.answers(facts) : MANAGER_UNKNOWN(facts), history, 'manager');
}

export function teammateAnswer({ teammateId, ticket, context, roleId, guide, hint, filePath, fileContent, history, message }) {
  const facts = {
    ...factsFor({ ticket, context, roleId }),
    guide: guide ?? TEAMMATE_UNKNOWN[teammateId]()[0],
    hint,
    filePath,
    fileContent,
    message,
  };
  // Any teammate can be asked for the unlocked hint.
  const entry = /\bhint\b/i.test(message) ? DANIEL.find((item) => /hint/.test(item.question ?? '')) : match(BANKS[teammateId], message);
  return choose(entry ? entry.answers(facts) : TEAMMATE_UNKNOWN[teammateId](facts), history, 'teammate');
}

// ── Matching and choosing ────────────────────────────────────────────────────

/** The entry whose suggested question was sent, else the one sharing the most words with the message. */
function match(entries, message) {
  const text = normalise(message);
  const exact = entries.find((entry) => entry.question && normalise(entry.question) === text);
  if (exact) return exact;

  let best = null;
  let bestScore = 0;
  for (const entry of entries) {
    // Short words must match whole, plural allowed ("hi" is not "high"); longer ones may be the start of a word ("affect" in "affected").
    const score = entry.words.filter((word) =>
      new RegExp(word.length < 5 ? `\\b${escape(word)}s?\\b` : `\\b${escape(word)}`).test(text),
    ).length;
    if (score > bestScore) {
      best = entry;
      bestScore = score;
    }
  }
  return best;
}

const REPEAT_OPENERS = ['As I said earlier:', 'Same answer as before, so you have it in one place:', 'Still the same:'];

/** The first wording not already said in this thread; if all were, a reminder that says so. */
function choose(answers, history, author) {
  const said = history.filter((entry) => entry.author === author).map((entry) => entry.text);
  const options = answers.filter(Boolean);
  const fresh = options.find((answer) => !said.includes(answer));
  if (fresh) return fresh;

  const repeats = said.filter((text) => text.endsWith(options[0])).length;
  return `${REPEAT_OPENERS[repeats % REPEAT_OPENERS.length]} ${options[0]}`;
}

function normalise(text) {
  return ` ${text.toLowerCase().replace(/[’']/g, '').replace(/[^a-z0-9]+/g, ' ').trim()} `;
}

function escape(word) {
  return word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function firstSentence(text) {
  const match = /^.*?[.!?](\s|$)/.exec(text ?? '');
  return (match ? match[0] : (text ?? '')).trim();
}

function numberWord(count) {
  return ['no', 'one', 'two', 'three', 'four', 'five', 'six'][count] ?? String(count);
}

function countWord(count) {
  return ['None', 'One thing', 'Two things', 'Three things', 'Four things', 'Five things'][count] ?? `${count} things`;
}

function listOf(items) {
  return items.length <= 1 ? items.join('') : `${items.slice(0, -1).join(', ')} and ${items.at(-1)}`;
}

/** Names a JavaScript file exports, read from its text. */
function exportedNames(content) {
  if (!content) return [];
  const names = [...content.matchAll(/export\s+(?:async\s+)?(?:function\*?|const|let|class)\s+([A-Za-z_$][\w$]*)/g)].map(
    (found) => found[1],
  );
  return [...new Set(names)].slice(0, 6);
}

/** The acceptance criterion sharing the most words with the message. */
function closestCriterion(message, criteria) {
  const words = new Set(normalise(message).split(' ').filter((word) => word.length > 3));
  let best = criteria[0];
  let bestScore = -1;
  for (const criterion of criteria) {
    const score = normalise(criterion)
      .split(' ')
      .filter((word) => words.has(word)).length;
    if (score > bestScore) {
      best = criterion;
      bestScore = score;
    }
  }
  return best;
}
