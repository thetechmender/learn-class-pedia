import { useState, useCallback } from 'react';
import { API_CONFIG } from '../config/api';
import { isProduction } from '../config/appSettings';
import apiHelper from '../services/apiHelper';

export const useCareerSkills = () => {
  // Global state
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

 const handleError = useCallback((message, err) => {
  console.error(message, err);
  setError(err?.message || message);   
  throw err;
}, []);
  // Clear error
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // API helper functions
  const getApiUrl = useCallback(() => isProduction() ? API_CONFIG.BASE_URL : API_CONFIG.BASE_URL_Local, []);

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
      const endpoint = queryString ? `/careerskills?${queryString}` : '/careerskills';
      
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
        console.error('Failed to create career skill', err);
      handleError('Failed to fetch career skills', err);
      return [];
    } finally {
      setLoading(false);
    }
  }, [handleError]);

  // Get career skill by ID
  const getCareerSkillById = useCallback(async (skillId) => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiHelper.get(`/careerskills/${skillId}`);
      
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
  }, [handleError]);

  // Create career skill
  const createCareerSkill = useCallback(async (skillData) => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiHelper.post('/careerskills', skillData);
      
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
        console.error('Failed to create career skill', err);
      // handleError('Failed to create career skill', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [handleError]);

  // Update career skill
  const updateCareerSkill = useCallback(async (skillId, skillData) => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiHelper.put(`/careerskills/${skillId}`, skillData);
      
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
      // handleError('Failed to update career skill', err);
        console.error('Failed to create career skill', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [handleError]);

  // Delete career skill
  const deleteCareerSkill = useCallback(async (skillId) => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiHelper.delete(`/careerskills/${skillId}`);
      
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
  }, [handleError]);

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
