import { useState, useCallback } from 'react';
import ApiService from '../../services/ApiService';

export const useCareerPathDiscount = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Assign discount rate to career path
  const assignDiscountRateToCareerPath = useCallback(async (careerPathId, discountRateId) => {
    try {
      setLoading(true);
      setError(null);
      const data = await ApiService.assignDiscountRateToCareerPath(careerPathId, discountRateId);
      return data;
    } catch (err) {
      setError('Failed to assign discount rate to career path');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Assign price to course type
  const assignPriceToCourseType = useCallback(async (courseTypeId, price) => {
    try {
      setLoading(true);
      setError(null);
      const data = await ApiService.assignPriceToCourseType(courseTypeId, price);
      return data;
    } catch (err) {
      setError('Failed to assign price to course type');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Clear error
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    loading,
    error,
    clearError,
    assignDiscountRateToCareerPath,
    assignPriceToCourseType,
  };
};
