/**
 * Turns the outcome, review quality and hint usage into a score out of 100.
 *
 *   correctness   60  awarded only when every test and acceptance check passes
 *   code quality  25  the reviewer's quality score
 *   independence  15  awarded only for a resolved ticket, reduced per hint level
 *
 * Tests are the source of truth: an unresolved ticket can never score above 25.
 */

export const SCORE_WEIGHTS = Object.freeze({ correctness: 60, quality: 25, independence: 15 });

const INDEPENDENCE_BY_HINT_LEVEL = [15, 12, 8, 4, 0];

export function calculateScore({ resolved, qualityScore, hintLevel }) {
  const correctness = resolved ? SCORE_WEIGHTS.correctness : 0;
  const quality = clamp(Math.round(qualityScore), 0, SCORE_WEIGHTS.quality);
  const independence = resolved
    ? INDEPENDENCE_BY_HINT_LEVEL[clamp(hintLevel, 0, INDEPENDENCE_BY_HINT_LEVEL.length - 1)]
    : 0;

  return { correctness, quality, independence, total: correctness + quality + independence };
}

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}
