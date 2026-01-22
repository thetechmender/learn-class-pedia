import { useState, useEffect, useCallback } from 'react';
import { apiService } from '../services/api';

export const useCourseManagement = () => {
  const [courses, setCourses] = useState([]);
  const [tags, setTags] = useState([]);
  const [badges, setBadges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    instructor: '',
    category: '',
    level: 'beginner',
    description: '',
    price: '',
    duration: '',
    tags: [],
    badge: null
  });

  // Load initial data
  const loadData = useCallback(async (filters = {}) => {
    try {
      setLoading(true);
      setError(null);
      
      const [coursesData, tagsData, badgesData] = await Promise.all([
        apiService.getAllCoursesAdmin(filters),
        apiService.getAllCourseTags(),
        apiService.getAllCourseBadges()
      ]);
      
      setCourses(coursesData);
      setTags(tagsData);
      setBadges(badgesData);
    } catch (err) {
      setError(err.message || 'Failed to load course data');
      console.error('Error loading course data:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial load
  useEffect(() => {
    loadData();
  }, [loadData]);

  // Create course
  const createCourse = useCallback(async (courseData) => {
    try {
      const newCourse = await apiService.createCourse(courseData);
      setCourses(prev => [newCourse, ...prev]);
      setShowCreateModal(false);
      return newCourse;
    } catch (err) {
      setError(err.message || 'Failed to create course');
      throw err;
    }
  }, []);

  // Update course
  const updateCourse = useCallback(async (courseId, courseData) => {
    try {
      const updatedCourse = await apiService.updateCourse(courseId, courseData);
      setCourses(prev => 
        prev.map(course => 
          course.id === courseId ? updatedCourse : course
        )
      );
      setShowEditModal(false);
      setSelectedCourse(null);
      return updatedCourse;
    } catch (err) {
      setError(err.message || 'Failed to update course');
      throw err;
    }
  }, []);

  // Update course tags
  const updateCourseTags = useCallback(async (courseId, tagIds) => {
    try {
      const updatedCourse = await apiService.updateCourseTags(courseId, tagIds);
      setCourses(prev => 
        prev.map(course => 
          course.id === courseId ? updatedCourse : course
        )
      );
      return updatedCourse;
    } catch (err) {
      setError(err.message || 'Failed to update course tags');
      throw err;
    }
  }, []);

  // Update course badge
  const updateCourseBadge = useCallback(async (courseId, badgeId) => {
    try {
      const updatedCourse = await apiService.updateCourseBadge(courseId, badgeId);
      setCourses(prev => 
        prev.map(course => 
          course.id === courseId ? updatedCourse : course
        )
      );
      return updatedCourse;
    } catch (err) {
      setError(err.message || 'Failed to update course badge');
      throw err;
    }
  }, []);

  // Update course featured status
  const updateCourseFeatured = useCallback(async (courseId, featured) => {
    try {
      const updatedCourse = await apiService.updateCourseFeatured(courseId, featured);
      setCourses(prev => 
        prev.map(course => 
          course.id === courseId ? updatedCourse : course
        )
      );
      return updatedCourse;
    } catch (err) {
      setError(err.message || 'Failed to update course featured status');
      throw err;
    }
  }, []);

  // Update course status
  const updateCourseStatus = useCallback(async (courseId, status) => {
    try {
      const updatedCourse = await apiService.updateCourseStatus(courseId, status);
      setCourses(prev => 
        prev.map(course => 
          course.id === courseId ? updatedCourse : course
        )
      );
      return updatedCourse;
    } catch (err) {
      setError(err.message || 'Failed to update course status');
      throw err;
    }
  }, []);

  // Delete course
  const deleteCourse = useCallback(async (courseId) => {
    try {
      const deletedCourse = await apiService.deleteCourse(courseId);
      setCourses(prev => prev.filter(course => course.id !== courseId));
      return deletedCourse;
    } catch (err) {
      setError(err.message || 'Failed to delete course');
      throw err;
    }
  }, []);

  // Get course by ID
  const getCourseById = useCallback(async (courseId) => {
    try {
      return await apiService.getCourseByIdAdmin(courseId);
    } catch (err) {
      setError(err.message || 'Failed to get course');
      throw err;
    }
  }, []);

  // Get filtered courses
  const getFilteredCourses = useCallback(async (filters = {}) => {
    try {
      setLoading(true);
      setError(null);
      const coursesData = await apiService.getAllCoursesAdmin(filters);
      setCourses(coursesData);
      return coursesData;
    } catch (err) {
      setError(err.message || 'Failed to load filtered courses');
      console.error('Error loading filtered courses:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Open edit modal
  const openEditModal = useCallback((course) => {
    setSelectedCourse(course);
    setShowEditModal(true);
  }, []);

  // Close modals
  const closeModals = useCallback(() => {
    setShowCreateModal(false);
    setShowEditModal(false);
    setSelectedCourse(null);
  }, []);

  // Clear error
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    // Data
    courses,
    tags,
    badges,
    loading,
    error,
    selectedCourse,
    showCreateModal,
    showEditModal,
    
    // Setters
    setShowCreateModal,
    setShowEditModal,
    
    // Actions
    loadData,
    createCourse,
    updateCourse,
    updateCourseTags,
    updateCourseBadge,
    updateCourseFeatured,
    updateCourseStatus,
    deleteCourse,
    getCourseById,
    getFilteredCourses,
    openEditModal,
    closeModals,
    clearError
  };
};
