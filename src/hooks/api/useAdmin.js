import { useState, useCallback, useEffect, useMemo } from 'react';
import ApiService from '../../services/ApiService';
import { ENDPOINTS } from '../../config/api';
import { useAuth } from '../../context/AuthContext';

// Simple cache implementation
const cache = new Map();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

const getCacheKey = (method, ...args) => `${method}:${JSON.stringify(args)}`;

const getFromCache = (key) => {
  const cached = cache.get(key);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.data;
  }
  cache.delete(key);
  return null;
};

const setCache = (key, data) => {
  cache.set(key, { data, timestamp: Date.now() });
};

export const useAdmin = (initialPage = 1, pageSize = 100) => {
  const { user } = useAuth();

  // Global state
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Courses state and pagination
  const [courses, setCourses] = useState([]);
  const [page, setPage] = useState(initialPage);
  const [totalPages, setTotalPages] = useState(1);

  // Cached API wrapper
  const cachedApiCall = useCallback(async (method, apiFunction, ...args) => {
    const cacheKey = getCacheKey(method, ...args);
    
    // Try to get from cache first
    const cached = getFromCache(cacheKey);
    if (cached) {
      return cached;
    }
    
    // If not in cache, make the API call
    const result = await apiFunction(...args);
    setCache(cacheKey, result);
    return result;
  }, []);

  // Batch API calls for better performance
  const batchApiCalls = async (calls) => {
    setLoading(true);
    try {
      const results = await Promise.allSettled(calls);
      return results.map(result => 
        result.status === 'fulfilled' ? result.value : null
      );
    } catch (error) {
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Fetch courses with pagination
  const fetchCourses = useCallback(async (pageNum = page, pageSizeVal = pageSize) => {
    if (!user?.roleId) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await ApiService.getCoursesPaginatedAdmin({ page: pageNum, pageSize: pageSizeVal });
      
      // Handle different response structures
      if (response && response.data) {
        setCourses(response.data.items || response.data || []);
        const pages = response.data.totalPages || response.data.totalCount || 1;
        setTotalPages(pages);
      } else if (response && response.items) {
        setCourses(response.items);
        const pages = response.totalPages || response.totalCount || response.pagination?.totalPages || 1;
        setTotalPages(pages);
      } else if (Array.isArray(response)) {
        setCourses(response);
        const pages = Math.ceil(response.length / pageSizeVal);
        setTotalPages(pages);
      } else {
        let courses = [];
        let pages = 1;
        
        if (response) {
          courses = response.items || response.data || response.courses || response.result || [];
          pages = response.totalPages || response.totalCount || response.pageCount || 
                 response.pagination?.totalPages || Math.ceil(courses.length / pageSizeVal) || 1;
        }
        
        setCourses(courses);
        setTotalPages(pages);
      }
    } catch (err) {
      setError('Failed to load courses');
    } finally {
      setLoading(false);
    }
  }, [user, page, pageSize]);

  // Get course by ID
  const getCourseById = useCallback(async (courseId) => {
    try {
      setLoading(true);
      setError(null);
      const data = await ApiService.getCourseByIdAdmin(courseId);
      return data;
    } catch (err) {
      setError('Failed to fetch course');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Create course
  const createCourse = useCallback(async (courseData) => {
    try {
      setLoading(true);
      setError(null);
      const data = await ApiService.createCourse(courseData);
      await fetchCourses(); // Refresh the list
      return data;
    } catch (err) {
      setError('Failed to create course');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [fetchCourses]);

  // Update course
  const updateCourse = useCallback(async (courseId, courseData) => {
    try {
      setLoading(true);
      setError(null);
      const data = await ApiService.updateCourse(courseId, courseData);
      await fetchCourses(); // Refresh the list
      return data;
    } catch (err) {
      setError('Failed to update course');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [fetchCourses]);

  // Delete course
  const deleteCourse = useCallback(async (courseId) => {
    try {
      setLoading(true);
      setError(null);
      const data = await ApiService.deleteCourse(courseId);
      await fetchCourses(); // Refresh the list
      return data;
    } catch (err) {
      setError('Failed to delete course');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [fetchCourses]);

  const getAllCoursesAdmin = useCallback(async (filters = {}) => {

    try {
      setLoading(true);
      setError(null);
      const queryParams = new URLSearchParams();
      
      // Add pagination parameters
      if (filters.page !== undefined) queryParams.append('page', filters.page);
      if (filters.pageSize !== undefined) queryParams.append('pageSize', filters.pageSize);     
      // Add course filter parameters
      if (filters.title) queryParams.append('Title', filters.title);    
      if (filters.courseTypeId !== undefined) queryParams.append('CourseTypeId', filters.courseTypeId);
      if (filters.categoryId !== undefined) queryParams.append('CategoryId', filters.categoryId);
      if (filters.isPaid !== undefined) queryParams.append('IsPaid', filters.isPaid);
      const response = await ApiService.getAllCoursesAdmin(filters);
      const data = response || response || [];
    
      return data;
    } catch (err) {
      setError('Failed to fetch courses');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [setLoading, setError]);

  // Course tags and badges
  const getAllCourseTags = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await ApiService.getAllCourseTags();
      return data;
    } catch (err) {
      setError('Failed to fetch course tags');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const getAllCourseBadges = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await ApiService.getAllCourseBadges();
      return data;
    } catch (err) {
      setError('Failed to fetch course badges');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateCourseTags = useCallback(async (courseId, tagIds) => {
    try {
      setLoading(true);
      setError(null);
      const data = await ApiService.updateCourseTags(courseId, tagIds);
      await fetchCourses(); // Refresh the list
      return data;
    } catch (err) {
      setError('Failed to update course tags');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [fetchCourses]);

  const updateCourseBadge = useCallback(async (courseId, badgeId) => {
    try {
      setLoading(true);
      setError(null);
      const data = await ApiService.updateCourseBadgeAssignment(courseId, badgeId);
      await fetchCourses(); // Refresh the list
      return data;
    } catch (err) {
      setError('Failed to update course badge');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [fetchCourses]);

  const updateCourseFeatured = useCallback(async (courseId, featured) => {
    try {
      setLoading(true);
      setError(null);
      const data = await ApiService.updateCourseFeatured(courseId, featured);
      await fetchCourses(); // Refresh the list
      return data;
    } catch (err) {
      setError('Failed to update course featured status');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [fetchCourses]);

  const updateCourseStatus = useCallback(async (courseId, status) => {
    try {
      setLoading(true);
      setError(null);
      const data = await ApiService.updateCourseStatus(courseId, status);
      await fetchCourses(); // Refresh the list
      return data;
    } catch (err) {
      setError('Failed to update course status');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [fetchCourses]);

  // ==================== CATEGORY OPERATIONS ====================

  const getAllCategories = useCallback(async (filters = {}) => {
    try {
      setLoading(true);
      setError(null);
      
      // Build query parameters for the main endpoint
      const queryParams = new URLSearchParams();
      
      // Add pagination parameters
      if (filters.page !== undefined) queryParams.append('page', filters.page);
      if (filters.pageSize !== undefined) queryParams.append('pageSize', filters.pageSize);
      
      // Add search parameters as query parameters
      if (filters.name) queryParams.append('name', filters.name);
      if (filters.slug) queryParams.append('slug', filters.slug);
      if (filters.description) queryParams.append('description', filters.description);
      if (filters.parentCategoryId) queryParams.append('parentCategoryId', filters.parentCategoryId);
      
      const queryString = queryParams.toString();
      const response = await ApiService.getAllCategories(null, null, queryString);
      const data = response.items || response || [];
      
      // Handle new nested structure - flatten categories for backward compatibility
      const flattenCategories = (categories, parentPath = '') => {
        const flat = [];
        categories.forEach(category => {
          const flatCategory = {
            ...category,
            parentCategoryName: category.parentCategoryName || null,
            // Add path for hierarchical display
            path: parentPath ? `${parentPath} > ${category.name}` : category.name
          };
          flat.push(flatCategory);
          
          // Recursively flatten children
          if (category.children && Array.isArray(category.children) && category.children.length > 0) {
            flat.push(...flattenCategories(category.children, flatCategory.path));
          }
        });
        return flat;
      };
      
      const flattenedData = flattenCategories(data);
    
      return {
        items: flattenedData,
        nestedItems: data, // Keep nested structure for components that need it
        totalCount: response.totalCount || flattenedData.length,
        page: response.page || filters.page || 1,
        pageSize: response.pageSize || filters.pageSize || 100,
        totalPages: Math.ceil((response.totalCount || flattenedData.length) / (response.pageSize || filters.pageSize || 100))
      };
    } catch (err) {
      setError('Failed to fetch categories');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const getCategoryById = useCallback(async (id) => {
    try {
      setLoading(true);
      setError(null);
      const data = await ApiService.getCategoryById(id);
      return data;
    } catch (err) {
      setError('Failed to fetch category');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const createCategory = useCallback(async (categoryData) => {
    try {
      setLoading(true);
      setError(null);
      
      // Add CreatedBy from user
      const dataWithUser = {
        ...categoryData,
        CreatedBy: user?.id || user?.userId || user?.roleId
      };
      
      const data = await ApiService.createCategory(dataWithUser);
      return data;
    } catch (err) {
      setError('Failed to create category');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [user]);

  const updateCategory = useCallback(async (id, categoryData) => {
    try {
      setLoading(true);
      setError(null);
      // Add UpdatedBy from user
      const dataWithUser = {
        ...categoryData,
        UpdatedBy: user?.id || user?.userId || user?.roleId
      };
      const data = await ApiService.updateCategory(id, dataWithUser);
      return data;
    } catch (err) {
      setError('Failed to update category');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [user]);

  const deleteCategory = useCallback(async (id) => {
    try {
      setLoading(true);
      setError(null);
      const data = await ApiService.deleteCategory(id);
      return data;
    } catch (err) {
      setError('Failed to delete category');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const createCategoryWithFile = useCallback(async (formData) => {
    try {
      setLoading(true);
      setError(null);
      // Add CreatedBy from user to FormData
      if (formData instanceof FormData) {
        formData.append('CreatedBy', user?.id || user?.userId || user?.roleId);
      }
      const data = await ApiService.createCategoryWithFile(formData);
      return data;
    } catch (err) {
      setError('Failed to create category');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [user]);

  const updateCategoryWithFile = useCallback(async (id, formData) => {
    try {
      setLoading(true);
      setError(null);
      // Add UpdatedBy from user to FormData
      if (formData instanceof FormData) {
        formData.append('UpdatedBy', user?.id || user?.userId || user?.roleId);
      }
      const data = await ApiService.updateCategoryWithFile(id, formData);
      return data;
    } catch (err) {
      setError('Failed to update category');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [user]);

  // ==================== CAREER PATH OPERATIONS ====================

  const getAllCareerPaths = useCallback(async (params = {}) => {
    try {
      setLoading(true);
      setError(null);
      const data = await ApiService.getAllCareerPaths(params);
      return data;
    } catch (err) {
      setError('Failed to fetch career paths');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const getCareerPathById = useCallback(async (id) => {
    try {
      setLoading(true);
      setError(null);
      const data = await ApiService.getCareerPathById(id);
      return data;
    } catch (err) {
      setError('Failed to fetch career path');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const createCareerPathWithFile = useCallback(async (formData) => {
    try {
      setLoading(true);
      setError(null);
      const data = await ApiService.createCareerPathWithFile(formData);
      return data;
    } catch (err) {
      setError('Failed to create career path');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateCareerPathWithFile = useCallback(async (id, formData) => {
    try {
      setLoading(true);
      setError(null);
      const data = await ApiService.updateCareerPathWithFile(id, formData);
      return data;
    } catch (err) {
      setError('Failed to update career path');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteCareerPath = useCallback(async (id) => {
    try {
      setLoading(true);
      setError(null);
      const data = await ApiService.deleteCareerPath(id);
      return data;
    } catch (err) {
      setError('Failed to delete career path');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // ==================== COURSE FILE UPLOAD OPERATIONS ====================

  const createCourseWithFile = useCallback(async (formData) => {
    try {
      setLoading(true);
      setError(null);
      const data = await ApiService.createCourseWithFile(formData);
      return data;
    } catch (err) {
      setError(err.response?.data || err.message || 'Failed to create course');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const uploadCourseCsv = useCallback(async (formData) => {
    try {
      setLoading(true);
      setError(null);
      const data = await ApiService.uploadCsvFile(formData);
      return data;
    } catch (err) {
      setError(err.response?.data || err.message || 'Failed to upload CSV file');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateCourseWithFile = useCallback(async (id, formData) => {
    try {
      setLoading(true);
      setError(null);
      const data = await ApiService.updateCourseWithFile(id, formData);
      return data;
    } catch (err) {
      setError(err.response?.data || err.message || 'Failed to update course');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const generateCourseContent = useCallback(async (courseId, prompt) => {
    try {
      setLoading(true);
      setError(null);
      const data = await ApiService.generateCourseContent(courseId, prompt);
      return data;
    } catch (err) {
      setError(err.response?.data || err.message || 'Failed to generate course content');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // ==================== AUTHENTICATION OPERATIONS ====================

  const login = useCallback(async (username, password) => {
    try {
      setLoading(true);
      setError(null);
      const data = await ApiService.login(username, password);
      return data;
    } catch (err) {
      setError('Failed to login');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const changePassword = useCallback(async (currentPassword, newPassword, confirmPassword) => {
    try {
      setLoading(true);
      setError(null);
      const data = await ApiService.changePassword(currentPassword, newPassword, confirmPassword);
      return data;
    } catch (err) {
      setError('Failed to change password');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // ==================== ROUTE OPERATIONS ====================

  const getRoutesByRole = useCallback(async (roleId) => {
    try {
      setLoading(true);
      setError(null);
      const data = await ApiService.getRoutesByRole(roleId);
      return data;
    } catch (err) {
      setError('Failed to fetch routes');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // ==================== DROPDOWN DATA ====================

  const getCourseTypes = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await ApiService.getCourseTypes();
      return data;
    } catch (err) {
      setError('Failed to fetch course types');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const getCourseLevels = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await ApiService.getCourseLevels();
      return data;
    } catch (err) {
      setError('Failed to fetch course levels');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const getCourseTopics = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await ApiService.getAllTopics();
      return data;
    } catch (err) {
      setError('Failed to fetch course topics');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const getCourseBadges = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await ApiService.getCourseBadges();
      return data;
    } catch (err) {
      setError('Failed to fetch course badges');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const getAllCourseBadgesNew = useCallback(async (filters = {}) => {
    try {
      setLoading(true);
      setError(null);
      
      // Build query parameters for pagination
      const queryParams = new URLSearchParams();
      
      // Add pagination parameters
      if (filters.page !== undefined) queryParams.append('page', filters.page);
      if (filters.pageSize !== undefined) queryParams.append('pageSize', filters.pageSize);
      
      const queryString = queryParams.toString();
      const response = await ApiService.getAllCourseBadgesNew(queryString);
      const data = response.items || response || [];
    
      return {
        items: data,
        totalCount: response.totalCount || data.length,
        page: response.page || filters.page || 1,
        pageSize: response.pageSize || filters.pageSize || 100,
        totalPages: Math.ceil((response.totalCount || data.length) / (response.pageSize || filters.pageSize || 100))
      };
    } catch (err) {
      setError('Failed to fetch course badges');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // ==================== PAGINATION HELPERS ====================

  const nextPage = () => {
    if (page < totalPages) setPage(prev => prev + 1);
  };

  const prevPage = () => {
    if (page > 1) setPage(prev => prev - 1);
  };

  const goToPage = (pageNumber) => {
    if (pageNumber >= 1 && pageNumber <= totalPages) {
      setPage(pageNumber);
    }
  };

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const getAllSkills = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await ApiService.getAllSkills();
      return data;
    } catch (err) {
      setError('Failed to fetch skills');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Initialize courses on mount
  useEffect(() => {
    fetchCourses();
  }, [fetchCourses]);

  return {
    // Global state
    loading,
    error,
    clearError,

    // Courses state and pagination
    courses,
    page,
    totalPages,
    nextPage,
    prevPage,
    goToPage,

    // Course operations
    getCourseById,
    createCourse,
    updateCourse,
    deleteCourse,
    getAllCoursesAdmin,
    fetchCourses,

    // Course tags and badges
    getAllCourseTags,
    getAllCourseBadges,
    updateCourseTags,
    updateCourseBadge,
    updateCourseFeatured,
    updateCourseStatus,

    // Category operations
    getAllCategories,
    getCategoryById,
    createCategory,
    updateCategory,
    deleteCategory,
    createCategoryWithFile,
    updateCategoryWithFile,

    // Career path operations
    getAllCareerPaths,
    getCareerPathById,
    createCareerPathWithFile,
    updateCareerPathWithFile,
    deleteCareerPath,

    // Course file upload operations
    createCourseWithFile,
    uploadCourseCsv,
    updateCourseWithFile,
    generateCourseContent,

    // Authentication operations
    login,
    changePassword,

    // Route operations
    getRoutesByRole,

    // Dropdown data
    getCourseTypes,
    getCourseLevels,
    getCourseTopics,
    getCourseBadges,
    getAllCourseBadgesNew,
    getAllSkills,
  };
};
