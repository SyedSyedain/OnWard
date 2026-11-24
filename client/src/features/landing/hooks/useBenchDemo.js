import { useCallback, useEffect, useRef, useState } from 'react';
import { DEMO_CHECKS } from '../content.js';
import { prefersReducedMotion, useInView } from './useInView.js';

/**
 * Playback for the hero's example ticket, shared by the bench and the step guide.
 *   step 0 ticket open · 1 bug line found · 2 fix written · 3 checks run · 4 resolved
 * It starts when the bench is in view and the page is ready (after the intro),
 * then loops after a pause.
 * Under reduced motion it shows the finished state and never plays.
 */

export const FINAL_STEP = 4;
const STEP_DELAYS_MS = [1600, 1500, 1300];
const CHECK_INTERVAL_MS = 450;
const LOOP_PAUSE_MS = 4500;

/** Which guide step (0, 1 or 2) a bench step belongs to. */
export function phaseOf(step) {
  if (step === 0) return 0;
  if (step <= 2) return 1;
  return 2;
}

/** The bench step each guide step starts from. */
const PHASE_START = [0, 1, 3];

export function useBenchDemo({ ready = true } = {}) {
  const [benchRef, inView] = useInView({ threshold: 0.4 });
  const [step, setStep] = useState(FINAL_STEP);
  const [checksPassed, setChecksPassed] = useState(DEMO_CHECKS.length);
  const [armed, setArmed] = useState(false);
  const timers = useRef([]);
  const playRef = useRef(null);

  const clearTimers = () => {
    timers.current.forEach(clearTimeout);
    timers.current = [];
  };

  const play = useCallback((start = 0) => {
    clearTimers();
    if (prefersReducedMotion()) {
      setStep(FINAL_STEP);
      setChecksPassed(DEMO_CHECKS.length);
      return;
    }

    const later = (callback, delay) => timers.current.push(setTimeout(callback, delay));
    setArmed(true);
    setStep(start);
    setChecksPassed(0);

    let elapsed = 0;
    for (let next = start + 1; next <= 3; next += 1) {
      elapsed += STEP_DELAYS_MS[next - 1];
      later(() => setStep(next), elapsed);
    }
    DEMO_CHECKS.forEach((_, index) =>
      later(() => setChecksPassed(index + 1), elapsed + CHECK_INTERVAL_MS * (index + 1)),
    );
    const finish = elapsed + CHECK_INTERVAL_MS * (DEMO_CHECKS.length + 1);
    later(() => setStep(FINAL_STEP), finish);
    later(() => playRef.current(0), finish + LOOP_PAUSE_MS);
  }, []);

  playRef.current = play;

  useEffect(() => {
    if (inView && ready) play(0);
  }, [inView, ready, play]);

  useEffect(() => clearTimers, []);

  const jumpTo = useCallback((phase) => play(PHASE_START[phase]), [play]);

  return { benchRef, step, checksPassed, armed, jumpTo };
}
