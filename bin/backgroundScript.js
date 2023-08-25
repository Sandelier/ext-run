

// This is injected into the temp addon on load.
// And the reason is because it needs to reoad the extension when file updating is detected.


let socket;

function connectWebSocket() {
  socket = new WebSocket("ws://your.websocket.url");

  socket.onopen = function (event) {
    console.log("WebSocket connection opened");
    socket.send("Hello Test");
  };

  socket.onmessage = function (event) {
    console.log("WebSocket message received:", event.data);
  };

  socket.onclose = function (event) {
    console.log("WebSocket connection closed", event);
    // You might want to implement reconnect logic here
  };
}

connectWebSocket();