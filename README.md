# Web-forge

Web-forge is an npm command-line library designed to facilitate the easy building and testing of extensions. It automatically detects updates made within the extension folder and subsequently reloads the extension in the browser.

### Why should i use this?
- While tools like 'web-ext' are excellent for Firefox extensions, they are tailored specifically for that browser. However, if you are working with Chrome, Brave, and Edge as well, then 'web-forge' might be a good option for you, as it can handle all four of those browsers.

### Installation
- You can install web-forge with ```npm install -g web-forge```

### How it works
- When you call 'web-forge' to run an extension, it first creates a temporary folder for your extension. Then, it injects a background script and modifies 'metadata.json' to allow these changes. The injected background script starts listening to a local websocket server, which is created when you run the extension. This server waits for the signal to reload your extension whenever it detects any file changes in the extension folder.

### Commands
- Running
  - To run your extension, use the command: web-forge <browser> "path/to/ext" "optional arguments"
  - The 'browser' parameter accepts values like "ch/chrome," "br/brave," "ff/firefox," and "edge/msedge."
  - The 'path' parameter is not necessary; you can leave it as an empty string, and the code will assume that the directory in your terminal is the extension directory.
  - The "optional arguments" field accommodates default arguments related to the chosen browser. For instance, when working with Chrome, you can include arguments like "--incognito."
- Building