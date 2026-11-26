import { CheckCircle2, Flame, Layers, Lock, Mountain, Rocket, Target, Trophy, UserCheck } from 'lucide-react';
import { useState } from 'react';

const ICONS = {
  first: Rocket,
  fix: CheckCircle2,
  streak: Flame,
  sharp: Target,
  solo: UserCheck,
  deep: Mountain,
  stack: Layers,
  ten: Trophy,
};

/** Eight badges. Pick one to see what it takes and how close you are. */
export default function Badges({ badges }) {
  const firstToEarn = badges.find((badge) => !badge.earned) ?? badges[0];
  const [selectedId, setSelectedId] = useState(firstToEarn.id);
  const selected = badges.find((badge) => badge.id === selectedId) ?? firstToEarn;
  const earned = badges.filter((badge) => badge.earned).length;
  const percent = Math.round((selected.have / selected.need) * 100);

  return (
    <section className="rounded-2xl border border-line bg-paper-2 p-4">
      <header className="mb-3 flex items-baseline justify-between gap-2">
        <h2 className="font-display text-base font-semibold">Badges</h2>
        <span className="text-xs text-muted">
          {earned} of {badges.length} earned
        </span>
      </header>

      <div className="grid grid-cols-4 gap-2" role="group" aria-label="Badges">
        {badges.map((badge) => {
          const Icon = ICONS[badge.id];
          const isSelected = badge.id === selected.id;
          return (
            <button
              key={badge.id}
              type="button"
              aria-pressed={isSelected}
              onClick={() => setSelectedId(badge.id)}
              onMouseEnter={() => setSelectedId(badge.id)}
              className={`group flex flex-col items-center gap-1.5 rounded-xl px-1 py-2.5 transition-colors focus-visible:outline-2 focus-visible:outline-accent ${
                isSelected ? 'bg-paper-3' : 'hover:bg-paper-3/60'
              }`}
            >
              <span
                className={`relative grid size-11 place-items-center rounded-full transition-transform group-hover:-translate-y-0.5 group-hover:rotate-[-6deg] ${
                  badge.earned ? 'bg-accent text-ink shadow-[0_8px_18px_-10px] shadow-accent' : 'bg-paper-3 text-faint'
                }`}
              >
                <Icon className="size-5" aria-hidden />
                {!badge.earned && (
                  <Lock className="absolute -bottom-0.5 -right-0.5 size-4 rounded-full bg-paper-2 p-0.5 text-muted" aria-hidden />
                )}
              </span>
              <span className={`text-center text-[11px] leading-tight ${badge.earned ? 'text-ink' : 'text-muted'}`}>
                {badge.name}
              </span>
            </button>
          );
        })}
      </div>

      <div className="mt-3 rounded-xl bg-paper p-3" aria-live="polite">
        <p className="flex items-center justify-between gap-2 text-sm">
          <span className="font-medium text-ink">{selected.name}</span>
          <span className={`text-xs ${selected.earned ? 'text-ok' : 'text-muted'}`}>
            {selected.earned ? 'Earned' : `${selected.have} of ${selected.need}`}
          </span>
        </p>
        <p className="mt-0.5 text-xs text-muted">{selected.goal}.</p>
        <span className="mt-2 block h-1.5 overflow-hidden rounded-full bg-paper-3" aria-hidden>
          <span
            className={`block h-full origin-left rounded-full transition-transform duration-500 ${selected.earned ? 'bg-ok' : 'bg-accent'}`}
            style={{ transform: `scaleX(${percent / 100})` }}
          />
        </span>
      </div>
    </section>
  );
}
