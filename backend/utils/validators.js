export function validateEmail(email) {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return typeof email === 'string' && re.test(email.trim());
}

export function validatePhone(phone) {
  if (!phone) return true;
  const re = /^\+?[0-9]{7,15}$/;
  return re.test(phone.trim());
}

export function validatePasswordStrength(password) {
  if (typeof password !== 'string' || password.length < 8) {
    return { valid: false, message: 'Password must be at least 8 characters long.' };
  }
  if (!/[A-Z]/.test(password)) {
    return { valid: false, message: 'Password must include at least one uppercase letter.' };
  }
  if (!/[a-z]/.test(password)) {
    return { valid: false, message: 'Password must include at least one lowercase letter.' };
  }
  if (!/[0-9]/.test(password)) {
    return { valid: false, message: 'Password must include at least one number.' };
  }
  if (!/[^A-Za-z0-9]/.test(password)) {
    return { valid: false, message: 'Password must include at least one special character.' };
  }
  return { valid: true, message: '' };
}
