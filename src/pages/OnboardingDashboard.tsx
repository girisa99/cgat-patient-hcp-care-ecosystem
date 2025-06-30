
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
import { EnhancedOnboardingWizard } from '@/components/onboarding/EnhancedOnboardingWizard';

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
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold">
                {editingApplicationId ? "Edit Onboarding Application" : "Create New Onboarding Application"}
              </h1>
              <p className="text-muted-foreground">
                Complete your treatment center onboarding process
              </p>
            </div>
            <Button variant="outline" onClick={handleBackToDashboard}>
              Back to Dashboard
            </Button>
          </div>

          <EnhancedOnboardingWizard
            onSubmit={handleWizardSubmit}
            initialData={existingApplication}
            applicationId={editingApplicationId}
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
