import { useState, useEffect, useCallback } from 'react';
import {
  Users,
  Filter,
  X,
  ChevronLeft,
  ChevronRight,
  Calendar,
  Mail,
  Phone,
  CheckCircle,
  XCircle,
  BookOpen,
  RefreshCw,
  Eye,
  User,
  CreditCard,
  AlertCircle,
  ShoppingBag,
  Clock,
} from 'lucide-react';
import useStudentManagement from '../../../../hooks/api/useStudentManagement';
import GenericDropdown from '../../../../components/GenericDropdown/GenericDropdown';

const StudentManagement = () => {
  const {
    loading,
    error,
    students,
    selectedStudent,
    pagination,
    getAllStudents,
    getStudentById,
    filterStudents,
    clearError,
    setSelectedStudent,
    getSignupTypesDropdown,
    getStudentOrders,
  } = useStudentManagement();

  // Component state
  const [filters, setFilters] = useState({
    fullName: '',
    email: '',
    phoneNumber: '',
    isEmailVerified: '',
    signupTypeId: '',
  });
  const [showFilters, setShowFilters] = useState(false);
  const [showStudentDetails, setShowStudentDetails] = useState(false);
  const [showOrdersModal, setShowOrdersModal] = useState(false);
  const [showEnrollmentsModal, setShowEnrollmentsModal] = useState(false);
  const [studentOrders, setStudentOrders] = useState(null);
  const [studentEnrollments, setStudentEnrollments] = useState(null);
  const [loadingEnrollments, setLoadingEnrollments] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  // Dropdown data state
  const [signupTypes, setSignupTypes] = useState([]);
  const [loadingDropdowns, setLoadingDropdowns] = useState(false);

  // Load dropdown data
  const loadDropdownData = useCallback(async () => {
    setLoadingDropdowns(true);
    try {
      const [ signupTypesData] = await Promise.all([
        getSignupTypesDropdown()
      ]);
      
      setSignupTypes(signupTypesData || []);
    } catch (err) {
      console.error('Failed to load dropdown data:', err);
    } finally {
      setLoadingDropdowns(false);
    }
  }, [getSignupTypesDropdown]);

  // Load dropdown data on component mount
  useEffect(() => {
    loadDropdownData();
  }, [loadDropdownData]);


  // Load students function
  const loadStudents = useCallback(async (page = 1, pageSize = 100) => {
    try {
      await getAllStudents(page, pageSize, filters);
    } catch (err) {
      console.error('Failed to load students:', err);
    }
  }, [getAllStudents, filters]);


  // Handle refresh
  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    try {
      await loadStudents(pagination.currentPage, pagination.pageSize);
    } catch (err) {
      console.error('Failed to refresh students:', err);
    } finally {
      setIsRefreshing(false);
    }
  }, [loadStudents, pagination.currentPage, pagination.pageSize]);

  // Load initial data on mount
  useEffect(() => {
    getAllStudents(1, 100, {});
  }, [getAllStudents]);

  const handleFilter = useCallback(async () => {
    try {
      await filterStudents(filters, 1, pagination.pageSize);
    } catch (err) {
      console.error('Failed to filter students:', err);
    }
  }, [filterStudents, filters, pagination.pageSize]);

  const handlePageChange = useCallback(async (newPage) => {
    try {
      await getAllStudents(newPage, pagination.pageSize, filters);
    } catch (err) {
      console.error('Failed to change page:', err);
    }
  }, [getAllStudents, pagination.pageSize, filters]);

  const handleViewStudent = useCallback(async (studentId) => {
    try {
      await getStudentById(studentId);
      setShowStudentDetails(true);
    } catch (err) {
      console.error('Failed to fetch student details:', err);
    }
  }, [getStudentById]);

  const handleViewOrders = useCallback(async (studentId) => {
    try {
      const ordersData = await getStudentOrders(studentId);
      setStudentOrders(ordersData);
      setShowOrdersModal(true);
    } catch (err) {
      console.error('Failed to fetch student orders:', err);
    }
  }, [getStudentOrders]);

  const handleViewEnrollments = useCallback(async (studentId) => {
    setLoadingEnrollments(true);
    try {
      const studentData = await getStudentById(studentId);
      setStudentEnrollments(studentData);
      setShowEnrollmentsModal(true);
    } catch (err) {
      console.error('Failed to fetch student enrollments:', err);
    } finally {
      setLoadingEnrollments(false);
    }
  }, [getStudentById]);

  const handleFilterChange = (field, value) => {
    setFilters(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const clearFilters = useCallback(async () => {
    try {
      const emptyFilters = {
        fullName: '',
        email: '',
        phoneNumber: '',
        isEmailVerified: '',
        signupTypeId: '',
      };
      setFilters(emptyFilters);
      await getAllStudents(1, pagination.pageSize, emptyFilters);
    } catch (err) {
      console.error('Failed to clear filters:', err);
    }
  }, [getAllStudents, pagination.pageSize]);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString();
  };

  const formatDateTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'numeric',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    });
  };

  // Helper function to get initials from name
  const getInitials = (fullName, firstName, lastName) => {
    if (firstName && lastName) {
      return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
    }
    if (fullName) {
      const names = fullName.trim().split(' ');
      if (names.length >= 2) {
        return `${names[0].charAt(0)}${names[names.length - 1].charAt(0)}`.toUpperCase();
      }
      return fullName.substring(0, 2).toUpperCase();
    }
    return 'NA';
  };

  // Helper function to check if we should use initials instead of image
  const shouldUseInitials = (imageUrl) => {
    if (!imageUrl) return true;
    // Check if it's a Google profile image or similar service
    return imageUrl.includes('googleusercontent.com') || 
           imageUrl.includes('graph.facebook.com') ||
           imageUrl.includes('platform-lookaside.fbsbx.com');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 p-3 lg:p-4">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 p-6 lg:p-8 mb-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl shadow-lg">
              <Users className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
                Student Management
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                Manage and monitor student information and enrollment details
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 transition-all duration-200 shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
              Refresh
            </button>
            <div className="px-4 py-2 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
              <div className="text-sm text-gray-600 dark:text-gray-400">Total Students</div>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">{pagination.totalCount}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex flex-col xl:flex-row xl:justify-end gap-4">
          {/* Filter Toggle */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl transition-all duration-200 shadow-sm hover:shadow-md ${
              showFilters
                ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
            }`}
          >
            <Filter className="w-4 h-4" />
            <span>Filters</span>
            {showFilters && (
              <span className="ml-2 px-2 py-1 bg-white/20 rounded-full text-xs">
                {Object.values(filters).filter(v => v !== '').length}
              </span>
            )}
          </button>
        </div>

        {/* Advanced Filters */}
        {showFilters && (
          <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 pt-6 border-t border-gray-200 dark:border-gray-700">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Full Name</label>
              <input
                type="text"
                placeholder="Enter full name"
                value={filters.fullName}
                onChange={(e) => handleFilterChange('fullName', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition-all duration-200"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Email</label>
              <input
                type="email"
                placeholder="Enter email address"
                value={filters.email}
                onChange={(e) => handleFilterChange('email', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition-all duration-200"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Phone Number</label>
              <input
                type="tel"
                placeholder="Enter phone number"
                value={filters.phoneNumber}
                onChange={(e) => handleFilterChange('phoneNumber', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition-all duration-200"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Email Verified</label>
              <GenericDropdown
                value={filters.isEmailVerified}
                onChange={(value) => handleFilterChange('isEmailVerified', value)}
                options={[
                  
                  { id: 'true', title: 'Verified' },
                  { id: 'false', title: 'Not Verified' }
                ]}
                placeholder="All"
                emptyOptionText="All"
              />
            </div>
       
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Signup Type</label>
              <GenericDropdown
                value={filters.signupTypeId}
                onChange={(value) => handleFilterChange('signupTypeId', value)}
                options={signupTypes}
                placeholder="All Signup Types"
                disabled={loadingDropdowns}
                loading={loadingDropdowns}
                emptyOptionText="All Signup Types"
                labelKey="typeName"
              />
            </div>
            <div className="flex gap-3 lg:col-span-4">
              <button
                onClick={handleFilter}
                className="flex items-center gap-2 px-6 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                <Filter className="w-4 h-4" />
                Apply Filters
              </button>
              <button
                onClick={clearFilters}
                className="flex items-center gap-2 px-6 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-all duration-200"
              >
                <X className="w-4 h-4" />
                Clear All
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-gradient-to-r from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-800/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-6 py-4 rounded-xl flex items-center justify-between shadow-lg">
          <div className="flex items-center gap-3">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <span className="font-medium">{error}</span>
          </div>
          <button 
            onClick={clearError} 
            className="text-red-500 hover:text-red-700 dark:hover:text-red-300 transition-colors p-1 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      )}

      {/* Students Table */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
        {/* Desktop Table */}
        <div className="hidden xl:block overflow-x-auto">
          <table className="w-full table-fixed">
            <thead className="bg-gray-50 dark:bgGeo Location Country-gray-700 border-b border-gray-200 dark:border-gray-600">
              <tr>
                <th className="px-4 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider w-[250px]">
                  Student
                </th>
                {/* <th className="px-4 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider w-[250px]">
                  Contact
                </th> */}
                <th className="px-4 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider w-[120px]">
                  Email Status
                </th>
                <th className="px-4 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider w-[100px]">
                  Enrollments
                </th>
                <th className="px-4 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider w-[100px]">
                  Signup through
                </th>
                <th className="px-4 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider w-[100px]">
                  Advertising Medium
                </th>
                <th className="px-4 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider w-[100px]">
                  Landing Page
                </th>
                <th className="px-4 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider w-[100px]">
                  Referral URL
                </th>
                <th className="px-4 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider w-[120px]">
                  Signup Date
                </th>
                <th className="px-4 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider w-[150px]">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {loading ? (
                <tr>
                  <td colSpan="10" className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                      <span className="text-gray-500 dark:text-gray-400 font-medium">Loading students...</span>
                    </div>
                  </td>
                </tr>
              ) : students.length === 0 ? (
                <tr>
                  <td colSpan="10" className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <Users className="w-12 h-12 text-gray-400" />
                      <span className="text-gray-500 dark:text-gray-400 font-medium text-lg">No students found</span>
                      <span className="text-gray-400 dark:text-gray-500 text-sm">Try adjusting your search or filters</span>
                    </div>
                  </td>
                </tr>
              ) : (
                students.map((student) => (
                  <tr key={student.id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-150">
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="h-12 w-12 flex-shrink-0">
                          {student.profileImageUrl && !shouldUseInitials(student.profileImageUrl) ? (
                            <img
                              className="h-12 w-12 rounded-full object-cover border border-gray-300"
                              src={student.profileImageUrl}
                              alt={student.fullName}
                              onError={(e) => {
                                e.target.style.display = 'none';
                                e.target.nextSibling.style.display = 'flex';
                              }}
                            />
                          ) : null}
                          <div 
                            className="h-12 w-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm"
                            style={{ display: student.profileImageUrl && !shouldUseInitials(student.profileImageUrl) ? 'none' : 'flex' }}
                          >
                            {getInitials(student.fullName, student.firstName, student.lastName)}
                          </div>
                        </div>
                        <div className="ml-3 min-w-0">
                          <div className="text-sm font-medium text-gray-900 dark:text-white">
                            {student.firstName && student.lastName 
                              ? `${student.firstName} ${student.lastName}`
                              : student.fullName || 'N/A'
                            }
                          </div>
                          <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            {student.email}
                          </div>
                        </div>
                      </div>
                    </td>
                    {/* <td className="px-4 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <Mail className="w-4 h-4 text-gray-400" />
                        <span className="text-sm text-gray-900 dark:text-white truncate max-w-[200px]">
                          {student.email}
                        </span>
                      </div>
                    </td> */}
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="inline-flex items-center gap-2 text-sm">
                        {student.isEmailVerified ? (
                          <>
                            <CheckCircle className="w-4 h-4 text-green-500" />
                            <span className="text-green-600 font-medium">Verified</span>
                          </>
                        ) : (
                          <>
                            <XCircle className="w-4 h-4 text-red-500" />
                            <span className="text-red-600 font-medium">Not Verified</span>
                          </>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleViewEnrollments(student.id);
                        }}
                        disabled={!student.enrollmentCount}
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium border transition-colors ${
                          student.enrollmentCount
                            ? 'bg-blue-50 border-blue-200 text-blue-600 hover:bg-blue-100 hover:border-blue-300 dark:bg-blue-900/20 dark:border-blue-700 dark:text-blue-400 dark:hover:bg-blue-900/30 cursor-pointer'
                            : 'bg-gray-50 border-gray-200 text-gray-400 cursor-not-allowed dark:bg-gray-800 dark:border-gray-700 dark:text-gray-500'
                        }`}
                      >
                        <div className={`p-1 rounded-lg ${student.enrollmentCount ? 'bg-white/20' : 'bg-gray-200 dark:bg-gray-700'}`}>
                          <BookOpen className="w-3.5 h-3.5" />
                        </div>
                        <span>Enroll {student.enrollmentCount || 0}</span>
                      </button>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <span className={`text-sm font-medium ${
                        student.signupTypeName === 'Email' ? 'text-blue-600' :
                        student.signupTypeName === 'Google' ? 'text-red-600' :
                        student.signupTypeName === 'Facebook' ? 'text-indigo-600' :
                        student.signupTypeName === 'LinkedIn' ? 'text-cyan-600' :
                        student.signupTypeName === 'Apple' ? 'text-gray-600' :
                        'text-purple-600'
                      }`}>
                        {student.signupTypeName || 'N/A'}
                      </span>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        {student.advertisingMedium ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1.5 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 rounded-lg text-xs font-medium border border-indigo-200 dark:border-indigo-800">
                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
                            </svg>
                            <span className="truncate max-w-[90px]">{student.advertisingMedium}</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1.5 bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 rounded-lg text-xs font-medium border border-gray-200 dark:border-gray-600">
                            N/A
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        {student.landingPageUrl ? (
                          <a 
                            href={student.landingPageUrl} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 px-2.5 py-1.5 bg-teal-50 dark:bg-teal-900/30 text-teal-700 dark:text-teal-300 rounded-lg text-xs font-medium hover:bg-teal-100 dark:hover:bg-teal-900/50 transition-colors border border-teal-200 dark:border-teal-800"
                            title={student.landingPageUrl}
                          >
                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9-9a9 9 0 009-9m-9 9h18" />
                            </svg>
                            <span className="truncate max-w-[80px]">Open Link</span>
                          </a>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1.5 bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 rounded-lg text-xs font-medium border border-gray-200 dark:border-gray-600">
                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                            </svg>
                            N/A
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        {student.signupTypeUrl ? (
                          <a 
                            href={student.signupTypeUrl} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 px-2.5 py-1.5 bg-purple-50 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-lg text-xs font-medium hover:bg-purple-100 dark:hover:bg-purple-900/50 transition-colors border border-purple-200 dark:border-purple-800"
                            title={student.signupTypeUrl}
                          >
                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                            </svg>
                            <span className="truncate max-w-[80px]">Referral</span>
                          </a>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1.5 bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 rounded-lg text-xs font-medium border border-gray-200 dark:border-gray-600">
                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                            </svg>
                            N/A
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <div className="p-1.5 bg-blue-50 dark:bg-blue-900/30 rounded-lg">
                          <Calendar className="w-4 h-4 text-blue-500" />
                        </div>
                        <div className="flex flex-col">
                          <span className="text-sm font-semibold text-gray-900 dark:text-white">
                            {new Date(student.createdAt).toLocaleDateString()}
                          </span>
                          <span className="text-xs text-gray-500 dark:text-gray-400 font-mono">
                            {new Date(student.createdAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false })}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="flex gap-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleViewStudent(student.id);
                          }}
                          className="inline-flex items-center justify-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium border transition-colors bg-blue-50 border-blue-200 text-blue-600 hover:bg-blue-100 hover:border-blue-300 dark:bg-blue-900/20 dark:border-blue-700 dark:text-blue-400 dark:hover:bg-blue-900/30 cursor-pointer w-[70px]"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>View</span>
                        </button>
                        {(student.enrollmentCount || 0) > 0 && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleViewOrders(student.id);
                            }}
                            className="inline-flex items-center justify-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium border transition-colors bg-green-50 border-green-200 text-green-600 hover:bg-green-100 hover:border-green-300 dark:bg-green-900/20 dark:border-green-700 dark:text-green-400 dark:hover:bg-green-900/30 cursor-pointer w-[70px]"
                          >
                            <ShoppingBag className="w-3.5 h-3.5" />
                            <span>Orders</span>
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Medium Screen Compact Table */}
        <div className="hidden lg:block xl:hidden overflow-x-auto">
          <table className="w-full table-fixed">
            <thead className="bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider w-[200px]">
                  Student
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider w-[200px]">
                  Email
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider w-[100px]">
                  Status
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider w-[100px]">
                  Enrollments
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider w-[120px]">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {loading ? (
                <tr>
                  <td colSpan="5" className="px-4 py-8 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-6 h-6 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                      <span className="text-gray-500 dark:text-gray-400 font-medium text-sm">Loading students...</span>
                    </div>
                  </td>
                </tr>
              ) : students.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-4 py-8 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <Users className="w-12 h-12 text-gray-400" />
                      <span className="text-gray-500 dark:text-gray-400 font-medium">No students found</span>
                    </div>
                  </td>
                </tr>
              ) : (
                students.map((student) => (
                  <tr key={student.id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-150">
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 flex-shrink-0">
                          {student.profileImageUrl && !shouldUseInitials(student.profileImageUrl) ? (
                            <img
                              className="w-10 h-10 rounded-full object-cover ring-2 ring-blue-100 dark:ring-blue-900/50"
                              src={student.profileImageUrl}
                              alt={student.fullName}
                              onError={(e) => {
                                e.target.style.display = 'none';
                                e.target.nextSibling.style.display = 'flex';
                              }}
                            />
                          ) : null}
                          <div 
                            className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-xs"
                            style={{ display: student.profileImageUrl && !shouldUseInitials(student.profileImageUrl) ? 'none' : 'flex' }}
                          >
                            {getInitials(student.fullName, student.firstName, student.lastName)}
                          </div>
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                            {student.firstName && student.lastName 
                              ? `${student.firstName} ${student.lastName}`
                              : student.fullName || 'N/A'
                            }
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="text-sm text-gray-900 dark:text-white truncate max-w-[150px]">
                        {student.email}
                      </div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="inline-flex items-center gap-1.5 text-xs text-gray-700 dark:text-gray-300">
                        {student.isEmailVerified ? (
                          <CheckCircle className="w-3.5 h-3.5 text-green-500" />
                        ) : (
                          <XCircle className="w-3.5 h-3.5 text-red-500" />
                        )}
                        <span>
                          {student.isEmailVerified ? 'Verified' : 'Not Verified'}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleViewEnrollments(student.id);
                        }}
                        disabled={!student.enrollmentCount}
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium border transition-colors ${
                          student.enrollmentCount
                            ? 'bg-blue-50 border-blue-200 text-blue-600 hover:bg-blue-100 hover:border-blue-300 dark:bg-blue-900/20 dark:border-blue-700 dark:text-blue-400 dark:hover:bg-blue-900/30 cursor-pointer'
                            : 'bg-gray-50 border-gray-200 text-gray-400 cursor-not-allowed dark:bg-gray-800 dark:border-gray-700 dark:text-gray-500'
                        }`}
                      >
                        <div className={`p-1 rounded-lg ${student.enrollmentCount ? 'bg-white/20' : 'bg-gray-200 dark:bg-gray-700'}`}>
                          <BookOpen className="w-3.5 h-3.5" />
                        </div>
                        <span>Enroll {student.enrollmentCount || 0}</span>
                      </button>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="flex gap-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleViewStudent(student.id);
                          }}
                          className="inline-flex items-center justify-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium border transition-colors bg-blue-50 border-blue-200 text-blue-600 hover:bg-blue-100 hover:border-blue-300 dark:bg-blue-900/20 dark:border-blue-700 dark:text-blue-400 dark:hover:bg-blue-900/30 cursor-pointer w-[60px]"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>View</span>
                        </button>
                        {(student.enrollmentCount || 0) > 0 && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleViewOrders(student.id);
                            }}
                            className="inline-flex items-center justify-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium border transition-colors bg-green-50 border-green-200 text-green-600 hover:bg-green-100 hover:border-green-300 dark:bg-green-900/20 dark:border-green-700 dark:text-green-400 dark:hover:bg-green-900/30 cursor-pointer w-[60px]"
                          >
                            <ShoppingBag className="w-3.5 h-3.5" />
                            <span>Orders</span>
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile Cards Layout */}
        <div className="lg:hidden p-4 space-y-4">
          {loading ? (
            // Mobile loading skeleton
            Array.from({ length: 5 }).map((_, index) => (
              <div key={index} className="bg-gray-50 dark:bg-gray-700 rounded-2xl p-4 animate-pulse">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-14 h-14 bg-gray-200 rounded-full"></div>
                  <div className="flex-1">
                    <div className="h-4 bg-gray-200 rounded mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-20"></div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="h-3 bg-gray-200 rounded"></div>
                  <div className="h-3 bg-gray-200 rounded"></div>
                </div>
              </div>
            ))
          ) : students.length === 0 ? (
            <div className="text-center py-12">
              <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">No students found</h3>
              <p className="text-gray-500 dark:text-gray-400">Try adjusting your search or filters</p>
            </div>
          ) : (
            students.map((student) => (
              <div key={student.id} className="bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 rounded-2xl p-4 border border-gray-200 dark:border-gray-700 shadow-lg hover:shadow-xl transition-all duration-300">
                {/* Student Header */}
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-16 h-16 flex-shrink-0">
                    {student.profileImageUrl && !shouldUseInitials(student.profileImageUrl) ? (
                      <img
                        className="w-16 h-16 rounded-full object-cover ring-3 ring-blue-100 dark:ring-blue-900/50 shadow-lg"
                        src={student.profileImageUrl}
                        alt={student.fullName}
                        onError={(e) => {
                          e.target.style.display = 'none';
                          e.target.nextSibling.style.display = 'flex';
                        }}
                      />
                    ) : null}
                    <div 
                      className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-lg shadow-lg"
                      style={{ display: student.profileImageUrl && !shouldUseInitials(student.profileImageUrl) ? 'none' : 'flex' }}
                    >
                      {getInitials(student.fullName, student.firstName, student.lastName)}
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1 truncate">
                      {student.firstName && student.lastName 
                        ? `${student.firstName} ${student.lastName}`
                        : student.fullName || 'N/A'
                      }
                    </h3>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                      <span className="text-sm text-gray-500 dark:text-gray-400 font-medium">Active Student</span>
                    </div>
                  </div>
                </div>

                {/* Contact Information */}
                <div className="space-y-3 mb-4">
                  <div className="flex items-center gap-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <div className="p-2 bg-blue-500 rounded-lg">
                      <Mail className="w-4 h-4 text-white" />
                    </div>
                    <span className="text-sm font-medium text-gray-900 dark:text-white truncate">
                      {student.email}
                    </span>
                  </div>
                  {student.phoneNumber && (
                    <div className="flex items-center gap-3 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                      <div className="p-2 bg-green-500 rounded-lg">
                        <Phone className="w-4 h-4 text-white" />
                      </div>
                      <span className="text-sm font-medium text-gray-900 dark:text-white">
                        {student.phoneNumberWithCountryCode || 
                         (student.phoneCountryCode && student.phoneNumber 
                           ? `${student.phoneCountryCode} ${student.phoneNumber}` 
                           : student.phoneNumber)}
                      </span>
                    </div>
                  )}
                </div>

                {/* Status and Stats Grid */}
                <div className="grid grid-cols-2 gap-3 mb-4">
                  <div className="inline-flex items-center gap-2 text-xs text-gray-700 dark:text-gray-300">
                    {student.isEmailVerified ? (
                      <CheckCircle className="w-3.5 h-3.5 text-green-500" />
                    ) : (
                      <XCircle className="w-3.5 h-3.5 text-red-500" />
                    )}
                    <span>
                      {student.isEmailVerified ? 'Verified' : 'Not Verified'}
                    </span>
                  </div>

                  <button
                    onClick={() => student.enrollmentCount && handleViewEnrollments(student.id)}
                    disabled={!student.enrollmentCount}
                    className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium border transition-colors ${
                      student.enrollmentCount
                        ? 'bg-blue-50 border-blue-200 text-blue-600 hover:bg-blue-100 hover:border-blue-300 dark:bg-blue-900/20 dark:border-blue-700 dark:text-blue-400 dark:hover:bg-blue-900/30 cursor-pointer'
                        : 'bg-gray-50 border-gray-200 text-gray-400 cursor-not-allowed dark:bg-gray-800 dark:border-gray-700 dark:text-gray-500'
                    }`}
                  >
                    <div className={`p-1.5 rounded-lg ${student.enrollmentCount ? 'bg-white/20' : 'bg-gray-200 dark:bg-gray-700'}`}>
                      <BookOpen className="w-4 h-4" />
                    </div>
                    <span>Enroll {student.enrollmentCount || 0}</span>
                  </button>

                  <div className="text-xs text-gray-700 dark:text-gray-300">
                    <span className="font-semibold">Signup:</span> {student.signupTypeName || 'N/A'}
                  </div>

                  <div className="text-xs text-gray-700 dark:text-gray-300">
                    <span className="font-semibold">Ad Medium:</span> {student.advertisingMedium || 'N/A'}
                  </div>

                  {student.landingPageUrl ? (
                    <a 
                      href={student.landingPageUrl} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-2 py-1 bg-teal-50 dark:bg-teal-900/30 text-teal-700 dark:text-teal-300 rounded-lg text-xs font-medium hover:bg-teal-100 dark:hover:bg-teal-900/50 transition-colors border border-teal-200 dark:border-teal-800"
                      title={student.landingPageUrl}
                    >
                      <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9-9a9 9 0 009-9m-9 9h18" />
                      </svg>
                      Landing Page
                    </a>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 rounded-lg text-xs font-medium border border-gray-200 dark:border-gray-600">
                      <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                      </svg>
                      N/A
                    </span>
                  )}

                  {student.signupTypeUrl ? (
                    <a 
                      href={student.signupTypeUrl} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-2 py-1 bg-purple-50 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-lg text-xs font-medium hover:bg-purple-100 dark:hover:bg-purple-900/50 transition-colors border border-purple-200 dark:border-purple-800"
                      title={student.signupTypeUrl}
                    >
                      <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                      Referral
                    </a>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 rounded-lg text-xs font-medium border border-gray-200 dark:border-gray-600">
                      <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                      </svg>
                      N/A
                    </span>
                  )}

                  <div className="col-span-2 bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 p-3 rounded-xl border border-blue-200 dark:border-blue-800">
                    <div className="flex items-center gap-2">
                      <div className="p-1.5 bg-blue-500 rounded-lg">
                        <Calendar className="w-4 h-4 text-white" />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-sm font-bold text-gray-900 dark:text-white">
                          {new Date(student.createdAt).toLocaleDateString()}
                        </span>
                        <span className="text-xs text-gray-600 dark:text-gray-400 font-mono">
                          {new Date(student.createdAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false })}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleViewStudent(student.id);
                    }}
                    className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium border transition-colors bg-blue-50 border-blue-200 text-blue-600 hover:bg-blue-100 hover:border-blue-300 dark:bg-blue-900/20 dark:border-blue-700 dark:text-blue-400 dark:hover:bg-blue-900/30 cursor-pointer"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>View</span>
                  </button>
                  <button
                    onClick={() => student.enrollmentCount && handleViewEnrollments(student.id)}
                    disabled={!student.enrollmentCount}
                    className={`flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium border transition-colors ${
                      student.enrollmentCount
                        ? 'bg-blue-50 border-blue-200 text-blue-600 hover:bg-blue-100 hover:border-blue-300 dark:bg-blue-900/20 dark:border-blue-700 dark:text-blue-400 dark:hover:bg-blue-900/30 cursor-pointer'
                        : 'bg-gray-50 border-gray-200 text-gray-400 cursor-not-allowed dark:bg-gray-800 dark:border-gray-700 dark:text-gray-500'
                    }`}
                  >
                    <BookOpen className="w-3.5 h-3.5" />
                    <span>Enroll {student.enrollmentCount || 0}</span>
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="text-sm text-gray-700 dark:text-gray-300 font-medium">
                Showing <span className="font-semibold text-gray-900 dark:text-white">{((pagination.currentPage - 1) * pagination.pageSize) + 1}</span> to{' '}
                <span className="font-semibold text-gray-900 dark:text-white">{Math.min(pagination.currentPage * pagination.pageSize, pagination.totalCount)}</span> of{' '}
                <span className="font-semibold text-gray-900 dark:text-white">{pagination.totalCount}</span> results
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handlePageChange(pagination.currentPage - 1)}
                  disabled={!pagination.hasPreviousPage}
                  className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-600 border border-gray-300 dark:border-gray-500 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-500 transition-all duration-200 shadow-sm hover:shadow-md"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span>Previous</span>
                </button>
                
                <div className="flex items-center gap-1">
                  {/* Page numbers */}
                  {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                    let pageNum;
                    if (pagination.totalPages <= 5) {
                      pageNum = i + 1;
                    } else if (pagination.currentPage <= 3) {
                      pageNum = i + 1;
                    } else if (pagination.currentPage >= pagination.totalPages - 2) {
                      pageNum = pagination.totalPages - 4 + i;
                    } else {
                      pageNum = pagination.currentPage - 2 + i;
                    }
                    
                    return (
                      <button
                        key={pageNum}
                        onClick={() => handlePageChange(pageNum)}
                        className={`w-10 h-10 rounded-lg font-medium transition-all duration-200 ${
                          pageNum === pagination.currentPage
                            ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg'
                            : 'bg-white dark:bg-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-500'
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                </div>
                
                <button
                  onClick={() => handlePageChange(pagination.currentPage + 1)}
                  disabled={!pagination.hasNextPage}
                  className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-600 border border-gray-300 dark:border-gray-500 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-500 transition-all duration-200 shadow-sm hover:shadow-md"
                >
                  <span>Next</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Student Details Modal */}
      {showStudentDetails && selectedStudent && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 rounded-3xl max-w-5xl w-full max-h-[85vh] overflow-y-auto shadow-2xl border border-gray-200/50 dark:border-gray-700/50 animate-slideUp">
            {/* Modal Header */}
            <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-700 dark:to-purple-700 p-6 rounded-t-3xl border-b border-gray-200/50 dark:border-gray-700/50">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-white/20 backdrop-blur-sm rounded-2xl">
                    <Users className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-white">Student Details</h2>
                    <p className="text-blue-100 text-sm">ID: {selectedStudent.id}</p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setShowStudentDetails(false);
                    setSelectedStudent(null);
                  }}
                  className="p-3 bg-white/20 backdrop-blur-sm rounded-2xl hover:bg-white/30 transition-all duration-200 group"
                >
                  <X className="w-5 h-5 text-white group-hover:rotate-90 transition-transform duration-200" />
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-6 lg:p-8">
              {/* Student Profile Section */}
              <div className="bg-gradient-to-r from-blue-50 via-purple-50 to-pink-50 dark:from-blue-900/20 dark:via-purple-900/20 dark:to-pink-900/20 rounded-2xl p-6 mb-8 border border-blue-200/50 dark:border-blue-800/30">
                <div className="flex flex-col lg:flex-row items-center lg:items-start gap-6">
                  {/* Profile Image */}
                  <div className="relative">
                    {selectedStudent.profileImageUrl && !shouldUseInitials(selectedStudent.profileImageUrl) ? (
                      <img
                        className="h-24 w-24 rounded-3xl object-cover ring-4 ring-white dark:ring-gray-700 shadow-2xl"
                        src={selectedStudent.profileImageUrl}
                        alt={selectedStudent.fullName}
                        onError={(e) => {
                          e.target.style.display = 'none';
                          e.target.nextSibling.style.display = 'flex';
                        }}
                      />
                    ) : null}
                    <div 
                      className="h-24 w-24 rounded-3xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-2xl shadow-2xl"
                      style={{ display: selectedStudent.profileImageUrl && !shouldUseInitials(selectedStudent.profileImageUrl) ? 'none' : 'flex' }}
                    >
                      {getInitials(selectedStudent.fullName, selectedStudent.firstName, selectedStudent.lastName)}
                    </div>
                    {/* Status Badge */}
                    <div className="absolute -bottom-2 -right-2">
                      {selectedStudent.isEmailVerified ? (
                        <div className="flex items-center gap-1 px-3 py-1 bg-green-500 text-white rounded-full text-xs font-semibold shadow-lg">
                          <CheckCircle className="w-3 h-3" />
                          Verified
                        </div>
                      ) : (
                        <div className="flex items-center gap-1 px-3 py-1 bg-red-500 text-white rounded-full text-xs font-semibold shadow-lg">
                          <XCircle className="w-3 h-3" />
                          Not Verified
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Student Info */}
                  <div className="flex-1 text-center lg:text-left">
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                      {selectedStudent.fullName}
                    </h3>
                    <div className="flex flex-wrap justify-center lg:justify-start gap-2 mb-4">
                      <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 rounded-full text-sm font-medium">
                        {selectedStudent.signupTypeName}
                      </span>
                      
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center justify-center lg:justify-start gap-2">
                        <Mail className="w-4 h-4 text-gray-500" />
                        <span className="text-gray-700 dark:text-gray-300">{selectedStudent.email}</span>
                      </div>
                      {selectedStudent.phoneNumber && (
                        <div className="flex items-center justify-center lg:justify-start gap-2">
                          <Phone className="w-4 h-4 text-gray-500" />
                          <span className="text-gray-700 dark:text-gray-300">
                            {selectedStudent.phoneNumberWithCountryCode || 
                             (selectedStudent.phoneCountryCode && selectedStudent.phoneNumber 
                               ? `${selectedStudent.phoneCountryCode} ${selectedStudent.phoneNumber}` 
                               : selectedStudent.phoneNumber)}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Additional Information */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
                <div className="bg-gradient-to-br from-green-50 to-emerald-100 dark:from-green-900/30 dark:to-emerald-900/30 p-3 rounded-xl border border-green-200/50 dark:border-green-800/30 hover:shadow-md transition-all duration-200">
                  <div className="flex items-center gap-2 mb-1">
                    <div className="p-1.5 bg-green-500 rounded-lg">
                      <Calendar className="w-3.5 h-3.5 text-white" />
                    </div>
                    <h4 className="font-semibold text-gray-900 dark:text-white text-xs">Member Since</h4>
                  </div>
                  <p className="text-gray-700 dark:text-gray-300 font-medium text-sm">{formatDateTime(selectedStudent.createdAt)}</p>
                </div>
                <div className="bg-gradient-to-br from-purple-50 to-pink-100 dark:from-purple-900/30 dark:to-pink-900/30 p-3 rounded-xl border border-purple-200/50 dark:border-purple-800/30 hover:shadow-md transition-all duration-200">
                  <div className="flex items-center gap-2 mb-1">
                    <div className="p-1.5 bg-purple-500 rounded-lg">
                      <BookOpen className="w-3.5 h-3.5 text-white" />
                    </div>
                    <h4 className="font-semibold text-gray-900 dark:text-white text-xs">Enrollments</h4>
                  </div>
                  <p className="text-gray-700 dark:text-gray-300 font-medium text-sm">{selectedStudent.enrollments?.length || 0} Courses</p>
                </div>
                <div className="bg-gradient-to-br from-blue-50 to-cyan-100 dark:from-blue-900/30 dark:to-cyan-900/30 p-3 rounded-xl border border-blue-200/50 dark:border-blue-800/30 hover:shadow-md transition-all duration-200">
                  <div className="flex items-center gap-2 mb-1">
                    <div className="p-1.5 bg-blue-500 rounded-lg">
                      <User className="w-3.5 h-3.5 text-white" />
                    </div>
                    <h4 className="font-semibold text-gray-900 dark:text-white text-xs">Signup Country</h4>
                  </div>
                  <p className="text-gray-700 dark:text-gray-300 font-medium text-sm truncate">{selectedStudent.signupCountry || 'N/A'}</p>
                </div>
                <div className="bg-gradient-to-br from-orange-50 to-amber-100 dark:from-orange-900/30 dark:to-amber-900/30 p-3 rounded-xl border border-orange-200/50 dark:border-orange-800/30 hover:shadow-md transition-all duration-200">
                  <div className="flex items-center gap-2 mb-1">
                    <div className="p-1.5 bg-orange-500 rounded-lg">
                      <User className="w-3.5 h-3.5 text-white" />
                    </div>
                    <h4 className="font-semibold text-gray-900 dark:text-white text-xs">GeoLocation Country</h4>
                  </div>
                  <p className="text-gray-700 dark:text-gray-300 font-medium text-sm truncate">{selectedStudent.geoLocationCountryName || 'N/A'}</p>
                </div>
                <div className="bg-gradient-to-br from-indigo-50 to-blue-100 dark:from-indigo-900/30 dark:to-blue-900/30 p-3 rounded-xl border border-indigo-200/50 dark:border-indigo-800/30 hover:shadow-md transition-all duration-200">
                  <div className="flex items-center gap-2 mb-1">
                    <div className="p-1.5 bg-indigo-500 rounded-lg">
                      <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
                      </svg>
                    </div>
                    <h4 className="font-semibold text-gray-900 dark:text-white text-xs">Advertising Medium</h4>
                  </div>
                  <p className="text-gray-700 dark:text-gray-300 font-medium text-sm truncate">{selectedStudent.advertisingMedium || 'N/A'}</p>
                </div>
                <div className="bg-gradient-to-br from-green-50 to-teal-100 dark:from-green-900/30 dark:to-teal-900/30 p-3 rounded-xl border border-green-200/50 dark:border-green-800/30 hover:shadow-md transition-all duration-200">
                  <div className="flex items-center gap-2 mb-1">
                    <div className="p-1.5 bg-green-500 rounded-lg">
                      <Phone className="w-3.5 h-3.5 text-white" />
                    </div>
                    <h4 className="font-semibold text-gray-900 dark:text-white text-xs">Phone (Full)</h4>
                  </div>
                  <p className="text-gray-700 dark:text-gray-300 font-medium text-sm truncate">{selectedStudent.phoneNumberWithCountryCode || 'N/A'}</p>
                </div>
                <div className="bg-gradient-to-br from-purple-50 to-pink-100 dark:from-purple-900/30 dark:to-pink-900/30 p-3 rounded-xl border border-purple-200/50 dark:border-purple-800/30 hover:shadow-md transition-all duration-200">
                  <div className="flex items-center gap-2 mb-1">
                    <div className="p-1.5 bg-purple-500 rounded-lg">
                      <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                    </div>
                    <h4 className="font-semibold text-gray-900 dark:text-white text-xs">Referral URL</h4>
                  </div>
                  {selectedStudent.signupTypeUrl ? (
                    <a 
                      href={selectedStudent.signupTypeUrl} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-purple-700 dark:text-purple-400 hover:text-purple-900 dark:hover:text-purple-300 hover:underline text-sm font-medium block break-all"
                      title={selectedStudent.signupTypeUrl}
                    >
                      {selectedStudent.signupTypeUrl}
                    </a>
                  ) : (
                    <p className="text-gray-400 dark:text-gray-500 text-sm">N/A</p>
                  )}
                </div>
                <div className="bg-gradient-to-br from-teal-50 to-cyan-100 dark:from-teal-900/30 dark:to-cyan-900/30 p-3 rounded-xl border border-teal-200/50 dark:border-teal-800/30 hover:shadow-md transition-all duration-200">
                  <div className="flex items-center gap-2 mb-1">
                    <div className="p-1.5 bg-teal-500 rounded-lg">
                      <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9-9a9 9 0 009-9m-9 9h18" />
                      </svg>
                    </div>
                    <h4 className="font-semibold text-gray-900 dark:text-white text-xs">Landing Page URL</h4>
                  </div>
                  {selectedStudent.landingPageUrl ? (
                    <a 
                      href={selectedStudent.landingPageUrl} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-teal-700 dark:text-teal-400 hover:text-teal-900 dark:hover:text-teal-300 hover:underline text-sm font-medium block break-all"
                      title={selectedStudent.landingPageUrl}
                    >
                      {selectedStudent.landingPageUrl}
                    </a>
                  ) : (
                    <p className="text-gray-400 dark:text-gray-500 text-sm">N/A</p>
                  )}
                </div>
              </div>

              {/* Bio Section */}
              {selectedStudent.bio && (
                <div className="mb-8">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 bg-gray-600 rounded-xl">
                      <User className="w-5 h-5 text-white" />
                    </div>
                    <h4 className="font-bold text-gray-900 dark:text-white text-lg">Bio</h4>
                  </div>
                  <div className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-600 p-6 rounded-2xl border border-gray-200/50 dark:border-gray-600/50">
                    <p className="text-gray-700 dark:text-gray-300 leading-relaxed text-base">{selectedStudent.bio}</p>
                  </div>
                </div>
              )}

              {/* Temporary Password Section - Only show if exists */}
              {selectedStudent.plainPassword && (
                <div className="mb-8">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 bg-yellow-500 rounded-xl">
                      <AlertCircle className="w-5 h-5 text-white" />
                    </div>
                    <h4 className="font-bold text-gray-900 dark:text-white text-lg">Password</h4>
                  </div>
                  <div className="bg-gradient-to-br from-yellow-50 to-amber-100 dark:from-yellow-900/30 dark:to-amber-900/30 p-6 rounded-2xl border border-yellow-200/50 dark:border-yellow-800/30">
                    <div className="flex items-center gap-3">
                      <code className="text-lg font-mono font-bold text-gray-900 dark:text-white bg-white dark:bg-gray-700 px-4 py-2 rounded-lg">{selectedStudent.plainPassword}</code>
                      <span className="text-sm text-yellow-700 dark:text-yellow-400 font-medium">Password</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Enrollments Section */}
              {selectedStudent.enrollments && selectedStudent.enrollments.length > 0 && (
                <div>
                  <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 bg-blue-500 rounded-xl">
                      <BookOpen className="w-5 h-5 text-white" />
                    </div>
                    <h4 className="font-bold text-gray-900 dark:text-white text-lg">Enrollments ({selectedStudent.enrollments.length})</h4>
                  </div>
                  <div className="space-y-4 max-h-80 overflow-y-auto pr-2">
                    {selectedStudent.enrollments.map((enrollment, index) => (
                      <div key={enrollment.id} className="bg-gradient-to-r from-blue-50 via-purple-50 to-pink-50 dark:from-blue-900/20 dark:via-purple-900/20 dark:to-pink-900/20 p-5 rounded-2xl border border-blue-200/50 dark:border-blue-800/30 hover:shadow-lg hover:scale-[1.02] transition-all duration-300">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-3">
                              <h5 className="font-bold text-gray-900 dark:text-white text-lg">
                                {enrollment.resourceTitle}
                              </h5>
                              <span className={`px-3 py-1 text-xs font-bold rounded-full shadow-md ${
                                enrollment.resourceType === 'Career Path'
                                  ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white'
                                  : 'bg-gradient-to-r from-green-500 to-emerald-600 text-white'
                              }`}>
                                {enrollment.resourceType}
                              </span>
                              {enrollment.levelName && (
                                <span className="px-3 py-1 text-xs font-bold rounded-full shadow-md bg-gradient-to-r from-yellow-500 to-orange-600 text-white">
                                  {enrollment.levelName}
                                </span>
                              )}
                            </div>
                            {enrollment.careerPathName && (
                              <p className="text-gray-600 dark:text-gray-400 mb-2 font-medium">
                                Career Path: {enrollment.careerPathName}
                              </p>
                            )}
                            <div className="flex flex-wrap items-center gap-3">
                              {enrollment.courseTypeId && (
                                <div className="flex items-center gap-2 px-3 py-2 bg-white dark:bg-gray-700 rounded-xl shadow-sm">
                                  <BookOpen className="w-4 h-4 text-orange-500" />
                                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                    {enrollment.courseTypeId === 1 ? 'Professional Certificate' : enrollment.courseTypeId === 2 ? 'Course Certificate' : enrollment.courseTypeId === 3 ? 'Short Course' : 'Course'}
                                  </span>
                                </div>
                              )}
                              {enrollment.levelId && (
                                <div className="flex items-center gap-2 px-3 py-2 bg-white dark:bg-gray-700 rounded-xl shadow-sm">
                                  <Users className="w-4 h-4 text-purple-500" />
                                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Level {enrollment.levelId}</span>
                                </div>
                              )}
                              <div className="flex items-center gap-2 px-3 py-2 bg-white dark:bg-gray-700 rounded-xl shadow-sm">
                                <Calendar className="w-4 h-4 text-green-500" />
                                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Joined: {formatDateTime(enrollment.createdAt)}</span>
                              </div>
                              <div className="flex items-center gap-2 px-3 py-2 bg-white dark:bg-gray-700 rounded-xl shadow-sm">
                                <Clock className="w-4 h-4 text-blue-500" />
                                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Last Active: {enrollment.lastActivityDate ? formatDateTime(enrollment.lastActivityDate) : 'N/A'}</span>
                              </div>
                              {enrollment.completionPercentage !== undefined && enrollment.completionPercentage !== null && (
                                <div className="flex items-center gap-2 px-3 py-2 bg-white dark:bg-gray-700 rounded-xl shadow-sm">
                                  <div className="w-4 h-4 rounded-full border-2 border-indigo-500 flex items-center justify-center">
                                    <span className="text-[8px] font-bold text-indigo-500">%</span>
                                  </div>
                                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                    {enrollment.completionPercentage}% Complete
                                  </span>
                                </div>
                              )}
                              {enrollment.completedCount !== undefined && enrollment.completedCount !== null && (
                                <div className="flex items-center gap-2 px-3 py-2 bg-white dark:bg-gray-700 rounded-xl shadow-sm">
                                  <div className="w-4 h-4 rounded-full bg-green-500 flex items-center justify-center">
                                    <CheckCircle className="w-3 h-3 text-white" />
                                  </div>
                                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                    {enrollment.completedCount} Lectures Completed
                                  </span>
                                </div>
                              )}
                              {enrollment.incompleteCount !== undefined && enrollment.incompleteCount !== null && (
                                <div className="flex items-center gap-2 px-3 py-2 bg-white dark:bg-gray-700 rounded-xl shadow-sm">
                                  <div className="w-4 h-4 rounded-full bg-orange-500 flex items-center justify-center">
                                    <XCircle className="w-3 h-3 text-white" />
                                  </div>
                                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                    {enrollment.incompleteCount} Lectures Incomplete
                                  </span>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Orders Modal */}
      {showOrdersModal && studentOrders && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 rounded-3xl max-w-6xl w-full max-h-[85vh] overflow-hidden shadow-2xl border border-gray-200/50 dark:border-gray-700/50 animate-slideUp">
            {/* Modal Header */}
            <div className="sticky top-0 bg-gradient-to-r from-green-600 to-emerald-600 dark:from-green-700 dark:to-emerald-700 p-6 rounded-t-3xl border-b border-gray-200/50 dark:border-gray-700/50">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-white/20 backdrop-blur-sm rounded-2xl">
                    <ShoppingBag className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-white">Orders</h2>
                    <p className="text-green-100 text-sm">
                      {studentOrders.customerFullName} (ID: {studentOrders.customerId}) - {studentOrders.orders?.length || 0} orders
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setShowOrdersModal(false);
                    setStudentOrders(null);
                  }}
                  className="p-3 bg-white/20 backdrop-blur-sm rounded-2xl hover:bg-white/30 transition-all duration-200 group"
                >
                  <X className="w-5 h-5 text-white group-hover:rotate-90 transition-transform duration-200" />
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-6 lg:p-8 overflow-y-auto max-h-[calc(85vh-120px)]">
              {studentOrders.orders && studentOrders.orders.length > 0 ? (
                <div className="space-y-6">
                  {studentOrders.orders.map((order) => (
                    <div key={order.id} className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-800 rounded-2xl p-6 border border-gray-200/50 dark:border-gray-600/50 hover:shadow-lg transition-all duration-300">
                      {/* Order Header */}
                      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
                        <div className="flex items-center gap-4">
                          <div className="p-3 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl">
                            <ShoppingBag className="w-6 h-6 text-white" />
                          </div>
                          <div>
                            <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                              Order #{order.orderNo}
                            </h3>
                            <div className="flex items-center gap-3 mt-1">
                              <span className={`px-3 py-1 text-xs font-semibold rounded-full shadow-md ${
                                order.statusName === 'Paid' 
                                  ? 'bg-gradient-to-r from-green-100 to-green-200 text-green-800 dark:from-green-900/30 dark:to-green-800/30 dark:text-green-400'
                                  : order.statusName === 'Pending'
                                  ? 'bg-gradient-to-r from-yellow-100 to-yellow-200 text-yellow-800 dark:from-yellow-900/30 dark:to-yellow-800/30 dark:text-yellow-400'
                                  : 'bg-gradient-to-r from-red-100 to-red-200 text-red-800 dark:from-red-900/30 dark:to-red-800/30 dark:text-red-400'
                              }`}>
                                {order.statusName}
                              </span>
                              <span className="text-sm text-gray-500 dark:text-gray-400">
                                {formatDate(order.createdAt)}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-bold text-gray-900 dark:text-white">
                            ${order.totalAmount.toFixed(2)}
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            {order.currencyCode}
                          </div>
                        </div>
                      </div>

                      {/* Order Items */}
                      <div className="mb-6">
                        <h4 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                          <BookOpen className="w-4 h-4" />
                          Order Items ({order.orderItems?.length || 0})
                        </h4>
                        <div className="space-y-3">
                          {order.orderItems?.map((item) => (
                            <div key={item.id} className="bg-white dark:bg-gray-700 rounded-xl p-4 border border-gray-200/50 dark:border-gray-600/50 hover:shadow-md transition-all duration-200">
                              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                                <div>
                                  <h5 className="font-semibold text-gray-900 dark:text-white mb-2">
                                    {item.resourceTitle}
                                  </h5>
                                  <div className="flex items-center gap-2 mt-2 flex-wrap">
                                    <span className="px-3 py-1 text-xs font-bold rounded-full shadow-md bg-gradient-to-r from-green-500 to-emerald-600 text-white">
                                      Type: {item.resourceType}
                                    </span>
                                    <span className="px-3 py-1 text-xs font-bold rounded-full shadow-md bg-gradient-to-r from-purple-500 to-pink-600 text-white">
                                      Package: {item.packageName}
                                    </span>
                                    {item.courseTypeId && (
                                      <span className={`px-3 py-1 text-xs font-bold rounded-full shadow-md ${
                                        item.courseTypeId === 1
                                          ? 'bg-gradient-to-r from-blue-500 to-cyan-600 text-white'
                                          : item.courseTypeId === 2
                                          ? 'bg-gradient-to-r from-orange-500 to-amber-600 text-white'
                                          : 'bg-gradient-to-r from-green-500 to-emerald-600 text-white'
                                      }`}>
                                        {item.courseTypeId === 1 ? 'Professional Certificate' : item.courseTypeId === 2 ? 'Course Certificate' : item.courseTypeId === 3 ? 'Short Course' : 'Course'}
                                      </span>
                                    )}
                                  </div>
                                  {item.levelName && (
                                    <span className={`px-3 py-1 text-xs font-bold rounded-full shadow-md ${
                                      item.levelId === 1
                                        ? 'bg-gradient-to-r from-yellow-500 to-orange-600 text-white'
                                        : 'bg-gradient-to-r from-indigo-500 to-blue-600 text-white'
                                    }`}>
                                      {item.levelName}
                                    </span>
                                  )}
                                </div>
                                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                                  <div>
                                    <div className="text-lg font-bold text-gray-900 dark:text-white">
                                      ${item.finalPrice.toFixed(2)}
                                    </div>
                                    {item.discount > 0 && (
                                      <div className="flex items-center gap-2">
                                        <div className="text-sm text-gray-500 dark:text-gray-400 line-through">
                                          ${item.unitPrice.toFixed(2)}
                                        </div>
                                        <div className="text-sm text-green-600 dark:text-green-400 font-medium">
                                          Save ${item.discount.toFixed(2)}
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Payment Information */}
                      {order.paymentId && (
                        <div className="bg-gradient-to-r from-blue-50 to-indigo-100 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl p-4 border border-blue-200/50 dark:border-blue-800/30">
                          <h4 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                            <CreditCard className="w-4 h-4" />
                            Payment Information
                          </h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            <div>
                              <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Payment Status</div>
                              <div className={`px-3 py-1 text-xs font-semibold rounded-full shadow-md inline-block ${
                                order.paymentStatusName === 'Captured'
                                  ? 'bg-gradient-to-r from-green-100 to-green-200 text-green-800 dark:from-green-900/30 dark:to-green-800/30 dark:text-green-400'
                                  : 'bg-gradient-to-r from-yellow-100 to-yellow-200 text-yellow-800 dark:from-yellow-900/30 dark:to-yellow-800/30 dark:text-yellow-400'
                              }`}>
                                {order.paymentStatusName}
                              </div>
                            </div>
                            <div>
                              <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Transaction ID</div>
                              <div className="text-sm font-mono text-gray-900 dark:text-white">
                                {order.transactionId}
                              </div>
                            </div>
                            <div>
                              <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Payment Method</div>
                              <div className="text-sm text-gray-900 dark:text-white">
                                {order.cardHolderName && (
                                  <span>{order.cardHolderName} ({order.paymentMethodType})</span>
                                )}
                              </div>
                            </div>
                            <div>
                              <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Paid At</div>
                              <div className="text-sm text-gray-900 dark:text-white">
                                {order.paidAt ? formatDate(order.paidAt) : 'N/A'}
                              </div>
                            </div>
                            <div>
                              <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Payment Response</div>
                              <div className="text-sm text-gray-900 dark:text-white">
                                {order.paymentResponse || 'N/A'}
                              </div>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Order Summary */}
                      <div className="bg-gradient-to-r from-purple-50 to-pink-100 dark:from-purple-900/20 dark:to-pink-900/20 rounded-xl p-4 border border-purple-200/50 dark:border-purple-800/30">
                        <h4 className="font-semibold text-gray-900 dark:text-white mb-3">Order Summary</h4>
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600 dark:text-gray-400">Subtotal:</span>
                            <span className="text-gray-900 dark:text-white">${order.subtotalAmount.toFixed(2)}</span>
                          </div>
                          {order.discountAmount > 0 && (
                            <div className="flex justify-between text-sm">
                              <span className="text-gray-600 dark:text-gray-400">Discount:</span>
                              <span className="text-green-600 dark:text-green-400">-${order.discountAmount.toFixed(2)}</span>
                            </div>
                          )}
                          {order.taxAmount > 0 && (
                            <div className="flex justify-between text-sm">
                              <span className="text-gray-600 dark:text-gray-400">Tax:</span>
                              <span className="text-gray-900 dark:text-white">${order.taxAmount.toFixed(2)}</span>
                            </div>
                          )}
                          <div className="flex justify-between text-lg font-bold pt-2 border-t border-gray-300 dark:border-gray-600">
                            <span className="text-gray-900 dark:text-white">Total:</span>
                            <span className="text-gray-900 dark:text-white">${order.totalAmount.toFixed(2)}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <ShoppingBag className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">No Orders Found</h3>
                  <p className="text-gray-500 dark:text-gray-400">
                    This student hasn't placed any orders yet.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Enrollments Modal */}
      {showEnrollmentsModal && studentEnrollments && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 rounded-3xl max-w-4xl w-full max-h-[85vh] overflow-hidden shadow-2xl border border-gray-200/50 dark:border-gray-700/50 animate-slideUp">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-blue-500 to-indigo-600 px-6 py-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-white/20 backdrop-blur-sm rounded-2xl">
                    <BookOpen className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-white">
                      Enrolled Courses
                    </h2>
                    <p className="text-blue-100 mt-1">
                      {studentEnrollments.firstName && studentEnrollments.lastName 
                        ? `${studentEnrollments.firstName} ${studentEnrollments.lastName}`
                        : studentEnrollments.fullName || 'Student'
                      }
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setShowEnrollmentsModal(false);
                    setStudentEnrollments(null);
                  }}
                  className="p-3 bg-white/20 backdrop-blur-sm rounded-2xl hover:bg-white/30 transition-all duration-200 group"
                >
                  <X className="w-5 h-5 text-white group-hover:rotate-90 transition-transform duration-200" />
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-6 lg:p-8 overflow-y-auto max-h-[calc(85vh-120px)] bg-gray-50 dark:bg-gray-900">
              {loadingEnrollments ? (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
                </div>
              ) : studentEnrollments.enrollments && studentEnrollments.enrollments.length > 0 ? (
                <div className="space-y-4">
                  {/* Header with count */}
                  <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 bg-blue-500 rounded-xl">
                      <BookOpen className="w-5 h-5 text-white" />
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                      Enrollments ({studentEnrollments.enrollments.length})
                    </h3>
                  </div>
                  
                  {/* Enrollment Cards */}
                  {studentEnrollments.enrollments.map((enrollment, index) => (
                    <div key={enrollment.id || index} className="bg-white dark:bg-gray-800 rounded-2xl p-5 border border-blue-100 dark:border-gray-700 shadow-sm hover:shadow-md transition-all duration-300">
                      {/* Course Title with Type Badges */}
                      <div className="flex items-center gap-2 mb-3 flex-wrap">
                        <h4 className="text-base font-bold text-gray-900 dark:text-white">
                          {enrollment.resourceTitle || enrollment.courseName || enrollment.title || 'Course'}
                        </h4>
                        {enrollment.resourceType && (
                          <span className="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-emerald-500 text-white">
                            {enrollment.resourceType}
                          </span>
                        )}
                        {enrollment.courseTypeId && (
                          <span className={`px-2.5 py-0.5 text-xs font-semibold rounded-full ${
                            enrollment.courseTypeId === 1
                              ? 'bg-blue-500 text-white'
                              : enrollment.courseTypeId === 2
                              ? 'bg-orange-500 text-white'
                              : 'bg-green-500 text-white'
                          }`}>
                            {enrollment.courseTypeId === 1 ? 'Professional Certificate' : enrollment.courseTypeId === 2 ? 'Course Certificate' : enrollment.courseTypeId === 3 ? 'Short Course' : 'Course'}
                          </span>
                        )}
                      </div>
                      
                      {/* Level and Date Row */}
                      <div className="flex items-center gap-3 flex-wrap">
                        {enrollment.levelName && (
                          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-orange-50 dark:bg-orange-900/20 border border-orange-100 dark:border-orange-800">
                            <BookOpen className="w-3.5 h-3.5 text-orange-500" />
                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                              {enrollment.levelName}
                            </span>
                          </div>
                        )}
                        <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-green-50 dark:bg-green-900/20 border border-green-100 dark:border-green-800">
                          <svg className="w-3.5 h-3.5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            Joined: {formatDateTime(enrollment.createdAt)}
                          </span>
                        </div>
                        <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800">
                          <Clock className="w-3.5 h-3.5 text-blue-500" />
                          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            Last Active: {enrollment.lastActivityDate ? formatDateTime(enrollment.lastActivityDate) : 'N/A'}
                          </span>
                        </div>
                        {enrollment.completionPercentage !== undefined && enrollment.completionPercentage !== null && (
                          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-100 dark:border-indigo-800">
                            <div className="w-3.5 h-3.5 rounded-full border-2 border-indigo-500 flex items-center justify-center">
                              <span className="text-[6px] font-bold text-indigo-500">%</span>
                            </div>
                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                              {enrollment.completionPercentage}% Complete
                            </span>
                          </div>
                        )}
                        {enrollment.completedCount !== undefined && enrollment.completedCount !== null && (
                          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-green-50 dark:bg-green-900/20 border border-green-100 dark:border-green-800">
                            <CheckCircle className="w-3.5 h-3.5 text-green-500" />
                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                              {enrollment.completedCount} Lectures Completed
                            </span>
                          </div>
                        )}
                        {enrollment.incompleteCount !== undefined && enrollment.incompleteCount !== null && (
                          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-orange-50 dark:bg-orange-900/20 border border-orange-100 dark:border-orange-800">
                            <XCircle className="w-3.5 h-3.5 text-orange-500" />
                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                              {enrollment.incompleteCount} Lectures Incomplete
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">No Enrollments Found</h3>
                  <p className="text-gray-500 dark:text-gray-400">
                    This student hasn't enrolled in any courses yet.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentManagement;
