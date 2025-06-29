
import React from 'react';
import MainLayout from '@/components/layout/MainLayout';
import { PageContainer } from '@/components/layout/PageContainer';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import RoutingPreferences from '@/components/routing/RoutingPreferences';

const Settings = () => {
  return (
    <ProtectedRoute>
      <MainLayout>
        <PageContainer
          title="Settings"
          subtitle="Customize your portal experience and preferences"
        >
          <RoutingPreferences />
        </PageContainer>
      </MainLayout>
    </ProtectedRoute>
  );
};

export default Settings;
