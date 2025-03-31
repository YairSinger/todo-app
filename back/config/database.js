// config/database.js
import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';

dotenv.config();

// Get database configuration from environment variables
// With fallbacks for development
const DB_NAME = process.env.DB_NAME || 'todoapp';
const DB_USER = process.env.DB_USER || 'postgres';
const DB_PASSWORD = process.env.DB_PASSWORD || 'Abba123$';
const DB_HOST = process.env.DB_HOST || 'localhost';
const DB_DIALECT = process.env.DB_DIALECT || 'postgres';

// Initialize Sequelize with database configuration
const sequelize = new Sequelize(DB_NAME, DB_USER, DB_PASSWORD, {
  host: DB_HOST,
  dialect: DB_DIALECT,
  logging: process.env.NODE_ENV === 'development' // Only log SQL in development mode
});

export default sequelize;