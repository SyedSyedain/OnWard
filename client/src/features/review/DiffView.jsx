/** Renders a unified diff with added and removed lines highlighted. */
export default function DiffView({ patch }) {
  if (!patch) {
    return <p className="text-sm text-slate-500">No files were changed.</p>;
  }

  const lines = patch.split('\n').filter((line) => !line.startsWith('====') && !line.startsWith('Index:'));

  return (
    <pre className="overflow-x-auto rounded-lg border border-slate-200 bg-slate-50 py-2 font-mono text-xs leading-5">
      {lines.map((line, index) => (
        <div key={index} className={`px-3 ${lineStyle(line)}`}>
          {line || ' '}
        </div>
      ))}
    </pre>
  );
}

function lineStyle(line) {
  if (line.startsWith('+++') || line.startsWith('---')) return 'font-semibold text-slate-700';
  if (line.startsWith('@@')) return 'text-blue-700';
  if (line.startsWith('+')) return 'bg-emerald-50 text-emerald-800';
  if (line.startsWith('-')) return 'bg-rose-50 text-rose-800';
  return 'text-slate-600';
}
