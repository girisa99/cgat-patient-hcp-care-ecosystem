
import React from 'react';
import { Helmet } from 'react-helmet-async';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { SystemVerificationDashboard } from '@/components/admin/SystemVerification/SystemVerificationDashboard';

const SystemVerificationPage: React.FC = () => {
  return (
    <>
      <Helmet>
        <title>System Verification - GENIE Healthcare Admin</title>
        <meta name="description" content="Comprehensive system verification and testing dashboard" />
      </Helmet>
      
      <DashboardLayout>
        <SystemVerificationDashboard />
      </DashboardLayout>
    </>
  );
};

export default SystemVerificationPage;
