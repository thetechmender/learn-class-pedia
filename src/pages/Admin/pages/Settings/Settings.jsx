import React from 'react';
import { Settings as SettingsIcon } from 'lucide-react';
import AdminPageLayout from '../../../../components/AdminPageLayout';

const Settings = () => {
  return (
    <AdminPageLayout
      title="Settings"
      subtitle="Manage your application settings and preferences"
      icon={SettingsIcon}
      loading={false}
      skeletonType="simple"
    >
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <p className="text-gray-600 dark:text-gray-400">
          Settings page content will be implemented here.
        </p>
      </div>
    </AdminPageLayout>
  );
};

export default Settings;
