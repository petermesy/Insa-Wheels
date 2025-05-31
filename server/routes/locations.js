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

    const locationData = {
      driverId,
      location,
      altitude,
      accuracy,
      speed,
      timestamp: new Date()
    };
    const vehicleRes = await db.query(
  `SELECT id, assigned_employees FROM vehicles WHERE driver_id = $1`,
  [driverId]
);
const vehicle = vehicleRes.rows[0];

if (vehicle && Array.isArray(vehicle.assigned_employees)) {
  for (const employeeId of vehicle.assigned_employees) {
    io.to(`employee_${employeeId}`).emit('carLocationUpdate', locationData);
  }
}
io.to('admin').emit('adminCarLocationUpdate', {
  driverId,
  vehicleId: vehicle ? vehicle.id : null,
  location,
  altitude,
  accuracy,
  speed,
  timestamp: new Date(),
});

    console.log('Location update received and sent to employees:', locationData);
    res.status(200).json({ success: true });
  } catch (error) {
    console.error('Error updating location:', error);
    res.status(500).json({ error: 'Server error' });
  }
});
// After emitting to employees:


// Get latest location (public endpoint for demo purposes)
router.get('/latest/:driverId', (req, res) => {
  // In a real implementation, this would fetch from a database
  // For now, we'll just return a message
  res.json({ 
    message: 'In a production environment, this would return the latest stored location for the driver' 
  });
});

module.exports = router;