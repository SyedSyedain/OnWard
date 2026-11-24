/**
 * Minimal structured logger. Never pass secrets or student code to it.
 */

function write(level, message, details) {
  const entry = { time: new Date().toISOString(), level, message, ...details };
  const output = level === 'error' ? console.error : console.log;
  output(JSON.stringify(entry));
}

export const logger = {
  info: (message, details = {}) => write('info', message, details),
  warn: (message, details = {}) => write('warn', message, details),
  error: (message, details = {}) => write('error', message, details),
};
