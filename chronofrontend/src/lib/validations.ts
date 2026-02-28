import { ERROR_MESSAGES } from './errorMessages';

export interface ValidationRule {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
  custom?: (value: any) => boolean;
  message: string;
}

export interface ValidationSchema {
  [key: string]: ValidationRule[];
}

export interface ValidationResult {
  isValid: boolean;
  errors: Record<string, string>;
}

export const validateField = (value: any, rules: ValidationRule[]): string | null => {
  for (const rule of rules) {
    if (rule.required && (!value || value.toString().trim() === '')) {
      return rule.message;
    }

    if (value && rule.minLength && value.toString().length < rule.minLength) {
      return rule.message;
    }

    if (value && rule.maxLength && value.toString().length > rule.maxLength) {
      return rule.message;
    }

    if (value && rule.pattern && !rule.pattern.test(value.toString())) {
      return rule.message;
    }

    if (value && rule.custom && !rule.custom(value)) {
      return rule.message;
    }
  }

  return null;
};

export const validateForm = (data: Record<string, any>, schema: ValidationSchema): ValidationResult => {
  const errors: Record<string, string> = {};

  for (const [field, rules] of Object.entries(schema)) {
    const error = validateField(data[field], rules);
    if (error) {
      errors[field] = error;
    }
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};

// Common validation patterns
export const patterns = {
  email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  phone: /^(?:(?:\+|00)33|0)\s*[1-9](?:[\s.-]*\d{2}){4}$/,
  password: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
  name: /^[a-zA-ZÀ-ÿ\s'-]{2,50}$/,
};

// Validation schemas
export const loginSchema: ValidationSchema = {
  email: [
    { required: true, message: ERROR_MESSAGES.VALIDATION.REQUIRED.EMAIL },
    { pattern: patterns.email, message: ERROR_MESSAGES.VALIDATION.INVALID.EMAIL },
  ],
  password: [
    { required: true, message: ERROR_MESSAGES.VALIDATION.REQUIRED.PASSWORD },
    { minLength: 6, message: 'Le mot de passe doit contenir au moins 6 caractères' },
  ],
};

export const registerSchema: ValidationSchema = {
  firstName: [
    { required: true, message: ERROR_MESSAGES.VALIDATION.REQUIRED.FIRST_NAME },
    { pattern: patterns.name, message: ERROR_MESSAGES.VALIDATION.INVALID.NAME_FORMAT },
  ],
  lastName: [
    { required: true, message: ERROR_MESSAGES.VALIDATION.REQUIRED.LAST_NAME },
    { pattern: patterns.name, message: ERROR_MESSAGES.VALIDATION.INVALID.NAME_FORMAT },
  ],
  email: [
    { required: true, message: ERROR_MESSAGES.VALIDATION.REQUIRED.EMAIL },
    { pattern: patterns.email, message: ERROR_MESSAGES.VALIDATION.INVALID.EMAIL },
  ],
  password: [
    { required: true, message: ERROR_MESSAGES.VALIDATION.REQUIRED.PASSWORD },
    { minLength: 8, message: ERROR_MESSAGES.VALIDATION.INVALID.PASSWORD_LENGTH },
    { 
      pattern: patterns.password, 
      message: ERROR_MESSAGES.VALIDATION.INVALID.PASSWORD_STRENGTH
    },
  ],
  confirmPassword: [
    { required: true, message: ERROR_MESSAGES.VALIDATION.REQUIRED.CONFIRM_PASSWORD },
  ],
  phone: [
    { pattern: patterns.phone, message: ERROR_MESSAGES.VALIDATION.INVALID.PHONE },
  ],
  role: [
    { required: true, message: ERROR_MESSAGES.VALIDATION.REQUIRED.ROLE },
    { 
      custom: (value) => ['student', 'parent'].includes(value), 
      message: ERROR_MESSAGES.VALIDATION.INVALID.ROLE_SELECTION
    },
  ],
  acceptTerms: [
    { 
      custom: (value) => value === true, 
      message: ERROR_MESSAGES.VALIDATION.TERMS
    },
  ],
};

export const forgotPasswordSchema: ValidationSchema = {
  email: [
    { required: true, message: ERROR_MESSAGES.VALIDATION.REQUIRED.EMAIL },
    { pattern: patterns.email, message: ERROR_MESSAGES.VALIDATION.INVALID.EMAIL },
  ],
};

export const resetPasswordSchema: ValidationSchema = {
  password: [
    { required: true, message: ERROR_MESSAGES.VALIDATION.REQUIRED.PASSWORD },
    { minLength: 8, message: ERROR_MESSAGES.VALIDATION.INVALID.PASSWORD_LENGTH },
    { 
      pattern: patterns.password, 
      message: ERROR_MESSAGES.VALIDATION.INVALID.PASSWORD_STRENGTH
    },
  ],
  confirmPassword: [
    { required: true, message: ERROR_MESSAGES.VALIDATION.REQUIRED.CONFIRM_PASSWORD },
  ],
};

// Custom validation functions
export const validatePasswordMatch = (password: string, confirmPassword: string): boolean => {
  return password === confirmPassword;
};

export const validateAge = (birthDate: string): boolean => {
  const today = new Date();
  const birth = new Date(birthDate);
  const age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    return age - 1 >= 13;
  }
  
  return age >= 13;
};

export const sanitizeInput = (input: string): string => {
  return input.trim().replace(/[<>]/g, '');
};


