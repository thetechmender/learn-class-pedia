import React, { useState, useEffect } from 'react';
import {
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
  Search,
  DollarSign,
  Users,
  Star,
  ChevronRight,
  Upload
} from 'lucide-react';
import GenericDropdown from '../../../../components/GenericDropdown';
import MultiSelectDropdown from '../../../../components/MultiSelectDropdown';
import { useCareerPath } from '../../../../hooks/useCareerPath';
import { adminApiService } from '../../../../services/AdminApi';

const CareerPathForm = ({ 
  careerPath = null, 
  onSave, 
  onCancel, 
  loading = false,
  showToast = () => {} 
}) => {
  const {
    loading: hookLoading,
    error: hookError,
    clearError,
    levels,
    skills,
    careerRoles,
    courseTypes,
    badges,
    initializeDropdownData,
    getCoursesByTypeForLevel,
    createCareerPath,
    updateCareerPath
  } = useCareerPath();
  
  // Add a state to track if initial data is loaded
  const [initialDataLoaded, setInitialDataLoaded] = useState(false);
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    discountedPrice: '',
    durationMinMonths: '',
    durationMaxMonths: '',
    outcome: '',
    certificateCount: '',
    roleId: '',
    levels: [],
    skills: [],
    careerPathBadges: [],
    iconUrl: '',
    iconFile: null
  });
  const [filteredCourses, setFilteredCourses] = useState([]);
  const [selectedSkills, setSelectedSkills] = useState([]);
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedLevelForCourses, setSelectedLevelForCourses] = useState(null);
  const [selectedCourseTypeForLevel, setSelectedCourseTypeForLevel] = useState('');
  const [expandedCourses, setExpandedCourses] = useState({});
  const [searchTerm, setSearchTerm] = useState('');
  const [courseSearchTerm, setCourseSearchTerm] = useState('');
  const [errors, setErrors] = useState({});
  const [draggedCourse, setDraggedCourse] = useState(null);
  const [draggedLevelIndex, setDraggedLevelIndex] = useState(null);
  const [expandedLevels, setExpandedLevels] = useState({});

  // Cache management
  const CACHE_KEY = 'careerPathForm_draft';
  
  useEffect(() => {
    initializeDropdownData();
    // Always clear cache on mount to ensure fresh start
    clearCache();
  }, []);

  useEffect(() => {
    if (careerPath && levels.length > 0 && badges.length > 0) {
      // Map badge names from API to badge IDs for dropdown
      const mappedBadgeIds = careerPath.careerPathBadges?.map(badgeName => {
        const foundBadge = badges.find(b => b.name === badgeName);
        return foundBadge ? foundBadge.id : null;
      }).filter(id => id !== null) || [];
      
      setFormData({
        title: careerPath.title || '',
        description: careerPath.description || '',
        price: careerPath.price || '',
        discountedPrice: careerPath.discountedPrice || '',
        durationMinMonths: careerPath.durationMinMonths || '',
        durationMaxMonths: careerPath.durationMaxMonths || '',
        outcome: careerPath.outcome || '',
        certificateCount: careerPath.certificateCount || '',
        roleId: careerPath.roleId || '',
        levels: careerPath.levels || [],
        skills: careerPath.skills || [],
        careerPathBadges: mappedBadgeIds,
        iconUrl: careerPath.iconUrl || ''
      });
      setSelectedSkills(careerPath.skills?.map(skill => skill.skillId) || []);
      setInitialDataLoaded(true);
    } else if (!careerPath && levels.length > 0 && badges.length > 0) {
      // For new forms, mark as loaded when dropdown data is ready
      setInitialDataLoaded(true);
    }
  }, [careerPath, levels, badges]);

  // Auto-save to cache on form data changes (only for new forms, not editing)
  useEffect(() => {
    if (!careerPath && (formData.title || formData.description || formData.levels.length > 0)) {
      saveToCache();
    }
  }, [formData, currentStep, careerPath]);


  const saveToCache = () => {
    try {
      const cacheData = {
        formData,
        currentStep,
        timestamp: Date.now()
      };
      localStorage.setItem(CACHE_KEY, JSON.stringify(cacheData));
    } catch (error) {
      console.error('Failed to save to cache:', error);
    }
  };

  const clearCache = () => {
    try {
      localStorage.removeItem(CACHE_KEY);
    } catch (error) {
      console.error('Failed to clear cache:', error);
    }
  };

  useEffect(() => {
    if (selectedCourseTypeForLevel && selectedLevelForCourses !== null) {
      const fetchCourses = async () => {
        try {
          const courses = await getCoursesByTypeForLevel(selectedCourseTypeForLevel);
          setFilteredCourses(courses);
        } catch (error) {
          console.error('Failed to fetch courses:', error);
          setFilteredCourses([]);
        }
      };
      fetchCourses();
    } else {
      setFilteredCourses([]);
    }
  }, [selectedCourseTypeForLevel, selectedLevelForCourses, getCoursesByTypeForLevel]);

  const getFilteredCoursesWithSearch = () => {
    let courses = [...filteredCourses];
    
    // Filter by course title search
    if (courseSearchTerm) {
      courses = courses.filter(course => 
        course.title.toLowerCase().includes(courseSearchTerm.toLowerCase())
      );
    }
    
    return courses;
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

  const handleSkillSelection = (skillId, proficiencyLevel) => {
    setFormData(prev => {
      const existingSkillIndex = prev.skills.findIndex(skill => skill.skillId === skillId);
      let newSkills;
      
      if (existingSkillIndex >= 0) {
        if (proficiencyLevel > 0) {
          newSkills = prev.skills.map((skill, index) => 
            index === existingSkillIndex ? { skillId, proficiencyLevel } : skill
          );
        } else {
          newSkills = prev.skills.filter((_, index) => index !== existingSkillIndex);
        }
      } else if (proficiencyLevel > 0) {
        newSkills = [...prev.skills, { skillId, proficiencyLevel }];
      } else {
        newSkills = prev.skills;
      }
      
      return { ...prev, skills: newSkills };
    });
  };

  const getAvailableLevels = () => {
    const selectedLevelIds = formData.levels.map(level => level.levelId);
    return levels.filter(level => !selectedLevelIds.includes(level.levelId));
  };

  const addLevelToPath = (levelId) => {
    const levelData = levels.find(l => l.levelId === levelId);
    if (!levelData) return;
    
    const newLevel = {
      levelId: levelId,
      levelName: levelData.levelName,
      courses: []
    };
    
    setFormData(prev => ({
      ...prev,
      levels: [...prev.levels, newLevel]
    }));
  };

  const removeLevelFromPath = (levelIndex) => {
    setFormData(prev => ({
      ...prev,
      levels: prev.levels.filter((_, i) => i !== levelIndex)
    }));
  };

  const addCourseToSelectedLevel = (courseId) => {
    if (selectedLevelForCourses === null) return;
    
    const level = formData.levels[selectedLevelForCourses];
    const courseExists = level.courses.some(c => c.courseId === courseId);
    
    if (!courseExists) {
      // Find the course details from filteredCourses to get the title
      const courseDetails = filteredCourses.find(c => c.id === courseId);
      const newCourse = {
        courseId: courseId,
        courseSequence: level.courses.length + 1,
        title: courseDetails?.title || `Course ID: ${courseId}`
      };
      
      setFormData(prev => ({
        ...prev,
        levels: prev.levels.map((lvl, index) => 
          index === selectedLevelForCourses 
            ? { ...lvl, courses: [...lvl.courses, newCourse] }
            : lvl
        )
      }));
    }
  };

  const removeCourseFromLevel = (levelIndex, courseIndex) => {
    setFormData(prev => ({
      ...prev,
      levels: prev.levels.map((level, i) => 
        i === levelIndex 
          ? { 
              ...level, 
              courses: level.courses.filter((_, j) => j !== courseIndex)
                .map((course, idx) => ({ ...course, courseSequence: idx + 1 }))
            }
          : level
      )
    }));
  };

  const handleDragStart = (e, levelIndex, courseIndex, course) => {
    setDraggedCourse({ levelIndex, courseIndex, course });
    setDraggedLevelIndex(levelIndex);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/html', e.target.outerHTML);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e, targetLevelIndex, targetCourseIndex) => {
    e.preventDefault();
    
    if (draggedCourse === null || draggedLevelIndex !== targetLevelIndex) {
      return;
    }

    const { levelIndex, courseIndex } = draggedCourse;
    
    if (levelIndex === targetLevelIndex && courseIndex === targetCourseIndex) {
      return;
    }

    setFormData(prev => {
      const newLevels = [...prev.levels];
      const level = { ...newLevels[levelIndex] };
      const courses = [...level.courses];
      
      const [draggedCourseData] = courses.splice(courseIndex, 1);
      courses.splice(targetCourseIndex, 0, draggedCourseData);
      
      const reorderedCourses = courses.map((course, idx) => ({
        ...course,
        courseSequence: idx + 1
      }));
      
      level.courses = reorderedCourses;
      newLevels[levelIndex] = level;
      
      return {
        ...prev,
        levels: newLevels
      };
    });

    setDraggedCourse(null);
    setDraggedLevelIndex(null);
  };

  const handleDragEnd = () => {
    setDraggedCourse(null);
    setDraggedLevelIndex(null);
  };

  const toggleLevelExpansion = (levelIndex) => {
    setExpandedLevels(prev => ({
      ...prev,
      [levelIndex]: !prev[levelIndex]
    }));
  };

  const toggleCourseExpansion = (levelIndex, courseId) => {
    const key = `${levelIndex}-${courseId}`;
    setExpandedCourses(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const moveToNextStep = () => {
    if (currentStep < 4) {
      // Clear previous errors before moving to next step
      setErrors({});
      setCurrentStep(currentStep + 1);
      saveToCache(); // Save step change to cache
    }
  };

  const moveToPreviousStep = () => {
    if (currentStep > 1) {
      // Clear previous errors when moving back
      setErrors({});
      setCurrentStep(currentStep - 1);
      saveToCache(); // Save step change to cache
    }
  };

  const validateCurrentStep = () => {
    const newErrors = {};
    
    console.log('Validating step:', currentStep);
    console.log('Current form data:', formData);
    
    switch (currentStep) {
      case 1:
        if (!formData.title.trim()) {
          newErrors.title = 'Title is required';
          console.log('Title validation failed');
        }
        if (!formData.description.trim()) {
          newErrors.description = 'Description is required';
          console.log('Description validation failed');
        }
        if (!formData.price || formData.price < 0) {
          newErrors.price = 'Price must be greater than or equal to 0';
          console.log('Price validation failed');
        }
        if (!formData.discountedPrice || formData.discountedPrice < 0) {
          newErrors.discountedPrice = 'Discounted price must be greater than or equal to 0';
          console.log('Discounted price validation failed');
        }
        if (formData.price && formData.discountedPrice && parseFloat(formData.discountedPrice) > parseFloat(formData.price)) {
          newErrors.discountedPrice = 'Discounted price cannot be greater than regular price';
          console.log('Discounted price comparison validation failed');
        }
        if (!formData.roleId) {
          newErrors.roleId = 'Role is required';
          console.log('Role validation failed');
        }
        break;
        
      case 2:
        if (formData.levels.length === 0) {
          newErrors.levels = 'At least one level is required';
          console.log('Levels validation failed');
        }
        break;
        
      case 3:
        if (formData.skills.length === 0) {
          newErrors.skills = 'At least one skill is required';
          console.log('Skills validation failed');
        }
        break;
        
      case 4:
        if (!formData.durationMinMonths || formData.durationMinMonths <= 0) {
          newErrors.durationMinMonths = 'Minimum duration must be greater than 0';
          console.log('Duration min validation failed');
        }
        if (!formData.durationMaxMonths || formData.durationMaxMonths <= 0) {
          newErrors.durationMaxMonths = 'Maximum duration must be greater than 0';
          console.log('Duration max validation failed');
        }
        if (formData.durationMinMonths && formData.durationMaxMonths && 
            parseInt(formData.durationMinMonths) > parseInt(formData.durationMaxMonths)) {
          newErrors.durationMaxMonths = 'Maximum duration must be greater than minimum duration';
          console.log('Duration comparison validation failed');
        }
        if (!formData.outcome.trim()) {
          newErrors.outcome = 'Outcome is required';
          console.log('Outcome validation failed');
        }
        break;
    }
    
    console.log('Validation errors:', newErrors);
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    }
    
    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    }
    
    if (!formData.price || formData.price < 0) {
      newErrors.price = 'Price must be greater than or equal to 0';
    }
    
    if (!formData.discountedPrice || formData.discountedPrice < 0) {
      newErrors.discountedPrice = 'Discounted price must be greater than or equal to 0';
    }
    
    if (formData.price && formData.discountedPrice && parseFloat(formData.discountedPrice) > parseFloat(formData.price)) {
      newErrors.discountedPrice = 'Discounted price cannot be greater than regular price';
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
    
    if (!formData.roleId) {
      newErrors.roleId = 'Role is required';
    }
    
    if (formData.levels.length === 0) {
      newErrors.levels = 'At least one level is required';
    }
    
    if (formData.skills.length === 0) {
      newErrors.skills = 'At least one skill is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log('handleSubmit called - this should only happen on form submission');
    
    if (!validateForm()) {
      console.log('Form validation failed');
      return;
    }
    
    console.log('Form validation passed, preparing submission data');
    
    let submitData;
    let isFormData = false;
    
    // Debug: Check if iconFile exists
    console.log('FormData check - iconFile:', formData.iconFile);
    console.log('FormData check - iconFile type:', typeof formData.iconFile);
    
    // If there's a file, use FormData to avoid 415 error
    if (formData.iconFile) {
      console.log('Using FormData for file upload');
      isFormData = true;
      submitData = new FormData();
      
      // Add all fields to FormData
      submitData.append('Title', formData.title);
      submitData.append('Description', formData.description);
      submitData.append('Price', parseFloat(formData.price) || 0);
      submitData.append('DiscountedPrice', parseFloat(formData.discountedPrice) || 0);
      submitData.append('DurationMinMonths', parseInt(formData.durationMinMonths));
      submitData.append('SortOrder', 0);
      submitData.append('DurationMaxMonths', parseInt(formData.durationMaxMonths));
      submitData.append('Outcome', formData.outcome);
      submitData.append('CertificateCount', formData.certificateCount ? parseInt(formData.certificateCount) : 0);
      submitData.append('RoleId', parseInt(formData.roleId));
      
      // Add arrays using only proper form field notation
      const levelsArray = formData.levels.map(level => ({
        levelId: parseInt(level.levelId),
        courses: level.courses.map(course => ({
          courseId: parseInt(course.courseId),
          courseSequence: course.courseSequence || 0
        }))
      }));
      
      const skillsArray = formData.skills.map(skill => ({
        skillId: parseInt(skill.skillId),
        proficiencyLevel: parseInt(skill.proficiencyLevel)
      }));
      
      const badgesArray = formData.careerPathBadges.map(badgeId => parseInt(badgeId));
      
      console.log('Debug - badgesArray:', badgesArray);
      console.log('Debug - badgesArray length:', badgesArray.length);
      
      // Send arrays using proper array notation only
      levelsArray.forEach((level, index) => {
        submitData.append(`Levels[${index}].levelId`, level.levelId);
        level.courses.forEach((course, courseIndex) => {
          submitData.append(`Levels[${index}].courses[${courseIndex}].courseId`, course.courseId);
          submitData.append(`Levels[${index}].courses[${courseIndex}].courseSequence`, course.courseSequence);
        });
      });
      
      skillsArray.forEach((skill, index) => {
        submitData.append(`Skills[${index}].skillId`, skill.skillId);
        submitData.append(`Skills[${index}].proficiencyLevel`, skill.proficiencyLevel);
      });
      
      badgesArray.forEach((badgeId, index) => {
        console.log(`Appending CareerPathBadges[${index}]:`, badgeId);
        submitData.append(`CareerPathBadges[${index}]`, badgeId);
      });
      
      // Don't include CareerPathBadges field at all when empty - only append if badgesArray has items
      
      // Debug: Log all FormData entries
      console.log('FormData contents:');
      for (let [key, value] of submitData.entries()) {
        console.log(`${key}:`, value);
      }
      
      // Add the file
      submitData.append('File', formData.iconFile);
    } else {
      // No file, use regular JSON
      submitData = {
        title: formData.title,
        description: formData.description,
        price: parseFloat(formData.price) || 0,
        discountedPrice: parseFloat(formData.discountedPrice) || 0,
        durationMinMonths: parseInt(formData.durationMinMonths),
        sortOrder: 0,
        durationMaxMonths: parseInt(formData.durationMaxMonths),
        outcome: formData.outcome,
        certificateCount: formData.certificateCount ? parseInt(formData.certificateCount) : 0,
        roleId: parseInt(formData.roleId),
        levels: formData.levels.map(level => ({
          levelId: parseInt(level.levelId),
          courses: level.courses.map(course => ({
            courseId: parseInt(course.courseId),
            courseSequence: course.courseSequence || 0
          }))
        })),
        skills: formData.skills.map(skill => ({
          skillId: parseInt(skill.skillId),
          proficiencyLevel: parseInt(skill.proficiencyLevel)
        })),
        careerPathBadges: formData.careerPathBadges.map(badgeId => parseInt(badgeId))
      };
    }
    
    console.log('Clearing cache and calling onSave');
    clearCache();
    
    // Pass data to parent with flag indicating if it's FormData
    await onSave(submitData, isFormData);
  };

 
  if (hookLoading || !initialDataLoaded) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">{careerPath ? 'Loading career path data...' : 'Loading form data...'}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-xl border border-gray-100">
      {/* Header with Progress */}
      <div className="p-6 border-b border-gray-100">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center">
              <Target className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                {careerPath ? 'Edit Career Path' : 'Create New Career Path'}
              </h2>
              <p className="text-gray-600">
                {careerPath ? 'Update career path information' : 'Build a comprehensive learning path step by step'}
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

        {/* Progress Steps */}
        <div className="flex items-center justify-between">
          {[1, 2, 3, 4].map((step) => (
            <div key={step} className="flex items-center">
              <div className={`flex items-center justify-center w-10 h-10 rounded-full font-semibold text-sm transition-all ${
                currentStep >= step 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-200 text-gray-600'
              }`}>
                {step}
              </div>
              <div className={`ml-3 text-sm font-medium ${
                currentStep >= step ? 'text-blue-600' : 'text-gray-500'
              }`}>
                {step === 1 && 'Basic Info & Details'}
                {step === 2 && 'Levels & Skills'}
                {step === 3 && 'Skills Selection'}
                {step === 4 && 'Additional Details'}
              </div>
              {step < 4 && (
                <div className={`w-16 h-1 mx-4 ${
                  currentStep > step ? 'bg-blue-600' : 'bg-gray-200'
                }`} />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Form Content */}
      <form onSubmit={handleSubmit} className="p-6">
        {/* Step 1: Basic Information */}
        {currentStep === 1 && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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

              {/* Role */}
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Career Role *
                </label>
                <GenericDropdown
                  items={careerRoles.map(role => ({
                    id: role.id,
                    name: role.name,
                    description: role.description || role.name
                  }))}
                  value={formData.roleId}
                  onChange={(value) => handleInputChange('roleId', value)}
                  placeholder="Select career role..."
                  className={`w-full ${errors.roleId ? 'border-red-300 bg-red-50' : ''}`}
                />
                {errors.roleId && (
                  <p className="mt-1 text-sm text-red-600">{errors.roleId}</p>
                )}
              </div>

              {/* Price */}
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Price *
                </label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="number"
                    value={formData.price}
                    onChange={(e) => handleInputChange('price', e.target.value)}
                    className={`w-full pl-10 pr-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                      errors.price ? 'border-red-300 bg-red-50' : 'border-gray-200'
                    }`}
                    placeholder="0.00"
                    min="0"
                    step="0.01"
                  />
                </div>
                {errors.price && (
                  <p className="mt-1 text-sm text-red-600">{errors.price}</p>
                )}
              </div>

              {/* Discounted Price */}
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Discounted Price *
                </label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="number"
                    value={formData.discountedPrice}
                    onChange={(e) => handleInputChange('discountedPrice', e.target.value)}
                    className={`w-full pl-10 pr-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                      errors.discountedPrice ? 'border-red-300 bg-red-50' : 'border-gray-200'
                    }`}
                    placeholder="0.00"
                    min="0"
                    step="0.01"
                  />
                </div>
                {errors.discountedPrice && (
                  <p className="mt-1 text-sm text-red-600">{errors.discountedPrice}</p>
                )}
              </div>
            </div>

            {/* Description */}
            <div>
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

            {/* Icon Upload */}
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                Icon Upload
              </label>
              <div className="flex items-start gap-4">
                {/* Icon Preview */}
                <div className="flex-shrink-0">
                  {formData.iconUrl ? (
                    <div className="relative">
                      <img
                        src={formData.iconUrl}
                        alt="Career path icon"
                        className="w-20 h-20 rounded-xl object-cover border-2 border-gray-200"
                      />
                      <button
                        type="button"
                        onClick={() => handleInputChange('iconUrl', '')}
                        className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ) : (
                    <div className="w-20 h-20 rounded-xl border-2 border-dashed border-gray-300 flex items-center justify-center bg-gray-50">
                      <Award className="w-8 h-8 text-gray-400" />
                    </div>
                  )}
                </div>

                {/* Upload Controls */}
                <div className="flex-1">
                  <div className="relative">
                    <input
                      type="file"
                      id="icon-upload"
                      accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
                      onChange={(e) => {
                        const file = e.target.files[0];
                        if (file) {
                          // Create a temporary preview URL
                          const previewUrl = URL.createObjectURL(file);
                          handleInputChange('iconUrl', previewUrl);
                          // Store the file for upload
                          handleInputChange('iconFile', file);
                        }
                      }}
                      className="hidden"
                    />
                    <label
                      htmlFor="icon-upload"
                      className="inline-flex items-center px-4 py-2 border-2 border-dashed border-blue-300 rounded-xl cursor-pointer hover:border-blue-500 hover:bg-blue-50 transition-all"
                    >
                      <Upload className="w-4 h-4 mr-2 text-blue-600" />
                      <span className="text-sm text-blue-600 font-medium">
                        {formData.iconUrl ? 'Change Icon' : 'Upload Icon'}
                      </span>
                    </label>
                  </div>
                  <p className="mt-2 text-xs text-gray-500">
                    Upload an icon for this career path (JPEG, PNG, GIF, or WebP, max 5MB)
                  </p>
                  {errors.iconUrl && (
                    <p className="mt-1 text-sm text-red-600">{errors.iconUrl}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Career Path Badges */}
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                Career Path Badges
              </label>
              <MultiSelectDropdown
                items={badges}
                values={formData.careerPathBadges}
                onChange={(values) => handleInputChange('careerPathBadges', values)}
                placeholder="Select badges..."
                className="w-full"
                disabled={hookLoading}
              />
              {hookError && (
                <p className="mt-1 text-sm text-red-600">{hookError}</p>
              )}
              <p className="mt-1 text-xs text-gray-500">
                Select badges that will be awarded for completing this career path
              </p>
            </div>
          </div>
        )}

        {/* Step 2: Levels Management */}
        {currentStep === 2 && (
          <div className="space-y-6">
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Learning Levels</h3>
                <span className="text-sm text-gray-600">
                  {formData.levels.length} level{formData.levels.length !== 1 ? 's' : ''} added
                </span>
              </div>
              
              {errors.levels && (
                <p className="mb-4 text-sm text-red-600">{errors.levels}</p>
              )}

              {/* Available Levels */}
              <div className="mb-6">
                <h4 className="text-sm font-medium text-gray-700 mb-3">Add Levels to Career Path</h4>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                  {getAvailableLevels().map(level => (
                    <button
                      key={level.levelId}
                      type="button"
                      onClick={() => addLevelToPath(level.levelId)}
                      className="p-4 border-2 border-dashed border-gray-300 rounded-xl hover:border-blue-500 hover:bg-blue-50 transition-all text-center"
                    >
                      <Target className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                      <div className="text-sm font-medium text-gray-900">{level.levelName}</div>
                    </button>
                  ))}
                </div>
                {getAvailableLevels().length === 0 && (
                  <div className="text-center py-8 bg-gray-50 rounded-xl">
                    <p className="text-gray-600">All available levels have been added</p>
                  </div>
                )}
              </div>

              {/* Selected Levels Cards */}
              <div className="space-y-4">
                {formData.levels.map((level, levelIndex) => (
                  <div key={levelIndex} className="border border-gray-200 rounded-xl p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h4 className="text-lg font-semibold text-gray-900">{level.levelName}</h4>
                        <p className="text-sm text-gray-600">{level.courses.length} course{level.courses.length !== 1 ? 's' : ''} assigned</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => toggleLevelExpansion(levelIndex)}
                          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                            expandedLevels[levelIndex]
                              ? 'bg-blue-600 text-white'
                              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          }`}
                        >
                          <ChevronDown 
                            className={`w-4 h-4 transition-transform duration-200 ${
                              expandedLevels[levelIndex] ? 'rotate-180' : ''
                            }`}
                          />
                          {expandedLevels[levelIndex] ? 'Managing Courses' : 'Manage Courses'}
                        </button>
                        <button
                          type="button"
                          onClick={() => removeLevelFromPath(levelIndex)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {/* Course Management for Selected Level - Accordion Style */}
                    {expandedLevels[levelIndex] && (
                      <div className="border-t border-gray-100 pt-4 animate-in slide-in-from-top duration-200">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Filter by Course Type
                            </label>
                            <GenericDropdown
                              items={courseTypes.map(type => ({
                                id: type.id,
                                name: type.name,
                                description: type.description || type.name
                              }))}
                              value={selectedCourseTypeForLevel}
                              onChange={(value) => {
                                setSelectedCourseTypeForLevel(value);
                                setSelectedLevelForCourses(levelIndex);
                              }}
                              placeholder="Select course type..."
                              className="w-full"
                            />
                          </div>
                        </div>

                        {filteredCourses.length > 0 && expandedLevels[levelIndex] && selectedLevelForCourses === levelIndex && (
                          <div className="mb-4">
                            <div className="flex items-center justify-between mb-2">
                              <h6 className="text-sm font-medium text-gray-700">Available Courses</h6>
                              <div className="relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                                <input
                                  type="text"
                                  value={courseSearchTerm}
                                  onChange={(e) => setCourseSearchTerm(e.target.value)}
                                  placeholder="Search courses by title..."
                                  className="pl-9 pr-3 py-1.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent w-48"
                                />
                              </div>
                            </div>
                            <div className="border border-gray-200 rounded-xl max-h-48 overflow-y-auto">
                              {getFilteredCoursesWithSearch().length === 0 ? (
                                <div className="p-8 text-center">
                                  <BookOpen className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                                  <p className="text-sm text-gray-600">
                                    {courseSearchTerm ? 'No courses found matching your search' : 'No courses available for this type'}
                                  </p>
                                </div>
                              ) : (
                                <div className="divide-y divide-gray-200">
                                  {getFilteredCoursesWithSearch().map(course => {
                                  const isAdded = level.courses.some(c => c.courseId === course.id);
                                  const isExpanded = expandedCourses[`${levelIndex}-${course.id}`];
                                  return (
                                    <div key={course.id} className="border border-gray-200 rounded-xl overflow-hidden">
                                      <div
                                        className={`p-3 hover:bg-gray-50 cursor-pointer transition-colors ${
                                          isAdded ? 'bg-green-50 border-green-200' : 'bg-white'
                                        }`}
                                        onClick={() => toggleCourseExpansion(levelIndex, course.id)}
                                      >
                                        <div className="flex items-center justify-between">
                                          <div className="flex items-center gap-3">
                                            <input
                                              type="checkbox"
                                              checked={isAdded}
                                              onChange={() => {
                                                if (isAdded) {
                                                  const courseIndex = level.courses.findIndex(c => c.courseId === course.id);
                                                  removeCourseFromLevel(levelIndex, courseIndex);
                                                } else {
                                                  setSelectedLevelForCourses(levelIndex);
                                                  addCourseToSelectedLevel(course.id);
                                                }
                                              }}
                                              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                              onClick={(e) => e.stopPropagation()}
                                            />
                                            <div className="flex-1">
                                              <div className="font-medium text-gray-900 text-sm">{course.title}</div>
                                              <div className="text-xs text-gray-500">{course.categoryName}</div>
                                            </div>
                                          </div>
                                          <div className="flex items-center gap-2">
                                            {course.isPaid && (
                                              <span className="px-2 py-1 text-xs bg-yellow-100 text-yellow-800 rounded-full">
                                                Paid
                                              </span>
                                            )}
                                            <ChevronDown 
                                              className={`w-4 h-4 text-gray-500 transition-transform duration-200 ${
                                                isExpanded ? 'rotate-180' : ''
                                              }`}
                                            />
                                          </div>
                                        </div>
                                        
                                        {/* Expandable Details */}
                                        {isExpanded && (
                                          <div className="border-t border-gray-200 p-4 bg-gray-50">
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                              <div>
                                                <span className="font-semibold text-gray-700">Type:</span>
                                                <span className="text-gray-600">{course.courseTypeName}</span>
                                              </div>
                                              <div>
                                                <span className="font-semibold text-gray-700">Level:</span>
                                                <span className="text-gray-600">{course.courseLevelName}</span>
                                              </div>
                                              <div>
                                                <span className="font-semibold text-gray-700">Language:</span>
                                                <span className="text-gray-600">{course.languageCode}</span>
                                              </div>
                                              <div>
                                                <span className="font-semibold text-gray-700">Price:</span>
                                                <span className="text-gray-600">
                                                  {course.isPaid ? `$${course.price}` : 'Free'}
                                                  {course.discountedPrice < course.price && course.discountedPrice > 0 && (
                                                    <span className="ml-2 text-green-600">(Was: ${course.discountedPrice})</span>
                                                  )}
                                                </span>
                                              </div>
                                            </div>
                                            {course.description && (
                                              <div className="mt-3 pt-3 border-t border-gray-200">
                                                <span className="font-semibold text-gray-700">Description:</span>
                                                <p className="text-gray-600 mt-1">{course.description}</p>
                                              </div>
                                            )}
                                            {course.courseBadges && course.courseBadges.length > 0 && (
                                              <div className="mt-3 pt-3 border-t border-gray-200">
                                                <span className="font-semibold text-gray-700">Badges:</span>
                                                <div className="flex flex-wrap gap-1 mt-1">
                                                  {course.courseBadges.map((badge, index) => (
                                                    <span key={index} className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">
                                                      {badge}
                                                    </span>
                                                  ))}
                                                </div>
                                              </div>
                                            )}
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            )}
                            </div>
                          </div>
                        )}
                        
                        {/* Selected Courses */}
                        {level.courses.length > 0 && (
                          <div>
                            <h6 className="text-sm font-medium text-gray-700 mb-2">Selected Courses</h6>
                            <div className="space-y-2">
                              {level.courses
                                .sort((a, b) => a.courseSequence - b.courseSequence)
                                .map((course, courseIndex) => {
                                  const courseDetails = filteredCourses.find(c => c.id === course.courseId);
                                  const isDragging = draggedCourse?.levelIndex === levelIndex && draggedCourse?.courseIndex === courseIndex;
                                  return (
                                    <div
                                      key={courseIndex}
                                      className={`flex items-center p-3 bg-green-50 border border-green-200 rounded-lg cursor-move transition-all ${
                                        isDragging ? 'opacity-50 scale-95' : 'hover:shadow-md'
                                      }`}
                                      draggable
                                      onDragStart={(e) => handleDragStart(e, levelIndex, courseIndex, course)}
                                      onDragOver={handleDragOver}
                                      onDrop={(e) => handleDrop(e, levelIndex, courseIndex)}
                                      onDragEnd={handleDragEnd}
                                    >
                                      <div className="w-8 h-8 bg-green-600 text-white rounded-full flex items-center justify-center text-xs font-bold mr-3">
                                        {course.courseSequence}
                                      </div>
                                      <div className="flex-1">
                                        <div className="font-medium text-gray-900 text-sm">
                                          {course.title || `Course ID: ${course.courseId}`}
                                        </div>
                                        <div className="text-xs text-gray-500 mt-1">
                                          Drag to reorder
                                        </div>
                                      </div>
                                      <button
                                        type="button"
                                        onClick={() => removeCourseFromLevel(levelIndex, courseIndex)}
                                        className="p-1 text-red-600 hover:bg-red-50 rounded transition-colors"
                                      >
                                        <X className="w-4 h-4" />
                                      </button>
                                    </div>
                                  );
                                })}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {formData.levels.length === 0 && (
                <div className="text-center py-12 border-2 border-dashed border-gray-300 rounded-xl">
                  <Target className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No Levels Added Yet</h3>
                  <p className="text-gray-600 mb-6">Start building your career path by adding learning levels</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Step 3: Skills Selection */}
        {currentStep === 3 && (
          <div className="space-y-6">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <Star className="w-5 h-5 text-gray-600" />
                <h3 className="text-lg font-semibold text-gray-900">Skills Selection</h3>
              </div>
              
              {errors.skills && (
                <p className="mb-4 text-sm text-red-600">{errors.skills}</p>
              )}
              
              {/* Skills Search and Add */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Search and Add Skills
                </label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search skills..."
                    className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                
                {/* Available Skills Dropdown */}
                {searchTerm && (
                  <div className="mt-2 border border-gray-200 rounded-xl max-h-48 overflow-y-auto bg-white shadow-lg">
                    {skills
                      .filter(skill => 
                        skill.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        (skill.description && skill.description.toLowerCase().includes(searchTerm.toLowerCase()))
                      )
                      .map(skill => {
                        const isSelected = formData.skills.some(s => s.skillId === skill.id);
                        return (
                          <div
                            key={skill.id}
                            className={`px-4 py-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0 flex items-center justify-between ${
                              isSelected ? 'bg-blue-50' : 'bg-white'
                            }`}
                            onClick={() => handleSkillSelection(skill.id, isSelected ? 0 : 3)}
                          >
                            <div className="flex items-center gap-3">
                              <div className={`w-4 h-4 rounded border-2 flex items-center justify-center ${
                                isSelected 
                                  ? 'bg-blue-600 border-blue-600' 
                                  : 'border-gray-300'
                              }`}>
                                {isSelected && (
                                  <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                  </svg>
                                )}
                              </div>
                              <div>
                                <div className="font-medium text-gray-900">{skill.title}</div>
                                {skill.description && (
                                  <div className="text-sm text-gray-500 truncate">{skill.description}</div>
                                )}
                              </div>
                            </div>
                            {isSelected && (
                              <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                                Level {formData.skills.find(s => s.skillId === skill.id)?.proficiencyLevel}
                              </span>
                            )}
                          </div>
                        );
                      })}
                    {skills.filter(skill => 
                      skill.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                      (skill.description && skill.description.toLowerCase().includes(searchTerm.toLowerCase()))
                    ).length === 0 && (
                      <div className="px-4 py-6 text-center text-gray-500">
                        No skills found matching "{searchTerm}"
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Selected Skills as Tags */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Selected Skills ({formData.skills.length})
                </label>
                {formData.skills.length === 0 ? (
                  <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded-xl">
                    <Star className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                    <p className="text-gray-600">No skills selected yet</p>
                    <p className="text-sm text-gray-500 mt-1">Search and add skills from above</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {formData.skills.map((skill, index) => {
                      const skillDetails = skills.find(s => s.id === skill.skillId);
                      return (
                        <div key={skill.skillId} className="flex items-center justify-between p-3 bg-blue-50 border border-blue-200 rounded-lg">
                          <div className="flex items-center gap-3">
                            <div className="flex-1">
                              <div className="font-medium text-gray-900">
                                {skillDetails?.title || `Skill ID: ${skill.skillId}`}
                              </div>
                              <div className="text-sm text-gray-600">
                                Proficiency Level: {skill.proficiencyLevel}/5
                              </div>
                            </div>
                            <div className="flex items-center gap-1">
                              {[1, 2, 3, 4, 5].map(level => (
                                <button
                                  key={level}
                                  type="button"
                                  onClick={() => handleSkillSelection(skill.skillId, level)}
                                  className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                                    level <= skill.proficiencyLevel
                                      ? 'bg-blue-600 text-white'
                                      : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                                  }`}
                                >
                                  {level}
                                </button>
                              ))}
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleSkillSelection(skill.skillId, 0)}
                            className="ml-3 p-1 text-red-600 hover:bg-red-50 rounded transition-colors"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Step 4: Additional Details */}
        {currentStep === 4 && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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

            {/* Summary */}
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
              <h4 className="text-lg font-semibold text-blue-900 mb-4">Career Path Summary</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">{formData.levels.length}</div>
                  <div className="text-sm text-blue-800">Levels</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">
                    {formData.levels.reduce((total, level) => total + level.courses.length, 0)}
                  </div>
                  <div className="text-sm text-blue-800">Courses</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">{formData.skills.length}</div>
                  <div className="text-sm text-blue-800">Skills</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">${formData.price || 0}</div>
                  <div className="text-sm text-blue-800">Price</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="flex items-center justify-between pt-6 border-t border-gray-100">
          <div>
            {currentStep > 1 && (
              <button
                type="button"
                onClick={moveToPreviousStep}
                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors font-medium"
              >
                Previous
              </button>
            )}
          </div>
          
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onCancel}
              className="px-6 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors font-medium"
            >
              Cancel
            </button>
            
            {currentStep < 4 ? (
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  console.log('Next button clicked, current step:', currentStep);
                  if (validateCurrentStep()) {
                    console.log('Validation passed, moving to next step');
                    moveToNextStep();
                  } else {
                    console.log('Validation failed');
                  }
                }}
                className="flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 font-medium shadow-lg hover:shadow-xl"
              >
                Next Step
                <ChevronRight className="w-4 h-4 ml-2" />
              </button>
            ) : (
              <button
                type="submit"
                disabled={loading}
                className="flex items-center px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl hover:from-green-700 hover:to-emerald-700 transition-all duration-200 font-medium shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
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
            )}
          </div>
        </div>
      </form>
    </div>
  );
};

export default CareerPathForm;

