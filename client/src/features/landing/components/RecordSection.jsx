import { ShieldAlert, ShieldCheck } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { useState } from 'react';
import { SAMPLE_RECORD, SECTION_NOTES } from '../content.js';
import SectionHead from './SectionHead.jsx';

/**
 * A sample Work Record. The switch edits one number so visitors can see
 * the signature stop matching, which is the whole point of the record.
 */
export default function RecordSection() {
  const [tampered, setTampered] = useState(false);
  const score = tampered ? SAMPLE_RECORD.tamperedScore : SAMPLE_RECORD.score;

  return (
    <section id="record" className="section">
      <div className="container">
        <SectionHead title="Proof a recruiter can check." note={SECTION_NOTES.record} />

        <div className="record">
          <div className="verify" data-reveal>
            <figure className="verify__card">
              <QRCodeSVG
                value={window.location.origin}
                size={112}
                bgColor="transparent"
                fgColor="currentColor"
                aria-hidden="true"
              />
              <figcaption>Scan to open the live record.</figcaption>
            </figure>
            <label className="switch">
              <input type="checkbox" checked={tampered} onChange={(event) => setTampered(event.target.checked)} />
              <span className="switch__track" aria-hidden="true" />
              Edit the score
            </label>
          </div>

          <article className="sheet" data-reveal aria-label="Sample work record">
            <header className="sheet__head">
              <div>
                <p className="sheet__name">{SAMPLE_RECORD.name}</p>
                <p className="sheet__meta">
                  {SAMPLE_RECORD.role}, {SAMPLE_RECORD.simulation}
                </p>
              </div>
              <p className={`seal ${tampered ? 'seal--broken' : ''}`} role="status" aria-live="polite">
                {tampered ? <ShieldAlert aria-hidden="true" /> : <ShieldCheck aria-hidden="true" />}
                {tampered ? 'Signature does not match' : 'Signature verified'}
              </p>
            </header>

            <div className="sheet__task">
              <p>{SAMPLE_RECORD.task}</p>
              <p className="sheet__score">
                <span key={score} className="num sheet__figure">
                  {score}
                </span>
                <span className="sheet__unit">score out of 100</span>
              </p>
            </div>

            <dl className="sheet__facts">
              {SAMPLE_RECORD.facts.map((fact) => (
                <div key={fact.label}>
                  <dt>{fact.label}</dt>
                  <dd className="num">{fact.value}</dd>
                </div>
              ))}
            </dl>
            <p className="sheet__note">Sample record</p>
          </article>
        </div>
      </div>
    </section>
  );
}
