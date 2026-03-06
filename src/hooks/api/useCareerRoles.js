import { useState, useCallback } from 'react';
import ApiService from '../../services/ApiService';

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

  // Fetch all career roles with pagination and search
  const getAllCareerRoles = useCallback(async (params = {}) => {
    try {
      setLoading(true);
      setError(null);
      const data = await ApiService.getCareerRoles(params);
      return data;
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
      const data = await ApiService.getCareerRoleById(roleId);
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
      const data = await ApiService.createCareerRole(roleData);
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
      const data = await ApiService.updateCareerRole(roleId, roleData);
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
      const data = await ApiService.deleteCareerRole(roleId);
      return data;
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
      const data = await ApiService.createCareerRoleWithFile(formData);
      return data;
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
      const data = await ApiService.updateCareerRoleWithFile(roleId, formData);
      return data;
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
