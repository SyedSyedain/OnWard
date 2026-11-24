import { useEffect, useRef, useState } from 'react';
import { LOGO_ARROW, LOGO_ARROW_HEAD, LOGO_ARROW_SHAFT, LOGO_CENTRE, LOGO_RING, LOGO_WIDTH } from '../logo.js';

/**
 * The opening sequence, played once per page load on the home page.
 *
 *   1. Black screen; the logo's light tile settles in.
 *   2. The black ring paints itself in one continuous stroke.
 *   3. The arrowhead flies in from beyond the left edge along the arrow's own
 *      upward curve, turning with it, a tapering trail behind. The shaft draws
 *      itself behind the head, so the arrow is whole at every moment.
 *   4. It lands: the pieces become the one logo arrow, a pulse leaves the tip,
 *      the logo settles and the arrow glows once.
 *   5. The tile opens out to fill the screen and becomes the page background.
 *
 * The ring, tile, glow and opening are CSS (landing.css). The flight is SVG
 * animation (animateMotion), the one way to move a shape along a curve and turn
 * it with the curve without a library. This component sizes the stage and ends it.
 */

// The centre line of the ring, from the open end on the right, round the top,
// down the left, under the arrow's path and into the lower-right piece.
const RING_BRUSH =
  'M865 548C865 470 820 377 720 377H570C480 377 410 440 395 530L375 690C370 760 420 830 500 880C560 925 700 925 760 900C820 875 860 830 870 790';

// The flight: from far off the left edge, rising along the arrow's own curve,
// through the tail and on to where the head comes to rest.
const FLIGHT = 'M-4200 1700C-2000 1400 -320 1010 380 885C520 860 680 780 800 680L905 595';
const LANDING = { x: 905, y: 595 };
// The flight's direction at the landing point (its last segment), in degrees.
const LANDING_ANGLE = (Math.atan2(595 - 680, 905 - 800) * 180) / Math.PI;

// Arrow timing, in seconds, shared by every part of the flight so they stay together.
const FLIGHT_BEGIN = 1.85;
const FLIGHT_DURATION = 1.4;
const LANDED = FLIGHT_BEGIN + FLIGHT_DURATION;
const FLIGHT_EASE = '0.25 0.75 0.2 1';

// Trail layers: length along the flight (as a share of it), width, opacity. Together they taper.
const TRAIL = [
  { length: 0.14, width: 4, opacity: 0.35 },
  { length: 0.07, width: 9, opacity: 0.6 },
  { length: 0.03, width: 16, opacity: 0.9 },
];

const OPEN_AT_MS = 4100;
const DONE_AT_MS = 5050;
const SKIP_OPEN_MS = 950;

