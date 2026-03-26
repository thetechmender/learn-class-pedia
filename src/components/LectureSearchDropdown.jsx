import React, { useState, useEffect, useMemo } from 'react';
import { Search, BookOpen, Tag, Star } from 'lucide-react';

const LectureSearchDropdown = ({
  lectures = [],
  value,
  onChange,
  placeholder = "Search and select lectures...",
  loading = false,
  error = "",
  disabled = false,
  multiple = false,
  maxSelections = 10,
  onSearch // New prop for search functionality
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredLectures, setFilteredLectures] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);

  // Handle search with debouncing
  useEffect(() => {
    if (onSearch && searchTerm.trim()) {
      setSearchLoading(true);
      const timeoutId = setTimeout(() => {
        onSearch(searchTerm)
          .then(results => {
            // Combine search results with selected lectures that aren't in results
            const searchResults = results || [];
            const selectedIds = selectedLectures.map(s => s.id);
            const selectedNotInResults = selectedLectures.filter(
              selected => !searchResults.some(result => result.id === selected.id)
            );
            
            setFilteredLectures([...selectedNotInResults, ...searchResults]);
          })
          .catch(err => {
            console.error('Search failed:', err);
            // On search error, show selected lectures
            setFilteredLectures(selectedLectures);
          })
          .finally(() => {
            setSearchLoading(false);
          });
      }, 300); // 300ms debounce

      return () => clearTimeout(timeoutId);
    } else {
      // If no search term, use all lectures
      setFilteredLectures(lectures);
      setSearchLoading(false);
    }
  }, [searchTerm, lectures, onSearch, selectedLectures]);

  // Get selected lecture(s)
  const selectedLectures = useMemo(() => {
    if (!value) return [];
    if (multiple) {
      return Array.isArray(value) ? value : [value];
    }
    return [value];
  }, [value, multiple]);

  // Handle lecture selection
  const handleSelectLecture = (lecture) => {
    if (multiple) {
      const currentSelections = Array.isArray(value) ? value : [];
      let newSelections;
      
      if (currentSelections.some(selected => selected.id === lecture.id)) {
        // Remove lecture if already selected
        newSelections = currentSelections.filter(selected => selected.id !== lecture.id);
      } else if (currentSelections.length < maxSelections) {
        // Add lecture if under max limit
        newSelections = [...currentSelections, lecture];
      } else {
        // Don't add if over limit
        return;
      }
      
      onChange(newSelections);
    } else {
      // Single selection
      onChange(lecture);
      setIsOpen(false);
      setSearchTerm('');
    }
  };

  // Remove selected lecture (for multiple selection)
  const handleRemoveLecture = (lectureId) => {
    if (multiple) {
      const currentSelections = Array.isArray(value) ? value : [];
      const newSelections = currentSelections.filter(selected => selected.id !== lectureId);
      onChange(newSelections);
      // Don't clear search term when removing individual selections
    }
  };

  // Clear all selections
  const handleClearAll = () => {
    if (multiple) {
      onChange([]);
    } else {
      onChange(null);
    }
    setSearchTerm('');
  };

  // Get display text for selected lectures
  const getSelectedDisplayText = () => {
    if (multiple) {
      const count = selectedLectures.length;
      return count === 0 ? placeholder : `${count} lecture${count !== 1 ? 's' : ''} selected`;
    } else {
      const selected = selectedLectures[0];
      return selected ? selected.displayName : placeholder;
    }
  };

  return (
    <div className="relative">
      {/* Selected Display / Search Input */}
      <div className="relative">
        <div 
          className={`w-full px-4 py-3 border rounded-lg bg-white cursor-pointer transition-colors ${
            error ? 'border-red-500' : 'border-gray-300'
          } ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:border-gray-400'} ${
            isOpen ? 'ring-2 ring-blue-500 border-blue-500' : ''
          }`}
          onClick={() => !disabled && setIsOpen(!isOpen)}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center flex-1 min-w-0">
              <Search className="w-4 h-4 text-gray-400 mr-2 flex-shrink-0" />
              <span className={`truncate ${selectedLectures.length === 0 ? 'text-gray-500' : 'text-gray-900'}`}>
                {getSelectedDisplayText()}
              </span>
            </div>
            
            {(selectedLectures.length > 0 || searchTerm) && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleClearAll();
                }}
                className="ml-2 text-gray-400 hover:text-gray-600"
              >
                ×
              </button>
            )}
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <p className="mt-1 text-sm text-red-600">{error}</p>
        )}
      </div>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-96 overflow-hidden">
          {/* Search Input */}
          <div className="p-3 border-b border-gray-200">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search lectures..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                autoFocus
              />
            </div>
          </div>

          {/* Loading State */}
          {loading || searchLoading ? (
            <div className="p-4 text-center text-gray-500">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto mb-2"></div>
              {searchLoading ? 'Searching lectures...' : 'Loading lectures...'}
            </div>
          ) : (
            <>
              {/* No Results */}
              {filteredLectures.length === 0 && (
                <div className="p-4 text-center text-gray-500">
                  <BookOpen className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                  {searchTerm ? 'No lectures found matching your search.' : 'No lectures available.'}
                </div>
              )}

              {/* Lecture List */}
              {filteredLectures.length > 0 && (
                <div className="max-h-64 overflow-y-auto">
                  {filteredLectures.map((lecture) => {
                    const isSelected = selectedLectures.some(selected => selected.id === lecture.id);
                    
                    return (
                      <div
                        key={lecture.id}
                        onClick={() => handleSelectLecture(lecture)}
                        className={`p-3 border-b border-gray-100 cursor-pointer transition-colors ${
                          isSelected ? 'bg-blue-50 border-blue-200' : 'hover:bg-gray-50'
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1 min-w-0">
                            {/* Lecture Name */}
                            <div className="flex items-center mb-1">
                              <BookOpen className="w-4 h-4 text-blue-600 mr-2 flex-shrink-0" />
                              <h4 className="text-sm font-medium text-gray-900 truncate">
                                {lecture.lmsLectureName}
                              </h4>
                            </div>

                            {/* Course/Module/Subject Hierarchy */}
                            <div className="text-xs text-gray-600 mb-2 space-y-1">
                              <div className="flex items-center">
                                <span className="font-medium">Course:</span>
                                <span className="ml-1 truncate">{lecture.lmsCourseName}</span>
                              </div>
                              <div className="flex items-center">
                                <span className="font-medium">Module:</span>
                                <span className="ml-1 truncate">{lecture.lmsModuleName}</span>
                              </div>
                              <div className="flex items-center">
                                <span className="font-medium">Subject:</span>
                                <span className="ml-1 truncate">{lecture.lmsSubjectName}</span>
                              </div>
                            </div>

                            {/* Tags */}
                            {lecture.tags && lecture.tags.length > 0 && (
                              <div className="flex flex-wrap gap-1 mb-2">
                                {lecture.tags.slice(0, 3).map((tag, index) => (
                                  <span
                                    key={index}
                                    className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-gray-100 text-gray-700"
                                  >
                                    <Tag className="w-3 h-3 mr-1" />
                                    {tag}
                                  </span>
                                ))}
                                {lecture.tags.length > 3 && (
                                  <span className="text-xs text-gray-500">
                                    +{lecture.tags.length - 3} more
                                  </span>
                                )}
                              </div>
                            )}

                            {/* Difficulty Level */}
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-3 text-xs text-gray-500">
                                {lecture.lectureLevelDifficulty && (
                                  <div className="flex items-center">
                                    <Star className="w-3 h-3 mr-1" />
                                    <span>Lecture: {lecture.lectureLevelDifficulty}</span>
                                  </div>
                                )}
                                {lecture.subjectLevelDifficulty && (
                                  <div className="flex items-center">
                                    <Star className="w-3 h-3 mr-1" />
                                    <span>Subject: {lecture.subjectLevelDifficulty}</span>
                                  </div>
                                )}
                              </div>
                              
                              {/* Selection Indicator */}
                              {isSelected && (
                                <div className="text-blue-600">
                                  <div className="w-5 h-5 rounded-full bg-blue-600 flex items-center justify-center">
                                    <span className="text-white text-xs">✓</span>
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </>
          )}

          {/* Multiple Selection Info */}
          {multiple && selectedLectures.length > 0 && (
            <div className="p-3 bg-gray-50 border-t border-gray-200">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">
                  {selectedLectures.length} of {maxSelections} selected
                </span>
                {selectedLectures.length > 0 && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleClearAll();
                    }}
                    className="text-blue-600 hover:text-blue-700"
                  >
                    Clear all
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Click outside to close */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
};

export default LectureSearchDropdown;
