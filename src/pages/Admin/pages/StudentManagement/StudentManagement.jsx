import React, { useState, useEffect, useCallback } from 'react';
import {
  Users,
  Search,
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
  GraduationCap,
  CreditCard,
  AlertCircle
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
    searchStudents,
    filterStudents,
    clearError,
    setSelectedStudent,
    getGendersDropdown,
    getSignupTypesDropdown,
    getQualificationsDropdown,
  } = useStudentManagement();

  // Component state
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    fullName: '',
    email: '',
    phoneNumber: '',
    isEmailVerified: '',
    signupTypeId: '',
    genderId: '',
    qualificationId: ''
  });
  const [showFilters, setShowFilters] = useState(false);
  const [showStudentDetails, setShowStudentDetails] = useState(false);
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  // Dropdown data state
  const [genders, setGenders] = useState([]);
  const [signupTypes, setSignupTypes] = useState([]);
  const [qualifications, setQualifications] = useState([]);
  const [loadingDropdowns, setLoadingDropdowns] = useState(false);

  // Load dropdown data
  const loadDropdownData = useCallback(async () => {
    setLoadingDropdowns(true);
    try {
      const [gendersData, signupTypesData, qualificationsData] = await Promise.all([
        getGendersDropdown(),
        getSignupTypesDropdown(),
        getQualificationsDropdown()
      ]);
      
      setGenders(gendersData || []);
      setSignupTypes(signupTypesData || []);
      setQualifications(qualificationsData || []);
    } catch (err) {
      console.error('Failed to load dropdown data:', err);
    } finally {
      setLoadingDropdowns(false);
    }
  }, [getGendersDropdown, getSignupTypesDropdown, getQualificationsDropdown]);

  // Load dropdown data on component mount
  useEffect(() => {
    loadDropdownData();
  }, [loadDropdownData]);

  // Debounce search term
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Load students function
  const loadStudents = useCallback(async (page = 1, pageSize = 10) => {
    try {
      await getAllStudents(page, pageSize, filters);
    } catch (err) {
      console.error('Failed to load students:', err);
    }
  }, [getAllStudents, filters]);

  // Handle search
  const handleSearch = useCallback(async () => {
    try {
      await searchStudents(debouncedSearchTerm, 1, pagination.pageSize);
    } catch (err) {
      console.error('Failed to search students:', err);
    }
  }, [searchStudents, debouncedSearchTerm, pagination.pageSize]);

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

  // Load initial data
  useEffect(() => {
    loadStudents();
  }, [debouncedSearchTerm, loadStudents]);

  // Handle search
  useEffect(() => {
    if (debouncedSearchTerm) {
      handleSearch();
    } else {
      loadStudents();
    }
  }, [debouncedSearchTerm, handleSearch, loadStudents]);

  const handleFilter = useCallback(async () => {
    try {
      await filterStudents(filters, 1, pagination.pageSize);
    } catch (err) {
      console.error('Failed to filter students:', err);
    }
  }, [filterStudents, filters, pagination.pageSize]);

  const handlePageChange = useCallback(async (newPage) => {
    try {
      if (debouncedSearchTerm) {
        await searchStudents(debouncedSearchTerm, newPage, pagination.pageSize);
      } else {
        await getAllStudents(newPage, pagination.pageSize, filters);
      }
    } catch (err) {
      console.error('Failed to change page:', err);
    }
  }, [searchStudents, getAllStudents, debouncedSearchTerm, pagination.pageSize, filters]);

  const handleViewStudent = useCallback(async (studentId) => {
    try {
      await getStudentById(studentId);
      setShowStudentDetails(true);
    } catch (err) {
      console.error('Failed to fetch student details:', err);
    }
  }, [getStudentById]);

  const handleFilterChange = (field, value) => {
    setFilters(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const clearFilters = useCallback(() => {
    setFilters({
      fullName: '',
      email: '',
      phoneNumber: '',
      isEmailVerified: '',
      signupTypeId: '',
      genderId: '',
      qualificationId: ''
    });
    setSearchTerm('');
    loadStudents(1);
  }, [loadStudents]);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString();
  };

  const getLevelName = (levelId) => {
    switch (levelId) {
      case 1: return 'Basic';
      case 2: return 'Intermediate';
      case 3: return 'Advanced';
      default: return 'N/A';
    }
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
        <div className="flex flex-col xl:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search students by name, email, or phone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition-all duration-200 shadow-sm hover:shadow-md"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

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
                  { id: '', title: 'All' },
                  { id: 'true', title: 'Verified' },
                  { id: 'false', title: 'Not Verified' }
                ]}
                placeholder="All"
                emptyOptionText="All"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Gender</label>
              <GenericDropdown
                value={filters.genderId}
                onChange={(value) => handleFilterChange('genderId', value)}
                options={genders}
                placeholder="All Genders"
                disabled={loadingDropdowns}
                loading={loadingDropdowns}
                emptyOptionText="All Genders"
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
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Qualification</label>
              <GenericDropdown
                value={filters.qualificationId}
                onChange={(value) => handleFilterChange('qualificationId', value)}
                options={qualifications}
                placeholder="All Qualifications"
                disabled={loadingDropdowns}
                loading={loadingDropdowns}
                emptyOptionText="All Qualifications"
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
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-800 border-b border-gray-200 dark:border-gray-600">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                  Student
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                  Contact
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                  Email Status
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                  Enrollments
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                  Payment Status
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                  Joined Date
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {loading ? (
                <tr>
                  <td colSpan="7" className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                      <span className="text-gray-500 dark:text-gray-400 font-medium">Loading students...</span>
                    </div>
                  </td>
                </tr>
              ) : students.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <Users className="w-12 h-12 text-gray-400" />
                      <span className="text-gray-500 dark:text-gray-400 font-medium text-lg">No students found</span>
                      <span className="text-gray-400 dark:text-gray-500 text-sm">Try adjusting your search or filters</span>
                    </div>
                  </td>
                </tr>
              ) : (
                students.map((student) => (
                  <tr key={student.id} className="hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 dark:hover:from-blue-900/10 dark:hover:to-purple-900/10 transition-all duration-200">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="h-12 w-12 flex-shrink-0">
                          {student.profileImageUrl ? (
                            <img
                              className="h-12 w-12 rounded-full object-cover ring-2 ring-gray-200 dark:ring-gray-600"
                              src={student.profileImageUrl}
                              alt={student.fullName}
                            />
                          ) : (
                            <div className="h-12 w-12 rounded-full bg-gradient-to-r from-blue-400 to-purple-500 flex items-center justify-center">
                              <User className="h-6 w-6 text-white" />
                            </div>
                          )}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-semibold text-gray-900 dark:text-white">
                            {student.fullName}
                          </div>
                         
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 dark:text-white">
                        <div className="flex items-center gap-2 mb-1">
                          <Mail className="w-4 h-4 text-gray-400" />
                          <span className="truncate max-w-xs">{student.email}</span>
                        </div>
                        {student.phoneNumber && (
                          <div className="flex items-center gap-2">
                            <Phone className="w-4 h-4 text-gray-400" />
                            <span>{student.phoneNumber}</span>
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        {student.isEmailVerified ? (
                          <>
                            <div className="p-1 bg-green-100 dark:bg-green-900/30 rounded-full">
                              <CheckCircle className="w-4 h-4 text-green-600 dark:text-green-400" />
                            </div>
                            <span className="text-sm font-medium text-green-600 dark:text-green-400">Verified</span>
                          </>
                        ) : (
                          <>
                            <div className="p-1 bg-red-100 dark:bg-red-900/30 rounded-full">
                              <XCircle className="w-4 h-4 text-red-600 dark:text-red-400" />
                            </div>
                            <span className="text-sm font-medium text-red-600 dark:text-red-400">Not Verified</span>
                          </>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 dark:text-white">
                        <div className="flex items-center gap-2">
                          <div className="p-1 bg-blue-100 dark:bg-blue-900/30 rounded-full">
                            <BookOpen className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                          </div>
                          <span className="font-medium">{student.enrollmentCount || 0}</span>
                          <span className="text-gray-500 dark:text-gray-400">enrollments</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center gap-1 px-3 py-1 text-xs font-semibold rounded-full ${
                        student.paymentStatus === 'Captured' 
                          ? 'bg-gradient-to-r from-green-100 to-green-200 text-green-800 dark:from-green-900/30 dark:to-green-800/30 dark:text-green-400'
                          : student.paymentStatus === 'Pending'
                          ? 'bg-gradient-to-r from-yellow-100 to-yellow-200 text-yellow-800 dark:from-yellow-900/30 dark:to-yellow-800/30 dark:text-yellow-400'
                          : 'bg-gradient-to-r from-gray-100 to-gray-200 text-gray-800 dark:from-gray-700 dark:to-gray-600 dark:text-gray-300'
                      }`}>
                        <CreditCard className="w-3 h-3" />
                        {student.paymentStatus || 'N/A'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        <span>{formatDate(student.createdAt)}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => handleViewStudent(student.id)}
                        className="inline-flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all duration-200 shadow-md hover:shadow-lg"
                      >
                        <Eye className="w-4 h-4" />
                        View Details
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
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
                    {selectedStudent.profileImageUrl ? (
                      <img
                        className="h-24 w-24 rounded-3xl object-cover ring-4 ring-white dark:ring-gray-700 shadow-2xl"
                        src={selectedStudent.profileImageUrl}
                        alt={selectedStudent.fullName}
                      />
                    ) : (
                      <div className="h-24 w-24 rounded-3xl bg-gradient-to-br from-blue-400 via-purple-500 to-pink-500 flex items-center justify-center shadow-2xl">
                        <User className="h-12 w-12 text-white" />
                      </div>
                    )}
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
                      {selectedStudent.genderName && (
                        <span className="px-3 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 rounded-full text-sm font-medium">
                          {selectedStudent.genderName}
                        </span>
                      )}
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
                            {selectedStudent.phoneCountryCode && `${selectedStudent.phoneCountryCode} `}{selectedStudent.phoneNumber}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Additional Information */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                <div className="bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-blue-900/30 dark:to-indigo-900/30 p-6 rounded-2xl border border-blue-200/50 dark:border-blue-800/30 hover:shadow-lg transition-all duration-300">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-2 bg-blue-500 rounded-xl">
                      <Users className="w-5 h-5 text-white" />
                    </div>
                    <h4 className="font-bold text-gray-900 dark:text-white">Gender</h4>
                  </div>
                  <p className="text-gray-700 dark:text-gray-300 font-medium text-lg">{selectedStudent.genderName || 'N/A'}</p>
                </div>
                <div className="bg-gradient-to-br from-purple-50 to-pink-100 dark:from-purple-900/30 dark:to-pink-900/30 p-6 rounded-2xl border border-purple-200/50 dark:border-purple-800/30 hover:shadow-lg transition-all duration-300">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-2 bg-purple-500 rounded-xl">
                      <GraduationCap className="w-5 h-5 text-white" />
                    </div>
                    <h4 className="font-bold text-gray-900 dark:text-white">Qualification</h4>
                  </div>
                  <p className="text-gray-700 dark:text-gray-300 font-medium text-lg">{selectedStudent.qualificationName || 'N/A'}</p>
                </div>
                <div className="bg-gradient-to-br from-green-50 to-emerald-100 dark:from-green-900/30 dark:to-emerald-900/30 p-6 rounded-2xl border border-green-200/50 dark:border-green-800/30 hover:shadow-lg transition-all duration-300">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-2 bg-green-500 rounded-xl">
                      <Calendar className="w-5 h-5 text-white" />
                    </div>
                    <h4 className="font-bold text-gray-900 dark:text-white">Member Since</h4>
                  </div>
                  <p className="text-gray-700 dark:text-gray-300 font-medium text-lg">{formatDate(selectedStudent.createdAt)}</p>
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
                            </div>
                            <div className="flex flex-wrap items-center gap-3">
                              <div className="flex items-center gap-2 px-3 py-2 bg-white dark:bg-gray-700 rounded-xl shadow-sm">
                                <BookOpen className="w-4 h-4 text-blue-500" />
                                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{enrollment.resourceType}</span>
                              </div>
                              {enrollment.levelId && (
                                <div className="flex items-center gap-2 px-3 py-2 bg-white dark:bg-gray-700 rounded-xl shadow-sm">
                                  <Users className="w-4 h-4 text-purple-500" />
                                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{getLevelName(enrollment.levelId)}</span>
                                </div>
                              )}
                              <div className="flex items-center gap-2 px-3 py-2 bg-white dark:bg-gray-700 rounded-xl shadow-sm">
                                <Calendar className="w-4 h-4 text-green-500" />
                                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{formatDate(enrollment.createdAt)}</span>
                              </div>
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
    </div>
  );
};

export default StudentManagement;
