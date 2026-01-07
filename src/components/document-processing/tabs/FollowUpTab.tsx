/**
 * FollowUpTab Component
 * Guided follow-up workflow after document extraction
 * Supports 5 key areas: Insurance Card, Patient Onboarding, Prescription, Verification, Clinical
 * Integrates with GuidedHealthcareGenie journey stages
 */

import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  CheckCircle,
  XCircle,
  AlertTriangle,
  Clock,
  Play,
  ArrowRight,
  CreditCard,
  UserCheck,
  Pill,
  Shield,
  Stethoscope,
  FileText,
  Bot,
  Loader2,
  ChevronRight,
  Database,
  Sparkles,
  RefreshCw
} from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

// Follow-up workflow area types
type FollowUpArea = 'insurance-card' | 'patient-onboarding' | 'prescription' | 'verification' | 'clinical';

interface GuidedStep {
  id: string;
  title: string;
  description: string;
  category: 'extraction' | 'verification' | 'integration' | 'validation' | 'completion';
  estimatedTime: number;
  status: 'pending' | 'running' | 'completed' | 'error' | 'skipped';
  results?: any;
  agentId?: string;
}

interface FollowUpWorkflow {
  id: FollowUpArea;
  name: string;
  description: string;
  icon: React.ReactNode;
  steps: GuidedStep[];
  applicableDocTypes: string[];
  relatedTables: string[];
}

