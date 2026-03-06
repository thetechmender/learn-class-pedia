import { useState, useCallback } from 'react';

/**
 * Custom hook for managing toast notifications
 * @returns {Object} Toast state and show/hide functions
 */
export const useToast = () => {
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

  const showToast = useCallback((message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: '', type }), 3000);
  }, []);

  const hideToast = useCallback(() => {
    setToast({ show: false, message: '', type: '' });
  }, []);

  return {
    toast,
    showToast,
    hideToast
  };
};
