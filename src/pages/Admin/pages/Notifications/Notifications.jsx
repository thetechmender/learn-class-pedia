import React from 'react';
import { Bell as BellIcon } from 'lucide-react';
import AdminPageLayout from '../../../../components/AdminPageLayout';

const Notifications = () => {
  return (
    <AdminPageLayout
      title="Notifications"
      subtitle="Manage your notifications and alerts"
      icon={BellIcon}
      loading={false}
      skeletonType="simple"
    >
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <p className="text-gray-600 dark:text-gray-400">
          Notifications page content will be implemented here.
        </p>
      </div>
    </AdminPageLayout>
  );
};

export default Notifications;
