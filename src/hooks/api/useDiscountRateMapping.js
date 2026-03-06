import { useState, useEffect, useCallback } from 'react';
import ApiService from '../../services/ApiService';

export const useDiscountRateMapping = () => {
  const [discountRates, setDiscountRates] = useState([]);
  const [, setCourses] = useState([]);
  const [allCourses, setAllCourses] = useState([]);
  const [courseTypes, setCourseTypes] = useState([]);
  const [courseLevels, setCourseLevels] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingCourses, setLoadingCourses] = useState(false);
  const [error, setError] = useState(null);
  const [courseDiscountMappings, setCourseDiscountMappings] = useState({});
  
  // Pagination state for discount rates
  const [discountRatesPagination, setDiscountRatesPagination] = useState({
    currentPage: 1,
    pageSize: 8,
    totalItems: 0,
    totalPages: 0
  });
  
  // Pagination state for courses
  const [pagination, setPagination] = useState({
    currentPage: 1,
    pageSize: 100,
    totalItems: 0,
    totalPages: 0
  });

  // Fetch all discount rates with pagination and search
 const fetchAllDiscountRates = useCallback(async (params = {}) => {
  if (loading) return;

  setLoading(true);
  setError(null);

  try {
    const apiParams = {};

    if (params.page) apiParams.page = params.page;
    if (params.pageSize) apiParams.pageSize = params.pageSize;
    if (params.search && typeof params.search === "string") {
      apiParams.search = params.search;
    }

    const data = await ApiService.getAllDiscountRates(apiParams);

    if (data?.items && Array.isArray(data.items)) {
      setDiscountRates(data.items);

      setDiscountRatesPagination(prev => ({
        ...prev,
        currentPage: data.page || 1,
        totalItems: data.totalCount || 0,
        totalPages: Math.ceil(
          (data.totalCount || 0) / (params.pageSize || prev.pageSize)
        )
      }));
    } 
    else if (Array.isArray(data)) {
      setDiscountRates(data);

      setDiscountRatesPagination(prev => ({
        ...prev,
        totalItems: data.length,
        totalPages: Math.ceil(data.length / prev.pageSize)
      }));
    }

  } catch (err) {
    setError("Failed to fetch discount rates");
    setDiscountRates([]);
  } finally {
    setLoading(false);
  }
}, [loading]);

  // Fetch courses with filters
  const fetchCoursesWithFilters = useCallback(async (filters = {}) => {
    // Prevent multiple simultaneous calls
    if (loadingCourses) {
      return;
    }
    
    setLoadingCourses(true);
    try {
      const queryParams = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value) queryParams.append(key, value);
      });
      
      // Try to get all courses first, then apply filters client-side if needed
      const data = await ApiService.getAllCoursesAdmin(queryParams.toString());
      
      if (data && typeof data === 'object') {
        if (data.items && Array.isArray(data.items)) {
          setAllCourses(data.items);
          setPagination(prev => ({
            ...prev,
            currentPage: data.page || 1,
            totalItems: data.totalCount || data.items.length,
            totalPages: Math.ceil((data.totalCount || data.items.length) / (filters.pageSize || prev.pageSize))
          }));
        } else if (Array.isArray(data)) {
          setAllCourses(data);
          setPagination(prev => ({
            ...prev,
            totalItems: data.length,
            totalPages: Math.ceil(data.length / prev.pageSize)
          }));
        } else {
          console.warn('Unexpected courses response structure:', data);
          setAllCourses([]);
        }
      } else {
        console.warn('Invalid courses response:', data);
        setAllCourses([]);
      }
    } catch (err) {
      console.error('Error fetching courses:', err);
      setError('Failed to fetch courses: ' + (err.message || 'Unknown error'));
      setAllCourses([]);
    } finally {
      setLoadingCourses(false);
    }
  }, [loadingCourses]);

  // Fetch discount rate mappings by course ID
  const fetchDiscountRateMappingsByCourse = useCallback(async (courseId) => {
    try {
      setLoading(true);
      const data = await ApiService.getDiscountRateMappingsByCourse(courseId);
      setCourseDiscountMappings(prev => ({
        ...prev,
        [courseId]: data || []
      }));
      return data;
    } catch (err) {
      setError('Failed to fetch discount rate mappings');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Assign discount rate to course
  const assignDiscountRateToCourse = useCallback(async (courseIds, discountRateId, isActive = true) => {
    try {
      setLoading(true);
      
      // Assign to single course
      await ApiService.assignDiscountRate(courseIds[0], discountRateId);
      
      // Refresh course data to show updated discount assignments
      await fetchCoursesWithFilters({});
      
      return true;
    } catch (err) {
      setError('Failed to assign discount rate to course');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Assign discount rate to course type
  const assignDiscountRateToCourseType = useCallback(async (courseTypeId, discountRateId, courseId = null) => {
    try {
      setLoading(true);
      
      await ApiService.assignDiscountRateToCourseType(courseTypeId, discountRateId, courseId);
      
      // Refresh course types data
      await fetchCourseTypes();
      
      return true;
    } catch (err) {
      setError('Failed to assign discount rate to course type');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Update discount rate mapping
  const updateDiscountRateMapping = useCallback(async (mappingId, mappingData) => {
    try {
      setLoading(true);
      await ApiService.updateDiscountRateMapping(mappingId, mappingData);
      
      // Refresh all mappings (we don't know which course this belongs to)
      Object.keys(courseDiscountMappings).forEach(courseId => {
        fetchDiscountRateMappingsByCourse(courseId);
      });
      
      return true;
    } catch (err) {
      setError('Failed to update discount rate mapping');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [courseDiscountMappings, fetchDiscountRateMappingsByCourse]);

  // Delete discount rate mapping
  const deleteDiscountRateMapping = useCallback(async (mappingId) => {
    try {
      setLoading(true);
      await ApiService.deleteDiscountRateMapping(mappingId);
      
      // Refresh all mappings
      Object.keys(courseDiscountMappings).forEach(courseId => {
        fetchDiscountRateMappingsByCourse(courseId);
      });
      
      return true;
    } catch (err) {
      setError('Failed to delete discount rate mapping');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch course types
  const fetchCourseTypes = useCallback(async () => {
    try {
      const data = await ApiService.getCourseTypes();
      setCourseTypes(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Failed to fetch course types:', err);
      setCourseTypes([]);
    }
  }, []);

  // Fetch course levels
  const fetchCourseLevels = useCallback(async () => {
    try {
      
      const data = await ApiService.getCourseLevels();
     
      setCourseLevels(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Failed to fetch course levels:', err);
      setCourseLevels([]);
    }
  }, []);

  // Fetch categories
  const fetchAllCategories = useCallback(async () => {
    try {
    
      const data = await ApiService.getAllCategories();
      
      setCategories(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Failed to fetch categories:', err);
      setCategories([]);
    }
  }, []);

  // Pagination helpers for discount rates
  const changeDiscountRatesPageSize = useCallback((newSize) => {
    setDiscountRatesPagination(prev => ({
      ...prev,
      pageSize: newSize,
      currentPage: 1
    }));
  }, []);

  // Pagination helpers for courses
  const changePageSize = useCallback((newSize) => {
    setPagination(prev => ({
      ...prev,
      pageSize: newSize,
      currentPage: 1
    }));
  }, []);

  const paginateCourses = useCallback((pageNumber) => {
    setPagination(prev => ({
      ...prev,
      currentPage: pageNumber
    }));
  }, []);

  // Clear error
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Initialize data
  useEffect(() => {
    fetchAllDiscountRates({});
    fetchCoursesWithFilters({});
    fetchCourseTypes();
    fetchCourseLevels();
    fetchAllCategories();
  }, []); // Empty dependency array to run only once on mount

  return {
    // State
    discountRates,
    allCourses,
    courseTypes,
    courseLevels,
    categories,
    loading,
    loadingCourses,
    error,
    courseDiscountMappings,
    discountRatesPagination,
    pagination,

    // Actions
    fetchAllDiscountRates,
    fetchCoursesWithFilters,
    fetchDiscountRateMappingsByCourse,
    assignDiscountRateToCourse,
    assignDiscountRateToCourseType,
    updateDiscountRateMapping,
    deleteDiscountRateMapping,
    fetchCourseTypes,
    fetchCourseLevels,
    fetchAllCategories,

    // Pagination
    changeDiscountRatesPageSize,
    changePageSize,
    paginateCourses,

    // Utilities
    clearError,
  };
};
