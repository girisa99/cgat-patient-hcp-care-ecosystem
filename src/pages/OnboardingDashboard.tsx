
import React from 'react';
import MainLayout from '@/components/layout/MainLayout';
import { PageContainer } from '@/components/layout/PageContainer';
import { CollaborativeOnboardingView } from '@/components/onboarding/CollaborativeOnboardingView';
import { useTreatmentCenterOnboarding } from '@/hooks/useTreatmentCenterOnboarding';

const OnboardingDashboard: React.FC = () => {
  const { onboardingApplications, isLoading } = useTreatmentCenterOnboarding();

  if (isLoading) {
    return (
      <MainLayout>
        <PageContainer
          title="Onboarding Dashboard"
          subtitle="Manage treatment center onboarding workflow"
        >
          <div className="flex items-center justify-center p-8">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
              <p className="mt-4 text-muted-foreground">Loading onboarding data...</p>
            </div>
          </div>
        </PageContainer>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <PageContainer
        title="Onboarding Dashboard"
        subtitle="Manage treatment center onboarding workflow and applications"
      >
        <CollaborativeOnboardingView />
      </PageContainer>
    </MainLayout>
  );
};

export default OnboardingDashboard;
