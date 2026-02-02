import { useState, useCallback } from 'react';
import { API_CONFIG } from '../config/api';

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
  const getApiUrl = () => API_CONFIG.BASE_URL_Local;
  const getAuthHeaders = () => {
    const token = localStorage.getItem('adminToken');
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    };
  };

  // Fetch all career skills
  const getAllCareerSkills = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(`${getApiUrl()}/careerskills`, {
        headers: getAuthHeaders()
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      return Array.isArray(data) ? data : [];
    } catch (err) {
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
      const response = await fetch(`${getApiUrl()}/careerskills/${skillId}`, {
        headers: getAuthHeaders()
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      return data;
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
      const response = await fetch(`${getApiUrl()}/careerskills`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(skillData)
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      return data;
    } catch (err) {
      handleError('Failed to create career skill', err);
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
      const response = await fetch(`${getApiUrl()}/careerskills/${skillId}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(skillData)
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      return data;
    } catch (err) {
      handleError('Failed to update career skill', err);
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
      const response = await fetch(`${getApiUrl()}/careerskills/${skillId}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      return data;
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
