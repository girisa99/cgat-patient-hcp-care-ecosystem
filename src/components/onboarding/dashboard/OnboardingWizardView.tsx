
import React from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { TreatmentCenterOnboardingWizard } from '@/components/onboarding/TreatmentCenterOnboardingWizard';

interface OnboardingWizardViewProps {
  onSubmit: (data: any) => Promise<void>;
  onBack: () => void;
  existingApplication: any;
  editingApplicationId: string | null;
}

export const OnboardingWizardView: React.FC<OnboardingWizardViewProps> = ({
  onSubmit,
  onBack,
  existingApplication,
  editingApplicationId,
}) => {
  // Transform the database data to match the TypeScript interface
  const transformedApplication = existingApplication ? {
    ...existingApplication,
    // Handle operational_hours type conversion
    operational_hours: typeof existingApplication.operational_hours === 'string' 
      ? JSON.parse(existingApplication.operational_hours) 
      : existingApplication.operational_hours,
    // Handle gpo_memberships - convert string[] to GPOMembership[]
    gpo_memberships: Array.isArray(existingApplication.gpo_memberships) 
      ? existingApplication.gpo_memberships.map((gpoName: string) => ({
          gpo_name: gpoName,
          membership_number: '',
          contract_effective_date: '',
          contract_expiration_date: '',
          primary_contact_name: '',
          primary_contact_email: '',
          primary_contact_phone: '',
          covered_categories: [],
          tier_level: '',
          rebate_information: {}
        }))
      : [],
    // Handle other array fields
    preferred_payment_methods: Array.isArray(existingApplication.preferred_payment_methods)
      ? existingApplication.preferred_payment_methods
      : existingApplication.preferred_payment_methods ? [existingApplication.preferred_payment_methods] : [],
    selected_distributors: Array.isArray(existingApplication.selected_distributors)
      ? existingApplication.selected_distributors
      : existingApplication.selected_distributors ? [existingApplication.selected_distributors] : [],
    business_types: Array.isArray(existingApplication.business_types)
      ? existingApplication.business_types
      : existingApplication.business_types ? [existingApplication.business_types] : []
  } : null;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">
            {editingApplicationId ? "Edit Onboarding Application" : "Create New Onboarding Application"}
          </h1>
          <p className="text-muted-foreground">
            Complete your treatment center onboarding process
          </p>
        </div>
        <Button variant="outline" onClick={onBack}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Dashboard
        </Button>
      </div>

      <TreatmentCenterOnboardingWizard 
        onSubmit={onSubmit}
        initialData={transformedApplication}
        isEditing={!!editingApplicationId}
      />
    </div>
  );
};
