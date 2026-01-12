import React, { useState } from 'react';
import { apiService } from '../services/api';
import { Play, RefreshCw, AlertCircle, CheckCircle } from 'lucide-react';

export default function ApiTestPanel({ courseId }) {
  const [testResults, setTestResults] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  const runTest = async (testName, testFunction) => {
    setIsLoading(true);
    setTestResults(prev => ({ ...prev, [testName]: { status: 'loading' } }));

    try {
      const result = await testFunction();
      setTestResults(prev => ({
        ...prev,
        [testName]: { status: 'success', data: result }
      }));
    } catch (error) {
      setTestResults(prev => ({
        ...prev,
        [testName]: { status: 'error', error: error.message }
      }));
    } finally {
      setIsLoading(false);
    }
  };

  const tests = [
    {
      name: 'Course Details',
      key: 'course',
      test: () => apiService.getCourseById(courseId)
    },
    {
      name: 'AI Content',
      key: 'aiContent',
      test: () => apiService.getCourseAiContent(courseId)
    },
    {
      name: 'Course Structure (ID: 2109)',
      key: 'courseStructure',
      test: () => apiService.getCourseStructure(2109)
    },
    {
      name: 'Courses (Paginated)',
      key: 'allCourses',
      test: () => apiService.getCoursesPaginated(1, 5)
    },
    {
      name: 'Audio Stream URL (ID: 1)',
      key: 'audioUrl',
      test: () => Promise.resolve({ url: apiService.getAudioStreamUrl(1) })
    },
    {
      name: 'Image Stream URL (ID: 1)',
      key: 'imageUrl',
      test: () => Promise.resolve({ url: apiService.getImageStreamUrl(1) })
    }
  ];

  const runAllTests = async () => {
    for (const test of tests) {
      await runTest(test.key, test.test);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'loading':
        return <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-600" />;
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'error':
        return <AlertCircle className="h-4 w-4 text-red-600" />;
      default:
        return <div className="h-4 w-4 bg-gray-300 rounded-full" />;
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">API Test Panel</h3>
        <button
          onClick={runAllTests}
          disabled={isLoading}
          className="inline-flex items-center bg-primary-600 text-white px-4 py-2 rounded-md hover:bg-primary-700 transition-colors disabled:opacity-50"
        >
          <RefreshCw className="h-4 w-4 mr-2" />
          Run All Tests
        </button>
      </div>

      <div className="space-y-3">
        {tests.map((test) => {
          const result = testResults[test.key];
          return (
            <div key={test.key} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-3">
                {getStatusIcon(result?.status)}
                <span className="font-medium text-gray-900">{test.name}</span>
              </div>

              <div className="flex items-center space-x-2">
                {result?.status === 'success' && (
                  <span className="text-sm text-green-600">
                    {Array.isArray(result.data) ? `${result.data.length} items` : 'Success'}
                  </span>
                )}
                {result?.status === 'error' && (
                  <span className="text-sm text-red-600 max-w-xs truncate">
                    {result.error}
                  </span>
                )}
                <button
                  onClick={() => runTest(test.key, test.test)}
                  disabled={isLoading}
                  className="p-1 text-gray-600 hover:text-primary-600 transition-colors"
                >
                  <Play className="h-4 w-4" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Results Display */}
      {Object.keys(testResults).length > 0 && (
        <div className="mt-6 pt-6 border-t">
          <h4 className="font-medium text-gray-900 mb-3">Test Results</h4>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {Object.entries(testResults).map(([key, result]) => (
              <details key={key} className="bg-gray-50 rounded p-3">
                <summary className="cursor-pointer font-medium text-gray-700">
                  {tests.find(t => t.key === key)?.name} - {result.status}
                </summary>
                <pre className="mt-2 text-xs text-gray-600 overflow-x-auto">
                  {JSON.stringify(result.data || result.error, null, 2)}
                </pre>
              </details>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}