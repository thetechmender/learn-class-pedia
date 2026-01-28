import { useState, useCallback } from 'react';

/**
 * Custom hook for managing modal state
 * @returns {Object} Modal state and handlers
 */
export const useModalState = () => {
  const [modalState, setModalState] = useState({
    isOpen: false,
    mode: null, // 'create' | 'edit' | 'delete'
    course: null,
    loading: false,
    error: ''
  });

  const openModal = useCallback((mode, course = null) => {
    setModalState({
      isOpen: true,
      mode,
      course,
      loading: false,
      error: ''
    });
  }, []);

  const closeModal = useCallback(() => {
    setModalState({
      isOpen: false,
      mode: null,
      course: null,
      loading: false,
      error: ''
    });
  }, []);

  const setModalLoading = useCallback((loading) => {
    setModalState(prev => ({ ...prev, loading }));
  }, []);

  const setModalError = useCallback((error) => {
    setModalState(prev => ({ ...prev, error }));
  }, []);

  return {
    modalState,
    openModal,
    closeModal,
    setModalLoading,
    setModalError
  };
};
