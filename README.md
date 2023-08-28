# Work in progress.

### web-forge

Web-forge is a command-line tool designed to launch multiple browsers with temporary extensions with automatic reloading. This tool is built to work with npm and is compatible with Chrome, Edge and Brave but there will be more browsers later on.

### Features
- Launches multiple browsers with specific extension
- Automatic reloading

### How it works
When you run "web-forge -b <browser>" to launch an extension, the following steps are taken:

1. web-forge creates an temporary extension folder for your extension.
2. It injects an background script into the temporary extension and modifies manifest.json to allow websocket connections
3. Local server is created to create an websocket server that talks with background script to reload your extension.
4. When the local server detects an source code modification in your extension folder it will send an message to background script to reload your extension.

### Installation
To use web-forge you need to have npm installed on your system.

Once npm is installed, you can install web-forge globally using the following command
```npm install -g web-forge```

### Usage
Here are couple examples of how to use web-forge

- Launching chrome with custom arguments:
  ```web-forge -b chrome -args "--kiosk"```
- Launching Microsoft edge with a specific extension path:
  ```web-forge -b edge -p "path/to/extension"```
- Launching both Chrome and Edge simultaneously:
  ```web-forge -b "chrome,edge```

### License
Web-forge is using Mit license.

### Plans
Current plans are:
  - Making better error handling because currently there is practically none.
  - Making the extension work with multiple browsers like firefox and other chromium based browsers. 
  - Making it that you can give it the browser exe location.
  - Testing
  - Then publishing it to npm.
