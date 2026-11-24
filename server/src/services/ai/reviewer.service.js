/**
 * AI Reviewer: explains the submitted change and scores code quality.
 * Correctness is decided by the tests, never by the reviewer.
 */

import { reviewSchema } from '../../schemas/ai.schemas.js';
import { describeTicket } from './manager.service.js';
import { generateStructured } from './geminiClient.js';
import { renderPrompt } from './promptLoader.js';

const MAX_DIFF_CHARACTERS = 12000;

export async function reviewSubmission({ ticket, diff, testResult }) {
  if (diff.changedFiles.length === 0) {
    return {
      summary: 'No files were changed, so there is nothing to review yet.',
      strengths: [],
      improvements: ['Make a change that addresses the acceptance criteria, then submit again.'],
      qualityScore: 0,
      aspects: null,
      generatedBy: 'template',
    };
  }

  const testSummary = `${testResult.passedCount} of ${testResult.totalCount} tests passed (${testResult.acceptancePassed} of ${testResult.acceptanceTotal} acceptance checks).`;

  const generated = await generateStructured({
    purpose: 'reviewer.review',
    systemInstruction: 'You are a fair, specific code reviewer. Respond only with JSON matching the schema.',
    prompt: renderPrompt('reviewer', {
      ticket: describeTicket(ticket),
      testSummary,
      diff: diff.patch.slice(0, MAX_DIFF_CHARACTERS),
    }),
    schema: reviewSchema,
  });

  if (generated) {
    return { ...generated, generatedBy: 'gemini' };
  }
  return fallbackReview({ diff, testResult, testSummary });
}

function fallbackReview({ diff, testResult, testSummary }) {
  const focused = diff.changedFiles.every((file) => file.startsWith('src/') || file.startsWith('tests/'));

  return {
    summary: `${testSummary} The change touches ${diff.changedFiles.join(', ')}.`,
    strengths: testResult.allPassed ? ['All acceptance checks pass without breaking existing behaviour.'] : [],
    improvements: testResult.allPassed
      ? ['Consider adding a test of your own that covers the case you fixed.']
      : ['Some checks still fail. Re-read the acceptance criteria and run the tests again.'],
    qualityScore: testResult.allPassed && focused ? 18 : 10,
    // Edge cases, reliability and maintainability need a real reviewer; the template does not guess them.
    aspects: null,
    generatedBy: 'template',
  };
}
