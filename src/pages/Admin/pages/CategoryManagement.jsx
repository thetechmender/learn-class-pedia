import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useAdmin } from '../../../hooks/useAdmin';
import Modal from '../../../components/Modal';
import CategoryDropdown from '../../../components/CategoryDropdown';
import { useToast } from '../../../components/ToastProvider';
import { 
  Plus, 
  Edit2, 
  Trash2, 
  ChevronRight, 
  ChevronLeft,
  Search,
  Filter,
  Eye,
  EyeOff,
  ChevronRight as ChevronRightIcon,
  ChevronDown,
  AlertCircle
} from 'lucide-react';

const CategoryManagement = () => {
  // Toast notifications
  const { showError, showSuccess } = useToast();
  
  // CRUD operations from hook
  const {
    getAllCategories,
    getCategoryById,
    createCategory,
    updateCategory,
    deleteCategory
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
    iconUrl: '',
    parentCategoryId: 0
  });

  // Fetch categories
  const fetchCategories = useCallback(async () => {
    try {
      setLoading(true);
      // Build search term from filters for backend
      const searchTerm = Object.values(filters).filter(Boolean).join(' ') || '';
      console.log('Fetching categories with search term:', searchTerm);
      const data = await getAllCategories(searchTerm, {});
      console.log('Data received from backend:', data);
      const categories = data.items || data || [];
      console.log('Categories length:', categories.length);
      setCategories(categories);
      setPagination(prev => ({ ...prev, totalCount: categories.length, page: 1 }));
      setError(null);
    } catch (err) {
      setError('Failed to fetch categories');
      console.error('Error fetching categories:', err);
    } finally {
      setLoading(false);
    }
  }, [getAllCategories, filters]);

  // Initialize data on mount
  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  // Input handlers
  const handleInputChange = useCallback((e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  }, []);

  const handleFilterChange = useCallback((e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  }, []);

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
    console.log('Filters:', filters);
    console.log('Has active filters:', filters.name || filters.slug || filters.description);
    
    if (filters.name || filters.slug || filters.description) {
      // If there are search filters, show only matching categories
      console.log('Showing filtered results only');
      return globalSearchResults;
    } else {
      // No search filters, show all categories with pagination
      console.log('Showing all categories');
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

  const categoryMap = new Map(displayCategories.map(cat => [cat.id, cat]));
  
  // Find root categories from displayed data (not paginated)
  const parentCategories = displayCategories.filter(cat => {
    // A category is a parent if it has no parent
    return !cat.parentCategoryId;
  });

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
      iconUrl: '',
      parentCategoryId: 0
    });
    setEditingCategory(null);
  }, []);

  // CRUD operations
  const handleSubmit = useCallback(async (e) => {
    debugger;
    e.preventDefault();
    setModalError(''); // Clear previous modal error
    
    try {
      if (editingCategory) {
        await updateCategory(editingCategory.id, formData);
        setShowUpdateModal(false);
        console.log('Showing update success toast');
        showSuccess('Category updated successfully!');
      } else {
        await createCategory(formData);
        setShowCreateModal(false);
        console.log('Showing create success toast');
        showSuccess('Category created successfully!');
      }
      resetForm();
      fetchCategories();
    } catch (err) {
      console.error('Full error object:', err);
      console.error('Error response:', err.response);
      console.error('Error data:', err.response?.data);
      
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
      console.error('Final error message:', errorMessage);
    }
  }, [editingCategory, formData, updateCategory, createCategory, resetForm, fetchCategories, showSuccess, showError]);

  const handleEdit = useCallback((category) => {
    setEditingCategory(category);
    setFormData({
      name: category.name || '',
      description: category.description || '',
      iconUrl: category.iconUrl || '',
      parentCategoryId: category.parentCategoryId || 0
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
      console.log('Showing delete success toast');
      showSuccess('Category deleted successfully!');
      fetchCategories();
    } catch (err) {
      const errorMessage = err.response?.data?.error || err.message || 'Failed to delete category';
      showError(errorMessage);
      console.error(err);
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
        <tr className={`border-b hover:bg-gray-50 ${isMatching ? 'bg-yellow-100' : ''}`}>
          <td className="px-4 py-3">
            <div className="flex items-center" style={{ paddingLeft: `${level * 20}px` }}>
              {hasChildren && (
                <button
                  onClick={() => toggleCategoryExpansion(category.id)}
                  className="mr-2 p-1 hover:bg-gray-200 rounded"
                >
                  {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                </button>
              )}
              {!hasChildren && level > 0 && <span className="mr-6" />}
              <div>
                <div className={`font-medium ${isMatching ? 'text-yellow-800 font-semibold' : ''}`}>
                  {category.name}
                </div>
                {category.parentCategoryName && (
                  <div className="text-sm text-gray-500">Parent: {category.parentCategoryName}</div>
                )}
              </div>
            </div>
          </td>
          <td className="px-4 py-3 text-sm text-gray-600 font-mono">{category.slug}</td>
          <td className="px-4 py-3 text-sm text-gray-600 max-w-xs truncate">{category.description || 'No description'}</td>
          <td className="px-4 py-3 text-center text-sm font-medium">{category.sortOrder || 0}</td>
          <td className="px-4 py-3">
            <span className={`px-2 py-1 text-xs rounded-full ${
              category.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
            }`}>{category.isActive ? 'Active' : 'Inactive'}</span>
          </td>
          <td className="px-4 py-3">
            {category.iconUrl ? <img src={category.iconUrl} alt={category.name} className="w-6 h-6 rounded" /> : <span className="text-gray-400 text-sm">No icon</span>}
          </td>
          <td className="px-4 py-3 flex space-x-2">
            <button onClick={() => handleViewDetails(category)} className="text-green-600 hover:bg-green-50 p-1 rounded"><Eye size={16} /></button>
            <button onClick={() => handleEdit(category)} className="text-blue-600 hover:bg-blue-50 p-1 rounded"><Edit2 size={16} /></button>
            <button onClick={() => handleDelete(category.id)} className="text-red-600 hover:bg-red-50 p-1 rounded"><Trash2 size={16} /></button>
          </td>
        </tr>
        {isExpanded && children.map(child => renderCategoryRow(child, level + 1))}
      </React.Fragment>
    );
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-2">Category Management</h1>
      <p className="text-gray-600 mb-4">Manage your course categories and subcategories</p>

      {/* Error message */}
      {error && <div className="mb-4 p-4 bg-red-50 border border-red-200 text-red-600 rounded">{error}</div>}

      {/* Controls */}
      <div className="mb-6 flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
        {/* Consolidated Filter Section */}
        <div className="flex-1 w-full">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
              <input
                type="text"
                placeholder="Search categories..."
                value={filters.name || ''}
                onChange={(e) => setFilters(prev => ({ ...prev, name: e.target.value }))}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <input
              type="text"
              placeholder="Slug..."
              value={filters.slug || ''}
              onChange={(e) => setFilters(prev => ({ ...prev, slug: e.target.value }))}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <input
              type="text"
              placeholder="Description..."
              value={filters.description || ''}
              onChange={(e) => setFilters(prev => ({ ...prev, description: e.target.value }))}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
          <div className="flex gap-3 mt-3">
            <button
              onClick={applyFilters}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center"
            >
              <Filter size={16} className="mr-2" />
              Apply Filters
            </button>
            <button
              onClick={clearFilters}
              className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Clear
            </button>
          </div>
        </div>
        <button
          onClick={openCreateModal}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          <Plus size={20} className="mr-2"/> Add Category
        </button>
      </div>

      {/* Category table */}
      <div className="bg-white border rounded-lg overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-3 text-gray-600">Loading categories...</span>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Slug</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Description</th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Sort Order</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Icon</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {parentCategories.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="px-4 py-8 text-center text-gray-500">No categories found.</td>
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
          <div className="text-sm text-gray-600">
            Showing {((pagination.page - 1) * pagination.pageSize) + 1} to {Math.min(pagination.page * pagination.pageSize, pagination.totalCount)} of {pagination.totalCount} categories
          </div>
          <div className="flex items-center space-x-2">
            <button 
              onClick={prevPage} 
              disabled={pagination.page <= 1}
              className="p-2 border rounded disabled:opacity-50"
            >
              <ChevronLeft size={16} />
            </button>
            <span className="px-3 py-1 text-sm font-medium">
              Page {pagination.page} of {Math.ceil(pagination.totalCount / pagination.pageSize)}
            </span>
            <button 
              onClick={nextPage} 
              disabled={pagination.page >= Math.ceil(pagination.totalCount / pagination.pageSize)}
              className="p-2 border rounded disabled:opacity-50"
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
              <label className="block text-sm font-medium text-gray-700 mb-1">Category Name *</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter category name"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows="3"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter category description"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Parent Category</label>
              <CategoryDropdown
                categories={allCategoriesForDropdown}
                value={formData.parentCategoryId}
                onChange={handleParentCategoryChange}
                placeholder="Select parent category..."
                className="w-full"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Icon URL</label>
              <input
                type="url"
                name="iconUrl"
                value={formData.iconUrl}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="https://example.com/icon.png"
              />
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
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter category name"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows="3"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter category description"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Parent Category</label>
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
              <label className="block text-sm font-medium text-gray-700 mb-1">Icon URL</label>
              <input
                type="url"
                name="iconUrl"
                value={formData.iconUrl}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="https://example.com/icon.png"
              />
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
    </div>
  );
};

export default CategoryManagement;
