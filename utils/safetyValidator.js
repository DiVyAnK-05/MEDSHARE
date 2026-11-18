const { PROHIBITED_TERMS, MIN_SHELF_LIFE_DAYS } = require('../config/constants');

/**
 * Validates a medicine donation against strict safety and regulatory rules
 * @param {Object} donationData
 * @returns {{ isValid: boolean, errors: string[] }}
 */
const validateMedicineSafety = (donationData) => {
  const errors = [];
  const { medicineName, genericName, expiryDate, sealedPackaging, quantity, unit } = donationData;

  // 1. Check sealed packaging
  if (sealedPackaging !== true && sealedPackaging !== 'true') {
    errors.push('Packaging must be original, fully sealed, and untampered. Opened, cut strips, or loose medicines are strictly prohibited.');
  }

  // 2. Check Expiry Date
  if (!expiryDate) {
    errors.push('A valid expiry date is required.');
  } else {
    const exp = new Date(expiryDate);
    const now = new Date();
    
    if (isNaN(exp.getTime())) {
      errors.push('Invalid expiry date format.');
    } else if (exp <= now) {
      errors.push('Expired medicines cannot be donated. Expired medicines pose serious health risks and must be disposed of safely.');
    } else {
      // Calculate remaining days
      const diffTime = exp.getTime() - now.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      const minRequiredDays = parseInt(process.env.MIN_SHELF_LIFE_DAYS, 10) || MIN_SHELF_LIFE_DAYS;
      if (diffDays < minRequiredDays) {
        errors.push(`Medicine shelf life is insufficient (${diffDays} days remaining). To allow sufficient verification and handover time, MedShare requires a minimum of ${minRequiredDays} days (approx. 3 months) before expiry.`);
      }
    }
  }

  // 3. Check for Prohibited / Cold-chain / Narcotic Substances
  const combinedText = `${medicineName || ''} ${genericName || ''}`.toLowerCase();
  for (const term of PROHIBITED_TERMS) {
    // Word boundary or substring match
    if (combinedText.includes(term.toLowerCase())) {
      errors.push(`Safety Violation: Items containing or classified as "${term}" (such as narcotics, controlled substances, cold-chain biologics like insulin, or injectable solutions) cannot be donated through peer-to-peer drop-offs.`);
      break;
    }
  }

  // 4. Quantity and Unit Checks
  if (!quantity || Number(quantity) <= 0) {
    errors.push('Quantity must be greater than zero.');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

module.exports = {
  validateMedicineSafety
};
