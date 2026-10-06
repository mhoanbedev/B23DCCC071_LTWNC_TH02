const { spawn } = require('node:child_process');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const WebSocket = require('ws');

const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const port = 9334;
const devUrl = 'http://127.0.0.1:5174/';
const wait = ms => new Promise(resolve => setTimeout(resolve, ms));

async function connectChrome() {
  for (let attempt = 0; attempt < 60; attempt += 1) {
    try { if ((await fetch(`http://127.0.0.1:${port}/json/version`)).ok) return; } catch {}
    await wait(250);
  }
  throw new Error('Chrome remote debugging failed to start');
}

async function main() {
  const profile = fs.mkdtempSync(path.join(os.tmpdir(), 'student-deadline-logger-'));
  const chrome = spawn(chromePath, ['--headless=new', '--disable-gpu', '--no-first-run', `--remote-debugging-port=${port}`, `--user-data-dir=${profile}`, 'about:blank'], { stdio: 'ignore', windowsHide: true });
  try {
    await connectChrome();
    const target = await (await fetch(`http://127.0.0.1:${port}/json/new?${encodeURIComponent(devUrl)}`, { method: 'PUT' })).json();
    const socket = new WebSocket(target.webSocketDebuggerUrl);
    const pending = new Map(); const consoleEvents = []; let id = 0; let send;
    socket.on('message', data => {
      const packet = JSON.parse(data.toString());
      if (packet.method === 'Runtime.consoleAPICalled') {
        const event = { type: packet.params.type, args: packet.params.args.map(arg => arg.value ?? arg.description ?? arg.type) };
        consoleEvents.push(event);
        packet.params.args.forEach((arg, index) => {
          if (!arg.objectId) return;
          send('Runtime.callFunctionOn', { objectId: arg.objectId, functionDeclaration: 'function () { try { return JSON.stringify(this); } catch { return String(this); } }', returnByValue: true })
            .then(result => {
              const value = result.result?.value;
              if (typeof value !== 'string') return;
              try { event.args[index] = JSON.parse(value); } catch { event.args[index] = value; }
            }).catch(() => {});
        });
      }
      if (packet.id && pending.has(packet.id)) { pending.get(packet.id)(packet); pending.delete(packet.id); }
    });
    await new Promise((resolve, reject) => { socket.once('open', resolve); socket.once('error', reject); });
    send = (method, params = {}) => new Promise((resolve, reject) => {
      const commandId = ++id;
      pending.set(commandId, packet => packet.error ? reject(new Error(packet.error.message)) : resolve(packet.result));
      socket.send(JSON.stringify({ id: commandId, method, params }));
    });
    await send('Runtime.enable');
    const evalValue = async expression => (await send('Runtime.evaluate', { expression, awaitPromise: true, returnByValue: true })).result.value;

    for (let attempt = 0; attempt < 80; attempt += 1) {
      if (await evalValue("document.querySelectorAll('article[data-testid^=\\\"assignment-\\\"]').length")) break;
      await wait(250);
    }
    await evalValue(`(async () => {
      const setValue = (input, value) => {
        const setter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set;
        setter.call(input, value);
        input.dispatchEvent(new InputEvent('input', { bubbles: true, inputType: 'insertText', data: value }));
      };
      setValue(document.querySelector('input[aria-label="Tên bài tập"]'), 'Logger evidence');
      setValue(document.querySelector('input[aria-label="Hạn nộp"]'), '2099-12-31');
      document.querySelector('form').requestSubmit();
      await new Promise(resolve => setTimeout(resolve, 150));
      const card = [...document.querySelectorAll('article[data-testid]')].find(node => node.innerText.includes('Logger evidence'));
      if (!card) throw new Error('New assignment was not rendered');
      card.querySelectorAll('button')[1].click();
      await new Promise(resolve => setTimeout(resolve, 100));
      const updatedCard = [...document.querySelectorAll('article[data-testid]')].find(node => node.innerText.includes('Logger evidence'));
      updatedCard.querySelectorAll('button')[2].click();
      await new Promise(resolve => setTimeout(resolve, 100));
      return true;
    })()`);

    const actionTypes = ['addAssignment', 'toggleCompleted', 'removeAssignment'];
    await wait(250);
    const evidence = Object.fromEntries(actionTypes.map(actionType => {
      const targetText = `assignments/${actionType}`;
      const start = consoleEvents.findIndex(event => event.args.some(arg => String(arg).includes(targetText)));
      return [actionType, start < 0 ? [] : consoleEvents.slice(start, start + 4)];
    }));
    if (Object.values(evidence).some(events => events.length === 0)) throw new Error(`Missing logger action: ${JSON.stringify(Object.keys(evidence).filter(key => !evidence[key].length))}`);
    fs.writeFileSync(path.resolve('redux-logger-actions.json'), `${JSON.stringify({ capturedAt: new Date().toISOString(), evidence }, null, 2)}\n`);
    process.stdout.write(`Captured Redux Logger entries: ${actionTypes.join(', ')}\n`);
    socket.close();
  } finally {
    chrome.kill(); await wait(1000);
    try { fs.rmSync(profile, { recursive: true, force: true, maxRetries: 5, retryDelay: 500 }); } catch {}
  }
}

main().catch(error => { process.stderr.write(`${error.stack || error}\n`); process.exitCode = 1; });
