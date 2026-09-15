import { test } from 'node:test';
import assert from 'node:assert/strict';
import http from 'node:http';
import { once } from 'node:events';
import { createAppServer, startServer } from '../scripts/serve.mjs';

test('running project is identified and reused on a second launch', async () => {
  const server = createAppServer();
  server.listen(0, '127.0.0.1');
  await once(server, 'listening');
  try {
    const port = server.address().port;
    const status = await fetch(`http://127.0.0.1:${port}/__passionbox/status`).then(response => response.json());
    assert.equal(status.app, 'passionbox');
    assert.equal(await startServer(port), null);
    const response = await fetch(`http://127.0.0.1:${port}/scripts/serve.mjs`);
    assert.equal(response.status, 200);
  } finally { server.closeAllConnections(); await new Promise(resolve => server.close(resolve)); }
});

test('foreign occupied port gives a useful error and leaves its owner running', async () => {
  const foreign = http.createServer((_, response) => response.end('another app'));
  foreign.listen(0, '127.0.0.1');
  await once(foreign, 'listening');
  try {
    const port = foreign.address().port;
    await assert.rejects(startServer(port), /Portul .* este folosit de alta aplicatie/);
    assert.equal(await fetch(`http://127.0.0.1:${port}`).then(response => response.text()), 'another app');
  } finally { foreign.closeAllConnections(); await new Promise(resolve => foreign.close(resolve)); }
});

test('invalid ports have an actionable message', async () => {
  for (const port of [NaN, -1, 70000]) await assert.rejects(startServer(port), /Port invalid/);
});
