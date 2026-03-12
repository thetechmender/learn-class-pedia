import { useState, useEffect,useCallback, useMemo } from 'react';
import {
  Plus,
  Search,
  Edit2,
  Trash2,
  Save,
  X,
  BookOpen,
  AlertCircle,
  Users
} from 'lucide-react';
import { useTopic } from '../../../../hooks/api/useTopic';

const TopicManagement = () => {
  const {
    loading,
    error,
    topics,
    getAllTopics,
    getTopicById,
    createTopic,
    updateTopic,
    deleteTopic,
    getTopicMapping,
    createTopicMapping,
    getAllCoursesForMapping,
    getAllCareerPathsForMapping,
    getAllSubcategoriesForMapping,
    searchSubcategoriesForMapping,
    coursesCache,
    clearError
  } = useTopic();

  // Component state
  const [searchTerm, setSearchTerm] = useState('');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedTopic, setSelectedTopic] = useState(null);
  const [editLoading, setEditLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: ''
  });
  const [formErrors, setFormErrors] = useState({});
  const [submitLoading, setSubmitLoading] = useState(false);

  // Course mapping state
  const [showMappingModal, setShowMappingModal] = useState(false);
  const [selectedTopicForMapping, setSelectedTopicForMapping] = useState(null);
  const [mappedCourses, setMappedCourses] = useState([]);
  const [loadingMappedCourses, setLoadingMappedCourses] = useState(false);
  const [searchTermMapping, setSearchTermMapping] = useState('');
  const [availableCourses, setAvailableCourses] = useState([]);
  const [loadingAvailableCourses, setLoadingAvailableCourses] = useState(false);
  const [allCourses, setAllCourses] = useState([]); // Cache all courses locally
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [coursesPreloaded, setCoursesPreloaded] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false); // Loading state for search API calls

  // Career path mapping state
  const [mappedCareerPaths, setMappedCareerPaths] = useState([]);
  const [loadingMappedCareerPaths, setLoadingMappedCareerPaths] = useState(false);
  const [allCareerPaths, setAllCareerPaths] = useState([]); // Cache all career paths locally
  const [careerPathsPreloaded, setCareerPathsPreloaded] = useState(false);

  // Subcategories mapping state
  const [mappedSubcategories, setMappedSubcategories] = useState([]);
  const [allSubcategories, setAllSubcategories] = useState([]); // Cache all subcategories locally
  const [subcategoriesPreloaded, setSubcategoriesPreloaded] = useState(false);

  // Type parameter: 1 = course, 2 = career path, 3 = subcategories
  const [mappingType, setMappingType] = useState(1);

  // Load topics on component mount
  useEffect(() => {
    getAllTopics();
    
    // Use preloaded courses from hook cache for instant loading
    if (coursesCache && coursesCache.length > 0) {
      setAllCourses(coursesCache);
      setCoursesPreloaded(true);
    } else if (!coursesPreloaded) {
      // Fallback: Load courses if not preloaded
      getAllCoursesForMapping().then(courses => {
        setAllCourses(courses);
        setCoursesPreloaded(true);
      });
    }
  }, [getAllTopics, coursesCache, coursesPreloaded, getAllCoursesForMapping]);

  // Preload career paths for instant access
  useEffect(() => {
    if (!careerPathsPreloaded) {
      getAllCareerPathsForMapping().then(careerPaths => {
        setAllCareerPaths(careerPaths);
        setCareerPathsPreloaded(true);
      });
    }
  }, [careerPathsPreloaded, getAllCareerPathsForMapping]);

  // Preload subcategories for instant access
  useEffect(() => {
    if (!subcategoriesPreloaded) {
      getAllSubcategoriesForMapping().then(subcategories => {
        setAllSubcategories(subcategories);
        setSubcategoriesPreloaded(true);
      });
    }
  }, [subcategoriesPreloaded, getAllSubcategoriesForMapping]);

  // Debounce search term to avoid excessive filtering
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTermMapping);
    }, 300); // 300ms delay

    return () => clearTimeout(timer);
  }, [searchTermMapping]);

  // Handle search API calls for subcategories
  useEffect(() => {
    if (mappingType === 3 && debouncedSearchTerm.trim()) {
      // Use API search for subcategories
      setSearchLoading(true);
      searchSubcategoriesForMapping(debouncedSearchTerm)
        .then(results => {
          const mappedIds = Array.isArray(mappedSubcategories) ? mappedSubcategories.map(subcategory => subcategory.subcategoryId || subcategory.id) : [];
          const itemsWithSelection = results.map(subcategory => ({
            ...subcategory,
            // Use name field for display, but keep title for compatibility
            title: subcategory.name || subcategory.title,
            isSelected: mappedIds.includes(subcategory.id)
          }));
          setAvailableCourses(itemsWithSelection);
        })
        .catch(err => {
          console.error('Failed to search subcategories:', err);
          setAvailableCourses([]);
        })
        .finally(() => {
          setSearchLoading(false);
        });
    } else if (mappingType === 3 && !debouncedSearchTerm.trim()) {
      // Clear results when search is empty for subcategories
      setAvailableCourses([]);
    }
  }, [debouncedSearchTerm, mappingType, mappedSubcategories, searchSubcategoriesForMapping]);

  // Memoized filtered results for instant search results (courses and career paths only)
  const filteredAvailableItems = useMemo(() => {
    if (!debouncedSearchTerm.trim()) return [];
    
    if (mappingType === 1) {
      // Course mapping
      const mappedIds = Array.isArray(mappedCourses) ? mappedCourses.map(course => course.courseId || course.id) : [];
      
      return allCourses.filter(course => 
        course.title && course.title.toLowerCase().includes(debouncedSearchTerm.toLowerCase())
      ).map(course => ({
        ...course,
        isSelected: mappedIds.includes(course.id)
      }));
    } else if (mappingType === 2) {
      // Career path mapping
      const mappedIds = Array.isArray(mappedCareerPaths) ? mappedCareerPaths.map(careerPath => careerPath.careerPathId || careerPath.id) : [];
      
      return allCareerPaths.filter(careerPath => 
        careerPath.title && careerPath.title.toLowerCase().includes(debouncedSearchTerm.toLowerCase())
      ).map(careerPath => ({
        ...careerPath,
        isSelected: mappedIds.includes(careerPath.id)
      }));
    }
    // Subcategories are handled by API search, return empty array
    return [];
  }, [allCourses, allCareerPaths, debouncedSearchTerm, mappedCourses, mappedCareerPaths, mappingType]);

  // Update available items when filtered results change (only for courses and career paths)
  useEffect(() => {
    if (mappingType === 1) {
      setAvailableCourses(filteredAvailableItems);
    } else if (mappingType === 2) {
      // For career paths, we'll use the same availableCourses state for now
      // This will be updated when UI is implemented for career path mapping
      setAvailableCourses(filteredAvailableItems);
    }
    // For mappingType === 3 (subcategories), do nothing - results are handled by API search useEffect
  }, [filteredAvailableItems, mappingType]);

  // Filter topics based on search term
  const filteredTopics = topics.filter(topic =>
    topic.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    topic.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Form validation
  const validateForm = () => {
    const errors = {};
    
    if (!formData.title.trim()) {
      errors.title = 'Title is required';
    }
    
    if (!formData.description.trim()) {
      errors.description = 'Description is required';
    }
    
    if (formData.title && formData.title.length > 200) {
      errors.title = 'Title must be less than 200 characters';
    }
    
    if (formData.description && formData.description.length > 1000) {
      errors.description = 'Description must be less than 1000 characters';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Handle form input changes
  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear error for this field when user starts typing
    if (formErrors[field]) {
      setFormErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  // Handle create topic
  const handleCreateTopic = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setSubmitLoading(true);
    
    try {
      await createTopic(formData);
      setIsCreateModalOpen(false);
      setFormData({ title: '', description: '' });
      setFormErrors({});
    } catch (err) {
      console.error('Failed to create topic:', err);
    } finally {
      setSubmitLoading(false);
    }
  };

  // Handle update topic
  const handleUpdateTopic = async (e) => {
    e.preventDefault();
    
    if (!validateForm() || !selectedTopic) {
      return;
    }
    
    setSubmitLoading(true);
    
    try {
      await updateTopic(selectedTopic.id, formData);
      setIsEditModalOpen(false);
      setSelectedTopic(null);
      setFormData({ title: '', description: '' });
      setFormErrors({});
    } catch (err) {
      console.error('Failed to update topic:', err);
    } finally {
      setSubmitLoading(false);
    }
  };

  // Handle delete topic
  const handleDeleteTopic = async (topic) => {
    if (window.confirm(`Are you sure you want to delete "${topic.title}"?`)) {
      try {
        await deleteTopic(topic.id);
      } catch (err) {
        console.error('Failed to delete topic:', err);
      }
    }
  };

  // Open edit modal with topic data fetched from API
  const openEditModal = async (topic) => {
    setSelectedTopic(topic);
    setEditLoading(true);
    setFormErrors({});
    setIsEditModalOpen(true);
    
    try {
      // Fetch fresh topic data from API
      const topicData = await getTopicById(topic.id);
      setFormData({
        title: topicData.title || '',
        description: topicData.description || ''
      });
    } catch (err) {
      console.error('Failed to fetch topic data:', err);
      // Fallback to frontend data if API fails
      setFormData({
        title: topic.title || '',
        description: topic.description || ''
      });
    } finally {
      setEditLoading(false);
    }
  };

  // Close modals and reset form
  const closeModals = () => {
    setIsCreateModalOpen(false);
    setIsEditModalOpen(false);
    setSelectedTopic(null);
    setFormData({ title: '', description: '' });
    setFormErrors({});
  };

  // Course Mapping Functions
  
  // Fetch mapped courses for a topic
  const fetchMappedCourses = useCallback(async (topicId) => {
    setLoadingMappedCourses(true);
    try {
      const result = await getTopicMapping(topicId, 1); // type 1 for courses
    
      // Handle new API response format: {success: true, topicId: X, type: 1, ids: [id1, id2]}
      let courses = [];
      if (result && result.success === true && Array.isArray(result.ids)) {
        // Use local cache instead of API call for better performance
        const allCoursesData = allCourses.length > 0 ? allCourses : await getAllCoursesForMapping();
        const mappedIds = result.ids;
        
        // Filter all courses to get only the mapped ones
        courses = allCoursesData.filter(course => mappedIds.includes(course.id));
        
        // If any mapped IDs don't have course details, create fallback entries
        mappedIds.forEach(courseId => {
          if (!courses.some(course => course.id === courseId)) {
            courses.push({ 
              id: courseId, 
              title: `Course ${courseId}`, 
              description: 'Course details not found' 
            });
          }
        });
      } else if (result?.items) {
        // API returns {items: [...]} with full course details
        courses = result.items;
      } else if (Array.isArray(result)) {
        // API returns direct array
        courses = result;
      }
      setMappedCourses(Array.isArray(courses) ? courses : []);
    } catch (err) {
      console.error('Failed to fetch mapped courses:', err);
      setMappedCourses([]);
    } finally {
      setLoadingMappedCourses(false);
    }
  }, [allCourses, getAllCoursesForMapping, getTopicMapping]);

  // Fetch mapped career paths for a topic
  const fetchMappedCareerPaths = useCallback(async (topicId) => {
    setLoadingMappedCareerPaths(true);
    try {
      const result = await getTopicMapping(topicId, 2); 
      // Handle new API response format: {success: true, topicId: X, type: 2, ids: [id1, id2]}
      let careerPaths = [];
      if (result && result.success === true && Array.isArray(result.ids)) {
        // Use local cache instead of API call for better performance
        const allCareerPathsData = allCareerPaths.length > 0 ? allCareerPaths : await getAllCareerPathsForMapping();
        const mappedIds = result.ids;
        
        // Filter all career paths to get only the mapped ones
        careerPaths = allCareerPathsData.filter(careerPath => mappedIds.includes(careerPath.id));
        
        // If any mapped IDs don't have career path details, create fallback entries
        mappedIds.forEach(careerPathId => {
          if (!careerPaths.some(careerPath => careerPath.id === careerPathId)) {
            careerPaths.push({ 
              id: careerPathId, 
              title: `Career Path ${careerPathId}`, 
              description: 'Career path details not found' 
            });
          }
        });
      } else if (result?.items) {
        // API returns {items: [...]} with full career path details
        careerPaths = result.items;
      } else if (Array.isArray(result)) {
        // API returns direct array
        careerPaths = result;
      }
      setMappedCareerPaths(Array.isArray(careerPaths) ? careerPaths : []);
    } catch (err) {
      console.error('Failed to fetch mapped career paths:', err);
      setMappedCareerPaths([]);
    } finally {
      setLoadingMappedCareerPaths(false);
    }
  }, [allCareerPaths, getAllCareerPathsForMapping, getTopicMapping]);

  // Fetch mapped subcategories for a topic
  const fetchMappedSubcategories = useCallback(async (topicId) => {
    try {
      const result = await getTopicMapping(topicId, 3); // type 3 for subcategories
      // Handle new API response format: {success: true, topicId: X, type: 3, ids: [id1, id2]}
      let subcategories = [];
      if (result && result.success === true && Array.isArray(result.ids)) {
        // Use local cache instead of API call for better performance
        const allSubcategoriesData = allSubcategories.length > 0 ? allSubcategories : await getAllSubcategoriesForMapping();
        const mappedIds = result.ids;
        
        // Filter all subcategories to get only the mapped ones
        subcategories = allSubcategoriesData.filter(subcategory => mappedIds.includes(subcategory.id));
        mappedIds.forEach(subcategoryId => {
          if (!subcategories.some(subcategory => subcategory.id === subcategoryId)) {
            subcategories.push({ 
              id: subcategoryId, 
              name: `Subcategory ${subcategoryId}`, 
              description: 'Subcategory details not found' 
            });
          }
        });
      } else if (result?.items) {
        // API returns {items: [...]} with full subcategory details
        subcategories = result.items;
      } else if (Array.isArray(result)) {
        // API returns direct array
        subcategories = result;
      }
      setMappedSubcategories(Array.isArray(subcategories) ? subcategories : []);
    } catch (err) {
      console.error('Failed to fetch mapped subcategories:', err);
      setMappedSubcategories([]);
    }
  }, [allSubcategories, getAllSubcategoriesForMapping, getTopicMapping]);

  // Open mapping modal
  const openMappingModal = useCallback((topic, type = 1) => {
    setSelectedTopicForMapping(topic);
    setShowMappingModal(true);
    setMappingType(type);
    setMappedCourses([]);
    setMappedCareerPaths([]);
    setMappedSubcategories([]);
    setSearchTermMapping('');
    setAvailableCourses([]);
    
    // Fetch mapped items based on type
    if (type === 1) {
      fetchMappedCourses(topic.id);
    } else if (type === 2) {
      fetchMappedCareerPaths(topic.id);
    } else {
      fetchMappedSubcategories(topic.id);
    }
  }, [fetchMappedCourses, fetchMappedCareerPaths, fetchMappedSubcategories]);

  // Close mapping modal
  const closeMappingModal = useCallback(() => {
    setShowMappingModal(false);
    setSelectedTopicForMapping(null);
    setMappedCourses([]);
    setMappedCareerPaths([]);
    setMappedSubcategories([]);
    setSearchTermMapping('');
    setAvailableCourses([]);
    setMappingType(1);
  }, []);

  // Toggle course assignment
  const toggleCourseAssignment = useCallback((course) => {
    // Ensure mappedCourses is an array
    const currentMapped = Array.isArray(mappedCourses) ? mappedCourses : [];
    
    const isAssigned = currentMapped.some(mapped => 
      (mapped.courseId || mapped.id) === course.id
    );
    
    if (isAssigned) {
      // Remove from mapped courses
      setMappedCourses(prev => Array.isArray(prev) ? prev.filter(mapped => 
        (mapped.courseId || mapped.id) !== course.id
      ) : []);
    } else {
      // Add to mapped courses
      setMappedCourses(prev => Array.isArray(prev) ? [...prev, { id: course.id, title: course.title, description: course.description }] : [{ id: course.id, title: course.title, description: course.description }]);
    }
  }, [mappedCourses]);

  // Toggle career path assignment
  const toggleCareerPathAssignment = useCallback((careerPath) => {
    // Ensure mappedCareerPaths is an array
    const currentMapped = Array.isArray(mappedCareerPaths) ? mappedCareerPaths : [];
    
    const isAssigned = currentMapped.some(mapped => 
      (mapped.careerPathId || mapped.id) === careerPath.id
    );
    
    if (isAssigned) {
      // Remove from mapped career paths
      setMappedCareerPaths(prev => Array.isArray(prev) ? prev.filter(mapped => 
        (mapped.careerPathId || mapped.id) !== careerPath.id
      ) : []);
    } else {
      // Add to mapped career paths
      setMappedCareerPaths(prev => Array.isArray(prev) ? [...prev, { id: careerPath.id, title: careerPath.title, description: careerPath.description }] : [{ id: careerPath.id, title: careerPath.title, description: careerPath.description }]);
    }
  }, [mappedCareerPaths]);

  // Toggle subcategory assignment
  const toggleSubcategoryAssignment = useCallback((subcategory) => {
    // Ensure mappedSubcategories is an array
    const currentMapped = Array.isArray(mappedSubcategories) ? mappedSubcategories : [];
    
    const isAssigned = currentMapped.some(mapped => 
      (mapped.subcategoryId || mapped.id) === subcategory.id
    );
    
    if (isAssigned) {
      // Remove from mapped subcategories
      setMappedSubcategories(prev => Array.isArray(prev) ? prev.filter(mapped => 
        (mapped.subcategoryId || mapped.id) !== subcategory.id
      ) : []);
    } else {
      // Add to mapped subcategories
      setMappedSubcategories(prev => Array.isArray(prev) ? [...prev, { 
        id: subcategory.id, 
        name: subcategory.name || subcategory.title, 
        title: subcategory.name || subcategory.title, // Keep title for compatibility
        description: subcategory.description 
      }] : [{ 
        id: subcategory.id, 
        name: subcategory.name || subcategory.title,
        title: subcategory.name || subcategory.title, // Keep title for compatibility
        description: subcategory.description 
      }]);
    }
  }, [mappedSubcategories]);

  // Save mappings (handles both courses and career paths using only assign API)
  const saveMappings = useCallback(async () => {
    if (!selectedTopicForMapping) return;

    try {
      // Get current mappings from API based on type
      const currentMappings = await getTopicMapping(selectedTopicForMapping.id, mappingType);
      let currentIds = [];
      
      if (currentMappings && currentMappings.success === true && Array.isArray(currentMappings.ids)) {
        currentIds = currentMappings.ids;
      } else if (currentMappings?.items) {
        currentIds = currentMappings.items.map(item => item.id);
      } else if (Array.isArray(currentMappings)) {
        currentIds = currentMappings.map(item => item.id);
      }
      
      const newIds = mappingType === 1 
        ? Array.isArray(mappedCourses) ? mappedCourses.map(course => course.courseId || course.id) : []
        : mappingType === 2 
          ? Array.isArray(mappedCareerPaths) ? mappedCareerPaths.map(careerPath => careerPath.careerPathId || careerPath.id) : []
          : Array.isArray(mappedSubcategories) ? mappedSubcategories.map(subcategory => subcategory.subcategoryId || subcategory.id) : [];
      
      // Find items to add (in new but not in current)
      const toAdd = newIds.filter(id => !currentIds.includes(id));
      
      // Find items to remove (in current but not in new)
      const toRemove = currentIds.filter(id => !newIds.includes(id));
     
      // Use assign API for both add and delete operations
      if (toAdd.length > 0 || toRemove.length > 0) {
        const mappingData = {
          topicId: selectedTopicForMapping.id,
          ids: newIds, // Send the complete list of IDs to assign
          type: mappingType
        };
       
        await createTopicMapping(mappingData);
      }
      
      // Show success message
      const itemType = mappingType === 1 ? 'course' : mappingType === 2 ? 'career path' : 'subcategory';
      const action = toAdd.length > 0 && toRemove.length > 0 
        ? 'updated' 
        : toAdd.length > 0 
          ? 'assigned' 
          : 'removed';
      setSuccessMessage(`Successfully ${action} ${itemType}${toAdd.length > 1 || toRemove.length > 1 ? 's' : ''} for topic "${selectedTopicForMapping.title}"`);
      
      closeMappingModal();
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccessMessage('');
      }, 3000);
   
    } catch (err) {
      console.error('Failed to save mappings:', err);
    }
  }, [selectedTopicForMapping, mappedCourses, mappedCareerPaths, mappedSubcategories, mappingType, getTopicMapping, createTopicMapping, closeMappingModal]);

  // Handle search in mapping modal
  const handleMappingSearch = useCallback((value) => {
    setSearchTermMapping(value);
  }, []);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700">
      {/* Header */}
      <div className="p-6 border-b border-gray-100 dark:border-gray-700">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-indigo-600 rounded-xl flex items-center justify-center">
              <BookOpen className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Topic Management</h2>
              <p className="text-gray-600 dark:text-gray-300">Create and manage learning topics</p>
            </div>
          </div>
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add Topic
          </button>
        </div>

        {/* Search */}
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search topics..."
            className="pl-9 pr-3 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent w-full"
          />
        </div>
      </div>

      {/* Success Message */}
      {successMessage && (
        <div className="mx-6 mt-4 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg flex items-center gap-3">
          <div className="w-5 h-5 bg-green-600 rounded-full flex items-center justify-center">
            <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <p className="text-green-800 dark:text-green-200 font-medium">{successMessage}</p>
        </div>
      )}

      {/* Error Display */}
      {error && (
        <div className="mx-6 mt-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-200 rounded-xl flex items-start">
          <AlertCircle className="w-5 h-5 mr-3 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-sm">Error</p>
            <p className="text-sm mt-1">{error}</p>
            <button
              onClick={clearError}
              className="text-sm mt-2 underline hover:no-underline"
            >
              Dismiss
            </button>
          </div>
        </div>
      )}

      {/* Topics List */}
      <div className="p-6">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
            <span className="ml-3 text-gray-600">Loading topics...</span>
          </div>
        ) : filteredTopics.length === 0 ? (
          <div className="text-center py-12">
            <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              {searchTerm ? 'No topics found' : 'No topics yet'}
            </h3>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              {searchTerm 
                ? 'Try adjusting your search terms'
                : 'Get started by creating your first topic'
              }
            </p>
            {!searchTerm && (
              <button
                onClick={() => setIsCreateModalOpen(true)}
                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Plus className="w-4 h-4" />
                Create Topic
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredTopics.map((topic) => (
              <div
                key={topic.id}
                className="bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl p-4 hover:shadow-lg transition-shadow"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white truncate">
                      {topic.title}
                    </h3>
                  </div>
                  <div className="flex items-center gap-1 ml-2">
                    <button
                      onClick={() => openEditModal(topic)}
                      className="p-2 text-blue-600 hover:bg-blue-100 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                      title="Edit topic"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteTopic(topic)}
                      className="p-2 text-red-600 hover:bg-red-100 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                      title="Delete topic"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => openMappingModal(topic)}
                      className="p-2 text-blue-600 hover:bg-blue-100 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                      title="Map Items"
                    >
                      <Users className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                <p className="text-gray-600 dark:text-gray-300 text-sm line-clamp-3">
                  {topic.description}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Create Topic Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl w-full max-w-md mx-4">
            <div className="p-6 border-b border-gray-100 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Create New Topic</h3>
                <button
                  onClick={closeModals}
                  className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
            
            <form onSubmit={handleCreateTopic} className="p-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Title *
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => handleInputChange('title', e.target.value)}
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      formErrors.title ? 'border-red-300 bg-red-50' : 'border-gray-200'
                    }`}
                    placeholder="Enter topic title..."
                  />
                  {formErrors.title && (
                    <p className="mt-1 text-sm text-red-600">{formErrors.title}</p>
                  )}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Description *
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    rows={4}
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none ${
                      formErrors.description ? 'border-red-300 bg-red-50' : 'border-gray-200'
                    }`}
                    placeholder="Enter topic description..."
                  />
                  {formErrors.description && (
                    <p className="mt-1 text-sm text-red-600">{formErrors.description}</p>
                  )}
                </div>
              </div>
              
              <div className="flex items-center gap-3 mt-6">
                <button
                  type="button"
                  onClick={closeModals}
                  className="flex-1 px-4 py-2 border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitLoading}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                >
                  {submitLoading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Creating...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      Create Topic
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Topic Modal */}
      {isEditModalOpen && selectedTopic && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl w-full max-w-md mx-4">
            <div className="p-6 border-b border-gray-100 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Edit Topic</h3>
                <button
                  onClick={closeModals}
                  className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
            
            <form onSubmit={handleUpdateTopic} className="p-6">
              {editLoading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
                  <span className="ml-3 text-gray-600">Loading topic data...</span>
                </div>
              ) : (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Title *
                    </label>
                    <input
                      type="text"
                      value={formData.title}
                      onChange={(e) => handleInputChange('title', e.target.value)}
                      className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        formErrors.title ? 'border-red-300 bg-red-50' : 'border-gray-200'
                      }`}
                      placeholder="Enter topic title..."
                    />
                    {formErrors.title && (
                      <p className="mt-1 text-sm text-red-600">{formErrors.title}</p>
                    )}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Description *
                    </label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => handleInputChange('description', e.target.value)}
                      rows={4}
                      className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none ${
                        formErrors.description ? 'border-red-300 bg-red-50' : 'border-gray-200'
                      }`}
                      placeholder="Enter topic description..."
                    />
                    {formErrors.description && (
                      <p className="mt-1 text-sm text-red-600">{formErrors.description}</p>
                    )}
                  </div>
                </div>
              )}
              
              <div className="flex items-center gap-3 mt-6">
                <button
                  type="button"
                  onClick={closeModals}
                  className="flex-1 px-4 py-2 border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitLoading || editLoading}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                >
                  {submitLoading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Updating...
                    </>
                  ) : editLoading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Loading...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      Update Topic
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Course/Career Path Mapping Modal */}
      {showMappingModal && selectedTopicForMapping && (
        <div className="fixed inset-0 z-50 overflow-auto bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-4xl w-full max-h-screen overflow-y-auto transform transition-all">
            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/20 rounded-lg flex items-center justify-center">
                  <Users className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Topic Mapping</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    Topic: {selectedTopicForMapping.title}
                  </p>
                </div>
              </div>
              <button
                onClick={closeMappingModal}
                className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6">
              {/* Type Selector Dropdown */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Mapping Type
                </label>
                <select
                  value={mappingType}
                  onChange={(e) => {
                    const newType = parseInt(e.target.value);
                    setMappingType(newType);
                    if (newType === 1) {
                      setMappedCourses([]);
                      setSearchTermMapping('');
                      setAvailableCourses([]);
                      fetchMappedCourses(selectedTopicForMapping.id);
                    } else if (newType === 2) {
                      setMappedCareerPaths([]);
                      setSearchTermMapping('');
                      setAvailableCourses([]);
                      fetchMappedCareerPaths(selectedTopicForMapping.id);
                    } else {
                      setMappedSubcategories([]);
                      setSearchTermMapping('');
                      setAvailableCourses([]);
                      fetchMappedSubcategories(selectedTopicForMapping.id);
                    }
                  }}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value={1}>Courses</option>
                  <option value={2}>Career Paths</option>
                  <option value={3}>Subcategories</option>
                </select>
              </div>

              {/* Search */}
              <div className="mb-6">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    placeholder={mappingType === 1 ? "Search courses by title..." : mappingType === 2 ? "Search career paths by title..." : "Search subcategories by name..."}
                    value={searchTermMapping}
                    onChange={(e) => handleMappingSearch(e.target.value)}
                    className={`pl-9 pr-${searchLoading && mappingType === 3 ? '10' : '3'} py-2.5 text-sm border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent w-full`}
                  />
                  {searchLoading && mappingType === 3 && (
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                    </div>
                  )}
                </div>
              </div>

              {/* Mapped Items */}
              <div className="mb-6">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-3">
                  Mapped {mappingType === 1 ? 'Courses' : mappingType === 2 ? 'Career Paths' : 'Subcategories'} ({mappingType === 1 ? mappedCourses.length : mappingType === 2 ? mappedCareerPaths.length : mappedSubcategories.length})
                </h3>
                {(mappingType === 1 && loadingMappedCourses) || (mappingType === 2 && loadingMappedCareerPaths) ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="w-6 h-6 border-2 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
                    <span className="ml-2 text-gray-600">Loading mapped {mappingType === 1 ? 'courses' : mappingType === 2 ? 'career paths' : 'subcategories'}...</span>
                  </div>
                ) : (mappingType === 1 ? mappedCourses.length : mappingType === 2 ? mappedCareerPaths.length : mappedSubcategories.length) === 0 ? (
                  <div className="text-center py-8 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <BookOpen className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-gray-600 dark:text-gray-300">No {mappingType === 1 ? 'courses' : mappingType === 2 ? 'career paths' : 'subcategories'} mapped yet</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-2">
                    {(mappingType === 1 ? mappedCourses : mappingType === 2 ? mappedCareerPaths : mappedSubcategories).map((item) => (
                      <div
                        key={item.id}
                        className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg"
                      >
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900 dark:text-white">
                            {mappingType === 3 ? (item.name || item.title) : item.title}
                          </h4>
                          {item.description && (
                            <p className="text-sm text-gray-600 dark:text-gray-300">{item.description}</p>
                          )}
                        </div>
                        <button
                          onClick={() => mappingType === 1 ? toggleCourseAssignment(item) : mappingType === 2 ? toggleCareerPathAssignment(item) : toggleSubcategoryAssignment(item)}
                          className="p-2 text-red-600 hover:bg-red-100 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                          title="Remove mapping"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Available Courses */}
              {searchTermMapping && (
                <div className="mb-6">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-3">
                    Available {mappingType === 1 ? 'Courses' : mappingType === 2 ? 'Career Paths' : 'Subcategories'} ({availableCourses.length})
                  </h3>
                  {loadingAvailableCourses || (mappingType === 3 && searchLoading) ? (
                    <div className="flex items-center justify-center py-8">
                      <div className="w-6 h-6 border-2 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
                      <span className="ml-2 text-gray-600">
                        Searching {mappingType === 1 ? 'courses' : mappingType === 2 ? 'career paths' : 'subcategories'}...
                      </span>
                    </div>
                  ) : availableCourses.length === 0 ? (
                    <div className="text-center py-8 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <Search className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                      <p className="text-gray-600 dark:text-gray-300">
                        No {mappingType === 1 ? 'courses' : mappingType === 2 ? 'career paths' : 'subcategories'} found
                      </p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 gap-2">
                      {availableCourses.map((course) => (
                        <div
                          key={course.id}
                          className={`flex items-center justify-between p-3 border rounded-lg transition-colors ${
                            course.isSelected 
                              ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800' 
                              : 'bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-600'
                          }`}
                        >
                          <div className="flex-1">
                            <h4 className="font-medium text-gray-900 dark:text-white">{course.title}</h4>
                            {course.description && (
                              <p className="text-sm text-gray-600 dark:text-gray-300">{course.description}</p>
                            )}
                          </div>
                          <button
                            onClick={() => mappingType === 1 ? toggleCourseAssignment(course) : mappingType === 2 ? toggleCareerPathAssignment(course) : toggleSubcategoryAssignment(course)}
                            className={`p-2 rounded-lg transition-colors ${
                              course.isSelected
                                ? 'text-gray-400 bg-gray-100 dark:bg-gray-600 cursor-not-allowed'
                                : 'text-blue-600 hover:bg-blue-100 dark:hover:bg-blue-900/20'
                            }`}
                            title={course.isSelected ? "Already mapped" : "Add mapping"}
                          >
                            {course.isSelected ? (
                              <div className="flex items-center">
                                <div className="w-4 h-4 border-2 border-gray-300 border-t-transparent rounded-full"></div>
                                <span className="ml-2 text-sm">Added</span>
                              </div>
                            ) : (
                              <Plus className="w-4 h-4" />
                            )}
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Actions */}
              <div className="flex items-center gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                <button
                  onClick={closeMappingModal}
                  className="flex-1 px-4 py-2 border border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={saveMappings}
                  className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  Save Mappings
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const TopicManagementComponent = TopicManagement;

export default TopicManagementComponent;
