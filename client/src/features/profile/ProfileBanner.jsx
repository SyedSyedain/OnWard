import { CheckCircle2, Flame, Gauge, LogOut, Pencil, Play, Ticket, Trophy } from 'lucide-react';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useProgress } from '../../components/score/ScoreVisuals.jsx';
import { ROLES } from '../../lib/constants.js';
import { initials } from '../../lib/profile.js';

/**
 * The top of the profile: who you are, your level and streak, and your totals.
 * Log out asks once before it forgets the profile on this browser.
 */
export default function ProfileBanner({ profile, stats, level, since, onEdit, onLogOut }) {
  const [confirming, setConfirming] = useState(false);
  const role = ROLES.find((item) => item.id === profile.roleId)?.title ?? profile.roleId;
  const rate = stats.tickets ? Math.round((stats.resolved / stats.tickets) * 100) : 0;

  return (
    <section className="relative isolate overflow-hidden rounded-3xl bg-ink p-5 text-paper-2 sm:p-7">
      <span className="pointer-events-none absolute -right-24 -top-32 -z-10 size-96 rounded-full bg-accent/25 blur-3xl" aria-hidden />
      <span className="pointer-events-none absolute -bottom-40 left-1/3 -z-10 size-80 rounded-full bg-accent/10 blur-3xl" aria-hidden />

      <div className="flex flex-wrap items-center gap-5">
        <LevelAvatar name={profile.name} level={level} />
        <div className="min-w-0 flex-1">
          <h1 className="break-words font-display text-3xl font-semibold tracking-tight sm:text-4xl">{profile.name}</h1>
          <p className="truncate text-sm text-paper-2/60">{profile.email}</p>
          <p className="mt-2.5 flex flex-wrap gap-1.5 text-xs">
            <span className="rounded-full bg-accent px-2.5 py-1 font-medium text-ink">{role}</span>
            <span className="rounded-full bg-paper-2/10 px-2.5 py-1 text-paper-2/80">On OnWard since {since}</span>
          </p>
        </div>

        <div className="flex w-full flex-wrap items-center gap-2 sm:w-auto">
          {confirming ? (
            <div
              role="alertdialog"
              aria-label="Log out"
              className="flex flex-wrap items-center gap-2 rounded-2xl bg-paper-2/10 p-2 pl-3.5 animate-[fade-in_160ms_ease-out]"
            >
              <p className="max-w-[30ch] text-xs leading-snug text-paper-2/80">
                Your tickets stay saved for this email. Log back in with it to see them.
              </p>
              <button
                type="button"
                onClick={onLogOut}
                autoFocus
                className="h-9 rounded-full bg-paper-2 px-4 text-sm font-medium text-ink hover:bg-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
              >
                Log out
              </button>
              <button
                type="button"
                onClick={() => setConfirming(false)}
                className="h-9 rounded-full px-3 text-sm text-paper-2/70 hover:text-paper-2 focus-visible:outline-2 focus-visible:outline-accent"
              >
                Cancel
              </button>
            </div>
          ) : (
            <>
              <Link
                to="/?start"
                className="group flex h-10 flex-1 items-center justify-center gap-2 rounded-full bg-accent px-5 text-sm font-medium text-ink shadow-[0_10px_24px_-12px] shadow-accent transition-transform hover:-translate-y-0.5 hover:bg-accent-strong focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-paper-2 sm:flex-none"
              >
                <Play className="size-4 transition-transform group-hover:scale-110" aria-hidden /> Start a ticket
              </Link>
              <IconButton label="Edit profile" icon={Pencil} onClick={onEdit} />
              <IconButton label="Log out" icon={LogOut} onClick={() => setConfirming(true)} />
            </>
          )}
        </div>
      </div>

      <dl className="mt-6 grid grid-cols-2 gap-2.5 sm:grid-cols-3 lg:grid-cols-7">
        <div className="col-span-2 flex flex-col-reverse rounded-2xl bg-paper-2/[0.06] p-4 ring-1 ring-paper-2/10 sm:col-span-3 lg:col-span-2">
          <dt className="mt-3">
            <XpBar level={level} />
          </dt>
          <dd className="flex items-baseline gap-2">
            <span className="font-display text-2xl font-semibold">{level.title}</span>
            <span className="text-sm text-paper-2/60">Level {level.level}</span>
          </dd>
        </div>
        <StreakTile current={stats.currentStreak} longest={stats.longestStreak} />
        <Tile icon={Ticket} label="Tickets" value={stats.tickets} />
        <Tile icon={CheckCircle2} label={`Resolved, ${rate}%`} value={stats.resolved} />
        <Tile icon={Gauge} label="Average score" value={stats.average} />
        <Tile icon={Trophy} label="Best score" value={stats.best} />
      </dl>
    </section>
  );
}

