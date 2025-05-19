
const {
  getUsers,
  getUserById: findUserById,
  addUser,
  updateUserLocationById,
  getUsersByRoleType
} = require('../models/userModel');

const getAllUsers = (req, res) => {
  const users = getUsers();
  // Remove password from response
  const safeUsers = users.map(({ password, ...user }) => user);
  res.json(safeUsers);
};

const getUserById = (req, res) => {
  const { id } = req.params;
  const user = findUserById(id);
  
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }
  
  // Remove password from response
  const { password, ...safeUser } = user;
  res.json(safeUser);
};

const getUsersByRole = (req, res) => {
  const { role } = req.params;
  
  if (!['admin', 'driver', 'employee'].includes(role)) {
    return res.status(400).json({ error: 'Invalid role' });
  }
  
  const users = getUsersByRoleType(role);
  // Remove password from response
  const safeUsers = users.map(({ password, ...user }) => user);
  res.json(safeUsers);
};

const createUser = (req, res) => {
  const { name, email, password, role, phone } = req.body;
  
  if (!name || !email || !password || !role) {
    return res.status(400).json({ error: 'Name, email, password, and role are required' });
  }
  
  if (!['admin', 'driver', 'employee'].includes(role)) {
    return res.status(400).json({ error: 'Invalid role' });
  }
  
  try {
    const newUser = addUser({ name, email, password, role, phone });
    // Remove password from response
    const { password: pwd, ...safeUser } = newUser;
    res.status(201).json(safeUser);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const updateUserLocation = (req, res) => {
  const { id } = req.params;
  const { latitude, longitude } = req.body;
  
  if (!latitude || !longitude) {
    return res.status(400).json({ error: 'Latitude and longitude are required' });
  }
  
  try {
    const updatedUser = updateUserLocationById(id, { latitude, longitude });
    // Remove password from response
    const { password, ...safeUser } = updatedUser;
    res.json(safeUser);
  } catch (error) {
    res.status(404).json({ error: error.message });
  }
};

module.exports = {
  getAllUsers,
  getUserById,
  getUsersByRole,
  createUser,
  updateUserLocation
};
