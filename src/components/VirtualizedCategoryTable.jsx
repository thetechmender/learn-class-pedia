import React, { useState, useRef, useMemo } from 'react';
import { ChevronDown, ChevronUp, Eye, Edit2, Trash2, Plus, Folder, FolderOpen, AlertCircle } from 'lucide-react';

const VirtualizedCategoryTable = ({ 
  categories = [], 
  onEdit, 
  onDelete, 
  onViewDetails, 
  expandedCategories, 
  categoryDetails, 
  detailsLoading,
  loading,
  searchTerm,
  onToggleExpand
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
      categories.length,
      start + Math.ceil(containerHeight / ITEM_HEIGHT) + BUFFER_SIZE * 2
    );
    return { start, end };
  }, [scrollTop, categories.length, containerHeight]);
  
  // Get visible items
  const visibleCategories = useMemo(() => {
    return categories.slice(visibleRange.start, visibleRange.end);
  }, [categories, visibleRange]);
  
  // Handle scroll
  const handleScroll = (e) => {
    setScrollTop(e.target.scrollTop);
  };
  
  // Render category row
  const renderCategoryRow = (category, index) => {
    const actualIndex = visibleRange.start + index;
    const isExpanded = expandedCategories[category.id];
    const isLoadingDetails = detailsLoading[category.id];
    const details = categoryDetails[category.id];
    const hasChildren = category.children && category.children.length > 0;
    const level = category.level || 0;
    
    return (
      <React.Fragment key={category.id}>
        {/* Main Category Row */}
        <tr 
          className="border-b border-gray-200 hover:bg-gray-50 transition-colors"
          style={{ height: ITEM_HEIGHT, paddingLeft: `${level * 24}px` }}
        >
          <td className="px-6 py-4 whitespace-nowrap">
            <div className="flex items-center">
              <button
                onClick={() => onToggleExpand(category.id)}
                className="mr-2 text-gray-400 hover:text-gray-600 transition-colors"
              >
                {isExpanded ? (
                  <FolderOpen className="w-4 h-4" />
                ) : (
                  <Folder className="w-4 h-4" />
                )}
              </button>
              <div>
                <div className="text-sm font-medium text-gray-900">
                  {category.name}
                  {searchTerm && (
                    <span className="ml-2 text-xs text-blue-600 font-medium">
                      (matched)
                    </span>
                  )}
                </div>
                <div className="text-xs text-gray-500">{category.slug}</div>
              </div>
            </div>
          </td>
          
          <td className="px-6 py-4 whitespace-nowrap">
            <div className="text-sm text-gray-900 max-w-xs truncate">
              {category.description || 'No description'}
            </div>
          </td>
          
          <td className="px-6 py-4 whitespace-nowrap">
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
              category.isActive 
                ? 'bg-green-100 text-green-800' 
                : 'bg-red-100 text-red-800'
            }`}>
              {category.isActive ? 'Active' : 'Inactive'}
            </span>
          </td>
          
          <td className="px-6 py-4 whitespace-nowrap">
            <div className="text-sm text-gray-900">
              {category.courseCount || 0} courses
            </div>
          </td>
          
          <td className="px-6 py-4 whitespace-nowrap text-center">
            <div className="flex items-center justify-center space-x-1">
              <button
                onClick={() => onViewDetails(category.id)}
                className="text-blue-600 hover:text-blue-800 hover:bg-blue-100 p-2 rounded-lg transition-all duration-200"
                title="View Category Details"
              >
                <Eye className="w-4 h-4" />
              </button>
              <button
                onClick={() => onEdit(category)}
                className="text-green-600 hover:text-green-800 hover:bg-green-100 p-2 rounded-lg transition-all duration-200"
                title="Edit Category"
              >
                <Edit2 className="w-4 h-4" />
              </button>
              <button
                onClick={() => onDelete(category)}
                className="text-red-600 hover:text-red-800 hover:bg-red-100 p-2 rounded-lg transition-all duration-200"
                title="Delete Category"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </td>
        </tr>
        
        {/* Expanded Details Row */}
        {isExpanded && (
          <tr className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b-2 border-blue-200">
            <td colSpan="5" className="px-6 py-6" style={{ paddingLeft: `${(level + 1) * 24}px` }}>
              {isLoadingDetails ? (
                <div className="flex items-center justify-center py-12">
                  <div className="flex flex-col items-center">
                    <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mb-3"></div>
                    <span className="text-gray-600 font-medium">Loading category details...</span>
                  </div>
                </div>
              ) : details ? (
                <div className="space-y-6">
                  {/* Category Header */}
                  <div className="flex items-start space-x-6 pb-6 border-b border-blue-200">
                    <div className="flex-1">
                      <h4 className="text-2xl font-bold text-gray-900 mb-2">{details.name}</h4>
                      <p className="text-gray-600 text-sm mb-3">Slug: {details.slug}</p>
                      <div className="flex flex-wrap gap-2 mb-3">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-bold ${
                          details.isActive 
                            ? 'bg-green-100 text-green-800 border border-green-300' 
                            : 'bg-red-100 text-red-800 border border-red-300'
                        }`}>
                          {details.isActive ? 'Active' : 'Inactive'}
                        </span>
                        {details.parentCategoryName && (
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-bold bg-purple-100 text-purple-800 border border-purple-300">
                            Parent: {details.parentCategoryName}
                          </span>
                        )}
                      </div>
                      <div className="text-sm text-gray-700">
                        {details.description || 'No description available'}
                      </div>
                    </div>
                  </div>

                  {/* Category Details Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-white p-4 rounded-lg border border-gray-200">
                      <h5 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Category ID</h5>
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
                    <div className="bg-white p-4 rounded-lg border border-gray-200">
                      <h5 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Courses Count</h5>
                      <p className="text-sm font-bold text-gray-900">{details.courseCount || 0}</p>
                    </div>
                    <div className="bg-white p-4 rounded-lg border border-gray-200">
                      <h5 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Subcategories</h5>
                      <p className="text-sm font-bold text-gray-900">{details.subCategoriesCount || 0}</p>
                    </div>
                  </div>

                  {/* Child Categories */}
                  {details.children && details.children.length > 0 && (
                    <div className="bg-white p-4 rounded-lg border border-gray-200">
                      <h5 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Subcategories</h5>
                      <div className="space-y-2">
                        {details.children.map((child) => (
                          <div key={child.id} className="flex items-center justify-between p-2 border border-gray-100 rounded">
                            <div className="flex items-center space-x-2">
                              <Folder className="w-4 h-4 text-gray-400" />
                              <span className="text-sm font-medium text-gray-900">{child.name}</span>
                              <span className="text-xs text-gray-500">({child.slug})</span>
                            </div>
                            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                              child.isActive 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-red-100 text-red-800'
                            }`}>
                              {child.isActive ? 'Active' : 'Inactive'}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center text-gray-500 py-8">
                  <div className="p-3 bg-red-100 rounded-full inline-block mb-3">
                    <AlertCircle className="w-6 h-6 text-red-600" />
                  </div>
                  <p className="font-medium">Failed to load category details.</p>
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
          <span className="text-gray-600 font-medium">Loading categories...</span>
        </div>
      </div>
    );
  }
  
  if (categories.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="p-3 bg-gray-100 rounded-full inline-block mb-3">
          <Folder className="w-8 h-8 text-gray-400" />
        </div>
        <p className="text-gray-600 font-medium">No categories found</p>
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
        <div style={{ height: categories.length * ITEM_HEIGHT, position: 'relative' }}>
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
                    Category
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Description
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Courses
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {visibleCategories.map((category, index) => renderCategoryRow(category, index))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VirtualizedCategoryTable;
