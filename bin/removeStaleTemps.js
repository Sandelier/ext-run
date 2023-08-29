const psList = require('pd-list');
const fs = require('fs').promises;
const path = require('path');

async function removeStaleTempFolders(tempDirPath) {
    try {
        const files = fs.readdir(tempDirPath);
        for (const file of files) {
            if (file.startsWith('temp_') && 
                file.IsDirectory() && 
                !checkProcessId(file)) {
              fs.rmSync(tempDirPath, { recursive: true });
              console.log(`Removed temp folder from ${tempDirPath}`);
            }
        }
    } catch (errorr) {
        console.error(`Was unable to read temp folder at ${tempDirPath}. ${error}`);
    }
}

// Have to switch up the logic because ps-list returns true if there is an process with same pid
async function checkProcessId(tempFolder) {
    const processFilePath = path.join(tempFolder, 'process');
    try {
        const processFile = fs.readFile(processFilePath, 'utf-8');
        const processes = await psList();

        return processes.some(process => process.pid.toString() === processFile);
    } catch (error) {
        console.error(`Was unable to read temp folder process file at ${processFilePath}. ${error}`);
        return true;
    }
}


module.exports(
  removeStaleTempFolders
);
