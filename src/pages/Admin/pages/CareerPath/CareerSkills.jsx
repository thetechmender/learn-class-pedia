import React, { useCallback, useState, useEffect } from 'react';
import { useToast } from '../../../../hooks/useToast';
import { useCareerSkills } from '../../../../hooks/useCareerSkills';
import AdminPageLayout from '../../../../components/AdminPageLayout';
import Modal from '../../../../components/Modal';
import { 
  Plus, 
  Edit2, 
  Trash2, 
  Search,
  Eye,
  AlertCircle,
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  Award,
  Target,
  X
} from 'lucide-react';

const CareerSkills = () => {
  const { toast, showToast } = useToast();
  
  const showSuccess = useCallback((message) => showToast(message, 'success'), [showToast]);
  const showError = useCallback((message) => showToast(message, 'error'), [showToast]);

  // API operations from hook
  const {
    loading,
    error,
    getAllCareerSkills,
    createCareerSkill,
    updateCareerSkill,
    deleteCareerSkill
  } = useCareerSkills();
  // State management
  const [careerSkills, setCareerSkills] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(100);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  // Modal State
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedCareerSkill, setSelectedCareerSkill] = useState(null);
  const [editingCareerSkill, setEditingCareerSkill] = useState(null);
  const [modalError, setModalError] = useState('');

  // Form State
  const [formData, setFormData] = useState({
    title: '',
    description: ''
  });

  // Fetch all career skills with pagination and search
  const fetchCareerSkills = useCallback(async (page = 1, search = '') => {
    try {
      const response = await getAllCareerSkills({
        page,
        pageSize: itemsPerPage,
        search: search.trim() || undefined
      });
      
      // Handle the response structure from the backend
      if (response && typeof response === 'object') {
        if (response.items && Array.isArray(response.items)) {
          // Backend returns paginated data with items array
          setCareerSkills(response.items);
          setTotalItems(response.totalCount || response.total || 0);
          setTotalPages(response.totalPages || Math.ceil((response.totalCount || response.total || 0) / itemsPerPage));
        } else if (Array.isArray(response)) {
          // Backend returns direct array (fallback)
          setCareerSkills(response);
          setTotalItems(response.length);
          setTotalPages(Math.ceil(response.length / itemsPerPage));
        }
      } else if (Array.isArray(response)) {
        // Backend returns direct array (fallback)
        setCareerSkills(response);
        setTotalItems(response.length);
        setTotalPages(Math.ceil(response.length / itemsPerPage));
      }
    } catch (err) {
      // Handle specific error cases with user-friendly messages
      let errorMessage = 'Failed to fetch career skills';
      
      if (err.message) {
        const errorString = err.message.toLowerCase();
        
        // Check for unauthorized errors
        if (errorString.includes('401') || errorString.includes('unauthorized')) {
          errorMessage = 'You are not authorized to view career skills. Please log in again.';
        }
        // Check for forbidden errors
        else if (errorString.includes('403') || errorString.includes('forbidden')) {
          errorMessage = 'You do not have permission to view career skills.';
        }
        // Check for server errors
        else if (errorString.includes('500') || errorString.includes('internal server error')) {
          errorMessage = 'Server error occurred while loading career skills. Please try again later.';
        }
        // Check for network errors
        else if (errorString.includes('network') || errorString.includes('fetch')) {
          errorMessage = 'Network error occurred. Please check your internet connection and try again.';
        }
        // Use the original error message if it's user-friendly
        else if (!errorString.includes('http error') && !errorString.includes('status:')) {
          errorMessage = err.message;
        }
      }
      
      showError(errorMessage);
      // Reset to empty state on error
      setCareerSkills([]);
      setTotalItems(0);
      setTotalPages(0);
    }
  }, [getAllCareerSkills, itemsPerPage, showError]);

  // Initial fetch and when page changes
  useEffect(() => {
    fetchCareerSkills(currentPage, '');
  }, [currentPage, itemsPerPage, fetchCareerSkills]);

  // Debounced search - only triggers when user stops typing
  useEffect(() => {
    // Only set up timeout if there's a search term
    if (searchTerm.trim() === '') {
      // If search is empty, reset to first page and fetch all
      setIsTyping(false);
      if (currentPage !== 1) {
        setCurrentPage(1);
      } else {
        fetchCareerSkills(1, '');
      }
      return;
    }

    // User is typing
    setIsTyping(true);

    const timeoutId = setTimeout(() => {
      // User stopped typing, set isTyping to false and fetch
      setIsTyping(false);
      // Only fetch if the search term hasn't changed in the last 800ms
      if (currentPage !== 1) {
        setCurrentPage(1); // Reset to first page when searching
      } else {
        fetchCareerSkills(1, searchTerm);
      }
    }, 800); // 800ms delay - only triggers when user stops typing

    return () => {
      clearTimeout(timeoutId);
      // Clear typing indicator when component unmounts or search changes
      setIsTyping(false);
    };
  }, [searchTerm]);

  // Input handlers
  const handleInputChange = useCallback((e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear modal error when user starts typing
    if (modalError) {
      setModalError('');
    }
  }, [modalError]);

  // Form management
  const resetForm = useCallback(() => {
    setFormData({
      title: '',
      description: ''
    });
    setEditingCareerSkill(null);
  }, []);

  // CRUD operations
  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();
    setModalError('');
    
    try {
      if (editingCareerSkill) {
        await updateCareerSkill(editingCareerSkill.id, formData);
        setShowUpdateModal(false);
        showSuccess('Career skill updated successfully!');
      } else {
        await createCareerSkill(formData);
        setShowCreateModal(false);
        showSuccess('Career skill created successfully!');
      }
      resetForm();
      fetchCareerSkills();
    } catch (err) {
      // Handle specific error cases with user-friendly messages
      let errorMessage = 'An unexpected error occurred';
      
      if (err.message) {
        const errorString = err.message.toLowerCase();
        
        // Check for 409 Conflict (duplicate name)
        if (errorString.includes('409') || errorString.includes('conflict')) {
          if (editingCareerSkill) {
            errorMessage = 'A career skill with this name already exists. Please choose a different name.';
          } else {
            errorMessage = 'A career skill with this name already exists. Please choose a different name.';
          }
        }
        // Check for validation errors
        else if (errorString.includes('400') || errorString.includes('bad request')) {
          errorMessage = 'Please check your input and try again. Make sure all required fields are filled.';
        }
        // Check for unauthorized errors
        else if (errorString.includes('401') || errorString.includes('unauthorized')) {
          errorMessage = 'You are not authorized to perform this action. Please log in again.';
        }
        // Check for forbidden errors
        else if (errorString.includes('403') || errorString.includes('forbidden')) {
          errorMessage = 'You do not have permission to perform this action.';
        }
        // Check for not found errors (for updates)
        else if (errorString.includes('404') || errorString.includes('not found')) {
          errorMessage = 'The career skill you are trying to update was not found. It may have been deleted.';
        }
        // Check for server errors
        else if (errorString.includes('500') || errorString.includes('internal server error')) {
          errorMessage = 'Server error occurred. Please try again later.';
        }
        // Use the original error message if it's user-friendly
        else if (!errorString.includes('http error') && !errorString.includes('status:')) {
          errorMessage = err.message;
        }
      }
      
      setModalError(errorMessage);
      showError(errorMessage);
    }
  }, [handleInputChange, resetForm, fetchCareerSkills, showSuccess, showError, editingCareerSkill, formData, createCareerSkill, updateCareerSkill]);

  const handleEdit = useCallback((careerSkill) => {
    setEditingCareerSkill(careerSkill);
    setFormData({
      title: careerSkill.title || '',
      description: careerSkill.description || ''
    });
    setShowUpdateModal(true);
  }, []);

  const handleViewDetails = useCallback((careerSkill) => {
    setSelectedCareerSkill(careerSkill);
    setShowDetailsModal(true);
  }, []);

  const handleDelete = useCallback(async (careerSkillId) => {
    if (!window.confirm('Are you sure you want to delete this career skill?')) return;
    try {
      await deleteCareerSkill(careerSkillId);
      showSuccess('Career skill deleted successfully!');
      fetchCareerSkills();
    } catch (err) {
      // Handle specific error cases with user-friendly messages
      let errorMessage = 'Failed to delete career skill';
      
      if (err.message) {
        const errorString = err.message.toLowerCase();
        
        // Check for not found errors
        if (errorString.includes('404') || errorString.includes('not found')) {
          errorMessage = 'The career skill was not found. It may have already been deleted.';
        }
        // Check for forbidden errors
        else if (errorString.includes('403') || errorString.includes('forbidden')) {
          errorMessage = 'You do not have permission to delete this career skill.';
        }
        // Check for conflict errors (skill in use)
        else if (errorString.includes('409') || errorString.includes('conflict')) {
          errorMessage = 'This career skill cannot be deleted because it is currently in use.';
        }
        // Check for server errors
        else if (errorString.includes('500') || errorString.includes('internal server error')) {
          errorMessage = 'Server error occurred. Please try again later.';
        }
        // Use the original error message if it's user-friendly
        else if (!errorString.includes('http error') && !errorString.includes('status:')) {
          errorMessage = err.message;
        }
      }
      
      showError(errorMessage);
    }
  }, [fetchCareerSkills, showSuccess, showError]);

  // Modal handlers
  const openCreateModal = useCallback(() => {
    resetForm();
    setModalError('');
    setShowCreateModal(true);
  }, [resetForm]);

  const closeCreateModal = useCallback(() => {
    setShowCreateModal(false);
    setModalError('');
  }, []);

  const closeUpdateModal = useCallback(() => {
    setShowUpdateModal(false);
    setModalError('');
  }, []);

  const closeDetailsModal = useCallback(() => {
    setShowDetailsModal(false);
  }, []);

  if (loading) {
    return <AdminPageLayout loading={true} skeletonType="table" />;
  }

  if (error) {
    return (
      <AdminPageLayout
        title="Career Skills"
        subtitle="Manage career skills and their descriptions"
        icon={Award}
        loading={false}
        skeletonType="table"
      >
        <div className="text-red-500 p-4">{error}</div>
      </AdminPageLayout>
    );
  }

  return (
    <AdminPageLayout
      title="Career Skills"
      subtitle="Manage career skills and their descriptions"
      icon={Award}
      loading={false}
      skeletonType="table"
      actions={
        <button
          onClick={openCreateModal}
          className="flex items-center px-6 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-500 dark:to-indigo-500 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 dark:hover:from-blue-600 dark:hover:to-indigo-600 transition-all duration-200 font-medium shadow-lg hover:shadow-xl"
        >
          <Plus className="w-4 h-4 mr-2" />
          Create Career Skill
        </button>
      }
    >
      {/* Search Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <div className="relative max-w-2xl mx-auto">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400 dark:text-gray-500" />
            </div>
            <input
              type="text"
              placeholder={isTyping ? "Type to search..." : "Search career skills by title..."}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={`w-full pl-12 pr-12 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-600 focus:border-transparent transition-all duration-200 shadow-sm ${
                isTyping 
                  ? 'border-blue-400 bg-blue-50 dark:bg-blue-900/20 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400' 
                  : 'border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400'
              }`}
            />
            <div className="absolute inset-y-0 right-0 pr-4 flex items-center">
              {isTyping && (
                <div className="flex items-center space-x-1">
                  <div className="flex space-x-1">
                    <div className="w-1 h-1 bg-blue-600 rounded-full animate-bounce" style={{animationDelay: '0ms'}}></div>
                    <div className="w-1 h-1 bg-blue-600 rounded-full animate-bounce" style={{animationDelay: '150ms'}}></div>
                    <div className="w-1 h-1 bg-blue-600 rounded-full animate-bounce" style={{animationDelay: '300ms'}}></div>
                  </div>
                </div>
              )}
              {loading && !isTyping && searchTerm && (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
              )}
              {!isTyping && !loading && searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              )}
            </div>
          </div>
          {isTyping && (
            <div className="mt-2 text-xs text-gray-500 dark:text-gray-400 text-center">
              Searching when you stop typing...
            </div>
          )}
        </div>

        {searchTerm && (
          <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl">
            <div className="flex items-center justify-between">
              <p className="text-sm text-blue-800 dark:text-blue-200">
                Showing <span className="font-semibold">{careerSkills.length}</span> of {totalItems} career skills
              </p>
              <button
                onClick={() => {
                  setSearchTerm('');
                  setCurrentPage(1);
                }}
                className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 font-medium"
              >
                Clear search
              </button>
            </div>
          </div>
        )}

        {/* Career Skills Table */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <span className="ml-3 text-gray-600 dark:text-gray-300">Loading career skills...</span>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-900/50 border-b border-gray-200 dark:border-gray-700">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Title</th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Slug</th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Description</th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {careerSkills.length === 0 ? (
                    <tr>
                      <td colSpan="4" className="px-6 py-12 text-center text-gray-500 dark:text-gray-400">
                        <div className="flex flex-col items-center">
                          <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-4">
                            <Target className="w-8 h-8 text-gray-400 dark:text-gray-500" />
                          </div>
                          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                            {searchTerm ? 'No career skills found' : 'No career skills available'}
                          </h3>
                          <p className="text-gray-600 dark:text-gray-300 mb-6">
                            {searchTerm 
                              ? 'Try adjusting your search terms' 
                              : 'Create your first career skill to get started'
                            }
                          </p>
                          {!searchTerm && (
                            <button
                              onClick={openCreateModal}
                              className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-500 dark:to-indigo-500 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 dark:hover:from-blue-600 dark:hover:to-indigo-600 transition-all duration-200 font-medium shadow-lg hover:shadow-xl"
                            >
                              <Plus className="w-4 h-4 mr-2 inline" />
                              Create Your First Career Skill
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ) : (
                    careerSkills.map((skill) => (
                      <tr key={skill.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="text-sm font-medium text-gray-900 dark:text-white">{skill.title}</div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-600 dark:text-gray-300 font-mono">{skill.slug}</div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-600 dark:text-gray-300 max-w-xs truncate" title={skill.description}>
                            {skill.description || 'No description'}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center space-x-2">
                            <button 
                              onClick={() => handleViewDetails(skill)} 
                              className="flex items-center px-2 py-1.5 text-xs text-green-600 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-lg font-medium transition-colors"
                            >
                              <Eye className="w-3 h-3 mr-1" />
                              View
                            </button>
                            <button 
                              onClick={() => handleEdit(skill)} 
                              className="flex items-center px-2 py-1.5 text-xs text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg font-medium transition-colors"
                            >
                              <Edit2 className="w-3 h-3 mr-1" />
                              Edit
                            </button>
                            <button 
                              onClick={() => handleDelete(skill.id)} 
                              className="flex items-center px-2 py-1.5 text-xs text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg font-medium transition-colors"
                            >
                              <Trash2 className="w-3 h-3 mr-1" />
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="mt-8 flex items-center justify-center">
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="flex items-center px-4 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed text-gray-700 dark:text-gray-300"
              >
                <ChevronLeft className="w-4 h-4 mr-2" />
                Previous
              </button>
              
              <button
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="flex items-center px-4 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed text-gray-700 dark:text-gray-300"
              >
                Next
                <ChevronRight className="w-4 h-4 ml-2" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Toast Notification */}
      {toast.show && (
        <div className={`fixed top-4 right-4 z-50 px-6 py-3 rounded-lg shadow-lg transform transition-all duration-300 ${
          toast.type === 'success' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
        }`}>
          <div className="flex items-center space-x-2">
            {toast.type === 'success' ? (
              <CheckCircle className="w-5 h-5" />
            ) : (
              <AlertCircle className="w-5 h-5" />
            )}
            <span className="font-medium">{toast.message}</span>
          </div>
        </div>
      )}

      {/* Create Career Skill Modal */}
      <Modal 
        isOpen={showCreateModal} 
        onClose={closeCreateModal} 
        title="Create New Career Skill"
      >
        <form onSubmit={handleSubmit}>
          {modalError && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 text-red-600 rounded-lg flex items-start">
              <AlertCircle className="w-5 h-5 mr-2 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium">Error</p>
                <p className="text-sm">{modalError}</p>
              </div>
            </div>
          )}
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Title *</label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-3 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-600 focus:border-transparent transition-all duration-200"
                placeholder="Enter career skill title"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Description</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows="3"
                className="w-full px-4 py-3 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-600 focus:border-transparent transition-all duration-200"
                placeholder="Enter career skill description"
              />
            </div>
          </div>
          
          <div className="flex justify-end space-x-3 mt-6">
            <button
              type="button"
              onClick={closeCreateModal}
              className="px-6 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-500 dark:to-indigo-500 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 dark:hover:from-blue-600 dark:hover:to-indigo-600 transition-all duration-200 font-medium shadow-lg hover:shadow-xl"
            >
              Create Career Skill
            </button>
          </div>
        </form>
      </Modal>

      {/* Update Career Skill Modal */}
      <Modal 
        isOpen={showUpdateModal} 
        onClose={closeUpdateModal} 
        title="Update Career Skill"
      >
        <form onSubmit={handleSubmit}>
          {modalError && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 text-red-600 rounded-lg flex items-start">
              <AlertCircle className="w-5 h-5 mr-2 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium">Error</p>
                <p className="text-sm">{modalError}</p>
              </div>
            </div>
          )}
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Title *</label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-3 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-600 focus:border-transparent transition-all duration-200"
                placeholder="Enter career skill title"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Description</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows="3"
                className="w-full px-4 py-3 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-600 focus:border-transparent transition-all duration-200"
                placeholder="Enter career skill description"
              />
            </div>
          </div>
          
          <div className="flex justify-end space-x-3 mt-6">
            <button
              type="button"
              onClick={closeUpdateModal}
              className="px-6 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-500 dark:to-indigo-500 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 dark:hover:from-blue-600 dark:hover:to-indigo-600 transition-all duration-200 font-medium shadow-lg hover:shadow-xl"
            >
              Update Career Skill
            </button>
          </div>
        </form>
      </Modal>

      {/* Career Skill Details Modal */}
      <Modal 
        isOpen={showDetailsModal} 
        onClose={closeDetailsModal} 
        title="Career Skill Details"
      >
        {selectedCareerSkill && (
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Title</h3>
              <p className="mt-1 text-sm text-gray-900 dark:text-white">{selectedCareerSkill.title}</p>
            </div>
            
            <div>
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Slug</h3>
              <p className="mt-1 text-sm text-gray-900 dark:text-white font-mono">{selectedCareerSkill.slug}</p>
            </div>
            
            <div>
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Description</h3>
              <p className="mt-1 text-sm text-gray-900 dark:text-white">{selectedCareerSkill.description || 'No description'}</p>
            </div>
            
            <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200 dark:border-gray-700">
              <button
                onClick={closeDetailsModal}
                className="px-6 py-2.5 bg-gray-600 dark:bg-gray-700 text-white rounded-lg hover:bg-gray-700 dark:hover:bg-gray-600 transition-colors font-medium"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </Modal>
    </AdminPageLayout>
  );
};

export default CareerSkills;
