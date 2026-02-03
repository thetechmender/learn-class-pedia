import React, { useState, useCallback } from 'react';
import { useToast } from '../../../../hooks/useToast';
import { useCourseSkillMapping } from '../../../../hooks/useCourseSkillMapping';
import {
  Search,
  RefreshCw,
  Grid,
  List,
  Users,
  X,
  Check,
  BookOpen,
  CheckCircle,
  AlertCircle,
  Brain,
  Filter
} from 'lucide-react';
import GenericDropdown from '../../../../components/GenericDropdown';
import CategoryDropdown from '../../../../components/CategoryDropdown';

const CourseSkillMapping = () => {
  const { toast, showToast } = useToast();
  
  // Use the custom hook for API operations
  const {
    skills,
    allSkills,
    courses,
    courseTypes,
    courseLevels,
    categories,
    skillCourses,
    loading,
    loadingCourses,
    error,
    skillsPagination,
    paginateSkills,
    changeSkillsPageSize,
    pagination,
    paginateCourses,
    changePageSize,
    fetchSkillById,
    fetchCoursesWithFilters,
    assignCoursesToSkill
  } = useCourseSkillMapping();
  
  // Component-specific state
  const [selectedSkill, setSelectedSkill] = useState(null);
  const [showCourseAssignmentModal, setShowCourseAssignmentModal] = useState(false);
  const [selectedCourses, setSelectedCourses] = useState([]);
  const [activeModalTab, setActiveModalTab] = useState('assign'); // 'assign' or 'selected'
  
  // Course assignment filters
  const [courseFilters, setCourseFilters] = useState({
    courseTypeId: '',
    categoryId: '',
    courseLevelId: ''
  });

  // Search and view states
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState('grid');

  // API functions are now handled by the custom hook

  // Initialize data is now handled by the custom hook

  // Filter skills
  const filteredSkills = Array.isArray(allSkills) ? allSkills.filter(skill => {
    const matchesSearch = skill.title?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  }) : [];

  // Handle course filter changes
  const handleCourseFilterChange = useCallback(async (filterType, value) => {
    const newFilters = { ...courseFilters, [filterType]: value };
    setCourseFilters(newFilters);
    
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
    
    await fetchCoursesWithFilters(apiFilters);
  }, [courseFilters, fetchCoursesWithFilters]);

  // Open course assignment modal
  const openCourseAssignmentModal = async (skill) => {
    setSelectedSkill(skill);
    setSelectedCourses([]);
    setShowCourseAssignmentModal(true);
    setCourseFilters({
      courseTypeId: '',
      categoryId: '',
      courseLevelId: ''
    });
    
    // Fetch skill details to get current course assignments
    try {
      await fetchSkillById(skill.skillId);
    } catch (err) {
      console.error('Failed to fetch skill details:', err);
    }
  };

  // Close modal
  const closeModals = () => {
    setShowCourseAssignmentModal(false);
    setSelectedSkill(null);
    setSelectedCourses([]);
  };

  // Toggle course selection
  const toggleCourseSelection = (courseId) => {
    const isAssigned = skillCourses[selectedSkill?.skillId]?.includes(courseId) || false;
    
    setSelectedCourses(prev => {
      if (prev.includes(courseId)) {
        return prev.filter(id => id !== courseId);
      } else if (isAssigned) {
        return [...prev, courseId];
      } else {
        return [...prev, courseId];
      }
    });
  };

  // Handle course assignment
  const handleCourseAssignment = async () => {
    if (!selectedSkill || selectedCourses.length === 0) return;
    
    try {
      // Get current assigned courses
      const currentAssigned = skillCourses[selectedSkill.skillId] || [];
      
      // Calculate new assignment
      let newAssignment = [...currentAssigned];
      
      selectedCourses.forEach(courseId => {
        if (currentAssigned.includes(courseId)) {
          // Remove if currently assigned
          newAssignment = newAssignment.filter(id => id !== courseId);
        } else {
          // Add if not currently assigned
          newAssignment.push(courseId);
        }
      });
      
      await assignCoursesToSkill(selectedSkill.skillId, newAssignment);
      showToast('Courses assigned to skill successfully!', 'success');
      setSelectedCourses([]);
      closeModals();
    } catch (err) {
      showToast('Failed to assign courses to skill', 'error');
      console.error('Course assignment failed:', err);
    }
  };

  // Get skill courses
  const getSkillCourses = (skillId) => {
    return skillCourses[skillId] || [];
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <RefreshCw className="w-8 h-8 animate-spin text-blue-500" />
        <span className="ml-2 text-gray-600 dark:text-gray-300">Loading skills...</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
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
      
      <div className="p-6 max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-3 bg-gradient-to-r from-purple-500 to-pink-600 rounded-xl shadow-lg">
                  <Brain className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
                    Course Skill Mapping
                  </h1>
                  <p className="text-gray-600 dark:text-gray-400 mt-1 flex items-center gap-2">
                    <span className="inline-flex items-center px-2 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 text-xs font-medium rounded-full">
                      {Array.isArray(skills) ? skills.length : 0} Skills
                    </span>
                    <span className="text-gray-400">•</span>
                    <span>Manage course assignments for skills</span>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Error Message */}
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
              </div>
            </div>
          </div>
        )}

        {/* Filters Bar */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg mb-6 p-6 border border-gray-100 dark:border-gray-700">
          <div className="flex flex-col lg:flex-row gap-6 items-center justify-between">
            <div className="flex flex-col sm:flex-row gap-4 flex-1">
              {/* Search */}
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 w-5 h-5" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search skills by title..."
                  className="w-full pl-12 pr-4 py-3 border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 dark:focus:ring-purple-400 focus:border-transparent transition-all duration-200 shadow-sm"
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
            </div>

            {/* View Mode Toggle */}
            <div className="flex items-center bg-gray-100 dark:bg-gray-700 rounded-xl p-1">
              <button
                onClick={() => setViewMode('grid')}
                className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-all duration-200 ${
                  viewMode === 'grid' 
                    ? 'bg-white dark:bg-gray-600 text-purple-600 dark:text-purple-400 shadow-sm' 
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
                    ? 'bg-white dark:bg-gray-600 text-purple-600 dark:text-purple-400 shadow-sm' 
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

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="group relative overflow-hidden bg-white dark:bg-gray-800 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 dark:border-gray-700">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-pink-600/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <div className="relative p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Total Skills</p>
                  <p className="text-3xl font-bold text-gray-900 dark:text-white">{Array.isArray(skills) ? skills.length : 0}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">All skills</p>
                </div>
                <div className="bg-gradient-to-r from-purple-500 to-pink-600 rounded-2xl p-4 shadow-lg group-hover:scale-110 transition-transform duration-300">
                  <Brain className="w-6 h-6 text-white" />
                </div>
              </div>
            </div>
          </div>
          
          <div className="group relative overflow-hidden bg-white dark:bg-gray-800 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 dark:border-gray-700">
            <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 to-emerald-600/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <div className="relative p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Skills with Courses</p>
                  <p className="text-3xl font-bold text-gray-900 dark:text-white">
                    {Array.isArray(skills) ? skills.filter(skill => skill.courseCount > 0).length : 0}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Have assignments</p>
                </div>
                <div className="bg-gradient-to-r from-green-500 to-emerald-600 rounded-2xl p-4 shadow-lg group-hover:scale-110 transition-transform duration-300">
                  <Check className="w-6 h-6 text-white" />
                </div>
              </div>
            </div>
          </div>

          <div className="group relative overflow-hidden bg-white dark:bg-gray-800 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 dark:border-gray-700">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-cyan-600/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <div className="relative p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Total Courses</p>
                  <p className="text-3xl font-bold text-gray-900 dark:text-white">{Array.isArray(courses) ? courses.length : 0}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Available courses</p>
                </div>
                <div className="bg-gradient-to-r from-blue-500 to-cyan-600 rounded-2xl p-4 shadow-lg group-hover:scale-110 transition-transform duration-300">
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
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Total Assignments</p>
                  <p className="text-3xl font-bold text-gray-900 dark:text-white">
                    {Array.isArray(skills) ? skills.reduce((total, skill) => total + (skill.courseCount || 0), 0) : 0}
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

        {/* Skills Display */}
        {viewMode === 'grid' ? (
          /* Grid View */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredSkills.map(skill => (
              <div key={skill.skillId} className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden hover:shadow-lg transition-shadow">
                {/* Skill Header */}
                <div className="relative h-32 bg-gradient-to-br from-purple-100 to-pink-100 dark:from-purple-900/20 dark:to-pink-900/20">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center">
                      <div className="text-4xl mb-2">🎯</div>
                      <span className="inline-flex items-center px-3 py-1 text-sm font-medium rounded-full bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-700">
                        {skill.title}
                      </span>
                    </div>
                  </div>
                  {skill.courseCount > 0 ? (
                    <div className="absolute top-2 right-2 bg-green-500 text-white px-2 py-1 rounded-full text-xs font-medium">
                      {skill.courseCount} courses
                    </div>
                  ) : (
                    <div className="absolute top-2 right-2 bg-gray-500 text-white px-2 py-1 rounded-full text-xs font-medium">
                      No courses
                    </div>
                  )}
                </div>

                {/* Skill Info */}
                <div className="p-4">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">{skill.title}</h3>
                  
                  <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400 mb-4">
                    <span>ID: {skill.skillId}</span>
                    <span>{skill.courseCount || 0} courses</span>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => openCourseAssignmentModal(skill)}
                        className="p-2 bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded hover:bg-purple-200 dark:hover:bg-purple-900/50 transition-colors"
                        title="Manage Courses"
                      >
                        <Users className="w-4 h-4" />
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
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Skills</h2>
                <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                  <span>{filteredSkills.length} skills</span>
                </div>
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-900/30 border-b border-gray-200 dark:border-gray-700">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Skill
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Skill ID
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
                  {filteredSkills.map((skill, index) => (
                    <tr key={skill.skillId} className={`hover:bg-gray-50 dark:hover:bg-gray-900/30 transition-colors ${
                      index % 2 === 0 ? 'bg-white dark:bg-gray-800' : 'bg-gray-50/50 dark:bg-gray-900/20'
                    }`}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 shadow-sm">
                            🎯
                          </div>
                          <div>
                            <div className="text-sm font-medium text-gray-900 dark:text-white">
                              {skill.title}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200">
                          {skill.skillId}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          skill.courseCount > 0 
                            ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200' 
                            : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200'
                        }`}>
                          <span className={`w-2 h-2 rounded-full mr-1.5 ${
                            skill.courseCount > 0 ? 'bg-green-400' : 'bg-gray-400'
                          }`}></span>
                          {skill.courseCount > 0 ? 'Has Courses' : 'No Courses'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-gray-900 dark:text-white font-medium">
                            {skill.courseCount || 0}
                          </span>
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            courses
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => openCourseAssignmentModal(skill)}
                            className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 hover:bg-purple-200 dark:hover:bg-purple-900/50 transition-colors"
                            title="Manage Courses"
                          >
                            <Users className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Empty State */}
            {filteredSkills.length === 0 && (
              <div className="px-6 py-12 text-center">
                <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Brain className="w-8 h-8 text-gray-400 dark:text-gray-500" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No skills found</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                  {searchTerm ? 'Try adjusting your search' : 'No skills available'}
                </p>
              </div>
            )}
          </div>
        )}

        {/* Skills Pagination */}
        {skillsPagination.totalPages > 1 && (
          <div className="flex items-center justify-between py-4 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-700 dark:text-gray-300">
                Showing {((skillsPagination.currentPage - 1) * skillsPagination.pageSize) + 1} to{' '}
                {Math.min(skillsPagination.currentPage * skillsPagination.pageSize, skillsPagination.totalItems)} of{' '}
                {skillsPagination.totalItems} skills
              </span>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <label className="text-sm text-gray-700 dark:text-gray-300">Show:</label>
                <select
                  value={skillsPagination.pageSize}
                  onChange={(e) => changeSkillsPageSize(Number(e.target.value))}
                  className="border border-gray-300 dark:border-gray-600 rounded-md px-2 py-1 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value={8}>8</option>
                  <option value={12}>12</option>
                  <option value={16}>16</option>
                  <option value={24}>24</option>
                </select>
              </div>
              <div className="flex items-center space-x-1">
                <button
                  onClick={() => paginateSkills(skillsPagination.currentPage - 1)}
                  disabled={skillsPagination.currentPage === 1}
                  className="px-3 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300"
                >
                  Previous
                </button>
                <span className="px-3 py-1 text-sm text-gray-700 dark:text-gray-300">
                  Page {skillsPagination.currentPage} of {skillsPagination.totalPages}
                </span>
                <button
                  onClick={() => paginateSkills(skillsPagination.currentPage + 1)}
                  disabled={skillsPagination.currentPage === skillsPagination.totalPages}
                  className="px-3 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300"
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Course Assignment Modal */}
        {showCourseAssignmentModal && selectedSkill && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden">
              <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                    Manage Courses for {selectedSkill.title}
                  </h2>
                  <button
                    onClick={closeModals}
                    className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>
              </div>

              {/* Modal Tabs */}
              <div className="border-b border-gray-200 dark:border-gray-700">
                <nav className="flex -mb-px">
                  <button
                    onClick={() => setActiveModalTab('assign')}
                    className={`py-3 px-6 text-sm font-medium border-b-2 transition-colors ${
                      activeModalTab === 'assign'
                        ? 'border-purple-500 text-purple-600 dark:text-purple-400'
                        : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                    }`}
                  >
                    Assign Courses
                  </button>
                  <button
                    onClick={() => setActiveModalTab('selected')}
                    className={`py-3 px-6 text-sm font-medium border-b-2 transition-colors ${
                      activeModalTab === 'selected'
                        ? 'border-purple-500 text-purple-600 dark:text-purple-400'
                        : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                    }`}
                  >
                    Selected Courses ({getSkillCourses(selectedSkill.skillId).length})
                  </button>
                </nav>
              </div>

              {/* Course Filters - Only show on Assign tab */}
              {activeModalTab === 'assign' && (
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
                      }}
                      className="text-sm text-purple-600 hover:text-purple-700 dark:text-purple-400 dark:hover:text-purple-300"
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
              )}

              <div className="p-6 flex-1 overflow-hidden flex flex-col">
                {/* Assign Courses Tab Content */}
                {activeModalTab === 'assign' && (
                  <>
                    <div className="mb-4">
                      <p className="text-sm text-gray-600 dark:text-gray-300">
                        Currently assigned: {getSkillCourses(selectedSkill.skillId).length} courses
                      </p>
                    </div>

                    <div className="space-y-2 flex-1 overflow-y-auto mb-4">
                      {loadingCourses ? (
                        <div className="flex items-center justify-center py-8">
                          <RefreshCw className="w-6 h-6 animate-spin text-purple-500 mr-2" />
                          <span className="text-gray-600 dark:text-gray-300">Applying filters...</span>
                        </div>
                      ) : (
                        <>
                          {Array.isArray(courses) && courses.map(course => {
                            const isAssigned = getSkillCourses(selectedSkill.skillId).includes(course.id);
                            const isSelected = selectedCourses.includes(course.id);
                            const isCurrentlySelected = (isAssigned && !isSelected) || (!isAssigned && isSelected);
                            
                            return (
                              <div
                                key={course.id}
                                className={`flex items-center p-3 border rounded-lg cursor-pointer transition-colors ${
                                  isCurrentlySelected
                                    ? 'bg-purple-50 dark:bg-purple-900/20 border-purple-300 dark:border-purple-700'
                                    : 'bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600'
                                }`}
                                onClick={() => toggleCourseSelection(course.id)}
                              >
                                <input
                                  type="checkbox"
                                  checked={isCurrentlySelected}
                                  onChange={() => toggleCourseSelection(course.id)}
                                  className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded mr-3"
                                />
                                <div className="flex-1">
                                  <div className="font-medium text-gray-900 dark:text-white">{course.title || course.name || 'Unknown Course'}</div>
                                  <div className="text-sm text-gray-500 dark:text-gray-400">
                                    {(() => {
                                      const courseType = courseTypes.find(ct => ct.id === course.courseTypeId);
                                      const category = categories.find(cat => cat.id === course.categoryId);
                                      const courseLevel = courseLevels.find(cl => cl.id === course.courseLevelId);
                                      
                                      const parts = [];
                                      if (courseType?.name) parts.push(courseType.name);
                                      if (category?.name) parts.push(category.name);
                                      if (courseLevel?.name) parts.push(courseLevel.name);
                                      
                                      return parts.length > 0 ? parts.join(' • ') : 'No additional info';
                                    })()}
                                  </div>
                                </div>
                                {isAssigned && !isSelected && (
                                  <span className="text-xs bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 px-2 py-1 rounded">
                                    Assigned
                                  </span>
                                )}
                                {isSelected && (
                                  <span className="text-xs bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 px-2 py-1 rounded">
                                    {isAssigned ? 'Deselected' : 'Selected'}
                                  </span>
                                )}
                              </div>
                            );
                          })}
                          {!Array.isArray(courses) && (
                            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                              No courses available. Apply filters to load courses.
                            </div>
                          )}
                        </>
                      )}
                    </div>

                    {/* Pagination */}
                    {pagination.totalPages > 1 && (
                      <div className="flex items-center justify-between py-4 border-t border-gray-200 dark:border-gray-700">
                        <div className="flex items-center space-x-2">
                          <span className="text-sm text-gray-700 dark:text-gray-300">
                            Showing {((pagination.currentPage - 1) * pagination.pageSize) + 1} to{' '}
                            {Math.min(pagination.currentPage * pagination.pageSize, pagination.totalItems)} of{' '}
                            {pagination.totalItems} courses
                          </span>
                        </div>
                        <div className="flex items-center space-x-4">
                          <div className="flex items-center space-x-2">
                            <label className="text-sm text-gray-700 dark:text-gray-300">Show:</label>
                            <select
                              value={pagination.pageSize}
                              onChange={(e) => changePageSize(Number(e.target.value))}
                              className="border border-gray-300 dark:border-gray-600 rounded-md px-2 py-1 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                            >
                              <option value={5}>5</option>
                              <option value={10}>10</option>
                              <option value={20}>20</option>
                              <option value={50}>50</option>
                            </select>
                          </div>
                          <div className="flex items-center space-x-1">
                            <button
                              onClick={() => paginateCourses(pagination.currentPage - 1)}
                              disabled={pagination.currentPage === 1}
                              className="px-3 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300"
                            >
                              Previous
                            </button>
                            <span className="px-3 py-1 text-sm text-gray-700 dark:text-gray-300">
                              Page {pagination.currentPage} of {pagination.totalPages}
                            </span>
                            <button
                              onClick={() => paginateCourses(pagination.currentPage + 1)}
                              disabled={pagination.currentPage === pagination.totalPages}
                              className="px-3 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300"
                            >
                              Next
                            </button>
                          </div>
                        </div>
                      </div>
                    )}

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
                            : 'bg-purple-600 text-white hover:bg-purple-700'
                        }`}
                      >
                        {selectedCourses.length === 0 ? 'Select Courses to Assign' : `Update ${selectedCourses.length} Course${selectedCourses.length !== 1 ? 's' : ''}`}
                      </button>
                    </div>
                  </>
                )}

                {/* Selected Courses Tab Content */}
                {activeModalTab === 'selected' && (
                  <>
                    <div className="mb-4">
                      <p className="text-sm text-gray-600 dark:text-gray-300">
                        Showing {getSkillCourses(selectedSkill.skillId).length} assigned courses
                      </p>
                    </div>

                    <div className="space-y-2 flex-1 overflow-y-auto">
                      {getSkillCourses(selectedSkill.skillId).length === 0 ? (
                        <div className="text-center py-12">
                          <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-2xl flex items-center justify-center mx-auto mb-4">
                            <BookOpen className="w-8 h-8 text-gray-400 dark:text-gray-500" />
                          </div>
                          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No courses assigned</h3>
                          <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                            Switch to the "Assign Courses" tab to add courses to this skill.
                          </p>
                          <button
                            onClick={() => setActiveModalTab('assign')}
                            className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors"
                          >
                            Assign Courses
                          </button>
                        </div>
                      ) : courses.length === 0 ? (
                        <div className="text-center py-12">
                          <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-2xl flex items-center justify-center mx-auto mb-4">
                            <Filter className="w-8 h-8 text-gray-400 dark:text-gray-500" />
                          </div>
                          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Course details not loaded</h3>
                          <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                            {getSkillCourses(selectedSkill.skillId).length} course(s) assigned. Apply filters in the "Assign Courses" tab to load course details.
                          </p>
                          <button
                            onClick={() => setActiveModalTab('assign')}
                            className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors"
                          >
                            Apply Filters to Load Courses
                          </button>
                        </div>
                      ) : (
                        getSkillCourses(selectedSkill.skillId).map(courseId => {
                          // Find the course details from the courses array if available
                          const course = courses.find(c => c.id === courseId);
                          return (
                            <div
                              key={courseId}
                              className="flex items-center p-4 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700"
                            >
                              <div className="flex-1">
                                <div className="font-medium text-gray-900 dark:text-white">
                                  {course?.title || course?.name || `Course ID: ${courseId}`}
                                </div>
                                <div className="text-sm text-gray-500 dark:text-gray-400">
                                  {course && (() => {
                                    const courseType = courseTypes.find(ct => ct.id === course.courseTypeId);
                                    const category = categories.find(cat => cat.id === course.categoryId);
                                    const courseLevel = courseLevels.find(cl => cl.id === course.courseLevelId);
                                    
                                    const parts = [];
                                    if (courseType?.name) parts.push(courseType.name);
                                    if (category?.name) parts.push(category.name);
                                    if (courseLevel?.name) parts.push(courseLevel.name);
                                    
                                    return parts.length > 0 ? parts.join(' • ') : 'Course details not available';
                                  })()}
                                </div>
                              </div>
                              <div className="flex items-center space-x-2">
                                <span className="text-xs bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 px-2 py-1 rounded">
                                  Assigned
                                </span>
                                <button
                                  onClick={() => {
                                    // Switch to assign tab and pre-select this course for removal
                                    setActiveModalTab('assign');
                                    setSelectedCourses([courseId]);
                                  }}
                                  className="text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 text-sm"
                                >
                                  Remove
                                </button>
                              </div>
                            </div>
                          );
                        })
                      )}
                    </div>

                    <div className="flex justify-end space-x-3 mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
                      <button
                        onClick={closeModals}
                        className="px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-200 dark:bg-gray-700 rounded-md hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                      >
                        Close
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CourseSkillMapping;
