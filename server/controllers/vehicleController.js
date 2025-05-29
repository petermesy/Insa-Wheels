const {
  getVehicles,
  getVehicleById: findVehicleById,
  addVehicle,
  updateVehicleById,
  deleteVehicleById,
  updateVehicleLocationById,
  assignEmployeeToVehicleById,
} = require('../models/vehicleModel');
const validator = require('validator');

// Validate license plate (basic example, adjust regex as needed)
const isValidLicensePlate = (licensePlate) => /^[A-Z0-9-]{3,10}$/i.test(licensePlate);

const getAllVehicles = async (req, res) => {
  try {
    const vehicles = await getVehicles();
    res.json(vehicles);
  } catch (error) {
    console.error('Error getting vehicles:', {
      message: error.message,
      stack: error.stack,
    });
    res.status(500).json({ error: 'Internal server error' });
  }
};

const getVehicleById = async (req, res) => {
  const { id } = req.params;

  if (!validator.isInt(String(id))) {
    return res.status(400).json({ error: 'Invalid vehicle ID format' });
  }
  try {
    const vehicle = await findVehicleById(id);
    if (!vehicle) {
      return res.status(404).json({ error: 'Vehicle not found' });
    }
    res.json(vehicle);
  } catch (error) {
    console.error('Error getting vehicle by ID:', {
      message: error.message,
      stack: error.stack,
      id,
    });
    res.status(500).json({ error: 'Internal server error' });
  }
};

const createVehicle = async (req, res) => {
  const { type, licensePlate, destination, driverId } = req.body;

  if (!type || !licensePlate || !destination || !driverId) {
    return res.status(400).json({ error: 'Type, license plate, destination, and driver ID are required' });
  }

  if (!isValidLicensePlate(licensePlate)) {
    return res.status(400).json({ error: 'Invalid license plate format' });
  }

  if (!validator.isInt(String(driverId))) {
    return res.status(400).json({ error: 'Invalid driver ID format' });
  }

  try {
    const newVehicle = await addVehicle({ type, licensePlate, destination, driverId });
    res.status(201).json(newVehicle);
  } catch (error) {
    console.error('Error creating vehicle:', {
      message: error.message,
      stack: error.stack,
      code: error.code || 'No code',
      detail: error.detail || 'No detail',
    });
    if (error.code === '23505' && error.detail?.includes('license_plate')) {
      return res.status(400).json({ error: 'A vehicle with this license plate already exists' });
    }
    if (error.code === '23503' && error.detail?.includes('driver_id')) {
      return res.status(400).json({ error: 'Driver ID does not exist' });
    }
    res.status(500).json({ error: 'Internal server error' });
  }
};

const updateVehicle = async (req, res) => {
  const { id } = req.params;
  const { type, licensePlate, destination, driverId } = req.body;

  if (!validator.isInt(String(id))) {
    return res.status(400).json({ error: 'Invalid vehicle ID format' });
  }

  if (!type || !licensePlate || !destination || !driverId) {
    return res.status(400).json({ error: 'Type, license plate, destination, and driver ID are required' });
  }

  if (!isValidLicensePlate(licensePlate)) {
    return res.status(400).json({ error: 'Invalid license plate format' });
  }

  if (!validator.isInt(String(driverId))) {
    return res.status(400).json({ error: 'Invalid driver ID format' });
  }

  try {
    const updatedVehicle = await updateVehicleById(id, { type, licensePlate, destination, driverId });
    if (!updatedVehicle) {
      return res.status(404).json({ error: 'Vehicle not found' });
    }
    res.json(updatedVehicle);
  } catch (error) {
    console.error('Error updating vehicle:', {
      message: error.message,
      stack: error.stack,
      id,
      code: error.code || 'No code',
      detail: error.detail || 'No detail',
    });
    if (error.code === '23505' && error.detail?.includes('license_plate')) {
      return res.status(400).json({ error: 'A vehicle with this license plate already exists' });
    }
    if (error.code === '23503' && error.detail?.includes('driver_id')) {
      return res.status(400).json({ error: 'Driver ID does not exist' });
    }
    res.status(500).json({ error: 'Internal server error' });
  }
};

const deleteVehicle = async (req, res) => {
  const { id } = req.params;

  if (!validator.isInt(String(id))) {
    return res.status(400).json({ error: 'Invalid vehicle ID format' });
  }

  try {
    const result = await deleteVehicleById(id);
    if (!result) {
      return res.status(404).json({ error: 'Vehicle not found' });
    }
    res.json({ message: 'Vehicle deleted successfully' });
  } catch (error) {
    console.error('Error deleting vehicle:', {
      message: error.message,
      stack: error.stack,
      id,
      code: error.code || 'No code',
      detail: error.detail || 'No detail',
    });
    if (error.code === '23503') {
      return res.status(400).json({ error: 'Cannot delete vehicle due to existing references in other tables' });
    }
    res.status(500).json({ error: 'Internal server error' });
  }
};

const updateVehicleLocation = async (req, res) => {
  const { id } = req.params;
  const { latitude, longitude, speed } = req.body;

  if (!validator.isInt(String(id))) {
    return res.status(400).json({ error: 'Invalid vehicle ID format' });
  }

  if (
    latitude === undefined ||
    longitude === undefined ||
    !validator.isFloat(String(latitude)) ||
    !validator.isFloat(String(longitude))
  ) {
    return res.status(400).json({ error: 'Valid latitude and longitude are required' });
  }

  try {
    const updatedVehicle = await updateVehicleLocationById(id, { latitude, longitude, speed });
    if (!updatedVehicle) {
      return res.status(404).json({ error: 'Vehicle not found' });
    }
    res.json(updatedVehicle);
  } catch (error) {
    console.error('Error updating vehicle location:', {
      message: error.message,
      stack: error.stack,
      id,
    });
    res.status(500).json({ error: 'Internal server error' });
  }
};

const assignEmployeeToVehicle = async (req, res) => {
  const { id } = req.params;
  const { employeeId } = req.body;

  if (!validator.isInt(String(id))) {
    return res.status(400).json({ error: 'Invalid vehicle ID format' });
  }

  if (!employeeId || !validator.isInt(String(employeeId))) {
    return res.status(400).json({ error: 'Valid employee ID is required' });
  }

  try {
    const updatedVehicle = await assignEmployeeToVehicleById(id, employeeId);
    if (!updatedVehicle) {
      return res.status(404).json({ error: 'Vehicle or employee not found' });
    }
    res.json(updatedVehicle);
  } catch (error) {
    console.error('Error assigning employee to vehicle:', {
      message: error.message,
      stack: error.stack,
      id,
      employeeId,
    });
    if (error.code === '23503') {
      return res.status(400).json({ error: 'Employee ID does not exist' });
    }
    res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = {
  getAllVehicles,
  getVehicleById,
  createVehicle,
  updateVehicle,
  deleteVehicle,
  updateVehicleLocation,
  assignEmployeeToVehicle,
};