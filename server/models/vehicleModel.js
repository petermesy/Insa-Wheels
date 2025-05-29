const db = require('../config/db');

// Get all vehicles
const getVehicles = async () => {
  const result = await db.query('SELECT * FROM vehicles');
  return result.rows;
};

// Get vehicle by ID
const getVehicleById = async (id) => {
  const result = await db.query('SELECT * FROM vehicles WHERE id = $1', [id]);
  return result.rows[0];
};

// Add a new vehicle
const addVehicle = async ({ type, licensePlate, destination, driverId }) => {
  const result = await db.query(
    `INSERT INTO vehicles (type, license_plate, destination, driver_id)
     VALUES ($1, $2, $3, $4)
     RETURNING *`,
    [type, licensePlate, destination, driverId]
  );
  return result.rows[0];
};

// Update vehicle by ID
const updateVehicleById = async (id, { type, licensePlate, destination, driverId }) => {
  const result = await db.query(
    `UPDATE vehicles
     SET type = $1, license_plate = $2, destination = $3, driver_id = $4
     WHERE id = $5
     RETURNING *`,
    [type, licensePlate, destination, driverId, id]
  );
  return result.rows[0];
};

// Delete vehicle by ID
const deleteVehicleById = async (id) => {
  // Check if vehicle exists
  const result = await db.query('SELECT * FROM vehicles WHERE id = $1', [id]);
  if (result.rows.length === 0) return null;
  await db.query('DELETE FROM vehicles WHERE id = $1', [id]);
  return true;
};

// Update vehicle location by ID
const updateVehicleLocationById = async (id, { latitude, longitude, speed }) => {
  const result = await db.query(
    `UPDATE vehicles
     SET latitude = $1, longitude = $2, speed = $3
     WHERE id = $4
     RETURNING *`,
    [latitude, longitude, speed, id]
  );
  return result.rows[0];
};

// Assign employee to vehicle by ID (assumes assigned_employees is an integer array)
const assignEmployeeToVehicleById = async (vehicleId, employeeId) => {
  // Ensure employeeId is an integer
  const empId = Number(employeeId);
  const vehId = Number(vehicleId);
  const result = await db.query(
    `UPDATE vehicles
     SET assigned_employees = array_append(assigned_employees, $1)
     WHERE id = $2 AND NOT (assigned_employees @> ARRAY[$1]::integer[])
     RETURNING *`,
    [empId, vehId]
  );
  return result.rows[0];
};

module.exports = {
  getVehicles,
  getVehicleById,
  addVehicle,
  updateVehicleById,
  deleteVehicleById,
  updateVehicleLocationById,
  assignEmployeeToVehicleById,
};
