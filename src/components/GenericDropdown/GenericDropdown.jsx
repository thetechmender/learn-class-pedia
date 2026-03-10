import React from 'react';
import { ChevronDown } from 'lucide-react';

const GenericDropdown = ({
  value,
  onChange,
  options = [],
  placeholder = 'Select an option',
  disabled = false,
  loading = false,
  className = '',
  labelKey = 'title',
  valueKey = 'id',
  showEmptyOption = true,
  emptyOptionText = 'All',
  ...props
}) => {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled || loading}
        className={`w-full px-4 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition-all duration-200 appearance-none cursor-pointer ${className}`}
        {...props}
      >
        {showEmptyOption && (
          <option value="">{emptyOptionText}</option>
        )}
        {options.map((option) => (
          <option key={option[valueKey]} value={option[valueKey]}>
            {option[labelKey]}
          </option>
        ))}
      </select>
      
      {/* Custom dropdown arrow */}
      <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
        {loading ? (
          <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        ) : (
          <ChevronDown className="w-4 h-4 text-gray-400" />
        )}
      </div>
    </div>
  );
};

export default GenericDropdown;
