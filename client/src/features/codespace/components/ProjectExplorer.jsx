import { ChevronRight, Folder, FolderOpen } from 'lucide-react';
import { useMemo, useState } from 'react';
import FileIcon from './FileIcon.jsx';

/** Turns ["src/a.js", "src/lib/b.js"] into nested folders, folders first, alphabetical. */
function buildTree(paths) {
  const root = { path: '', folders: new Map(), files: [] };
  for (const path of paths) {
    const parts = path.split('/');
    let node = root;
    parts.slice(0, -1).forEach((name, index) => {
      if (!node.folders.has(name)) {
        node.folders.set(name, { path: parts.slice(0, index + 1).join('/'), folders: new Map(), files: [] });
      }
      node = node.folders.get(name);
    });
    node.files.push({ name: parts.at(-1), path });
  }
  return root;
}

/** Folders that lead to the given files, so the ticket's files are visible on arrival. */
function foldersLeadingTo(paths) {
  const open = new Set();
  for (const path of paths) {
    const parts = path.split('/');
    for (let index = 1; index < parts.length; index += 1) open.add(parts.slice(0, index).join('/'));
  }
  return open;
}

/**
 * The project's real file tree. Folders expand and collapse; files open in a tab.
 * `changed` marks files that differ from the original project, `dirty` marks unsaved edits.
 */
export default function ProjectExplorer({ projectName, files, activePath, changed, dirty, revealPaths, onOpen }) {
  const tree = useMemo(() => buildTree(files), [files]);
  const [open, setOpen] = useState(() => foldersLeadingTo(revealPaths));

  function toggle(path) {
    setOpen((current) => {
      const next = new Set(current);
      if (next.has(path)) next.delete(path);
      else next.add(path);
      return next;
    });
  }

  return (
    <nav aria-label="Project files" className="font-ui text-[13px]">
      <p className="flex items-center gap-1.5 px-3 pb-1.5 pt-1 text-xs font-medium text-muted">
        <FolderOpen className="size-3.5" aria-hidden />
        {projectName}
      </p>
      {files.length === 0 ? (
        <p className="px-3 py-2 text-xs text-faint">Loading files…</p>
      ) : (
        <TreeLevel
          node={tree}
          depth={0}
          open={open}
          onToggle={toggle}
          activePath={activePath}
          changed={changed}
          dirty={dirty}
          onOpen={onOpen}
        />
      )}
    </nav>
  );
}

function TreeLevel({ node, depth, open, onToggle, activePath, changed, dirty, onOpen }) {
  const indent = { paddingLeft: `${depth * 14 + 10}px` };
  const folders = [...node.folders.entries()].sort(([a], [b]) => a.localeCompare(b));
  const files = [...node.files].sort((a, b) => a.name.localeCompare(b.name));

  return (
    <ul role={depth === 0 ? 'tree' : 'group'}>
      {folders.map(([name, child]) => {
        const expanded = open.has(child.path);
        return (
          <li key={child.path} role="treeitem" aria-expanded={expanded}>
            <button
              type="button"
              style={indent}
              onClick={() => onToggle(child.path)}
              className="flex h-7 w-full items-center gap-1.5 pr-2 text-left text-ink-2 hover:bg-paper-3/60 focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-accent"
            >
              <ChevronRight
                className={`size-3.5 shrink-0 text-faint transition-transform duration-150 ${expanded ? 'rotate-90' : ''}`}
                aria-hidden
              />
              {expanded ? (
                <FolderOpen className="size-3.5 shrink-0 text-accent-strong" aria-hidden />
              ) : (
                <Folder className="size-3.5 shrink-0 text-accent-strong" aria-hidden />
              )}
              <span className="truncate">{name}</span>
            </button>
            {expanded && (
              <TreeLevel
                node={child}
                depth={depth + 1}
                open={open}
                onToggle={onToggle}
                activePath={activePath}
                changed={changed}
                dirty={dirty}
                onOpen={onOpen}
              />
            )}
          </li>
        );
      })}
      {files.map((file) => {
        const active = file.path === activePath;
        const state = dirty.has(file.path) ? 'unsaved' : changed.has(file.path) ? 'modified' : null;
        return (
          <li key={file.path} role="treeitem" aria-selected={active}>
            <button
              type="button"
              style={{ paddingLeft: `${depth * 14 + 30}px` }}
              onClick={() => onOpen(file.path)}
              className={`flex h-7 w-full items-center gap-1.5 pr-3 text-left focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-accent ${
                active ? 'bg-accent-soft font-medium text-ink' : 'text-ink-2 hover:bg-paper-3/60'
              }`}
            >
              <FileIcon path={file.path} className="size-3.5 text-muted" />
              <span className="min-w-0 flex-1 truncate">{file.name}</span>
              {state && (
                <span
                  className={`font-mono text-[11px] ${state === 'unsaved' ? 'text-accent-strong' : 'text-warn'}`}
                  title={state === 'unsaved' ? 'Unsaved changes' : 'Changed from the original project'}
                >
                  {state === 'unsaved' ? '●' : 'M'}
                </span>
              )}
            </button>
          </li>
        );
      })}
    </ul>
  );
}
