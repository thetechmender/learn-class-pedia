import { useState, useEffect, useCallback } from 'react';
import { adminApiService } from '../services/AdminApi';
import { useAuth } from '../context/AuthContext';

export const useAdminApi = (initialPage = 1, pageSize = 10) => {
  const { user } = useAuth();

  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [page, setPage] = useState(initialPage);
  const [totalPages, setTotalPages] = useState(1);

  const fetchCourses = useCallback(async (pageNum = page, pageSizeVal = pageSize) => {
    if (!user?.roleId) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await adminApiService.getCoursesPaginatedAdmin({ page: pageNum, pageSize: pageSizeVal });
      console.log('API Response:', response);
      console.log('Response type:', typeof response);
      console.log('Response keys:', response ? Object.keys(response) : 'null');
      
      // Handle different response structures
      if (response && response.data) {
        // If response has data property
        console.log('Using response.data structure');
        setCourses(response.data.items || response.data || []);
        const pages = response.data.totalPages || response.data.totalPages || response.data.totalCount || 1;
        console.log('Total pages from data:', pages);
        setTotalPages(pages);
      } else if (response && response.items) {
        // If response has items property directly
        console.log('Using response.items structure');
        setCourses(response.items);
        const pages = response.totalPages || response.totalCount || response.pagination?.totalPages || 1;
        console.log('Total pages from items:', pages);
        setTotalPages(pages);
      } else if (Array.isArray(response)) {
        // If response is directly an array (fallback)
        console.log('Response is array, calculating pages from array length');
        setCourses(response);
        const pages = Math.ceil(response.length / pageSizeVal);
        console.log('Calculated total pages:', pages);
        setTotalPages(pages);
      } else {
        // Default fallback - try to extract from any possible structure
        console.log('Using fallback structure');
        let courses = [];
        let pages = 1;
        
        if (response) {
          // Try common pagination structures
          courses = response.items || response.data || response.courses || response.result || [];
          pages = response.totalPages || response.totalCount || response.pageCount || 
                 response.pagination?.totalPages || Math.ceil(courses.length / pageSizeVal) || 1;
        }
        
        console.log('Fallback - courses:', courses.length, 'pages:', pages);
        setCourses(courses);
        setTotalPages(pages);
      }
    } catch (err) {
      setError('Failed to load courses');
      console.error('Error loading courses:', err);
    } finally {
      setLoading(false);
    }
  }, [user, page, pageSize]);

  useEffect(() => {
    fetchCourses();
  }, [fetchCourses]);

  // Individual course operations
  const getCourseById = useCallback(async (courseId) => {
    try {
      setLoading(true);
      setError(null);
      const data = await adminApiService.getCourseByIdAdmin(courseId);
      return data;
    } catch (err) {
      setError('Failed to fetch course');
      console.error('Error fetching course:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const createCourse = useCallback(async (courseData) => {
    try {
      setLoading(true);
      setError(null);
      const data = await adminApiService.createCourse(courseData);
      await fetchCourses(); // Refresh the list
      return data;
    } catch (err) {
      setError('Failed to create course');
      console.error('Error creating course:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [fetchCourses]);

  const updateCourse = useCallback(async (courseId, courseData) => {
    try {
      setLoading(true);
      setError(null);
      const data = await adminApiService.updateCourse(courseId, courseData);
      await fetchCourses(); // Refresh the list
      return data;
    } catch (err) {
      setError('Failed to update course');
      console.error('Error updating course:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [fetchCourses]);

  const deleteCourse = useCallback(async (courseId) => {
    try {
      setLoading(true);
      setError(null);
      const data = await adminApiService.deleteCourse(courseId);
      await fetchCourses(); // Refresh the list
      return data;
    } catch (err) {
      setError('Failed to delete course');
      console.error('Error deleting course:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [fetchCourses]);

  // Course tags and badges
  const getAllCourseTags = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await adminApiService.getAllCourseTags();
      return data;
    } catch (err) {
      setError('Failed to fetch course tags');
      console.error('Error fetching course tags:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const getAllCourseBadges = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await adminApiService.getAllCourseBadges();
      return data;
    } catch (err) {
      setError('Failed to fetch course badges');
      console.error('Error fetching course badges:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateCourseTags = useCallback(async (courseId, tagIds) => {
    try {
      setLoading(true);
      setError(null);
      const data = await adminApiService.updateCourseTags(courseId, tagIds);
      await fetchCourses(); // Refresh the list
      return data;
    } catch (err) {
      setError('Failed to update course tags');
      console.error('Error updating course tags:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [fetchCourses]);

  const updateCourseBadge = useCallback(async (courseId, badgeId) => {
    try {
      setLoading(true);
      setError(null);
      const data = await adminApiService.updateCourseBadgeAssignment(courseId, badgeId);
      await fetchCourses(); // Refresh the list
      return data;
    } catch (err) {
      setError('Failed to update course badge');
      console.error('Error updating course badge:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [fetchCourses]);

  const updateCourseFeatured = useCallback(async (courseId, featured) => {
    try {
      setLoading(true);
      setError(null);
      const data = await adminApiService.updateCourseFeatured(courseId, featured);
      await fetchCourses(); // Refresh the list
      return data;
    } catch (err) {
      setError('Failed to update course featured status');
      console.error('Error updating course featured status:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [fetchCourses]);

  const updateCourseStatus = useCallback(async (courseId, status) => {
    try {
      setLoading(true);
      setError(null);
      const data = await adminApiService.updateCourseStatus(courseId, status);
      await fetchCourses(); // Refresh the list
      return data;
    } catch (err) {
      setError('Failed to update course status');
      console.error('Error updating course status:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [fetchCourses]);

  // Function to go to next page
  const nextPage = () => {
    if (page < totalPages) setPage(prev => prev + 1);
  };

  // Function to go to previous page
  const prevPage = () => {
    if (page > 1) setPage(prev => prev - 1);
  };

  // Function to go to a specific page
  const goToPage = (pageNumber) => {
    if (pageNumber >= 1 && pageNumber <= totalPages) {
      setPage(pageNumber);
    }
  };

  // Clear error
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    loading,
    error,
    courses,
    page,
    totalPages,
    nextPage,
    prevPage,
    goToPage,
    clearError,
    // Course operations
    getCourseById,
    createCourse,
    updateCourse,
    deleteCourse,
    // Tags and badges
    getAllCourseTags,
    getAllCourseBadges,
    updateCourseTags,
    updateCourseBadge,
    updateCourseFeatured,
    updateCourseStatus,
  };
};
