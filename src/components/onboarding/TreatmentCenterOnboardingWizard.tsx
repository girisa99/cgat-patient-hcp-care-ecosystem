
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { TreatmentCenterOnboarding } from '@/types/onboarding';
import { useTreatmentCenterOnboarding } from '@/hooks/useTreatmentCenterOnboarding';
import { useAutoSave } from '@/hooks/useAutoSave';
import { useOnboardingWorkflow } from '@/hooks/useOnboardingWorkflow';
import { CompanyInfoStep } from './steps/CompanyInfoStep';
import { BusinessClassificationStep } from './steps/BusinessClassificationStep';
import { ContactsStep } from './steps/ContactsStep';
import { OwnershipStep } from './steps/OwnershipStep';
import { ReferencesStep } from './steps/ReferencesStep';
import { PaymentBankingStep } from './steps/PaymentBankingStep';
import { LicensesStep } from './steps/LicensesStep';
import { DocumentsStep } from './steps/DocumentsStep';
import { AuthorizationsStep } from './steps/AuthorizationsStep';
import { PurchasingPreferencesStep } from './steps/PurchasingPreferencesStep';
import { FinancialAssessmentStep } from './steps/FinancialAssessmentStep';
import { ReviewStep } from './steps/ReviewStep';
import { Save, Clock, CheckCircle2, Workflow } from 'lucide-react';

interface TreatmentCenterOnboardingWizardProps {
  onSubmit: (data: TreatmentCenterOnboarding) => void;
  initialData?: Partial<TreatmentCenterOnboarding>;
  applicationId?: string;
}

const steps = [
  { key: 'company_info', label: 'Company Information', component: CompanyInfoStep },
  { key: 'business_classification', label: 'Business Classification', component: BusinessClassificationStep },
  { key: 'contacts', label: 'Contacts', component: ContactsStep },
  { key: 'ownership', label: 'Ownership & Control', component: OwnershipStep },
  { key: 'references', label: 'References', component: ReferencesStep },
  { key: 'payment_banking', label: 'Payment & Banking', component: PaymentBankingStep },
  { key: 'purchasing_preferences', label: 'Purchasing Preferences', component: PurchasingPreferencesStep },
  { key: 'financial_assessment', label: 'Financial Assessment', component: FinancialAssessmentStep },
  { key: 'licenses', label: 'Licenses & Certifications', component: LicensesStep },
  { key: 'documents', label: 'Required Documents', component: DocumentsStep },
  { key: 'authorizations', label: 'Authorizations & Signatures', component: AuthorizationsStep },
  { key: 'review', label: 'Review & Submit', component: ReviewStep },
];

export const TreatmentCenterOnboardingWizard: React.FC<TreatmentCenterOnboardingWizardProps> = ({
  onSubmit,
  initialData,
  applicationId,
}) => {
  // Initialize step based on initial data
  const getInitialStep = () => {
    if (initialData?.workflow?.current_step) {
      const stepIndex = steps.findIndex(step => step.key === initialData.workflow.current_step);
      return stepIndex >= 0 ? stepIndex : 0;
    }
    return 0;
  };

  const [currentStepIndex, setCurrentStepIndex] = useState(getInitialStep());
  const [formData, setFormData] = useState<Partial<TreatmentCenterOnboarding>>(
    initialData || {
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
      purchasing_preferences: {
        preferred_purchasing_methods: [],
        inventory_management_model: 'traditional_wholesale',
        automated_reordering_enabled: false,
        reorder_points: {},
        inventory_turnover_targets: {},
        storage_capacity_details: {},
        temperature_controlled_storage: false,
        hazmat_storage_capabilities: false,
      },
      financial_assessment: {
        annual_revenue_range: '',
        credit_score_range: '',
        years_in_operation: 0,
        insurance_coverage: {},
        financial_guarantees: {},
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
    }
  );

  const { createApplication, isCreating } = useTreatmentCenterOnboarding();
  const { initializeWorkflow, getWorkflowSteps } = useOnboardingWorkflow();
  
  // Auto-save functionality
  const { manualSave, isSaving } = useAutoSave({
    data: formData,
    currentStep: currentStepIndex,
    applicationId,
    enabled: true,
  });

  // Get workflow steps if application exists
  const { data: workflowSteps } = applicationId ? getWorkflowSteps(applicationId) : { data: [] };

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
        id: applicationId || '',
        status: 'submitted',
        created_at: '',
        updated_at: '',
        ...formData,
      } as TreatmentCenterOnboarding;

      if (applicationId) {
        // Update existing application to submitted status
        await createApplication({
          ...finalData,
          status: 'submitted',
          workflow: {
            ...finalData.workflow,
            current_step: 'complete',
          }
        });
        
        // Initialize workflow if not already done
        if (!workflowSteps || workflowSteps.length === 0) {
          await initializeWorkflow(applicationId);
        }
      } else {
        const newApplication = await createApplication(finalData);
        // Initialize workflow for new application
        if (newApplication?.id) {
          await initializeWorkflow(newApplication.id);
        }
      }
      
      onSubmit(finalData);
    } catch (error) {
      console.error('Error submitting onboarding application:', error);
    }
  };

  const handleEditStep = (stepIndex: number) => {
    setCurrentStepIndex(stepIndex);
  };

  const StepComponent = currentStep.component;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Progress Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center space-x-2">
                <span>Treatment Center Onboarding</span>
                {applicationId && (
                  <Badge variant="outline" className="ml-2">
                    Resuming Application
                  </Badge>
                )}
              </CardTitle>
              <CardDescription>
                Step {currentStepIndex + 1} of {steps.length}: {currentStep.label}
              </CardDescription>
            </div>
            <div className="flex items-center space-x-4">
              {isSaving && (
                <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                  <Clock className="h-4 w-4 animate-spin" />
                  <span>Saving...</span>
                </div>
              )}
              <Button
                variant="outline"
                size="sm"
                onClick={manualSave}
                disabled={isSaving}
                className="flex items-center space-x-2"
              >
                <Save className="h-4 w-4" />
                <span>Save Progress</span>
              </Button>
              {applicationId && workflowSteps && workflowSteps.length > 0 && (
                <Button
                  variant="outline"
                  size="sm"
                  className="flex items-center space-x-2"
                >
                  <Workflow className="h-4 w-4" />
                  <span>View Workflow</span>
                </Button>
              )}
              <Badge variant="outline">
                {Math.round(progress)}% Complete
              </Badge>
            </div>
          </div>
          <Progress value={progress} className="w-full" />
        </CardHeader>
      </Card>

      {/* Auto-save Status */}
      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <div className="flex items-center space-x-2">
          <CheckCircle2 className="h-4 w-4" />
          <span>Auto-save enabled - Your progress is automatically saved</span>
        </div>
        {applicationId && (
          <span className="text-blue-600">Application ID: {applicationId.slice(0, 8)}...</span>
        )}
      </div>

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
          {currentStep.key === 'review' ? (
            <ReviewStep
              data={formData}
              onDataChange={handleStepData}
              onEditStep={handleEditStep}
            />
          ) : (
            <StepComponent
              data={formData}
              onDataChange={handleStepData}
            />
          )}
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
