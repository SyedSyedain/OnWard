import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { pathForSession } from '../../../lib/sessionRoutes.js';
import { NAV_LINKS } from '../content.js';
import Mark from '../../../components/brand/Mark.jsx';

/** A small floating pill, fixed so it travels with the scroll. Its shadow deepens once the page scrolls. */
export default function LandingNav({ onStart, returnPoint, inert }) {
  const resume = resumeLink(returnPoint);
  const [raised, setRaised] = useState(false);
  const [activeId, setActiveId] = useState(null);

  useEffect(() => {
    const onScroll = () => setRaised(window.scrollY > 24);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    const sections = NAV_LINKS.map((link) => document.getElementById(link.id)).filter(Boolean);
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.find((entry) => entry.isIntersecting);
        if (visible) setActiveId(visible.target.id);
      },
      { rootMargin: '-45% 0px -50% 0px' },
    );
    sections.forEach((section) => observer.observe(section));
    return () => observer.disconnect();
  }, []);

  return (
    <header className={`nav ${raised ? 'is-raised' : ''}`} inert={inert}>
      <div className="nav__bar">
        <a href="#top" className="wordmark" aria-label="OnWard, back to top">
          <LandingMark />
          OnWard
        </a>
        <nav aria-label="Sections" className="nav__links">
          {NAV_LINKS.map((link) => (
            <a key={link.id} href={`#${link.id}`} aria-current={activeId === link.id ? 'true' : undefined}>
              {link.label}
            </a>
          ))}
        </nav>
        {resume && (
          <Link to={resume.to} className="key key--small nav__resume">
            {resume.label}
          </Link>
        )}
        <button type="button" className="key key--small key--primary" onClick={onStart}>
          Start
        </button>
      </div>
    </header>
  );
}

/** The OnWard mark, styled for the landing page. */
export function LandingMark() {
  return <Mark className="wordmark__mark" ringClassName="mark__ring" arrowClassName="mark__arrow" />;
}

/** Where a returning visitor left off: their unfinished ticket, if any. */
function resumeLink(returnPoint) {
  if (returnPoint?.active) {
    return { to: pathForSession(returnPoint.active), label: `Continue ${returnPoint.active.issueId}` };
  }
  return null;
}
