import React, { useState, useEffect } from 'react';
import { useAdminApi } from '../../../../hooks/useAdminApi';
import { useAdmin } from '../../../../hooks/useAdmin';
import { Search, RefreshCw, ChevronDown, ChevronUp, Image, DollarSign, Tag, BookOpen, Globe, CheckCircle, XCircle, Eye, Edit2, Trash2 } from 'lucide-react';
import GenericDropdown from '../../../../components/GenericDropdown';
import MultiSelectDropdown from '../../../../components/MultiSelectDropdown';
import CategoryDropdown from '../../../../components/CategoryDropdown';

const CourseManagement = () => {
  const { loading, error, page, totalPages, nextPage, prevPage, getCourseById, updateCourse } = useAdminApi();
  const { getCourseTypes, getCourseLevels, getCourseBadges, getAllCategories, createCourse, deleteCourse, getAllCoursesAdmin } = useAdmin();
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredCourses, setFilteredCourses] = useState([]);
  const [filtersLoading, setFiltersLoading] = useState(false);
  const [paginationInfo, setPaginationInfo] = useState({ page: 1, pageSize: 10, totalCount: 0 });
  const [filters, setFilters] = useState({
    page: 1,
    pageSize: 10,
    title: '',
    subtitle: '',
    description: '',
    overview: '',
    courseTypeId: 0,
    categoryId: 0,
    courseLevelId: 0,
    slug: '',
    thumbnailUrl: '',
    promoVideoUrl: '',
    price: '',
    discountedPrice: '',
    currencyCode: '',
    isPaid: ''
  });
  const [expandedCourses, setExpandedCourses] = useState({});
  const [courseDetails, setCourseDetails] = useState({});
  const [detailsLoading, setDetailsLoading] = useState({});
  
  // Update modal state
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [editingCourse, setEditingCourse] = useState(null);
  const [updateLoading, setUpdateLoading] = useState(false);
  const [updateError, setUpdateError] = useState('');
  
  // Create modal state
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createLoading, setCreateLoading] = useState(false);
  const [createError, setCreateError] = useState('');
  
  // Delete confirmation modal state
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [courseToDelete, setCourseToDelete] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteError, setDeleteError] = useState('');
  const [createFormData, setCreateFormData] = useState({
    title: '',
    subtitle: '',
    description: '',
    overview: '',
    languageCode: 'EN',
    courseTypeId: 0,
    categoryId: 0,
    courseLevelId: 0,
    isPaid: true,
    price: 0,
    discountedPrice: 0,
    currencyCode: 'USD',
    thumbnailUrl: '',
    promoVideoUrl: '',
    badgeIds: []
  });

  // Form state for update
  const [updateFormData, setUpdateFormData] = useState({
    title: '',
    subtitle: '',
    description: '',
    overview: '',
    languageCode: 'EN',
    courseTypeId: 0,
    categoryId: 0,
    courseLevelId: 0,
    isPaid: true,
    price: 0,
    discountedPrice: 0,
    currencyCode: 'USD',
    thumbnailUrl: '',
    promoVideoUrl: '',
    badgeIds: []
  });

  // State for dropdown data
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

  // Filter courses based on search term (keeping for backward compatibility)
  const searchFilteredCourses = filteredCourses?.filter(course =>
    course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    course.subtitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
    course.categoryName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    course.courseLevelName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    course.courseTypeName.toLowerCase().includes(searchTerm.toLowerCase())
  );
  console.log(filteredCourses)

  // Fetch dropdown data on component mount
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
        console.error('Error fetching categories:', error);
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
        console.error('Error fetching course types:', error);
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
        console.error('Error fetching course levels:', error);
        setDropdownError(prev => ({ ...prev, courseLevels: 'Failed to load course levels' }));
      } finally {
        setDropdownLoading(prev => ({ ...prev, courseLevels: false }));
      }

      // Fetch Badges
      setDropdownLoading(prev => ({ ...prev, badges: true }));
      try {
        const data = await getCourseBadges();
        setBadges(data);
        setDropdownError(prev => ({ ...prev, badges: '' }));
      } catch (error) {
        console.error('Error fetching badges:', error);
        setDropdownError(prev => ({ ...prev, badges: 'Failed to load badges' }));
      } finally {
        setDropdownLoading(prev => ({ ...prev, badges: false }));
      }
    };

    fetchDropdownData();
  }, [getAllCategories, getCourseTypes, getCourseLevels, getCourseBadges]);

  // Handle view course details
  const handleViewDetails = async (courseId) => {
    // Toggle expansion
    setExpandedCourses(prev => ({
      ...prev,
      [courseId]: !prev[courseId]
    }));

    // Fetch details if not already loaded and row is being expanded
    if (!expandedCourses[courseId] && !courseDetails[courseId]) {
      try {
        setDetailsLoading(prev => ({ ...prev, [courseId]: true }));
        const courseDetailData = await getCourseById(courseId);
        setCourseDetails(prev => ({
          ...prev,
          [courseId]: courseDetailData
        }));
      } catch (error) {
        console.error('Error fetching course details:', error);
      } finally {
        setDetailsLoading(prev => ({ ...prev, [courseId]: false }));
      }
    }
  };

  // Handle edit course
  const handleEdit = async (course) => {
    try {
      // Fetch full course details to get all available data
      const courseDetailData = await getCourseById(course.id);
      setEditingCourse(courseDetailData);
      
      // Populate form with course data
      setUpdateFormData({
        title: courseDetailData.title || '',
        subtitle: courseDetailData.subtitle || '',
        description: courseDetailData.description || '',
        overview: courseDetailData.overview || '',
        languageCode: courseDetailData.languageCode || 'EN',
        courseTypeId: courseDetailData.courseTypeId || 0,
        categoryId: courseDetailData.categoryId || 0,
        courseLevelId: courseDetailData.courseLevelId || 0,
        isPaid: courseDetailData.isPaid ?? true,
        price: courseDetailData.price || 0,
        discountedPrice: courseDetailData.discountedPrice || 0,
        currencyCode: courseDetailData.currencyCode || 'USD',
        thumbnailUrl: courseDetailData.thumbnailUrl || '',
        promoVideoUrl: courseDetailData.promoVideoUrl || '',
        badgeIds: courseDetailData.badges?.map(badge => badge.id) || []
      });
      
      setShowUpdateModal(true);
      setUpdateError('');
    } catch (error) {
      console.error('Error fetching course details for edit:', error);
      setUpdateError('Failed to load course details for editing');
    }
  };

  // Handle form input changes
  const handleUpdateFormChange = (e) => {
    const { name, value, type, checked } = e.target;
    setUpdateFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : type === 'number' ? parseFloat(value) || 0 : value
    }));
  };

  // Handle update course submission
  const handleUpdateCourse = async (e) => {
    e.preventDefault();
    if (!editingCourse) return;
    
    try {
      setUpdateLoading(true);
      setUpdateError('');
      
      await updateCourse(editingCourse.id, updateFormData);
      
      // Update the course details in expanded view if it's open
      if (expandedCourses[editingCourse.id]) {
        const updatedCourseData = await getCourseById(editingCourse.id);
        setCourseDetails(prev => ({
          ...prev,
          [editingCourse.id]: updatedCourseData
        }));
      }
      
      setShowUpdateModal(false);
      setEditingCourse(null);
      
      // Show success message (you might want to add a toast notification)
      alert('Course updated successfully!');
    } catch (error) {
      console.error('Error updating course:', error);
      setUpdateError(error.response?.data?.message || 'Failed to update course');
    } finally {
      setUpdateLoading(false);
    }
  };

  // Close update modal
  const closeUpdateModal = () => {
    setShowUpdateModal(false);
    setEditingCourse(null);
    setUpdateError('');
  };

  // Handle create course form changes
  const handleCreateFormChange = (e) => {
    const { name, value, type, checked } = e.target;
    setCreateFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : type === 'number' ? parseFloat(value) || 0 : value
    }));
  };

  // Handle create course submission
  const handleCreateCourse = async (e) => {
    e.preventDefault();
    
    try {
      setCreateLoading(true);
      setCreateError('');
      
      await createCourse(createFormData);
      
      setShowCreateModal(false);
      setCreateFormData({
        title: '',
        subtitle: '',
        description: '',
        overview: '',
        languageCode: 'EN',
        courseTypeId: 0,
        categoryId: 0,
        courseLevelId: 0,
        isPaid: true,
        price: 0,
        discountedPrice: 0,
        currencyCode: 'USD',
        thumbnailUrl: '',
        promoVideoUrl: '',
        badgeIds: []
      });
      
      // Show success message (you might want to add a toast notification)
      alert('Course created successfully!');
    } catch (error) {
      console.error('Error creating course:', error);
      setCreateError(error.response?.data?.message || 'Failed to create course');
    } finally {
      setCreateLoading(false);
    }
  };

  // Close create modal
  const closeCreateModal = () => {
    setShowCreateModal(false);
    setCreateError('');
    setCreateFormData({
      title: '',
      subtitle: '',
      description: '',
      overview: '',
      languageCode: 'EN',
      courseTypeId: 0,
      categoryId: 0,
      courseLevelId: 0,
      isPaid: true,
      price: 0,
      discountedPrice: 0,
      currencyCode: 'USD',
      thumbnailUrl: '',
      promoVideoUrl: '',
      badgeIds: []
    });
  };

  // Handle delete course confirmation
  const handleDeleteClick = (course) => {
    setCourseToDelete(course);
    setShowDeleteModal(true);
    setDeleteError('');
  };

  // Handle delete course submission
  const handleDeleteCourse = async () => {
    if (!courseToDelete) return;
    
    try {
      setDeleteLoading(true);
      setDeleteError('');
      
      await deleteCourse(courseToDelete.id);
      
      setShowDeleteModal(false);
      setCourseToDelete(null);
      
      // Show success message (you might want to add a toast notification)
      alert('Course deleted successfully!');
    } catch (error) {
      console.error('Error deleting course:', error);
      setDeleteError(error.response?.data?.message || 'Failed to delete course');
    } finally {
      setDeleteLoading(false);
    }
  };

  // Close delete modal
  const closeDeleteModal = () => {
    setShowDeleteModal(false);
    setCourseToDelete(null);
    setDeleteError('');
  };

  // Handle filter changes
  const handleFilterChange = (field, value) => {
    setFilters(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Apply filters and fetch courses
  const applyFilters = async (usePagination = true) => {
    try {
      setFiltersLoading(true);
      
      // Remove empty values from filters, but keep pagination params
      const activeFilters = Object.fromEntries(
        Object.entries(filters).filter(([key, value]) => {
          // Always include pagination params
          if (key === 'page' || key === 'pageSize') {
            return true;
          }
          // Filter out empty values for other fields
          return value !== '' && value !== 0 && value !== null && value !== undefined;
        })
      );
      
      console.log('Applying filters:', activeFilters);
      const coursesData = await getAllCoursesAdmin(activeFilters);
      console.log('Received courses data:', coursesData);
      
      // Handle different response structures
      const coursesArray = coursesData?.items || coursesData?.data || coursesData || [];
      setFilteredCourses(coursesArray);
      
      // Update pagination info from response
      if (coursesData?.page !== undefined) {
        setPaginationInfo({
          page: coursesData.page,
          pageSize: coursesData.pageSize,
          totalCount: coursesData.totalCount || coursesData.totalCount || 0
        });
      }
    } catch (error) {
      console.error('Error applying filters:', error);
      setFilteredCourses([]);
      setPaginationInfo({ page: 1, pageSize: 10, totalCount: 0 });
    } finally {
      setFiltersLoading(false);
    }
  };

  // Reset filters
  const resetFilters = () => {
    setFilters({
      page: 1,
      pageSize: 10,
      title: '',
      subtitle: '',
      description: '',
      overview: '',
      courseTypeId: 0,
      categoryId: 0,
      courseLevelId: 0,
      slug: '',
      thumbnailUrl: '',
      promoVideoUrl: '',
      price: '',
      discountedPrice: '',
      currencyCode: '',
      isPaid: ''
    });
    setFilteredCourses([]);
    setPaginationInfo({ page: 1, pageSize: 10, totalCount: 0 });
  };

  // Handle page changes
  const handlePageChange = async (newPage) => {
    debugger;
    if (newPage < 1) return;
    
    console.log('Changing to page:', newPage);
    console.log('Current filters:', filters);
    console.log('Current paginationInfo:', paginationInfo);
    
    // Create updated filters using current filters state but with new page
    const updatedFilters = { ...filters, page: newPage };
    console.log('Updated filters:', updatedFilters);
    
    // Update both states
    setFilters(updatedFilters);
    
    // Apply filters with the updated filters directly
    try {
      setFiltersLoading(true);
      
      // Remove empty values from filters, but keep pagination params
      const activeFilters = Object.fromEntries(
        Object.entries(updatedFilters).filter(([key, value]) => {
          // Always include pagination params
          if (key === 'page' || key === 'pageSize') {
            return true;
          }
          // Filter out empty values for other fields
          return value !== '' && value !== 0 && value !== null && value !== undefined;
        })
      );
      
      console.log('Applying page change filters:', activeFilters);
      const coursesData = await getAllCoursesAdmin(activeFilters);
      console.log('Received courses data:', coursesData);
      
      // Handle different response structures
      const coursesArray = coursesData?.items || coursesData?.data || coursesData || [];
      setFilteredCourses(coursesArray);
      
      // Update pagination info from response
      if (coursesData?.page !== undefined) {
        debugger;
        const newPaginationInfo = {
          page: coursesData.page,
          pageSize: coursesData.pageSize,
          totalCount: coursesData.totalCount || coursesData.totalCount || 0
        };
        console.log('Setting pagination info:', newPaginationInfo);
        setPaginationInfo(newPaginationInfo);
      }
    } catch (error) {
      console.error('Error applying page change:', error);
      setFilteredCourses([]);
      setPaginationInfo({ page: 1, pageSize: 10, totalCount: 0 });
    } finally {
      setFiltersLoading(false);
    }
  };

  // Load filtered courses on component mount and when filters change
  useEffect(() => {
    applyFilters();
  }, []); // Only run on mount

  if (filtersLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <RefreshCw className="w-8 h-8 animate-spin text-blue-500" />
        <span className="ml-2 text-gray-600">Loading courses...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-red-500 p-4">{error}</div>
    );
  }

  return (
    <div className="p-6 max-w-full mx-auto bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Course Management</h1>
        <p className="text-gray-600">Manage and monitor all your courses in one place</p>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Course Filters</h2>
          <div className="flex items-center gap-2">
            <button
              onClick={resetFilters}
              className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Reset Filters
            </button>
            <button
              onClick={applyFilters}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Apply Filters
            </button>
          </div>
        </div>

        {/* Text Input Filters */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
            <input
              type="text"
              value={filters.title}
              onChange={(e) => handleFilterChange('title', e.target.value)}
              placeholder="Search by title..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Subtitle</label>
            <input
              type="text"
              value={filters.subtitle}
              onChange={(e) => handleFilterChange('subtitle', e.target.value)}
              placeholder="Search by subtitle..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <input
              type="text"
              value={filters.description}
              onChange={(e) => handleFilterChange('description', e.target.value)}
              placeholder="Search by description..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Overview</label>
            <input
              type="text"
              value={filters.overview}
              onChange={(e) => handleFilterChange('overview', e.target.value)}
              placeholder="Search by overview..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Dropdown Filters */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
            <CategoryDropdown
              categories={categories}
              value={filters.categoryId}
              onChange={(categoryId) => handleFilterChange('categoryId', categoryId)}
              placeholder="Select category..."
              className="w-full"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Course Type</label>
            <GenericDropdown
              items={courseTypes.map(type => ({ value: type.id, label: type.description }))}
              value={filters.Id}
              onChange={(value) => handleFilterChange('courseTypeId', value)}
              placeholder="Select course type..."
              className="w-full"
              displayField="label"
              valueField="value"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Course Level</label>
            <GenericDropdown
              items={courseLevels.map(level => ({ value: level.id, label: level.title }))}
              value={filters.Id}
              onChange={(value) => handleFilterChange('courseLevelId', value)}
              placeholder="Select course level..."
              className="w-full"
              displayField="label"
              valueField="value"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Is Paid</label>
            <select
              value={filters.isPaid}
              onChange={(e) => handleFilterChange('isPaid', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All</option>
              <option value="true">Yes</option>
              <option value="false">No</option>
            </select>
          </div>
        </div>

        {/* URL and Pricing Filters */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Slug</label>
            <input
              type="text"
              value={filters.slug}
              onChange={(e) => handleFilterChange('slug', e.target.value)}
              placeholder="Search by slug..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Thumbnail URL</label>
            <input
              type="text"
              value={filters.thumbnailUrl}
              onChange={(e) => handleFilterChange('thumbnailUrl', e.target.value)}
              placeholder="Search by thumbnail URL..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Promo Video URL</label>
            <input
              type="text"
              value={filters.promoVideoUrl}
              onChange={(e) => handleFilterChange('promoVideoUrl', e.target.value)}
              placeholder="Search by promo video URL..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Currency Code</label>
            <input
              type="text"
              value={filters.currencyCode}
              onChange={(e) => handleFilterChange('currencyCode', e.target.value)}
              placeholder="e.g., USD"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Price Filters */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Price</label>
            <input
              type="number"
              value={filters.price}
              onChange={(e) => handleFilterChange('price', e.target.value)}
              placeholder="Enter price..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Discounted Price</label>
            <input
              type="number"
              value={filters.discountedPrice}
              onChange={(e) => handleFilterChange('discountedPrice', e.target.value)}
              placeholder="Enter discounted price..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <div className="flex items-center justify-between">
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
          >
            <span>Create Course</span>
          </button>
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <span className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full font-medium">
              {filteredCourses?.length || 0} courses
            </span>
          </div>
        </div>
      </div>

      {/* Courses Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Course</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Description</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Category</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Type</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Level</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Language</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Price</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Tags</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-100">
              {filteredCourses?.length === 0 ? (
                <tr>
                  <td colSpan="10" className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center">
                      <BookOpen className="w-12 h-12 text-gray-300 mb-3" />
                      <p className="text-gray-500 text-lg font-medium">No courses found</p>
                      <p className="text-gray-400 text-sm mt-1">Try adjusting your search criteria</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredCourses?.map(course => (
                  <React.Fragment key={course.id}>
                    <tr className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-3">
                          <div className="flex-shrink-0">
                            {course.thumbnailUrl ? (
                              <img 
                                className="h-12 w-12 rounded-lg object-cover border border-gray-200" 
                                src={course.thumbnailUrl} 
                                alt={course.title}
                                onError={(e) => {
                                  e.target.onerror = null;
                                  e.target.style.display = 'none';
                                  e.target.nextSibling.style.display = 'flex';
                                }}
                              />
                            ) : null}
                            <div className="h-12 w-12 rounded-lg bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center" style={{ display: course.thumbnailUrl ? 'none' : 'flex' }}>
                              <Image className="w-6 h-6 text-blue-600" />
                            </div>
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-gray-900 truncate">{course.title}</p>
                            <p className="text-sm text-gray-500 truncate">{course.subtitle}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="max-w-xs">
                          <p className="text-sm text-gray-600 line-clamp-2" title={course.description}>
                            {course.description}
                          </p>
                          {course.description && course.description.length > 100 && (
                            <button className="text-xs text-blue-600 hover:text-blue-800 mt-1">
                              Read more
                            </button>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                          {course.categoryName}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-gray-600">{course.courseTypeName}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                          {course.courseLevelName}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center text-sm text-gray-600">
                          <Globe className="w-4 h-4 mr-1 text-gray-400" />
                          {course.languageCode}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <DollarSign className="w-4 h-4 mr-1 text-gray-400" />
                          <div className="text-sm">
                            {course.discountedPrice < course.price ? (
                              <div className="flex items-center space-x-2">
                                <span className="font-semibold text-green-600">{course.discountedPrice}</span>
                                <span className="text-gray-400 line-through text-xs">{course.price}</span>
                              </div>
                            ) : (
                              <span className="font-semibold text-gray-900">{course.price}</span>
                            )}
                            <span className="text-gray-500 ml-1">{course.currencyCode}</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          {course.isActive ? (
                            <div className="flex items-center text-green-600">
                              <CheckCircle className="w-4 h-4 mr-1" />
                              <span className="text-sm font-medium">Active</span>
                            </div>
                          ) : (
                            <div className="flex items-center text-red-600">
                              <XCircle className="w-4 h-4 mr-1" />
                              <span className="text-sm font-medium">Inactive</span>
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-wrap gap-1">
                          {course.courseTags?.map((tag, index) => (
                            <span key={index} className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200">
                              <Tag className="w-3 h-3 mr-1" />
                              {tag}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => handleViewDetails(course.id)}
                            className="text-blue-600 hover:text-blue-800 hover:bg-blue-50 p-2 rounded-lg transition-colors flex items-center space-x-1"
                            title="View Course Details"
                          >
                            <Eye className="w-4 h-4" />
                            {expandedCourses[course.id] ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                          </button>
                          <button
                            onClick={() => handleEdit(course)}
                            className="text-green-600 hover:text-green-800 hover:bg-green-50 p-2 rounded-lg transition-colors"
                            title="Edit Course"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteClick(course)}
                            className="text-red-600 hover:text-red-800 hover:bg-red-50 p-2 rounded-lg transition-colors"
                            title="Delete Course"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                    
                    {/* Accordion Row for Course Details */}
                    {expandedCourses[course.id] && (
                      <tr className="bg-blue-50 border-b border-blue-200">
                        <td colSpan="10" className="px-6 py-4">
                          {detailsLoading[course.id] ? (
                            <div className="flex items-center justify-center py-8">
                              <RefreshCw className="w-6 h-6 animate-spin text-blue-500" />
                              <span className="ml-2 text-gray-600">Loading course details...</span>
                            </div>
                          ) : courseDetails[course.id] ? (
                            <div className="space-y-4">
                              {/* Course Header */}
                              <div className="flex items-start space-x-4 pb-4 border-b border-blue-200">
                                {courseDetails[course.id].thumbnailUrl ? (
                                  <img 
                                    src={courseDetails[course.id].thumbnailUrl} 
                                    alt={courseDetails[course.id].title}
                                    className="w-20 h-20 rounded-lg object-cover border border-gray-200"
                                  />
                                ) : (
                                  <div className="w-20 h-20 rounded-lg bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center">
                                    <Image className="w-10 h-10 text-blue-600" />
                                  </div>
                                )}
                                <div className="flex-1">
                                  <h4 className="text-lg font-bold text-gray-900">{courseDetails[course.id].title}</h4>
                                  {courseDetails[course.id].subtitle && (
                                    <p className="text-gray-600 mt-1">{courseDetails[course.id].subtitle}</p>
                                  )}
                                  <div className="flex items-center space-x-3 mt-2">
                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                                      {courseDetails[course.id].categoryName}
                                    </span>
                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                                      {courseDetails[course.id].courseLevelName}
                                    </span>
                                    {courseDetails[course.id].badges?.map((badge, index) => (
                                      <span key={index} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                                        {badge?.badgeName}
                                      </span>
                                    ))}
                                  </div>
                                </div>
                              </div>

                              {/* Course Details Grid */}
                              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div>
                                  <h5 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Course Type</h5>
                                  <p className="mt-1 text-sm text-gray-900">{courseDetails[course.id].courseTypeName}</p>
                                </div>
                                <div>
                                  <h5 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Language</h5>
                                  <div className="mt-1 flex items-center text-sm text-gray-900">
                                    <Globe className="w-3 h-3 mr-1 text-gray-400" />
                                    {courseDetails[course.id].languageCode}
                                  </div>
                                </div>
                                <div>
                                  <h5 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Pricing</h5>
                                  <div className="mt-1 flex items-center">
                                    <DollarSign className="w-3 h-3 mr-1 text-gray-400" />
                                    <div className="text-sm">
                                      {courseDetails[course.id].discountedPrice < courseDetails[course.id].price ? (
                                        <div className="flex items-center space-x-2">
                                          <span className="font-semibold text-green-600">{courseDetails[course.id].discountedPrice}</span>
                                          <span className="text-gray-400 line-through text-xs">{courseDetails[course.id].price}</span>
                                        </div>
                                      ) : (
                                        <span className="font-semibold text-gray-900">{courseDetails[course.id].price}</span>
                                      )}
                                      <span className="text-gray-500 ml-1">{courseDetails[course.id].currencyCode}</span>
                                    </div>
                                  </div>
                                </div>
                                <div>
                                  <h5 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Course ID</h5>
                                  <p className="mt-1 text-sm text-gray-900 font-mono">{courseDetails[course.id].id}</p>
                                </div>
                                <div>
                                  <h5 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Slug</h5>
                                  <p className="mt-1 text-sm text-gray-900 font-mono text-xs">{courseDetails[course.id].slug}</p>
                                </div>
                                <div>
                                  <h5 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Rating</h5>
                                  <div className="mt-1 text-sm text-gray-900">
                                    {courseDetails[course.id].averageRating || 'N/A'} 
                                    {courseDetails[course.id].totalReviews && ` (${courseDetails[course.id].totalReviews} reviews)`}
                                  </div>
                                </div>
                              </div>

                              {/* Description and Overview */}
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                  <h5 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Description</h5>
                                  <p className="mt-2 text-sm text-gray-700 leading-relaxed">
                                    {courseDetails[course.id].description || 'No description available'}
                                  </p>
                                </div>
                                {courseDetails[course.id].overview && (
                                  <div>
                                    <h5 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Overview</h5>
                                    <p className="mt-2 text-sm text-gray-700 leading-relaxed">
                                      {courseDetails[course.id].overview}
                                    </p>
                                  </div>
                                )}
                              </div>

                              {/* Tags */}
                              {courseDetails[course.id].courseTags && courseDetails[course.id].courseTags.length > 0 && (
                                <div>
                                  <h5 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Tags</h5>
                                  <div className="mt-2 flex flex-wrap gap-2">
                                    {courseDetails[course.id].courseTags.map((tag, index) => (
                                      <span key={index} className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200">
                                        <Tag className="w-3 h-3 mr-1" />
                                        {tag}
                                      </span>
                                    ))}
                                  </div>
                                </div>
                              )}

                              {/* Media URLs */}
                              {courseDetails[course.id].promoVideoUrl && (
                                <div>
                                  <h5 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Promo Video</h5>
                                  <a 
                                    href={courseDetails[course.id].promoVideoUrl} 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="mt-1 text-sm text-blue-600 hover:text-blue-800 truncate block"
                                  >
                                    {courseDetails[course.id].promoVideoUrl}
                                  </a>
                                </div>
                              )}
                            </div>
                          ) : (
                            <div className="text-center text-gray-500 py-4">
                              Failed to load course details.
                            </div>
                          )}
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Enhanced Pagination */}
      <div className="mt-6 flex items-center justify-between">
        <div className="text-sm text-gray-700">
          Showing <span className="font-medium">{filteredCourses?.length || 0}</span> of{' '}
          <span className="font-medium">{paginationInfo.totalCount || 0}</span> courses
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => handlePageChange(paginationInfo.page - 1)}
            disabled={paginationInfo.page === 1}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition-all ${
              paginationInfo.page === 1 
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
            }`}
          >
            Previous
          </button>
          
          <span className="px-3 py-2 text-sm text-gray-700">
            Page {paginationInfo.page}
          </span>
          
          <button
            onClick={() => handlePageChange(paginationInfo.page + 1)}
            disabled={filteredCourses?.length < paginationInfo.pageSize}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition-all ${
              filteredCourses?.length < paginationInfo.pageSize
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
            }`}
          >
            Next
          </button>
        </div>
      </div>

      {/* Update Course Modal */}
      {showUpdateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900">Update Course</h2>
              <button
                onClick={closeUpdateModal}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <XCircle className="w-6 h-6" />
              </button>
            </div>
            
            <form onSubmit={handleUpdateCourse} className="p-6">
              {/* Error Display */}
              {updateError && (
                <div className="mb-4 p-4 bg-red-50 border border-red-200 text-red-600 rounded-lg">
                  {updateError}
                </div>
              )}
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Left Column */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
                    <input
                      type="text"
                      name="title"
                      value={updateFormData.title}
                      onChange={handleUpdateFormChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter course title"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Subtitle</label>
                    <input
                      type="text"
                      name="subtitle"
                      value={updateFormData.subtitle}
                      onChange={handleUpdateFormChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter course subtitle"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Description *</label>
                    <textarea
                      name="description"
                      value={updateFormData.description}
                      onChange={handleUpdateFormChange}
                      required
                      rows="3"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter course description"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Overview</label>
                    <textarea
                      name="overview"
                      value={updateFormData.overview}
                      onChange={handleUpdateFormChange}
                      rows="3"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter course overview"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Language Code</label>
                    <select
                      name="languageCode"
                      value={updateFormData.languageCode}
                      onChange={handleUpdateFormChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="EN">English</option>
                      <option value="ES">Spanish</option>
                      <option value="FR">French</option>
                      <option value="DE">German</option>
                      <option value="IT">Italian</option>
                      <option value="PT">Portuguese</option>
                      <option value="RU">Russian</option>
                      <option value="ZH">Chinese</option>
                      <option value="JA">Japanese</option>
                      <option value="AR">Arabic</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Course Type</label>
                    {dropdownLoading.courseTypes ? (
                      <div className="flex items-center">
                        <RefreshCw className="w-4 h-4 mr-2 animate-spin text-gray-400" />
                        <span className="text-gray-500">Loading course types...</span>
                      </div>
                    ) : dropdownError.courseTypes ? (
                      <div className="text-red-500 text-sm">{dropdownError.courseTypes}</div>
                    ) : (
                      <GenericDropdown
                        items={courseTypes}
                        value={updateFormData.courseTypeId}
                        onChange={(value) => setUpdateFormData(prev => ({ ...prev, courseTypeId: value }))}
                        placeholder="Select a course type"
                        className="w-full"
                      />
                    )}
                  </div>
                </div>
                
                {/* Right Column */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                    {dropdownLoading.categories ? (
                      <div className="flex items-center">
                        <RefreshCw className="w-4 h-4 mr-2 animate-spin text-gray-400" />
                        <span className="text-gray-500">Loading categories...</span>
                      </div>
                    ) : dropdownError.categories ? (
                      <div className="text-red-500 text-sm">{dropdownError.categories}</div>
                    ) : (
                      <CategoryDropdown
                        categories={categories}
                        value={updateFormData.categoryId}
                        onChange={(value) => setUpdateFormData(prev => ({ ...prev, categoryId: value }))}
                        placeholder="Select a category"
                        className="w-full"
                      />
                    )}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Course Level</label>
                    {dropdownLoading.courseLevels ? (
                      <div className="flex items-center">
                        <RefreshCw className="w-4 h-4 mr-2 animate-spin text-gray-400" />
                        <span className="text-gray-500">Loading course levels...</span>
                      </div>
                    ) : dropdownError.courseLevels ? (
                      <div className="text-red-500 text-sm">{dropdownError.courseLevels}</div>
                    ) : (
                      <GenericDropdown
                        items={courseLevels}
                        value={updateFormData.courseLevelId}
                        onChange={(value) => setUpdateFormData(prev => ({ ...prev, courseLevelId: value }))}
                        placeholder="Select a course level"
                        className="w-full"
                      />
                    )}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Is Paid</label>
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        name="isPaid"
                        checked={updateFormData.isPaid}
                        onChange={handleUpdateFormChange}
                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      />
                      <span className="ml-2 text-sm text-gray-700">This is a paid course</span>
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Price</label>
                    <input
                      type="number"
                      name="price"
                      value={updateFormData.price}
                      onChange={handleUpdateFormChange}
                      min="0"
                      step="0.01"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter price"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Discounted Price</label>
                    <input
                      type="number"
                      name="discountedPrice"
                      value={updateFormData.discountedPrice}
                      onChange={handleUpdateFormChange}
                      min="0"
                      step="0.01"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter discounted price"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Currency Code</label>
                    <select
                      name="currencyCode"
                      value={updateFormData.currencyCode}
                      onChange={handleUpdateFormChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="USD">USD - US Dollar</option>
                      <option value="EUR">EUR - Euro</option>
                      <option value="GBP">GBP - British Pound</option>
                      <option value="JPY">JPY - Japanese Yen</option>
                      <option value="CAD">CAD - Canadian Dollar</option>
                      <option value="AUD">AUD - Australian Dollar</option>
                      <option value="INR">INR - Indian Rupee</option>
                      <option value="CNY">CNY - Chinese Yuan</option>
                    </select>
                  </div>
                </div>
              </div>
              
              {/* Media URLs */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Thumbnail URL</label>
                  <input
                    type="url"
                    name="thumbnailUrl"
                    value={updateFormData.thumbnailUrl}
                    onChange={handleUpdateFormChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="https://example.com/thumbnail.jpg"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Promo Video URL</label>
                  <input
                    type="url"
                    name="promoVideoUrl"
                    value={updateFormData.promoVideoUrl}
                    onChange={handleUpdateFormChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="https://example.com/promo-video.mp4"
                  />
                </div>
              </div>
              
              {/* Badge IDs */}
              <div className="mt-6">
                <label className="block text-sm font-medium text-gray-700 mb-1">Badges</label>
                {dropdownLoading.badges ? (
                  <div className="flex items-center">
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin text-gray-400" />
                    <span className="text-gray-500">Loading badges...</span>
                  </div>
                ) : dropdownError.badges ? (
                  <div className="text-red-500 text-sm">{dropdownError.badges}</div>
                ) : (
                  <MultiSelectDropdown
                    items={badges}
                    values={updateFormData.badgeIds}
                    onChange={(values) => setUpdateFormData(prev => ({ ...prev, badgeIds: values }))}
                    placeholder="Select badges"
                    className="w-full"
                    displayField="badgeName"
                    valueField="id"
                  />
                )}
              </div>
              
              {/* Form Actions */}
              <div className="flex justify-end space-x-3 mt-8 pt-6 border-t border-gray-200">
                <button
                  type="button"
                  onClick={closeUpdateModal}
                  className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={updateLoading}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                >
                  {updateLoading ? (
                    <>
                      <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                      Updating...
                    </>
                  ) : (
                    'Update Course'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Create Course Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900">Create New Course</h2>
              <button
                onClick={closeCreateModal}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleCreateCourse} className="p-6">
              {createError && (
                <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-red-600">{createError}</p>
                </div>
              )}

              {/* Basic Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Course Title *</label>
                  <input
                    type="text"
                    name="title"
                    value={createFormData.title}
                    onChange={handleCreateFormChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter course title"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Subtitle</label>
                  <input
                    type="text"
                    name="subtitle"
                    value={createFormData.subtitle}
                    onChange={handleCreateFormChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter course subtitle"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Course Type</label>
                  {dropdownLoading.courseTypes ? (
                    <div className="flex items-center">
                      <RefreshCw className="w-4 h-4 mr-2 animate-spin text-gray-400" />
                      <span className="text-gray-500">Loading course types...</span>
                    </div>
                  ) : dropdownError.courseTypes ? (
                    <div className="text-red-500 text-sm">{dropdownError.courseTypes}</div>
                  ) : (
                    <GenericDropdown
                      items={courseTypes}
                      value={createFormData.courseTypeId}
                      onChange={(value) => setCreateFormData(prev => ({ ...prev, courseTypeId: value }))}
                      placeholder="Select a course type"
                      className="w-full"
                    />
                  )}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                  {dropdownLoading.categories ? (
                    <div className="flex items-center">
                      <RefreshCw className="w-4 h-4 mr-2 animate-spin text-gray-400" />
                      <span className="text-gray-500">Loading categories...</span>
                    </div>
                  ) : dropdownError.categories ? (
                    <div className="text-red-500 text-sm">{dropdownError.categories}</div>
                  ) : (
                    <CategoryDropdown
                      categories={categories}
                      value={createFormData.categoryId}
                      onChange={(value) => setCreateFormData(prev => ({ ...prev, categoryId: value }))}
                      placeholder="Select a category"
                      className="w-full"
                    />
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Course Level</label>
                  {dropdownLoading.courseLevels ? (
                    <div className="flex items-center">
                      <RefreshCw className="w-4 h-4 mr-2 animate-spin text-gray-400" />
                      <span className="text-gray-500">Loading course levels...</span>
                    </div>
                  ) : dropdownError.courseLevels ? (
                    <div className="text-red-500 text-sm">{dropdownError.courseLevels}</div>
                  ) : (
                    <GenericDropdown
                      items={courseLevels}
                      value={createFormData.courseLevelId}
                      onChange={(value) => setCreateFormData(prev => ({ ...prev, courseLevelId: value }))}
                      placeholder="Select a course level"
                      className="w-full"
                    />
                  )}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Language Code</label>
                  <select
                    name="languageCode"
                    value={createFormData.languageCode}
                    onChange={handleCreateFormChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="EN">English</option>
                    <option value="ES">Spanish</option>
                    <option value="FR">French</option>
                    <option value="DE">German</option>
                    <option value="IT">Italian</option>
                    <option value="PT">Portuguese</option>
                    <option value="RU">Russian</option>
                    <option value="ZH">Chinese</option>
                    <option value="JA">Japanese</option>
                    <option value="AR">Arabic</option>
                  </select>
                </div>
              </div>

              {/* Description and Overview */}
              <div className="mt-6">
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  name="description"
                  value={createFormData.description}
                  onChange={handleCreateFormChange}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter course description"
                />
              </div>

              <div className="mt-6">
                <label className="block text-sm font-medium text-gray-700 mb-1">Overview</label>
                <textarea
                  name="overview"
                  value={createFormData.overview}
                  onChange={handleCreateFormChange}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter course overview"
                />
              </div>

              {/* Pricing */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Is Paid</label>
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      name="isPaid"
                      checked={createFormData.isPaid}
                      onChange={handleCreateFormChange}
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <span className="ml-2 text-sm text-gray-700">Paid Course</span>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Price</label>
                  <input
                    type="number"
                    name="price"
                    value={createFormData.price}
                    onChange={handleCreateFormChange}
                    step="0.01"
                    min="0"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="0.00"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Discounted Price</label>
                  <input
                    type="number"
                    name="discountedPrice"
                    value={createFormData.discountedPrice}
                    onChange={handleCreateFormChange}
                    step="0.01"
                    min="0"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="0.00"
                  />
                </div>
              </div>

              <div className="mt-6">
                <label className="block text-sm font-medium text-gray-700 mb-1">Currency Code</label>
                <select
                  name="currencyCode"
                  value={createFormData.currencyCode}
                  onChange={handleCreateFormChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="USD">USD - US Dollar</option>
                  <option value="EUR">EUR - Euro</option>
                  <option value="GBP">GBP - British Pound</option>
                  <option value="CAD">CAD - Canadian Dollar</option>
                  <option value="AUD">AUD - Australian Dollar</option>
                  <option value="INR">INR - Indian Rupee</option>
                  <option value="CNY">CNY - Chinese Yuan</option>
                </select>
              </div>
              
              {/* Media URLs */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Thumbnail URL</label>
                  <input
                    type="url"
                    name="thumbnailUrl"
                    value={createFormData.thumbnailUrl}
                    onChange={handleCreateFormChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="https://example.com/thumbnail.jpg"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Promo Video URL</label>
                  <input
                    type="url"
                    name="promoVideoUrl"
                    value={createFormData.promoVideoUrl}
                    onChange={handleCreateFormChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="https://example.com/promo-video.mp4"
                  />
                </div>
              </div>
              
              {/* Badge IDs */}
              <div className="mt-6">
                <label className="block text-sm font-medium text-gray-700 mb-1">Badges</label>
                {dropdownLoading.badges ? (
                  <div className="flex items-center">
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin text-gray-400" />
                    <span className="text-gray-500">Loading badges...</span>
                  </div>
                ) : dropdownError.badges ? (
                  <div className="text-red-500 text-sm">{dropdownError.badges}</div>
                ) : (
                  <MultiSelectDropdown
                    items={badges}
                    values={createFormData.badgeIds}
                    onChange={(values) => setCreateFormData(prev => ({ ...prev, badgeIds: values }))}
                    placeholder="Select badges"
                    className="w-full"
                    displayField="badgeName"
                    valueField="id"
                  />
                )}
              </div>
              
              {/* Form Actions */}
              <div className="flex justify-end space-x-3 mt-8 pt-6 border-t border-gray-200">
                <button
                  type="button"
                  onClick={closeCreateModal}
                  className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createLoading}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                >
                  {createLoading ? (
                    <>
                      <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    'Create Course'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full mx-4">
            <div className="p-6">
              <div className="flex items-center justify-center w-12 h-12 mx-auto bg-red-100 rounded-full mb-4">
                <Trash2 className="w-6 h-6 text-red-600" />
              </div>
              
              <h3 className="text-xl font-bold text-gray-900 text-center mb-2">
                Delete Course
              </h3>
              
              <p className="text-gray-600 text-center mb-6">
                Are you sure you want to delete the course "{courseToDelete?.title}"? 
                This action cannot be undone.
              </p>

              {deleteError && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-red-600 text-sm">{deleteError}</p>
                </div>
              )}

              <div className="flex justify-center space-x-3">
                <button
                  type="button"
                  onClick={closeDeleteModal}
                  disabled={deleteLoading}
                  className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleDeleteCourse}
                  disabled={deleteLoading}
                  className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                >
                  {deleteLoading ? (
                    <>
                      <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                      Deleting...
                    </>
                  ) : (
                    'Delete Course'
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CourseManagement;
