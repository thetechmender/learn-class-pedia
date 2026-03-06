import { useState, useCallback } from 'react';
import ApiService from '../../services/ApiService';

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

  // Fetch all career skills with pagination and search
  const getAllCareerSkills = useCallback(async (params = {}) => {
    try {
      setLoading(true);
      setError(null);
      const data = await ApiService.getAllCareerSkills(params);
      return data;
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
      const data = await ApiService.getCareerSkillById(skillId);
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
      const data = await ApiService.createCareerSkill(skillData);
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
      const data = await ApiService.updateCareerSkill(skillId, skillData);
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
      const data = await ApiService.deleteCareerSkill(skillId);
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
