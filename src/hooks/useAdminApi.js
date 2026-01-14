import { useState, useEffect } from 'react';
import { apiService } from '../services/api';
import { useAuth } from '../context/AuthContext';

export const useAdminApi= () => {
  const { user } = useAuth();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const checkAuth = async () => {
      if (!user?.roleId) {
        setLoading(false);
        return;
      }

      try {
        const GetCourses = await apiService.getAllCourses();
        setCourses(GetCourses);
      } catch (err) {
        setError('Failed to load routes');
        console.error('Error loading routes:', err);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, [user]);

  // Get icon component by name
 

  return {
   
    loading,
    error,
   courses
  };
};
