/**
 * AI Engineering Manager: writes the ticket and answers requirement questions.
 * It only ever sees the public issue, never hints or hidden tests.
 */

import { chatReplySchema, ticketSchema } from '../../schemas/ai.schemas.js';
import { generateStructured } from './llm.js';
import { managerAnswer } from './questionBank.js';
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

  const content = generated?.data ?? {
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
    generatedBy: generated?.provider ?? 'template',
  };
}

/**
 * @returns {Promise<{ text: string, generatedBy: 'openai' | 'gemini' | 'template' }>}
 */
export async function answerQuestion({ ticket, context, roleId, history, message }) {
  const generated = await generateStructured({
    purpose: 'manager.chat',
    systemInstruction: SYSTEM_INSTRUCTION,
    prompt: renderPrompt('manager-chat', {
      ticket: describeTicket(ticket),
      context: describeContext(context),
      conversation: formatConversation(history, { student: 'Developer', manager: 'Manager' }),
      message,
    }),
    schema: chatReplySchema,
  });

  if (generated) {
    return { text: generated.data.reply, generatedBy: generated.provider };
  }
  return { text: managerAnswer({ ticket, context, roleId, history, message }), generatedBy: 'template' };
}

function describeContext(context) {
  if (!context) return '(no extra background)';
  return [
    `Who is affected: ${context.affected}`,
    `Priority: ${context.priority}`,
    `Out of scope: ${context.outOfScope}`,
    `How QA reproduces it:\n${context.reproduce}`,
  ].join('\n');
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
