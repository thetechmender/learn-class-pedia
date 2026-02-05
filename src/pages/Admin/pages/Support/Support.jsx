import React from 'react';
import { HelpCircle as HelpCircleIcon } from 'lucide-react';
import AdminPageLayout from '../../../../components/AdminPageLayout';

const Support = () => {
  return (
    <AdminPageLayout
      title="Support"
      subtitle="Get help and support for your questions"
      icon={HelpCircleIcon}
      loading={false}
      skeletonType="simple"
    >
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <p className="text-gray-600 dark:text-gray-400">
          Support page content will be implemented here.
        </p>
      </div>
    </AdminPageLayout>
  );
};

export default Support;
