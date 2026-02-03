import { useState, useEffect, useCallback } from 'react';
import { adminApiService } from '../services/AdminApi';

export const useCourseSkillMapping = () => {
  const [skills, setSkills] = useState([]);
  const [allSkills, setAllSkills] = useState([]); // Store all skills for client-side pagination
  const [courses, setCourses] = useState([]);
  const [allCourses, setAllCourses] = useState([]); // Store all courses for client-side pagination
  const [courseTypes, setCourseTypes] = useState([]);
  const [courseLevels, setCourseLevels] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingCourses, setLoadingCourses] = useState(false);
  const [error, setError] = useState(null);
  const [skillCourses, setSkillCourses] = useState({});
  
  // Pagination state for skills
  const [skillsPagination, setSkillsPagination] = useState({
    currentPage: 1,
    pageSize: 12, // 3x4 grid
    totalItems: 0,
    totalPages: 0
  });
  
  // Pagination state for courses
  const [pagination, setPagination] = useState({
    currentPage: 1,
    pageSize: 10,
    totalItems: 0,
    totalPages: 0
  });

  // Fetch all skills
  const fetchAllSkills = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await adminApiService.getAllSkills();
      setAllSkills(data);
      
      // Update skills pagination info
      const totalPages = Math.ceil(data.length / skillsPagination.pageSize);
      setSkillsPagination(prev => ({
        ...prev,
        totalItems: data.length,
        totalPages: totalPages,
        currentPage: 1 // Reset to first page
      }));
      
      // Set current page skills
      const startIndex = 0;
      const endIndex = skillsPagination.pageSize;
      const paginatedSkills = data.slice(startIndex, endIndex);
      setSkills(paginatedSkills);
    } catch (err) {
      setError(err.message || 'Failed to fetch skills');
      console.error('Failed to fetch skills:', err);
    } finally {
      setLoading(false);
    }
  }, [skillsPagination.pageSize]);

  // Fetch courses with filters
  const fetchCoursesWithFilters = useCallback(async (filters = {}) => {
    setLoadingCourses(true);
    try {
      const data = await adminApiService.getAllCoursesAdminNoPagination(filters);
      // Handle both direct array and paginated response formats
      const coursesData = Array.isArray(data) ? data : data?.items || [];
      
      // Store all courses for pagination
      setAllCourses(coursesData);
      
      // Update pagination info
      const totalPages = Math.ceil(coursesData.length / pagination.pageSize);
      setPagination(prev => ({
        ...prev,
        totalItems: coursesData.length,
        totalPages: totalPages,
        currentPage: 1 // Reset to first page when new filters are applied
      }));
      
      // Set current page courses
      const startIndex = 0;
      const endIndex = pagination.pageSize;
      const paginatedCourses = coursesData.slice(startIndex, endIndex);
      setCourses(paginatedCourses);
    } catch (err) {
      console.error('Failed to fetch courses:', err);
      setCourses([]);
      setAllCourses([]);
      setPagination(prev => ({
        ...prev,
        totalItems: 0,
        totalPages: 0,
        currentPage: 1
      }));
    } finally {
      setLoadingCourses(false);
    }
  }, [pagination.pageSize]);

  // Pagination helper function
  const paginateCourses = useCallback((page) => {
    const startIndex = (page - 1) * pagination.pageSize;
    const endIndex = startIndex + pagination.pageSize;
    const paginatedCourses = allCourses.slice(startIndex, endIndex);
    setCourses(paginatedCourses);
    setPagination(prev => ({
      ...prev,
      currentPage: page
    }));
  }, [allCourses, pagination.pageSize]);

  // Change page size
  const changePageSize = useCallback((newPageSize) => {
    setPagination(prev => {
      const totalPages = Math.ceil(allCourses.length / newPageSize);
      const newPage = Math.min(prev.currentPage, totalPages || 1);
      
      // Re-paginate with new page size
      const startIndex = (newPage - 1) * newPageSize;
      const endIndex = startIndex + newPageSize;
      const paginatedCourses = allCourses.slice(startIndex, endIndex);
      setCourses(paginatedCourses);
      
      return {
        ...prev,
        pageSize: newPageSize,
        totalPages: totalPages,
        currentPage: newPage
      };
    });
  }, [allCourses]);

  // Skills pagination helper function
  const paginateSkills = useCallback((page) => {
    const startIndex = (page - 1) * skillsPagination.pageSize;
    const endIndex = startIndex + skillsPagination.pageSize;
    const paginatedSkills = allSkills.slice(startIndex, endIndex);
    setSkills(paginatedSkills);
    setSkillsPagination(prev => ({
      ...prev,
      currentPage: page
    }));
  }, [allSkills, skillsPagination.pageSize]);

  // Change skills page size
  const changeSkillsPageSize = useCallback((newPageSize) => {
    setSkillsPagination(prev => {
      const totalPages = Math.ceil(allSkills.length / newPageSize);
      const newPage = Math.min(prev.currentPage, totalPages || 1);
      
      // Re-paginate with new page size
      const startIndex = (newPage - 1) * newPageSize;
      const endIndex = startIndex + newPageSize;
      const paginatedSkills = allSkills.slice(startIndex, endIndex);
      setSkills(paginatedSkills);
      
      return {
        ...prev,
        pageSize: newPageSize,
        totalPages: totalPages,
        currentPage: newPage
      };
    });
  }, [allSkills]);

  // Fetch course details for specific course IDs
  const fetchCourseDetailsByIds = useCallback(async (courseIds) => {
    if (!courseIds || courseIds.length === 0) return;
    
    setLoadingCourses(true);
    try {
      // Fetch all courses and then filter for the ones we need
      const data = await adminApiService.getAllCoursesAdminNoPagination({});
      const coursesData = Array.isArray(data) ? data : data?.items || [];
      
      // Filter to get only the courses we need
      const neededCourses = coursesData.filter(course => courseIds.includes(course.id));
      
      // Update courses state with the needed courses
      setCourses(prevCourses => {
        const existingIds = prevCourses.map(c => c.id);
        const newCourses = neededCourses.filter(course => !existingIds.includes(course.id));
        return [...prevCourses, ...newCourses];
      });
      
      // Also update allCourses for pagination
      setAllCourses(prevAllCourses => {
        const existingIds = prevAllCourses.map(c => c.id);
        const newCourses = neededCourses.filter(course => !existingIds.includes(course.id));
        return [...prevAllCourses, ...newCourses];
      });
      
    } catch (err) {
      console.error('Failed to fetch course details:', err);
    } finally {
      setLoadingCourses(false);
    }
  }, []);

  // Fetch skill by ID with course mappings
  const fetchSkillById = useCallback(async (skillId) => {
    try {
      const data = await adminApiService.getSkillById(skillId);
      
      // Update skillCourses with the fetched data
      setSkillCourses(prev => ({
        ...prev,
        [skillId]: data.courseIds || []
      }));
      
      // Fetch course details for assigned courses
      if (data.courseIds && data.courseIds.length > 0) {
        await fetchCourseDetailsByIds(data.courseIds);
      }
      
      return data;
    } catch (err) {
      console.error('Failed to fetch skill details:', err);
      throw err;
    }
  }, [fetchCourseDetailsByIds]);

  // Fetch course types
  const fetchCourseTypes = useCallback(async () => {
    try {
      const data = await adminApiService.getAllCourseTypes();
      // Handle both direct array and paginated response formats
      const courseTypesData = Array.isArray(data) ? data : data?.items || [];
      setCourseTypes(courseTypesData);
    } catch (err) {
      console.error('Failed to fetch course types:', err);
    }
  }, []);

  // Fetch course levels
  const fetchCourseLevels = useCallback(async () => {
    try {
      const data = await adminApiService.getAllCourseLevels();
      // Handle both direct array and paginated response formats
      const courseLevelsData = Array.isArray(data) ? data : data?.items || [];
      setCourseLevels(courseLevelsData);
    } catch (err) {
      console.error('Failed to fetch course levels:', err);
    }
  }, []);

  // Fetch categories
  const fetchCategories = useCallback(async () => {
    try {
      const data = await adminApiService.getAllCategories();
      // Handle both direct array and paginated response formats
      const categoriesData = Array.isArray(data) ? data : data?.items || [];
      setCategories(categoriesData);
    } catch (err) {
      console.error('Failed to fetch categories:', err);
    }
  }, []);

  // Assign courses to skill
  const assignCoursesToSkill = useCallback(async (skillId, courseIds) => {
    try {
      await adminApiService.syncCoursesToSkill(skillId, courseIds);
      
      // Refresh skill data
      await fetchAllSkills();
      
      return { success: true };
    } catch (err) {
      console.error('Failed to assign courses to skill:', err);
      throw err;
    }
  }, [fetchAllSkills]);

  // Get skill courses
  const getSkillCourses = useCallback((skillId) => {
    return skillCourses[skillId] || [];
  }, [skillCourses]);

  // Load initial data
  const loadInitialData = useCallback(async () => {
    try {
      setLoading(true);
      await Promise.all([
        fetchAllSkills(),
        fetchCourseTypes(),
        fetchCourseLevels(),
        fetchCategories()
      ]);
    } catch (err) {
      setError(err.message || 'Failed to load initial data');
    } finally {
      setLoading(false);
    }
  }, [fetchAllSkills, fetchCourseTypes, fetchCourseLevels, fetchCategories]);

  // Initialize data on mount
  useEffect(() => {
    loadInitialData();
  }, [loadInitialData]);

  return {
    // Data
    skills,
    allSkills,
    courses,
    allCourses,
    courseTypes,
    courseLevels,
    categories,
    skillCourses,
    
    // Loading states
    loading,
    loadingCourses,
    error,
    
    // Pagination
    skillsPagination,
    paginateSkills,
    changeSkillsPageSize,
    pagination,
    paginateCourses,
    changePageSize,
    
    // Actions
    fetchAllSkills,
    fetchSkillById,
    fetchCoursesWithFilters,
    fetchCourseDetailsByIds,
    fetchCourseTypes,
    fetchCourseLevels,
    fetchCategories,
    assignCoursesToSkill,
    getSkillCourses,
    loadInitialData,
    
    // Setters for component state
    setSkills,
    setAllSkills,
    setCourses,
    setSkillCourses,
    setError
  };
};
