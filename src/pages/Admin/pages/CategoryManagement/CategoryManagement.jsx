import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useAdmin } from '../../../../hooks/useAdmin';
import { useToast } from '../../../../hooks/useToast';
import { useTheme } from '../../../../context/ThemeContext';
import Modal from '../../../../components/Modal';
import CategoryDropdown from '../../../../components/CategoryDropdown';
import AdminPageLayout from '../../../../components/AdminPageLayout';
import { 
  Plus, 
  Edit2, 
  Trash2, 
  ChevronRight, 
  ChevronLeft,
  Search,
  Filter,
  Eye,
  ChevronDown,
  AlertCircle,
  CheckCircle,
  Upload,
  X,
  FolderOpen as FolderIcon
} from 'lucide-react';

const CategoryManagement = () => {
  const { toast, showToast } = useToast();
  const { theme } = useTheme();
  
  const showSuccess = (message) => showToast(message, 'success');
  const showError = (message) => showToast(message, 'error');
  
  // CRUD operations from hook
  const {
    loading: hookLoading,
    error: hookError,
    clearError,
    getAllCategories,
    createCategory,
    updateCategory,
    deleteCategory,
    createCategoryWithFile,
    updateCategoryWithFile
  } = useAdmin();

  // Pagination state
  const [pagination, setPagination] = useState({
    page: 1,
    pageSize: 10,
    totalCount: 0
  });

  // State management
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedCategories, setExpandedCategories] = useState({});
  const [filters, setFilters] = useState({
    name: '',
    slug: '',
    description: '',
    parentCategoryId: ''
  });

  // Modal State
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [editingCategory, setEditingCategory] = useState(null);
  const [modalError, setModalError] = useState('');

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    parentCategoryId: 0,
    iconUrl: '',
    iconFile: null
  });
  const fetchCategories = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      // Build search term from filters for backend
      const searchTerm = Object.values(filters).filter(Boolean).join(' ') || '';
      const data = await getAllCategories(searchTerm, {});
      const categories = data.items || data || [];
      setCategories(categories);
    } catch (err) {
      setError('Failed to fetch categories');
    } finally {
      setLoading(false);
    }
  }, [getAllCategories, filters]);
  useEffect(() => {
    fetchCategories();
  }, []);
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      fetchCategories();
    }, 300); // 300ms debounce

    return () => clearTimeout(timeoutId);
  }, [filters.name, filters.slug, filters.description, filters.parentCategoryId, fetchCategories]);

  // Input handlers
  const handleInputChange = useCallback((e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  }, []);

  const handleFilterChange = useCallback((e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
    fetchCategories();
  }, [fetchCategories]);

  // Handle dropdown changes separately to prevent form submission
    const handleParentCategoryChange = useCallback((value) => {
    setFormData(prev => ({ ...prev, parentCategoryId: value || 0 }));
  }, []);
  // Global search through all categories (parents + children)
  const globalSearchResults = useMemo(() => {
    // Check if any search filter is active
    const hasActiveFilters = filters.name || filters.slug || filters.description;
    
    if (!hasActiveFilters) {
      return categories; // No search filters, show all
    }

    return categories.filter(category => {
      const matchesName = !filters.name || category.name?.toLowerCase().includes(filters.name.toLowerCase());
      const matchesSlug = !filters.slug || category.slug?.toLowerCase().includes(filters.slug.toLowerCase());
      const matchesDescription = !filters.description || category.description?.toLowerCase().includes(filters.description.toLowerCase());
      return matchesName || matchesSlug || matchesDescription;
    });
  }, [categories, filters.name, filters.slug, filters.description]);

  // Display categories based on search results
  const displayCategories = useMemo(() => {
    if (filters.name || filters.slug || filters.description) {
      // If there are search filters, show only matching categories
      return globalSearchResults;
    } else {
      // No search filters, show all categories with pagination
      return categories;
    }
  }, [globalSearchResults, filters.name, filters.slug, filters.description, categories]);

  // Pagination for display categories
  const paginatedDisplayCategories = useMemo(() => {
    return displayCategories.slice(
      (pagination.page - 1) * pagination.pageSize,
      pagination.page * pagination.pageSize
    );
  }, [displayCategories, pagination.page, pagination.pageSize]);

  const categoryMap = useMemo(() => new Map(displayCategories.map(cat => [cat.id, cat])), [displayCategories]);
  
  // Find root categories from displayed data (not paginated)
  const parentCategories = useMemo(() => displayCategories.filter(cat => {
    // A category is a parent if it has no parent
    return !cat.parentCategoryId;
  }), [displayCategories]);

  // Update pagination total count
  useEffect(() => {
    setPagination(prev => ({ ...prev, totalCount: parentCategories.length }));
  }, [parentCategories.length]);

  // Filter handlers
  const applyFilters = useCallback(() => {
   
    setPagination(prev => ({ ...prev, page: 1 })); // Reset to first page
    fetchCategories();
  }, [fetchCategories]);

  const clearFilters = useCallback(() => {
    const clearedFilters = { name: '', slug: '', description: '', parentCategoryId: '' };
    setFilters(clearedFilters);
    setPagination(prev => ({ ...prev, page: 1 })); // Reset to first page
  }, []);

  // Form management
  const resetForm = useCallback(() => {
    setFormData({
      name: '',
      description: '',
      parentCategoryId: 0,
      iconUrl: '',
      iconFile: null
    });
    setEditingCategory(null);
  }, []);

  // CRUD operations
  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();
    setModalError(''); // Clear previous modal error
    
    try {
      let isFormData = false;
      let submitData = formData;
      
      // If there's a file, use FormData
      if (formData.iconFile) {
        isFormData = true;
        submitData = new FormData();
        submitData.append('name', formData.name);
        submitData.append('description', formData.description || '');
        submitData.append('parentCategoryId', formData.parentCategoryId || 0);
        
        // Add the file
        submitData.append('File', formData.iconFile);
      }
      
      if (editingCategory) {
        if (isFormData) {
          await updateCategoryWithFile(editingCategory.id, submitData);
        } else {
          await updateCategory(editingCategory.id, formData);
        }
        setShowUpdateModal(false);
        showSuccess('Category updated successfully!');
      } else {
        if (isFormData) {
          await createCategoryWithFile(submitData);
        } else {
          await createCategory(formData);
        }
        setShowCreateModal(false);
        showSuccess('Category created successfully!');
      }
      resetForm();
      fetchCategories();
    } catch (err) {
      // Extract error message from API response structure
      let errorMessage = 'An unexpected error occurred';
      
      if (err.response?.data) {
        // The API now attaches response data to the error object
        if (typeof err.response.data === 'string') {
          errorMessage = err.response.data;
        } else if (err.response.data.error) {
          errorMessage = err.response.data.error;
        } else if (err.response.data.message) {
          errorMessage = err.response.data.message;
        } else {
          errorMessage = JSON.stringify(err.response.data);
        }
      } else if (err.response?.data?.error) {
      
        errorMessage = err.response.data.error;
      } else if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      } else if (err.response?.data?.title) {
        errorMessage = err.response.data.title;
      } else if (err.response?.data?.detail) {
        errorMessage = err.response.data.detail;
      } else if (err.message) {
        errorMessage = err.message;
      } else if (err.response?.statusText) {
        errorMessage = err.response.statusText;
      } else if (editingCategory) {
        errorMessage = 'Failed to update category';
      } else {
        errorMessage = 'Failed to create category';
      }
      
      setModalError(errorMessage);
      showError(errorMessage);
    }
  }, [editingCategory, formData, updateCategory, createCategoryWithFile, updateCategoryWithFile, resetForm, fetchCategories, showSuccess, showError]);

  const handleEdit = useCallback((category) => {
    setEditingCategory(category);
    setFormData({
      name: category.name || '',
      description: category.description || '',
      parentCategoryId: category.parentCategoryId || 0,
      iconUrl: category.iconUrl || '',
      iconFile: null
    });
    setShowUpdateModal(true);
  }, []);

  const handleViewDetails = useCallback((category) => {
    setSelectedCategory(category);
    setShowDetailsModal(true);
  }, []);

  const handleDelete = useCallback(async (categoryId) => {
    if (!window.confirm('Are you sure you want to delete this category?')) return;
    try {
      await deleteCategory(categoryId);
      showSuccess('Category deleted successfully!');
      fetchCategories();
    } catch (err) {
      const errorMessage = err.response?.data?.error || err.message || 'Failed to delete category';
      showError(errorMessage);
    }
  }, [deleteCategory, fetchCategories, showSuccess, showError]);

  // Expand/collapse child categories
  const toggleCategoryExpansion = useCallback((categoryId) => {
    setExpandedCategories(prev => ({ ...prev, [categoryId]: !prev[categoryId] }));
  }, []);

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

  // Pagination controls
  const goToPage = useCallback((page) => {
    setPagination(prev => ({ ...prev, page }));
  }, []);

  const nextPage = useCallback(() => {
    if (pagination.page < Math.ceil(pagination.totalCount / pagination.pageSize)) {
      goToPage(pagination.page + 1);
    }
  }, [pagination, goToPage]);

  const prevPage = useCallback(() => {
    if (pagination.page > 1) {
      goToPage(pagination.page - 1);
    }
  }, [pagination, goToPage]);

  // Categories for dropdown
  const allCategoriesForDropdown = categories;

  // Recursive category row
  const renderCategoryRow = (category, level = 0) => {
    const children = displayCategories.filter(cat => cat.parentCategoryId === category.id);
    const isExpanded = expandedCategories[category.id];
    const hasChildren = children.length > 0;
    
    // Check if category matches any filter for highlighting
    const isMatching = (filters.name && category.name?.toLowerCase().includes(filters.name.toLowerCase())) ||
                     (filters.slug && category.slug?.toLowerCase().includes(filters.slug.toLowerCase())) ||
                     (filters.description && category.description?.toLowerCase().includes(filters.description.toLowerCase()));

    return (
      <React.Fragment key={category.id}>
        <tr className={`border-b ${theme === 'dark' ? 'hover:bg-gray-700 border-gray-700' : 'hover:bg-gray-50 border-gray-200'} ${isMatching ? 'bg-yellow-100' : ''}`}>
          <td className="px-4 py-3">
            <div className="flex items-center" style={{ paddingLeft: `${level * 20}px` }}>
              {hasChildren && (
                <button
                  onClick={() => toggleCategoryExpansion(category.id)}
                  className={`mr-2 p-1 rounded ${theme === 'dark' ? 'hover:bg-gray-600' : 'hover:bg-gray-200'}`}
                >
                  {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                </button>
              )}
              {!hasChildren && level > 0 && <span className="mr-6" />}
              <div>
                <div className={`font-medium ${isMatching ? 'text-yellow-800 font-semibold' : theme === 'dark' ? 'text-white' : 'text-gray-900'}`} style={{fontSize: '0.9rem'}}>
                  {category.name}
                </div>
                {category.parentCategoryName && (
                  <div className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`} style={{fontSize: '0.8rem'}}>Parent: {category.parentCategoryName}</div>
                )}
              </div>
            </div>
          </td>
          <td className={`px-4 py-3 text-sm font-mono ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`} style={{fontSize: '0.875rem'}}>{category.slug}</td>
          <td className={`px-4 py-3 text-sm max-w-xs truncate ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`} style={{fontSize: '0.875rem'}}>{category.description || 'No description'}</td>
          <td className={`px-4 py-3 text-center text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-900'}`} style={{fontSize: '0.875rem'}}>{category.sortOrder || 0}</td>
          <td className="px-4 py-3">
            <span className={`px-2 py-1 text-xs rounded-full ${
              category.isActive 
                ? (theme === 'dark' ? 'bg-green-900 text-green-300' : 'bg-green-100 text-green-800')
                : (theme === 'dark' ? 'bg-red-900 text-red-300' : 'bg-red-100 text-red-800')
            }`} style={{fontSize: '0.75rem'}}>{category.isActive ? 'Active' : 'Inactive'}</span>
          </td>
          <td className="px-4 py-3">
            {category.iconUrl ? <img src={category.iconUrl} alt={category.name} className="w-6 h-6 rounded" /> : <span className={`text-sm ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`} style={{fontSize: '0.8rem'}}>No icon</span>}
          </td>
          <td className="px-4 py-3 flex space-x-2">
            <button onClick={() => handleViewDetails(category)} className={`p-1 rounded ${theme === 'dark' ? 'text-green-400 hover:bg-green-900' : 'text-green-600 hover:bg-green-50'}`}><Eye size={16} /></button>
            <button onClick={() => handleEdit(category)} className={`p-1 rounded ${theme === 'dark' ? 'text-blue-400 hover:bg-blue-900' : 'text-blue-600 hover:bg-blue-50'}`}><Edit2 size={16} /></button>
            <button onClick={() => handleDelete(category.id)} className={`p-1 rounded ${theme === 'dark' ? 'text-red-400 hover:bg-red-900' : 'text-red-600 hover:bg-red-50'}`}><Trash2 size={16} /></button>
          </td>
        </tr>
        {isExpanded && children.map(child => renderCategoryRow(child, level + 1))}
      </React.Fragment>
    );
  };

  return (
    <AdminPageLayout
      title="Category Management"
      subtitle="Manage your course categories and subcategories"
      icon={FolderIcon}
      loading={loading}
      skeletonType="table"
      actions={
        <button
          onClick={openCreateModal}
          className="flex items-center px-4 py-2 sm:py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-500 dark:to-indigo-500 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 dark:hover:from-blue-600 dark:hover:to-indigo-600 transition-all duration-200 font-medium shadow-lg hover:shadow-xl text-sm"
        >
          <Plus className="w-4 h-4 sm:mr-2" />
          <span className="hidden sm:inline">Add Category</span>
          <span className="sm:hidden">Add</span>
        </button>
      }
    >
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

      {/* Error message */}
      {error && <div className="mb-4 p-4 bg-red-50 border border-red-200 text-red-600 rounded">{error}</div>}

      {/* Search and Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
            <input
              type="text"
              placeholder="Search by name..."
              value={filters.name || ''}
              onChange={(e) => setFilters(prev => ({ ...prev, name: e.target.value }))}
              className="w-full px-4 py-2 pl-10 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
              style={{fontSize: '1rem'}}
            />
          </div>
          <input
            type="text"
            placeholder="Search by slug..."
            value={filters.slug || ''}
            onChange={(e) => setFilters(prev => ({ ...prev, slug: e.target.value }))}
            className="w-full px-4 py-2 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
            style={{fontSize: '1rem'}}
          />
          <input
            type="text"
            placeholder="Search by description..."
            value={filters.description || ''}
            onChange={(e) => setFilters(prev => ({ ...prev, description: e.target.value }))}
            className="w-full px-4 py-2 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
            style={{fontSize: '1rem'}}
          />
          <CategoryDropdown
            categories={allCategoriesForDropdown}
            value={filters.parentCategoryId || ''}
            onChange={(value) => setFilters(prev => ({ ...prev, parentCategoryId: value || '' }))}
            placeholder="Parent category..."
            className="w-full"
            allowClear={true}
          />
        </div>
        <div className="flex gap-3 mt-4">
          <button
            onClick={applyFilters}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center"
            style={{fontSize: '0.875rem'}}
          >
            <Filter size={16} className="mr-2" />
            Apply Filters
          </button>
          <button
            onClick={clearFilters}
            className="px-6 py-2 border border-gray-300 dark:border-gray-600 rounded-lg transition-colors text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
            style={{fontSize: '0.875rem'}}
          >
            Clear
          </button>
        </div>
      </div>

      {/* Category table */}
      <div className={`border rounded-lg overflow-hidden ${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className={`ml-3 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`} style={{fontSize: '0.875rem'}}>Loading categories...</span>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className={`${theme === 'dark' ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'} border-b`}>
                <tr>
                  <th className={`px-4 py-3 text-left text-xs font-medium uppercase ${theme === 'dark' ? 'text-gray-300' : 'text-gray-500'}`} style={{fontSize: '0.75rem'}}>Category</th>
                  <th className={`px-4 py-3 text-left text-xs font-medium uppercase ${theme === 'dark' ? 'text-gray-300' : 'text-gray-500'}`} style={{fontSize: '0.75rem'}}>Slug</th>
                  <th className={`px-4 py-3 text-left text-xs font-medium uppercase ${theme === 'dark' ? 'text-gray-300' : 'text-gray-500'}`} style={{fontSize: '0.75rem'}}>Description</th>
                  <th className={`px-4 py-3 text-center text-xs font-medium uppercase ${theme === 'dark' ? 'text-gray-300' : 'text-gray-500'}`} style={{fontSize: '0.75rem'}}>Sort Order</th>
                  <th className={`px-4 py-3 text-left text-xs font-medium uppercase ${theme === 'dark' ? 'text-gray-300' : 'text-gray-500'}`} style={{fontSize: '0.75rem'}}>Status</th>
                  <th className={`px-4 py-3 text-left text-xs font-medium uppercase ${theme === 'dark' ? 'text-gray-300' : 'text-gray-500'}`} style={{fontSize: '0.75rem'}}>Icon</th>
                  <th className={`px-4 py-3 text-left text-xs font-medium uppercase ${theme === 'dark' ? 'text-gray-300' : 'text-gray-500'}`} style={{fontSize: '0.75rem'}}>Actions</th>
                </tr>
              </thead>
              <tbody className={`divide-y ${theme === 'dark' ? 'divide-gray-700' : 'divide-gray-200'}`}>
                {parentCategories.length === 0 ? (
                  <tr>
                    <td colSpan="7" className={`px-4 py-8 text-center ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`} style={{fontSize: '0.875rem'}}>No categories found.</td>
                  </tr>
                ) : (
                  parentCategories
                    .slice((pagination.page - 1) * pagination.pageSize, pagination.page * pagination.pageSize)
                    .map(cat => renderCategoryRow(cat))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pagination */}
      {pagination.totalCount > pagination.pageSize && (
        <div className="mt-6 flex items-center justify-between">
          <div className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`} style={{fontSize: '0.875rem'}}>
            Showing {((pagination.page - 1) * pagination.pageSize) + 1} to {Math.min(pagination.page * pagination.pageSize, pagination.totalCount)} of {pagination.totalCount} categories
          </div>
          <div className="flex items-center space-x-2">
            <button 
              onClick={prevPage} 
              disabled={pagination.page <= 1}
              className={`p-2 border rounded disabled:opacity-50 ${theme === 'dark' ? 'border-gray-600 text-gray-300 hover:bg-gray-700' : 'border-gray-300 text-gray-700 hover:bg-gray-100'}`}
            >
              <ChevronLeft size={16} />
            </button>
            <span className={`px-3 py-1 text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`} style={{fontSize: '0.875rem'}}>
              Page {pagination.page} of {Math.ceil(pagination.totalCount / pagination.pageSize)}
            </span>
            <button 
              onClick={nextPage} 
              disabled={pagination.page >= Math.ceil(pagination.totalCount / pagination.pageSize)}
              className={`p-2 border rounded disabled:opacity-50 ${theme === 'dark' ? 'border-gray-600 text-gray-300 hover:bg-gray-700' : 'border-gray-300 text-gray-700 hover:bg-gray-100'}`}
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}

      {/* Create Category Modal */}
      <Modal 
        isOpen={showCreateModal} 
        onClose={closeCreateModal} 
        title="Create New Category"
      >
        <form onSubmit={handleSubmit}>
          {/* Modal Error Display */}
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
              <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>Category Name *</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                required
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  theme === 'dark' 
                    ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                    : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                }`}
                placeholder="Enter category name"
              />
            </div>
            
            <div>
              <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>Description</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows="3"
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  theme === 'dark' 
                    ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                    : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                }`}
                placeholder="Enter category description"
              />
            </div>
            
            <div>
              <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>Parent Category</label>
              <CategoryDropdown
                categories={allCategoriesForDropdown}
                value={formData.parentCategoryId}
                onChange={handleParentCategoryChange}
                placeholder="Select parent category..."
                className="w-full"
              />
            </div>
            
            <div>
              <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>Icon</label>
              <div className="space-y-3">
                {/* File Upload */}
                <div className="flex items-center space-x-3">
                  <div className="flex-1">
                    <div className="relative">
                      <input
                        type="file"
                        id="icon-upload"
                        accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
                        onChange={(e) => {
                          const file = e.target.files[0];
                          if (file) {
                            const previewUrl = URL.createObjectURL(file);
                            setFormData(prev => ({ 
                              ...prev, 
                              iconUrl: previewUrl,
                              iconFile: file
                            }));
                          }
                        }}
                        className="hidden"
                        disabled={modalError ? true : false}
                      />
                      <button
                        type="button"
                        onClick={() => document.getElementById('icon-upload').click()}
                        className={`w-full px-4 py-3 border-2 border-dashed rounded-lg hover:border-blue-400 transition-colors flex items-center justify-center space-x-2 ${
                          theme === 'dark' 
                            ? 'border-gray-600 text-gray-400 hover:text-blue-400 hover:bg-gray-700' 
                            : 'border-gray-300 text-gray-600 hover:text-blue-600'
                        }`}
                        disabled={modalError ? true : false}
                      >
                        <Upload size={20} />
                        <span>Upload Icon Image</span>
                      </button>
                    </div>
                  </div>
                </div>
                
                {/* Icon Preview */}
                {(formData.iconUrl || formData.iconFile) && (
                  <div className="flex items-center space-x-3">
                    <div className="relative">
                      <img 
                        src={formData.iconUrl} 
                        alt="Icon preview" 
                        className={`w-16 h-16 rounded-lg border object-cover ${theme === 'dark' ? 'border-gray-600' : 'border-gray-200'}`}
                      />
                      <button
                        type="button"
                        onClick={() => setFormData(prev => ({ ...prev, iconUrl: '', iconFile: null }))}
                        className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors"
                        disabled={modalError ? true : false}
                      >
                        <X size={14} />
                      </button>
                    </div>
                    <div className="flex-1">
                      <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                        {formData.iconFile ? 'New icon uploaded' : 'Current icon'}
                      </p>
                      {formData.iconFile && (
                        <p className={`text-xs ${theme === 'dark' ? 'text-gray-500' : 'text-gray-500'}`}>{formData.iconFile.name}</p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
          
          <div className="flex justify-end space-x-3 mt-6">
            <button
              type="button"
              onClick={closeCreateModal}
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Create Category
            </button>
          </div>
        </form>
      </Modal>

      {/* Update Category Modal */}
      <Modal 
        isOpen={showUpdateModal} 
        onClose={closeUpdateModal} 
        title="Update Category"
      >
        <form onSubmit={handleSubmit}>
          {/* Modal Error Display */}
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
              <label className="block text-sm font-medium text-gray-700 mb-1">Category Name *</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                required
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  theme === 'dark' 
                    ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                    : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                }`}
                placeholder="Enter category name"
              />
            </div>
            
            <div>
              <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>Description</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows="3"
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  theme === 'dark' 
                    ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                    : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                }`}
                placeholder="Enter category description"
              />
            </div>
            
            <div>
              <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>Parent Category</label>
              <CategoryDropdown
                categories={allCategoriesForDropdown}
                value={formData.parentCategoryId}
                onChange={handleParentCategoryChange}
                placeholder="Select parent category..."
                excludeId={editingCategory?.id}
                className="w-full"
              />
            </div>
            
            <div>
              <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>Icon</label>
              <div className="space-y-3">
                {/* File Upload */}
                <div className="flex items-center space-x-3">
                  <div className="flex-1">
                    <div className="relative">
                      <input
                        type="file"
                        id="icon-upload-update"
                        accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
                        onChange={(e) => {
                          const file = e.target.files[0];
                          if (file) {
                            const previewUrl = URL.createObjectURL(file);
                            setFormData(prev => ({ 
                              ...prev, 
                              iconUrl: previewUrl,
                              iconFile: file
                            }));
                          }
                        }}
                        className="hidden"
                        disabled={modalError ? true : false}
                      />
                      <button
                        type="button"
                        onClick={() => document.getElementById('icon-upload-update').click()}
                        className={`w-full px-4 py-3 border-2 border-dashed rounded-lg hover:border-blue-400 transition-colors flex items-center justify-center space-x-2 ${
                          theme === 'dark' 
                            ? 'border-gray-600 text-gray-400 hover:text-blue-400 hover:bg-gray-700' 
                            : 'border-gray-300 text-gray-600 hover:text-blue-600'
                        }`}
                        disabled={modalError ? true : false}
                      >
                        <Upload size={20} />
                        <span>Upload New Icon</span>
                      </button>
                    </div>
                  </div>
                </div>
                
                {/* Icon Preview */}
                {(formData.iconUrl || formData.iconFile) && (
                  <div className="flex items-center space-x-3">
                    <div className="relative">
                      <img 
                        src={formData.iconUrl} 
                        alt="Icon preview" 
                        className={`w-16 h-16 rounded-lg border object-cover ${theme === 'dark' ? 'border-gray-600' : 'border-gray-200'}`}
                      />
                      <button
                        type="button"
                        onClick={() => setFormData(prev => ({ ...prev, iconUrl: '', iconFile: null }))}
                        className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors"
                        disabled={modalError ? true : false}
                      >
                        <X size={14} />
                      </button>
                    </div>
                    <div className="flex-1">
                      <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                        {formData.iconFile ? 'New icon uploaded' : 'Current icon'}
                      </p>
                      {formData.iconFile && (
                        <p className={`text-xs ${theme === 'dark' ? 'text-gray-500' : 'text-gray-500'}`}>{formData.iconFile.name}</p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
          
          <div className="flex justify-end space-x-3 mt-6">
            <button
              type="button"
              onClick={closeUpdateModal}
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Update Category
            </button>
          </div>
        </form>
      </Modal>

      {/* Category Details Modal */}
      <Modal 
        isOpen={showDetailsModal} 
        onClose={closeDetailsModal} 
        title="Category Details"
      >
        {selectedCategory && (
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-medium text-gray-500">Name</h3>
              <p className="mt-1 text-sm text-gray-900">{selectedCategory.name}</p>
            </div>
            
            <div>
              <h3 className="text-sm font-medium text-gray-500">Slug</h3>
              <p className="mt-1 text-sm text-gray-900 font-mono">{selectedCategory.slug}</p>
            </div>
            
            <div>
              <h3 className="text-sm font-medium text-gray-500">Description</h3>
              <p className="mt-1 text-sm text-gray-900">{selectedCategory.description || 'No description'}</p>
            </div>
            
            <div>
              <h3 className="text-sm font-medium text-gray-500">Parent Category</h3>
              <p className="mt-1 text-sm text-gray-900">
                {selectedCategory.parentCategoryName || 'No Parent (Root Category)'}
              </p>
            </div>
            
            <div>
              <h3 className="text-sm font-medium text-gray-500">Sort Order</h3>
              <p className="mt-1 text-sm text-gray-900">{selectedCategory.sortOrder || 0}</p>
            </div>
            
            <div>
              <h3 className="text-sm font-medium text-gray-500">Status</h3>
              <span className={`mt-1 inline-flex px-2 py-1 text-xs rounded-full ${
                selectedCategory.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
              }`}>
                {selectedCategory.isActive ? 'Active' : 'Inactive'}
              </span>
            </div>
            
            {selectedCategory.iconUrl && (
              <div>
                <h3 className="text-sm font-medium text-gray-500">Icon</h3>
                <div className="mt-1">
                  <img 
                    src={selectedCategory.iconUrl} 
                    alt={selectedCategory.name} 
                    className="w-12 h-12 rounded border border-gray-200"
                  />
                </div>
              </div>
            )}
            
            <div className="flex justify-end space-x-3 pt-4 border-t">
              <button
                onClick={closeDetailsModal}
                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
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

export default CategoryManagement;
