import React, { useState, useEffect, useRef, useMemo } from 'react';
import { ChevronDown, ChevronRight, Search } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

const CategoryDropdown = ({
  categories = [],
  value = null,
  onChange,
  placeholder = 'Select category...',
  showAllOption = false,
  showRootOnlyOption = false,
  excludeId = null,
  className = '',
  disabled = false,
  allowClear = true
}) => {
  const { theme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedCategories, setExpandedCategories] = useState(new Set());
  const dropdownRef = useRef(null);

  // Filter categories based on search term
  const filteredCategories = useMemo(() => {
    if (!searchTerm) return categories;
    
    const lowerSearchTerm = searchTerm.toLowerCase();
    return categories.filter(category => 
      category.name?.toLowerCase().includes(lowerSearchTerm) ||
      category.slug?.toLowerCase().includes(lowerSearchTerm)
    );
  }, [categories, searchTerm]);

  // Build hierarchical tree structure
  const categoryTree = useMemo(() => {
    if (!categories || !Array.isArray(categories)) return [];
    
    const categoryMap = new Map();
    const rootCategories = [];

    // Create map of all categories
    filteredCategories.forEach(category => {
      if (excludeId && category.id === excludeId) return;
      
      categoryMap.set(category.id, {
        ...category,
        children: []
      });
    });

    // Build tree structure
    filteredCategories.forEach(category => {
      if (excludeId && category.id === excludeId) return;
      
      const categoryNode = categoryMap.get(category.id);
      if (category.parentCategoryId && category.parentCategoryId !== 0) {
        const parent = categoryMap.get(category.parentCategoryId);
        if (parent) {
          parent.children.push(categoryNode);
        }
      } else {
        rootCategories.push(categoryNode);
      }
    });

    // If no root categories found (all have parents), find categories that are not children
    if (rootCategories.length === 0) {
      const allCategoryIds = new Set(filteredCategories.map(cat => cat.id));
      const allParentIds = new Set(filteredCategories.map(cat => cat.parentCategoryId).filter(id => id && id !== 0));
      const rootCategoryIds = [...allCategoryIds].filter(id => !allParentIds.has(id));
      rootCategories.push(...filteredCategories.filter(cat => rootCategoryIds.includes(cat.id)));
    }

    // Sort categories and their children
    const sortCategories = (cats) => {
      if (!cats || !Array.isArray(cats)) return [];
      return cats.sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0))
        .map(cat => ({
          ...cat,
          children: cat.children && Array.isArray(cat.children) && cat.children.length > 0 ? sortCategories(cat.children) : []
        }));
    };

    return sortCategories(rootCategories);
  }, [filteredCategories, excludeId]);

  // Get display name for selected value
  const getSelectedDisplayName = () => {
    if (!value) return placeholder;
    
    if (value === 'all') return 'All Categories';
    if (value === 'root') return 'Root Categories Only';
    
    const selected = categories.find(cat => cat.id === value);
    return selected ? selected.name : placeholder;
  };

  // Toggle category expansion
  const toggleExpansion = (categoryId) => {
    setExpandedCategories(prev => {
      const newSet = new Set(prev);
      if (newSet.has(categoryId)) {
        newSet.delete(categoryId);
      } else {
        newSet.add(categoryId);
      }
      return newSet;
    });
  };

  // Handle category selection
  const handleSelect = (categoryId) => {
    onChange(categoryId);
    setIsOpen(false);
    setSearchTerm('');
  };

  // Handle click outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen, dropdownRef]);

  // Render category tree recursively
  const renderCategoryTree = (categories, level = 0) => {
    if (!categories || !Array.isArray(categories)) return null;
    
    return categories.map(category => {
      const hasChildren = category.children && Array.isArray(category.children) && category.children.length > 0;
      const isExpanded = expandedCategories.has(category.id);
      const isSelected = value === category.id;

      return (
        <div key={category.id}>
          <div
            className={`flex items-center px-3 py-2 cursor-pointer ${
              isSelected 
                ? (theme === 'dark' ? 'bg-blue-900 text-blue-300' : 'bg-blue-50 text-blue-600')
                : (theme === 'dark' ? 'hover:bg-gray-700 text-white' : 'hover:bg-gray-100 text-gray-900')
            }`}
            style={{ paddingLeft: `${level * 20 + 12}px` }}
            onClick={() => handleSelect(category.id)}
          >
            {hasChildren && (
              <button
                className={`mr-2 p-0.5 rounded ${theme === 'dark' ? 'hover:bg-gray-600' : 'hover:bg-gray-200'}`}
                onClick={(e) => {
                  e.stopPropagation();
                  e.preventDefault();
                  toggleExpansion(category.id);
                }}
                type="button"
              >
                {isExpanded ? (
                  <ChevronDown size={14} className={theme === 'dark' ? 'text-gray-400' : 'text-gray-500'} />
                ) : (
                  <ChevronRight size={14} className={theme === 'dark' ? 'text-gray-400' : 'text-gray-500'} />
                )}
              </button>
            )}
            {!hasChildren && <span className="mr-6" />}
            <div className="flex items-center flex-1">
              <span className={`w-2 h-2 rounded-full mr-2 ${
                isSelected ? 'bg-blue-500' : (theme === 'dark' ? 'bg-gray-500' : 'bg-gray-400')
              }`} />
              <div>
                <div className={`font-medium text-sm ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{category.name}</div>
                {category.slug && (
                  <div className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>{category.slug}</div>
                )}
              </div>
            </div>
          </div>
          {hasChildren && isExpanded && (
            <div>
              {renderCategoryTree(category.children, level + 1)}
            </div>
          )}
        </div>
      );
    });
  };

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      {/* Trigger Button */}
      <div
        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent flex items-center justify-between cursor-pointer ${
          disabled 
            ? (theme === 'dark' ? 'bg-gray-700 cursor-not-allowed' : 'bg-gray-100 cursor-not-allowed')
            : (theme === 'dark' 
                ? 'bg-gray-800 border-gray-600 text-white hover:border-gray-500' 
                : 'bg-white border-gray-300 text-gray-900 hover:border-gray-400'
              )
        }`}
        onClick={() => !disabled && setIsOpen(!isOpen)}
      >
        <span className={`flex-1 truncate ${
          value === null || value === '' 
            ? (theme === 'dark' ? 'text-gray-400' : 'text-gray-400') 
            : (theme === 'dark' ? 'text-white' : 'text-gray-900')
        }`}>
          {getSelectedDisplayName()}
        </span>
        <div className="flex items-center space-x-2">
          {allowClear && value && value !== 'all' && value !== 'root' && (
            <button
              className={`${theme === 'dark' ? 'text-gray-400 hover:text-gray-200' : 'text-gray-400 hover:text-gray-600'}`}
              onClick={(e) => {
                e.stopPropagation();
                handleSelect(null);
              }}
            >
              ×
            </button>
          )}
          <ChevronDown 
            size={16} 
            className={`transition-transform ${
              isOpen ? 'rotate-180' : ''
            } ${theme === 'dark' ? 'text-gray-400' : 'text-gray-400'}`} 
          />
        </div>
      </div>

      {/* Dropdown Panel */}
      {isOpen && (
        <div className={`absolute z-50 w-full mt-1 border rounded-lg shadow-lg max-h-80 overflow-hidden ${
          theme === 'dark' ? 'bg-gray-800 border-gray-600' : 'bg-white border-gray-300'
        }`}>
          {/* Search Input */}
          <div className={`p-3 border-b ${theme === 'dark' ? 'border-gray-600' : 'border-gray-200'}`}>
            <div className="relative">
              <Search 
                className={`absolute left-3 top-1/2 transform -translate-y-1/2 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-400'}`} 
                size={16} 
              />
              <input
                type="text"
                placeholder="Search categories..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={`w-full pl-10 pr-3 py-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm ${
                  theme === 'dark' 
                    ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                    : 'bg-white border-gray-200 text-gray-900 placeholder-gray-500'
                }`}
                onClick={(e) => e.stopPropagation()}
              />
            </div>
          </div>

          {/* Category Tree */}
          <div className="overflow-y-auto max-h-60">
            {/* Special Options */}
            {(showAllOption || showRootOnlyOption) && (
              <div>
                {showAllOption && (
                  <div
                    className={`flex items-center px-3 py-2 cursor-pointer ${
                      value === 'all' 
                        ? (theme === 'dark' ? 'bg-blue-900 text-blue-300' : 'bg-blue-50 text-blue-600')
                        : (theme === 'dark' ? 'hover:bg-gray-700 text-white' : 'hover:bg-gray-100 text-gray-900')
                    }`}
                    onClick={() => handleSelect('all')}
                  >
                    <span className={`w-2 h-2 rounded-full mr-2 ${theme === 'dark' ? 'bg-gray-500' : 'bg-gray-400'}`} />
                    <span className={`text-sm ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>All Categories</span>
                  </div>
                )}
                {showRootOnlyOption && (
                  <div
                    className={`flex items-center px-3 py-2 cursor-pointer ${
                      value === 'root' 
                        ? (theme === 'dark' ? 'bg-blue-900 text-blue-300' : 'bg-blue-50 text-blue-600')
                        : (theme === 'dark' ? 'hover:bg-gray-700 text-white' : 'hover:bg-gray-100 text-gray-900')
                    }`}
                    onClick={() => handleSelect('root')}
                  >
                    <span className={`w-2 h-2 rounded-full mr-2 ${theme === 'dark' ? 'bg-gray-500' : 'bg-gray-400'}`} />
                    <span className={`text-sm ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Root Categories Only</span>
                  </div>
                )}
                {(showAllOption || showRootOnlyOption) && (
                  <div className={`border-t my-1 ${theme === 'dark' ? 'border-gray-600' : 'border-gray-200'}`} />
                )}
              </div>
            )}

            {/* Category Tree */}
            {categoryTree.length > 0 ? (
              renderCategoryTree(categoryTree)
            ) : (
              <div className={`px-3 py-8 text-center text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                {searchTerm ? 'No categories found' : 'No categories available'}
              </div>
            )}

            {/* No Parent Option */}
            {value !== null && value !== '' && value !== 'all' && value !== 'root' && (
              <div className={`border-t mt-2 pt-2 ${theme === 'dark' ? 'border-gray-600' : 'border-gray-200'}`}>
                <div
                  className={`flex items-center px-3 py-2 cursor-pointer ${
                    value === 0 
                      ? (theme === 'dark' ? 'bg-blue-900 text-blue-300' : 'bg-blue-50 text-blue-600')
                      : (theme === 'dark' ? 'hover:bg-gray-700 text-white' : 'hover:bg-gray-100 text-gray-900')
                  }`}
                  onClick={() => handleSelect(0)}
                >
                  <span className={`w-2 h-2 rounded-full mr-2 ${theme === 'dark' ? 'bg-gray-500' : 'bg-gray-400'}`} />
                  <span className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>No Parent (Root Category)</span>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default CategoryDropdown;
