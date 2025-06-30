
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Circle, ArrowRight, ArrowLeft } from 'lucide-react';
import { TreatmentCenterOnboarding } from '@/types/onboarding';

// Import all the step components
import { CompanyInfoStep } from './steps/CompanyInfoStep';
import { BusinessClassificationStep } from './steps/BusinessClassificationStep';
import { OwnershipStep } from './steps/OwnershipStep';
import { FinancialAssessmentStep } from './steps/FinancialAssessmentStep';
import { CreditApplicationStep } from './steps/CreditApplicationStep';
import { PurchasingPreferencesStep } from './steps/PurchasingPreferencesStep';
import { GPOMembershipStep } from './steps/GPOMembershipStep';
import { OnlineServicesStep } from './steps/OnlineServicesStep';
import { OfficeHoursStep } from './steps/OfficeHoursStep';

interface TreatmentCenterOnboardingWizardProps {
  onSubmit: (data: Partial<TreatmentCenterOnboarding>) => void;
  initialData?: Partial<TreatmentCenterOnboarding>;
  isEditing?: boolean;
}

interface Step {
  id: string;
  title: string;
  description: string;
  component: React.ComponentType<any>;
  required: boolean;
}

const ONBOARDING_STEPS: Step[] = [
  {
    id: 'company_info',
    title: 'Company Information',
    description: 'Basic company details and distributor preferences',
    component: CompanyInfoStep,
    required: true,
  },
  {
    id: 'business_classification',
    title: 'Business Classification',
    description: 'Business type and operational details',
    component: BusinessClassificationStep,
    required: true,
  },
  {
    id: 'ownership',
    title: 'Ownership Structure',
    description: 'Principal owners and controlling entities',
    component: OwnershipStep,
    required: true,
  },
  {
    id: 'financial_assessment',
    title: 'Financial Assessment',
    description: 'Financial information and risk evaluation',
    component: FinancialAssessmentStep,
    required: true,
  },
  {
    id: 'credit_application',
    title: 'Credit Application',
    description: 'Credit terms and trade references',
    component: CreditApplicationStep,
    required: true,
  },
  {
    id: 'purchasing_preferences',
    title: 'Purchasing Preferences',
    description: 'Inventory management and purchasing methods',
    component: PurchasingPreferencesStep,
    required: true,
  },
  {
    id: 'gpo_memberships',
    title: 'GPO Memberships',
    description: 'Group purchasing organization memberships',
    component: GPOMembershipStep,
    required: false,
  },
  {
    id: 'online_services',
    title: 'Online Services',
    description: 'Platform services and user roles',
    component: OnlineServicesStep,
    required: true,
  },
  {
    id: 'office_hours',
    title: 'Office Hours',
    description: 'Operating hours and contact information',
    component: OfficeHoursStep,
    required: true,
  },
];

