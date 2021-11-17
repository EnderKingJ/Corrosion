# Corrosion

Titanium Networks main web proxy.
Successor to [Alloy](https://github.com/titaniumnetwork-dev/alloy).

## Table of Contents
- [Corrosion](#corrosion)
  - [Table of Contents](#table-of-contents)
- [Installation](#installation)
- [Basic Example](#basic-example)
- [Public Deployment Example](#public-deployment-example)
  - [Initial Setup](#initial-setup)
  - [Testing](#testing)
  - [Persistence](#persistence)
    - [PM2](#pm2)
    - [systemd](#systemd)
  - [Nginx Setup](#nginx-setup)
  - [Letsencrypt](#letsencrypt)
  - [Frontend Examples](#frontend-examples)
- [Advanced Configuration](#advanced-configuration)
- [Middleware](#middleware)
    - [Default middleware](#default-middleware)
    - [Available Middleware](#available-middleware)
      - [address (Request)](#address-request)
      - [blacklist](#blacklist)
- [Contributing](#contributing)
  - [Needs Improvement](#needs-improvement)
- [Todo](#todo)

# Installation

```
npm i corrosion
```

# Basic Example

```javascript
const Corrosion = require('corrosion');
const proxy = new Corrosion();
const http = require('http')
http.createServer((req, res) => 
  proxy.request(req, res) // Request Proxy
).on('upgrade', (req, socket, head) => 
  proxy.upgrade(req, socket, head) // WebSocket Proxy
).listen(80);
```

Access a website by going to `/prefix/gateway?url=URL`.

Much more in depth one is in the [demo folder](demo/).

# Public Deployment Example

For implementing a Corrosion server into your production website, we recommend you follow the below configuration.

## Initial Setup

`index.html`

```html
<!DOCTYPE html>
<html>
    <head>
        <style>
            body {
                text-align: center;
            }
        </style>
    </head>
    <body>
        <form action="/get/gateway/" method="POST">
            <input name="url" placeholder="Search the web">
            <input type="submit" value="Go">
        </form>
    </body>
</html>
```

`index.js`

```javascript
const http = require('http');
const fs = require('fs');
const path = require('path');
const Corrosion = require('corrosion');

const server = http.createServer();
const proxy = new Corrosion({
    codec: 'xor', // apply basic xor encryption to url parameters in an effort to evade filters. Optional.
    prefix: '/get/' // specify the endpoint (prefix). Optional.
});

proxy.bundleScripts();

server.on('request', (request, response) => {
    if (request.url.startsWith(proxy.prefix)) return proxy.request(request, response);
    response.end(fs.readFileSync(__dirname + '/index.html', 'utf-8'));
}).on('upgrade', (clientRequest, clientSocket, clientHead) => proxy.upgrade(clientRequest, clientSocket, clientHead)).listen(8443); // port other than 443 if it is needed by other software.
```
## Frontend Examples

[Holy Unblocker](https://github.com/titaniumnetwork-dev/Holy-Unblocker)

[Incognito](https://github.com/titaniumnetwork-dev/Incognito)

[Vanadium](https://github.com/titaniumnetwork-dev/Vanadium)

[Reborn](https://github.com/titaniumnetwork-dev/Reborn)

# Advanced Configuration
```javascript
{
   'prefix': '/get/', // String - URL Prefix
   'title': 'Woah Corrosion', // (Boolean / String) - Title used for HTML documents
   'ws': true, // Boolean - WebSocket rewriting
   'cookie': true, // Boolean - Request Cookies
   'codec': 'base64', // String - URL encoding (base64, plain, xor).
   'requestMiddleware': [Corrosion.middleware.address([0.0.0.0])] // Array - Array of [middleware](../README.md#middleware) functions for proxy request (Server). 
   'responseMiddleware': [myCustomMiddleware()] // Array - Array of [middleware](../README.md#middleware) functions for proxy response (Server).
   'standardMiddleware': true // Boolean - Use the prebuilt [middleware](../README.md#middleware) used by default (Server). 
}
```

# Middleware

Middleware are functions that will be executed either before request or after response. These can alter the way a request is made or response is sent.

```javascript
function(ctx) {r
  ctx.body; // (Request / Response) Body (Will return null if none)
  ctx.headers; // (Request / Response) Headers
  ctx.url; // WHATWG URL
  ctx.flags; // URL Flags
  ctx.origin; // Request origin
  ctx.method; // Request method
  ctx.rewrite; // Corrosion object
  ctx.statusCode; // Response status (Only available on response)
  ctx.agent; // HTTP agent
  ctx.address; // Address used to make remote request
  ctx.clientSocket; // Node.js Server Socket (Only available on upgrade)
  ctx.clientRequest; // Node.js Server Request
  ctx.clientResponse; // Node.js Server Response
  ctx.remoteResponse; // Node.js Remote Response (Only available on response)
};
```

### Default middleware

- Request
  - requestHeaders

- Response
  - responseHeaders
  - decompress
  - rewriteBody

### Available Middleware

#### address (Request)
  - `arr` Array of IP addresses to use in request.

```javascript
const Corrosion = require('corrosion');
const proxy = new Corrosion({
  requestMiddleware: [
    Corrosion.middleware.address([ 
      0.0.0.0, 
      0.0.0.0 
    ]),  
  ],
});
```

#### blacklist
  - `arr` Array of hostnames to block clients from seeing.
  -  `page` Block page.

```javascript
const Corrosion = require('corrosion');
const proxy = new Corrosion({
  requestMiddleware: [
    Corrosion.middleware.blacklist([ 
      'example.org',
      'example.com',
    ], 'Page is blocked'),  
  ],
});
```

# Contributing

[API Documentation.](https://github.com/titaniumnetwork-dev/Corrosion/wiki/API)

See something lacking in Corrosion that you can fix? Fork the repo, make some changes, and send in a pull request.

## Needs Improvement
 - Code readability/commenting
 - Documentation (wiki)
 - JS Rewriter
 - Uniform error codes

# Todo

- JS Rewriter: Inject header properties (due to import statements).
