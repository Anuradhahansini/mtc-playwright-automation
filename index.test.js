const test = require('node:test');
const assert = require('node:assert');
const http = require('node:http');
const { createApp } = require('./index');

function request(server, path) {
  const { port } = server.address();
  return new Promise((resolve, reject) => {
    http.get(`http://localhost:${port}${path}`, (res) => {
      let body = '';
      res.on('data', (chunk) => (body += chunk));
      res.on('end', () => resolve({ status: res.statusCode, body }));
    }).on('error', reject);
  });
}

test('GET / returns Hello, world!', async (t) => {
  const server = createApp().listen(0);
  t.after(() => server.close());

  const res = await request(server, '/');
  assert.strictEqual(res.status, 200);
  assert.strictEqual(res.body, 'Hello, world!');
});

test('GET /health returns ok status', async (t) => {
  const server = createApp().listen(0);
  t.after(() => server.close());

  const res = await request(server, '/health');
  assert.strictEqual(res.status, 200);
  assert.deepStrictEqual(JSON.parse(res.body), { status: 'ok' });
});
