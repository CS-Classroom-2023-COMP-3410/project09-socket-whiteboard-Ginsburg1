const express = require('express');
const http = require('http');
const socketIo = require('socket.io');

const app = express();
app.use(express.static('public')); // Serve static files from /public

const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: '*',
    methods: ["GET", "POST"]
  }
});

let boardState = []; // In-memory board state for drawing actions

io.on('connection', (socket) => {
  console.log(`Client connected: ${socket.id}`);

  // Send the full board state to new client
  socket.emit('boardState', boardState);

  // Listen for drawing events from client, store and broadcast to others
  socket.on('drawing', (data) => {
    boardState.push(data);
    socket.broadcast.emit('drawing', data);
  });

  // Listen for board clear events, reset state and notify all
  socket.on('clearBoard', () => {
    boardState = [];
    io.emit('clearBoard');
  });

  socket.on('disconnect', () => {
    console.log(`Client disconnected: ${socket.id}`);
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
