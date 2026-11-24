import { CheckCircle2, Clock, FlaskConical, Lightbulb, ShieldAlert, ShieldCheck } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { useState } from 'react';
import { ScoreRing, ScoreSplit, SkillRadar, Stat, gradeFor } from '../../../components/score/ScoreVisuals.jsx';
import { SAMPLE_RECORD, SECTION_NOTES, VERIFY_STEPS } from '../content.js';
import { useInView } from '../hooks/useInView.js';
import SectionHead from './SectionHead.jsx';

const FACT_ICONS = [FlaskConical, CheckCircle2, Lightbulb, Clock];

/**
 * A sample Work Record, drawn with the same scorecard as a real one. The switch edits
 * the score so visitors can watch the signature stop matching, which is the whole point.
 * The visuals mount again when the sheet scrolls into view, or the score changes, so they animate then.
 */
export default function RecordSection() {
  const [tampered, setTampered] = useState(false);
  const [sheetRef, inView] = useInView({ threshold: 0.3 });
  const score = tampered ? SAMPLE_RECORD.tamperedScore : SAMPLE_RECORD.score;
  const replay = `${inView}-${score.total}`;

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

            <ol className="verify__steps">
              {VERIFY_STEPS.map((step, index) => (
                <li key={step}>
                  <span className="verify__num num" aria-hidden="true">
                    {index + 1}
                  </span>
                  {step}
                </li>
              ))}
            </ol>

            <label className="switch verify__try">
              <input type="checkbox" checked={tampered} onChange={(event) => setTampered(event.target.checked)} />
              <span className="switch__track" aria-hidden="true" />
              <span>
                Edit the score
                <span className="verify__hint">Try it, and watch the seal.</span>
              </span>
            </label>
          </div>

          <article ref={sheetRef} className="sheet" data-reveal aria-label="Sample work record">
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

            <p className="sheet__ticket">
              <span className="sheet__id">{SAMPLE_RECORD.ticket}</span>
              {SAMPLE_RECORD.task}
            </p>

            <div className="sheet__top">
              <div className="sheet__ring">
                <ScoreRing key={replay} total={score.total} resolved />
                <span className="sheet__grade">{gradeFor(score.total, true)}</span>
              </div>
              <ScoreSplit key={replay} score={score} />
            </div>

            <div className="sheet__bottom">
              <dl className="sheet__stats">
                {SAMPLE_RECORD.facts.map((fact, index) => (
                  <Stat key={fact.label} icon={FACT_ICONS[index]} label={fact.label} value={fact.value} />
                ))}
              </dl>
              <div className="sheet__radar">
                <SkillRadar key={replay} score={score} aspects={SAMPLE_RECORD.aspects} />
              </div>
            </div>

            <p className="sheet__note">Sample record</p>
          </article>
        </div>
      </div>
    </section>
  );
}
