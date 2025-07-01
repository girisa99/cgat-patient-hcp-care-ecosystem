
import React from 'react';
import MainLayout from '@/components/layout/MainLayout';
import { PageContainer } from '@/components/layout/PageContainer';
import UnifiedDashboard from '@/components/dashboard/UnifiedDashboard';
import { useDashboardPage } from '@/hooks/useDashboardPage';
import { Card, CardContent } from '@/components/ui/card';

/**
 * Dashboard Page - LOCKED IMPLEMENTATION
 * Uses dedicated useDashboardPage hook for consistent data access
 * DO NOT MODIFY - This page is locked for stability
 */
const Dashboard = () => {
  const { loading, meta } = useDashboardPage();

  console.log('🔒 Dashboard Page - LOCKED VERSION active with hook version:', meta.hookVersion);

  if (loading) {
    return (
      <MainLayout>
        <PageContainer title="Dashboard" subtitle="Loading system overview...">
          <Card>
            <CardContent className="p-8 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p>Loading dashboard data...</p>
            </CardContent>
          </Card>
        </PageContainer>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <PageContainer
        title="Dashboard"
        subtitle={`Welcome back! Here's your system overview.`}
        fluid
      >
        {/* LOCKED STATUS INDICATOR */}
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
          <div className="flex items-center gap-2 mb-2">
            <div className="h-2 w-2 bg-green-500 rounded-full"></div>
            <h3 className="font-semibold text-green-900">🔒 Dashboard Locked & Stable</h3>
          </div>
          <p className="text-sm text-green-700">
            Dashboard using consolidated data sources with single source of truth validation
          </p>
          <p className="text-xs text-green-600 mt-1">
            Hook Version: {meta.hookVersion} | Implementation Locked: {meta.implementationLocked ? '✅' : '❌'}
          </p>
        </div>

        <UnifiedDashboard />
      </PageContainer>
    </MainLayout>
  );
};

export default Dashboard;
