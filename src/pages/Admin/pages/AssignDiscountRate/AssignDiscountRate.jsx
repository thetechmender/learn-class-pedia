import React, { useState, useCallback, useEffect } from 'react';
import { useToast } from '../../../../hooks/useToast';
import {adminApiService} from '../../../../services/AdminApi';
import { useDiscountRateMapping } from '../../../../hooks/useDiscountRateMapping';
import {
  Search,
  RefreshCw,
  BookOpen,
  CheckCircle,
  AlertCircle,
  Percent,
  Save,
  X,
  DollarSign
} from 'lucide-react';
import GenericDropdown from '../../../../components/GenericDropdown';
import AdminPageLayout from '../../../../components/AdminPageLayout';

const AssignDiscountRate = () => {
  const { toast, showToast } = useToast();
  const {
    discountRates,
    allCourses,
    error,
    fetchAllDiscountRates,
    fetchCoursesWithFilters,
    assignDiscountRateToCourse
  } = useDiscountRateMapping();
  
  // Component-specific state
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [selectedDiscountRate, setSelectedDiscountRate] = useState('');
  const [assigning, setAssigning] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [pagination, setPagination] = useState({
    page: 1,
    pageSize: 20,
    totalCount: 0
  });

  // Fetch courses with discount rates
  const fetchCourses = useCallback(async (page = 1, pageSize = 20, title = '') => {
    setLoading(true);
    try {
      const params = {
        page,
        pageSize,
        ...(title && { title })
      };
      const coursesData = await adminApiService.getAllCoursesAdmin(params);
      const coursesArray = coursesData?.items || coursesData?.data || coursesData || [];
      setCourses(coursesArray);
      
      // Update pagination info
      setPagination(prev => ({
        ...prev,
        page: coursesData?.page || page,
        totalCount: coursesData?.totalCount || coursesData?.totalCount || coursesArray.length,
        pageSize: coursesData?.pageSize || pageSize
      }));
    } catch (error) {
      console.error('Error fetching courses:', error);
      showToast('Failed to fetch courses', 'error');
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  // Handle course search
  const handleSearch = useCallback(async (term) => {
    setLoading(true);
    try {
      const params = {
        page: 1,
        pageSize: pagination.pageSize,
        ...(term && { title: term })
      };
      const coursesData = await adminApiService.getAllCoursesAdmin(params);
      const coursesArray = coursesData?.items || coursesData?.data || coursesData || [];
      setCourses(coursesArray);
      
      // Update pagination info
      setPagination(prev => ({
        ...prev,
        page: 1,
        totalCount: coursesData?.totalCount || coursesData?.totalCount || coursesArray.length
      }));
    } catch (error) {
      console.error('Error searching courses:', error);
      showToast('Failed to search courses', 'error');
    } finally {
      setLoading(false);
    }
  }, [showToast, pagination.pageSize]);

  // Debounced search
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchTerm) {
        handleSearch(searchTerm);
      } else {
        fetchCourses();
      }
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [searchTerm]); // Remove fetchCourses and handleSearch from dependencies

  // Handle page change
  const handlePageChange = useCallback(async (newPage) => {
    if (newPage < 1 || newPage > Math.ceil(pagination.totalCount / pagination.pageSize)) return;
    
    setPagination(prev => ({ ...prev, page: newPage }));
    await fetchCourses(newPage, pagination.pageSize, searchTerm);
  }, [fetchCourses, pagination.pageSize, pagination.totalCount, searchTerm]);

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
  }, []);

  // Handle modal submit
  const handleModalSubmit = useCallback(async () => {
    if (!selectedCourse) return;

    setAssigning(true);
    try {
      if (selectedDiscountRate) {
        // Assign discount rate
        await adminApiService.assignDiscountRate(selectedCourse.id, parseInt(selectedDiscountRate));
        showToast('Discount rate assigned successfully', 'success');
      } else {
        // Deassign discount rate (you might need to implement this endpoint)
        // For now, we'll just show a message
        showToast('Deassigning discount rates not yet implemented', 'info');
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
  }, [selectedCourse, selectedDiscountRate, pagination.page, pagination.pageSize, searchTerm, fetchCourses, showToast]);

  // Refresh data
  const handleRefresh = useCallback(() => {
    fetchCourses(pagination.page, pagination.pageSize, searchTerm);
  }, [pagination.page, pagination.pageSize, searchTerm]);

  // Initialize data
  useEffect(() => {
    fetchCourses();
    fetchAllDiscountRates({});
  }, []); // Remove dependencies to prevent infinite re-renders

  return (
    <AdminPageLayout
      title="Assign Discount Rate"
      subtitle="Manage discount rates for courses"
      icon={Percent}
      loading={loading}
      actions={
        <button
          onClick={handleRefresh}
          className="flex items-center px-4 py-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
        >
          <RefreshCw className="w-4 h-4 mr-2" />
          Refresh
        </button>
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

      {/* Search Bar */}
      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search courses by title..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Courses Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {loading ? (
          // Loading skeleton cards
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
            <div key={course.id} className="bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow duration-200 overflow-hidden">
              {/* Course Header with Image */}
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
                    <div className="bg-green-500 text-white px-2 py-1 rounded-full text-xs font-medium flex items-center">
                      <Percent className="w-3 h-3 mr-1" />
                      {course.discountRateTitle}
                    </div>
                  )}
                </div>
              </div>

              {/* Course Content */}
              <div className="p-4">
                <h3 className="font-semibold text-gray-900 text-lg mb-2 line-clamp-2">
                  {course.title}
                </h3>
                {course.subtitle && (
                  <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                    {course.subtitle}
                  </p>
                )}

                {/* Course Meta */}
                <div className="flex flex-wrap gap-2 mb-4">
                  {course.categoryName && (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800 border border-purple-200">
                      {course.categoryName}
                    </span>
                  )}
                  {course.courseLevelName && (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800 border border-orange-200">
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

                {/* Price and Discount Info */}
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

                {/* Action Button */}
                <button
                  onClick={() => handleAssignDiscount(course)}
                  className="w-full flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200 font-medium"
                >
                  <Percent className="w-4 h-4 mr-2" />
                  {course.discountRateId ? 'Change Discount' : 'Assign Discount'}
                </button>
              </div>
            </div>
          ))
        ) : (
          // Empty state
          <div className="col-span-full text-center py-12">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <BookOpen className="w-10 h-10 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No courses found</h3>
            <p className="text-gray-500">
              {searchTerm ? 'Try adjusting your search terms' : 'Get started by creating your first course'}
            </p>
          </div>
        )}
      </div>

      {/* Manual Pagination Component */}
      {pagination.totalCount > pagination.pageSize && (
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
                  { value: '', label: 'No Discount' },
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
    </AdminPageLayout>
  );
};

export default AssignDiscountRate;
