import { useState, useCallback } from 'react';
import ApiService from '../../services/ApiService';

export const useCourseContent = () => {
  const [courseContent, setCourseContent] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchCourseContent = useCallback(async (lectureId) => {
    if (!lectureId) {
      setError('Lecture ID is required');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await ApiService.getCourseLectureContent(lectureId);
      
      if (response && response.success) {
        setCourseContent(response.data);
      } else {
        setError('Failed to load course content');
      }
    } catch (err) {
      console.error('Error fetching course content:', err);
      if (err.response?.status === 404) {
        setError('Course content not found');
      } else if (err.response?.status === 403) {
        setError('Access denied');
      } else {
        setError('Failed to load course content. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  }, []);

  const clearContent = useCallback(() => {
    setCourseContent(null);
    setError(null);
    setLoading(false);
  }, []);

  return {
    courseContent,
    loading,
    error,
    fetchCourseContent,
    clearContent
  };
};
