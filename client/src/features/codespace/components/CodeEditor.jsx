import Editor from '@monaco-editor/react';
import { useRef } from 'react';

const LANGUAGES = { js: 'javascript', json: 'json', md: 'markdown' };

/** Monaco colours for the OnWard light theme (Monaco needs hex values). */
const THEME = {
  base: 'vs',
  inherit: true,
  rules: [
    { token: 'comment', foreground: '8a8178', fontStyle: 'italic' },
    { token: 'keyword', foreground: 'b4470a' },
    { token: 'string', foreground: '2f7a4f' },
    { token: 'number', foreground: '7a4fb4' },
  ],
  colors: {
    'editor.background': '#fdfcfa',
    'editor.lineHighlightBackground': '#f6f1ea',
    'editorLineNumber.foreground': '#b9b0a5',
    'editorLineNumber.activeForeground': '#16120f',
    'editor.selectionBackground': '#fbd9c2',
    'editorCursor.foreground': '#e8650a',
    'editorIndentGuide.background1': '#efe9e1',
    'editorWidget.background': '#fdfcfa',
  },
};

/**
 * Monaco, one model per file so each tab keeps its own undo history.
 * - Cmd/Ctrl+S calls `onSave`.
 * - `onReady(editor, monaco)` hands the instance to the toolbar and the Problems list.
 * Only syntax errors are reported: the in-browser editor cannot resolve the project's packages,
 * so type checking would show errors that are not real.
 */
export default function CodeEditor({ path, value, wordWrap, simple = false, onChange, onSave, onReady }) {
  const onSaveRef = useRef(onSave);
  onSaveRef.current = onSave;

  function handleBeforeMount(monaco) {
    monaco.editor.defineTheme('onward', THEME);
    monaco.languages.typescript.javascriptDefaults.setDiagnosticsOptions({
      noSemanticValidation: true,
      noSyntaxValidation: false,
    });
  }

  function handleMount(editor, monaco) {
    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS, () => onSaveRef.current());
    onReady?.(editor, monaco);
  }

  return (
    <Editor
      path={path}
      value={value}
      language={LANGUAGES[path.split('.').pop()] ?? 'plaintext'}
      theme="onward"
      beforeMount={handleBeforeMount}
      onMount={handleMount}
      onChange={(next) => onChange(next ?? '')}
      loading={<p className="p-4 font-ui text-sm text-muted">Loading the editor…</p>}
      options={{
        fontFamily: 'JetBrains Mono, monospace',
        fontSize: simple ? 14 : 13,
        lineHeight: simple ? 23 : 21,
        folding: true,
        showFoldingControls: 'always',
        minimap: { enabled: false },
        scrollBeyondLastLine: false,
        tabSize: 2,
        wordWrap: wordWrap ? 'on' : 'off',
        padding: { top: 12, bottom: 12 },
        renderLineHighlight: 'line',
        smoothScrolling: true,
        automaticLayout: true,
      }}
    />
  );
}
