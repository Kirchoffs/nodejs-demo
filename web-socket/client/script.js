const url = `ws://localhost:9876`;
const server = new WebSocket(url);

const messages = document.getElementById('messages');
const input = document.getElementById('message');
const button = document.getElementById('send');

button.disabled = true;
button.addEventListener('click', sendMessage, false);

server.onopen = function() {
  button.disabled = false;
  server.send("Hello");
}

server.onmessage = function(event) {
  const { data } = event;
  generateMessageEntry(data, 'Server');
}

function generateMessageEntry(message, type) {
  const newMessage = document.createElement('div');
  newMessage.innerHTML =  `${type} says: ${message}`;
  messages.appendChild(newMessage);
}

function sendMessage() {
  const text = input.value;
  generateMessageEntry(text, 'Client');
  server.send(text);
}