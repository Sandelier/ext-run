const fs = require('fs').promises;
const path = require('path');
const { v4: uuidv4 } = require('uuid');

// Gonna add error handling later.

const tempDirName = `temp_${uuidv4()}`;
const tempDirPath = path.join(__dirname, tempDirName);

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

async function createTempExtension(ext) {
    let manifestLock = false;
    
    try {
        await fs.mkdir(tempDirPath);
        await fs.mkdir(path.join(tempDirPath, 'userFolder'));
        const files = await fs.readdir(ext);
        
        for (const file of files) {
            const extFilePath = path.join(ext, file);
            const tempPath = path.join(tempDirPath, file);
            
            const stats = await fs.stat(extFilePath);
            if (stats.isDirectory()) {
                await copyDirectory(extFilePath, tempPath);
            } else {
                if (file === 'manifest.json') {
                    if (!manifestLock) {
                        manifestLock = true;
                        await Promise.all([
                            modifyManifest(extFilePath),
                            addBackgroundScript(extFilePath)
                        ]);
                    }
                } else {
                    await fs.copyFile(extFilePath, tempPath);
                }
            }
        }

        return tempDirPath;
    } catch (error) {
        console.error('Error copying directory:', error);
    }
}

// Modifies the manifest to include the background script.
// Have to later on check the permissions needed for the background script.
async function modifyManifest(extFilePath) {
    const manifestContent = await fs.readFile(extFilePath, 'utf-8');
    const parsedManifest = JSON.parse(manifestContent);

    parsedManifest.background = !parsedManifest.background ? {} : parsedManifest.background;
    parsedManifest.background.scripts = !parsedManifest.background.scripts ? [] : parsedManifest.background.scripts;

    parsedManifest.background.scripts.push("web-forge-AutoReloadBackground.js");

    const modifiedManifestContent = JSON.stringify(parsedManifest, null, 2);
    const tempManifestPath = path.join(tempDirPath, 'manifest.json');
    await fs.writeFile(tempManifestPath, modifiedManifestContent, 'utf-8');
}

async function addBackgroundScript(extFilePath) {
    const backgroundScriptPath = path.join(__dirname, "web-forge-AutoReloadBackground.js");
    await fs.copyFile(backgroundScriptPath, path.join(extFilePath, "web-forge-AutoReloadBackground.js"));
}

module.exports = createTempExtension;