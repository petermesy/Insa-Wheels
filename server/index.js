const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const http = require('http');
const socketIo = require('socket.io');
require('dotenv').config();
const authRoutes = require('./routes/auth');
const vehicleRoutes = require('./routes/vehicles');
const userRoutes = require('./routes/users');
const locationRoutes = require('./routes/locations');
// REMOVE this line:
// const http = require('http').createServer(app);

const app = express();
const PORT = process.env.PORT || 4000;

const server = http.createServer(app);
// Initialize Socket.io
const io = socketIo(server, { cors: { origin: '*' } });
app.set('io', io);

// // Socket.IO room join/leave logic
// io.on('connection', (socket) => {
//   socket.on('joinRoom', (room) => {
//     socket.join(room);
//   });
//   socket.on('leaveRoom', (room) => {
//     socket.leave(room);
//   });
// });

app.use('/api/locations', locationRoutes);
// Middleware
app.use(cors());
app.use(bodyParser.json());

// Pass io to routes that need it
app.use((req, res, next) => {
  req.io = io;
  next();
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/vehicles', vehicleRoutes);
app.use('/api/users', userRoutes);
app.use('/api', locationRoutes);

// Basic route
app.get('/', (req, res) => {
  res.json({ message: 'Welcome to INSA-Wheels Tracker API' });
});

// Socket.io connection handler
io.on('connection', (socket) => {
  console.log('New client connected');
  
  socket.on('disconnect', () => {
    console.log('Client disconnected');
  });
});

// Start server
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
