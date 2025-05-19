
-- Drop tables if they exist
DROP TABLE IF EXISTS vehicle_employees;
DROP TABLE IF EXISTS vehicles;
DROP TABLE IF EXISTS users;

-- Create users table
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  password VARCHAR(100) NOT NULL,
  role VARCHAR(20) NOT NULL CHECK (role IN ('admin', 'driver', 'employee')),
  phone VARCHAR(20),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  location_latitude NUMERIC,
  location_longitude NUMERIC
);

-- Create vehicles table
CREATE TABLE vehicles (
  id SERIAL PRIMARY KEY,
  type VARCHAR(50) NOT NULL,
  license_plate VARCHAR(20) UNIQUE NOT NULL,
  driver_id INTEGER REFERENCES users(id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  location_latitude NUMERIC,
  location_longitude NUMERIC,
  location_speed NUMERIC,
  location_timestamp TIMESTAMP
);

-- Create junction table for vehicles and employees
CREATE TABLE vehicle_employees (
  vehicle_id INTEGER REFERENCES vehicles(id),
  employee_id INTEGER REFERENCES users(id),
  PRIMARY KEY (vehicle_id, employee_id)
);

-- Create indexes
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_vehicles_driver_id ON vehicles(driver_id);

-- Insert initial admin user
INSERT INTO users (name, email, password, role, phone)
VALUES ('Admin User', 'admin@insa.com', 'password', 'admin', '123-456-7890');

-- Insert sample driver
INSERT INTO users (name, email, password, role, phone, location_latitude, location_longitude)
VALUES ('John Driver', 'driver@insa.com', 'password', 'driver', '123-456-7891', 9.0105, 38.7652);

-- Insert sample employee
INSERT INTO users (name, email, password, role, phone, location_latitude, location_longitude)
VALUES ('Employee One', 'employee@insa.com', 'password', 'employee', '123-456-7892', 9.0155, 38.7632);

-- Insert sample vehicle
INSERT INTO vehicles (type, license_plate, driver_id, location_latitude, location_longitude, location_speed)
VALUES ('Bus', 'INSA-001', 2, 9.0105, 38.7652, 35);

-- Assign employee to vehicle
INSERT INTO vehicle_employees (vehicle_id, employee_id)
VALUES (1, 3);
