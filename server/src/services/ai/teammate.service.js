/**
 * AI Teammates: Alex, Sarah and Daniel each guide the student from their own angle.
 * They receive only the approved hint for the current level, never the
 * expected solution or hidden tests, and they never write the fix.
 */

import { chatReplySchema } from '../../schemas/ai.schemas.js';
import { describeTicket } from './manager.service.js';
import { generateStructured } from './geminiClient.js';
import { formatConversation, renderPrompt } from './promptLoader.js';

const MAX_FILE_CHARACTERS = 6000;

export const TEAMMATES = Object.freeze({
  alex: {
    name: 'Alex',
    title: 'Senior Backend Developer',
    focus:
      'You know this codebase well. Help them read unfamiliar code: explain what existing functions do, how data flows between files, and how to read the error they hit.',
    fallback:
      'Let’s read it together. Open the file named in the ticket and find the function that handles this case. What does it receive, and what does it return? If an error appears, read its first line and tell me which file and line it points to.',
  },
  sarah: {
    name: 'Sarah',
    title: 'QA Engineer',
    focus:
      'You think about how code breaks. Help them find edge cases, suggest test scenarios worth trying, and explain what a failing test is checking.',
    fallback:
      'Before you change anything, list the cases: the normal path, the same action twice, an empty or missing value, and something that has expired or run out. Run the tests and pick the first failing check. What input does it use, and what did it expect?',
  },
  daniel: {
    name: 'Daniel',
    title: 'Technical Mentor',
    focus:
      'You teach. Explain the concept behind the problem in plain words, and give hints in small steps so they keep solving it themselves.',
    fallback:
      'Say the bug back to me in one sentence, in your own words. Then name the one rule the code should enforce. If you are still stuck after trying that, unlock a hint and I will point you a little closer.',
  },
});

/**
 * @returns {Promise<{ text: string, generatedBy: 'gemini' | 'template' }>}
 */
export async function reply({ teammateId, ticket, history, message, hintLevel, hint, filePath, fileContent }) {
  const teammate = TEAMMATES[teammateId];

  const generated = await generateStructured({
    purpose: `teammate.${teammateId}`,
    systemInstruction: `You are ${teammate.name}, ${teammate.title}. Respond only with JSON matching the schema.`,
    prompt: renderPrompt('teammate', {
      name: teammate.name,
      title: teammate.title,
      focus: teammate.focus,
      ticket: describeTicket(ticket),
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
    return { text: generated.reply, generatedBy: 'gemini' };
  }
  return { text: hint ?? teammate.fallback, generatedBy: 'template' };
}
