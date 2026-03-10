import React, { useState, useEffect, useCallback } from 'react';
import {
  Users,
  Search,
  Filter,
  X,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Calendar,
  DollarSign,
  CreditCard,
  CheckCircle,
  XCircle,
  Clock,
  Tag,
  FileText,
  RefreshCw,
  Eye,
  ShoppingCart,
  TrendingUp,
  AlertCircle,
  Check
} from 'lucide-react';
import useStudentOrderManagement from '../../../../hooks/api/useStudentOrderManagement';

const StudentOrderManagement = () => {
  const {
    loading,
    error,
    orders,
    selectedOrder,
    pagination,
    getAllOrders,
    getOrderById,
    searchOrders,
    filterOrders,
    clearError,
    setSelectedOrder
  } = useStudentOrderManagement();

  // Component state
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    orderNo: '',
    customerFullName: '',
    statusId: '',
    currencyCode: ''
  });
  const [showFilters, setShowFilters] = useState(false);
  const [showOrderDetails, setShowOrderDetails] = useState(false);
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Debounce search term
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Load orders function
  const loadOrders = useCallback(async (page = 1) => {
    try {
      if (debouncedSearchTerm) {
        await searchOrders(debouncedSearchTerm, page, pagination.pageSize);
      } else {
        await getAllOrders(page, pagination.pageSize);
      }
    } catch (err) {
      console.error('Failed to load orders:', err);
    }
  }, [debouncedSearchTerm, searchOrders, getAllOrders, pagination.pageSize]);

  // Load orders on component mount and when page/filters change
  useEffect(() => {
    loadOrders();
  }, [debouncedSearchTerm, loadOrders]);

  // Handle search
  const handleSearch = useCallback((term) => {
    setSearchTerm(term);
  }, []);

  // Handle filter
  const handleFilter = useCallback(async () => {
    try {
      await filterOrders(filters, 1, pagination.pageSize);
    } catch (err) {
      console.error('Failed to filter orders:', err);
    }
  }, [filters, filterOrders, pagination.pageSize]);

  // Clear filters
  const clearFilters = useCallback(() => {
    setFilters({
      orderNo: '',
      customerFullName: '',
      statusId: '',
      currencyCode: ''
    });
    setSearchTerm('');
    loadOrders(1);
  }, [loadOrders]);

  // Handle page change
  const handlePageChange = useCallback((newPage) => {
    loadOrders(newPage);
  }, [loadOrders]);

  // Handle refresh
  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    try {
      await loadOrders(pagination.currentPage);
    } catch (err) {
      console.error('Failed to refresh orders:', err);
    } finally {
      setIsRefreshing(false);
    }
  }, [loadOrders, pagination.currentPage]);

  // Handle view order details
  const handleViewOrder = useCallback(async (orderId) => {
    try {
      await getOrderById(orderId);
      setShowOrderDetails(true);
    } catch (err) {
      console.error('Failed to fetch order details:', err);
    }
  }, [getOrderById]);

  // Format date
  const formatDate = useCallback((dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }, []);

  // Format currency
  const formatCurrency = useCallback((amount, currency = 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
    }).format(amount || 0);
  }, []);

  // Get status color
  const getStatusColor = useCallback((statusName) => {
    switch (statusName?.toLowerCase()) {
      case 'paid':
        return 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400';
      case 'pending':
        return 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400';
      case 'cancelled':
        return 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400';
      default:
        return 'bg-gray-100 dark:bg-gray-900/30 text-gray-700 dark:text-gray-400';
    }
  }, []);

  // Get status icon
  const getStatusIcon = useCallback((statusName) => {
    switch (statusName?.toLowerCase()) {
      case 'paid':
        return <CheckCircle className="w-4 h-4" />;
      case 'pending':
        return <Clock className="w-4 h-4" />;
      case 'cancelled':
        return <XCircle className="w-4 h-4" />;
      default:
        return <AlertCircle className="w-4 h-4" />;
    }
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 p-3 lg:p-4">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 p-6 lg:p-8 mb-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl shadow-lg">
              <ShoppingCart className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
                Student Order Management
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">Manage and track student orders</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 px-4 py-2 rounded-xl border border-blue-200 dark:border-blue-800">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-blue-600" />
                <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                  Total Orders: <span className="text-blue-600">{pagination.totalCount}</span>
                </span>
              </div>
            </div>
            <button
              onClick={handleRefresh}
              disabled={isRefreshing || loading}
              className="p-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl hover:from-blue-600 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <RefreshCw className={`w-5 h-5 ${isRefreshing ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>
      </div>

      {/* Search and Filter Section */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 p-6 lg:p-8 mb-6">
        <div className="flex flex-col lg:flex-row gap-4 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search by order number, customer name..."
              value={searchTerm}
              onChange={(e) => handleSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
            />
            {searchTerm && (
              <button
                onClick={() => handleSearch('')}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl transition-all duration-200 ${
              showFilters
                ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
            }`}
          >
            <Filter className="w-5 h-5" />
            <span>Filters</span>
            {Object.values(filters).some(value => value !== '') && (
              <span className="ml-2 px-2 py-1 bg-white/20 rounded-full text-xs">
                {Object.values(filters).filter(value => value !== '').length}
              </span>
            )}
            <ChevronDown className={`w-4 h-4 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
          </button>
        </div>

        {/* Advanced Filters */}
        {showFilters && (
          <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Order Number
                </label>
                <input
                  type="text"
                  placeholder="e.g., CP-20260310-724A59AF"
                  value={filters.orderNo}
                  onChange={(e) => setFilters({ ...filters, orderNo: e.target.value })}
                  className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Customer Name
                </label>
                <input
                  type="text"
                  placeholder="e.g., John Doe"
                  value={filters.customerFullName}
                  onChange={(e) => setFilters({ ...filters, customerFullName: e.target.value })}
                  className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Status
                </label>
                <select
                  value={filters.statusId}
                  onChange={(e) => setFilters({ ...filters, statusId: e.target.value })}
                  className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                >
                  <option value="">All Status</option>
                  <option value="1">Pending</option>
                  <option value="2">Paid</option>
                  <option value="3">Cancelled</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Currency
                </label>
                <select
                  value={filters.currencyCode}
                  onChange={(e) => setFilters({ ...filters, currencyCode: e.target.value })}
                  className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                >
                  <option value="">All Currencies</option>
                  <option value="USD">USD</option>
                  <option value="EUR">EUR</option>
                  <option value="GBP">GBP</option>
                </select>
              </div>
            </div>
            <div className="flex items-center gap-3 mt-6">
              <button
                onClick={handleFilter}
                className="px-6 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                Apply Filters
              </button>
              <button
                onClick={clearFilters}
                className="px-6 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-all duration-200"
              >
                Clear All
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-gradient-to-r from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-800/20 border border-red-200 dark:border-red-800 rounded-xl p-4 mb-6">
          <div className="flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-red-600" />
            <div>
              <h3 className="font-semibold text-red-800 dark:text-red-400">Error</h3>
              <p className="text-red-700 dark:text-red-300 text-sm">{error}</p>
            </div>
            <button
              onClick={clearError}
              className="ml-auto text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Orders Table */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-600 border-b border-gray-200 dark:border-gray-700">
              <tr>
                <th className="px-6 py-4 text-left">
                  <div className="flex items-center gap-2">
                    <Tag className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                    <span className="text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">Order</span>
                  </div>
                </th>
                <th className="px-6 py-4 text-left">
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                    <span className="text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">Customer</span>
                  </div>
                </th>
                <th className="px-6 py-4 text-left">
                  <div className="flex items-center gap-2">
                    <DollarSign className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                    <span className="text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">Amount</span>
                  </div>
                </th>
                <th className="px-6 py-4 text-left">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                    <span className="text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">Status</span>
                  </div>
                </th>
                <th className="px-6 py-4 text-left">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                    <span className="text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">Date</span>
                  </div>
                </th>
                <th className="px-6 py-4 text-left">
                  <span className="text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {loading ? (
                <tr>
                  <td colSpan="6" className="px-6 py-12">
                    <div className="flex flex-col items-center justify-center">
                      <RefreshCw className="w-8 h-8 text-blue-600 animate-spin mb-4" />
                      <p className="text-gray-600 dark:text-gray-400">Loading orders...</p>
                    </div>
                  </td>
                </tr>
              ) : orders.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-12">
                    <div className="flex flex-col items-center justify-center">
                      <ShoppingCart className="w-12 h-12 text-gray-400 mb-4" />
                      <p className="text-gray-600 dark:text-gray-400 text-lg font-medium">No orders found</p>
                      <p className="text-gray-500 dark:text-gray-500 text-sm">Try adjusting your search or filters</p>
                    </div>
                  </td>
                </tr>
              ) : (
                orders.map((order) => (
                  <tr
                    key={order.id}
                    className="hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 dark:hover:from-blue-900/20 dark:hover:to-purple-900/20 transition-all duration-200"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10 bg-gradient-to-r from-blue-400 to-purple-500 rounded-xl flex items-center justify-center">
                          <Tag className="h-5 w-5 text-white" />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-semibold text-gray-900 dark:text-white">
                            {order.orderNo}
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            ID: {order.id}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 dark:text-white font-medium">
                        {order.customerFullName || 'N/A'}
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        Customer ID: {order.customerId}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 dark:text-white font-medium">
                        {formatCurrency(order.totalAmount, order.currencyCode)}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        Subtotal: {formatCurrency(order.subtotalAmount, order.currencyCode)}
                      </div>
                      {order.discountAmount > 0 && (
                        <div className="text-xs text-green-600 dark:text-green-400">
                          Discount: -{formatCurrency(order.discountAmount, order.currencyCode)}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(order.statusName)}`}>
                        {getStatusIcon(order.statusName)}
                        {order.statusName}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 dark:text-white">
                        {formatDate(order.createdAt)}
                      </div>
                      {order.paidAt && (
                        <div className="text-xs text-green-600 dark:text-green-400">
                          Paid: {formatDate(order.paidAt)}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button
                        onClick={() => handleViewOrder(order.id)}
                        className="flex items-center gap-2 px-3 py-2 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 rounded-lg hover:bg-blue-200 dark:hover:bg-blue-900/50 transition-all duration-200"
                      >
                        <Eye className="w-4 h-4" />
                        View
                      </button>
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

      {/* Order Details Modal */}
      {showOrderDetails && selectedOrder && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 rounded-3xl max-w-5xl w-full max-h-[85vh] overflow-y-auto shadow-2xl border border-gray-200/50 dark:border-gray-700/50 animate-slideUp">
            {/* Modal Header */}
            <div className="sticky top-0 bg-gradient-to-r from-green-600 to-emerald-600 dark:from-green-700 dark:to-emerald-700 p-6 rounded-t-3xl border-b border-gray-200/50 dark:border-gray-700/50">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-white/20 backdrop-blur-sm rounded-2xl">
                    <ShoppingCart className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-white">Order Details</h2>
                    <p className="text-green-100 text-sm">{selectedOrder.orderNo}</p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setShowOrderDetails(false);
                    setSelectedOrder(null);
                  }}
                  className="p-3 bg-white/20 backdrop-blur-sm rounded-2xl hover:bg-white/30 transition-all duration-200 group"
                >
                  <X className="w-5 h-5 text-white group-hover:rotate-90 transition-transform duration-200" />
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-6 lg:p-8">
              {/* Order Overview */}
              <div className="bg-gradient-to-r from-green-50 via-emerald-50 to-teal-50 dark:from-green-900/20 dark:via-emerald-900/20 dark:to-teal-900/20 rounded-2xl p-6 mb-8 border border-green-200/50 dark:border-green-800/30">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Order Information</h3>
                    <div className="space-y-3">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-green-500 rounded-xl">
                          <Tag className="w-4 h-4 text-white" />
                        </div>
                        <div>
                          <p className="text-sm text-gray-600 dark:text-gray-400">Order Number</p>
                          <p className="font-semibold text-gray-900 dark:text-white">{selectedOrder.orderNo}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-500 rounded-xl">
                          <Users className="w-4 h-4 text-white" />
                        </div>
                        <div>
                          <p className="text-sm text-gray-600 dark:text-gray-400">Customer</p>
                          <p className="font-semibold text-gray-900 dark:text-white">
                            {selectedOrder.customerFullName || 'N/A'} (ID: {selectedOrder.customerId})
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-purple-500 rounded-xl">
                          <CheckCircle className="w-4 h-4 text-white" />
                        </div>
                        <div>
                          <p className="text-sm text-gray-600 dark:text-gray-400">Status</p>
                          <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(selectedOrder.statusName)}`}>
                            {getStatusIcon(selectedOrder.statusName)}
                            {selectedOrder.statusName}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Payment Information</h3>
                    <div className="space-y-3">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-yellow-500 rounded-xl">
                          <DollarSign className="w-4 h-4 text-white" />
                        </div>
                        <div>
                          <p className="text-sm text-gray-600 dark:text-gray-400">Total Amount</p>
                          <p className="font-semibold text-gray-900 dark:text-white text-lg">
                            {formatCurrency(selectedOrder.totalAmount, selectedOrder.currencyCode)}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-orange-500 rounded-xl">
                          <Calendar className="w-4 h-4 text-white" />
                        </div>
                        <div>
                          <p className="text-sm text-gray-600 dark:text-gray-400">Order Date</p>
                          <p className="font-semibold text-gray-900 dark:text-white">{formatDate(selectedOrder.createdAt)}</p>
                        </div>
                      </div>
                      {selectedOrder.paidAt && (
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-green-500 rounded-xl">
                            <Check className="w-4 h-4 text-white" />
                          </div>
                          <div>
                            <p className="text-sm text-gray-600 dark:text-gray-400">Paid Date</p>
                            <p className="font-semibold text-gray-900 dark:text-white">{formatDate(selectedOrder.paidAt)}</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Financial Details */}
              <div className="bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-blue-900/30 dark:to-indigo-900/30 rounded-2xl p-6 mb-8 border border-blue-200/50 dark:border-blue-800/30">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-3">
                  <div className="p-2 bg-blue-500 rounded-xl">
                    <CreditCard className="w-5 h-5 text-white" />
                  </div>
                  Financial Breakdown
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center p-3 bg-white dark:bg-gray-700 rounded-xl">
                    <span className="text-gray-600 dark:text-gray-400">Subtotal</span>
                    <span className="font-semibold text-gray-900 dark:text-white">
                      {formatCurrency(selectedOrder.subtotalAmount, selectedOrder.currencyCode)}
                    </span>
                  </div>
                  {selectedOrder.discountAmount > 0 && (
                    <div className="flex justify-between items-center p-3 bg-white dark:bg-gray-700 rounded-xl">
                      <span className="text-gray-600 dark:text-gray-400">Discount</span>
                      <span className="font-semibold text-green-600 dark:text-green-400">
                        -{formatCurrency(selectedOrder.discountAmount, selectedOrder.currencyCode)}
                      </span>
                    </div>
                  )}
                  {selectedOrder.taxAmount > 0 && (
                    <div className="flex justify-between items-center p-3 bg-white dark:bg-gray-700 rounded-xl">
                      <span className="text-gray-600 dark:text-gray-400">Tax</span>
                      <span className="font-semibold text-gray-900 dark:text-white">
                        {formatCurrency(selectedOrder.taxAmount, selectedOrder.currencyCode)}
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between items-center p-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl">
                    <span className="font-semibold">Total Amount</span>
                    <span className="font-bold text-lg">
                      {formatCurrency(selectedOrder.totalAmount, selectedOrder.currencyCode)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Additional Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                {selectedOrder.couponCode && (
                  <div className="bg-gradient-to-br from-purple-50 to-pink-100 dark:from-purple-900/30 dark:to-pink-900/30 p-6 rounded-2xl border border-purple-200/50 dark:border-purple-800/30">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="p-2 bg-purple-500 rounded-xl">
                        <Tag className="w-5 h-5 text-white" />
                      </div>
                      <h4 className="font-bold text-gray-900 dark:text-white">Coupon Code</h4>
                    </div>
                    <p className="text-gray-700 dark:text-gray-300 font-medium text-lg">{selectedOrder.couponCode}</p>
                  </div>
                )}
                {selectedOrder.notes && (
                  <div className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-600 p-6 rounded-2xl border border-gray-200/50 dark:border-gray-600/50">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="p-2 bg-gray-600 rounded-xl">
                        <FileText className="w-5 h-5 text-white" />
                      </div>
                      <h4 className="font-bold text-gray-900 dark:text-white">Notes</h4>
                    </div>
                    <p className="text-gray-700 dark:text-gray-300">{selectedOrder.notes}</p>
                  </div>
                )}
              </div>

              {/* Payment Method Information */}
              {(selectedOrder.paymentMethodName || selectedOrder.paymentMethodType) && (
                <div className="bg-gradient-to-br from-green-50 to-emerald-100 dark:from-green-900/30 dark:to-emerald-900/30 p-6 rounded-2xl border border-green-200/50 dark:border-green-800/30">
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-3">
                    <div className="p-2 bg-green-500 rounded-xl">
                      <CreditCard className="w-5 h-5 text-white" />
                    </div>
                    Payment Method
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {selectedOrder.paymentMethodName && (
                      <div>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Method Name</p>
                        <p className="font-semibold text-gray-900 dark:text-white">{selectedOrder.paymentMethodName}</p>
                      </div>
                    )}
                    {selectedOrder.paymentMethodType && (
                      <div>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Method Type</p>
                        <p className="font-semibold text-gray-900 dark:text-white">{selectedOrder.paymentMethodType}</p>
                      </div>
                    )}
                    {selectedOrder.transactionId && (
                      <div>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Transaction ID</p>
                        <p className="font-semibold text-gray-900 dark:text-white">{selectedOrder.transactionId}</p>
                      </div>
                    )}
                    {selectedOrder.paymentStatusName && (
                      <div>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Payment Status</p>
                        <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(selectedOrder.paymentStatusName)}`}>
                          {getStatusIcon(selectedOrder.paymentStatusName)}
                          {selectedOrder.paymentStatusName}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentOrderManagement;
