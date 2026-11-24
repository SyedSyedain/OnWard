/**
 * AI Engineering Manager: writes the ticket and answers requirement questions.
 * It only ever sees the public issue, never hints or hidden tests.
 */

import { chatReplySchema, ticketSchema } from '../../schemas/ai.schemas.js';
import { generateStructured } from './geminiClient.js';
import { formatConversation, renderPrompt } from './promptLoader.js';

const SYSTEM_INSTRUCTION = 'You are a supportive engineering manager. Respond only with JSON matching the schema.';

export async function writeTicket({ simulationName, publicIssue }) {
  const generated = await generateStructured({
    purpose: 'manager.ticket',
    systemInstruction: SYSTEM_INSTRUCTION,
    prompt: renderPrompt('manager-ticket', {
      simulationName,
      issue: { area: publicIssue.area, title: publicIssue.title, symptoms: publicIssue.symptoms },
    }),
    schema: ticketSchema,
  });

  const content = generated ?? {
    title: publicIssue.title,
    summary: publicIssue.symptoms,
    businessImpact: `This affects the ${publicIssue.area.toLowerCase()} area and needs to be fixed before the next release.`,
  };

  return {
    ...content,
    issueId: publicIssue.id,
    area: publicIssue.area,
    difficulty: publicIssue.difficulty,
    acceptanceCriteria: publicIssue.acceptanceCriteria,
    relevantFiles: publicIssue.relevantFiles,
    generatedBy: generated ? 'gemini' : 'template',
  };
}

export async function answerQuestion({ ticket, history, message }) {
  const generated = await generateStructured({
    purpose: 'manager.chat',
    systemInstruction: SYSTEM_INSTRUCTION,
    prompt: renderPrompt('manager-chat', {
      ticket: describeTicket(ticket),
      conversation: formatConversation(history, { student: 'Developer', manager: 'Manager' }),
      message,
    }),
    schema: chatReplySchema,
  });

  return generated?.reply ?? fallbackAnswer(ticket);
}

function fallbackAnswer(ticket) {
  const criteria = ticket.acceptanceCriteria.map((criterion) => `• ${criterion}`).join('\n');
  return `Good question. The ticket is done when all of these are true:\n${criteria}\nFor help with the code itself, check with your teammate in the workspace.`;
}

export function describeTicket(ticket) {
  return [
    `Title: ${ticket.title}`,
    `Area: ${ticket.area}`,
    `Summary: ${ticket.summary}`,
    `Business impact: ${ticket.businessImpact}`,
    `Acceptance criteria:\n${ticket.acceptanceCriteria.map((criterion) => `- ${criterion}`).join('\n')}`,
    `Relevant files: ${ticket.relevantFiles.join(', ')}`,
  ].join('\n');
}
