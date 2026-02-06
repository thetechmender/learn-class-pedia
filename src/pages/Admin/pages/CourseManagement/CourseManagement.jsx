import  { useState, useEffect, useCallback, useMemo } from 'react';
import { useAdmin } from '../../../../hooks/useAdmin';
import { useDebounce } from '../../../../hooks/useDebounce';
import { useCourseFilters } from '../../../../hooks/useCourseFilters';
import { useModalState } from '../../../../hooks/useModalState';
import { useToast } from '../../../../hooks/useToast';
import { COURSE_MANAGEMENT_CONSTANTS } from '../../../../constants/courseManagement';
import { calculateCourseStats, filterCoursesBySearch } from '../../../../utils/courseUtils';
import { Search, ChevronDown, Image, DollarSign, BookOpen, Globe, CheckCircle, XCircle, Filter, Users, Plus, X, Play, Award, Eye, Edit2, Trash2, Star, MessageSquare, Clock, Tag, Layers, Video, FileText } from 'lucide-react';
import GenericDropdown from '../../../../components/GenericDropdown';
import CategoryDropdown from '../../../../components/CategoryDropdown';
import CourseModal from '../../../../components/CourseModal';
import UniversalVirtualizedTable from '../../../../components/UniversalVirtualizedTable';
import AdminPageLayout from '../../../../components/AdminPageLayout';
import { courseTableColumns } from '../../../../config/tableConfigurations';

