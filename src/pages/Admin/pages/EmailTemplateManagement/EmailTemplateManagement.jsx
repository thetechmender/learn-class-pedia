import { useState } from 'react';
import { useEmailTemplates, useEmailTemplateMutations } from '../../../../hooks/useEmailTemplates';
import { useToast } from '../../../../hooks/useToast';
import { Mail, Plus, Edit, Trash2, Eye, Search, ChevronLeft, ChevronRight, X, Save, FileText, Code, Calendar, Hash, CheckCircle, XCircle } from 'lucide-react';

const EmailTemplateManagement = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(100);
  const [searchTerm, setSearchTerm] = useState('');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [formData, setFormData] = useState({
    templateKey: '',
    title: '',
    subject: '',
    htmlBody: '',
    textBody: '',
    dynamicVariables: ''
  });

  const { templates, loading, error, pagination, refetch } = useEmailTemplates(currentPage, pageSize);
  const { createTemplate, updateTemplate, deleteTemplate, loading: mutationLoading } = useEmailTemplateMutations();
  const { toast, showToast } = useToast();

  const handleCreate = async () => {
    try {
      await createTemplate(formData);
      showToast('Email template created successfully!', 'success');
      setIsCreateModalOpen(false);
      setFormData({
        templateKey: '',
        title: '',
        subject: '',
        htmlBody: '',
        textBody: '',
        dynamicVariables: ''
      });
      refetch();
    } catch (err) {
      showToast('Failed to create email template', 'error');
    }
  };

  const handleUpdate = async () => {
    try {
      await updateTemplate(selectedTemplate.id, {
        title: formData.title,
        subject: formData.subject,
        htmlBody: formData.htmlBody,
        textBody: formData.textBody,
        dynamicVariables: formData.dynamicVariables,
        isActive: true
      });
      showToast('Email template updated successfully!', 'success');
      setIsEditModalOpen(false);
      setSelectedTemplate(null);
      setFormData({
        templateKey: '',
        title: '',
        subject: '',
        htmlBody: '',
        textBody: '',
        dynamicVariables: ''
      });
      refetch();
    } catch (err) {
      showToast('Failed to update email template', 'error');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this email template?')) {
      try {
        await deleteTemplate(id);
        showToast('Email template deleted successfully!', 'success');
        refetch();
      } catch (err) {
        showToast('Failed to delete email template', 'error');
      }
    }
  };

  const resetForm = () => {
    setFormData({
      templateKey: '',
      title: '',
      subject: '',
      htmlBody: '',
      textBody: '',
      dynamicVariables: ''
    });
    setSelectedTemplate(null);
  };

  const openCreateModal = () => {
    resetForm();
    setIsCreateModalOpen(true);
  };

  const closeCreateModal = () => {
    resetForm();
    setIsCreateModalOpen(false);
  };

  const openEditModal = (template) => {
    setSelectedTemplate(template);
    setFormData({
      templateKey: template.templateKey,
      title: template.title,
      subject: template.subject,
      htmlBody: template.htmlBody,
      textBody: template.textBody,
      dynamicVariables: template.dynamicVariables || ''
    });
    setIsEditModalOpen(true);
  };

  const openViewModal = (template) => {
    setSelectedTemplate(template);
    setIsViewModalOpen(true);
  };

  const filteredTemplates = templates.filter(template =>
    template.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    template.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
    template.templateKey.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.ceil(pagination.totalCount / pageSize);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* Toast Notification */}
      {toast.show && (
        <div className={`fixed top-4 right-4 z-50 px-6 py-3 rounded-lg shadow-lg transform transition-all duration-300 ${
          toast.type === 'success' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
        }`}>
          <div className="flex items-center space-x-2">
            {toast.type === 'success' ? (
              <CheckCircle className="w-5 h-5" />
            ) : (
              <XCircle className="w-5 h-5" />
            )}
            <span className="font-medium">{toast.message}</span>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="bg-white/80 backdrop-blur-md shadow-sm border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            <div>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
                  <Mail className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">Email Template Management</h1>
                  <p className="text-sm text-gray-600 mt-1">Create and manage email templates for user communications</p>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={openCreateModal}
                className="flex items-center px-6 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 font-medium shadow-lg hover:shadow-xl"
              >
                <Plus className="w-4 h-4 mr-2" />
                Create Template
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="relative max-w-2xl mx-auto">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search templates by title, subject, or key..."
            className="w-full pl-12 pr-4 py-4 border border-gray-200 rounded-2xl bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-gray-900 placeholder-gray-500"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute inset-y-0 right-0 pr-4 flex items-center"
            >
              <X className="h-5 w-5 text-gray-400 hover:text-gray-600" />
            </button>
          )}
        </div>
        
        {/* Search Results Info */}
        {searchTerm && (
          <div className="mt-4 text-center text-sm text-gray-600">
            Found {filteredTemplates.length} template{filteredTemplates.length !== 1 ? 's' : ''} matching "{searchTerm}"
          </div>
        )}
      </div>

      {/* Quick Stats */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-600">Total Templates</p>
                <p className="text-2xl font-bold text-gray-900">{pagination.totalCount}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Mail className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-600">Active Page</p>
                <p className="text-2xl font-bold text-gray-900">{currentPage} of {totalPages || 1}</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <FileText className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-600">Search Results</p>
                <p className="text-2xl font-bold text-gray-900">{filteredTemplates.length}</p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <Search className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-600">Page Size</p>
                <p className="text-2xl font-bold text-gray-900">{pageSize}</p>
              </div>
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                <Calendar className="w-6 h-6 text-orange-600" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                  <div className="flex items-center gap-2">
                    <Hash className="w-4 h-4 text-gray-500" />
                    Template Key
                  </div>
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-gray-500" />
                    Title
                  </div>
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                  Subject
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-gray-500" />
                    Created Date
                  </div>
                </th>
                <th className="px-6 py-4 text-right text-xs font-bold text-gray-700 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan="5" className="px-6 py-16 text-center text-gray-500">
                    <div className="flex flex-col items-center gap-4">
                      <div className="w-10 h-10 border-3 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                      <span className="text-lg font-medium">Loading templates...</span>
                      <span className="text-sm text-gray-400">Please wait while we fetch your templates</span>
                    </div>
                  </td>
                </tr>
              ) : error ? (
                <tr>
                  <td colSpan="5" className="px-6 py-16 text-center">
                    <div className="flex flex-col items-center gap-3 text-red-500">
                      <div className="p-3 bg-red-100 rounded-full">
                        <X className="w-8 h-8" />
                      </div>
                      <span className="text-lg font-medium">Error Loading Templates</span>
                      <span className="text-sm text-red-400">{error}</span>
                      <button
                        onClick={() => refetch()}
                        className="mt-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                      >
                        Try Again
                      </button>
                    </div>
                  </td>
                </tr>
              ) : filteredTemplates.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-16 text-center text-gray-500">
                    <div className="flex flex-col items-center gap-4">
                      <div className="p-4 bg-gray-100 rounded-full">
                        <Mail className="w-12 h-12 text-gray-400" />
                      </div>
                      <span className="text-xl font-semibold text-gray-700">No templates found</span>
                      <span className="text-gray-500">
                        {searchTerm 
                          ? `No templates match "${searchTerm}". Try a different search term.`
                          : "Get started by creating your first email template."
                        }
                      </span>
                      {!searchTerm && (
                        <button
                          onClick={openCreateModal}
                          className="mt-2 flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                        >
                          <Plus className="w-4 h-4" />
                          Create Your First Template
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ) : (
                filteredTemplates.map((template, index) => (
                  <tr key={template.id} className={`hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 transition-all duration-200 ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50/30'}`}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-sm">
                        {template.templateKey}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="text-sm font-semibold text-gray-900">{template.title}</span>
                        <span className="text-xs text-gray-500 mt-1">ID: {template.id}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="max-w-xs">
                        <span className="text-sm text-gray-700 truncate block" title={template.subject}>
                          {template.subject}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex flex-col">
                        <span className="text-sm text-gray-600">
                          {new Date(template.createdAt).toLocaleDateString()}
                        </span>
                        <span className="text-xs text-gray-400">
                          {new Date(template.createdAt).toLocaleTimeString()}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end gap-1">
                        <button
                          onClick={() => openViewModal(template)}
                          className="p-2.5 text-gray-600 hover:text-purple-600 hover:bg-purple-50 rounded-xl transition-all duration-200 group"
                          title="View template details"
                        >
                          <Eye className="w-4 h-4 group-hover:scale-110 transition-transform" />
                        </button>
                        <button
                          onClick={() => openEditModal(template)}
                          className="p-2.5 text-gray-600 hover:text-green-600 hover:bg-green-50 rounded-xl transition-all duration-200 group"
                          title="Edit template"
                        >
                          <Edit className="w-4 h-4 group-hover:scale-110 transition-transform" />
                        </button>
                        <button
                          onClick={() => handleDelete(template.id)}
                          className="p-2.5 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all duration-200 group"
                          title="Delete template"
                        >
                          <Trash2 className="w-4 h-4 group-hover:scale-110 transition-transform" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div className="px-6 py-4 border-t border-gray-200 bg-gradient-to-r from-gray-50 to-white flex items-center justify-between">
            <div className="text-sm text-gray-700">
              <span className="font-medium">Showing</span>{' '}
              <span className="font-bold text-blue-600">{((currentPage - 1) * pageSize) + 1}</span>{' '}
              <span className="font-medium">to</span>{' '}
              <span className="font-bold text-blue-600">{Math.min(currentPage * pageSize, pagination.totalCount)}</span>{' '}
              <span className="font-medium">of</span>{' '}
              <span className="font-bold text-blue-600">{pagination.totalCount}</span>{' '}
              <span className="font-medium">results</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-xl text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-white transition-all duration-200 shadow-sm"
              >
                <ChevronLeft className="w-4 h-4" />
                Previous
              </button>
              
              {/* Page Numbers */}
              <div className="flex items-center gap-1">
                {[...Array(Math.min(5, totalPages))].map((_, index) => {
                  let pageNum;
                  if (totalPages <= 5) {
                    pageNum = index + 1;
                  } else if (currentPage <= 3) {
                    pageNum = index + 1;
                  } else if (currentPage >= totalPages - 2) {
                    pageNum = totalPages - 4 + index;
                  } else {
                    pageNum = currentPage - 2 + index;
                  }
                  
                  return (
                    <button
                      key={pageNum}
                      onClick={() => setCurrentPage(pageNum)}
                      className={`w-10 h-10 rounded-lg text-sm font-medium transition-all duration-200 ${
                        currentPage === pageNum
                          ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md'
                          : 'text-gray-700 bg-white border border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
              </div>
              
              <button
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
                className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-xl text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-white transition-all duration-200 shadow-sm"
              >
                Next
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
        </div>
      </div>

      {/* Create Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] shadow-2xl flex flex-col">
            <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-blue-600 to-indigo-600 flex-shrink-0">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-white bg-opacity-20 rounded-lg">
                    <Mail className="w-6 h-6 text-white" />
                  </div>
                  <h2 className="text-xl font-semibold text-white">Create Email Template</h2>
                </div>
                <button
                  onClick={closeCreateModal}
                  className="text-white hover:text-white hover:bg-white hover:bg-opacity-20 p-2 rounded-lg transition-all"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
            <div className="p-6 overflow-y-auto flex-1">
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Template Key <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.templateKey}
                      onChange={(e) => setFormData({ ...formData, templateKey: e.target.value })}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      placeholder="e.g., NEW_COURSE_ENROLLMENT"
                    />
                    <p className="mt-1 text-xs text-gray-500">Unique identifier for the template</p>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Title <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      placeholder="e.g., New Course Enrollment"
                    />
                    <p className="mt-1 text-xs text-gray-500">Display name for the template</p>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Subject <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    placeholder="e.g., Welcome to Your New Course!"
                  />
                  <p className="mt-1 text-xs text-gray-500">Email subject line</p>
                </div>
                
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    <div className="flex items-center gap-2">
                      <Code className="w-4 h-4" />
                      HTML Body <span className="text-red-500">*</span>
                    </div>
                  </label>
                  <textarea
                    value={formData.htmlBody}
                    onChange={(e) => setFormData({ ...formData, htmlBody: e.target.value })}
                    rows={8}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all font-mono text-sm"
                    placeholder="<h1>Hi {StudentName},</h1><p>You have successfully enrolled in <strong>{CourseName}</strong>.</p>"
                  />
                  <p className="mt-1 text-xs text-gray-500">HTML content of the email. Use {'{{variable}}'} for dynamic content.</p>
                </div>
                
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4" />
                      Text Body <span className="text-gray-400">(Optional)</span>
                    </div>
                  </label>
                  <textarea
                    value={formData.textBody}
                    onChange={(e) => setFormData({ ...formData, textBody: e.target.value })}
                    rows={4}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    placeholder="Plain text version of the email (optional)"
                  />
                  <p className="mt-1 text-xs text-gray-500">Plain text version for email clients that don't support HTML</p>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    <div className="flex items-center gap-2">
                      <Hash className="w-4 h-4" />
                      Dynamic Variables <span className="text-gray-400">(Optional)</span>
                    </div>
                  </label>
                  <textarea
                    value={formData.dynamicVariables}
                    onChange={(e) => setFormData({ ...formData, dynamicVariables: e.target.value })}
                    rows={3}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all font-mono text-sm"
                    placeholder='[&#34;StudentName&#34;, &#34;CourseName&#34;, &#34;EnrollmentDate&#34;]'
                  />
                  <p className="mt-1 text-xs text-gray-500">Enter dynamic variables as a JSON array of strings. These variables can be used in templates as {'{{variable}}'}</p>
                </div>
              </div>
            </div>
            <div className="p-6 border-t border-gray-200 bg-gray-50 flex justify-end gap-3 flex-shrink-0">
              <button
                onClick={closeCreateModal}
                className="px-5 py-2.5 border border-gray-300 rounded-lg text-gray-700 bg-white hover:bg-gray-50 font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleCreate}
                disabled={mutationLoading || !formData.templateKey || !formData.title || !formData.subject || !formData.htmlBody}
                className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-all"
              >
                <Save className="w-4 h-4" />
                {mutationLoading ? 'Creating...' : 'Create Template'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] shadow-2xl flex flex-col">
            <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-green-600 to-emerald-600 flex-shrink-0">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-white bg-opacity-20 rounded-lg">
                    <Edit className="w-6 h-6 text-white" />
                  </div>
                  <h2 className="text-xl font-semibold text-white">Edit Email Template</h2>
                </div>
                <button
                  onClick={() => setIsEditModalOpen(false)}
                  className="text-white hover:text-white hover:bg-white hover:bg-opacity-20 p-2 rounded-lg transition-all"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
            <div className="p-6 overflow-y-auto flex-1">
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Template Key
                    </label>
                    <input
                      type="text"
                      value={formData.templateKey}
                      
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    />
                    <p className="mt-1 text-xs text-gray-500">Template key cannot be modified</p>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Title <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                    />
                    <p className="mt-1 text-xs text-gray-500">Display name for the template</p>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Subject <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                  />
                  <p className="mt-1 text-xs text-gray-500">Email subject line</p>
                </div>
                
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    <div className="flex items-center gap-2">
                      <Code className="w-4 h-4" />
                      HTML Body <span className="text-red-500">*</span>
                    </div>
                  </label>
                  <textarea
                    value={formData.htmlBody}
                    onChange={(e) => setFormData({ ...formData, htmlBody: e.target.value })}
                    rows={8}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all font-mono text-sm"
                  />
                  <p className="mt-1 text-xs text-gray-500">HTML content of the email. Use {'{{variable}}'} for dynamic content.</p>
                </div>
                
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4" />
                      Text Body <span className="text-gray-400">(Optional)</span>
                    </div>
                  </label>
                  <textarea
                    value={formData.textBody}
                    onChange={(e) => setFormData({ ...formData, textBody: e.target.value })}
                    rows={4}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                    placeholder="Plain text version of the email (optional)"
                  />
                  <p className="mt-1 text-xs text-gray-500">Plain text version for email clients that don't support HTML</p>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    <div className="flex items-center gap-2">
                      <Hash className="w-4 h-4" />
                      Dynamic Variables <span className="text-gray-400">(Optional)</span>
                    </div>
                  </label>
                  <textarea
                    value={formData.dynamicVariables}
                    onChange={(e) => setFormData({ ...formData, dynamicVariables: e.target.value })}
                    rows={3}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all font-mono text-sm"
                    placeholder='[&#34;StudentName&#34;, &#34;CourseName&#34;, &#34;EnrollmentDate&#34;]'
                  />
                  <p className="mt-1 text-xs text-gray-500">Enter dynamic variables as a JSON array of strings. These variables can be used in templates as {'{{variable}}'}</p>
                </div>
              </div>
            </div>
            <div className="p-6 border-t border-gray-200 bg-gray-50 flex justify-end gap-3 flex-shrink-0">
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="px-5 py-2.5 border border-gray-300 rounded-lg text-gray-700 bg-white hover:bg-gray-50 font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleUpdate}
                disabled={mutationLoading || !formData.title || !formData.subject || !formData.htmlBody}
                className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg hover:from-green-700 hover:to-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-all"
              >
                <Save className="w-4 h-4" />
                {mutationLoading ? 'Updating...' : 'Update Template'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* View Modal */}
      {isViewModalOpen && selectedTemplate && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden shadow-2xl">
            <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-purple-600 to-pink-600">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-white bg-opacity-20 rounded-lg">
                    <Eye className="w-6 h-6 text-white" />
                  </div>
                  <h2 className="text-xl font-semibold text-white">Email Template Details</h2>
                </div>
                <button
                  onClick={() => setIsViewModalOpen(false)}
                  className="text-white hover:text-white hover:bg-white hover:bg-opacity-20 p-2 rounded-lg transition-all"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                      <Hash className="w-4 h-4" />
                      Template Key
                    </h3>
                    <div className="bg-white px-3 py-2 rounded border border-gray-200">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                        {selectedTemplate.templateKey}
                      </span>
                    </div>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                      <FileText className="w-4 h-4" />
                      Title
                    </h3>
                    <div className="bg-white px-3 py-2 rounded border border-gray-200">
                      <p className="text-gray-900 font-medium">{selectedTemplate.title}</p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="text-sm font-semibold text-gray-700 mb-2">Subject</h3>
                  <div className="bg-white px-3 py-2 rounded border border-gray-200">
                    <p className="text-gray-900">{selectedTemplate.subject}</p>
                  </div>
                </div>
                
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                    <Code className="w-4 h-4" />
                    HTML Body
                  </h3>
                  <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                    <div className="max-h-64 overflow-y-auto">
                      <pre className="p-4 text-sm text-gray-800 whitespace-pre-wrap font-mono bg-gray-50">
                        {selectedTemplate.htmlBody}
                      </pre>
                    </div>
                  </div>
                </div>
                
                {selectedTemplate.textBody && (
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                      <FileText className="w-4 h-4" />
                      Text Body
                    </h3>
                    <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                      <div className="max-h-32 overflow-y-auto">
                        <pre className="p-4 text-sm text-gray-800 whitespace-pre-wrap">
                          {selectedTemplate.textBody}
                        </pre>
                      </div>
                    </div>
                  </div>
                )}
                
                {selectedTemplate.dynamicVariables && (
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                      <Hash className="w-4 h-4" />
                      Dynamic Variables
                    </h3>
                    <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                      <div className="max-h-32 overflow-y-auto">
                        <pre className="p-4 text-sm text-gray-800 whitespace-pre-wrap font-mono bg-gray-50">
                          {selectedTemplate.dynamicVariables}
                        </pre>
                      </div>
                    </div>
                  </div>
                )}
                
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    Created Date
                  </h3>
                  <div className="bg-white px-3 py-2 rounded border border-gray-200">
                    <p className="text-gray-900">{new Date(selectedTemplate.createdAt).toLocaleString()}</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="p-6 border-t border-gray-200 bg-gray-50 flex justify-end">
              <button
                onClick={() => setIsViewModalOpen(false)}
                className="px-5 py-2.5 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 font-medium transition-all"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmailTemplateManagement;
