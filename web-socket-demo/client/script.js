const url = `ws://localhost:9876`;
const server = new WebSocket(url);

const messages = document.getElementById('messages');
const input = document.getElementById('message-input');
const button = document.getElementById('send-button');

button.disabled = true;
button.addEventListener('click', sendMessage, false);

server.onopen = function() {
  button.disabled = false;
  server.send("Hello");
}

server.onerror = function() {
  generateMessageEntry("Error connecting to server, please refresh", 'Server');
}

server.onmessage = function(event) {
  const { data } = event;
  generateMessageEntry(data, 'Server');
}

function sendMessage() {
  const text = input.value;
  generateMessageEntry(text, 'Client');
  server.send(text);
}

function generateMessageEntry(message, type) {
  const newMessage = document.createElement('div');
  newMessage.innerHTML =  `${type} says: ${message}`;
  messages.appendChild(newMessage);
}

document.addEventListener("keydown", function(event) {
  if (event.key === "Enter") {
      button.click();
  }
});

