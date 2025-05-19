
const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

async function setupDatabase() {
  console.log('Setting up database...');
  
  const pool = new Pool({
    user: process.env.DB_USER || 'postgres',
    host: process.env.DB_HOST || 'localhost',
    database: 'postgres', // Connect to default postgres database first
    password: process.env.DB_PASSWORD || 'postgres',
    port: process.env.DB_PORT || 5432,
  });

  try {
    // Check if database exists
    const dbName = process.env.DB_NAME || 'insa_wheels_tracker';
    const checkDbResult = await pool.query(
      `SELECT 1 FROM pg_database WHERE datname = $1`,
      [dbName]
    );

    // Create database if it doesn't exist
    if (checkDbResult.rows.length === 0) {
      console.log(`Creating database: ${dbName}`);
      await pool.query(`CREATE DATABASE ${dbName}`);
    } else {
      console.log(`Database ${dbName} already exists`);
    }

    // Close the pool connected to 'postgres' database
    await pool.end();

    // Connect to our app database
    const appPool = new Pool({
      user: process.env.DB_USER || 'postgres',
      host: process.env.DB_HOST || 'localhost',
      database: dbName,
      password: process.env.DB_PASSWORD || 'postgres',
      port: process.env.DB_PORT || 5432,
    });

    // Read the SQL file
    const sqlFile = path.join(__dirname, 'config', 'init.sql');
    const sql = fs.readFileSync(sqlFile, 'utf8');

    // Execute the SQL commands
    console.log('Initializing database schema...');
    await appPool.query(sql);
    console.log('Database schema initialized successfully!');

    await appPool.end();
    console.log('Database setup completed successfully!');
    
  } catch (err) {
    console.error('Error setting up database:', err);
    process.exit(1);
  }
}

setupDatabase();
