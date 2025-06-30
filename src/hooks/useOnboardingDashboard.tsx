
import { useState } from 'react';
import { useTreatmentCenterOnboarding } from './useTreatmentCenterOnboarding';
import { useToast } from './use-toast';

export const useOnboardingDashboard = () => {
  const [view, setView] = useState<'dashboard' | 'wizard'>('dashboard');
  const [editingApplicationId, setEditingApplicationId] = useState<string | null>(null);
  const { onboardingApplications, isLoading, createApplication, updateApplication } = useTreatmentCenterOnboarding();
  const { toast } = useToast();

  const handleCreateNew = () => {
    setEditingApplicationId(null);
    setView('wizard');
  };

  const handleEditApplication = (applicationId: string) => {
    setEditingApplicationId(applicationId);
    setView('wizard');
  };

  const handleWizardSubmit = async (data: any) => {
    try {
      if (editingApplicationId) {
        // Fix: Pass an object with id and updates properties
        await updateApplication({ id: editingApplicationId, updates: data });
        toast({
          title: "Application Updated",
          description: "Your onboarding application has been updated successfully.",
        });
      } else {
        await createApplication(data);
        toast({
          title: "Application Created",
          description: "Your onboarding application has been created successfully.",
        });
      }
      setView('dashboard');
      setEditingApplicationId(null);
    } catch (error) {
      toast({
        title: "Error",
        description: "There was an error saving your application. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleBackToDashboard = () => {
    setView('dashboard');
    setEditingApplicationId(null);
  };

  return {
    view,
    editingApplicationId,
    onboardingApplications,
    isLoading,
    handleCreateNew,
    handleEditApplication,
    handleWizardSubmit,
    handleBackToDashboard,
  };
};
