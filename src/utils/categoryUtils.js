/**
 * Utility functions for category management
 */

/**
 * Calculate category statistics
 * @param {Array} categories - Array of categories
 * @returns {Object} Statistics object
 */
export const calculateCategoryStats = (categories) => {
  if (!categories || categories.length === 0) {
    return {
      totalCategories: 0,
      activeCategories: 0,
      parentCategories: 0,
      childCategories: 0
    };
  }
  
  return {
    totalCategories: categories.length,
    activeCategories: categories.filter(c => c.isActive).length,
    parentCategories: categories.filter(c => !c.parentCategoryId).length,
    childCategories: categories.filter(c => c.parentCategoryId).length
  };
};

/**
 * Filter categories based on search term
 * @param {Array} categories - Array of categories
 * @param {string} searchTerm - Search term
 * @returns {Array} Filtered categories
 */
export const filterCategoriesBySearch = (categories, searchTerm) => {
  if (!categories || !searchTerm) return categories || [];
  
  const lowercaseSearch = searchTerm.toLowerCase();
  
  return categories.filter(category =>
    category.name?.toLowerCase().includes(lowercaseSearch) ||
    category.slug?.toLowerCase().includes(lowercaseSearch) ||
    category.description?.toLowerCase().includes(lowercaseSearch) ||
    category.parentCategoryName?.toLowerCase().includes(lowercaseSearch)
  );
};

/**
 * Validate category form data
 * @param {Object} formData - Form data to validate
 * @returns {Object} Validation result with errors and isValid
 */
export const validateCategoryForm = (formData) => {
  const errors = {};
  
  if (!formData.name?.trim()) {
    errors.name = 'Category name is required';
  } else if (formData.name.trim().length < 2) {
    errors.name = 'Category name must be at least 2 characters';
  } else if (formData.name.trim().length > 100) {
    errors.name = 'Category name cannot exceed 100 characters';
  }
  
  if (!formData.slug?.trim()) {
    errors.slug = 'Category slug is required';
  } else if (formData.slug.trim().length < 2) {
    errors.slug = 'Category slug must be at least 2 characters';
  } else if (formData.slug.trim().length > 100) {
    errors.slug = 'Category slug cannot exceed 100 characters';
  } else if (!/^[a-z0-9-]+$/.test(formData.slug.trim())) {
    errors.slug = 'Category slug can only contain lowercase letters, numbers, and hyphens';
  }
  
  if (formData.description && formData.description.length > 500) {
    errors.description = 'Description cannot exceed 500 characters';
  }
  
  return {
    errors,
    isValid: Object.keys(errors).length === 0
  };
};

/**
 * Format category data for API submission
 * @param {Object} formData - Form data
 * @returns {Object} Formatted data for API
 */
export const formatCategoryDataForAPI = (formData) => {
  return {
    ...formData,
    // Ensure boolean values are properly formatted
    isActive: Boolean(formData.isActive),
    // Trim string values
    name: formData.name?.trim(),
    slug: formData.slug?.trim(),
    description: formData.description?.trim()
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
 * Build category hierarchy tree
 * @param {Array} categories - Flat array of categories or nested array from API
 * @returns {Array} Hierarchical category tree
 */
export const buildCategoryTree = (categories) => {
  if (!categories || !Array.isArray(categories)) return [];
  
  // Check if categories already have nested structure (from new API)
  const hasNestedStructure = categories.some(cat => cat.children && Array.isArray(cat.children));
  
  if (hasNestedStructure) {
    // Return the nested structure directly, ensuring proper sorting
    const sortNestedCategories = (cats) => {
      return cats
        .sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0))
        .map(cat => ({
          ...cat,
          children: cat.children && Array.isArray(cat.children) && cat.children.length > 0 
            ? sortNestedCategories(cat.children) 
            : []
        }));
    };
    
    return sortNestedCategories(categories);
  }
  
  // Fallback to building tree from flat structure (backward compatibility)
  const categoryMap = {};
  const rootCategories = [];
  
  // Create a map of all categories
  categories.forEach(category => {
    categoryMap[category.id] = { ...category, children: [] };
  });
  
  // Build the tree structure
  categories.forEach(category => {
    if (category.parentCategoryId && category.parentCategoryId !== 0) {
      const parent = categoryMap[category.parentCategoryId];
      if (parent) {
        parent.children.push(categoryMap[category.id]);
      }
    } else {
      rootCategories.push(categoryMap[category.id]);
    }
  });
  
  // Sort categories and their children
  const sortCategories = (cats) => {
    return cats
      .sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0))
      .map(cat => ({
        ...cat,
        children: cat.children && Array.isArray(cat.children) && cat.children.length > 0 
          ? sortCategories(cat.children) 
          : []
      }));
  };
  
  return sortCategories(rootCategories);
};

/**
 * Flatten nested categories into a flat array
 * @param {Array} categories - Nested categories array
 * @param {string} parentPath - Parent category path (for recursive calls)
 * @returns {Array} Flattened categories array
 */
export const flattenCategories = (categories, parentPath = '') => {
  if (!categories || !Array.isArray(categories)) return [];
  
  const flat = [];
  categories.forEach(category => {
    const flatCategory = {
      ...category,
      parentCategoryName: category.parentCategoryName || null,
      // Add path for hierarchical display
      path: parentPath ? `${parentPath} > ${category.name}` : category.name
    };
    flat.push(flatCategory);
    
    // Recursively flatten children
    if (category.children && Array.isArray(category.children) && category.children.length > 0) {
      flat.push(...flattenCategories(category.children, flatCategory.path));
    }
  });
  return flat;
};

/**
 * Get category path (breadcrumb)
 * @param {Object} category - Category object
 * @param {Array} allCategories - All categories
 * @returns {Array} Array of category names forming the path
 */
export const getCategoryPath = (category, allCategories) => {
  if (!category) return [];
  
  const path = [];
  let currentCategory = category;
  
  while (currentCategory) {
    path.unshift(currentCategory.name);
    currentCategory = allCategories.find(c => c.id === currentCategory.parentCategoryId);
  }
  
  return path;
};

/**
 * Find category by slug
 * @param {string} slug - Category slug
 * @param {Array} categories - Array of categories
 * @returns {Object|null} Category object or null
 */
export const findCategoryBySlug = (slug, categories) => {
  return categories.find(category => category.slug === slug) || null;
};
