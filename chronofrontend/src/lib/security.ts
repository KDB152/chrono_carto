/**
 * Frontend Security Utilities
 * Prevents XSS, validates inputs, and sanitizes data
 */

// XSS Prevention
export const sanitizeHtml = (input: string): string => {
  if (!input || typeof input !== 'string') {
    return '';
  }
  
  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
};

// Input Validation
export const validateInput = (input: string, type: 'text' | 'email' | 'phone' | 'password'): boolean => {
  if (!input || typeof input !== 'string') {
    return false;
  }

  const trimmed = input.trim();
  
  switch (type) {
    case 'email':
      return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed);
    
    case 'phone':
      return /^[\d\s\-\+\(\)]+$/.test(trimmed) && trimmed.length >= 8;
    
    case 'password':
      return trimmed.length >= 8 && /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(trimmed);
    
    case 'text':
    default:
      return trimmed.length > 0 && trimmed.length <= 1000;
  }
};

// SQL Injection Prevention
export const sanitizeForDatabase = (input: string): string => {
  if (!input || typeof input !== 'string') {
    return '';
  }
  
  return input
    .replace(/['";\\]/g, '') // Remove dangerous SQL characters
    .replace(/--/g, '') // Remove SQL comments
    .replace(/\/\*/g, '') // Remove block comments start
    .replace(/\*\//g, '') // Remove block comments end
    .trim();
};

// CSRF Token Management
export const generateCSRFToken = (): string => {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
};

export const setCSRFToken = (token: string): void => {
  if (typeof window !== 'undefined') {
    sessionStorage.setItem('csrf-token', token);
  }
};

export const getCSRFToken = (): string | null => {
  if (typeof window !== 'undefined') {
    return sessionStorage.getItem('csrf-token');
  }
  return null;
};

// Secure API calls
export const secureApiCall = async (url: string, options: RequestInit = {}): Promise<Response> => {
  const csrfToken = getCSRFToken();
  
  const secureOptions: RequestInit = {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'X-CSRF-Token': csrfToken || '',
      'X-Requested-With': 'XMLHttpRequest',
      ...options.headers,
    },
    credentials: 'include',
  };

  return fetch(url, secureOptions);
};

// Content Security Policy helper
export const createCSPNonce = (): string => {
  const array = new Uint8Array(16);
  crypto.getRandomValues(array);
  return btoa(String.fromCharCode.apply(null, Array.from(array)));
};

// Input sanitization for forms
export const sanitizeFormData = (data: Record<string, any>): Record<string, any> => {
  const sanitized: Record<string, any> = {};
  
  for (const [key, value] of Object.entries(data)) {
    if (typeof value === 'string') {
      sanitized[key] = sanitizeHtml(sanitizeForDatabase(value));
    } else if (typeof value === 'object' && value !== null) {
      sanitized[key] = sanitizeFormData(value);
    } else {
      sanitized[key] = value;
    }
  }
  
  return sanitized;
};

// File upload security
export const validateFileUpload = (file: File): { valid: boolean; error?: string } => {
  const maxSize = 10 * 1024 * 1024; // 10MB
  const allowedTypes = [
    'image/jpeg',
    'image/png',
    'image/gif',
    'application/pdf',
    'text/plain',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ];
  
  if (file.size > maxSize) {
    return { valid: false, error: 'File size too large' };
  }
  
  if (!allowedTypes.includes(file.type)) {
    return { valid: false, error: 'File type not allowed' };
  }
  
  // Check file name for dangerous characters
  const dangerousChars = /[<>:"/\\|?*]/;
  if (dangerousChars.test(file.name)) {
    return { valid: false, error: 'Invalid file name' };
  }
  
  return { valid: true };
};
