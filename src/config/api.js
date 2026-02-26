import appSettings from './appSettings';

// API Configuration
export const API_CONFIG = {
  BASE_URL: process.env.REACT_APP_API_URL || appSettings.api.baseUrl,
  BASE_URL_Local: process.env.REACT_APP_BASE_URL_LOCAL || appSettings.api.baseUrlLocal,
  CHATBOT_URL: appSettings.api.chatbotUrl,
  TIMEOUT: appSettings.api.timeout,
  RETRY_ATTEMPTS: appSettings.api.retryAttempts,
};

// API Endpoints
export const ENDPOINTS = {
  COURSES: '/courses',
  COURSE_CREATE: '/courses/CreateCourse',
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
  AUTH_LOGIN: '/auth/login',
  AUTH_CHANGE_PASSWORD: '/auth/change-password',
  AUTH_USER: '/auth/me',
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
  CAREER_PATHS: '/career-paths',
  // Course Badge Management endpoints
  COURSE_BADGE_ALL: '/Badges',
  COURSE_BADGE_BY_ID: (id) => `/Badges/${id}`,
  COURSE_BADGE_UPDATE: (id) => `/Badges/${id}`,
  COURSE_BADGE_CREATE: '/Badges',
  COURSE_BADGE_DELETE: (id) => `/Badges/${id}`,
  CAREER_ROLES: '/career-roles',
  CAREER_ROLE_BY_ID: (id) => `/career-roles/${id}`,
  CAREER_SKILLS: '/careerskills',
  CAREER_SKILL_BY_ID: (id) => `/careerskills/${id}`,
  CAREER_PATH_LEVELS: '/career-paths/levels',
  ALL_SKILLS: '/skills',
  COURSES_BY_TYPE: (typeId) => `/admin/courses?CourseTypeId=${typeId}`,
  CAREER_SKILLS_ENDPOINT: '/careerskills', // Added career skills endpoint
  // Course Skill Mapping endpoints
  COURSE_SKILL_MAP_ALL: '/CourseSkillMap/all',
  COURSE_SKILL_MAP_BY_ID: (id) => `/CourseSkillMap/skill/${id}`,
  COURSE_SKILL_MAP_SYNC: '/CourseSkillMap/sync',
  // Skills endpoint (updated to correct API)
  SKILLS_ALL: '/careerskills',
  // Skill Mapping endpoints (similar to badge assignment)
  SKILL_MAPPING_ASSIGN: '/SkillMapping/assign',
  SKILL_MAPPING_GET: (skillId, type) => `/SkillMapping/${skillId}/${type ? `${type}` : ''}`,
  // Email Template endpoints
  EMAIL_TEMPLATE_ALL: '/EmailTemplate',
  EMAIL_TEMPLATE_BY_ID: (id) => `/EmailTemplate/${id}`,
  EMAIL_TEMPLATE_CREATE: '/EmailTemplate',
  EMAIL_TEMPLATE_UPDATE: (id) => `/EmailTemplate/${id}`,
  EMAIL_TEMPLATE_DELETE: (id) => `/EmailTemplate/${id}`,
  // LMS Lectures endpoints
  LMS_LECTURES_SEARCH: '/courses/lms-lectures/search',
  // Reviews endpoints
  CAREER_PATH_REVIEWS: (id) => `/Review/careerpath/${id}`,
  COURSE_REVIEWS: (id) => `/Review/course/${id}`,
  CAREER_PATH_REVIEW_CREATE: '/Review',
  CAREER_PATH_REVIEW_UPDATE: (id) => `/Review/${id}`,
  CAREER_PATH_REVIEW_DELETE: (id) => `/Review/${id}`,
  COURSE_REVIEW_CREATE: '/Review',
  COURSE_REVIEW_UPDATE: (id) => `/Review/${id}`,
  COURSE_REVIEW_DELETE: (id) => `/Review/${id}`,
  CAREER_PATH_REVIEW_READ: (id) => `/Review/${id}`,
  COURSE_REVIEW_READ: (id) => `/Review/${id}`,
  CAREER_PATH_REVIEW_ALL: '/Review/careerpath',
  COURSE_REVIEW_ALL: '/Review/course',
  
  // Review dropdown endpoints
  REVIEW_CAREER_PATHS_DROPDOWN: '/Review/careerpaths/dropdown',
  REVIEW_COURSES_DROPDOWN: '/Review/courses/dropdown',
  REVIEW_CAREER_PATH_LEVELS: (careerPathId) => `/Review/careerpaths/${careerPathId}/levels`,
  REVIEW_WITH_DETAILS: (reviewId) => `/Review/${reviewId}/details`,

  // Discount Rates endpoints
  DISCOUNT_RATES: '/DiscountRates',
  DISCOUNT_RATES_CREATE: '/DiscountRatescreate',
  DISCOUNT_RATES_BY_ID: (id) => `/DiscountRates/${id}`,
  DISCOUNT_RATES_UPDATE: (id) => `/DiscountRates/${id}`,
  DISCOUNT_RATES_DELETE: (id) => `/DiscountRates/${id}`,
  DISCOUNT_RATES_ASSIGN: '/DiscountRates/assign-course',
  DISCOUNT_RATES_ASSIGN_COURSE_TYPE: '/DiscountRates/assign-course-type',
  DISCOUNT_RATES_ASSIGN_CAREER_PATH: '/DiscountRates/Assign-CareerPath',
  
  // Discount Rate Mapping endpoints
  DISCOUNT_RATES_MAPPINGS: '/DiscountRates/mappings',
  DISCOUNT_RATES_MAPPINGS_BY_COURSE: (courseId) => `/DiscountRates/mappings/course/${courseId}`,
  DISCOUNT_RATES_MAPPINGS_BY_ID: (id) => `/DiscountRates/mappings/${id}`,
  DISCOUNT_RATES_MAPPINGS_UPDATE: (id) => `/DiscountRates/mappings/${id}`,
  DISCOUNT_RATES_MAPPINGS_DELETE: (id) => `/DiscountRates/mappings/${id}`,
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