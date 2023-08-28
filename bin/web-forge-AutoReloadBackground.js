

// This is injected into the temp addon on load.
// And the reason is because it needs to reoad the extension when file updating is detected.


let socket = new WebSocket("ws://localhost:46532");

// It should be that the websocket sends like an unique thing to the client so then you could have multiple connections.
function connectWebSocket() {
    socket.onmessage = function (event) {
      try {
        const message = JSON.parse(event.data);
        if (message.from === "WebForge") {
          const action = message.action;

          switch (action) {
            case "WebForge-ReloadExtension":
              chrome.runtime.reload();
              break;
          }
        };
      } catch (error) {}

    socket.onclose = function (event) {
      console.log("WebSocket connection closed", event);
    };
  }
}

connectWebSocket();