const WebSocket = require('ws');
const fs = require('fs');
const { EventEmitter } = require('events');
const eventEmitter = new EventEmitter();
const crypto = require('crypto');


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

    const previousChecksums = {};

    initializeChecksums(folderWatch);
    // Initilizing them so we can have all current checksums right away.
    function initializeChecksums(directory) {
        const items = fs.readdirSync(directory);
        for (const item of items) {
            const itemPath = `${directory}/${item}`;
            const stats = fs.statSync(itemPath);
            if (stats.isFile()) {
                previousChecksums[itemPath] = calculateFileChecksum(itemPath);
            } else if (stats.isDirectory()) {
                initializeChecksums(itemPath);
            }
        }
    }

    let isFirstEvent = true;
    let debounceTimer;

    fs.watch(folderWatch, { recursive: true }, (eventType, filename) => {
        // First event is for subdirectorys because fs.watch triggers multiple event changes one for subdirectory and one for the parent directory.
        if (isFirstEvent) {
            // debouncetimer used because multiple events triggered per change.
            clearTimeout(debounceTimer);
            debounceTimer = setTimeout(() => {
                isFirstEvent = true; 
            }, 100);

            const filePath = `${folderWatch}/${filename}`;
            console.log(filePath);
            console.log(eventType);
            if (eventType === 'change') {
                handleFileChange(filePath);
            } else if (eventType === 'rename') {
                if (!fs.existsSync(filePath)) {
                    console.log("File or folder removed:", filePath);
                    deleteChecksumsRecursively(filePath);
                } else {
                    const stats = fs.statSync(filePath);
                    if (stats.isFile()) {
                        handleFileChange(filePath);
                    } else if (stats.isDirectory()) {
                        console.log("Folder added or renamed:", filePath);
                        deleteChecksumsRecursively(filePath);
                    }
                }
            }
            isFirstEvent = false;
        }
    });

    function handleFileChange(filePath) {
        const currentChecksum = calculateFileChecksum(filePath);

        if (previousChecksums[filePath] && previousChecksums[filePath] !== currentChecksum) {
            console.log("File contents changed:", filePath);
        }

        previousChecksums[filePath] = currentChecksum;
    }

    // Used so we know if the checksum is different = file content changed.
    function calculateFileChecksum(filePath) {
        const fileData = fs.readFileSync(filePath);
        return crypto.createHash('md5').update(fileData).digest('hex');
    }

    function deleteChecksumsRecursively(directory) {
        for (const key in previousChecksums) {
            if (key.startsWith(directory)) {
                delete previousChecksums[key];
            }
        }
    }
}

module.exports = {
    createServer,
    server,
    eventEmitter
};