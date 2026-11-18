/**
 * Transactional Email Service
 * In development / demo environment, logs password reset links and transaction alerts to console.
 */

const sendPasswordResetEmail = async (email, resetUrl) => {
  console.log('\n======================================================');
  console.log('📧 [MEDSHARE EMAIL DISPATCH] PASSWORD RESET REQUEST');
  console.log(`To: ${email}`);
  console.log(`Reset Link: ${resetUrl}`);
  console.log('This link is valid for 1 hour.');
  console.log('======================================================\n');
  return true;
};

module.exports = {
  sendPasswordResetEmail
};
