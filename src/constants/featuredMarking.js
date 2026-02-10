// Featured Marking Constants
export const FEATURED_MARKING_CONSTANTS = {
  // Pagination
  DEFAULT_PAGE_SIZE: 100,
  INITIAL_PAGE: 1,
  
  // Debounce timing
  SEARCH_DEBOUNCE_DELAY: 300,
  
  // Virtual scrolling
  ITEM_HEIGHT: 120,
  BUFFER_SIZE: 10,
  CONTAINER_HEIGHT: 800,
  
  // Toast timing
  TOAST_DURATION: 3000,
  
  // Filter defaults
  DEFAULT_FILTERS: {
    searchTerm: '',
    badgeId: '',
    categoryId: '',
    courseTypeId: '',
    courseLevelId: '',
    isFeatured: ''
  },
  
  // Badge status options
  BADGE_STATUS_OPTIONS: {
    ACTIVE: 'active',
    INACTIVE: 'inactive',
    FEATURED: 'featured'
  },
  
  // Badge types
  BADGE_TYPES: {
    ACHIEVEMENT: 'achievement',
    COMPLETION: 'completion',
    EXCELLENCE: 'excellence',
    FEATURED: 'featured'
  },
  
  // Validation rules
  VALIDATION_RULES: {
    NAME_MIN_LENGTH: 2,
    NAME_MAX_LENGTH: 50,
    DESCRIPTION_MAX_LENGTH: 200,
    ICON_MAX_LENGTH: 50
  }
};
