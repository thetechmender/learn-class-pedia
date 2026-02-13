import React, { useState, useEffect, useRef, useMemo } from 'react';
import { ChevronDown, Search } from 'lucide-react';

const GenericDropdown = ({
  items = [],
  value = null,
  onChange,
  placeholder = 'Select option...',
  className = '',
  disabled = false,
  allowClear = true,
  displayField = 'name',
  valueField = 'id',
  searchable = true,
  multiple = false,
  onSearch,
  loading = false
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const dropdownRef = useRef(null);

  // Filter items based on search term (only if no onSearch function provided)
  const filteredItems = useMemo(() => {
    if (!searchTerm || !searchable || onSearch) return items; // Don't filter if server-side search is enabled
    
    const lowerSearchTerm = searchTerm.toLowerCase();
    return items.filter(item => 
      item[displayField]?.toLowerCase().includes(lowerSearchTerm) ||
      item.description?.toLowerCase().includes(lowerSearchTerm)
    );
  }, [items, searchTerm, searchable, displayField, onSearch]);

  // Handle search term change
  const handleSearchChange = (e) => {
    const newSearchTerm = e.target.value;
    setSearchTerm(newSearchTerm);
    
    // Call onSearch immediately if provided (server-side search)
    if (onSearch) {
      onSearch(newSearchTerm);
    }
  };

  const getSelectedDisplayName = () => {
    if (multiple) {
      if (!value || value.length === 0) return placeholder;
      
      const selectedItems = items.filter(item => 
        value.includes(item[valueField])
      );
      
      if (selectedItems.length === 0) return placeholder;
      if (selectedItems.length === 1) return selectedItems[0][displayField];
      
      return `${selectedItems.length} items selected`;
    }
    
    if (value === null || value === undefined) return placeholder;

    const selected = items.find(
      item => String(item[valueField]) === String(value)
    );

    return selected ? selected[displayField] : placeholder;
  };


  // Handle item selection
  const handleSelect = (itemValue) => {
    console.log('handleSelect called with:', { itemValue, valueField });
    
    // Ensure itemValue is not undefined
    if (itemValue === undefined || itemValue === null) {
      console.error('itemValue is undefined, skipping selection');
      return;
    }
    
    debugger;
    if (multiple) {
      const currentValue = Array.isArray(value) ? value : [];
      const newValue = currentValue.includes(itemValue)
        ? currentValue.filter(v => v !== itemValue)
        : [...currentValue, itemValue];
      onChange(newValue);
    } else {
      onChange(itemValue);
      setIsOpen(false);
      setSearchTerm('');
    }
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

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      {/* Trigger Button */}
      <div
        className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white flex items-center justify-between cursor-pointer ${
          disabled ? 'bg-gray-100 cursor-not-allowed' : 'hover:border-gray-400'
        }`}
        onClick={() => !disabled && setIsOpen(!isOpen)}
      >
        <span className={`flex-1 truncate ${
          (multiple && (!value || value.length === 0)) || (!multiple && (value === null || value === '')) ? 'text-gray-400' : 'text-gray-900'
        }`}>
          {getSelectedDisplayName()}
        </span>
        <div className="flex items-center space-x-2">
          {allowClear && ((multiple && value && value.length > 0) || (!multiple && value)) && (
            <button
              className="text-gray-400 hover:text-gray-600"
              onClick={(e) => {
                e.stopPropagation();
                handleSelect(multiple ? [] : null);
              }}
            >
              ×
            </button>
          )}
          <ChevronDown 
            size={16} 
            className={`text-gray-400 transition-transform ${
              isOpen ? 'rotate-180' : ''
            }`} 
          />
        </div>
      </div>

      {/* Dropdown Panel */}
      {isOpen && (
        <div className="absolute z-[9999] w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-80 overflow-hidden">
          {/* Search Input */}
          {searchable && (
            <div className="p-3 border-b border-gray-200">
              <div className="relative">
                <Search 
                  className={`absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 ${loading ? 'animate-spin' : ''}`}
                  size={16} 
                />
                <input
                  type="text"
                  placeholder={`Search ${placeholder.toLowerCase()}...`}
                  value={searchTerm}
                  onChange={handleSearchChange}
                  className="w-full pl-10 pr-3 py-2 border border-gray-200 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                  onClick={(e) => e.stopPropagation()}
                />
                {loading && (
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                    <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Items List */}
          <div className="overflow-y-auto max-h-60">
            {filteredItems.length > 0 ? (
              filteredItems.map((item, index) => {
                console.log(`Rendering item ${index}:`, item);
                console.log('valueField:', valueField);
                console.log('item[valueField]:', item[valueField]);
                
                // Handle different field access patterns
                const itemValue = item[valueField] || item.courseId || item.id;
                console.log('Resolved itemValue:', itemValue);
                
                const isSelected = multiple 
                  ? (Array.isArray(value) && value.includes(itemValue))
                  : (value === itemValue);
                
                return (
                  <div
                    key={itemValue || index}
                    className={`flex items-center px-3 py-2 hover:bg-gray-100 cursor-pointer ${
                      isSelected ? 'bg-blue-50 text-blue-600' : ''
                    }`}
                    onClick={() => {
                      console.log('Clicking item:', item, 'valueField:', valueField, 'itemValue:', itemValue);
                      handleSelect(itemValue);
                    }}
                  >
                    <span className={`w-2 h-2 rounded-full mr-2 ${
                      isSelected ? 'bg-blue-500' : 'bg-gray-400'
                    }`} />
                    <div className="flex-1">
                      <div className="font-medium text-sm">{item[displayField]}</div>
                      {item?.description ? (
                        <div className="text-xs text-gray-500">{item.description}</div>
                      ) :  <div className="text-xs text-gray-500">{item.title}</div>}
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="px-3 py-8 text-center text-gray-500 text-sm">
                {searchTerm ? 'No items found' : 'No items available'}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default GenericDropdown;
