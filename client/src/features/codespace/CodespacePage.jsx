import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Navigate, useNavigate, useParams } from 'react-router-dom';
import { healthApi } from '../../api/healthApi.js';
import { sessionsApi } from '../../api/sessionsApi.js';
import PageState from '../../components/ui/PageState.jsx';
import { useSession } from '../../hooks/useSession.js';
import { pathForSession } from '../../lib/sessionRoutes.js';
import BottomPanel from './components/BottomPanel.jsx';
import EditorArea from './components/EditorArea.jsx';
import LeftPanel, { ActivityBar } from './components/LeftPanel.jsx';
import ManagerChat from './components/ManagerChat.jsx';
import ProblemsList from './components/ProblemsList.jsx';
import ProjectExplorer from './components/ProjectExplorer.jsx';
import ReviewView from './components/ReviewView.jsx';
import SidePanel from './components/SidePanel.jsx';
import SolutionPanel from './components/SolutionPanel.jsx';
import SubmitDialog from './components/SubmitDialog.jsx';
import TaskPanel from './components/TaskPanel.jsx';
import TeamSidebar from './components/TeamSidebar.jsx';
import TerminalView from './components/TerminalView.jsx';
import TestResults from './components/TestResults.jsx';
import TopBar from './components/TopBar.jsx';
import { useMediaQuery } from './hooks/useMediaQuery.js';
import { useOpenFiles } from './hooks/useOpenFiles.js';
import { describeTestRun, useTerminal } from './hooks/useTerminal.js';

const LEFT_WIDTH = 272;
const RIGHT_WIDTH = 380;

/** The Codespace: route `/sessions/:sessionId/workspace`, for sessions in progress. */
export default function CodespacePage() {
  const { sessionId } = useParams();
  const { session, setSession, error } = useSession(sessionId);

  if (!session) return <PageState error={error} />;
  if (session.status !== 'in_progress') return <Navigate to={pathForSession(session)} replace />;

  return <Codespace session={session} onSessionChange={setSession} />;
}

