
// In-memory database for users
let users = [
  {
    id: 'admin1',
    name: 'Admin User',
    email: 'admin@insa.com',
    password: 'password',
    role: 'admin',
    phone: '123-456-7890'
  },
  {
    id: 'driver1',
    name: 'John Driver',
    email: 'driver@insa.com',
    password: 'password',
    role: 'driver',
    phone: '123-456-7891',
    location: {
      latitude: 9.0105,
      longitude: 38.7652
    }
  },
  {
    id: 'employee1',
    name: 'Employee One',
    email: 'employee@insa.com',
    password: 'password',
    role: 'employee',
    phone: '123-456-7892',
    location: {
      latitude: 9.0155,
      longitude: 38.7632
    }
  }
];

const getUsers = () => {
  return [...users];
};

const getUserById = (id) => {
  return users.find(user => user.id === id);
};

const findUserByEmail = (email) => {
  return users.find(user => user.email === email);
};

const getUsersByRoleType = (role) => {
  return users.filter(user => user.role === role);
};

const addUser = (userData) => {
  // Check if email already exists
  if (findUserByEmail(userData.email)) {
    throw new Error('Email already in use');
  }
  
  const newUser = {
    id: `user${users.length + 1}`,
    ...userData
  };
  
  users.push(newUser);
  return newUser;
};

const updateUserLocationById = (id, locationData) => {
  const userIndex = users.findIndex(user => user.id === id);
  
  if (userIndex === -1) {
    throw new Error('User not found');
  }
  
  users[userIndex] = {
    ...users[userIndex],
    location: locationData
  };
  
  return users[userIndex];
};

module.exports = {
  getUsers,
  getUserById,
  findUserByEmail,
  getUsersByRoleType,
  addUser,
  updateUserLocationById
};
