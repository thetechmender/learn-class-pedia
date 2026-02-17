import { useState, useEffect, useCallback } from 'react';
import { useAdmin } from './useAdmin';
import { adminApiService } from '../services/AdminApi';

export const useCourseBadgeManagement = () => {
  const { getAllCourseBadgesNew } = useAdmin();
  
  const [badges, setBadges] = useState([]);
  const [courses, setCourses] = useState([]);
  const [courseTypes, setCourseTypes] = useState([]);
  const [courseLevels, setCourseLevels] = useState([]);
  const [categories, setCategories] = useState([]);
  const [careerPaths, setCareerPaths] = useState([]);
  const [loadingBadges, setLoadingBadges] = useState(true);
  const [badgesError, setBadgesError] = useState(null);
  const [loadingcourse, setLoadingCourse] = useState(false);
  const [loadingCareerPaths, setLoadingCareerPaths] = useState(false);
  const [Courseerror, setCourseError] = useState(null);
  const [careerPathsError, setCareerPathsError] = useState(null);
  const [selectedBadge, setSelectedBadge] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showCourseAssignmentModal, setShowCourseAssignmentModal] = useState(false);
  const [showCategoryAssignmentModal, setShowCategoryAssignmentModal] = useState(false);
  const [showCareerPathAssignmentModal, setShowCareerPathAssignmentModal] = useState(false);
  
  // Pagination state for badges
  const [badgePagination, setBadgePagination] = useState({
    page: 1,
    pageSize: 100,
    totalCount: 0,
    totalPages: 0
  });
  
  const [formData, setFormData] = useState({
    badgeKey: '',
    badgeName: '',
    badgeColor: '#3B82F6',
    badgeIcon: '🏆',
    description: '',
    isActive: true,
    courseIds: []
  });
  const loadDropdowns = useCallback(async () => {
  try {
    setLoadingBadges(true);

    const [
      courseTypesData,
      courseLevelsData,
      categoriesData
    ] = await Promise.all([
      adminApiService.getAllCourseTypes(),
      adminApiService.getAllCourseLevels(),
      adminApiService.getAllCategories()
    ]);

    const normalize = (data) => {
      if (Array.isArray(data)) return data;
      if (data?.items) return data.items;
      if (data?.data) return data.data;
      return [];
    };

    setCourseTypes(normalize(courseTypesData));
    setCourseLevels(normalize(courseLevelsData));
    setCategories(normalize(categoriesData));
  } catch (err) {
    console.error('Dropdown load error:', err);
    setBadgesError('Failed to load dropdown data');
  } finally {
    // Only set loading to false if badges are not loading
    // This prevents interfering with the main badge loading state
    if (!loadingBadges) {
      setLoadingBadges(false);
    }
  }
}, []);


const loadData = useCallback(async (page = 1, pageSize = 100) => {
  try {
    setLoadingBadges(true);
    setBadgesError(null);

    // Build query parameters for pagination
    const filters = { page, pageSize };
    
    const response = await getAllCourseBadgesNew(filters);
    
    // Use the structured response from the API
    setBadges(response.items || []);
    setBadgePagination(prev => ({
      ...prev,
      page: response.page || page,
      pageSize: response.pageSize || pageSize,
      totalCount: response.totalCount || 0,
      totalPages: response.totalPages || 0
    }));
  } catch (err) {
    setBadgesError(err.message || 'Failed to load data');
    setBadges([]);
  } finally {
    setLoadingBadges(false);
  }
}, [getAllCourseBadgesNew]);
const loadCourses = useCallback(async (filters = {}) => {
  try {
    setLoadingCourse(true);
    setCourseError(null);

    const coursesResponse =
      await adminApiService.getAllCoursesAdminNoPagination(filters);

    let coursesArray = [];
    if (coursesResponse?.items) coursesArray = coursesResponse.items;
    else if (coursesResponse?.data?.items) coursesArray = coursesResponse.data.items;
    else if (Array.isArray(coursesResponse)) coursesArray = coursesResponse;

    const mappedCourses = coursesArray.map(course => ({
      id: course.id,
      title: course.title || course.name,
      name: course.name || course.title,
      categoryId: course.categoryId,
      courseTypeId: course.courseTypeId,
      courseLevelId: course.courseLevelId,
      instructor: course.instructor,
      description: course.description,
      courseBadges: course.courseBadges || []
    }));

    setCourses(mappedCourses);
  } catch (err) {
    setCourseError(err.message || 'Failed to load courses');
    setCourses([]);
  } finally {
    setLoadingCourse(false);
  }
}, []);

