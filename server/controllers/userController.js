const {
  getUsers,
  getUserById:getUserByIdModel,
  addUser,
  updateUserLocationById,
  getUsersByRoleType,
  updateUserById,
  deleteUserById,
} = require('../models/userModel');
const validator = require('validator'); // For input validation

// Utility to validate email
const isValidEmail = (email) => validator.isEmail(email);

// Utility to validate password (e.g., minimum 8 characters)
const isValidPassword = (password) => password && password.length >= 8;

// Get all users
const getAllUsers = async (req, res) => {
  try {
    const users = await getUsers();
    // Remove password from response
    const safeUsers = users.map(({ password, ...user }) => user);
    res.json(safeUsers);
  } catch (error) {
    console.error('Error getting users:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Get user by ID
const getUserById = async (req, res) => {
  const { id } = req.params;

  if (!validator.isUUID(id) && !validator.isInt(id)) {
    return res.status(400).json({ error: 'Invalid user ID' });
  }

  try {
    const user = await getUserByIdModel(id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    // Remove password from response
    const { password, ...safeUser } = user;
    res.json(safeUser);
  } catch (error) {
    console.error('Error getting user by ID:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Get users by role
const getUsersByRole = async (req, res) => {
  const { role } = req.params;

  if (!['admin', 'driver', 'employee'].includes(role)) {
    return res.status(400).json({ error: 'Invalid role' });
  }

  try {
    const users = await getUsersByRoleType(role);
    // Remove password from response
    const safeUsers = users.map(({ password, ...user }) => user);
    res.json(safeUsers);
  } catch (error) {
    console.error('Error getting users by role:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Create a new user
const createUser = async (req, res) => {
  const { name, email, password, role, phone } = req.body;

  if (!name || !email || !password || !role) {
    return res.status(400).json({ error: 'Name, email, password, and role are required' });
  }

  if (!isValidEmail(email)) {
    return res.status(400).json({ error: 'Invalid email format' });
  }

  if (!isValidPassword(password)) {
    return res.status(400).json({ error: 'Password must be at least 8 characters long' });
  }

  if (!['admin', 'driver', 'employee'].includes(role)) {
    return res.status(400).json({ error: 'Invalid role' });
  }

  try {
    const newUser = await addUser({ name, email, password, role, phone });
    // Remove password from response
    const { password: pwd, ...safeUser } = newUser;
    res.status(201).json(safeUser);
  } catch (error) {
    console.error('Error creating user:', error);
    if (error.message === 'Email already in use') {
      return res.status(400).json({ error: error.message });
    }
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Update a user
const updateUser = async (req, res) => {
  const { id } = req.params;
  const { name, email, password, role, phone } = req.body;

  if (!validator.isUUID(id) && !validator.isInt(id)) {
    return res.status(400).json({ error: 'Invalid user ID' });
  }

  if (!name || !email || !role) {
    return res.status(400).json({ error: 'Name, email, and role are required' });
  }

  if (!isValidEmail(email)) {
    return res.status(400).json({ error: 'Invalid email format' });
  }

  if (password && !isValidPassword(password)) {
    return res.status(400).json({ error: 'Password must be at least 8 characters long' });
  }

  if (!['admin', 'driver', 'employee'].includes(role)) {
    return res.status(400).json({ error: 'Invalid role' });
  }

  try {
    const updatedUser = await updateUserById(id, { name, email, password, role, phone });
    if (!updatedUser) {
      return res.status(404).json({ error: 'User not found' });
    }
    // Remove password from response
    const { password: pwd, ...safeUser } = updatedUser;
    res.json(safeUser);
  } catch (error) {
    console.error('Error updating user:', error);
    if (error.message === 'Email already in use') {
      return res.status(400).json({ error: error.message });
    }
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Delete a user
// const deleteUser = async (req, res) => {
//   const { id } = req.params;

//   if (!validator.isUUID(id) && !validator.isInt(id)) {
//     return res.status(400).json({ error: 'Invalid user ID' });
//   }

//   try {
//     const result = await deleteUserById(id);
//     if (!result) {
//       return res.status(404).json({ error: 'User not found' });
//     }
//     res.json({ message: 'User deleted successfully' });
//   } catch (error) {
//     console.error('Error deleting user:', error);
//     res.status(500).json({ error: 'Internal server error' });
//   }
// };
const deleteUser = async (req, res) => {
  const { id } = req.params;

  if (!validator.isUUID(id) && !validator.isInt(id)) {
    return res.status(400).json({ error: 'Invalid user ID format' });
  }

  try {
    const result = await deleteUserById(id);
    if (!result) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Error deleting user:', {
      message: error.message,
      stack: error.stack,
      id,
      code: error.code || 'No code', // PostgreSQL error code (e.g., 23503 for foreign key violation)
      detail: error.detail || 'No detail', // PostgreSQL error detail
    });
    if (error.code === '23503') {
      return res.status(400).json({ error: 'Cannot delete user due to existing references in other tables' });
    }
    if (error.code === '42P01') {
      return res.status(500).json({ error: 'Database error: Table does not exist' });
    }
    if (error.code === '08006' || error.code === '08003') {
      return res.status(500).json({ error: 'Database connection error' });
    }
    res.status(500).json({ error: 'Internal server error: Unable to delete user' });
  }
};
// Update user location
const updateUserLocation = async (req, res) => {
  const { id } = req.params;
  const { latitude, longitude } = req.body;

  if (!validator.isUUID(id) && !validator.isInt(id)) {
    return res.status(400).json({ error: 'Invalid user ID' });
  }

  if (!latitude || !longitude || !validator.isFloat(latitude.toString()) || !validator.isFloat(longitude.toString())) {
    return res.status(400).json({ error: 'Valid latitude and longitude are required' });
  }

  try {
    const updatedUser = await updateUserLocationById(id, { latitude, longitude });
    if (!updatedUser) {
      return res.status(404).json({ error: 'User not found' });
    }
    // Remove password from response
    const { password, ...safeUser } = updatedUser;
    res.json(safeUser);
  } catch (error) {
    console.error('Error updating user location:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = {
  getAllUsers,
  getUserById,
  getUsersByRole,
  createUser,
  updateUser,
  deleteUser,
  updateUserLocation,
};