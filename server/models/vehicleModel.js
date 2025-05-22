
const db = require('../config/db');

const getVehicles = async () => {
  const result = await db.query(`
    SELECT v.*, 
      ARRAY(
        SELECT ve.employee_id 
        FROM vehicle_employees ve 
        WHERE ve.vehicle_id = v.id
      ) as assigned_employees
    FROM vehicles v
    ORDER BY v.id
  `);
  return result.rows;
};

const getVehicleById = async (id) => {
  const result = await db.query(`
    SELECT v.*, 
      ARRAY(
        SELECT ve.employee_id 
        FROM vehicle_employees ve 
        WHERE ve.vehicle_id = v.id
      ) as assigned_employees
    FROM vehicles v
    WHERE v.id = $1
  `, [id]);
  return result.rows[0];
};

const getVehicleByDriverId = async (driverId) => {
  const result = await db.query(`
    SELECT v.*, 
      ARRAY(
        SELECT ve.employee_id 
        FROM vehicle_employees ve 
        WHERE ve.vehicle_id = v.id
      ) as assigned_employees
    FROM vehicles v
    WHERE v.driver_id = $1
  `, [driverId]);
  return result.rows[0];
};

const addVehicle = async (vehicleData) => {
  const { type, licensePlate,destination, driverId } = vehicleData;
  
  const result = await db.query(
    'INSERT INTO vehicles (type, license_plate,destination, driver_id) VALUES ($1, $2, $3,$4) RETURNING *',
    [type, licensePlate,destination, driverId]
  );
  
  // Get the newly created vehicle with assigned employees (which will be empty)
  return {
    ...result.rows[0],
    assigned_employees: []
  };
};

const updateVehicleById = async (id, vehicleData) => {
  const { type, licensePlate,destination, driverId } = vehicleData;
  
  // Check if vehicle exists
  const vehicle = await getVehicleById(id);
  if (!vehicle) {
    throw new Error('Vehicle not found');
  }
  
const result = await db.query(
  'UPDATE vehicles SET type = $1, license_plate = $2, driver_id = $3, destination = $4 WHERE id = $5 RETURNING *',
  [type, licensePlate, driverId, destination, id]
);
  
  // Get the updated vehicle with assigned employees
  return getVehicleById(id);
};

const deleteVehicleById = async (id) => {
  // Check if vehicle exists
  const vehicle = await getVehicleById(id);
  if (!vehicle) {
    throw new Error('Vehicle not found');
  }
  
  // Delete associated vehicle_employees records
  await db.query('DELETE FROM vehicle_employees WHERE vehicle_id = $1', [id]);
  
  // Delete the vehicle
  await db.query('DELETE FROM vehicles WHERE id = $1', [id]);
  
  return true;
};

const updateVehicleLocationById = async (id, locationData) => {
  const { latitude, longitude, speed } = locationData;
  const timestamp = new Date();
  
  const result = await db.query(
    `UPDATE vehicles 
     SET location_latitude = $1, location_longitude = $2, location_speed = $3, location_timestamp = $4 
     WHERE id = $5 
     RETURNING *`,
    [latitude, longitude, speed || 0, timestamp, id]
  );
  
  if (result.rows.length === 0) {
    throw new Error('Vehicle not found');
  }
  
  // Get the updated vehicle with assigned employees
  return getVehicleById(id);
};

const assignEmployeeToVehicleById = async (id, employeeId) => {
  // Check if vehicle exists
  const vehicleResult = await db.query('SELECT * FROM vehicles WHERE id = $1', [id]);
  if (vehicleResult.rows.length === 0) {
    throw new Error('Vehicle not found');
  }
  
  // Check if employee exists and is actually an employee
  const employeeResult = await db.query(
    'SELECT * FROM users WHERE id = $1 AND role = $2',
    [employeeId, 'employee']
  );
  
  if (employeeResult.rows.length === 0) {
    throw new Error('Employee not found or user is not an employee');
  }
  
  // Check if assignment already exists
  const assignmentResult = await db.query(
    'SELECT * FROM vehicle_employees WHERE vehicle_id = $1 AND employee_id = $2',
    [id, employeeId]
  );
  
  if (assignmentResult.rows.length > 0) {
    throw new Error('Employee already assigned to this vehicle');
  }
  
  // Create assignment
  await db.query(
    'INSERT INTO vehicle_employees (vehicle_id, employee_id) VALUES ($1, $2)',
    [id, employeeId]
  );
  
  // Get the updated vehicle with assigned employees
  return getVehicleById(id);
};

module.exports = {
  getVehicles,
  getVehicleById,
  getVehicleByDriverId,
  addVehicle,
  updateVehicleById,
  deleteVehicleById,
  updateVehicleLocationById,
  assignEmployeeToVehicleById
};
