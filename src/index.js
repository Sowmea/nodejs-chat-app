const express = require('express');
const path = require('path');
const socketio = require('socket.io');
const http = require('http');
const Filter = require('bad-words');

const {
  generateMessage,
  generateLocationMessage
} = require('./utils/messages');

const {
  addUser,
  removeUser,
  getUser,
  getUsersInRoom
} = require('./utils/users');
const app = express();
const server = http.createServer(app);
const io = socketio(server);
const port = process.env.PORT || 3000;

const publicDirectoryPath = path.join(__dirname, '../public');

// Set up static directory to serve
app.use(express.static(publicDirectoryPath));
let count = 0;

io.on('connection', socket => {
  console.log('New WebSocket connection');

  // Connects to chat page
  socket.on('join', (options, callback) => {
    const { error, user } = addUser({ id: socket.id, ...options });

    console.log(user);
    if (error) {
      return callback(error);
    }

    socket.join(user.room);

    socket.emit('message', generateMessage('Welcome!', 'Admin'));
    socket.broadcast
      .to(user.room)
      .emit(
        'message',
        generateMessage(`${user.username} has joined!`, 'Admin')
      );

    io.to(user.room).emit('roomData', {
      room: user.room,
      users: getUsersInRoom(user.room)
    });

    callback();
    // socket.emit, io.emit, socket.broadcast.emit
    // io.to.emit, socket.broadcast.to.emit
  });

  socket.on('sendMessage', (message, callback) => {
    const filter = new Filter();
    const { room, username } = getUser(socket.id);

    if (filter.isProfane(message)) {
      return callback('Profanity is not allowed');
    }

    io.to(room).emit('message', generateMessage(message, username));
    callback();
  });

  socket.on('sendLocation', (coords, callback) => {
    const { room, username } = getUser(socket.id);
    io.to(room).emit(
      'locationMessage',
      generateLocationMessage(
        username,
        `https://google.com/maps?q=${coords.latitude},${coords.longitude}`
      )
    );
    callback();
  });

  socket.on('disconnect', () => {
    const user = removeUser(socket.id);
    if (user) {
      io.to(user.room).emit(
        'message',
        generateMessage(`${user.username} has left!`, 'Admin')
      );
      io.to(user.room).emit('roomData', {
        room: user.room,
        users: getUsersInRoom(user.room)
      });
    }
  });
});

server.listen(port, () => {
  console.log('Listening on port ' + port);
});
