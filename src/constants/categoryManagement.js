// Category Management Constants
export const CATEGORY_MANAGEMENT_CONSTANTS = {
  // Pagination
  DEFAULT_PAGE_SIZE: 100,
  INITIAL_PAGE: 1,
  
  // Debounce timing
  SEARCH_DEBOUNCE_DELAY: 300,
  
  // Virtual scrolling
  ITEM_HEIGHT: 80,
  BUFFER_SIZE: 15,
  CONTAINER_HEIGHT: 800,
  
  // Toast timing
  TOAST_DURATION: 3000,
  
  // Filter defaults
  DEFAULT_FILTERS: {
    name: '',
    slug: '',
    description: '',
    parentCategoryId: ''
  },
  
  // Category status options
  CATEGORY_STATUS_OPTIONS: {
    ACTIVE: 'active',
    INACTIVE: 'inactive',
    DRAFT: 'draft'
  },
  
  // Validation rules
  VALIDATION_RULES: {
    NAME_MIN_LENGTH: 2,
    NAME_MAX_LENGTH: 100,
    SLUG_MIN_LENGTH: 2,
    SLUG_MAX_LENGTH: 100,
    DESCRIPTION_MAX_LENGTH: 500
  }
};
