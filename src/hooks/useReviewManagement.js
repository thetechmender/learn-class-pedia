import { useState, useCallback } from 'react';
import { API_CONFIG } from '../config/api';
import { isProduction } from '../config/appSettings';
import apiHelper from '../services/apiHelper';

export const useReviewManagement = () => {
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

  // Fetch all reviews
  const getAllReviews = useCallback(async (filters = {}) => {
    try {
      setLoading(true);
      setError(null);
      
      const queryParams = new URLSearchParams();
      if (filters.search) queryParams.append('search', filters.search);
      if (filters.rating) queryParams.append('rating', filters.rating);
      if (filters.status) queryParams.append('status', filters.status);
      if (filters.page) queryParams.append('page', filters.page);
      if (filters.pageSize) queryParams.append('pageSize', filters.pageSize);
      
      const queryString = queryParams.toString();
      const endpoint = `/reviews${queryString ? `?${queryString}` : ''}`;
      
      const response = await apiHelper.get(endpoint);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      return data;
    } catch (err) {
      handleError('Failed to fetch reviews', err);
      return [];
    } finally {
      setLoading(false);
    }
  }, [handleError]);

  // Get review by ID
  const getReviewById = useCallback(async (reviewId) => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiHelper.get(`/reviews/${reviewId}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      return data;
    } catch (err) {
      handleError('Failed to fetch review', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [handleError]);

  // Update review status
  const updateReviewStatus = useCallback(async (reviewId, status) => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiHelper.patch(`/reviews/${reviewId}/status`, { status });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      return data;
    } catch (err) {
      handleError('Failed to update review status', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [handleError]);

  // Respond to review
  const respondToReview = useCallback(async (reviewId, response) => {
    try {
      setLoading(true);
      setError(null);
      const apiResponse = await apiHelper.post(`/reviews/${reviewId}/respond`, { response });
      
      if (!apiResponse.ok) {
        throw new Error(`HTTP error! status: ${apiResponse.status}`);
      }
      
      const data = await apiResponse.json();
      return data;
    } catch (err) {
      handleError('Failed to respond to review', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [handleError]);

  // Delete review
  const deleteReview = useCallback(async (reviewId) => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiHelper.delete(`/reviews/${reviewId}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      return data;
    } catch (err) {
      handleError('Failed to delete review', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [handleError]);

  // Mark review as helpful/not helpful
  const markReviewHelpful = useCallback(async (reviewId, helpful) => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiHelper.patch(`/reviews/${reviewId}/helpful`, { helpful });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      return data;
    } catch (err) {
      handleError('Failed to update review helpful status', err);
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
    getAllReviews,
    getReviewById,
    updateReviewStatus,
    respondToReview,
    deleteReview,
    markReviewHelpful,
  };
};
