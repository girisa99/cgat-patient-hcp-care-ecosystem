
import React from 'react';
import MainLayout from '@/components/layout/MainLayout';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { CollaborativeOnboardingView } from '@/components/onboarding/CollaborativeOnboardingView';

const CollaborativeOnboardingPage = () => {
  return (
    <ProtectedRoute>
      <MainLayout>
        <CollaborativeOnboardingView />
      </MainLayout>
    </ProtectedRoute>
  );
};

export default CollaborativeOnboardingPage;
