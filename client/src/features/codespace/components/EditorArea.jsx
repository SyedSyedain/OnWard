import { ChevronRight, Search, Sparkles, WrapText, X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import CodeEditor from './CodeEditor.jsx';
import FileIcon from './FileIcon.jsx';

/**
 * Tabs for the open files, a breadcrumb and a few editor controls, over Monaco.
 * `files` comes from useOpenFiles.
 */
export default function EditorArea({ files, onEditorReady, issues = new Map(), simple = false, onToggleSimple }) {
  const { tabs, activeTab, setActivePath, closeTab, setContent, saveAll } = files;
  const editorRef = useRef(null);
  const [wrap, setWrap] = useState(false);

  function handleReady(editor, monaco) {
    editorRef.current = editor;
    onEditorReady?.(editor, monaco);
  }

  // Simple view folds the long comment blocks so only the code itself is in view.
  useEffect(() => {
    const timer = setTimeout(() => {
      const editor = editorRef.current;
      if (!editor) return;
      editor.getAction(simple ? 'editor.foldAllBlockComments' : 'editor.unfoldAll')?.run();
    }, 120);
    return () => clearTimeout(timer);
  }, [simple, activeTab?.path, files.revision]);

  function runEditorAction(id) {
    const editor = editorRef.current;
    if (!editor) return;
    editor.focus();
    editor.getAction(id)?.run();
  }

  return (
    <section className="flex min-h-0 min-w-0 flex-1 flex-col bg-paper-2" aria-label="Editor">
      <div className="flex h-10 shrink-0 items-stretch border-b border-line bg-paper">
        <div role="tablist" aria-label="Open files" className="flex min-w-0 flex-1 overflow-x-auto">
          {tabs.map((tab) => {
            const active = tab.path === activeTab?.path;
            const unsaved = tab.content !== tab.saved;
            const name = tab.path.split('/').pop();
            const issue = issues.get(tab.path);
            return (
              <div
                key={tab.path}
                className={`group relative flex shrink-0 items-center border-r border-line ${
                  active ? 'bg-paper-2 text-ink' : 'text-muted hover:bg-paper-3/50'
                }`}
              >
                {active && <span className="absolute inset-x-0 top-0 h-0.5 bg-accent" aria-hidden />}
                <button
                  type="button"
                  role="tab"
                  aria-selected={active}
                  title={tab.path}
                  onClick={() => setActivePath(tab.path)}
                  onAuxClick={(event) => event.button === 1 && closeTab(tab.path)}
                  className="flex h-full items-center gap-1.5 pl-3 pr-1 font-ui text-[13px] focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-accent"
                >
                  <FileIcon path={tab.path} className="size-3.5 text-muted" />
                  <span className={issue ? (issue.severity === 'error' ? 'text-bad' : 'text-warn') : ''}>{name}</span>
                  {issue && (
                    <span
                      className={`font-mono text-[11px] font-semibold ${issue.severity === 'error' ? 'text-bad' : 'text-warn'}`}
                      title={`${issue.count} ${issue.count === 1 ? 'problem' : 'problems'} in this file`}
                    >
                      {issue.count}
                    </span>
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => closeTab(tab.path)}
                  aria-label={unsaved ? `Close ${name} (unsaved changes will be saved)` : `Close ${name}`}
                  className="mr-1.5 grid size-5 place-items-center rounded text-faint hover:bg-paper-3 hover:text-ink focus-visible:outline-2 focus-visible:outline-accent"
                >
                  {unsaved ? <span className="size-2 rounded-full bg-accent group-hover:hidden" aria-hidden /> : null}
                  <X className={`size-3.5 ${unsaved ? 'hidden group-hover:block' : ''}`} aria-hidden />
                </button>
              </div>
            );
          })}
        </div>

        <div className="flex shrink-0 items-center gap-0.5 px-2" role="toolbar" aria-label="Editor controls">
          {onToggleSimple && (
            <button
              type="button"
              aria-pressed={simple}
              onClick={onToggleSimple}
              title={simple ? 'Show every file and comment' : 'Show only the ticket’s files, comments folded'}
              className={`mr-1 h-7 rounded-md px-2.5 font-ui text-xs font-medium transition-colors focus-visible:outline-2 focus-visible:outline-accent ${
                simple ? 'bg-ink text-paper-2' : 'border border-line text-ink-2 hover:bg-paper-3'
              }`}
            >
              Simple
            </button>
          )}
          <ToolButton label="Find in file" onClick={() => runEditorAction('actions.find')} disabled={!activeTab}>
            <Search className="size-4" aria-hidden />
          </ToolButton>
          <ToolButton
            label="Format document"
            onClick={() => runEditorAction('editor.action.formatDocument')}
            disabled={!activeTab}
          >
            <Sparkles className="size-4" aria-hidden />
          </ToolButton>
          <ToolButton label="Word wrap" pressed={wrap} onClick={() => setWrap((value) => !value)} disabled={!activeTab}>
            <WrapText className="size-4" aria-hidden />
          </ToolButton>
        </div>
      </div>

      {activeTab ? (
        <>
          <nav
            aria-label="File path"
            className="flex h-7 shrink-0 items-center gap-1 border-b border-line/70 px-3 font-ui text-xs text-muted"
          >
            {activeTab.path.split('/').map((part, index, parts) => (
              <span key={index} className="flex items-center gap-1">
                {index > 0 && <ChevronRight className="size-3 text-faint" aria-hidden />}
                <span className={index === parts.length - 1 ? 'text-ink' : ''}>{part}</span>
              </span>
            ))}
          </nav>
          <div className="min-h-0 flex-1">
            <CodeEditor
              path={activeTab.path}
              value={activeTab.content}
              wordWrap={wrap}
              simple={simple}
              onChange={(next) => setContent(activeTab.path, next)}
              onSave={() => saveAll().catch(() => {})}
              onReady={handleReady}
            />
          </div>
        </>
      ) : (
        <div className="grid flex-1 place-items-center p-6 text-center font-ui text-sm text-muted">
          <p>
            Open a file from the project explorer.
            <br />
            The ticket lists where to start.
          </p>
        </div>
      )}
    </section>
  );
}

function ToolButton({ label, pressed, children, ...props }) {
  return (
    <button
      type="button"
      title={label}
      aria-label={label}
      aria-pressed={pressed}
      className={`grid size-7 place-items-center rounded-md transition-colors disabled:opacity-40 focus-visible:outline-2 focus-visible:outline-accent ${
        pressed ? 'bg-ink text-paper-2' : 'text-muted hover:bg-paper-3 hover:text-ink'
      }`}
      {...props}
    >
      {children}
    </button>
  );
}