// Define the 5 follow-up areas with guided steps
const FOLLOW_UP_WORKFLOWS: FollowUpWorkflow[] = [
  {
    id: 'insurance-card',
    name: 'Insurance Card Verification',
    description: 'Verify insurance coverage, eligibility, and plan details',
    icon: <CreditCard className="h-5 w-5" />,
    applicableDocTypes: ['insurance', 'prescription', 'patient-onboarding'],
    relatedTables: ['enrollment_insurance_info', 'insurance_coverages'],
    steps: [
      {
        id: 'insurance-extract',
        title: 'Extract Insurance Details',
        description: 'Pull member ID, group number, plan type from uploaded card',
        category: 'extraction',
        estimatedTime: 1,
        status: 'pending'
      },
      {
        id: 'insurance-verify',
        title: 'Verify Coverage Eligibility',
        description: 'Check if plan is active and coverage is valid',
        category: 'verification',
        estimatedTime: 2,
        status: 'pending',
        agentId: 'insurance-verification'
      },
      {
        id: 'insurance-benefits',
        title: 'Lookup Benefits',
        description: 'Retrieve co-pay, deductible, OOP max information',
        category: 'integration',
        estimatedTime: 2,
        status: 'pending'
      },
      {
        id: 'insurance-save',
        title: 'Save to Patient Record',
        description: 'Update enrollment_insurance_info table',
        category: 'completion',
        estimatedTime: 1,
        status: 'pending'
      }
    ]
  },
  {
    id: 'patient-onboarding',
    name: 'Patient Onboarding',
    description: 'Complete patient intake with demographics and consent',
    icon: <UserCheck className="h-5 w-5" />,
    applicableDocTypes: ['patient-onboarding', 'insurance'],
    relatedTables: ['enrollment_patient_info', 'enrollment_consent', 'patient_enrollments'],
    steps: [
      {
        id: 'patient-demographics',
        title: 'Extract Demographics',
        description: 'Pull name, DOB, address, contact from documents',
        category: 'extraction',
        estimatedTime: 1,
        status: 'pending'
      },
      {
        id: 'patient-duplicate-check',
        title: 'Duplicate Patient Check',
        description: 'Check for existing patient records to prevent duplicates',
        category: 'validation',
        estimatedTime: 2,
        status: 'pending',
        agentId: 'patient-intake'
      },
      {
        id: 'patient-consent',
        title: 'Consent Management',
        description: 'Verify consent forms are complete and valid',
        category: 'verification',
        estimatedTime: 2,
        status: 'pending'
      },
      {
        id: 'patient-insurance-link',
        title: 'Link Insurance',
        description: 'Associate insurance card with patient record',
        category: 'integration',
        estimatedTime: 1,
        status: 'pending'
      },
      {
        id: 'patient-enrollment',
        title: 'Complete Enrollment',
        description: 'Finalize patient enrollment and create record',
        category: 'completion',
        estimatedTime: 1,
        status: 'pending'
      }
    ]
  },
  {
    id: 'prescription',
    name: 'Prescription Processing',
    description: 'Process medication, lookup NDC, check interactions',
    icon: <Pill className="h-5 w-5" />,
    applicableDocTypes: ['prescription'],
    relatedTables: ['medication_orders', 'drug_interactions'],
    steps: [
      {
        id: 'rx-extract',
        title: 'Extract Prescription Details',
        description: 'Pull medication name, strength, sig, quantity, refills',
        category: 'extraction',
        estimatedTime: 1,
        status: 'pending'
      },
      {
        id: 'rx-ndc-lookup',
        title: 'NDC Code Lookup',
        description: 'Find matching NDC codes from FDA/RxNorm database',
        category: 'integration',
        estimatedTime: 2,
        status: 'pending',
        agentId: 'medication-lookup'
      },
      {
        id: 'rx-drug-interaction',
        title: 'Drug Interaction Check',
        description: 'Check for interactions with existing medications',
        category: 'validation',
        estimatedTime: 2,
        status: 'pending',
        agentId: 'drug-interaction'
      },
      {
        id: 'rx-prior-auth',
        title: 'Prior Authorization Check',
        description: 'Determine if prior auth is required for this medication',
        category: 'verification',
        estimatedTime: 2,
        status: 'pending'
      },
      {
        id: 'rx-insurance-copay',
        title: 'Insurance Co-pay Lookup',
        description: 'Check patient insurance for medication coverage and copay',
        category: 'integration',
        estimatedTime: 2,
        status: 'pending'
      }
    ]
  },
  {
    id: 'verification',
    name: 'Verification Workflow',
    description: 'Cross-verify documents and data for accuracy',
    icon: <Shield className="h-5 w-5" />,
    applicableDocTypes: ['insurance', 'prescription', 'patient-onboarding'],
    relatedTables: ['verification_results', 'audit_logs'],
    steps: [
      {
        id: 'verify-prescriber',
        title: 'Prescriber NPI Verification',
        description: 'Verify prescriber NPI number is valid and active',
        category: 'verification',
        estimatedTime: 2,
        status: 'pending'
      },
      {
        id: 'verify-dea',
        title: 'DEA Number Validation',
        description: 'Validate DEA number for controlled substances',
        category: 'verification',
        estimatedTime: 2,
        status: 'pending'
      },
      {
        id: 'verify-patient-id',
        title: 'Patient ID Verification',
        description: 'Confirm patient identity matches records',
        category: 'verification',
        estimatedTime: 1,
        status: 'pending'
      },
      {
        id: 'verify-signature',
        title: 'Signature Verification',
        description: 'Verify required signatures are present',
        category: 'validation',
        estimatedTime: 1,
        status: 'pending'
      }
    ]
  },
  {
    id: 'clinical',
    name: 'Clinical Review',
    description: 'Clinical assessment and recommendation workflow',
    icon: <Stethoscope className="h-5 w-5" />,
    applicableDocTypes: ['prescription', 'xray', 'ct-scan', 'mri', 'lab-result'],
    relatedTables: ['clinical_reviews', 'treatment_assessments'],
    steps: [
      {
        id: 'clinical-extract',
        title: 'Clinical Data Extraction',
        description: 'Extract clinical findings and observations',
        category: 'extraction',
        estimatedTime: 2,
        status: 'pending'
      },
      {
        id: 'clinical-review',
        title: 'AI Clinical Review',
        description: 'AI-powered clinical analysis and recommendations',
        category: 'validation',
        estimatedTime: 3,
        status: 'pending',
        agentId: 'clinical-review'
      },
      {
        id: 'clinical-dosage-check',
        title: 'Dosage Appropriateness',
        description: 'Verify dosage is appropriate for patient demographics',
        category: 'validation',
        estimatedTime: 2,
        status: 'pending'
      },
      {
        id: 'clinical-recommend',
        title: 'Generate Recommendations',
        description: 'Compile clinical recommendations for review',
        category: 'completion',
        estimatedTime: 2,
        status: 'pending'
      }
    ]
  }
];

interface ProcessingResult {
  id: string;
  fileName: string;
  documentType: string;
  stage: string;
  extractedFields: Record<string, { value: string; confidence: number }>;
  medications?: any[];
}

