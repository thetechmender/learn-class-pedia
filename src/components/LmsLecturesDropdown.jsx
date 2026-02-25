import { useState, useEffect, useRef } from 'react';
import { Search, Loader2, BookOpen } from 'lucide-react';
import lmsLecturesService from '../services/lmsLecturesService';

const LmsLecturesDropdown = ({ 
  onLectureSelect, 
  selectedLectures = [], 
  disabled = false,
  placeholder = "Search and select LMS lectures..."
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [lectures, setLectures] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const searchLectures = async () => {
      if (searchTerm.length < 2) {
        setLectures([]);
        return;
      }

      setLoading(true);
      setError('');

      try {
        const response = await lmsLecturesService.searchLmsLectures({
          search: searchTerm,
          page: 1,
          pageSize: 50
        });
        
        // Filter out already selected lectures by lmscourseMappingId
        const availableLectures = response.filter(lecture => {
          const lectureMapId = lecture.lmscourseMappingId || lecture.id;
          return !selectedLectures.some(selected => {
            const selectedMapId = selected.lmscourseMappingId || selected.id;
            return selectedMapId === lectureMapId;
          });
        });
        
        setLectures(availableLectures);
      } catch (err) {
        setError('Failed to fetch lectures');
        console.error('Error fetching LMS lectures:', err);
      } finally {
        setLoading(false);
      }
    };

    const timeoutId = setTimeout(searchLectures, 300);
    return () => clearTimeout(timeoutId);
  }, [searchTerm, selectedLectures]);

  const handleLectureClick = (lecture) => {
    onLectureSelect(lecture);
    setSearchTerm('');
    setLectures([]);
    setIsOpen(false);
  };

  const getLectureDisplayName = (lecture) => {
    return (
      lecture.title ||
      lecture.displayName ||
      lecture.lmsLectureName ||
      `${lecture.lmsCourseName || ''}${lecture.lmsCourseName ? ' - ' : ''}${lecture.lmsLectureName || ''}`.trim()
    );
  };

  return (
    <div ref={dropdownRef} className="relative">
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          {loading ? (
            <Loader2 className="h-4 w-4 text-gray-400 animate-spin" />
          ) : (
            <Search className="h-4 w-4 text-gray-400" />
          )}
        </div>
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onFocus={() => setIsOpen(true)}
          placeholder={placeholder}
          disabled={disabled}
          className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
            disabled ? 'bg-gray-100 cursor-not-allowed' : 'bg-white'
          } ${error ? 'border-red-500' : 'border-gray-300'}`}
        />
      </div>

      {error && (
        <p className="mt-1 text-sm text-red-600">{error}</p>
      )}

      {isOpen && (searchTerm.length >= 2 || lectures.length > 0) && (
        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
          {loading && (
            <div className="flex items-center justify-center py-4">
              <Loader2 className="h-6 w-6 text-blue-600 animate-spin" />
              <span className="ml-2 text-gray-600">Searching...</span>
            </div>
          )}

          {!loading && lectures.length === 0 && searchTerm.length >= 2 && (
            <div className="py-4 px-4 text-center text-gray-500">
              <BookOpen className="h-8 w-8 mx-auto mb-2 text-gray-300" />
              <p>No lectures found</p>
            </div>
          )}

          {!loading && lectures.length > 0 && (
            <div className="py-1">
              {lectures.map((lecture) => (
                <div
                  key={lecture.lmscourseMappingId || lecture.id}
                  onClick={() => handleLectureClick(lecture)}
                  className="px-4 py-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0"
                >
                  <div className="flex items-start space-x-3">
                    <BookOpen className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {getLectureDisplayName(lecture)}
                      </p>
                      {lecture.source && (
                        <div className="mt-1 text-xs text-gray-500">
                          <p>{lecture.source}</p>
                        </div>
                      )}

                      {(lecture.lmsCourseName || lecture.lmsModuleName || lecture.lmsSubjectName) && (
                        <div className="mt-1 text-xs text-gray-500 space-y-1">
                          {lecture.lmsCourseName && <p>Course: {lecture.lmsCourseName}</p>}
                          {lecture.lmsModuleName && <p>Module: {lecture.lmsModuleName}</p>}
                          {lecture.lmsSubjectName && <p>Subject: {lecture.lmsSubjectName}</p>}
                        </div>
                      )}
                      {lecture.tags && lecture.tags.length > 0 && (
                        <div className="mt-2 flex flex-wrap gap-1">
                          {lecture.tags.slice(0, 3).map((tag, index) => (
                            <span
                              key={index}
                              className="inline-block px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded"
                            >
                              {tag}
                            </span>
                          ))}
                          {lecture.tags.length > 3 && (
                            <span className="inline-block px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded">
                              +{lecture.tags.length - 3}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default LmsLecturesDropdown;
