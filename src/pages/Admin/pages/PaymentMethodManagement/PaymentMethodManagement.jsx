import { useEffect, useCallback, useState } from 'react';
import { CreditCard, Users, RefreshCw, AlertCircle, Shield, Calendar, Mail, MapPin, ChevronLeft, ChevronRight, X } from 'lucide-react';
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

  // Component state
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    customerFullName: '',
    customerEmail: ''
  });

  // Handle page change
  const handlePageChange = useCallback(async (newPage) => {
    try {
      await getPaymentMethods(newPage, pagination.pageSize, filters);
    } catch (err) {
      console.error('Failed to change page:', err);
    }
  }, [getPaymentMethods, pagination.pageSize, filters]);

  // Handle page size change
  const handlePageSizeChange = useCallback(async (newPageSize) => {
    try {
      await getPaymentMethods(1, newPageSize, filters);
    } catch (err) {
      console.error('Failed to change page size:', err);
    }
  }, [getPaymentMethods, filters]);

  // Load payment methods on component mount
  useEffect(() => {
    getPaymentMethods(1, 100, {});
  }, [getPaymentMethods]);

  // Handle refresh
  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    try {
      await getPaymentMethods(1, pagination.pageSize, filters);
    } catch (err) {
      console.error('Failed to refresh payment methods:', err);
    } finally {
      setIsRefreshing(false);
    }
  }, [getPaymentMethods, pagination.pageSize, filters]);

  // Handle filter apply
  const handleFilter = useCallback(async () => {
    try {
      await getPaymentMethods(1, pagination.pageSize, filters);
    } catch (err) {
      console.error('Failed to filter payment methods:', err);
    }
  }, [getPaymentMethods, pagination.pageSize, filters]);

  // Clear filters
  const clearFilters = useCallback(async () => {
    setFilters({
      customerFullName: '',
      customerEmail: ''
    });
    await getPaymentMethods(1, pagination.pageSize, {});
  }, [getPaymentMethods, pagination.pageSize]);


  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 p-3 lg:p-4">
        {/* Search and Filters - Modern Compact Design */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-visible">
          {/* Filter Header Bar */}
          <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-gray-50 to-white dark:from-gray-800 dark:to-gray-800 rounded-t-xl">
            <div className="flex flex-col lg:flex-row lg:items-center gap-3">
              {/* Left: Title & Stats */}
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <div className="flex items-center gap-2.5">
                  <div className="p-1.5 bg-gradient-to-r from-purple-500 to-pink-600 rounded-lg shadow-md">
                    <CreditCard className="w-4 h-4 text-white" />
                  </div>
                  <div className="flex flex-col">
                    <h1 className="text-lg font-semibold text-gray-900 dark:text-white leading-tight">
                      Payment Method Management
                    </h1>
                    <p className="text-xs text-gray-500 dark:text-gray-400 leading-tight">
                      {pagination.totalCount} methods
                    </p>
                  </div>
                </div>
              </div>

              {/* Right: Actions */}
              <div className="flex items-center gap-2">
                <button
                  onClick={handleRefresh}
                  disabled={isRefreshing}
                  className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs bg-gray-100 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  title="Refresh data"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
                </button>
                <div className="px-2.5 py-1 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-md border border-blue-200 dark:border-blue-800">
                  <div className="text-[10px] text-gray-600 dark:text-gray-400 font-medium uppercase tracking-wide">Total</div>
                  <div className="text-sm font-bold text-gray-900 dark:text-white leading-none">{pagination.totalCount}</div>
                </div>
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className={`flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
                    showFilters
                      ? 'bg-blue-600 text-white shadow-md'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                >
                  <span className="hidden sm:inline">Filters</span>
                  <svg className={`w-4 h-4 transition-transform duration-200 ${showFilters ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
              </div>
            </div>
          </div>

          {/* Expandable Filter Panel */}
          <div
            className={`transition-all duration-300 ease-in-out ${
              showFilters ? 'max-h-[300px] opacity-100 overflow-visible' : 'max-h-0 opacity-0 overflow-hidden'
            }`}
          >
            <div className="p-4 bg-gray-50/60 dark:bg-gray-900/20 rounded-b-xl border-t border-gray-200 dark:border-gray-700">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="relative">
                  <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Customer Full Name</label>
                  <div className="relative">
                    <Users className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search by customer name..."
                      value={filters.customerFullName}
                      onChange={(e) => setFilters({ ...filters, customerFullName: e.target.value })}
                      className="w-full pl-9 pr-3 py-2 text-sm bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:text-white transition-all shadow-sm"
                    />
                  </div>
                </div>
                <div className="relative">
                  <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Customer Email</label>
                  <div className="relative">
                    <Mail className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search by email..."
                      value={filters.customerEmail}
                      onChange={(e) => setFilters({ ...filters, customerEmail: e.target.value })}
                      className="w-full pl-9 pr-3 py-2 text-sm bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:text-white transition-all shadow-sm"
                    />
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2 mt-3 justify-end">
                <button
                  onClick={clearFilters}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Clear
                </button>
                <button
                  onClick={handleFilter}
                  className="px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 rounded-lg shadow-sm transition-all"
                >
                  Apply Filters
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="bg-gradient-to-r from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-800/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-6 py-4 rounded-xl flex items-center justify-between shadow-lg my-4">
            <div className="flex items-center gap-3">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <span className="font-medium">{error}</span>
            </div>
            <button
              onClick={clearError}
              className="text-red-500 hover:text-red-700 dark:hover:text-red-300 transition-colors duration-200 p-1 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        )}

        {/* Payment Methods Table */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 mt-5 overflow-hidden">
          {/* Desktop Table - Scrollable Container */}
          <div className="hidden md:block w-full overflow-x-auto rounded-xl border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-900">
            <table className="w-full min-w-[1000px] table-fixed border-collapse">
              <thead className="sticky top-0 z-10 bg-gray-100 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                <tr>
                  <th className="w-[180px] pl-4 pr-2 py-3 text-left text-[12px] font-semibold uppercase tracking-wider text-gray-600 dark:text-gray-400">
                    Customer
                  </th>
                  <th className="w-[120px] px-2 py-3 text-left text-[12px] font-semibold uppercase tracking-wider text-gray-600 dark:text-gray-400">
                    Payment Type
                  </th>
                  <th className="w-[200px] px-2 py-3 text-left text-[12px] font-semibold uppercase tracking-wider text-gray-600 dark:text-gray-400">
                    Card Details
                  </th>
                  <th className="w-[150px] px-2 py-3 text-left text-[12px] font-semibold uppercase tracking-wider text-gray-600 dark:text-gray-400">
                    Bank Details
                  </th>
                  <th className="w-[150px] px-2 py-3 text-left text-[12px] font-semibold uppercase tracking-wider text-gray-600 dark:text-gray-400">
                    Contact Info
                  </th>
                  <th className="w-[120px] px-2 py-3 text-left text-[12px] font-semibold uppercase tracking-wider text-gray-600 dark:text-gray-400">
                    Created
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {loading ? (
                  <tr>
                    <td colSpan="6" className="px-6 py-14 text-center">
                      <div className="flex flex-col items-center gap-3">
                        <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-500 border-t-transparent"></div>
                        <span className="font-medium text-gray-500 dark:text-gray-400">
                          Loading payment methods...
                        </span>
                      </div>
                    </td>
                  </tr>
                ) : paymentMethods.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="px-6 py-14 text-center">
                      <div className="flex flex-col items-center gap-3">
                        <CreditCard className="h-12 w-12 text-gray-400" />
                        <span className="text-lg font-medium text-gray-500 dark:text-gray-400">
                          No payment methods found
                        </span>
                        <span className="text-sm text-gray-400 dark:text-gray-500">
                          No payment methods available at this time
                        </span>
                      </div>
                    </td>
                  </tr>
                ) : (
                  paymentMethods.map((method) => (
                    <tr
                      key={method.id}
                      className="transition-colors duration-150 hover:bg-gray-50 dark:hover:bg-gray-800/60"
                    >
                      <td className="pl-4 pr-2 py-3 align-top">
                        <div className="min-w-0 space-y-1.5">
                          <div className="truncate text-sm font-semibold text-gray-900 dark:text-white">
                            {method.customerFullName || 'Unknown Customer'}
                          </div>
                        </div>
                      </td>
                      <td className="px-2 py-3 align-top">
                        <div className="min-w-0 space-y-1">
                          <span className="inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                            {method.paymentTypeName || 'Credit Card'}
                          </span>
                        </div>
                      </td>
                      <td className="px-2 py-3 align-top">
                        {method.cardBrand && (
                          <div className="min-w-0 space-y-1">
                            <div className="text-sm font-medium text-gray-900 dark:text-white">
                              {method.cardBrand}
                            </div>
                            <div className="text-xs text-gray-600 dark:text-gray-400">
                              {method.cardHolderName}
                            </div>
                            <div className="text-xs font-mono bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
                              {method.cardNumber}
                            </div>
                            {method.cardExpiryMonth && method.cardExpiryYear && (
                              <div className="text-xs text-orange-600 dark:text-orange-400 flex items-center gap-1">
                                <Calendar className="w-3 h-3" />
                                <span>{String(method.cardExpiryMonth).padStart(2, '0')}/{method.cardExpiryYear}</span>
                              </div>
                            )}
                          </div>
                        )}
                      </td>
                      <td className="px-2 py-3 align-top">
                        {method.bankName && (
                          <div className="min-w-0 space-y-1">
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
                      <td className="px-2 py-3 align-top">
                        <div className="min-w-0 space-y-1">
                          <div className="flex items-center gap-1 text-sm text-gray-900 dark:text-white">
                            <Mail className="w-3.5 h-3.5 text-gray-400" />
                            <span className="truncate">{method.email}</span>
                          </div>
                          {(method.address || method.city || method.state || method.zip) && (
                            <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                              <MapPin className="w-3 h-3" />
                              <span className="truncate">
                                {method.city && method.city}
                                {method.state && `, ${method.state}`}
                                {method.zip && ` ${method.zip}`}
                              </span>
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-2 py-3 align-top">
                        <div className="min-w-0 space-y-1">
                          <div className="text-sm text-gray-900 dark:text-white">
                            {new Date(method.createdAt).toLocaleDateString()}
                          </div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">
                            {new Date(method.createdAt).toLocaleTimeString()}
                          </div>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="text-sm text-gray-700 dark:text-gray-300 font-medium">
                  Showing <span className="font-semibold text-gray-900 dark:text-white">{((pagination.currentPage - 1) * pagination.pageSize) + 1}</span> to{' '}
                  <span className="font-semibold text-gray-900 dark:text-white">{Math.min(pagination.currentPage * pagination.pageSize, pagination.totalCount)}</span> of{' '}
                  <span className="font-semibold text-gray-900 dark:text-white">{pagination.totalCount}</span> results
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handlePageChange(pagination.currentPage - 1)}
                    disabled={!pagination.hasPreviousPage}
                    className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-600 border border-gray-300 dark:border-gray-500 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-500 transition-all duration-200 shadow-sm hover:shadow-md"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    <span>Previous</span>
                  </button>
                  
                  <div className="flex items-center gap-1">
                    {/* Page numbers */}
                    {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                      let pageNum;
                      if (pagination.totalPages <= 5) {
                        pageNum = i + 1;
                      } else if (pagination.currentPage <= 3) {
                        pageNum = i + 1;
                      } else if (pagination.currentPage >= pagination.totalPages - 2) {
                        pageNum = pagination.totalPages - 4 + i;
                      } else {
                        pageNum = pagination.currentPage - 2 + i;
                      }
                      
                      return (
                        <button
                          key={pageNum}
                          onClick={() => handlePageChange(pageNum)}
                          className={`w-10 h-10 rounded-lg font-medium transition-all duration-200 ${
                            pageNum === pagination.currentPage
                              ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg'
                              : 'bg-white dark:bg-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-500'
                          }`}
                        >
                          {pageNum}
                        </button>
                      );
                    })}
                  </div>
                  
                  <button
                    onClick={() => handlePageChange(pagination.currentPage + 1)}
                    disabled={!pagination.hasNextPage}
                    className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-600 border border-gray-300 dark:border-gray-500 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-500 transition-all duration-200 shadow-sm hover:shadow-md"
                  >
                    <span>Next</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default PaymentMethodManagement;
