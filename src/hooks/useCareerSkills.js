import { useState, useCallback } from 'react';
import { API_CONFIG } from '../config/api';
import { isProduction } from '../config/appSettings';

export const useCareerSkills = () => {
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
  const getApiUrl = useCallback(() => isProduction() ? API_CONFIG.BASE_URL : API_CONFIG.BASE_URL_Local, []);
  const getAuthHeaders = useCallback(() => {
    const token = localStorage.getItem('adminToken');
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    };
  }, []);

  // Fetch all career skills with pagination and search
  const getAllCareerSkills = useCallback(async (params = {}) => {
    try {
      setLoading(true);
      setError(null);
      
      // Build query parameters
      const queryParams = new URLSearchParams();
      if (params.page) queryParams.append('page', params.page);
      if (params.pageSize) queryParams.append('pageSize', params.pageSize);
      if (params.search) queryParams.append('search', params.search);
      
      const queryString = queryParams.toString();
      const url = queryString ? `${getApiUrl()}/careerskills?${queryString}` : `${getApiUrl()}/careerskills`;
      
      const response = await fetch(url, {
        headers: getAuthHeaders()
      });
      
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
      handleError('Failed to fetch career skills', err);
      return [];
    } finally {
      setLoading(false);
    }
  }, [handleError, getApiUrl, getAuthHeaders]);

  // Get career skill by ID
  const getCareerSkillById = useCallback(async (skillId) => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(`${getApiUrl()}/careerskills/${skillId}`, {
        headers: getAuthHeaders()
      });
      
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
      handleError('Failed to fetch career skill', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [handleError, getApiUrl, getAuthHeaders]);

  // Create career skill
  const createCareerSkill = useCallback(async (skillData) => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(`${getApiUrl()}/careerskills`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(skillData)
      });
      
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
      handleError('Failed to create career skill', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [handleError, getApiUrl, getAuthHeaders]);

  // Update career skill
  const updateCareerSkill = useCallback(async (skillId, skillData) => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(`${getApiUrl()}/careerskills/${skillId}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(skillData)
      });
      
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
      handleError('Failed to update career skill', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [handleError, getApiUrl, getAuthHeaders]);

  // Delete career skill
  const deleteCareerSkill = useCallback(async (skillId) => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(`${getApiUrl()}/careerskills/${skillId}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      });
      
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
      handleError('Failed to delete career skill', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [handleError, getApiUrl, getAuthHeaders]);

  return {
    // Global state
    loading,
    error,
    clearError,

    // API functions
    getAllCareerSkills,
    getCareerSkillById,
    createCareerSkill,
    updateCareerSkill,
    deleteCareerSkill,
  };
};
