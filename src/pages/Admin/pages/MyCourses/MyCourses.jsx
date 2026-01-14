import React from 'react';

const MyCourses = () => {
  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">My Courses</h1>
      
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-4">
          Student Course Dashboard
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Sample course cards */}
          <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:shadow-lg transition-shadow">
            <div className="w-full h-32 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg mb-4"></div>
            <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Introduction to React</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">Learn the fundamentals of React development</p>
            <div className="flex justify-between items-center">
              <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">In Progress</span>
              <span className="text-xs text-gray-500">75% Complete</span>
            </div>
          </div>

          <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:shadow-lg transition-shadow">
            <div className="w-full h-32 bg-gradient-to-r from-green-500 to-teal-600 rounded-lg mb-4"></div>
            <h3 className="font-semibold text-gray-900 dark:text-white mb-2">JavaScript Advanced</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">Master advanced JavaScript concepts</p>
            <div className="flex justify-between items-center">
              <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">Completed</span>
              <span className="text-xs text-gray-500">100% Complete</span>
            </div>
          </div>

          <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:shadow-lg transition-shadow">
            <div className="w-full h-32 bg-gradient-to-r from-orange-500 to-red-600 rounded-lg mb-4"></div>
            <h3 className="font-semibold text-gray-900 dark:text-white mb-2">CSS & Tailwind</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">Modern CSS styling with Tailwind</p>
            <div className="flex justify-between items-center">
              <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded">Not Started</span>
              <span className="text-xs text-gray-500">0% Complete</span>
            </div>
          </div>
        </div>

        <div className="mt-8 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
          <p className="text-sm text-blue-800 dark:text-blue-200">
            <strong>Note:</strong> This is a student-only page. Admin users won't see this page in their navigation.
          </p>
        </div>
      </div>
    </div>
  );
};

export default MyCourses;
