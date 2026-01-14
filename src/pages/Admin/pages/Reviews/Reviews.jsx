import React, { useState } from 'react';
import { useReviews } from '../../../../hooks/useReviews';
import {
  Search,
  Filter,
  Star,
  Calendar,
  Mail,
  Edit,
  Trash2,
  Check,
  X,
  Eye,
  ChevronDown,
  RefreshCw
} from 'lucide-react';

const Reviews = () => {
  const {
    reviews,
    courses,
    statistics,
    loading,
    error,
    filters,
    updateFilters,
    clearFilters,
    updateReviewStatus,
    deleteReview,
    getReviewById,
    clearError
  } = useReviews();

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [reviewToDelete, setReviewToDelete] = useState(null);
  const [showFilters, setShowFilters] = useState(false);

  const getStatusColor = (status) => {
    switch (status) {
      case 'approved':
        return 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-300';
      case 'rejected':
        return 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300';
    }
  };

  const renderStars = (rating) =>
    Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${
          i < rating
            ? 'fill-yellow-400 text-yellow-400'
            : 'text-gray-300 dark:text-gray-600'
        }`}
      />
    ));

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900">
        <RefreshCw className="w-8 h-8 animate-spin text-blue-500" />
        <span className="ml-2 text-gray-600 dark:text-gray-300">
          Loading reviews...
        </span>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto bg-gray-50 dark:bg-gray-900 min-h-screen">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Course Reviews Management
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Manage and moderate course reviews
        </p>
      </div>

      {/* Statistics */}
      {statistics && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          {[
            ['Total Reviews', statistics.totalReviews, Mail, 'blue'],
            ['Approved', statistics.approvedReviews, Check, 'green'],
            ['Pending', statistics.pendingReviews, Calendar, 'yellow'],
            ['Rejected', statistics.rejectedReviews, X, 'red']
          ].map(([label, value, Icon, color]) => (
            <div
              key={label}
              className="bg-white dark:bg-gray-800 rounded-lg shadow p-6"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {label}
                  </p>
                  <p className={`text-2xl font-bold text-${color}-600`}>
                    {value}
                  </p>
                </div>
                <div
                  className={`bg-${color}-100 dark:bg-${color}-900/40 rounded-full p-3`}
                >
                  <Icon className={`w-6 h-6 text-${color}-600`} />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow mb-6">
        <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            Filters
          </h2>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center text-gray-600 dark:text-gray-300"
          >
            <Filter className="w-4 h-4 mr-1" />
            {showFilters ? 'Hide' : 'Show'}
            <ChevronDown
              className={`ml-1 transition-transform ${
                showFilters ? 'rotate-180' : ''
              }`}
            />
          </button>
        </div>

        {showFilters && (
          <div className="p-4 grid md:grid-cols-4 gap-4">
            <select
              value={filters.courseId}
              onChange={(e) => updateFilters({ courseId: e.target.value })}
              className="border rounded-md px-3 py-2 bg-white dark:bg-gray-900 dark:border-gray-700 dark:text-white"
            >
              <option value="">All Courses</option>
              {courses.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>

            <select
              value={filters.status}
              onChange={(e) => updateFilters({ status: e.target.value })}
              className="border rounded-md px-3 py-2 bg-white dark:bg-gray-900 dark:border-gray-700 dark:text-white"
            >
              <option value="">All Status</option>
              <option value="approved">Approved</option>
              <option value="pending">Pending</option>
              <option value="rejected">Rejected</option>
            </select>

            <select
              value={filters.rating}
              onChange={(e) => updateFilters({ rating: e.target.value })}
              className="border rounded-md px-3 py-2 bg-white dark:bg-gray-900 dark:border-gray-700 dark:text-white"
            >
              <option value="">All Ratings</option>
              {[5, 4, 3, 2, 1].map((r) => (
                <option key={r} value={r}>
                  {r} Stars
                </option>
              ))}
            </select>

            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                value={filters.search}
                onChange={(e) => updateFilters({ search: e.target.value })}
                placeholder="Search..."
                className="pl-10 w-full border rounded-md px-3 py-2 bg-white dark:bg-gray-900 dark:border-gray-700 dark:text-white"
              />
            </div>
          </div>
        )}
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-900">
            <tr className="text-xs uppercase text-gray-500 dark:text-gray-400">
              <th className="px-6 py-3 text-left">Student</th>
              <th className="px-6 py-3 text-left">Course</th>
              <th className="px-6 py-3 text-left">Rating</th>
              <th className="px-6 py-3 text-left">Title</th>
              <th className="px-6 py-3 text-left">Status</th>
              <th className="px-6 py-3 text-left">Date</th>
              <th className="px-6 py-3 text-left">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
            {reviews.map((review) => (
              <tr
                key={review.id}
                className="hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                <td className="px-6 py-4 text-gray-900 dark:text-white">
                  {review.studentName}
                </td>
                <td className="px-6 py-4 text-gray-700 dark:text-gray-300">
                  {review.courseName}
                </td>
                <td className="px-6 py-4 flex">{renderStars(review.rating)}</td>
                <td className="px-6 py-4">
                  <div className="font-medium dark:text-white">
                    {review.title}
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400 truncate max-w-xs">
                    {review.comment}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusColor(
                      review.status
                    )}`}
                  >
                    {review.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-gray-500 dark:text-gray-400">
                  {new Date(review.createdAt).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 flex gap-2">
                  <Eye className="w-4 h-4 text-blue-500 cursor-pointer" />
                  <Trash2
                    className="w-4 h-4 text-red-500 cursor-pointer"
                    onClick={() => {
                      setReviewToDelete(review.id);
                      setShowDeleteModal(true);
                    }}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Delete Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-96">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Delete Review
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
              This action cannot be undone.
            </p>
            <div className="flex justify-end gap-2 mt-6">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded"
              >
                Cancel
              </button>
              <button
                onClick={deleteReview}
                className="px-4 py-2 bg-red-600 text-white rounded"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Reviews;
