
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { CheckCircle, Circle, ArrowLeft, ArrowRight } from 'lucide-react';
import { TreatmentCenterOnboarding, OnboardingStep } from '@/types/onboarding';
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
  initialData?: Partial<TreatmentCenterOnboarding>;
}

const STEPS: { key: OnboardingStep; title: string; description: string }[] = [
  { key: 'company_info', title: 'Company Information', description: 'Legal name, addresses, and basic details' },
  { key: 'business_classification', title: 'Business Classification', description: 'Business type and operational details' },
  { key: 'contacts', title: 'Key Contacts', description: 'Primary contacts and communication preferences' },
  { key: 'ownership', title: 'Ownership Structure', description: 'Ownership details and controlling entities' },
  { key: 'references', title: 'Business References', description: 'Banking and supplier references' },
  { key: 'payment_banking', title: 'Payment & Banking', description: 'Banking details and payment preferences' },
  { key: 'licenses', title: 'Licenses & Certifications', description: 'Professional licenses and certifications' },
  { key: 'documents', title: 'Required Documents', description: 'Upload supporting documentation' },
  { key: 'authorizations', title: 'Authorizations', description: 'Signatures and legal authorizations' },
  { key: 'review', title: 'Review & Submit', description: 'Final review before submission' }
];

export const TreatmentCenterOnboardingWizard: React.FC<TreatmentCenterOnboardingWizardProps> = ({
  onSubmit,
  initialData
}) => {
  const [currentStep, setCurrentStep] = useState<OnboardingStep>('company_info');
  const [formData, setFormData] = useState<Partial<TreatmentCenterOnboarding>>(
    initialData || {
      selected_distributors: [],
      workflow: {
        current_step: 'company_info',
        completed_steps: [],
        notes: []
      }
    }
  );

  const currentStepIndex = STEPS.findIndex(step => step.key === currentStep);
  const progress = ((currentStepIndex + 1) / STEPS.length) * 100;

  const updateFormData = (stepData: Partial<TreatmentCenterOnboarding>) => {
    setFormData(prev => ({ ...prev, ...stepData }));
  };

  const handleNext = () => {
    const nextIndex = currentStepIndex + 1;
    if (nextIndex < STEPS.length) {
      const nextStep = STEPS[nextIndex].key;
      setCurrentStep(nextStep);
      
      // Mark current step as completed
      setFormData(prev => ({
        ...prev,
        workflow: {
          ...prev.workflow!,
          current_step: nextStep,
          completed_steps: [...(prev.workflow?.completed_steps || []), currentStep]
        }
      }));
    }
  };

  const handlePrevious = () => {
    const prevIndex = currentStepIndex - 1;
    if (prevIndex >= 0) {
      setCurrentStep(STEPS[prevIndex].key);
    }
  };

  const handleStepClick = (step: OnboardingStep) => {
    setCurrentStep(step);
  };

  const isStepCompleted = (step: OnboardingStep) => {
    return formData.workflow?.completed_steps?.includes(step) || false;
  };

  const renderStepContent = () => {
    const commonProps = {
      data: formData,
      onUpdate: updateFormData
    };

    switch (currentStep) {
      case 'company_info':
        return <CompanyInfoStep {...commonProps} />;
      case 'business_classification':
        return <BusinessClassificationStep {...commonProps} />;
      case 'contacts':
        return <ContactsStep {...commonProps} />;
      case 'ownership':
        return <OwnershipStep {...commonProps} />;
      case 'references':
        return <ReferencesStep {...commonProps} />;
      case 'payment_banking':
        return <PaymentBankingStep {...commonProps} />;
      case 'licenses':
        return <LicensesStep {...commonProps} />;
      case 'documents':
        return <DocumentsStep {...commonProps} />;
      case 'authorizations':
        return <AuthorizationsStep {...commonProps} />;
      case 'review':
        return <ReviewStep {...commonProps} onSubmit={onSubmit} />;
      default:
        return null;
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold">Treatment Center Onboarding</h1>
        <p className="text-muted-foreground">
          Complete your onboarding process for healthcare distributors
        </p>
        <div className="flex justify-center space-x-2">
          {formData.selected_distributors?.map(distributor => (
            <Badge key={distributor} variant="secondary">
              {distributor.replace('_', ' ').toUpperCase()}
            </Badge>
          ))}
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full max-w-2xl mx-auto">
        <div className="flex justify-between mb-2">
          <span className="text-sm font-medium">Progress</span>
          <span className="text-sm text-muted-foreground">{Math.round(progress)}% Complete</span>
        </div>
        <Progress value={progress} className="w-full" />
      </div>

      {/* Step Navigation */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-2 max-w-6xl mx-auto">
        {STEPS.map((step, index) => (
          <button
            key={step.key}
            onClick={() => handleStepClick(step.key)}
            className={`
              p-3 rounded-lg border text-left transition-all
              ${currentStep === step.key 
                ? 'border-primary bg-primary/5 text-primary' 
                : 'border-border hover:border-primary/50'
              }
              ${isStepCompleted(step.key) ? 'bg-green-50 border-green-200' : ''}
            `}
          >
            <div className="flex items-center space-x-2">
              {isStepCompleted(step.key) ? (
                <CheckCircle className="h-4 w-4 text-green-600" />
              ) : (
                <Circle className={`h-4 w-4 ${currentStep === step.key ? 'text-primary' : 'text-muted-foreground'}`} />
              )}
              <span className="text-xs font-medium">{index + 1}</span>
            </div>
            <div className="mt-1">
              <div className="text-sm font-medium">{step.title}</div>
              <div className="text-xs text-muted-foreground hidden md:block">{step.description}</div>
            </div>
          </button>
        ))}
      </div>

      {/* Step Content */}
      <Card className="max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle>{STEPS[currentStepIndex].title}</CardTitle>
          <CardDescription>{STEPS[currentStepIndex].description}</CardDescription>
        </CardHeader>
        <CardContent>
          {renderStepContent()}
        </CardContent>
      </Card>

      {/* Navigation Buttons */}
      <div className="flex justify-between max-w-4xl mx-auto">
        <Button 
          variant="outline" 
          onClick={handlePrevious}
          disabled={currentStepIndex === 0}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Previous
        </Button>
        
        {currentStep !== 'review' ? (
          <Button onClick={handleNext}>
            Next
            <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        ) : (
          <Button onClick={() => onSubmit(formData as TreatmentCenterOnboarding)}>
            Submit Application
          </Button>
        )}
      </div>
    </div>
  );
};
