import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  Eye, 
  Link2,
  Filter,
  Copy,
  ExternalLink,
  CheckCircle,
  XCircle,
  Clock,
  BarChart3,
  Globe,
  Shield,
  AlertCircle,
  TrendingUp
} from 'lucide-react';

const CourseUrlManagement = () => {
  const [urls, setUrls] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterType, setFilterType] = useState('all');
  const [showAddModal, setShowAddModal] = useState(false);

  useEffect(() => {
    // Mock data - replace with actual API call
    setUrls([
      {
        id: 1,
        courseTitle: 'React Fundamentals',
        url: 'https://learn.example.com/react-fundamentals',
        shortCode: 'react101',
        type: 'custom',
        status: 'active',
        clicks: 1234,
        uniqueVisitors: 892,
        conversionRate: 23.5,
        createdAt: '2024-01-15',
        lastAccessed: '2024-01-20',
        expiresAt: '2024-12-31',
        trackingEnabled: true,
        passwordProtected: false,
        description: 'Main course landing page with full curriculum'
      },
      {
        id: 2,
        courseTitle: 'Advanced JavaScript',
        url: 'https://learn.example.com/js-advanced',
        shortCode: 'js202',
        type: 'generated',
        status: 'active',
        clicks: 856,
        uniqueVisitors: 623,
        conversionRate: 18.2,
        createdAt: '2024-01-10',
        lastAccessed: '2024-01-19',
        expiresAt: null,
        trackingEnabled: true,
        passwordProtected: true,
        description: 'Advanced JavaScript concepts and patterns'
      },
      {
        id: 3,
        courseTitle: 'UI/UX Design Principles',
        url: 'https://learn.example.com/design-principles',
        shortCode: 'design301',
        type: 'custom',
        status: 'inactive',
        clicks: 445,
        uniqueVisitors: 312,
        conversionRate: 15.8,
        createdAt: '2024-01-05',
        lastAccessed: '2024-01-12',
        expiresAt: '2024-06-30',
        trackingEnabled: false,
        passwordProtected: false,
        description: 'Introduction to UI/UX design fundamentals'
      },
      {
        id: 4,
        courseTitle: 'Python for Data Science',
        url: 'https://learn.example.com/python-ds',
        shortCode: 'python401',
        type: 'generated',
        status: 'active',
        clicks: 2156,
        uniqueVisitors: 1567,
        conversionRate: 28.9,
        createdAt: '2024-01-01',
        lastAccessed: '2024-01-20',
        expiresAt: null,
        trackingEnabled: true,
        passwordProtected: false,
        description: 'Comprehensive data science course with Python'
      }
    ]);
  }, []);

  const filteredUrls = urls.filter(url => {
    const matchesSearch = url.courseTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         url.url.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         url.shortCode.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || url.status === filterStatus;
    const matchesType = filterType === 'all' || url.type === filterType;
    return matchesSearch && matchesStatus && matchesType;
  });

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'inactive': return 'bg-gray-100 text-gray-800';
      case 'expired': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'active': return <CheckCircle className="w-4 h-4" />;
      case 'inactive': return <XCircle className="w-4 h-4" />;
      case 'expired': return <AlertCircle className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
  };

  const updateUrlStatus = (urlId, newStatus) => {
    setUrls(prev => prev.map(url => 
      url.id === urlId ? { ...url, status: newStatus } : url
    ));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">Course URL Management</h1>
            <p className="text-xs text-gray-600 dark:text-gray-300 mt-2">Manage and track course landing page URLs</p>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="mt-4 sm:mt-0 flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-5 h-5 mr-2" />
            Create New URL
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-gray-600 dark:text-gray-400">Total URLs</p>
              <p className="text-lg font-bold text-gray-900 dark:text-white mt-1">{urls.length}</p>
            </div>
            <div className="bg-blue-100 dark:bg-blue-900/30 p-3 rounded-lg">
              <Link2 className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-gray-600 dark:text-gray-400">Total Clicks</p>
              <p className="text-lg font-bold text-gray-900 dark:text-white mt-1">
                {urls.reduce((sum, url) => sum + url.clicks, 0).toLocaleString()}
              </p>
            </div>
            <div className="bg-purple-100 dark:bg-purple-900/30 p-3 rounded-lg">
              <BarChart3 className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-gray-600 dark:text-gray-400">Active URLs</p>
              <p className="text-lg font-bold text-gray-900 dark:text-white mt-1">
                {urls.filter(url => url.status === 'active').length}
              </p>
            </div>
            <div className="bg-green-100 dark:bg-green-900/30 p-3 rounded-lg">
              <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-gray-600 dark:text-gray-400">Avg Conversion</p>
              <p className="text-lg font-bold text-gray-900 dark:text-white mt-1">
                {urls.length > 0 
                  ? (urls.reduce((sum, url) => sum + url.conversionRate, 0) / urls.length).toFixed(1)
                  : '0.0'
                }%
              </p>
            </div>
            <div className="bg-yellow-100 dark:bg-yellow-900/30 p-3 rounded-lg">
              <TrendingUp className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
            </div>
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
          <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search URLs..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              />
            </div>
            
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="expired">Expired</option>
            </select>

            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
            >
              <option value="all">All Types</option>
              <option value="custom">Custom</option>
              <option value="generated">Generated</option>
            </select>
          </div>
        </div>
      </div>

      {/* URLs Table */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Course
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  URL
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Performance
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Security
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {filteredUrls.map((url) => (
                <tr key={url.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-xs font-medium text-gray-900 dark:text-white">{url.courseTitle}</div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">{url.shortCode}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center space-x-2">
                      <div className="flex-1">
                        <div className="text-xs text-gray-900 dark:text-white truncate max-w-xs">{url.url}</div>
                      </div>
                      <button
                        onClick={() => copyToClipboard(url.url)}
                        className="text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300"
                        title="Copy URL"
                      >
                        <Copy className="w-4 h-4" />
                      </button>
                      <a
                        href={url.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300"
                        title="Visit URL"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs font-medium rounded-md ${
                      url.type === 'custom' ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-400' : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300'
                    }`}>
                      {url.type}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full flex items-center ${getStatusColor(url.status)}`}>
                      {getStatusIcon(url.status)}
                      <span className="ml-1">{url.status}</span>
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-xs text-gray-900 dark:text-white">
                      <div>{url.clicks.toLocaleString()} clicks</div>
                      <div className="text-gray-500 dark:text-gray-400">{url.conversionRate}% conversion</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex space-x-2">
                      {url.trackingEnabled && (
                        <span className="px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400 text-xs rounded-md flex items-center">
                          <BarChart3 className="w-3 h-3 mr-1" />
                          Tracking
                        </span>
                      )}
                      {url.passwordProtected && (
                        <span className="px-2 py-1 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-400 text-xs rounded-md flex items-center">
                          <Shield className="w-3 h-3 mr-1" />
                          Protected
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-xs font-medium">
                    <div className="flex space-x-2">
                      <button className="text-blue-600 dark:text-blue-400 hover:text-blue-900 dark:hover:text-blue-300">
                        <Eye className="w-4 h-4" />
                      </button>
                      <button className="text-green-600 dark:text-green-400 hover:text-green-900 dark:hover:text-green-300">
                        <Edit className="w-4 h-4" />
                      </button>
                      <button className="text-red-600 dark:text-red-400 hover:text-red-900 dark:hover:text-red-300">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {filteredUrls.length === 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-12 text-center">
          <Link2 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-2">No URLs found</h3>
          <p className="text-xs text-gray-500 dark:text-gray-400">Try adjusting your search or filter criteria</p>
        </div>
      )}
    </div>
  );
};

export default CourseUrlManagement;