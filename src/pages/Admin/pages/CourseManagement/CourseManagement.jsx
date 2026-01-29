import  { useState, useEffect, useCallback, useMemo } from 'react';
import { useAdmin } from '../../../../hooks/useAdmin';
import { useDebounce } from '../../../../hooks/useDebounce';
import { useCourseFilters } from '../../../../hooks/useCourseFilters';
import { useModalState } from '../../../../hooks/useModalState';
import { useToast } from '../../../../hooks/useToast';
import { COURSE_MANAGEMENT_CONSTANTS } from '../../../../constants/courseManagement';
import { calculateCourseStats, filterCoursesBySearch } from '../../../../utils/courseUtils';
import { adminApiService } from '../../../../services/AdminApi';
import { Search, ChevronDown,Image, DollarSign, BookOpen, Globe, CheckCircle, XCircle, Filter, Users, Plus, X } from 'lucide-react';
import GenericDropdown from '../../../../components/GenericDropdown';
import CategoryDropdown from '../../../../components/CategoryDropdown';
import CourseModal from '../../../../components/CourseModal';
import UniversalVirtualizedTable from '../../../../components/UniversalVirtualizedTable';
import { courseTableColumns } from '../../../../config/tableConfigurations';

const CourseManagement = () => {
  const { 
    error, getCourseById, updateCourse,
    getCourseTypes, getCourseLevels, getAllCategories, createCourse, deleteCourse, getAllCoursesAdmin
  } = useAdmin();
  
  const { toast, showToast } = useToast();
  const { modalState, openModal, closeModal, setModalLoading, setModalError } = useModalState();
  const { 
    filters, 
    setFilters,
    filtersLoading, 
    paginationInfo, 
    setFiltersLoading, 
    setPaginationInfo, 
    handleFilterChange, 
    resetFilters, 
    getActiveFilters 
  } = useCourseFilters();

  const [searchTerm, setSearchTerm] = useState('');
  const [filteredCourses, setFilteredCourses] = useState([]);
  const [filtersExpanded, setFiltersExpanded] = useState(false);
  const [expandedCourses, setExpandedCourses] = useState({});
  const [courseDetails, setCourseDetails] = useState({});
  const [detailsLoading, setDetailsLoading] = useState({});

  const [categories, setCategories] = useState([]);
  const [courseLevels, setCourseLevels] = useState([]);
  const [courseTypes, setCourseTypes] = useState([]);
  const [badges, setBadges] = useState([]);
  
  const [dropdownLoading, setDropdownLoading] = useState({
    categories: false,
    courseLevels: false,
    courseTypes: false,
    badges: false
  });
  
  const [dropdownError, setDropdownError] = useState({
    categories: '',
    courseLevels: '',
    courseTypes: '',
    badges: ''
  });

  // Debounced search
  const debouncedSearchTerm = useDebounce(searchTerm, COURSE_MANAGEMENT_CONSTANTS.SEARCH_DEBOUNCE_DELAY);

  // Memoized calculations
  const searchFilteredCourses = useMemo(() => 
    filterCoursesBySearch(filteredCourses, debouncedSearchTerm),
    [filteredCourses, debouncedSearchTerm]
  );

  const stats = useMemo(() => 
    calculateCourseStats(filteredCourses),
    [filteredCourses]
  );
  // Fetch dropdown data only once on component mount
  useEffect(() => {
    const fetchDropdownData = async () => {
      // Fetch Categories
      setDropdownLoading(prev => ({ ...prev, categories: true }));
      try {
        const data = await getAllCategories();
        const categories = data.items || data || [];
        setCategories(categories);
        setDropdownError(prev => ({ ...prev, categories: '' }));
      } catch (error) {
        setDropdownError(prev => ({ ...prev, categories: 'Failed to load categories' }));
      } finally {
        setDropdownLoading(prev => ({ ...prev, categories: false }));
      }

      // Fetch Course Types
      setDropdownLoading(prev => ({ ...prev, courseTypes: true }));
      try {
        const data = await getCourseTypes();
        setCourseTypes(data);
        setDropdownError(prev => ({ ...prev, courseTypes: '' }));
      } catch (error) {
        setDropdownError(prev => ({ ...prev, courseTypes: 'Failed to load course types' }));
      } finally {
        setDropdownLoading(prev => ({ ...prev, courseTypes: false }));
      }

      // Fetch Course Levels
      setDropdownLoading(prev => ({ ...prev, courseLevels: true }));
      try {
        const data = await getCourseLevels();
        setCourseLevels(data);
        setDropdownError(prev => ({ ...prev, courseLevels: '' }));
      } catch (error) {
        setDropdownError(prev => ({ ...prev, courseLevels: 'Failed to load course levels' }));
      } finally {
        setDropdownLoading(prev => ({ ...prev, courseLevels: false }));
      }

      // Fetch Badges
      setDropdownLoading(prev => ({ ...prev, badges: true }));
      try {
        const data = await adminApiService.getAllCourseBadgesNew();
        // Transform badge data to match MultiSelectDropdown expectations
        const transformedBadges = Array.isArray(data) ? data.map(badge => ({
          id: badge.id,
          name: badge.badgeName,
          description: badge.description
        })) : [];
        setBadges(transformedBadges);
        setDropdownError(prev => ({ ...prev, badges: '' }));
      } catch (error) {
        setDropdownError(prev => ({ ...prev, badges: 'Failed to load badges' }));
      } finally {
        setDropdownLoading(prev => ({ ...prev, badges: false }));
      }
    };

    fetchDropdownData();
  }, []); // Empty dependency array - run only once on mount

  // Handle view details
  const handleViewDetails = async (course) => {
    // Handle both course object and courseId parameter
    const courseId = typeof course === 'object' ? course.id : course;
    
    if (!courseId) {
      return;
    }
    
    // Toggle expansion
    setExpandedCourses(prev => ({
      ...prev,
      [courseId]: !prev[courseId]
    }));

    // Fetch details if not already loaded and row is being expanded
    if (!expandedCourses[courseId] && !courseDetails[courseId]) {
      try {
        setDetailsLoading(prev => ({ ...prev, [courseId]: true }));
        
        // Add timeout to prevent infinite loading
        const timeoutPromise = new Promise((_, reject) => {
          setTimeout(() => reject(new Error('Request timeout')), 10000); // 10 second timeout
        });
        
        const courseDetailData = await Promise.race([
          getCourseById(courseId),
          timeoutPromise
        ]);
        
        setCourseDetails(prev => ({
          ...prev,
          [courseId]: courseDetailData
        }));
      } catch (error) {
        // Clear loading state on error
        setDetailsLoading(prev => ({ ...prev, [courseId]: false }));
        // Show error toast
        showToast(error.message === 'Request timeout' ? 'Request timed out. Please try again.' : 'Failed to load course details', 'error');
      } finally {
        // Always clear loading state
        setDetailsLoading(prev => ({ ...prev, [courseId]: false }));
      }
    }
  };

  // Handle toggle expand for universal table
  const handleToggleExpand = (courseOrId) => {
    // Handle both course object and courseId parameter
    const courseId = typeof courseOrId === 'object' ? courseOrId.id : courseOrId;
    
    if (!courseId) {
      return;
    }
    
    setExpandedCourses(prev => ({
      ...prev,
      [courseId]: !prev[courseId]
    }));
  };

  // Handle edit course
  const handleEditCourse = async (course) => {
    try {
      setModalLoading(true);
      setModalError('');
      
      const courseDetailData = await getCourseById(course.id);
      
      // Open modal with course data
      openModal('edit', {
        ...course,
        ...courseDetailData,
        badgeIds: courseDetailData.badges?.map(badge => badge.id) || []
      });
    } catch (error) {
      setModalError('Failed to load course details for editing');
    } finally {
      setModalLoading(false);
    }
  };

  // Handle modal submission
  const handleModalSubmit = async (formData) => {

    try {
      setModalLoading(true);
      setModalError('');

      if (modalState.mode === 'create') {
        await createCourse(formData);
        showToast('Course created successfully!', 'success');
      } else if (modalState.mode === 'edit') {
        await updateCourse(modalState.course.id, formData);
        showToast('Course updated successfully!', 'success');
      } else if (modalState.mode === 'delete') {
        await deleteCourse(modalState.course.id);
        showToast('Course deleted successfully!', 'success');
      }

      // Refresh course data
      await applyFilters();
      closeModal();
    } catch (error) {
      setModalError(error.response?.data?.message || `Failed to ${modalState.mode} course`);
    } finally {
      setModalLoading(false);
    }
  };

  // Handle delete course
  const handleDeleteCourse = (course) => {
    openModal('delete', course);
  };

  // Apply filters with optimized loading state
  const applyFilters = useCallback(async () => {
    if (filtersLoading) return;
    
    setFiltersLoading(true);
    try {
      const activeFilters = getActiveFilters();
      const coursesData = await getAllCoursesAdmin(activeFilters);
      const coursesArray = coursesData?.items || coursesData?.data || coursesData || [];
      setFilteredCourses(coursesArray);
      
      // Update pagination info from response
      if (coursesData?.page !== undefined) {
        setPaginationInfo({
          page: coursesData.page,
          pageSize: coursesData.pageSize,
          totalCount: coursesData.totalCount || coursesArray.length
        });
      }
    } catch (error) {
      showToast('Failed to apply filters', 'error');
    } finally {
      setFiltersLoading(false);
    }
  }, [filtersLoading, getActiveFilters, getAllCoursesAdmin, showToast]);

  // Handle page changes
  const handlePageChange = useCallback(async (newPage) => {
    if (newPage < 1) return;
    
    const updatedFilters = { ...filters, page: newPage };
    setFilters(updatedFilters);
    
    try {
      setFiltersLoading(true);
      const activeFilters = Object.fromEntries(
        Object.entries(updatedFilters).filter(([key, value]) => {
          if (key === 'page' || key === 'pageSize') return true;
          return value !== '' && value !== 0 && value !== null && value !== undefined;
        })
      );
      
      const coursesData = await getAllCoursesAdmin(activeFilters);
      const coursesArray = coursesData?.items || coursesData?.data || coursesData || [];
      setFilteredCourses(coursesArray);
      
      if (coursesData?.page !== undefined) {
        setPaginationInfo({
          page: coursesData.page,
          pageSize: coursesData.pageSize,
          totalCount: coursesData.totalCount || coursesArray.length
        });
      }
    } catch (error) {
      showToast('Failed to load page', 'error');
    } finally {
      setFiltersLoading(false);
    }
  }, [filters, getAllCoursesAdmin, showToast]);

  // Load filtered courses on component mount and when filters change
  useEffect(() => {
    applyFilters();
  }, []); // Only run on mount

  if (filtersLoading) {
    return (
      <div className="p-4 lg:p-6 max-w-full mx-auto bg-gradient-to-br from-gray-50 to-gray-100 min-h-screen">
        {/* Header Skeleton */}
        <div className="mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-6">
            <div>
              <div className="h-10 lg:h-12 bg-gray-200 rounded-lg w-64 mb-3 animate-pulse"></div>
              <div className="h-6 bg-gray-200 rounded-lg w-96 animate-pulse"></div>
            </div>
            <div className="mt-4 lg:mt-0">
              <div className="h-12 bg-gray-200 rounded-xl w-40 animate-pulse"></div>
            </div>
          </div>
          
          {/* Stats Cards Skeleton */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="h-4 bg-gray-200 rounded w-24 mb-2 animate-pulse"></div>
                    <div className="h-8 bg-gray-200 rounded w-16 animate-pulse"></div>
                  </div>
                  <div className="w-12 h-12 bg-gray-200 rounded-lg animate-pulse"></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Search Bar Skeleton */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1 h-12 bg-gray-200 rounded-xl animate-pulse"></div>
            <div className="h-12 bg-gray-200 rounded-xl w-32 animate-pulse"></div>
          </div>
        </div>

        {/* Table Skeleton */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-6">
            <div className="space-y-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="flex items-center space-x-4 p-4 border-b border-gray-100">
                  <div className="w-14 h-14 bg-gray-200 rounded-xl animate-pulse"></div>
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-3/4 animate-pulse"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2 animate-pulse"></div>
                  </div>
                  <div className="flex space-x-2">
                    <div className="w-8 h-8 bg-gray-200 rounded-lg animate-pulse"></div>
                    <div className="w-8 h-8 bg-gray-200 rounded-lg animate-pulse"></div>
                    <div className="w-8 h-8 bg-gray-200 rounded-lg animate-pulse"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-red-500 p-4">{error}</div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* Toast Notification */}
      {toast.show && (
        <div className={`fixed top-4 right-4 z-50 px-6 py-3 rounded-lg shadow-lg transform transition-all duration-300 ${
          toast.type === 'success' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
        }`}>
          <div className="flex items-center space-x-2">
            {toast.type === 'success' ? (
              <CheckCircle className="w-5 h-5" />
            ) : (
              <XCircle className="w-5 h-5" />
            )}
            <span className="font-medium">{toast.message}</span>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="bg-white/80 backdrop-blur-md shadow-sm border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            <div>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
                  <BookOpen className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">Course Management</h1>
                  <p className="text-sm text-gray-600 mt-1">Manage and monitor all your courses in one place</p>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={() => setFiltersExpanded(!filtersExpanded)}
                className={`flex items-center px-4 py-2.5 rounded-xl transition-all duration-200 font-medium ${
                  (filtersExpanded || searchTerm) 
                    ? 'bg-blue-100 text-blue-700 border-2 border-blue-200'
                    : 'bg-white border-2 border-gray-200 text-gray-700 hover:bg-gray-50'
                }`}
              >
                <Filter className="w-4 h-4 mr-2" />
                Filters
                {(filtersExpanded || searchTerm) && (
                  <span className="ml-2 px-2 py-0.5 bg-blue-600 text-white text-xs rounded-full">
                    Active
                  </span>
                )}
              </button>
              <button 
                onClick={() => openModal('create')}
                className="flex items-center px-6 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 font-medium shadow-lg hover:shadow-xl"
              >
                <Plus className="w-4 h-4 mr-2" />
                Create Course
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="relative max-w-2xl mx-auto">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search courses by title, subtitle, category, level, or type..."
            className="w-full pl-12 pr-4 py-4 border border-gray-200 rounded-2xl bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-gray-900 placeholder-gray-500"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute inset-y-0 right-0 pr-4 flex items-center"
            >
              <X className="h-5 w-5 text-gray-400 hover:text-gray-600" />
            </button>
          )}
        </div>
      </div>

      {/* Filters Section */}
      {filtersExpanded && (
        <div className="bg-white/60 backdrop-blur-sm border-b border-gray-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Filter Options</h3>
              <button
                onClick={resetFilters}
                className="text-sm text-blue-600 hover:text-blue-700 font-medium"
              >
                Clear All
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Title</label>
                <input
                  type="text"
                  value={filters.title}
                  onChange={(e) => handleFilterChange('title', e.target.value)}
                  placeholder="Search by title..."
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Subtitle</label>
                <input
                  type="text"
                  value={filters.subtitle}
                  onChange={(e) => handleFilterChange('subtitle', e.target.value)}
                  placeholder="Search by subtitle..."
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                <CategoryDropdown
                  categories={categories}
                  value={filters.categoryId}
                  onChange={(categoryId) => handleFilterChange('categoryId', categoryId)}
                  placeholder="Select category..."
                  className="w-full"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Course Type</label>
                <GenericDropdown
                  items={courseTypes.map(type => ({ value: type.id, label: type.description }))}
                  value={filters.courseTypeId}
                  onChange={(value) => handleFilterChange('courseTypeId', value)}
                  placeholder="Select course type..."
                  className="w-full"
                  displayField="label"
                  valueField="value"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Course Level</label>
                <GenericDropdown
                  items={courseLevels.map(level => ({ value: level.id, label: level.title }))}
                  value={filters.courseLevelId}
                  onChange={(value) => handleFilterChange('courseLevelId', value)}
                  placeholder="Select course level..."
                  className="w-full"
                  displayField="label"
                  valueField="value"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Is Paid</label>
                <select
                  value={filters.isPaid}
                  onChange={(e) => handleFilterChange('isPaid', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                >
                  <option value="">All</option>
                  <option value="true">Yes</option>
                  <option value="false">No</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Price</label>
                <input
                  type="text"
                  value={filters.price}
                  onChange={(e) => handleFilterChange('price', e.target.value)}
                  placeholder="Enter price..."
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Discounted Price</label>
                <input
                  type="text"
                  value={filters.discountedPrice}
                  onChange={(e) => handleFilterChange('discountedPrice', e.target.value)}
                  placeholder="Enter discounted price..."
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                />
              </div>
            </div>
            <div className="flex justify-end mt-4">
              <button
                onClick={applyFilters}
                className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 font-medium shadow-lg hover:shadow-xl"
              >
                Apply Filters
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Optimized Courses Table with Virtual Scrolling */}
      <UniversalVirtualizedTable
        data={searchFilteredCourses}
        columns={courseTableColumns}
        onEdit={handleEditCourse}
        onDelete={handleDeleteCourse}
        onViewDetails={handleViewDetails}
        onToggleExpand={handleToggleExpand}
        expandedItems={expandedCourses}
        itemDetails={courseDetails}
        detailsLoading={detailsLoading}
        loading={filtersLoading}
        searchTerm={debouncedSearchTerm}
        expandable={true}
        renderExpandedContent={(course, details) => (
          <div className="space-y-6">
            {/* Course Header */}
            <div className="flex items-start space-x-6 pb-6 border-b border-blue-200">
              {details?.thumbnailUrl ? (
                <img 
                  src={details?.thumbnailUrl} 
                  alt={details?.title}
                  className="w-24 h-24 rounded-xl object-cover border-2 border-gray-200 shadow-lg"
                />
              ) : (
                <div className="w-24 h-24 rounded-xl bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center shadow-lg">
                  <Image className="w-12 h-12 text-white" />
                </div>
              )}
              <div className="flex-1">
                <h4 className="text-2xl font-bold text-gray-900 mb-2">{details?.title || course?.title || 'Untitled Course'}</h4>
                {details?.subtitle && (
                  <p className="text-gray-600 text-lg mb-3">{details.subtitle}</p>
                )}
                <div className="flex flex-wrap gap-2">
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-bold bg-gradient-to-r from-purple-100 to-purple-200 text-purple-800 border border-purple-300">
                    {details?.categoryName || course?.categoryName || 'Unknown Category'}
                  </span>
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-bold bg-gradient-to-r from-orange-100 to-orange-200 text-orange-800 border border-orange-300">
                    {details?.courseLevelName || course?.courseLevelName || 'Unknown Level'}
                  </span>
                  {details?.badges?.map((badge, index) => (
                    <span key={index} className="inline-flex items-center px-3 py-1 rounded-full text-sm font-bold bg-gradient-to-r from-yellow-100 to-yellow-200 text-yellow-800 border border-yellow-300">
                      {badge?.badgeName}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Course Details Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white p-4 rounded-lg border border-gray-200">
                <h5 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Course Type</h5>
                <p className="text-sm font-bold text-gray-900">{details?.courseTypeName || course?.courseTypeName || 'Not specified'}</p>
              </div>
              <div className="bg-white p-4 rounded-lg border border-gray-200">
                <h5 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Language</h5>
                <div className="flex items-center text-sm font-bold text-gray-900">
                  <Globe className="w-4 h-4 mr-2 text-blue-500" />
                  {details?.languageCode || course?.languageCode || 'Not specified'}
                </div>
              </div>
              <div className="bg-white p-4 rounded-lg border border-gray-200">
                <h5 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Pricing</h5>
                <div className="flex items-center">
                  <DollarSign className="w-4 h-4 mr-2 text-green-500" />
                  <div className="text-sm font-bold">
                    {(details?.discountedPrice || course?.discountedPrice) < (details?.price || course?.price) ? (
                      <div className="flex items-center space-x-2">
                        <span className="text-green-600">{details?.discountedPrice || course?.discountedPrice}</span>
                        <span className="text-gray-400 line-through text-xs">{details?.price || course?.price}</span>
                      </div>
                    ) : (
                      <span className="text-gray-900">{details?.price || course?.price || '0'}</span>
                    )}
                    <span className="text-gray-500 ml-1 text-xs">{details?.currencyCode || course?.currencyCode || 'USD'}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Description and Overview */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white p-4 rounded-lg border border-gray-200">
                <h5 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Description</h5>
                <p className="text-sm text-gray-700 leading-relaxed">
                  {details?.description || course?.description || 'No description available'}
                </p>
              </div>
              {details?.overview && (
                <div className="bg-white p-4 rounded-lg border border-gray-200">
                  <h5 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Overview</h5>
                  <p className="text-sm text-gray-700 leading-relaxed">
                    {details.overview}
                  </p>
                </div>
              )}
            </div>

            {/* Course Sections - Only show if course type is 1 and sections exist */}
            {(details?.courseTypeId === 1 || course?.courseTypeId === 1) && 
             (details?.sections?.length > 0 || course?.sections?.length > 0) && (
              <div className="bg-white p-6 rounded-lg border border-gray-200">
                <h5 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                  <BookOpen className="w-5 h-5 mr-2 text-blue-600" />
                  Course Sections
                </h5>
                <div className="space-y-4">
                  {(details?.sections || course?.sections || []).map((section, index) => (
                    <div key={section.id || index} className="border border-gray-200 rounded-lg p-4 bg-gradient-to-r from-gray-50 to-white">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                            <span className="text-sm font-bold text-blue-600">{index + 1}</span>
                          </div>
                          <h6 className="text-base font-semibold text-gray-900">
                            {section.title || `Section ${index + 1}`}
                          </h6>
                        </div>
                        <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                          Order: {section.sortOrder !== undefined ? section.sortOrder : index}
                        </span>
                      </div>
                      <p className="text-sm text-gray-700 leading-relaxed ml-11">
                        {section.description || 'No description available for this section.'}
                      </p>
                    </div>
                  ))}
                </div>
                {(!details?.sections?.length && !course?.sections?.length) && (
                  <div className="text-center py-8 text-gray-500">
                    <BookOpen className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                    <p>No sections available for this course.</p>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
        emptyMessage="No courses found"
        loadingMessage="Loading courses..."
      />

      {/* Stats Cards */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Courses</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{stats.totalCourses}</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-lg">
                <BookOpen className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Courses</p>
                <p className="text-2xl font-bold text-green-600 mt-1">{stats.activeCourses}</p>
              </div>
              <div className="p-3 bg-green-100 rounded-lg">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Paid Courses</p>
                <p className="text-2xl font-bold text-purple-600 mt-1">{stats.paidCourses}</p>
              </div>
              <div className="p-3 bg-purple-100 rounded-lg">
                <DollarSign className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Free Courses</p>
                <p className="text-2xl font-bold text-orange-600 mt-1">{stats.freeCourses}</p>
              </div>
              <div className="p-3 bg-orange-100 rounded-lg">
                <Users className="w-6 h-6 text-orange-600" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Pagination */}
      <div className="mt-8 flex flex-col sm:flex-row items-center justify-between bg-white rounded-xl p-4 shadow-sm border border-gray-200">
        <div className="text-sm text-gray-700 mb-4 sm:mb-0">
          <span className="font-medium text-gray-900">{searchFilteredCourses?.length || 0}</span> of{' '}
          <span className="font-medium text-gray-900">{paginationInfo.totalCount || 0}</span> courses
          {searchTerm && (
            <span className="ml-2 text-blue-600">
              (filtered)
            </span>
          )}
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => handlePageChange(paginationInfo.page - 1)}
            disabled={paginationInfo.page === 1}
            className={`px-4 py-2 text-sm font-medium rounded-xl transition-all duration-200 ${
              paginationInfo.page === 1 
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400 shadow-sm'
            }`}
          >
            <div className="flex items-center space-x-1">
              <ChevronDown className="w-4 h-4 rotate-90" />
              <span>Previous</span>
            </div>
          </button>
          
          <div className="flex items-center px-4 py-2 bg-blue-50 text-blue-700 rounded-xl font-medium">
            <span>Page {paginationInfo.page}</span>
          </div>
          
          <button
            onClick={() => handlePageChange(paginationInfo.page + 1)}
            disabled={searchFilteredCourses?.length < paginationInfo.pageSize}
            className={`px-4 py-2 text-sm font-medium rounded-xl transition-all duration-200 ${
              searchFilteredCourses?.length < paginationInfo.pageSize
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400 shadow-sm'
            }`}
          >
            <div className="flex items-center space-x-1">
              <span>Next</span>
              <ChevronDown className="w-4 h-4 -rotate-90" />
            </div>
          </button>
        </div>
      </div>

      {/* Unified Course Modal */}
      <CourseModal
        isOpen={modalState.isOpen}
        onClose={closeModal}
        mode={modalState.mode}
        course={modalState.course}
        categories={categories}
        courseLevels={courseLevels}
        courseTypes={courseTypes}
        badges={badges}
        loading={modalState.loading}
        error={modalState.error}
        onSubmit={handleModalSubmit}
        dropdownLoading={dropdownLoading}
        dropdownError={dropdownError}
      />

    </div>
  );
};

export default CourseManagement;
