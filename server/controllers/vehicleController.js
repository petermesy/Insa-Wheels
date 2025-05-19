
const {
  getVehicles,
  getVehicleById: findVehicleById,
  addVehicle,
  updateVehicleLocationById,
  assignEmployeeToVehicleById
} = require('../models/vehicleModel');

const getAllVehicles = (req, res) => {
  const vehicles = getVehicles();
  res.json(vehicles);
};

const getVehicleById = (req, res) => {
  const { id } = req.params;
  const vehicle = findVehicleById(id);
  
  if (!vehicle) {
    return res.status(404).json({ error: 'Vehicle not found' });
  }
  
  res.json(vehicle);
};

const createVehicle = (req, res) => {
  const { type, licensePlate, driverId } = req.body;
  
  if (!type || !licensePlate || !driverId) {
    return res.status(400).json({ error: 'Type, license plate, and driver ID are required' });
  }
  
  const newVehicle = addVehicle({ type, licensePlate, driverId });
  res.status(201).json(newVehicle);
};

const updateVehicleLocation = (req, res) => {
  const { id } = req.params;
  const { latitude, longitude, speed } = req.body;
  
  if (!latitude || !longitude) {
    return res.status(400).json({ error: 'Latitude and longitude are required' });
  }
  
  try {
    const updatedVehicle = updateVehicleLocationById(id, { latitude, longitude, speed });
    res.json(updatedVehicle);
  } catch (error) {
    res.status(404).json({ error: error.message });
  }
};

const assignEmployeeToVehicle = (req, res) => {
  const { id } = req.params;
  const { employeeId } = req.body;
  
  if (!employeeId) {
    return res.status(400).json({ error: 'Employee ID is required' });
  }
  
  try {
    const updatedVehicle = assignEmployeeToVehicleById(id, employeeId);
    res.json(updatedVehicle);
  } catch (error) {
    res.status(404).json({ error: error.message });
  }
};

module.exports = {
  getAllVehicles,
  getVehicleById,
  createVehicle,
  updateVehicleLocation,
  assignEmployeeToVehicle
};
