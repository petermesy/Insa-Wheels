
const db = require('../config/db');

const getUsers = async () => {
  const result = await db.query('SELECT * FROM users ORDER BY name');
  return result.rows;
};

const getUserById = async (id) => {
  const result = await db.query('SELECT * FROM users WHERE id = $1', [id]);
  return result.rows[0];
};

const findUserByEmail = async (email) => {
  const result = await db.query('SELECT * FROM users WHERE email = $1', [email]);
  return result.rows[0];
};

const getUsersByRoleType = async (role) => {
  const result = await db.query('SELECT * FROM users WHERE role = $1', [role]);
  return result.rows;
};

const addUser = async (userData) => {
  const { name, email, password, role, phone } = userData;
  
  // Check if email already exists
  const existingUser = await findUserByEmail(email);
  if (existingUser) {
    throw new Error('Email already in use');
  }
  
  const result = await db.query(
    'INSERT INTO users (name, email, password, role, phone) VALUES ($1, $2, $3, $4, $5) RETURNING *',
    [name, email, password, role, phone]
  );
  
  return result.rows[0];
};

const updateUserLocationById = async (id, locationData) => {
  const { latitude, longitude } = locationData;
  
  const result = await db.query(
    'UPDATE users SET location_latitude = $1, location_longitude = $2 WHERE id = $3 RETURNING *',
    [latitude, longitude, id]
  );
  
  if (result.rows.length === 0) {
    throw new Error('User not found');
  }
  
  return result.rows[0];
};

module.exports = {
  getUsers,
  getUserById,
  findUserByEmail,
  getUsersByRoleType,
  addUser,
  updateUserLocationById
};
