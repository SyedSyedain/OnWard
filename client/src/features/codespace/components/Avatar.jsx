const TINTS = {
  alex: 'bg-ink text-paper-2',
  sarah: 'bg-[oklch(42%_0.07_200)] text-paper-2',
  daniel: 'bg-[oklch(40%_0.08_300)] text-paper-2',
  manager: 'bg-accent text-ink',
  reviewer: 'bg-ink-3 text-paper-2',
};

export default function Avatar({ id, name, size = 'md' }) {
  const dimensions = size === 'sm' ? 'size-7 text-xs' : 'size-9 text-sm';
  return (
    <span
      className={`grid shrink-0 place-items-center rounded-full font-ui font-medium ${dimensions} ${TINTS[id] ?? TINTS.alex}`}
      aria-hidden
    >
      {name[0]}
    </span>
  );
}
