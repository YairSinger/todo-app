// services/emailService.js
import axios from 'axios';
import emailConfig from '../config/email.js';

/**
 * Send verification email with passcode
 * @param {string} toEmail - Recipient email address
 * @param {Date} expirationTime - When the verification code expires
 * @param {string} passcode - Verification passcode
 * @returns {Promise} - Response from email service
 */
export const sendVerificationEmail = async (toEmail, expirationTime, passcode) => {
  try {
    const response = await axios.post('https://api.emailjs.com/api/v1.0/email/send', {
      service_id: emailConfig.SERVICE_ID,
      template_id: emailConfig.TEMPLATE_ID,
      user_id: emailConfig.PUBLIC_KEY,
      accessToken: emailConfig.PRIVATE_KEY,
      template_params: {
        email: toEmail,
        expiration_time: expirationTime.toLocaleString(),
        passcode: passcode,
      },
    });

    console.log('Email sent successfully to:', toEmail);
    return response.data;
  } catch (error) {
    console.error('Error sending email:', error.response ? error.response.data : error.message);
    throw new Error('Failed to send verification email');
  }
};

export default {
  sendVerificationEmail
};