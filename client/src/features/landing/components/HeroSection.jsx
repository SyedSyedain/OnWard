import { Check } from 'lucide-react';
import { HERO_STEPS } from '../content.js';
import { FINAL_STEP, phaseOf, useBenchDemo } from '../hooks/useBenchDemo.js';
import BenchDemo from './BenchDemo.jsx';

const HEADLINE = ['Do the job', 'before you', 'get it.'];

export default function HeroSection({ onStart, ready = true }) {
  const demo = useBenchDemo({ ready });

  return (
    <section id="top" className="hero">
      <div className="container hero__grid">
        <div className="hero__copy">
          <h1 className="headline">
            {HEADLINE.map((line, index) => (
              <span key={line} className="headline__line" style={{ '--i': index }}>
                <span>{line}</span>
              </span>
            ))}
          </h1>
          <p className="lead settle" style={{ '--i': 4 }}>
            Fix a real ticket in a real codebase. Tests decide.
          </p>
          <div className="hero__actions settle" style={{ '--i': 5 }}>
            <button type="button" className="key key--primary" onClick={onStart}>
              Start a simulation
            </button>
            <a href="#record" className="key">
              See a work record
            </a>
          </div>
          <StepGuide demo={demo} />
        </div>

        <div className="hero__stage">
          <BenchDemo demo={demo} />
        </div>
      </div>
    </section>
  );
}

/**
 * Three numbered steps that follow the demo on the right. The step being shown
 * is lit; finished steps get a tick. Clicking a step plays the demo from there.
 */
function StepGuide({ demo }) {
  const finished = !demo.armed || demo.step === FINAL_STEP;
  const current = finished ? HERO_STEPS.length : phaseOf(demo.step);

  return (
    <ol className="guide settle" style={{ '--i': 6 }} aria-label="What happens in the example">
      {HERO_STEPS.map((label, index) => {
        const state = index < current ? 'done' : index === current ? 'active' : 'todo';
        return (
          <li key={label}>
            <button
              type="button"
              className="guide__step"
              data-state={state}
              aria-current={state === 'active' ? 'step' : undefined}
              onClick={() => demo.jumpTo(index)}
            >
              <span className="guide__num num" aria-hidden="true">
                {state === 'done' ? <Check /> : index + 1}
              </span>
              {label}
            </button>
          </li>
        );
      })}
    </ol>
  );
}
