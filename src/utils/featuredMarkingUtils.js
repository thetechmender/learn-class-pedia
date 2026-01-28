/**
 * Utility functions for featured marking management
 */

/**
 * Calculate badge statistics
 * @param {Array} badges - Array of badges
 * @returns {Object} Statistics object
 */
export const calculateBadgeStats = (badges) => {
  if (!badges || badges.length === 0) {
    return {
      totalBadges: 0,
      activeBadges: 0,
      featuredBadges: 0,
      assignedBadges: 0
    };
  }
  
  return {
    totalBadges: badges.length,
    activeBadges: badges.filter(b => b.isActive).length,
    featuredBadges: badges.filter(b => b.isFeatured).length,
    assignedBadges: badges.filter(b => b.courseCount > 0).length
  };
};

/**
 * Filter badges based on search term and filters
 * @param {Array} badges - Array of badges
 * @param {string} searchTerm - Search term
 * @param {Object} filters - Filter object
 * @returns {Array} Filtered badges
 */
export const filterBadgesBySearch = (badges, searchTerm, filters = {}) => {
  if (!badges) return [];
  
  let filtered = badges;
  
  // Apply search term
  if (searchTerm) {
    const lowercaseSearch = searchTerm.toLowerCase();
    filtered = filtered.filter(badge =>
      badge.badgeName?.toLowerCase().includes(lowercaseSearch) ||
      badge.description?.toLowerCase().includes(lowercaseSearch) ||
      badge.badgeType?.toLowerCase().includes(lowercaseSearch)
    );
  }
  
  // Apply other filters
  if (filters.badgeId) {
    filtered = filtered.filter(badge => badge.id === filters.badgeId);
  }
  
  if (filters.categoryId) {
    filtered = filtered.filter(badge => 
      badge.categories?.some(cat => cat.id === filters.categoryId)
    );
  }
  
  if (filters.courseTypeId) {
    filtered = filtered.filter(badge => 
      badge.courseTypes?.some(type => type.id === filters.courseTypeId)
    );
  }
  
  if (filters.courseLevelId) {
    filtered = filtered.filter(badge => 
      badge.courseLevels?.some(level => level.id === filters.courseLevelId)
    );
  }
  
  if (filters.isFeatured !== '') {
    const isFeatured = filters.isFeatured === 'true';
    filtered = filtered.filter(badge => badge.isFeatured === isFeatured);
  }
  
  return filtered;
};

/**
 * Validate badge form data
 * @param {Object} formData - Form data to validate
 * @returns {Object} Validation result with errors and isValid
 */
export const validateBadgeForm = (formData) => {
  const errors = {};
  
  if (!formData.badgeName?.trim()) {
    errors.badgeName = 'Badge name is required';
  } else if (formData.badgeName.trim().length < 2) {
    errors.badgeName = 'Badge name must be at least 2 characters';
  } else if (formData.badgeName.trim().length > 50) {
    errors.badgeName = 'Badge name cannot exceed 50 characters';
  }
  
  if (formData.description && formData.description.length > 200) {
    errors.description = 'Description cannot exceed 200 characters';
  }
  
  if (formData.badgeIcon && formData.badgeIcon.length > 50) {
    errors.badgeIcon = 'Badge icon cannot exceed 50 characters';
  }
  
  return {
    errors,
    isValid: Object.keys(errors).length === 0
  };
};

/**
 * Format badge data for API submission
 * @param {Object} formData - Form data
 * @returns {Object} Formatted data for API
 */
export const formatBadgeDataForAPI = (formData) => {
  return {
    ...formData,
    // Ensure boolean values are properly formatted
    isActive: Boolean(formData.isActive),
    isFeatured: Boolean(formData.isFeatured),
    // Trim string values
    badgeName: formData.badgeName?.trim(),
    description: formData.description?.trim(),
    badgeIcon: formData.badgeIcon?.trim()
  };
};

/**
 * Get badge color based on type
 * @param {string} badgeType - Badge type
 * @returns {string} Color class
 */
export const getBadgeColor = (badgeType) => {
  const colorMap = {
    achievement: 'bg-yellow-100 text-yellow-800 border-yellow-300',
    completion: 'bg-green-100 text-green-800 border-green-300',
    excellence: 'bg-purple-100 text-purple-800 border-purple-300',
    featured: 'bg-blue-100 text-blue-800 border-blue-300',
    default: 'bg-gray-100 text-gray-800 border-gray-300'
  };
  
  return colorMap[badgeType] || colorMap.default;
};

/**
 * Get badge icon based on type
 * @param {string} badgeType - Badge type
 * @returns {string} Icon name
 */
export const getBadgeIcon = (badgeType) => {
  const iconMap = {
    achievement: '🏆',
    completion: '✅',
    excellence: '⭐',
    featured: '🌟',
    default: '🎖️'
  };
  
  return iconMap[badgeType] || iconMap.default;
};

/**
 * Sort badges by different criteria
 * @param {Array} badges - Array of badges
 * @param {string} sortBy - Sort criteria
 * @param {string} sortOrder - Sort order ('asc' or 'desc')
 * @returns {Array} Sorted badges
 */
export const sortBadges = (badges, sortBy = 'badgeName', sortOrder = 'asc') => {
  return [...badges].sort((a, b) => {
    let aValue = a[sortBy];
    let bValue = b[sortBy];
    
    // Handle string comparison
    if (typeof aValue === 'string') {
      aValue = aValue.toLowerCase();
      bValue = bValue.toLowerCase();
    }
    
    if (sortOrder === 'desc') {
      return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
    }
    
    return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
  });
};

/**
 * Generate cache key for API calls
 * @param {string} method - API method name
 * @param {...any} args - Arguments for the method
 * @returns {string} Cache key
 */
export const generateCacheKey = (method, ...args) => {
  return `${method}:${JSON.stringify(args)}`;
};

/**
 * Check if cache entry is still valid
 * @param {Object} cacheEntry - Cache entry with timestamp
 * @param {number} ttl - Time to live in milliseconds
 * @returns {boolean} Whether cache is valid
 */
export const isCacheValid = (cacheEntry, ttl) => {
  if (!cacheEntry || !cacheEntry.timestamp) return false;
  return Date.now() - cacheEntry.timestamp < ttl;
};

/**
 * Calculate badge assignment statistics
 * @param {Object} badge - Badge object with courses
 * @returns {Object} Assignment statistics
 */
export const calculateBadgeAssignmentStats = (badge) => {
  const courses = badge.courses || [];
  
  return {
    totalAssigned: courses.length,
    activeCourses: courses.filter(c => c.isActive).length,
    totalStudents: courses.reduce((sum, course) => sum + (course.studentsCount || 0), 0),
    averageRating: courses.length > 0 
      ? courses.reduce((sum, course) => sum + (course.averageRating || 0), 0) / courses.length 
      : 0
  };
};
