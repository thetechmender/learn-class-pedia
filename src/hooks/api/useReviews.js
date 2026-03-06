import { useState, useEffect, useCallback } from 'react';
import ApiService from '../../services/ApiService';

export const useReviews = (options = {}) => {
  const {
    autoLoad = true,
    includeStatistics = true,
    includeCourses = true
  } = options;

  // Data state
  const [reviews, setReviews] = useState([]);
  const [courses, setCourses] = useState([]);
  const [statistics, setStatistics] = useState(null);
  
  // UI state
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // Filter state
  const [filters, setFilters] = useState({
    courseId: '',
    status: '',
    rating: '',
    search: '',
    page: 1,
    pageSize: 10
  });

  // Error handling helper
  const handleError = useCallback((message, err) => {
    console.error(message, err);
    setError(err?.message || message);
    throw err;
  }, []);

  // Clear error
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // === API FUNCTIONS (from useReviewManagement) ===

  // Fetch all reviews with optional filtering
  const getAllReviews = useCallback(async (customFilters = {}) => {
    try {
      setLoading(true);
      setError(null);
      const data = await ApiService.getAllReviews({ ...filters, ...customFilters });
      return data;
    } catch (err) {
      handleError('Failed to fetch reviews', err);
      return [];
    } finally {
      setLoading(false);
    }
  }, [filters, handleError]);

  // Get review by ID
  const getReviewById = useCallback(async (reviewId) => {
    try {
      setLoading(true);
      setError(null);
      const data = await ApiService.getReviewById(reviewId);
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
      const updatedReview = await ApiService.updateReviewStatus(reviewId, status);
      
      // Update local state
      setReviews(prev => 
        prev.map(review => 
          review.id === reviewId ? { ...review, ...updatedReview } : review
        )
      );
      
      // Update statistics
      if (statistics && includeStatistics) {
        setStatistics(prev => ({
          ...prev,
          approvedReviews: status === 'approved' ? prev.approvedReviews + 1 : 
                        status === 'pending' ? prev.approvedReviews - 1 : prev.approvedReviews,
          pendingReviews: status === 'pending' ? prev.pendingReviews + 1 : 
                         status === 'approved' ? prev.pendingReviews - 1 : prev.pendingReviews,
          rejectedReviews: status === 'rejected' ? prev.rejectedReviews + 1 : 
                         prev.rejectedReviews - 1
        }));
      }
      
      return updatedReview;
    } catch (err) {
      handleError('Failed to update review status', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [statistics, includeStatistics, handleError]);

  // Respond to review
  const respondToReview = useCallback(async (reviewId, response) => {
    try {
      setLoading(true);
      setError(null);
      const data = await ApiService.respondToReview(reviewId, response);
      
      // Update local state
      setReviews(prev => 
        prev.map(review => 
          review.id === reviewId ? { ...review, ...data } : review
        )
      );
      
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
      const deletedReview = await ApiService.deleteReview(reviewId);
      
      // Update local state
      setReviews(prev => prev.filter(review => review.id !== reviewId));
      
      // Update statistics
      if (statistics && includeStatistics) {
        setStatistics(prev => ({
          ...prev,
          totalReviews: prev.totalReviews - 1,
          approvedReviews: deletedReview.status === 'approved' ? prev.approvedReviews - 1 : prev.approvedReviews,
          pendingReviews: deletedReview.status === 'pending' ? prev.pendingReviews - 1 : prev.pendingReviews,
          rejectedReviews: deletedReview.status === 'rejected' ? prev.rejectedReviews - 1 : prev.rejectedReviews
        }));
      }
      
      return deletedReview;
    } catch (err) {
      handleError('Failed to delete review', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [statistics, includeStatistics, handleError]);

  // Mark review as helpful/not helpful
  const markReviewHelpful = useCallback(async (reviewId, helpful) => {
    try {
      setLoading(true);
      setError(null);
      const data = await ApiService.markReviewHelpful(reviewId, helpful);
      
      // Update local state
      setReviews(prev => 
        prev.map(review => 
          review.id === reviewId ? { ...review, ...data } : review
        )
      );
      
      return data;
    } catch (err) {
      handleError('Failed to update review helpful status', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [handleError]);

  // === ADDITIONAL FUNCTIONS (from original useReviews) ===

  // Create new review
  const createReview = useCallback(async (reviewData) => {
    try {
      setLoading(true);
      setError(null);
      const newReview = await ApiService.createReview(reviewData);
      
      // Update local state
      setReviews(prev => [newReview, ...prev]);
      
      // Update statistics
      if (statistics && includeStatistics) {
        setStatistics(prev => ({
          ...prev,
          totalReviews: prev.totalReviews + 1,
          pendingReviews: prev.pendingReviews + 1
        }));
      }
      
      return newReview;
    } catch (err) {
      handleError('Failed to create review', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [statistics, includeStatistics, handleError]);

  // Update review content
  const updateReview = useCallback(async (reviewId, reviewData) => {
    try {
      setLoading(true);
      setError(null);
      const updatedReview = await ApiService.updateReview(reviewId, reviewData);
      
      // Update local state
      setReviews(prev => 
        prev.map(review => 
          review.id === reviewId ? { ...review, ...updatedReview } : review
        )
      );
      
      return updatedReview;
    } catch (err) {
      handleError('Failed to update review', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [handleError]);

  // Get reviews by course
  const getReviewsByCourse = useCallback(async (courseId) => {
    try {
      setLoading(true);
      setError(null);
      return await ApiService.getReviewsByCourse(courseId);
    } catch (err) {
      handleError('Failed to get course reviews', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [handleError]);

  // === DATA MANAGEMENT FUNCTIONS ===

  // Load reviews with filters and additional data
  const loadReviews = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const promises = [ApiService.getAllReviews(filters)];
      
      if (includeCourses) {
        promises.push(ApiService.getReviewCourses());
      }
      
      if (includeStatistics) {
        promises.push(ApiService.getReviewsStatistics());
      }
      
      const results = await Promise.all(promises);
      const [reviewsData, coursesData, statsData] = results;
      
      setReviews(reviewsData || []);
      
      if (includeCourses && coursesData) {
        setCourses(coursesData);
      }
      
      if (includeStatistics && statsData) {
        setStatistics(statsData);
      }
    } catch (err) {
      setError(err.message || 'Failed to load reviews');
      console.error('Error loading reviews:', err);
    } finally {
      setLoading(false);
    }
  }, [filters, includeCourses, includeStatistics]);

  // Update filters
  const updateFilters = useCallback((newFilters) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  }, []);

  // Clear filters
  const clearFilters = useCallback(() => {
    setFilters({
      courseId: '',
      status: '',
      rating: '',
      search: '',
      page: 1,
      pageSize: 10
    });
  }, []);

  // Reset all data
  const reset = useCallback(() => {
    setReviews([]);
    setCourses([]);
    setStatistics(null);
    setError(null);
    clearFilters();
  }, [clearFilters]);

  // Auto-load data on mount
  useEffect(() => {
    if (autoLoad) {
      loadReviews();
    }
  }, [autoLoad, loadReviews]);

  return {
    // Data
    reviews,
    courses,
    statistics,
    loading,
    error,
    filters,
    
    // API Functions (from useReviewManagement)
    getAllReviews,
    getReviewById,
    updateReviewStatus,
    respondToReview,
    deleteReview,
    markReviewHelpful,
    
    // Additional Functions
    createReview,
    updateReview,
    getReviewsByCourse,
    
    // Data Management
    loadReviews,
    updateFilters,
    clearFilters,
    reset,
    clearError
  };
};
