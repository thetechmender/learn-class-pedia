import appSettings from './appSettings';

// API Configuration
export const API_CONFIG = {
  BASE_URL: process.env.REACT_APP_API_URL || appSettings.api.baseUrl,
  BASE_URL_Local: process.env.BASE_URL_Local || appSettings.api.baseUrlLocal,
  CHATBOT_URL: appSettings.api.chatbotUrl,
  TIMEOUT: appSettings.api.timeout,
  RETRY_ATTEMPTS: appSettings.api.retryAttempts,
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
  CAREER_PATHS: '/career-paths',
  // Course Badge Management endpoints
  COURSE_BADGE_ALL: '/CourseBadge/GetAllCourseBadges',
  COURSE_BADGE_BY_ID: (id) => `/CourseBadge/${id}`,
  COURSE_BADGE_UPDATE: (id) => `/CourseBadge/UpdateCourseBadge/${id}`,
  COURSE_BADGE_CREATE: '/CourseBadge/CreateCourseBadge',
  COURSE_BADGE_DELETE: (id) => `/CourseBadge/${id}`,
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
  // Email Template endpoints
  EMAIL_TEMPLATE_ALL: '/EmailTemplate',
  EMAIL_TEMPLATE_BY_ID: (id) => `/EmailTemplate/${id}`,
  EMAIL_TEMPLATE_CREATE: '/EmailTemplate',
  EMAIL_TEMPLATE_UPDATE: (id) => `/EmailTemplate/${id}`,
  EMAIL_TEMPLATE_DELETE: (id) => `/EmailTemplate/${id}`,
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