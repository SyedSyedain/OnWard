import { ArrowUp } from 'lucide-react';
import { FOOTER_COLUMNS } from '../content.js';
import { LandingMark } from './LandingNav.jsx';

export default function LandingFooter({ onStart, inert }) {
  return (
    <footer className="footer" inert={inert}>
      <div className="container">
        <div className="footer__grid">
          <div className="footer__brand">
            <span className="wordmark">
              <LandingMark />
              OnWard
            </span>
            <p>Practise a real engineering job, then prove it.</p>
          </div>

          {FOOTER_COLUMNS.map((column) => (
            <nav key={column.title} className="footer__column" aria-label={column.title}>
              <h2 className="footer__title">{column.title}</h2>
              <ul>
                {column.links?.map((link) => (
                  <li key={link.label}>
                    <a href={link.href}>{link.label}</a>
                  </li>
                ))}
                {column.items?.map((item) => (
                  <li key={item.label} className="footer__item">
                    {item.startsSimulation ? (
                      <button type="button" className="footer__action" onClick={() => onStart(item.startsSimulation)}>
                        {item.label}
                      </button>
                    ) : (
                      item.label
                    )}
                    {item.status && (
                      <span className={`chip ${item.status === 'Open' ? 'chip--green' : 'chip--dark'}`}>
                        {item.status}
                      </span>
                    )}
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>

        <p className="footer__giant" aria-hidden="true" data-reveal>
          {[...'OnWard'].map((letter, index) => (
            <span key={index} style={{ '--k': index }}>
              {letter}
            </span>
          ))}
        </p>

        <div className="footer__base">
          <p>© 2026 OnWard. Made in Bengaluru.</p>
          <a href="#top" className="footer__top">
            Back to top
            <ArrowUp aria-hidden="true" />
          </a>
        </div>
      </div>
    </footer>
  );
}
