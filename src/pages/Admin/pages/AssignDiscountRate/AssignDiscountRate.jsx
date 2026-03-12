import React, { useState, useCallback, useEffect, useRef } from 'react';
import { useToast } from '../../../../hooks/utils/useToast';
import { useDiscountRateMapping } from '../../../../hooks/api/useDiscountRateMapping';
import { useCareerPath } from '../../../../hooks/api/useCareerPath';
import { useAdmin } from '../../../../hooks/api/useAdmin';
import { useCareerPathDiscount } from '../../../../hooks/api/useCareerPathDiscount';
import {
  Search,
  RefreshCw,
  BookOpen,
  CheckCircle,
  AlertCircle,
  Percent,
  Save,
  X,
  DollarSign,
  Grid3X3,
  Tag,
  TrendingUp,
  Check,
  Square,
  Users,
  Zap,
  CheckCheck,
  Briefcase,
  Clock,
  Award
} from 'lucide-react';
import GenericDropdown from '../../../../components/GenericDropdown';
import AdminPageLayout from '../../../../components/AdminPageLayout';

const AssignDiscountRate = () => {
  const { toast, showToast } = useToast();
  const {
    discountRates,
    courseTypes,
    error,
    fetchAllDiscountRates,
    assignDiscountRateToCourseType,
    assignDiscountRateToCourse
  } = useDiscountRateMapping();
  
  const { getAllCareerPaths } = useCareerPath();
  const { getAllCoursesAdmin } = useAdmin();
  const { assignDiscountRateToCareerPath, assignPriceToCourseType } = useCareerPathDiscount();
  
  // Component-specific state
  const [courses, setCourses] = useState([]);
  const [careerPaths, setCareerPaths] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [selectedDiscountRate, setSelectedDiscountRate] = useState('');
  const [assigning, setAssigning] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [activeTab, setActiveTab] = useState('courses'); // 'courses', 'courseTypes', or 'careerPaths'
  const [selectedCourseType, setSelectedCourseType] = useState(null);
  const [selectedCourseTypeDiscountRate, setSelectedCourseTypeDiscountRate] = useState('');
  const [showCourseTypeModal, setShowCourseTypeModal] = useState(false);
  const [showPriceModal, setShowPriceModal] = useState(false);
  const [selectedCourseTypeForPrice, setSelectedCourseTypeForPrice] = useState(null);
  const [courseTypePrice, setCourseTypePrice] = useState('');
  const [settingPrice, setSettingPrice] = useState(false);
  const [selectedCareerPath, setSelectedCareerPath] = useState(null);
  const [selectedCareerPathDiscountRate, setSelectedCareerPathDiscountRate] = useState('');
  const [showCareerPathModal, setShowCareerPathModal] = useState(false);
  const [pagination, setPagination] = useState({
    page: 1,
    pageSize: 20,
    totalCount: 0
  });
  
  // Bulk selection state
  const [selectedCourses, setSelectedCourses] = useState(new Set());
  const [selectedCareerPaths, setSelectedCareerPaths] = useState(new Set());
  const [bulkDiscountRate, setBulkDiscountRate] = useState('');
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [bulkAssigning, setBulkAssigning] = useState(false);

  // Fetch career paths with discount rates
  const fetchCareerPaths = useCallback(async (page = 1, pageSize = 20, title = '') => {
    setLoading(true);
    try {
      const params = {
        page,
        pageSize,
        ...(title && { title })
      };
      const careerPathsData = await getAllCareerPaths(params);
      const careerPathsArray =
        careerPathsData?.items ||
        careerPathsData?.Items ||
        careerPathsData?.data ||
        careerPathsData?.Data ||
        careerPathsData ||
        [];
      setCareerPaths(careerPathsArray);
      
      // Update pagination info
      const resolvedPage = careerPathsData?.page ?? careerPathsData?.Page ?? careerPathsData?.pageNumber ?? page;
      const resolvedPageSize = careerPathsData?.pageSize ?? careerPathsData?.PageSize ?? pageSize;
      const resolvedTotalCount =
        careerPathsData?.totalCount ??
        careerPathsData?.TotalCount ??
        careerPathsData?.totalItems ??
        careerPathsData?.TotalItems ??
        careerPathsArray.length;

      setPagination(prev => ({
        ...prev,
        page: resolvedPage,
        totalCount: resolvedTotalCount,
        pageSize: resolvedPageSize
      }));
    } catch (error) {
      console.error('Error fetching career paths:', error);
      showToast('Failed to fetch career paths', 'error');
    } finally {
      setLoading(false);
    }
  }, [getAllCareerPaths, showToast]);

  // Fetch courses with discount rates
  const fetchCourses = useCallback(async (page = 1, pageSize = 20, title = '') => {
    setLoading(true);
    try {
      const params = {
        page,
        pageSize,
        ...(title && { title }),
        isPaid:true
      };
      const coursesData = await getAllCoursesAdmin(params);
      const coursesArray =
        coursesData?.items ||
        coursesData?.Items ||
        coursesData?.data ||
        coursesData?.Data ||
        coursesData ||
        [];
      setCourses(coursesArray);
      
      // Update pagination info
      const resolvedPage = coursesData?.page ?? coursesData?.Page ?? coursesData?.pageNumber ?? page;
      const resolvedPageSize = coursesData?.pageSize ?? coursesData?.PageSize ?? pageSize;
      const resolvedTotalCount =
        coursesData?.totalCount ??
        coursesData?.TotalCount ??
        coursesData?.totalItems ??
        coursesData?.TotalItems ??
        coursesArray.length;

      setPagination(prev => ({
        ...prev,
        page: resolvedPage,
        totalCount: resolvedTotalCount,
        pageSize: resolvedPageSize
      }));
    } catch (error) {
      console.error('Error fetching courses:', error);
      showToast('Failed to fetch courses', 'error');
    } finally {
      setLoading(false);
    }
  }, [getAllCoursesAdmin, showToast]);


  // Debounced search - use ref to avoid dependency issues
  const paginationRef = useRef(pagination.pageSize);

  
  useEffect(() => {
    paginationRef.current = pagination.pageSize;
  }, [pagination.pageSize]);

  // Debounced search - only triggers when user stops typing
  useEffect(() => {
    // Only set up timeout if there's a search term
    if (searchTerm.trim() === '') {
      // If search is empty, reset to first page and fetch all
      setIsTyping(false);
      if (activeTab === 'courses') {
        fetchCourses(1, paginationRef.current, '');
      } else if (activeTab === 'careerPaths') {
        fetchCareerPaths(1, paginationRef.current, '');
      }
      return;
    }

    // Set typing indicator to true immediately
    setIsTyping(true);

    // Set up timeout to fetch after user stops typing
    const timeoutId = setTimeout(() => {
      // User stopped typing, set isTyping to false and fetch
      setIsTyping(false);
      // Only fetch if the search term hasn't changed in the last 800ms
      if (activeTab === 'courses') {
        fetchCourses(1, paginationRef.current, searchTerm);
      } else if (activeTab === 'careerPaths') {
        fetchCareerPaths(1, paginationRef.current, searchTerm);
      }
    }, 800); // 800ms delay - only triggers when user stops typing

    return () => {
      clearTimeout(timeoutId);
      // Clear typing indicator when component unmounts or search changes
      setIsTyping(false);
    };
  }, [searchTerm, activeTab, fetchCourses, fetchCareerPaths]);
  

  // Handle page change
  const handlePageChange = useCallback(async (newPage) => {
    const pageSize = paginationRef.current;
    if (newPage < 1 || newPage > Math.ceil(pagination.totalCount / pageSize)) return;
    
    setPagination(prev => ({ ...prev, page: newPage }));
    
    if (activeTab === 'courses') {
      await fetchCourses(newPage, pageSize, searchTerm);
    } else if (activeTab === 'careerPaths') {
      await fetchCareerPaths(newPage, pageSize, searchTerm);
    }
  }, [activeTab, fetchCourses, fetchCareerPaths, pagination.totalCount]);

  // When switching tabs, reset pagination to page 1 and fetch that tab's data
  useEffect(() => {
    setPagination(prev => ({ ...prev, page: 1, totalCount: 0 }));

    if (activeTab === 'courses') {
      fetchCourses(1, paginationRef.current, searchTerm);
    } else if (activeTab === 'careerPaths') {
      fetchCareerPaths(1, paginationRef.current, searchTerm);
    }
  }, [activeTab]);

  // Handle career path selection for bulk operations
  const handleCareerPathSelection = useCallback((careerPathId) => {
    setSelectedCareerPaths(prev => {
      const newSet = new Set(prev);
      if (newSet.has(careerPathId)) {
        newSet.delete(careerPathId);
      } else {
        newSet.add(careerPathId);
      }
      return newSet;
    });
  }, []);

  // Handle select all career paths
  const handleSelectAllCareerPaths = useCallback(() => {
    if (selectedCareerPaths.size === careerPaths.length) {
      setSelectedCareerPaths(new Set());
    } else {
      setSelectedCareerPaths(new Set(careerPaths.map(careerPath => careerPath.id)));
    }
  }, [selectedCareerPaths.size, careerPaths]);

  // Handle bulk discount assignment for career paths
  const handleBulkAssignCareerPaths = useCallback(() => {
    const currentSelection = activeTab === 'courses' ? selectedCourses : selectedCareerPaths;
    if (currentSelection.size === 0) {
      showToast(`Please select at least one ${activeTab === 'courses' ? 'course' : 'career path'}`, 'error');
      return;
    }
    setShowBulkModal(true);
  }, [selectedCourses, selectedCareerPaths, activeTab, showToast]);

  // Handle assign/deassign discount rate for career path
  const handleAssignCareerPathDiscount = useCallback(async (careerPath) => {
    setSelectedCareerPath(careerPath);
    // Pre-select current discount rate if exists
    if (careerPath.discountRateId) {
      setSelectedCareerPathDiscountRate(careerPath.discountRateId.toString());
    } else {
      setSelectedCareerPathDiscountRate('');
    }
    setShowCareerPathModal(true);
  }, []);

  // Handle career path modal submit
  const handleCareerPathModalSubmit = useCallback(async () => {
    if (!selectedCareerPath) return;

    setAssigning(true);
    try {
      if (selectedCareerPathDiscountRate && selectedCareerPathDiscountRate !== 'NO_DISCOUNT') {
        // Assign discount rate to career path
        await assignDiscountRateToCareerPath(selectedCareerPath.id, parseInt(selectedCareerPathDiscountRate));
        showToast('Discount rate assigned to career path successfully', 'success');
      } else if (selectedCareerPathDiscountRate === 'NO_DISCOUNT') {
        // Remove discount from career path
        await assignDiscountRateToCareerPath(selectedCareerPath.id, null);
        showToast('Discount removed from career path successfully', 'success');
      } else {
        showToast('Please select a discount rate', 'error');
        return;
      }
      
      // Refresh career paths data
      await fetchCareerPaths(pagination.page, pagination.pageSize, searchTerm);
      setShowCareerPathModal(false);
      setSelectedCareerPath(null);
      setSelectedCareerPathDiscountRate('');
    } catch (error) {
      console.error('Error assigning discount rate to career path:', error);
      showToast('Failed to assign discount rate to career path', 'error');
    } finally {
      setAssigning(false);
    }
  }, [selectedCareerPath, selectedCareerPathDiscountRate, fetchCareerPaths, pagination.page, pagination.pageSize, searchTerm, showToast, assignDiscountRateToCareerPath]);

  // Handle course selection for bulk operations
  const handleCourseSelection = useCallback((courseId) => {
    setSelectedCourses(prev => {
      const newSet = new Set(prev);
      if (newSet.has(courseId)) {
        newSet.delete(courseId);
      } else {
        newSet.add(courseId);
      }
      return newSet;
    });
  }, []);

  // Handle select all courses
  const handleSelectAll = useCallback(() => {
    if (activeTab === 'courses') {
      if (selectedCourses.size === courses.length) {
        setSelectedCourses(new Set());
      } else {
        setSelectedCourses(new Set(courses.map(course => course.id)));
      }
    } else if (activeTab === 'careerPaths') {
      handleSelectAllCareerPaths();
    }
  }, [selectedCourses.size, courses, activeTab, handleSelectAllCareerPaths]);

  // Handle bulk discount assignment
  const handleBulkAssign = useCallback(() => {
    handleBulkAssignCareerPaths();
  }, [handleBulkAssignCareerPaths]);

  // Handle bulk modal submit
  const handleBulkModalSubmit = useCallback(async () => {
    if (!bulkDiscountRate) {
      showToast('Please select a discount rate', 'error');
      return;
    }

    setBulkAssigning(true);
    try {
      const currentSelection = activeTab === 'courses' ? selectedCourses : selectedCareerPaths;
      const selectedArray = Array.from(currentSelection);
      
      if (activeTab === 'courses') {
        // Assign discount to all selected courses
        await Promise.all(
          selectedArray.map(courseId => 
            assignDiscountRateToCourse([courseId], bulkDiscountRate === 'NO_DISCOUNT' ? null : parseInt(bulkDiscountRate))
          )
        );
        showToast(`Discount rate assigned to ${selectedArray.length} course(s) successfully`, 'success');
        // Refresh courses data
        await fetchCourses(pagination.page, pagination.pageSize, searchTerm);
      } else {
        // Assign discount to all selected career paths
        await Promise.all(
          selectedArray.map(careerPathId => 
            assignDiscountRateToCareerPath(careerPathId, bulkDiscountRate === 'NO_DISCOUNT' ? null : parseInt(bulkDiscountRate))
          )
        );
        showToast(`Discount rate assigned to ${selectedArray.length} career path(s) successfully`, 'success');
        // Refresh career paths data
        await fetchCareerPaths(pagination.page, pagination.pageSize, searchTerm);
      }
      
      // Reset bulk selection
      setShowBulkModal(false);
      if (activeTab === 'courses') {
        setSelectedCourses(new Set());
      } else {
        setSelectedCareerPaths(new Set());
      }
      setBulkDiscountRate('');
    } catch (error) {
      console.error('Error assigning bulk discount:', error);
      showToast('Failed to assign discount rate to some items', 'error');
    } finally {
      setBulkAssigning(false);
    }
  }, [bulkDiscountRate, selectedCourses, selectedCareerPaths, activeTab, fetchCourses, fetchCareerPaths, pagination.page, pagination.pageSize, searchTerm, showToast, assignDiscountRateToCourse, assignDiscountRateToCareerPath]);

  // Handle select all courses

  // Handle assign/deassign discount rate
  const handleAssignDiscount = useCallback(async (course) => {
    setSelectedCourse(course);
    // Pre-select current discount rate if exists
    if (course.discountRateId) {
      setSelectedDiscountRate(course.discountRateId.toString());
    } else {
      setSelectedDiscountRate('');
    }
    setShowModal(true);
  }, []); // Remove unnecessary dependencies

  // Handle modal submit
  const handleModalSubmit = useCallback(async () => {
    if (!selectedCourse) return;

    setAssigning(true);
    try {
      if (selectedDiscountRate && selectedDiscountRate !== 'NO_DISCOUNT') {
        // Assign discount rate
        await assignDiscountRateToCourse([selectedCourse.id], parseInt(selectedDiscountRate));
        showToast('Discount rate assigned successfully', 'success');
      } else if (selectedDiscountRate === 'NO_DISCOUNT') {
        // Remove discount from course
        await assignDiscountRateToCourse([selectedCourse.id], null);
        showToast('Discount removed from course successfully', 'success');
      } else {
        showToast('Please select a discount rate', 'error');
      }
      
      // Refresh courses data on current page
      await fetchCourses(pagination.page, pagination.pageSize, searchTerm);
      setShowModal(false);
      setSelectedCourse(null);
      setSelectedDiscountRate('');
    } catch (error) {
      console.error('Error assigning discount rate:', error);
      showToast('Failed to assign discount rate', 'error');
    } finally {
      setAssigning(false);
    }
  }, [selectedCourse, selectedDiscountRate, fetchCourses, showToast, assignDiscountRateToCourse]);

  // Refresh data
  const handleRefresh = useCallback(() => {
    fetchCourses(pagination.page, pagination.pageSize, searchTerm);
  }, []);

  // Handle assign/deassign discount rate for course type
  const handleAssignCourseTypeDiscount = useCallback(async (courseType) => {
    setSelectedCourseType(courseType);
    // Pre-select current discount rate if exists
    if (courseType.discountedRateId) {
      setSelectedCourseTypeDiscountRate(courseType.discountedRateId.toString());
    } else {
      setSelectedCourseTypeDiscountRate('');
    }
    setShowCourseTypeModal(true);
  }, []);

  // Handle course type modal submit
  const handleCourseTypeModalSubmit = useCallback(async () => {
    if (!selectedCourseType) return;

    setAssigning(true);
    try {
      if (selectedCourseTypeDiscountRate && selectedCourseTypeDiscountRate !== 'NO_DISCOUNT') {
        // Assign discount rate to course type
        await assignDiscountRateToCourseType(selectedCourseType.id, parseInt(selectedCourseTypeDiscountRate));
        showToast('Discount rate assigned to course type successfully', 'success');
      } else if (selectedCourseTypeDiscountRate === 'NO_DISCOUNT') {
        // Remove discount from course type
        await assignDiscountRateToCourseType(selectedCourseType.id, null);
        showToast('Discount removed from course type successfully', 'success');
      } else {
        showToast('Please select a discount rate', 'error');
        return;
      }
      
      // Refresh course types data
      await fetchAllDiscountRates({});
      setShowCourseTypeModal(false);
      setSelectedCourseType(null);
      setSelectedCourseTypeDiscountRate('');
    } catch (error) {
      console.error('Error assigning discount rate to course type:', error);
      showToast('Failed to assign discount rate to course type', 'error');
    } finally {
      setAssigning(false);
    }
  }, [selectedCourseType, selectedCourseTypeDiscountRate, assignDiscountRateToCourseType, fetchAllDiscountRates, showToast]);

  // Handle set price for course type
  const handleSetPriceForCourseType = useCallback(async (courseType) => {
    setSelectedCourseTypeForPrice(courseType);
    // Pre-fill current price if exists
    if (courseType.coursePrice) {
      setCourseTypePrice(courseType.coursePrice.toString());
    } else {
      setCourseTypePrice('');
    }
    setShowPriceModal(true);
  }, []);

  // Handle price modal submit
  const handlePriceModalSubmit = useCallback(async () => {
    if (!selectedCourseTypeForPrice) return;

    setSettingPrice(true);
    try {
      await assignPriceToCourseType(selectedCourseTypeForPrice.id, parseFloat(courseTypePrice));
      showToast('Price assigned to course type successfully', 'success');
      
      // Refresh course types data
      await fetchAllDiscountRates({});
      setShowPriceModal(false);
      setSelectedCourseTypeForPrice(null);
      setCourseTypePrice('');
    } catch (error) {
      console.error('Error assigning price to course type:', error);
      showToast('Failed to assign price to course type', 'error');
    } finally {
      setSettingPrice(false);
    }
  }, [selectedCourseTypeForPrice, courseTypePrice, fetchAllDiscountRates, showToast, assignPriceToCourseType]);

  // Initialize data
  useEffect(() => {
    if (activeTab === 'courses') {
      fetchCourses();
    } else if (activeTab === 'careerPaths') {
      fetchCareerPaths();
    }
    // fetchAllDiscountRates is already called by useDiscountRateMapping hook on mount
  }, [activeTab, fetchCourses, fetchCareerPaths]); // Include fetchCareerPaths dependency

  return (
    <AdminPageLayout
      title="Assign Discount Rate"
      subtitle="Manage discount rates for courses, course types, and career paths"
      icon={Percent}
      loading={loading}
      actions={
        <div className="flex items-center space-x-3">
          <button
            onClick={handleRefresh}
            className="flex items-center px-4 py-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </button>
        </div>
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
              <AlertCircle className="w-5 h-5" />
            )}
            <span className="font-medium">{toast.message}</span>
          </div>
        </div>
      )}

      {/* Error Display */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
          <span className="text-red-700">{error}</span>
        </div>
      )}

      {/* Enhanced Tab Navigation */}
      <div className="mb-6 bg-white rounded-lg shadow-sm border border-gray-200 p-1">
        <nav className="flex space-x-1">
          <button
            onClick={() => setActiveTab('courses')}
            className={`flex-1 flex items-center justify-center px-4 py-3 rounded-md font-medium text-sm transition-all duration-200 ${
              activeTab === 'courses'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
            }`}
          >
            <BookOpen className="w-4 h-4 mr-2" />
            Courses
          </button>
          <button
            onClick={() => setActiveTab('careerPaths')}
            className={`flex-1 flex items-center justify-center px-4 py-3 rounded-md font-medium text-sm transition-all duration-200 ${
              activeTab === 'careerPaths'
                ? 'bg-green-600 text-white shadow-sm'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
            }`}
          >
            <Briefcase className="w-4 h-4 mr-2" />
            Career Paths
          </button>
          <button
            onClick={() => setActiveTab('courseTypes')}
            className={`flex-1 flex items-center justify-center px-4 py-3 rounded-md font-medium text-sm transition-all duration-200 ${
              activeTab === 'courseTypes'
                ? 'bg-purple-600 text-white shadow-sm'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
            }`}
          >
            <Grid3X3 className="w-4 h-4 mr-2" />
            Course Types
          </button>
        </nav>
      </div>
      {activeTab === 'courses' && (
        <div className="mb-6 space-y-4">
          {/* Bulk Actions Bar */}
          {selectedCourses.size > 0 && (
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-4 shadow-sm animate-in slide-in-from-top duration-300">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-3 bg-white px-4 py-2 rounded-lg border border-blue-200 shadow-sm">
                    <div className="relative">
                      <div className="w-6 h-6 bg-blue-600 rounded-md flex items-center justify-center">
                        <Check className="w-4 h-4 text-white" />
                      </div>
                      <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white animate-pulse"></div>
                    </div>
                    <div>
                      <span className="text-sm font-bold text-blue-900">
                        {selectedCourses.size}
                      </span>
                      <span className="text-sm text-blue-700 ml-1">
                        course{selectedCourses.size !== 1 ? 's' : ''} selected
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={handleBulkAssign}
                    className="flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 text-sm font-semibold shadow-md hover:shadow-lg transform hover:scale-105"
                  >
                    <Zap className="w-4 h-4 mr-2" />
                    Assign Discount to Selected
                  </button>
                </div>
                <div className="flex items-center space-x-3">
                  <button
                    onClick={() => setSelectedCourses(new Set())}
                    className="text-blue-600 hover:text-blue-800 text-sm font-medium px-3 py-2 rounded-lg hover:bg-blue-100 transition-colors"
                  >
                    Clear Selection
                  </button>
                </div>
              </div>
            </div>
          )}
          
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
            <div className="flex flex-col space-y-3">
              {/* Header Row with Title and Selection Status */}
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900">Course Selection</h2>
                {courses.length > 0 && (
                  <div className="flex items-center space-x-2 text-sm">
                    <div className={`w-4 h-4 rounded border-2 flex items-center justify-center ${
                      selectedCourses.size > 0 ? 'bg-blue-600 border-blue-600' : 'border-gray-300'
                    }`}>
                      {selectedCourses.size > 0 && <Check className="w-2.5 h-2.5 text-white" />}
                    </div>
                    <span className="text-gray-700">
                      <span className="font-semibold">{selectedCourses.size}</span> of {courses.length} selected
                    </span>
                    {selectedCourses.size > 0 && (
                      <button
                        onClick={() => setSelectedCourses(new Set())}
                        className="text-blue-600 hover:text-blue-800 font-medium ml-2"
                      >
                        Clear
                      </button>
                    )}
                  </div>
                )}
              </div>

              {/* Search and Select All in One Row */}
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="text"
                      placeholder={isTyping ? "Type to search..." : "Search courses..."}
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className={`w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${
                        isTyping 
                          ? 'border-blue-400 bg-blue-50' 
                          : 'border-gray-200'
                      }`}
                    />
                    {isTyping && (
                      <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                      </div>
                    )}
                    {!isTyping && searchTerm && (
                      <button
                        onClick={() => setSearchTerm('')}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
                
                {courses.length > 0 && (
                  <button
                    onClick={handleSelectAll}
                    className="group flex items-center space-x-2 px-4 py-2.5 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-all duration-200 shadow-sm hover:shadow-md whitespace-nowrap"
                  >
                    <div className="relative">
                      <div className={`w-4 h-4 rounded border-2 transition-all duration-200 flex items-center justify-center ${
                        selectedCourses.size === courses.length && courses.length > 0
                          ? 'bg-blue-600 border-blue-600'
                          : 'border-blue-400 group-hover:border-blue-600'
                      }`}>
                        {selectedCourses.size === courses.length && courses.length > 0 ? (
                          <Check className="w-2.5 h-2.5 text-white" />
                        ) : selectedCourses.size > 0 && selectedCourses.size < courses.length ? (
                          <div className="w-1.5 h-1.5 bg-blue-600 rounded-full"></div>
                        ) : null}
                      </div>
                    </div>
                    <span className="text-sm font-semibold text-blue-700 group-hover:text-blue-900">
                      {selectedCourses.size === courses.length && courses.length > 0 ? (
                        <span className="flex items-center">
                          <CheckCheck className="w-3.5 h-3.5 mr-1" />
                          Deselect All
                        </span>
                      ) : selectedCourses.size > 0 ? (
                        <span className="flex items-center">
                          <Square className="w-3.5 h-3.5 mr-1" />
                          Select All ({courses.length - selectedCourses.size} more)
                        </span>
                      ) : (
                        <span className="flex items-center">
                          <Square className="w-3.5 h-3.5 mr-1" />
                          Select All ({courses.length})
                        </span>
                      )}
                    </span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'careerPaths' && (
        <div className="mb-6 space-y-4">
          {/* Bulk Actions Bar for Career Paths */}
          {selectedCareerPaths.size > 0 && (
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl p-4 shadow-sm animate-in slide-in-from-top duration-300">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-3 bg-white px-4 py-2 rounded-lg border border-green-200 shadow-sm">
                    <div className="relative">
                      <div className="w-6 h-6 bg-green-600 rounded-md flex items-center justify-center">
                        <Check className="w-4 h-4 text-white" />
                      </div>
                      <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white animate-pulse"></div>
                    </div>
                    <div>
                      <span className="text-sm font-bold text-green-900">
                        {selectedCareerPaths.size}
                      </span>
                      <span className="text-sm text-green-700 ml-1">
                        career path{selectedCareerPaths.size !== 1 ? 's' : ''} selected
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={handleBulkAssign}
                    className="flex items-center px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg hover:from-green-700 hover:to-emerald-700 transition-all duration-200 text-sm font-semibold shadow-md hover:shadow-lg transform hover:scale-105"
                  >
                    <Zap className="w-4 h-4 mr-2" />
                    Assign Discount to Selected
                  </button>
                </div>
                <div className="flex items-center space-x-3">
                  <button
                    onClick={() => setSelectedCareerPaths(new Set())}
                    className="text-green-600 hover:text-green-800 text-sm font-medium px-3 py-2 rounded-lg hover:bg-green-100 transition-colors"
                  >
                    Clear Selection
                  </button>
                </div>
              </div>
            </div>
          )}
          
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
            <div className="flex flex-col space-y-3">
              {/* Header Row with Title and Selection Status */}
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900">Career Path Selection</h2>
                {careerPaths.length > 0 && (
                  <div className="flex items-center space-x-2 text-sm">
                    <div className={`w-4 h-4 rounded border-2 flex items-center justify-center ${
                      selectedCareerPaths.size > 0 ? 'bg-green-600 border-green-600' : 'border-gray-300'
                    }`}>
                      {selectedCareerPaths.size > 0 && <Check className="w-2.5 h-2.5 text-white" />}
                    </div>
                    <span className="text-gray-700">
                      <span className="font-semibold">{selectedCareerPaths.size}</span> of {careerPaths.length} selected
                    </span>
                    {selectedCareerPaths.size > 0 && (
                      <button
                        onClick={() => setSelectedCareerPaths(new Set())}
                        className="text-green-600 hover:text-green-800 font-medium ml-2"
                      >
                        Clear
                      </button>
                    )}
                  </div>
                )}
              </div>

              {/* Search and Select All in One Row */}
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="text"
                      placeholder={isTyping ? "Type to search..." : "Search career paths..."}
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className={`w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 ${
                        isTyping 
                          ? 'border-green-400 bg-green-50' 
                          : 'border-gray-200'
                      }`}
                    />
                    {isTyping && (
                      <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-green-600"></div>
                      </div>
                    )}
                    {!isTyping && searchTerm && (
                      <button
                        onClick={() => setSearchTerm('')}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
                
                {careerPaths.length > 0 && (
                  <button
                    onClick={handleSelectAll}
                    className="group flex items-center space-x-2 px-4 py-2.5 bg-green-50 border border-green-200 rounded-lg hover:bg-green-100 transition-all duration-200 shadow-sm hover:shadow-md whitespace-nowrap"
                  >
                    <div className="relative">
                      <div className={`w-4 h-4 rounded border-2 transition-all duration-200 flex items-center justify-center ${
                        selectedCareerPaths.size === careerPaths.length && careerPaths.length > 0
                          ? 'bg-green-600 border-green-600'
                          : 'border-green-400 group-hover:border-green-600'
                      }`}>
                        {selectedCareerPaths.size === careerPaths.length && careerPaths.length > 0 ? (
                          <Check className="w-2.5 h-2.5 text-white" />
                        ) : selectedCareerPaths.size > 0 && selectedCareerPaths.size < careerPaths.length ? (
                          <div className="w-1.5 h-1.5 bg-green-600 rounded-full"></div>
                        ) : null}
                      </div>
                    </div>
                    <span className="text-sm font-semibold text-green-700 group-hover:text-green-900">
                      {selectedCareerPaths.size === careerPaths.length && careerPaths.length > 0 ? (
                        <span className="flex items-center">
                          <CheckCheck className="w-3.5 h-3.5 mr-1" />
                          Deselect All
                        </span>
                      ) : selectedCareerPaths.size > 0 ? (
                        <span className="flex items-center">
                          <Square className="w-3.5 h-3.5 mr-1" />
                          Select All ({careerPaths.length - selectedCareerPaths.size} more)
                        </span>
                      ) : (
                        <span className="flex items-center">
                          <Square className="w-3.5 h-3.5 mr-1" />
                          Select All ({careerPaths.length})
                        </span>
                      )}
                    </span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Content based on active tab */}
      {activeTab === 'courses' ? (
        // Enhanced Courses Grid
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {loading ? (
            // Enhanced loading skeleton cards
            Array.from({ length: 8 }).map((_, index) => (
              <div key={index} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 animate-pulse">
                <div className="flex items-center space-x-4 mb-4">
                  <div className="w-16 h-16 bg-gray-200 rounded-lg"></div>
                  <div className="flex-1">
                    <div className="h-4 bg-gray-200 rounded mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-3/4"></div>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="h-3 bg-gray-200 rounded"></div>
                  <div className="h-3 bg-gray-200 rounded w-5/6"></div>
                </div>
                <div className="flex justify-between items-center mt-4 pt-4 border-t border-gray-100">
                  <div className="h-3 bg-gray-200 rounded w-20"></div>
                  <div className="h-8 bg-gray-200 rounded w-24"></div>
                </div>
              </div>
            ))
          ) : courses.length > 0 ? (
            courses.map((course) => (
              <div 
                key={course.id} 
                className={`bg-white rounded-xl shadow-sm border hover:shadow-xl transition-all duration-300 overflow-hidden group cursor-pointer ${
                  selectedCourses.has(course.id) 
                    ? 'ring-2 ring-blue-500 border-blue-200 shadow-lg shadow-blue-500/20 transform scale-[1.02]' 
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                onClick={(e) => {
                  // Prevent checkbox click from bubbling to card click
                  if (e.target.closest('button')) return;
                  handleCourseSelection(course.id);
                }}
              >
                {/* Enhanced Selection Checkbox */}
                <div className="absolute top-3 left-3 z-10">
                  <button
                    onClick={() => handleCourseSelection(course.id)}
                    className={`group relative p-1.5 rounded-xl transition-all duration-200 transform hover:scale-110 ${
                      selectedCourses.has(course.id)
                        ? 'bg-blue-600 shadow-lg shadow-blue-600/30'
                        : 'bg-white/90 backdrop-blur-sm border-2 border-gray-200 hover:border-blue-400 hover:bg-blue-50'
                    }`}
                    aria-label={`Select course: ${course.title}`}
                  >
                    <div className="relative">
                      <div className={`w-5 h-5 rounded-md border-2 transition-all duration-200 flex items-center justify-center ${
                        selectedCourses.has(course.id)
                          ? 'bg-white border-white'
                          : 'border-gray-300 group-hover:border-blue-500'
                      }`}>
                        {selectedCourses.has(course.id) && (
                          <Check className="w-3 h-3 text-blue-600 animate-in zoom-in duration-200" />
                        )}
                      </div>
                      {selectedCourses.has(course.id) && (
                        <div className="absolute -inset-1 bg-blue-400 rounded-md opacity-30 animate-ping"></div>
                      )}
                    </div>
                  </button>
                </div>

                {/* Enhanced Course Header with Image */}
                <div className="relative h-32 bg-gradient-to-br from-blue-50 to-indigo-100">
                  {course.thumbnailUrl ? (
                    <img 
                      src={course.thumbnailUrl}
                      alt={course.title}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.style.display = 'none';
                      }}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <BookOpen className="w-12 h-12 text-blue-400" />
                    </div>
                  )}
                  <div className="absolute top-2 right-2">
                    {course.discountRateId && (
                      <div className="bg-green-500 text-white px-2 py-1 rounded-full text-xs font-medium flex items-center shadow-lg">
                        <Percent className="w-3 h-3 mr-1" />
                        {course.discountRateTitle}
                      </div>
                    )}
                  </div>
                  {/* Overlay on hover */}
                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 transition-all duration-300"></div>
                </div>

                {/* Enhanced Course Content */}
                <div className="p-4">
                  <h3 className="font-semibold text-gray-900 text-lg mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors duration-200">
                    {course.title}
                  </h3>
                  {course.subtitle && (
                    <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                      {course.subtitle}
                    </p>
                  )}

                  {/* Enhanced Course Meta */}
                  <div className="flex flex-wrap gap-2 mb-4">
                    {course.categoryName && (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800 border border-purple-200">
                        <Tag className="w-3 h-3 mr-1" />
                        {course.categoryName}
                      </span>
                    )}
                    {course.courseLevelName && (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800 border border-orange-200">
                        <TrendingUp className="w-3 h-3 mr-1" />
                        {course.courseLevelName}
                      </span>
                    )}
                    {course.isPaid && (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 border border-green-200">
                        <DollarSign className="w-3 h-3 mr-1" />
                        Paid
                      </span>
                    )}
                  </div>

                  {/* Enhanced Price and Discount Info */}
                  <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        {course.isPaid ? (
                          <div>
                            <span className="text-lg font-bold text-gray-900">
                              ${course.price || 0}
                            </span>
                            {course.discountedPrice && course.discountedPrice < course.price && (
                              <span className="ml-2 text-sm text-gray-500 line-through">
                                ${course.discountedPrice}
                              </span>
                            )}
                          </div>
                        ) : (
                          <span className="text-lg font-bold text-green-600">Free</span>
                        )}
                      </div>
                      {!course.discountRateId && (
                        <span className="text-sm text-gray-500">No discount</span>
                      )}
                    </div>
                  </div>

                  {/* Enhanced Action Button */}
                  <button
                    onClick={() => handleAssignDiscount(course)}
                    className="w-full flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200 font-medium transform hover:scale-105"
                  >
                    <Percent className="w-4 h-4 mr-2" />
                    {course.discountRateId ? 'Change Discount' : 'Assign Discount'}
                  </button>
                </div>
              </div>
            ))
          ) : (
            // Enhanced empty state
            <div className="col-span-full text-center py-16">
              <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <BookOpen className="w-12 h-12 text-gray-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">No courses found</h3>
              <p className="text-gray-500 max-w-md mx-auto">
                {searchTerm ? 'Try adjusting your search terms or filters' : 'Get started by creating your first course'}
              </p>
            </div>
          )}
        </div>
      ) : activeTab === 'careerPaths' ? (
        // Enhanced Career Paths Grid
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {loading ? (
            // Enhanced loading skeleton cards for career paths
            Array.from({ length: 6 }).map((_, index) => (
              <div key={index} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 animate-pulse">
                <div className="flex items-center space-x-4 mb-4">
                  <div className="w-16 h-16 bg-gray-200 rounded-lg"></div>
                  <div className="flex-1">
                    <div className="h-4 bg-gray-200 rounded mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-3/4"></div>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="h-3 bg-gray-200 rounded"></div>
                  <div className="h-3 bg-gray-200 rounded w-5/6"></div>
                </div>
                <div className="flex justify-between items-center mt-4 pt-4 border-t border-gray-100">
                  <div className="h-3 bg-gray-200 rounded w-20"></div>
                  <div className="h-8 bg-gray-200 rounded w-24"></div>
                </div>
              </div>
            ))
          ) : careerPaths.length > 0 ? (
            careerPaths.map((careerPath) => (
              <div 
                key={careerPath.id} 
                className={`bg-white rounded-xl shadow-sm border hover:shadow-xl transition-all duration-300 overflow-hidden group cursor-pointer ${
                  selectedCareerPaths.has(careerPath.id) 
                    ? 'ring-2 ring-green-500 border-green-200 shadow-lg shadow-green-500/20 transform scale-[1.02]' 
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                onClick={(e) => {
                  // Prevent checkbox click from bubbling to card click
                  if (e.target.closest('button')) return;
                  handleCareerPathSelection(careerPath.id);
                }}
              >
                {/* Enhanced Selection Checkbox */}
                <div className="absolute top-3 left-3 z-10">
                  <button
                    onClick={() => handleCareerPathSelection(careerPath.id)}
                    className={`group relative p-1.5 rounded-xl transition-all duration-200 transform hover:scale-110 ${
                      selectedCareerPaths.has(careerPath.id)
                        ? 'bg-green-600 shadow-lg shadow-green-600/30'
                        : 'bg-white/90 backdrop-blur-sm border-2 border-gray-200 hover:border-green-400 hover:bg-green-50'
                    }`}
                    aria-label={`Select career path: ${careerPath.title}`}
                  >
                    <div className="relative">
                      <div className={`w-5 h-5 rounded-md border-2 transition-all duration-200 flex items-center justify-center ${
                        selectedCareerPaths.has(careerPath.id)
                          ? 'bg-white border-white'
                          : 'border-gray-300 group-hover:border-green-500'
                      }`}>
                        {selectedCareerPaths.has(careerPath.id) && (
                          <Check className="w-3 h-3 text-green-600 animate-in zoom-in duration-200" />
                        )}
                      </div>
                      {selectedCareerPaths.has(careerPath.id) && (
                        <div className="absolute -inset-1 bg-green-400 rounded-md opacity-30 animate-ping"></div>
                      )}
                    </div>
                  </button>
                </div>

                {/* Enhanced Career Path Header with Icon */}
                <div className="relative h-32 bg-gradient-to-br from-green-50 to-emerald-100">
                  {careerPath.iconUrl ? (
                    <img 
                      src={careerPath.iconUrl}
                      alt={careerPath.title}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.style.display = 'none';
                      }}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Briefcase className="w-12 h-12 text-green-400" />
                    </div>
                  )}
                  <div className="absolute top-2 right-2">
                    {careerPath.discountRateId && (
                      <div className="bg-green-500 text-white px-2 py-1 rounded-full text-xs font-medium flex items-center shadow-lg">
                        <Percent className="w-3 h-3 mr-1" />
                        {careerPath.discountRateTitle}
                      </div>
                    )}
                  </div>
                  {/* Overlay on hover */}
                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 transition-all duration-300"></div>
                </div>

                {/* Enhanced Career Path Content */}
                <div className="p-4">
                  <h3 className="font-semibold text-gray-900 text-lg mb-2 line-clamp-2 group-hover:text-green-600 transition-colors duration-200">
                    {careerPath.title}
                  </h3>
                  {careerPath.description && (
                    <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                      {careerPath.description}
                    </p>
                  )}

                  {/* Enhanced Career Path Meta */}
                  <div className="flex flex-wrap gap-2 mb-4">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 border border-green-200">
                      <Briefcase className="w-3 h-3 mr-1" />
                      Career Path
                    </span>
                    {careerPath.durationMinMonths && (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 border border-blue-200">
                        <Clock className="w-3 h-3 mr-1" />
                        {careerPath.durationMinMonths}-{careerPath.durationMaxMonths} months
                      </span>
                    )}
                    {careerPath.certificateCount && (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800 border border-purple-200">
                        <Award className="w-3 h-3 mr-1" />
                        {careerPath.certificateCount} certificates
                      </span>
                    )}
                  </div>

                  {/* Enhanced Price and Discount Info */}
                  <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <div>
                          <span className="text-lg font-bold text-gray-900">
                            ${careerPath.price || 0}
                          </span>
                          {careerPath.discountedPrice && careerPath.discountedPrice < careerPath.price && (
                            <span className="ml-2 text-sm text-gray-500 line-through">
                              ${careerPath.discountedPrice}
                            </span>
                          )}
                        </div>
                      </div>
                      {!careerPath.discountRateId && (
                        <span className="text-sm text-gray-500">No discount</span>
                      )}
                    </div>
                  </div>

                  {/* Enhanced Action Button */}
                  <button
                    onClick={() => handleAssignCareerPathDiscount(careerPath)}
                    className="w-full flex items-center justify-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-all duration-200 font-medium transform hover:scale-105"
                  >
                    <Percent className="w-4 h-4 mr-2" />
                    {careerPath.discountRateId ? 'Change Discount' : 'Assign Discount'}
                  </button>
                </div>
              </div>
            ))
          ) : (
            // Enhanced empty state for career paths
            <div className="col-span-full text-center py-16">
              <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Briefcase className="w-12 h-12 text-gray-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">No career paths found</h3>
              <p className="text-gray-500 max-w-md mx-auto">
                {searchTerm ? 'Try adjusting your search terms or filters' : 'Get started by creating your first career path'}
              </p>
            </div>
          )}
        </div>
      ) : (
        // Enhanced Course Types Grid
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {loading ? (
            // Enhanced loading skeleton cards for course types
            Array.from({ length: 6 }).map((_, index) => (
              <div key={index} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 animate-pulse">
                <div className="flex items-center space-x-4 mb-4">
                  <div className="w-12 h-12 bg-gray-200 rounded-lg"></div>
                  <div className="flex-1">
                    <div className="h-4 bg-gray-200 rounded mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-3/4"></div>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="h-3 bg-gray-200 rounded"></div>
                  <div className="h-3 bg-gray-200 rounded w-5/6"></div>
                </div>
                <div className="flex justify-between items-center mt-4 pt-4 border-t border-gray-100">
                  <div className="h-3 bg-gray-200 rounded w-20"></div>
                  <div className="h-8 bg-gray-200 rounded w-24"></div>
                </div>
              </div>
            ))
          ) : courseTypes && courseTypes.length > 0 ? (
            courseTypes.map((courseType) => (
              <div key={courseType.id} className="bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-lg transition-all duration-300 overflow-hidden group">
                {/* Enhanced Course Type Header */}
                <div className="relative h-28 bg-gradient-to-br from-purple-50 to-pink-100">
                  <div className="w-full h-full flex items-center justify-center">
                    <div className="relative">
                      <Grid3X3 className="w-12 h-12 text-purple-400" />
                      {/* Animated background pattern */}
                      <div className="absolute inset-0 bg-purple-200 opacity-20 rounded-full blur-xl group-hover:scale-110 transition-transform duration-500"></div>
                    </div>
                  </div>
                  <div className="absolute top-3 right-3">
                    {courseType.discountedRateId && (
                      <div className="bg-green-500 text-white px-3 py-1.5 rounded-full text-xs font-medium flex items-center shadow-lg">
                        <Percent className="w-3 h-3 mr-1" />
                        {courseType.discountRateTitle}
                      </div>
                    )}
                  </div>
                  {/* Hover overlay */}
                  <div className="absolute inset-0 bg-purple-600 bg-opacity-0 group-hover:bg-opacity-5 transition-all duration-300"></div>
                </div>

                {/* Enhanced Course Type Content */}
                <div className="p-5">
                  <h3 className="font-semibold text-gray-900 text-lg mb-2 group-hover:text-purple-600 transition-colors duration-200">
                    {courseType.name || courseType.title}
                  </h3>
                  {courseType.description && (
                    <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                      {courseType.description}
                    </p>
                  )}

                  {/* Enhanced Course Type Meta */}
                  <div className="flex flex-wrap gap-2 mb-4">
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800 border border-purple-200">
                      <Grid3X3 className="w-3 h-3 mr-1" />
                      Course Type
                    </span>
                    {courseType.isActive !== false && (
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 border border-green-200">
                        <div className="w-2 h-2 bg-green-500 rounded-full mr-1.5 animate-pulse"></div>
                        Active
                      </span>
                    )}
                  </div>

                  {/* Price Display */}
                  <div className="mb-5 p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-sm text-gray-600">Current Price:</span>
                        <div className="text-lg font-bold text-gray-900">
                          ${courseType.coursePrice || 0}
                        </div>
                      </div>
                      {courseType.discountedRateId && (
                        <div className="text-right">
                          <span className="text-xs text-green-600 font-medium">
                            {courseType.discountRateTitle}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Enhanced Action Buttons */}
                  <div className="space-y-3">
                    <button
                      onClick={() => handleAssignCourseTypeDiscount(courseType)}
                      className="w-full flex items-center justify-center px-4 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transition-all duration-200 font-medium transform hover:scale-105 shadow-md hover:shadow-lg"
                    >
                      <Percent className="w-4 h-4 mr-2" />
                      {courseType.discountedRateId ? 'Change Discount' : 'Assign Discount'}
                    </button>
                    <button
                      onClick={() => handleSetPriceForCourseType(courseType)}
                      className="w-full flex items-center justify-center px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-all duration-200 font-medium transform hover:scale-105 shadow-md hover:shadow-lg"
                    >
                      <DollarSign className="w-4 h-4 mr-2" />
                      {courseType.coursePrice ? 'Update Price' : 'Set Price'}
                    </button>
                  </div>
                </div>
              </div>
            ))
          ) : (
            // Enhanced empty state for course types
            <div className="col-span-full text-center py-16">
              <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Grid3X3 className="w-12 h-12 text-gray-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">No course types found</h3>
              <p className="text-gray-500 max-w-md mx-auto">
                Get started by creating your first course type to organize your courses better
              </p>
            </div>
          )}
        </div>
      )}

      {/* Manual Pagination Component - Only show for courses tab */}
      {activeTab === 'courses' && pagination.totalCount > pagination.pageSize && (
        <div className="mt-4 flex items-center justify-between bg-white px-4 py-3 border border-gray-200 rounded-lg">
          <div className="text-sm text-gray-700">
            Showing {((pagination.page - 1) * pagination.pageSize) + 1} to{' '}
            {Math.min(pagination.page * pagination.pageSize, pagination.totalCount)} of{' '}
            {pagination.totalCount} results
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => handlePageChange(pagination.page - 1)}
              disabled={pagination.page === 1}
              className="px-3 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            
            <div className="flex items-center space-x-1">
              {Array.from({ length: Math.ceil(pagination.totalCount / pagination.pageSize) }, (_, i) => i + 1)
                .filter(page => 
                  page === 1 || 
                  page === Math.ceil(pagination.totalCount / pagination.pageSize) ||
                  (page >= pagination.page - 1 && page <= pagination.page + 1)
                )
                .map((page, index, array) => (
                  <React.Fragment key={page}>
                    {index > 0 && array[index - 1] !== page - 1 && (
                      <span className="px-2 text-gray-500">...</span>
                    )}
                    <button
                      onClick={() => handlePageChange(page)}
                      className={`px-3 py-1 text-sm border rounded-md ${
                        page === pagination.page
                          ? 'bg-blue-600 text-white border-blue-600'
                          : 'border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      {page}
                    </button>
                  </React.Fragment>
                ))}
            </div>
            
            <button
              onClick={() => handlePageChange(pagination.page + 1)}
              disabled={pagination.page === Math.ceil(pagination.totalCount / pagination.pageSize)}
              className="px-3 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        </div>
      )}

      {/* Manual Pagination Component - Only show for career paths tab */}
      {activeTab === 'careerPaths' && pagination.totalCount > pagination.pageSize && (
        <div className="mt-4 flex items-center justify-between bg-white px-4 py-3 border border-gray-200 rounded-lg">
          <div className="text-sm text-gray-700">
            Showing {((pagination.page - 1) * pagination.pageSize) + 1} to{' '}
            {Math.min(pagination.page * pagination.pageSize, pagination.totalCount)} of{' '}
            {pagination.totalCount} career paths
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => handlePageChange(pagination.page - 1)}
              disabled={pagination.page === 1}
              className="px-3 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            
            <div className="flex items-center space-x-1">
              {Array.from({ length: Math.ceil(pagination.totalCount / pagination.pageSize) }, (_, i) => i + 1)
                .filter(page => 
                  page === 1 || 
                  page === Math.ceil(pagination.totalCount / pagination.pageSize) ||
                  (page >= pagination.page - 1 && page <= pagination.page + 1)
                )
                .map((page, index, array) => (
                  <React.Fragment key={page}>
                    {index > 0 && page !== array[0] + 1 && (
                      <span className="px-2 text-gray-400">...</span>
                    )}
                    <button
                      onClick={() => handlePageChange(page)}
                      className={`px-3 py-1 text-sm border rounded-md ${
                        page === pagination.page
                          ? 'bg-green-600 text-white border-green-600'
                          : 'border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      {page}
                    </button>
                  </React.Fragment>
                ))}
            </div>
            
            <button
              onClick={() => handlePageChange(pagination.page + 1)}
              disabled={pagination.page === Math.ceil(pagination.totalCount / pagination.pageSize)}
              className="px-3 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        </div>
      )}

      {/* Bulk Assignment Modal */}
      {showBulkModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                <Users className="w-5 h-5 mr-2 text-blue-600" />
                Assign Discount to Multiple Courses
              </h3>
              <button
                onClick={() => setShowBulkModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="mb-4">
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-4 mb-4">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                    <Users className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-blue-900">
                      {activeTab === 'courses' ? `${selectedCourses.size} Course${selectedCourses.size !== 1 ? 's' : ''}` : `${selectedCareerPaths.size} Career Path${selectedCareerPaths.size !== 1 ? 's' : ''}`} Selected
                    </p>
                    <p className="text-xs text-blue-700">
                      Ready for discount assignment
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Discount Rate *
              </label>
              <GenericDropdown
                value={bulkDiscountRate}
                onChange={(value) => setBulkDiscountRate(value)}
                items={[
                  { value: 'NO_DISCOUNT', label: 'No Discount' },
                  ...discountRates.map(rate => ({
                    value: rate.id.toString(),
                    label: `${rate.title} - ${rate.discountPercent}% off`
                  }))
                ]}
                placeholder="Select discount rate"
                valueField="value"
                displayField="label"
                className="w-full"
              />
            </div>

            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowBulkModal(false)}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleBulkModalSubmit}
                disabled={bulkAssigning || !bulkDiscountRate}
                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
              >
                {bulkAssigning ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Processing...
                  </>
                ) : (
                  <>
                    <Zap className="w-4 h-4 mr-2" />
                    Assign to {activeTab === 'courses' ? `${selectedCourses.size} Course${selectedCourses.size !== 1 ? 's' : ''}` : `${selectedCareerPaths.size} Career Path${selectedCareerPaths.size !== 1 ? 's' : ''}`}
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Career Path Discount Modal */}
      {showCareerPathModal && selectedCareerPath && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                <Briefcase className="w-5 h-5 mr-2 text-green-600" />
                Assign Discount to Career Path
              </h3>
              <button
                onClick={() => setShowCareerPathModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="mb-4">
              <p className="text-sm text-gray-600 mb-2">
                Career Path: <span className="font-medium">{selectedCareerPath.title}</span>
              </p>
              <p className="text-sm text-gray-600">
                Current: {selectedCareerPath.discountRateId ? (
                  <span className="text-green-600 font-medium">
                    {selectedCareerPath.discountRateTitle}
                  </span>
                ) : (
                  <span className="text-gray-500">No discount</span>
                )}
              </p>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Discount Rate *
              </label>
              <GenericDropdown
                value={selectedCareerPathDiscountRate}
                onChange={(value) => setSelectedCareerPathDiscountRate(value)}
                items={[
                  { value: 'NO_DISCOUNT', label: 'No Discount' },
                  ...discountRates.map(rate => ({
                    value: rate.id.toString(),
                    label: `${rate.title} - ${rate.discountPercent}% off`
                  }))
                ]}
                placeholder="Select discount rate"
                valueField="value"
                displayField="label"
                className="w-full"
              />
            </div>

            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowCareerPathModal(false)}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleCareerPathModalSubmit}
                disabled={assigning}
                className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors"
              >
                {assigning ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Processing...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Save
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Course Type Discount Modal */}
      {showCourseTypeModal && selectedCourseType && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                Assign Discount Rate to Course Type
              </h3>
              <button
                onClick={() => setShowCourseTypeModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="mb-4">
              <p className="text-sm text-gray-600 mb-2">
                Course Type: <span className="font-medium">{selectedCourseType.name || selectedCourseType.title}</span>
              </p>
              <p className="text-sm text-gray-600">
                Current: {selectedCourseType.discountedRateId ? (
                  <span className="text-green-600 font-medium">
                    {selectedCourseType.discountRateTitle}
                  </span>
                ) : (
                  <span className="text-gray-500">No discount</span>
                )}
              </p>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Discount Rate
              </label>
              <GenericDropdown
                value={selectedCourseTypeDiscountRate}
                onChange={(value) => setSelectedCourseTypeDiscountRate(value)}
                items={[
                  { value: 'NO_DISCOUNT', label: 'No Discount' },
                  ...discountRates.map(rate => ({
                    value: rate.id.toString(),
                    label: `${rate.title} - ${rate.discountPercent}% off`
                  }))
                ]}
                placeholder="Select discount rate"
                valueField="value"
                displayField="label"
                className="w-full"
              />
            </div>

            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowCourseTypeModal(false)}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleCourseTypeModalSubmit}
                disabled={assigning}
                className="flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 transition-colors"
              >
                {assigning ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Processing...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Save
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Assign Discount Modal */}
      {showModal && selectedCourse && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                Assign Discount Rate
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="mb-4">
              <p className="text-sm text-gray-600 mb-2">
                Course: <span className="font-medium">{selectedCourse.title}</span>
              </p>
              <p className="text-sm text-gray-600">
                Current: {selectedCourse.discountRateId ? (
                  <span className="text-green-600 font-medium">
                    {selectedCourse.discountRateTitle}
                  </span>
                ) : (
                  <span className="text-gray-500">No discount</span>
                )}
              </p>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Discount Rate
              </label>
              <GenericDropdown
                value={selectedDiscountRate}
                onChange={(value) => setSelectedDiscountRate(value)}
                items={[
                  { value: 'NO_DISCOUNT', label: 'No Discount' },
                  ...discountRates.map(rate => ({
                    value: rate.id.toString(),
                    label: `${rate.title} - ${rate.discountPercent}% off`
                  }))
                ]}
                placeholder="Select discount rate"
                valueField="value"
                displayField="label"
                className="w-full"
              />
            </div>

            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleModalSubmit}
                disabled={assigning}
                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
              >
                {assigning ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Processing...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Save
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Price Assignment Modal */}
      {showPriceModal && selectedCourseTypeForPrice && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                <DollarSign className="w-5 h-5 mr-2 text-green-600" />
                Set Price for {selectedCourseTypeForPrice.name || selectedCourseTypeForPrice.title || selectedCourseTypeForPrice.typeName || 'Course Type'}
              </h3>
              <button
                onClick={() => setShowPriceModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="mb-4">
              <p className="text-sm text-gray-600 mb-2">
                Course Type: <span className="font-medium">{selectedCourseTypeForPrice.name || selectedCourseTypeForPrice.title || selectedCourseTypeForPrice.typeName}</span>
              </p>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                New Price *
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={courseTypePrice}
                onChange={(e) => setCourseTypePrice(e.target.value)}
                placeholder="Enter price"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>

            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowPriceModal(false)}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handlePriceModalSubmit}
                disabled={settingPrice || !courseTypePrice || parseFloat(courseTypePrice) < 0}
                className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors"
              >
                {settingPrice ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Processing...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Set Price
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminPageLayout>
  );
};

export default AssignDiscountRate;
