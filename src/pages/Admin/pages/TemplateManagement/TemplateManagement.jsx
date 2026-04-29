import React, { useState, useEffect, useCallback } from 'react';
import { useTemplateManagement } from '../../../../hooks/api/useTemplateManagement';
import { useToast } from '../../../../hooks/utils/useToast';
import GenericDropdown from '../../../../components/GenericDropdown';
import {
  FileText,
  Plus,
  Edit,
  Trash2,
  Eye,
  Search,
  ChevronLeft,
  ChevronRight,
  X,
  Save,
  Code,
  Calendar,
  Hash,
  CheckCircle,
  XCircle,
  Filter,
  Mail,
  Award,
  FileText as Invoice
} from 'lucide-react';

const TemplateManagement = () => {
  const { showToast } = useToast();
  
  const {
    templates,
    templateTypes,
    loading,
    error,
    pagination,
    fetchTemplates,
    createTemplate,
    updateTemplate,
    deleteTemplate,
    getTemplateById,
    handlePageChange,
    handlePageSizeChange,
  } = useTemplateManagement();

  const [filters, setFilters] = useState({
    title: '',
    templateTypeId: ''
  });
  const [showFilters, setShowFilters] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [formData, setFormData] = useState({
    templateKey: '',
    title: '',
    subject: '',
    htmlBody: '',
    emailType: '',
    templateTypeId: 0,
  });

  // Template type icons
  const getTemplateTypeIcon = (typeName) => {
    switch (typeName?.toLowerCase()) {
      case 'email':
        return <Mail className="w-5 h-5" />;
      case 'certificate':
        return <Award className="w-5 h-5" />;
      case 'invoice':
        return <Invoice className="w-5 h-5" />;
      default:
        return <FileText className="w-5 h-5" />;
    }
  };

  // Template type colors
  const getTemplateTypeColor = (typeName) => {
    switch (typeName?.toLowerCase()) {
      case 'email':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'certificate':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'invoice':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  // Show success/error messages
  const showSuccess = useCallback((message) => showToast(message, 'success'), [showToast]);
  const showError = useCallback((message) => showToast(message, 'error'), [showToast]);

  // Handle form submission
  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();
    try {
      // Convert empty emailType to null for API
      const payload = {
        ...formData,
        emailType: formData.emailType || null
      };
      
      if (showEditModal && selectedTemplate) {
        await updateTemplate(selectedTemplate.id, payload);
        showSuccess('Template updated successfully!');
        setShowEditModal(false);
      } else {
        await createTemplate(payload);
        showSuccess('Template created successfully!');
        setShowCreateModal(false);
      }
      resetForm();
    } catch (err) {
      showError(err.message || 'Failed to save template');
    }
  }, [formData, showEditModal, selectedTemplate, updateTemplate, createTemplate, showSuccess, showError]);

  // Handle delete
  const handleDelete = useCallback(async (template) => {
    if (!window.confirm(`Are you sure you want to delete "${template.title}"?`)) {
      return;
    }
    try {
      await deleteTemplate(template.id);
      showSuccess('Template deleted successfully!');
    } catch (err) {
      showError(err.message || 'Failed to delete template');
    }
  }, [deleteTemplate, showSuccess, showError]);

  // Handle view
  const handleView = useCallback(async (template) => {
    try {
      const fullTemplate = await getTemplateById(template.id);
      setSelectedTemplate(fullTemplate);
      setShowViewModal(true);
    } catch (err) {
      showError(err.message || 'Failed to fetch template details');
    }
  }, [getTemplateById, showError]);

  // Handle edit
  const handleEdit = useCallback(async (template) => {
    try {
      const fullTemplate = await getTemplateById(template.id);
      setSelectedTemplate(fullTemplate);
      setFormData({
        templateKey: fullTemplate.templateKey || '',
        title: fullTemplate.title || '',
        subject: fullTemplate.subject || '',
        htmlBody: fullTemplate.htmlBody || '',
        emailType: fullTemplate.emailType || '',
        templateTypeId: fullTemplate.templateTypeId || 0,
        
      });
      setShowEditModal(true);
    } catch (err) {
      showError(err.message || 'Failed to fetch template details');
    }
  }, [getTemplateById, showError]);

  // Reset form
  const resetForm = useCallback(() => {
    setFormData({
      templateKey: '',
      title: '',
      subject: '',
      htmlBody: '',
      emailType: '',
      templateTypeId: 0,
    
    });
    setSelectedTemplate(null);
  }, []);

  // Handle filter change
  const handleFilterChange = useCallback((name, value) => {
    setFilters(prev => ({ ...prev, [name]: value }));
  }, []);

  // Clear all filters
  const clearFilters = useCallback(() => {
    const clearedFilters = { title: '', templateTypeId: '' };
    setFilters(clearedFilters);
    handlePageChange(1);
    fetchTemplates({ page: 1, pageSize: pagination.pageSize });
  }, [pagination.pageSize, fetchTemplates, handlePageChange]);

  // Apply filters
  const applyFilters = useCallback(() => {
    const params = {
      page: 1,
      pageSize: pagination.pageSize,
    };

    if (filters.templateTypeId) {
      params.templateTypeId = parseInt(filters.templateTypeId);
    }

    if (filters.title) {
      params.title = filters.title;
    }

    fetchTemplates(params);
    setShowFilters(false);
  }, [filters, pagination.pageSize, fetchTemplates]);

  // Get active filters count
  const getActiveFiltersCount = useCallback(() => {
    return Object.values(filters).filter(value => value && value.trim?.() !== '').length;
  }, [filters]);

  // Prepare template types for dropdown
  const templateTypesForDropdown = [
    { id: '', name: 'All Types' },
    ...templateTypes.map(type => ({
      id: type.id.toString(),
      name: type.title || type.name || type.typeName || type.label || 'Unknown Type'
    }))
  ];

  const hasActiveFilters = getActiveFiltersCount() > 0 || showFilters;

  if (loading && templates.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-3 text-gray-600">Loading templates...</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header Section */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center">
                <FileText className="w-8 h-8 text-blue-600 mr-3" />
                Template Management
              </h1>
              <p className="text-gray-600 mt-2">Manage and organize all templates in one place</p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`flex items-center justify-center px-4 py-2.5 rounded-lg transition-all duration-200 font-medium text-sm ${
                  hasActiveFilters
                    ? 'bg-blue-100 text-blue-700 border-2 border-blue-200'
                    : 'bg-white border-2 border-gray-200 text-gray-700 hover:bg-gray-50'
                }`}
              >
                <Filter className="w-4 h-4 mr-2" />
                Filters
                {hasActiveFilters && (
                  <span className="ml-2 px-2 py-0.5 bg-blue-600 text-white text-xs rounded-full">
                    {getActiveFiltersCount()}
                  </span>
                )}
              </button>
              <button
                onClick={() => {
                  resetForm();
                  setShowCreateModal(true);
                }}
                className="flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                <Plus className="w-5 h-5 mr-2" />
                Create Template
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Templates</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{templates.length}</p>
                <p className="text-xs text-gray-500 mt-1">All templates</p>
              </div>
              <div className="bg-blue-100 p-3 rounded-lg">
                <FileText className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Template Types</p>
                <p className="text-3xl font-bold text-purple-600 mt-2">{templateTypes.length}</p>
                <p className="text-xs text-gray-500 mt-1">Available types</p>
              </div>
              <div className="bg-purple-100 p-3 rounded-lg">
                <Hash className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Filters Section */}
        {showFilters && (
          <div className="bg-white/60 backdrop-blur-sm border border-gray-200 rounded-xl mb-8 relative z-20">
            <div className="p-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 space-y-2 sm:space-y-0">
                <h3 className="text-lg font-semibold text-gray-900">Filter Options</h3>
                <button
                  onClick={clearFilters}
                  className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                >
                  Clear All
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Title</label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                      type="text"
                      value={filters.title}
                      onChange={(e) => handleFilterChange('title', e.target.value)}
                      placeholder="Search by title..."
                      className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-sm"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Template Type</label>
                  <GenericDropdown
                    items={templateTypesForDropdown}
                    value={filters.templateTypeId}
                    onChange={(value) => handleFilterChange('templateTypeId', value)}
                    placeholder="All Types"
                    className="w-full"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 mt-4">
                <button
                  onClick={() => {
                    clearFilters();
                    setShowFilters(false);
                  }}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-all duration-200 font-medium text-sm"
                >
                  Clear Filters
                </button>
                <button
                  onClick={applyFilters}
                  className="flex items-center px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 font-medium shadow-lg hover:shadow-xl text-sm"
                >
                  <Filter className="w-4 h-4 mr-2" />
                  Apply Filters
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Active Filters Indicator */}
        {getActiveFiltersCount() > 0 && (
          <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-xl">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-sm text-blue-800 font-medium">Active filters:</span>
                {filters.title && (
                  <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-md">
                    Title: {filters.title}
                  </span>
                )}
                {filters.templateTypeId && (
                  <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-md">
                    Type: {templateTypes.find(t => t.id.toString() === filters.templateTypeId)?.title || 'Unknown'}
                  </span>
                )}
              </div>
              <button
                onClick={clearFilters}
                className="text-sm text-blue-600 hover:text-blue-700 font-medium"
              >
                Clear All
              </button>
            </div>
          </div>
        )}

        {/* Error Display */}
        {error && (
          <div className="mb-8 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center">
            <XCircle className="w-5 h-5 text-red-600 mr-2" />
            <span className="text-red-700">{error}</span>
          </div>
        )}

        {/* Templates Grid */}
        {templates.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-16 text-center">
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6">
              <FileText className="w-12 h-12 text-blue-400" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-3">No templates found</h3>
            <p className="text-gray-600 mb-8">
              {filters.title || filters.templateTypeId ? 'Try adjusting your filters' : 'Get started by creating your first template'}
            </p>
            <button
              onClick={() => {
                resetForm();
                setShowCreateModal(true);
              }}
              className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 font-semibold"
            >
              <Plus className="w-5 h-5 mr-2" />
              Create Template
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {templates.map((template) => (
              <div
                key={template.id}
                className="bg-white rounded-2xl shadow-sm border border-gray-200 hover:shadow-xl transition-all duration-300 overflow-hidden group hover:-translate-y-1"
              >
                {/* Template Header */}
                <div className="h-28 relative flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
                  <div className="text-center">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center mx-auto mb-3 shadow-lg group-hover:scale-110 transition-transform duration-300">
                      {getTemplateTypeIcon(templateTypes.find(t => t.id === template.templateTypeId)?.title)}
                    </div>
                    <div className={`inline-flex items-center px-3 py-1.5 text-xs rounded-full font-semibold border shadow-sm ${getTemplateTypeColor(templateTypes.find(t => t.id === template.templateTypeId)?.title)}`}>
                      {templateTypes.find(t => t.id === template.templateTypeId)?.title || 'Unknown'}
                    </div>
                  </div>
                </div>

                {/* Template Content */}
                <div className="p-5">
                  <h3 className="font-bold text-gray-900 text-lg mb-3 truncate group-hover:text-blue-600 transition-colors">{template.title}</h3>
                  <div className="flex items-center gap-2 mb-3 bg-gray-50 rounded-lg px-3 py-2">
                    <Hash className="w-4 h-4 text-gray-400" />
                    <span className="text-sm text-gray-600 font-mono truncate">{template.templateKey}</span>
                  </div>

                  {template.subject && (
                    <div className="flex items-center gap-2 mb-4 bg-gray-50 rounded-lg px-3 py-2">
                      <Mail className="w-4 h-4 text-gray-400" />
                      <span className="text-sm text-gray-600 truncate">{template.subject}</span>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                    <div className="inline-flex items-center px-3 py-2 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl border border-gray-200 shadow-sm">
                      <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center mr-2">
                        <span className="text-white text-xs font-bold">ID</span>
                      </div>
                      <span className="text-sm font-semibold text-gray-900">{template.id}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleView(template)}
                        className="p-2.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all duration-200"
                        title="View Template"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleEdit(template)}
                        className="p-2.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all duration-200"
                        title="Edit Template"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(template)}
                        className="p-2.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all duration-200"
                        title="Delete Template"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Enhanced Pagination */}
        {pagination.totalPages > 1 && (
          <div className="mt-8 bg-white rounded-xl shadow-sm border border-gray-200 px-6 py-4">
            <div className="flex flex-col lg:flex-row items-center justify-between gap-4">
              {/* Results Info */}
              <div className="text-sm text-gray-700">
                Showing {((pagination.page - 1) * pagination.pageSize) + 1} to{' '}
                {Math.min(pagination.page * pagination.pageSize, pagination.totalCount)} of{' '}
                {pagination.totalCount} templates
              </div>

              {/* Page Size Selector */}
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">Show:</span>
                <select
                  value={pagination.pageSize}
                  onChange={(e) => handlePageSizeChange(parseInt(e.target.value))}
                  className="text-sm border border-gray-300 rounded-md px-3 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value={10}>10</option>
                  <option value={20}>20</option>
                  <option value={50}>50</option>
                  <option value={100}>100</option>
                </select>
                <span className="text-sm text-gray-600">per page</span>
              </div>

              {/* Pagination Controls */}
              <div className="flex items-center gap-2">
                {/* Previous Button */}
                <button
                  onClick={() => handlePageChange(pagination.page - 1)}
                  disabled={pagination.page === 1}
                  className="p-2 border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  title="Previous Page"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>

                {/* Page Numbers */}
                <div className="flex items-center gap-1">
                  {/* First Page */}
                  {pagination.page > 3 && (
                    <>
                      <button
                        onClick={() => handlePageChange(1)}
                        className="px-3 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                      >
                        1
                      </button>
                      {pagination.page > 4 && (
                        <span className="px-2 text-gray-400">...</span>
                      )}
                    </>
                  )}

                  {/* Page Range */}
                  {(() => {
                    const pageNumbers = [];
                    if (pagination.totalPages <= 5) {
                      // Show all pages if total is 5 or less
                      for (let i = 1; i <= pagination.totalPages; i++) {
                        pageNumbers.push(i);
                      }
                    } else if (pagination.page <= 3) {
                      // Show pages 1-5 when current page is near start
                      for (let i = 1; i <= 5; i++) {
                        pageNumbers.push(i);
                      }
                    } else if (pagination.page >= pagination.totalPages - 2) {
                      // Show last 5 pages when current page is near end
                      for (let i = pagination.totalPages - 4; i <= pagination.totalPages; i++) {
                        pageNumbers.push(i);
                      }
                    } else {
                      // Show 2 pages before and 2 pages after current page
                      for (let i = pagination.page - 2; i <= pagination.page + 2; i++) {
                        pageNumbers.push(i);
                      }
                    }
                    
                    return pageNumbers.map(pageNum => (
                      <button
                        key={pageNum}
                        onClick={() => handlePageChange(pageNum)}
                        className={`px-3 py-1 text-sm border rounded-md transition-colors ${
                          pageNum === pagination.page
                            ? 'bg-blue-600 text-white border-blue-600'
                            : 'border-gray-300 hover:bg-gray-50'
                        }`}
                      >
                        {pageNum}
                      </button>
                    ));
                  })()}

                  {/* Last Page */}
                  {pagination.page < pagination.totalPages - 2 && pagination.totalPages > 5 && (
                    <>
                      {pagination.page < pagination.totalPages - 3 && (
                        <span className="px-2 text-gray-400">...</span>
                      )}
                      <button
                        onClick={() => handlePageChange(pagination.totalPages)}
                        className="px-3 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                      >
                        {pagination.totalPages}
                      </button>
                    </>
                  )}
                </div>

                {/* Next Button */}
                <button
                  onClick={() => handlePageChange(pagination.page + 1)}
                  disabled={pagination.page === pagination.totalPages}
                  className="p-2 border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  title="Next Page"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>

              {/* Jump to Page */}
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">Go to page:</span>
                <input
                  type="number"
                  min="1"
                  max={pagination.totalPages}
                  value={pagination.page}
                  onChange={(e) => {
                    const page = parseInt(e.target.value);
                    if (page >= 1 && page <= pagination.totalPages) {
                      handlePageChange(page);
                    }
                  }}
                  className="w-16 text-sm border border-gray-300 rounded-md px-2 py-1 text-center focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-500">of {pagination.totalPages}</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Create/Edit Modal */}
      {(showCreateModal || showEditModal) && (
        <div className="fixed inset-0 z-50 overflow-auto bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-7xl w-full max-h-screen overflow-y-auto transform transition-all">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <div className="flex items-center">
                <div className="bg-blue-100 p-2 rounded-lg mr-3">
                  <FileText className="w-5 h-5 text-blue-600" />
                </div>
                <h2 className="text-xl font-semibold text-gray-900">
                  {showEditModal ? 'Edit Template' : 'Create New Template'}
                </h2>
              </div>
              <button
                onClick={() => {
                  if (showEditModal) {
                    setShowEditModal(false);
                  } else {
                    setShowCreateModal(false);
                  }
                  resetForm();
                }}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X size={20} className="text-gray-500" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Template Key <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.templateKey}
                    onChange={(e) => setFormData(prev => ({ ...prev, templateKey: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors font-mono text-sm"
                    placeholder="e.g., welcome_email"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Template Type <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.templateTypeId}
                    onChange={(e) => setFormData(prev => ({ ...prev, templateTypeId: parseInt(e.target.value) }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors text-sm"
                    required
                  >
                    <option value={0}>Select Type</option>
                    {templateTypes.map(type => (
                      <option key={type.id} value={type.id}>
                        {type.title}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Title <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors text-sm"
                    placeholder="Enter template title"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Email Type
                  </label>
                  <select
                    value={formData.emailType}
                    onChange={(e) => setFormData(prev => ({ ...prev, emailType: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors text-sm"
                  >
                    <option value="">Select Email Type</option>
                    <option value="Scheduled">Scheduled</option>
                    <option value="Action">Action</option>
                  </select>
                </div>

                <div className="lg:col-span-4">
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Subject
                  </label>
                  <input
                    type="text"
                    value={formData.subject}
                    onChange={(e) => setFormData(prev => ({ ...prev, subject: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors text-sm"
                    placeholder="Enter email subject"
                  />
                </div>

                <div className="lg:col-span-4">
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    HTML Body
                  </label>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    {/* HTML Editor */}
                    <div className="flex flex-col h-[500px]">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">HTML Editor</span>
                      </div>
                      <textarea
                        value={formData.htmlBody}
                        onChange={(e) => setFormData(prev => ({ ...prev, htmlBody: e.target.value }))}
                        className="flex-1 w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors resize-none font-mono text-sm"
                        placeholder="Enter HTML content..."
                      />
                    </div>
                    
                    {/* Live Preview */}
                    <div className="flex flex-col ">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">Live Preview</span>
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                          <span className="text-xs text-gray-500">Auto-updating</span>
                        </div>
                      </div>
                      <div className="flex-1 border border-gray-300 rounded-lg overflow-hidden bg-white">
                        <div className="bg-gradient-to-br from-gray-50 to-gray-100 p-4 h-[500px] overflow-auto">
                          {formData.htmlBody ? (
                            <div 
                              dangerouslySetInnerHTML={{ __html: formData.htmlBody }}
                              className="w-full"
                            />
                          ) : (
                            <div className="text-center py-12">
                              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <FileText className="w-8 h-8 text-gray-400" />
                              </div>
                              <h3 className="text-lg font-medium text-gray-700 mb-2">No HTML Content</h3>
                              <p className="text-gray-500">Start typing in the editor to see the preview.</p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 mt-6 pt-6 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => {
                    if (showEditModal) {
                      setShowEditModal(false);
                    } else {
                      setShowCreateModal(false);
                    }
                    resetForm();
                  }}
                  className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      {showEditModal ? 'Update Template' : 'Create Template'}
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Modal */}
      {showViewModal && selectedTemplate && (
        <div className="fixed inset-0 z-50 overflow-auto bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-7xl w-full max-h-screen overflow-y-auto transform transition-all">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <div className="flex items-center">
                <div className="bg-blue-100 p-2 rounded-lg mr-3">
                  <Eye className="w-5 h-5 text-blue-600" />
                </div>
                <h2 className="text-xl font-semibold text-gray-900">Template Details</h2>
              </div>
              <button
                onClick={() => {
                  setShowViewModal(false);
                  setSelectedTemplate(null);
                }}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X size={20} className="text-gray-500" />
              </button>
            </div>

            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Template Key</label>
                  <div className="px-3 py-2 bg-gray-50 rounded-lg font-mono text-sm">
                    {selectedTemplate.templateKey}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Template Type</label>
                  <div className="px-3 py-2 bg-gray-50 rounded-lg text-sm">
                    {templateTypes.find(t => t.id === selectedTemplate.templateTypeId)?.title || 'Unknown'}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Title</label>
                  <div className="px-3 py-2 bg-gray-50 rounded-lg text-sm">
                    {selectedTemplate.title}
                  </div>
                </div>

                {selectedTemplate.subject && (
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">Subject</label>
                    <div className="px-3 py-2 bg-gray-50 rounded-lg text-sm">
                      {selectedTemplate.subject}
                    </div>
                  </div>
                )}

                {selectedTemplate.emailType && (
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">Email Type</label>
                    <div className="px-3 py-2 bg-gray-50 rounded-lg text-sm">
                      {selectedTemplate.emailType}
                    </div>
                  </div>
                )}

                {selectedTemplate.htmlBody && (
                  <div className="lg:col-span-3">
                    <label className="block text-xs font-semibold text-gray-700 mb-1">HTML Body</label>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                      {/* HTML Code View */}
                      <div className="flex flex-col h-[500px]">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">HTML Code</span>
                        </div>
                        <div className="flex-1 px-4 py-3 bg-gray-50 rounded-lg overflow-y-auto border border-gray-200">
                          <pre className="text-xs font-mono whitespace-pre-wrap">{selectedTemplate.htmlBody}</pre>
                        </div>
                      </div>
                      
                      {/* Rendered Preview */}
                      <div className="flex flex-col h-[500px]">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">Rendered Preview</span>
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                            <span className="text-xs text-gray-500">Live</span>
                          </div>
                        </div>
                        <div className="flex-1 border border-gray-300 rounded-lg overflow-hidden bg-white">
                          <div className="bg-gradient-to-br from-gray-50 to-gray-100 p-4 h-full overflow-auto">
                            <div 
                              dangerouslySetInnerHTML={{ __html: selectedTemplate.htmlBody }}
                              className="w-full"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-end gap-3 mt-6 pt-6 border-t border-gray-200">
                <button
                  onClick={() => {
                    setShowViewModal(false);
                    setSelectedTemplate(null);
                  }}
                  className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default TemplateManagement;
