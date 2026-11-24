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
  return fallbackReview({ ticket, diff, testResult, testSummary });
}

/**
 * The review without live AI: rule-based checks on the diff, stated as such. Correctness still comes
 * from the tests; these checks only look at how the change is written.
 */
function fallbackReview({ ticket, diff, testResult, testSummary }) {
  const added = changedLines(diff.patch, '+');
  const removed = changedLines(diff.patch, '-');
  const sourceFiles = diff.changedFiles.filter((file) => file.startsWith('src/'));
  const testFiles = diff.changedFiles.filter((file) => file.startsWith('tests/'));
  const outsideTicket = sourceFiles.filter((file) => !ticket.relevantFiles.includes(file));

  const debugLines = added.filter((line) => /\bconsole\.(log|debug)\(|\bdebugger\b/.test(line));
  const todoLines = added.filter((line) => /\b(TODO|FIXME|XXX)\b/.test(line));
  const commentedCode = added.filter((line) => /^\s*\/\/.*[;{}()]\s*$/.test(line));
  const size = added.length + removed.length;
  const projectTests = testResult.tests.filter((test) => test.kind === 'project');
  const projectPassed = projectTests.every((test) => test.passed);
  const acceptanceShare = testResult.acceptanceTotal > 0 ? testResult.acceptancePassed / testResult.acceptanceTotal : 0;

  const strengths = [];
  const improvements = [];

  if (testResult.allPassed) strengths.push('Every acceptance check passes and existing behaviour still works.');
  else if (testResult.acceptancePassed > 0) strengths.push(`${testResult.acceptancePassed} of ${testResult.acceptanceTotal} acceptance checks already pass.`);
  if (size > 0 && size <= 12) strengths.push(`A small, focused change: ${size} line${size === 1 ? '' : 's'} changed.`);
  if (testFiles.length > 0) strengths.push('You added or updated tests alongside the fix.');
  if (outsideTicket.length === 0 && sourceFiles.length > 0) strengths.push('The change stays inside the files the ticket points to.');

  if (!projectPassed) improvements.push('Some existing project tests now fail: the change breaks behaviour that used to work.');
  if (!testResult.allPassed && projectPassed) improvements.push('Some acceptance checks still fail. Re-read the acceptance criteria and test those cases.');
  if (debugLines.length > 0) improvements.push(`Remove the debugging output you left in (${debugLines.length} line${debugLines.length === 1 ? '' : 's'}).`);
  if (todoLines.length > 0) improvements.push('Resolve or remove the TODO notes before submitting.');
  if (commentedCode.length > 0) improvements.push('Delete commented-out code instead of leaving it in the file.');
  if (outsideTicket.length > 0) improvements.push(`You also changed ${outsideTicket.join(', ')}. Check that it belongs in this ticket.`);
  if (size > 40) improvements.push('The change is large for this ticket. A smaller change is easier to review and safer to ship.');
  if (testFiles.length === 0 && testResult.allPassed) improvements.push('Add a test of your own that covers the case you fixed.');

  const hygieneIssues = [debugLines, todoLines, commentedCode].filter((lines) => lines.length > 0).length;
  const maintainability = Math.max(1, 5 - hygieneIssues - (size > 40 ? 1 : 0) - (outsideTicket.length > 0 ? 1 : 0));
  const edgeCases = Math.max(1, Math.round(1 + acceptanceShare * 3 + (testFiles.length > 0 ? 1 : 0)));
  const reliability = !projectPassed ? 1 : testResult.allPassed ? 5 : 3;
  const qualityScore = Math.round(((maintainability + edgeCases + reliability) / 15) * 25);

  return {
    summary: `${testSummary} The change touches ${diff.changedFiles.join(', ')} (${added.length} added, ${removed.length} removed lines). This review comes from automatic checks, not from an AI reviewer.`,
    strengths: strengths.slice(0, 4),
    improvements: improvements.slice(0, 4),
    qualityScore,
    aspects: {
      edgeCases: {
        rating: Math.min(5, edgeCases),
        note: `${testResult.acceptancePassed} of ${testResult.acceptanceTotal} acceptance checks pass${testFiles.length > 0 ? ', and you added tests' : ''}.`,
      },
      reliability: {
        rating: reliability,
        note: projectPassed ? 'Existing project tests still pass.' : 'Existing project tests fail after this change.',
      },
      maintainability: {
        rating: maintainability,
        note: hygieneIssues === 0 && size <= 40 ? 'Clean, focused diff.' : 'See the suggestions about leftovers and size.',
      },
    },
    generatedBy: 'template',
  };
}

/** Lines added ('+') or removed ('-') in a unified diff, without the file headers. */
function changedLines(patch, sign) {
  const header = sign.repeat(3);
  return patch
    .split('\n')
    .filter((line) => line.startsWith(sign) && !line.startsWith(header))
    .map((line) => line.slice(1));
}
