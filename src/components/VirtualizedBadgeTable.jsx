import React, { useState, useRef, useMemo } from 'react';
import { Eye, Edit2, Trash2, Award, Users, Star, CheckCircle, XCircle } from 'lucide-react';
import { getBadgeColor, getBadgeIcon, calculateBadgeAssignmentStats } from '../utils/featuredMarkingUtils';

const VirtualizedBadgeTable = ({ 
  badges = [], 
  onEdit, 
  onDelete, 
  onViewDetails, 
  expandedBadges, 
  badgeDetails, 
  detailsLoading,
  loading,
  searchTerm,
  onToggleExpand,
  onAssignCourses
}) => {
  const [scrollTop, setScrollTop] = useState(0);
  const containerRef = useRef(null);
  
  // Configuration
  const ITEM_HEIGHT = 120;
  const BUFFER_SIZE = 5;
  const containerHeight = 600; // Fixed height for virtual scrolling
  
  // Calculate visible range
  const visibleRange = useMemo(() => {
    const start = Math.max(0, Math.floor(scrollTop / ITEM_HEIGHT) - BUFFER_SIZE);
    const end = Math.min(
      badges.length,
      start + Math.ceil(containerHeight / ITEM_HEIGHT) + BUFFER_SIZE * 2
    );
    return { start, end };
  }, [scrollTop, badges.length, containerHeight]);
  
  // Get visible items
  const visibleBadges = useMemo(() => {
    return badges.slice(visibleRange.start, visibleRange.end);
  }, [badges, visibleRange]);
  
  // Handle scroll
  const handleScroll = (e) => {
    setScrollTop(e.target.scrollTop);
  };
  
  // Render badge row
  const renderBadgeRow = (badge, index) => {
    const actualIndex = visibleRange.start + index;
    const isExpanded = expandedBadges[badge.id];
    const isLoadingDetails = detailsLoading[badge.id];
    const details = badgeDetails[badge.id];
    const colorClass = getBadgeColor(badge.badgeType);
    const icon = getBadgeIcon(badge.badgeType);
    const assignmentStats = calculateBadgeAssignmentStats(badge);
    
    return (
      <React.Fragment key={badge.id}>
        {/* Main Badge Row */}
        <tr 
          className="border-b border-gray-200 hover:bg-gray-50 transition-colors"
          style={{ height: ITEM_HEIGHT }}
        >
          <td className="px-6 py-4 whitespace-nowrap">
            <div className="flex items-center">
              <div className="flex-shrink-0 w-12 h-12 rounded-lg border-2 border-gray-200 flex items-center justify-center text-2xl bg-white">
                {badge.badgeIcon || icon}
              </div>
              <div className="ml-4">
                <div className="text-sm font-medium text-gray-900">
                  {badge.badgeName}
                  {searchTerm && (
                    <span className="ml-2 text-xs text-blue-600 font-medium">
                      (matched)
                    </span>
                  )}
                </div>
                <div className="text-xs text-gray-500">{badge.badgeType}</div>
              </div>
            </div>
          </td>
          
          <td className="px-6 py-4">
            <div className="text-sm text-gray-900 max-w-xs truncate">
              {badge.description || 'No description'}
            </div>
          </td>
          
          <td className="px-6 py-4 whitespace-nowrap">
            <div className="flex flex-wrap gap-1">
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${colorClass}`}>
                {badge.badgeType}
              </span>
              {badge.isFeatured && (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 border border-blue-300">
                  Featured
                </span>
              )}
            </div>
          </td>
          
          <td className="px-6 py-4 whitespace-nowrap">
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
              badge.isActive 
                ? 'bg-green-100 text-green-800' 
                : 'bg-red-100 text-red-800'
            }`}>
              {badge.isActive ? 'Active' : 'Inactive'}
            </span>
          </td>
          
          <td className="px-6 py-4 whitespace-nowrap">
            <div className="text-sm text-gray-900">
              <div className="flex items-center space-x-2">
                <Users className="w-4 h-4 text-gray-400" />
                <span>{assignmentStats.totalAssigned} courses</span>
              </div>
              {assignmentStats.totalStudents > 0 && (
                <div className="text-xs text-gray-500 mt-1">
                  {assignmentStats.totalStudents} students
                </div>
              )}
            </div>
          </td>
          
          <td className="px-6 py-4 whitespace-nowrap text-center">
            <div className="flex items-center justify-center space-x-1">
              <button
                onClick={() => onViewDetails(badge.id)}
                className="text-blue-600 hover:text-blue-800 hover:bg-blue-100 p-2 rounded-lg transition-all duration-200"
                title="View Badge Details"
              >
                <Eye className="w-4 h-4" />
              </button>
              <button
                onClick={() => onEdit(badge)}
                className="text-green-600 hover:text-green-800 hover:bg-green-100 p-2 rounded-lg transition-all duration-200"
                title="Edit Badge"
              >
                <Edit2 className="w-4 h-4" />
              </button>
              <button
                onClick={() => onAssignCourses(badge)}
                className="text-purple-600 hover:text-purple-800 hover:bg-purple-100 p-2 rounded-lg transition-all duration-200"
                title="Assign Courses"
              >
                <Award className="w-4 h-4" />
              </button>
              <button
                onClick={() => onDelete(badge)}
                className="text-red-600 hover:text-red-800 hover:bg-red-100 p-2 rounded-lg transition-all duration-200"
                title="Delete Badge"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </td>
        </tr>
        
        {/* Expanded Details Row */}
        {isExpanded && (
          <tr className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b-2 border-blue-200">
            <td colSpan="6" className="px-6 py-6">
              {isLoadingDetails ? (
                <div className="flex items-center justify-center py-12">
                  <div className="flex flex-col items-center">
                    <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mb-3"></div>
                    <span className="text-gray-600 font-medium">Loading badge details...</span>
                  </div>
                </div>
              ) : details ? (
                <div className="space-y-6">
                  {/* Badge Header */}
                  <div className="flex items-start space-x-6 pb-6 border-b border-blue-200">
                    <div className="flex-shrink-0 w-16 h-16 rounded-xl border-2 border-gray-200 flex items-center justify-center text-3xl bg-white">
                      {details.badgeIcon || icon}
                    </div>
                    <div className="flex-1">
                      <h4 className="text-2xl font-bold text-gray-900 mb-2">{details.badgeName}</h4>
                      <p className="text-gray-600 text-sm mb-3">{details.description}</p>
                      <div className="flex flex-wrap gap-2">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-bold ${colorClass}`}>
                          {details.badgeType}
                        </span>
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-bold ${
                          details.isActive 
                            ? 'bg-green-100 text-green-800 border border-green-300' 
                            : 'bg-red-100 text-red-800 border border-red-300'
                        }`}>
                          {details.isActive ? 'Active' : 'Inactive'}
                        </span>
                        {details.isFeatured && (
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-bold bg-blue-100 text-blue-800 border border-blue-300">
                            Featured Badge
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Badge Details Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-white p-4 rounded-lg border border-gray-200">
                      <h5 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Badge ID</h5>
                      <p className="text-sm font-bold text-gray-900 font-mono">{details.id}</p>
                    </div>
                    <div className="bg-white p-4 rounded-lg border border-gray-200">
                      <h5 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Created Date</h5>
                      <p className="text-sm text-gray-900">
                        {new Date(details.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="bg-white p-4 rounded-lg border border-gray-200">
                      <h5 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Last Updated</h5>
                      <p className="text-sm text-gray-900">
                        {new Date(details.updatedAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  {/* Assignment Statistics */}
                  <div className="bg-white p-4 rounded-lg border border-gray-200">
                    <h5 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Assignment Statistics</h5>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-gray-900">{assignmentStats.totalAssigned}</div>
                        <div className="text-xs text-gray-500">Assigned Courses</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-green-600">{assignmentStats.activeCourses}</div>
                        <div className="text-xs text-gray-500">Active Courses</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-blue-600">{assignmentStats.totalStudents}</div>
                        <div className="text-xs text-gray-500">Total Students</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-yellow-600">
                          {assignmentStats.averageRating > 0 ? assignmentStats.averageRating.toFixed(1) : 'N/A'}
                        </div>
                        <div className="text-xs text-gray-500">Average Rating</div>
                      </div>
                    </div>
                  </div>

                  {/* Assigned Courses */}
                  {details.courses && details.courses.length > 0 && (
                    <div className="bg-white p-4 rounded-lg border border-gray-200">
                      <h5 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Assigned Courses</h5>
                      <div className="space-y-2 max-h-48 overflow-y-auto">
                        {details.courses.map((course) => (
                          <div key={course.id} className="flex items-center justify-between p-2 border border-gray-100 rounded">
                            <div className="flex items-center space-x-2">
                              <CheckCircle className="w-4 h-4 text-green-500" />
                              <span className="text-sm font-medium text-gray-900">{course.title}</span>
                              <span className="text-xs text-gray-500">({course.courseLevelName})</span>
                            </div>
                            <div className="flex items-center space-x-2 text-xs text-gray-500">
                              <Users className="w-3 h-3" />
                              <span>{course.studentsCount || 0}</span>
                              {course.averageRating && (
                                <>
                                  <Star className="w-3 h-3 text-yellow-400" />
                                  <span>{course.averageRating.toFixed(1)}</span>
                                </>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center text-gray-500 py-8">
                  <div className="p-3 bg-red-100 rounded-full inline-block mb-3">
                    <XCircle className="w-6 h-6 text-red-600" />
                  </div>
                  <p className="font-medium">Failed to load badge details.</p>
                </div>
              )}
            </td>
          </tr>
        )}
      </React.Fragment>
    );
  };
  
  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="flex flex-col items-center">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4"></div>
          <span className="text-gray-600 font-medium">Loading badges...</span>
        </div>
      </div>
    );
  }
  
  if (badges.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="p-3 bg-gray-100 rounded-full inline-block mb-3">
          <Award className="w-8 h-8 text-gray-400" />
        </div>
        <p className="text-gray-600 font-medium">No badges found</p>
      </div>
    );
  }
  
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      <div 
        ref={containerRef}
        onScroll={handleScroll}
        style={{ height: containerHeight, overflow: 'auto' }}
        className="relative"
      >
        {/* Spacer for virtual scrolling */}
        <div style={{ height: badges.length * ITEM_HEIGHT, position: 'relative' }}>
          {/* Visible items */}
          <div 
            style={{ 
              position: 'absolute', 
              top: visibleRange.start * ITEM_HEIGHT, 
              left: 0, 
              right: 0 
            }}
          >
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50 sticky top-0 z-10">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Badge
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Description
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Assignments
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {visibleBadges.map((badge, index) => renderBadgeRow(badge, index))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VirtualizedBadgeTable;
