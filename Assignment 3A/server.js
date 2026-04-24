const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');

const PORT = 8080;

const mimeTypes = {
    '.html': 'text/html',
    '.css': 'text/css',
    '.js': 'text/javascript',
    '.json': 'application/json',
    '.png': 'image/png',
    '.jpg': 'image/jpg',
    '.gif': 'image/gif'
};

const server = http.createServer((req, res) => {
    let parsedUrl = url.parse(req.url);
    let pathname = `./public${parsedUrl.pathname}`;

    if (pathname === './public/') {
        pathname = './public/index.html';
    }

    const ext = path.extname(pathname);

    fs.readFile(pathname, (err, data) => {
        if (err) {
            if (err.code === 'ENOENT') {
                fs.readFile('./public/404.html', (err, data) => {
                    res.writeHead(404, { 'Content-Type': 'text/html' });
                    res.end(data || '<h1>404 Not Found</h1>');
                });
            } else {
                res.writeHead(500);
                res.end(`Server Error: ${err.code}`);
            }
        } else {
            res.writeHead(200, { 'Content-Type': mimeTypes[ext] || 'text/plain' });
            res.end(data);
        }
    });
});

server.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});