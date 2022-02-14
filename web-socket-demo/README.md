## Reference
https://www.npmjs.com/package/ws

## Background
In browser, there is an object in the terminal: __window.WebSocket__

WebSocket(url, protocols)  
In WebSocket, you can send and receive messages back and forth in a single connection.

## Setting
```
>> cd web-socket
>> npm init -y
>> npm i ws --save
```

## Note
### Compare Http and WebSocket
- https & http  
- wss & ws  

### Browser Client Code for WebSocket
```javascript
const ws = new WebSocket(`ws://127.0.0.1:9876`);
ws.onmessage = function(event) {
    console.log(event)
};
ws.send("Hi");
ws.close();
```

WebSocket status, which is ws.readyState:
- WebSocket.OPEN
- WebSocket.CLOSED
- WebSocket.CONNECTING
- WebSocket.CLOSING

### Combine Express and WebSocket
```javascript
const WebSocket = require('ws');
const express = require('express');
const app = express();
const path = require('path');

app.use('/', express.static(path.resolve(__dirname, '../client')));

const server = app.listen(9876);

const wss = new WebSocket.Server({
    server
});

wss.on('connection', function(ws) {
    ws.on('message', function(data) {
        wss.clients.forEach(client => {
            if (client.readyState === WebSocket.OPEN) {
                client.send(data.toString('utf-8'));
            }
        });
    });
});
```

### Verify Client
```javascript
const wss = new WebSocket.Server({
    server,
    verifyClient: (info) => {
        console.log(info);
        return false;
    }
});
```
