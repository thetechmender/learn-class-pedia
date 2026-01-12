import { API_CONFIG, ENDPOINTS, HTTP_STATUS } from '../config/api';

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
}

export const apiService = new ApiService();