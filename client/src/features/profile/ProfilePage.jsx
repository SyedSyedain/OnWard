import { useState } from 'react';
import AppBar from '../../components/layout/AppBar.jsx';
import { badgesFor, guestProfile, levelFor, summarise, useProfile } from '../../lib/profile.js';
import ActivityGrid from './ActivityGrid.jsx';
import Badges from './Badges.jsx';
import ProfileBanner from './ProfileBanner.jsx';
import ScoreTrend from './ScoreTrend.jsx';
import TicketList from './TicketList.jsx';

/**
 * The student's profile: their level, streak and badges, a year of activity, their score trend
 * and every ticket they submitted. No sign-in: it is built from the tickets kept in this browser.
 */
export default function ProfilePage() {
  const { profile: saved, history } = useProfile();
  const profile = saved ?? guestProfile(history);
  const [day, setDay] = useState(null);

  const stats = summarise(history);
  const level = levelFor(history);
  const badges = badgesFor(history, stats);
  const since = new Date(profile.createdAt).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' });

  return (
    <Shell>
      <main className="mx-auto grid w-full max-w-6xl grid-cols-[minmax(0,1fr)] gap-4 px-4 py-5 sm:px-6">
        <ProfileBanner profile={profile} stats={stats} level={level} since={since} />

        <div className="grid grid-cols-[minmax(0,1fr)] gap-4 lg:grid-cols-[minmax(0,1fr)_340px]">
          <div className="flex min-w-0 flex-col gap-4">
            <section className="rounded-2xl border border-line bg-paper-2 p-4">
              <header className="mb-3 flex items-baseline gap-2">
                <h2 className="font-display text-base font-semibold">Activity</h2>
                <span className="text-sm text-muted">
                  {stats.tickets} {stats.tickets === 1 ? 'ticket' : 'tickets'} so far
                </span>
              </header>
              <ActivityGrid days={stats.days} selected={day} onSelect={setDay} />
            </section>
            <TicketList history={history} day={day} onClearDay={() => setDay(null)} />
          </div>

          <div className="grid min-w-0 grid-cols-[minmax(0,1fr)] content-start gap-4 sm:grid-cols-2 lg:grid-cols-[minmax(0,1fr)]">
            <Badges badges={badges} />
            <ScoreTrend history={history} />
          </div>
        </div>
      </main>
    </Shell>
  );
}

function Shell({ children }) {
  return (
    <div className="min-h-dvh bg-paper font-ui text-ink">
      <AppBar note="Profile" />
      {children}
    </div>
  );
}
