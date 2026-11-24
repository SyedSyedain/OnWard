import { useEffect, useRef, useState } from 'react';
import { readReturnPoint } from '../../lib/lastSession.js';
import ClosingSection from './components/ClosingSection.jsx';
import FlowSection from './components/FlowSection.jsx';
import HeroSection from './components/HeroSection.jsx';
import IntroSplash from './components/IntroSplash.jsx';
import LandingFooter from './components/LandingFooter.jsx';
import LandingNav from './components/LandingNav.jsx';
import RecordSection from './components/RecordSection.jsx';
import RolesSection from './components/RolesSection.jsx';
import StartDialog from './components/StartDialog.jsx';
import TeamSection from './components/TeamSection.jsx';
import { useReveal } from './hooks/useReveal.js';
import { prefersReducedMotion } from './hooks/useInView.js';
import { useSmoothScroll } from './hooks/useSmoothScroll.js';
import './styles/landing.css';

// The intro plays once per page load. Moving between pages inside the app and
// coming back here does not replay it; a fresh load of the site does.
// `?intro=off` turns it off, for screenshots and automated checks.
let introPlayed = false;

function shouldPlayIntro() {
  const params = new URLSearchParams(window.location.search);
  // Arriving to start a ticket (from the results or record page) goes straight to the form.
  const turnedOff = params.get('intro') === 'off' || params.has('start');
  return !introPlayed && !turnedOff && window.location.pathname === '/' && !prefersReducedMotion();
}

export default function LandingPage() {
  const rootRef = useRef(null);
  const [start, setStart] = useState(() => ({
    open: new URLSearchParams(window.location.search).has('start'),
    difficulty: 'easy',
    roleId: undefined,
  }));
  const [returnPoint] = useState(readReturnPoint);
  const openStart = (difficulty = 'easy', roleId) => setStart({ open: true, difficulty, roleId });
  // 'playing' while the intro covers the page, 'done' once it has opened, null when skipped entirely.
  const [intro, setIntro] = useState(() => (shouldPlayIntro() ? 'playing' : null));
  const playing = intro === 'playing';

  useSmoothScroll({ paused: playing });
  useReveal(rootRef);

  useEffect(() => {
    if (!playing) return undefined;
    introPlayed = true;
    window.history.scrollRestoration = 'manual';
    window.scrollTo(0, 0);
    return () => document.documentElement.classList.remove('intro-pending');
  }, [playing]);

  return (
    <div ref={rootRef} className="landing" data-js-intro={intro ?? undefined}>
      {playing && <IntroSplash onDone={() => setIntro('done')} />}
      <LandingNav onStart={() => openStart()} returnPoint={returnPoint} inert={playing} />
      <main inert={playing}>
        <HeroSection onStart={() => openStart()} ready={!playing} />
        <FlowSection />
        <TeamSection />
        <RolesSection onStart={openStart} />
        <RecordSection />
        <ClosingSection onStart={openStart} />
      </main>
      <LandingFooter onStart={(roleId) => openStart('easy', roleId)} inert={playing} />
      <StartDialog
        open={start.open}
        initialDifficulty={start.difficulty}
        initialRole={start.roleId}
        onClose={() => setStart((current) => ({ ...current, open: false }))}
      />
    </div>
  );
}
