
import React from 'react';
import UnifiedDashboardLayout from '@/components/layout/UnifiedDashboardLayout';
import UnifiedDashboard from '@/components/dashboard/UnifiedDashboard';

const Index: React.FC = () => {
  return (
    <UnifiedDashboardLayout>
      <div className="p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Healthcare Management Dashboard</h1>
          <p className="text-gray-600">Unified system overview with consolidated data sources</p>
        </div>
        <UnifiedDashboard />
      </div>
    </UnifiedDashboardLayout>
  );
};

export default Index;
