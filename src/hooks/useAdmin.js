import { useCallback } from 'react';
import { adminApiService } from '../services/AdminApi';

export const useAdmin = () => {
  // CRUD operations only
  const getAllCategories = useCallback(async (searchTerm = '', filters = {}) => {
    try {
      console.log('useAdmin getAllCategories called with:', { searchTerm, filters });
      
      // Build query parameters for backend search
      const queryParams = new URLSearchParams();
      
      // Add search term
      if (searchTerm) {
        queryParams.append('search', searchTerm);
      }
      
      // Add advanced filters
      if (filters.name) queryParams.append('name', filters.name);
      if (filters.slug) queryParams.append('slug', filters.slug);
      if (filters.description) queryParams.append('description', filters.description);
      if (filters.parentCategoryId) queryParams.append('parentCategoryId', filters.parentCategoryId);
      
      const response = await adminApiService.getAllCategories(null, null, queryParams.toString());
      console.log('Backend response:', response);
      const data = response.items || response || [];
      console.log('Returning data length:', data.length);
      return data;
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
    createCourse
  };
};
