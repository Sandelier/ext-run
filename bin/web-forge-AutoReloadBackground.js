

// This is injected into the temp addon on load.
// And the reason is because it needs to reoad the extension when file updating is detected.


let socket;

// It should be that the websocket sends like an unique thing to the client so then you could have multiple connections.
function connectWebSocket() {
  socket = new WebSocket("ws://localhost:46532");

  socket.onmessage = function (event) {
    if (event.data == "reload") {
      reloadExtension();
    }
  };

  socket.onclose = function (event) {
    console.log("WebSocket connection closed", event);
  };
}


// Uses try and catch to check what browser you are using.
const browserType = detectBrowser();
function detectBrowser() {
  try {
    if (typeof browser !== 'undefined') {
      return 'Firefox';
    }
  } catch (error) {}

  try {
    if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.getBrowserInfo) {
      return 'Chromium';
    }
  } catch (error) {}

  return undefined;
}


function reloadExtension() {
  switch (browserType) {
    case 'Firefox':
      browser.runtime.reload();
      break;
    case 'Chromium':
      chrome.runtime.reload();
      break;
    default: 
      console.log("Unsupported browser");
  }
}

connectWebSocket();