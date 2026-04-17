import { useState, useEffect, useCallback } from 'react';
import ApiService from '../../services/ApiService';

export const usePaymentProviders = () => {
  // State management
  const [paymentProviders, setPaymentProviders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch all payment providers
  const fetchPaymentProviders = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await ApiService.getAllPaymentProviders();
      
      // Handle response structure
      if (response && response.success && Array.isArray(response.data)) {
        setPaymentProviders(response.data);
      } else if (Array.isArray(response)) {
        setPaymentProviders(response);
      } else {
        console.warn('Unexpected response structure:', response);
        setPaymentProviders([]);
      }
    } catch (err) {
      console.error('Error fetching payment providers:', err);
      setError('Failed to fetch payment providers: ' + (err.message || 'Unknown error'));
      setPaymentProviders([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Get payment provider by ID
  const getPaymentProviderById = useCallback(async (id) => {
    try {
      setLoading(true);
      setError(null);
      const data = await ApiService.getPaymentProviderById(id);
      return data;
    } catch (err) {
      setError('Failed to fetch payment provider');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Create new payment provider
  const createPaymentProvider = useCallback(async (providerData) => {
    try {
      setLoading(true);
      setError(null);
      const data = await ApiService.createPaymentProvider(providerData);
      await fetchPaymentProviders(); // Refresh the list
      return data;
    } catch (err) {
      setError('Failed to create payment provider');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [fetchPaymentProviders]);

  // Update payment provider
  const updatePaymentProvider = useCallback(async (id, providerData) => {
    try {
      setLoading(true);
      setError(null);
      const data = await ApiService.updatePaymentProvider(id, providerData);
      await fetchPaymentProviders(); // Refresh the list
      return data;
    } catch (err) {
      setError('Failed to update payment provider');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [fetchPaymentProviders]);

  // Delete payment provider
  const deletePaymentProvider = useCallback(async (id) => {
    try {
      setLoading(true);
      setError(null);
      const data = await ApiService.deletePaymentProvider(id);
      await fetchPaymentProviders(); // Refresh the list
      return data;
    } catch (err) {
      setError('Failed to delete payment provider');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [fetchPaymentProviders]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    // State
    paymentProviders,
    loading,
    error,

    // Actions
    fetchPaymentProviders,
    getPaymentProviderById,
    createPaymentProvider,
    updatePaymentProvider,
    deletePaymentProvider,

    // Utilities
    clearError,
  };
};
