
// In-memory database for vehicles
let vehicles = [
  {
    id: 'v1',
    type: 'Bus',
    licensePlate: 'INSA-001',
    driverId: 'driver1',
    assignedEmployees: ['employee1'],
    location: {
      latitude: 9.0105,
      longitude: 38.7652,
      speed: 35,
      timestamp: new Date().toISOString()
    }
  }
];

const getVehicles = () => {
  return [...vehicles];
};

const getVehicleById = (id) => {
  return vehicles.find(vehicle => vehicle.id === id);
};

const getVehicleByDriverId = (driverId) => {
  return vehicles.find(vehicle => vehicle.driverId === driverId);
};

const addVehicle = (vehicleData) => {
  const newVehicle = {
    id: `v${vehicles.length + 1}`,
    ...vehicleData,
    assignedEmployees: [],
    location: {
      latitude: 0,
      longitude: 0,
      speed: 0,
      timestamp: new Date().toISOString()
    }
  };
  
  vehicles.push(newVehicle);
  return newVehicle;
};

const updateVehicleLocationById = (id, locationData) => {
  const vehicleIndex = vehicles.findIndex(vehicle => vehicle.id === id);
  
  if (vehicleIndex === -1) {
    throw new Error('Vehicle not found');
  }
  
  vehicles[vehicleIndex] = {
    ...vehicles[vehicleIndex],
    location: {
      ...locationData,
      timestamp: new Date().toISOString()
    }
  };
  
  return vehicles[vehicleIndex];
};

const assignEmployeeToVehicleById = (id, employeeId) => {
  const vehicleIndex = vehicles.findIndex(vehicle => vehicle.id === id);
  
  if (vehicleIndex === -1) {
    throw new Error('Vehicle not found');
  }
  
  // Check if employee is already assigned
  if (vehicles[vehicleIndex].assignedEmployees.includes(employeeId)) {
    throw new Error('Employee already assigned to this vehicle');
  }
  
  vehicles[vehicleIndex].assignedEmployees.push(employeeId);
  
  return vehicles[vehicleIndex];
};

module.exports = {
  getVehicles,
  getVehicleById,
  getVehicleByDriverId,
  addVehicle,
  updateVehicleLocationById,
  assignEmployeeToVehicleById
};
