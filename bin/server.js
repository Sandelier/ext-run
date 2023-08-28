const WebSocket = require('ws');
const fs = require('fs');
const crypto = require('crypto');
const path = require('path');


// Server is used so that we can monitor files and then reload the extension.

// Loop to try to get available websocket.
let initialPort = 46532;
let server;
while (initialPort < 46632) {
  try {
     server = new WebSocket.Server({ port: initialPort )};
     break;
  } catch (error) 
    initialPort += 1;
  }
}

const clients = new Set();

function createServer(folderWatch, tempDirPath) {
    server.on('connection', (socket) => {
        clients.add(socket);
    });

    function sendMessage(actionMessage) {
        for (const client in clients) {
            client.send(JSON.stringify({ from: "WebForge", action: actionMessage}));
        }
    }

    let debounceTimer_Update;
    function updateTempExtension(filePath, type) {
        const fileModified = path.relative(folderWatch, filePath);
        const tempFile_Relative_To_FileModified = path.join(tempDirPath, 'extension', fileModified);
        if (type === "copy") {
            // If the directory dosent exist.
            const destinationDir = path.dirname(tempFile_Relative_To_FileModified);
            if (!fs.existsSync(destinationDir)) {
                fs.mkdirSync(destinationDir, { recursive: true });
            }
        
            fs.copyFile(filePath, tempFile_Relative_To_FileModified, (err) => {
                if (err) {
                    console.error('Error copying file:', err);
                } else {
                    console.log('File copied successfully!');
                }
            });
        } else if (type === "delete") {
            fs.rmSync(tempFile_Relative_To_FileModified, { recursive: true });
        }
        clearTimeout(debounceTimer_Update);
        debounceTimer_Update = setTimeout(() => {
            sendMessage("WebForge-ReloadExtension");
        }, 200);
    }


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

    // Watches the extension folder and modifies temporary folder based on extension folder.
    fs.watch(folderWatch, { recursive: true }, (eventType, filename) => {
        const filePath = path.join(folderWatch, filename);
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
    });

    function handleFileChange(filePath) {
        const currentChecksum = calculateFileChecksum(filePath);

        if (previousChecksums[filePath] !== currentChecksum) {
            updateTempExtension(filePath, "copy");
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
        updateTempExtension(directory, "delete");
    }
}

module.exports = {
    createServer,
    server
};