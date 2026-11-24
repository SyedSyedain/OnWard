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

/**
 * @returns {Promise<{ text: string, generatedBy: 'gemini' | 'template' }>}
 */
export async function answerQuestion({ ticket, context, history, message }) {
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
    return { text: generated.reply, generatedBy: 'gemini' };
  }
  return { text: offlineAnswer({ ticket, context, message }), generatedBy: 'template' };
}

// Offline answers: the question is matched to a topic by its words, and the answer is built from the
// ticket and its prepared background. The first topic whose pattern matches wins.
const TOPICS = [
  { id: 'code', pattern: /\b(code|cause|fix|line|function|file|implement|how do i|where is|stack trace|debug)\b/ },
  { id: 'affected', pattern: /\b(who|affect|users?|customers?|people|impact|how many|which)\b/ },
  { id: 'priority', pattern: /\b(urgent|priority|deadline|when|soon|asap|important|release|time)\b/ },
  { id: 'scope', pattern: /\b(scope|also|refactor|anything else|extra|out of)\b/ },
  { id: 'reproduce', pattern: /\b(reproduce|steps|see it|happen|example|repro|show)\b/ },
  { id: 'done', pattern: /\b(done|accept|criteria|finish|complete|test|expected|requirement|should)\b/ },
  { id: 'why', pattern: /\b(why|matter|business|reason|value)\b/ },
];

function offlineAnswer({ ticket, context, message }) {
  const topic = TOPICS.find(({ pattern }) => pattern.test(message.toLowerCase()))?.id;
  const criteria = ticket.acceptanceCriteria.map((criterion) => `• ${criterion}`).join('\n');

  switch (topic) {
    case 'code':
      return 'That is a code question, and finding it is the job I have given you. Start in ' +
        `${ticket.relevantFiles[0]}, and ask Alex for a walk through the code or Sarah for cases to try.`;
    case 'affected':
      return context?.affected ?? `Anyone using ${ticket.area.toLowerCase()}. ${ticket.summary}`;
    case 'priority':
      return context?.priority ?? `It needs to be fixed before the next release. ${ticket.businessImpact}`;
    case 'scope':
      return context?.outOfScope
        ? `Keep the change focused. ${context.outOfScope}`
        : 'Keep the change focused on this ticket; note anything else you spot and we will plan it separately.';
    case 'reproduce':
      return context?.reproduce ? `Here is how QA reproduced it:\n${context.reproduce}` : ticket.summary;
    case 'why':
      return ticket.businessImpact;
    case 'done':
      return `It is done when all of these are true:\n${criteria}\nThe acceptance checks test exactly these.`;
    default:
      return `Here is what matters for this ticket. ${ticket.summary}\nIt is done when:\n${criteria}\n` +
        'You can ask me who is affected, how urgent it is, what is out of scope, or how to reproduce it.';
  }
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
