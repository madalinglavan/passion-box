import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { createHash } from 'node:crypto';
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../', import.meta.url));
const projectId = createHash('sha256').update(fs.realpathSync(root).toLowerCase()).digest('hex');
const mime = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.mp3': 'audio/mpeg',
  '.wav': 'audio/wav',
};

export function createAppServer() {
  return http.createServer((request, response) => {
    let file;
    try {
      const pathname = decodeURIComponent(new URL(request.url, 'http://localhost').pathname);
      if (pathname === '/__passionbox/status') {
        response.writeHead(200, { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' });
        response.end(JSON.stringify({ app: 'passionbox', projectId }));
        return;
      }
      file = path.resolve(root, `.${pathname.endsWith('/') ? pathname + 'index.html' : pathname}`);
      const relative = path.relative(root, file);
      if (relative.startsWith('..') || path.isAbsolute(relative)) throw new Error('Outside root');
    } catch {
      response.writeHead(400);
      response.end('Bad request');
      return;
    }
    fs.stat(file, (error, stat) => {
      if (error || !stat.isFile()) {
        response.writeHead(404);
        response.end('Not found');
        return;
      }
      response.writeHead(200, {
        'Content-Type': mime[path.extname(file)] || 'application/octet-stream',
        'Cache-Control': 'no-store',
      });
      fs.createReadStream(file).on('error', () => response.destroy()).pipe(response);
    });
  });
}

function openBrowser(url) {
  if (process.env.PASSIONBOX_OPEN_BROWSER !== '1' || process.env.PASSIONBOX_NO_BROWSER === '1') return;
  if (process.platform !== 'win32') return;
  const browser = spawn('rundll32.exe', ['url.dll,FileProtocolHandler', url], {
    windowsHide: true,
    detached: true,
    stdio: 'ignore',
  });
  browser.on('error', () => console.log(`Deschide manual adresa: ${url}`));
  browser.unref();
}

export async function startServer(port = Number(process.env.PORT || 4173)) {
  if (!Number.isInteger(port) || port < 1 || port > 65535) throw new Error('Port invalid. Alege un numar intre 1 si 65535.');
  const url = `http://127.0.0.1:${port}`;
  const server = createAppServer();
  try {
    await new Promise((resolve, reject) => {
      server.once('error', reject);
      server.listen(port, '127.0.0.1', resolve);
    });
  } catch (error) {
    if (error.code !== 'EADDRINUSE') throw error;
    let existing;
    try {
      const response = await fetch(`${url}/__passionbox/status`, { signal: AbortSignal.timeout(1500) });
      if (response.ok) existing = await response.json();
    } catch { /* The occupied port may belong to another application. */ }
    if (existing?.app !== 'passionbox' || existing.projectId !== projectId) {
      throw new Error(`Portul ${port} este folosit de alta aplicatie sau de o versiune veche PassionBox. Inchide serverul vechi din terminalul in care l-ai pornit, apoi incearca din nou.`);
    }
    console.log(`PassionBox ruleaza deja. Deschid ${url}`);
    openBrowser(url);
    return null;
  }
  console.log(`PassionBox: ${url}`);
  console.log('Browserul se deschide automat la pornirea din Start-PassionBox.cmd.');
  console.log('Pastreaza aceasta fereastra deschisa. Ctrl+C opreste aplicatia.');
  openBrowser(url);
  return server;
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  startServer().catch(error => {
    console.error(`PassionBox nu a putut porni: ${error.message}`);
    process.exitCode = 1;
  });
}
