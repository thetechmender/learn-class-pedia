import React, { useState } from 'react';
import { useCourseManagement } from '../../../../hooks/useCourseManagement';
import {
  Search,
  Plus,
  Edit,
  Trash2,
  Tag,
  GitBranch,
  Users,
  Clock,
  Award,
  Filter,
  ChevronDown,
  RefreshCw,
  Target,
  TrendingUp,
  BookOpen
} from 'lucide-react';

const CareerPath = () => {
  const {
    courses,
    tags,
    loading,
    error,
    updateCourseTags,
    clearError
  } = useCourseManagement();

  const [searchTerm, setSearchTerm] = useState('');
  const [filterTag, setFilterTag] = useState('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    requiredTags: [],
    optionalTags: [],
    estimatedDuration: '',
    difficultyLevel: 'beginner',
    prerequisites: []
  });

  // Filter courses
  const filteredCourses = courses.filter(course => {
    const matchesSearch = course.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         course.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesTag = filterTag === 'all' || 
                     (filterTag === 'with-path' && course.tags && course.tags.length > 0) ||
                     (filterTag === 'no-path' && (!course.tags || course.tags.length === 0));
    
    return matchesSearch && matchesTag;
  });

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // This would create a new career path
      console.log('Creating career path:', formData);
      setShowCreateModal(false);
      setFormData({
        name: '',
        description: '',
        requiredTags: [],
        optionalTags: [],
        estimatedDuration: '',
        difficultyLevel: 'beginner',
        prerequisites: []
      });
    } catch (err) {
      console.error('Failed to create career path:', err);
    }
  };

  // Handle tag assignment to course
  const handleCourseTagAssignment = async (courseId, tagIds) => {
    try {
      await updateCourseTags(courseId, tagIds);
    } catch (err) {
      console.error('Failed to update course tags:', err);
    }
  };

  // Get courses by tag
  const getCoursesByTag = (tagName) => {
    return courses.filter(course => 
      course.tags && course.tags.includes(tagName)
    );
  };

  // Career path statistics
  const getCareerPathStats = () => {
    const totalCourses = courses.length;
    const coursesWithPaths = courses.filter(course => course.tags && course.tags.length > 0).length;
    const coursesWithoutPaths = totalCourses - coursesWithPaths;
    
    return {
      totalCourses,
      coursesWithPaths,
      coursesWithoutPaths,
      pathCompletionRate: totalCourses > 0 ? (coursesWithPaths / totalCourses * 100).toFixed(1) : 0
    };
  };

  // Handle tag selection
  const handleTagChange = (tagId) => {
    const newTags = formData.requiredTags.includes(tagId) 
      ? formData.requiredTags.filter(id => id !== tagId)
      : [...formData.requiredTags, tagId];
    setFormData(prev => ({ ...prev, requiredTags: newTags }));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <RefreshCw className="w-8 h-8 animate-spin text-blue-500" />
        <span className="ml-2 text-gray-600 dark:text-gray-300">Loading career paths...</span>
      </div>
    );
  }

  const stats = getCareerPathStats();

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Career Path Management</h1>
        <p className="text-gray-600 dark:text-gray-300">Define learning paths and assign course tags for career progression</p>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded mb-6">
          {error}
          <button onClick={clearError} className="ml-2 text-red-500 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300">
            ×
          </button>
        </div>
      )}

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Courses</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.totalCourses}</p>
            </div>
            <div className="bg-blue-100 dark:bg-blue-900/30 rounded-full p-3">
              <BookOpen className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">With Career Path</p>
              <p className="text-2xl font-bold text-green-600 dark:text-green-400">{stats.coursesWithPaths}</p>
            </div>
            <div className="bg-green-100 dark:bg-green-900/30 rounded-full p-3">
              <Target className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Without Career Path</p>
              <p className="text-2xl font-bold text-red-600 dark:text-red-400">{stats.coursesWithoutPaths}</p>
            </div>
            <div className="bg-red-100 dark:bg-red-900/30 rounded-full p-3">
              <GitBranch className="w-6 h-6 text-red-600 dark:text-red-400" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Path Completion</p>
              <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{stats.pathCompletionRate}%</p>
            </div>
            <div className="bg-blue-100 dark:bg-blue-900/30 rounded-full p-3">
              <TrendingUp className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
        </div>
      </div>

      {/* Actions Bar */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow mb-6 p-4">
        <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
          <div className="flex flex-col sm:flex-row gap-4 flex-1">
            {/* Search */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 w-4 h-4" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search courses or career paths..."
                className="w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
              />
            </div>

            {/* Tag Filter */}
            <select
              value={filterTag}
              onChange={(e) => setFilterTag(e.target.value)}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
            >
              <option value="all">All Courses</option>
              <option value="with-path">With Career Path</option>
              <option value="no-path">Without Career Path</option>
            </select>
          </div>

          {/* Create Path Button */}
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
          >
            <Plus className="w-4 h-4 mr-2" />
            Create Career Path
          </button>
        </div>
      </div>

      {/* Tag Management Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Available Tags */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Available Course Tags</h3>
          <div className="space-y-3">
            {tags.map(tag => {
              const coursesWithThisTag = getCoursesByTag(tag.name);
              return (
                <div key={tag.id} className="flex items-center justify-between p-3 border border-gray-200 dark:border-gray-600 rounded-lg">
                  <div className="flex items-center">
                    <span
                      className="px-2 py-1 text-xs font-medium rounded-full mr-3"
                      style={{ backgroundColor: tag.color + '20', color: tag.color }}
                    >
                      {tag.label}
                    </span>
                    <span className="text-sm text-gray-600 dark:text-gray-300">{coursesWithThisTag.length} courses</span>
                  </div>
                  <button
                    className="text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300"
                    title="Edit Tag"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {/* Tag Statistics */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Tag Distribution</h3>
          <div className="space-y-3">
            {tags.map(tag => {
              const coursesWithThisTag = getCoursesByTag(tag.name);
              const percentage = courses.length > 0 ? (coursesWithThisTag.length / courses.length * 100).toFixed(1) : 0;
              return (
                <div key={tag.id} className="flex items-center">
                  <span
                    className="px-2 py-1 text-xs font-medium rounded-full mr-3"
                    style={{ backgroundColor: tag.color + '20', color: tag.color }}
                  >
                    {tag.label}
                  </span>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm text-gray-600 dark:text-gray-300">{coursesWithThisTag.length} courses</span>
                      <span className="text-sm font-medium text-gray-900 dark:text-white">{percentage}%</span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Courses Table */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Course
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Category
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Level
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Current Tags
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {filteredCourses.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center text-gray-500 dark:text-gray-400">
                    No courses found
                  </td>
                </tr>
              ) : (
                filteredCourses.map(course => (
                  <tr key={course.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <img
                          className="h-12 w-12 rounded-lg object-cover mr-3"
                          src={course.thumbnail}
                          alt={course.name}
                        />
                        <div>
                          <div className="text-sm font-medium text-gray-900 dark:text-white">
                            {course.name}
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            {course.instructor}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900 dark:text-white">{course.category}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        course.level === 'beginner' ? 'bg-green-100 text-green-800' :
                        course.level === 'intermediate' ? 'bg-blue-100 text-blue-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {course.level}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {course.tags && course.tags.length > 0 ? (
                        <div className="flex flex-wrap gap-1">
                          {course.tags.slice(0, 3).map(tag => {
                            const tagData = tags.find(t => t.name === tag);
                            return tagData ? (
                              <span
                                key={tag}
                                className="px-2 py-1 text-xs rounded-full"
                                style={{ backgroundColor: tagData.color + '20', color: tagData.color }}
                              >
                                {tagData.label}
                              </span>
                            ) : null;
                          })}
                          {course.tags.length > 3 && (
                            <span className="px-2 py-1 text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-full">
                              +{course.tags.length - 3}
                            </span>
                          )}
                        </div>
                      ) : (
                        <span className="text-gray-400 dark:text-gray-500 text-sm">No tags</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        course.status === 'published' ? 'bg-green-100 text-green-800' :
                        course.status === 'draft' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {course.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center space-x-2">
                        <button
                          className="text-blue-600 dark:text-blue-400 hover:text-blue-900 dark:hover:text-blue-300"
                          title="Edit Course"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        
                        <button
                          className="text-green-600 dark:text-green-400 hover:text-green-900 dark:hover:text-green-300"
                          title="Manage Tags"
                        >
                          <Tag className="w-4 h-4" />
                        </button>
                        
                        <button
                          className="text-red-600 dark:text-red-400 hover:text-red-900 dark:hover:text-red-300"
                          title="Delete Course"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Career Path Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-gray-600 dark:bg-gray-900 bg-opacity-50 dark:bg-opacity-75 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-full max-w-2xl shadow-lg rounded-md bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">Create New Career Path</h3>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300"
              >
                ×
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Path Name */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Career Path Name
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
                    placeholder="e.g., Full Stack Developer Path"
                    required
                  />
                </div>

                {/* Description */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Description
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
                    placeholder="Describe the career path and learning outcomes..."
                    required
                  />
                </div>

                {/* Required Tags */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Required Tags
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {tags.map(tag => (
                      <label key={tag.id} className="flex items-center">
                        <input
                          type="checkbox"
                          checked={formData.requiredTags.includes(tag.id)}
                          onChange={() => handleTagChange(tag.id)}
                          className="mr-2"
                        />
                        <span
                          className="px-2 py-1 text-xs rounded-full cursor-pointer"
                          style={{ backgroundColor: tag.color + '20', color: tag.color }}
                        >
                          {tag.label}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Optional Tags */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Optional Tags
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {tags.map(tag => (
                      <label key={tag.id} className="flex items-center">
                        <input
                          type="checkbox"
                          checked={formData.optionalTags.includes(tag.id)}
                          onChange={() => {
                            const newTags = formData.optionalTags.includes(tag.id) 
                              ? formData.optionalTags.filter(id => id !== tag.id)
                              : [...formData.optionalTags, tag.id];
                            setFormData(prev => ({ ...prev, optionalTags: newTags }));
                          }}
                          className="mr-2"
                        />
                        <span
                          className="px-2 py-1 text-xs rounded-full cursor-pointer"
                          style={{ backgroundColor: tag.color + '20', color: tag.color }}
                        >
                          {tag.label}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Duration */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Estimated Duration
                  </label>
                  <input
                    type="text"
                    value={formData.estimatedDuration}
                    onChange={(e) => setFormData(prev => ({ ...prev, estimatedDuration: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
                    placeholder="e.g., 6 months, 1 year"
                    required
                  />
                </div>

                {/* Difficulty Level */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Difficulty Level
                  </label>
                  <select
                    value={formData.difficultyLevel}
                    onChange={(e) => setFormData(prev => ({ ...prev, difficultyLevel: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
                    required
                  >
                    <option value="beginner">Beginner</option>
                    <option value="intermediate">Intermediate</option>
                    <option value="advanced">Advanced</option>
                  </select>
                </div>
              </div>

              {/* Form Actions */}
              <div className="flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 text-gray-600 dark:text-gray-300 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 rounded-md hover:bg-gray-50 dark:hover:bg-gray-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                >
                  Create Career Path
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CareerPath;
