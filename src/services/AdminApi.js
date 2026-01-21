import { API_CONFIG, ENDPOINTS } from '../config/api';
import routesData from '../data/routes.json';
import reviewsData from '../data/reviews.json';

class AdminApiService {
  constructor() {
    this.baseURL = API_CONFIG.BASE_URL_Local;
    this.timeout = API_CONFIG.TIMEOUT;
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const config = {
      headers: {
        'Content-Type': 'application/json',
        'accept': '*/*',
        ...options.headers,
      },
      timeout: this.timeout,
      ...options,
    };

    try {
      const response = await fetch(url, config);

      if (!response.ok) {
        // Try to get error details from response body
        let errorDetails = '';
        try {
          // Check if response has content before parsing JSON
          const contentType = response.headers.get('content-type');
          if (contentType && contentType.includes('application/json')) {
            const errorData = await response.json();
            errorDetails = errorData.error || errorData.message || errorData.title || JSON.stringify(errorData);
          } else {
            // If not JSON, try to get text content
            const textData = await response.text();
            errorDetails = textData || response.statusText || 'Unknown error';
          }
        } catch (parseError) {
          // If parsing fails, use status text
          errorDetails = response.statusText || 'Unknown error';
        }
        
        // Create error with response data attached
        const error = new Error(`HTTP error! status: ${response.status} - ${errorDetails}`);
        error.response = {
          status: response.status,
          statusText: response.statusText,
          data: errorDetails
        };
        throw error;
      }

      // Handle successful response - check if it has content before parsing JSON
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        const data = await response.json();
        return data;
      } else {
        // For successful responses without JSON content, return a success indicator
        const textData = await response.text();
        return textData ? { success: true, message: textData } : { success: true };
      }
    } catch (error) {
      console.error(`Admin API request failed for ${endpoint}:`, error);
      throw error;
    }
  }

  // Category Management methods
  
  // GET all categories with pagination and filters
  // async getAllCategories(page = 1, pageSize = 50, queryParams = '') {
  //   const url = queryParams ? `${ENDPOINTS.CATEGORIES_Admin}?${queryParams}` : `${ENDPOINTS.CATEGORIES_Admin}?page=${page}&pageSize=${pageSize}`;
  //   return this.request(url);
  // }