export default function IntroSplash({ onDone }) {
  const [stage, setStage] = useState(measureStage);
  const [opening, setOpening] = useState(false);
  const timers = useRef([]);

  useEffect(() => {
    const later = (callback, delay) => timers.current.push(setTimeout(callback, delay));
    later(() => setOpening(true), OPEN_AT_MS);
    later(onDone, DONE_AT_MS);

    const handleResize = () => setStage(measureStage());
    const handleKey = (event) => event.key === 'Escape' && skip();
    window.addEventListener('resize', handleResize);
    window.addEventListener('keydown', handleKey);
    return () => {
      timers.current.forEach(clearTimeout);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('keydown', handleKey);
    };
    // Runs once: the intro has a fixed timeline, and skip only touches refs and setters.
  }, []);

  function skip() {
    timers.current.forEach(clearTimeout);
    timers.current = [setTimeout(onDone, SKIP_OPEN_MS)];
    setOpening(true);
  }

  const flight = {
    begin: `${FLIGHT_BEGIN}s`,
    dur: `${FLIGHT_DURATION}s`,
    fill: 'freeze',
    calcMode: 'spline',
    keyTimes: '0;1',
    keySplines: FLIGHT_EASE,
  };

  return (
    <div
      className="intro"
      data-opening={opening || undefined}
      style={{ '--tile': `${stage.tile}px`, '--cover': stage.cover }}
    >
      <div className="intro__tile" aria-hidden="true" />

      <svg className="intro__art" viewBox={stage.viewBox} aria-hidden="true" focusable="false">
        <defs>
          <mask id="intro-ring-mask" maskUnits="userSpaceOnUse" x="-6000" y="-6000" width="14000" height="14000">
            <path className="intro__brush intro__brush--ring" d={RING_BRUSH} pathLength="1" />
          </mask>
          <mask id="intro-shaft-mask" maskUnits="userSpaceOnUse" x="-6000" y="-6000" width="14000" height="14000">
            <path
              className="intro__brush intro__brush--shaft"
              d={FLIGHT}
              pathLength="1"
              strokeDasharray="1 2"
              strokeDashoffset="1"
            >
              <animate attributeName="stroke-dashoffset" values="1;0" {...flight} />
            </path>
          </mask>
          <filter id="intro-glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="26" />
          </filter>
        </defs>

        <g className="intro__trail">
          {TRAIL.map((layer) => (
            <path
              key={layer.width}
              className="intro__streak"
              d={FLIGHT}
              pathLength="1"
              strokeWidth={layer.width}
              strokeOpacity={layer.opacity}
              strokeDasharray={`${layer.length} 3`}
              strokeDashoffset={layer.length}
            >
              <animate attributeName="stroke-dashoffset" values={`${layer.length};${layer.length - 1}`} {...flight} />
            </path>
          ))}
        </g>

        <g className="intro__logo">
          <g mask="url(#intro-ring-mask)">
            {LOGO_RING.map((d) => (
              <path key={d} className="intro__ring" d={d} />
            ))}
          </g>

          <path className="intro__glow" d={LOGO_ARROW} filter="url(#intro-glow)" />

          {/* In flight: the shaft draws behind a head that travels and turns along the curve. */}
          <g className="intro__flying">
            <path className="intro__arrow" d={LOGO_ARROW_SHAFT} mask="url(#intro-shaft-mask)" />
            <g opacity="0">
              <set attributeName="opacity" to="1" begin={flight.begin} fill="freeze" />
              <animateMotion path={FLIGHT} rotate="auto" keyPoints="0;1" {...flight} />
              <path
                className="intro__arrow"
                d={LOGO_ARROW_HEAD}
                transform={`rotate(${-LANDING_ANGLE}) translate(${-LANDING.x} ${-LANDING.y})`}
              />
            </g>
            <set attributeName="opacity" to="0" begin={`${LANDED}s`} fill="freeze" />
          </g>

          {/* Landed: the exact logo arrow, in one piece. */}
          <path className="intro__arrow" d={LOGO_ARROW} opacity="0">
            <set attributeName="opacity" to="1" begin={`${LANDED}s`} fill="freeze" />
          </path>
        </g>

        <circle className="intro__pulse" cx="918" cy="588" r="70" />
      </svg>

      <p className="visually-hidden" role="status">
        Loading OnWard
      </p>
      <button type="button" className="intro__skip" onClick={skip}>
        Skip intro
      </button>
    </div>
  );
}

/**
 * Sizes the stage for this screen: the glyph is about a quarter of the short
 * side (140 to 240px), the SVG's viewBox is centred on the logo at that scale
 * so the arrow can start beyond the real left edge, and `cover` is how far the
 * tile must grow to fill the whole screen.
 */
function measureStage() {
  const width = window.innerWidth;
  const height = window.innerHeight;
  const glyph = Math.min(240, Math.max(140, Math.min(width, height) * 0.26));
  const unit = glyph / LOGO_WIDTH;
  const viewWidth = width / unit;
  const viewHeight = height / unit;
  const tile = glyph * 1.8;

  return {
    tile,
    cover: ((Math.hypot(width, height) / tile) * 1.04).toFixed(3),
    viewBox: `${LOGO_CENTRE.x - viewWidth / 2} ${LOGO_CENTRE.y - viewHeight / 2} ${viewWidth} ${viewHeight}`,
  };
}
