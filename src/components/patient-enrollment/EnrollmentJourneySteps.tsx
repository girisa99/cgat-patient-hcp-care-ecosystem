import React from 'react';
import { Steps, Step } from '@/components/ui/steps';
import { 
  User, 
  Building2, 
  CreditCard, 
  FileText, 
  Activity, 
  Send, 
  Shield,
  Clipboard
} from 'lucide-react';

interface EnrollmentJourneyStepsProps {
  currentStep: number;
  onStepClick: (stepIndex: number) => void;
  completedSteps?: number[];
}

export const EnrollmentJourneySteps: React.FC<EnrollmentJourneyStepsProps> = ({
  currentStep,
  onStepClick,
  completedSteps = []
}) => {
  const steps = [
    {
      title: "Submission Method",
      description: "Choose how to complete enrollment",
      icon: Send
    },
    {
      title: "Consent Management",
      description: "Patient consent options & provider authorization",
      icon: Shield
    },
    {
      title: "Patient Info",
      description: "Basic patient details",
      icon: User
    },
    {
      title: "Provider Info",
      description: "Treatment center & providers",
      icon: Building2
    },
    {
      title: "Insurance",
      description: "Medical & pharmacy insurance",
      icon: CreditCard
    },
    {
      title: "Therapy",
      description: "Treatment & medication details",
      icon: FileText
    },
    {
      title: "Clinical",
      description: "ICD codes & documents",
      icon: Activity
    },
    {
      title: "Medical Review",
      description: "Review medical information",
      icon: Clipboard
    },
    {
      title: "Submit",
      description: "Final review & submission",
      icon: Send
    }
  ];

  return (
    <div className="mb-8">
      <Steps currentStep={currentStep} onStepClick={onStepClick}>
        {steps.map((step, index) => {
          const IconComponent = step.icon;
          return (
            <Step
              key={index}
              title={step.title}
              description={step.description}
              isCompleted={completedSteps.includes(index)}
            >
              <div className="flex items-center justify-center w-full h-full">
                <IconComponent className="h-4 w-4" />
              </div>
            </Step>
          );
        })}
      </Steps>
    </div>
  );
};