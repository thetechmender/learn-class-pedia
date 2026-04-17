import { useState, useEffect, useCallback } from 'react';
import ApiService from '../../services/ApiService';

export const usePaymentProviderAccounts = () => {
  // State management
  const [paymentProviderAccounts, setPaymentProviderAccounts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch all payment provider accounts
  const fetchPaymentProviderAccounts = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await ApiService.getAllPaymentProviderAccounts();
      
      // Handle response structure
      if (response && response.success && Array.isArray(response.data)) {
        setPaymentProviderAccounts(response.data);
      } else if (Array.isArray(response)) {
        setPaymentProviderAccounts(response);
      } else {
        console.warn('Unexpected response structure:', response);
        setPaymentProviderAccounts([]);
      }
    } catch (err) {
      console.error('Error fetching payment provider accounts:', err);
      setError('Failed to fetch payment provider accounts: ' + (err.message || 'Unknown error'));
      setPaymentProviderAccounts([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Get payment provider account by ID
  const getPaymentProviderAccountById = useCallback(async (id) => {
    try {
      setLoading(true);
      setError(null);
      const data = await ApiService.getPaymentProviderAccountById(id);
      return data;
    } catch (err) {
      setError('Failed to fetch payment provider account');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Create new payment provider account
  const createPaymentProviderAccount = useCallback(async (accountData) => {
    try {
      setLoading(true);
      setError(null);
      const data = await ApiService.createPaymentProviderAccount(accountData);
      await fetchPaymentProviderAccounts(); // Refresh the list
      return data;
    } catch (err) {
      setError('Failed to create payment provider account');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [fetchPaymentProviderAccounts]);

  // Update payment provider account
  const updatePaymentProviderAccount = useCallback(async (id, accountData) => {
    try {
      setLoading(true);
      setError(null);
      const data = await ApiService.updatePaymentProviderAccount(id, accountData);
      await fetchPaymentProviderAccounts(); // Refresh the list
      return data;
    } catch (err) {
      setError('Failed to update payment provider account');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [fetchPaymentProviderAccounts]);

  // Delete payment provider account
  const deletePaymentProviderAccount = useCallback(async (id) => {
    try {
      setLoading(true);
      setError(null);
      const data = await ApiService.deletePaymentProviderAccount(id);
      await fetchPaymentProviderAccounts(); // Refresh the list
      return data;
    } catch (err) {
      setError('Failed to delete payment provider account');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [fetchPaymentProviderAccounts]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    // State
    paymentProviderAccounts,
    loading,
    error,

    // Actions
    fetchPaymentProviderAccounts,
    getPaymentProviderAccountById,
    createPaymentProviderAccount,
    updatePaymentProviderAccount,
    deletePaymentProviderAccount,

    // Utilities
    clearError,
  };
};
