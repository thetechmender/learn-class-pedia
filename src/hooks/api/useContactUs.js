import { useState, useEffect, useCallback } from 'react';
import ApiService from '../../services/ApiService';

export const useContactUs = () => {
  // State management
  const [contactList, setContactList] = useState([]);
  const [inquiryOptions, setInquiryOptions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Pagination state
  const [pagination, setPagination] = useState({
    page: 1,
    pageSize: 100,
    totalCount: 0,
    totalPages: 0,
    hasNextPage: false,
    hasPreviousPage: false,
  });

  // Filters state
  const [filters, setFilters] = useState({
    fullName: '',
    emailAddress: '',
    phoneNumber: '',
    inquiryOptionId: ''
  });

  // Fetch contact information with filters and pagination
  const fetchContactInformation = useCallback(async (searchFilters = {}, page = 1, pageSize = 10) => {
    setLoading(true);
    setError(null);

    try {
      const response = await ApiService.getContactInformation({
        ...searchFilters,
        page,
        pageSize,
      });

      // Handle response structure
      if (response && response.success && response.data) {
        const list = Array.isArray(response.data.contactUsList) ? response.data.contactUsList : [];
        setContactList(list);
        // Also update inquiry options if they come with the response
        if (response.data.contactInquiryOptions) {
          setInquiryOptions(response.data.contactInquiryOptions);
        }
        // Update pagination if present
        setPagination({
          page: response.data.page || page,
          pageSize: response.data.pageSize || pageSize,
          totalCount: response.data.totalCount || list.length,
          totalPages: response.data.totalPages || 1,
          hasNextPage: response.data.hasNextPage || false,
          hasPreviousPage: response.data.hasPreviousPage || false,
        });
      } else if (Array.isArray(response)) {
        setContactList(response);
        setPagination(prev => ({
          ...prev,
          totalCount: response.length,
          totalPages: 1,
          hasNextPage: false,
          hasPreviousPage: false,
        }));
      } else {
        console.warn('Unexpected response structure:', response);
        setContactList([]);
      }
    } catch (err) {
      console.error('Error fetching contact information:', err);
      setError('Failed to fetch contact information: ' + (err.message || 'Unknown error'));
      setContactList([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch inquiry options for dropdown
  const fetchInquiryOptions = useCallback(async () => {
    try {
      const response = await ApiService.getInquiryOptions();
      
      // Handle response structure
      if (response && response.success && Array.isArray(response.data)) {
        setInquiryOptions(response.data);
      } else if (Array.isArray(response)) {
        setInquiryOptions(response);
      } else {
        console.warn('Unexpected inquiry options response:', response);
        setInquiryOptions([]);
      }
    } catch (err) {
      console.error('Error fetching inquiry options:', err);
      setInquiryOptions([]);
    }
  }, []);

  // Update filters
  const updateFilters = useCallback((newFilters) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  }, []);

  // Clear all filters
  const clearFilters = useCallback(() => {
    setFilters({
      fullName: '',
      emailAddress: '',
      phoneNumber: '',
      inquiryOptionId: ''
    });
  }, []);

  // Apply current filters with pagination
  const applyFilters = useCallback(() => {
    // Remove empty filters
    const activeFilters = Object.fromEntries(
      Object.entries(filters).filter(([_, value]) => value && value.toString().trim() !== '')
    );
    fetchContactInformation(activeFilters, pagination.page, pagination.pageSize);
  }, [filters, pagination.page, pagination.pageSize, fetchContactInformation]);

  // Handle page change
  const handlePageChange = useCallback((newPage) => {
    setPagination(prev => ({ ...prev, page: newPage }));
    const activeFilters = Object.fromEntries(
      Object.entries(filters).filter(([_, value]) => value && value.toString().trim() !== '')
    );
    fetchContactInformation(activeFilters, newPage, pagination.pageSize);
  }, [filters, pagination.pageSize, fetchContactInformation]);

  // Handle page size change
  const handlePageSizeChange = useCallback((newPageSize) => {
    setPagination(prev => ({ ...prev, pageSize: newPageSize, page: 1 }));
    const activeFilters = Object.fromEntries(
      Object.entries(filters).filter(([_, value]) => value && value.toString().trim() !== '')
    );
    fetchContactInformation(activeFilters, 1, newPageSize);
  }, [filters, fetchContactInformation]);

  // Clear error
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    // State
    contactList,
    inquiryOptions,
    loading,
    error,
    filters,
    pagination,

    // Actions
    fetchContactInformation,
    fetchInquiryOptions,
    updateFilters,
    clearFilters,
    applyFilters,
    clearError,
    handlePageChange,
    handlePageSizeChange,
  };
};

export default useContactUs;
