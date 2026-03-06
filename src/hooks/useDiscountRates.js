import { useState, useEffect, useCallback } from 'react';
import { adminApiService } from '../services/AdminApi';

export const useDiscountRates = (initialPage = 1, pageSize = 10) => {
  // State management
  const [discountRates, setDiscountRates] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(initialPage);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  // Fetch all discount rates with pagination and search
  const fetchDiscountRates = useCallback(async (pageNum = page, pageSizeVal = pageSize, searchQuery = '') => {
    setLoading(true);
    setError(null);

    try {
      const params = {
        page: pageNum,
        pageSize: pageSizeVal,
      };

      // Add search parameter if provided
      if (searchQuery && typeof searchQuery === 'string') {
       
        params.search = searchQuery;
      } else if (searchQuery) {
        console.warn('Invalid search parameter type in useDiscountRates:', typeof searchQuery, searchQuery);
      }
      const response = await adminApiService.getAllDiscountRates(params);
      
      // Handle response structure - based on the API response you provided
      if (response && typeof response === 'object') {
        if (response.items && Array.isArray(response.items)) {
          setDiscountRates(response.items);
          setTotalCount(response.totalCount || response.items.length);
          setTotalPages(Math.ceil((response.totalCount || response.items.length) / pageSizeVal));
        } else if (Array.isArray(response)) {
          setDiscountRates(response);
          setTotalCount(response.length);
          setTotalPages(Math.ceil(response.length / pageSizeVal));
        } else {
          console.warn('Unexpected response structure:', response);
          setDiscountRates([]);
          setTotalCount(0);
          setTotalPages(1);
        }
      } else {
        console.warn('Invalid response:', response);
        setDiscountRates([]);
        setTotalCount(0);
        setTotalPages(1);
      }
    } catch (err) {
      console.error('Error fetching discount rates:', err);
      setError('Failed to fetch discount rates: ' + (err.message || 'Unknown error'));
      setDiscountRates([]);
      setTotalCount(0);
      setTotalPages(1);
    } finally {
      setLoading(false);
    }
  }, []); // Remove dependencies to prevent stale closures

  // Get discount rate by ID
  const getDiscountRateById = useCallback(async (id) => {
    try {
      setLoading(true);
      setError(null);
      const data = await adminApiService.getDiscountRateById(id);
      return data;
    } catch (err) {
      setError('Failed to fetch discount rate');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Create new discount rate
  const createDiscountRate = useCallback(async (discountRateData) => {
    try {
      setLoading(true);
      setError(null);
      const data = await adminApiService.createDiscountRate(discountRateData);
      await fetchDiscountRates(); // Refresh the list
      return data;
    } catch (err) {
      setError('Failed to create discount rate');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [fetchDiscountRates]);

  // Update discount rate
  const updateDiscountRate = useCallback(async (id, discountRateData) => {
    try {
      setLoading(true);
      setError(null);
      const data = await adminApiService.updateDiscountRate(id, discountRateData);
      await fetchDiscountRates(); // Refresh the list
      return data;
    } catch (err) {
      setError('Failed to update discount rate');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [fetchDiscountRates]);

  // Delete discount rate
  const deleteDiscountRate = useCallback(async (id) => {
    try {
      setLoading(true);
      setError(null);
      const data = await adminApiService.deleteDiscountRate(id);
      await fetchDiscountRates(); // Refresh the list
      return data;
    } catch (err) {
      setError('Failed to delete discount rate');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [fetchDiscountRates]);

  // Pagination helpers
  const nextPage = useCallback(() => {
    if (page < totalPages) {
      setPage(prev => prev + 1);
    }
  }, [page, totalPages]);

  const prevPage = useCallback(() => {
    if (page > 1) {
      setPage(prev => prev - 1);
    }
  }, [page]);

  const goToPage = useCallback((pageNumber) => {
    if (pageNumber >= 1 && pageNumber <= totalPages) {
      setPage(pageNumber);
    }
  }, [totalPages]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Initialize data on mount
  useEffect(() => {
    fetchDiscountRates();
  }, []); // Empty dependency array to run only once on mount

  return {
    // State
    discountRates,
    loading,
    error,
    page,
    totalPages,
    totalCount,

    // Actions
    fetchDiscountRates,
    getDiscountRateById,
    createDiscountRate,
    updateDiscountRate,
    deleteDiscountRate,

    // Pagination
    nextPage,
    prevPage,
    goToPage,
    setPage,

    // Utilities
    clearError,
  };
};
