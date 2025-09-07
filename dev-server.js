const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');

const PORT = 8080;
const SRC_DIR = path.join(__dirname, 'src');

// MIME types
const mimeTypes = {
  '.html': 'text/html',
  '.js': 'text/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon'
};

const server = http.createServer((req, res) => {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  const parsedUrl = url.parse(req.url);
  const pathname = parsedUrl.pathname;
  
  console.log(`${req.method} ${pathname}`);
  
  // Construct file path
  let filePath = path.join(SRC_DIR, pathname);
  
  // If it's a directory, try to serve index.html
  if (pathname.endsWith('/')) {
    filePath = path.join(filePath, 'index.html');
  }
  
  // Get file extension
  const ext = path.extname(filePath).toLowerCase();
  const contentType = mimeTypes[ext] || 'application/octet-stream';
  
  fs.stat(filePath, (err, stats) => {
    if (err || !stats.isFile()) {
      // File doesn't exist - check if it should fallback to index.html for SPA routes
      // Based on netlify.toml rules: /football/* and /* should serve index.html
      if (pathname.startsWith('/football/') || pathname !== '/') {
        const indexPath = path.join(SRC_DIR, 'index.html');
        fs.readFile(indexPath, (err, content) => {
          if (err) {
            res.writeHead(404);
            res.end('Not Found');
            return;
          }
          res.writeHead(200, { 'Content-Type': 'text/html' });
          res.end(content, 'utf-8');
        });
        return;
      }
      
      // Otherwise 404
      res.writeHead(404);
      res.end('Not Found');
      return;
    }
    
    // File exists - serve it
    fs.readFile(filePath, (err, content) => {
      if (err) {
        res.writeHead(500);
        res.end(`Server Error: ${err.code}`);
        return;
      }
      
      res.writeHead(200, { 'Content-Type': contentType });
      res.end(content, 'utf-8');
    });
  });
});

server.listen(PORT, 'localhost', () => {
  console.log(`🚀 SPA dev server running at http://localhost:${PORT}/`);
  console.log('📁 Serving from:', SRC_DIR);
  console.log('🔄 SPA routes (/football/*) will fallback to index.html');
});