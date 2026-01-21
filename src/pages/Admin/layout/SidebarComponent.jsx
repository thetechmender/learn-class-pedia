import { BookOpen, X, ChevronLeft, ChevronRight, LayoutDashboard, TrendingUp, User, LogOut, Star, MessageCircle, Link2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { useDynamicRoutes } from '../../../hooks/useDynamicRoutes';
import { useAuth } from '../../../context/AuthContext';

export function Sidebar({ isOpen, onClose, isCollapsed, onToggleCollapse }) {
  const navigate = useNavigate();
  const { logout, user } = useAuth();
  const { getMainNavItems, getManagementItems, loading, error } = useDynamicRoutes();
  const [activeRoute, setActiveRoute] = useState('/admin/dashboard');

  const handleNavigation = (path) => {
    setActiveRoute(path);
    navigate(path);
    if (isOpen) {
      onClose();
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/admin/login');
  };

  const mainNavItems = getMainNavItems();
  const managementItems = getManagementItems();
  
  // Handle loading state
  if (loading) {
    return (
      <aside className={`fixed lg:sticky inset-y-0 left-0 z-50 top-0 ${isCollapsed ? 'w-20' : 'w-64'} bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800`}>
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-between p-5 border-b border-gray-200 dark:border-gray-800">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center shadow-lg">
                <BookOpen className="w-4 h-4 text-white" />
              </div>
              {!isCollapsed && (
                <span className="font-bold text-lg bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Classpedia</span>
              )}
            </div>
          </div>
          <div className="flex-1 flex items-center justify-center">
            <div className="text-gray-500 dark:text-gray-400">Loading...</div>
          </div>
        </div>
      </aside>
    );
  }

  // Handle error state
  if (error) {
    console.error('Sidebar error:', error);
    return (
      <aside className={`fixed lg:sticky inset-y-0 left-0 z-50 top-0 ${isCollapsed ? 'w-20' : 'w-64'} bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800`}>
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-between p-5 border-b border-gray-200 dark:border-gray-800">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center shadow-lg">
                <BookOpen className="w-4 h-4 text-white" />
              </div>
              {!isCollapsed && (
                <span className="font-bold text-lg bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Classpedia</span>
              )}
            </div>
          </div>
          <div className="flex-1 flex items-center justify-center p-4">
            <div className="text-red-500 dark:text-red-400 text-sm text-center">
              {isCollapsed ? 'Error' : `Error: ${error}`}
            </div>
          </div>
        </div>
      </aside>
    );
  }

  console.log('Sidebar - mainNavItems:', mainNavItems);
  console.log('Sidebar - managementItems:', managementItems);
  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}
      
      {/* Sidebar */}
      <aside
        className={`
          fixed lg:sticky inset-y-0 left-0 z-50 top-0
          ${isCollapsed ? 'w-20' : 'w-64'} bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800
          transform transition-all duration-300 ease-in-out
          ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
      >
        <div className="flex flex-col h-full">
          {/* Logo and Collapse Toggle */}
          <div className="flex items-center justify-between p-5 border-b border-gray-200 dark:border-gray-800">
            <div className="flex items-center gap-2 min-w-0">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center shadow-lg flex-shrink-0">
                <BookOpen className="w-4 h-4 text-white" />
              </div>
              {!isCollapsed && (
                <span className="font-bold text-lg bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent whitespace-nowrap">Classpedia</span>
              )}
            </div>
            <div className="flex items-center gap-2">
              {/* Collapse Toggle - Desktop Only */}
              <button
                onClick={onToggleCollapse}
                className="hidden lg:flex items-center justify-center p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded transition-colors flex-shrink-0"
                title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
              >
                {isCollapsed ? (
                  <ChevronRight className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                ) : (
                  <ChevronLeft className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                )}
              </button>
              <button 
                onClick={onClose}
                className="lg:hidden p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded transition-colors flex-shrink-0"
              >
                <X className="w-4 h-4 text-gray-600 dark:text-gray-400" />
              </button>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-6 overflow-y-auto">
            {/* Main Navigation */}
            <div>
              {!isCollapsed && (
                <h3 className="px-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
                  Main Menu
                </h3>
              )}
              <div className="space-y-1">
                {mainNavItems.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => handleNavigation(item.path)}
                    className={`
                      w-full flex items-center ${isCollapsed ? 'justify-center' : 'gap-2'} px-3 py-3 rounded-lg
                      transition-all duration-200 relative
                      ${activeRoute === item.path
                        ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg shadow-blue-500/30' 
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                      }
                    `}
                    title={isCollapsed ? item.label : undefined}
                  >
                    <item.icon className={`w-4 h-4 flex-shrink-0 ${isCollapsed ? 'mx-auto' : ''}`} />
                    {!isCollapsed && <span className="font-medium text-sm truncate">{item.label}</span>}
                  </button>
                ))}
              </div>
            </div>

            {/* Management Section */}
            <div>
              {!isCollapsed && (
                <h3 className="px-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
                  Management
                </h3>
              )}
              <div className="space-y-1">
                {managementItems.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => handleNavigation(item.path)}
                    className={`
                      w-full flex items-center ${isCollapsed ? 'justify-center' : 'gap-2'} px-3 py-3 rounded-lg
                      transition-all duration-200 relative
                      ${activeRoute === item.path
                        ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg shadow-blue-500/30' 
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                      }
                    `}
                    title={isCollapsed ? item.label : undefined}
                  >
                    <item.icon className={`w-4 h-4 flex-shrink-0 ${isCollapsed ? 'mx-auto' : ''}`} />
                    {!isCollapsed && <span className="font-medium text-sm truncate">{item.label}</span>}
                  </button>
                ))}
              </div>
            </div>

            {/* Logout Button */}
            <div className="p-4 border-t border-gray-200 dark:border-gray-800">
              <button
                onClick={handleLogout}
                className={`
                  w-full flex items-center ${isCollapsed ? 'justify-center' : 'gap-2'} px-3 py-3 rounded-lg
                  transition-all duration-200 relative
                  text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20
                `}
                title={isCollapsed ? 'Logout' : undefined}
              >
                <LogOut className={`w-4 h-4 flex-shrink-0 ${isCollapsed ? 'mx-auto' : ''}`} />
                {!isCollapsed && <span className="font-medium text-sm">Logout</span>}
              </button>
            </div>
          </nav>
        </div>
      </aside>
    </>
  );
}
