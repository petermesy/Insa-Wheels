
const {
  getUsers,
  getUserById,
  addUser,
  updateUserLocationById,
  getUsersByRoleType
} = require('../models/userModel');

const getAllUsers = async (req, res) => {
  try {
    const users = await getUsers();
    // Remove password from response
    const safeUsers = users.map(({ password, ...user }) => user);
    res.json(safeUsers);
  } catch (error) {
    console.error('Error getting users:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

const getUserById = async (req, res) => {
  const { id } = req.params;
  
  try {
    const user = await getUserById(id);
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    // Remove password from response
    const { password, ...safeUser } = user;
    res.json(safeUser);
  } catch (error) {
    console.error('Error getting user by ID:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

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
    res.status(500).json({ error: 'Server error' });
  }
};

const createUser = async (req, res) => {
  const { name, email, password, role, phone } = req.body;
  
  if (!name || !email || !password || !role) {
    return res.status(400).json({ error: 'Name, email, password, and role are required' });
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
    
    res.status(500).json({ error: 'Server error' });
  }
};

const updateUserLocation = async (req, res) => {
  const { id } = req.params;
  const { latitude, longitude } = req.body;
  
  if (!latitude || !longitude) {
    return res.status(400).json({ error: 'Latitude and longitude are required' });
  }
  
  try {
    const updatedUser = await updateUserLocationById(id, { latitude, longitude });
    // Remove password from response
    const { password, ...safeUser } = updatedUser;
    res.json(safeUser);
  } catch (error) {
    console.error('Error updating user location:', error);
    
    if (error.message === 'User not found') {
      return res.status(404).json({ error: error.message });
    }
    
    res.status(500).json({ error: 'Server error' });
  }
};

module.exports = {
  getAllUsers,
  getUserById,
  getUsersByRole,
  createUser,
  updateUserLocation
};
