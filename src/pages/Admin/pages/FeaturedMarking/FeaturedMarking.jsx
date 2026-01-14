import React, { useState } from 'react';
import { useCourseManagement } from '../../../../hooks/useCourseManagement';
import {
  Star,
  TrendingUp,
  Award,
  Eye,
  Search,
  Filter,
  ChevronDown,
  RefreshCw,
  Grid,
  List
} from 'lucide-react';

const FeaturedMarking = () => {
  const {
    courses,
    badges,
    loading,
    error,
    updateCourseBadge,
    updateCourseFeatured,
    clearError
  } = useCourseManagement();

  const [searchTerm, setSearchTerm] = useState('');
  const [filterBadge, setFilterBadge] = useState('all');
  const [filterFeatured, setFilterFeatured] = useState('all');
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'

  // Filter courses
  const filteredCourses = courses.filter(course => {
    const matchesSearch = course.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         course.instructor.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesBadge = filterBadge === 'all' || course.badge === filterBadge;
    const matchesFeatured = filterFeatured === 'all' || 
                         (filterFeatured === 'featured' && course.featured) ||
                         (filterFeatured === 'not-featured' && !course.featured);
    
    return matchesSearch && matchesBadge && matchesFeatured;
  });

  // Get badge info
  const getBadgeInfo = (badgeName) => {
    return badges.find(b => b.name === badgeName);
  };

  // Handle badge assignment
  const handleBadgeChange = async (courseId, badgeName) => {
    try {
      const badge = badges.find(b => b.name === badgeName);
      const badgeId = badge ? badge.id : null;
      await updateCourseBadge(courseId, badgeId);
    } catch (err) {
      console.error('Failed to update badge:', err);
    }
  };

  // Handle featured toggle
  const handleFeaturedToggle = async (courseId, featured) => {
    try {
      await updateCourseFeatured(courseId, featured);
    } catch (err) {
      console.error('Failed to update featured status:', err);
    }
  };

  // Get badge display
  const getBadgeDisplay = (badgeName) => {
    const badge = getBadgeInfo(badgeName);
    if (!badge) return null;
    
    return (
      <span
        className="inline-flex items-center px-2 py-1 text-xs font-medium rounded-full"
        style={{ backgroundColor: badge.color + '20', color: badge.color }}
      >
        <span className="mr-1">{badge.icon}</span>
        {badge.label}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <RefreshCw className="w-8 h-8 animate-spin text-blue-500" />
        <span className="ml-2 text-gray-600 dark:text-gray-300">Loading courses...</span>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Featured Marking</h1>
        <p className="text-gray-600 dark:text-gray-300">Manage course badges and featured status</p>
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

      {/* Filters Bar */}
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
                placeholder="Search courses..."
                className="w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
              />
            </div>

            {/* Badge Filter */}
            <select
              value={filterBadge}
              onChange={(e) => setFilterBadge(e.target.value)}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
            >
              <option value="all">All Badges</option>
              {badges.map(badge => (
                <option key={badge.id} value={badge.name}>
                  {badge.icon} {badge.label}
                </option>
              ))}
            </select>

            {/* Featured Filter */}
            <select
              value={filterFeatured}
              onChange={(e) => setFilterFeatured(e.target.value)}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
            >
              <option value="all">All Courses</option>
              <option value="featured">Featured Only</option>
              <option value="not-featured">Not Featured</option>
            </select>
          </div>

          {/* View Mode Toggle */}
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded ${viewMode === 'grid' ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400' : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300'}`}
              title="Grid View"
            >
              <Grid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded ${viewMode === 'list' ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400' : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300'}`}
              title="List View"
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {badges.map(badge => {
          const count = courses.filter(course => course.badge === badge.name).length;
          return (
            <div key={badge.id} className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Courses with {badge.label}</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{count}</p>
                </div>
                <div className="bg-gray-100 dark:bg-gray-700 rounded-full p-3">
                  <span className="text-2xl">{badge.icon}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Featured Courses Count */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow mb-6 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Star className="w-6 h-6 text-yellow-500 mr-3" />
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Featured Courses</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {courses.filter(course => course.featured).length}
              </p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-500 dark:text-gray-400">Total Courses</p>
            <p className="text-lg font-semibold text-gray-900 dark:text-white">{courses.length}</p>
          </div>
        </div>
      </div>

      {/* Courses Display */}
      {viewMode === 'grid' ? (
        /* Grid View */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCourses.map(course => (
            <div key={course.id} className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden hover:shadow-lg transition-shadow">
              {/* Course Image */}
              <div className="relative h-48">
                <img
                  className="w-full h-full object-cover"
                  src={course.thumbnail}
                  alt={course.name}
                />
                {course.featured && (
                  <div className="absolute top-2 right-2 bg-yellow-500 text-white px-2 py-1 rounded-full text-xs font-medium flex items-center">
                    <Star className="w-3 h-3 mr-1" />
                    Featured
                  </div>
                )}
                {course.badge && getBadgeDisplay(course.badge)}
              </div>

              {/* Course Info */}
              <div className="p-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">{course.name}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-300 mb-3 line-clamp-2">{course.description}</p>
                
                <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400 mb-4">
                  <span>{course.instructor}</span>
                  <span>{course.category}</span>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    {/* Badge Selector */}
                    <select
                      value={course.badge || ''}
                      onChange={(e) => handleBadgeChange(course.id, e.target.value)}
                      className="text-xs px-2 py-1 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded focus:outline-none focus:ring-1 focus:ring-blue-500 dark:focus:ring-blue-400"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <option value="">No Badge</option>
                      {badges.map(badge => (
                        <option key={badge.id} value={badge.name}>
                          {badge.icon} {badge.label}
                        </option>
                      ))}
                    </select>

                    {/* Featured Toggle */}
                    <button
                      onClick={() => handleFeaturedToggle(course.id, !course.featured)}
                      className={`p-2 rounded text-xs font-medium transition-colors ${
                        course.featured 
                          ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 hover:bg-yellow-200 dark:hover:bg-yellow-900/50' 
                          : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                      }`}
                      title={course.featured ? "Remove from Featured" : "Add to Featured"}
                    >
                      {course.featured ? (
                        <>
                          <Star className="w-3 h-3 mr-1" />
                          Featured
                        </>
                      ) : (
                        <>
                          <TrendingUp className="w-3 h-3 mr-1" />
                          Feature
                        </>
                      )}
                    </button>
                  </div>

                  {/* View Details */}
                  <button
                    className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 text-sm font-medium"
                  >
                    <Eye className="w-4 h-4 mr-1" />
                    View
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* List View */
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Course
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Instructor
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Category
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Current Badge
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Featured
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
                            {course.badge && getBadgeDisplay(course.badge)}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900 dark:text-white">{course.instructor}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-600 dark:text-gray-300">{course.category}</div>
                      </td>
                      <td className="px-6 py-4">
                        {course.badge ? getBadgeDisplay(course.badge) : (
                          <span className="text-gray-400 dark:text-gray-500 text-sm">No Badge</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        {course.featured ? (
                          <span className="flex items-center text-yellow-500">
                            <Star className="w-4 h-4 mr-1" />
                            Featured
                          </span>
                        ) : (
                          <span className="text-gray-400 dark:text-gray-500">Not Featured</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex items-center space-x-2">
                          {/* Badge Selector */}
                          <select
                            value={course.badge || ''}
                            onChange={(e) => handleBadgeChange(course.id, e.target.value)}
                            className="text-xs px-2 py-1 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded focus:outline-none focus:ring-1 focus:ring-blue-500 dark:focus:ring-blue-400"
                          >
                            <option value="">No Badge</option>
                            {badges.map(badge => (
                              <option key={badge.id} value={badge.name}>
                                {badge.icon} {badge.label}
                              </option>
                            ))}
                          </select>

                          {/* Featured Toggle */}
                          <button
                            onClick={() => handleFeaturedToggle(course.id, !course.featured)}
                            className={`p-2 rounded text-xs font-medium ${
                              course.featured 
                                ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 hover:bg-yellow-200 dark:hover:bg-yellow-900/50' 
                                : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                            }`}
                            title={course.featured ? "Remove from Featured" : "Add to Featured"}
                          >
                            {course.featured ? (
                              <>
                                <Star className="w-3 h-3 mr-1" />
                                Featured
                              </>
                            ) : (
                              <>
                                <TrendingUp className="w-3 h-3 mr-1" />
                                Feature
                              </>
                            )}
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
      )}
    </div>
  );
};

export default FeaturedMarking;
