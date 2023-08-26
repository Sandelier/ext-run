

// This is injected into the temp addon on load.
// And the reason is because it needs to reoad the extension when file updating is detected.


let socket;

// It should be that the websocket sends like an unique thing to the client so then you could have multiple connections.
function connectWebSocket() {
  socket = new WebSocket("ws://localhost:46532");

  socket.onmessage = function (event) {
    if (event.data == "reload") {
      chrome.runtime.reload();
    }
  };

  socket.onclose = function (event) {
    console.log("WebSocket connection closed", event);
  };
}

connectWebSocket();