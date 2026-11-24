import { useCallback, useRef, useState } from 'react';

const PROMPT = 'shopsphere $';
const MAX_LINES = 400;

export const TERMINAL_HELP = [
  'Commands in this workspace:',
  '  npm test          run the project tests and the ticket’s hidden checks',
  '  ls [folder]       list project files',
  '  cat <file>        print a file',
  '  open <file>       open a file in the editor',
  '  git status        list files you have changed',
  '  clear             clear the terminal',
  'This is not a shell: your code only runs inside the isolated test runner.',
];

/**
 * A small command line over the workspace. Each command calls a real action
 * (the test runner, the file API, the change list); anything else is refused
 * plainly rather than pretending to run.
 *
 * `actions` = { runTests, files, readFile, openFile, listChanges }
 */
export function useTerminal(actions) {
  const [lines, setLines] = useState(() => [
    { kind: 'info', text: 'Workspace ready. Type “help” for commands, or “npm test” to run the tests.' },
  ]);
  const [busy, setBusy] = useState(false);
  const history = useRef([]);
  const actionsRef = useRef(actions);
  actionsRef.current = actions;

  const print = useCallback((entries) => {
    const list = Array.isArray(entries) ? entries : [entries];
    setLines((current) => [...current, ...list].slice(-MAX_LINES));
  }, []);

  const run = useCallback(
    async (input) => {
      const command = input.trim();
      if (!command) return;
      history.current.push(command);
      print({ kind: 'command', text: `${PROMPT} ${command}` });

      const [name, ...args] = command.split(/\s+/);
      const target = args.join(' ');
      const { runTests, files, readFile, openFile, listChanges } = actionsRef.current;

      if (name === 'clear') {
        setLines([]);
        return;
      }

      setBusy(true);
      try {
        if (name === 'help') {
          print(TERMINAL_HELP.map((text) => ({ kind: 'info', text })));
        } else if (['npm test', 'npm run test', 'node --test'].some((alias) => command.startsWith(alias))) {
          await runTests();
        } else if (name === 'ls') {
          const prefix = target ? `${target.replace(/\/$/, '')}/` : '';
          const entries = listFolder(files, prefix);
          print(
            entries.length
              ? entries.map((text) => ({ kind: 'out', text }))
              : { kind: 'error', text: `ls: ${target}: no such folder` },
          );
        } else if (name === 'cat' || name === 'open') {
          if (!files.includes(target)) {
            print({ kind: 'error', text: `${name}: ${target || '(no file)'}: no such file` });
          } else if (name === 'open') {
            openFile(target);
            print({ kind: 'info', text: `Opened ${target} in the editor.` });
          } else {
            const content = await readFile(target);
            print(content.split('\n').map((text) => ({ kind: 'out', text })));
          }
        } else if (command === 'git status') {
          const changed = await listChanges();
          print(
            changed.length
              ? [
                  { kind: 'info', text: 'Changes compared with the original project:' },
                  ...changed.map((file) => ({ kind: 'warn', text: `  modified:   ${file}` })),
                ]
              : { kind: 'info', text: 'Nothing changed yet.' },
          );
        } else {
          print({
            kind: 'error',
            text: `${name}: not available here. Type “help” for the commands this workspace supports.`,
          });
        }
      } catch (error) {
        print({ kind: 'error', text: error.message });
      } finally {
        setBusy(false);
      }
    },
    [print],
  );

  return { lines, print, run, busy, history: history.current, prompt: PROMPT };
}

/** Immediate children of a folder: sub-folders end with "/". */
function listFolder(files, prefix) {
  const children = new Set();
  for (const file of files) {
    if (!file.startsWith(prefix)) continue;
    const rest = file.slice(prefix.length);
    const [head, ...tail] = rest.split('/');
    children.add(tail.length ? `${head}/` : head);
  }
  return [...children].sort();
}

/** Terminal lines describing a finished test run. */
export function describeTestRun(result) {
  const lines = [];
  if (result.status === 'syntax_error') {
    lines.push({ kind: 'error', text: 'Tests did not run: a file has a syntax error.' });
    result.syntaxErrors.forEach((error) => lines.push({ kind: 'error', text: `  ${error.file}: ${error.message}` }));
    return lines;
  }
  if (result.status === 'timed_out') lines.push({ kind: 'error', text: 'The run timed out and was stopped.' });
  if (result.status === 'load_error') lines.push({ kind: 'error', text: 'The tests could not load your code.' });

  result.tests.forEach((test) =>
    lines.push({ kind: test.passed ? 'pass' : 'fail', text: `${test.passed ? '✔' : '✖'} ${test.name}` }),
  );
  const failed = result.totalCount - result.passedCount;
  lines.push({
    kind: result.allPassed ? 'pass' : 'fail',
    text: `${result.passedCount} passed, ${failed} failed · ${result.acceptancePassed}/${result.acceptanceTotal} acceptance checks · ${(result.durationMs / 1000).toFixed(1)}s`,
  });
  return lines;
}
