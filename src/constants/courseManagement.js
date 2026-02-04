// Course Management Constants
export const COURSE_MANAGEMENT_CONSTANTS = {
  // Pagination
  DEFAULT_PAGE_SIZE: 10,
  INITIAL_PAGE: 1,
  
  // Debounce timing
  SEARCH_DEBOUNCE_DELAY: 300,
  
  // Virtual scrolling
  ITEM_HEIGHT: 80,
  BUFFER_SIZE: 10,
  CONTAINER_HEIGHT: 600,
  
  // Cache timing
  CACHE_TTL: 5 * 60 * 1000, // 5 minutes
  
  // Toast timing
  TOAST_DURATION: 3000,
  
  // Filter defaults
  DEFAULT_FILTERS: {
    page: 1,
    pageSize: 10,
    title: '',
    subtitle: '',
    description: '',
    overview: '',
    courseTypeId: 0,
    categoryId: 0,
    courseLevelId: 0,
    slug: '',
    thumbnailUrl: '',
    promoVideoUrl: '',
    promoVideoFile: '',
    price: '',
    discountedPrice: '',
    currencyCode: '',
    isPaid: ''
  },
  
  // Course status options
  COURSE_STATUS_OPTIONS: {
    ACTIVE: 'active',
    INACTIVE: 'inactive',
    DRAFT: 'draft'
  },
  
  // Pricing options
  PRICING_OPTIONS: {
    PAID: 'paid',
    FREE: 'free'
  },
  
  // Language options
  LANGUAGE_OPTIONS: [
    { value: 'EN', label: 'English' },
    { value: 'ES', label: 'Spanish' },
    { value: 'FR', label: 'French' },
    { value: 'DE', label: 'German' },
    { value: 'IT', label: 'Italian' },
    { value: 'PT', label: 'Portuguese' },
    { value: 'RU', label: 'Russian' },
    { value: 'ZH', label: 'Chinese' },
    { value: 'JA', label: 'Japanese' },
    { value: 'KO', label: 'Korean' }
  ],
  
  // Currency options
  CURRENCY_OPTIONS: [
    { value: 'USD', label: 'USD' },
    { value: 'EUR', label: 'EUR' },
    { value: 'GBP', label: 'GBP' },
    { value: 'JPY', label: 'JPY' },
    { value: 'CAD', label: 'CAD' },
    { value: 'AUD', label: 'AUD' }
  ]
};
