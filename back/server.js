// server.js
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Import routes
import routes from './routes/index.js';

// Import middleware
import errorHandler from './middleware/errorHandler.js';

// Import database configuration
import db from './config/database.js';

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Initialize database
const initDb = async () => {
  try {
    // Test the connection
    await db.authenticate();
    console.log('Database connection established successfully.');
    
    // Sync the models with the database
    await db.sync();
    console.log('Database synchronized successfully');
  } catch (err) {
    console.error('Error initializing database:', err);
    process.exit(1); // Exit if database connection fails
  }
};

// Initialize database on server start
initDb();

// Routes
app.use('/api', routes);

// Error handling middleware
app.use(errorHandler);

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('Shutting down server...');
  db.close().then(() => {
    console.log('Database connection closed');
    process.exit(0);
  });
});

export default app;