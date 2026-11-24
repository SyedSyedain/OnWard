/**
 * The AI teammates who work beside the student in the Codespace.
 * Their replies come from the server (`POST /sessions/:id/teammate/messages`);
 * this file only describes who they are and what to ask them.
 */

export const TEAMMATES = [
  {
    id: 'alex',
    name: 'Alex',
    role: 'Senior Backend Developer',
    helpsWith: 'Reading the code, debugging errors',
  },
  {
    id: 'sarah',
    name: 'Sarah',
    role: 'QA Engineer',
    helpsWith: 'Edge cases, test scenarios, failed tests',
  },
  {
    id: 'daniel',
    name: 'Daniel',
    role: 'Technical Mentor',
    helpsWith: 'Concepts and step-by-step hints',
  },
];

export const TEAMMATES_BY_ID = Object.fromEntries(TEAMMATES.map((teammate) => [teammate.id, teammate]));

const ALEX_ROLES = {
  'frontend-developer': 'Senior Frontend Developer',
  'backend-developer': 'Senior Backend Developer',
};

/** A teammate's job title on this team: Alex's follows the role being practised. */
export function roleTitle(teammate, roleId) {
  return teammate.id === 'alex' ? (ALEX_ROLES[roleId] ?? teammate.role) : teammate.role;
}

/** Messages from before teammates had names belong to Alex, matching the server. */
export function threadFor(messages, teammateId) {
  return messages.filter((message) => (message.teammate ?? 'alex') === teammateId);
}

/** Up to `count` suggested questions the student has not asked yet in this thread, in order. */
export function unasked(questions = [], thread = [], count = 3) {
  const asked = new Set(thread.filter((message) => message.author === 'student').map((message) => message.text.trim()));
  return questions.filter((question) => !asked.has(question)).slice(0, count);
}
