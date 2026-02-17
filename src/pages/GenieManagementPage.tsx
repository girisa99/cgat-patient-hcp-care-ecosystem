/**
 * GENIE MANAGEMENT PAGE
 * Main page for managing all Genie instances
 */
import React from 'react';
import AppLayout from '@/components/layout/AppLayout';
import { GenieManagementDashboard } from '@/components/genie-management/GenieManagementDashboard';

export const GenieManagementPage: React.FC = () => {
  return (
    <AppLayout>
      <GenieManagementDashboard />
    </AppLayout>
  );
};

export default GenieManagementPage;