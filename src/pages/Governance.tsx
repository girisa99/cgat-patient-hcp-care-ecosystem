/**
 * GOVERNANCE PAGE
 * Central dashboard for prompt governance and compliance monitoring
 */
import React from 'react';
import { GovernanceDashboard } from '@/components/monitoring/GovernanceDashboard';
import { ComplianceMonitoringWidget } from '@/components/verification/ComplianceMonitoringWidget';
import AppLayout from '@/components/layout/AppLayout';

const Governance: React.FC = () => {
  return (
    <AppLayout title="Governance Dashboard">
      <GovernanceDashboard />
    </AppLayout>
  );
};

export default Governance;