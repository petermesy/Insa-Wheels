const express = require('express');
const router = express.Router();
const { validateToken } = require('../middleware/auth');

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

    // (You can add your logic to emit to assigned employees here)
    io.emit('carLocationUpdate', locationData);

    console.log('Location update received:', locationData);
    res.status(200).json({ success: true });
  } catch (error) {
    console.error('Error updating location:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get latest location (public endpoint for demo purposes)
router.get('/latest/:driverId', (req, res) => {
  // In a real implementation, this would fetch from a database
  // For now, we'll just return a message
  res.json({ 
    message: 'In a production environment, this would return the latest stored location for the driver' 
  });
});

module.exports = router;