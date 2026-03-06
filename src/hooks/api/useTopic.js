import { useState, useCallback,useEffect } from 'react';
import ApiService from '../../services/ApiService';

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
      const data = await ApiService.getAllTopics();
      const topicsData = data.items || data || [];
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
      const data = await ApiService.getTopicById(id);
      return data;
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
      const data = await ApiService.createTopic(topicData);
      
      // Refresh topics list after creation
      await getAllTopics();
      
      return data;
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
      const data = await ApiService.updateTopic(id, topicData);
      
      // Refresh topics list after update
      await getAllTopics();
      
      return data;
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
      const data = await ApiService.deleteTopic(id);
      
      // Refresh topics list after deletion
      await getAllTopics();
      
      return data;
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

  // Get items mapped to a topic (supports both courses and career paths)
  const getTopicMapping = useCallback(async (topicId, type = 1) => {
    try {
      setLoading(true);
      setError(null);
      const data = await ApiService.getTopicMapping(topicId, type);
     
      return data;
    } catch (err) {
      console.error('Failed to fetch topic mapping:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Create topic mapping assignment (handles both add and delete)
  const createTopicMapping = useCallback(async (mappingData) => {
    try {
      setLoading(true);
      setError(null);
      
      const data = await ApiService.createTopicMapping(mappingData);
     
      return data;
    } catch (err) {
      console.error('Create topic mapping error:', err);
      handleError('Failed to create topic mapping', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [handleError]);

  // Get all career paths for mapping
  const getAllCareerPathsForMapping = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await ApiService.getAllCareerPathsAdminNoPagination();
      // Handle response structure where career paths are in an 'items' array
      const careerPaths = data.items || data || [];
      return Array.isArray(careerPaths) ? careerPaths : [];
    } catch (err) {
      handleError('Failed to get all career paths for mapping', err);
      return [];
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
      const data = await ApiService.getAllCoursesAdminNoPagination();
      // Handle response structure where courses are in an 'items' array
      const courses = data.items || data || [];
      const courseArray = Array.isArray(courses) ? courses : [];
      
      // Cache the results immediately
      setCoursesCache(courseArray);
      return courseArray;
    } catch (err) {
      console.error('Failed to get all courses for mapping:', err);
      return [];
    }
  }, [coursesCache]);

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

    // Topic Mapping functions (unified for both courses and career paths)
    getTopicMapping,
    createTopicMapping,
    getAllCoursesForMapping,
    getAllCareerPathsForMapping,
    coursesCache,

    // Setters for direct state management if needed
    setTopics,
  };
};
