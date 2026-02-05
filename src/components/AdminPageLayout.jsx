import React from 'react';
import { useTheme } from '../context/ThemeContext';
import AdminPageSkeleton from './AdminPageSkeleton';
import AdminPageHeader from './AdminPageHeader';

const AdminPageLayout = ({ 
  children, 
  loading, 
  title, 
  subtitle, 
  icon: Icon,
  actions,
  stats,
  skeletonType = 'default'
}) => {
  const { theme } = useTheme();

  if (loading) {
    return <AdminPageSkeleton type={skeletonType} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-indigo-950">
      {/* Page Header */}
      <AdminPageHeader
        title={title}
        subtitle={subtitle}
        icon={Icon}
        actions={actions}
        stats={stats}
      />
      
      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
        {children}
      </main>
    </div>
  );
};

export default AdminPageLayout;
