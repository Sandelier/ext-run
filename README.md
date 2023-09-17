# Work in progress.

### ext-run

ext-run is a command-line tool designed to launch multiple browsers with temporary extensions with automatic reloading. This tool is built to work with npm and is compatible with Chrome, Edge and Brave but there will be more browsers later on. ext-run size is ~600kb but when you launh it the browser specific userfolder sizes are like 20mb+ each. ext-run does handle the removing of temporary userfolders.

### Features
- Launches multiple browsers with specific extension
- Automatic reloading

### How it works
When you run "ext-run -b <browser>" to launch an extension, the following steps are taken:

1. ext-run creates an temporary extension folder for your extension.
2. It injects an background script into the temporary extension and modifies manifest.json to allow websocket connections
3. Local server is created to create an websocket server that talks with background script to reload your extension.
4. When the local server detects an source code modification in your extension folder it will send an message to background script to reload your extension.

### Installation
To use ext-run you need to have npm installed on your system.

Once npm is installed, you can install ext-run globally using the following command
```npm install -g ext-run```

### Usage
Here are couple examples of how to use ext-run

- Launching chrome with custom arguments:
  ```ext-run -b chrome -args "--kiosk"```
- Launching Microsoft edge with a specific extension path:
  ```ext-run -b edge -p "path/to/extension"```
- Launching both Chrome and Edge simultaneously:
  ```ext-run -b "chrome,edge```

### License
ext-run is using Mit license.

### Librarys
ext-run uses the following librarys:
- [Commander](https://www.npmjs.com/package/commander). Used to create commands easily.
- [uuid](https://www.npmjs.com/package/uuid). Used to generate an unique temporary folder.
- [ws](https://www.npmjs.com/package/ws). Used to create websockets.
- [is-running](https://www.npmjs.com/package/is-running). Used to check if pid is on use to determine should we remove the stale temp folder.

### Plans
Current plans are:
  - Making better error handling because currently there is practically none.
  - Making the extension work with multiple browsers like firefox and other chromium based browsers. 
  - Making it that you can give it the browser exe location.
  - Need to organize and refactor the code.
  - Testing
  - Then publishing it to npm.
