import React from 'react';
import { useAuth } from '../../../../context/AuthContext';

const MyProfile = () => {
  const { user } = useAuth();

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">My Profile</h1>
      
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <div className="flex items-center space-x-6 mb-6">
          <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-2xl font-bold">
            {user?.avatar || 'U'}
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{user?.name || 'User'}</h2>
            <p className="text-gray-600 dark:text-gray-400">{user?.email || 'user@example.com'}</p>
            <span className="inline-block mt-2 px-3 py-1 bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 rounded-full text-sm">
              {user?.role?.name || 'User'}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Account Information</h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">User ID:</span>
                <span className="text-gray-900 dark:text-white">{user?.id || 'N/A'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Role ID:</span>
                <span className="text-gray-900 dark:text-white">{user?.roleId || 'N/A'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Email:</span>
                <span className="text-gray-900 dark:text-white">{user?.email || 'N/A'}</span>
              </div>
            </div>
          </div>

          <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Role Permissions</h3>
            <div className="space-y-2">
              {user?.role?.permissions?.map((permission, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                  <span className="text-gray-900 dark:text-white capitalize">{permission}</span>
                </div>
              )) || (
                <p className="text-gray-500 dark:text-gray-400">No permissions available</p>
              )}
            </div>
          </div>
        </div>

        <div className="mt-6 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
          <p className="text-sm text-green-800 dark:text-green-200">
            <strong>Note:</strong> This page is accessible to both admin and student users.
          </p>
        </div>
      </div>
    </div>
  );
};

export default MyProfile;
