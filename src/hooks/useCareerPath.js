import { useState, useCallback, useEffect } from 'react';
import { adminApiService } from '../services/AdminApi';
import { API_CONFIG } from '../config/api';

export const useCareerPath = () => {
  // Global state
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Data states
  const [levels, setLevels] = useState([]);
  const [skills, setSkills] = useState([]);
  const [careerRoles, setCareerRoles] = useState([]);
  const [courseTypes, setCourseTypes] = useState([]);
  const [badges, setBadges] = useState([]);

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

  // Fetch career path levels
  const getCareerPathLevels = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(`${API_CONFIG.BASE_URL_Local}/career-paths/levels`, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
        }
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      const levelsData = Array.isArray(data) ? data : [];
      setLevels(levelsData);
      return levelsData;
    } catch (err) {
      handleError('Failed to fetch career path levels', err);
      return [];
    } finally {
      setLoading(false);
    }
  }, [handleError]);

  // Fetch all skills
  const getAllSkills = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(`${API_CONFIG.BASE_URL_Local}/careerskills`, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
        }
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      const skillsData = Array.isArray(data) ? data : [];
      setSkills(skillsData);
      return skillsData;
    } catch (err) {
      handleError('Failed to fetch skills', err);
      return [];
    } finally {
      setLoading(false);
    }
  }, [handleError]);

  // Fetch career roles
  const getCareerRoles = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(`${API_CONFIG.BASE_URL_Local}/career-roles`, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
        }
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      const rolesData = Array.isArray(data) ? data : [];
      setCareerRoles(rolesData);
      return rolesData;
    } catch (err) {
      handleError('Failed to fetch career roles', err);
      return [];
    } finally {
      setLoading(false);
    }
  }, [handleError]);

  // Fetch course types
  const getCourseTypes = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(`${API_CONFIG.BASE_URL_Local}/admin/course-types`, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
        }
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      const typesData = Array.isArray(data) ? data : [];
      setCourseTypes(typesData);
      return typesData;
    } catch (err) {
      handleError('Failed to fetch course types', err);
      return [];
    } finally {
      setLoading(false);
    }
  }, [handleError]);

  // Fetch badges
  const getBadges = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await adminApiService.getAllCourseBadgesNew();
      // Transform badge data to match MultiSelectDropdown expectations
      const transformedBadges = Array.isArray(data) ? data.map(badge => ({
        id: badge.id,
        name: badge.badgeName,
        description: badge.description
      })) : [];
      setBadges(transformedBadges);
      return transformedBadges;
    } catch (err) {
      handleError('Failed to fetch badges', err);
      return [];
    } finally {
      setLoading(false);
    }
  }, [handleError]);

  // Fetch courses by type for level
  const getCoursesByTypeForLevel = useCallback(async (typeId) => {
    try {
      setLoading(true);
      setError(null);
      const data = await adminApiService.getAllCoursesAdminNoPagination({ CourseTypeId: typeId });
      // Handle the response structure where courses are in an 'items' array
      const courses = data.items || data || [];
      return Array.isArray(courses) ? courses : [];
    } catch (err) {
      handleError('Failed to fetch courses by type for level', err);
      return [];
    } finally {
      setLoading(false);
    }
  }, [handleError]);

  // Create career path
  const createCareerPath = useCallback(async (careerPathData) => {
    try {
      setLoading(true);
      setError(null);
      const data = await adminApiService.createCareerPath(careerPathData);
      return data;
    } catch (err) {
      handleError('Failed to create career path', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [handleError]);

  // Update career path
  const updateCareerPath = useCallback(async (careerPathId, careerPathData) => {
    try {
      setLoading(true);
      setError(null);
      const data = await adminApiService.updateCareerPath(careerPathId, careerPathData);
      return data;
    } catch (err) {
      handleError('Failed to update career path', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [handleError]);

  // Delete career path
  const deleteCareerPath = useCallback(async (careerPathId) => {
    try {
      setLoading(true);
      setError(null);
      const data = await adminApiService.deleteCareerPath(careerPathId);
      return data;
    } catch (err) {
      handleError('Failed to delete career path', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [handleError]);

  // Get career path by ID
  const getCareerPathById = useCallback(async (careerPathId) => {
    try {
      setLoading(true);
      setError(null);
      const data = await adminApiService.getCareerPathById(careerPathId);
      return data;
    } catch (err) {
      handleError('Failed to fetch career path', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [handleError]);

  // Get all career paths
  const getAllCareerPaths = useCallback(async (filters = {}) => {
    try {
      setLoading(true);
      setError(null);
      const data = await adminApiService.getAllCareerPaths(filters);
      return data;
    } catch (err) {
      handleError('Failed to fetch career paths', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [handleError]);

  // Initialize all dropdown data
  const initializeDropdownData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const [levelsRes, skillsRes, careerRolesRes, courseTypesRes, badgesRes] = await Promise.all([
        getCareerPathLevels(),
        getAllSkills(),
        getCareerRoles(),
        getCourseTypes(),
        getBadges()
      ]);
      
      return {
        levels: levelsRes,
        skills: skillsRes,
        careerRoles: careerRolesRes,
        courseTypes: courseTypesRes,
        badges: badgesRes
      };
    } catch (err) {
      handleError('Failed to initialize dropdown data', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [getCareerPathLevels, getAllSkills, getCareerRoles, getCourseTypes, getBadges, handleError]);

  return {
    // Global state
    loading,
    error,
    clearError,

    // Data states
    levels,
    skills,
    careerRoles,
    courseTypes,
    badges,

    // API functions
    getCareerPathLevels,
    getAllSkills,
    getCareerRoles,
    getCourseTypes,
    getBadges,
    getCoursesByTypeForLevel,
    createCareerPath,
    updateCareerPath,
    deleteCareerPath,
    getCareerPathById,
    getAllCareerPaths,
    initializeDropdownData,

    // Setters for direct state management if needed
    setLevels,
    setSkills,
    setCareerRoles,
    setCourseTypes,
    setBadges,
  };
};
