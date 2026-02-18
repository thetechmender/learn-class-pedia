import React, { useEffect, useState, useCallback } from 'react';
import { useBadgeManagement } from '../../../../hooks/useBadgeManagement';
import { useToast } from '../../../../hooks/useToast';
import {
  Award,
  Search,
  Plus,
  Edit,
  Trash2,
  X,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  Palette,
  Tag,
  CheckCircle,
  Users
} from 'lucide-react';

const FeaturedMarking = () => {
  const { showToast } = useToast();
  
  const {
    badges,
    loading,
    error,
    pagination,
    formData,
    showCreateModal,
    showEditModal,
    createBadge,
    updateBadge,
    deleteBadge,
    handleInputChange,
    openCreateModal,
    openEditModal,
    closeCreateModal,
    closeEditModal,
    handlePageChange,
    handlePageSizeChange,
    getBadgeAssignments,
    assignBadgeToItems,
    getAvailableItems
  } = useBadgeManagement();

  const [searchTerm, setSearchTerm] = useState('');
  const [formErrors, setFormErrors] = useState({});

  // Assignment modal state
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedBadge, setSelectedBadge] = useState(null);
  const [markingType, setMarkingType] = useState('type'); // course, category, career
  const [assignedItems, setAssignedItems] = useState([]);
  const [loadingAssignments, setLoadingAssignments] = useState(false);
  const [searchTermAssign, setSearchTermAssign] = useState('');
  const [availableItems, setAvailableItems] = useState([]);
  const [loadingAvailable, setLoadingAvailable] = useState(false);

  // Show success/error messages
  const showSuccess = useCallback((message) => showToast(message, 'success'), [showToast]);
  const showError = useCallback((message) => showToast(message, 'error'), [showToast]);

  // Handle form submission
  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();
    setFormErrors({});

    try {
      if (showEditModal && formData.id) {
        await updateBadge(formData.id, formData);
        showSuccess('Badge updated successfully!');
        closeEditModal();
      } else {
        await createBadge(formData);
        showSuccess('Badge created successfully!');
        closeCreateModal();
      }
    } catch (err) {
      const errorMessage = err.message || 'Failed to save badge';
      showError(errorMessage);
      setFormErrors({ submit: errorMessage });
    }
  }, [formData, showEditModal, updateBadge, createBadge, showSuccess, closeEditModal, closeCreateModal, showError]);

  // Handle delete
  const handleDelete = useCallback(async (badge) => {
    if (!window.confirm(`Are you sure you want to delete "${badge.badgeName}"?`)) {
      return;
    }

    try {
      await deleteBadge(badge.id);
      showSuccess('Badge deleted successfully!');
    } catch (err) {
      const errorMessage = err.message || 'Failed to delete badge';
      showError(errorMessage);
    }
  }, [deleteBadge, showSuccess, showError]);

  // Handle search
  const handleSearch = useCallback((e) => {
    setSearchTerm(e.target.value);
  }, []);

  // Filter badges based on search
  const filteredBadges = badges.filter(badge =>
    badge.badgeName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    badge.badgeKey?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    badge.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Handle pagination controls
  const goToPage = useCallback((page) => {
    handlePageChange(page);
  }, [handlePageChange]);

  const fetchAssignedItems = useCallback(async (badgeId, type) => {
    if (!type || type === 'type') {
      setAssignedItems([]);
      return;
    }

    setLoadingAssignments(true);
    try {
      const typeId = type === 'course' ? 1 : type === 'category' ? 2 : 3;
      const result = await getBadgeAssignments(badgeId, typeId);
      
      console.log('Assigned items result in component:', {
        badgeId,
        type,
        typeId,
        result,
        isArray: Array.isArray(result)
      });
      
      // Hook returns array directly, not object with items property
      setAssignedItems(result || []);
    } catch (err) {
      console.error('Failed to fetch assigned items:', err);
      setAssignedItems([]);
    } finally {
      setLoadingAssignments(false);
    }
  }, [getBadgeAssignments]);

  const handleOpenAssignModal = useCallback((badge) => {
    setSelectedBadge(badge);
    setMarkingType('type');
    setShowAssignModal(true);
    setAssignedItems([]);
    setSearchTermAssign(''); // Reset search when opening modal
    setAvailableItems([]); // Reset available items - will only show when user searches
  }, [fetchAssignedItems]);

  const handleCloseAssignModal = useCallback(() => {
    setShowAssignModal(false);
    setSelectedBadge(null);
    setMarkingType('type');
    setAssignedItems([]);
    setSearchTermAssign('');
    setAvailableItems([]);
  }, []);

  // Search available items
  const fetchAvailableItems = useCallback(async (type, searchTerm = '') => {
    console.log('Fetching available items:', {
      type,
      searchTerm,
      assignedIdsCount: assignedItems.length
    });
    
    if (!type || type === 'type') {
      setAvailableItems([]);
      return;
    }

    // Only fetch if there's a search term
    if (!searchTerm || searchTerm.trim() === '') {
      setAvailableItems([]);
      return;
    }
    
    setLoadingAvailable(true);
    try {
      // Get assigned IDs to filter by
      const assignedIds = assignedItems.map(item => item.id);
      
      const result = await getAvailableItems(type, searchTerm, assignedIds);
      console.log('Available items result:', {
        result,
        resultLength: result?.length || 0
      });
      
      setAvailableItems(result || []);
    } catch (err) {
      console.error('Failed to fetch available items:', err);
      setAvailableItems([]);
    } finally {
      setLoadingAvailable(false);
    }
  }, [getAvailableItems, assignedItems]);

  const handleMarkingTypeChange = useCallback((type) => {
    console.log('Type change triggered:', {
      newType: type,
      currentMarkingType: markingType,
      selectedBadgeId: selectedBadge?.id
    });
    
    setMarkingType(type);
    setAssignedItems([]);
    setAvailableItems([]); // Clear available items when switching types
    setSearchTermAssign(''); // Clear search when switching types

    if (selectedBadge && type !== 'type') {
      fetchAssignedItems(selectedBadge.id, type);
    }
  }, [selectedBadge, fetchAssignedItems]);

  const toggleItemAssignment = useCallback((item) => {
    const isAssigned = assignedItems.some(assigned => assigned.id === item.id);
    
    if (isAssigned) {
      setAssignedItems(prev => prev.filter(assigned => assigned.id !== item.id));
    } else {
      setAssignedItems(prev => [...prev, item]);
    }
  }, [assignedItems]);

  const handleAssignBadge = useCallback(async () => {
    if (!selectedBadge || assignedItems.length === 0) {
      showError('Please select at least one item to assign');
      return;
    }

    try {
      if (!markingType || markingType === 'type') {
        showError('Please select a type of marking');
        return;
      }

      const typeId = markingType === 'course' ? 1 : markingType === 'category' ? 2 : 3;
      let convertedIds = assignedItems.map(item => item.id);
      
      // Convert IDs based on type requirements
      switch (typeId) {
        case 1: // Courses - use long IDs
          convertedIds = convertedIds.map(id => parseInt(id));
          break;
        case 2: // Categories - use int IDs
          convertedIds = convertedIds.map(id => parseInt(id));
          break;
        case 3: // Career Paths - use int IDs
          convertedIds = convertedIds.map(id => parseInt(id));
          break;
        default:
          throw new Error('Invalid type');
      }
      
      console.log('Assigning badge:', {
        badgeId: selectedBadge.id,
        typeId: typeId,
        originalIds: assignedItems.map(item => item.id),
        convertedIds: convertedIds
      });
      
      await assignBadgeToItems(selectedBadge.id, typeId, convertedIds);
      showSuccess(`Badge assigned to ${assignedItems.length} ${markingType}(s) successfully!`);
      handleCloseAssignModal();
    } catch (err) {
      showError('Failed to assign badge');
    }
  }, [selectedBadge, assignedItems, markingType, assignBadgeToItems, showSuccess, showError, handleCloseAssignModal]);

  // Load initial data when modal opens
  useEffect(() => {
    if (showAssignModal && selectedBadge && markingType !== 'type') {
      fetchAssignedItems(selectedBadge.id, markingType);
    }
  }, [showAssignModal, selectedBadge, markingType, fetchAssignedItems]);

  if (loading && badges.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-3 text-gray-600">Loading badges...</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header Section */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center">
                <Award className="w-8 h-8 text-blue-600 mr-3" />
                Featured Marking
              </h1>
              <p className="text-gray-600 mt-2">Manage and organize badges for featured content</p>
            </div>
            <button
              onClick={openCreateModal}
              className="flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              <Plus className="w-5 h-5 mr-2" />
              Create Badge
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Badges</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{badges.length}</p>
                <p className="text-xs text-gray-500 mt-1">All badges</p>
              </div>
              <div className="bg-blue-100 p-3 rounded-lg">
                <Award className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Badges</p>
                <p className="text-3xl font-bold text-green-600 mt-2">
                  {badges.filter(b => b.isActive).length}
                </p>
                <p className="text-xs text-gray-500 mt-1">Currently active</p>
              </div>
              <div className="bg-green-100 p-3 rounded-lg">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Inactive Badges</p>
                <p className="text-3xl font-bold text-gray-500 mt-2">
                  {badges.filter(b => !b.isActive).length}
                </p>
                <p className="text-xs text-gray-500 mt-1">Disabled</p>
              </div>
              <div className="bg-gray-100 p-3 rounded-lg">
                <X className="w-6 h-6 text-gray-500" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Unique Keys</p>
                <p className="text-3xl font-bold text-purple-600 mt-2">
                  {new Set(badges.map(b => b.badgeKey)).size}
                </p>
                <p className="text-xs text-gray-500 mt-1">Distinct types</p>
              </div>
              <div className="bg-purple-100 p-3 rounded-lg">
                <Tag className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Search and Filter Section */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search badges by name, key, or description..."
                value={searchTerm}
                onChange={handleSearch}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <span>{filteredBadges.length} of {badges.length} badges</span>
            </div>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="mb-8 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center">
            <AlertCircle className="w-5 h-5 text-red-600 mr-2" />
            <span className="text-red-700">{error}</span>
          </div>
        )}

        {/* Badges Grid */}
        {filteredBadges.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
            <div className="bg-gray-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
              <Award className="w-10 h-10 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No badges found</h3>
            <p className="text-gray-600 mb-6">
              {searchTerm ? 'Try adjusting your search terms' : 'Get started by creating your first badge'}
            </p>
            <button
              onClick={openCreateModal}
              className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="w-5 h-5 mr-2" />
              Create Badge
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredBadges.map((badge) => (
              <div
                key={badge.id}
                className="bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-lg transition-all duration-200 overflow-hidden group"
              >
                {/* Badge Header */}
                <div 
                  className="h-24 relative flex items-center justify-center"
                  style={{ 
                    background: `linear-gradient(135deg, ${badge.badgeColor || '#3B82F6'}20 0%, ${badge.badgeColor || '#3B82F6'}10 100%)`
                  }}
                >
                  <div className="text-center">
                    <div 
                      className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-2 shadow-lg"
                      style={{ backgroundColor: badge.badgeColor || '#3B82F6' }}
                    >
                      {badge.badgeIcon ? (
                        <span className="text-white text-2xl">{badge.badgeIcon}</span>
                      ) : (
                        <Award className="w-8 h-8 text-white" />
                      )}
                    </div>
                    <div className="flex items-center justify-center gap-1">
                      <span className={`px-2 py-1 text-xs rounded-full font-medium ${
                        badge.isActive
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-100 text-gray-600'
                      }`}>
                        {badge.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Badge Content */}
                <div className="p-6">
                  <h3 className="font-semibold text-gray-900 text-lg mb-2">{badge.badgeName}</h3>
                  <div className="flex items-center gap-2 mb-3">
                    <Tag className="w-4 h-4 text-gray-400" />
                    <span className="text-sm text-gray-600 font-mono">{badge.badgeKey}</span>
                  </div>
                  
                  <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                    {badge.description || 'No description available'}
                  </p>

                  {badge.badgeColor && (
                    <div className="flex items-center gap-2 mb-4">
                      <Palette className="w-4 h-4 text-gray-400" />
                      <div className="flex items-center gap-2">
                        <div 
                          className="w-6 h-6 rounded border border-gray-300"
                          style={{ backgroundColor: badge.badgeColor }}
                        />
                        <span className="text-xs text-gray-500">{badge.badgeColor}</span>
                      </div>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                    <div className="text-xs text-gray-500">
                      ID: {badge.id}
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => openEditModal(badge)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="Edit Badge"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleOpenAssignModal(badge)}
                        className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                        title="Assign Badge"
                      >
                        <Users className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(badge)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Delete Badge"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Enhanced Pagination */}
        {pagination.totalPages > 1 && (
          <div className="mt-8 bg-white rounded-xl shadow-sm border border-gray-200 px-6 py-4">
            <div className="flex flex-col lg:flex-row items-center justify-between gap-4">
              {/* Results Info */}
              <div className="text-sm text-gray-700">
                Showing {((pagination.page - 1) * pagination.pageSize) + 1} to{' '}
                {Math.min(pagination.page * pagination.pageSize, pagination.totalCount)} of{' '}
                {pagination.totalCount} badges
              </div>

              {/* Page Size Selector */}
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">Show:</span>
                <select
                  value={pagination.pageSize}
                  onChange={(e) => handlePageSizeChange(parseInt(e.target.value))}
                  className="text-sm border border-gray-300 rounded-md px-3 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value={10}>10</option>
                  <option value={20}>20</option>
                  <option value={50}>50</option>
                  <option value={100}>100</option>
                </select>
                <span className="text-sm text-gray-600">per page</span>
              </div>

              {/* Pagination Controls */}
              <div className="flex items-center gap-2">
                {/* Previous Button */}
                <button
                  onClick={() => goToPage(pagination.page - 1)}
                  disabled={pagination.page === 1}
                  className="p-2 border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  title="Previous Page"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>

                {/* Page Numbers */}
                <div className="flex items-center gap-1">
                  {/* First Page */}
                  {pagination.page > 3 && (
                    <>
                      <button
                        onClick={() => goToPage(1)}
                        className="px-3 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                      >
                        1
                      </button>
                      {pagination.page > 4 && (
                        <span className="px-2 text-gray-400">...</span>
                      )}
                    </>
                  )}

                  {/* Page Range */}
                  {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                    let pageNum;
                    if (pagination.totalPages <= 5) {
                      pageNum = i + 1;
                    } else if (pagination.page <= 3) {
                      pageNum = i + 1;
                    } else if (pagination.page >= pagination.totalPages - 2) {
                      pageNum = pagination.totalPages - 4 + i;
                    } else {
                      pageNum = pagination.page - 2 + i;
                    }
                    
                    return (
                      <button
                        key={pageNum}
                        onClick={() => goToPage(pageNum)}
                        className={`px-3 py-1 text-sm border rounded-md transition-colors ${
                          pageNum === pagination.page
                            ? 'bg-blue-600 text-white border-blue-600'
                            : 'border-gray-300 hover:bg-gray-50'
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}

                  {/* Last Page */}
                  {pagination.page < pagination.totalPages - 2 && (
                    <>
                      {pagination.page < pagination.totalPages - 3 && (
                        <span className="px-2 text-gray-400">...</span>
                      )}
                      <button
                        onClick={() => goToPage(pagination.totalPages)}
                        className="px-3 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                      >
                        {pagination.totalPages}
                      </button>
                    </>
                  )}
                </div>

                {/* Next Button */}
                <button
                  onClick={() => goToPage(pagination.page + 1)}
                  disabled={pagination.page === pagination.totalPages}
                  className="p-2 border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  title="Next Page"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>

              {/* Jump to Page */}
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">Go to page:</span>
                <input
                  type="number"
                  min="1"
                  max={pagination.totalPages}
                  value={pagination.page}
                  onChange={(e) => {
                    const page = parseInt(e.target.value);
                    if (page >= 1 && page <= pagination.totalPages) {
                      goToPage(page);
                    }
                  }}
                  className="w-16 text-sm border border-gray-300 rounded-md px-2 py-1 text-center focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-500">of {pagination.totalPages}</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Create/Edit Modal */}
      {(showCreateModal || showEditModal) && (
        <div className="fixed inset-0 z-50 overflow-auto bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-screen overflow-y-auto transform transition-all">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <div className="flex items-center">
                <div className="bg-blue-100 p-2 rounded-lg mr-3">
                  <Award className="w-5 h-5 text-blue-600" />
                </div>
                <h2 className="text-xl font-semibold text-gray-900">
                  {showEditModal ? 'Edit Badge' : 'Create New Badge'}
                </h2>
              </div>
              <button
                onClick={showEditModal ? closeEditModal : closeCreateModal}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X size={20} className="text-gray-500" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6">
              {formErrors.submit && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start">
                  <AlertCircle className="w-5 h-5 text-red-600 mr-3 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-red-800 font-medium">Error</p>
                    <p className="text-red-700 text-sm mt-1">{formErrors.submit}</p>
                  </div>
                </div>
              )}

              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Badge Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.badgeName}
                    onChange={(e) => handleInputChange('badgeName', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                    placeholder="Enter badge name"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Badge Key <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.badgeKey}
                    onChange={(e) => handleInputChange('badgeKey', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors font-mono"
                    placeholder="e.g., trending, bestseller"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Badge Color
                    </label>
                    <div className="flex items-center gap-3">
                      <input
                        type="color"
                        value={formData.badgeColor}
                        onChange={(e) => handleInputChange('badgeColor', e.target.value)}
                        className="w-16 h-16 border-2 border-gray-300 rounded-lg cursor-pointer"
                      />
                      <div>
                        <p className="text-sm text-gray-600 font-mono">{formData.badgeColor}</p>
                        <p className="text-xs text-gray-500">Click to change</p>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Badge Icon
                    </label>
                    <input
                      type="text"
                      value={formData.badgeIcon}
                      onChange={(e) => handleInputChange('badgeIcon', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                      placeholder="🏆 or icon-name"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Description
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    rows={3}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors resize-none"
                    placeholder="Describe what this badge represents..."
                  />
                </div>

                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="isActive"
                      checked={formData.isActive}
                      onChange={(e) => handleInputChange('isActive', e.target.checked)}
                      className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <label htmlFor="isActive" className="ml-3 text-sm font-medium text-gray-700">
                      Active Badge
                    </label>
                  </div>
                  <span className="text-xs text-gray-500">
                    {formData.isActive ? 'Badge will be visible' : 'Badge will be hidden'}
                  </span>
                </div>
              </div>

              <div className="flex justify-end space-x-3 mt-8 pt-6 border-t border-gray-200">
                <button
                  type="button"
                  onClick={showEditModal ? closeEditModal : closeCreateModal}
                  className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-200 font-medium shadow-lg hover:shadow-xl"
                >
                  {showEditModal ? 'Update Badge' : 'Create Badge'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Assignment Modal */}
      {showAssignModal && selectedBadge && (
        <div className="fixed inset-0 z-50 overflow-auto bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-screen overflow-y-auto transform transition-all">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <div className="flex items-center">
                <div className="bg-green-100 p-2 rounded-lg mr-3">
                  <Users className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">Assign Badge</h2>
                  <p className="text-sm text-gray-600 mt-1">
                    Assign "{selectedBadge.badgeName}" to {markingType}s
                  </p>
                </div>
              </div>
              <button
                onClick={handleCloseAssignModal}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X size={20} className="text-gray-500" />
              </button>
            </div>

            <div className="p-6">
              {/* Type Selection */}
              <div className="mb-6">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Type of Marking
                </label>
                <select
                  value={markingType}
                  onChange={(e) => handleMarkingTypeChange(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                >
                  <option value="type">Select type</option>
                  <option value="course">Course</option>
                  <option value="category">Category</option>
                  <option value="career">Career Path</option>
                </select>
              </div>

              {/* Search */}
              <div className="mb-6">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Search {markingType}s
                </label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    placeholder={`Search ${markingType}s by name...`}
                    value={searchTermAssign}
                    onChange={(e) => {
                      const value = e.target.value;
                      setSearchTermAssign(value);
                      // Trigger search immediately
                      fetchAvailableItems(markingType, value);
                    }}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                  />
                  {loadingAvailable && (
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
                    </div>
                  )}
                </div>
              </div>

              {/* Available Items List */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-3">
                  <label className="text-sm font-semibold text-gray-700">
                    Available {markingType}s
                  </label>
                  <span className="text-sm text-gray-600">
                    {availableItems.length} found
                  </span>
                </div>
                
                <div className="max-h-64 overflow-y-auto border border-gray-200 rounded-lg">
                  {loadingAvailable ? (
                    <div className="flex items-center justify-center p-8">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                      <span className="ml-3 text-gray-600">Searching...</span>
                    </div>
                  ) : availableItems.length === 0 ? (
                    <div className="text-center p-8 text-gray-500">
                      No {markingType}s found
                    </div>
                  ) : (
                    <div className="divide-y divide-gray-200">
                      {availableItems
                        .filter(item => {
                          // Only show items that match current marking type
                          return (item.title && markingType === 'course') || 
                                 (item.name && markingType === 'category') || 
                                 (item.title && markingType === 'career');
                        })
                        .map((item) => {
                        const isAssigned = assignedItems.some(assigned => assigned.id === item.id);
                        
                        // Debug logging to track the issue
                        console.log('Item assignment check:', {
                          itemType: markingType,
                          itemId: item.id,
                          itemName: item.title || item.name,
                          isAssigned,
                          assignedItemsIds: assignedItems.map(a => a.id),
                          itemMatchesType: (item.title && markingType === 'course') || (item.name && markingType === 'category') || (item.title && markingType === 'career')
                        });
                        
                        return (
                          <div
                            key={item.id}
                            onClick={() => toggleItemAssignment(item)}
                            className={`p-3 cursor-pointer hover:bg-gray-50 transition-colors ${
                              isAssigned ? 'bg-blue-50 border-l-4 border-blue-500' : ''
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center">
                                <input
                                  type="checkbox"
                                  checked={isAssigned}
                                  onChange={() => {}}
                                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 mr-3"
                                />
                                <div>
                                  <p className="font-medium text-gray-900">
                                    {item.title || item.name}
                                  </p>
                                  <p className="text-sm text-gray-600">
                                    {item.description || `${markingType} ID: ${item.id}`}
                                  </p>
                                </div>
                              </div>
                              {isAssigned && (
                                <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                                  Assigned
                                </span>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>

              {/* Assigned Items List */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-3">
                  <label className="text-sm font-semibold text-gray-700">
                    Assigned {markingType}s
                  </label>
                  <span className="text-sm text-gray-600">
                    {assignedItems.length} total
                  </span>
                </div>
                
                <div className="max-h-64 overflow-y-auto border border-gray-200 rounded-lg">
                  {loadingAssignments ? (
                    <div className="flex items-center justify-center p-8">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                      <span className="ml-3 text-gray-600">Loading...</span>
                    </div>
                  ) : assignedItems.length === 0 ? (
                    <div className="text-center p-8 text-gray-500">
                      No {markingType}s assigned to this badge
                    </div>
                  ) : (
                    <div className="divide-y divide-gray-200">
                      {assignedItems.map((item) => (
                        <div
                          key={item.id}
                          className="p-3 hover:bg-gray-50 transition-colors"
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center">
                              <input
                                type="checkbox"
                                checked={true}
                                onChange={() => toggleItemAssignment(item)}
                                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 mr-3"
                              />
                              <div>
                                <p className="font-medium text-gray-900">
                                  {item.title || item.name}
                                </p>
                                <p className="text-sm text-gray-600">
                                  {item.description || `${markingType} ID: ${item.id}`}
                                </p>
                              </div>
                            </div>
                            <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                              Assigned
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
                <button
                  type="button"
                  onClick={handleCloseAssignModal}
                  className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                >
                  Close
                </button>
                <button
                  type="button"
                  onClick={handleAssignBadge}
                  disabled={assignedItems.length === 0}
                  className="px-6 py-3 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-lg hover:from-green-700 hover:to-green-800 transition-all duration-200 font-medium shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Update Assignments
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FeaturedMarking;
