
const express = require('express');
const router = express.Router();
const { validateToken } = require('../middleware/auth');

// Apply auth middleware to most routes
router.use(validateToken);

// Location update endpoint for drivers
router.post('/update', (req, res) => {
  try {
    const { driverId, location, altitude, accuracy, speed } = req.body;
    
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
    
    // Emit to all connected clients
    req.io.emit('carLocationUpdate', locationData);
    
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
