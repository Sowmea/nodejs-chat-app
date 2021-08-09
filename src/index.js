const express = require('express');
const path = require('path');
const socketio = require('socket.io');
const http = require('http');

const app = express();
const server = http.createServer(app);
const io = socketio(server);
const port = process.env.PORT || 3000;

const publicDirectoryPath = path.join(__dirname, '../public');

// Set up static directory to serve
app.use(express.static(publicDirectoryPath));
let count = 0;
io.on('connection', socket => {
  console.log('New web socket connection');
  socket.emit('countUpdated', count);
  socket.on('increment', () => {
    count++;
    //socket.emit('countUpdated', count);
    io.emit('countUpdated', count);
  });
});
server.listen(port, () => {
  console.log('Listening on port ' + port);
});