export const TreatmentCenterOnboardingWizard: React.FC<TreatmentCenterOnboardingWizardProps> = ({
  onSubmit,
  initialData,
  isEditing = false,
}) => {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [formData, setFormData] = useState<Partial<TreatmentCenterOnboarding>>(initialData || {});
  const [completedSteps, setCompletedSteps] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
      // Mark steps as completed based on existing data
      const completed = new Set<string>();
      ONBOARDING_STEPS.forEach(step => {
        if (hasStepData(step.id, initialData)) {
          completed.add(step.id);
        }
      });
      setCompletedSteps(completed);
    }
  }, [initialData]);

  const hasStepData = (stepId: string, data: Partial<TreatmentCenterOnboarding>): boolean => {
    switch (stepId) {
      case 'company_info':
        return !!(data.company_info?.legal_name && data.selected_distributors?.length);
      case 'business_classification':
        return !!(data.business_info?.business_type?.length && data.business_info?.ownership_type);
      case 'ownership':
        return !!(data.ownership?.principal_owners?.length);
      case 'financial_assessment':
        return !!(data.financial_assessment?.annual_revenue_range);
      case 'credit_application':
        return !!(data.credit_application?.requested_credit_limit);
      case 'purchasing_preferences':
        return !!(data.purchasing_preferences?.preferred_purchasing_methods?.length);
      case 'gpo_memberships':
        return true; // Optional step
      case 'online_services':
        return !!(data.selected_online_services?.length || data.selected_user_roles?.length);
      case 'office_hours':
        return !!(data.office_hours?.timezone);
      default:
        return false;
    }
  };

  const handleDataChange = (stepData: Partial<TreatmentCenterOnboarding>) => {
    const updatedData = { ...formData, ...stepData };
    setFormData(updatedData);
    
    // Mark current step as completed if it has required data
    const currentStep = ONBOARDING_STEPS[currentStepIndex];
    if (hasStepData(currentStep.id, updatedData)) {
      setCompletedSteps(prev => new Set([...prev, currentStep.id]));
    }
  };

  const handleNext = () => {
    if (currentStepIndex < ONBOARDING_STEPS.length - 1) {
      setCurrentStepIndex(currentStepIndex + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex(currentStepIndex - 1);
    }
  };

  const handleStepClick = (stepIndex: number) => {
    setCurrentStepIndex(stepIndex);
  };

  const handleSubmit = () => {
    onSubmit(formData);
  };

  const isCurrentStepValid = () => {
    const currentStep = ONBOARDING_STEPS[currentStepIndex];
    return !currentStep.required || completedSteps.has(currentStep.id);
  };

  const isFormComplete = () => {
    return ONBOARDING_STEPS.filter(step => step.required).every(step => 
      completedSteps.has(step.id)
    );
  };

  const currentStep = ONBOARDING_STEPS[currentStepIndex];
  const StepComponent = currentStep.component;
  const progress = ((currentStepIndex + 1) / ONBOARDING_STEPS.length) * 100;

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Progress Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl">
                {isEditing ? 'Edit Onboarding Application' : 'Treatment Center Onboarding'}
              </CardTitle>
              <CardDescription>
                Step {currentStepIndex + 1} of {ONBOARDING_STEPS.length}: {currentStep.title}
              </CardDescription>
            </div>
            <Badge variant="outline" className="text-sm">
              {Math.round(progress)}% Complete
            </Badge>
          </div>
          <Progress value={progress} className="mt-4" />
        </CardHeader>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Step Navigation Sidebar */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Steps</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {ONBOARDING_STEPS.map((step, index) => (
                <button
                  key={step.id}
                  onClick={() => handleStepClick(index)}
                  className={`w-full text-left p-3 rounded-lg border transition-colors ${
                    index === currentStepIndex
                      ? 'bg-primary text-primary-foreground border-primary'
                      : completedSteps.has(step.id)
                      ? 'bg-green-50 border-green-200 text-green-800'
                      : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
                  }`}
                >
                  <div className="flex items-center space-x-2">
                    {completedSteps.has(step.id) ? (
                      <CheckCircle className="h-4 w-4" />
                    ) : (
                      <Circle className="h-4 w-4" />
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-sm truncate">{step.title}</div>
                      <div className="text-xs opacity-70 truncate">{step.description}</div>
                    </div>
                  </div>
                  {step.required && (
                    <div className="text-xs text-red-600 mt-1">Required</div>
                  )}
                </button>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Main Content Area */}
        <div className="lg:col-span-3">
          <Card>
            <CardHeader>
              <CardTitle>{currentStep.title}</CardTitle>
              <CardDescription>{currentStep.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <StepComponent
                data={formData}
                onDataChange={handleDataChange}
                applicationId={formData.id}
              />
            </CardContent>
          </Card>

          {/* Navigation Buttons */}
          <div className="flex justify-between mt-6">
            <Button
              variant="outline"
              onClick={handlePrevious}
              disabled={currentStepIndex === 0}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Previous
            </Button>

            <div className="flex space-x-2">
              {currentStepIndex < ONBOARDING_STEPS.length - 1 ? (
                <Button
                  onClick={handleNext}
                  disabled={!isCurrentStepValid()}
                >
                  Next
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              ) : (
                <Button
                  onClick={handleSubmit}
                  disabled={!isFormComplete()}
                  className="bg-green-600 hover:bg-green-700"
                >
                  {isEditing ? 'Update Application' : 'Submit Application'}
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