async getAllCategories(page = null, pageSize = null, queryParams = '') {
    let url = ENDPOINTS.CATEGORIES_Admin;

    // Build query parameters
    const params = new URLSearchParams();
    
    // Add pagination params if provided
    if (page !== null && pageSize !== null) {
      params.append('page', page);
      params.append('pageSize', pageSize);
    }
    
    // Add other query params if provided
    if (queryParams) {
      const queryParamsObj = new URLSearchParams(queryParams);
      for (const [key, value] of queryParamsObj) {
        params.append(key, value);
      }
    }
    
    // Add params to URL if any exist
    if (params.toString()) {
      url += `?${params.toString()}`;
    }

    return this.request(url);
  }
  // GET category by ID
  async getCategoryById(id) {
    return this.request(`${ENDPOINTS.CATEGORIES_Admin}/${id}`);
  }

  // POST create new category
  async createCategory(categoryData) {
    return this.request(ENDPOINTS.CATEGORIES_Admin, {
      method: 'POST',
      body: JSON.stringify(categoryData),
    });
  }

  // PUT update category
  async updateCategory(id, categoryData) {
    return this.request(`${ENDPOINTS.CATEGORIES_Admin}/${id}`, {
      method: 'PUT',
      body: JSON.stringify(categoryData),
    });
  }

  // DELETE category
  async deleteCategory(id) {
    return this.request(`${ENDPOINTS.CATEGORIES_Admin}/${id}`, {
      method: 'DELETE',
    });
  }

  // Course Management methods
  
  // GET all courses for admin
  async getAllCoursesAdmin() {
    return this.request(ENDPOINTS.COURSES_ADMIN);
  }

  // GET course by ID for admin
  async getCourseByIdAdmin(courseId) {
    return this.request(`${ENDPOINTS.COURSE_BY_ID_ADMIN(courseId)}`);
  }

  // GET courses paginated for admin
  async getCoursesPaginatedAdmin({ page = 1, pageSize = 10 }) {
    const queryParams = new URLSearchParams({
      pageNumber: page,
      pageSize: pageSize
    });
    return this.request(`${ENDPOINTS.ADMINCOURSE}?${queryParams}`);
  }

  // POST create new course
  async createCourse(courseData) {
    return this.request(ENDPOINTS.COURSES_ADMIN, {
      method: 'POST',
      body: JSON.stringify(courseData),
    });
  }

  // PUT update course
  async updateCourse(courseId, courseData) {
    return this.request(`${ENDPOINTS.COURSE_BY_ID_ADMIN(courseId)}`, {
      method: 'PUT',
      body: JSON.stringify(courseData),
    });
  }

  // DELETE course
  async deleteCourse(courseId) {
    return this.request(`${ENDPOINTS.COURSE_BY_ID_ADMIN(courseId)}`, {
      method: 'DELETE',
    });
  }

  // GET all course tags
  async getAllCourseTags() {
    return this.request(ENDPOINTS.COURSE_TAGS);
  }

  // GET all course badges
  async getAllCourseBadges() {
    return this.request(ENDPOINTS.COURSE_BADGES);
  }

  // GET course badges for dropdown
  async getCourseBadges() {
    return this.request(ENDPOINTS.COURSE_BADGES_DROPDOWN);
  }

  // GET course types
  async getCourseTypes() {
    return this.request(ENDPOINTS.COURSE_TYPES);
  }

  // GET course levels
  async getCourseLevels() {
    return this.request(ENDPOINTS.COURSE_LEVELS);
  }

  // UPDATE course tags
  async updateCourseTags(courseId, tagIds) {
    return this.request(`${ENDPOINTS.COURSE_BY_ID_ADMIN(courseId)}/tags`, {
      method: 'PUT',
      body: JSON.stringify(tagIds),
    });
  }

  // UPDATE course badge
  async updateCourseBadge(courseId, badgeId) {
    return this.request(`${ENDPOINTS.COURSE_BY_ID_ADMIN(courseId)}/badge`, {
      method: 'PUT',
      body: JSON.stringify({ badgeId }),
    });
  }

  // UPDATE course featured status
  async updateCourseFeatured(courseId, featured) {
    return this.request(`${ENDPOINTS.COURSE_BY_ID_ADMIN(courseId)}/featured`, {
      method: 'PUT',
      body: JSON.stringify({ featured }),
    });
  }

  // UPDATE course status
  async updateCourseStatus(courseId, status) {
    return this.request(`${ENDPOINTS.COURSE_BY_ID_ADMIN(courseId)}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    });
  }

  // Course Reviews Management methods
  
  // GET all reviews with optional filtering
  async getAllReviews(filters = {}) {
    const queryParams = new URLSearchParams(filters);
    return this.request(`${ENDPOINTS.REVIEWS}?${queryParams}`);
  }

  // GET reviews by course ID
  async getReviewsByCourse(courseId) {
    return this.request(ENDPOINTS.REVIEWS_BY_COURSE(courseId));
  }

  // GET review by ID
  async getReviewById(reviewId) {
    return this.request(ENDPOINTS.REVIEW_BY_ID(reviewId));
  }

  // GET courses list for dropdown
  async getReviewCourses() {
    return this.request(`${ENDPOINTS.REVIEWS}/courses`);
  }

  // GET reviews statistics
  async getReviewsStatistics() {
    return this.request(ENDPOINTS.REVIEWS_STATS);
  }

  // UPDATE review status (approve/reject)
  async updateReviewStatus(reviewId, status) {
    return this.request(`${ENDPOINTS.REVIEW_BY_ID(reviewId)}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    });
  }

  // UPDATE review content
  async updateReview(reviewId, reviewData) {
    return this.request(ENDPOINTS.REVIEW_BY_ID(reviewId), {
      method: 'PUT',
      body: JSON.stringify(reviewData),
    });
  }

  // DELETE review
  async deleteReview(reviewId) {
    return this.request(ENDPOINTS.REVIEW_BY_ID(reviewId), {
      method: 'DELETE',
    });
  }

  // CREATE new review (for testing)
  async createReview(reviewData) {
    return this.request(ENDPOINTS.REVIEWS, {
      method: 'POST',
      body: JSON.stringify(reviewData),
    });
  }

  // Authentication methods
   async getAllRoles() {
    console.log('API - Using mock data for roles (development mode)');
    await new Promise(resolve => setTimeout(resolve, 200));
    return routesData.roles;
  }

  // GET role by ID
  async getRoleById(roleId) {
    console.log('API - Using mock data for role by ID (development mode)');
    await new Promise(resolve => setTimeout(resolve, 200));
    return routesData.roles.find(role => role.id === roleId);
  }

  // POST login authentication
  async login(email, password) {
    console.log('API - Using mock data for login (development mode)');
    
    await new Promise(resolve => setTimeout(resolve, 500)); // simulate network delay

    // Filter user from mock data
    const user = routesData.users.find(u => u.email === email);

    if (user && password === 'password') { // mock password check
      // Get role information from mock roles data
      const role = routesData.roles.find(r => r.id === user.roleId);

      return {
        success: true,
        user: {
          ...user,
          role: role || null
        },
        token: 'mock-jwt-token'
      };
    }

    return {
      success: false,
      message: 'Invalid credentials'
    };
  }

  // GET user by email
  async getUserByEmail(email) {
    console.log('API - Using mock data for user by email (development mode)');
    await new Promise(resolve => setTimeout(resolve, 300));
    return routesData.users.find(user => user.email === email);
  }

  // Routes and Roles Management
  
  // GET all routes
  async getAllRoutes() {
    console.log('API - Using mock data for routes (development mode)');
    await new Promise(resolve => setTimeout(resolve, 300));
    return routesData.routes;
  }

  // GET routes filtered by user role
  async getRoutesByRole(roleId) {
    console.log('AdminApi - getRoutesByRole called with roleId:', roleId);
    console.log('AdminApi - routesData available:', !!routesData);
    console.log('AdminApi - routesData.routes:', routesData?.routes);
    
    if (!roleId) {
      console.error('AdminApi - roleId is required but not provided');
      throw new Error('Role ID is required');
    }
    
    if (!routesData || !routesData.routes) {
      console.error('AdminApi - routesData or routesData.routes is undefined');
      throw new Error('Routes data not available');
    }
    
    console.log('API - Using mock data for routes by role (development mode)');
    console.log('API - Available routes in mock data:', routesData.routes);
    console.log('API - Filtering routes for roleId:', roleId);
    
    await new Promise(resolve => setTimeout(resolve, 300));
    const filteredRoutes = routesData.routes.filter(route => 
      route.allowedRoles && route.allowedRoles.includes(parseInt(roleId))
    ).sort((a, b) => a.order - b.order);
    
    console.log('API - Filtered routes:', filteredRoutes);
    return filteredRoutes;
  }

  // GET routes by category
  async getRoutesByCategory(category, roleId) {
    console.log('API - Using mock data for routes by category (development mode)');
    console.log('API - Available routes in mock data:', routesData.routes);
    console.log('API - Filtering routes for category:', category, 'and roleId:', roleId);
    
    await new Promise(resolve => setTimeout(resolve, 300));
    const filteredRoutes = routesData.routes.filter(route => 
      route.category === category && route.allowedRoles.includes(roleId)
    ).sort((a, b) => a.order - b.order);
    
    console.log('API - Filtered routes:', filteredRoutes);
    return filteredRoutes;
  }
}

export const adminApiService = new AdminApiService();
