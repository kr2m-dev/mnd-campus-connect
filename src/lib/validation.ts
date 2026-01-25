/**
 * Validation and Sanitization Utilities
 * Protects against XSS, injection attacks, and ensures data integrity
 */

// ============================================
// Input Sanitization (XSS Protection)
// ============================================

/**
 * Sanitize text input to prevent XSS attacks
 * Removes HTML tags and dangerous characters
 */
export function sanitizeText(input: string): string {
  if (!input) return '';

  return input
    .trim()
    // Remove HTML tags
    .replace(/<[^>]*>/g, '')
    // Remove script tags and content
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    // Remove event handlers
    .replace(/on\w+\s*=\s*["'][^"']*["']/gi, '')
    // Remove javascript: protocol
    .replace(/javascript:/gi, '')
    // Normalize whitespace
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Sanitize and validate name (first name or last name)
 * Allows: letters, spaces, hyphens, apostrophes, accented characters
 */
export function sanitizeName(name: string): string {
  if (!name) return '';

  return sanitizeText(name)
    // Remove anything that's not a letter, space, hyphen, or apostrophe
    .replace(/[^a-zA-ZÀ-ÿ\s\-']/g, '')
    // Remove multiple spaces
    .replace(/\s+/g, ' ')
    // Remove multiple hyphens
    .replace(/-+/g, '-')
    // Remove leading/trailing hyphens and spaces
    .trim()
    .replace(/^[-'\s]+|[-'\s]+$/g, '');
}

/**
 * Sanitize phone number - removes all non-digit characters
 */
export function sanitizePhone(phone: string): string {
  if (!phone) return '';
  // Keep only digits and + sign
  return phone.replace(/[^\d+]/g, '');
}

// ============================================
// Validation Functions
// ============================================

export interface ValidationResult {
  isValid: boolean;
  error?: string;
}

/**
 * Validate name (first name or last name)
 */
export function validateName(name: string, fieldName: string = 'Nom'): ValidationResult {
  const sanitized = sanitizeName(name);

  if (!sanitized) {
    return { isValid: false, error: `${fieldName} est requis` };
  }

  if (sanitized.length < 2) {
    return { isValid: false, error: `${fieldName} doit contenir au moins 2 caractères` };
  }

  if (sanitized.length > 50) {
    return { isValid: false, error: `${fieldName} ne peut pas dépasser 50 caractères` };
  }

  // Check for valid name pattern (letters, spaces, hyphens, apostrophes)
  const namePattern = /^[a-zA-ZÀ-ÿ\s\-']+$/;
  if (!namePattern.test(sanitized)) {
    return {
      isValid: false,
      error: `${fieldName} ne peut contenir que des lettres, espaces, tirets et apostrophes`
    };
  }

  return { isValid: true };
}

/**
 * Validate email address
 */
export function validateEmail(email: string): ValidationResult {
  const sanitized = sanitizeText(email).toLowerCase();

  if (!sanitized) {
    return { isValid: false, error: 'Email est requis' };
  }

  // RFC 5322 compliant email regex (simplified but robust)
  const emailPattern = /^[a-zA-Z0-9.!#$%&'*+\/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;

  if (!emailPattern.test(sanitized)) {
    return { isValid: false, error: 'Format d\'email invalide' };
  }

  if (sanitized.length > 254) {
    return { isValid: false, error: 'Email trop long' };
  }

  return { isValid: true };
}

/**
 * Validate phone number
 * Supports international formats with + prefix
 */
export function validatePhone(phone: string): ValidationResult {
  const sanitized = sanitizePhone(phone);

  if (!sanitized) {
    return { isValid: false, error: 'Téléphone est requis' };
  }

  // International format: +XXX... or local format
  const internationalPattern = /^\+?[1-9]\d{7,14}$/;

  if (!internationalPattern.test(sanitized)) {
    return {
      isValid: false,
      error: 'Format de téléphone invalide. Utilisez un format international (+221771234567) ou local (771234567)'
    };
  }

  return { isValid: true };
}

/**
 * Validate password strength
 * Simplified: minimum 6 characters
 */
export function validatePassword(password: string): ValidationResult {
  if (!password) {
    return { isValid: false, error: 'Mot de passe est requis' };
  }

  if (password.length < 6) {
    return {
      isValid: false,
      error: 'Mot de passe doit contenir au moins 6 caractères'
    };
  }

  if (password.length > 128) {
    return {
      isValid: false,
      error: 'Mot de passe trop long (max 128 caractères)'
    };
  }

  return { isValid: true };
}

/**
 * Get password strength score (0-4)
 * 0 = Very Weak, 1 = Weak, 2 = Fair, 3 = Good, 4 = Strong
 */
export function getPasswordStrength(password: string): {
  score: number;
  label: string;
  color: string;
} {
  if (!password) {
    return { score: 0, label: 'Très faible', color: 'red' };
  }

  let score = 0;

  // Length
  if (password.length >= 8) score++;
  if (password.length >= 12) score++;

  // Character variety
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score++;
  if (/\d/.test(password)) score++;
  if (/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) score++;

  // Cap at 4
  score = Math.min(score, 4);

  const labels = ['Très faible', 'Faible', 'Moyen', 'Bon', 'Fort'];
  const colors = ['red', 'orange', 'yellow', 'lightgreen', 'green'];

  return {
    score,
    label: labels[score],
    color: colors[score]
  };
}

/**
 * Validate all registration form fields
 */
export interface RegistrationData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  password: string;
  confirmPassword: string;
  universityId: string;
}

export interface RegistrationValidationResult {
  isValid: boolean;
  errors: {
    firstName?: string;
    lastName?: string;
    email?: string;
    phone?: string;
    password?: string;
    confirmPassword?: string;
    universityId?: string;
  };
  sanitized?: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
  };
}

export function validateRegistration(data: RegistrationData): RegistrationValidationResult {
  const errors: RegistrationValidationResult['errors'] = {};

  // Validate first name
  const firstNameResult = validateName(data.firstName, 'Prénom');
  if (!firstNameResult.isValid) {
    errors.firstName = firstNameResult.error;
  }

  // Validate last name
  const lastNameResult = validateName(data.lastName, 'Nom');
  if (!lastNameResult.isValid) {
    errors.lastName = lastNameResult.error;
  }

  // Validate email
  const emailResult = validateEmail(data.email);
  if (!emailResult.isValid) {
    errors.email = emailResult.error;
  }

  // Validate phone
  const phoneResult = validatePhone(data.phone);
  if (!phoneResult.isValid) {
    errors.phone = phoneResult.error;
  }

  // Validate password
  const passwordResult = validatePassword(data.password);
  if (!passwordResult.isValid) {
    errors.password = passwordResult.error;
  }

  // Validate password confirmation
  if (data.password !== data.confirmPassword) {
    errors.confirmPassword = 'Les mots de passe ne correspondent pas';
  }

  // Validate university
  if (!data.universityId) {
    errors.universityId = 'Veuillez sélectionner votre université';
  }

  const isValid = Object.keys(errors).length === 0;

  return {
    isValid,
    errors,
    sanitized: isValid ? {
      firstName: sanitizeName(data.firstName),
      lastName: sanitizeName(data.lastName),
      email: sanitizeText(data.email).toLowerCase(),
      phone: sanitizePhone(data.phone),
    } : undefined
  };
}

/**
 * Validate supplier registration form
 */
export interface SupplierRegistrationData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
  businessName: string;
  description: string;
  contactEmail: string;
  contactPhone: string;
  contactWhatsapp: string;
  address: string;
}

export interface SupplierRegistrationValidationResult {
  isValid: boolean;
  errors: {
    firstName?: string;
    lastName?: string;
    email?: string;
    password?: string;
    confirmPassword?: string;
    businessName?: string;
    description?: string;
    contactEmail?: string;
    contactPhone?: string;
    contactWhatsapp?: string;
    address?: string;
  };
  sanitized?: {
    firstName: string;
    lastName: string;
    email: string;
    businessName: string;
    description: string;
    contactEmail: string;
    contactPhone: string;
    contactWhatsapp: string;
    address: string;
  };
}

export function validateSupplierRegistration(data: SupplierRegistrationData): SupplierRegistrationValidationResult {
  const errors: SupplierRegistrationValidationResult['errors'] = {};

  // Validate personal info
  const firstNameResult = validateName(data.firstName, 'Prénom');
  if (!firstNameResult.isValid) {
    errors.firstName = firstNameResult.error;
  }

  const lastNameResult = validateName(data.lastName, 'Nom');
  if (!lastNameResult.isValid) {
    errors.lastName = lastNameResult.error;
  }

  const emailResult = validateEmail(data.email);
  if (!emailResult.isValid) {
    errors.email = emailResult.error;
  }

  const passwordResult = validatePassword(data.password);
  if (!passwordResult.isValid) {
    errors.password = passwordResult.error;
  }

  if (data.password !== data.confirmPassword) {
    errors.confirmPassword = 'Les mots de passe ne correspondent pas';
  }

  // Validate business info
  const sanitizedBusinessName = sanitizeText(data.businessName);
  if (!sanitizedBusinessName) {
    errors.businessName = 'Nom de l\'entreprise est requis';
  } else if (sanitizedBusinessName.length < 2) {
    errors.businessName = 'Nom de l\'entreprise trop court (min 2 caractères)';
  } else if (sanitizedBusinessName.length > 100) {
    errors.businessName = 'Nom de l\'entreprise trop long (max 100 caractères)';
  }

  const sanitizedDescription = sanitizeText(data.description);
  if (sanitizedDescription && sanitizedDescription.length > 500) {
    errors.description = 'Description trop longue (max 500 caractères)';
  }

  // Contact email (optional but must be valid if provided)
  if (data.contactEmail) {
    const contactEmailResult = validateEmail(data.contactEmail);
    if (!contactEmailResult.isValid) {
      errors.contactEmail = contactEmailResult.error;
    }
  }

  // Contact phone (optional but must be valid if provided)
  if (data.contactPhone) {
    const contactPhoneResult = validatePhone(data.contactPhone);
    if (!contactPhoneResult.isValid) {
      errors.contactPhone = contactPhoneResult.error;
    }
  }

  // WhatsApp (required and must be valid)
  const whatsappResult = validatePhone(data.contactWhatsapp);
  if (!whatsappResult.isValid) {
    errors.contactWhatsapp = whatsappResult.error || 'Numéro WhatsApp requis pour recevoir les commandes';
  }

  // Address (optional)
  const sanitizedAddress = sanitizeText(data.address);
  if (sanitizedAddress && sanitizedAddress.length > 200) {
    errors.address = 'Adresse trop longue (max 200 caractères)';
  }

  const isValid = Object.keys(errors).length === 0;

  return {
    isValid,
    errors,
    sanitized: isValid ? {
      firstName: sanitizeName(data.firstName),
      lastName: sanitizeName(data.lastName),
      email: sanitizeText(data.email).toLowerCase(),
      businessName: sanitizedBusinessName,
      description: sanitizedDescription,
      contactEmail: data.contactEmail ? sanitizeText(data.contactEmail).toLowerCase() : '',
      contactPhone: data.contactPhone ? sanitizePhone(data.contactPhone) : '',
      contactWhatsapp: sanitizePhone(data.contactWhatsapp),
      address: sanitizedAddress,
    } : undefined
  };
}
