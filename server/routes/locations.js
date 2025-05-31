const express = require('express');
const router = express.Router();
const { validateToken } = require('../middleware/auth');
const db = require('../config/db');

// Apply auth middleware to most routes
router.use(validateToken);

// Location update endpoint for drivers
router.post('/car-location', async (req, res) => {
  try {
    // Get driverId from JWT token (req.user)
    const driverId = req.user.userId || req.user.id;
    const { location, altitude, accuracy, speed } = req.body;
    const io = req.app.get('io');

    if (!driverId || !location) {
      return res.status(400).json({ error: 'Driver ID and location are required' });
    }

    // Find the vehicle for this driver
    const vehicleRes = await db.query(
      `SELECT id, assigned_employees FROM vehicles WHERE driver_id = $1`,
      [driverId]
    );
    const vehicle = vehicleRes.rows[0];

    const locationData = {
      driverId,
      vehicleId: vehicle ? vehicle.id : null,
      location,
      altitude,
      accuracy,
      speed,
      timestamp: new Date()
    };

    // Emit to assigned employees
    if (vehicle && Array.isArray(vehicle.assigned_employees)) {
      for (const employeeId of vehicle.assigned_employees) {
        io.to(`employee_${employeeId}`).emit('carLocationUpdate', locationData);
      }
    }

    // Emit to all admins
    io.to('admin').emit('adminCarLocationUpdate', locationData);

    console.log('Location update received and sent to employees and admin:', locationData);
    res.status(200).json({ success: true });
  } catch (error) {
    console.error('Error updating location:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Example: join room endpoint (optional, for admin to join 'admin' room)
router.post('/join-room', (req, res) => {
  const { socketId, role } = req.body;
  const io = req.app.get('io');
  if (role === 'admin' && socketId) {
    io.sockets.sockets.get(socketId)?.join('admin');
    res.json({ success: true });
  } else {
    res.status(400).json({ error: 'Invalid request' });
  }
});

module.exports = router;