/** The initials inside a ring that fills with progress towards the next level. */
function LevelAvatar({ name, level }) {
  const progress = useProgress(1100, 200);
  const radius = 46;
  const circumference = 2 * Math.PI * radius;
  return (
    <div className="relative size-[104px] shrink-0">
      <svg viewBox="0 0 104 104" className="size-full -rotate-90" aria-hidden>
        <circle cx="52" cy="52" r={radius} fill="none" strokeWidth="5" className="stroke-paper-2/10" />
        <circle
          cx="52"
          cy="52"
          r={radius}
          fill="none"
          strokeWidth="5"
          strokeLinecap="round"
          className="stroke-accent"
          strokeDasharray={circumference}
          strokeDashoffset={circumference * (1 - (level.into / level.span) * progress)}
        />
      </svg>
      <span className="absolute inset-[11px] grid place-items-center rounded-full bg-paper-2 font-display text-3xl font-semibold text-ink">
        {initials(name)}
      </span>
      <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 rounded-full bg-accent px-2 py-0.5 text-[11px] font-semibold text-ink ring-4 ring-ink">
        Lv {level.level}
      </span>
    </div>
  );
}

function XpBar({ level }) {
  const progress = useProgress(1100, 300);
  return (
    <span className="block">
      <span className="block h-2 overflow-hidden rounded-full bg-paper-2/10" aria-hidden>
        <span
          className="block h-full origin-left rounded-full bg-gradient-to-r from-accent/70 to-accent"
          style={{ transform: `scaleX(${(level.into / level.span) * progress})` }}
        />
      </span>
      <span className="mt-1.5 flex justify-between text-xs text-paper-2/60">
        <span>
          {level.into} / {level.span} XP
        </span>
        <span>{level.toNext} XP to level {level.level + 1}</span>
      </span>
    </span>
  );
}

function StreakTile({ current, longest }) {
  const shown = Math.round(current * useProgress(900, 200));
  return (
    <div className="group col-span-2 flex flex-col-reverse rounded-2xl bg-accent/15 p-4 sm:col-span-1 ring-1 ring-accent/30 transition-colors hover:bg-accent/20">
      <dt className="mt-1 text-xs text-paper-2/70">
        Day streak, best {longest}
      </dt>
      <dd className="flex items-center gap-2 font-display text-3xl font-semibold tabular-nums leading-none">
        <Flame
          className={`size-6 text-accent ${current > 0 ? 'motion-safe:animate-[flicker_1.6s_ease-in-out_infinite]' : 'opacity-50'}`}
          aria-hidden
        />
        {shown}
      </dd>
    </div>
  );
}

function Tile({ icon: Icon, label, value }) {
  const shown = Math.round(value * useProgress(900, 200));
  return (
    <div className="flex flex-col-reverse rounded-2xl bg-paper-2/[0.06] p-4 ring-1 ring-paper-2/10 transition-colors hover:bg-paper-2/10">
      <dt className="mt-1 text-xs text-paper-2/60">{label}</dt>
      <dd className="flex items-center gap-2 font-display text-3xl font-semibold tabular-nums leading-none">
        <Icon className="size-5 text-paper-2/40" aria-hidden />
        {shown}
      </dd>
    </div>
  );
}

function IconButton({ label, icon: Icon, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={label}
      className="flex h-10 items-center gap-2 rounded-full bg-paper-2/10 px-4 text-sm text-paper-2/85 transition-colors hover:bg-paper-2/20 hover:text-paper-2 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
    >
      <Icon className="size-4" aria-hidden />
      <span>{label}</span>
    </button>
  );
}
