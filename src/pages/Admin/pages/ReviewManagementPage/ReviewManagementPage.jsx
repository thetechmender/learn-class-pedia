import React, { useState, useEffect, useCallback } from 'react';
import { Star, MessageSquare, Calendar, User, ChevronDown, Plus, Edit, X, Search, BookOpen, Trash2 } from 'lucide-react';
import { API_CONFIG, ENDPOINTS } from '../../../../config/api';
import AdminPageLayout from '../../../../components/AdminPageLayout';
import GenericDropdown from '../../../../components/GenericDropdown';
import { useAdmin } from '../../../../hooks/useAdmin';
import { useCareerPath } from '../../../../hooks/useCareerPath';
import { debugAuth } from '../../../../utils/authDebug';

// Authentication wrapper component
const withAuthCheck = (WrappedComponent) => {
  return () => {
    // Check authentication status on component mount
    const authStatus = debugAuth();
    if (!authStatus.hasToken || authStatus.isExpired) {
      console.warn('🚨 Authentication issue detected:', !authStatus.hasToken ? 'No token found' : 'Token expired');
      // Clear invalid/expired token
      localStorage.removeItem('adminToken');
      // Redirect to login
      if (typeof window !== 'undefined') {
        window.location.href = '/login';
      }
      return null; // Don't render component if redirecting
    }
    
    return <WrappedComponent />;
  };
};

