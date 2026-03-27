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

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTemplateType, setSelectedTemplateType] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [formData, setFormData] = useState({
    templateKey: '',
    title: '',
    subject: '',
    htmlBody: '',
    textBody: '',
    dynamicVariables: '',
    templateTypeId: 0,
    isActive: true,
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
      if (showEditModal && selectedTemplate) {
        await updateTemplate(selectedTemplate.id, formData);
        showSuccess('Template updated successfully!');
        setShowEditModal(false);
      } else {
        await createTemplate(formData);
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
        textBody: fullTemplate.textBody || '',
        dynamicVariables: fullTemplate.dynamicVariables || '',
        templateTypeId: fullTemplate.templateTypeId || 0,
        isActive: fullTemplate.isActive !== undefined ? fullTemplate.isActive : true,
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
      textBody: '',
      dynamicVariables: '',
      templateTypeId: 0,
      isActive: true,
    });
    setSelectedTemplate(null);
  }, []);

  // Handle search
  const handleSearch = useCallback((e) => {
    setSearchTerm(e.target.value);
  }, []);

  // Apply filters
  const applyFilters = useCallback(() => {
    const params = {
      page: 1,
      pageSize: pagination.pageSize,
    };
    
    if (selectedTemplateType) {
      params.templateTypeId = parseInt(selectedTemplateType);
    }
    
    if (selectedStatus) {
      params.isActive = selectedStatus === 'true';
    }
    
    if (searchTerm) {
      params.title = searchTerm;
    }
    
    fetchTemplates(params);
  }, [selectedTemplateType, selectedStatus, searchTerm, pagination.pageSize, fetchTemplates]);

  // Filter templates based on search
  const filteredTemplates = templates.filter(template =>
    template.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    template.templateKey?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    template.subject?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Prepare template types for dropdown
  const templateTypesForDropdown = [
    { id: '', name: 'All Types' },
    ...templateTypes.map(type => ({ 
      id: type.id.toString(), 
      name: type.title || type.name || type.typeName || type.label || 'Unknown Type'
    }))
  ];

  // Status options for dropdown
  const statusOptions = [
    { id: '', name: 'All Status' },
    { id: 'true', name: 'Active' },
    { id: 'false', name: 'Inactive' }
  ];

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
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center">
                <FileText className="w-8 h-8 text-blue-600 mr-3" />
                Template Management
              </h1>
              <p className="text-gray-600 mt-2">Manage and organize all templates in one place</p>
            </div>
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

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
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
                <p className="text-sm font-medium text-gray-600">Active Templates</p>
                <p className="text-3xl font-bold text-green-600 mt-2">
                  {templates.filter(t => t.isActive).length}
                </p>
                <p className="text-xs text-gray-500 mt-1">Currently active</p>
              </div>
              <div className="bg-green-100 p-3 rounded-lg">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Inactive Templates</p>
                <p className="text-3xl font-bold text-gray-500 mt-2">
                  {templates.filter(t => !t.isActive).length}
                </p>
                <p className="text-xs text-gray-500 mt-1">Disabled</p>
              </div>
              <div className="bg-gray-100 p-3 rounded-lg">
                <XCircle className="w-6 h-6 text-gray-500" />
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

        {/* Search and Filter Section */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search templates by title, key, or subject..."
                value={searchTerm}
                onChange={handleSearch}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            
            <div className="flex gap-3">
              <GenericDropdown
                items={templateTypesForDropdown}
                value={selectedTemplateType}
                onChange={setSelectedTemplateType}
                placeholder="Select Type"
                className="min-w-[150px]"
              />
              
              <GenericDropdown
                items={statusOptions}
                value={selectedStatus}
                onChange={setSelectedStatus}
                placeholder="Select Status"
                className="min-w-[150px]"
              />
              
              <button
                onClick={applyFilters}
                className="flex items-center px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Filter className="w-4 h-4 mr-2" />
                Filter
              </button>
            </div>
            
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <span>{filteredTemplates.length} of {templates.length} templates</span>
            </div>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="mb-8 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center">
            <XCircle className="w-5 h-5 text-red-600 mr-2" />
            <span className="text-red-700">{error}</span>
          </div>
        )}

        {/* Templates Grid */}
        {filteredTemplates.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
            <div className="bg-gray-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
              <FileText className="w-10 h-10 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No templates found</h3>
            <p className="text-gray-600 mb-6">
              {searchTerm || selectedTemplateType || selectedStatus ? 'Try adjusting your filters' : 'Get started by creating your first template'}
            </p>
            <button
              onClick={() => {
                resetForm();
                setShowCreateModal(true);
              }}
              className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="w-5 h-5 mr-2" />
              Create Template
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredTemplates.map((template) => (
              <div
                key={template.id}
                className="bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-lg transition-all duration-200 overflow-hidden group"
              >
                {/* Template Header */}
                <div className="h-24 relative flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-50">
                  <div className="text-center">
                    <div className="w-16 h-16 rounded-full bg-blue-500 flex items-center justify-center mx-auto mb-2 shadow-lg">
                      {getTemplateTypeIcon(templateTypes.find(t => t.id === template.templateTypeId)?.title)}
                    </div>
                    <div className={`inline-flex items-center px-2 py-1 text-xs rounded-full font-medium border ${getTemplateTypeColor(templateTypes.find(t => t.id === template.templateTypeId)?.title)}`}>
                      {templateTypes.find(t => t.id === template.templateTypeId)?.title || 'Unknown'}
                    </div>
                  </div>
                </div>

                {/* Template Content */}
                <div className="p-6">
                  <h3 className="font-semibold text-gray-900 text-lg mb-2 truncate">{template.title}</h3>
                  <div className="flex items-center gap-2 mb-3">
                    <Hash className="w-4 h-4 text-gray-400" />
                    <span className="text-sm text-gray-600 font-mono truncate">{template.templateKey}</span>
                  </div>
                  
                  {template.subject && (
                    <div className="flex items-center gap-2 mb-3">
                      <Mail className="w-4 h-4 text-gray-400" />
                      <span className="text-sm text-gray-600 truncate">{template.subject}</span>
                    </div>
                  )}
                  
                  <div className="flex items-center gap-2 mb-4">
                    <span className={`inline-flex items-center px-2 py-1 text-xs rounded-full font-medium ${
                      template.isActive
                        ? 'bg-green-100 text-green-800'
                        : 'bg-gray-100 text-gray-600'
                    }`}>
                      {template.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="inline-flex items-center px-3 py-2 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-700 rounded-lg border border-gray-200 dark:border-gray-600 shadow-sm">
                        <div className="w-6 h-6 rounded-full bg-blue-500 dark:bg-blue-600 flex items-center justify-center mr-2">
                          <span className="text-white text-xs font-bold">ID</span>
                        </div>
                        <span className="text-sm font-semibold text-gray-900 dark:text-white">{template.id}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleView(template)}
                        className="p-2 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
                        title="View Template"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleEdit(template)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="Edit Template"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(template)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
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
                  {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                    let pageNum;
                    if (pagination.totalPages <= 5) {
                      pageNum = i + 1;
                    } else if (pagination.page <= 3) {
                      pageNum = i + 1;
                    } else if (pagination.page >= pagination.totalPages - 2) {
                      pageNum = pagination.totalPages - 4 + i;
                    } else {
                      pageNum = pagination.page - 2 + i;
                    }
                    
                    return (
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
                    );
                  })}

                  {/* Last Page */}
                  {pagination.page < pagination.totalPages - 2 && (
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
          <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-screen overflow-y-auto transform transition-all">
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

            <form onSubmit={handleSubmit} className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Template Key <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.templateKey}
                    onChange={(e) => setFormData(prev => ({ ...prev, templateKey: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors font-mono"
                    placeholder="e.g., welcome_email"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Template Type <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.templateTypeId}
                    onChange={(e) => setFormData(prev => ({ ...prev, templateTypeId: parseInt(e.target.value) }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
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

                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Title <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                    placeholder="Enter template title"
                    required
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Subject
                  </label>
                  <input
                    type="text"
                    value={formData.subject}
                    onChange={(e) => setFormData(prev => ({ ...prev, subject: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                    placeholder="Enter email subject (for email templates)"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    HTML Body
                  </label>
                  <textarea
                    value={formData.htmlBody}
                    onChange={(e) => setFormData(prev => ({ ...prev, htmlBody: e.target.value }))}
                    rows={6}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors resize-none font-mono text-sm"
                    placeholder="Enter HTML content..."
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Text Body
                  </label>
                  <textarea
                    value={formData.textBody}
                    onChange={(e) => setFormData(prev => ({ ...prev, textBody: e.target.value }))}
                    rows={4}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors resize-none font-mono text-sm"
                    placeholder="Enter plain text content..."
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Dynamic Variables
                  </label>
                  <input
                    type="text"
                    value={formData.dynamicVariables}
                    onChange={(e) => setFormData(prev => ({ ...prev, dynamicVariables: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors font-mono"
                    placeholder="e.g., {{name}}, {{email}}, {{date}}"
                  />
                </div>

                <div className="md:col-span-2">
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="isActive"
                        checked={formData.isActive}
                        onChange={(e) => setFormData(prev => ({ ...prev, isActive: e.target.checked }))}
                        className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      />
                      <label htmlFor="isActive" className="ml-3 text-sm font-medium text-gray-700">
                        Active Template
                      </label>
                    </div>
                    <span className="text-xs text-gray-500">
                      {formData.isActive ? 'Template will be active' : 'Template will be inactive'}
                    </span>
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
          <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-screen overflow-y-auto transform transition-all">
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
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Template Key</label>
                  <div className="px-4 py-3 bg-gray-50 rounded-lg font-mono text-sm">
                    {selectedTemplate.templateKey}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Template Type</label>
                  <div className="px-4 py-3 bg-gray-50 rounded-lg">
                    {templateTypes.find(t => t.id === selectedTemplate.templateTypeId)?.title || 'Unknown'}
                  </div>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Title</label>
                  <div className="px-4 py-3 bg-gray-50 rounded-lg">
                    {selectedTemplate.title}
                  </div>
                </div>

                {selectedTemplate.subject && (
                  <div className="md:col-span-2">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Subject</label>
                    <div className="px-4 py-3 bg-gray-50 rounded-lg">
                      {selectedTemplate.subject}
                    </div>
                  </div>
                )}

                {selectedTemplate.dynamicVariables && (
                  <div className="md:col-span-2">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Dynamic Variables</label>
                    <div className="px-4 py-3 bg-gray-50 rounded-lg font-mono text-sm">
                      {selectedTemplate.dynamicVariables}
                    </div>
                  </div>
                )}

                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Status</label>
                  <div className="px-4 py-3 bg-gray-50 rounded-lg">
                    <span className={`inline-flex items-center px-2 py-1 text-xs rounded-full font-medium ${
                      selectedTemplate.isActive
                        ? 'bg-green-100 text-green-800'
                        : 'bg-gray-100 text-gray-600'
                    }`}>
                      {selectedTemplate.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                </div>

                {selectedTemplate.htmlBody && (
                  <div className="md:col-span-2">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">HTML Body</label>
                    <div className="px-4 py-3 bg-gray-50 rounded-lg max-h-64 overflow-y-auto">
                      <pre className="text-xs font-mono whitespace-pre-wrap">{selectedTemplate.htmlBody}</pre>
                    </div>
                  </div>
                )}

                {selectedTemplate.textBody && (
                  <div className="md:col-span-2">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Text Body</label>
                    <div className="px-4 py-3 bg-gray-50 rounded-lg max-h-64 overflow-y-auto">
                      <pre className="text-xs font-mono whitespace-pre-wrap">{selectedTemplate.textBody}</pre>
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
