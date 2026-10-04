// Local HTTP Server for PhysicsLab (Tagless)
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PORT = process.env.PORT || 3000;

const LT = String.fromCharCode(60);
const GT = String.fromCharCode(62);

const indexHtml = [
  LT + '!DOCTYPE html' + GT,
  LT + 'html lang="en"' + GT,
  LT + 'head' + GT,
  LT + 'meta charset="UTF-8"' + GT,
  LT + 'meta name="viewport" content="width=device-width, initial-scale=1.0"' + GT,
  LT + 'title' + GT + 'PhysicsLab' + LT + '/title' + GT,
  LT + 'style' + GT +
  'html,body{margin:0;padding:0;overflow:hidden;background:#080B12;height:100%;width:100%;}' +
  LT + '/style' + GT,
  LT + '/head' + GT,
  LT + 'body' + GT,
  LT + 'script type="module" src="/main.js"' + GT + LT + '/script' + GT,
  LT + '/body' + GT,
  LT + '/html' + GT
].join('\n');

const mimeTypes = {
  '.js': 'text/javascript',
  '.json': 'application/json',
  '.css': 'text/css',
  '.ico': 'image/x-icon',
  '.png': 'image/png',
  '.svg': 'image/svg+xml'
};

const server = http.createServer((req, res) => {
  let reqPath = req.url.split('?')[0];

  if (reqPath === '/' || reqPath === '/index.html') {
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    res.end(indexHtml);
    return;
  }

  // Prevent directory traversal
  const safePath = path.normalize(reqPath).replace(/^(\.\.[/\\])+/, '');
  const filePath = path.join(__dirname, safePath);

  fs.stat(filePath, (err, stats) => {
    if (err || !stats.isFile()) {
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.end('404 Not Found');
      return;
    }

    const ext = path.extname(filePath).toLowerCase();
    const contentType = mimeTypes[ext] || 'application/octet-stream';

    res.writeHead(200, { 'Content-Type': contentType });
    fs.createReadStream(filePath).pipe(res);
  });
});

server.listen(PORT, () => {
  console.log(`PhysicsLab running at http://localhost:${PORT}`);
});