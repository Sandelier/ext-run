const fs = require('fs').promises;
const path = require('path');

// Gonna add error handling later.

// Goes through the extension folder and copies them to the temp folder. If it finds an manifest.json it also modifies it and adds an background script next to it.
async function copyDirectory(source, destination) {
    try {
        await fs.mkdir(destination);
        const files = await fs.readdir(source);

        for (const file of files) {
            const sourcePath = path.join(source, file);
            const destPath = path.join(destination, file);

            const stats = await fs.stat(sourcePath);
            if (stats.isDirectory()) {
                await copyDirectory(sourcePath, destPath);
            } else {
                await fs.copyFile(sourcePath, destPath);
            }
        }
    } catch (error) {
        console.error('Error copying directory:', error);
    }
}

async function createTempExtension(ext, tempDirPath, port) {
    try {

        const manifestExists = await fs.access(path.join(ext, 'manifest.json'), fs.constants.F_OK)
            .then(() => true)
            .catch(() => false);

        if (!manifestExists) {
            console.log(`Did not find extension manifest in ${ext}`);
            return false;
        }

        await fs.mkdir(path.join(tempDirPath, 'userFolder'));
        await fs.mkdir(path.join(tempDirPath, 'extension'));
        const files = await fs.readdir(ext);

        const tempExtensionPath = path.join(tempDirPath, 'extension');
        let manifestLock = false;
        for (const file of files) {
            const extFilePath = path.join(ext, file);
            const tempPath = path.join(tempExtensionPath, file);

            const stats = await fs.stat(extFilePath);
            if (stats.isDirectory()) {
                await copyDirectory(extFilePath, tempPath);
            } else {
                if (file === 'manifest.json') {
                    if (!manifestLock) {
                        manifestLock = true;
                        await Promise.all([
                            modifyManifest(extFilePath, tempDirPath, port),
                            addBackgroundScript(tempPath, port)
                        ]);
                    }
                } else {
                    await fs.copyFile(extFilePath, tempPath);
                }
            }
        }
        return true;
    } catch (error) {
        console.error('Error copying directory:', error);
        return false;
    }
}

// Modifies the manifest to include the background script.
async function modifyManifest(extFilePath, tempDirPath, port) {

    const manifestContent = await fs.readFile(extFilePath, 'utf-8');
    const parsedManifest = JSON.parse(manifestContent);

    parsedManifest.background = parsedManifest.background || {};
    parsedManifest.background.scripts = parsedManifest.background.scripts || [];
    parsedManifest.background.scripts.push("ext-run-AutoReloadBackground.js");

    const newConnections = `ws://localhost:${port}`;

    parsedManifest.content_security_policy = parsedManifest.content_security_policy || "";

    const connectSrcRegex = /connect-src/;
    // Making the manifest allow websocket server in the port.
    if (!connectSrcRegex.test(parsedManifest.content_security_policy)) {
        parsedManifest.content_security_policy += ` connect-src ${newConnections};`;
    } else {
        parsedManifest.content_security_policy = parsedManifest.content_security_policy.replace(
            /connect-src(.*?)(?=(;|$))/,
            `connect-src$1 ${newConnections}`
        );
    }

    const modifiedManifestContent = JSON.stringify(parsedManifest, null, 2);
    const tempManifestPath = path.join(tempDirPath, 'extension', 'manifest.json');
    await fs.writeFile(tempManifestPath, modifiedManifestContent, 'utf-8');
}


async function addBackgroundScript(tempPathFile, port) {
    const tempPathFolder = path.dirname(tempPathFile);
    const backgroundScriptPath = path.join(__dirname, "ext-run-AutoReloadBackground.js");
    const destPath = path.join(tempPathFolder, "ext-run-AutoReloadBackground.js");

    // Modifying the port on backgroundScript to use the current port.
    try {
        const data = await fs.readFile(backgroundScriptPath, 'utf8');

        const modifiedPort = data.replace(
            /let socket = new WebSocket\("ws:\/\/localhost:\d+"\);/,
            `let socket = new WebSocket("ws://localhost:${port}");`
        );

        await fs.writeFile(destPath, modifiedPort, 'utf8');
    } catch (error) {
        console.error('An error occurred:', error);
    }
}


module.exports = createTempExtension;