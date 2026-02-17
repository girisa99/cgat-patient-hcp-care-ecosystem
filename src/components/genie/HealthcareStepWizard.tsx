/**
 * HEALTHCARE STEP WIZARD
 * Guides users through healthcare code generation with proper database integration
 */
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Stethoscope,
  Database,
  Shield,
  Code,
  CheckCircle,
  ArrowRight,
  Info,
  AlertCircle
} from 'lucide-react';
import { GuidedHealthcareGenie } from './GuidedHealthcareGenie';

interface HealthcareStepWizardProps {
  isOpen: boolean;
  onClose: () => void;
  initialPrompt: string;
  onCodeGenerated: (code: string) => void;
}

export const HealthcareStepWizard: React.FC<HealthcareStepWizardProps> = ({
  isOpen,
  onClose,
  initialPrompt,
  onCodeGenerated
}) => {
  const [showWizard, setShowWizard] = useState(false);
  const [completedSteps, setCompletedSteps] = useState<Set<string>>(new Set());

  const handleStepComplete = (step: any) => {
    setCompletedSteps(prev => new Set(prev).add(step.id));
  };

  const handleResponse = (code: string) => {
    onCodeGenerated(code);
  };

  const wizardSteps = [
    {
      icon: <Stethoscope className="h-5 w-5" />,
      title: "Healthcare Analysis",
      description: "Analyze medical context and clinical requirements"
    },
    {
      icon: <Database className="h-5 w-5" />,
      title: "Database Discovery", 
      description: "Find relevant tables and data structures"
    },
    {
      icon: <Shield className="h-5 w-5" />,
      title: "HIPAA Compliance",
      description: "Ensure PHI protection and regulatory compliance"
    },
    {
      icon: <Code className="h-5 w-5" />,
      title: "Code Generation",
      description: "Generate compliant React components"
    }
  ];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="w-full max-w-6xl max-h-[90vh] overflow-y-auto">
        <Card className="border-primary/20">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10">
                  <Stethoscope className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-xl">Healthcare Code Generation Wizard</CardTitle>
                  <div className="text-sm text-muted-foreground mt-1">
                    Step-by-step guidance for HIPAA-compliant code generation
                  </div>
                </div>
              </div>
              <Button variant="ghost" size="sm" onClick={onClose}>
                ✕
              </Button>
            </div>
          </CardHeader>

          <CardContent className="space-y-6">
            {!showWizard ? (
              <>
                {/* Overview */}
                <div className="space-y-4">
                  <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                    <div className="flex items-start gap-3">
                      <Info className="h-5 w-5 text-blue-600 mt-0.5" />
                      <div>
                        <h3 className="font-medium text-blue-900 dark:text-blue-100">
                          Healthcare-Aware Code Generation
                        </h3>
                        <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
                          This wizard will analyze your healthcare request, check existing database schemas, 
                          ensure HIPAA compliance, and generate production-ready React components.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-200 dark:border-amber-800">
                    <div className="flex items-start gap-3">
                      <AlertCircle className="h-5 w-5 text-amber-600 mt-0.5" />
                      <div>
                        <h3 className="font-medium text-amber-900 dark:text-amber-100">
                          Your Request
                        </h3>
                        <p className="text-sm text-amber-700 dark:text-amber-300 mt-1 font-mono bg-white dark:bg-gray-800 p-2 rounded border">
                          "{initialPrompt}"
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Process Steps Preview */}
                  <div>
                    <h3 className="font-medium mb-4">Process Overview</h3>
                    <div className="grid gap-4 md:grid-cols-2">
                      {wizardSteps.map((step, index) => (
                        <div key={index} className="flex items-start gap-3 p-3 border rounded-lg">
                          <div className="p-2 bg-muted rounded-lg">
                            {step.icon}
                          </div>
                          <div>
                            <h4 className="font-medium text-sm">{step.title}</h4>
                            <p className="text-xs text-muted-foreground mt-1">
                              {step.description}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <Separator />

                <div className="flex gap-3 justify-end">
                  <Button variant="outline" onClick={onClose}>
                    Cancel
                  </Button>
                  <Button onClick={() => setShowWizard(true)}>
                    Start Healthcare Analysis
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </>
            ) : (
              <GuidedHealthcareGenie
                prompt={initialPrompt}
                roleType="patientOnboarding"
                onStepComplete={handleStepComplete}
                onWorkflowComplete={(results) => {
                  if (results.code_implementation?.generatedCode) {
                    handleResponse(results.code_implementation.generatedCode);
                  }
                }}
              />
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};