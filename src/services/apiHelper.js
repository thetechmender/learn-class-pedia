import { API_CONFIG } from '../config/api';
import { isProduction } from '../config/appSettings';
import { checkTokenBeforeRequest } from '../utils/authDebug';

/**
 * Generic API helper class for making authenticated requests
 */
class ApiHelper {
  constructor() {
    this.baseURL = isProduction() ? API_CONFIG.BASE_URL : API_CONFIG.BASE_URL_Local;
    this.timeout = API_CONFIG.TIMEOUT;
  }

  /**
   * Get authorization headers
   * @returns {Object} Headers object with authorization
   */
  getAuthHeaders() {
    const token = localStorage.getItem('adminToken');
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    };
  }

  /**
   * Get auth headers for FormData (don't set Content-Type)
   * @returns {Object} Headers object with authorization
   */
  getAuthHeadersForFormData() {
    const token = localStorage.getItem('adminToken');
    return {
      'accept': '*/*',
      'Authorization': `Bearer ${token}`
    };
  }

  /**
   * Make an authenticated API request
   * @param {string} endpoint - API endpoint
   * @param {Object} options - Fetch options
   * @returns {Promise<Response>} Fetch response
   */
  async request(endpoint, options = {}) {
    // Check token before making request
    try {
      checkTokenBeforeRequest();
    } catch (error) {
      // Token is missing or expired
      console.error('Authentication error:', error.message);
      // Redirect to login or handle auth error
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
      throw error;
    }
    
    const url = `${this.baseURL}${endpoint}`;
    
    const config = {
      headers: this.getAuthHeaders(),
      timeout: this.timeout,
      ...options,
    };

    // If using FormData, don't set Content-Type header
    if (options.body instanceof FormData) {
      config.headers = {
        ...this.getAuthHeadersForFormData(),
        ...options.headers,
      };
      delete config.headers['Content-Type'];
    }

    try {
      const response = await fetch(url, config);

      if (!response.ok) {
        // Handle 401 specifically
        if (response.status === 401) {
          console.error('🚨 401 Unauthorized - Token may be invalid or expired');
          // Clear token and redirect to login
          localStorage.removeItem('adminToken');
          if (window.location.pathname !== '/login') {
            window.location.href = '/login';
          }
        }

        // Try to get error details from response body
        let errorDetails = '';
        try {
          const contentType = response.headers.get('content-type');
          if (contentType && contentType.includes('application/json')) {
            const errorData = await response.json();
            errorDetails = errorData.error || errorData.message || errorData.title || JSON.stringify(errorData);
          } else {
            const textData = await response.text();
            errorDetails = textData || response.statusText || 'Unknown error';
          }
        } catch (parseError) {
          errorDetails = response.statusText || 'Unknown error';
        }
        
        const error = new Error(`HTTP error! status: ${response.status} - ${errorDetails}`);
        error.response = {
          status: response.status,
          statusText: response.statusText,
          data: errorDetails
        };
        throw error;
      }

      return response;
    } catch (error) {
      if (error.name === 'AbortError') {
        throw new Error('Request timeout');
      }
      throw error;
    }
  }

  /**
   * Make a GET request
   * @param {string} endpoint - API endpoint
   * @param {Object} options - Additional fetch options
   * @returns {Promise<Response>} Fetch response
   */
  async get(endpoint, options = {}) {
    return this.request(endpoint, { method: 'GET', ...options });
  }

  /**
   * Make a POST request
   * @param {string} endpoint - API endpoint
   * @param {Object} data - Request body data
   * @param {Object} options - Additional fetch options
   * @returns {Promise<Response>} Fetch response
   */
  async post(endpoint, data = null, options = {}) {
    return this.request(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : null,
      ...options,
    });
  }

  /**
   * Make a POST request with FormData
   * @param {string} endpoint - API endpoint
   * @param {FormData} formData - FormData object
   * @param {Object} options - Additional fetch options
   * @returns {Promise<Response>} Fetch response
   */
  async postWithFormData(endpoint, formData, options = {}) {
    return this.request(endpoint, {
      method: 'POST',
      body: formData,
      ...options,
    });
  }

  /**
   * Make a PUT request
   * @param {string} endpoint - API endpoint
   * @param {Object} data - Request body data
   * @param {Object} options - Additional fetch options
   * @returns {Promise<Response>} Fetch response
   */
  async put(endpoint, data = null, options = {}) {
    return this.request(endpoint, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : null,
      ...options,
    });
  }

  /**
   * Make a PUT request with FormData
   * @param {string} endpoint - API endpoint
   * @param {FormData} formData - FormData object
   * @param {Object} options - Additional fetch options
   * @returns {Promise<Response>} Fetch response
   */
  async putWithFormData(endpoint, formData, options = {}) {
    return this.request(endpoint, {
      method: 'PUT',
      body: formData,
      ...options,
    });
  }

  /**
   * Make a PATCH request
   * @param {string} endpoint - API endpoint
   * @param {Object} data - Request body data
   * @param {Object} options - Additional fetch options
   * @returns {Promise<Response>} Fetch response
   */
  async patch(endpoint, data = null, options = {}) {
    return this.request(endpoint, {
      method: 'PATCH',
      body: data ? JSON.stringify(data) : null,
      ...options,
    });
  }

  /**
   * Make a DELETE request
   * @param {string} endpoint - API endpoint
   * @param {Object} options - Additional fetch options
   * @returns {Promise<Response>} Fetch response
   */
  async delete(endpoint, options = {}) {
    return this.request(endpoint, { method: 'DELETE', ...options });
  }
}

export default new ApiHelper();
