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

const app = express();
const PORT = process.env.PORT || 4000;

const server = http.createServer(app);

// CORS for Express
app.use(cors());
app.use(bodyParser.json());

// Initialize Socket.io with CORS
const io = socketIo(server, {
  cors: {
    origin: '*', // In production, set this to your frontend domain
    methods: ['GET', 'POST']
  }
});
app.set('io', io);

// Socket.IO room join/leave logic
io.on('connection', (socket) => {
  console.log('New client connected');

  socket.on('joinRoom', (room) => {
    socket.join(room);
    console.log(`Socket ${socket.id} joined room ${room}`);
  });

  socket.on('leaveRoom', (room) => {
    socket.leave(room);
    console.log(`Socket ${socket.id} left room ${room}`);
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected');
  });
});

// Middleware to pass io to routes if needed
app.use((req, res, next) => {
  req.io = io;
  next();
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/vehicles', vehicleRoutes);
app.use('/api/users', userRoutes);
app.use('/api/locations', locationRoutes);

// Basic route
app.get('/', (req, res) => {
  res.json({ message: 'Welcome to INSA-Wheels Tracker API' });
});

// Example: Emit carLocationUpdate to a room (call this in your location update logic)
function emitCarLocationUpdate(driverId, locationData) {
  // For each employee assigned to this driver/vehicle, emit to their room
  // Example: io.to(`employee_${employeeId}`).emit('carLocationUpdate', locationData);
  // You need to call this from your location update logic, passing the right employee IDs
}

server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});