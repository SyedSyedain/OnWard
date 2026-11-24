/** Renders a unified diff with added and removed lines highlighted. */
export default function DiffView({ patch }) {
  if (!patch) {
    return <p className="text-sm text-muted">No files were changed.</p>;
  }

  const lines = patch.split('\n').filter((line) => !line.startsWith('====') && !line.startsWith('Index:'));

  return (
    <pre className="overflow-x-auto rounded-xl border border-line bg-paper py-2 font-mono text-xs leading-5">
      {lines.map((line, index) => (
        <div key={index} className={`px-3 ${lineStyle(line)}`}>
          {line || ' '}
        </div>
      ))}
    </pre>
  );
}

function lineStyle(line) {
  if (line.startsWith('+++') || line.startsWith('---')) return 'font-semibold text-ink';
  if (line.startsWith('@@')) return 'text-muted';
  if (line.startsWith('+')) return 'bg-ok-soft text-ok';
  if (line.startsWith('-')) return 'bg-bad-soft text-bad';
  return 'text-ink-2';
}
