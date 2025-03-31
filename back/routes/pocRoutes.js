// routes/pocRoutes.js
import express from 'express';
import pocController from '../controllers/pocController.js';

const router = express.Router();

// Get all POCs
router.get('/', pocController.getAllPocs);

// Create a new POC
router.post('/', pocController.createPoc);

// Update a POC
router.put('/:id', pocController.updatePoc);

// Delete a POC
router.delete('/:id', pocController.deletePoc);

// Initiate email verification
router.post('/verify', pocController.verifyPocEmail);

// Confirm email verification
router.post('/confirm', pocController.confirmPocEmail);

export default router;