// API Configuration
export const API_CONFIG = {
  BASE_URL: process.env.REACT_APP_API_URL || 'https://gptassistant.thetechmenders.com/api',
  BASE_URL_Local: process.env.BASE_URL_Local || 'https://localhost:7043/api',
  TIMEOUT: 10000, // 10 seconds
  RETRY_ATTEMPTS: 3,
};

// API Endpoints
export const ENDPOINTS = {
  COURSES: '/courses',
  COURSES_PAGINATED: '/coursedata/paginated',
  COURSE_HIERARCHY: '/CourseData/hierarchy',
  COURSE_BY_ID: (id) => `/courses/${id}`,
  COURSE_AI_CONTENT: '/CourseData/hierarchy',
  MEDIA_AUDIO_BY_ID: (id) => `/media/audio/${id}`,
  MEDIA_IMAGE_BY_ID: (id) => `/media/image/${id}`,
 // Admin Routes and Authentication
  ADMINCOURSE:'/admin/courses',
  ROUTES: '/admin/routes',
  ROLES: '/admin/roles',
  AUTH_LOGIN: '/admin/auth/login',
  AUTH_USER: '/admin/auth/user',
    COURSES_ADMIN: '/admin/courses',
  COURSE_BY_ID_ADMIN: (id) => `/admin/courses/${id}`,
  COURSE_TAGS: '/admin/courses/tags',
  COURSE_BADGES: '/admin/courses/badges',
  COURSE_FEATURED: '/admin/courses/featured',
  COURSE_STATUS: '/admin/courses/status',
  CATEGORIES_Admin: '/admin/categories',
  COURSE_TYPES: '/admin/course-types',
  COURSE_LEVELS: '/admin/course-levels',
  COURSE_BADGES_DROPDOWN: '/admin/course-badges',
};

// HTTP Status Codes
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  INTERNAL_SERVER_ERROR: 500,
};