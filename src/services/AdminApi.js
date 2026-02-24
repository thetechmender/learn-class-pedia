import { API_CONFIG, ENDPOINTS } from '../config/api';
import { isProduction } from '../config/appSettings';
import { checkTokenBeforeRequest } from '../utils/authDebug';
import routesData from '../data/routes.json';

class AdminApiService {
  constructor() {
    this.baseURL = isProduction() ? API_CONFIG.BASE_URL : API_CONFIG.BASE_URL_Local;
    this.timeout = API_CONFIG.TIMEOUT;
  }

  async request(endpoint, options = {}) {
    // Check token before making request
    try {
      checkTokenBeforeRequest();
    } catch (error) {
      // Token is missing or expired
      console.error('Authentication error:', error.message);
      // Redirect to login or handle auth error
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
      throw error;
    }
    
    const url = `${this.baseURL}${endpoint}`;
    
    const config = {
      headers: {
        'accept': '*/*',
        'Authorization': `Bearer ${localStorage.getItem('adminToken')}`,
        ...options.headers,
      },
      timeout: this.timeout,
      ...options,
    };

    // Only set Content-Type to application/json if not already set and not FormData
    if (!config.headers['Content-Type'] && !(options.body instanceof FormData)) {
      config.headers['Content-Type'] = 'application/json';
    }

    // Remove Authorization header if explicitly set to null/undefined (for login)
    if (options.headers && (options.headers.Authorization === null || options.headers.Authorization === undefined)) {
      delete config.headers.Authorization;
    }

    try {
      const response = await fetch(url, config);

      if (!response.ok) {
        // Handle 401 specifically
        if (response.status === 401) {
          console.error(' 401 Unauthorized - Token may be invalid or expired');
          // Clear token and redirect to login
          localStorage.removeItem('adminToken');
          if (window.location.pathname !== '/login') {
            window.location.href = '/login';
          }
        }

        // Try to get error details from response body
        let errorDetails = '';
        try {
          // Check if response has content before parsing JSON
          const contentType = response.headers.get('content-type');
          if (contentType && contentType.includes('application/json')) {
            const errorData = await response.json();
            // Handle different error response formats - prioritize "message" field
            errorDetails = errorData.message || errorData.error || errorData.title || 
                          (errorData.errors && Object.values(errorData.errors)[0]?.[0]) ||
                          JSON.stringify(errorData);
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
    // Always use FormData for category creation (server expects it even without images)
    const formData = new FormData();
    formData.append('name', categoryData.name);
    formData.append('description', categoryData.description || '');
    formData.append('parentCategoryId', categoryData.parentCategoryId || 0);
    
    return this.request(ENDPOINTS.CATEGORIES_Admin, {
      method: 'POST',
      body: formData,
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
    return this.request(`${ENDPOINTS.COURSE_BY_ID_ADMIN(courseId)}`);
  }

  // GET courses paginated for admin
  async getCoursesPaginatedAdmin({ page = 1, pageSize = 100 }) {
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
    if (filters.Title && filters.Title !== '') {
      queryParams.append('Title', filters.Title);
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
    // Ensure sections and directLectures are included in the request if provided
    const requestData = {
      ...courseData,
      sections: courseData.sections || [],
      directLectures: courseData.directLectures || []
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
    // Ensure sections and directLectures are included in the request if provided
    const requestData = {
      ...courseData,
      sections: courseData.sections || [],
      directLectures: courseData.directLectures || []
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
  async getAllCourseBadgesNew(queryString = '') {
    const endpoint = queryString ? `${ENDPOINTS.COURSE_BADGE_ALL}?${queryString}` : ENDPOINTS.COURSE_BADGE_ALL;
    return this.request(endpoint);
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

  // New Badge CRUD Operations
  // GET all badges with pagination
  async getAllBadges(page = 1, pageSize = 10) {
    return this.request(`/Badges?page=${page}&pageSize=${pageSize}`);
  }

  // GET badge by ID
  async getBadgeById(id) {
    return this.request(`/Badges/${id}`);
  }

  // POST create new badge
  async createBadge(badgeData) {
    return this.request('/Badges', {
      method: 'POST',
      body: JSON.stringify(badgeData),
    });
  }

  // PUT update badge
  async updateBadge(badgeId, badgeData) {
    return this.request(`/Badges/${badgeId}`, {
      method: 'PUT',
      body: JSON.stringify(badgeData),
    });
  }

  // DELETE badge
  async deleteBadge(badgeId) {
    return this.request(`/Badges/${badgeId}`, {
      method: 'DELETE',
    });
  }

  // BadgeMap Assignment methods
  
  // GET badge assignments by type
  async getBadgeAssignments(badgeId, typeId) {
    debugger;
    return this.request(`/BadgeMap/${badgeId}/${typeId}`);
  }

  // POST assign badge to items
  async assignBadge(badgeId, typeId, assignedIds) {
    return this.request('/badgemap/assign', {
      method: 'POST',
      body: JSON.stringify({
        badgeId: badgeId,
        type: typeId,
        ids: assignedIds
      }),
    });
  }

  // GET all badge assignments for a badge (all types)
  async getAllBadgeAssignments(badgeId) {
    const [courses, categories, careerPaths] = await Promise.all([
      this.getBadgeAssignments(badgeId, 1),
      this.getBadgeAssignments(badgeId, 2),
      this.getBadgeAssignments(badgeId, 3)
    ]);
    
    return {
      courses: courses || [],
      categories: categories || [],
      careerPaths: careerPaths || []
    };
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
    await new Promise(resolve => setTimeout(resolve, 200));
    return routesData.roles;
  }

  // GET role by ID
  async getRoleById(roleId) {
    await new Promise(resolve => setTimeout(resolve, 200));
    return routesData.roles.find(role => role.id === roleId);
  }

  // POST login authentication
  async login(username, password) {
    try {
      // Create a direct fetch request for login without any Authorization header
      const url = `${this.baseURL}${ENDPOINTS.AUTH_LOGIN}`;
      const config = {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          username: username,
          password: password
        })
      };

      const response = await fetch(url, config);

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
        
        const error = new Error(`HTTP error! status: ${response.status} - ${errorDetails}`);
        error.response = {
          status: response.status,
          statusText: response.statusText,
          data: errorDetails
        };
        throw error;
      }

      const contentType = response.headers.get('content-type');
      let responseData;
      if (contentType && contentType.includes('application/json')) {
        responseData = await response.json();
      } else {
        const textData = await response.text();
        responseData = textData ? { success: true, message: textData } : { success: true };
      }

      // Store the JWT token
      if (responseData.token) {
        localStorage.setItem('adminToken', responseData.token);
      }

      return {
        success: true,
        user: responseData.user,
        token: responseData.token,
        expiresAt: responseData.expiresAt
      };
    } catch (error) {
      console.error('AdminApi.login - Login failed:', error);
      // Handle authentication errors
      if (error.response?.status === 401) {
        return {
          success: false,
          message: 'Invalid username or password'
        };
      }
      
      return {
        success: false,
        message: error.message || 'Login failed'
      };
    }
  }

  // POST change password
  async changePassword(currentPassword, newPassword, confirmPassword) {
    try {
      const response = await this.request(ENDPOINTS.AUTH_CHANGE_PASSWORD, {
        method: 'POST',
        body: JSON.stringify({
          currentPassword: currentPassword,
          newPassword: newPassword,
          confirmPassword: confirmPassword
        })
      });

      return {
        success: true,
        message: response.message || 'Password changed successfully'
      };
    } catch (error) {
      // Handle password change errors
      if (error.response?.status === 400) {
        return {
          success: false,
          message: error.response.data || 'Current password is incorrect'
        };
      }
      
      return {
        success: false,
        message: error.message || 'Password change failed'
      };
    }
  }

  // GET user by email
  async getUserByEmail(email) {
    await new Promise(resolve => setTimeout(resolve, 300));
    return routesData.users.find(user => user.email === email);
  }

  // Career Paths Management methods
  
  // GET all career paths
  async getAllCareerPaths(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    const url = queryString ? `${ENDPOINTS.CAREER_PATHS}?${queryString}` : ENDPOINTS.CAREER_PATHS;
    return this.request(url);
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
    return this.request(`${ENDPOINTS.COURSE_LEVELS}`);
  }

  // GET career roles
  async getCareerRoles() {
    return this.request(ENDPOINTS.CAREER_ROLES);
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
        'Authorization': `Bearer ${localStorage.getItem('adminToken')}`,
      },
      timeout: this.timeout,
    };

    try {
      const response = await fetch(url, config);

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
        
        const error = new Error(`HTTP error! status: ${response.status} - ${errorDetails}`);
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
        return data;
      } else {
        const textData = await response.text();
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
        'Authorization': `Bearer ${localStorage.getItem('adminToken')}`,
      },
      timeout: this.timeout,
    };

    try {
      const response = await fetch(url, config);

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
        
        const error = new Error(`HTTP error! status: ${response.status} - ${errorDetails}`);
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
        return data;
      } else {
        const textData = await response.text();
        return textData ? { success: true, message: textData } : { success: true };
      }
    } catch (error) {
      console.error('Update career path with file failed:', error);
      throw error;
    }
  }

  // Create course with file upload (FormData)
  async createCourseWithFile(formData) {
    const url = `${this.baseURL}${ENDPOINTS.COURSES_ADMIN}`;
    
    const config = {
      method: 'POST',
      body: formData,
      // Don't set Content-Type header when using FormData, browser sets it automatically
      headers: {
        'accept': '*/*',
        'Authorization': `Bearer ${localStorage.getItem('adminToken')}`,
      },
      timeout: this.timeout,
    };

    try {
      const response = await fetch(url, config);

      if (!response.ok) {
        let errorDetails = '';
        try {
          const contentType = response.headers.get('content-type');
          if (contentType && contentType.includes('application/json')) {
            const errorData = await response.json();
            // Handle different error response formats - prioritize "message" field
            errorDetails = errorData.message || errorData.error || errorData.title || 
                          (errorData.errors && Object.values(errorData.errors)[0]?.[0]) ||
                          JSON.stringify(errorData);
          } else {
            const textData = await response.text();
            errorDetails = textData || response.statusText || 'Unknown error';
          }
        } catch (parseError) {
          errorDetails = response.statusText || 'Unknown error';
        }
        
        const error = new Error(`HTTP error! status: ${response.status} - ${errorDetails}`);
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
        return data;
      } else {
        const textData = await response.text();
        return textData ? { success: true, message: textData } : { success: true };
      }
    } catch (error) {
      console.error('Create course with file failed:', error);
      throw error;
    }
  }

  // Update course with file upload (FormData)
  async updateCourseWithFile(id, formData) {
    const url = `${this.baseURL}${ENDPOINTS.COURSE_BY_ID_ADMIN(id)}`;
    
    const config = {
      method: 'PUT',
      body: formData,
      // Don't set Content-Type header when using FormData, browser sets it automatically
      headers: {
        'accept': '*/*',
        'Authorization': `Bearer ${localStorage.getItem('adminToken')}`,
      },
      timeout: this.timeout,
    };

    try {
      const response = await fetch(url, config);

      if (!response.ok) {
        let errorDetails = '';
        try {
          const contentType = response.headers.get('content-type');
          if (contentType && contentType.includes('application/json')) {
            const errorData = await response.json();
            // Handle different error response formats - prioritize "message" field
            errorDetails = errorData.message || errorData.error || errorData.title || 
                          (errorData.errors && Object.values(errorData.errors)[0]?.[0]) ||
                          JSON.stringify(errorData);
          } else {
            const textData = await response.text();
            errorDetails = textData || response.statusText || 'Unknown error';
          }
        } catch (parseError) {
          errorDetails = response.statusText || 'Unknown error';
        }
        
        const error = new Error(`HTTP error! status: ${response.status} - ${errorDetails}`);
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
        return data;
      } else {
        const textData = await response.text();
        return textData ? { success: true, message: textData } : { success: true };
      }
    } catch (error) {
      console.error('Update course with file failed:', error);
      throw error;
    }
  }

  // Create category with file upload (FormData)
  async createCategoryWithFile(formData) {
    const url = `${this.baseURL}${ENDPOINTS.CATEGORIES_Admin}`;
    
    const config = {
      method: 'POST',
      body: formData,
      // Don't set Content-Type header when using FormData, browser sets it automatically
      headers: {
        'accept': '*/*',
        'Authorization': `Bearer ${localStorage.getItem('adminToken')}`,
      },
      timeout: this.timeout,
    };

    try {
      const response = await fetch(url, config);

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
        
        const error = new Error(`HTTP error! status: ${response.status} - ${errorDetails}`);
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
        return data;
      } else {
        const textData = await response.text();
        return textData ? { success: true, message: textData } : { success: true };
      }
    } catch (error) {
      console.error('Create category with file failed:', error);
      throw error;
    }
  }

  // Update category with file upload (FormData)
  async updateCategoryWithFile(id, formData) {
    const url = `${this.baseURL}${ENDPOINTS.CATEGORIES_Admin}/${id}`;
    
    const config = {
      method: 'PUT', // Revert back to PUT
      body: formData,
      // Don't set Content-Type header when using FormData, browser sets it automatically
      headers: {
        'accept': '*/*',
        'Authorization': `Bearer ${localStorage.getItem('adminToken')}`,
      },
      timeout: this.timeout,
    };

    try {
      const response = await fetch(url, config);

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
        
        const error = new Error(`HTTP error! status: ${response.status} - ${errorDetails}`);
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
        return data;
      } else {
        const textData = await response.text();
        return textData ? { success: true, message: textData } : { success: true };
      }
    } catch (error) {
      console.error('Update category with file failed:', error);
      throw error;
    }
  }

  // Course Skill Mapping methods
  
  // GET all skills (updated to correct endpoint)
  async getAllSkillsWithPagination(queryParams = '') {
    const url = queryParams ? `${ENDPOINTS.SKILLS_ALL}?${queryParams}` : ENDPOINTS.SKILLS_ALL;
    return this.request(url);
  }

  // GET all skills (legacy method for compatibility)
  async getAllSkills() {
    return this.request(ENDPOINTS.SKILLS_ALL);
  }

  // GET all career skills
  async getAllCareerSkills() {
    return this.request(ENDPOINTS.CAREER_SKILLS);
  }

  // GET skill by ID with course mappings
  async getSkillById(skillId) {
    return this.request(ENDPOINTS.COURSE_SKILL_MAP_BY_ID(skillId));
  }

  // POST sync courses to skill
  async syncCoursesToSkill(skillId, courseIds) {
    return this.request(ENDPOINTS.COURSE_SKILL_MAP_SYNC, {
      method: 'POST',
      body: JSON.stringify({
        skillId: skillId,
        courseIds: courseIds
      })
    });
  }

  // Skill Mapping methods (similar to badge assignment)
  
  // POST assign skill mapping
  async assignSkillMapping(skillId, type, ids) {
    return this.request(ENDPOINTS.SKILL_MAPPING_ASSIGN, {
      method: 'POST',
      body: JSON.stringify({
        skillId: skillId,
        type: type,
        ids: ids
      })
    });
  }

  // GET skill mapping by skillId and type
  async getSkillMapping(skillId, type) {
    return this.request(ENDPOINTS.SKILL_MAPPING_GET(skillId, type));
  }

  // GET filtered courses
  async getFilteredCourses(filters = {}) {
    const queryParams = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value) queryParams.append(key, value);
    });
    
