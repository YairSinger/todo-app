// services/verificationService.js
import crypto from 'crypto';
import { Sequelize } from 'sequelize';
import { PendingPoc, Poc } from '../models/index.js';
import emailConfig from '../config/email.js';
import { sendVerificationEmail } from './emailService.js';

/**
 * Generate a verification code and send it to the user's email
 * 
 * @param {string} name - User's name
 * @param {string} email - User's email
 * @returns {Promise} - The created pending POC record
 */
export const initiateVerification = async (name, email) => {
  // Validate email
  const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  if (!email || !emailPattern.test(email)) {
    throw new Error('Invalid email format');
  }
  
  // Check if email already exists in confirmed POCs
  const existingPoc = await Poc.findOne({ where: { email } });
  if (existingPoc) {
    throw new Error('Email is already registered');
  }
  
  // Generate verification code (6-digit number)
  const verificationCode = crypto.randomInt(100000, 999999).toString();
  
  // Set expiration time
  const expiresAt = new Date();
  expiresAt.setMinutes(expiresAt.getMinutes() + emailConfig.VERIFICATION_EXPIRY_MINUTES);
  
  // Remove any previous pending verification for this email
  await PendingPoc.destroy({ where: { email } });
  
  // Store in database
  const pendingPoc = await PendingPoc.create({
    name,
    email,
    verificationCode,
    expiresAt
  });
  
  // Send verification email
  try {
    await sendVerificationEmail(email, expiresAt, verificationCode);
  } catch (error) {
    // If email fails, still return the pending POC but log the error
    console.error('Failed to send verification email:', error);
  }
  
  return pendingPoc;
};

/**
 * Confirm a verification code and create a verified POC
 * 
 * @param {string} email - User's email
 * @param {string} code - Verification code to confirm
 * @returns {Promise} - The created POC record
 */
export const confirmVerification = async (email, code) => {
  // Find the pending verification
  const pendingPoc = await PendingPoc.findOne({ 
    where: { 
      email,
      verificationCode: code,
      expiresAt: { [Sequelize.Op.gt]: new Date() } // Check if not expired
    } 
  });
  
  if (!pendingPoc) {
    throw new Error('Invalid or expired verification code');
  }
  
  // Create confirmed POC
  const newPoc = await Poc.create({
    name: pendingPoc.name,
    email: pendingPoc.email
  });
  
  // Delete the pending verification
  await pendingPoc.destroy();
  
  return newPoc;
};

export default {
  initiateVerification,
  confirmVerification
};