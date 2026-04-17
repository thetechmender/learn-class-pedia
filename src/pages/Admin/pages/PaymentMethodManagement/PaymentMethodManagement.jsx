import { useEffect, useCallback } from 'react';
import { CreditCard, Users, RefreshCw, AlertCircle, Shield, Calendar, Mail, MapPin, Star, CheckCircle, ChevronLeft, ChevronRight } from 'lucide-react';
import useStudentOrderManagement from '../../../../hooks/api/useStudentOrderManagement';
const PaymentMethodManagement = () => {
  const {
    loading,
    error,
    paymentMethods,
    getPaymentMethods,
    clearError,
    pagination
  } = useStudentOrderManagement();

  // Handle page change
  const handlePageChange = useCallback(async (newPage) => {
    try {
      await getPaymentMethods(newPage, pagination.pageSize);
    } catch (err) {
      console.error('Failed to change page:', err);
    }
  }, [getPaymentMethods, pagination.pageSize]);

  // Handle page size change
  const handlePageSizeChange = useCallback(async (newPageSize) => {
    try {
      await getPaymentMethods(1, newPageSize);
    } catch (err) {
      console.error('Failed to change page size:', err);
    }
  }, [getPaymentMethods]);

  // Load payment methods on component mount
  useEffect(() => {
    getPaymentMethods(1, 100);
  }, [getPaymentMethods]);

  // Handle refresh
  const handleRefresh = useCallback(async () => {
    try {
      await getPaymentMethods(1, pagination.pageSize);
    } catch (err) {
      console.error('Failed to refresh payment methods:', err);
    }
  }, [getPaymentMethods, pagination.pageSize]);

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 p-3 lg:p-4">
        {/* Header */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 p-6 lg:p-8 mb-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl shadow-lg">
              <CreditCard className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
                Payment Method Management
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">Manage payment methods and billing information</p>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            {/* Refresh Button */}
            <button
              onClick={handleRefresh}
              disabled={loading}
              className="p-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl hover:from-blue-600 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
            <div className="flex items-center gap-3">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <div>
                <h3 className="font-medium">Error</h3>
                <p>{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-3 text-gray-600 dark:text-gray-400">Loading payment methods...</span>
          </div>
        )}

        {/* Payment Methods List */}
        {!loading && !error && paymentMethods.length > 0 && (
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden mb-6">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 border-b border-gray-200 dark:border-gray-700">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                      Customer
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                      Payment Type
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                      Card Details
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                      Bank Details
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                      Contact Info
                    </th>
                   
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                      Created
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {paymentMethods.map((method) => (
                    <tr key={method.id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center space-x-3">
                          <div className="w-12 h-12 rounded-full bg-gradient-to-r from-blue-400 to-blue-600 flex items-center justify-center shadow-lg">
                            <Users className="w-6 h-6 text-white" />
                          </div>
                          <div>
                            <div className="text-sm font-semibold text-gray-900 dark:text-white">
                              {method.customerFullName || 'Unknown Customer'}
                            </div>
                          
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center space-x-2">
                          <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                            <Shield className="w-4 h-4 text-white" />
                          </div>
                          <span className="inline-flex items-center px-3 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                            {method.paymentTypeName || 'Credit Card'}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {method.cardBrand && (
                          <div className="space-y-2">
                            <div className="flex items-center space-x-2">
                              <CreditCard className="w-4 h-4 text-green-500" />
                              <span className="text-sm font-medium text-gray-900 dark:text-white">
                                {method.cardBrand}
                              </span>
                            </div>
                            <div className="text-xs text-gray-600 dark:text-gray-400">
                              {method.cardHolderName}
                            </div>
                            <div className="text-xs font-mono bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
                              {method.cardNumber}
                            </div>
                            {method.cardExpiryMonth && method.cardExpiryYear && (
                              <div className="text-xs text-orange-600 dark:text-orange-400 flex items-center space-x-1">
                                <Calendar className="w-3 h-3" />
                                <span>Expires: {String(method.cardExpiryMonth).padStart(2, '0')}/{method.cardExpiryYear}</span>
                              </div>
                            )}
                            {method.cardCVV && (
                              <div className="text-xs text-red-600 dark:text-red-400 flex items-center space-x-1">
                                <Shield className="w-3 h-3" />
                                <span>CVV: ***</span>
                              </div>
                            )}
                            {method.externalToken && (
                              <div className="text-xs text-blue-600 dark:text-blue-400 flex items-center space-x-1">
                                <Shield className="w-3 h-3" />
                                <span className="font-mono">Token: {method.externalToken}</span>
                              </div>
                            )}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {method.bankName && (
                          <div className="space-y-2">
                            <div className="text-sm font-medium text-gray-900 dark:text-white">
                              {method.bankName}
                            </div>
                            <div className="text-xs font-mono bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
                              {method.bankAccountNumber}
                            </div>
                            {method.bankRoutingNumber && (
                              <div className="text-xs text-gray-500 dark:text-gray-400">
                                Routing: {method.bankRoutingNumber}
                              </div>
                            )}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="space-y-1">
                          <div className="flex items-center space-x-2 text-sm text-gray-900 dark:text-white">
                            <Mail className="w-4 h-4 text-gray-400" />
                            <span>{method.email}</span>
                          </div>
                          {(method.address || method.city || method.state || method.zip) && (
                            <div className="flex items-center space-x-2 text-xs text-gray-500 dark:text-gray-400">
                              <MapPin className="w-3 h-3" />
                              <span>
                                {method.city && method.city}
                                {method.state && `, ${method.state}`}
                                {method.zip && ` ${method.zip}`}
                              </span>
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900 dark:text-white">
                          <div className="flex items-center space-x-2 mb-1">
                            <Calendar className="w-4 h-4 text-gray-400" />
                            <span className="font-medium">{new Date(method.createdAt).toLocaleDateString()}</span>
                          </div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">
                            {new Date(method.createdAt).toLocaleTimeString()}
                          </div>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && paymentMethods.length === 0 && (
          <div className="text-center py-16 bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700">
            <div className="p-4 bg-gradient-to-r from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800 rounded-full inline-block mb-4">
              <CreditCard className="w-12 h-12 text-gray-400 dark:text-gray-500" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No payment methods found</h3>
            <p className="text-gray-600 dark:text-gray-300 max-w-md mx-auto">
              No payment methods available.
            </p>
          </div>
        )}

        {/* Pagination Controls */}
        {!loading && !error && paymentMethods.length > 0 && pagination.totalPages > 1 && (
          <div className="flex flex-col sm:flex-row items-center justify-between px-6 py-4 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 rounded-b-xl gap-4">
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-700 dark:text-gray-300">
                Showing {((pagination.currentPage - 1) * pagination.pageSize) + 1} to{' '}
                {Math.min(pagination.currentPage * pagination.pageSize, pagination.totalCount)} of{' '}
                {pagination.totalCount} payment methods
              </span>
              {/* Page Size Selector */}
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600 dark:text-gray-400">Per page:</span>
                <select
                  value={pagination.pageSize}
                  onChange={(e) => handlePageSizeChange(Number(e.target.value))}
                  disabled={loading}
                  className="px-3 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50"
                >
                  <option value={10}>10</option>
                  <option value={25}>25</option>
                  <option value={50}>50</option>
                  <option value={100}>100</option>
                </select>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              {/* Previous Button */}
              <button
                onClick={() => handlePageChange(pagination.currentPage - 1)}
                disabled={!pagination.hasPreviousPage || loading}
                className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-500 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft className="w-4 h-4 mr-1" />
                Previous
              </button>

              {/* Page Numbers */}
              <div className="flex items-center space-x-1">
                {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map(pageNum => (
                  <button
                    key={pageNum}
                    onClick={() => handlePageChange(pageNum)}
                    disabled={loading}
                    className={`inline-flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                      pageNum === pagination.currentPage
                        ? 'bg-blue-600 text-white border-blue-600 shadow-lg'
                        : 'text-gray-500 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700'
                    } disabled:opacity-50 disabled:cursor-not-allowed`}
                  >
                    {pageNum}
                  </button>
                ))}
              </div>

              {/* Next Button */}
              <button
                onClick={() => handlePageChange(pagination.currentPage + 1)}
                disabled={!pagination.hasNextPage || loading}
                className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-500 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Next
                <ChevronRight className="w-4 h-4 ml-1" />
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default PaymentMethodManagement;
