import { useState, useCallback } from 'react';
import { API_CONFIG } from '../config/api';
import { isProduction } from '../config/appSettings';
import apiHelper from '../services/apiHelper';

export const useCareerRoles = () => {
  // Global state
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Error handling helper
  const handleError = useCallback((message, err) => {
    console.error(message, err);
    setError(message);
    throw err;
  }, []);

  // Clear error
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // API helper functions
  const getApiUrl = () => isProduction() ? API_CONFIG.BASE_URL : API_CONFIG.BASE_URL_Local;

  // Fetch all career roles with pagination and search
  const getAllCareerRoles = useCallback(async (params = {}) => {
    try {
      setLoading(true);
      setError(null);
      
      // Build query parameters
      const queryParams = new URLSearchParams();
      if (params.page) queryParams.append('page', params.page);
      if (params.pageSize) queryParams.append('pageSize', params.pageSize);
      if (params.search) queryParams.append('search', params.search);
      
      const queryString = queryParams.toString();
      const endpoint = queryString ? `/career-roles?${queryString}` : '/career-roles';
      
      const response = await apiHelper.get(endpoint);
      
      if (!response.ok) {
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
        
        throw new Error(`HTTP error! status: ${response.status} - ${errorDetails}`);
      }
      
      // Handle successful response - check if it has content before parsing JSON
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        const data = await response.json();
        return data;
      } else {
        // For successful responses without JSON content, return a success indicator
        const textData = await response.text();
        return textData ? { success: true, message: textData } : { success: true };
      }
    } catch (err) {
      handleError('Failed to fetch career roles', err);
      return [];
    } finally {
      setLoading(false);
    }
  }, [handleError]);

  // Get career role by ID
  const getCareerRoleById = useCallback(async (roleId) => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiHelper.get(`/career-roles/${roleId}`);
      
      if (!response.ok) {
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
        
        throw new Error(`HTTP error! status: ${response.status} - ${errorDetails}`);
      }
      
      // Handle successful response - check if it has content before parsing JSON
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        const data = await response.json();
        return data;
      } else {
        // For successful responses without JSON content, return a success indicator
        const textData = await response.text();
        return textData ? { success: true, message: textData } : { success: true };
      }
    } catch (err) {
      handleError('Failed to fetch career role', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [handleError]);

  // Create career role
  const createCareerRole = useCallback(async (roleData) => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiHelper.post('/career-roles', roleData);
      
      if (!response.ok) {
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
        
        throw new Error(`HTTP error! status: ${response.status} - ${errorDetails}`);
      }
      
      // Handle successful response - check if it has content before parsing JSON
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        const data = await response.json();
        return data;
      } else {
        // For successful responses without JSON content, return a success indicator
        const textData = await response.text();
        return textData ? { success: true, message: textData } : { success: true };
      }
    } catch (err) {
      handleError('Failed to create career role', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [handleError]);

  // Update career role
  const updateCareerRole = useCallback(async (roleId, roleData) => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiHelper.put(`/career-roles/${roleId}`, roleData);
      
      if (!response.ok) {
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
        
        throw new Error(`HTTP error! status: ${response.status} - ${errorDetails}`);
      }
      
      // Handle successful response - check if it has content before parsing JSON
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        const data = await response.json();
        return data;
      } else {
        // For successful responses without JSON content, return a success indicator
        const textData = await response.text();
        return textData ? { success: true, message: textData } : { success: true };
      }
    } catch (err) {
      handleError('Failed to update career role', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [handleError]);

  // Delete career role
  const deleteCareerRole = useCallback(async (roleId) => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiHelper.delete(`/career-roles/${roleId}`);
      
      if (!response.ok) {
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
        
        throw new Error(`HTTP error! status: ${response.status} - ${errorDetails}`);
      }
      
      // Handle successful response - check if it has content before parsing JSON
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        const data = await response.json();
        return data;
      } else {
        // For successful responses without JSON content, return a success indicator
        const textData = await response.text();
        return textData ? { success: true, message: textData } : { success: true };
      }
    } catch (err) {
      handleError('Failed to delete career role', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [handleError]);

  // Create career role with file
  const createCareerRoleWithFile = useCallback(async (formData) => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiHelper.postWithFormData('/career-roles', formData);
      
      if (!response.ok) {
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
        
        throw new Error(`HTTP error! status: ${response.status} - ${errorDetails}`);
      }
      
      // Handle successful response - check if it has content before parsing JSON
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        const data = await response.json();
        return data;
      } else {
        // For successful responses without JSON content, return a success indicator
        const textData = await response.text();
        return textData ? { success: true, message: textData } : { success: true };
      }
    } catch (err) {
      handleError('Failed to create career role', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [handleError]);

  // Update career role with file
  const updateCareerRoleWithFile = useCallback(async (roleId, formData) => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiHelper.putWithFormData(`/career-roles/${roleId}`, formData);
      
      if (!response.ok) {
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
        
        throw new Error(`HTTP error! status: ${response.status} - ${errorDetails}`);
      }
      
      // Handle successful response - check if it has content before parsing JSON
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        const data = await response.json();
        return data;
      } else {
        // For successful responses without JSON content, return a success indicator
        const textData = await response.text();
        return textData ? { success: true, message: textData } : { success: true };
      }
    } catch (err) {
      handleError('Failed to update career role', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [handleError]);

  return {
    // Global state
    loading,
    error,
    clearError,

    // API functions
    getAllCareerRoles,
    getCareerRoleById,
    createCareerRole,
    updateCareerRole,
    createCareerRoleWithFile,
    updateCareerRoleWithFile,
    deleteCareerRole,
  };
};
