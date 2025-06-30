
import React from 'react';
import UnifiedDashboardLayout from '@/components/layout/UnifiedDashboardLayout';
import { SystemVerificationDashboard } from '@/components/admin/SystemVerification/SystemVerificationDashboard';

const SystemVerificationPage: React.FC = () => {
  return (
    <UnifiedDashboardLayout>
      <SystemVerificationDashboard />
    </UnifiedDashboardLayout>
  );
};

export default SystemVerificationPage;
