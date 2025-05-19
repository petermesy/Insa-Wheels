
const {
  getVehicles,
  getVehicleById: findVehicleById,
  addVehicle,
  updateVehicleLocationById,
  assignEmployeeToVehicleById
} = require('../models/vehicleModel');

const getAllVehicles = async (req, res) => {
  try {
    const vehicles = await getVehicles();
    res.json(vehicles);
  } catch (error) {
    console.error('Error getting vehicles:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

const getVehicleById = async (req, res) => {
  const { id } = req.params;
  
  try {
    const vehicle = await findVehicleById(id);
    
    if (!vehicle) {
      return res.status(404).json({ error: 'Vehicle not found' });
    }
    
    res.json(vehicle);
  } catch (error) {
    console.error('Error getting vehicle by ID:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

const createVehicle = async (req, res) => {
  const { type, licensePlate, driverId } = req.body;
  
  if (!type || !licensePlate || !driverId) {
    return res.status(400).json({ error: 'Type, license plate, and driver ID are required' });
  }
  
  try {
    const newVehicle = await addVehicle({ type, licensePlate, driverId });
    res.status(201).json(newVehicle);
  } catch (error) {
    console.error('Error creating vehicle:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

const updateVehicleLocation = async (req, res) => {
  const { id } = req.params;
  const { latitude, longitude, speed } = req.body;
  
  if (!latitude || !longitude) {
    return res.status(400).json({ error: 'Latitude and longitude are required' });
  }
  
  try {
    const updatedVehicle = await updateVehicleLocationById(id, { latitude, longitude, speed });
    res.json(updatedVehicle);
  } catch (error) {
    console.error('Error updating vehicle location:', error);
    
    if (error.message === 'Vehicle not found') {
      return res.status(404).json({ error: error.message });
    }
    
    res.status(500).json({ error: 'Server error' });
  }
};

const assignEmployeeToVehicle = async (req, res) => {
  const { id } = req.params;
  const { employeeId } = req.body;
  
  if (!employeeId) {
    return res.status(400).json({ error: 'Employee ID is required' });
  }
  
  try {
    const updatedVehicle = await assignEmployeeToVehicleById(id, employeeId);
    res.json(updatedVehicle);
  } catch (error) {
    console.error('Error assigning employee to vehicle:', error);
    
    if (error.message.includes('not found') || error.message.includes('already assigned')) {
      return res.status(400).json({ error: error.message });
    }
    
    res.status(500).json({ error: 'Server error' });
  }
};

module.exports = {
  getAllVehicles,
  getVehicleById,
  createVehicle,
  updateVehicleLocation,
  assignEmployeeToVehicle
};
