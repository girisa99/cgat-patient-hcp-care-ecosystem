
import React from 'react';
import MainLayout from '@/components/layout/MainLayout';
import { PageContainer } from '@/components/layout/PageContainer';

const SettingsPage: React.FC = () => {
  return (
    <MainLayout>
      <PageContainer
        title="Settings"
        subtitle="Configure system settings and preferences"
      >
        <p>Settings content will be implemented here.</p>
      </PageContainer>
    </MainLayout>
  );
};

export default SettingsPage;