const ReviewManagementPage = () => {
  const { getAllCareerPaths, getAllCoursesAdmin } = useAdmin();
  const { searchCoursesByTitle } = useCareerPath();
  const [reviewType, setReviewType] = useState('careerpath');
  const [careerPathId, setCareerPathId] = useState('');
  const [courseId, setCourseId] = useState('');
  const [careerPathData, setCareerPathData] = useState(null);
  const [courseReviews, setCourseReviews] = useState([]);
  const [careerPaths, setCareerPaths] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // Search states
  const [, setCareerPathLoading] = useState(false);
  const [, setCourseLoading] = useState(false);
  
  // Autocomplete states for courses
  const [courseSearchTerm, setCourseSearchTerm] = useState('');
  const [, setCourseSearchResults] = useState([]);
  const [, setCourseSearchLoading] = useState(false);
  
  // Autocomplete states for career paths
  const [careerPathSearchTerm, setCareerPathSearchTerm] = useState('');
  const [, setCareerPathSearchResults] = useState([]);
  const [, setCareerPathSearchLoading] = useState(false);
  
  // Edit modal autocomplete states
  const [editCourseSearchTerm, setEditCourseSearchTerm] = useState('');
  const [, setEditCourseSearchResults] = useState([]);
  const [, setEditCourseSearchLoading] = useState(false);
  const [editCareerPathSearchTerm, setEditCareerPathSearchTerm] = useState('');
  const [, setEditCareerPathSearchResults] = useState([]);
  const [, setEditCareerPathSearchLoading] = useState(false);
  
  // Main page autocomplete states
  const [mainCareerPathSearchTerm, setMainCareerPathSearchTerm] = useState('');
  const [mainCareerPathSearchResults, setMainCareerPathSearchResults] = useState([]);
  const [mainCareerPathSearchLoading, setMainCareerPathSearchLoading] = useState(false);
  const [mainCourseSearchTerm, setMainCourseSearchTerm] = useState('');
  const [mainCourseSearchResults, setMainCourseSearchResults] = useState([]);
  const [mainCourseSearchLoading, setMainCourseSearchLoading] = useState(false);
  
  // CRUD states
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingReview, setEditingReview] = useState(null);
  const [editModalData, setEditModalData] = useState({
    careerPaths: [],
    courses: [],
    careerPathLevels: [],
    selectedCareerPath: '',
    selectedLevel: '',
    selectedCourse: ''
  });
  const [formData, setFormData] = useState({
    rating: 5,
    reviewText: '',
    reviewBy: '',
    careerPathId: '',
    levelId: '',
    courseId: ''
  });

  // Search and fetch functions with pagination
  const fetchCareerPaths = useCallback(async (searchTerm = '', page = 1) => {
    setCareerPathLoading(true);
    try {
      const params = {
        page,
        pageSize: 10
      };
      
      if (searchTerm) {
        params.Title = searchTerm; // Use Title (capital T) as per CareerPath page
      }
      
      console.log('Fetching career paths with params:', params);
      const response = await getAllCareerPaths(params);
      console.log('Career Paths API Response:', response);
      const careerPathsArray = response?.data || response?.items || response || [];
      console.log('Career Paths Array:', careerPathsArray);
      
      // Format for dropdown
      const formattedPaths = careerPathsArray.map(path => ({
        id: path.id,
        title: path.title,
        description: path.description
      }));
      
      setCareerPaths(formattedPaths);
    } catch (err) {
      console.error('Failed to fetch career paths:', err);
      setCareerPaths([]);
    } finally {
      setCareerPathLoading(false);
    }
  }, [getAllCareerPaths]);

  const fetchCourses = useCallback(async (searchTerm = '', page = 1) => {
    setCourseLoading(true);
    try {
      const params = {
        page,
        pageSize: 10
      };
      
      if (searchTerm) {
        params.Title = searchTerm; // Use Title (capital T) as per API endpoint
      }
      
      console.log('Fetching courses with params:', params);
      const response = await getAllCoursesAdmin(params);
      console.log('Courses API Response:', response);
      const coursesArray = response?.items || response?.data || response || [];
      console.log('Courses Array:', coursesArray);
      
      // Format for dropdown
      const formattedCourses = coursesArray.map(course => ({
        courseId: course.id,
        title: course.title,
        description: course.description
      }));
      
      setCourses(formattedCourses);
    } catch (err) {
      console.error('Failed to fetch courses:', err);
      setCourses([]);
    } finally {
      setCourseLoading(false);
    }
  }, [getAllCoursesAdmin]);

  // Load initial data
  useEffect(() => {
    fetchCareerPaths('', 1);
    fetchCourses('', 1);
  }, [fetchCareerPaths, fetchCourses]);

  // Course search autocomplete handler
  const handleCourseSearch = useCallback(async (searchTerm) => {
    if (!searchTerm || searchTerm.length < 2) {
      setCourseSearchResults([]);
      return;
    }

    try {
      setCourseSearchLoading(true);
      const results = await searchCoursesByTitle(searchTerm);
      // Format results for dropdown
      const formattedResults = results.map(course => ({
        courseId: course.id,
        title: course.title,
        description: course.description
      }));
      setCourseSearchResults(formattedResults);
    } catch (error) {
      console.error('Failed to search courses:', error);
      setCourseSearchResults([]);
    } finally {
      setCourseSearchLoading(false);
    }
  }, [searchCoursesByTitle]);

  // Career path search autocomplete handler
  const handleCareerPathSearch = useCallback(async (searchTerm) => {
    if (!searchTerm || searchTerm.length < 2) {
      setCareerPathSearchResults([]);
      return;
    }

    try {
      setCareerPathSearchLoading(true);
      const params = {
        page: 1,
        pageSize: 10
      };
      
      if (searchTerm) {
        params.Title = searchTerm; // Use Title (capital T) as per CareerPath page
      }
      
      const response = await getAllCareerPaths(params);
      const careerPathsArray = response?.data || response?.items || response || [];
      
      // Format results for dropdown
      const formattedResults = careerPathsArray.map(path => ({
        id: path.id,
        title: path.title,
        description: path.description
      }));
      
      setCareerPathSearchResults(formattedResults);
    } catch (error) {
      console.error('Failed to search career paths:', error);
      setCareerPathSearchResults([]);
    } finally {
      setCareerPathSearchLoading(false);
    }
  }, [getAllCareerPaths]);

  // Edit modal course search autocomplete handler
  const handleEditCourseSearch = useCallback(async (searchTerm) => {
    if (!searchTerm || searchTerm.length < 2) {
      setEditCourseSearchResults([]);
      return;
    }

    try {
      setEditCourseSearchLoading(true);
      const results = await searchCoursesByTitle(searchTerm);
      // Format results for dropdown
      const formattedResults = results.map(course => ({
        courseId: course.id,
        title: course.title,
        description: course.description
      }));
      setEditCourseSearchResults(formattedResults);
    } catch (error) {
      console.error('Failed to search courses:', error);
      setEditCourseSearchResults([]);
    } finally {
      setEditCourseSearchLoading(false);
    }
  }, [searchCoursesByTitle]);

  // Edit modal career path search autocomplete handler
  const handleEditCareerPathSearch = useCallback(async (searchTerm) => {
    if (!searchTerm || searchTerm.length < 2) {
      setEditCareerPathSearchResults([]);
      return;
    }

    try {
      setEditCareerPathSearchLoading(true);
      const params = {
        page: 1,
        pageSize: 10
      };
      
      if (searchTerm) {
        params.Title = searchTerm; // Use Title (capital T) as per CareerPath page
      }
      
      const response = await getAllCareerPaths(params);
      const careerPathsArray = response?.data || response?.items || response || [];
      
      // Format results for dropdown
      const formattedResults = careerPathsArray.map(path => ({
        id: path.id,
        title: path.title,
        description: path.description
      }));
      
      setEditCareerPathSearchResults(formattedResults);
    } catch (error) {
      console.error('Failed to search career paths:', error);
      setEditCareerPathSearchResults([]);
    } finally {
      setEditCareerPathSearchLoading(false);
    }
  }, [getAllCareerPaths]);

  // Main page career path search autocomplete handler
  const handleMainCareerPathSearch = useCallback(async (searchTerm) => {
    if (!searchTerm || searchTerm.length < 2) {
      setMainCareerPathSearchResults([]);
      return;
    }

    try {
      setMainCareerPathSearchLoading(true);
      const params = {
        page: 1,
        pageSize: 10
      };
      
      if (searchTerm) {
        params.Title = searchTerm; // Use Title (capital T) as per CareerPath page
      }
      
      const response = await getAllCareerPaths(params);
      const careerPathsArray = response?.data || response?.items || response || [];
      
      // Format results for dropdown
      const formattedResults = careerPathsArray.map(path => ({
        id: path.id,
        title: path.title,
        description: path.description
      }));
      
      setMainCareerPathSearchResults(formattedResults);
    } catch (error) {
      console.error('Failed to search career paths:', error);
      setMainCareerPathSearchResults([]);
    } finally {
      setMainCareerPathSearchLoading(false);
    }
  }, [getAllCareerPaths]);

  // Main page course search autocomplete handler
  const handleMainCourseSearch = useCallback(async (searchTerm) => {
    if (!searchTerm || searchTerm.length < 2) {
      setMainCourseSearchResults([]);
      return;
    }

    try {
      setMainCourseSearchLoading(true);
      const results = await searchCoursesByTitle(searchTerm);
      // Format results for dropdown
      const formattedResults = results.map(course => ({
        courseId: course.id,
        title: course.title,
        description: course.description
      }));
      setMainCourseSearchResults(formattedResults);
    } catch (error) {
      console.error('Failed to search courses:', error);
      setMainCourseSearchResults([]);
    } finally {
      setMainCourseSearchLoading(false);
    }
  }, [searchCoursesByTitle]);

  // Reset function to clear selection and refresh data
  const handleReset = () => {
    setCareerPathId('');
    setCourseId('');
    setMainCareerPathSearchTerm('');
    setMainCourseSearchTerm('');
    setMainCareerPathSearchResults([]);
    setMainCourseSearchResults([]);
    setCareerPathData(null);
    setCourseReviews([]);
    setError(null);
  };

  // Sync main page selections with modal form data
  useEffect(() => {
    if (showAddModal) {
      if (reviewType === 'course' && courseId && mainCourseSearchTerm) {
        setFormData(prev => ({
          ...prev,
          courseId: courseId
        }));
        setCourseSearchTerm(mainCourseSearchTerm);
      } else if (reviewType === 'careerpath' && careerPathId && mainCareerPathSearchTerm) {
        setFormData(prev => ({
          ...prev,
          careerPathId: careerPathId
        }));
        setCareerPathSearchTerm(mainCareerPathSearchTerm);
        fetchCareerPathLevels(careerPathId);
      }
    }
  }, [showAddModal, reviewType, courseId, careerPathId, mainCourseSearchTerm, mainCareerPathSearchTerm]);

  // Sync main page selections with edit modal form data
  useEffect(() => {
    if (showEditModal && editingReview) {
      if (reviewType === 'course' && courseId && mainCourseSearchTerm) {
        setEditModalData(prev => ({
          ...prev,
          selectedCourse: courseId
        }));
        setEditCourseSearchTerm(mainCourseSearchTerm);
      } else if (reviewType === 'careerpath' && careerPathId && mainCareerPathSearchTerm) {
        setEditModalData(prev => ({
          ...prev,
          selectedCareerPath: careerPathId
        }));
        setEditCareerPathSearchTerm(mainCareerPathSearchTerm);
        fetchCareerPathLevelsForEdit(careerPathId);
      }
    }
  }, [showEditModal, reviewType, courseId, careerPathId, mainCourseSearchTerm, mainCareerPathSearchTerm, editingReview]);

  const fetchCareerPathLevels = async (careerPathId) => {
    try {
      const response = await fetch(`${API_CONFIG.BASE_URL}${ENDPOINTS.REVIEW_CAREER_PATH_LEVELS(careerPathId)}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
        }
      });
      
      if (response.ok) {
        const levels = await response.json();
        setCareerPathData(prev => ({
          ...prev,
          levels: levels.map(level => ({
            id: level.id,
            title: level.title,
            description: level.description
          }))
        }));
      }
    } catch (err) {
      console.error('Failed to fetch career path levels:', err);
      setCareerPathData(prev => ({
        ...prev,
        levels: []
      }));
    }
  };

  const fetchCareerPathReviews = async (id) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_CONFIG.BASE_URL}${ENDPOINTS.CAREER_PATH_REVIEWS(id)}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setCareerPathData(data);
    } catch (err) {
      setError(`Failed to fetch career path reviews: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const fetchCourseReviews = async (id) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_CONFIG.BASE_URL}${ENDPOINTS.COURSE_REVIEWS(id)}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setCourseReviews(data);
    } catch (err) {
      setError(`Failed to fetch course reviews: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  // CRUD Functions
  const handleAddReview = async () => {
    if (!formData.reviewText.trim() || !formData.reviewBy.trim()) {
      setError('Please fill in all required fields');
      return;
    }

    // Validate selection based on review type
    if (reviewType === 'careerpath') {
      if (!formData.careerPathId || !formData.levelId) {
        setError('Please select career path and level');
        return;
      }
    } else {
      if (!formData.courseId) {
        setError('Please select a course');
        return;
      }
    }

    setLoading(true);
    setError(null);
    
    try {
      let resourceId, resourceTypeId, courseId;
      
      if (reviewType === 'careerpath') {
       
        resourceId = formData.careerPathId;   
        resourceTypeId = 2;          
        courseId = 0;                 
      } else {
       
        resourceId = 0;                 
        resourceTypeId = 1;           
        courseId = formData.courseId;       
      }
      
      const response = await fetch(`${API_CONFIG.BASE_URL}${ENDPOINTS.CAREER_PATH_REVIEW_CREATE}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
        },
        body: JSON.stringify({
          review: {
            rating: formData.rating,
            reviewText: formData.reviewText,
            reviewBy: formData.reviewBy,
            courseId: courseId 
          },
          resourceId: resourceId,      
          resourceTypeId: resourceTypeId  
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      setShowAddModal(false);
      setFormData({
        rating: 5,
        reviewText: '',
        reviewBy: '',
        careerPathId: '',
        levelId: '',
        courseId: ''
      });
      
      // Refresh reviews
      if (reviewType === 'careerpath') {
        fetchCareerPathReviews(careerPathId);
      } else {
        fetchCourseReviews(courseId);
      }
    } catch (err) {
      setError(`Failed to add review: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const fetchCareerPathLevelsForEdit = async (careerPathId) => {
    try {
      const response = await fetch(`${API_CONFIG.BASE_URL}${ENDPOINTS.REVIEW_CAREER_PATH_LEVELS(careerPathId)}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        setEditModalData(prev => ({ ...prev, careerPathLevels: data }));
      }
    } catch (err) {
      console.error('Failed to fetch career path levels:', err);
      setEditModalData(prev => ({ ...prev, careerPathLevels: [] }));
    }
  };

  const handleEditReview = async (review) => {
    try {
      // Fetch review with details
      const response = await fetch(`${API_CONFIG.BASE_URL}${ENDPOINTS.REVIEW_WITH_DETAILS(review.id)}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
        }
      });
      
      if (response.ok) {
        const reviewDetails = await response.json();
        setEditingReview(reviewDetails);
        
        // Set form data
        setFormData({
          rating: reviewDetails.rating,
          reviewText: reviewDetails.reviewText,
          reviewBy: reviewDetails.reviewBy
        });
        
        // Set edit modal data based on review type
        if (reviewDetails.resourceTypeId === 1) {
          // Course review - use nested course object
          setEditModalData({
            careerPaths: [],
            courses: courses,
            careerPathLevels: [],
            selectedCareerPath: '',
            selectedLevel: '',
            selectedCourse: reviewDetails.course?.courseId || reviewDetails.courseId  // Use nested course.courseId first
          });
        } else if (reviewDetails.resourceTypeId === 2) {
          // Career path level review
          setEditModalData({
            careerPaths: careerPaths,
            courses: [],
            careerPathLevels: [],
            selectedCareerPath: reviewDetails.careerPath?.id || '',
            selectedLevel: reviewDetails.careerPathLevel?.id || '',
            selectedCourse: ''
          });
          
          // Fetch levels for the career path
          if (reviewDetails.careerPath?.id) {
            await fetchCareerPathLevelsForEdit(reviewDetails.careerPath.id);
          }
        }
        
        setShowEditModal(true);
      }
    } catch (err) {
      setError(`Failed to load review details: ${err.message}`);
    }
  };

  const handleUpdateReview = async () => {
    if (!editingReview || !formData.reviewText.trim() || !formData.reviewBy.trim()) {
      setError('Please fill in all required fields');
      return;
    }

    setLoading(true);
    setError(null);
    
    try {
      let resourceId, resourceTypeId, courseId;
      
      // Determine resource type and ID based on the original review
      if (editingReview.resourceTypeId === 2) {
        // Career path level review: ResourceTypeId = 2 AND CourseId = 0
        resourceId = editModalData.selectedCareerPath || editingReview.resourceId;
        resourceTypeId = 2; // 2 = career path level
        courseId = 0;       // CourseId = 0 for career path reviews
      } else {
        // Course review: ResourceTypeId = 1 AND CourseId ≠ 0
        resourceId = 0; // Ignore ResourceId for course reviews
        resourceTypeId = 1; // 1 = course
        courseId = editModalData.selectedCourse || editingReview.courseId;
      }
      
      const response = await fetch(`${API_CONFIG.BASE_URL}${ENDPOINTS.CAREER_PATH_REVIEW_UPDATE(editingReview.id)}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
        },
        body: JSON.stringify({
          review: {
            rating: formData.rating,
            reviewText: formData.reviewText,
            reviewBy: formData.reviewBy,
            courseId: courseId  // Include courseId in review object
          },
          resourceId: resourceId,      // CareerPathId for career paths, 0 for courses
          resourceTypeId: resourceTypeId  // 2 for career paths, 1 for courses
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      setShowEditModal(false);
      setEditingReview(null);
      setFormData({ rating: 5, reviewText: '', reviewBy: '' });
      
      // Refresh reviews
      if (reviewType === 'careerpath') {
        fetchCareerPathReviews(careerPathId);
      } else {
        fetchCourseReviews(courseId);
      }
    } catch (err) {
      setError(`Failed to update review: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteReview = async (review) => {
    if (!window.confirm('Are you sure you want to delete this review?')) {
      return;
    }

    setLoading(true);
    setError(null);
    
    try {
      let resourceId, resourceTypeId;
      
      // Determine resource type and ID based on review
      if (review.resourceTypeId === 2) {
        // Career path level review: ResourceTypeId = 2 AND CourseId = 0
        resourceId = review.resourceId; // This is the level ID
        resourceTypeId = 2; // 2 = career path level
      } else {
        // Course review: ResourceTypeId = 1 AND CourseId ≠ 0
        resourceId = 0; // Ignore ResourceId for course reviews
        resourceTypeId = 1; // 1 = course
      }
      
      const response = await fetch(`${API_CONFIG.BASE_URL}${ENDPOINTS.CAREER_PATH_REVIEW_DELETE(review.id)}?resourceId=${resourceId}&resourceTypeId=${resourceTypeId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      // Refresh reviews
      if (reviewType === 'careerpath') {
        fetchCareerPathReviews(careerPathId);
      } else {
        fetchCourseReviews(courseId);
      }
    } catch (err) {
      setError(`Failed to delete review: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCareerPaths();
    fetchCourses();
  }, [fetchCareerPaths, fetchCourses]);

  useEffect(() => {
    if (reviewType === 'careerpath' && careerPathId) {
      fetchCareerPathReviews(careerPathId);
    } else if (reviewType === 'course' && courseId) {
      fetchCourseReviews(courseId);
    }
  }, [reviewType, careerPathId, courseId]);

  const StarRating = ({ rating }) => {
    return (
      <div className="flex items-center gap-1">
        {[...Array(5)].map((_, index) => (
          <Star
            key={index}
            size={16}
            className={index < rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}
          />
        ))}
      </div>
    );
  };

  const CareerPathReviewTable = ({ data }) => {
    if (!data || !data.levels || data.levels.length === 0) {
      return (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 text-center text-gray-500 dark:text-gray-400">
          No reviews found for this career path.
        </div>
      );
    }

    return (
      <div className="space-y-6">
        {data.levels.map((level) => (
          <div key={level.id} className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
            <div className="bg-gray-50 dark:bg-gray-700 px-6 py-3 border-b border-gray-200 dark:border-gray-600">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                {level.title}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                {level.description}
              </p>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      ID
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Rating
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Review Text
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Review By
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {level.reviews && level.reviews.map((review) => (
                    <tr key={review.id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                        {review.id}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <StarRating rating={review.rating} />
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900 dark:text-gray-300 max-w-md">
                        <div className="truncate" title={review.reviewText}>
                          {review.reviewText}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-300">
                        <div className="flex items-center gap-2">
                          <User className="w-4 h-4 text-gray-400" />
                          {review.reviewBy}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-gray-400" />
                          {new Date(review.createdAt).toLocaleDateString()}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleEditReview(review)}
                            className="p-2 text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 transition-colors"
                            title="Edit review"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteReview(review)}
                            className="p-2 text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300 transition-colors"
                            title="Delete review"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ))}
      </div>
    );
  };

  const CourseReviewTable = ({ reviews }) => {
    if (!reviews || reviews.length === 0) {
      return (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 text-center text-gray-500 dark:text-gray-400">
          No reviews found for this course.
        </div>
      );
    }

    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Rating
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Review Text
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Review By
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {reviews.map((review) => (
                <tr key={review.id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                    {review.id}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <StarRating rating={review.rating} />
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900 dark:text-gray-300 max-w-md">
                    <div className="truncate" title={review.reviewText}>
                      {review.reviewText}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-300">
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4 text-gray-400" />
                      {review.reviewBy}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-gray-400" />
                      {new Date(review.createdAt).toLocaleDateString()}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleEditReview(review)}
                        className="p-2 text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 transition-colors"
                        title="Edit review"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteReview(review)}
                        className="p-2 text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300 transition-colors"
                        title="Delete review"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  return (
    <AdminPageLayout
      title="Review Management"
      subtitle="Manage and view reviews for career paths and courses"
      icon={MessageSquare}
      loading={loading}
    >
      <div className="space-y-6">
        {/* Controls */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <div className="space-y-4">
            {/* First Row: Review Type and Search */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
              {/* Review Type Selector */}
              <div className="md:col-span-3">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Review Type
                </label>
                <div className="relative">
                  <select
                    value={reviewType}
                    onChange={(e) => setReviewType(e.target.value)}
                    className="w-full px-4 py-2.5 pr-8 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white appearance-none"
                  >
                    <option value="careerpath">Career Path Reviews</option>
                    <option value="course">Course Reviews</option>
                  </select>
                  <ChevronDown className="absolute right-2 top-3 w-4 h-4 text-gray-400 pointer-events-none" />
                </div>
              </div>

              {/* ID Input / Career Path Autocomplete / Course Autocomplete */}
              <div className="md:col-span-9">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {reviewType === 'careerpath' ? 'Career Path' : 'Course'}
                </label>
                <div className="relative">
                {reviewType === 'careerpath' ? (
                  <>
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <input
                        type="text"
                        value={mainCareerPathSearchTerm}
                        onChange={(e) => {
                          setMainCareerPathSearchTerm(e.target.value);
                          handleMainCareerPathSearch(e.target.value);
                        }}
                        placeholder="Search career paths by title..."
                        className="pl-9 pr-3 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent w-full"
                      />
                      {mainCareerPathSearchLoading && (
                        <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                          <div className="w-4 h-4 border-2 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
                        </div>
                      )}
                    </div>

                    {/* Autocomplete Dropdown - Fixed positioning */}
                    {mainCareerPathSearchResults.length > 0 && (
                      <div className="absolute z-50 mt-1 w-full border border-gray-200 rounded-xl max-h-48 overflow-y-auto bg-white shadow-lg">
                        {mainCareerPathSearchResults.map(path => (
                          <div
                            key={path.id}
                            className={`flex items-center p-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0 ${
                              careerPathId === path.id ? 'bg-blue-50' : ''
                            }`}
                            onClick={() => {
                              setCareerPathId(path.id);
                              setMainCareerPathSearchTerm(path.title);
                              setMainCareerPathSearchResults([]);
                            }}
                          >
                            <div className="flex-1 min-w-0">
                              <div className="text-sm font-medium text-gray-900 truncate">
                                {path.title}
                              </div>
                              {path.description && (
                                <div className="text-xs text-gray-500 truncate mt-1">
                                  {path.description}
                                </div>
                              )}
                            </div>
                            {careerPathId === path.id && (
                              <div className="w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center">
                                <div className="w-2 h-2 bg-white rounded-full"></div>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}

                    {mainCareerPathSearchTerm && mainCareerPathSearchResults.length === 0 && !mainCareerPathSearchLoading && !careerPathId && (
                      <div className="absolute z-50 mt-1 w-full p-4 text-center border border-gray-200 rounded-xl bg-gray-50">
                        <BookOpen className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                        <p className="text-sm text-gray-600">No career paths found matching your search</p>
                      </div>
                    )}
                  </>
                ) : (
                  <>
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <input
                        type="text"
                        value={mainCourseSearchTerm}
                        onChange={(e) => {
                          setMainCourseSearchTerm(e.target.value);
                          handleMainCourseSearch(e.target.value);
                        }}
                        placeholder="Search courses by title..."
                        className="pl-9 pr-3 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent w-full"
                      />
                      {mainCourseSearchLoading && (
                        <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                          <div className="w-4 h-4 border-2 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
                        </div>
                      )}
                    </div>

                    {/* Autocomplete Dropdown - Fixed positioning */}
                    {mainCourseSearchResults.length > 0 && (
                      <div className="absolute z-50 mt-1 w-full border border-gray-200 rounded-xl max-h-48 overflow-y-auto bg-white shadow-lg">
                        {mainCourseSearchResults.map(course => (
                          <div
                            key={course.courseId}
                            className={`flex items-center p-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0 ${
                              courseId === course.courseId ? 'bg-blue-50' : ''
                            }`}
                            onClick={() => {
                              setCourseId(course.courseId);
                              setMainCourseSearchTerm(course.title);
                              setMainCourseSearchResults([]);
                            }}
                          >
                            <div className="flex-1 min-w-0">
                              <div className="text-sm font-medium text-gray-900 truncate">
                                {course.title}
                              </div>
                              {course.description && (
                                <div className="text-xs text-gray-500 truncate mt-1">
                                  {course.description}
                                </div>
                              )}
                            </div>
                            {courseId === course.courseId && (
                              <div className="w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center">
                                <div className="w-2 h-2 bg-white rounded-full"></div>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}

                    {mainCourseSearchTerm && mainCourseSearchResults.length === 0 && !mainCourseSearchLoading && !courseId && (
                      <div className="absolute z-50 mt-1 w-full p-4 text-center border border-gray-200 rounded-xl bg-gray-50">
                        <BookOpen className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                        <p className="text-sm text-gray-600">No courses found matching your search</p>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
            </div>

            {/* Second Row: Action Buttons */}
            <div className="flex justify-end gap-3 pt-2 border-t border-gray-200 dark:border-gray-700">
              <button
                onClick={() => setShowAddModal(true)}
                disabled={!careerPathId && !courseId}
                className="px-6 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center gap-2 text-sm font-medium shadow-sm"
              >
                <Plus className="w-4 h-4" />
                Add Review
              </button>
              <button
                onClick={handleReset}
                className="px-6 py-2.5 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors flex items-center gap-2 text-sm font-medium shadow-sm"
              >
                <X className="w-4 h-4" />
                Reset
              </button>
            </div>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
            <div className="flex items-center gap-2 text-red-700 dark:text-red-400">
              <MessageSquare className="w-5 h-5" />
              <span>{error}</span>
            </div>
          </div>
        )}

        {/* Reviews Display */}
        {reviewType === 'careerpath' ? (
          <CareerPathReviewTable data={careerPathData} />
        ) : (
          <CourseReviewTable reviews={courseReviews} />
        )}

        {/* Add Review Modal */}
        {showAddModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 w-full max-w-md mx-4">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Add New Review
                </h3>
                <button
                  onClick={() => setShowAddModal(false)}
                  className="text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Rating
                  </label>
                  <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map((rating) => (
                      <button
                        key={rating}
                        type="button"
                        onClick={() => setFormData({ ...formData, rating })}
                        className={`p-2 rounded-lg border-2 transition-colors ${
                          formData.rating === rating
                            ? 'border-blue-500 bg-blue-50 text-blue-600 dark:bg-blue-900 dark:text-blue-400'
                            : 'border-gray-300 hover:border-gray-400 text-gray-600 dark:border-gray-600 dark:text-gray-400 dark:hover:border-gray-500'
                        }`}
                      >
                        <Star className={`w-4 h-4 ${formData.rating === rating ? 'fill-current' : ''}`} />
                      </button>
                    ))}
                  </div>
                </div>

                {/* Career Path and Level Selection */}
                {reviewType === 'careerpath' && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Career Path
                      </label>
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <input
                          type="text"
                          value={careerPathSearchTerm}
                          onChange={(e) => {
                            setCareerPathSearchTerm(e.target.value);
                            handleCareerPathSearch(e.target.value);
                          }}
                          placeholder="Search career paths by title..."
                          className="pl-9 pr-3 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent w-full"
                          disabled={reviewType === 'careerpath' && careerPathId && mainCareerPathSearchTerm === careerPathSearchTerm}
                        />
                        {careerPathSearchLoading && (
                          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                            <div className="w-4 h-4 border-2 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
                          </div>
                        )}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Level
                      </label>
                      <GenericDropdown
                        items={careerPathData?.levels || []}
                        value={formData.levelId}
                        onChange={(value) => setFormData({ ...formData, levelId: value })}
                        placeholder="Select level..."
                        displayField="title"
                        valueField="id"
                        searchable={true}
                        className="w-full"
                        disabled={!formData.careerPathId}
                      />
                    </div>
                  </>
                )}

                {/* Course Selection */}
                {reviewType === 'course' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Course
                    </label>
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <input
                        type="text"
                        value={courseSearchTerm}
                        onChange={(e) => {
                          setCourseSearchTerm(e.target.value);
                          handleCourseSearch(e.target.value);
                        }}
                        placeholder="Search courses by title..."
                        className="pl-9 pr-3 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent w-full"
                        disabled={reviewType === 'course' && courseId && mainCourseSearchTerm === courseSearchTerm}
                      />
                      {courseSearchLoading && (
                        <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                          <div className="w-4 h-4 border-2 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Review By
                  </label>
                  <input
                    type="text"
                    value={formData.reviewBy}
                    onChange={(e) => setFormData({ ...formData, reviewBy: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    placeholder="Enter reviewer name..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Review Text
                  </label>
                  <textarea
                    value={formData.reviewText}
                    onChange={(e) => setFormData({ ...formData, reviewText: e.target.value })}
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    placeholder="Enter review text..."
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-6">
                <button
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddReview}
                  disabled={loading}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  {loading ? 'Adding...' : 'Add Review'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Edit Review Modal */}
        {showEditModal && editingReview && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 w-full max-w-md mx-4">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Edit Review
                </h3>
                <button
                  onClick={() => setShowEditModal(false)}
                  className="text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Rating
                  </label>
                  <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map((rating) => (
                      <button
                        key={rating}
                        type="button"
                        onClick={() => setFormData({ ...formData, rating })}
                        className={`p-2 rounded-lg border-2 transition-colors ${
                          formData.rating === rating
                            ? 'border-blue-500 bg-blue-50 text-blue-600 dark:bg-blue-900 dark:text-blue-400'
                            : 'border-gray-300 hover:border-gray-400 text-gray-600 dark:border-gray-600 dark:text-gray-400 dark:hover:border-gray-500'
                        }`}
                      >
                        <Star className={`w-4 h-4 ${formData.rating === rating ? 'fill-current' : ''}`} />
                      </button>
                    ))}
                  </div>
                </div>

                {/* Career Path and Level Selection for Edit */}
                {editingReview.resourceTypeId === 2 && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Career Path
                      </label>
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <input
                          type="text"
                          value={editCareerPathSearchTerm}
                          onChange={(e) => {
                            setEditCareerPathSearchTerm(e.target.value);
                            handleEditCareerPathSearch(e.target.value);
                          }}
                          placeholder="Search career paths by title..."
                          className="pl-9 pr-3 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent w-full"
                          disabled={reviewType === 'careerpath' && careerPathId && mainCareerPathSearchTerm === editCareerPathSearchTerm}
                        />
                        {editCareerPathSearchLoading && (
                          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                            <div className="w-4 h-4 border-2 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
                          </div>
                        )}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Career Path Level
                      </label>
                      <GenericDropdown
                        items={editModalData.careerPathLevels}
                        value={editModalData.selectedLevel}
                        onChange={(value) => setEditModalData({ ...editModalData, selectedLevel: value })}
                        placeholder="Select level..."
                        displayField="title"
                        valueField="id"
                        searchable={true}
                        className="w-full"
                        disabled={!editModalData.selectedCareerPath}
                      />
                    </div>
                  </>
                )}

                {/* Course Selection for Edit */}
                {editingReview.resourceTypeId === 1 && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Course
                    </label>
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <input
                        type="text"
                        value={editCourseSearchTerm}
                        onChange={(e) => {
                          setEditCourseSearchTerm(e.target.value);
                          handleEditCourseSearch(e.target.value);
                        }}
                        placeholder="Search courses by title..."
                        className="pl-9 pr-3 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent w-full"
                        disabled={reviewType === 'course' && courseId && mainCourseSearchTerm === editCourseSearchTerm}
                      />
                      {editCourseSearchLoading && (
                        <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                          <div className="w-4 h-4 border-2 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Review By
                  </label>
                  <input
                    type="text"
                    value={formData.reviewBy}
                    onChange={(e) => setFormData({ ...formData, reviewBy: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    placeholder="Enter reviewer name..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Review Text
                  </label>
                  <textarea
                    value={formData.reviewText}
                    onChange={(e) => setFormData({ ...formData, reviewText: e.target.value })}
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    placeholder="Enter review text..."
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-6">
                <button
                  onClick={() => setShowEditModal(false)}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  Cancel
                </button>
                <button
                  onClick={handleUpdateReview}
                  disabled={loading}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  {loading ? 'Updating...' : 'Update Review'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminPageLayout>
  );
};

export default withAuthCheck(ReviewManagementPage);
