const fs = require('fs').promises;
const path = require('path');
const isRunning = require('is-running');


// Used so we can remove stale temp folders because they can happen in example if user forces cmd to close.
async function removeStaleTempFolders(tempDirPath) {
    try {
        tempDirPath = path.dirname(tempDirPath);
        const files = await fs.readdir(tempDirPath);
        for (const file of files) {
            if (file.startsWith('temp_')) {
                const isDir = await isDirectory(path.join(tempDirPath, file));
                const isProcessRunning = await checkProcessId(path.join(tempDirPath, file));
                if (isDir) {
                    if (!isProcessRunning) {
                        await fs.rm(path.join(tempDirPath, file), {
                            recursive: true
                        });
                        console.log(`Removed temp folder from ${tempDirPath}`);
                    }
                }
            }
        }
    } catch (error) {
        console.error(`Was unable to read temp folder at ${tempDirPath}. ${error}`);
    }
}

async function isDirectory(filePath) {
    try {
        const stats = await fs.stat(filePath);
        return stats.isDirectory();
    } catch (error) {
        console.error(`Error checking if ${filePath} is a directory. ${error}`);
        return false;
    }
}

// Have to switch up the logic because ps-list returns true if there is an process with same pid
async function checkProcessId(tempFolder) {
    const processFilePath = path.join(tempFolder, 'process');
    try {
        const processFile = await fs.readFile(processFilePath, 'utf-8');
        const processIds = processFile.split(',');

        return processIds.some(processid => {
            return isRunning(parseInt(processid));
        });
    } catch (error) {
        console.error(`Was unable to read temp folder process file at ${processFilePath}. ${error}`);
        return true;
    }
}


module.exports = {
    removeStaleTempFolders
};