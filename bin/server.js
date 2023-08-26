const WebSocket = require('ws');
const fs = require('fs');
const { EventEmitter } = require('events');
const eventEmitter = new EventEmitter();


// Server is used so that we can monitor files and then reload the extension.
const server = new WebSocket.Server({ port: 46532 });

function createServer(folderWatch) {
    server.on('connection', (socket) => {
        console.log('Client connected');

        socket.on('message', (message) => {
            console.log(`Received: ${message}`);
        });

        socket.send('Hello, client!');

        socket.on('close', (code, reason) => {
            console.log('Client disconnected:', code, reason);
            eventEmitter.emit('socketClosed');
        });
    });
    
    let debounceTimer;
    fs.watch(folderWatch, (eventType, filename) => {
        if (eventType === 'change') {
            clearTimeout(debounceTimer);
            debounceTimer = setTimeout(() => {
                sendMessage({ from: 'web-forge', function: 'reloadExtension' });
            }, 500);
        }
    });
}

module.exports = {
    createServer,
    server,
    eventEmitter
};