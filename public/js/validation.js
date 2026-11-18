/**
 * MedShare - Client-side Form Validation Helpers
 */

export function isValidEmail(email) {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(String(email).toLowerCase());
}

export function isValidPassword(password) {
  // Min 8 chars, 1 uppercase, 1 lowercase, 1 digit
  if (!password || password.length < 8) return false;
  const hasUpper = /[A-Z]/.test(password);
  const hasLower = /[a-z]/.test(password);
  const hasDigit = /\d/.test(password);
  return hasUpper && hasLower && hasDigit;
}

export function checkExpiryShelfLife(expiryDateString, minDays = 90) {
  if (!expiryDateString) {
    return { isValid: false, message: 'Please select an expiry date' };
  }

  const expiry = new Date(expiryDateString);
  const now = new Date();

  if (isNaN(expiry.getTime())) {
    return { isValid: false, message: 'Invalid date format' };
  }

  if (expiry <= now) {
    return { isValid: false, message: 'This medicine is already expired and cannot be accepted.' };
  }

  const diffTime = expiry.getTime() - now.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays < minDays) {
    return {
      isValid: false,
      diffDays,
      message: `Safety Warning: Only ${diffDays} days remaining until expiry. MedShare requires at least ${minDays} days (approx. 3 months) to guarantee safe redistribution.`
    };
  }

  return { isValid: true, diffDays };
}

export function clearFormErrors(form) {
  form.querySelectorAll('.is-invalid').forEach((el) => el.classList.remove('is-invalid'));
  form.querySelectorAll('.invalid-feedback').forEach((el) => el.remove());
}

export function setFieldError(field, message) {
  field.classList.add('is-invalid');
  const errorEl = document.createElement('div');
  errorEl.className = 'invalid-feedback';
  errorEl.textContent = message;
  field.parentElement.appendChild(errorEl);
}
