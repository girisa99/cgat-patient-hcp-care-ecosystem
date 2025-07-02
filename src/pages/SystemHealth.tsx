
import React from 'react';
import MainLayout from '@/components/layout/MainLayout';
import { PageContainer } from '@/components/layout/PageContainer';
import { SystemHealthDashboard } from '@/components/system/SystemHealthDashboard';
import { SystemStatusBanner } from '@/components/layout/SystemStatusBanner';

/**
 * System Health Page - Shows the status of the RLS fix and overall system health
 */
const SystemHealth: React.FC = () => {
  return (
    <MainLayout>
      <PageContainer
        title="System Health"
        subtitle="Monitor system status and RLS policy health"
      >
        <div className="space-y-6">
          <SystemStatusBanner />
          <SystemHealthDashboard />
        </div>
      </PageContainer>
    </MainLayout>
  );
};

export default SystemHealth;
