const http = require('http');
const fs = require('fs');
const path = require('path');

const server = https.createServer(ssl);
const Corrosion = require('../');
const proxy = new Corrosion({
    codec: 'xor',
    forceSSL: true,
});

proxy.bundleScripts();

server.on('request', (request, response) => {
    if (request.url.startsWith(proxy.prefix)) return proxy.request(request, response);
    response.end(fs.readFileSync(__dirname + '/index.html', 'utf-8'));
}).on('upgrade', (clientRequest, clientSocket, clientHead) => proxy.upgrade(clientRequest, clientSocket, clientHead)).listen(443);
