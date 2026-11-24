import { LOGO_ARROW, LOGO_RING, LOGO_VIEWBOX } from '../../features/landing/logo.js';

/**
 * The OnWard mark: the ring and the orange arrow, from the shared logo geometry.
 * The ring takes `ringClassName` so it can sit on light or dark surfaces.
 */
export default function Mark({ className = '', ringClassName = '', arrowClassName = '' }) {
  return (
    <svg className={className} viewBox={LOGO_VIEWBOX} aria-hidden="true" focusable="false">
      {LOGO_RING.map((d) => (
        <path key={d} className={ringClassName} d={d} />
      ))}
      <path className={arrowClassName} d={LOGO_ARROW} />
    </svg>
  );
}
