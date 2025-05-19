
const express = require('express');
const router = express.Router();
const { 
  getAllVehicles,
  getVehicleById,
  updateVehicleLocation,
  createVehicle,
  assignEmployeeToVehicle
} = require('../controllers/vehicleController');
const { validateToken } = require('../middleware/auth');

// Apply auth middleware to all routes
router.use(validateToken);

router.get('/', getAllVehicles);
router.get('/:id', getVehicleById);
router.post('/', createVehicle);
router.put('/:id/location', updateVehicleLocation);
router.post('/:id/assign', assignEmployeeToVehicle);

module.exports = router;
