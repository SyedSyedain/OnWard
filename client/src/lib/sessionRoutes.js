/** Maps a session's status to the page the student should be on. */
const PAGE_BY_STATUS = {
  briefing: 'briefing',
  in_progress: 'workspace',
  submitted: 'review',
};

export function pathForSession(session) {
  return `/sessions/${session.id}/${PAGE_BY_STATUS[session.status]}`;
}
