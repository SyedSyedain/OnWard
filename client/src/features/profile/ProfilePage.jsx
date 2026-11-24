import { Award, CheckCircle2, Flame, Gauge, Pencil, Play, Trophy, XCircle } from 'lucide-react';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import AppBar from '../../components/layout/AppBar.jsx';
import { Stat } from '../../components/score/ScoreVisuals.jsx';
import { DIFFICULTY_LABELS, ROLES } from '../../lib/constants.js';
import { initials, saveProfile, summarise, useProfile } from '../../lib/profile.js';
import ActivityGrid from './ActivityGrid.jsx';

const AVAILABLE_ROLES = ROLES.filter((role) => role.available);

/** The student's profile: who they are, their streak, their totals and every ticket they submitted. */
export default function ProfilePage() {
  const { profile, history } = useProfile();
  const [editing, setEditing] = useState(false);

  if (!profile || editing) {
    return (
      <Shell>
        <main className="mx-auto max-w-md px-4 py-10">
          <ProfileForm profile={profile} onDone={() => setEditing(false)} />
        </main>
      </Shell>
    );
  }

  const stats = summarise(history);
  const role = ROLES.find((item) => item.id === profile.roleId)?.title ?? profile.roleId;
  const since = new Date(profile.createdAt).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' });

  return (
    <Shell>
      <main className="mx-auto grid w-full max-w-6xl grid-cols-[minmax(0,1fr)] gap-4 px-4 py-5 sm:px-6 lg:min-h-0 lg:flex-1 lg:grid-cols-[300px_minmax(0,1fr)]">
        <section className="flex flex-col rounded-2xl border border-line bg-paper-2 p-6">
          <span className="grid size-20 place-items-center rounded-full bg-ink font-display text-2xl font-semibold text-paper-2">
            {initials(profile.name)}
          </span>
          <h1 className="mt-4 break-words font-display text-2xl font-semibold tracking-tight">{profile.name}</h1>
          <p className="truncate text-sm text-muted">{profile.email}</p>
          <p className="mt-3 inline-flex w-fit rounded-md bg-accent-soft px-2 py-0.5 text-sm">{role}</p>
          <p className="mt-2 text-xs text-faint">On OnWard since {since}</p>

          <div className="mt-6 grid gap-2">
            <Link
              to="/?start"
              className="flex h-10 items-center justify-center gap-2 rounded-lg bg-accent text-sm font-medium text-ink hover:bg-accent-strong focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink"
            >
              <Play className="size-4" aria-hidden /> Start a ticket
            </Link>
            <button
              type="button"
              onClick={() => setEditing(true)}
              className="flex h-10 items-center justify-center gap-2 rounded-lg border border-line bg-paper text-sm text-ink-2 hover:border-ink-3 focus-visible:outline-2 focus-visible:outline-accent"
            >
              <Pencil className="size-4" aria-hidden /> Edit profile
            </button>
          </div>
          <p className="mt-auto pt-6 text-xs leading-snug text-faint">
            Your profile and history are saved in this browser.
          </p>
        </section>

        <div className="grid min-w-0 min-h-0 grid-cols-[minmax(0,1fr)] content-start gap-4 lg:grid-rows-[auto_auto_minmax(0,1fr)]">
          <dl className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-6">
            <Stat icon={Flame} label="Day streak" value={stats.currentStreak} />
            <Stat icon={Trophy} label="Longest streak" value={stats.longestStreak} />
            <Stat icon={Play} label="Tickets" value={stats.tickets} />
            <Stat icon={CheckCircle2} label="Resolved" value={stats.resolved} />
            <Stat icon={Gauge} label="Average score" value={stats.average} />
            <Stat icon={Award} label="Best score" value={stats.best} />
          </dl>

          <section className="rounded-2xl border border-line bg-paper-2 p-4">
            <header className="mb-3 flex items-baseline gap-2">
              <h2 className="font-display text-base font-semibold">Activity</h2>
              <span className="text-sm text-muted">
                {stats.tickets} {stats.tickets === 1 ? 'ticket' : 'tickets'} in the last six months
              </span>
            </header>
            <ActivityGrid days={stats.days} />
          </section>

          <section className="flex min-h-[220px] flex-col rounded-2xl border border-line bg-paper-2 p-4 lg:min-h-0">
            <h2 className="mb-3 font-display text-base font-semibold">Tickets</h2>
            {history.length === 0 ? (
              <p className="m-auto max-w-[36ch] text-center text-sm text-muted">
                Submit your first ticket and it will show up here, with its score.
              </p>
            ) : (
              <ol className="-mx-1 min-h-0 flex-1 divide-y divide-line overflow-y-auto">
                {history.map((entry) => (
                  <HistoryRow key={entry.sessionId} entry={entry} />
                ))}
              </ol>
            )}
          </section>
        </div>
      </main>
    </Shell>
  );
}

function Shell({ children }) {
  return (
    <div className="min-h-dvh bg-paper font-ui text-ink lg:flex lg:h-dvh lg:flex-col">
      <AppBar note="Profile" />
      {children}
    </div>
  );
}

function HistoryRow({ entry }) {
  const date = new Date(entry.submittedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
  return (
    <li>
      <Link
        to={`/sessions/${entry.sessionId}/review`}
        className="flex items-center gap-3 rounded-lg px-1 py-2.5 hover:bg-paper-3/60 focus-visible:outline-2 focus-visible:outline-accent"
      >
        {entry.resolved ? (
          <CheckCircle2 className="size-4 shrink-0 text-ok" aria-label="Resolved" />
        ) : (
          <XCircle className="size-4 shrink-0 text-bad" aria-label="Not resolved" />
        )}
        <span className="shrink-0 rounded-md bg-ink px-1.5 py-0.5 font-mono text-[11px] text-paper-2">{entry.issueId}</span>
        <span className="min-w-0 flex-1">
          <span className="block truncate text-sm text-ink">{entry.title}</span>
          <span className="block truncate text-xs text-muted">
            {entry.simulationName}, {DIFFICULTY_LABELS[entry.difficulty]?.toLowerCase()}
          </span>
        </span>
        <span className="hidden text-xs text-muted sm:block">{date}</span>
        <span className="w-12 text-right font-display text-lg font-semibold tabular-nums">{entry.score.total}</span>
      </Link>
    </li>
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
    <form onSubmit={submit} className="rounded-2xl border border-line bg-paper-2 p-6">
      <h1 className="font-display text-2xl font-semibold tracking-tight">{profile ? 'Edit profile' : 'Create your profile'}</h1>
      <p className="mt-1 text-sm text-muted">Saved in this browser. No password needed.</p>

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
          {profile ? 'Save' : 'Create profile'}
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
