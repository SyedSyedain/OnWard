import assert from 'node:assert/strict';
import { test } from 'node:test';
import { managerAnswer, suggestedQuestions, teammateAnswer } from '../src/services/ai/questionBank.js';

const ticket = {
  title: 'Prices are hard to read',
  area: 'Listings',
  summary: 'Prices such as 12500 show without a separator.',
  businessImpact: 'Guests misread prices on expensive listings.',
  acceptanceCriteria: ['12500 is shown as 12,500.', 'Prices under 1000 are unchanged.'],
  relevantFiles: ['src/lib/format.js'],
};
const context = {
  affected: 'Every guest browsing listings.',
  priority: 'Low, but fix it this sprint.',
  outOfScope: 'Do not change currency or rounding.',
  reproduce: '1. Open search.\n2. Look at a price.',
};

function converse(ask, questions) {
  const history = [];
  return questions.map((message) => {
    const text = ask({ history, message });
    history.push({ author: 'student', text: message }, { author: 'manager', text });
    return text;
  });
}

test('every suggested manager question gets its own answer', () => {
  const { manager } = suggestedQuestions();
  assert.equal(manager.length, 10);
  const answers = converse((args) => managerAnswer({ ticket, context, roleId: 'frontend-developer', ...args }), manager);
  assert.equal(new Set(answers).size, manager.length);
});

test('asking the manager the same question again gets a different reply', () => {
  const answers = converse((args) => managerAnswer({ ticket, context, roleId: 'frontend-developer', ...args }), [
    'How urgent is it?',
    'How urgent is it?',
    'How urgent is it?',
  ]);
  assert.equal(new Set(answers).size, 3);
  assert.match(answers[0], /this sprint/);
});

test('typed questions reach the matching answer', () => {
  const ask = (message) => managerAnswer({ ticket, context, roleId: 'frontend-developer', history: [], message });
  assert.equal(ask('which users does this affect?'), context.affected);
  assert.match(ask('what are the steps to see it?'), /Open search/);
  assert.match(ask('can you just tell me the fix'), /src\/lib\/format\.js/);
});

test('each teammate answers each suggested question differently', () => {
  const suggestions = suggestedQuestions();
  for (const teammateId of ['alex', 'sarah', 'daniel']) {
    const answers = suggestions[teammateId].map((message) =>
      teammateAnswer({ teammateId, ticket, context, roleId: 'frontend-developer', guide: `${teammateId} guide.`, history: [], message }),
    );
    assert.ok(answers.length >= 7, `${teammateId} has at least seven questions`);
    assert.equal(new Set(answers).size, answers.length, `${teammateId} repeats an answer`);
  }
});

test('Alex names the functions in a shared file', () => {
  const text = teammateAnswer({
    teammateId: 'alex',
    ticket,
    context,
    roleId: 'frontend-developer',
    guide: 'Start in format.js.',
    filePath: 'src/lib/format.js',
    fileContent: 'export function formatPrice(n) {}\nexport const label = 1;',
    history: [],
    message: 'Walk me through this file.',
  });
  assert.match(text, /formatPrice and label/);
});
