import React, { useState } from 'react';
import { useCourseBadgeManagement } from '../../../../hooks/useCourseBadgeManagement';
import {
  Award,
  Search,
  RefreshCw,
  Grid,
  List,
  Plus,
  Edit,
  Trash2,
  Users,
  X,
  Check,
  BookOpen,
  ChevronDown
} from 'lucide-react';
import GenericDropdown from '../../../../components/GenericDropdown';
import CategoryDropdown from '../../../../components/CategoryDropdown';

const FeaturedMarking = () => {
  const {
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
    loadCoursesWithFilters,
    createBadge,
    updateBadge,
    deleteBadge,
    assignCoursesToBadge,
    getBadgeCourses,
    
    // Form handlers
    handleInputChange,
    
    // Modal handlers
    openCreateModal,
    openEditModal,
    openCourseAssignmentModal,
    closeModals,
    clearError
  } = useCourseBadgeManagement();

  const [searchTerm, setSearchTerm] = useState('');
  const [filterBadge, setFilterBadge] = useState('all');
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'
  const [selectedCourses, setSelectedCourses] = useState([]);
  
  // Course assignment filters
  const [courseFilters, setCourseFilters] = useState({
    courseTypeId: '',
    categoryId: '',
    courseLevelId: ''
  });

  // Filter badges
  const filteredBadges = Array.isArray(badges) ? badges.filter(badge => {
    const matchesSearch = badge.badgeName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         badge.badgeKey?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         badge.description?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesBadge = filterBadge === 'all' || badge.id === parseInt(filterBadge);
    
    return matchesSearch && matchesBadge;
  }) : [];

  // Handle badge creation
  const handleCreateBadge = async () => {
    try {
      await createBadge(formData);
    } catch (err) {
      // Error handling without console.log
    }
  };

  // Handle badge update
  const handleUpdateBadge = async () => {
    try {
      await updateBadge(selectedBadge.id, formData);
    } catch (err) {
      // Error handling without console.log
    }
  };

  // Handle badge deletion
  const handleDeleteBadge = async (badgeId) => {
    if (window.confirm('Are you sure you want to delete this badge?')) {
      try {
        await deleteBadge(badgeId);
      } catch (err) {
        // Error handling without console.log
      }
    }
  };

  // Handle course assignment
  const handleCourseAssignment = async () => {
    try {
      await assignCoursesToBadge(selectedBadge.id, selectedCourses);
      setSelectedCourses([]);
      closeModals();
    } catch (err) {
      // Error handling without console.log
    }
  };

  // Toggle course selection
  const toggleCourseSelection = (courseId) => {
    const isAssigned = getBadgeCourses(selectedBadge.id).includes(courseId);
    
    setSelectedCourses(prev => {
      if (prev.includes(courseId)) {
        // If already in selection, remove it (deselect)
        return prev.filter(id => id !== courseId);
      } else if (isAssigned) {
        // If assigned but not in selection, add to selection (mark for deselection)
        return [...prev, courseId];
      } else {
        // If not assigned, add to selection (mark for selection)
        return [...prev, courseId];
      }
    });
  };

  // Handle course filter changes
  const handleCourseFilterChange = (filterType, value) => {
    const newFilters = { ...courseFilters, [filterType]: value };
    setCourseFilters(newFilters);
    
    // Apply filters to load courses
    const apiFilters = {};
    if (newFilters.courseTypeId && newFilters.courseTypeId !== '') {
      apiFilters.CourseTypeId = newFilters.courseTypeId;
    }
    if (newFilters.categoryId && newFilters.categoryId !== '') {
      apiFilters.CategoryId = newFilters.categoryId;
    }
    if (newFilters.courseLevelId && newFilters.courseLevelId !== '') {
      apiFilters.CourseLevelId = newFilters.courseLevelId;
    }
    
    loadCoursesWithFilters(apiFilters);
  };

  // Get badge display
  const getBadgeDisplay = (badge) => {
    if (!badge) return null;
    
    return (
      <span
        className="inline-flex items-center px-3 py-1 text-sm font-medium rounded-full"
        style={{ 
          backgroundColor: badge.badgeColor + '20', 
          color: badge.badgeColor,
          border: `1px solid ${badge.badgeColor}40`
        }}
      >
        <span className="mr-2">{badge.badgeIcon}</span>
        {badge.badgeName}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <RefreshCw className="w-8 h-8 animate-spin text-blue-500" />
        <span className="ml-2 text-gray-600 dark:text-gray-300">Loading badges...</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <div className="p-6 max-w-7xl mx-auto">
        {/* Enhanced Header */}
        <div className="mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-3 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl shadow-lg">
                  <Award className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
                    Course Badge Management
                  </h1>
                  <p className="text-gray-600 dark:text-gray-400 mt-1 flex items-center gap-2">
                    <span className="inline-flex items-center px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-xs font-medium rounded-full">
                      {Array.isArray(badges) ? badges.length : 0} Badges
                    </span>
                    <span className="text-gray-400">•</span>
                    <span>Create and manage course badges with smart course assignments</span>
                  </p>
                </div>
              </div>
            </div>
            <button
              onClick={openCreateModal}
              className="group relative overflow-hidden bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-6 py-3 rounded-xl flex items-center space-x-2 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
            >
              <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>
              <Plus className="w-5 h-5 relative z-10" />
              <span className="relative z-10 font-medium">Create Badge</span>
            </button>
          </div>
        </div>

      {/* Enhanced Error Message */}
      {error && (
        <div className="mb-6 relative">
          <div className="bg-gradient-to-r from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-800/20 border border-red-200 dark:border-red-800 rounded-xl p-4 shadow-lg">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0">
                <div className="w-10 h-10 bg-red-100 dark:bg-red-900/50 rounded-full flex items-center justify-center">
                  <X className="w-5 h-5 text-red-600 dark:text-red-400" />
                </div>
              </div>
              <div className="flex-1">
                <h3 className="text-sm font-medium text-red-800 dark:text-red-200">Error</h3>
                <p className="text-sm text-red-700 dark:text-red-300 mt-1">{error}</p>
              </div>
              <button
                onClick={clearError}
                className="flex-shrink-0 p-1 text-red-400 hover:text-red-600 dark:hover:text-red-300 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Enhanced Filters Bar */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg mb-6 p-6 border border-gray-100 dark:border-gray-700">
        <div className="flex flex-col lg:flex-row gap-6 items-center justify-between">
          <div className="flex flex-col sm:flex-row gap-4 flex-1">
            {/* Enhanced Search */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 w-5 h-5" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search badges by name, key, or description..."
                className="w-full pl-12 pr-4 py-3 border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent transition-all duration-200 shadow-sm"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Enhanced Badge Filter */}
            <div className="relative">
              <select
                value={filterBadge}
                onChange={(e) => setFilterBadge(e.target.value)}
                className="appearance-none bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-gray-900 dark:text-white rounded-xl px-4 py-3 pr-10 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent transition-all duration-200 shadow-sm cursor-pointer"
              >
                <option value="all">All Badges</option>
                {Array.isArray(badges) && badges.map(badge => (
                  <option key={badge.id} value={badge.id}>
                    {badge.badgeIcon} {badge.badgeName}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 w-5 h-5 pointer-events-none" />
            </div>
          </div>

          {/* Enhanced View Mode Toggle */}
          <div className="flex items-center bg-gray-100 dark:bg-gray-700 rounded-xl p-1">
            <button
              onClick={() => setViewMode('grid')}
              className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-all duration-200 ${
                viewMode === 'grid' 
                  ? 'bg-white dark:bg-gray-600 text-blue-600 dark:text-blue-400 shadow-sm' 
                  : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
              }`}
              title="Grid View"
            >
              <Grid className="w-4 h-4" />
              <span className="text-sm font-medium">Grid</span>
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-all duration-200 ${
                viewMode === 'list' 
                  ? 'bg-white dark:bg-gray-600 text-blue-600 dark:text-blue-400 shadow-sm' 
                  : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
              }`}
              title="List View"
            >
              <List className="w-4 h-4" />
              <span className="text-sm font-medium">List</span>
            </button>
          </div>
        </div>
      </div>

      {/* Enhanced Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="group relative overflow-hidden bg-white dark:bg-gray-800 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 dark:border-gray-700">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-purple-600/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          <div className="relative p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Total Badges</p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white">{Array.isArray(badges) ? badges.length : 0}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">All badge types</p>
              </div>
              <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-2xl p-4 shadow-lg group-hover:scale-110 transition-transform duration-300">
                <Award className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>
        </div>
        
        <div className="group relative overflow-hidden bg-white dark:bg-gray-800 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 dark:border-gray-700">
          <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 to-emerald-600/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          <div className="relative p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Active Badges</p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white">
                  {Array.isArray(badges) ? badges.filter(badge => badge.isActive).length : 0}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Currently active</p>
              </div>
              <div className="bg-gradient-to-r from-green-500 to-emerald-600 rounded-2xl p-4 shadow-lg group-hover:scale-110 transition-transform duration-300">
                <Check className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>
        </div>

        <div className="group relative overflow-hidden bg-white dark:bg-gray-800 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 dark:border-gray-700">
          <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-pink-600/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          <div className="relative p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Total Courses</p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white">{Array.isArray(courses) ? courses.length : 0}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Available courses</p>
              </div>
              <div className="bg-gradient-to-r from-purple-500 to-pink-600 rounded-2xl p-4 shadow-lg group-hover:scale-110 transition-transform duration-300">
                <BookOpen className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>
        </div>

        <div className="group relative overflow-hidden bg-white dark:bg-gray-800 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 dark:border-gray-700">
          <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/5 to-orange-600/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          <div className="relative p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Assigned Courses</p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white">
                  {Array.isArray(badges) ? badges.reduce((total, badge) => total + (badge.courseIds?.length || 0), 0) : 0}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Course assignments</p>
              </div>
              <div className="bg-gradient-to-r from-yellow-500 to-orange-600 rounded-2xl p-4 shadow-lg group-hover:scale-110 transition-transform duration-300">
                <Users className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Badges Display */}
      {viewMode === 'grid' ? (
        /* Grid View */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredBadges.map(badge => (
            <div key={badge.id} className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden hover:shadow-lg transition-shadow">
              {/* Badge Header */}
              <div className="relative h-32" style={{ backgroundColor: badge.badgeColor + '10' }}>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-4xl mb-2">{badge.badgeIcon}</div>
                    {getBadgeDisplay(badge)}
                  </div>
                </div>
                {badge.isActive ? (
                  <div className="absolute top-2 right-2 bg-green-500 text-white px-2 py-1 rounded-full text-xs font-medium">
                    Active
                  </div>
                ) : (
                  <div className="absolute top-2 right-2 bg-gray-500 text-white px-2 py-1 rounded-full text-xs font-medium">
                    Inactive
                  </div>
                )}
              </div>

              {/* Badge Info */}
              <div className="p-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">{badge.badgeName}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-300 mb-3 line-clamp-2">{badge.description}</p>
                
                <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400 mb-4">
                  <span>Key: {badge.badgeKey}</span>
                  <span>{badge.courseIds?.length || 0} courses</span>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => openEditModal(badge)}
                      className="p-2 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded hover:bg-blue-200 dark:hover:bg-blue-900/50 transition-colors"
                      title="Edit Badge"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    
                    <button
                      onClick={() => openCourseAssignmentModal(badge)}
                      className="p-2 bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded hover:bg-purple-200 dark:hover:bg-purple-900/50 transition-colors"
                      title="Manage Courses"
                    >
                      <Users className="w-4 h-4" />
                    </button>
                    
                    <button
                      onClick={() => handleDeleteBadge(badge.id)}
                      className="p-2 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors"
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
      ) : (
        /* List View */
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 overflow-hidden">
          {/* Table Header */}
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Badges</h2>
              <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                <span>{filteredBadges.length} badges</span>
              </div>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-900/30 border-b border-gray-200 dark:border-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Badge
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Key
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Description
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Courses
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {filteredBadges.map((badge, index) => (
                  <tr key={badge.id} className={`hover:bg-gray-50 dark:hover:bg-gray-900/30 transition-colors ${
                    index % 2 === 0 ? 'bg-white dark:bg-gray-800' : 'bg-gray-50/50 dark:bg-gray-900/20'
                  }`}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <div 
                          className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl shadow-sm"
                          style={{ backgroundColor: badge.badgeColor + '20', color: badge.badgeColor }}
                        >
                          {badge.badgeIcon}
                        </div>
                        <div>
                          <div className="text-sm font-medium text-gray-900 dark:text-white">
                            {badge.badgeName}
                          </div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">
                            {getBadgeDisplay(badge)}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200">
                        {badge.badgeKey}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900 dark:text-white max-w-xs truncate">
                        {badge.description || 'No description'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        badge.isActive 
                          ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200' 
                          : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200'
                      }`}>
                        <span className={`w-2 h-2 rounded-full mr-1.5 ${
                          badge.isActive ? 'bg-green-400' : 'bg-gray-400'
                        }`}></span>
                        {badge.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-900 dark:text-white font-medium">
                          {badge.courseIds?.length || 0}
                        </span>
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          courses
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => openEditModal(badge)}
                          className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 hover:bg-blue-200 dark:hover:bg-blue-900/50 transition-colors"
                          title="Edit Badge"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => openCourseAssignmentModal(badge)}
                          className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 hover:bg-purple-200 dark:hover:bg-purple-900/50 transition-colors"
                          title="Manage Courses"
                        >
                          <Users className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteBadge(badge.id)}
                          className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors"
                          title="Delete Badge"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Empty State */}
          {filteredBadges.length === 0 && (
            <div className="px-6 py-12 text-center">
              <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Award className="w-8 h-8 text-gray-400 dark:text-gray-500" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No badges found</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                {searchTerm || filterBadge !== 'all' 
                  ? 'Try adjusting your search or filters' 
                  : 'Get started by creating your first badge'}
              </p>
              {!searchTerm && filterBadge === 'all' && (
                <button
                  onClick={openCreateModal}
                  className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-200"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Create Badge
                </button>
              )}
            </div>
          )}
        </div>
      )}

      {/* Create/Edit Badge Modal */}
      {(showCreateModal || showEditModal) && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                {showCreateModal ? 'Create New Badge' : 'Edit Badge'}
              </h2>
              <button
                onClick={closeModals}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Badge Key
                </label>
                <input
                  type="text"
                  name="badgeKey"
                  value={formData.badgeKey}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., ALL, FEATURED, NEW"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Badge Name
                </label>
                <input
                  type="text"
                  name="badgeName"
                  value={formData.badgeName}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., All Courses, Featured Courses"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Badge Icon
                </label>
                <input
                  type="text"
                  name="badgeIcon"
                  value={formData.badgeIcon}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="🏆"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Badge Color
                </label>
                <input
                  type="color"
                  name="badgeColor"
                  value={formData.badgeColor}
                  onChange={handleInputChange}
                  className="w-full h-10 px-2 py-1 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Description
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows="3"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Describe this badge..."
                />
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  name="isActive"
                  checked={formData.isActive}
                  onChange={handleInputChange}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                  Active
                </label>
              </div>
            </div>

            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={closeModals}
                className="px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-200 dark:bg-gray-700 rounded-md hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={showCreateModal ? handleCreateBadge : handleUpdateBadge}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                {showCreateModal ? 'Create' : 'Update'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Course Assignment Modal */}
      {showCourseAssignmentModal && selectedBadge && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                  Manage Courses for {selectedBadge.badgeName}
                </h2>
                <button
                  onClick={closeModals}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>

            {/* Course Filters */}
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">Filter Courses</h3>
                <button
                  onClick={() => {
                    setCourseFilters({
                      courseTypeId: '',
                      categoryId: '',
                      courseLevelId: ''
                    });
                    loadCoursesWithFilters({});
                  }}
                  className="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                >
                  Clear Filters
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Course Type
                  </label>
                  <GenericDropdown
                    items={courseTypes}
                    value={courseFilters.courseTypeId}
                    onChange={(value) => handleCourseFilterChange('courseTypeId', value)}
                    placeholder="All Course Types"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Category
                  </label>
                  <CategoryDropdown
                    categories={categories}
                    value={courseFilters.categoryId}
                    onChange={(value) => handleCourseFilterChange('categoryId', value)}
                    placeholder="All Categories"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Course Level
                  </label>
                  <GenericDropdown
                    items={courseLevels}
                    value={courseFilters.courseLevelId}
                    onChange={(value) => handleCourseFilterChange('courseLevelId', value)}
                    placeholder="All Levels"
                  />
                </div>
              </div>
            </div>

            <div className="p-6 flex-1 overflow-hidden flex flex-col">
              <div className="mb-4">
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  Currently assigned: {getBadgeCourses(selectedBadge.id).length} courses
                </p>
              </div>

              <div className="space-y-2 flex-1 overflow-y-auto mb-4">
                {Array.isArray(courses) && courses.map(course => {
                  const isAssigned = getBadgeCourses(selectedBadge.id).includes(course.id);
                  const isSelected = selectedCourses.includes(course.id);
                  // Determine the actual current state: selected if it's assigned and not in selection for deselection, or if it's newly selected
                  const isCurrentlySelected = (isAssigned && !isSelected) || (!isAssigned && isSelected);
                  
                  return (
                    <div
                      key={course.id}
                      className={`flex items-center p-3 border rounded-lg cursor-pointer transition-colors ${
                        isCurrentlySelected
                          ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-300 dark:border-blue-700'
                          : 'bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600'
                      }`}
                      onClick={() => toggleCourseSelection(course.id)}
                    >
                      <input
                        type="checkbox"
                        checked={isCurrentlySelected}
                        onChange={() => toggleCourseSelection(course.id)}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded mr-3"
                      />
                      <div className="flex-1">
                        <div className="font-medium text-gray-900 dark:text-white">{course.name || 'Unknown Course'}</div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {course.instructor || 'Unknown Instructor'} • {course.category || 'Uncategorized'}
                        </div>
                      </div>
                      {isAssigned && !isSelected && (
                        <span className="text-xs bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 px-2 py-1 rounded">
                          Assigned
                        </span>
                      )}
                      {isSelected && (
                        <span className="text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 px-2 py-1 rounded">
                          {isAssigned ? 'Deselected' : 'Selected'}
                        </span>
                      )}
                    </div>
                  );
                })}
                {!Array.isArray(courses) && (
                  <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                    No courses available
                  </div>
                )}
              </div>

              <div className="flex justify-end space-x-3 mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
                <button
                  onClick={closeModals}
                  className="px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-200 dark:bg-gray-700 rounded-md hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCourseAssignment}
                  disabled={selectedCourses.length === 0}
                  className={`px-4 py-2 rounded-md transition-colors ${
                    selectedCourses.length === 0
                      ? 'bg-gray-400 text-gray-200 cursor-not-allowed'
                      : 'bg-blue-600 text-white hover:bg-blue-700'
                  }`}
                >
                  {selectedCourses.length === 0 ? 'Select Courses to Assign' : `Assign ${selectedCourses.length} Course${selectedCourses.length !== 1 ? 's' : ''}`}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      </div>
    </div>
  );
};

export default FeaturedMarking;
