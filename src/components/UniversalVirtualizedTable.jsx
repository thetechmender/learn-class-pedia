import React, { useState, useRef, useMemo, useEffect, useCallback } from 'react';
import { Eye, EyeOff, Edit2, Trash2, AlertCircle, Database } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

const UniversalVirtualizedTable = React.forwardRef(({ 
  data = [],
  columns = [],
  onEdit,
  onDelete,
  onViewDetails,
  onCustomAction,
  onToggleExpand,
  onScroll,
  expandedItems = {},
  itemDetails = {},
  detailsLoading = {},
  loading = false,
  searchTerm = '',
  itemHeight = 80,
  containerHeight = 800,
  bufferSize = 15,
  expandable = false,
  renderExpandedContent,
  emptyMessage = 'No data found',
  loadingMessage = 'Loading...',
  className = ''
}, ref) => {
  const { theme } = useTheme();
  const [scrollTop, setScrollTop] = useState(0);
  const internalContainerRef = useRef(null);
  const scrollPositionRef = useRef(0);
  
  // Use forwarded ref or internal ref
  const containerRef = ref || internalContainerRef;
  
  // Preserve scroll position during re-renders
  const preserveScrollPosition = useCallback(() => {
    if (containerRef.current && scrollPositionRef.current !== scrollTop) {
      containerRef.current.scrollTop = scrollPositionRef.current;
    }
  }, [scrollTop]);
  
  // Update scroll position ref when scroll changes
  const handleScroll = useCallback((e) => {
    const newScrollTop = e.target.scrollTop;
    scrollPositionRef.current = newScrollTop;
    setScrollTop(newScrollTop);
    
    // Call external onScroll handler if provided
    if (onScroll) {
      onScroll(e);
    }
  }, [onScroll, containerRef]);
  
  // Preserve scroll position after data changes
  useEffect(() => {
    preserveScrollPosition();
  }, [data, preserveScrollPosition]);
  
  // Calculate visible range with stable dependencies
  const visibleRange = useMemo(() => {
    const currentScrollTop = scrollPositionRef.current;
    const start = Math.max(0, Math.floor(currentScrollTop / itemHeight) - bufferSize);
    const end = Math.min(
      data.length,
      start + Math.ceil(containerHeight / itemHeight) + bufferSize * 2
    );
    return { start, end };
  }, [data.length, containerHeight, itemHeight, bufferSize]);
  
  // Get visible items
  const visibleItems = useMemo(() => {
    return data.slice(visibleRange.start, visibleRange.end);
  }, [data, visibleRange]);
  
  // Render cell content based on column configuration
  const renderCell = (item, column, index) => {
    const value = item[column.key];
    
    if (column.render) {
      return column.render(value, item, index, {
        expandedItems,
        onToggleExpand,
        searchTerm
      });
    }
    
    if (column.type === 'boolean') {
      return (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
          value 
            ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' 
            : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
        }`}>
          {value ? 'Yes' : 'No'}
        </span>
      );
    }
    
    if (column.type === 'badge') {
      return (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
          column.badgeClass?.(value) || 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
        }`}>
          {column.badgeText?.(value) || value}
        </span>
      );
    }
    
    if (column.type === 'image') {
      return value ? (
        <img 
          src={value} 
          alt={item?.name || item?.title || 'Image'}
          className="w-10 h-10 rounded-lg object-cover border border-gray-200 dark:border-gray-600"
          loading="lazy"
        />
      ) : (
        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center">
          <span className="text-white text-xs font-bold">
            {(item?.name || item?.title || '').charAt(0).toUpperCase()}
          </span>
        </div>
      );
    }
    
    if (column.type === 'actions') {
      return (
        <div className="flex items-center justify-center space-x-1">
          {(onViewDetails || (expandable && onToggleExpand)) && (
            <button
              onClick={() => {
                // Only call onViewDetails since it handles the expansion logic
                if (onViewDetails) {
                  onViewDetails(item);
                } else if (expandable && onToggleExpand) {
                  // Fallback to onToggleExpand if onViewDetails is not provided
                  onToggleExpand(item.id);
                }
              }}
              className={`p-2 rounded-lg transition-all duration-200 ${
                expandedItems[item.id] 
                  ? 'text-blue-600 hover:text-blue-800 hover:bg-blue-100 dark:text-blue-400 dark:hover:text-blue-300 dark:hover:bg-blue-900' 
                  : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:text-gray-500 dark:hover:text-gray-300 dark:hover:bg-gray-700'
              }`}
              title={expandedItems[item.id] ? 'Hide Details' : 'Show Details'}
            >
              {expandedItems[item.id] ? (
                <EyeOff className="w-4 h-4" />
              ) : (
                <Eye className="w-4 h-4" />
              )}
            </button>
          )}
          {onEdit && (
            <button
              onClick={() => onEdit(item)}
              className="text-green-600 hover:text-green-800 hover:bg-green-100 dark:text-green-400 dark:hover:text-green-300 dark:hover:bg-green-900 p-2 rounded-lg transition-all duration-200"
              title={column.editTitle || 'Edit'}
            >
              {column.editIcon || <Edit2 className="w-4 h-4" />}
            </button>
          )}
          {onDelete && (
            <button
              onClick={() => onDelete(item)}
              className="text-red-600 hover:text-red-800 hover:bg-red-100 dark:text-red-400 dark:hover:text-red-300 dark:hover:bg-red-900 p-2 rounded-lg transition-all duration-200"
              title={column.deleteTitle || 'Delete'}
            >
              {column.deleteIcon || <Trash2 className="w-4 h-4" />}
            </button>
          )}
          {onCustomAction && column.customActions?.map((action, idx) => (
            <button
              key={idx}
              onClick={() => onCustomAction(action.key, item)}
              className={`${action.className} p-2 rounded-lg transition-all duration-200`}
              title={action.title}
            >
              {action.icon}
            </button>
          ))}
        </div>
      );
    }
    
    // Default text rendering
    return (
      <div className="text-sm text-gray-900 dark:text-gray-100">
        {column.truncate ? (
          <span className="block max-w-xs truncate">{value || '-'}</span>
        ) : (
          value || '-'
        )}
        {searchTerm && column.highlightSearch && value?.toString().toLowerCase().includes(searchTerm.toLowerCase()) && (
          <span className="ml-2 text-xs text-blue-600 dark:text-blue-400 font-medium">
            (matched)
          </span>
        )}
      </div>
    );
  };
  
  // Render row
  const renderRow = (item, index) => {
    const actualIndex = visibleRange.start + index;
    const isExpanded = expandedItems[item.id];
    const isLoadingDetails = detailsLoading[item.id];
    const details = itemDetails[item.id];
    
    return (
      <React.Fragment key={item.id}>
        {/* Main Row */}
        <tr 
          className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
          style={{ height: itemHeight }}
        >
          {columns.map((column, colIndex) => (
            <td 
              key={colIndex}
              className={`px-6 py-4 whitespace-nowrap ${
                column.align === 'center' ? 'text-center' : 
                column.align === 'right' ? 'text-right' : 'text-left'
              }`}
              style={{ 
                width: column.width,
                minWidth: column.minWidth || 'auto'
              }}
            >
              {renderCell(item, column, actualIndex)}
            </td>
          ))}
        </tr>
        
        {/* Expanded Content Row */}
        {expandable && isExpanded && (
          <tr className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border-b-2 border-blue-200 dark:border-blue-700">
            <td colSpan={columns.length} className="px-6 py-6">
              {isLoadingDetails ? (
                <div className="flex items-center justify-center py-12">
                  <div className="flex flex-col items-center">
                    <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mb-3"></div>
                    <span className="text-gray-600 dark:text-gray-300 font-medium">Loading details...</span>
                  </div>
                </div>
              ) : renderExpandedContent ? (
                renderExpandedContent(item, details)
              ) : details ? (
                <div className="space-y-4">
                  <h4 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3">
                    {item.name || item.title || item.badgeName} Details
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {Object.entries(details).map(([key, value]) => {
                      if (typeof value === 'object' && value !== null) return null;
                      return (
                        <div key={key} className="bg-white dark:bg-gray-800 p-3 rounded-lg border border-gray-200 dark:border-gray-700">
                          <h5 className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">
                            {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                          </h5>
                          <p className="text-sm text-gray-900 dark:text-gray-100">{value}</p>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ) : (
                <div className="text-center text-gray-500 dark:text-gray-400 py-8">
                  <div className="p-3 bg-red-100 dark:bg-red-900/30 rounded-full inline-block mb-3">
                    <AlertCircle className="w-6 h-6 text-red-600 dark:text-red-400" />
                  </div>
                  <p className="font-medium">Failed to load details.</p>
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
          <span className="text-gray-600 dark:text-gray-300 font-medium">{loadingMessage}</span>
        </div>
      </div>
    );
  }
  
  if (data.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="p-3 bg-gray-100 dark:bg-gray-800 rounded-full inline-block mb-3">
          <Database className="w-8 h-8 text-gray-400 dark:text-gray-500" />
        </div>
        <p className="text-gray-600 dark:text-gray-300 font-medium">{emptyMessage}</p>
      </div>
    );
  }
  
  return (
    <div className={`bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden ${className} ${theme === 'dark' ? 'dark' : ''}`}>
      {/* Fixed Header */}
      <div className="bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 overflow-x-auto">
        <table className="w-full" style={{ tableLayout: 'fixed' }}>
          <colgroup>
            {columns.map((column, index) => (
              <col 
                key={index}
                style={{ 
                  width: column.width,
                  minWidth: column.minWidth || 'auto'
                }}
              />
            ))}
          </colgroup>
          <thead>
            <tr>
              {columns.map((column, index) => (
                <th 
                  key={index}
                  className={`px-6 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider ${
                    column.align === 'center' ? 'text-center' : 
                    column.align === 'right' ? 'text-right' : 'text-left'
                  }`}
                  style={{ 
                    width: column.width,
                    minWidth: column.minWidth || 'auto'
                  }}
                >
                  {column.title}
                </th>
              ))}
            </tr>
          </thead>
        </table>
      </div>
      
      {/* Scrollable Body */}
      <div 
        ref={containerRef}
        onScroll={handleScroll}
        style={{ height: containerHeight - 44, overflow: 'auto' }}
        className="relative"
      >
        {/* Spacer for virtual scrolling */}
        <div style={{ height: data.length * itemHeight, position: 'relative' }}>
          {/* Visible items */}
          <div 
            style={{ 
              position: 'absolute', 
              top: visibleRange.start * itemHeight, 
              left: 0, 
              right: 0 
            }}
          >
            <table className="w-full divide-y divide-gray-200 dark:divide-gray-700" style={{ tableLayout: 'fixed' }}>
              <colgroup>
                {columns.map((column, index) => (
                  <col 
                    key={index}
                    style={{ 
                      width: column.width,
                      minWidth: column.minWidth || 'auto'
                    }}
                  />
                ))}
              </colgroup>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {visibleItems.map((item, index) => renderRow(item, index))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
});

UniversalVirtualizedTable.displayName = 'UniversalVirtualizedTable';

export default UniversalVirtualizedTable;
