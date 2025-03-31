// routes/index.js
import express from 'express';
import pocRoutes from './pocRoutes.js';
import todoRoutes from './todoRoutes.js';

const router = express.Router();

// Register route modules
router.use('/pocs', pocRoutes);
router.use('/todos', todoRoutes);

export default router;