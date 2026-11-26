import { useEffect, useRef, useState } from 'react';
import { dayKey } from '../../lib/profile.js';

const CELL = 13;
const GAP = 3;
const MAX_WEEKS = 53;
const DAY_LABELS = ['', 'Mon', '', 'Wed', '', 'Fri', ''];
const LEVELS = ['bg-paper-3', 'bg-accent/35', 'bg-accent/65', 'bg-accent'];

/**
 * A GitHub-style grid: one square per day, darker for more tickets that day. It shows as many weeks
 * as fit the card (up to a year), so it always fills the width. Hover or focus a day to see it;
 * click a day with tickets to filter the ticket list to it.
 */
export default function ActivityGrid({ days, selected, onSelect }) {
  const wrapRef = useRef(null);
  const [weeksShown, setWeeksShown] = useState(26);
  const [hovered, setHovered] = useState(null);

  useEffect(() => {
    const wrap = wrapRef.current;
    if (!wrap) return undefined;
    const measure = () => {
      const fit = Math.floor((wrap.clientWidth - 28) / (CELL + GAP));
      setWeeksShown(Math.max(10, Math.min(MAX_WEEKS, fit)));
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(wrap);
    return () => observer.disconnect();
  }, []);

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const start = new Date(today);
  start.setDate(start.getDate() - start.getDay() - (weeksShown - 1) * 7);

  const weeks = Array.from({ length: weeksShown }, (_, week) =>
    Array.from({ length: 7 }, (_, weekday) => {
      const date = new Date(start);
      date.setDate(start.getDate() + week * 7 + weekday);
      return date > today ? null : { date, key: dayKey(date), count: days.get(dayKey(date)) ?? 0 };
    }),
  );
  const todayKey = dayKey(today);

  return (
    <figure ref={wrapRef} className="relative">
      <div
        className="grid grid-flow-col justify-between"
        style={{
          gridTemplateRows: `16px repeat(7, ${CELL}px)`,
          gridTemplateColumns: `28px repeat(${weeksShown}, ${CELL}px)`,
          rowGap: GAP,
        }}
        onMouseLeave={() => setHovered(null)}
      >
        <span />
        {DAY_LABELS.map((label, index) => (
          <span key={index} className="text-[10px] leading-[13px] text-faint">
            {label}
          </span>
        ))}
        {weeks.map((week, index) => (
          <WeekColumn
            key={index}
            week={week}
            showMonth={week[0]?.date.getDate() <= 7}
            todayKey={todayKey}
            selected={selected}
            onHover={setHovered}
            onSelect={onSelect}
          />
        ))}
      </div>

      <figcaption className="mt-3 flex min-h-5 flex-wrap items-center justify-between gap-2 text-[11px] text-faint">
        <span className="text-xs text-muted" aria-live="polite">
          {hovered ? (
            <>
              <span className="font-medium text-ink">
                {hovered.count} {hovered.count === 1 ? 'ticket' : 'tickets'}
              </span>{' '}
              on {hovered.date.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' })}
            </>
          ) : (
            'Point at a day to see it. Click one with tickets to filter the list.'
          )}
        </span>
        <span className="flex items-center gap-1">
          Less
          {LEVELS.map((level) => (
            <span key={level} className={`size-[11px] rounded-[3px] ${level}`} aria-hidden />
          ))}
          More
        </span>
      </figcaption>
    </figure>
  );
}

function WeekColumn({ week, showMonth, todayKey, selected, onHover, onSelect }) {
  const month = week[0]?.date.toLocaleDateString('en-IN', { month: 'short' });
  return (
    <>
      <span className="whitespace-nowrap text-[10px] leading-4 text-faint">{showMonth ? month : ''}</span>
      {week.map((day, index) => {
        if (!day) return <span key={index} />;
        const active = day.count > 0;
        const label = `${day.count} ${day.count === 1 ? 'ticket' : 'tickets'} on ${day.date.toLocaleDateString('en-IN', {
          day: 'numeric',
          month: 'short',
        })}`;
        return (
          <button
            key={index}
            type="button"
            aria-label={label}
            aria-pressed={active ? selected === day.key : undefined}
            tabIndex={active ? 0 : -1}
            onMouseEnter={() => onHover(day)}
            onFocus={() => onHover(day)}
            onClick={() => active && onSelect(selected === day.key ? null : day.key)}
            className={`rounded-[3px] transition-transform duration-150 hover:scale-[1.35] focus-visible:scale-[1.35] focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-ink ${
              LEVELS[Math.min(day.count, 3)]
            } ${active ? 'cursor-pointer' : 'cursor-default'} ${
              selected === day.key ? 'ring-2 ring-ink ring-offset-1 ring-offset-paper-2' : ''
            } ${day.key === todayKey && !active ? 'ring-1 ring-accent/60' : ''}`}
          />
        );
      })}
    </>
  );
}