const loadCoursesWithFilters = useCallback(async (filters = {}) => {
  return await loadCourses(filters);
}, [loadCourses]);

  const loadCareerPaths = useCallback(async (params = {}) => {
    try {
      setLoadingCareerPaths(true);
      setCareerPathsError(null);

      const careerPathsResponse = await adminApiService.getAllCareerPaths(params);
      let careerPathsArray = [];
      if (careerPathsResponse?.items) careerPathsArray = careerPathsResponse.items;
      else if (careerPathsResponse?.data?.items) careerPathsArray = careerPathsResponse.data.items;
      else if (Array.isArray(careerPathsResponse)) careerPathsArray = careerPathsResponse;
      else if (careerPathsResponse?.data && Array.isArray(careerPathsResponse.data)) careerPathsArray = careerPathsResponse.data;

      const mapped = careerPathsArray.map((cp) => ({
        id: cp.id,
        name: cp.name || cp.title,
        title: cp.title || cp.name,
        description: cp.description,
        careerPathBadges: cp.careerPathBadges || []
      }));

      setCareerPaths(mapped);
      return mapped;
    } catch (err) {
      setCareerPathsError(err.message || 'Failed to load career paths');
      setCareerPaths([]);
      throw err;
    } finally {
      setLoadingCareerPaths(false);
    }
  }, []);


  // Initial load - only run once on mount
  useEffect(() => {
    // Load both badges and dropdowns in parallel
    const loadInitialData = async () => {
      try {
        setLoadingBadges(true);
        setBadgesError(null);

        // Load badges and dropdowns in parallel for better performance
        const [badgesResponse, courseTypesData, courseLevelsData, categoriesData] = await Promise.all([
          getAllCourseBadgesNew({ page: 1, pageSize: 100 }),
          adminApiService.getAllCourseTypes(),
          adminApiService.getAllCourseLevels(),
          adminApiService.getAllCategories()
        ]);

        // Process badges response
        setBadges(badgesResponse.items || []);
        setBadgePagination({
          page: badgesResponse.page || 1,
          pageSize: badgesResponse.pageSize || 100,
          totalCount: badgesResponse.totalCount || 0,
          totalPages: badgesResponse.totalPages || 0
        });

        // Process dropdown data
        const normalize = (data) => {
          if (Array.isArray(data)) return data;
          if (data?.items) return data.items;
          if (data?.data) return data.data;
          return [];
        };

        setCourseTypes(normalize(courseTypesData));
        setCourseLevels(normalize(courseLevelsData));
        setCategories(normalize(categoriesData));

      } catch (err) {
        console.error('Initial load error:', err);
        setBadgesError('Failed to load data');
        setBadges([]);
      } finally {
        setLoadingBadges(false);
      }
    };

    loadInitialData();
  }, [getAllCourseBadgesNew]); // Add dependency

  // Create badge
  const createBadge = useCallback(async (badgeData) => {
    try {
      const newBadge = await adminApiService.createCourseBadge(badgeData);
      setBadges(prev => [newBadge, ...prev]);
      setShowCreateModal(false);
      resetForm();
      return newBadge;
    } catch (err) {
      setBadgesError(err.message || 'Failed to create badge');
      throw err;
    }
  }, []);

  // Update badge
  const updateBadge = useCallback(async (badgeId, badgeData) => {
    try {
      // Get existing badge to preserve fields that aren't being updated
      const existingBadge = badges.find(b => b.id === badgeId);
      if (!existingBadge) {
        throw new Error('Badge not found');
      }
      
      // Prepare the complete request body as expected by the API
      const updateData = {
        id: existingBadge.id,
        badgeKey: badgeData.badgeKey || existingBadge.badgeKey,
        badgeName: badgeData.badgeName || existingBadge.badgeName,
        badgeColor: badgeData.badgeColor || existingBadge.badgeColor,
        badgeIcon: badgeData.badgeIcon || existingBadge.badgeIcon,
        description: badgeData.description || existingBadge.description,
        isActive: badgeData.isActive !== undefined ? badgeData.isActive : existingBadge.isActive,
        isDeleted: existingBadge.isDeleted || false,
        createdAt: existingBadge.createdAt,
        createdBy: existingBadge.createdBy,
        updatedAt: new Date().toISOString(),
        updatedBy: existingBadge.updatedBy,
        slug: existingBadge.slug,
        courseIds: existingBadge.courseIds || []
      };
      
      const updatedBadge = await adminApiService.updateCourseBadge(badgeId, updateData);
      setBadges(prev => 
        prev.map(badge => 
          badge.id === badgeId ? updatedBadge : badge
        )
      );
      setShowEditModal(false);
      setSelectedBadge(null);
      return updatedBadge;
    } catch (err) {
      setBadgesError(err.message || 'Failed to update badge');
      throw err;
    }
  }, [badges]);

  // Delete badge
  const deleteBadge = useCallback(async (badgeId) => {
    try {
      await adminApiService.deleteCourseBadge(badgeId);
      setBadges(prev => prev.filter(badge => badge.id !== badgeId));
    } catch (err) {
      setBadgesError(err.message || 'Failed to delete badge');
      throw err;
    }
  }, []);

  // Get badge by ID
  const getBadgeById = useCallback(async (badgeId) => {
    try {
      return await adminApiService.getCourseBadgeById(badgeId);
    } catch (err) {
      setBadgesError(err.message || 'Failed to get badge');
      throw err;
    }
  }, []);

  // Assign courses to badge
  const assignCoursesToBadge = useCallback(async (badgeId, selectedCourseIds) => {
    try {
      // Get existing badge data
      const existingBadge = badges.find(b => b.id === badgeId);
      if (!existingBadge) {
        throw new Error('Badge not found');
      }
      
      const existingCourseIds = existingBadge.courseIds || [];
      
      // Calculate final course IDs by adding new ones and removing deselected ones
      // selectedCourseIds contains both newly selected courses and courses to be deselected
      const finalCourseIds = existingCourseIds.filter(id => !selectedCourseIds.includes(id)) // Remove deselected
        .concat(selectedCourseIds.filter(id => !existingCourseIds.includes(id))); // Add new ones
      
      // Prepare the complete request body as expected by the API
      const updateData = {
        id: existingBadge.id,
        badgeKey: existingBadge.badgeKey,
        badgeName: existingBadge.badgeName,
        badgeColor: existingBadge.badgeColor,
        badgeIcon: existingBadge.badgeIcon,
        description: existingBadge.description,
        isActive: existingBadge.isActive,
        isDeleted: existingBadge.isDeleted || false,
        createdAt: existingBadge.createdAt,
        createdBy: existingBadge.createdBy,
        updatedAt: new Date().toISOString(),
        updatedBy: existingBadge.updatedBy,
        slug: existingBadge.slug,
        courseIds: finalCourseIds,
        categoryIds: existingBadge.categoryIds || [],
        careerPathIds: existingBadge.careerPathIds || []
      };
      
      // Update the badge with complete data
      const updatedBadge = await adminApiService.updateCourseBadge(badgeId, updateData);
      
      // Update local state with the API response to ensure consistency
      setBadges(prev => 
        prev.map(badge => 
          badge.id === badgeId ? updatedBadge : badge
        )
      );
      
      return updatedBadge;
    } catch (err) {
      setBadgesError(err.message || 'Failed to assign courses to badge');
      console.error('Course assignment error:', err);
      throw err;
    }
  }, [badges]);

  // Get courses for a specific badge
  const getBadgeCourses = useCallback((badgeId) => {
    const badge = badges.find(b => b.id === badgeId);
    return badge ? badge.courseIds || [] : [];
  }, [badges]);

  const assignCategoriesToBadge = useCallback(async (badgeId, selectedCategoryIds) => {
    try {
      const existingBadge = badges.find(b => b.id === badgeId);
      if (!existingBadge) {
        throw new Error('Badge not found');
      }

      const existingCategoryIds = existingBadge.categoryIds || [];
      const finalCategoryIds = existingCategoryIds.filter(id => !selectedCategoryIds.includes(id))
        .concat(selectedCategoryIds.filter(id => !existingCategoryIds.includes(id)));

      const updateData = {
        id: existingBadge.id,
        badgeKey: existingBadge.badgeKey,
        badgeName: existingBadge.badgeName,
        badgeColor: existingBadge.badgeColor,
        badgeIcon: existingBadge.badgeIcon,
        description: existingBadge.description,
        isActive: existingBadge.isActive,
        isDeleted: existingBadge.isDeleted || false,
        createdAt: existingBadge.createdAt,
        createdBy: existingBadge.createdBy,
        updatedAt: new Date().toISOString(),
        updatedBy: existingBadge.updatedBy,
        slug: existingBadge.slug,
        courseIds: existingBadge.courseIds || [],
        categoryIds: finalCategoryIds,
        careerPathIds: existingBadge.careerPathIds || []
      };

      const updatedBadge = await adminApiService.updateCourseBadge(badgeId, updateData);
      setBadges(prev => prev.map(b => (b.id === badgeId ? updatedBadge : b)));
      return updatedBadge;
    } catch (err) {
      setBadgesError(err.message || 'Failed to assign categories to badge');
      console.error('Category assignment error:', err);
      throw err;
    }
  }, [badges]);

  const getBadgeCategories = useCallback((badgeId) => {
    const badge = badges.find(b => b.id === badgeId);
    return badge ? badge.categoryIds || [] : [];
  }, [badges]);

  const assignCareerPathsToBadge = useCallback(async (badgeId, selectedCareerPathIds) => {
    try {
      const existingBadge = badges.find(b => b.id === badgeId);
      if (!existingBadge) {
        throw new Error('Badge not found');
      }

      const existingCareerPathIds = existingBadge.careerPathIds || [];
      const finalCareerPathIds = existingCareerPathIds.filter(id => !selectedCareerPathIds.includes(id))
        .concat(selectedCareerPathIds.filter(id => !existingCareerPathIds.includes(id)));

      const updateData = {
        id: existingBadge.id,
        badgeKey: existingBadge.badgeKey,
        badgeName: existingBadge.badgeName,
        badgeColor: existingBadge.badgeColor,
        badgeIcon: existingBadge.badgeIcon,
        description: existingBadge.description,
        isActive: existingBadge.isActive,
        isDeleted: existingBadge.isDeleted || false,
        createdAt: existingBadge.createdAt,
        createdBy: existingBadge.createdBy,
        updatedAt: new Date().toISOString(),
        updatedBy: existingBadge.updatedBy,
        slug: existingBadge.slug,
        courseIds: existingBadge.courseIds || [],
        categoryIds: existingBadge.categoryIds || [],
        careerPathIds: finalCareerPathIds
      };

      const updatedBadge = await adminApiService.updateCourseBadge(badgeId, updateData);
      setBadges(prev => prev.map(b => (b.id === badgeId ? updatedBadge : b)));
      return updatedBadge;
    } catch (err) {
      setBadgesError(err.message || 'Failed to assign career paths to badge');
      console.error('Career path assignment error:', err);
      throw err;
    }
  }, [badges]);

  const getBadgeCareerPaths = useCallback((badgeId) => {
    const badge = badges.find(b => b.id === badgeId);
    return badge ? badge.careerPathIds || [] : [];
  }, [badges]);

  // Get unassigned courses for a badge
  const getUnassignedCourses = useCallback((badgeId) => {
    const assignedCourseIds = getBadgeCourses(badgeId);
    return courses.filter(course => !assignedCourseIds.includes(course.id));
  }, [courses, getBadgeCourses]);
  const resetForm = useCallback(() => {
    setFormData({
      badgeKey: '',
      badgeName: '',
      badgeColor: '#3B82F6',
      badgeIcon: '',
      description: '',
      isActive: true,
      courseIds: []
    });
  }, []);

  const handleInputChange = useCallback((e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  }, []);
