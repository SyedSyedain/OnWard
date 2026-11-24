import Lenis from 'lenis';
import { useEffect, useRef } from 'react';
import { prefersReducedMotion } from './useInView.js';

/**
 * Lenis smooth scrolling for the home page, and gliding in-page anchor links.
 * Turned off entirely for people who prefer reduced motion.
 * While `paused` (the intro is playing) the page does not scroll.
 */
export function useSmoothScroll({ paused = false } = {}) {
  const lenisRef = useRef(null);

  useEffect(() => {
    if (prefersReducedMotion()) return undefined;

    const lenis = new Lenis({ lerp: 0.1 });
    lenisRef.current = lenis;
    let frame = requestAnimationFrame(function tick(time) {
      lenis.raf(time);
      frame = requestAnimationFrame(tick);
    });

    function handleAnchorClick(event) {
      const link = event.target.closest?.('a[href^="#"]');
      if (!link || event.metaKey || event.ctrlKey || event.shiftKey) return;
      const target = document.getElementById(link.getAttribute('href').slice(1));
      if (!target) return;
      event.preventDefault();
      lenis.scrollTo(target, { offset: -24, duration: 1.4 });
    }

    document.addEventListener('click', handleAnchorClick);
    return () => {
      document.removeEventListener('click', handleAnchorClick);
      cancelAnimationFrame(frame);
      lenis.destroy();
      lenisRef.current = null;
    };
  }, []);

  useEffect(() => {
    const lenis = lenisRef.current;
    if (!lenis) return;
    if (paused) lenis.stop();
    else lenis.start();
  }, [paused]);
}
