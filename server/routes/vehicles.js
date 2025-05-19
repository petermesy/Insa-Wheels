
const express = require('express');
const router = express.Router();
const { 
  getAllVehicles,
  getVehicleById,
  updateVehicleLocation,
  createVehicle,
  updateVehicle,
  deleteVehicle,
  assignEmployeeToVehicle
} = require('../controllers/vehicleController');
const { validateToken, validateAdmin } = require('../middleware/auth');

// Apply auth middleware to all routes
router.use(validateToken);

router.get('/', getAllVehicles);
router.get('/:id', getVehicleById);
router.post('/', validateAdmin, createVehicle);
router.put('/:id', validateAdmin, updateVehicle);
router.delete('/:id', validateAdmin, deleteVehicle);
router.put('/:id/location', updateVehicleLocation);
router.post('/:id/assign', validateAdmin, assignEmployeeToVehicle);

module.exports = router;
