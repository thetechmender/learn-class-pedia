import { useState, useCallback } from 'react';
import { API_CONFIG } from '../config/api';

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
  const getApiUrl = () => API_CONFIG.BASE_URL_Local;
  const getAuthHeaders = () => {
    const token = localStorage.getItem('adminToken');
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    };
  };

  // Fetch all career roles
  const getAllCareerRoles = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(`${getApiUrl()}/career-roles`, {
        headers: getAuthHeaders()
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      return Array.isArray(data) ? data : [];
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
      const response = await fetch(`${getApiUrl()}/career-roles/${roleId}`, {
        headers: getAuthHeaders()
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      return data;
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
      const response = await fetch(`${getApiUrl()}/career-roles`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(roleData)
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      return data;
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
      const response = await fetch(`${getApiUrl()}/career-roles/${roleId}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(roleData)
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      return data;
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
      const response = await fetch(`${getApiUrl()}/career-roles/${roleId}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      return data;
    } catch (err) {
      handleError('Failed to delete career role', err);
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
    deleteCareerRole,
  };
};
