import { useEffect } from 'react';
import { prefersReducedMotion } from './useInView.js';

/**
 * The page's one reveal: elements marked [data-reveal] rise 8px and fade in
 * the first time they enter the view. Content stays visible without script
 * or under reduced motion, because the hidden state is only applied once
 * the root has the `is-revealing` class.
 */
export function useReveal(rootRef) {
  useEffect(() => {
    const root = rootRef.current;
    if (!root || prefersReducedMotion()) return undefined;

    const targets = root.querySelectorAll('[data-reveal]');
    root.classList.add('is-revealing');

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-revealed');
            observer.unobserve(entry.target);
          }
        }
      },
      { threshold: 0.2, rootMargin: '0px 0px -8% 0px' },
    );
    targets.forEach((target) => observer.observe(target));

    return () => {
      observer.disconnect();
      root.classList.remove('is-revealing');
    };
  }, [rootRef]);
}
