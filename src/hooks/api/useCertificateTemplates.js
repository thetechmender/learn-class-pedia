import { useState, useEffect } from 'react';
import ApiService from '../../services/ApiService';

export const useCertificateTemplates = (page = 1, pageSize = 100) => {
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    page: 1,
    pageSize: 100,
    totalCount: 0,
  });

  const fetchTemplates = async (pageNum = page, pageSizeNum = pageSize) => {
    setLoading(true);
    setError(null);
    try {
      const response = await ApiService.getCertificateTemplates(pageNum, pageSizeNum);
      setTemplates(response.items || []);
      setPagination({
        page: response.page || pageNum,
        pageSize: response.pageSize || pageSizeNum,
        totalCount: response.totalCount || 0,
      });
    } catch (err) {
      setError(err.message);
      console.error('Error fetching certificate templates:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTemplates();
  }, [page, pageSize]);

  const refetch = () => {
    fetchTemplates();
  };

  return {
    templates,
    loading,
    error,
    pagination,
    refetch,
    fetchTemplates,
  };
};

export const useCertificateTemplate = (id) => {
  const [template, setTemplate] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchTemplate = async () => {
    if (!id) return;
    
    setLoading(true);
    setError(null);
    try {
      const response = await ApiService.getCertificateTemplateById(id);
      setTemplate(response);
    } catch (err) {
      setError(err.message);
      console.error('Error fetching certificate template:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTemplate();
  }, [id]);

  return {
    template,
    loading,
    error,
    refetch: fetchTemplate,
  };
};

export const useCertificateTemplateMutations = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const createTemplate = async (templateData) => {
    setLoading(true);
    setError(null);
    try {
      const response = await ApiService.createCertificateTemplate(templateData);
      return response;
    } catch (err) {
      setError(err.message);
      console.error('Error creating certificate template:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateTemplate = async (id, templateData) => {
    setLoading(true);
    setError(null);
    try {
      const response = await ApiService.updateCertificateTemplate(id, templateData);
      return response;
    } catch (err) {
      setError(err.message);
      console.error('Error updating certificate template:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const deleteTemplate = async (id) => {
    setLoading(true);
    setError(null);
    try {
      await ApiService.deleteCertificateTemplate(id);
      return true;
    } catch (err) {
      setError(err.message);
      console.error('Error deleting certificate template:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    error,
    createTemplate,
    updateTemplate,
    deleteTemplate,
  };
};
