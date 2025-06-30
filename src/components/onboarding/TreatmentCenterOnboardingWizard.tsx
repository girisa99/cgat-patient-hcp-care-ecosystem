
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { TreatmentCenterOnboarding } from '@/types/onboarding';
import { useTreatmentCenterOnboarding } from '@/hooks/useTreatmentCenterOnboarding';
import { CompanyInfoStep } from './steps/CompanyInfoStep';
import { BusinessClassificationStep } from './steps/BusinessClassificationStep';
import { ContactsStep } from './steps/ContactsStep';
import { OwnershipStep } from './steps/OwnershipStep';
import { ReferencesStep } from './steps/ReferencesStep';
import { PaymentBankingStep } from './steps/PaymentBankingStep';
import { LicensesStep } from './steps/LicensesStep';
import { DocumentsStep } from './steps/DocumentsStep';
import { AuthorizationsStep } from './steps/AuthorizationsStep';
import { ReviewStep } from './steps/ReviewStep';

interface TreatmentCenterOnboardingWizardProps {
  onSubmit: (data: TreatmentCenterOnboarding) => void;
}

const steps = [
  { key: 'company_info', label: 'Company Information', component: CompanyInfoStep },
  { key: 'business_classification', label: 'Business Classification', component: BusinessClassificationStep },
  { key: 'contacts', label: 'Contacts', component: ContactsStep },
  { key: 'ownership', label: 'Ownership & Control', component: OwnershipStep },
  { key: 'references', label: 'References', component: ReferencesStep },
  { key: 'payment_banking', label: 'Payment & Banking', component: PaymentBankingStep },
  { key: 'licenses', label: 'Licenses & Certifications', component: LicensesStep },
  { key: 'documents', label: 'Required Documents', component: DocumentsStep },
  { key: 'authorizations', label: 'Authorizations & Signatures', component: AuthorizationsStep },
  { key: 'review', label: 'Review & Submit', component: ReviewStep },
];

export const TreatmentCenterOnboardingWizard: React.FC<TreatmentCenterOnboardingWizardProps> = ({
  onSubmit,
}) => {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [formData, setFormData] = useState<Partial<TreatmentCenterOnboarding>>({
    selected_distributors: [],
    company_info: {
      legal_name: '',
      federal_tax_id: '',
      legal_address: { street: '', city: '', state: '', zip: '' },
      same_as_legal_address: false,
    },
    business_info: {
      business_type: [],
      years_in_business: 0,
      ownership_type: 'llc',
    },
    contacts: {
      primary_contact: { name: '', phone: '', email: '' },
    },
    ownership: {
      principal_owners: [],
      bankruptcy_history: false,
    },
    references: {
      primary_bank: { name: '', contact_name: '', phone: '' },
      primary_supplier: { name: '', contact_name: '', phone: '' },
      additional_references: [],
    },
    payment_info: {
      ach_preference: 'direct_debit',
      bank_name: '',
      bank_account_number: '',
      bank_routing_number: '',
      bank_address: { street: '', city: '', state: '', zip: '' },
      statement_delivery_preference: 'email',
    },
    licenses: {
      additional_licenses: [],
    },
    documents: {
      voided_check: false,
      resale_tax_exemption_cert: false,
      dea_registration_copy: false,
      state_pharmacy_license_copy: false,
      medical_license_copy: false,
      financial_statements: false,
      supplier_statements: false,
      additional_documents: [],
    },
    authorizations: {
      authorized_signature: { name: '', title: '', date: '' },
      terms_accepted: false,
    },
    workflow: {
      current_step: 'company_info',
      completed_steps: [],
      notes: [],
    },
  });

  const { createApplication, isCreating } = useTreatmentCenterOnboarding();

  const currentStep = steps[currentStepIndex];
  const progress = ((currentStepIndex + 1) / steps.length) * 100;

  const handleNext = () => {
    if (currentStepIndex < steps.length - 1) {
      setCurrentStepIndex(currentStepIndex + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex(currentStepIndex - 1);
    }
  };

  const handleStepData = (stepData: any) => {
    setFormData(prevData => ({
      ...prevData,
      ...stepData,
    }));
  };

  const handleSubmit = async () => {
    try {
      const finalData: TreatmentCenterOnboarding = {
        id: '',
        status: 'draft',
        created_at: '',
        updated_at: '',
        ...formData,
      } as TreatmentCenterOnboarding;

      await createApplication(finalData);
      onSubmit(finalData);
    } catch (error) {
      console.error('Error submitting onboarding application:', error);
    }
  };

  const StepComponent = currentStep.component;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Progress Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Treatment Center Onboarding</CardTitle>
              <CardDescription>
                Step {currentStepIndex + 1} of {steps.length}: {currentStep.label}
              </CardDescription>
            </div>
            <Badge variant="outline">
              {Math.round(progress)}% Complete
            </Badge>
          </div>
          <Progress value={progress} className="w-full" />
        </CardHeader>
      </Card>

      {/* Step Navigation */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-wrap gap-2">
            {steps.map((step, index) => (
              <Button
                key={step.key}
                variant={index === currentStepIndex ? "default" : index < currentStepIndex ? "secondary" : "outline"}
                size="sm"
                onClick={() => setCurrentStepIndex(index)}
                className="text-xs"
              >
                {index + 1}. {step.label}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Current Step Content */}
      <Card>
        <CardHeader>
          <CardTitle>{currentStep.label}</CardTitle>
        </CardHeader>
        <CardContent>
          <StepComponent
            data={formData}
            onDataChange={handleStepData}
          />
        </CardContent>
      </Card>

      {/* Navigation Buttons */}
      <Card>
        <CardContent className="p-4">
          <div className="flex justify-between">
            <Button
              variant="outline"
              onClick={handlePrevious}
              disabled={currentStepIndex === 0}
            >
              Previous
            </Button>
            
            <div className="flex gap-4">
              {currentStepIndex === steps.length - 1 ? (
                <Button
                  onClick={handleSubmit}
                  disabled={isCreating}
                  className="bg-green-600 hover:bg-green-700"
                >
                  {isCreating ? 'Submitting...' : 'Submit Application'}
                </Button>
              ) : (
                <Button onClick={handleNext}>
                  Next
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
