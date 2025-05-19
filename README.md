
# INSA-Wheels Tracker

A real-time tracking system for INSA transportation services that allows employees to track their assigned transportation vehicles.

## Features

- **Admin Dashboard**: Manage vehicles, drivers, and employees
- **Driver Interface**: Share location in real-time
- **Employee Tracking**: Track assigned vehicles and estimated arrival times
- **Role-based Access**: Different interfaces for admins, drivers, and employees
- **PostgreSQL Database**: Persistent data storage

## Prerequisites

- Node.js (v14+ recommended)
- PostgreSQL database
- npm or yarn

## Setup Instructions

### Database Setup

1. Create a PostgreSQL database named `insa_wheels_tracker`
2. Update the `.env` file in the server directory with your PostgreSQL credentials
3. Run the initialization script to create tables and sample data:

```bash
# Connect to your PostgreSQL database and run:
psql -d insa_wheels_tracker -f server/config/init.sql
```

### Backend Setup

1. Navigate to the server directory:
```bash
cd server
```

2. Install dependencies:
```bash
npm install
```

3. Start the server:
```bash
npm start
```

The server should start on http://localhost:4000

### Frontend Setup

1. From the project root, install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm run dev
```

The frontend should start on http://localhost:5173

## Default Users

The system comes with three default users for testing:

1. **Admin**
   - Email: admin@insa.com
   - Password: password

2. **Driver**
   - Email: driver@insa.com
   - Password: password

3. **Employee**
   - Email: employee@insa.com
   - Password: password

## API Endpoints

### Authentication
- `POST /api/auth/login` - Authenticate user
- `GET /api/auth/verify` - Verify JWT token

### Users
- `GET /api/users` - Get all users
- `GET /api/users/:id` - Get user by ID
- `GET /api/users/role/:role` - Get users by role
- `POST /api/users` - Create new user (admin only)
- `PUT /api/users/:id/location` - Update user location

### Vehicles
- `GET /api/vehicles` - Get all vehicles
- `GET /api/vehicles/:id` - Get vehicle by ID
- `POST /api/vehicles` - Create new vehicle (admin only)
- `PUT /api/vehicles/:id/location` - Update vehicle location
- `POST /api/vehicles/:id/assign` - Assign employee to vehicle

## Project Structure

```
├── server/               # Backend
│   ├── config/           # Configuration files
│   ├── controllers/      # Route controllers
│   ├── middleware/       # Express middleware
│   ├── models/           # Database models
│   └── routes/           # API routes
│
└── src/                  # Frontend (React)
    ├── components/       # React components
    ├── hooks/            # Custom hooks
    ├── lib/              # Utility functions
    └── pages/            # Page components
```

## License

This project is licensed under the MIT License.
