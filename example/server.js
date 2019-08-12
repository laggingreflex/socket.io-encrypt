const http = require('http');
const SocketIO = require('socket.io');
const encrypt = require('socket.io-encrypt');

const server = http.createServer();
const io = SocketIO(server);

io.use(encrypt('secret'));

server.listen(3000, error => {
  if (error) console.error(error);
  else console.log('Listening at 3000');
});

io.on('connect', socket => {
  console.log('Connected:', socket.id);
  socket.on('message', data => {
    console.log('Message from', socket.id, data);
  });
  socket.on('error', console.error);
});
