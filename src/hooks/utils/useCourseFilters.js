import { useState, useCallback } from 'react';
import appSettings from '../../config/appSettings';

/**
 * Custom hook for managing course filters
 * @returns {Object} Filter state and handlers
 */
export const useCourseFilters = () => {
  const defaultPageSize = appSettings.pagination?.defaultPageSize ?? 100;
  const [filters, setFilters] = useState({
    page: 1,
    pageSize: defaultPageSize,
    title: '',
    subtitle: '',
    description: '',
    overview: '',
    courseTypeId: 0,
    categoryId: 0,
    courseLevelId: 0,
    slug: '',
    thumbnailUrl: '',
    promoVideoUrl: '',
    price: '',
    discountedPrice: '',
    currencyCode: '',
    isPaid: ''
  });

  const [filtersLoading, setFiltersLoading] = useState(false);
  const [paginationInfo, setPaginationInfo] = useState({ 
    page: 1, 
    pageSize: defaultPageSize, 
    totalCount: 0 
  });

  // Handle filter changes
  const handleFilterChange = useCallback((field, value) => {
    setFilters(prev => ({
      ...prev,
      [field]: value
    }));
  }, []);

  // Reset filters to default
  const resetFilters = useCallback(() => {
    setFilters({
      page: 1,
      pageSize: defaultPageSize,
      title: '',
      subtitle: '',
      description: '',
      overview: '',
      courseTypeId: 0,
      categoryId: 0,
      courseLevelId: 0,
      slug: '',
      thumbnailUrl: '',
      promoVideoUrl: '',
      price: '',
      discountedPrice: '',
      currencyCode: '',
      isPaid: ''
    });
    setPaginationInfo({ page: 1, pageSize: defaultPageSize, totalCount: 0 });
  }, [defaultPageSize]);

  // Get active filters (non-empty values)
  const getActiveFilters = useCallback(() => {
    return Object.entries(filters).reduce((acc, [key, val]) => {
      if (val !== '' && val !== 0 && val !== null && val !== undefined) {
        acc[key] = val;
      }
      return acc;
    }, {});
  }, [filters]);

  return {
    filters,
    setFilters,
    filtersLoading,
    paginationInfo,
    setFiltersLoading,
    setPaginationInfo,
    handleFilterChange,
    resetFilters,
    getActiveFilters
  };
};
