import React from 'react';
import { useTheme } from '../context/ThemeContext';

const AdminPageHeader = ({ 
  title, 
  subtitle, 
  icon: Icon, 
  actions,
  stats 
}) => {
  const { theme } = useTheme();

  return (
    <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-md shadow-sm border-b border-gray-100 dark:border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between h-auto sm:h-20 py-4 sm:py-0">
          <div className="mb-4 sm:mb-0">
            <div className="flex items-center gap-3">
              {Icon && (
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
                  <Icon className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                </div>
              )}
              <div>
                <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent dark:from-blue-400 dark:to-indigo-400">
                  {title}
                </h1>
                {subtitle && (
                  <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300 mt-1">
                    {subtitle}
                  </p>
                )}
              </div>
            </div>
          </div>
          
          {actions && (
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-2 sm:space-y-0 sm:space-x-3">
              {actions}
            </div>
          )}
        </div>
        
        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pb-6">
            {stats.map((stat, index) => (
              <div
                key={index}
                onClick={stat.onClick}
                role={stat.onClick ? 'button' : undefined}
                tabIndex={stat.onClick ? 0 : undefined}
                onKeyDown={(e) => {
                  if (!stat.onClick) return;
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    stat.onClick();
                  }
                }}
                className={`bg-white dark:bg-gray-800 rounded-xl p-5 shadow-sm border transition-all duration-200 ${
                  stat.selected
                    ? 'border-blue-400 dark:border-blue-500 ring-2 ring-blue-200 dark:ring-blue-900/40'
                    : 'border-gray-100 dark:border-gray-700'
                } ${
                  stat.onClick
                    ? 'cursor-pointer hover:shadow-md hover:-translate-y-0.5'
                    : ''
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className={`${stat.iconBg} p-3 rounded-xl`}>
                    <div className="w-5 h-5">
                      {stat.icon}
                    </div>
                  </div>
                  <div className="text-right">
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                      {stat.value}
                    </h3>
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300 leading-tight break-words">
                      {stat.label}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminPageHeader;
