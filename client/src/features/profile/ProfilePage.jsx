import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AppBar from '../../components/layout/AppBar.jsx';
import { ROLES } from '../../lib/constants.js';
import { badgesFor, levelFor, logOut, saveProfile, summarise, useProfile } from '../../lib/profile.js';
import ActivityGrid from './ActivityGrid.jsx';
import Badges from './Badges.jsx';
import ProfileBanner from './ProfileBanner.jsx';
import ScoreTrend from './ScoreTrend.jsx';
import TicketList from './TicketList.jsx';

const AVAILABLE_ROLES = ROLES.filter((role) => role.available);

/**
 * The student's profile: who they are, their level, streak and badges, a year of activity,
 * their score trend and every ticket they submitted. Everything is kept in this browser.
 */
export default function ProfilePage() {
  const { profile, history } = useProfile();
  const navigate = useNavigate();
  const [editing, setEditing] = useState(false);
  const [day, setDay] = useState(null);

  if (!profile || editing) {
    return (
      <Shell>
        <main className="mx-auto grid min-h-[calc(100dvh-3rem)] max-w-md place-items-center px-4 py-10">
          <ProfileForm profile={profile} onDone={() => setEditing(false)} />
        </main>
      </Shell>
    );
  }

  const stats = summarise(history);
  const level = levelFor(history);
  const badges = badgesFor(history, stats);
  const firstSeen = [profile.createdAt, ...history.map((entry) => entry.submittedAt)].sort()[0];
  const since = new Date(firstSeen).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' });

  function handleLogOut() {
    logOut();
    navigate('/');
  }

  return (
    <Shell>
      <main className="mx-auto grid w-full max-w-6xl grid-cols-[minmax(0,1fr)] gap-4 px-4 py-5 sm:px-6">
        <ProfileBanner
          profile={profile}
          stats={stats}
          level={level}
          since={since}
          onEdit={() => setEditing(true)}
          onLogOut={handleLogOut}
        />

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

/** Name, email and role. Used to create the profile and to edit it. */
export function ProfileForm({ profile, onDone }) {
  const [name, setName] = useState(profile?.name ?? '');
  const [email, setEmail] = useState(profile?.email ?? '');
  const [roleId, setRoleId] = useState(profile?.roleId ?? AVAILABLE_ROLES[0].id);

  function submit(event) {
    event.preventDefault();
    saveProfile({ name, email, roleId });
    onDone?.();
  }

  const input =
    'mt-1 h-11 w-full rounded-lg border border-line bg-paper-2 px-3 text-[15px] text-ink focus-visible:border-ink-3 focus-visible:outline-2 focus-visible:outline-accent';

  return (
    <form onSubmit={submit} className="w-full rounded-3xl border border-line bg-paper-2 p-6 shadow-[0_24px_48px_-32px] shadow-ink/40">
      <h1 className="font-display text-2xl font-semibold tracking-tight">{profile ? 'Edit profile' : 'Log in or create a profile'}</h1>
      <p className="mt-1 text-sm text-muted">
        {profile
          ? 'Saved in this browser. No password needed.'
          : 'No password needed. Use the same email as before to see your tickets again.'}
      </p>

      <label className="mt-5 block text-sm text-ink-2">
        Name
        <input className={input} required minLength={2} maxLength={60} autoComplete="name" value={name} onChange={(event) => setName(event.target.value)} />
      </label>
      <label className="mt-4 block text-sm text-ink-2">
        Email
        <input className={input} type="email" required maxLength={120} autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} />
      </label>

      <fieldset className="mt-4">
        <legend className="text-sm text-ink-2">Role</legend>
        <div className="mt-1 grid grid-cols-2 gap-2">
          {AVAILABLE_ROLES.map((role) => (
            <label
              key={role.id}
              className={`cursor-pointer rounded-lg border px-3 py-2.5 text-sm has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-accent ${
                roleId === role.id ? 'border-ink bg-paper text-ink' : 'border-line text-muted hover:border-ink-3'
              }`}
            >
              <input type="radio" name="role" value={role.id} checked={roleId === role.id} onChange={() => setRoleId(role.id)} className="sr-only" />
              {role.title}
            </label>
          ))}
        </div>
      </fieldset>

      <div className="mt-6 flex gap-2">
        <button
          type="submit"
          className="h-10 flex-1 rounded-lg bg-accent text-sm font-medium text-ink hover:bg-accent-strong focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink"
        >
          {profile ? 'Save' : 'Continue'}
        </button>
        {profile && (
          <button
            type="button"
            onClick={onDone}
            className="h-10 rounded-lg px-4 text-sm text-muted hover:bg-paper-3 focus-visible:outline-2 focus-visible:outline-accent"
          >
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}
