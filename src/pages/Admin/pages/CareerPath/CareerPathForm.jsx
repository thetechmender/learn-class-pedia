import  { useState, useEffect } from 'react';
import {
  Trash2,
  Save,
  X,
  ChevronDown,
  BookOpen,
  Target,
  Award,
  Search,
  DollarSign,
  Star,
  ChevronRight,
  Upload,
  CheckCircle,
  Plus
} from 'lucide-react';
import GenericDropdown from '../../../../components/GenericDropdown';
import MultiSelectDropdown from '../../../../components/MultiSelectDropdown';
import { useCareerPath } from '../../../../hooks/useCareerPath';

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
    levels,
    skills,
    careerRoles,
    courseTypes,
    badges,
    initializeDropdownData,
    getCoursesByTypeForLevel,
    searchCoursesByTitle,
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
    Overview: '',
    roleId: '',
    levels: [],
    skills: [],
    careerPathBadges: [],
    iconUrl: '',
    iconFile: null,
    RemoveIcon: false // Track if user explicitly removes icon (uppercase to match backend)
  });
  const [filteredCourses, setFilteredCourses] = useState([]);
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

  // Course search autocomplete states
  const [courseSearchResults, setCourseSearchResults] = useState([]);
  const [courseSearchLoading, setCourseSearchLoading] = useState(false);

  // Cache management
  const CACHE_KEY = 'careerPathForm_draft';
  
  useEffect(() => {
    initializeDropdownData();
    // Always clear cache on mount to ensure fresh start
    clearCache();
  }, []);

  useEffect(() => {
    if (careerPath) {
      console.log('CareerPath data received:', careerPath);
      console.log('Overview field:', careerPath.overview);
      setFormData({
        title: careerPath.title || '',
        description: careerPath.description || '',
        price: careerPath.price || '',
        discountedPrice: careerPath.discountedPrice || '',
        durationMinMonths: careerPath.durationMinMonths || '',
        durationMaxMonths: careerPath.durationMaxMonths || '',
        outcome: careerPath.outcome || '',
        Overview: careerPath.overview || '',
        roleId: careerPath.roleId || '',
        levels: careerPath.levels || [],
        skills: careerPath.skills || [],
        careerPathBadges: careerPath.careerPathBadges || [],
        iconUrl: careerPath.iconUrl || '',
        iconFile: null,
        RemoveIcon: false // Reset flag for editing (but preserve if user sets it to true)
      });
      setInitialDataLoaded(true);
    } else {
      // For new forms, show immediately and let dropdowns load in background
      setInitialDataLoaded(true);
    }
  }, [careerPath]);

  // Initialize iconUrl only once when component mounts or careerPath changes
  useEffect(() => {
    if (careerPath) {
      console.log('Second useEffect - updating iconUrl and overview');
      setFormData(prev => ({
        ...prev,
        iconUrl: careerPath.iconUrl || '', // Only set from careerPath data
        Overview: careerPath.overview || '', // Also set overview from careerPath data
        RemoveIcon: prev.RemoveIcon || false // Preserve existing RemoveIcon flag
      }));
    }
  }, [careerPath?.iconUrl, careerPath?.overview]); // Re-run when iconUrl or overview changes

  // Update badge mappings when badges data becomes available (for editing)
  useEffect(() => {
    if (careerPath && badges.length > 0) {
      const mappedBadgeIds = careerPath.careerPathBadges?.map(badgeName => {
        const foundBadge = badges.find(b => b.name === badgeName);
        return foundBadge ? foundBadge.id : null;
      }).filter(id => id !== null) || [];
      
      setFormData(prev => {
        console.log('Before badge update - formData.Overview:', prev.Overview);
        const updated = {
          ...prev,
          careerPathBadges: mappedBadgeIds
        };
        console.log('After badge update - formData.Overview:', updated.Overview);
        return updated;
      });
    }
  }, [careerPath, badges]);

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

  // Course search autocomplete handler
  const handleCourseSearch = async (searchTerm) => {
    if (!searchTerm || searchTerm.length < 2) {
      setCourseSearchResults([]);
      return;
    }

    try {
      setCourseSearchLoading(true);
      const results = await searchCoursesByTitle(searchTerm);
      setCourseSearchResults(results);
    } catch (error) {
      console.error('Failed to search courses:', error);
      setCourseSearchResults([]);
    } finally {
      setCourseSearchLoading(false);
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
      // Find the course details from search results to get the title
      const courseDetails = courseSearchResults.find(c => c.id === courseId);
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
      // Validate current step before moving to next step
      if (!validateCurrentStep()) {
        // Validation failed, don't move to next step
        return;
      }
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
    
    switch (currentStep) {
      case 1:
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
        if (!formData.roleId) {
          newErrors.roleId = 'Role is required';
        }
        break;
        
      case 2:
        if (formData.levels.length === 0) {
          newErrors.levels = 'At least one level is required';
        }
        break;
        
      case 3:
        if (formData.skills.length === 0) {
          newErrors.skills = 'At least one skill is required';
        }
        break;
        
      case 4:
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
        if (!formData.Overview.trim()) {
          newErrors.Overview = 'Overview is required';
        }
        break;
    }
    
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
    
    if (!formData.Overview.trim()) {
      newErrors.Overview = 'Overview is required';
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
    
    // Validate the final step before submission
    if (!validateCurrentStep()) {
      return;
    }
    
    let submitData;
    let isFormData = false;
    
    // If there's a file, use FormData to avoid 415 error
    if (formData.iconFile) {
      isFormData = true;
      submitData = new FormData();
      
      // Add all fields to FormData
      submitData.append('title', formData.title);
      submitData.append('description', formData.description);
      submitData.append('price', parseFloat(formData.price) || 0);
      submitData.append('discountedPrice', parseFloat(formData.discountedPrice) || 0);
      submitData.append('durationMinMonths', parseInt(formData.durationMinMonths));
      submitData.append('sortOrder', 0);
      submitData.append('durationMaxMonths', parseInt(formData.durationMaxMonths));
      submitData.append('outcome', formData.outcome);
      submitData.append('overview', formData.Overview);
      submitData.append('roleId', parseInt(formData.roleId));
      
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
      
      const badgesArray = formData.careerPathBadges
        .map(badgeId => parseInt(badgeId))
        .filter(badgeId => !isNaN(badgeId) && badgeId > 0);
      
      // Send arrays using proper array notation only
      levelsArray.forEach((level, index) => {
        submitData.append(`levels[${index}].levelId`, level.levelId);
        level.courses.forEach((course, courseIndex) => {
          submitData.append(`levels[${index}].courses[${courseIndex}].courseId`, course.courseId);
          submitData.append(`levels[${index}].courses[${courseIndex}].courseSequence`, course.courseSequence);
        });
      });
      
      skillsArray.forEach((skill, index) => {
        submitData.append(`skills[${index}].skillId`, skill.skillId);
        submitData.append(`skills[${index}].proficiencyLevel`, skill.proficiencyLevel);
      });
      
      // Only append badges if there are valid ones
      if (badgesArray.length > 0) {
        badgesArray.forEach((badgeId, index) => {
          submitData.append(`careerPathBadges[${index}]`, badgeId);
        });
      }
      
      // Add the file
      submitData.append('file', formData.iconFile);
      
      // Add RemoveIcon flag
      submitData.append('RemoveIcon', formData.RemoveIcon ? 'true' : 'false');
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
        overview: formData.Overview,
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
        careerPathBadges: formData.careerPathBadges
          .map(badgeId => parseInt(badgeId))
          .filter(badgeId => !isNaN(badgeId) && badgeId > 0),
        RemoveIcon: formData.RemoveIcon // Add RemoveIcon flag (uppercase)
      };
    }
    
    clearCache();
    
    // Pass data to parent with flag indicating if it's FormData
    await onSave(submitData, isFormData);
  };

 
  if (!initialDataLoaded) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-300">{careerPath ? 'Loading career path data...' : 'Loading form data...'}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700">
      {/* Header with Progress */}
      <div className="p-6 border-b border-gray-100 dark:border-gray-700">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center">
              <Target className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                {careerPath ? 'Edit Career Path' : 'Create New Career Path'}
              </h2>
              <p className="text-gray-600 dark:text-gray-300">
                {careerPath ? 'Update career path information' : 'Build a comprehensive learning path step by step'}
              </p>
            </div>
          </div>
          <button
            onClick={onCancel}
            className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
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
                {hookLoading && careerRoles.length === 0 ? (
                  <div className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-gray-50 flex items-center">
                    <div className="w-4 h-4 border-2 border-blue-200 border-t-blue-600 rounded-full animate-spin mr-2"></div>
                    <span className="text-gray-500">Loading career roles...</span>
                  </div>
                ) : careerRoles.length === 0 ? (
                  <div className="w-full px-4 py-3 border border-red-200 rounded-xl bg-red-50">
                    <span className="text-red-600">Failed to load career roles</span>
                  </div>
                ) : (
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
                )}
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
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                Image Upload
              </label>
              <div className="flex items-start gap-4">
               
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
                        onClick={() => {
                          handleInputChange('iconUrl', '');
                          handleInputChange('iconFile', null);
                          handleInputChange('RemoveIcon', true); // Set flag to indicate icon removal (uppercase)
                        }}
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
                          handleInputChange('RemoveIcon', false); 
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
                        {formData.iconUrl ? 'Change Image' : 'Upload Image'}
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
              {hookLoading && badges.length === 0 ? (
                <div className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-gray-50 flex items-center">
                  <div className="w-4 h-4 border-2 border-blue-200 border-t-blue-600 rounded-full animate-spin mr-2"></div>
                  <span className="text-gray-500">Loading badges...</span>
                </div>
              ) : badges.length === 0 ? (
                <div className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-gray-50">
                  <span className="text-gray-600">No badges available</span>
                </div>
              ) : (
                <MultiSelectDropdown
                  items={badges}
                  values={formData.careerPathBadges}
                  onChange={(values) => handleInputChange('careerPathBadges', values)}
                  placeholder="Select badges..."
                  className="w-full"
                />
              )}
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
                {hookLoading && levels.length === 0 ? (
                  <div className="text-center py-8 bg-gray-50 rounded-xl">
                    <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-3"></div>
                    <p className="text-gray-600">Loading levels...</p>
                  </div>
                ) : levels.length === 0 ? (
                  <div className="text-center py-8 bg-red-50 rounded-xl">
                    <p className="text-red-600">Failed to load levels</p>
                  </div>
                ) : (
                  <>
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
                  </>
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
                        <div className="mb-4">
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Search Courses
                          </label>
                          <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                            <input
                              type="text"
                              value={courseSearchTerm}
                              onChange={(e) => {
                                setCourseSearchTerm(e.target.value);
                                handleCourseSearch(e.target.value);
                                setSelectedLevelForCourses(levelIndex);
                              }}
                              placeholder="Search courses by title..."
                              className="pl-9 pr-3 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent w-full"
                            />
                            {courseSearchLoading && (
                              <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                                <div className="w-4 h-4 border-2 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Autocomplete Dropdown */}
                        {courseSearchResults.length > 0 && courseSearchTerm && selectedLevelForCourses === levelIndex && (
                          <div className="mb-4 border border-gray-200 rounded-xl max-h-48 overflow-y-auto bg-white shadow-lg">
                            {courseSearchResults.map(course => {
                              const isAdded = formData.levels[levelIndex].courses.some(c => c.courseId === course.id);
                              return (
                                <div
                                  key={course.id}
                                  className={`p-3 hover:bg-gray-50 cursor-pointer transition-colors border-b border-gray-100 last:border-b-0 ${
                                    isAdded ? 'bg-green-50' : 'bg-white'
                                  }`}
                                  onClick={() => !isAdded && addCourseToSelectedLevel(course.id)}
                                >
                                  <div className="flex items-center justify-between">
                                    <div>
                                      <h4 className="text-sm font-medium text-gray-900">{course.title}</h4>
                                      <p className="text-xs text-gray-500">{course.description || course.courseType}</p>
                                    </div>
                                    {isAdded ? (
                                      <CheckCircle className="w-4 h-4 text-green-600" />
                                    ) : (
                                      <Plus className="w-4 h-4 text-blue-600" />
                                    )}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        )}

                        {/* Selected Courses Display */}
                        {formData.levels[levelIndex].courses.length > 0 && (
                          <div className="mb-4">
                            <div className="flex items-center justify-between mb-3">
                              <h4 className="text-sm font-medium text-gray-700">
                                Selected Courses ({formData.levels[levelIndex].courses.length})
                              </h4>
                            </div>
                            <div className="space-y-2">
                              {formData.levels[levelIndex].courses.map((course, courseIndex) => (
                                <div
                                  key={course.courseId}
                                  className="flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl"
                                >
                                  <div className="flex-1 min-w-0 mr-3">
                                    <div className="flex items-center gap-2 mb-1">
                                      <span className="text-xs font-semibold text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-800 px-2 py-1 rounded-full">
                                        {course.courseSequence}
                                      </span>
                                      <h4 className="text-sm font-medium text-gray-900 dark:text-white truncate">
                                        {course.title}
                                      </h4>
                                    </div>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <button
                                      type="button"
                                      onClick={() => removeCourseFromLevel(levelIndex, courseIndex)}
                                      className="p-2 text-red-600 hover:bg-red-100 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                                      title="Remove course"
                                    >
                                      <Trash2 className="w-4 h-4" />
                                    </button>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {courseSearchTerm && courseSearchResults.length === 0 && !courseSearchLoading && selectedLevelForCourses === levelIndex && (
                          <div className="mb-4 p-4 text-center border border-gray-200 rounded-xl bg-gray-50">
                            <BookOpen className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                            <p className="text-sm text-gray-600">No courses found matching your search</p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Skills Selection */}
        {currentStep === 3 && (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Skills Selection</h3>
              {errors.skills && (
                <p className="mb-4 text-sm text-red-600">{errors.skills}</p>
              )}

              {/* Skills Search and Selection */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Search and Select Skills
                </label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search skills by name..."
                    className="pl-9 pr-3 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent w-full"
                  />
                </div>

                {/* Skills Dropdown */}
                {searchTerm && skills.length > 0 && (
                  <div className="mt-2 border border-gray-200 rounded-xl max-h-60 overflow-y-auto bg-white shadow-lg">
                    {skills
                      .filter(skill => 
                        (skill.name || skill.skillName || skill.title || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                        (skill.category || skill.skillCategory || '').toLowerCase().includes(searchTerm.toLowerCase())
                      )
                      .map(skill => {
                        const isSelected = formData.skills.some(s => s.skillId === (skill.id || skill.skillId));
                        return (
                          <div
                            key={skill.id}
                            className={`p-3 hover:bg-gray-50 cursor-pointer transition-colors border-b border-gray-100 last:border-b-0 ${
                              isSelected ? 'bg-green-50' : 'bg-white'
                            }`}
                            onClick={() => handleSkillSelection(skill.id, isSelected ? 0 : 3)}
                          >
                            <div className="flex items-center justify-between">
                              <div>
                                <h4 className="text-sm font-medium text-gray-900">{skill.name || skill.skillName || skill.title}</h4>
                                <p className="text-xs text-gray-500">{skill.category || skill.skillCategory || 'Skill'}</p>
                              </div>
                              {isSelected ? (
                                <CheckCircle className="w-4 h-4 text-green-600" />
                              ) : (
                                <Plus className="w-4 h-4 text-blue-600" />
                              )}
                            </div>
                          </div>
                        );
                      })}
                  </div>
                )}

                {searchTerm && skills.length > 0 && 
                  skills.filter(skill => 
                    (skill.name || skill.skillName || skill.title || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                    (skill.category || skill.skillCategory || '').toLowerCase().includes(searchTerm.toLowerCase())
                  ).length === 0 && (
                  <div className="mt-2 p-4 text-center border border-gray-200 rounded-xl bg-gray-50">
                    <p className="text-sm text-gray-600">No skills found matching your search</p>
                  </div>
                )}

                {skills.length === 0 && !hookLoading && (
                  <div className="mt-2 p-4 text-center border border-gray-200 rounded-xl bg-red-50">
                    <p className="text-sm text-red-600">Failed to load skills</p>
                  </div>
                )}
              </div>

              {/* Selected Skills with Proficiency Levels */}
              {formData.skills.length > 0 && (
                <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl">
                  <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-4">
                    Selected Skills ({formData.skills.length})
                  </h4>
                  <div className="space-y-3">
                    {formData.skills.map((skill, index) => {
                      // Debug: log the skill data to understand the structure
                      console.log('Skill data:', skill);
                      console.log('Available skills:', skills);
                      
                      // Try different ways to find the skill details
                      const skillDetails = skills.find(s => s.id === skill.skillId) || 
                                         skills.find(s => s.skillId === skill.skillId) ||
                                         skills.find(s => s.id === skill.id) ||
                                         skill; // fallback to the skill object itself
                      
                      console.log('Skill details found:', skillDetails);
                      
                      return (
                        <div
                          key={index}
                          className="flex items-center justify-between p-3 bg-white dark:bg-gray-800 rounded-lg border border-blue-200 dark:border-blue-700"
                        >
                          <div className="flex-1 min-w-0 mr-3">
                            <div className="flex items-center gap-2 mb-2">
                              <h4 className="text-sm font-medium text-gray-900 dark:text-white truncate">
                                {skillDetails?.name || skillDetails?.skillName || skillDetails?.title || `Skill ${skill.skillId || skill.id || index}`}
                              </h4>
                              <span className="text-xs text-gray-500 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded-full">
                                {skillDetails?.category || skillDetails?.skillCategory || 'Skill'}
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <label className="text-xs font-medium text-gray-600 dark:text-gray-400">Proficiency:</label>
                              <div className="flex gap-1">
                                {[1, 2, 3, 4, 5].map(level => {
                                  const isCurrentLevel = skill.proficiencyLevel === level;
                                  return (
                                    <button
                                      key={level}
                                      type="button"
                                      onClick={() => handleSkillSelection(skill.skillId, level)}
                                      className={`w-6 h-6 rounded text-xs font-medium transition-all ${
                                        isCurrentLevel
                                          ? 'bg-blue-600 text-white'
                                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                      }`}
                                    >
                                      {level}
                                    </button>
                                  );
                                })}
                              </div>
                            
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => handleSkillSelection(skill.skillId, 0)}
                              className="p-2 text-red-600 hover:bg-red-100 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                              title="Remove skill"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Loading State */}
              {hookLoading && skills.length === 0 && (
                <div className="text-center py-8 bg-gray-50 rounded-xl">
                  <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-3"></div>
                  <p className="text-gray-600">Loading skills...</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Step 4: Additional Details */}
        {currentStep === 4 && (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Additional Details</h3>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Duration Min Months */}
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Minimum Duration (Months) *
                </label>
                <input
                  type="number"
                  value={formData.durationMinMonths}
                  onChange={(e) => handleInputChange('durationMinMonths', e.target.value)}
                  className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                    errors.durationMinMonths ? 'border-red-300 bg-red-50' : 'border-gray-200'
                  }`}
                  placeholder="e.g., 3"
                  min="1"
                />
                {errors.durationMinMonths && (
                  <p className="mt-1 text-sm text-red-600">{errors.durationMinMonths}</p>
                )}
              </div>

              {/* Duration Max Months */}
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Maximum Duration (Months) *
                </label>
                <input
                  type="number"
                  value={formData.durationMaxMonths}
                  onChange={(e) => handleInputChange('durationMaxMonths', e.target.value)}
                  className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                    errors.durationMaxMonths ? 'border-red-300 bg-red-50' : 'border-gray-200'
                  }`}
                  placeholder="e.g., 6"
                  min="1"
                />
                {errors.durationMaxMonths && (
                  <p className="mt-1 text-sm text-red-600">{errors.durationMaxMonths}</p>
                )}
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
                placeholder="What will participants learn or achieve after completing this career path?"
              />
              {errors.outcome && (
                <p className="mt-1 text-sm text-red-600">{errors.outcome}</p>
              )}
            </div>

            {/* Overview */}
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                Career Path Overview *
              </label>
              <textarea
                value={formData.Overview}
                onChange={(e) => handleInputChange('Overview', e.target.value)}
                rows={4}
                className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none ${
                  errors.Overview ? 'border-red-300 bg-red-50' : 'border-gray-200'
                }`}
                placeholder="Provide a comprehensive Overview of this career path, including target audience and learning journey..."
              />
              {errors.Overview && (
                <p className="mt-1 text-sm text-red-600">{errors.Overview}</p>
              )}
            </div>
          </div>
        )}

        {/* Form Navigation */}
        <div className="flex items-center justify-between p-6 border-t border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
          <div className="flex items-center gap-3">
            {currentStep > 1 && (
              <button
                type="button"
                onClick={moveToPreviousStep}
                className="flex items-center px-6 py-3 bg-white dark:bg-gray-700 border-2 border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-600 transition-all duration-200 font-medium"
              >
                <ChevronRight className="w-4 h-4 mr-2 rotate-180" />
                Previous
              </button>
            )}
          </div>
          
          <div className="flex items-center gap-3">
            {currentStep < 4 ? (
              <button
                type="button"
                onClick={moveToNextStep}
                className="flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-500 dark:to-indigo-500 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 dark:hover:from-blue-600 dark:hover:to-indigo-600 transition-all duration-200 font-medium shadow-lg hover:shadow-xl"
              >
                Next
                <ChevronRight className="w-4 h-4 ml-2" />
              </button>
            ) : (
              <>
                <button
                  type="button"
                  onClick={onCancel}
                  className="flex items-center px-6 py-3 bg-white dark:bg-gray-700 border-2 border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-600 transition-all duration-200 font-medium"
                >
                  <X className="w-4 h-4 mr-2" />
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex items-center px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 dark:from-green-500 dark:to-emerald-500 text-white rounded-xl hover:from-green-700 hover:to-emerald-700 dark:hover:from-green-600 dark:hover:to-emerald-600 transition-all duration-200 font-medium shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Save className="w-4 h-4 mr-2" />
                  {loading ? 'Saving...' : (careerPath ? 'Update Career Path' : 'Create Career Path')}
                </button>
              </>
            )}
          </div>
        </div>
      </form>
    </div>
  );
};

export default CareerPathForm;
