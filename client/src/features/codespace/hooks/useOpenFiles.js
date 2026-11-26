import { useCallback, useEffect, useRef, useState } from 'react';
import { sessionsApi } from '../../../api/sessionsApi.js';

const AUTOSAVE_DELAY_MS = 1200;

/**
 * The project's file list and the files open in editor tabs.
 * Each tab keeps its current text and the text last saved on the server;
 * edits are saved automatically shortly after typing stops, and on demand.
 */
export function useOpenFiles(sessionId, { initialPath, onSaved } = {}) {
  const [files, setFiles] = useState([]);
  const [tabs, setTabs] = useState([]);
  const [activePath, setActivePath] = useState(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  // Bumps when a whole file is replaced from outside the editor (the ticket's solution).
  const [revision, setRevision] = useState(0);

  // Saves read the newest tabs from a ref, so editor shortcuts and timers never use stale text.
  const tabsRef = useRef(tabs);
  tabsRef.current = tabs;
  const onSavedRef = useRef(onSaved);
  onSavedRef.current = onSaved;

  const saveAll = useCallback(async () => {
    const dirty = tabsRef.current.filter((tab) => tab.content !== tab.saved);
    if (dirty.length === 0) return;

    setSaving(true);
    try {
      for (const tab of dirty) {
        await sessionsApi.saveFile(sessionId, tab.path, tab.content);
        setTabs((current) =>
          current.map((entry) => (entry.path === tab.path ? { ...entry, saved: tab.content } : entry)),
        );
      }
      setError(null);
      onSavedRef.current?.();
    } catch (saveError) {
      setError(saveError);
      throw saveError;
    } finally {
      setSaving(false);
    }
  }, [sessionId]);

  const openFile = useCallback(
    async (path) => {
      if (tabsRef.current.some((tab) => tab.path === path)) {
        setActivePath(path);
        return;
      }
      try {
        const { content } = await sessionsApi.readFile(sessionId, path);
        setTabs((current) =>
          current.some((tab) => tab.path === path) ? current : [...current, { path, content, saved: content }],
        );
        setActivePath(path);
        setError(null);
      } catch (openError) {
        setError(openError);
      }
    },
    [sessionId],
  );

  const closeTab = useCallback(
    async (path) => {
      const tab = tabsRef.current.find((entry) => entry.path === path);
      if (tab && tab.content !== tab.saved) {
        await saveAll().catch(() => {});
      }
      const current = tabsRef.current;
      const index = current.findIndex((entry) => entry.path === path);
      const remaining = current.filter((entry) => entry.path !== path);
      const neighbour = remaining[Math.min(index, remaining.length - 1)]?.path ?? null;
      setTabs((latest) => latest.filter((entry) => entry.path !== path));
      setActivePath((active) => (active === path ? neighbour : active));
    },
    [saveAll],
  );

  /** Writes a whole file on the server and shows it in a tab, opening the tab if needed. */
  const replaceFile = useCallback(
    async (path, content) => {
      await sessionsApi.saveFile(sessionId, path, content);
      setTabs((current) =>
        current.some((tab) => tab.path === path)
          ? current.map((tab) => (tab.path === path ? { ...tab, content, saved: content } : tab))
          : [...current, { path, content, saved: content }],
      );
      setActivePath(path);
      setRevision((value) => value + 1);
      onSavedRef.current?.();
    },
    [sessionId],
  );

  const setContent = useCallback((path, content) => {
    setTabs((current) => current.map((tab) => (tab.path === path ? { ...tab, content } : tab)));
  }, []);

  useEffect(() => {
    sessionsApi
      .listFiles(sessionId)
      .then(({ files: list }) => {
        setFiles(list);
        const first = list.includes(initialPath) ? initialPath : list[0];
        if (first) openFile(first);
      })
      .catch(setError);
    // Loads once per session; openFile is stable for a session.
  }, [sessionId]);

  const dirtyCount = tabs.filter((tab) => tab.content !== tab.saved).length;

  // Autosave: once typing pauses, save every changed tab.
  useEffect(() => {
    if (dirtyCount === 0) return undefined;
    const timer = setTimeout(() => saveAll().catch(() => {}), AUTOSAVE_DELAY_MS);
    return () => clearTimeout(timer);
  }, [tabs, dirtyCount, saveAll]);

  return {
    files,
    tabs,
    activeTab: tabs.find((tab) => tab.path === activePath) ?? null,
    activePath,
    setActivePath,
    openFile,
    closeTab,
    setContent,
    replaceFile,
    revision,
    saveAll,
    saving,
    dirtyCount,
    error,
  };
}
