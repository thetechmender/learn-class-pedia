import { XCircle, AlertTriangle, Info } from 'lucide-react';

const ConfirmationModal = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  type = 'warning', // 'warning', 'info', 'danger'
  confirmText = 'Confirm',
  cancelText = 'Cancel'
}) => {
  if (!isOpen) return null;

  const getIconAndColors = () => {
    switch (type) {
      case 'danger':
        return {
          icon: <AlertTriangle className="w-6 h-6" />,
          bgColor: 'bg-red-50',
          borderColor: 'border-red-200',
          iconColor: 'text-red-600',
          titleColor: 'text-red-800',
          messageColor: 'text-red-700',
          confirmBg: 'bg-red-600 hover:bg-red-700'
        };
      case 'info':
        return {
          icon: <Info className="w-6 h-6" />,
          bgColor: 'bg-blue-50',
          borderColor: 'border-blue-200',
          iconColor: 'text-blue-600',
          titleColor: 'text-blue-800',
          messageColor: 'text-blue-700',
          confirmBg: 'bg-blue-600 hover:bg-blue-700'
        };
      default: // warning
        return {
          icon: <AlertTriangle className="w-6 h-6" />,
          bgColor: 'bg-yellow-50',
          borderColor: 'border-yellow-200',
          iconColor: 'text-yellow-600',
          titleColor: 'text-yellow-800',
          messageColor: 'text-yellow-700',
          confirmBg: 'bg-yellow-600 hover:bg-yellow-700'
        };
    }
  };

  const colors = getIconAndColors();

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full mx-4">
        {/* Header */}
        <div className={`${colors.bgColor} ${colors.borderColor} border-b px-6 py-4 rounded-t-xl flex items-center justify-between`}>
          <div className="flex items-center">
            <div className={`${colors.iconColor} mr-3`}>
              {colors.icon}
            </div>
            <h3 className={`text-lg font-semibold ${colors.titleColor}`}>
              {title}
            </h3>
          </div>
          <button
            onClick={onClose}
            className={`${colors.iconColor} hover:opacity-70 transition-opacity`}
          >
            <XCircle className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-4">
          <p className={`${colors.messageColor} text-sm leading-relaxed`}>
            {message}
          </p>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-gray-50 rounded-b-xl flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-600 bg-gray-200 hover:bg-gray-300 rounded-lg transition-colors font-medium text-sm"
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            className={`px-4 py-2 text-white rounded-lg transition-colors font-medium text-sm ${colors.confirmBg}`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationModal;
