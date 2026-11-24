/**
 * AI Teammates: Alex, Sarah and Daniel each guide the student from their own angle.
 * They receive only the approved hint for the current level, never the
 * expected solution or hidden tests, and they never write the fix.
 */

import { chatReplySchema } from '../../schemas/ai.schemas.js';
import { describeTicket } from './manager.service.js';
import { generateStructured } from './llm.js';
import { teammateAnswer } from './questionBank.js';
import { formatConversation, renderPrompt } from './promptLoader.js';

const MAX_FILE_CHARACTERS = 6000;

export const TEAMMATES = Object.freeze({
  alex: {
    name: 'Alex',
    title: 'Senior Developer',
    focus:
      'You know this codebase well. Help them read unfamiliar code: explain what existing functions do, how data flows between files, and how to read the error they hit.',
  },
  sarah: {
    name: 'Sarah',
    title: 'QA Engineer',
    focus:
      'You think about how code breaks. Help them find edge cases, suggest test scenarios worth trying, and explain what a failing test is checking.',
  },
  daniel: {
    name: 'Daniel',
    title: 'Technical Mentor',
    focus:
      'You teach. Explain the concept behind the problem in plain words, and give hints in small steps so they keep solving it themselves.',
  },
});

const ALEX_TITLES = {
  'frontend-developer': 'Senior Frontend Developer',
  'backend-developer': 'Senior Backend Developer',
};

/** A teammate's name and title on this team: Alex's title follows the role being practised. */
export function describeTeammate(teammateId, roleId) {
  const teammate = TEAMMATES[teammateId];
  const title = teammateId === 'alex' ? (ALEX_TITLES[roleId] ?? teammate.title) : teammate.title;
  return { ...teammate, title };
}

/**
 * @returns {Promise<{ text: string, generatedBy: 'openai' | 'gemini' | 'template' }>}
 */
export async function reply({ teammateId, roleId, ticket, context, guide, history, message, hintLevel, hint, filePath, fileContent }) {
  const teammate = describeTeammate(teammateId, roleId);

  const generated = await generateStructured({
    purpose: `teammate.${teammateId}`,
    systemInstruction: `You are ${teammate.name}, ${teammate.title}. Respond only with JSON matching the schema.`,
    prompt: renderPrompt('teammate', {
      name: teammate.name,
      title: teammate.title,
      focus: teammate.focus,
      ticket: describeTicket(ticket),
      guide: guide ?? '(none)',
      hintLevel: String(hintLevel),
      hint: hint ?? '(no hint unlocked yet: ask guiding questions only)',
      filePath: filePath ?? 'none',
      fileContent: fileContent ? fileContent.slice(0, MAX_FILE_CHARACTERS) : '(no file shared)',
      conversation: formatConversation(history, { student: 'Developer', teammate: teammate.name }),
      message,
    }),
    schema: chatReplySchema,
  });

  if (generated) {
    return { text: generated.data.reply, generatedBy: generated.provider };
  }
  return {
    text: teammateAnswer({ teammateId, ticket, context, roleId, guide, hint, filePath, fileContent, history, message }),
    generatedBy: 'template',
  };
}
