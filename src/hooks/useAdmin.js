import { useCallback } from 'react';
import { adminApiService } from '../services/AdminApi';
import { ENDPOINTS } from '../config/api';

export const useAdmin = () => {
  // CRUD operations only
  const getAllCategories = useCallback(async (filters = {}) => {
    try {
      console.log('useAdmin getAllCategories called with:', filters);
      
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
      console.log('Final query string:', queryString);
      
      const response = await adminApiService.getAllCategories(null, null, queryString);
      console.log('Backend response:', response);
      const data = response.items || response || [];
      console.log('Returning data length:', data.length);
      
      // Return paginated response structure
      return {
        items: data,
        totalCount: response.totalCount || data.length,
        page: response.page || filters.page || 1,
        pageSize: response.pageSize || filters.pageSize || 10,
        totalPages: Math.ceil((response.totalCount || data.length) / (response.pageSize || filters.pageSize || 10))
      };
    } catch (err) {
      console.error('Error fetching categories:', err);
      throw err;
    }
  }, []);

  const getCategoryById = useCallback(async (id) => {
    try {
      return await adminApiService.getCategoryById(id);
    } catch (err) {
      console.error('Error fetching category by ID:', err);
      throw err;
    }
  }, []);

  const createCategory = useCallback(async (categoryData) => {
    try {
      return await adminApiService.createCategory(categoryData);
    } catch (err) {
      console.error('Error creating category:', err);
      throw err;
    }
  }, []);

  const updateCategory = useCallback(async (id, categoryData) => {
    try {
      return await adminApiService.updateCategory(id, categoryData);
    } catch (err) {
      console.error('Error updating category:', err);
      throw err;
    }
  }, []);

  const deleteCategory = useCallback(async (id) => {
    try {
      return await adminApiService.deleteCategory(id);
    } catch (err) {
      console.error('Error deleting category:', err);
      throw err;
    }
  }, []);

  // Course dropdown data methods
  const getCourseTypes = useCallback(async () => {
    try {
      return await adminApiService.getCourseTypes();
    } catch (err) {
      console.error('Error fetching course types:', err);
      throw err;
    }
  }, []);

  const getCourseLevels = useCallback(async () => {
    try {
      return await adminApiService.getCourseLevels();
    } catch (err) {
      console.error('Error fetching course levels:', err);
      throw err;
    }
  }, []);

  const getCourseBadges = useCallback(async () => {
    try {
      return await adminApiService.getCourseBadges();
    } catch (err) {
      console.error('Error fetching course badges:', err);
      throw err;
    }
  }, []);

  const createCourse = useCallback(async (courseData) => {
    try {
      return await adminApiService.createCourse(courseData);
    } catch (err) {
      console.error('Error creating course:', err);
      throw err;
    }
  }, []);

  const deleteCourse = useCallback(async (courseId) => {
    try {
      return await adminApiService.deleteCourse(courseId);
    } catch (err) {
      console.error('Error deleting course:', err);
      throw err;
    }
  }, []);

  const getAllCoursesAdmin = useCallback(async (filters = {}) => {
    debugger;
    try {
      console.log('useAdmin getAllCoursesAdmin called with:', filters);
      
      // Build query parameters for backend search
      const queryParams = new URLSearchParams();
      
      // Add pagination parameters
      if (filters.page !== undefined) queryParams.append('page', filters.page);
      if (filters.pageSize !== undefined) queryParams.append('pageSize', filters.pageSize);
      
      // Add course filter parameters
      if (filters.title) queryParams.append('Title', filters.title);
      if (filters.subtitle) queryParams.append('Subtitle', filters.subtitle);
      if (filters.description) queryParams.append('Description', filters.description);
      if (filters.overview) queryParams.append('Overview', filters.overview);
      if (filters.courseTypeId !== undefined) queryParams.append('CourseTypeId', filters.courseTypeId);
      if (filters.categoryId !== undefined) queryParams.append('CategoryId', filters.categoryId);
      if (filters.courseLevelId !== undefined) queryParams.append('CourseLevelId', filters.courseLevelId);
      if (filters.slug) queryParams.append('Slug', filters.slug);
      if (filters.thumbnailUrl) queryParams.append('ThumbnailUrl', filters.thumbnailUrl);
      if (filters.promoVideoUrl) queryParams.append('PromoVideoUrl', filters.promoVideoUrl);
      if (filters.price !== undefined) queryParams.append('Price', filters.price);
      if (filters.discountedPrice !== undefined) queryParams.append('DiscountedPrice', filters.discountedPrice);
      if (filters.currencyCode) queryParams.append('CurrencyCode', filters.currencyCode);
      if (filters.isPaid !== undefined) queryParams.append('IsPaid', filters.isPaid);
      
      const queryString = queryParams.toString();
      console.log('Final query string for courses:', queryString);
      
      const response = await adminApiService.getAllCoursesAdmin(filters);
      console.log('Backend response for courses:', response);
      const data = response || response || [];
      console.log('Returning courses data length:', data.length);
      return data;
    } catch (err) {
      console.error('Error fetching courses:', err);
      throw err;
    }
  }, []);

  return {
    // CRUD operations only
    getAllCategories,
    getCategoryById,
    createCategory,
    updateCategory,
    deleteCategory,
    // Course dropdown data
    getCourseTypes,
    getCourseLevels,
    getCourseBadges,
    // Course operations
    createCourse,
    deleteCourse,
    getAllCoursesAdmin
  };
};
