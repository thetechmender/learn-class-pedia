import { API_CONFIG, ENDPOINTS, HTTP_STATUS } from '../config/api';
import routesData from '../data/routes.json';
import reviewsData from '../data/reviews.json';

class ApiService {
  constructor() {
    this.baseURL = API_CONFIG.BASE_URL;
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
        throw new Error(`HTTP error! status: ${response.status} - ${response.statusText}`);
      }

      // Handle 204 No Content responses
      if (response.status === HTTP_STATUS.NO_CONTENT) {
        return null;
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error(`API request failed for ${endpoint}:`, error);
      throw error;
    }
  }

  // GET all courses
  async getAllCourses() {
    return this.request(ENDPOINTS.COURSES);
  }

  // GET courses paginated
  async getCoursesPaginated(pageNumber = 1, pageSize = 30, approveStatus = -1) {
    const queryParams = new URLSearchParams({
      pageNumber,
      pageSize,
      approveStatus
    });
    return this.request(`${ENDPOINTS.COURSES_PAGINATED}?${queryParams}`);
  }

  // GET course by ID
  async getCourseById(id) {
    return this.request(ENDPOINTS.COURSE_BY_ID(id));
  }

  // POST course AI content (hierarchy)
  async getCourseAiContent(courseGenerationWithGptId) {
    const data = await this.request(ENDPOINTS.COURSE_AI_CONTENT, {
      method: 'POST',
      body: JSON.stringify({ courseGenerationWithGptId }),
    });
    
    // Transform the response to wrap in data property for CourseDetailVideo component
    if (data) {
      // Transform modules to include content_requirements structure
      const transformedModules = (data.modules || []).map(module => ({
        ...module,
        subjects: (module.subjects || []).map(subject => ({
          ...subject,
          lectures: (subject.lectures || []).map(lecture => ({
            id: lecture.id,
            lecture_number: lecture.lectureNumber,
            lecture_name: lecture.lectureName,
            content_requirements: {
              classroom_content_html: this.combineLectureContent(lecture.lectureContent),
              quiz: [] // Add quiz if available in lectureContent
            }
          }))
        }))
      }));

      return {
        data: {
          metadata: {
            courseGenerationWithGptId: data.courseGenerationWithGptId,
            courseName: data.courseName,
            courseCode: data.courseCode,
            school: data.school,
            program: data.program,
            major: data.major || ''
          },
          modules: transformedModules
        }
      };
    }
    
    return data;
  }

  // Helper method to combine lecture content sections into HTML
  combineLectureContent(lectureContent) {
    if (!lectureContent) return '';
    
    const sections = [
      lectureContent.introduction,
      lectureContent.mainTopicEarly,
      lectureContent.mainTopicMid,
      lectureContent.mainTopicAdvanced,
      lectureContent.facts,
      lectureContent.summary,
      lectureContent.conclusion
    ];
    
    return sections.filter(Boolean).join('\n');
  }

  // POST course hierarchy
  async getCourseHierarchy(courseGenerationWithGptId) {
    const data = await this.request(ENDPOINTS.COURSE_HIERARCHY, {
      method: 'POST',
      body: JSON.stringify({ courseGenerationWithGptId }),
    });
    
    // Transform the response to include metadata structure
    if (data) {
      return {
        metadata: {
          courseGenerationWithGptId: data.courseGenerationWithGptId,
          courseName: data.courseName,
          courseCode: data.courseCode,
          school: data.school,
          program: data.program,
          major: data.major || ''
        },
        modules: data.modules || [],
        lecture_statistics: this.calculateLectureStatistics(data.modules || [])
      };
    }
    
    return data;
  }

  // Helper method to calculate lecture statistics
  calculateLectureStatistics(modules) {
    let totalLectures = 0;
    let totalSubjects = 0;
    
    modules.forEach(module => {
      if (module.subjects) {
        totalSubjects += module.subjects.length;
        module.subjects.forEach(subject => {
          if (subject.lectures) {
            totalLectures += subject.lectures.length;
          }
        });
      }
    });
    
    return {
      total_lectures: totalLectures,
      total_subjects: totalSubjects,
      total_modules: modules.length
    };
  }

  // GET audio stream URL by ID
  getAudioStreamUrl(audioId) {
    return `${this.baseURL}${ENDPOINTS.MEDIA_AUDIO_BY_ID(audioId)}`;
  }

  // GET image stream URL by ID
  getImageStreamUrl(imageId) {
    return `${this.baseURL}${ENDPOINTS.MEDIA_IMAGE_BY_ID(imageId)}`;
  }

  // POST create new course
  async createCourse(courseData) {
    return this.request(ENDPOINTS.COURSES, {
      method: 'POST',
      body: JSON.stringify(courseData),
    });
  }

  // PUT update course
  async updateCourse(id, courseData) {
    return this.request(ENDPOINTS.COURSE_BY_ID(id), {
      method: 'PUT',
      body: JSON.stringify(courseData),
    });
  }

  // DELETE course
  async deleteCourse(id) {
    return this.request(ENDPOINTS.COURSE_BY_ID(id), {
      method: 'DELETE',
    });
  }

  // Admin Routes and Authentication methods - Using Mock Data for Development
  
  // GET all routes
  async getAllRoutes() {
    console.log('API - Using mock data for routes (development mode)');
    await new Promise(resolve => setTimeout(resolve, 300));
    return routesData.routes;
  }

  // GET routes filtered by user role
  async getRoutesByRole(roleId) {
    console.log('API - Using mock data for routes by role (development mode)');
    console.log('API - Available routes in mock data:', routesData.routes);
    console.log('API - Filtering routes for roleId:', roleId);
    
    await new Promise(resolve => setTimeout(resolve, 300));
    const filteredRoutes = routesData.routes.filter(route => 
      route.allowedRoles.includes(roleId)
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

  // GET all roles
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

  // Course Reviews Management methods - Using Mock Data for Development
  
  // GET all reviews with optional filtering
  async getAllReviews(filters = {}) {
    console.log('API - Using mock data for reviews (development mode)');
    console.log('API - Filters applied:', filters);
    
    await new Promise(resolve => setTimeout(resolve, 400));
    
    let filteredReviews = [...reviewsData.reviews];
    
    // Filter by course ID
    if (filters.courseId) {
      filteredReviews = filteredReviews.filter(review => 
        review.courseId === parseInt(filters.courseId)
      );
    }
    
    // Filter by status
    if (filters.status) {
      filteredReviews = filteredReviews.filter(review => 
        review.status === filters.status
      );
    }
    
    // Filter by rating
    if (filters.rating) {
      filteredReviews = filteredReviews.filter(review => 
        review.rating === parseInt(filters.rating)
      );
    }
    
    // Search by student name or email
    if (filters.search) {
      const searchTerm = filters.search.toLowerCase();
      filteredReviews = filteredReviews.filter(review => 
        review.studentName.toLowerCase().includes(searchTerm) ||
        review.studentEmail.toLowerCase().includes(searchTerm) ||
        review.title.toLowerCase().includes(searchTerm) ||
        review.comment.toLowerCase().includes(searchTerm)
      );
    }
    
    // Sort by date (newest first)
    filteredReviews.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    
    console.log('API - Filtered reviews:', filteredReviews.length);
    return filteredReviews;
  }

  // GET reviews by course ID
  async getReviewsByCourse(courseId) {
    console.log('API - Using mock data for reviews by course (development mode)');
    console.log('API - Course ID:', courseId);
    
    await new Promise(resolve => setTimeout(resolve, 300));
    
    const courseReviews = reviewsData.reviews.filter(review => 
      review.courseId === parseInt(courseId)
    ).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    
    console.log('API - Course reviews found:', courseReviews.length);
    return courseReviews;
  }

  // GET review by ID
  async getReviewById(reviewId) {
    console.log('API - Using mock data for review by ID (development mode)');
    console.log('API - Review ID:', reviewId);
    
    await new Promise(resolve => setTimeout(resolve, 200));
    
    const review = reviewsData.reviews.find(r => r.id === parseInt(reviewId));
    console.log('API - Review found:', !!review);
    return review;
  }

  // GET courses list for dropdown
  async getReviewCourses() {
    console.log('API - Using mock data for courses list (development mode)');
    
    await new Promise(resolve => setTimeout(resolve, 200));
    return reviewsData.courses;
  }

  // GET reviews statistics
  async getReviewsStatistics() {
    console.log('API - Using mock data for reviews statistics (development mode)');
    
    await new Promise(resolve => setTimeout(resolve, 200));
    return reviewsData.statistics;
  }

  // UPDATE review status (approve/reject)
  async updateReviewStatus(reviewId, status) {
    console.log('API - Using mock data for updating review status (development mode)');
    console.log('API - Review ID:', reviewId, 'New status:', status);
    
    await new Promise(resolve => setTimeout(resolve, 300));
    
    const reviewIndex = reviewsData.reviews.findIndex(r => r.id === parseInt(reviewId));
    if (reviewIndex !== -1) {
      reviewsData.reviews[reviewIndex].status = status;
      reviewsData.reviews[reviewIndex].updatedAt = new Date().toISOString();
      
      const updatedReview = reviewsData.reviews[reviewIndex];
      console.log('API - Review status updated successfully');
      return updatedReview;
    }
    
    throw new Error('Review not found');
  }

  // UPDATE review content
  async updateReview(reviewId, reviewData) {
    console.log('API - Using mock data for updating review (development mode)');
    console.log('API - Review ID:', reviewId, 'Data:', reviewData);
    
    await new Promise(resolve => setTimeout(resolve, 400));
    
    const reviewIndex = reviewsData.reviews.findIndex(r => r.id === parseInt(reviewId));
    if (reviewIndex !== -1) {
      reviewsData.reviews[reviewIndex] = {
        ...reviewsData.reviews[reviewIndex],
        ...reviewData,
        updatedAt: new Date().toISOString()
      };
      
      const updatedReview = reviewsData.reviews[reviewIndex];
      console.log('API - Review updated successfully');
      return updatedReview;
    }
    
    throw new Error('Review not found');
  }

  // DELETE review
  async deleteReview(reviewId) {
    console.log('API - Using mock data for deleting review (development mode)');
    console.log('API - Review ID:', reviewId);
    
    await new Promise(resolve => setTimeout(resolve, 300));
    
    const reviewIndex = reviewsData.reviews.findIndex(r => r.id === parseInt(reviewId));
    if (reviewIndex !== -1) {
      const deletedReview = reviewsData.reviews[reviewIndex];
      reviewsData.reviews.splice(reviewIndex, 1);
      
      // Update statistics
      reviewsData.statistics.totalReviews = reviewsData.reviews.length;
      reviewsData.statistics.approvedReviews = reviewsData.reviews.filter(r => r.status === 'approved').length;
      reviewsData.statistics.pendingReviews = reviewsData.reviews.filter(r => r.status === 'pending').length;
      reviewsData.statistics.rejectedReviews = reviewsData.reviews.filter(r => r.status === 'rejected').length;
      
      console.log('API - Review deleted successfully');
      return deletedReview;
    }
    
    throw new Error('Review not found');
  }

  // CREATE new review (for testing)
  async createReview(reviewData) {
    console.log('API - Using mock data for creating review (development mode)');
    console.log('API - New review data:', reviewData);
    
    await new Promise(resolve => setTimeout(resolve, 400));
    
    const newReview = {
      id: Math.max(...reviewsData.reviews.map(r => r.id)) + 1,
      ...reviewData,
      status: 'pending',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      helpfulCount: 0,
      verified: false
    };
    
    reviewsData.reviews.push(newReview);
    
    // Update statistics
    reviewsData.statistics.totalReviews = reviewsData.reviews.length;
    reviewsData.statistics.pendingReviews = reviewsData.reviews.filter(r => r.status === 'pending').length;
    
    console.log('API - Review created successfully');
    return newReview;
  }

  // Course Management methods - Using Mock Data for Development
  
  // GET all courses for admin
  async getAllCoursesAdmin() {
    console.log('API - Using mock data for admin courses (development mode)');
    await new Promise(resolve => setTimeout(resolve, 300));
    return reviewsData.courses;
  }

  // GET course by ID for admin
  async getCourseByIdAdmin(courseId) {
    console.log('API - Using mock data for admin course by ID (development mode)');
    console.log('API - Course ID:', courseId);
    
    await new Promise(resolve => setTimeout(resolve, 200));
    const course = reviewsData.courses.find(c => c.id === parseInt(courseId));
    console.log('API - Course found:', !!course);
    return course;
  }

  // GET all course tags
  async getAllCourseTags() {
    console.log('API - Using mock data for course tags (development mode)');
    await new Promise(resolve => setTimeout(resolve, 200));
    return reviewsData.courseTags;
  }

  // GET all course badges
  async getAllCourseBadges() {
    console.log('API - Using mock data for course badges (development mode)');
    await new Promise(resolve => setTimeout(resolve, 200));
    return reviewsData.courseBadges;
  }

  // UPDATE course
  async updateCourse(courseId, courseData) {
    console.log('API - Using mock data for updating course (development mode)');
    console.log('API - Course ID:', courseId, 'Data:', courseData);
    
    await new Promise(resolve => setTimeout(resolve, 400));
    
    const courseIndex = reviewsData.courses.findIndex(c => c.id === parseInt(courseId));
    if (courseIndex !== -1) {
      reviewsData.courses[courseIndex] = {
        ...reviewsData.courses[courseIndex],
        ...courseData,
        updatedAt: new Date().toISOString()
      };
      
      const updatedCourse = reviewsData.courses[courseIndex];
      console.log('API - Course updated successfully');
      return updatedCourse;
    }
    
    throw new Error('Course not found');
  }

  // UPDATE course tags
  async updateCourseTags(courseId, tagIds) {
    console.log('API - Using mock data for updating course tags (development mode)');
    console.log('API - Course ID:', courseId, 'Tag IDs:', tagIds);
    
    await new Promise(resolve => setTimeout(resolve, 300));
    
    const courseIndex = reviewsData.courses.findIndex(c => c.id === parseInt(courseId));
    if (courseIndex !== -1) {
      const tags = tagIds.map(tagId => 
        reviewsData.courseTags.find(tag => tag.id === tagId)
      ).filter(Boolean);
      
      reviewsData.courses[courseIndex].tags = tags.map(tag => tag.name);
      reviewsData.courses[courseIndex].updatedAt = new Date().toISOString();
      
      const updatedCourse = reviewsData.courses[courseIndex];
      console.log('API - Course tags updated successfully');
      return updatedCourse;
    }
    
    throw new Error('Course not found');
  }

  // UPDATE course badge
  async updateCourseBadge(courseId, badgeId) {
    console.log('API - Using mock data for updating course badge (development mode)');
    console.log('API - Course ID:', courseId, 'Badge ID:', badgeId);
    
    await new Promise(resolve => setTimeout(resolve, 300));
    
    const courseIndex = reviewsData.courses.findIndex(c => c.id === parseInt(courseId));
    if (courseIndex !== -1) {
      const badge = reviewsData.courseBadges.find(b => b.id === badgeId);
      
      reviewsData.courses[courseIndex].badge = badge ? badge.name : null;
      reviewsData.courses[courseIndex].updatedAt = new Date().toISOString();
      
      const updatedCourse = reviewsData.courses[courseIndex];
      console.log('API - Course badge updated successfully');
      return updatedCourse;
    }
    
    throw new Error('Course not found');
  }

  // UPDATE course featured status
  async updateCourseFeatured(courseId, featured) {
    console.log('API - Using mock data for updating course featured status (development mode)');
    console.log('API - Course ID:', courseId, 'Featured:', featured);
    
    await new Promise(resolve => setTimeout(resolve, 300));
    
    const courseIndex = reviewsData.courses.findIndex(c => c.id === parseInt(courseId));
    if (courseIndex !== -1) {
      reviewsData.courses[courseIndex].featured = featured;
      reviewsData.courses[courseIndex].updatedAt = new Date().toISOString();
      
      const updatedCourse = reviewsData.courses[courseIndex];
      console.log('API - Course featured status updated successfully');
      return updatedCourse;
    }
    
    throw new Error('Course not found');
  }

  // UPDATE course status
  async updateCourseStatus(courseId, status) {
    console.log('API - Using mock data for updating course status (development mode)');
    console.log('API - Course ID:', courseId, 'Status:', status);
    
    await new Promise(resolve => setTimeout(resolve, 300));
    
    const courseIndex = reviewsData.courses.findIndex(c => c.id === parseInt(courseId));
    if (courseIndex !== -1) {
      reviewsData.courses[courseIndex].status = status;
      reviewsData.courses[courseIndex].updatedAt = new Date().toISOString();
      
      const updatedCourse = reviewsData.courses[courseIndex];
      console.log('API - Course status updated successfully');
      return updatedCourse;
    }
    
    throw new Error('Course not found');
  }

  // CREATE course
  async createCourse(courseData) {
    console.log('API - Using mock data for creating course (development mode)');
    console.log('API - New course data:', courseData);
    
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const newCourse = {
      id: Math.max(...reviewsData.courses.map(c => c.id)) + 1,
      ...courseData,
      status: 'draft',
      rating: 0,
      totalReviews: 0,
      enrollmentCount: 0,
      completionRate: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    reviewsData.courses.push(newCourse);
    console.log('API - Course created successfully');
    return newCourse;
  }

  // DELETE course
  async deleteCourse(courseId) {
    console.log('API - Using mock data for deleting course (development mode)');
    console.log('API - Course ID:', courseId);
    
    await new Promise(resolve => setTimeout(resolve, 300));
    
    const courseIndex = reviewsData.courses.findIndex(c => c.id === parseInt(courseId));
    if (courseIndex !== -1) {
      const deletedCourse = reviewsData.courses[courseIndex];
      reviewsData.courses.splice(courseIndex, 1);
      
      console.log('API - Course deleted successfully');
      return deletedCourse;
    }
    
    throw new Error('Course not found');
  }
}

export const apiService = new ApiService();
