import http from 'http';
import fs from 'fs';
import path from 'path';

const PORT = process.env.PORT || 3008;
const PUBLIC_DIR = path.join(process.cwd(), 'public');

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.mjs': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.mp3': 'audio/mpeg',
  '.ttf': 'font/ttf',
  '.otf': 'font/otf',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.gltf': 'model/gltf+json',
  '.glb': 'model/gltf-binary',
  '.bin': 'application/octet-stream'
};

const server = http.createServer((req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', '*');

  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }

  // Mock weather API if requested locally
  if (req.url.includes('/weather/now') || req.url.includes('devapi.qweather.com')) {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      code: "200",
      now: {
        temp: "28",
        feelsLike: "29",
        text: "Clear",
        windDir: "SE",
        humidity: "65"
      }
    }));
    return;
  }

  let reqPath = decodeURI(req.url.split('?')[0]);
  if (reqPath.startsWith('/lethao')) {
    reqPath = reqPath.slice('/lethao'.length);
  }
  if (reqPath === '/' || reqPath === '') {
    reqPath = '/index.html';
  }


  let filePath = path.join(PUBLIC_DIR, reqPath);

  if (!fs.existsSync(filePath)) {
    if (fs.existsSync(filePath + '.html')) {
      filePath += '.html';
    } else if (fs.existsSync(path.join(filePath, 'index.html'))) {
      filePath = path.join(filePath, 'index.html');
    } else {
      if (!path.extname(reqPath)) {
        filePath = path.join(PUBLIC_DIR, 'index.html');
      } else {
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        res.end('Not Found: ' + req.url);
        return;
      }
    }
  }

  const ext = path.extname(filePath).toLowerCase();
  const contentType = MIME_TYPES[ext] || 'application/octet-stream';

  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.writeHead(500, { 'Content-Type': 'text/plain' });
      res.end('Error: ' + err.message);
      return;
    }
    res.writeHead(200, { 'Content-Type': contentType });
    res.end(data);
  });
});

server.listen(PORT, () => {
  console.log(`====================================================`);
  console.log(`🚀 HAOQI©2026 Clone Server running!`);
  console.log(`🔗 Local URL: http://localhost:${PORT}`);
  console.log(`📂 Serving directory: ${PUBLIC_DIR}`);
  console.log(`====================================================`);
});
