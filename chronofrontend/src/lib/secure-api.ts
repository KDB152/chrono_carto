import { secureApiCall, sanitizeFormData, generateCSRFToken, setCSRFToken } from './security';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

class SecureAPI {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  private async makeRequest(
    endpoint: string,
    options: RequestInit = {},
    requireAuth: boolean = true
  ): Promise<Response> {
    const url = `${this.baseUrl}${endpoint}`;
    
    // Add CSRF token for state-changing operations
    if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(options.method || 'GET')) {
      const csrfToken = generateCSRFToken();
      setCSRFToken(csrfToken);
    }

    // Add authentication header if required
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...options.headers as Record<string, string>,
    };

    if (requireAuth) {
      const token = this.getAuthToken();
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
    }

    return secureApiCall(url, {
      ...options,
      headers,
    });
  }

  private getAuthToken(): string | null {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('auth-token');
    }
    return null;
  }

  // GET request
  async get<T>(endpoint: string, requireAuth: boolean = true): Promise<T> {
    const response = await this.makeRequest(endpoint, { method: 'GET' }, requireAuth);
    
    if (!response.ok) {
      throw new Error(`API Error: ${response.status} ${response.statusText}`);
    }
    
    return response.json();
  }

  // POST request
  async post<T>(endpoint: string, data: any, requireAuth: boolean = true): Promise<T> {
    const sanitizedData = sanitizeFormData(data);
    
    const response = await this.makeRequest(
      endpoint,
      {
        method: 'POST',
        body: JSON.stringify(sanitizedData),
      },
      requireAuth
    );
    
    if (!response.ok) {
      throw new Error(`API Error: ${response.status} ${response.statusText}`);
    }
    
    return response.json();
  }

  // PUT request
  async put<T>(endpoint: string, data: any, requireAuth: boolean = true): Promise<T> {
    const sanitizedData = sanitizeFormData(data);
    
    const response = await this.makeRequest(
      endpoint,
      {
        method: 'PUT',
        body: JSON.stringify(sanitizedData),
      },
      requireAuth
    );
    
    if (!response.ok) {
      throw new Error(`API Error: ${response.status} ${response.statusText}`);
    }
    
    return response.json();
  }

  // DELETE request
  async delete<T>(endpoint: string, requireAuth: boolean = true): Promise<T> {
    const response = await this.makeRequest(
      endpoint,
      { method: 'DELETE' },
      requireAuth
    );
    
    if (!response.ok) {
      throw new Error(`API Error: ${response.status} ${response.statusText}`);
    }
    
    return response.json();
  }

  // File upload
  async uploadFile<T>(
    endpoint: string,
    file: File,
    additionalData: Record<string, any> = {},
    requireAuth: boolean = true
  ): Promise<T> {
    const formData = new FormData();
    formData.append('file', file);
    
    // Sanitize additional data
    const sanitizedData = sanitizeFormData(additionalData);
    Object.entries(sanitizedData).forEach(([key, value]) => {
      formData.append(key, String(value));
    });

    const response = await this.makeRequest(
      endpoint,
      {
        method: 'POST',
        body: formData,
        headers: {
          // Don't set Content-Type for FormData, let browser set it
        },
      },
      requireAuth
    );
    
    if (!response.ok) {
      throw new Error(`API Error: ${response.status} ${response.statusText}`);
    }
    
    return response.json();
  }
}

// Create singleton instance
export const secureAPI = new SecureAPI(API_BASE_URL);

// Export individual methods for convenience
export const { get, post, put, delete: del, uploadFile } = secureAPI;
