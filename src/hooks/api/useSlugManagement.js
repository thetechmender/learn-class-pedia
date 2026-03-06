import { useState, useCallback } from 'react';
import ApiService from '../../services/ApiService';
import { useToast } from '../../components/ToastProvider';

export const useSlugManagement = () => {
  const { showSuccess, showError } = useToast();
  const [loading, setLoading] = useState(false);

  // Course slug management
  const updateCourseSlug = useCallback(async (courseId, slug) => {
    try {
      setLoading(true);
      await ApiService.updateCourseSlug(courseId, slug);
      showSuccess('Course slug updated successfully');
      return true;
    } catch (error) {
      showError('Failed to update course slug');
      throw error;
    } finally {
      setLoading(false);
    }
  }, [showSuccess, showError]);

  const updateAllCourseSlugs = useCallback(async () => {
    try {
      setLoading(true);
      await ApiService.updateAllCourseSlugs();
      showSuccess('All course slugs updated successfully');
      return true;
    } catch (error) {
      showError('Failed to update all course slugs');
      throw error;
    } finally {
      setLoading(false);
    }
  }, [showSuccess, showError]);

  // Category slug management
  const updateCategorySlug = useCallback(async (categoryId, slug) => {
    try {
      setLoading(true);
      await ApiService.updateCategorySlug(categoryId, slug);
      showSuccess('Category slug updated successfully');
      return true;
    } catch (error) {
      showError('Failed to update category slug');
      throw error;
    } finally {
      setLoading(false);
    }
  }, [showSuccess, showError]);

  const updateAllCategorySlugs = useCallback(async () => {
    try {
      setLoading(true);
      await ApiService.updateAllCategorySlugs();
      showSuccess('All category slugs updated successfully');
      return true;
    } catch (error) {
      showError('Failed to update all category slugs');
      throw error;
    } finally {
      setLoading(false);
    }
  }, [showSuccess, showError]);

  // Career path slug management
  const updateCareerPathSlug = useCallback(async (careerPathId, slug) => {
    try {
      setLoading(true);
      await ApiService.updateCareerPathSlug(careerPathId, slug);
      showSuccess('Career path slug updated successfully');
      return true;
    } catch (error) {
      showError('Failed to update career path slug');
      throw error;
    } finally {
      setLoading(false);
    }
  }, [showSuccess, showError]);

  const updateAllCareerPathSlugs = useCallback(async () => {
    try {
      setLoading(true);
      await ApiService.updateAllCareerPathSlugs();
      showSuccess('All career path slugs updated successfully');
      return true;
    } catch (error) {
      showError('Failed to update all career path slugs');
      throw error;
    } finally {
      setLoading(false);
    }
  }, [showSuccess, showError]);

  return {
    loading,
    // Course methods
    updateCourseSlug,
    updateAllCourseSlugs,
    // Category methods
    updateCategorySlug,
    updateAllCategorySlugs,
    // Career path methods
    updateCareerPathSlug,
    updateAllCareerPathSlugs,
  };
};
