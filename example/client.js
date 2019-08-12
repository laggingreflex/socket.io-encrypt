const SocketIO = require('socket.io-client');
const encrypt = require('socket.io-encrypt');

const socket = SocketIO('http://localhost:3000');
encrypt('secret')(socket);

socket.on('connect', () => {
  console.log('Connected');
  socket.emit('message', { message: 'my secret message' });
})
