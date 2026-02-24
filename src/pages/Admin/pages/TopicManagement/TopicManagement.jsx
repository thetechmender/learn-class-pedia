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
import { useTopic } from '../../../../hooks/useTopic';

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
    createCourseTopicMapping,
    deleteCourseTopicMapping,
    getAllCoursesForMapping,
    coursesCache,
    setCoursesCache,
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

  // Load topics on component mount
  useEffect(() => {
    getAllTopics();
    // Load all courses once for mapping functionality
    if (allCourses.length === 0) {
      getAllCoursesForMapping().then(courses => {
        setAllCourses(courses);
      });
    }
  }, [getAllTopics, getAllCoursesForMapping, allCourses.length]);

  // Debounce search term to avoid excessive filtering
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTermMapping);
    }, 300); // 300ms delay

    return () => clearTimeout(timer);
  }, [searchTermMapping]);

  // Memoized filtered courses for instant search results
  const filteredAvailableCourses = useMemo(() => {
    if (!debouncedSearchTerm.trim()) return [];
    
    const mappedIds = Array.isArray(mappedCourses) ? mappedCourses.map(course => course.courseId || course.id) : [];
    
    return allCourses.filter(course => 
      course.title && course.title.toLowerCase().includes(debouncedSearchTerm.toLowerCase())
    ).map(course => ({
      ...course,
      isSelected: mappedIds.includes(course.id)
    }));
  }, [allCourses, debouncedSearchTerm, mappedCourses]);

  // Update available courses when filtered results change
  useEffect(() => {
    setAvailableCourses(filteredAvailableCourses);
    setLoadingAvailableCourses(false);
  }, [filteredAvailableCourses]);

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
      const result = await getTopicMapping(topicId);
      console.log('Get topic mapping response:', result);
      
      // Handle different response formats
      let courses = [];
      if (result && result.success === true && Array.isArray(result.courseIds)) {
        // API returns {success: true, topicId: X, courseIds: [id1, id2, ...]}
        // Use local cache instead of API call for better performance
        const allCoursesData = allCourses.length > 0 ? allCourses : await getAllCoursesForMapping();
        const mappedIds = result.courseIds;
        
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
      
      console.log('Processed mapped courses:', courses);
      setMappedCourses(Array.isArray(courses) ? courses : []);
    } catch (err) {
      console.error('Failed to fetch mapped courses:', err);
      setMappedCourses([]);
    } finally {
      setLoadingMappedCourses(false);
    }
  }, [getTopicMapping, allCourses, getAllCoursesForMapping]);

  // Open mapping modal
  const openMappingModal = useCallback((topic) => {
    setSelectedTopicForMapping(topic);
    setShowMappingModal(true);
    setMappedCourses([]);
    setSearchTermMapping('');
    setAvailableCourses([]);
    fetchMappedCourses(topic.id);
  }, [fetchMappedCourses]);

  // Close mapping modal
  const closeMappingModal = useCallback(() => {
    setShowMappingModal(false);
    setSelectedTopicForMapping(null);
    setMappedCourses([]);
    setSearchTermMapping('');
    setAvailableCourses([]);
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
      setMappedCourses(prev => [...(Array.isArray(prev) ? prev : []), { ...course, courseId: course.id }]);
    }
  }, [mappedCourses]);

  // Save course mappings
  const saveCourseMappings = useCallback(async () => {
    if (!selectedTopicForMapping) return;

    try {
      // Get current mapped courses from API
      const currentMappings = await getTopicMapping(selectedTopicForMapping.id);
      // Ensure currentMappings is an array and handle different response formats
      const currentArray = currentMappings?.items || currentMappings || [];
      const currentIds = Array.isArray(currentArray) ? currentArray.map(m => m.courseId || m.id) : [];
      
      // Get new mapped course IDs
      const newIds = Array.isArray(mappedCourses) ? mappedCourses.map(m => m.courseId || m.id) : [];
      
      // Find courses to add (in new but not in current)
      const toAdd = newIds.filter(id => !currentIds.includes(id));
      
      // Find courses to remove (in current but not in new)
      const toRemove = currentIds.filter(id => !newIds.includes(id));
      
      console.log('Saving course mappings:', {
        topicId: selectedTopicForMapping.id,
        currentIds,
        newIds,
        toAdd,
        toRemove
      });
      
      // Add new mappings using the correct payload format
      for (const courseId of toAdd) {
        const mappingData = {
          topicId: selectedTopicForMapping.id,
          courseIds: [courseId]
        };
        console.log('Creating mapping:', mappingData);
        await createCourseTopicMapping(mappingData);
      }
      
      // Remove mappings
      for (const courseId of toRemove) {
        console.log('Removing mapping:', { topicId: selectedTopicForMapping.id, courseId });
        await deleteCourseTopicMapping(selectedTopicForMapping.id, courseId);
      }
      
      closeMappingModal();
      // Show success message (you might want to add a toast notification)
      console.log('Course mappings saved successfully');
    } catch (err) {
      console.error('Failed to save course mappings:', err);
    }
  }, [selectedTopicForMapping, mappedCourses, getTopicMapping, createCourseTopicMapping, deleteCourseTopicMapping, closeMappingModal]);

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
                      className="p-2 text-green-600 hover:bg-green-100 dark:hover:bg-green-900/20 rounded-lg transition-colors"
                      title="Map Courses"
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

      {/* Course Mapping Modal */}
      {showMappingModal && selectedTopicForMapping && (
        <div className="fixed inset-0 z-50 overflow-auto bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-4xl w-full max-h-screen overflow-y-auto transform transition-all">
            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-100 dark:bg-green-900/20 rounded-lg flex items-center justify-center">
                  <Users className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Map Courses to Topic</h2>
                  <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                    Assign courses to "{selectedTopicForMapping.title}"
                  </p>
                </div>
              </div>
              <button
                onClick={closeMappingModal}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                <X size={20} className="text-gray-500" />
              </button>
            </div>

            <div className="p-6">
              {/* Search */}
              <div className="mb-6">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    placeholder="Search courses by title..."
                    value={searchTermMapping}
                    onChange={(e) => handleMappingSearch(e.target.value)}
                    className="pl-9 pr-3 py-2.5 text-sm border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent w-full"
                  />
                </div>
              </div>

              {/* Mapped Courses */}
              <div className="mb-6">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-3">
                  Mapped Courses ({mappedCourses.length})
                </h3>
                {loadingMappedCourses ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="w-6 h-6 border-2 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
                    <span className="ml-2 text-gray-600">Loading mapped courses...</span>
                  </div>
                ) : mappedCourses.length === 0 ? (
                  <div className="text-center py-8 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <BookOpen className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-gray-600 dark:text-gray-300">No courses mapped yet</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-2">
                    {mappedCourses.map((course) => (
                      <div
                        key={course.courseId || course.id}
                        className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg"
                      >
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900 dark:text-white">{course.title}</h4>
                          {course.description && (
                            <p className="text-sm text-gray-600 dark:text-gray-300">{course.description}</p>
                          )}
                        </div>
                        <button
                          onClick={() => toggleCourseAssignment(course)}
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
                    Available Courses ({availableCourses.length})
                  </h3>
                  {loadingAvailableCourses ? (
                    <div className="flex items-center justify-center py-8">
                      <div className="w-6 h-6 border-2 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
                      <span className="ml-2 text-gray-600">Searching courses...</span>
                    </div>
                  ) : availableCourses.length === 0 ? (
                    <div className="text-center py-8 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <Search className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                      <p className="text-gray-600 dark:text-gray-300">No courses found</p>
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
                            onClick={() => toggleCourseAssignment(course)}
                            className={`p-2 rounded-lg transition-colors ${
                              course.isSelected
                                ? 'text-gray-400 bg-gray-100 dark:bg-gray-600 cursor-not-allowed'
                                : 'text-green-600 hover:bg-green-100 dark:hover:bg-green-900/20'
                            }`}
                            title={course.isSelected ? "Already mapped" : "Add mapping"}
                            disabled={course.isSelected}
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
                  onClick={saveCourseMappings}
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

export default TopicManagement;
