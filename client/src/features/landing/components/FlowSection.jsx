import { Check, FileCode2, FlaskConical, Lightbulb, ShieldCheck, Ticket } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { FLOW, SECTION_NOTES } from '../content.js';
import SectionHead from './SectionHead.jsx';

const DIFF_LINES = [
  { width: 72 },
  { width: 50, change: 'removed' },
  { width: 84, change: 'added' },
  { width: 60, change: 'added' },
  { width: 38 },
];

const DIFF_SIGN = { removed: '−', added: '+' };

/**
 * The idea at a glance: five stops joined by one line.
 * The line draws with scroll where the browser supports scroll timelines,
 * and is simply drawn everywhere else.
 */
export default function FlowSection() {
  return (
    <section id="flow" className="section flow">
      <div className="container">
        <SectionHead title="One ticket, start to finish." note={SECTION_NOTES.flow} />

        <div className="flow__track">
          <svg className="flow__line" viewBox="0 0 1000 40" preserveAspectRatio="none" aria-hidden="true">
            <path d="M0 20 H 1000" />
          </svg>

          <ol className="flow__stops">
            {FLOW.map((stop, index) => (
              <li key={stop.id} className="stop" data-reveal style={{ '--i': index }}>
                <span className="stop__node num" aria-hidden="true">
                  {index + 1}
                </span>
                <div className="stop__visual" aria-hidden="true">
                  <StopVisual id={stop.id} />
                </div>
                <h3 className="stop__title">{stop.title}</h3>
                <p className="stop__line">{stop.line}</p>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}

function StopVisual({ id }) {
  switch (id) {
    case 'ticket':
      return (
        <div className="mini">
          <span className="mini__label">
            <Ticket />
            <span className="num">SS-214</span>
          </span>
          <span className="mini__title">Coupons apply twice</span>
          <span className="mini__foot">
            <span className="avatar">M</span>
            <span className="chip chip--green">Assigned</span>
          </span>
        </div>
      );
    case 'code':
      return (
        <div className="mini">
          <span className="mini__label">
            <FileCode2 />
            <span className="num mini__file">couponService.js</span>
          </span>
          <span className="mini__diff">
            {DIFF_LINES.map((line, index) => (
              <span key={index} className="mini__line" data-change={line.change} style={{ '--j': index }}>
                <span className="mini__sign num">{DIFF_SIGN[line.change] ?? ''}</span>
                <span className="mini__code" style={{ '--w': `${line.width}%` }} />
              </span>
            ))}
          </span>
        </div>
      );
    case 'hints':
      return (
        <div className="mini">
          <span className="mini__bubble">
            <Lightbulb />
            Check the cart first.
          </span>
          <span className="mini__foot">
            <span className="hints__bar">
              {[1, 2, 3, 4].map((step) => (
                <span key={step} data-used={step === 1} />
              ))}
            </span>
            <span className="num mini__muted">1 / 4</span>
          </span>
        </div>
      );
    case 'tests':
      return (
        <div className="mini">
          <span className="mini__label mini__label--split">
            <span>
              <FlaskConical />
              Checks
            </span>
            <span className="num mini__pass">3 / 3</span>
          </span>
          <span className="mini__checks">
            {[74, 58, 44].map((width, index) => (
              <span key={index} className="mini__check" style={{ '--j': index }}>
                <Check />
                <span className="mini__code" style={{ '--w': `${width}%` }} />
              </span>
            ))}
          </span>
          <span className="mini__progress">
            <span />
          </span>
        </div>
      );
    default:
      return (
        <div className="mini mini--record">
          <QRCodeSVG value={window.location.origin} size={64} bgColor="transparent" fgColor="currentColor" />
          <span className="mini__stack">
            <span className="num mini__score">88</span>
            <span className="chip chip--green">
              <ShieldCheck />
              Verified
            </span>
          </span>
        </div>
      );
  }
}
