import { useState, useEffect, useCallback } from 'react';
import ApiService from '../../services/ApiService';

export const useTemplateManagement = () => {
  const [templates, setTemplates] = useState([]);
  const [templateTypes, setTemplateTypes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    page: 1,
    pageSize: 10,
    totalCount: 0,
    totalPages: 0,
  });

  // Fetch templates with pagination and filters
  const fetchTemplates = useCallback(async (params = {}) => {
    setLoading(true);
    setError(null);
    try {
      const queryParams = {
        Page: params.page || pagination.page,
        PageSize: params.pageSize || pagination.pageSize,
        ...(params.templateTypeId && { TemplateTypeId: params.templateTypeId }),
        ...(params.templateKey && { TemplateKey: params.templateKey }),
        ...(params.title && { Title: params.title }),
        ...(params.isActive !== undefined && { IsActive: params.isActive }),
      };

      const response = await ApiService.getTemplates(queryParams);
      
      // Handle the actual API response structure
      let templateData = [];
      let paginationData = {};
      
      if (response && response.success && response.data) {
        // Response has success wrapper with templates property
        templateData = response.data.templates || [];
        paginationData = {
          currentPage: response.data.page || params.page || 1,
          pageSize: response.data.pageSize || params.pageSize || 10,
          totalCount: response.data.totalCount || 0,
          totalPages: response.data.totalPages || 1,
        };
      } else if (response && Array.isArray(response)) {
        // Response is directly an array
        templateData = response;
      } else if (response && response.templates && Array.isArray(response.templates)) {
        // Response has templates property
        templateData = response.templates;
        paginationData = {
          currentPage: response.page || params.page || 1,
          pageSize: response.pageSize || params.pageSize || 10,
          totalCount: response.totalCount || 0,
          totalPages: response.totalPages || 1,
        };
      } else {
        // Fallback: try to use response directly
        templateData = Array.isArray(response) ? response : [];
      }
      
      setTemplates(templateData);
      setPagination(prev => ({
        ...prev,
        ...paginationData,
      }));
    } catch (err) {
      setError(err.message || 'Failed to fetch templates');
      setTemplates([]);
    } finally {
      setLoading(false);
    }
  }, [pagination.page, pagination.pageSize]);

  // Fetch template types
  const fetchTemplateTypes = useCallback(async () => {
    try {
      const response = await ApiService.getTemplateTypes();
      
      // Handle different response structures
      let typesData = [];
      if (response && response.success && response.data) {
        typesData = Array.isArray(response.data) ? response.data : [];
      } else if (response && Array.isArray(response)) {
        typesData = response;
      } else {
        typesData = [];
      }
      
      setTemplateTypes(typesData);
    } catch (err) {
      console.error('Failed to fetch template types:', err);
      setTemplateTypes([]);
    }
  }, []);

  // Create template
  const createTemplate = useCallback(async (templateData) => {
    setLoading(true);
    setError(null);
    try {
      const response = await ApiService.createTemplate(templateData);
      await fetchTemplates(); // Refresh the list
      return response;
    } catch (err) {
      setError(err.message || 'Failed to create template');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [fetchTemplates]);

  // Update template
  const updateTemplate = useCallback(async (id, templateData) => {
    setLoading(true);
    setError(null);
    try {
      const response = await ApiService.updateTemplate(id, templateData);
      await fetchTemplates(); // Refresh the list
      return response;
    } catch (err) {
      setError(err.message || 'Failed to update template');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [fetchTemplates]);

  // Delete template
  const deleteTemplate = useCallback(async (id) => {
    setLoading(true);
    setError(null);
    try {
      const response = await ApiService.deleteTemplate(id);
      await fetchTemplates(); // Refresh the list
      return response;
    } catch (err) {
      setError(err.message || 'Failed to delete template');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [fetchTemplates]);

  // Get template by ID
  const getTemplateById = useCallback(async (id) => {
    setLoading(true);
    setError(null);
    try {
      const response = await ApiService.getTemplateById(id);
      
      // Extract template data from response
      if (response && response.success && response.data) {
        return response.data;
      } else if (response && response.data) {
        return response.data;
      } else {
        return response;
      }
    } catch (err) {
      setError(err.message || 'Failed to fetch template');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Handle page change
  const handlePageChange = useCallback((newPage) => {
    setPagination(prev => ({ ...prev, page: newPage }));
  }, []);

  // Handle page size change
  const handlePageSizeChange = useCallback((newPageSize) => {
    setPagination(prev => ({ ...prev, pageSize: newPageSize, page: 1 }));
  }, []);

  // Initial load
  useEffect(() => {
    fetchTemplates();
    fetchTemplateTypes();
  }, [fetchTemplates, fetchTemplateTypes]);

  return {
    // Data
    templates,
    templateTypes,
    loading,
    error,
    pagination,

    // Actions
    fetchTemplates,
    fetchTemplateTypes,
    createTemplate,
    updateTemplate,
    deleteTemplate,
    getTemplateById,
    handlePageChange,
    handlePageSizeChange,
  };
};
