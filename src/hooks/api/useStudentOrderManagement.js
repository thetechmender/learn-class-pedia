import { useState, useCallback } from 'react';
import ApiService from '../../services/ApiService';
import { ENDPOINTS } from '../../config/api';

const useStudentOrderManagement = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [orders, setOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [summary, setSummary] = useState(null);
  
  // Separate loading state for order details to prevent list re-rendering
  const [loadingOrderDetails, setLoadingOrderDetails] = useState(false);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    pageSize: 100,
    totalCount: 0,
    totalPages: 0,
    hasNextPage: false,
    hasPreviousPage: false,
  });

  // Clear error
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Get all orders with pagination and filters
  const getAllOrders = useCallback(async (pageNumber = 1, pageSize = 100, filters = {}) => {
    setLoading(true);
    setError(null);
    
    try {
      const queryParams = new URLSearchParams({
        PageNumber: pageNumber.toString(),
        PageSize: pageSize.toString(),
        ...filters
      });

      const response = await ApiService.get(`${ENDPOINTS.STUDENT_ORDER_ALL}?${queryParams}`);
      
      if (response && (response.orders || response.data?.orders)) {
        const responseData = response.data || response;
        setOrders(responseData.orders || []);
        setSummary(responseData.summary || null);
        setPagination({
          currentPage: responseData.currentPage || 1,
          pageSize: responseData.pageSize || pageSize,
          totalCount: responseData.totalCount || 0,
          totalPages: responseData.totalPages || 0,
          hasNextPage: responseData.hasNextPage || false,
          hasPreviousPage: responseData.hasPreviousPage || false,
        });
        return responseData;
      } else {
        throw new Error('Invalid response format');
      }
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || 'Failed to fetch orders';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Get order by ID
  const getOrderById = useCallback(async (orderId) => {
    setLoadingOrderDetails(true);
    setError(null);
    
    try {
      const response = await ApiService.get(ENDPOINTS.STUDENT_ORDER_BY_ID(orderId));
      
      if (response && (response.id || response.data?.id)) {
        const responseData = response.data || response;
        setSelectedOrder(responseData);
        return responseData;
      } else {
        throw new Error('Invalid response format');
      }
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || 'Failed to fetch order details';
      setError(errorMessage);
      throw err;
    } finally {
      setLoadingOrderDetails(false);
    }
  }, []);

  // Search orders
  const searchOrders = useCallback(async (searchTerm, pageNumber = 1, pageSize = 100) => {
    const filters = {};
    
    if (searchTerm) {
      filters.orderNo = searchTerm;
    }
    
    return getAllOrders(pageNumber, pageSize, filters);
  }, [getAllOrders]);

  // Get payment methods
  const getPaymentMethods = useCallback(async (pageNumber = 1, pageSize = 100, filters = {}) => {
    setLoading(true);
    setError(null);

    try {
      const queryParams = new URLSearchParams({
        PageNumber: pageNumber.toString(),
        PageSize: pageSize.toString()
      });

      // Add filters to query params if provided
      if (filters.customerFullName) {
        queryParams.append('CustomerFullName', filters.customerFullName);
      }
      if (filters.customerEmail) {
        queryParams.append('CustomerEmail', filters.customerEmail);
      }
      
      const response = await ApiService.get(`${ENDPOINTS.PAYMENT_METHOD}?${queryParams}`);
      
      if (response && response.items) {
        const paymentMethodsData = response.items;
        
        setPaymentMethods(paymentMethodsData);
        
        // Update pagination state
        setPagination(prev => ({
          ...prev,
          currentPage: response.page || pageNumber,
          pageSize: response.pageSize || pageSize,
          totalCount: response.totalCount || paymentMethodsData.length,
          totalPages: Math.ceil((response.totalCount || paymentMethodsData.length) / (response.pageSize || pageSize)),
          hasNextPage: (response.page || pageNumber) < Math.ceil((response.totalCount || paymentMethodsData.length) / (response.pageSize || pageSize)),
          hasPreviousPage: (response.page || pageNumber) > 1,
        }));
        
        return response;
      } else {
        setPaymentMethods([]);
        setPagination(prev => ({
          ...prev,
          currentPage: pageNumber,
          pageSize: pageSize,
          totalCount: 0,
          totalPages: 0,
          hasNextPage: false,
          hasPreviousPage: false,
        }));
      }
      
      return response;
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || 'Failed to fetch payment methods';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Filter orders with exact DTO payload format
  const filterOrders = useCallback(async (filters, pageNumber = 1, pageSize = 100) => {
    const activeFilters = {};

    // Map filters to exact DTO property names (PascalCase)
    if (filters.orderNo && filters.orderNo !== '') {
      activeFilters.OrderNo = filters.orderNo;
    }
    if (filters.customerName && filters.customerName !== '') {
      activeFilters.CustomerName = filters.customerName;
    }
    if (filters.statusId && filters.statusId !== '') {
      const statusIdValue = parseInt(filters.statusId);
      // If statusId is 1, 2, or 4, use StatusId parameter
      if ([1, 2, 4].includes(statusIdValue)) {
        activeFilters.StatusId = statusIdValue;
      } else if (statusIdValue === 3) {
        // If statusId is 3, send it as 4 with PaymentStatusId
        activeFilters.PaymentStatusId = 4;
      } else {
        // For any other statusId, use PaymentStatusId
        activeFilters.PaymentStatusId = statusIdValue;
      }
    }
    if (filters.startDate && filters.startDate !== '') {
      activeFilters.StartDate = filters.startDate;
    }
    if (filters.endDate && filters.endDate !== '') {
      activeFilters.EndDate = filters.endDate;
    }

    return getAllOrders(pageNumber, pageSize, activeFilters);
  }, [getAllOrders]);

  // Get payment statuses dropdown
  const getPaymentStatusesDropdown = useCallback(async () => {
    try {
      const response = await ApiService.get(ENDPOINTS.STUDENT_ORDER_PAYMENT_STATUSES);
      return response || [];
    } catch (err) {
      console.error('Failed to fetch payment statuses:', err);
      return [];
    }
  }, []);

  return {
    loading,
    error,
    orders,
    selectedOrder,
    summary,
    pagination,
    paymentMethods,
    loadingOrderDetails,
    getAllOrders,
    getOrderById,
    searchOrders,
    filterOrders,
    getPaymentMethods,
    getPaymentStatusesDropdown,
    clearError,
    setSelectedOrder,
  };
};

export default useStudentOrderManagement;
