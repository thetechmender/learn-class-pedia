import { useState, useEffect, useCallback } from 'react';
import ApiService from '../../services/ApiService';

export const useBadgeManagement = () => {
  const [badges, setBadges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Pagination state
  const [pagination, setPagination] = useState({
    page: 1,
    pageSize: 100,
    totalCount: 0,
    totalPages: 0
  });
  
  // Modal states
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedBadge, setSelectedBadge] = useState(null);
  
  // Form data
  const [formData, setFormData] = useState({
    id: 0,
    badgeKey: '',
    badgeName: '',
    badgeColor: '#0062F7',
    badgeIcon: '',
    description: '',
    createdBy: null,
    updatedBy: null,
  });

  // Fetch all badges with pagination
  const fetchBadges = useCallback(async (page = 1, pageSize = 100) => {
    try {
      setLoading(true);
      setError(null);
      const response = await ApiService.getAllBadges(page, pageSize);
      
      // Handle the response structure from the backend
      if (response && response.items) {
        setBadges(response.items);
        setPagination(prev => ({
          ...prev,
          page: response.page || page,
          totalCount: response.totalCount || response.items.length,
          pageSize: response.pageSize || pageSize,
          totalPages: Math.ceil((response.totalCount || response.items.length) / (response.pageSize || pageSize))
        }));
      } else if (Array.isArray(response)) {
        // Fallback for direct array response
        setBadges(response);
        setPagination(prev => ({
          ...prev,
          page: page,
          totalCount: response.length,
          pageSize: pageSize,
          totalPages: Math.ceil(response.length / pageSize)
        }));
      }
    } catch (err) {
      setError(err.message || 'Failed to fetch badges');
      setBadges([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Create new badge
  const createBadge = useCallback(async (badgeData) => {
    try {
      const response = await ApiService.createBadge(badgeData);
      await fetchBadges(pagination.page, pagination.pageSize);
      return response;
    } catch (err) {
      throw err;
    }
  }, [fetchBadges, pagination.page, pagination.pageSize]);

  // Update badge
  const updateBadge = useCallback(async (badgeId, badgeData) => {
    try {
      const response = await ApiService.updateBadge(badgeId, badgeData);
      await fetchBadges(pagination.page, pagination.pageSize);
      return response;
    } catch (err) {
      throw err;
    }
  }, [fetchBadges, pagination.page, pagination.pageSize]);

  // Delete badge
  const deleteBadge = useCallback(async (badgeId) => {
    try {
      const response = await ApiService.deleteBadge(badgeId);
      await fetchBadges(pagination.page, pagination.pageSize);
      return response;
    } catch (err) {
      throw err;
    }
  }, [fetchBadges, pagination.page, pagination.pageSize]);

  // Get badge by ID
  const getBadgeById = useCallback(async (badgeId) => {
    try {
      const response = await ApiService.getBadgeById(badgeId);
      return response;
    } catch (err) {
      throw err;
    }
  }, []);

  // Reset form data
  const resetForm = useCallback(() => {
    setFormData({
      id: 0,
      badgeKey: '',
      badgeName: '',
      badgeColor: '#0062F7',
      badgeIcon: '',
      description: '', 
      createdBy: null,
      updatedBy: null,
    });
    setSelectedBadge(null);
  }, []);

  // Handle form input changes
  const handleInputChange = useCallback((field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  }, []);

  // Open create modal
  const openCreateModal = useCallback(() => {
    resetForm();
    setShowCreateModal(true);
  }, [resetForm]);

  // Open edit modal
  const openEditModal = useCallback(async (badge) => {
    try {
      const badgeDetails = await getBadgeById(badge.id);
      setSelectedBadge(badgeDetails);
      setFormData({
        id: badgeDetails.id || 0,
        badgeKey: badgeDetails.badgeKey || '',
        badgeName: badgeDetails.badgeName || '',
        badgeColor: badgeDetails.badgeColor || '#0062F7',
        badgeIcon: badgeDetails.badgeIcon || '',
        description: badgeDetails.description || '',
        createdBy: badgeDetails.createdBy || null,
        updatedBy: badgeDetails.updatedBy || null,
        slug: badgeDetails.slug || ''
      });
      setShowEditModal(true);
    } catch (err) {
      console.error('Failed to fetch badge details:', err);
    }
  }, [getBadgeById]);

  // Close modals
  const closeCreateModal = useCallback(() => {
    setShowCreateModal(false);
    resetForm();
  }, [resetForm]);

  const closeEditModal = useCallback(() => {
    setShowEditModal(false);
    resetForm();
  }, [resetForm]);

  // Handle page change
  const handlePageChange = useCallback((newPage) => {
    if (newPage >= 1 && newPage <= pagination.totalPages) {
      fetchBadges(newPage, pagination.pageSize);
    }
  }, [fetchBadges, pagination.pageSize, pagination.totalPages]);

  // Handle page size change
  const handlePageSizeChange = useCallback((newPageSize) => {
    fetchBadges(1, newPageSize);
  }, [fetchBadges]);

  // Badge assignment methods
  const getBadgeAssignments = useCallback(async (badgeId, typeId) => {
    try {
      // First get the assigned IDs - API returns array directly
      const assignedIds = await ApiService.getBadgeAssignments(badgeId, typeId);
      
      
      
      if (assignedIds && Array.isArray(assignedIds) && assignedIds.length > 0) {
        let allItems;
        
        // Get all items without pagination
        switch(typeId) {
          case 1:
            // Use no-pagination method for courses
            allItems = await ApiService.getAllCoursesAdminNoPagination();
            break;
          case 2:
            // Use no-pagination method for categories
            allItems = await ApiService.getAllCategories();
            break;
          case 3:
            // Use no-pagination method for career paths
            allItems = await ApiService.getAllCareerPaths();
            break;
          default:
            allItems = await ApiService.getAllCoursesAdminNoPagination();
        }
        
        const items = allItems.items || allItems || [];
        
        // Filter to get only assigned items with full details
        const assignedItemsDetails = items.filter(item => assignedIds.includes(item.id));
        
       
        
        return assignedItemsDetails;
      }
      
      // Return empty array if no assignments
      return [];
    } catch (err) {
      console.error('Failed to fetch badge assignments:', err);
      return [];
    }
  }, []);

  const getAllBadgeAssignments = useCallback(async (badgeId) => {
    try {
      return await ApiService.getAllBadgeAssignments(badgeId);
    } catch (err) {
      console.error('Failed to fetch all badge assignments:', err);
      return {
        courses: [],
        categories: [],
        careerPaths: []
      };
    }
  }, []);

  const assignBadgeToItems = useCallback(async (badgeId, typeId, assignedIds) => {
    try {
      await ApiService.assignBadge(badgeId, typeId, assignedIds);
      return true;
    } catch (err) {
      console.error('Failed to assign badge:', err);
      throw err;
    }
  }, []);

  const getAvailableItems = useCallback(async (type, searchTerm = '', selectedIds = [], courseTypeId = 0) => {
    try {
      let allItems;
      
      // Get all items with search if provided
      switch(type) {
        case 'course':
          // Use getAllCoursesAdminNoPagination with Title and CourseTypeId parameters
          const filters = { Title: searchTerm };
          if (courseTypeId && courseTypeId !== 0) {
            filters.CourseTypeId = courseTypeId;
          }
          allItems = await ApiService.getAllCoursesAdminNoPagination(filters);
          break;
        case 'category':
          // Use getAllCategories with search parameter
          allItems = await ApiService.getAllCategories(1, 1000, searchTerm ? `name=${searchTerm}` : '');
          break;
        case 'career':
          // Use getAllCareerPaths with search
          allItems = await ApiService.getAllCareerPaths({ Title: searchTerm });
          break;
        default:
          allItems = await ApiService.getAllCoursesAdminNoPagination({ title: searchTerm });
      }
      
      // Ensure we have an array
      const items = allItems.items || allItems || [];
      
      // Return all items (don't filter out selected ones)
      // The UI will handle marking selected items
      return items;
    } catch (err) {
      console.error('Failed to fetch available items:', err);
      return [];
    }
  }, []);

  // Initial fetch
  useEffect(() => {
    fetchBadges();
  }, [fetchBadges]);

  return {
    // Data
    badges,
    loading,
    error,
    pagination,
    
    // Form data
    formData,
    selectedBadge,
    
    // Modal states
    showCreateModal,
    showEditModal,
    
    // Actions
    fetchBadges,
    createBadge,
    updateBadge,
    deleteBadge,
    getBadgeById,
    resetForm,
    handleInputChange,
    
    // Modal actions
    openCreateModal,
    openEditModal,
    closeCreateModal,
    closeEditModal,
    
    // Pagination actions
    handlePageChange,
    handlePageSizeChange,
    
    // Assignment methods
    getBadgeAssignments,
    getAllBadgeAssignments,
    assignBadgeToItems,
    getAvailableItems
  };
};
