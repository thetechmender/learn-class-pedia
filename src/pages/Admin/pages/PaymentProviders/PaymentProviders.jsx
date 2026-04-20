import React, { useState, useCallback, useEffect } from 'react';
import { useToast } from '../../../../hooks/utils/useToast';
import { usePaymentProviders } from '../../../../hooks/api/usePaymentProviders';
import {
  Search,
  Plus,
  Edit2,
  Trash2,
  CheckCircle,
  AlertCircle,
  CreditCard,
  Save,
  X,
  Building2
} from 'lucide-react';
import AdminPageLayout from '../../../../components/AdminPageLayout';

const PaymentProviders = () => {
  const { toast, showToast } = useToast();
  const {
    paymentProviders,
    loading,
    error,
    fetchPaymentProviders,
    createPaymentProvider,
    updatePaymentProvider,
    deletePaymentProvider,
  } = usePaymentProviders();

  // Component state
  const [searchTerm, setSearchTerm] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingProvider, setEditingProvider] = useState(null);
  const [formData, setFormData] = useState({
    title: ''
  });
  const [submitting, setSubmitting] = useState(false);

  // Filter providers based on search term
  const filteredProviders = paymentProviders.filter(provider =>
    provider.title?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Debounced search
  useEffect(() => {
    if (searchTerm.trim() !== '') {
      setIsTyping(true);
      const timeoutId = setTimeout(() => {
        setIsTyping(false);
      }, 300);
      return () => clearTimeout(timeoutId);
    } else {
      setIsTyping(false);
    }
  }, [searchTerm]);

  // Handle create/edit
  const handleCreate = useCallback(() => {
    setEditingProvider(null);
    setFormData({
      title: ''
    });
    setShowModal(true);
  }, []);

  const handleEdit = useCallback((provider) => {
    setEditingProvider(provider);
    setFormData({
      title: provider.title
    });
    setShowModal(true);
  }, []);

  const handleDelete = useCallback(async (provider) => {
    if (window.confirm(`Are you sure you want to delete "${provider.title}"?`)) {
      try {
        await deletePaymentProvider(provider.id);
        showToast('Payment provider deleted successfully', 'success');
      } catch (error) {
        console.error('Error deleting payment provider:', error);
        showToast('Failed to delete payment provider', 'error');
      }
    }
  }, [deletePaymentProvider, showToast]);

  // Handle form submit
  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      showToast('Title is required', 'error');
      return;
    }

    setSubmitting(true);
    try {
      // Get current user ID from localStorage (assuming it's stored there)
      const userId = localStorage.getItem('userId') || 0;
      
      const payload = {
        title: formData.title,
        createdBy: userId
      };

      if (editingProvider) {
        // Update existing payment provider
        await updatePaymentProvider(editingProvider.id, payload);
        showToast('Payment provider updated successfully', 'success');
      } else {
        // Create new payment provider
        await createPaymentProvider(payload);
        showToast('Payment provider created successfully', 'success');
      }

      // Reset form
      setShowModal(false);
      setEditingProvider(null);
      setFormData({
        title: ''
      });
    } catch (error) {
      console.error('Error saving payment provider:', error);
      showToast('Failed to save payment provider', 'error');
    } finally {
      setSubmitting(false);
    }
  }, [formData, editingProvider, updatePaymentProvider, createPaymentProvider, showToast]);

  // Initial fetch
  useEffect(() => {
    fetchPaymentProviders();
  }, [fetchPaymentProviders]);

  return (
    <AdminPageLayout
      title="Payment Providers"
      subtitle="Manage payment providers like Stripe, PayPal, etc."
      icon={CreditCard}
      loading={loading}
      actions={
        <button
          onClick={handleCreate}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-4 h-4 mr-2" />
          Create Payment Provider
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
            placeholder={isTyping ? "Searching..." : "Search payment providers..."}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={`w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
              isTyping ? 'bg-blue-50 border-blue-300' : ''
            }`}
          />
          {isTyping && (
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-blue-600 border-t-transparent"></div>
            </div>
          )}
        </div>
      </div>

      {/* Payment Providers Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        {filteredProviders.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Title
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Created At
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredProviders.map((provider) => (
                  <tr key={provider.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      #{provider.id}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      <div className="flex items-center">
                        <Building2 className="w-4 h-4 text-blue-600 mr-2" />
                        {provider.title}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                        provider.isActive
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {provider.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {provider.createdAt ? new Date(provider.createdAt).toLocaleDateString() : '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-medium">
                      <div className="flex items-center justify-end space-x-2">
                        <button
                          onClick={() => handleEdit(provider)}
                          className="text-blue-600 hover:text-blue-900 hover:bg-blue-50 p-2 rounded-md transition-colors"
                          title="Edit"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(provider)}
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
        ) : (
          // Empty state
          <div className="text-center py-12">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CreditCard className="w-10 h-10 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No payment providers found</h3>
            <p className="text-gray-500">
              {searchTerm ? 'Try adjusting your search terms' : 'Get started by creating your first payment provider'}
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
                {editingProvider ? 'Edit Payment Provider' : 'Create Payment Provider'}
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
                    placeholder="Enter provider name (e.g., Stripe, PayPal)"
                    required
                  />
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
                      {editingProvider ? 'Update' : 'Create'}
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

export default PaymentProviders;
