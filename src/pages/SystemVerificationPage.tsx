
import React from 'react';
import UnifiedDashboardLayout from '@/components/layout/UnifiedDashboardLayout';
import { SystemVerificationDashboard } from '@/components/verification/SystemVerificationDashboard';

const SystemVerificationPage: React.FC = () => {
  return (
    <UnifiedDashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">System Verification Dashboard</h1>
          <p className="text-gray-600">
            Comprehensive verification of all system components after Phase 1 consolidation
          </p>
        </div>
        <SystemVerificationDashboard />
      </div>
    </UnifiedDashboardLayout>
  );
};

export default SystemVerificationPage;
