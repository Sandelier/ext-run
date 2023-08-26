const WebSocket = require('ws');
const fs = require('fs');

// Server is used so that we can monitor files and then reload the extension.
const server = new WebSocket.Server({ port: 46532 });
const clients = new Set();

// It should be that the websocket sends like an unique thing to the client so then you could have multiple connections.
function createServer(folderWatch) {
    server.on('connection', (socket) => {
        console.log('Client connected');
        clients.add(socket);
        
        socket.on('message', (message) => {
            console.log(`Received: ${message}`);
        });

        
        socket.send('Hello, client!');
    });

    function sendMessage(message) {
        clients.forEach(client => {
            client.send(JSON.stringify(message));
        });
    }

    server.on('close', (reasonCode, description) => {
        if (clients.size() < 1) {
            
        }
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

module.exports = createServer;