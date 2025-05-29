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

const updateUserById = async (id, userData) => {
  const { name, email, password, role, phone } = userData;
  
  // Check if user exists
  const user = await getUserById(id);
  if (!user) {
    throw new Error('User not found');
  }
  
  // Check if email already exists and belongs to a different user
  if (email !== user.email) {
    const existingUser = await findUserByEmail(email);
    if (existingUser) {
      throw new Error('Email already in use');
    }
  }
  
  // If password is not provided, keep the existing one
  const updatedPassword = password || user.password;
  
  const result = await db.query(
    'UPDATE users SET name = $1, email = $2, password = $3, role = $4, phone = $5 WHERE id = $6 RETURNING *',
    [name, email, updatedPassword, role, phone, id]
  );
  
  return result.rows[0];
};

// const deleteUserById = async (id) => {
//   // Check if user exists
//   const user = await getUserById(id);
//   if (!user) {
//     throw new Error('User not found');
//   }
  
//   // Delete the user
//   await db.query('DELETE FROM users WHERE id = $1', [id]);
  
//   return true;
// };
const deleteUserById = async (id) => {
  // Check if user exists
  const user = await getUserById(id);
  if (!user) {
    return null;
  }
  await db.query('DELETE FROM users WHERE id = $1', [id]);
  return true;
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
  updateUserById,
  deleteUserById,
  updateUserLocationById
};
