import React, { useState, useCallback, useEffect } from 'react';
import { useToast } from '../../../../hooks/useToast';
import { adminApiService } from '../../../../services/AdminApi';
import {
  Search,
  RefreshCw,
  Plus,
  Edit2,
  Trash2,
  CheckCircle,
  AlertCircle,
  Percent,
  Save,
  X
} from 'lucide-react';
import AdminPageLayout from '../../../../components/AdminPageLayout';

const DiscountRates = () => {
  const { toast, showToast } = useToast();
  
  // Component state
  const [discountRates, setDiscountRates] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingDiscountRate, setEditingDiscountRate] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    discountPercent: 0,
    isActive: true
  });
  const [submitting, setSubmitting] = useState(false);
  const [pagination, setPagination] = useState({
    page: 1,
    pageSize: 10,
    totalCount: 0
  });

  // Fetch discount rates
  const fetchDiscountRates = useCallback(async (page = 1, pageSize = 10, search = '') => {
    setLoading(true);
    try {
      const params = {
        page,
        pageSize,
        ...(search && { search })
      };
      const response = await adminApiService.getAllDiscountRates(params);
      const ratesArray = response?.items || response?.data || response || [];
      setDiscountRates(ratesArray);
      
      // Update pagination info
      setPagination(prev => ({
        ...prev,
        page: response?.page || page,
        totalCount: response?.totalCount || response?.totalCount || ratesArray.length,
        pageSize: response?.pageSize || pageSize
      }));
    } catch (error) {
      console.error('Error fetching discount rates:', error);
      showToast('Failed to fetch discount rates', 'error');
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  // Handle search
  const handleSearch = useCallback(async (term) => {
    setSearchTerm(term);
    await fetchDiscountRates(1, pagination.pageSize, term);
  }, [fetchDiscountRates, pagination.pageSize]);

  // Debounced search
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchTerm) {
        handleSearch(searchTerm);
      } else {
        fetchDiscountRates();
      }
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [searchTerm, fetchDiscountRates, handleSearch]);

  // Handle create/edit
  const handleCreate = useCallback(() => {
    setEditingDiscountRate(null);
    setFormData({
      title: '',
      discountPercent: 0,
      isActive: true
    });
    setShowModal(true);
  }, []);

  const handleEdit = useCallback((rate) => {
    setEditingDiscountRate(rate);
    setFormData({
      title: rate.title,
      discountPercent: rate.discountPercent,
      isActive: rate.isActive
    });
    setShowModal(true);
  }, []);

  const handleDelete = useCallback(async (rate) => {
    if (window.confirm(`Are you sure you want to delete "${rate.title}"?`)) {
      try {
        await adminApiService.deleteDiscountRate(rate.id);
        showToast('Discount rate deleted successfully', 'success');
        await fetchDiscountRates(pagination.page, pagination.pageSize, searchTerm);
      } catch (error) {
        console.error('Error deleting discount rate:', error);
        showToast('Failed to delete discount rate', 'error');
      }
    }
  }, [fetchDiscountRates, pagination.page, pagination.pageSize, searchTerm, showToast]);

  // Handle form submit
  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      showToast('Title is required', 'error');
      return;
    }

    setSubmitting(true);
    try {
      if (editingDiscountRate) {
        // Update existing discount rate
        await adminApiService.updateDiscountRate(editingDiscountRate.id, formData);
        showToast('Discount rate updated successfully', 'success');
      } else {
        // Create new discount rate
        await adminApiService.createDiscountRate(formData);
        showToast('Discount rate created successfully', 'success');
      }
      
      // Refresh list
      await fetchDiscountRates(pagination.page, pagination.pageSize, searchTerm);
      setShowModal(false);
      setEditingDiscountRate(null);
      setFormData({
        title: '',
        discountPercent: 0,
        isActive: true
      });
    } catch (error) {
      console.error('Error saving discount rate:', error);
      showToast('Failed to save discount rate', 'error');
    } finally {
      setSubmitting(false);
    }
  }, [formData, editingDiscountRate, fetchDiscountRates, pagination.page, pagination.pageSize, searchTerm, showToast]);

  // Handle page change
  const handlePageChange = useCallback(async (newPage) => {
    if (newPage < 1 || newPage > Math.ceil(pagination.totalCount / pagination.pageSize)) return;
    setPagination(prev => ({ ...prev, page: newPage }));
    await fetchDiscountRates(newPage, pagination.pageSize, searchTerm);
  }, [fetchDiscountRates, pagination.pageSize, pagination.totalCount, searchTerm]);

  // Initialize data
  useEffect(() => {
    fetchDiscountRates();
  }, [fetchDiscountRates]);

  return (
    <AdminPageLayout
      title="Discount Rates"
      subtitle="Manage discount rates for courses"
      icon={Percent}
      loading={loading}
      actions={
        <button
          onClick={handleCreate}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-4 h-4 mr-2" />
          Create Discount Rate
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

      {/* Search Bar */}
      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search discount rates..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Discount Rates Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        {discountRates.length > 0 ? (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Title
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Discount
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {discountRates.map((rate) => (
                    <tr key={rate.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {rate.title}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <div className="flex items-center">
                          <Percent className="w-4 h-4 text-green-600 mr-2" />
                          <span className="font-medium text-green-600">
                            {rate.discountPercent}% OFF
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                          rate.isActive 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {rate.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-medium">
                        <div className="flex items-center justify-end space-x-2">
                          <button
                            onClick={() => handleEdit(rate)}
                            className="text-blue-600 hover:text-blue-900 hover:bg-blue-50 p-2 rounded-md transition-colors"
                            title="Edit"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(rate)}
                            className="text-red-600 hover:text-red-900 hover:bg-red-50 p-2 rounded-md transition-colors"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {pagination.totalCount > pagination.pageSize && (
              <div className="px-6 py-3 border-t border-gray-200 flex items-center justify-between bg-gray-50">
                <div className="text-sm text-gray-700">
                  Showing {((pagination.page - 1) * pagination.pageSize) + 1} to{' '}
                  {Math.min(pagination.page * pagination.pageSize, pagination.totalCount)} of{' '}
                  {pagination.totalCount} results
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handlePageChange(pagination.page - 1)}
                    disabled={pagination.page === 1}
                    className="px-3 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Previous
                  </button>
                  
                  <div className="flex items-center space-x-1">
                    {Array.from({ length: Math.ceil(pagination.totalCount / pagination.pageSize) }, (_, i) => i + 1)
                      .filter(page => 
                        page === 1 || 
                        page === Math.ceil(pagination.totalCount / pagination.pageSize) ||
                        (page >= pagination.page - 1 && page <= pagination.page + 1)
                      )
                      .map((page, index, array) => (
                        <React.Fragment key={page}>
                          {index > 0 && array[index - 1] !== page - 1 && (
                            <span className="px-2 text-gray-500">...</span>
                          )}
                          <button
                            onClick={() => handlePageChange(page)}
                            className={`px-3 py-1 text-sm border rounded-md ${
                              page === pagination.page
                                ? 'bg-blue-600 text-white border-blue-600'
                                : 'border-gray-300 hover:bg-gray-50'
                            }`}
                          >
                            {page}
                          </button>
                        </React.Fragment>
                      ))}
                  </div>
                  
                  <button
                    onClick={() => handlePageChange(pagination.page + 1)}
                    disabled={pagination.page === Math.ceil(pagination.totalCount / pagination.pageSize)}
                    className="px-3 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </>
        ) : (
          // Empty state
          <div className="text-center py-12">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Percent className="w-10 h-10 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No discount rates found</h3>
            <p className="text-gray-500">
              {searchTerm ? 'Try adjusting your search terms' : 'Get started by creating your first discount rate'}
            </p>
          </div>
        )}
      </div>

      {/* Create/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                {editingDiscountRate ? 'Edit Discount Rate' : 'Create Discount Rate'}
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Title *
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter discount rate title"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Discount Percentage *
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={formData.discountPercent}
                    onChange={(e) => setFormData(prev => ({ ...prev, discountPercent: parseInt(e.target.value) || 0 }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter discount percentage"
                    required
                  />
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="isActive"
                    checked={formData.isActive}
                    onChange={(e) => setFormData(prev => ({ ...prev, isActive: e.target.checked }))}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="isActive" className="ml-2 block text-sm text-gray-700">
                    Active
                  </label>
                </div>
              </div>

              <div className="flex justify-end space-x-3 mt-6">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 transition-colors"
                >
                  {submitting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Processing...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      {editingDiscountRate ? 'Update' : 'Create'}
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminPageLayout>
  );
};

export default DiscountRates;
