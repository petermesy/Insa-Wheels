
const express = require('express');
const router = express.Router();
const { 
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  updateUserLocation,
  getUsersByRole
} = require('../controllers/userController');
const { validateToken, validateAdmin } = require('../middleware/auth');

// Apply auth middleware to all routes
router.use(validateToken);

router.get('/', getAllUsers);
router.get('/role/:role', getUsersByRole);
router.get('/:id', getUserById);
router.post('/', validateAdmin, createUser);
router.put('/:id', validateAdmin, updateUser);
router.delete('/:id', validateAdmin, deleteUser);
router.put('/:id/location', updateUserLocation);

module.exports = router;