    const queryString = queryParams.toString();
    const url = queryString ? `${ENDPOINTS.COURSE_FILTER}?${queryString}` : ENDPOINTS.COURSE_FILTER;
    
    return this.request(url);
  }

  // Routes and Roles Management
  
  // GET all routes
  async getAllRoutes() {
    await new Promise(resolve => setTimeout(resolve, 300));
    return routesData.routes;
  }

  // GET routes filtered by user role
  async getRoutesByRole(roleId = null) {
    await new Promise(resolve => setTimeout(resolve, 300));
    // Return all routes without role filtering, but exclude reviews and review-management
    return routesData.routes
      .filter(route => 
        route.id !== 'reviews' && // Exclude reviews route
        route.id !== 'review-management' && // Exclude review-management route
        route.label !== 'Review Management' // Exclude any Review Management items
      )
      .sort((a, b) => a.order - b.order);
  }

  // GET routes by category
  async getRoutesByCategory(category, roleId) {
    await new Promise(resolve => setTimeout(resolve, 300));
    const filteredRoutes = routesData.routes.filter(route => 
      route.category === category
    ).sort((a, b) => a.order - b.order);
    
    return filteredRoutes;
  }

  // Email Template CRUD Operations
  async getEmailTemplates(page = 1, pageSize = 100) {
    return this.request(`${ENDPOINTS.EMAIL_TEMPLATE_ALL}?page=${page}&pageSize=${pageSize}`);
  }

  async getEmailTemplateById(id) {
    return this.request(ENDPOINTS.EMAIL_TEMPLATE_BY_ID(id));
  }

  async createEmailTemplate(templateData) {
    return this.request(ENDPOINTS.EMAIL_TEMPLATE_CREATE, {
      method: 'POST',
      body: JSON.stringify(templateData),
    });
  }

  async updateEmailTemplate(id, templateData) {
    return this.request(ENDPOINTS.EMAIL_TEMPLATE_UPDATE(id), {
      method: 'PUT',
      body: JSON.stringify(templateData),
    });
  }

  async deleteEmailTemplate(id) {
    return this.request(ENDPOINTS.EMAIL_TEMPLATE_DELETE(id), {
      method: 'DELETE',
    });
  }

  // ==================== DISCOUNT RATES ====================

  // GET all discount rates with pagination and search
  async getAllDiscountRates(params = {}) {
    const queryParams = new URLSearchParams();
    
    // Add pagination parameters
    if (params.page !== undefined) queryParams.append('page', params.page);
    if (params.pageSize !== undefined) queryParams.append('pageSize', params.pageSize);
    
    // Add search parameter
    if (params.search && typeof params.search === 'string') {
      console.log('Original search term:', params.search);
      console.log('URLSearchParams before append:', queryParams.toString());
      queryParams.append('search', params.search);
      console.log('URLSearchParams after append:', queryParams.toString());
    } else if (params.search) {
      console.warn('Invalid search parameter type in AdminApi:', typeof params.search, params.search);
    }
    
    const queryString = queryParams.toString();
    const url = queryString ? `${ENDPOINTS.DISCOUNT_RATES}?${queryString}` : ENDPOINTS.DISCOUNT_RATES;
    
    console.log('Final URL:', url);
    
    return this.request(url);
  }

  // GET discount rate by ID
  async getDiscountRateById(id) {
    return this.request(ENDPOINTS.DISCOUNT_RATES_BY_ID(id));
  }

  // CREATE new discount rate
  async createDiscountRate(discountRateData) {
    return this.request(ENDPOINTS.DISCOUNT_RATES_CREATE, {
      method: 'POST',
      body: JSON.stringify(discountRateData),
    });
  }

  // UPDATE discount rate
  async updateDiscountRate(id, discountRateData) {
    return this.request(ENDPOINTS.DISCOUNT_RATES_UPDATE(id), {
      method: 'PUT',
      body: JSON.stringify(discountRateData),
    });
  }

  // DELETE discount rate
  async deleteDiscountRate(id) {
    return this.request(ENDPOINTS.DISCOUNT_RATES_DELETE(id), {
      method: 'DELETE',
    });
  }

  // ==================== DISCOUNT RATE MAPPINGS ====================

  // GET all discount rate mappings
  async getAllDiscountRateMappings(params = {}) {
    const queryParams = new URLSearchParams();
    
    // Add pagination parameters
    if (params.page !== undefined) queryParams.append('page', params.page);
    if (params.pageSize !== undefined) queryParams.append('pageSize', params.pageSize);
    
    // Add search parameter
    if (params.search) queryParams.append('search', params.search);
    
    const queryString = queryParams.toString();
    const url = queryString ? `${ENDPOINTS.DISCOUNT_RATES_MAPPINGS}?${queryString}` : ENDPOINTS.DISCOUNT_RATES_MAPPINGS;
    
    return this.request(url);
  }

  // GET discount rate mappings by course ID
  async getDiscountRateMappingsByCourse(courseId) {
    return this.request(ENDPOINTS.DISCOUNT_RATES_MAPPINGS_BY_COURSE(courseId));
  }

  // GET discount rate mapping by ID
  async getDiscountRateMappingById(id) {
    return this.request(ENDPOINTS.DISCOUNT_RATES_MAPPINGS_BY_ID(id));
  }

  // CREATE new discount rate mapping
  async createDiscountRateMapping(mappingData) {
    return this.request(ENDPOINTS.DISCOUNT_RATES_MAPPINGS, {
      method: 'POST',
      body: JSON.stringify(mappingData),
    });
  }

  // ASSIGN discount rate to course
  async assignDiscountRate(courseId, discountRateId, userId = null) {
    const queryParams = userId ? `?userId=${userId}` : '';
    const url = `${ENDPOINTS.DISCOUNT_RATES_ASSIGN}${queryParams}`;
    
    return this.request(url, {
      method: 'POST',
      body: JSON.stringify({
        courseId,
        discountRateId
      }),
    });
  }

  // ASSIGN discount rate to course type
  async assignDiscountRateToCourseType(courseTypeId, discountRateId, courseId = null) {
    return this.request(ENDPOINTS.DISCOUNT_RATES_ASSIGN_COURSE_TYPE, {
      method: 'POST',
      body: JSON.stringify({
        courseId: courseId || 0,
        discountRateId,
        courseTypeId
      }),
    });
  }

  // ASSIGN discount rate to career path
  async assignDiscountRateToCareerPath(careerPathId, discountRateId) {
    return this.request(ENDPOINTS.DISCOUNT_RATES_ASSIGN_CAREER_PATH, {
      method: 'POST',
      body: JSON.stringify({
        careerPathId,
        discountRateId
      }),
    });
  }

  // UPDATE discount rate mapping
  async updateDiscountRateMapping(id, mappingData) {
    return this.request(ENDPOINTS.DISCOUNT_RATES_MAPPINGS_UPDATE(id), {
      method: 'PUT',
      body: JSON.stringify(mappingData),
    });
  }

  // DELETE discount rate mapping
  async deleteDiscountRateMapping(id) {
    return this.request(ENDPOINTS.DISCOUNT_RATES_MAPPINGS_DELETE(id), {
      method: 'DELETE',
    });
  }

  // Generic HTTP methods for custom endpoints
  
  // GET request
  async get(endpoint) {
    return this.request(endpoint, {
      method: 'GET',
    });
  }

  // POST request
  async post(endpoint, data) {
    return this.request(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // PUT request
  async put(endpoint, data) {
    return this.request(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  // DELETE request
  async delete(endpoint) {
    return this.request(endpoint, {
      method: 'DELETE',
    });
  }
}

export const adminApiService = new AdminApiService();
