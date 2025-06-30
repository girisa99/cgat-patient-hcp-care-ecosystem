
import React from 'react';
import MainLayout from '@/components/layout/MainLayout';
import { PageContainer } from '@/components/layout/PageContainer';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { useOnboardingDashboard } from '@/hooks/useOnboardingDashboard';
import { OnboardingStats } from '@/components/onboarding/dashboard/OnboardingStats';
import { OnboardingApplicationsList } from '@/components/onboarding/dashboard/OnboardingApplicationsList';
import { OnboardingEmptyState } from '@/components/onboarding/dashboard/OnboardingEmptyState';
import { OnboardingLoadingState } from '@/components/onboarding/dashboard/OnboardingLoadingState';
import { OnboardingWizardView } from '@/components/onboarding/dashboard/OnboardingWizardView';

const OnboardingDashboard: React.FC = () => {
  const {
    view,
    editingApplicationId,
    onboardingApplications,
    isLoading,
    handleCreateNew,
    handleEditApplication,
    handleWizardSubmit,
    handleBackToDashboard,
  } = useOnboardingDashboard();

  if (isLoading) {
    return (
      <MainLayout>
        <PageContainer
          title="Onboarding Dashboard"
          subtitle="Manage treatment center onboarding workflow"
        >
          <OnboardingLoadingState />
        </PageContainer>
      </MainLayout>
    );
  }

  if (view === 'wizard') {
    const existingApplication = editingApplicationId 
      ? onboardingApplications?.find(app => app.id === editingApplicationId)
      : null;

    return (
      <MainLayout>
        <PageContainer>
          <OnboardingWizardView
            onSubmit={handleWizardSubmit}
            onBack={handleBackToDashboard}
            existingApplication={existingApplication}
            editingApplicationId={editingApplicationId}
          />
        </PageContainer>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <PageContainer
        title="Onboarding Dashboard"
        subtitle="Manage treatment center onboarding workflow and applications"
        headerActions={
          <Button onClick={handleCreateNew} className="flex items-center space-x-2">
            <Plus className="h-4 w-4" />
            <span>New Application</span>
          </Button>
        }
      >
        <div className="space-y-6">
          <OnboardingStats applications={onboardingApplications} />

          {onboardingApplications && onboardingApplications.length > 0 ? (
            <OnboardingApplicationsList
              applications={onboardingApplications}
              onEditApplication={handleEditApplication}
            />
          ) : (
            <OnboardingEmptyState onCreateNew={handleCreateNew} />
          )}
        </div>
      </PageContainer>
    </MainLayout>
  );
};

export default OnboardingDashboard;
