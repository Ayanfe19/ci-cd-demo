// Minimal smoke test — no frameworks, so mentees can read every line.
// Starts the server, hits /health, asserts a 200.

const http = require('http');
const { spawn } = require('child_process');

const app = spawn('node', ['server.js'], { env: { ...process.env, PORT: 3999 } });

let done = false;

function finish(code, message) {
  if (done) return;
  done = true;
  console.log(message);
  app.kill();
  process.exit(code);
}

setTimeout(() => {
  http.get('http://localhost:3999/health', (res) => {
    if (res.statusCode === 200) {
      finish(0, 'PASS: /health returned 200');
    } else {
      finish(1, `FAIL: /health returned ${res.statusCode}`);
    }
  }).on('error', (err) => finish(1, `FAIL: ${err.message}`));
}, 1000);

setTimeout(() => finish(1, 'FAIL: test timed out'), 5000);