interface FollowUpTabProps {
  processingResult: ProcessingResult | null;
  selectedDocType: string;
  onWorkflowComplete?: (workflowId: FollowUpArea, results: any) => void;
  agentFindings?: any[];
}

export default function FollowUpTab({
  processingResult,
  selectedDocType,
  onWorkflowComplete,
  agentFindings = []
}: FollowUpTabProps) {
  const [selectedWorkflow, setSelectedWorkflow] = useState<FollowUpArea | null>(null);
  const [workflows, setWorkflows] = useState<FollowUpWorkflow[]>(FOLLOW_UP_WORKFLOWS);
  const [isRunning, setIsRunning] = useState(false);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);

  // Filter applicable workflows based on document type
  const applicableWorkflows = workflows.filter(w => 
    w.applicableDocTypes.includes(selectedDocType)
  );

  // Get status color
  const getStatusColor = (status: GuidedStep['status']) => {
    switch (status) {
      case 'completed': return 'text-green-500';
      case 'running': return 'text-blue-500';
      case 'error': return 'text-destructive';
      case 'skipped': return 'text-muted-foreground';
      default: return 'text-muted-foreground';
    }
  };

  const getStatusIcon = (status: GuidedStep['status']) => {
    switch (status) {
      case 'completed': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'running': return <Loader2 className="h-4 w-4 text-blue-500 animate-spin" />;
      case 'error': return <XCircle className="h-4 w-4 text-destructive" />;
      case 'skipped': return <ArrowRight className="h-4 w-4 text-muted-foreground" />;
      default: return <Clock className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getCategoryBadge = (category: GuidedStep['category']) => {
    const colors: Record<string, string> = {
      extraction: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
      verification: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
      integration: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300',
      validation: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300',
      completion: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300'
    };
    return colors[category] || 'bg-muted text-muted-foreground';
  };

  // Execute a single step
  const executeStep = useCallback(async (workflowId: FollowUpArea, stepIndex: number) => {
    const workflow = workflows.find(w => w.id === workflowId);
    if (!workflow) return;

    const step = workflow.steps[stepIndex];
    if (!step) return;

    // Update step status to running
    setWorkflows(prev => prev.map(w => {
      if (w.id !== workflowId) return w;
      return {
        ...w,
        steps: w.steps.map((s, i) => 
          i === stepIndex ? { ...s, status: 'running' as const } : s
        )
      };
    }));

    try {
      // Simulate step execution (in real implementation, call edge functions)
      await new Promise(resolve => setTimeout(resolve, 1500 + Math.random() * 1000));

      // If step has an agent, invoke it
      if (step.agentId && processingResult) {
        const { data, error } = await supabase.functions.invoke('execute-document-agent', {
          body: {
            agentType: step.agentId,
            extractedData: processingResult.extractedFields,
            documentType: processingResult.documentType,
            medications: processingResult.medications
          }
        });

        if (error) throw error;
        
        // Store results
        step.results = data;
      }

      // Update step status to completed
      setWorkflows(prev => prev.map(w => {
        if (w.id !== workflowId) return w;
        return {
          ...w,
          steps: w.steps.map((s, i) => 
            i === stepIndex ? { ...s, status: 'completed' as const } : s
          )
        };
      }));

      toast.success(`Completed: ${step.title}`);
      return true;
    } catch (error) {
      console.error('Step execution error:', error);
      
      // Update step status to error
      setWorkflows(prev => prev.map(w => {
        if (w.id !== workflowId) return w;
        return {
          ...w,
          steps: w.steps.map((s, i) => 
            i === stepIndex ? { ...s, status: 'error' as const } : s
          )
        };
      }));

      toast.error(`Failed: ${step.title}`);
      return false;
    }
  }, [workflows, processingResult]);

  // Run entire workflow
  const runWorkflow = useCallback(async (workflowId: FollowUpArea) => {
    setIsRunning(true);
    setSelectedWorkflow(workflowId);
    setCurrentStepIndex(0);

    const workflow = workflows.find(w => w.id === workflowId);
    if (!workflow) {
      setIsRunning(false);
      return;
    }

    toast.info(`Starting ${workflow.name} workflow...`);

    for (let i = 0; i < workflow.steps.length; i++) {
      setCurrentStepIndex(i);
      const success = await executeStep(workflowId, i);
      if (!success) {
        toast.warning(`Workflow paused at step ${i + 1}. You can retry or skip.`);
        break;
      }
    }

    setIsRunning(false);
    
    const updatedWorkflow = workflows.find(w => w.id === workflowId);
    const allCompleted = updatedWorkflow?.steps.every(s => s.status === 'completed');
    
    if (allCompleted) {
      toast.success(`${workflow.name} completed successfully!`);
      onWorkflowComplete?.(workflowId, updatedWorkflow);
    }
  }, [workflows, executeStep, onWorkflowComplete]);

  // Reset workflow
  const resetWorkflow = useCallback((workflowId: FollowUpArea) => {
    setWorkflows(prev => prev.map(w => {
      if (w.id !== workflowId) return w;
      return {
        ...w,
        steps: w.steps.map(s => ({ ...s, status: 'pending' as const, results: undefined }))
      };
    }));
    setCurrentStepIndex(0);
    toast.info('Workflow reset. Ready to run again.');
  }, []);

  // Calculate workflow progress
  const getWorkflowProgress = (workflow: FollowUpWorkflow) => {
    const completed = workflow.steps.filter(s => s.status === 'completed').length;
    return Math.round((completed / workflow.steps.length) * 100);
  };

  if (!processingResult) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
          <h3 className="text-lg font-medium mb-2">No Document Processed</h3>
          <p className="text-muted-foreground">
            Upload and process a document first to access follow-up workflows.
          </p>
        </CardContent>
      </Card>
    );
  }

  if (applicableWorkflows.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <AlertTriangle className="h-12 w-12 mx-auto mb-4 text-amber-500 opacity-50" />
          <h3 className="text-lg font-medium mb-2">No Follow-Up Workflows Available</h3>
          <p className="text-muted-foreground">
            No guided workflows are configured for {selectedDocType} documents.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="border-primary/30 bg-gradient-to-r from-primary/5 to-transparent">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bot className="h-5 w-5 text-primary" />
            Guided Follow-Up Workflows
          </CardTitle>
          <CardDescription>
            Complete follow-up tasks for your {processingResult.documentType} document with guided agent workflows
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            <Badge variant="outline" className="text-xs">
              <FileText className="h-3 w-3 mr-1" />
              {processingResult.fileName}
            </Badge>
            <Badge variant="secondary" className="text-xs">
              {applicableWorkflows.length} workflows available
            </Badge>
            {agentFindings.length > 0 && (
              <Badge className="bg-green-600 text-white text-xs">
                {agentFindings.length} agents completed
              </Badge>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Workflow Tabs */}
      <Tabs value={selectedWorkflow || applicableWorkflows[0]?.id} onValueChange={(v) => setSelectedWorkflow(v as FollowUpArea)}>
        <TabsList className="w-full flex-wrap h-auto gap-1 p-1">
          {applicableWorkflows.map(workflow => (
            <TabsTrigger 
              key={workflow.id} 
              value={workflow.id}
              className="flex items-center gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
              disabled={isRunning && selectedWorkflow !== workflow.id}
            >
              {workflow.icon}
              <span className="hidden sm:inline">{workflow.name}</span>
              {getWorkflowProgress(workflow) > 0 && (
                <Badge variant="secondary" className="text-[10px] ml-1">
                  {getWorkflowProgress(workflow)}%
                </Badge>
              )}
            </TabsTrigger>
          ))}
        </TabsList>

        {applicableWorkflows.map(workflow => (
          <TabsContent key={workflow.id} value={workflow.id} className="space-y-4 mt-4">
            {/* Workflow Overview */}
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2 text-lg">
                      {workflow.icon}
                      {workflow.name}
                    </CardTitle>
                    <CardDescription>{workflow.description}</CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    {getWorkflowProgress(workflow) === 100 ? (
                      <Button variant="outline" size="sm" onClick={() => resetWorkflow(workflow.id)}>
                        <RefreshCw className="h-4 w-4 mr-1" />
                        Reset
                      </Button>
                    ) : (
                      <Button 
                        onClick={() => runWorkflow(workflow.id)}
                        disabled={isRunning}
                        size="sm"
                      >
                        {isRunning && selectedWorkflow === workflow.id ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                            Running...
                          </>
                        ) : (
                          <>
                            <Play className="h-4 w-4 mr-1" />
                            Run Workflow
                          </>
                        )}
                      </Button>
                    )}
                  </div>
                </div>
                
                {/* Progress Bar */}
                <div className="mt-4">
                  <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
                    <span>Progress</span>
                    <span>{getWorkflowProgress(workflow)}% Complete</span>
                  </div>
                  <Progress value={getWorkflowProgress(workflow)} className="h-2" />
                </div>
              </CardHeader>

              <CardContent>
                {/* Related Tables Info */}
                <div className="flex items-center gap-2 mb-4 text-xs text-muted-foreground">
                  <Database className="h-3 w-3" />
                  <span>Related tables: {workflow.relatedTables.join(', ')}</span>
                </div>

                {/* Steps List */}
                <ScrollArea className="h-[400px]">
                  <div className="space-y-3">
                    {workflow.steps.map((step, index) => (
                      <div
                        key={step.id}
                        className={`p-4 rounded-lg border transition-all ${
                          step.status === 'running' ? 'border-primary bg-primary/5' :
                          step.status === 'completed' ? 'border-green-500/50 bg-green-50/50 dark:bg-green-950/20' :
                          step.status === 'error' ? 'border-destructive/50 bg-destructive/5' :
                          'border-border bg-muted/30'
                        }`}
                      >
                        <div className="flex items-start gap-4">
                          {/* Step Number & Status */}
                          <div className="flex flex-col items-center">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                              step.status === 'completed' ? 'bg-green-500 text-white' :
                              step.status === 'running' ? 'bg-primary text-primary-foreground' :
                              step.status === 'error' ? 'bg-destructive text-destructive-foreground' :
                              'bg-muted text-muted-foreground'
                            }`}>
                              {step.status === 'completed' ? <CheckCircle className="h-4 w-4" /> :
                               step.status === 'running' ? <Loader2 className="h-4 w-4 animate-spin" /> :
                               step.status === 'error' ? <XCircle className="h-4 w-4" /> :
                               index + 1}
                            </div>
                            {index < workflow.steps.length - 1 && (
                              <div className={`w-0.5 h-8 mt-2 ${
                                step.status === 'completed' ? 'bg-green-500' : 'bg-border'
                              }`} />
                            )}
                          </div>

                          {/* Step Content */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <h4 className="font-medium">{step.title}</h4>
                              <Badge className={getCategoryBadge(step.category)} variant="secondary">
                                {step.category}
                              </Badge>
                              {step.agentId && (
                                <Badge variant="outline" className="text-[10px]">
                                  <Bot className="h-3 w-3 mr-1" />
                                  Agent
                                </Badge>
                              )}
                            </div>
                            <p className="text-sm text-muted-foreground">{step.description}</p>
                            
                            {/* Estimated Time */}
                            <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                              <Clock className="h-3 w-3" />
                              <span>~{step.estimatedTime} min</span>
                              {step.status === 'completed' && step.results && (
                                <Badge variant="secondary" className="text-[10px]">
                                  Results available
                                </Badge>
                              )}
                            </div>

                            {/* Step Results Preview */}
                            {step.status === 'completed' && step.results && (
                              <div className="mt-3 p-2 bg-background rounded border text-xs">
                                <div className="flex items-center gap-1 text-green-600 mb-1">
                                  <Sparkles className="h-3 w-3" />
                                  <span className="font-medium">Results</span>
                                </div>
                                <pre className="text-muted-foreground overflow-x-auto">
                                  {JSON.stringify(step.results, null, 2).slice(0, 200)}...
                                </pre>
                              </div>
                            )}

                            {/* Error Message */}
                            {step.status === 'error' && (
                              <Alert variant="destructive" className="mt-2">
                                <AlertDescription className="text-xs">
                                  Step failed. Click "Run Workflow" to retry from this step.
                                </AlertDescription>
                              </Alert>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>
        ))}
      </Tabs>

      {/* Cross-Reference Info */}
      <Alert>
        <Sparkles className="h-4 w-4" />
        <AlertDescription>
          <strong>Cross-Document Workflows:</strong> After completing a prescription workflow, you can automatically 
          trigger Insurance Card verification and Patient Onboarding workflows for comprehensive processing.
        </AlertDescription>
      </Alert>
    </div>
  );
}
