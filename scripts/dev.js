/**
 * Starts the API and the web client together for local development.
 * Usage: npm run dev
 */

import { spawn } from 'node:child_process';

const npm = process.platform === 'win32' ? 'npm.cmd' : 'npm';

const processes = [
  { name: 'server', color: '\x1b[35m', args: ['run', 'dev', '--prefix', 'server'] },
  { name: 'client', color: '\x1b[36m', args: ['run', 'dev', '--prefix', 'client'] },
].map(({ name, color, args }) => {
  const child = spawn(npm, args, { stdio: ['ignore', 'pipe', 'pipe'], shell: process.platform === 'win32' });
  const prefix = `${color}[${name}]\x1b[0m `;
  const forward = (stream) => (chunk) =>
    stream.write(chunk.toString().replace(/^(?=.)/gm, prefix));
  child.stdout.on('data', forward(process.stdout));
  child.stderr.on('data', forward(process.stderr));
  return child;
});

function stopAll() {
  processes.forEach((child) => child.kill('SIGTERM'));
  process.exit(0);
}

process.on('SIGINT', stopAll);
process.on('SIGTERM', stopAll);
