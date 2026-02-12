import React, { useState, useEffect } from 'react';
import { Star, MessageSquare, Calendar, User, ChevronDown, Plus, Edit, Trash2, X } from 'lucide-react';
import { API_CONFIG, ENDPOINTS } from '../../../../config/api';
import AdminPageLayout from '../../../../components/AdminPageLayout';
import GenericDropdown from '../../../../components/GenericDropdown';
import { useAdmin } from '../../../../hooks/useAdmin';

const ReviewManagementPage = () => {
  const { getAllCareerPaths, getAllCoursesAdmin } = useAdmin();
  const [reviewType, setReviewType] = useState('careerpath');
  const [careerPathId, setCareerPathId] = useState('');
  const [courseId, setCourseId] = useState('');
  const [careerPathData, setCareerPathData] = useState(null);
  const [courseReviews, setCourseReviews] = useState([]);
  const [careerPaths, setCareerPaths] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // CRUD states
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedReview, setSelectedReview] = useState(null);
  const [editingReview, setEditingReview] = useState(null);
  const [formData, setFormData] = useState({
    rating: 5,
    reviewText: '',
    reviewBy: '',
    careerPathId: '',
    levelId: '',
    courseId: ''
  });

  const fetchCareerPaths = async () => {
    try {
      const response = await getAllCareerPaths();
      if (response && typeof response === 'object') {
        if (response.data && Array.isArray(response.data)) {
          setCareerPaths(response.data);
        } else if (Array.isArray(response)) {
          setCareerPaths(response);
        } else if (response.items && Array.isArray(response.items)) {
          setCareerPaths(response.items);
        }
      }
    } catch (err) {
      console.error('Failed to fetch career paths:', err);
      setCareerPaths([]);
    }
  };

  const fetchCourses = async () => {
    try {
      const response = await getAllCoursesAdmin();
      const coursesArray = response?.items || response?.data || response || [];
      setCourses(coursesArray);
    } catch (err) {
      console.error('Failed to fetch courses:', err);
      setCourses([]);
    }
  };

  const fetchCareerPathReviews = async (id) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_CONFIG.BASE_URL_Local}${ENDPOINTS.CAREER_PATH_REVIEWS(id)}`);
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
      const response = await fetch(`${API_CONFIG.BASE_URL_Local}${ENDPOINTS.COURSE_REVIEWS(id)}`);
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
      let resourceId, resourceTypeId;
      
      if (reviewType === 'careerpath') {
        resourceId = formData.levelId; // Use level ID for career path reviews
        resourceTypeId = 2; // 2 = career path level
      } else {
        resourceId = formData.courseId; // Use course ID for course reviews
        resourceTypeId = 1; // 1 = course
      }
      
      const response = await fetch(`${API_CONFIG.BASE_URL_Local}${ENDPOINTS.CAREER_PATH_REVIEW_CREATE}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
        },
        body: JSON.stringify({
          review: {
            rating: formData.rating,
            reviewText: formData.reviewText,
            reviewBy: formData.reviewBy
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

  const handleEditReview = (review) => {
    setEditingReview(review);
    setFormData({
      rating: review.rating,
      reviewText: review.reviewText,
      reviewBy: review.reviewBy
    });
    setShowEditModal(true);
  };

  const handleUpdateReview = async () => {
    if (!editingReview || !formData.reviewText.trim() || !formData.reviewBy.trim()) {
      setError('Please fill in all required fields');
      return;
    }

    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`${API_CONFIG.BASE_URL_Local}${ENDPOINTS.CAREER_PATH_REVIEW_UPDATE(editingReview.id)}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
        },
        body: JSON.stringify({
          review: formData,
          resourceId: editingReview.resourceId || editingReview.id,
          resourceTypeId: editingReview.resourceTypeId || (reviewType === 'careerpath' ? 2 : 1)
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
      const response = await fetch(`${API_CONFIG.BASE_URL_Local}${ENDPOINTS.CAREER_PATH_REVIEW_DELETE(review.id)}?resourceId=${review.resourceId || review.id}&resourceTypeId=${review.resourceTypeId || (reviewType === 'careerpath' ? 2 : 1)}`, {
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
  }, []);

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
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Review Type Selector */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Review Type
              </label>
              <div className="relative">
                <select
                  value={reviewType}
                  onChange={(e) => setReviewType(e.target.value)}
                  className="w-full px-4 py-2 pr-8 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white appearance-none"
                >
                  <option value="careerpath">Career Path Reviews</option>
                  <option value="course">Course Reviews</option>
                </select>
                <ChevronDown className="absolute right-2 top-3 w-4 h-4 text-gray-400 pointer-events-none" />
              </div>
            </div>

            {/* ID Input / Career Path Dropdown / Course Dropdown */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {reviewType === 'careerpath' ? 'Career Path' : 'Course'}
              </label>
              {reviewType === 'careerpath' ? (
                <GenericDropdown
                  items={careerPaths}
                  value={careerPathId}
                  onChange={setCareerPathId}
                  placeholder="Select career path..."
                  displayField="title"
                  valueField="id"
                  searchable={true}
                  className="w-full"
                />
              ) : (
                <GenericDropdown
                  items={courses}
                  value={courseId}
                  onChange={setCourseId}
                  placeholder="Select course..."
                  displayField="title"
                  valueField="id"
                  searchable={true}
                  className="w-full"
                />
              )}
            </div>

            {/* Add Review Button */}
            <div className="flex items-end">
              <button
                onClick={() => setShowAddModal(true)}
                disabled={!careerPathId && !courseId}
                className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Add Review
              </button>
            </div>

            {/* Refresh Button */}
            <div className="flex items-end">
              <button
                onClick={() => {
                  if (reviewType === 'careerpath') {
                    fetchCareerPathReviews(careerPathId);
                  } else {
                    fetchCourseReviews(courseId);
                  }
                }}
                className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Refresh
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
                      <GenericDropdown
                        items={careerPaths}
                        value={formData.careerPathId}
                        onChange={(value) => {
                          setFormData({ ...formData, careerPathId: value, levelId: '' });
                          // Fetch career path data to get levels
                          fetchCareerPathReviews(value);
                        }}
                        placeholder="Select career path..."
                        displayField="title"
                        valueField="id"
                        searchable={true}
                        className="w-full"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Career Path Level
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
                    <GenericDropdown
                      items={courses}
                      value={formData.courseId}
                      onChange={(value) => setFormData({ ...formData, courseId: value })}
                      placeholder="Select course..."
                      displayField="title"
                      valueField="id"
                      searchable={true}
                      className="w-full"
                    />
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

export default ReviewManagementPage;
