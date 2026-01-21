import React, { useState, useEffect, useRef, useMemo } from 'react';
import { ChevronDown, Search, Check, X } from 'lucide-react';

const MultiSelectDropdown = ({
  items = [],
  values = [],
  onChange,
  placeholder = 'Select options...',
  className = '',
  disabled = false,
  displayField = 'name',
  valueField = 'id',
  searchable = true
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const dropdownRef = useRef(null);

  // Filter items based on search term
  const filteredItems = useMemo(() => {
    if (!searchTerm || !searchable) return items;
    
    const lowerSearchTerm = searchTerm.toLowerCase();
    return items.filter(item => 
      item[displayField]?.toLowerCase().includes(lowerSearchTerm) ||
      item.description?.toLowerCase().includes(lowerSearchTerm)
    );
  }, [items, searchTerm, searchable, displayField]);

  // Check if an item is selected
  const isItemSelected = (itemValue) => {
    return values.includes(itemValue);
  };

  // Handle item selection/deselection
  const handleToggle = (itemValue) => {
    const newValues = isItemSelected(itemValue)
      ? values.filter(v => v !== itemValue)
      : [...values, itemValue];
    onChange(newValues);
  };

  // Handle remove selected item
  const handleRemoveItem = (itemValue, e) => {
    e.stopPropagation();
    const newValues = values.filter(v => v !== itemValue);
    onChange(newValues);
  };

  // Clear all selections
  const handleClearAll = () => {
    onChange([]);
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

  // Get selected items for display
  const selectedItems = useMemo(() => {
    return items.filter(item => values.includes(item[valueField]));
  }, [items, values, valueField]);

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      {/* Trigger Button */}
      <div
        className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white cursor-pointer ${
          disabled ? 'bg-gray-100 cursor-not-allowed' : 'hover:border-gray-400'
        }`}
        onClick={() => !disabled && setIsOpen(!isOpen)}
      >
        {/* Selected Items Display */}
        <div className="flex flex-wrap gap-1 min-h-[24px] items-center">
          {selectedItems.length > 0 ? (
            <>
              {selectedItems.slice(0, 3).map(item => (
                <span
                  key={item[valueField]}
                  className="inline-flex items-center px-2 py-1 rounded text-xs bg-blue-100 text-blue-800"
                >
                  {item[displayField]}
                  <button
                    className="ml-1 hover:text-blue-600"
                    onClick={(e) => handleRemoveItem(item[valueField], e)}
                  >
                    <X size={12} />
                  </button>
                </span>
              ))}
              {selectedItems.length > 3 && (
                <span className="text-xs text-gray-500">
                  +{selectedItems.length - 3} more
                </span>
              )}
            </>
          ) : (
            <span className="text-gray-400 text-sm">{placeholder}</span>
          )}
        </div>
        
        {/* Dropdown Arrow */}
        <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center space-x-2">
          {values.length > 0 && (
            <button
              className="text-gray-400 hover:text-gray-600"
              onClick={(e) => {
                e.stopPropagation();
                handleClearAll();
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
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-80 overflow-hidden">
          {/* Search Input */}
          {searchable && (
            <div className="p-3 border-b border-gray-200">
              <div className="relative">
                <Search 
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" 
                  size={16} 
                />
                <input
                  type="text"
                  placeholder={`Search ${placeholder.toLowerCase()}...`}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-3 py-2 border border-gray-200 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                  onClick={(e) => e.stopPropagation()}
                />
              </div>
            </div>
          )}

          {/* Items List */}
          <div className="overflow-y-auto max-h-60">
            {filteredItems.length > 0 ? (
              filteredItems.map(item => {
                const isSelected = isItemSelected(item[valueField]);
                return (
                  <div
                    key={item[valueField]}
                    className={`flex items-center px-3 py-2 hover:bg-gray-100 cursor-pointer ${
                      isSelected ? 'bg-blue-50 text-blue-600' : ''
                    }`}
                    onClick={() => handleToggle(item[valueField])}
                  >
                    <div className="flex items-center flex-1">
                      <div className={`w-4 h-4 border rounded mr-3 flex items-center justify-center ${
                        isSelected ? 'bg-blue-500 border-blue-500' : 'border-gray-300'
                      }`}>
                        {isSelected && <Check size={12} className="text-white" />}
                      </div>
                      <div className="flex-1">
                        <div className="font-medium text-sm">{item[displayField]}</div>
                        {item.description && (
                          <div className="text-xs text-gray-500">{item.description}</div>
                        )}
                      </div>
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

export default MultiSelectDropdown;
