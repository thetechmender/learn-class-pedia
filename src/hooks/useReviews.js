import { useState, useEffect, useCallback } from 'react';
import { adminApiService } from '../services/AdminApi';

export const useReviews = () => {
  const [reviews, setReviews] = useState([]);
  const [courses, setCourses] = useState([]);
  const [statistics, setStatistics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    courseId: '',
    status: '',
    rating: '',
    search: ''
  });

  // Load reviews with filters
  const loadReviews = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const [reviewsData, coursesData, statsData] = await Promise.all([
        adminApiService.getAllReviews(filters),
        adminApiService.getReviewCourses(),
        adminApiService.getReviewsStatistics()
      ]);
      
      setReviews(reviewsData);
      setCourses(coursesData);
      setStatistics(statsData);
    } catch (err) {
      setError(err.message || 'Failed to load reviews');
      console.error('Error loading reviews:', err);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  // Initial load
  useEffect(() => {
    loadReviews();
  }, [loadReviews]);

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
      search: ''
    });
  }, []);

  // Update review status
  const updateReviewStatus = useCallback(async (reviewId, status) => {
    try {
      const updatedReview = await adminApiService.updateReviewStatus(reviewId, status);
      setReviews(prev => 
        prev.map(review => 
          review.id === reviewId ? updatedReview : review
        )
      );
      
      // Update statistics
      if (statistics) {
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
      setError(err.message || 'Failed to update review status');
      throw err;
    }
  }, [statistics]);

  // Update review content
  const updateReview = useCallback(async (reviewId, reviewData) => {
    try {
      const updatedReview = await adminApiService.updateReview(reviewId, reviewData);
      setReviews(prev => 
        prev.map(review => 
          review.id === reviewId ? updatedReview : review
        )
      );
      return updatedReview;
    } catch (err) {
      setError(err.message || 'Failed to update review');
      throw err;
    }
  }, []);

  // Delete review
  const deleteReview = useCallback(async (reviewId) => {
    try {
      const deletedReview = await adminApiService.deleteReview(reviewId);
      setReviews(prev => prev.filter(review => review.id !== reviewId));
      
      // Update statistics
      if (statistics) {
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
      setError(err.message || 'Failed to delete review');
      throw err;
    }
  }, [statistics]);

  // Create new review
  const createReview = useCallback(async (reviewData) => {
    try {
      const newReview = await adminApiService.createReview(reviewData);
      setReviews(prev => [newReview, ...prev]);
      
      // Update statistics
      if (statistics) {
        setStatistics(prev => ({
          ...prev,
          totalReviews: prev.totalReviews + 1,
          pendingReviews: prev.pendingReviews + 1
        }));
      }
      
      return newReview;
    } catch (err) {
      setError(err.message || 'Failed to create review');
      throw err;
    }
  }, [statistics]);

  // Get review by ID
  const getReviewById = useCallback(async (reviewId) => {
    try {
      return await adminApiService.getReviewById(reviewId);
    } catch (err) {
      setError(err.message || 'Failed to get review');
      throw err;
    }
  }, []);

  // Get reviews by course
  const getReviewsByCourse = useCallback(async (courseId) => {
    try {
      return await adminApiService.getReviewsByCourse(courseId);
    } catch (err) {
      setError(err.message || 'Failed to get course reviews');
      throw err;
    }
  }, []);

  // Clear error
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    // Data
    reviews,
    courses,
    statistics,
    loading,
    error,
    filters,
    
    // Actions
    loadReviews,
    updateFilters,
    clearFilters,
    updateReviewStatus,
    updateReview,
    deleteReview,
    createReview,
    getReviewById,
    getReviewsByCourse,
    clearError
  };
};
