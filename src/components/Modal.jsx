import React from 'react';
import { X } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

const Modal = ({ isOpen, onClose, title, children }) => {
  const { theme } = useTheme();
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-auto bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div className={`rounded-lg shadow-xl max-w-md w-full max-h-screen overflow-y-auto ${
        theme === 'dark' ? 'bg-gray-800' : 'bg-white'
      }`}>
        <div className={`flex items-center justify-between p-6 border-b ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
          <h2 className={`text-lg font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{title}</h2>
          <button
            onClick={onClose}
            className={`p-1 rounded-full transition-colors ${theme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
          >
            <X size={20} className={theme === 'dark' ? 'text-gray-400' : 'text-gray-500'} />
          </button>
        </div>
        <div className={`p-6 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
          {children}
        </div>
      </div>
    </div>
  );
};

export default Modal;
