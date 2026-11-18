const crypto = require('crypto');

/**
 * Generate unique human-readable tracking codes
 */
const generateDonationCode = () => {
  const randomPart = crypto.randomBytes(3).toString('hex').toUpperCase();
  return `MS-${new Date().getFullYear()}-${randomPart}`;
};

const generateRequestCode = () => {
  const randomPart = crypto.randomBytes(3).toString('hex').toUpperCase();
  return `REQ-${new Date().getFullYear()}-${randomPart}`;
};

/**
 * Sanitize user object for responses (removes passwordHash, resetToken, etc.)
 */
const sanitizeUser = (user) => {
  if (!user) return null;
  const userObj = user.toObject ? user.toObject() : { ...user };
  delete userObj.passwordHash;
  delete userObj.resetToken;
  delete userObj.resetTokenExpiry;
  return userObj;
};

/**
 * Mask phone numbers for public privacy
 */
const maskPhoneNumber = (phone) => {
  if (!phone || phone.length < 5) return '***';
  return phone.slice(0, 2) + '******' + phone.slice(-2);
};

module.exports = {
  generateDonationCode,
  generateRequestCode,
  sanitizeUser,
  maskPhoneNumber
};
