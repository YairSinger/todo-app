// middleware/errorHandler.js

/**
 * Global error handling middleware
 */
const errorHandler = (err, req, res, next) => {
    console.error('Error:', err.message);
    
    // Determine if this is a validation error from Sequelize
    if (err.name === 'SequelizeValidationError' || err.name === 'SequelizeUniqueConstraintError') {
      return res.status(400).json({
        error: err.message,
        details: err.errors?.map(e => e.message)
      });
    }
    
    // Handle specific errors with custom status codes
    if (err.message === 'Invalid email format' || 
        err.message === 'Email is already registered') {
      return res.status(400).json({ error: err.message });
    }
    
    if (err.message === 'Invalid or expired verification code') {
      return res.status(400).json({ error: err.message });
    }
    
    if (err.message === 'POC not found' || 
        err.message === 'Todo not found' ||
        err.message === 'POC email not found') {
      return res.status(404).json({ error: err.message });
    }
    
    // Default error handling
    res.status(500).json({ 
      error: process.env.NODE_ENV === 'production' 
        ? 'Internal server error' 
        : err.message
    });
  };
  
  export default errorHandler;