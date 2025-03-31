// utils/helpers.js

/**
 * Validate email format
 * @param {string} email - Email to validate
 * @returns {boolean} - True if email format is valid
 */
export const isValidEmail = (email) => {
    const pattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return pattern.test(String(email).toLowerCase());
  };
  
  /**
   * Safely parse a date string, returning null if invalid
   * @param {string} dateStr - Date string to parse
   * @returns {Date|null} - Parsed date or null
   */
  export const safeParseDate = (dateStr) => {
    if (!dateStr) return null;
    
    try {
      const date = new Date(dateStr);
      return isNaN(date.getTime()) ? null : date;
    } catch (err) {
      return null;
    }
  };
  
  /**
   * Format a date to YYYY-MM-DD format
   * @param {Date} date - Date to format
   * @returns {string} - Formatted date string
   */
  export const formatDate = (date) => {
    if (!date) return null;
    
    try {
      const d = new Date(date);
      if (isNaN(d.getTime())) return null;
      
      return d.toISOString().split('T')[0];
    } catch (err) {
      return null;
    }
  };
  
  export default {
    isValidEmail,
    safeParseDate,
    formatDate
  };