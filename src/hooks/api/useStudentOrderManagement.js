import { useState, useCallback } from 'react';
import ApiService from '../../services/ApiService';
import { ENDPOINTS } from '../../config/api';

const useStudentOrderManagement = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [orders, setOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [paymentMethods, setPaymentMethods] = useState([]);
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
    setLoading(true);
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
      setLoading(false);
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
  const getPaymentMethods = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await ApiService.get(ENDPOINTS.PAYMENT_METHOD);
      
      if (response && Array.isArray(response)) {
        setPaymentMethods(response);
      } else {
        setPaymentMethods(response.data || []);
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

  // Filter orders
  const filterOrders = useCallback(async (filters, pageNumber = 1, pageSize = 100) => {
    const activeFilters = {};
    
    Object.keys(filters).forEach(key => {
      if (filters[key] && filters[key] !== '') {
        activeFilters[key] = filters[key];
      }
    });
    
    return getAllOrders(pageNumber, pageSize, activeFilters);
  }, [getAllOrders]);

  return {
    loading,
    error,
    orders,
    selectedOrder,
    pagination,
    paymentMethods,
    getAllOrders,
    getOrderById,
    searchOrders,
    filterOrders,
    getPaymentMethods,
    clearError,
    setSelectedOrder,
  };
};

export default useStudentOrderManagement;
