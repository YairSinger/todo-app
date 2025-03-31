// controllers/pocController.js
import { Poc } from '../models/index.js';
import { initiateVerification, confirmVerification } from '../services/verificationService.js';

/**
 * Get all POCs
 */
export const getAllPocs = async (req, res, next) => {
  try {
    const pocs = await Poc.findAll({
      order: [['name', 'ASC']]
    });
    
    res.json(Array.isArray(pocs) ? pocs : []);
  } catch (err) {
    next(err);
  }
};

/**
 * Create a new POC
 */
export const createPoc = async (req, res, next) => {
  const { name, email } = req.body;
  
  try {
    const newPoc = await Poc.create({
      name,
      email
    });
    
    res.status(201).json(newPoc);
  } catch (err) {
    next(err);
  }
};

/**
 * Update a POC
 */
export const updatePoc = async (req, res, next) => {
  const { id } = req.params;
  const { name, email } = req.body;
  
  try {
    const poc = await Poc.findByPk(id);
    
    if (!poc) {
      return res.status(404).json({ error: 'POC not found' });
    }
    
    poc.name = name;
    poc.email = email;
    await poc.save();
    
    res.json(poc);
  } catch (err) {
    next(err);
  }
};

/**
 * Delete a POC
 */
export const deletePoc = async (req, res, next) => {
  const { id } = req.params;
  
  try {
    const poc = await Poc.findByPk(id);
    
    if (!poc) {
      return res.status(404).json({ error: 'POC not found' });
    }
    
    await poc.destroy();
    
    res.json({ message: 'POC deleted successfully' });
  } catch (err) {
    next(err);
  }
};

/**
 * Initiate email verification for a new POC
 */
export const verifyPocEmail = async (req, res, next) => {
  const { name, email } = req.body;
  
  try {
    await initiateVerification(name, email);
    res.status(200).json({ message: 'Verification code sent to email' });
  } catch (err) {
    next(err);
  }
};

/**
 * Confirm email verification and create POC
 */
export const confirmPocEmail = async (req, res, next) => {
  const { email, code } = req.body;
  
  try {
    const newPoc = await confirmVerification(email, code);
    res.status(201).json(newPoc);
  } catch (err) {
    next(err);
  }
};

export default {
  getAllPocs,
  createPoc,
  updatePoc,
  deletePoc,
  verifyPocEmail,
  confirmPocEmail
};