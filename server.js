#!/usr/bin/env node

/**
 * Simple development server for the terminal portfolio website
 * This server serves index.html for all routes to enable client-side routing
 */

const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = process.env.PORT || 8080;

const MIME_TYPES = {
    '.html': 'text/html',
    '.css': 'text/css',
    '.js': 'text/javascript',
    '.json': 'application/json',
    '.md': 'text/markdown',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.gif': 'image/gif',
    '.svg': 'image/svg+xml',
    '.ico': 'image/x-icon',
};

const server = http.createServer((req, res) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
    
    // Remove query string
    let filePath = req.url.split('?')[0];
    
    // Determine the file to serve
    if (filePath === '/') {
        filePath = '/index.html';
    } else {
        // Check if the requested path exists as a file
        const fullPath = path.join(__dirname, filePath);
        
        // If the file doesn't exist and it's not a static asset, serve index.html
        if (!fs.existsSync(fullPath) || fs.statSync(fullPath).isDirectory()) {
            // For client-side routing, serve index.html
            filePath = '/index.html';
        }
    }
    
    const fullPath = path.join(__dirname, filePath);
    const ext = path.extname(filePath);
    const mimeType = MIME_TYPES[ext] || 'text/plain';
    
    fs.readFile(fullPath, (err, data) => {
        if (err) {
            res.writeHead(404, { 'Content-Type': 'text/plain' });
            res.end('404 Not Found');
            return;
        }
        
        res.writeHead(200, { 'Content-Type': mimeType });
        res.end(data);
    });
});

server.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}/`);
    console.log('Press Ctrl+C to stop');
});
