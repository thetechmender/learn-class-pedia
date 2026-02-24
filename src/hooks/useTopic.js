import { useState, useCallback,useEffect } from 'react';
import { adminApiService } from '../services/AdminApi';

export const useTopic = () => {

  // Global state
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Data states
  const [topics, setTopics] = useState([]);

  // Error handling helper
  const handleError = useCallback((message, err) => {
    console.error(message, err);
    setError(message);
    throw err;
  }, []);

  // Clear error
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Get all topics
  const getAllTopics = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await adminApiService.get('/Topic');
      const topicsData = response.items || response || [];
      setTopics(Array.isArray(topicsData) ? topicsData : []);
      return Array.isArray(topicsData) ? topicsData : [];
    } catch (err) {
      handleError('Failed to fetch topics', err);
      return [];
    } finally {
      setLoading(false);
    }
  }, [handleError]);

  // Get topic by ID
  const getTopicById = useCallback(async (id) => {
    try {
      setLoading(true);
      setError(null);
      const response = await adminApiService.get(`/Topic/${id}`);
      return response;
    } catch (err) {
      handleError('Failed to fetch topic', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [handleError]);

  // Create new topic
  const createTopic = useCallback(async (topicData) => {
    try {
      setLoading(true);
      setError(null);
      const response = await adminApiService.post('/Topic', topicData);
      
      // Refresh topics list after creation
      await getAllTopics();
      
      return response;
    } catch (err) {
      handleError('Failed to create topic', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [handleError, getAllTopics]);

  // Update topic
  const updateTopic = useCallback(async (id, topicData) => {
    try {
      setLoading(true);
      setError(null);
      const response = await adminApiService.put(`/Topic/${id}`, topicData);
      
      // Refresh topics list after update
      await getAllTopics();
      
      return response;
    } catch (err) {
      handleError('Failed to update topic', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [handleError, getAllTopics]);

  // Delete topic
  const deleteTopic = useCallback(async (id) => {
    try {
      setLoading(true);
      setError(null);
      const response = await adminApiService.delete(`/Topic/${id}`);
      
      // Refresh topics list after deletion
      await getAllTopics();
      
      return response;
    } catch (err) {
      handleError('Failed to delete topic', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [handleError, getAllTopics]);

  // Course Topic Mapping functions
  
  // Cache for courses to avoid repeated API calls
  const [coursesCache, setCoursesCache] = useState(null);

  // Get courses mapped to a topic
  const getTopicMapping = useCallback(async (topicId) => {
    try {
      setLoading(true);
      setError(null);
      const response = await adminApiService.get(`/CourseTopicMapping/${topicId}`);
      console.log('Get topic mapping response:', response);
      return response;
    } catch (err) {
      console.error('Failed to fetch topic mapping:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [handleError]);

  // Create course topic mapping
  const createCourseTopicMapping = useCallback(async (mappingData) => {
    try {
      setLoading(true);
      setError(null);
      console.log('Creating course topic mapping with payload:', mappingData);
      const response = await adminApiService.post('/CourseTopicMapping/assign', mappingData);
      console.log('Create mapping response:', response);
      return response;
    } catch (err) {
      console.error('Create course topic mapping error:', err);
      handleError('Failed to create course topic mapping', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [handleError]);

  // Delete course topic mapping
  const deleteCourseTopicMapping = useCallback(async (topicId, courseId) => {
    try {
      setLoading(true);
      setError(null);
      const response = await adminApiService.delete(`/CourseTopicMapping/${topicId}/${courseId}`);
      return response;
    } catch (err) {
      handleError('Failed to delete course topic mapping', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [handleError]);

  // Get all courses for mapping
  const getAllCoursesForMapping = useCallback(async () => {
    // Return cached data immediately if available
    if (coursesCache) {
      return coursesCache;
    }
    
    try {
      // Don't set loading state to avoid blocking UI
      setError(null);
      const data = await adminApiService.getAllCoursesAdminNoPagination();
      // Handle response structure where courses are in an 'items' array
      const courses = data.items || data || [];
      const courseArray = Array.isArray(courses) ? courses : [];
      
      // Cache the results immediately
      setCoursesCache(courseArray);
      return courseArray;
    } catch (err) {
      handleError('Failed to get all courses for mapping', err);
      return [];
    }
  }, [handleError, coursesCache]);

  // Preload courses immediately when hook initializes
  useEffect(() => {
    if (!coursesCache) {
      getAllCoursesForMapping();
    }
  }, [coursesCache, getAllCoursesForMapping]);

  return {
    // Global state
    loading,
    error,
    clearError,

    // Data states
    topics,

    // API functions
    getAllTopics,
    getTopicById,
    createTopic,
    updateTopic,
    deleteTopic,

    // Course Topic Mapping functions
    getTopicMapping,
    createCourseTopicMapping,
    deleteCourseTopicMapping,
    getAllCoursesForMapping,
    coursesCache,
    setCoursesCache,

    // Setters for direct state management if needed
    setTopics,
  };
};