const openCreateModal = useCallback(async () => {
  resetForm();
  await Promise.all([
  
  ]);
  setShowCreateModal(true);
}, [resetForm]);



const openEditModal = useCallback(async (badge) => {
  setSelectedBadge(badge);

  setFormData({
    badgeKey: badge.badgeKey || '',
    badgeName: badge.badgeName || '',
    badgeColor: badge.badgeColor || '#3B82F6',
    badgeIcon: badge.badgeIcon || '',
    description: badge.description || '',
    isActive: badge.isActive ?? true,
    courseIds: badge.courseIds || []
  });

  await Promise.all([
  
  ]);

  setShowEditModal(true);
}, []);



const openCourseAssignmentModal = useCallback(async (badge) => {
  setSelectedBadge(badge);
  // Don't load courses automatically - wait for user to apply filters
  setShowCourseAssignmentModal(true);
}, []);

  const openCategoryAssignmentModal = useCallback(async (badge) => {
    setSelectedBadge(badge);
    setShowCategoryAssignmentModal(true);
  }, []);

  const openCareerPathAssignmentModal = useCallback(async (badge) => {
    setSelectedBadge(badge);
    if (!careerPaths || careerPaths.length === 0) {
      try {
        await loadCareerPaths();
      } catch {
        // errors handled by hook state
      }
    }
    setShowCareerPathAssignmentModal(true);
  }, [careerPaths, loadCareerPaths]);


  const closeModals = useCallback(() => {
    setShowCreateModal(false);
    setShowEditModal(false);
    setShowCourseAssignmentModal(false);
    setShowCategoryAssignmentModal(false);
    setShowCareerPathAssignmentModal(false);
    setSelectedBadge(null);
    resetForm();
  }, [resetForm]);

  // Clear error
  const clearError = useCallback(() => {
    setBadgesError(null);
  }, []);

  // Pagination helper functions
  const goToBadgePage = useCallback((page) => {
    if (page >= 1 && page <= badgePagination.totalPages) {
      loadData(page, badgePagination.pageSize);
    }
  }, [loadData, badgePagination.pageSize, badgePagination.totalPages]);

  const nextBadgePage = useCallback(() => {
    if (badgePagination.page < badgePagination.totalPages) {
      goToBadgePage(badgePagination.page + 1);
    }
  }, [badgePagination, goToBadgePage]);

  const prevBadgePage = useCallback(() => {
    if (badgePagination.page > 1) {
      goToBadgePage(badgePagination.page - 1);
    }
  }, [badgePagination, goToBadgePage]);

  const setBadgePageSize = useCallback((newPageSize) => {
    loadData(1, newPageSize);
  }, [loadData]);

  return {
    // Data
    badges,
    courses,
    setCourses,
    courseTypes,
    courseLevels,
    categories,
    careerPaths,
    loadingBadges,
    badgesError,
    loadingcourse,
    loadingCareerPaths,
    Courseerror,
    careerPathsError,
    selectedBadge,
    showCreateModal,
    showEditModal,
    showCourseAssignmentModal,
    showCategoryAssignmentModal,
    showCareerPathAssignmentModal,
    formData,
    badgePagination,

    // Actions
    loadCoursesWithFilters,
    loadCareerPaths,
    loadData,
    createBadge,
    updateBadge,
    deleteBadge,
    getBadgeById,
    assignCoursesToBadge,
    getBadgeCourses,
    getUnassignedCourses,
    assignCategoriesToBadge,
    getBadgeCategories,
    assignCareerPathsToBadge,
    getBadgeCareerPaths,

    // Pagination actions
    goToBadgePage,
    nextBadgePage,
    prevBadgePage,
    setBadgePageSize,

    // Form handlers
    handleInputChange,
    resetForm,

    // Modal handlers
    openCreateModal,
    openEditModal,
    openCourseAssignmentModal,
    openCategoryAssignmentModal,
    openCareerPathAssignmentModal,
    closeModals,

    // Utilities
    clearError
  };
};
