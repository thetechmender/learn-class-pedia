import { useState, useEffect, useCallback } from 'react';
import ApiService from '../../services/ApiService';

export const useContactUs = () => {
  // State management
  const [contactList, setContactList] = useState([]);
  const [inquiryOptions, setInquiryOptions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Filters state
  const [filters, setFilters] = useState({
    fullName: '',
    emailAddress: '',
    phoneNumber: '',
    inquiryOptionId: ''
  });

  // Fetch contact information with filters
  const fetchContactInformation = useCallback(async (searchFilters = {}) => {
    setLoading(true);
    setError(null);

    try {
      const response = await ApiService.getContactInformation(searchFilters);
      
      // Handle response structure
      if (response && response.success && response.data && Array.isArray(response.data.contactUsList)) {
        setContactList(response.data.contactUsList);
        // Also update inquiry options if they come with the response
        if (response.data.contactInquiryOptions) {
          setInquiryOptions(response.data.contactInquiryOptions);
        }
      } else if (Array.isArray(response)) {
        setContactList(response);
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

  // Apply current filters
  const applyFilters = useCallback(() => {
    // Remove empty filters
    const activeFilters = Object.fromEntries(
      Object.entries(filters).filter(([_, value]) => value && value.toString().trim() !== '')
    );
    fetchContactInformation(activeFilters);
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

    // Actions
    fetchContactInformation,
    fetchInquiryOptions,
    updateFilters,
    clearFilters,
    applyFilters,
    clearError,
  };
};

export default useContactUs;
