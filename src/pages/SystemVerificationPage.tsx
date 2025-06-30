
import React from 'react';
import { Helmet } from 'react-helmet-async';
import UnifiedDashboardLayout from '@/components/layout/UnifiedDashboardLayout';
import { SystemVerificationDashboard } from '@/components/admin/SystemVerification/SystemVerificationDashboard';

const SystemVerificationPage: React.FC = () => {
  return (
    <>
      <Helmet>
        <title>System Verification - GENIE Healthcare Admin</title>
        <meta name="description" content="Comprehensive system verification and testing dashboard" />
      </Helmet>
      
      <UnifiedDashboardLayout>
        <SystemVerificationDashboard />
      </UnifiedDashboardLayout>
    </>
  );
};

export default SystemVerificationPage;
