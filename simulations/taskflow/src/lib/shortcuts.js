/**
 * Keyboard shortcuts for the board.
 */

const TYPING_TAGS = new Set(['INPUT', 'TEXTAREA', 'SELECT']);

/**
 * True when the event target is a place where the user is typing text.
 * @param {{ tagName?: string, isContentEditable?: boolean } | null | undefined} target
 * @returns {boolean}
 */
export function isTypingTarget(target) {
  if (!target) return false;
  return TYPING_TAGS.has(target.tagName) || Boolean(target.isContentEditable);
}

/**
 * Maps a keydown event to a board action name, or null when the key is not a shortcut.
 * @param {{ key: string, ctrlKey?: boolean, metaKey?: boolean, target?: object }} event
 * @returns {'new-card' | 'undo' | 'focus-filter' | null}
 */
export function getShortcutAction(event) {
  if (isTypingTarget(event.target)) return null;

  const modifier = Boolean(event.ctrlKey || event.metaKey);
  const key = event.key.toLowerCase();

  if (modifier && key === 'z') return 'undo';
  if (modifier) return null;
  if (key === 'n') return 'new-card';
  if (key === '/') return 'focus-filter';
  return null;
}
