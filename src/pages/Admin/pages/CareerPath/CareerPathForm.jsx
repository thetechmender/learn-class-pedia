import React, { useState, useEffect } from 'react';
import { adminApiService } from '../../../../services/AdminApi';
import {
  Plus,
  Trash2,
  Save,
  X,
  ChevronDown,
  ChevronUp,
  BookOpen,
  Clock,
  Target,
  Award,
  Filter,
  Search
} from 'lucide-react';
import CategoryDropdown from '../../../../components/CategoryDropdown';
import GenericDropdown from '../../../../components/GenericDropdown';

const CareerPathForm = ({ 
  careerPath = null, 
  onSave, 
  onCancel, 
  loading = false 
}) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    categoryId: '',
    levelId: '',
    durationMinMonths: '',
    durationMaxMonths: '',
    outcome: '',
    certificateCount: '',
    courseIds: []
  });

  const [allCourses, setAllCourses] = useState([]);
  const [levels, setLevels] = useState([]);
  const [categories, setCategories] = useState([]);
  const [filteredCourses, setFilteredCourses] = useState([]);
  const [selectedCourseIds, setSelectedCourseIds] = useState([]);
  const [courseSequences, setCourseSequences] = useState({});
  const [draggedCourse, setDraggedCourse] = useState(null);
  const [dragOverCourse, setDragOverCourse] = useState(null);
  const [sequenceErrors, setSequenceErrors] = useState({});
  const [errors, setErrors] = useState({});
  const [loadingData, setLoadingData] = useState(false);

  useEffect(() => {
    fetchInitialData();
  }, []);

  useEffect(() => {
    if (careerPath && levels.length > 0) {
      console.log('Setting form data for career path:', careerPath);
      setFormData({
        title: careerPath.title || '',
        description: careerPath.description || '',
        categoryId: careerPath.categoryId || '',
        levelId: careerPath.levelId || '',
        durationMinMonths: careerPath.durationMinMonths || '',
        durationMaxMonths: careerPath.durationMaxMonths || '',
        outcome: careerPath.outcome || '',
        certificateCount: careerPath.certificateCount || '',
        courseIds: careerPath.courses?.map(course => course.courseId) || []
      });
      setSelectedCourseIds(careerPath.courses?.map(course => course.courseId) || []);
      
      // Set course sequences from API
      const sequences = {};
      careerPath.courses?.forEach(course => {
        sequences[course.courseId] = course.courseSequence || 0;
      });
      setCourseSequences(sequences);
    }
  }, [careerPath, levels]);

  useEffect(() => {
    console.log('useEffect triggered - categoryId:', formData.categoryId, 'levelId:', formData.levelId);
    if (formData.categoryId && formData.levelId) {
      fetchCoursesByCategoryAndLevel(formData.categoryId, formData.levelId);
    } else {
      console.log('Clearing filtered courses - missing categoryId or levelId');
      setFilteredCourses([]);
    }
  }, [formData.categoryId, formData.levelId]);

  const fetchInitialData = async () => {
    try {
      setLoadingData(true);
      const [levelsRes, categoriesRes] = await Promise.all([
        adminApiService.getCareerPathLevels(),
        adminApiService.getAllCategories()
      ]);
      
      console.log("Categories API response:", categoriesRes);
      console.log("Levels API response:", levelsRes);
      
      // Handle categories response - it has items array
      const categoriesData = categoriesRes?.items || categoriesRes || [];
      console.log("Processed categories:", categoriesData);
      
      // Handle levels response - it's an array directly
      const levelsData = levelsRes || [];
      console.log("Processed levels:", levelsData);
      
      setLevels(levelsData);
      setCategories(categoriesData);
    } catch (error) {
      console.error('Error fetching initial data:', error);
    } finally {
      setLoadingData(false);
    }
  };

  const fetchCoursesByCategoryAndLevel = async (categoryId, levelId) => {
    try {
      console.log(`Fetching courses for categoryId: ${categoryId}, levelId: ${levelId}`);
      const courses = await adminApiService.getCareerPathCoursesByCategoryAndLevel(categoryId, levelId);
      console.log('Courses received:', courses);
      setFilteredCourses(courses || []);
    } catch (error) {
      console.error('Error fetching courses by category and level:', error);
      setFilteredCourses([]);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear error for this field
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  const toggleCourseSelection = (courseId) => {
    setSelectedCourseIds(prev => {
      const newSelection = prev.includes(courseId)
        ? prev.filter(id => id !== courseId)
        : [...prev, courseId];
      
      // Initialize sequence for newly added course
      if (!prev.includes(courseId) && newSelection.includes(courseId)) {
        // Assign the next available sequence number
        const existingSequences = Object.values(courseSequences);
        const nextSequence = existingSequences.length > 0 ? Math.max(...existingSequences) + 1 : 1;
        
        setCourseSequences(prevSequences => ({
          ...prevSequences,
          [courseId]: nextSequence
        }));
      } else if (prev.includes(courseId) && !newSelection.includes(courseId)) {
        // Remove sequence when course is deselected
        setCourseSequences(prevSequences => {
          const newSequences = { ...prevSequences };
          delete newSequences[courseId];
          return newSequences;
        });
        // Clear any sequence errors for this course
        setSequenceErrors(prev => {
          const newErrors = { ...prev };
          delete newErrors[courseId];
          return newErrors;
        });
      }
      
      return newSelection;
    });
  };

  const updateCourseSequence = (courseId, sequence) => {
    const newSequence = parseInt(sequence) || 0;
    
    // Only update the sequence value without validation
    setCourseSequences(prev => ({
      ...prev,
      [courseId]: newSequence
    }));
  };

  // Drag and drop handlers
  const handleDragStart = (courseId) => {
    setDraggedCourse(courseId);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDragEnter = (courseId) => {
    setDragOverCourse(courseId);
  };

  const handleDragLeave = () => {
    setDragOverCourse(null);
  };

  const handleDrop = (e, targetCourseId) => {
    e.preventDefault();
    setDragOverCourse(null);
    
    if (draggedCourse && draggedCourse !== targetCourseId) {
      reorderCourses(draggedCourse, targetCourseId);
    }
    setDraggedCourse(null);
  };

  const reorderCourses = (draggedCourseId, targetCourseId) => {
    const draggedSequence = courseSequences[draggedCourseId] || 0;
    const targetSequence = courseSequences[targetCourseId] || 0;
    
    // Swap the sequences
    const newSequences = { ...courseSequences };
    newSequences[draggedCourseId] = targetSequence;
    newSequences[targetCourseId] = draggedSequence;
    
    setCourseSequences(newSequences);
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    }
    
    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    }
    
    if (!formData.categoryId) {
      newErrors.categoryId = 'Category is required';
    }
    
    if (!formData.levelId) {
      newErrors.levelId = 'Level is required';
    }
    
    if (!formData.durationMinMonths || formData.durationMinMonths <= 0) {
      newErrors.durationMinMonths = 'Minimum duration must be greater than 0';
    }
    
    if (!formData.durationMaxMonths || formData.durationMaxMonths <= 0) {
      newErrors.durationMaxMonths = 'Maximum duration must be greater than 0';
    }
    
    if (formData.durationMinMonths && formData.durationMaxMonths && 
        parseInt(formData.durationMinMonths) > parseInt(formData.durationMaxMonths)) {
      newErrors.durationMaxMonths = 'Maximum duration must be greater than minimum duration';
    }
    
    if (!formData.outcome.trim()) {
      newErrors.outcome = 'Outcome is required';
    }
    
    // Courses are now optional - remove validation
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    // Create courses array with sequences
    const coursesWithSequences = selectedCourseIds.map(courseId => ({
      courseId: courseId,
      courseSequence: courseSequences[courseId] || 0
    }));
    
    const submitData = {
      title: formData.title,
      description: formData.description,
      categoryId: parseInt(formData.categoryId),
      levelId: parseInt(formData.levelId),
      durationMinMonths: parseInt(formData.durationMinMonths),
      durationMaxMonths: parseInt(formData.durationMaxMonths),
      outcome: formData.outcome,
      certificateCount: formData.certificateCount ? parseInt(formData.certificateCount) : null,
      courses: coursesWithSequences
    };
    
    onSave(submitData);
  };

 
  if (loadingData) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading form data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-xl border border-gray-100">
      {/* Header */}
      <div className="p-6 border-b border-gray-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center">
              <Target className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                {careerPath ? 'Edit Career Path' : 'Create New Career Path'}
              </h2>
              <p className="text-gray-600">
                {careerPath ? 'Update career path information' : 'Define a new learning path for students'}
              </p>
            </div>
          </div>
          <button
            onClick={onCancel}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="p-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Title */}
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              Career Path Title *
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => handleInputChange('title', e.target.value)}
              className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                errors.title ? 'border-red-300 bg-red-50' : 'border-gray-200'
              }`}
              placeholder="e.g., Full Stack Web Development"
            />
            {errors.title && (
              <p className="mt-1 text-sm text-red-600">{errors.title}</p>
            )}
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              Category *
            </label>
            <CategoryDropdown
              categories={categories}
              value={formData.categoryId}
              onChange={(value) => handleInputChange('categoryId', value)}
              placeholder="Select category..."
              className={`w-full ${errors.categoryId ? 'border-red-300 bg-red-50' : ''}`}
            />
            {errors.categoryId && (
              <p className="mt-1 text-sm text-red-600">{errors.categoryId}</p>
            )}
          </div>

          {/* Level */}
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              Career Path Level *
            </label>
            <GenericDropdown
              items={levels.map(level => ({
                id: level.levelId,
                name: level.levelName,
                description: level.levelName
              }))}
              value={formData.levelId}
              onChange={(value) => handleInputChange('levelId', value)}
              placeholder="Select level..."
              className={`w-full ${errors.levelId ? 'border-red-300 bg-red-50' : ''}`}
            />
            {errors.levelId && (
              <p className="mt-1 text-sm text-red-600">{errors.levelId}</p>
            )}
          </div>

          {/* Duration */}
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              Duration Range (Months) *
            </label>
            <div className="flex items-center gap-3">
              <div className="flex-1">
                <input
                  type="number"
                  value={formData.durationMinMonths}
                  onChange={(e) => handleInputChange('durationMinMonths', e.target.value)}
                  className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                    errors.durationMinMonths ? 'border-red-300 bg-red-50' : 'border-gray-200'
                  }`}
                  placeholder="Min months"
                  min="1"
                />
                {errors.durationMinMonths && (
                  <p className="mt-1 text-sm text-red-600">{errors.durationMinMonths}</p>
                )}
              </div>
              <span className="text-gray-500">to</span>
              <div className="flex-1">
                <input
                  type="number"
                  value={formData.durationMaxMonths}
                  onChange={(e) => handleInputChange('durationMaxMonths', e.target.value)}
                  className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                    errors.durationMaxMonths ? 'border-red-300 bg-red-50' : 'border-gray-200'
                  }`}
                  placeholder="Max months"
                  min="1"
                />
                {errors.durationMaxMonths && (
                  <p className="mt-1 text-sm text-red-600">{errors.durationMaxMonths}</p>
                )}
              </div>
            </div>
          </div>

          {/* Outcome */}
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              Learning Outcome *
            </label>
            <textarea
              value={formData.outcome}
              onChange={(e) => handleInputChange('outcome', e.target.value)}
              rows={3}
              className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none ${
                errors.outcome ? 'border-red-300 bg-red-50' : 'border-gray-200'
              }`}
              placeholder="What will students achieve after completing this career path?"
            />
            {errors.outcome && (
              <p className="mt-1 text-sm text-red-600">{errors.outcome}</p>
            )}
          </div>

          {/* Certificate Count */}
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              Certificate Count
            </label>
            <input
              type="number"
              value={formData.certificateCount}
              onChange={(e) => handleInputChange('certificateCount', e.target.value)}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              placeholder="Number of certificates (optional)"
              min="0"
            />
            <p className="mt-1 text-xs text-gray-500">
              Leave empty if no certificates are awarded
            </p>
          </div>
        </div>

        {/* Description */}
        <div className="mb-8">
          <label className="block text-sm font-semibold text-gray-900 mb-2">
            Description *
          </label>
          <textarea
            value={formData.description}
            onChange={(e) => handleInputChange('description', e.target.value)}
            rows={4}
            className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none ${
              errors.description ? 'border-red-300 bg-red-50' : 'border-gray-200'
            }`}
            placeholder="Describe this career path and what makes it valuable..."
          />
          {errors.description && (
            <p className="mt-1 text-sm text-red-600">{errors.description}</p>
          )}
        </div>

        {/* Course Selection Section */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <BookOpen className="w-5 h-5 text-gray-600" />
            <h3 className="text-lg font-semibold text-gray-900">Course Selection (Optional)</h3>
          </div>

          {/* Filter Info */}
          <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-xl">
            <div className="flex items-center gap-2 text-blue-800">
              <Filter className="w-4 h-4" />
              <span className="text-sm font-medium">
                {formData.categoryId && formData.levelId 
                  ? `Showing courses for selected category and level (${filteredCourses.length} courses)`
                  : 'Please select both category and level to filter courses'
                }
              </span>
            </div>
          </div>

          {/* Available Courses */}
          {filteredCourses.length > 0 && (
            <div className="mb-6">
              <h4 className="text-sm font-semibold text-gray-700 mb-3">Available Courses</h4>
              <div className="border border-gray-200 rounded-xl max-h-64 overflow-y-auto">
                <div className="divide-y divide-gray-200">
                  {filteredCourses.map(course => (
                    <div key={course.id} className="p-3 hover:bg-gray-50 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          checked={selectedCourseIds.includes(course.id)}
                          onChange={() => toggleCourseSelection(course.id)}
                          className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                        />
                        <div>
                          <div className="font-medium text-gray-900">{course.title}</div>
                          <div className="text-sm text-gray-500">{course.categoryName}</div>
                        </div>
                      </div>
                      {course.isPaid && (
                        <span className="px-2 py-1 text-xs bg-yellow-100 text-yellow-800 rounded-full">
                          Paid
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Selected Courses */}
          {selectedCourseIds.length > 0 && (
            <div>
              <h4 className="text-sm font-semibold text-gray-700 mb-3">
                Selected Courses ({selectedCourseIds.length})
              </h4>
              <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                <p className="text-xs text-gray-600 mb-3">
                  {selectedCourseIds.length === 1 
                    ? '💡 Only one course selected.'
                    : '🎯 Drag and drop courses to reorder them in the learning path sequence.'
                  }
                </p>
                <div className="space-y-2">
                  {filteredCourses
                    .filter(course => selectedCourseIds.includes(course.id))
                    .sort((a, b) => (courseSequences[a.id] || 0) - (courseSequences[b.id] || 0))
                    .map((course, index) => (
                      <div
                        key={course.id}
                        draggable={selectedCourseIds.length > 1}
                        onDragStart={() => handleDragStart(course.id)}
                        onDragOver={handleDragOver}
                        onDragEnter={() => handleDragEnter(course.id)}
                        onDragLeave={handleDragLeave}
                        onDrop={(e) => handleDrop(e, course.id)}
                        className={`bg-white p-3 rounded-lg border cursor-move transition-all ${
                          dragOverCourse === course.id 
                            ? 'border-blue-400 shadow-lg transform scale-105' 
                            : 'border-green-200'
                        } ${draggedCourse === course.id ? 'opacity-50' : ''}`}
                      >
                        <div className="flex items-center gap-3">
                          <div className="flex items-center gap-2 flex-shrink-0">
                            {selectedCourseIds.length > 1 && (
                              <div className="text-gray-400">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                                </svg>
                              </div>
                            )}
                            <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">
                              {courseSequences[course.id] || index + 1}
                            </div>
                          </div>
                          <div className="flex-1">
                            <div className="font-medium text-gray-900 text-sm break-words">{course.title}</div>
                            <div className="text-xs text-gray-500 break-words">{course.categoryName}</div>
                          </div>
                          <button
                            type="button"
                            onClick={() => toggleCourseSelection(course.id)}
                            className="p-1 text-red-600 hover:bg-red-50 rounded transition-colors flex-shrink-0"
                            title="Remove course"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Form Actions */}
        <div className="flex items-center justify-end gap-3 pt-6 border-t border-gray-100">
          <button
            type="button"
            onClick={onCancel}
            className="px-6 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors font-medium"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 font-medium shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                Saving...
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                {careerPath ? 'Update Career Path' : 'Create Career Path'}
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CareerPathForm;
