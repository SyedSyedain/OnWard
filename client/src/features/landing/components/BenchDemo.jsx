import { Check, Circle } from 'lucide-react';
import { DEMO_CHECKS, DEMO_CODE, DEMO_TICKET } from '../content.js';
import { FINAL_STEP, phaseOf } from '../hooks/useBenchDemo.js';

/**
 * The hero's signature: an example ticket worked end to end, in three numbered parts
 * that match the step guide beside it. Playback lives in useBenchDemo, shared with the guide.
 */
export default function BenchDemo({ demo }) {
  const { benchRef, step, checksPassed, armed } = demo;
  const resolved = !armed || step === FINAL_STEP;

  return (
    // Until the demo is armed, the finished state shows, so the bench never looks empty.
    <figure
      ref={benchRef}
      className="bench"
      aria-label="An example ticket, fixed and tested"
      data-step={armed ? step : FINAL_STEP}
      data-phase={armed && step !== FINAL_STEP ? phaseOf(step) : undefined}
      data-js-armed={armed || undefined}
    >
      <article className="entry bench__ticket" data-part="0" aria-label={`Example ticket ${DEMO_TICKET.id}`}>
        <header className="entry__head">
          <span className="bench__label">
            <span className="bench__badge num" aria-hidden="true">
              1
            </span>
            Ticket {DEMO_TICKET.id}
          </span>
          <span className={`chip ${resolved ? 'chip--green' : 'chip--ink'}`} role="status">
            {resolved ? 'Resolved' : 'Open'}
          </span>
        </header>
        <p className="entry__title">{DEMO_TICKET.title}</p>
        <dl className="entry__cells">
          {DEMO_TICKET.cells.map((cell) => (
            <div key={cell.label} className="entry__cell">
              <dt>{cell.label}</dt>
              <dd>{cell.value}</dd>
            </div>
          ))}
        </dl>
      </article>

      <div className="bench__editor" data-part="1">
        <div className="bench__bar">
          <span className="bench__label">
            <span className="bench__badge num" aria-hidden="true">
              2
            </span>
            <span className="num">couponService.js</span>
          </span>
        </div>
        <pre className="code" aria-label="Example fix in couponService.js">
          {DEMO_CODE.map((line, index) => (
            <span key={index} className="code__line" data-change={line.change} style={{ '--i': index }}>
              <span className="code__number" aria-hidden="true">
                {index + 1}
              </span>
              <code>{line.text || ' '}</code>
            </span>
          ))}
        </pre>
      </div>

      <section className="entry bench__checks" data-part="2" aria-label="Acceptance checks">
        <header className="entry__head">
          <span className="bench__label">
            <span className="bench__badge num" aria-hidden="true">
              3
            </span>
            Acceptance checks
          </span>
          <span className="num">
            {armed ? checksPassed : DEMO_CHECKS.length} / {DEMO_CHECKS.length}
          </span>
        </header>
        <ul>
          {DEMO_CHECKS.map((check, index) => {
            const passed = !armed || index < checksPassed;
            return (
              <li key={check} className="check" data-passed={passed}>
                <span className="check__icon" aria-hidden="true">
                  {passed ? <Check /> : <Circle />}
                </span>
                <span>{check}</span>
                <span className="visually-hidden">{passed ? 'passed' : 'not run yet'}</span>
              </li>
            );
          })}
        </ul>
      </section>
    </figure>
  );
}
