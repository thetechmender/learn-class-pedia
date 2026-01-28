import React, { useState, useEffect, useRef, useMemo } from 'react';
import { ChevronDown, ChevronUp, Eye, Edit2, Trash2 } from 'lucide-react';

const VirtualizedTable = ({ 
  courses = [], 
  onEdit, 
  onDelete, 
  onViewDetails, 
  expandedCourses, 
  courseDetails, 
  detailsLoading,
  loading,
  searchTerm 
}) => {
  const [scrollTop, setScrollTop] = useState(0);
  const containerRef = useRef(null);
  
  // Configuration
  const ITEM_HEIGHT = 80;
  const BUFFER_SIZE = 5;
  const containerHeight = 600; // Fixed height for virtual scrolling
  
  // Calculate visible range
  const visibleRange = useMemo(() => {
    const start = Math.max(0, Math.floor(scrollTop / ITEM_HEIGHT) - BUFFER_SIZE);
    const end = Math.min(
      courses.length,
      start + Math.ceil(containerHeight / ITEM_HEIGHT) + BUFFER_SIZE * 2
    );
    return { start, end };
  }, [scrollTop, courses.length, containerHeight]);
  
  // Get visible items
  const visibleCourses = useMemo(() => {
    return courses.slice(visibleRange.start, visibleRange.end);
  }, [courses, visibleRange]);
  
  // Handle scroll
  const handleScroll = (e) => {
    setScrollTop(e.target.scrollTop);
  };
  
  // Render course row
  const renderCourseRow = (course, index) => {
    const actualIndex = visibleRange.start + index;
    const isExpanded = expandedCourses[course.id];
    const isLoadingDetails = detailsLoading[course.id];
    const details = courseDetails[course.id];
    
    return (
      <React.Fragment key={course.id}>
        {/* Main Course Row */}
        <tr 
          className="border-b border-gray-200 hover:bg-gray-50 transition-colors"
          style={{ height: ITEM_HEIGHT }}
        >
          <td className="px-6 py-4 whitespace-nowrap">
            <div className="flex items-center">
              {course.thumbnailUrl ? (
                <img 
                  src={course.thumbnailUrl} 
                  alt={course.title}
                  className="w-10 h-10 rounded-lg object-cover mr-3 border border-gray-200"
                  loading="lazy"
                />
              ) : (
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center mr-3">
                  <span className="text-white text-xs font-bold">
                    {course.title.charAt(0).toUpperCase()}
                  </span>
                </div>
              )}
              <div>
                <div className="text-sm font-medium text-gray-900">
                  {course.title}
                  {searchTerm && (
                    <span className="ml-2 text-xs text-blue-600 font-medium">
                      (matched)
                    </span>
                  )}
                </div>
                <div className="text-xs text-gray-500">{course.subtitle}</div>
              </div>
            </div>
          </td>
          
          <td className="px-6 py-4 whitespace-nowrap">
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
              {course.categoryName}
            </span>
          </td>
          
          <td className="px-6 py-4 whitespace-nowrap">
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
              {course.courseLevelName}
            </span>
          </td>
          
          <td className="px-6 py-4 whitespace-nowrap">
            <div className="text-sm text-gray-900">{course.courseTypeName}</div>
          </td>
          
          <td className="px-6 py-4 whitespace-nowrap">
            <div className="flex items-center">
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                course.isActive 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-red-100 text-red-800'
              }`}>
                {course.isActive ? 'Active' : 'Inactive'}
              </span>
            </div>
          </td>
          
          <td className="px-6 py-4 whitespace-nowrap">
            <div className="text-sm text-gray-900">
              {course.discountedPrice < course.price ? (
                <div className="flex items-center space-x-1">
                  <span className="text-green-600 font-medium">${course.discountedPrice}</span>
                  <span className="text-gray-400 line-through text-xs">${course.price}</span>
                </div>
              ) : (
                <span className="font-medium">${course.price}</span>
              )}
              <span className="text-gray-500 ml-1 text-xs">{course.currencyCode}</span>
            </div>
          </td>
          
          <td className="px-6 py-4 whitespace-nowrap text-center">
            <div className="flex items-center justify-center space-x-1">
              <button
                onClick={() => onViewDetails(course.id)}
                className="text-blue-600 hover:text-blue-800 hover:bg-blue-100 p-2 rounded-lg transition-all duration-200"
                title="View Course Details"
              >
                <Eye className="w-4 h-4" />
                {isExpanded && <ChevronUp className="w-3 h-3 ml-1" />}
                {!isExpanded && <ChevronDown className="w-3 h-3 ml-1" />}
              </button>
              <button
                onClick={() => onEdit(course)}
                className="text-green-600 hover:text-green-800 hover:bg-green-100 p-2 rounded-lg transition-all duration-200"
                title="Edit Course"
              >
                <Edit2 className="w-4 h-4" />
              </button>
              <button
                onClick={() => onDelete(course)}
                className="text-red-600 hover:text-red-800 hover:bg-red-100 p-2 rounded-lg transition-all duration-200"
                title="Delete Course"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </td>
        </tr>
        
        {/* Expanded Details Row */}
        {isExpanded && (
          <tr className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b-2 border-blue-200">
            <td colSpan="7" className="px-6 py-6">
              {isLoadingDetails ? (
                <div className="flex items-center justify-center py-12">
                  <div className="flex flex-col items-center">
                    <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mb-3"></div>
                    <span className="text-gray-600 font-medium">Loading course details...</span>
                  </div>
                </div>
              ) : details ? (
                <div className="space-y-6">
                  {/* Course Header */}
                  <div className="flex items-start space-x-6 pb-6 border-b border-blue-200">
                    {details.thumbnailUrl ? (
                      <img 
                        src={details.thumbnailUrl} 
                        alt={details.title}
                        className="w-24 h-24 rounded-xl object-cover border-2 border-gray-200 shadow-lg"
                        loading="lazy"
                      />
                    ) : (
                      <div className="w-24 h-24 rounded-xl bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center shadow-lg">
                        <span className="text-white text-2xl font-bold">
                          {details.title.charAt(0).toUpperCase()}
                        </span>
                      </div>
                    )}
                    <div className="flex-1">
                      <h4 className="text-2xl font-bold text-gray-900 mb-2">{details.title}</h4>
                      {details.subtitle && (
                        <p className="text-gray-600 text-lg mb-3">{details.subtitle}</p>
                      )}
                      <div className="flex flex-wrap gap-2">
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-bold bg-gradient-to-r from-purple-100 to-purple-200 text-purple-800 border border-purple-300">
                          {details.categoryName}
                        </span>
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-bold bg-gradient-to-r from-orange-100 to-orange-200 text-orange-800 border border-orange-300">
                          {details.courseLevelName}
                        </span>
                        {details.badges?.map((badge, index) => (
                          <span key={index} className="inline-flex items-center px-3 py-1 rounded-full text-sm font-bold bg-gradient-to-r from-yellow-100 to-yellow-200 text-yellow-800 border border-yellow-300">
                            {badge?.badgeName}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Course Details Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-white p-4 rounded-lg border border-gray-200">
                      <h5 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Course Type</h5>
                      <p className="text-sm font-bold text-gray-900">{details.courseTypeName}</p>
                    </div>
                    <div className="bg-white p-4 rounded-lg border border-gray-200">
                      <h5 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Language</h5>
                      <div className="flex items-center text-sm font-bold text-gray-900">
                        🌐 {details.languageCode}
                      </div>
                    </div>
                    <div className="bg-white p-4 rounded-lg border border-gray-200">
                      <h5 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Pricing</h5>
                      <div className="flex items-center">
                        💰
                        <div className="text-sm font-bold ml-2">
                          {details.discountedPrice < details.price ? (
                            <div className="flex items-center space-x-2">
                              <span className="text-green-600">${details.discountedPrice}</span>
                              <span className="text-gray-400 line-through text-xs">${details.price}</span>
                            </div>
                          ) : (
                            <span className="text-gray-900">${details.price}</span>
                          )}
                          <span className="text-gray-500 ml-1 text-xs">{details.currencyCode}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Description and Overview */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-white p-4 rounded-lg border border-gray-200">
                      <h5 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Description</h5>
                      <p className="text-sm text-gray-700 leading-relaxed">
                        {details.description || 'No description available'}
                      </p>
                    </div>
                    {details.overview && (
                      <div className="bg-white p-4 rounded-lg border border-gray-200">
                        <h5 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Overview</h5>
                        <p className="text-sm text-gray-700 leading-relaxed">
                          {details.overview}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="text-center text-gray-500 py-8">
                  <div className="p-3 bg-red-100 rounded-full inline-block mb-3">
                    ❌
                  </div>
                  <p className="font-medium">Failed to load course details.</p>
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
          <span className="text-gray-600 font-medium">Loading courses...</span>
        </div>
      </div>
    );
  }
  
  if (courses.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="p-3 bg-gray-100 rounded-full inline-block mb-3">
          📚
        </div>
        <p className="text-gray-600 font-medium">No courses found</p>
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
        <div style={{ height: courses.length * ITEM_HEIGHT, position: 'relative' }}>
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
                    Course
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Category
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Level
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Price
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {visibleCourses.map((course, index) => renderCourseRow(course, index))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VirtualizedTable;
