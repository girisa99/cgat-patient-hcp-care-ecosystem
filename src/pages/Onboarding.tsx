
import React from 'react';
import MainLayout from '@/components/layout/MainLayout';
import { PageContainer } from '@/components/layout/PageContainer';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { TreatmentCenterOnboardingWizard } from '@/components/onboarding/TreatmentCenterOnboardingWizard';
import { TreatmentCenterOnboarding } from '@/types/onboarding';
import { useToast } from '@/hooks/use-toast';

const OnboardingPage = () => {
  const { toast } = useToast();

  const handleSubmit = async (data: TreatmentCenterOnboarding) => {
    try {
      console.log('Submitting onboarding data:', data);
      
      // Here you would typically send the data to your backend
      // For now, we'll just show a success message
      toast({
        title: "Application Submitted",
        description: "Your treatment center onboarding application has been submitted successfully.",
      });
    } catch (error) {
      console.error('Error submitting onboarding:', error);
      toast({
        title: "Submission Error",
        description: "Failed to submit your application. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <ProtectedRoute>
      <MainLayout>
        <PageContainer
          title="Treatment Center Onboarding"
          subtitle="Complete your onboarding process for healthcare distributors"
        >
          <TreatmentCenterOnboardingWizard onSubmit={handleSubmit} />
        </PageContainer>
      </MainLayout>
    </ProtectedRoute>
  );
};

export default OnboardingPage;
