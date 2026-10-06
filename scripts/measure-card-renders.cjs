const { spawn } = require('node:child_process');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const WebSocket = require('ws');

const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const debugPort = 9333;
const devUrl = 'http://127.0.0.1:5174';

function delay(ms) { return new Promise(resolve => setTimeout(resolve, ms)); }

async function waitForDebugger() {
  for (let attempt = 0; attempt < 60; attempt += 1) {
    try {
      const response = await fetch(`http://127.0.0.1:${debugPort}/json/version`);
      if (response.ok) return;
    } catch {}
    await delay(250);
  }
  throw new Error('Chrome remote debugging did not start');
}

async function measure(mode, profileDir) {
  const url = `${devUrl}/?stress=1&profile=1${mode === 'baseline' ? '&benchmark=baseline' : ''}`;
  const targetResponse = await fetch(`http://127.0.0.1:${debugPort}/json/new?${encodeURIComponent(url)}`, { method: 'PUT' });
  const target = await targetResponse.json();
  const socket = new WebSocket(target.webSocketDebuggerUrl);
  const pending = new Map();
  let nextId = 1;
  socket.on('message', message => {
    const packet = JSON.parse(message.toString());
    if (packet.method === 'Runtime.exceptionThrown') process.stderr.write(`Chrome exception: ${JSON.stringify(packet.params.exceptionDetails)}\n`);
    if (packet.method === 'Log.entryAdded' && packet.params.entry.level === 'error') process.stderr.write(`Chrome console error: ${packet.params.entry.text}\n`);
    if (packet.id && pending.has(packet.id)) {
      pending.get(packet.id)(packet);
      pending.delete(packet.id);
    }
  });
  await new Promise((resolve, reject) => {
    socket.once('open', resolve);
    socket.once('error', reject);
  });
  const send = (method, params = {}) => new Promise((resolve, reject) => {
    const id = nextId++;
    pending.set(id, packet => packet.error ? reject(new Error(packet.error.message)) : resolve(packet.result));
    socket.send(JSON.stringify({ id, method, params }));
  });
  await send('Runtime.enable');
  await send('Log.enable');

  let domCards = 0;
  for (let attempt = 0; attempt < 240; attempt += 1) {
    const result = await send('Runtime.evaluate', {
      expression: `document.querySelectorAll('${mode === 'baseline' ? '.baseline-list .card' : '[data-testid^="assignment-"]'}').length`,
      returnByValue: true,
    });
    domCards = result.result.value || 0;
    if (mode === 'baseline' ? domCards === 10000 : domCards > 0) break;
    if (attempt % 20 === 0) {
      const state = await send('Runtime.evaluate', { expression: '({ href: location.href, ready: document.readyState, html: document.documentElement.outerHTML.slice(0, 300), text: document.body.innerText.slice(0, 180) })', returnByValue: true });
      process.stdout.write(`${mode}: waiting for stress list (${domCards} cards), ${JSON.stringify(state.result.value)}\n`);
    }
    await delay(250);
  }
  if (mode === 'baseline' && domCards !== 10000) throw new Error(`Expected 10,000 baseline cards, found ${domCards}`);

  const result = await send('Runtime.evaluate', {
    awaitPromise: true,
    returnByValue: true,
    expression: `(async () => {
      window.__assignmentCardRenderCount = 0;
      window.__assignmentCardProfilerCommits = 0;
      const input = document.querySelector('input[aria-label="Tìm kiếm"]');
      const setter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set;
      setter.call(input, 'B');
      input.dispatchEvent(new InputEvent('input', { bubbles: true, inputType: 'insertText', data: 'B' }));
      await new Promise(resolve => setTimeout(resolve, 700));
      return { assignmentCardRenderCallsAfterSearch: window.__assignmentCardRenderCount, profilerCommitsAfterSearch: window.__assignmentCardProfilerCommits, inputValue: input.value };
    })()`,
  });
  const metrics = { mode, cardsInDom: domCards, ...result.result.value };
  socket.close();
  await fetch(`http://127.0.0.1:${debugPort}/json/close/${target.id}`);
  return metrics;
}

(async () => {
  if (!fs.existsSync(chromePath)) throw new Error(`Chrome not found at ${chromePath}`);
  const profileDir = fs.mkdtempSync(path.join(os.tmpdir(), 'student-deadline-profiler-'));
  const chrome = spawn(chromePath, [
    '--headless=new', '--disable-gpu', '--no-first-run', '--no-default-browser-check',
    `--remote-debugging-port=${debugPort}`, `--user-data-dir=${profileDir}`, 'about:blank',
  ], { stdio: 'ignore', windowsHide: true });
  try {
    await waitForDebugger();
    const baseline = await measure('baseline', profileDir);
    const optimized = await measure('optimized', profileDir);
    const report = { measuredAt: new Date().toISOString(), browser: 'Chrome headless, React development build', baseline, optimized };
    fs.writeFileSync(path.resolve('profiler-render-counts.json'), `${JSON.stringify(report, null, 2)}\n`);
    process.stdout.write(`${JSON.stringify(report, null, 2)}\n`);
  } finally {
    chrome.kill();
    await delay(1500);
    try { fs.rmSync(profileDir, { recursive: true, force: true, maxRetries: 5, retryDelay: 500 }); }
    catch (cleanupError) { process.stderr.write(`Temporary Chrome profile cleanup skipped: ${cleanupError.message}\n`); }
  }
})().catch(error => { process.stderr.write(`${error.stack || error}\n`); process.exitCode = 1; });