const CourseManagement = () => {
  const { 
    error, getCourseById,
    getCourseTypes, getCourseLevels, getAllCategories, deleteCourse, getAllCoursesAdmin,
    createCourseWithFile, updateCourseWithFile, getAllCourseBadgesNew
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
  useEffect(() => {
    const fetchDropdownData = async () => {
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
        const response = await getAllCourseBadgesNew();
        // Handle the API response structure where badges are in items array
        const badgesData = response.items || response || [];
        const transformedBadges = Array.isArray(badgesData) ? badgesData.map(badge => ({
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
  }, [getAllCategories, getCourseTypes, getCourseLevels, getAllCourseBadgesNew]);

  // Handle view details
 const handleViewDetails = useCallback(async (course) => {
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
  }, [getCourseById, showToast, expandedCourses, courseDetails]);

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
  const handleModalSubmit = async (formData, isFormData = false) => {
    try {
      setModalLoading(true);
      setModalError('');

      if (modalState.mode === 'create') {
        if (isFormData) {
          // formData is already FormData, use it directly
          await createCourseWithFile(formData);
        } else {
          // Convert JSON to FormData for consistency
          const convertedFormData = new FormData();
          
          // Add all fields to FormData (using lowercase field names like JSON)
          if (formData.title) convertedFormData.append('title', formData.title);
          if (formData.subtitle) convertedFormData.append('subtitle', formData.subtitle);
          if (formData.description) convertedFormData.append('description', formData.description);
          if (formData.overview) convertedFormData.append('overview', formData.overview);
          if (formData.languageCode) convertedFormData.append('languageCode', formData.languageCode);
          if (formData.courseTypeId !== undefined) convertedFormData.append('courseTypeId', parseInt(formData.courseTypeId));
          if (formData.categoryId !== undefined) convertedFormData.append('categoryId', parseInt(formData.categoryId));
          if (formData.courseLevelId !== undefined) convertedFormData.append('courseLevelId', parseInt(formData.courseLevelId));
          if (formData.isPaid !== undefined) convertedFormData.append('isPaid', formData.isPaid);
          if (formData.price !== undefined) convertedFormData.append('price', parseFloat(formData.price) || 0);
          if (formData.discountedPrice !== undefined) convertedFormData.append('discountedPrice', parseFloat(formData.discountedPrice) || 0);
          if (formData.currencyCode) convertedFormData.append('currencyCode', formData.currencyCode);
          if (formData.promoVideoUrl) convertedFormData.append('promoVideoUrl', formData.promoVideoUrl);
          
          // Add badges array (always include, even if empty)
          if (formData.badgeIds && formData.badgeIds.length > 0) {
            formData.badgeIds.forEach((badgeId, index) => {
              convertedFormData.append(`badgeIds[${index}]`, parseInt(badgeId));
            });
          } else {
            convertedFormData.append('badgeIds', JSON.stringify([]));
          }
          
          // Add sections array (always include, even if empty)
          if (formData.sections && formData.sections.length > 0) {
            formData.sections.forEach((section, index) => {
              convertedFormData.append(`sections[${index}].title`, section.title || '');
              convertedFormData.append(`sections[${index}].description`, section.description || '');
              convertedFormData.append(`sections[${index}].sortOrder`, section.sortOrder || index);
            });
          }
          
          await createCourseWithFile(convertedFormData);
        }
        showToast('Course created successfully!', 'success');
      } else if (modalState.mode === 'edit') {
        if (isFormData) {
          // formData is already FormData, use it directly
          await updateCourseWithFile(modalState.course.id, formData);
        } else {
          // Convert JSON to FormData for consistency
          const convertedFormData = new FormData();
          
          // Add all fields to FormData (using lowercase field names like JSON)
          if (formData.title) convertedFormData.append('title', formData.title);
          if (formData.subtitle) convertedFormData.append('subtitle', formData.subtitle);
          if (formData.description) convertedFormData.append('description', formData.description);
          if (formData.overview) convertedFormData.append('overview', formData.overview);
          if (formData.languageCode) convertedFormData.append('languageCode', formData.languageCode);
          if (formData.courseTypeId !== undefined) convertedFormData.append('courseTypeId', parseInt(formData.courseTypeId));
          if (formData.categoryId !== undefined) convertedFormData.append('categoryId', parseInt(formData.categoryId));
          if (formData.courseLevelId !== undefined) convertedFormData.append('courseLevelId', parseInt(formData.courseLevelId));
          if (formData.isPaid !== undefined) convertedFormData.append('isPaid', formData.isPaid);
          if (formData.price !== undefined) convertedFormData.append('price', parseFloat(formData.price) || 0);
          if (formData.discountedPrice !== undefined) convertedFormData.append('discountedPrice', parseFloat(formData.discountedPrice) || 0);
          if (formData.currencyCode) convertedFormData.append('currencyCode', formData.currencyCode);
          if (formData.promoVideoUrl) convertedFormData.append('promoVideoUrl', formData.promoVideoUrl);
          
          // Add badges array (always include, even if empty)
          if (formData.badgeIds && formData.badgeIds.length > 0) {
            formData.badgeIds.forEach((badgeId, index) => {
              convertedFormData.append(`badgeIds[${index}]`, parseInt(badgeId));
            });
          } else {
            convertedFormData.append('badgeIds', JSON.stringify([]));
          }
          
          // Add sections array (always include, even if empty)
          if (formData.sections && formData.sections.length > 0) {
            formData.sections.forEach((section, index) => {
              convertedFormData.append(`sections[${index}].title`, section.title || '');
              convertedFormData.append(`sections[${index}].description`, section.description || '');
              convertedFormData.append(`sections[${index}].sortOrder`, section.sortOrder || index);
            });
          }
          
          await updateCourseWithFile(modalState.course.id, convertedFormData);
        }
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
  }, [filtersLoading, getActiveFilters, getAllCoursesAdmin, showToast, setFiltersLoading, setFilters, setFilteredCourses, setPaginationInfo]);
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
    return <AdminPageLayout loading={true} skeletonType="table" />;
  }

  if (error) {
    return (
      <AdminPageLayout
        title="Course Management"
        subtitle="Manage and monitor all your courses in one place"
        icon={BookOpen}
        loading={false}
        skeletonType="table"
      >
        <div className="text-red-500 p-4">{error}</div>
      </AdminPageLayout>
    );
  }

  return (
    <AdminPageLayout
      title="Course Management"
      subtitle="Manage and monitor all your courses in one place"
      icon={BookOpen}
      loading={false}
      skeletonType="table"
      actions={
        <>
          <button
            onClick={() => setFiltersExpanded(!filtersExpanded)}
            className={`flex items-center justify-center px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl transition-all duration-200 font-medium text-sm ${
              (filtersExpanded || searchTerm) 
                ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 border-2 border-blue-200 dark:border-blue-700'
                : 'bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
            }`}
          >
            <Filter className="w-4 h-4 sm:mr-2" />
            <span className="hidden sm:inline">Filters</span>
            {(filtersExpanded || searchTerm) && (
              <span className="ml-2 px-2 py-0.5 bg-blue-600 dark:bg-blue-500 text-white text-xs rounded-full">
                Active
              </span>
            )}
          </button>
          <button 
            onClick={() => openModal('create')}
            className="flex items-center justify-center px-4 sm:px-6 py-2 sm:py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-500 dark:to-indigo-500 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 dark:hover:from-blue-600 dark:hover:to-indigo-600 transition-all duration-200 font-medium shadow-lg hover:shadow-xl text-sm"
          >
            <Plus className="w-4 h-4 sm:mr-2" />
            <span className="hidden sm:inline">Create Course</span>
            <span className="sm:hidden">Create</span>
          </button>
        </>
      }
    >
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

      {/* Search Bar */}
      <div className="relative max-w-4xl mx-auto">
        <div className="absolute inset-y-0 left-0 pl-3 sm:pl-4 flex items-center pointer-events-none">
          <Search className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400 dark:text-gray-500" />
        </div>
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search courses by title, subtitle, category, level, or type..."
          className="w-full pl-10 sm:pl-12 pr-10 sm:pr-4 py-3 sm:py-4 border border-gray-200 dark:border-gray-600 rounded-xl sm:rounded-2xl bg-white dark:bg-gray-800 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-600 focus:border-transparent transition-all duration-200 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 text-sm sm:text-base"
        />
        {searchTerm && (
          <button
            onClick={() => setSearchTerm('')}
            className="absolute inset-y-0 right-0 pr-3 sm:pr-4 flex items-center"
          >
            <X className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300" />
          </button>
        )}
      </div>

      {/* Filters Section */}
      {filtersExpanded && (
        <div className="bg-white/60 dark:bg-gray-900/60 backdrop-blur-sm border-b border-gray-100 dark:border-gray-800">
          <div className="py-4 sm:py-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 space-y-2 sm:space-y-0">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Filter Options</h3>
              <button
                onClick={resetFilters}
                className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium"
              >
                Clear All
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Title</label>
                <input
                  type="text"
                  value={filters.title}
                  onChange={(e) => handleFilterChange('title', e.target.value)}
                  placeholder="Search by title..."
                  className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-200 dark:border-gray-600 rounded-lg sm:rounded-xl bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-600 focus:border-transparent transition-all duration-200 text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Subtitle</label>
                <input
                  type="text"
                  value={filters.subtitle}
                  onChange={(e) => handleFilterChange('subtitle', e.target.value)}
                  placeholder="Search by subtitle..."
                  className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-200 dark:border-gray-600 rounded-lg sm:rounded-xl bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-600 focus:border-transparent transition-all duration-200 text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Category</label>
                <CategoryDropdown
                  categories={categories}
                  value={filters.categoryId}
                  onChange={(categoryId) => handleFilterChange('categoryId', categoryId)}
                  placeholder="Select category..."
                  className="w-full"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Course Type</label>
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
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Course Level</label>
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
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Is Paid</label>
                <select
                  value={filters.isPaid}
                  onChange={(e) => handleFilterChange('isPaid', e.target.value)}
                  className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-200 dark:border-gray-600 rounded-lg sm:rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-600 focus:border-transparent transition-all duration-200 text-sm"
                >
                  <option value="">All</option>
                  <option value="true">Yes</option>
                  <option value="false">No</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Price</label>
                <input
                  type="text"
                  value={filters.price}
                  onChange={(e) => handleFilterChange('price', e.target.value)}
                  placeholder="Enter price..."
                  className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-200 dark:border-gray-600 rounded-lg sm:rounded-xl bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-600 focus:border-transparent transition-all duration-200 text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Discounted Price</label>
                <input
                  type="text"
                  value={filters.discountedPrice}
                  onChange={(e) => handleFilterChange('discountedPrice', e.target.value)}
                  placeholder="Enter discounted price..."
                  className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-200 dark:border-gray-600 rounded-lg sm:rounded-xl bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-600 focus:border-transparent transition-all duration-200 text-sm"
                />
              </div>
            </div>
            <div className="flex justify-end mt-4">
              <button
                onClick={applyFilters}
                className="px-4 sm:px-6 py-2 sm:py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-500 dark:to-indigo-500 text-white rounded-lg sm:rounded-xl hover:from-blue-700 hover:to-indigo-700 dark:hover:from-blue-600 dark:hover:to-indigo-600 transition-all duration-200 font-medium shadow-lg hover:shadow-xl text-sm"
              >
                Apply Filters
              </button>
            </div>
          </div>
        </div>
      )}
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
          <div className="space-y-4 p-4 bg-gray-50 dark:bg-gray-900/50 rounded-lg">
            {/* Course Header with Thumbnail and Basic Info */}
            <div className="flex items-start gap-4">
              {/* Thumbnail */}
              <div className="relative flex-shrink-0">
                {details?.thumbnailUrl || course?.thumbnailUrl ? (
                  <div className="relative overflow-hidden rounded-lg shadow-md">
                    <img 
                      src={details?.thumbnailUrl || course?.thumbnailUrl} 
                      alt={details?.title || course?.title}
                      className="w-24 h-24 object-cover"
                      onError={(e) => {
                        e.target.style.display = 'none';
                        e.target.parentElement.style.display = 'none';
                      }}
                    />
                  </div>
                ) : (
                  <div className="w-24 h-24 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-md">
                    <Image className="w-10 h-10 text-white" />
                  </div>
                )}
              </div>
              
              {/* Course Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1 min-w-0">
                    <h4 className="text-lg font-bold text-gray-900 dark:text-white mb-1">
                      {details?.title || course?.title || 'Untitled Course'}
                    </h4>
                    {details?.subtitle && (
                      <p className="text-sm text-gray-600 dark:text-gray-300">{details.subtitle}</p>
                    )}
                  </div>
                  
                  {/* Rating Badge */}
                  {(details?.averageRating > 0 || details?.totalReviews > 0) && (
                    <div className="flex-shrink-0 ml-4 bg-yellow-50 dark:bg-yellow-900/30 rounded-lg p-2 border border-yellow-200 dark:border-yellow-800">
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                        <span className="text-sm font-bold text-yellow-700 dark:text-yellow-300">
                          {details?.averageRating?.toFixed(1) || '0.0'}
                        </span>
                      </div>
                      <p className="text-xs text-yellow-600 dark:text-yellow-400 mt-0.5">
                        {details?.totalReviews || 0} reviews
                      </p>
                    </div>
                  )}
                </div>
                
                {/* Tags Row */}
                <div className="flex flex-wrap gap-2 mb-3">
                  {/* Course Type */}
                  <div className="inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold bg-indigo-100 dark:bg-indigo-900 text-indigo-800 dark:text-indigo-200">
                    <Layers className="w-3 h-3 mr-1" />
                    {details?.courseTypeName || course?.courseTypeName || 'Unknown Type'}
                  </div>
                  {/* Category */}
                  <div className="inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200">
                    <BookOpen className="w-3 h-3 mr-1" />
                    {details?.categoryName || course?.categoryName || 'Unknown'}
                  </div>
                  {/* Sub Category */}
                  {details?.subCategoryName && (
                    <div className="inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold bg-cyan-100 dark:bg-cyan-900 text-cyan-800 dark:text-cyan-200">
                      <Tag className="w-3 h-3 mr-1" />
                      {details.subCategoryName}
                    </div>
                  )}
                  {/* Course Level */}
                  <div className="inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold bg-orange-100 dark:bg-orange-900 text-orange-800 dark:text-orange-200">
                    <Globe className="w-3 h-3 mr-1" />
                    {details?.courseLevelTitle || details?.courseLevelName || course?.courseLevelName || 'Unknown'}
                  </div>
                  {/* Language */}
                  {details?.languageCode && (
                    <div className="inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200">
                      {details.languageCode.toUpperCase()}
                    </div>
                  )}
                  {/* Badges */}
                  {details?.badges?.map((badge, index) => (
                    <div key={index} className="inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200">
                      <Award className="w-3 h-3 mr-1" />
                      {badge?.badgeName}
                    </div>
                  ))}
                </div>

                {/* Pricing Info */}
                <div className="flex items-center gap-4">
                  {details?.isPaid || course?.isPaid ? (
                    <div className="flex items-center gap-2">
                      <div className="inline-flex items-center px-3 py-1.5 rounded-lg text-sm font-bold bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200">
                        <DollarSign className="w-4 h-4 mr-1" />
                        {details?.currencyCode || 'USD'} {details?.price?.toFixed(2) || course?.price?.toFixed(2) || '0.00'}
                      </div>
                      {details?.discountedPrice && details.discountedPrice < details.price && (
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-gray-500 line-through">
                            {details.currencyCode || 'USD'} {details.price?.toFixed(2)}
                          </span>
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-bold bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200">
                            {Math.round(((details.price - details.discountedPrice) / details.price) * 100)}% OFF
                          </span>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="inline-flex items-center px-3 py-1.5 rounded-lg text-sm font-bold bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200">
                      <Users className="w-4 h-4 mr-1" />
                      Free Course
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Content Grid - Description & Overview */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {/* Description Card */}
              <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700 shadow-sm">
                <div className="flex items-center mb-2">
                  <div className="w-8 h-8 bg-indigo-100 dark:bg-indigo-900 rounded-lg flex items-center justify-center mr-2">
                    <FileText className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                  </div>
                  <h5 className="text-sm font-bold text-gray-900 dark:text-white">Description</h5>
                </div>
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed text-sm">
                  {details?.description || course?.description || 'No description available'}
                </p>
              </div>
              
              {/* Overview Card */}
              {details?.overview && (
                <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700 shadow-sm">
                  <div className="flex items-center mb-2">
                    <div className="w-8 h-8 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center mr-2">
                      <Globe className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                    </div>
                    <h5 className="text-sm font-bold text-gray-900 dark:text-white">Overview</h5>
                  </div>
                  <p className="text-gray-700 dark:text-gray-300 leading-relaxed text-sm">
                    {details.overview}
                  </p>
                </div>
              )}
            </div>

            {/* Promo Video */}
            {(details?.promoVideoUrl || course?.promoVideoUrl) && (
              <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4 border border-green-200 dark:border-green-800">
                <div className="flex items-center mb-3">
                  <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center mr-2">
                    <Video className="w-4 h-4 text-white" />
                  </div>
                  <h5 className="text-sm font-bold text-gray-900 dark:text-white">Promo Video</h5>
                </div>
                <div className="lg:w-80">
                  <video
                    src={details?.promoVideoUrl || course?.promoVideoUrl}
                    className="w-full rounded-lg shadow-md"
                    controls
                    preload="metadata"
                  />
                </div>
              </div>
            )}

            {/* Course Sections with Lectures */}
            {(details?.sections?.length > 0 || course?.sections?.length > 0) && (
              <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4 border border-purple-200 dark:border-purple-800">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center">
                    <div className="w-8 h-8 bg-purple-500 rounded-lg flex items-center justify-center mr-2">
                      <Layers className="w-4 h-4 text-white" />
                    </div>
                    <div>
                      <h5 className="text-sm font-bold text-gray-900 dark:text-white">Course Sections</h5>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {details?.sections?.length || course?.sections?.length || 0} sections
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {(details?.sections || course?.sections || []).map((section, sectionIndex) => (
                    <div key={section.id || sectionIndex} className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-purple-200 dark:border-purple-700">
                      {/* Section Header */}
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                            <span className="text-sm font-bold text-white">{sectionIndex + 1}</span>
                          </div>
                          <div>
                            <h6 className="text-sm font-bold text-gray-900 dark:text-white">
                              {section.title || `Section ${sectionIndex + 1}`}
                            </h6>
                            {section.description && (
                              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{section.description}</p>
                            )}
                          </div>
                        </div>
                        <span className="text-xs font-medium text-purple-600 dark:text-purple-400 bg-purple-100 dark:bg-purple-900 px-2 py-1 rounded-full">
                          {section.lectures?.length || 0} lectures
                        </span>
                      </div>
                      
                      {/* Section Lectures */}
                      {section.lectures?.length > 0 && (
                        <div className="ml-11 space-y-2">
                          {section.lectures.map((lecture, lectureIndex) => (
                            <div key={lecture.id || lectureIndex} className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3 border border-gray-200 dark:border-gray-600">
                              <div className="flex items-start justify-between">
                                <div className="flex items-start space-x-2">
                                  <div className="w-6 h-6 bg-blue-100 dark:bg-blue-900 rounded flex items-center justify-center flex-shrink-0 mt-0.5">
                                    <Play className="w-3 h-3 text-blue-600 dark:text-blue-400" />
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                                      {lecture.title}
                                    </p>
                                    <div className="flex items-center gap-2 mt-1">
                                      <span className="text-xs text-gray-500 dark:text-gray-400">
                                        {lecture.lectureType || 'video'}
                                      </span>
                                      {lecture.isFreePreview && (
                                        <span className="text-xs font-medium text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900 px-1.5 py-0.5 rounded">
                                          Free Preview
                                        </span>
                                      )}
                                    </div>
                                    
                                    {/* LMS Content Details */}
                                    {lecture.lmsContent && (
                                      <div className="mt-2 p-2 bg-white dark:bg-gray-800 rounded border border-gray-200 dark:border-gray-600">
                                        <div className="grid grid-cols-2 gap-2 text-xs">
                                          <div>
                                            <span className="text-gray-500 dark:text-gray-400">Course:</span>
                                            <span className="ml-1 text-gray-700 dark:text-gray-300">{lecture.lmsContent.lmsCourseName}</span>
                                          </div>
                                          <div>
                                            <span className="text-gray-500 dark:text-gray-400">Module:</span>
                                            <span className="ml-1 text-gray-700 dark:text-gray-300">{lecture.lmsContent.lmsModuleName}</span>
                                          </div>
                                          <div>
                                            <span className="text-gray-500 dark:text-gray-400">Subject:</span>
                                            <span className="ml-1 text-gray-700 dark:text-gray-300">{lecture.lmsContent.lmsSubjectName}</span>
                                          </div>
                                          {lecture.lmsContent.duration && (
                                            <div>
                                              <span className="text-gray-500 dark:text-gray-400">Duration:</span>
                                              <span className="ml-1 text-gray-700 dark:text-gray-300">{lecture.lmsContent.duration}</span>
                                            </div>
                                          )}
                                        </div>
                                        {lecture.lmsContent.lectureOverview && (
                                          <p className="mt-2 text-xs text-gray-600 dark:text-gray-400">
                                            {lecture.lmsContent.lectureOverview}
                                          </p>
                                        )}
                                        {lecture.lmsContent.tags?.length > 0 && (
                                          <div className="mt-2 flex flex-wrap gap-1">
                                            {lecture.lmsContent.tags.map((tag, tagIndex) => (
                                              <span key={tagIndex} className="text-xs bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 px-1.5 py-0.5 rounded">
                                                {tag}
                                              </span>
                                            ))}
                                          </div>
                                        )}
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Course Reviews */}
            {details?.reviews?.length > 0 && (
              <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-4 border border-yellow-200 dark:border-yellow-800">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center">
                    <div className="w-8 h-8 bg-yellow-500 rounded-lg flex items-center justify-center mr-2">
                      <MessageSquare className="w-4 h-4 text-white" />
                    </div>
                    <div>
                      <h5 className="text-sm font-bold text-gray-900 dark:text-white">Course Reviews</h5>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {details.reviews.length} reviews • Average: {details.averageRating?.toFixed(1) || 'N/A'}
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-3 max-h-64 overflow-y-auto">
                  {details.reviews.map((review, index) => (
                    <div key={review.id || index} className="bg-white dark:bg-gray-800 rounded-lg p-3 border border-yellow-200 dark:border-yellow-700">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-1">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`w-4 h-4 ${i < review.rating ? 'text-yellow-500 fill-yellow-500' : 'text-gray-300 dark:text-gray-600'}`}
                            />
                          ))}
                          <span className="ml-2 text-sm font-bold text-gray-900 dark:text-white">{review.rating}/5</span>
                        </div>
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          {review.createdAt ? new Date(review.createdAt).toLocaleDateString() : 'Unknown date'}
                        </span>
                      </div>
                      <p className="text-sm text-gray-700 dark:text-gray-300">
                        {review.reviewText}
                      </p>
                    </div>
                  ))}
                </div>
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
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Total Courses</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{stats.totalCourses}</p>
              </div>
              <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-lg">
                <BookOpen className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
          </div>
          
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Active Courses</p>
                <p className="text-2xl font-bold text-green-600 dark:text-green-400 mt-1">{stats.activeCourses}</p>
              </div>
              <div className="p-3 bg-green-100 dark:bg-green-900 rounded-lg">
                <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
            </div>
          </div>
          
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Paid Courses</p>
                <p className="text-2xl font-bold text-purple-600 dark:text-purple-400 mt-1">{stats.paidCourses}</p>
              </div>
              <div className="p-3 bg-purple-100 dark:bg-purple-900 rounded-lg">
                <DollarSign className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              </div>
            </div>
          </div>
          
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Free Courses</p>
                <p className="text-2xl font-bold text-orange-600 dark:text-orange-400 mt-1">{stats.freeCourses}</p>
              </div>
              <div className="p-3 bg-orange-100 dark:bg-orange-900 rounded-lg">
                <Users className="w-6 h-6 text-orange-600 dark:text-orange-400" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Pagination */}
      <div className="mt-8 flex flex-col sm:flex-row items-center justify-between bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="text-sm text-gray-700 dark:text-gray-300 mb-4 sm:mb-0">
          <span className="font-medium text-gray-900 dark:text-white">{searchFilteredCourses?.length || 0}</span> of{' '}
          <span className="font-medium text-gray-900 dark:text-white">{paginationInfo.totalCount || 0}</span> courses
          {searchTerm && (
            <span className="ml-2 text-blue-600 dark:text-blue-400">
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
                ? 'bg-gray-100 dark:bg-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed' 
                : 'bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 hover:border-gray-400 dark:hover:border-gray-500 shadow-sm'
            }`}
          >
            <div className="flex items-center space-x-1">
              <ChevronDown className="w-4 h-4 rotate-90" />
              <span>Previous</span>
            </div>
          </button>
          
          <div className="flex items-center px-4 py-2 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 rounded-xl font-medium">
            <span>Page {paginationInfo.page}</span>
          </div>
          
          <button
            onClick={() => handlePageChange(paginationInfo.page + 1)}
            disabled={searchFilteredCourses?.length < paginationInfo.pageSize}
            className={`px-4 py-2 text-sm font-medium rounded-xl transition-all duration-200 ${
              searchFilteredCourses?.length < paginationInfo.pageSize
                ? 'bg-gray-100 dark:bg-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed' 
                : 'bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 hover:border-gray-400 dark:hover:border-gray-500 shadow-sm'
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

    </AdminPageLayout>
  );
};

export default CourseManagement;
