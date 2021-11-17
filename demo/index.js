const http = require('http');
const fs = require('fs');
const path = require('path');
const Corrosion = require('../lib/server');

const server = http.createServer();
const proxy = new Corrosion({
    codec: 'xor',
    prefix: '/service/',
    requestMiddleware: [Corrosion.middleware.https()]
});

proxy.bundleScripts();

server.on('request', (request, response) => {
    if (request.url.startsWith(proxy.prefix)) return proxy.request(request, response);
    response.end(fs.readFileSync(__dirname + '/index.html', 'utf-8'));
}).on('upgrade', (clientRequest, clientSocket, clientHead) => proxy.upgrade(clientRequest, clientSocket, clientHead)).listen(8443);
