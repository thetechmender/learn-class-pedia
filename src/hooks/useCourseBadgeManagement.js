import { useState, useEffect, useCallback } from 'react';
import { adminApiService } from '../services/AdminApi';

export const useCourseBadgeManagement = () => {
  const [badges, setBadges] = useState([]);
  const [courses, setCourses] = useState([]);
  const [courseTypes, setCourseTypes] = useState([]);
  const [courseLevels, setCourseLevels] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedBadge, setSelectedBadge] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showCourseAssignmentModal, setShowCourseAssignmentModal] = useState(false);
  const [formData, setFormData] = useState({
    badgeKey: '',
    badgeName: '',
    badgeColor: '#3B82F6',
    badgeIcon: '🏆',
    description: '',
    isActive: true,
    courseIds: []
  });

  // Load initial data
  const loadData = useCallback(async (filters = {}) => {
    try {
      setLoading(true);
      setError(null);
      
      const [badgesData, coursesResponse, courseTypesData, courseLevelsData, categoriesData] = await Promise.all([
        adminApiService.getAllCourseBadgesNew(),
        adminApiService.getAllCoursesAdminNoPagination(filters),
        adminApiService.getAllCourseTypes(),
        adminApiService.getAllCourseLevels(),
        adminApiService.getAllCategories()
      ]);
      
      console.log('Badges response:', badgesData);
      console.log('Courses response with filters:', coursesResponse);
      console.log('Course types response:', courseTypesData);
      console.log('Course levels response:', courseLevelsData);
      console.log('Categories response:', categoriesData);
      
      // Handle badges data
      const badgesArray = Array.isArray(badgesData) ? badgesData : [];
      
      // Handle courses response structure - items is directly in the response
      let coursesArray = [];
      if (coursesResponse && coursesResponse.items) {
        coursesArray = coursesResponse.items;
      } else if (coursesResponse && coursesResponse.data && coursesResponse.data.items) {
        coursesArray = coursesResponse.data.items;
      } else if (Array.isArray(coursesResponse)) {
        coursesArray = coursesResponse;
      }
      
      coursesArray = Array.isArray(coursesArray) ? coursesArray : [];
      
      // Handle filter options
      let courseTypesArray = [];
      let courseLevelsArray = [];
      let categoriesArray = [];
      
      // Handle course types response
      if (courseTypesData) {
        if (Array.isArray(courseTypesData)) {
          courseTypesArray = courseTypesData;
        } else if (courseTypesData.items && Array.isArray(courseTypesData.items)) {
          courseTypesArray = courseTypesData.items;
        } else if (courseTypesData.data && Array.isArray(courseTypesData.data)) {
          courseTypesArray = courseTypesData.data;
        }
      }
      
      // Handle course levels response
      if (courseLevelsData) {
        if (Array.isArray(courseLevelsData)) {
          courseLevelsArray = courseLevelsData;
        } else if (courseLevelsData.items && Array.isArray(courseLevelsData.items)) {
          courseLevelsArray = courseLevelsData.items;
        } else if (courseLevelsData.data && Array.isArray(courseLevelsData.data)) {
          courseLevelsArray = courseLevelsData.data;
        }
      }
      
      // Handle categories response
      if (categoriesData) {
        if (Array.isArray(categoriesData)) {
          categoriesArray = categoriesData;
        } else if (categoriesData.items && Array.isArray(categoriesData.items)) {
          categoriesArray = categoriesData.items;
        } else if (categoriesData.data && Array.isArray(categoriesData.data)) {
          categoriesArray = categoriesData.data;
        }
      }
      
      console.log('Processed course types:', courseTypesArray);
      console.log('Processed course levels:', courseLevelsArray);
      console.log('Processed categories:', categoriesArray);
      
      // Map course data to match expected structure
      const mappedCourses = coursesArray.map(course => ({
        id: course.id,
        name: course.title || course.name,
        title: course.title,
        subtitle: course.subtitle,
        description: course.description,
        instructor: course.instructor || 'Unknown Instructor',
        category: course.categoryName || course.category || 'Uncategorized',
        courseLevel: course.courseLevelName,
        courseType: course.courseTypeName,
        price: course.price,
        discountedPrice: course.discountedPrice,
        isPaid: course.isPaid,
        thumbnail: course.thumbnailUrl,
        promoVideoUrl: course.promoVideoUrl,
        languageCode: course.languageCode,
        courseBadges: course.courseBadges || [],
        courseTypeId: course.courseTypeId,
        courseLevelId: course.courseLevelId,
        categoryId: course.categoryId
      }));
      
      setBadges(badgesArray);
      setCourses(mappedCourses);
      setCourseTypes(courseTypesArray);
      setCourseLevels(courseLevelsArray);
      setCategories(categoriesArray);
      
      console.log('Final badges array:', badgesArray);
      console.log('Final mapped courses array:', mappedCourses);
      console.log('Final course types array:', courseTypesArray);
      console.log('Final course levels array:', courseLevelsArray);
      console.log('Final categories array:', categoriesArray);
    } catch (err) {
      setError(err.message || 'Failed to load badge data');
      console.error('Error loading badge data:', err);
      // Set empty arrays on error to prevent map errors
      setBadges([]);
      setCourses([]);
      setCourseTypes([]);
      setCourseLevels([]);
      setCategories([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial load
  useEffect(() => {
    loadData();
  }, [loadData]);

  // Create badge
  const createBadge = useCallback(async (badgeData) => {
    try {
      const newBadge = await adminApiService.createCourseBadge(badgeData);
      setBadges(prev => [newBadge, ...prev]);
      setShowCreateModal(false);
      resetForm();
      return newBadge;
    } catch (err) {
      setError(err.message || 'Failed to create badge');
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
      
      console.log('Updating badge:', {
        badgeId,
        badgeData,
        updateData
      });
      
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
      setError(err.message || 'Failed to update badge');
      console.error('Badge update error:', err);
      throw err;
    }
  }, [badges]);

  // Delete badge
  const deleteBadge = useCallback(async (badgeId) => {
    try {
      await adminApiService.deleteCourseBadge(badgeId);
      setBadges(prev => prev.filter(badge => badge.id !== badgeId));
    } catch (err) {
      setError(err.message || 'Failed to delete badge');
      throw err;
    }
  }, []);

  // Get badge by ID
  const getBadgeById = useCallback(async (badgeId) => {
    try {
      return await adminApiService.getCourseBadgeById(badgeId);
    } catch (err) {
      setError(err.message || 'Failed to get badge');
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
      
      console.log('Updating courses for badge:', {
        badgeId,
        existingCourseIds,
        selectedCourseIds,
        finalCourseIds
      });
      
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
        courseIds: finalCourseIds
      };
      
      // Update the badge with complete data
      const updatedBadge = await adminApiService.updateCourseBadge(badgeId, updateData);
      
      console.log('API Response - Updated badge:', updatedBadge);
      console.log('Course count from API:', updatedBadge.courseIds?.length || 0);
      
      // Update local state with the API response to ensure consistency
      setBadges(prev => 
        prev.map(badge => 
          badge.id === badgeId ? updatedBadge : badge
        )
      );
      
      return updatedBadge;
    } catch (err) {
      setError(err.message || 'Failed to assign courses to badge');
      console.error('Course assignment error:', err);
      throw err;
    }
  }, [badges]);

  // Get courses for a specific badge
  const getBadgeCourses = useCallback((badgeId) => {
    const badge = badges.find(b => b.id === badgeId);
    return badge ? badge.courseIds || [] : [];
  }, [badges]);

  // Get unassigned courses for a badge
  const getUnassignedCourses = useCallback((badgeId) => {
    const assignedCourseIds = getBadgeCourses(badgeId);
    return courses.filter(course => !assignedCourseIds.includes(course.id));
  }, [courses, getBadgeCourses]);

  // Load courses with filters
  const loadCoursesWithFilters = useCallback(async (filters = {}) => {
    try {
      setLoading(true);
      setError(null);
      
      const coursesResponse = await adminApiService.getAllCoursesAdminNoPagination(filters);
      
      // Handle courses response structure - items is directly in the response
      let coursesArray = [];
      if (coursesResponse && coursesResponse.items) {
        coursesArray = coursesResponse.items;
      } else if (coursesResponse && coursesResponse.data && coursesResponse.data.items) {
        coursesArray = coursesResponse.data.items;
      } else if (Array.isArray(coursesResponse)) {
        coursesArray = coursesResponse;
      }
      
      coursesArray = Array.isArray(coursesArray) ? coursesArray : [];
      
      // Map course data to match expected structure
      const mappedCourses = coursesArray.map(course => ({
        id: course.id,
        name: course.title || course.name,
        title: course.title,
        subtitle: course.subtitle,
        description: course.description,
        instructor: course.instructor || 'Unknown Instructor',
        category: course.categoryName || course.category || 'Uncategorized',
        courseLevel: course.courseLevelName,
        courseType: course.courseTypeName,
        price: course.price,
        discountedPrice: course.discountedPrice,
        isPaid: course.isPaid,
        thumbnail: course.thumbnailUrl,
        promoVideoUrl: course.promoVideoUrl,
        languageCode: course.languageCode,
        courseBadges: course.courseBadges || [],
        courseTypeId: course.courseTypeId,
        courseLevelId: course.courseLevelId,
        categoryId: course.categoryId
      }));
      
      setCourses(mappedCourses);
    } catch (err) {
      setError(err.message || 'Failed to load filtered courses');
      setCourses([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Form handlers
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

  // Modal handlers
  const openCreateModal = useCallback(() => {
    resetForm();
    setShowCreateModal(true);
  }, [resetForm]);

  const openEditModal = useCallback((badge) => {
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
    setShowEditModal(true);
  }, []);

  const openCourseAssignmentModal = useCallback((badge) => {
    setSelectedBadge(badge);
    setShowCourseAssignmentModal(true);
  }, []);

  const closeModals = useCallback(() => {
    setShowCreateModal(false);
    setShowEditModal(false);
    setShowCourseAssignmentModal(false);
    setSelectedBadge(null);
    resetForm();
  }, [resetForm]);

  // Clear error
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    // Data
    badges,
    courses,
    courseTypes,
    courseLevels,
    categories,
    loading,
    error,
    selectedBadge,
    showCreateModal,
    showEditModal,
    showCourseAssignmentModal,
    formData,
    
    // Actions
    loadData,
    loadCoursesWithFilters,
    createBadge,
    updateBadge,
    deleteBadge,
    getBadgeById,
    assignCoursesToBadge,
    getBadgeCourses,
    getUnassignedCourses,
    
    // Form handlers
    handleInputChange,
    resetForm,
    
    // Modal handlers
    openCreateModal,
    openEditModal,
    openCourseAssignmentModal,
    closeModals,
    
    // Utilities
    clearError
  };
};
