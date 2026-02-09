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
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pb-4">
            {stats.map((stat, index) => (
              <div key={index} className="bg-white dark:bg-gray-800 rounded-lg p-3 shadow-sm border border-gray-100 dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <div className={`${stat.iconBg} p-2 rounded-lg`}>
                    <div className="w-4 h-4">
                      {stat.icon}
                    </div>
                  </div>
                  <div className="text-right">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                      {stat.value}
                    </h3>
                    <p className="text-xs text-gray-600 dark:text-gray-400">
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
