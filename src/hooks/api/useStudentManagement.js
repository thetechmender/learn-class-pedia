import { useState, useCallback, useEffect } from 'react';
import ApiService from '../../services/ApiService';
import { ENDPOINTS } from '../../config/api';

export const useStudentManagement = () => {
  // Global state
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // Separate loading states for modal operations
  const [loadingStudentDetails, setLoadingStudentDetails] = useState(false);
  const [loadingStudentOrders, setLoadingStudentOrders] = useState(false);
  
  // Students data state
  const [students, setStudents] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);
  
  // Pagination state
  const [pagination, setPagination] = useState({
    currentPage: 1,
    pageSize: 100,
    totalCount: 0,
    totalPages: 0,
    hasNextPage: false,
    hasPreviousPage: false
  });

  // Clear error
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Get all students with pagination and filters
  const getAllStudents = useCallback(async (pageNumber = 1, pageSize = 100, filters = {}) => {
    setLoading(true);
    setError(null);
    
    try {
      const queryParams = new URLSearchParams({
        PageNumber: pageNumber.toString(),
        PageSize: pageSize.toString(),
        ...(filters.fullName && { FullName: filters.fullName }),
        ...(filters.email && { Email: filters.email }),
        ...(filters.phoneNumber && { PhoneNumber: filters.phoneNumber }),
        ...(filters.isEmailVerified !== undefined && filters.isEmailVerified !== '' && { IsEmailVerified: filters.isEmailVerified }),
        ...(filters.signupTypeId && { SignupTypeId: filters.signupTypeId }),
        ...(filters.genderId && { GenderId: filters.genderId }),
        ...(filters.qualificationId && { QualificationId: filters.qualificationId }),
        ...(filters.signupDateFrom && { SignupDateFrom: filters.signupDateFrom }),
        ...(filters.signupDateTo && { SignupDateTo: filters.signupDateTo }),
        ...(filters.courseId && { CourseId: filters.courseId }),
        ...(filters.geoLocationCountry && { GeoLocationCountry: filters.geoLocationCountry })
      });

      const response = await ApiService.get(`${ENDPOINTS.STUDENT_MANAGEMENT_ALL}?${queryParams}`);
      
      // Handle the response format - data is directly in response, not nested under response.data
      if (response && (response.students || response.data?.students)) {
        const responseData = response.data || response;
        setStudents(responseData.students || []);
        setPagination({
          currentPage: responseData.currentPage || 1,
          pageSize: responseData.pageSize || pageSize,
          totalCount: responseData.totalCount || 0,
          totalPages: responseData.totalPages || 0,
          hasNextPage: responseData.hasNextPage || false,
          hasPreviousPage: responseData.hasPreviousPage || false
        });
        return responseData;
      }
      throw new Error('Invalid response format');
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || 'Failed to fetch students';
      setError(errorMessage);
      console.error('getAllStudents error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Get student by ID
  const getStudentById = useCallback(async (studentId) => {
    setLoadingStudentDetails(true);
    setError(null);
    
    try {
      const response = await ApiService.get(ENDPOINTS.STUDENT_MANAGEMENT_BY_ID(studentId));
      
      // Handle the response format - data is directly in response, not nested under response.data
      if (response && (response.id || response.data?.id)) {
        const responseData = response.data || response;
        setSelectedStudent(responseData);
        return responseData;
      }
      throw new Error('Invalid response format');
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || 'Failed to fetch student details';
      setError(errorMessage);
      throw err;
    } finally {
      setLoadingStudentDetails(false);
    }
  }, []);

  // Search students (wrapper for getAllStudents with search filters)
  const searchStudents = useCallback(async (searchTerm, pageNumber = 1, pageSize = 100) => {
    const filters = {};
    
    // Try to determine search type based on input pattern
    if (searchTerm) {
      if (searchTerm.includes('@')) {
        filters.email = searchTerm;
      } else if (/^\d+$/.test(searchTerm.replace(/[-\s]/g, ''))) {
        filters.phoneNumber = searchTerm;
      } else {
        filters.fullName = searchTerm;
      }
    }

    return getAllStudents(pageNumber, pageSize, filters);
  }, [getAllStudents]);

  // Filter students
  const filterStudents = useCallback(async (filters, pageNumber = 1, pageSize = 100) => {
    return getAllStudents(pageNumber, pageSize, filters);
  }, [getAllStudents]);

  // Reset state
  const resetState = useCallback(() => {
    setStudents([]);
    setSelectedStudent(null);
    setPagination({
      currentPage: 1,
      pageSize: 100,
      totalCount: 0,
      totalPages: 0,
      hasNextPage: false,
      hasPreviousPage: false
    });
    setError(null);
  }, []);

  // Get dropdown data
  const getGendersDropdown = useCallback(async () => {
    try {
      const response = await ApiService.get(ENDPOINTS.STUDENT_MANAGEMENT_DROPDOWN_GENDERS);
      return response.data || response;
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || 'Failed to fetch genders';
      setError(errorMessage);
      throw err;
    }
  }, []);

  const getSignupTypesDropdown = useCallback(async () => {
    try {
      const response = await ApiService.get(ENDPOINTS.STUDENT_MANAGEMENT_DROPDOWN_SIGNUP_TYPES);
      return response.data || response;
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || 'Failed to fetch signup types';
      setError(errorMessage);
      throw err;
    }
  }, []);

  const getQualificationsDropdown = useCallback(async () => {
    try {
      const response = await ApiService.get(ENDPOINTS.STUDENT_MANAGEMENT_DROPDOWN_QUALIFICATIONS);
      return response.data || response;
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || 'Failed to fetch qualifications';
      setError(errorMessage);
      throw err;
    }
  }, []);

  const getCountriesDropdown = useCallback(async () => {
    try {
      const response = await ApiService.get(ENDPOINTS.STUDENT_MANAGEMENT_DROPDOWN_COUNTRIES);
      return response.data || response;
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || 'Failed to fetch countries';
      setError(errorMessage);
      throw err;
    }
  }, []);

  // Get student orders
  const getStudentOrders = useCallback(async (customerId) => {
    setLoadingStudentOrders(true);
    setError(null);
    
    try {
      const response = await ApiService.getStudentOrders(customerId);
      
      // Handle response format - data is directly in response
      if (response && (response.customerId || response.data?.customerId)) {
        const responseData = response.data || response;
        return responseData;
      }
      throw new Error('Invalid response format');
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || 'Failed to fetch student orders';
      setError(errorMessage);
      throw err;
    } finally {
      setLoadingStudentOrders(false);
    }
  }, []);

  return {
    // State
    loading,
    error,
    students,
    selectedStudent,
    pagination,
    loadingStudentDetails,
    loadingStudentOrders,
    
    // Actions
    getAllStudents,
    getStudentById,
    searchStudents,
    filterStudents,
    clearError,
    setSelectedStudent,
    
    // Dropdown data
    getGendersDropdown,
    getSignupTypesDropdown,
    getQualificationsDropdown,
    getCountriesDropdown,
    
    // Orders
    getStudentOrders,
  };
};

export default useStudentManagement;
