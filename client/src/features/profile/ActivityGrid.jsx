import { dayKey } from '../../lib/profile.js';

const WEEKS = 26;
const DAY_LABELS = ['', 'Mon', '', 'Wed', '', 'Fri', ''];
const LEVELS = ['bg-paper-3', 'bg-accent/35', 'bg-accent/65', 'bg-accent'];

/** A GitHub-style grid: one square per day for the last six months, darker for more tickets that day. */
export default function ActivityGrid({ days }) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  // Start on the Sunday that begins the earliest week shown.
  const start = new Date(today);
  start.setDate(start.getDate() - start.getDay() - (WEEKS - 1) * 7);

  const weeks = Array.from({ length: WEEKS }, (_, week) =>
    Array.from({ length: 7 }, (_, weekday) => {
      const date = new Date(start);
      date.setDate(start.getDate() + week * 7 + weekday);
      return date > today ? null : { date, count: days.get(dayKey(date)) ?? 0 };
    }),
  );

  return (
    <figure className="overflow-x-auto">
      <div className="inline-grid grid-flow-col gap-[3px]" style={{ gridTemplateRows: 'auto repeat(7, 14px)' }}>
        <span />
        {DAY_LABELS.map((label, index) => (
          <span key={index} className="pr-1.5 text-[10px] leading-[14px] text-faint">
            {label}
          </span>
        ))}
        {weeks.map((week, index) => (
          <WeekColumn key={index} week={week} showMonth={week[0]?.date.getDate() <= 7} />
        ))}
      </div>
      <figcaption className="mt-2 flex items-center justify-end gap-1 text-[11px] text-faint">
        Less
        {LEVELS.map((level) => (
          <span key={level} className={`size-[14px] rounded-[3px] ${level}`} aria-hidden />
        ))}
        More
      </figcaption>
    </figure>
  );
}

function WeekColumn({ week, showMonth }) {
  const month = week[0]?.date.toLocaleDateString('en-IN', { month: 'short' });
  return (
    <>
      <span className="h-4 text-[10px] text-faint">{showMonth ? month : ''}</span>
      {week.map((day, index) =>
        day ? (
          <span
            key={index}
            title={`${day.count} ${day.count === 1 ? 'ticket' : 'tickets'} on ${day.date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}`}
            className={`size-[14px] rounded-[3px] ${LEVELS[Math.min(day.count, 3)]}`}
          />
        ) : (
          <span key={index} />
        ),
      )}
    </>
  );
}
