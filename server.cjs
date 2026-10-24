'use strict';
const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const {createBackend} = require('./backend.cjs');
const publicDir = path.join(__dirname, 'public');
const backend = createBackend();
const types = {'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.json':'application/json; charset=utf-8','.svg':'image/svg+xml','.png':'image/png','.jpg':'image/jpeg','.gif':'image/gif','.webp':'image/webp','.wav':'audio/wav','.mp3':'audio/mpeg','.woff2':'font/woff2','.dat':'application/octet-stream','.lzma':'application/octet-stream'};
const csp = "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' blob:; worker-src 'self' blob:; style-src 'self' 'unsafe-inline'; img-src 'self' blob: data:; font-src 'self' data:; connect-src 'self' ws://127.0.0.1:* ws://localhost:*; media-src 'self' blob:; object-src 'none'; base-uri 'self'; form-action 'self'; frame-src 'none'";
const server = http.createServer((req,res) => {
  if (!/^(127\.0\.0\.1|localhost)(:\d+)?$/.test(req.headers.host || '')) {res.writeHead(403);res.end();return;}
  res.setHeader('Content-Security-Policy',csp);
  res.setHeader('X-Content-Type-Options','nosniff');
  res.setHeader('Referrer-Policy','no-referrer');
  if (backend.handleHttp(req,res)) return;
  let pathname;
  try { pathname = decodeURIComponent(new URL(req.url,'http://localhost').pathname); } catch {res.writeHead(400);res.end();return;}
  const relative = pathname.replace(/^\/+/, '');
  let file = path.resolve(publicDir,relative);
  if (file !== publicDir && !file.startsWith(publicDir+path.sep)) {res.writeHead(403);res.end();return;}
  if (!path.extname(pathname)) file = path.join(publicDir,'index.html');
  fs.stat(file,(error,stat) => {
    if (error || !stat.isFile()) {res.writeHead(404);res.end('Recurso local ausente');return;}
    res.writeHead(200,{'content-type':types[path.extname(file)]||'application/octet-stream','content-length':stat.size,'cache-control':'no-cache'});
    fs.createReadStream(file).pipe(res);
  });
});
server.on('upgrade',backend.handleUpgrade);
const port = Number(process.env.PORT || 4173);
server.listen(port,'127.0.0.1',() => console.log(`Huntera local: http://127.0.0.1:${server.address().port}/characters`));
async function stop(){await backend.close();server.close(()=>process.exit(0));}
process.on('SIGINT',stop);process.on('SIGTERM',stop);
