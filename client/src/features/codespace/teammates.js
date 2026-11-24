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
    suggestions: ({ fileName }) => [
      fileName ? `Walk me through what ${fileName} does.` : 'Where should I start reading?',
      'How do these files connect?',
      'How do I read the error I am getting?',
    ],
  },
  {
    id: 'sarah',
    name: 'Sarah',
    role: 'QA Engineer',
    helpsWith: 'Edge cases, test scenarios, failed tests',
    suggestions: ({ failingCheck }) => [
      'Which edge cases should I test?',
      failingCheck ? `What is the check “${failingCheck}” looking for?` : 'What should I verify before I submit?',
      'How could this break in production?',
    ],
  },
  {
    id: 'daniel',
    name: 'Daniel',
    role: 'Technical Mentor',
    helpsWith: 'Concepts and step-by-step hints',
    suggestions: () => [
      'What concept is behind this bug?',
      'How should I approach this ticket?',
      'Am I on the right track?',
    ],
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
