import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { CheckCircle, Clock, Database, Globe, Shield, AlertCircle } from 'lucide-react';

interface WorkflowStep {
  id: string;
  title: string;
  description: string;
  status: 'pending' | 'active' | 'completed' | 'error';
  duration: number;
  details?: string[];
  parameters?: Record<string, any>;
}

interface NPIVerificationWorkflowDemoProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  triggerData?: {
    providerName?: string;
    treatmentCenter?: string;
    referralNetwork?: string;
  };
}

export const NPIVerificationWorkflowDemo: React.FC<NPIVerificationWorkflowDemoProps> = ({
  isOpen,
  onOpenChange,
  triggerData = {}
}) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [progress, setProgress] = useState(0);

  const workflowSteps: WorkflowStep[] = [
    {
      id: 'trigger_detection',
      title: 'Agent Trigger Detection',
      description: 'Detecting input triggers and validating requirements',
      status: 'pending',
      duration: 500,
      details: [
        'Monitoring form field changes',
        'Provider name field validation',
        'Treatment center field validation', 
        'Referral network field validation'
      ],
      parameters: {
        providerName: triggerData.providerName || 'Dr. John Smith',
        treatmentCenter: triggerData.treatmentCenter || 'Metro Health Center',
        referralNetwork: triggerData.referralNetwork || 'Regional Care Network',
        triggerCondition: 'ANY_FIELD_POPULATED',
        enabledVerification: true
      }
    },
    {
      id: 'parameter_extraction',
      title: 'Parameter Extraction & Sanitization',
      description: 'Extracting and sanitizing input parameters for CMS validation',
      status: 'pending',
      duration: 300,
      details: [
        'Normalizing provider name format',
        'Extracting facility identifiers',
        'Validating input data integrity',
        'Preparing CMS query parameters'
      ],
      parameters: {
        sanitizedProviderName: 'SMITH, JOHN',
        facilityType: 'TREATMENT_CENTER',
        searchCriteria: 'NAME_AND_LOCATION',
        dataIntegrityScore: 95
      }
    },
    {
      id: 'cms_connection',
      title: 'CMS NPPES Database Connection',
      description: 'Establishing secure connection to CMS NPPES registry',
      status: 'pending',
      duration: 800,
      details: [
        'Authenticating with CMS NPPES API',
        'Establishing encrypted SSL connection',
        'Verifying API rate limits',
        'Initializing query session'
      ],
      parameters: {
        endpoint: 'https://npiregistry.cms.hhs.gov/api',
        authMethod: 'API_KEY',
        encryption: 'TLS_1.3',
        rateLimit: '1000_requests_per_hour'
      }
    },
    {
      id: 'npi_search',
      title: 'NPI Registry Search',
      description: 'Searching CMS NPPES registry for provider information',
      status: 'pending',
      duration: 1200,
      details: [
        'Executing name-based NPI search',
        'Cross-referencing facility data',
        'Validating provider credentials',
        'Retrieving comprehensive provider profile'
      ],
      parameters: {
        searchType: 'COMPREHENSIVE',
        matchingProviders: 3,
        primaryNPI: '1234567890',
        credentialStatus: 'ACTIVE',
        lastUpdated: new Date().toISOString()
      }
    },
    {
      id: 'data_validation',
      title: 'Credential Validation & Verification',
      description: 'Validating provider credentials and license status',
      status: 'pending',
      duration: 900,
      details: [
        'Verifying NPI status (Active/Inactive)',
        'Checking license expiration dates',
        'Validating specialty credentials',
        'Cross-checking DEA registrations'
      ],
      parameters: {
        npiStatus: 'ACTIVE',
        licenseValid: true,
        specialtyVerified: true,
        deaStatus: 'CURRENT',
        credentialScore: 98
      }
    },
    {
      id: 'database_write',
      title: 'Database Record Creation',
      description: 'Writing verified data to enrollment databases',
      status: 'pending',
      duration: 600,
      details: [
        'Inserting provider_enrollments record',
        'Creating treatment_center_enrollments entry',
        'Updating referral_network_enrollments',
        'Applying RLS policies and audit trails'
      ],
      parameters: {
        providerEnrollmentId: '550e8400-e29b-41d4-a716-446655440000',
        treatmentCenterId: '550e8400-e29b-41d4-a716-446655440001',
        referralNetworkId: '550e8400-e29b-41d4-a716-446655440002',
        rlsPolicyApplied: true
      }
    },
    {
      id: 'response_format',
      title: 'Response Formatting & UI Update',
      description: 'Formatting response data and updating user interface',
      status: 'pending',
      duration: 400,
      details: [
        'Formatting verification results',
        'Updating form field autofill',
        'Displaying status indicators',
        'Triggering success notifications'
      ],
      parameters: {
        autoFillFields: ['address', 'npi', 'specialty', 'status'],
        statusBadges: ['VERIFIED', 'ACTIVE', 'COMPLIANT'],
        notificationsSent: 1
      }
    }
  ];

  const [steps, setSteps] = useState(workflowSteps);

  const runWorkflowDemo = async () => {
    setIsRunning(true);
    setCurrentStep(0);
    setProgress(0);

    // Reset all steps
    setSteps(prev => prev.map(step => ({ ...step, status: 'pending' })));

    for (let i = 0; i < workflowSteps.length; i++) {
      setCurrentStep(i);
      
      // Mark current step as active
      setSteps(prev => prev.map((step, index) => ({
        ...step,
        status: index === i ? 'active' : index < i ? 'completed' : 'pending'
      })));

      // Update progress
      const stepProgress = ((i + 1) / workflowSteps.length) * 100;
      setProgress(stepProgress);

      // Wait for step duration
      await new Promise(resolve => setTimeout(resolve, workflowSteps[i].duration));
    }

    // Mark all steps as completed
    setSteps(prev => prev.map(step => ({ ...step, status: 'completed' })));
    setIsRunning(false);
  };

  const getStepIcon = (status: WorkflowStep['status']) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'active':
        return <Clock className="w-5 h-5 text-blue-500 animate-spin" />;
      case 'error':
        return <AlertCircle className="w-5 h-5 text-red-500" />;
      default:
        return <div className="w-5 h-5 rounded-full border-2 border-muted" />;
    }
  };

  const getStepBadge = (step: WorkflowStep) => {
    switch (step.id) {
      case 'trigger_detection':
        return <Badge variant="outline" className="text-purple-600">TRIGGER</Badge>;
      case 'cms_connection':
        return <Badge variant="outline" className="text-blue-600">CMS API</Badge>;
      case 'database_write':
        return <Badge variant="outline" className="text-green-600">DATABASE</Badge>;
      default:
        return <Badge variant="outline">PROCESS</Badge>;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Shield className="w-6 h-6 text-primary" />
            NPI Verification & Credentialing Agent - Workflow Demonstration
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Trigger Information */}
          <div className="bg-muted/50 p-4 rounded-lg">
            <h3 className="font-semibold mb-2 flex items-center gap-2">
              <Database className="w-4 h-4" />
              Agent Trigger Conditions
            </h3>
            <div className="grid grid-cols-3 gap-4 text-sm">
              <div>
                <span className="font-medium">Provider Name:</span>
                <p className="text-muted-foreground">{triggerData.providerName || 'Dr. John Smith'}</p>
              </div>
              <div>
                <span className="font-medium">Treatment Center:</span>
                <p className="text-muted-foreground">{triggerData.treatmentCenter || 'Metro Health Center'}</p>
              </div>
              <div>
                <span className="font-medium">Referral Network:</span>
                <p className="text-muted-foreground">{triggerData.referralNetwork || 'Regional Care Network'}</p>
              </div>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Workflow Progress</span>
              <span>{Math.round(progress)}%</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>

          {/* Workflow Steps */}
          <div className="space-y-4">
            {steps.map((step, index) => (
              <div
                key={step.id}
                className={`border rounded-lg p-4 transition-all duration-300 ${
                  step.status === 'active' 
                    ? 'border-blue-500 bg-blue-50/50' 
                    : step.status === 'completed'
                    ? 'border-green-500 bg-green-50/50'
                    : 'border-muted'
                }`}
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-3">
                    {getStepIcon(step.status)}
                    <div>
                      <h4 className="font-semibold">{step.title}</h4>
                      <p className="text-sm text-muted-foreground">{step.description}</p>
                    </div>
                  </div>
                  {getStepBadge(step)}
                </div>

                {(step.status === 'active' || step.status === 'completed') && (
                  <div className="mt-3 space-y-3">
                    {/* Step Details */}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <h5 className="text-sm font-medium mb-1">Process Details:</h5>
                        <ul className="text-xs text-muted-foreground space-y-1">
                          {step.details?.map((detail, i) => (
                            <li key={i} className="flex items-center gap-1">
                              <div className="w-1 h-1 bg-current rounded-full" />
                              {detail}
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <h5 className="text-sm font-medium mb-1">Parameters:</h5>
                        <div className="text-xs space-y-1">
                          {Object.entries(step.parameters || {}).map(([key, value]) => (
                            <div key={key} className="flex justify-between">
                              <span className="text-muted-foreground">{key}:</span>
                              <span className="font-mono">{JSON.stringify(value)}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Real-time Backend Insights */}
          <div className="bg-slate-900 text-green-400 p-4 rounded-lg font-mono text-sm">
            <h3 className="text-white mb-2 flex items-center gap-2">
              <Globe className="w-4 h-4" />
              Real-time Backend Process Log
            </h3>
            <div className="space-y-1 max-h-32 overflow-y-auto">
              {steps.filter(step => step.status === 'completed' || step.status === 'active').map((step, index) => (
                <div key={step.id}>
                  <span className="text-gray-400">[{new Date().toLocaleTimeString()}]</span>
                  <span className="text-blue-400"> {step.id.toUpperCase()}</span>
                  <span> - {step.description}</span>
                  {step.status === 'active' && <span className="animate-pulse"> ...</span>}
                </div>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-between">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Close Demo
            </Button>
            <Button 
              onClick={runWorkflowDemo} 
              disabled={isRunning}
              className="min-w-32"
            >
              {isRunning ? 'Running...' : 'Start Demo'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};