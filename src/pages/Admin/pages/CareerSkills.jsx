import React, { useState, useEffect, useCallback } from 'react';
import { useToast } from '../../../hooks/useToast';
import Modal from '../../../components/Modal';
import { 
  Plus, 
  Edit2, 
  Trash2, 
  Search,
  Eye,
  AlertCircle,
  CheckCircle,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { API_CONFIG, ENDPOINTS } from '../../../config/api';

const CareerSkills = () => {
  const { toast, showToast } = useToast();
  
  const showSuccess = (message) => showToast(message, 'success');
  const showError = (message) => showToast(message, 'error');

  // State management
  const [careerSkills, setCareerSkills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

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

  // API helper functions
  const getApiUrl = () => API_CONFIG.BASE_URL_Local;
  const getAuthHeaders = () => {
    const token = localStorage.getItem('adminToken');
    return {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` })
    };
  };

  // Fetch all career skills
  const fetchCareerSkills = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch(`${getApiUrl()}${ENDPOINTS.CAREER_SKILLS}`, {
        headers: getAuthHeaders()
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      setCareerSkills(Array.isArray(data) ? data : []);
      setError(null);
    } catch (err) {
      setError('Failed to fetch career skills');
      showError('Failed to fetch career skills');
    } finally {
      setLoading(false);
    }
  }, []);

  // Create career skill
  const createCareerSkill = async (careerSkillData) => {
    try {
      const response = await fetch(`${getApiUrl()}${ENDPOINTS.CAREER_SKILLS}`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(careerSkillData)
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }
      
      // Check if response has content before parsing JSON
      const text = await response.text();
      return text ? JSON.parse(text) : {};
    } catch (err) {
      throw err;
    }
  };

  // Update career skill
  const updateCareerSkill = async (id, careerSkillData) => {
    try {
      const response = await fetch(`${getApiUrl()}${ENDPOINTS.CAREER_SKILL_BY_ID(id)}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(careerSkillData)
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }
      
      // Check if response has content before parsing JSON
      const text = await response.text();
      return text ? JSON.parse(text) : {};
    } catch (err) {
      throw err;
    }
  };

  // Delete career skill
  const deleteCareerSkill = async (id) => {
    try {
      const response = await fetch(`${getApiUrl()}${ENDPOINTS.CAREER_SKILL_BY_ID(id)}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }
      
      return true;
    } catch (err) {
      throw err;
    }
  };

  // Get career skill by ID
  const getCareerSkillById = async (id) => {
    try {
      const response = await fetch(`${getApiUrl()}${ENDPOINTS.CAREER_SKILL_BY_ID(id)}`, {
        headers: getAuthHeaders()
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }
      
      // Check if response has content before parsing JSON
      const text = await response.text();
      return text ? JSON.parse(text) : {};
    } catch (err) {
      throw err;
    }
  };

  useEffect(() => {
    fetchCareerSkills();
  }, [fetchCareerSkills]);

  // Filter career skills based on search
  const filteredCareerSkills = careerSkills.filter(skill => 
    skill.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    skill.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Pagination calculations
  const totalPages = Math.ceil(filteredCareerSkills.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedCareerSkills = filteredCareerSkills.slice(startIndex, endIndex);

  // Reset to page 1 when search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  // Input handlers
  const handleInputChange = useCallback((e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  }, []);

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
      const errorMessage = err.message || 'An unexpected error occurred';
      setModalError(errorMessage);
      showError(errorMessage);
    }
  }, [editingCareerSkill, formData, resetForm, fetchCareerSkills, showSuccess, showError]);

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
      const errorMessage = err.message || 'Failed to delete career skill';
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

  return (
    <div className="p-6">
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

      <h1 className="text-2xl font-bold mb-2">Career Skills Management</h1>
      <p className="text-gray-600 mb-4">Manage career skills and their descriptions</p>

      {/* Error message */}
      {error && <div className="mb-4 p-4 bg-red-50 border border-red-200 text-red-600 rounded">{error}</div>}

      {/* Controls */}
      <div className="mb-6 flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
        <div className="flex-1 w-full">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
            <input
              type="text"
              placeholder="Search career skills..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>
        <button
          onClick={openCreateModal}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          <Plus size={20} className="mr-2"/> Add Career Skill
        </button>
      </div>

      {/* Career Skills table */}
      <div className="bg-white border rounded-lg overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-3 text-gray-600">Loading career skills...</span>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Title</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Slug</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Description</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {paginatedCareerSkills.length === 0 ? (
                  <tr>
                    <td colSpan="4" className="px-4 py-8 text-center text-gray-500">
                      {searchTerm ? 'No career skills found matching your search.' : 'No career skills found.'}
                    </td>
                  </tr>
                ) : (
                  paginatedCareerSkills.map((skill) => (
                    <tr key={skill.id} className="border-b hover:bg-gray-50">
                      <td className="px-4 py-3 font-medium">{skill.title}</td>
                      <td className="px-4 py-3 text-sm text-gray-600 font-mono">{skill.slug}</td>
                      <td className="px-4 py-3 text-sm text-gray-600 max-w-xs truncate">{skill.description || 'No description'}</td>
                      <td className="px-4 py-3 flex space-x-2">
                        <button 
                          onClick={() => handleViewDetails(skill)} 
                          className="text-green-600 hover:bg-green-50 p-1 rounded"
                        >
                          <Eye size={16} />
                        </button>
                        <button 
                          onClick={() => handleEdit(skill)} 
                          className="text-blue-600 hover:bg-blue-50 p-1 rounded"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button 
                          onClick={() => handleDelete(skill.id)} 
                          className="text-red-600 hover:bg-red-50 p-1 rounded"
                        >
                          <Trash2 size={16} />
                        </button>
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
        <div className="mt-4 flex items-center justify-between">
          <div className="text-sm text-gray-700">
            Showing {startIndex + 1} to {Math.min(endIndex, filteredCareerSkills.length)} of{' '}
            {filteredCareerSkills.length} results
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="flex items-center px-3 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="w-4 h-4 mr-1" />
              Previous
            </button>
            
            <div className="flex items-center space-x-1">
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let pageNum;
                if (totalPages <= 5) {
                  pageNum = i + 1;
                } else if (currentPage <= 3) {
                  pageNum = i + 1;
                } else if (currentPage >= totalPages - 2) {
                  pageNum = totalPages - 4 + i;
                } else {
                  pageNum = currentPage - 2 + i;
                }
                
                return (
                  <button
                    key={pageNum}
                    onClick={() => setCurrentPage(pageNum)}
                    className={`px-3 py-2 text-sm border rounded-md ${
                      currentPage === pageNum
                        ? 'bg-blue-600 text-white border-blue-600'
                        : 'border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}
            </div>
            
            <button
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="flex items-center px-3 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
              <ChevronRight className="w-4 h-4 ml-1" />
            </button>
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
              <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter career skill title"
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
                placeholder="Enter career skill description"
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
              <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter career skill title"
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
                placeholder="Enter career skill description"
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
              <h3 className="text-sm font-medium text-gray-500">Title</h3>
              <p className="mt-1 text-sm text-gray-900">{selectedCareerSkill.title}</p>
            </div>
            
            <div>
              <h3 className="text-sm font-medium text-gray-500">Slug</h3>
              <p className="mt-1 text-sm text-gray-900 font-mono">{selectedCareerSkill.slug}</p>
            </div>
            
            <div>
              <h3 className="text-sm font-medium text-gray-500">Description</h3>
              <p className="mt-1 text-sm text-gray-900">{selectedCareerSkill.description || 'No description'}</p>
            </div>
            
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

export default CareerSkills;
