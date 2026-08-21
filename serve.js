const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 5260;
const ROOT = __dirname;
const TYPES = {
  '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8', '.webp': 'image/webp', '.avif': 'image/avif',
  '.jpg': 'image/jpeg', '.png': 'image/png', '.svg': 'image/svg+xml',
  '.mp4': 'video/mp4', '.txt': 'text/plain; charset=utf-8', '.xml': 'application/xml; charset=utf-8'
};

http.createServer((req, res) => {
  let p = decodeURIComponent(req.url.split('?')[0]);
  if (p === '/') p = '/index.html';
  const file = path.join(ROOT, p);
  if (!file.startsWith(ROOT)) { res.writeHead(403).end('Forbidden'); return; }
  fs.readFile(file, (err, buf) => {
    if (err) { res.writeHead(404, { 'Content-Type': 'text/plain' }).end('404'); return; }
    res.writeHead(200, { 'Content-Type': TYPES[path.extname(file).toLowerCase()] || 'application/octet-stream', 'Cache-Control': 'no-cache' });
    res.end(buf);
  });
}).listen(PORT, () => console.log('TiendaDeportivaSV -> http://localhost:' + PORT));
