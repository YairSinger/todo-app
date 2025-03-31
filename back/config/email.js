// config/email.js
import dotenv from 'dotenv';

dotenv.config();

// Email configuration
export default {
  SERVICE_ID: process.env.EMAILJS_SERVICE_ID,
  TEMPLATE_ID: process.env.EMAILJS_TEMPLATE_ID,
  PUBLIC_KEY: process.env.EMAILJS_PUBLIC_KEY,
  PRIVATE_KEY: process.env.EMAILJS_PRIVATE_KEY,
  VERIFICATION_EXPIRY_MINUTES: 30 // Verification code expiry in minutes
};