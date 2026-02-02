import { API_CONFIG, ENDPOINTS } from '../config/api';
import routesData from '../data/routes.json';

class AdminApiService {
  constructor() {
    this.baseURL = API_CONFIG.BASE_URL_Local;
    this.timeout = API_CONFIG.TIMEOUT;
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    console.log('API Request:', { url, endpoint, options });
    
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
      console.log('Making fetch request to:', url);
      const response = await fetch(url, config);
      console.log('Response received:', response.status, response.statusText);

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
  
  // GET all courses for admin with filters
  async getAllCoursesAdmin(filters = {}) {
    const queryParams = new URLSearchParams();
    
    // Add pagination parameters
    if (filters.page !== undefined) queryParams.append('page', filters.page);
    if (filters.pageSize !== undefined) queryParams.append('pageSize', filters.pageSize);
    
    // Add course filter parameters
    if (filters.title) queryParams.append('Title', filters.title);
    if (filters.subtitle) queryParams.append('Subtitle', filters.subtitle);
    if (filters.description) queryParams.append('Description', filters.description);
    if (filters.overview) queryParams.append('Overview', filters.overview);
    if (filters.courseTypeId !== undefined) queryParams.append('CourseTypeId', filters.courseTypeId);
    if (filters.categoryId !== undefined) queryParams.append('CategoryId', filters.categoryId);
    if (filters.courseLevelId !== undefined) queryParams.append('CourseLevelId', filters.courseLevelId);
    if (filters.slug) queryParams.append('Slug', filters.slug);
    if (filters.thumbnailUrl) queryParams.append('ThumbnailUrl', filters.thumbnailUrl);
    if (filters.promoVideoUrl) queryParams.append('PromoVideoUrl', filters.promoVideoUrl);
    if (filters.price !== undefined) queryParams.append('Price', filters.price);
    if (filters.discountedPrice !== undefined) queryParams.append('DiscountedPrice', filters.discountedPrice);
    if (filters.currencyCode) queryParams.append('CurrencyCode', filters.currencyCode);
    if (filters.isPaid !== undefined) queryParams.append('IsPaid', filters.isPaid);
    
    const queryString = queryParams.toString();
    const url = queryString ? `${ENDPOINTS.COURSES_ADMIN}?${queryString}` : ENDPOINTS.COURSES_ADMIN;
    
    return this.request(url);
  }

  // GET course by ID for admin
  async getCourseByIdAdmin(courseId) {
    console.log('API: Getting course by ID:', courseId, 'Endpoint:', ENDPOINTS.COURSE_BY_ID_ADMIN(courseId));
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

  // GET all courses for admin (without pagination)
  async getAllCoursesAdminNoPagination(filters = {}) {
    const queryParams = new URLSearchParams();
    
    // Add filter parameters - only add if they have values
    if (filters.CourseTypeId && filters.CourseTypeId !== '') {
      queryParams.append('CourseTypeId', filters.CourseTypeId);
    }
    if (filters.CategoryId && filters.CategoryId !== '') {
      queryParams.append('CategoryId', filters.CategoryId);
    }
    if (filters.CourseLevelId && filters.CourseLevelId !== '') {
      queryParams.append('CourseLevelId', filters.CourseLevelId);
    }
    
    const queryString = queryParams.toString();
    const url = queryString ? `${ENDPOINTS.ADMINCOURSE}?${queryString}` : ENDPOINTS.ADMINCOURSE;
    
    return this.request(url);
  }

  // GET all course types
  async getAllCourseTypes() {
    return this.request(ENDPOINTS.COURSE_TYPES);
  }

  // GET all course levels
  async getAllCourseLevels() {
    return this.request(ENDPOINTS.COURSE_LEVELS);
  }

  // POST create new course
  async createCourse(courseData) {
    // Ensure sections are included in the request if provided
    const requestData = {
      ...courseData,
      sections: courseData.sections || []
    };
    
    // Set default values for unpaid courses
    if (!requestData.isPaid) {
      requestData.price = 0;
      requestData.discountedPrice = 0;
      requestData.currencyCode = 'USD';
    }
    
    return this.request(ENDPOINTS.COURSES_ADMIN, {
      method: 'POST',
      body: JSON.stringify(requestData),
    });
  }

  // PUT update course
  async updateCourse(courseId, courseData) {
    // Ensure sections are included in the request if provided
    const requestData = {
      ...courseData,
      sections: courseData.sections || []
    };
    
    // Set default values for unpaid courses
    if (!requestData.isPaid) {
      requestData.price = 0;
      requestData.discountedPrice = 0;
      requestData.currencyCode = 'USD';
    }
    
    return this.request(`${ENDPOINTS.COURSE_BY_ID_ADMIN(courseId)}`, {
      method: 'PUT',
      body: JSON.stringify(requestData),
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

  // Course Badge Management methods
  
  // GET all course badges (new endpoint)
  async getAllCourseBadgesNew() {
    return this.request(ENDPOINTS.COURSE_BADGE_ALL);
  }

  // GET course badge by ID
  async getCourseBadgeById(id) {
    return this.request(ENDPOINTS.COURSE_BADGE_BY_ID(id));
  }

  // POST create new course badge
  async createCourseBadge(badgeData) {
    return this.request(ENDPOINTS.COURSE_BADGE_CREATE, {
      method: 'POST',
      body: JSON.stringify(badgeData),
    });
  }

  // PUT update course badge
  async updateCourseBadge(badgeId, badgeData) {
    return this.request(ENDPOINTS.COURSE_BADGE_UPDATE(badgeId), {
      method: 'PUT',
      body: JSON.stringify(badgeData),
    });
  }

  // DELETE course badge
  async deleteCourseBadge(badgeId) {
    return this.request(ENDPOINTS.COURSE_BADGE_DELETE(badgeId), {
      method: 'DELETE',
    });
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

  // UPDATE course badge (for individual course badge assignment)
  async updateCourseBadgeAssignment(courseId, badgeId) {
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

  // Career Paths Management methods
  
  // GET all career paths
  async getAllCareerPaths() {
    return this.request(ENDPOINTS.CAREER_PATHS);
  }

  // GET all courses for career path
  async getCareerPathCourses() {
    return this.request(`${ENDPOINTS.CAREER_PATHS}/courses`);
  }

  // GET courses by category and level for career path
  async getCareerPathCoursesByCategoryAndLevel(categoryId, levelId) {
    return this.request(`${ENDPOINTS.CAREER_PATHS}/courses/${categoryId}/${levelId}`);
  }

  // GET career path levels
  async getCareerPathLevels() {
    return this.request(`${ENDPOINTS.CAREER_PATHS}/levels`);
  }

  // GET career path by ID
  async getCareerPathById(id) {
    return this.request(`${ENDPOINTS.CAREER_PATHS}/${id}`);
  }

  // POST create new career path
  async createCareerPath(careerPathData) {
    return this.request(ENDPOINTS.CAREER_PATHS, {
      method: 'POST',
      body: JSON.stringify(careerPathData),
    });
  }

  // PUT update career path
  async updateCareerPath(id, careerPathData) {
    debugger;
    return this.request(`${ENDPOINTS.CAREER_PATHS}/${id}`, {
      method: 'PUT',
      body: JSON.stringify(careerPathData),
    });
  }

  // DELETE career path
  async deleteCareerPath(id) {
    return this.request(`${ENDPOINTS.CAREER_PATHS}/${id}`, {
      method: 'DELETE',
    });
  }

  // Create career path with file upload (FormData)
  async createCareerPathWithFile(formData) {
    const url = `${this.baseURL}${ENDPOINTS.CAREER_PATHS}`;
    
    const config = {
      method: 'POST',
      body: formData,
      // Don't set Content-Type header when using FormData, browser sets it automatically
      headers: {
        'accept': '*/*',
      },
      timeout: this.timeout,
    };

    try {
      console.log('Creating career path with file:', url);
      const response = await fetch(url, config);
      console.log('Create with file response:', response.status, response.statusText);

      if (!response.ok) {
        let errorDetails = '';
        try {
          const contentType = response.headers.get('content-type');
          if (contentType && contentType.includes('application/json')) {
            const errorData = await response.json();
            errorDetails = errorData.error || errorData.message || errorData.title || JSON.stringify(errorData);
          } else {
            const textData = await response.text();
            errorDetails = textData || response.statusText || 'Unknown error';
          }
        } catch (parseError) {
          errorDetails = response.statusText || 'Unknown error';
        }
        
        const error = new Error(`Create failed! status: ${response.status} - ${errorDetails}`);
        error.response = {
          status: response.status,
          statusText: response.statusText,
          data: errorDetails
        };
        throw error;
      }

      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        const data = await response.json();
        console.log('Create with file successful:', data);
        return data;
      } else {
        const textData = await response.text();
        console.log('Create with file successful (text response):', textData);
        return textData ? { success: true, message: textData } : { success: true };
      }
    } catch (error) {
      console.error('Create career path with file failed:', error);
      throw error;
    }
  }

  // Update career path with file upload (FormData)
  async updateCareerPathWithFile(id, formData) {
    const url = `${this.baseURL}${ENDPOINTS.CAREER_PATHS}/${id}`;
    
    const config = {
      method: 'PUT',
      body: formData,
      // Don't set Content-Type header when using FormData, browser sets it automatically
      headers: {
        'accept': '*/*',
      },
      timeout: this.timeout,
    };

    try {
      console.log('Updating career path with file:', url);
      const response = await fetch(url, config);
      console.log('Update with file response:', response.status, response.statusText);

      if (!response.ok) {
        let errorDetails = '';
        try {
          const contentType = response.headers.get('content-type');
          if (contentType && contentType.includes('application/json')) {
            const errorData = await response.json();
            errorDetails = errorData.error || errorData.message || errorData.title || JSON.stringify(errorData);
          } else {
            const textData = await response.text();
            errorDetails = textData || response.statusText || 'Unknown error';
          }
        } catch (parseError) {
          errorDetails = response.statusText || 'Unknown error';
        }
        
        const error = new Error(`Update failed! status: ${response.status} - ${errorDetails}`);
        error.response = {
          status: response.status,
          statusText: response.statusText,
          data: errorDetails
        };
        throw error;
      }

      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        const data = await response.json();
        console.log('Update with file successful:', data);
        return data;
      } else {
        const textData = await response.text();
        console.log('Update with file successful (text response):', textData);
        return textData ? { success: true, message: textData } : { success: true };
      }
    } catch (error) {
      console.error('Update career path with file failed:', error);
      throw error;
    }
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
