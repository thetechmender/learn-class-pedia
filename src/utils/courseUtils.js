/**
 * Utility functions for course management
 */

/**
 * Calculate course statistics
 * @param {Array} courses - Array of courses
 * @returns {Object} Statistics object
 */
export const calculateCourseStats = (courses) => {
  if (!courses || courses.length === 0) {
    return {
      totalCourses: 0,
      activeCourses: 0,
      paidCourses: 0,
      freeCourses: 0
    };
  }
  
  return {
    totalCourses: courses.length,
    activeCourses: courses.filter(c => c.isActive).length,
    paidCourses: courses.filter(c => c.isPaid).length,
    freeCourses: courses.filter(c => !c.isPaid).length
  };
};

/**
 * Filter courses based on search term
 * @param {Array} courses - Array of courses
 * @param {string} searchTerm - Search term
 * @returns {Array} Filtered courses
 */
export const filterCoursesBySearch = (courses, searchTerm) => {
  if (!courses || !searchTerm) return courses || [];
  
  const lowercaseSearch = searchTerm.toLowerCase();
  
  return courses.filter(course =>
    course.title?.toLowerCase().includes(lowercaseSearch) ||
    course.subtitle?.toLowerCase().includes(lowercaseSearch) ||
    course.categoryName?.toLowerCase().includes(lowercaseSearch) ||
    course.courseLevelName?.toLowerCase().includes(lowercaseSearch) ||
    course.courseTypeName?.toLowerCase().includes(lowercaseSearch)
  );
};

/**
 * Format price display
 * @param {number} price - Price value
 * @param {number} discountedPrice - Discounted price value
 * @param {string} currency - Currency code
 * @returns {Object} Formatted price object
 */
export const formatPriceDisplay = (price, discountedPrice, currency) => {
  const hasDiscount = discountedPrice && discountedPrice < price;
  
  return {
    displayPrice: hasDiscount ? discountedPrice : price,
    originalPrice: hasDiscount ? price : null,
    currency: currency || 'USD',
    hasDiscount
  };
};

/**
 * Validate course form data
 * @param {Object} formData - Form data to validate
 * @returns {Object} Validation result with errors and isValid
 */
export const validateCourseForm = (formData) => {
  const errors = {};
  
  if (!formData.title?.trim()) {
    errors.title = 'Title is required';
  }
  
  if (!formData.description?.trim()) {
    errors.description = 'Description is required';
  }
  
  if (!formData.overview?.trim()) {
    errors.overview = 'Overview is required';
  }
  
  if (formData.courseTypeId === 0) {
    errors.courseTypeId = 'Course type is required';
  }
  
  if (formData.categoryId === 0) {
    errors.categoryId = 'Category is required';
  }
  
  if (formData.courseLevelId === 0) {
    errors.courseLevelId = 'Course level is required';
  }
  
  if (formData.isPaid) {
    const price = parseFloat(formData.price) || 0;
    const discountedPrice = parseFloat(formData.discountedPrice) || 0;
    
    if (price <= 0) {
      errors.price = 'Price must be greater than 0';
    }
    
    if (discountedPrice > 0 && price > 0 && discountedPrice > price) {
      errors.discountedPrice = 'Discounted price cannot be greater than the actual price';
    }
  }
  
  return {
    errors,
    isValid: Object.keys(errors).length === 0
  };
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
 * Format course data for API submission
 * @param {Object} formData - Form data
 * @returns {Object} Formatted data for API
 */
export const formatCourseDataForAPI = (formData) => {
  const price = parseFloat(formData.price) || 0;
  const discountedPrice = parseFloat(formData.discountedPrice) || 0;
  
  return {
    ...formData,
    price,
    discountedPrice,
    // Ensure boolean values are properly formatted
    isPaid: Boolean(formData.isPaid)
  };
};