function Codespace({ session, onSessionChange }) {
  const navigate = useNavigate();
  const wide = useMediaQuery('(min-width: 1024px)');
  const lastReview = session.reviews?.at(-1) ?? null;

  const [changed, setChanged] = useState(() => new Set());
  const refreshChanges = useCallback(async () => {
    const { changedFiles } = await sessionsApi.listChanges(session.id);
    setChanged(new Set(changedFiles));
    return changedFiles;
  }, [session.id]);

  const files = useOpenFiles(session.id, {
    initialPath: session.ticket.relevantFiles[0],
    onSaved: () => refreshChanges().catch(() => {}),
  });

  const [leftView, setLeftView] = useState('files');
  const [leftOpen, setLeftOpen] = useState(wide);
  const [teamOpen, setTeamOpen] = useState(wide);
  const [panelOpen, setPanelOpen] = useState(true);
  const [panelTab, setPanelTab] = useState('terminal');
  const [teamRequest, setTeamRequest] = useState(null);
  const [aiMode, setAiMode] = useState(null);
  const [simple, setSimple] = useState(false);

  const [testResult, setTestResult] = useState(lastReview?.testResult ?? null);
  const [testSource, setTestSource] = useState(lastReview ? 'From your last review' : null);
  const [testing, setTesting] = useState(false);

  const [submitting, setSubmitting] = useState(false);
  const [shownReview, setShownReview] = useState(null);

  // Docked columns open by default on wide screens; drawers start closed on narrow ones.
  useEffect(() => {
    setLeftOpen(wide);
    setTeamOpen(wide);
  }, [wide]);

  useEffect(() => {
    healthApi
      .get()
      .then((health) => setAiMode(health.ai))
      .catch(() => setAiMode('fallback'));
    refreshChanges().catch(() => {});
  }, [refreshChanges]);

  const terminal = useTerminal({
    files: files.files,
    runTests: () => runTests({ fromTerminal: true }),
    readFile: async (path) => (await sessionsApi.readFile(session.id, path)).content,
    openFile: (path) => files.openFile(path),
    listChanges: refreshChanges,
  }, session?.simulationId);

  async function runTests({ fromTerminal = false } = {}) {
    if (testing) return;
    setTesting(true);
    if (!fromTerminal) {
      setPanelOpen(true);
      setPanelTab('tests');
    }
    terminal.print({ kind: 'info', text: 'Running the project tests and the ticket’s hidden checks…' });
    try {
      await files.saveAll();
      const { testResult: result } = await sessionsApi.runTests(session.id);
      setTestResult(result);
      setTestSource(null);
      terminal.print(describeTestRun(result));
    } catch (runError) {
      terminal.print({ kind: 'error', text: runError.message });
    } finally {
      setTesting(false);
    }
  }

  // ── problems: syntax errors from the editor, plus those reported by the last test run ──
  const editorRef = useRef(null);
  const markersBound = useRef(false);
  const [markers, setMarkers] = useState([]);
  const pendingReveal = useRef(null);

  const handleEditorReady = useCallback((editor, monaco) => {
    editorRef.current = editor;
    if (markersBound.current) return;
    markersBound.current = true;
    const collect = () =>
      setMarkers(
        monaco.editor.getModelMarkers({}).map((marker) => ({
          id: `${marker.resource.path}:${marker.startLineNumber}:${marker.startColumn}:${marker.message}`,
          path: marker.resource.path.replace(/^\//, ''),
          line: marker.startLineNumber,
          column: marker.startColumn,
          message: marker.message,
          severity: marker.severity >= monaco.MarkerSeverity.Error ? 'error' : 'warning',
          source: 'editor',
        })),
      );
    monaco.editor.onDidChangeMarkers(collect);
    collect();
  }, []);

  const problems = useMemo(() => {
    const open = new Set(files.tabs.map((tab) => tab.path));
    const fromEditor = markers.filter((marker) => open.has(marker.path));
    const fromTests = (testResult?.syntaxErrors ?? []).map((error) => ({
      id: `test:${error.file}:${error.message}`,
      path: error.file,
      line: Number(error.message.match(/:(\d+)\)?$/)?.[1]) || null,
      column: 1,
      message: error.message,
      severity: 'error',
      source: 'test run',
    }));
    return [...fromEditor, ...fromTests];
  }, [markers, files.tabs, testResult]);

  async function goTo(path, line, column) {
    pendingReveal.current = line ? { path, line, column } : null;
    await files.openFile(path);
    if (!wide) setLeftOpen(false);
  }

  useEffect(() => {
    const target = pendingReveal.current;
    if (!target || target.path !== files.activePath) return;
    pendingReveal.current = null;
    requestAnimationFrame(() => {
      const editor = editorRef.current;
      editor?.revealLineInCenter(target.line);
      editor?.setPosition({ lineNumber: target.line, column: target.column ?? 1 });
      editor?.focus();
    });
  }, [files.activePath]);

  // ── side panels ──
  function showLeft(view) {
    if (wide && leftOpen && leftView === view) {
      setLeftOpen(false);
      return;
    }
    setLeftView(view);
    setLeftOpen(true);
    if (!wide) setTeamOpen(false);
  }

  function toggleTeam() {
    setTeamOpen((open) => !open);
    if (!wide) setLeftOpen(false);
  }

  function askTeammate(teammateId, text) {
    setTeamRequest({ teammateId, text, at: Date.now() });
    setTeamOpen(true);
    if (!wide) setLeftOpen(false);
  }

  function openFileFromPanel(path) {
    files.openFile(path);
    if (!wide) setLeftOpen(false);
  }

  // ── review and finish ──
  async function prepareSubmission() {
    await files.saveAll();
    return refreshChanges();
  }

  function handleReviewed(review) {
    onSessionChange((current) => ({ ...current, reviews: [...(current.reviews ?? []), review] }));
    setSubmitting(false);
    setShownReview(review);
    setTestResult(review.testResult);
    setTestSource('From the review');
  }

  async function finish() {
    await files.saveAll();
    const { session: submitted } = await sessionsApi.submit(session.id);
    navigate(pathForSession(submitted));
  }

  const dirty = new Set(files.tabs.filter((tab) => tab.content !== tab.saved).map((tab) => tab.path));

  const taskStatus = shownReview
    ? { label: 'In review', tone: 'busy' }
    : testing
      ? { label: 'Testing', tone: 'busy' }
      : !testResult
        ? { label: 'In progress', tone: 'neutral' }
        : testResult.allPassed
          ? { label: 'Checks passing', tone: 'ok' }
          : { label: 'Checks failing', tone: 'bad' };

  const saveStatus = files.saving
    ? { label: 'Saving…', tone: 'busy' }
    : files.error
      ? { label: 'Save failed', tone: 'bad' }
      : files.dirtyCount
        ? { label: 'Unsaved changes', tone: 'neutral' }
        : { label: 'All changes saved', tone: 'ok' };

  const panelCounts = {
    tests: testResult && {
      label: `${testResult.passedCount}/${testResult.totalCount}`,
      tone: testResult.allPassed ? 'ok' : 'bad',
    },
    problems: problems.length ? { label: String(problems.length), tone: 'bad' } : null,
  };

  return (
    <div className="codespace flex h-dvh flex-col overflow-clip bg-paper text-ink">
      <TopBar
        session={session}
        taskStatus={taskStatus}
        saveStatus={saveStatus}
        testing={testing}
        narrow={!wide}
        teamOpen={teamOpen}
        onToggleFiles={() => setLeftOpen((open) => !open)}
        onOpenTask={() => showLeft('task')}
        onToggleTeam={toggleTeam}
        onRunTests={() => runTests()}
        onSubmit={() => setSubmitting(true)}
      />

      {files.error && (
        <p role="alert" className="shrink-0 border-b border-line bg-bad-soft px-4 py-2 font-ui text-sm text-ink-2">
          {files.error.message}
        </p>
      )}

      <div className="relative flex min-h-0 flex-1">
        {wide && <ActivityBar view={leftView} open={leftOpen} onSelect={showLeft} />}

        <SidePanel
          side="left"
          open={leftOpen}
          docked={wide}
          width={LEFT_WIDTH}
          label="Files and task"
          onClose={() => setLeftOpen(false)}
        >
          <LeftPanel
            view={leftView}
            onView={setLeftView}
            onClose={() => setLeftOpen(false)}
            showSwitcher={!wide}
            explorer={
              <ProjectExplorer
                projectName={session.simulationName}
                files={simple ? files.files.filter((path) => session.ticket.relevantFiles.includes(path) || path === 'README.md') : files.files}
                activePath={files.activePath}
                changed={changed}
                dirty={dirty}
                revealPaths={session.ticket.relevantFiles}
                onOpen={openFileFromPanel}
              />
            }
            task={
              <TaskPanel
                ticket={session.ticket}
                lastReview={lastReview}
                onOpenFile={openFileFromPanel}
                onAskManager={() => setLeftView('manager')}
                onOpenReview={() => setShownReview(lastReview)}
              />
            }
            manager={<ManagerChat session={session} onSessionChange={onSessionChange} />}
            solution={
              <SolutionPanel
                sessionId={session.id}
                testing={testing}
                onApply={files.replaceFile}
                onRunTests={() => runTests()}
                onSubmit={() => setSubmitting(true)}
              />
            }
          />
        </SidePanel>

        <main className="flex min-w-0 flex-1 flex-col">
          <EditorArea
            files={files}
            onEditorReady={handleEditorReady}
            simple={simple}
            onToggleSimple={() => setSimple((value) => !value)}
          />
          <BottomPanel
            open={panelOpen}
            onToggle={() => setPanelOpen((open) => !open)}
            tab={panelTab}
            onTab={setPanelTab}
            counts={panelCounts}
            testing={testing}
            onRunTests={() => runTests()}
          >
            {panelTab === 'terminal' && <TerminalView terminal={terminal} />}
            {panelTab === 'tests' && (
              <TestResults
                result={testResult}
                source={testSource}
                running={testing}
                onRun={() => runTests()}
                onAskAboutCheck={(name) => askTeammate('sarah', `What is the check “${name}” looking for?`)}
              />
            )}
            {panelTab === 'problems' && <ProblemsList problems={problems} onGoTo={goTo} />}
          </BottomPanel>
        </main>

        <SidePanel
          side="right"
          open={teamOpen}
          docked={wide}
          width={RIGHT_WIDTH}
          label="AI teammates"
          onClose={() => setTeamOpen(false)}
        >
          <TeamSidebar
            session={session}
            onSessionChange={onSessionChange}
            activePath={files.activePath}
            aiMode={aiMode}
            request={teamRequest}
            onClose={() => setTeamOpen(false)}
          />
        </SidePanel>

        {shownReview && (
          <ReviewView
            review={shownReview}
            reviews={session.reviews ?? [shownReview]}
            onSelect={setShownReview}
            onBack={() => setShownReview(null)}
            onOpenFile={(path) => {
              setShownReview(null);
              files.openFile(path);
            }}
            onFinish={finish}
          />
        )}
      </div>

      {submitting && (
        <SubmitDialog
          sessionId={session.id}
          prepare={prepareSubmission}
          onTestResult={(result) => {
            setTestResult(result);
            setTestSource(null);
          }}
          onReviewed={handleReviewed}
          onClose={() => setSubmitting(false)}
        />
      )}
    </div>
  );
}
