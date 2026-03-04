import { useState, useCallback } from 'react';
import { adminApiService } from '../services/AdminApi';
import { API_CONFIG } from '../config/api';
import { isProduction } from '../config/appSettings';
import apiHelper from '../services/apiHelper';

const getApiUrl = () => isProduction() ? API_CONFIG.BASE_URL : API_CONFIG.BASE_URL_Local;

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
      const response = await adminApiService.getCareerPathLevels();
      console.log('API response for levels:', response);
      const levelsData = Array.isArray(response) ? response.map(level => ({
        ...level,
        levelId: level.id, // Map 'id' to 'levelId' for consistency
        levelMapId: level.id // Also map to levelMapId
      })) : [];
      console.log('Processed levelsData:', levelsData);
      setLevels(levelsData);
      return levelsData;
    } catch (err) {
      console.error('Error fetching levels:', err);
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
      
      let response;
      let skillsData = [];
      
      try {
        // First try the career skills endpoint
        response = await adminApiService.getAllCareerSkills();
        
        // Handle the API response structure where skills are in items array
        skillsData = response.items || response || [];
        
      } catch (careerSkillsError) {
        console.warn('Career skills endpoint failed, trying /skills endpoint:', careerSkillsError);
        
        // If career skills fails, try the /skills endpoint directly
        const skillsUrl = `/skills`;
        const skillsResponse = await apiHelper.get(skillsUrl);
        
        if (skillsResponse.ok) {
          response = await skillsResponse.json();
          
          // Handle the API response structure where skills are in items array
          skillsData = response.items || response || [];
        } else {
          throw new Error('Both skill endpoints failed');
        }
      }
      
      const transformedSkills = Array.isArray(skillsData) ? skillsData.map(skill => ({
        id: skill.id,
        name: skill.title || skill.name, // Use title from API response as name
        description: skill.description || skill.name,
        category: 'Skill' // Add default category since API doesn't provide one
      })) : [];
      
      setSkills(transformedSkills);
      return transformedSkills;
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
      const response = await adminApiService.getCareerRoles();
      // Handle the API response structure where roles are in items array
      const rolesData = response.items || response || [];
      const transformedRoles = Array.isArray(rolesData) ? rolesData.map(role => ({
        id: role.id,
        name: role.name,
        description: role.description
      })) : [];
      setCareerRoles(transformedRoles);
      return transformedRoles;
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
      const response = await adminApiService.getCourseTypes();
      const typesData = Array.isArray(response) ? response : [];
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
      const response = await adminApiService.getAllCourseBadgesNew();
      // Handle the API response structure where badges are in items array
      const badgesData = response.items || response || [];
      // Transform badge data to match MultiSelectDropdown expectations
      const transformedBadges = Array.isArray(badgesData) ? badgesData.map(badge => ({
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

  // Search courses by title
  const searchCoursesByTitle = useCallback(async (title, levelId = null) => {
    try {
      setLoading(true);
      setError(null);
      
      // Determine course type ID based on level
      let courseTypeId = 1; // default
      if (levelId) {
        const numericLevelId = parseInt(levelId);
        // If course level is 1 or 2, coursetypeid will be 2, else coursetypeid will be 1
        courseTypeId = (numericLevelId === 1 || numericLevelId === 2) ? 2 : 1;
      }
      
      const data = await adminApiService.getAllCoursesAdminNoPagination({ 
        Title: title,
        CourseTypeId: courseTypeId
      });
      // Handle response structure where courses are in an 'items' array
      const courses = data.items || data || [];
      return Array.isArray(courses) ? courses : [];
    } catch (err) {
      handleError('Failed to search courses by title', err);
      return [];
    } finally {
      setLoading(false);
    }
  }, [handleError]);

  // Search skills by name/title
  const searchSkillsByTitle = useCallback(async (searchTerm) => {
    try {
      setLoading(true);
      setError(null);
      
      let skillsData = [];
      
      try {
        // Use the pagination endpoint with search parameter
        const response = await adminApiService.getAllSkillsWithPagination(`search=${encodeURIComponent(searchTerm)}`);
        skillsData = response.items || response || [];
        
      } catch (skillsError) {
        console.warn('Skills search failed, trying fallback:', skillsError);
        
        // Fallback: try career skills endpoint
        try {
          const careerResponse = await adminApiService.getAllCareerSkills();
          const allCareerSkills = careerResponse.items || careerResponse || [];
          
          // Filter client-side as fallback
          skillsData = allCareerSkills.filter(skill => 
            (skill.title || skill.name || '').toLowerCase().includes(searchTerm.toLowerCase())
          );
        } catch (fallbackError) {
          console.warn('Fallback also failed:', fallbackError);
          throw new Error('All skill search methods failed');
        }
      }
      
      const transformedSkills = Array.isArray(skillsData) ? skillsData.map(skill => ({
        id: skill.id || skill.skillId || skill.skillMapId, // Try multiple possible ID fields
        name: skill.title || skill.name,
        description: skill.description || skill.name,
        category: 'Skill'
      })) : [];
      
      return transformedSkills;
    } catch (err) {
      handleError('Failed to search skills', err);
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
      
      // Try to load all data, but don't fail completely if one fails
      const results = await Promise.allSettled([
        getCareerPathLevels(),
        getAllSkills(),
        getCareerRoles(),
        getCourseTypes(),
        getBadges()
      ]);
      
      // Log any failures but don't throw
      results.forEach((result, index) => {
        const apiNames = ['levels', 'skills', 'careerRoles', 'courseTypes', 'badges'];
        if (result.status === 'rejected') {
          console.warn(`Failed to load ${apiNames[index]}:`, result.reason);
        }
      });
      
      // Return successful results
      return {
        levels: results[0].status === 'fulfilled' ? results[0].value : [],
        skills: results[1].status === 'fulfilled' ? results[1].value : [],
        careerRoles: results[2].status === 'fulfilled' ? results[2].value : [],
        courseTypes: results[3].status === 'fulfilled' ? results[3].value : [],
        badges: results[4].status === 'fulfilled' ? results[4].value : []
      };
    } catch (err) {
      console.error('Critical error in initializeDropdownData:', err);
      setError('Failed to initialize form data');
      // Don't throw - allow form to render with empty dropdowns
    } finally {
      setLoading(false);
    }
  }, [getCareerPathLevels, getAllSkills, getCareerRoles, getCourseTypes, getBadges]);

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
    searchCoursesByTitle,
    searchSkillsByTitle,
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
