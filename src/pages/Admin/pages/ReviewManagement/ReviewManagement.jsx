import React, { useState, useEffect } from 'react';
import { 
  Star, 
  Search, 
  Eye, 
  Edit, 
  Trash2, 
  MessageSquare,
  Filter,
  ThumbsUp,
  ThumbsDown,
  Clock,
  User,
  Flag,
  CheckCircle,
  XCircle,
  AlertCircle
} from 'lucide-react';
import { useReviewManagement } from '../../../hooks/useReviewManagement';
import { useToast } from '../../../hooks/useToast';

const ReviewManagement = () => {
  const { toast, showToast } = useToast();
  
  // API operations from hook
  const {
    loading,
    error,
    clearError,
    getAllReviews,
    getReviewById,
    updateReviewStatus,
    respondToReview,
    deleteReview,
    markReviewHelpful
  } = useReviewManagement();
  const [reviews, setReviews] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRating, setFilterRating] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedReview, setSelectedReview] = useState(null);

  // Fetch reviews
  const fetchReviews = async () => {
    try {
      const filters = {
        search: searchTerm,
        rating: filterRating !== 'all' ? filterRating : undefined,
        status: filterStatus !== 'all' ? filterStatus : undefined
      };
      const data = await getAllReviews(filters);
      setReviews(data);
    } catch (err) {
      showToast('Failed to fetch reviews', 'error');
    }
  };

  useEffect(() => {
    fetchReviews();
  }, [searchTerm, filterRating, filterStatus]);

  const filteredReviews = reviews.filter(review => {
    const matchesSearch = review.userName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         review.courseTitle?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         review.comment?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRating = filterRating === 'all' || review.rating === parseInt(filterRating);
    const matchesStatus = filterStatus === 'all' || review.status === filterStatus;
    return matchesSearch && matchesRating && matchesStatus;
  });

  const getStatusColor = (status) => {
    switch (status) {
      case 'approved': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'flagged': return 'bg-red-100 text-red-800';
      case 'rejected': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'approved': return <CheckCircle className="w-4 h-4" />;
      case 'pending': return <Clock className="w-4 h-4" />;
      case 'flagged': return <Flag className="w-4 h-4" />;
      case 'rejected': return <XCircle className="w-4 h-4" />;
      default: return <AlertCircle className="w-4 h-4" />;
    }
  };

  const handleStatusUpdate = (reviewId, newStatus) => {
    setReviews(prev => prev.map(review => 
      review.id === reviewId ? { ...review, status: newStatus } : review
    ));
  };

  const renderStars = (rating) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${i < rating ? 'text-yellow-400 fill-current' : 'text-gray-300 dark:text-gray-600'}`}
      />
    ));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Review Management</h1>
            <p className="text-gray-600 dark:text-gray-300 mt-2">Manage and moderate course reviews</p>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Reviews</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{reviews.length}</p>
            </div>
            <div className="bg-blue-100 dark:bg-blue-900/30 p-3 rounded-lg">
              <MessageSquare className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Pending</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                {reviews.filter(r => r.status === 'pending').length}
              </p>
            </div>
            <div className="bg-yellow-100 dark:bg-yellow-900/30 p-3 rounded-lg">
              <Clock className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Flagged</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                {reviews.filter(r => r.status === 'flagged').length}
              </p>
            </div>
            <div className="bg-red-100 dark:bg-red-900/30 p-3 rounded-lg">
              <Flag className="w-6 h-6 text-red-600 dark:text-red-400" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Avg Rating</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                {reviews.length > 0 
                  ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
                  : '0.0'
                }
              </p>
            </div>
            <div className="bg-green-100 dark:bg-green-900/30 p-3 rounded-lg">
              <Star className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
          <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 w-5 h-5" />
              <input
                type="text"
                placeholder="Search reviews..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent"
              />
            </div>
            
            <select
              value={filterRating}
              onChange={(e) => setFilterRating(e.target.value)}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent appearance-none"
            >
              <option value="all" className="bg-white dark:bg-gray-700 text-gray-900 dark:text-white">All Ratings</option>
              <option value="5" className="bg-white dark:bg-gray-700 text-gray-900 dark:text-white">5 Stars</option>
              <option value="4" className="bg-white dark:bg-gray-700 text-gray-900 dark:text-white">4 Stars</option>
              <option value="3" className="bg-white dark:bg-gray-700 text-gray-900 dark:text-white">3 Stars</option>
              <option value="2" className="bg-white dark:bg-gray-700 text-gray-900 dark:text-white">2 Stars</option>
              <option value="1" className="bg-white dark:bg-gray-700 text-gray-900 dark:text-white">1 Star</option>
            </select>

            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent appearance-none"
            >
              <option value="all" className="bg-white dark:bg-gray-700 text-gray-900 dark:text-white">All Status</option>
              <option value="approved" className="bg-white dark:bg-gray-700 text-gray-900 dark:text-white">Approved</option>
              <option value="pending" className="bg-white dark:bg-gray-700 text-gray-900 dark:text-white">Pending</option>
              <option value="flagged" className="bg-white dark:bg-gray-700 text-gray-900 dark:text-white">Flagged</option>
              <option value="rejected" className="bg-white dark:bg-gray-700 text-gray-900 dark:text-white">Rejected</option>
            </select>
          </div>
        </div>
      </div>

      {/* Reviews List */}
      <div className="space-y-4">
        {filteredReviews.map((review) => (
          <div key={review.id} className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <div className="flex items-center mb-2">
                  <div className="flex items-center mr-4">
                    <User className="w-5 h-5 text-gray-400 dark:text-gray-500 mr-2" />
                    <span className="font-medium text-gray-900 dark:text-white">{review.userName}</span>
                    {review.verified && (
                      <span className="ml-2 px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-400 text-xs rounded-full">
                        Verified
                      </span>
                    )}
                  </div>
                  <div className="flex items-center mr-4">
                    {renderStars(review.rating)}
                  </div>
                  <span className={`px-2 py-1 text-xs font-medium rounded-full flex items-center ${getStatusColor(review.status)}`}>
                    {getStatusIcon(review.status)}
                    <span className="ml-1">{review.status}</span>
                  </span>
                </div>
                
                <div className="text-sm text-gray-600 dark:text-gray-300 mb-2">
                  Course: <span className="font-medium text-gray-900 dark:text-white">{review.courseTitle}</span>
                </div>
                
                <p className="text-gray-700 dark:text-gray-300 mb-3">{review.comment}</p>
                
                {review.response && (
                  <div className="bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-400 dark:border-blue-600 p-3 mb-3">
                    <p className="text-sm text-blue-800 dark:text-blue-300">
                      <strong>Instructor Response:</strong> {review.response}
                    </p>
                  </div>
                )}
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
                    <div className="flex items-center">
                      <Clock className="w-4 h-4 mr-1" />
                      {review.date}
                    </div>
                    <div className="flex items-center">
                      <ThumbsUp className="w-4 h-4 mr-1" />
                      {review.helpful}
                    </div>
                    <div className="flex items-center">
                      <ThumbsDown className="w-4 h-4 mr-1" />
                      {review.notHelpful}
                    </div>
                  </div>
                  
                  <div className="flex space-x-2">
                    {review.status === 'pending' && (
                      <>
                        <button
                          onClick={() => updateReviewStatus(review.id, 'approved')}
                          className="px-3 py-1 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 transition-colors"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => updateReviewStatus(review.id, 'rejected')}
                          className="px-3 py-1 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700 transition-colors"
                        >
                          Reject
                        </button>
                      </>
                    )}
                    {review.status === 'flagged' && (
                      <>
                        <button
                          onClick={() => updateReviewStatus(review.id, 'approved')}
                          className="px-3 py-1 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 transition-colors"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => updateReviewStatus(review.id, 'rejected')}
                          className="px-3 py-1 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700 transition-colors"
                        >
                          Remove
                        </button>
                      </>
                    )}
                    <button className="text-blue-600 dark:text-blue-400 hover:text-blue-900 dark:hover:text-blue-300">
                      <Eye className="w-4 h-4" />
                    </button>
                    <button className="text-green-600 dark:text-green-400 hover:text-green-900 dark:hover:text-green-300">
                      <Edit className="w-4 h-4" />
                    </button>
                    <button className="text-red-600 dark:text-red-400 hover:text-red-900 dark:hover:text-red-300">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredReviews.length === 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-12 text-center">
          <MessageSquare className="w-12 h-12 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No reviews found</h3>
          <p className="text-gray-500 dark:text-gray-400">Try adjusting your search or filter criteria</p>
        </div>
      )}
    </div>
  );
};

export default ReviewManagement;