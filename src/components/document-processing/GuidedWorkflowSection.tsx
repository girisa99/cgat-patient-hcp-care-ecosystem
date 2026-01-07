/**
 * GuidedWorkflowSection Component
 * Integrated guided workflow section for SubAgentRecommendationDialog
 * Shows step-by-step multi-agent workflows based on document type
 * Replaces separate FollowUpTab with inline workflow execution
 */

import React, { useState, useCallback } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import {
  CheckCircle,
  XCircle,
  Clock,
  Play,
  ChevronDown,
  ChevronRight,
  CreditCard,
  UserCheck,
  Pill,
  Shield,
  Stethoscope,
  Loader2,
  Sparkles,
  ArrowRight,
  Bot
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

// Guided step interface
interface GuidedStep {
  id: string;
  title: string;
  description: string;
  category: 'extraction' | 'verification' | 'integration' | 'validation' | 'completion';
  estimatedTime: number;
  status: 'pending' | 'running' | 'completed' | 'error' | 'skipped';
  agentId?: string;
  results?: any;
}

// Workflow interface
interface GuidedWorkflow {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  steps: GuidedStep[];
  applicableDocTypes: string[];
}

// Define the 5 guided workflow areas
const GUIDED_WORKFLOWS: GuidedWorkflow[] = [
  {
    id: 'insurance-verification-flow',
    name: 'Insurance Verification Flow',
    description: 'Verify insurance coverage, eligibility, and plan details step-by-step',
    icon: <CreditCard className="h-4 w-4" />,
    applicableDocTypes: ['insurance', 'prescription', 'patient-onboarding'],
    steps: [
      {
        id: 'insurance-extract',
        title: 'Extract Insurance Details',
        description: 'Pull member ID, group number, plan type',
        category: 'extraction',
        estimatedTime: 1,
        status: 'pending',
        agentId: 'eligibility-ai'
      },
      {
        id: 'insurance-verify',
        title: 'Verify Coverage Eligibility',
        description: 'Check if plan is active and valid',
        category: 'verification',
        estimatedTime: 2,
        status: 'pending',
        agentId: 'coverage-summary'
      },
      {
        id: 'insurance-benefits',
        title: 'Lookup Benefits',
        description: 'Retrieve co-pay, deductible, OOP max',
        category: 'integration',
        estimatedTime: 2,
        status: 'pending',
        agentId: 'optum-benefits'
      },
      {
        id: 'insurance-save',
        title: 'Save to Patient Record',
        description: 'Update enrollment_insurance_info',
        category: 'completion',
        estimatedTime: 1,
        status: 'pending'
      }
    ]
  },
  {
    id: 'patient-onboarding-flow',
    name: 'Patient Onboarding Flow',
    description: 'Complete patient intake with demographics and consent',
    icon: <UserCheck className="h-4 w-4" />,
    applicableDocTypes: ['patient-onboarding', 'insurance'],
    steps: [
      {
        id: 'patient-demographics',
        title: 'Extract Demographics',
        description: 'Pull name, DOB, address, contact',
        category: 'extraction',
        estimatedTime: 1,
        status: 'pending'
      },
      {
        id: 'patient-duplicate-check',
        title: 'Duplicate Patient Check',
        description: 'Check for existing records',
        category: 'validation',
        estimatedTime: 2,
        status: 'pending',
        agentId: 'data-validation'
      },
      {
        id: 'patient-identity',
        title: 'Identity Verification',
        description: 'Verify patient identity documents',
        category: 'verification',
        estimatedTime: 2,
        status: 'pending',
        agentId: 'identity-verification-ai'
      },
      {
        id: 'patient-insurance-link',
        title: 'Link Insurance',
        description: 'Associate insurance with patient',
        category: 'integration',
        estimatedTime: 1,
        status: 'pending'
      },
      {
        id: 'patient-enrollment',
        title: 'Complete Enrollment',
        description: 'Finalize patient record',
        category: 'completion',
        estimatedTime: 1,
        status: 'pending'
      }
    ]
  },
  {
    id: 'prescription-processing-flow',
    name: 'Prescription Processing Flow',
    description: 'Process medication, lookup NDC, check interactions',
    icon: <Pill className="h-4 w-4" />,
    applicableDocTypes: ['prescription'],
    steps: [
      {
        id: 'rx-extract',
        title: 'Extract Prescription Details',
        description: 'Pull medication name, strength, sig',
        category: 'extraction',
        estimatedTime: 1,
        status: 'pending'
      },
      {
        id: 'rx-ndc-lookup',
        title: 'NDC Code Lookup',
        description: 'Find matching NDC codes',
        category: 'integration',
        estimatedTime: 2,
        status: 'pending',
        agentId: 'ndc-lookup'
      },
      {
        id: 'rx-drug-interaction',
        title: 'Drug Interaction Check',
        description: 'Check for medication interactions',
        category: 'validation',
        estimatedTime: 2,
        status: 'pending',
        agentId: 'drug-interaction'
      },
      {
        id: 'rx-clinical-review',
        title: 'Clinical Appropriateness',
        description: 'AI clinical review and dosage check',
        category: 'validation',
        estimatedTime: 3,
        status: 'pending',
        agentId: 'clinical-review'
      },
      {
        id: 'rx-cost-analysis',
        title: 'Cost Analysis',
        description: 'Check pricing and alternatives',
        category: 'integration',
        estimatedTime: 2,
        status: 'pending',
        agentId: 'cost-analysis'
      }
    ]
  },
  {
    id: 'verification-flow',
    name: 'Verification Workflow',
    description: 'Cross-verify documents and data for accuracy',
    icon: <Shield className="h-4 w-4" />,
    applicableDocTypes: ['insurance', 'prescription', 'patient-onboarding'],
    steps: [
      {
        id: 'verify-prescriber',
        title: 'Prescriber NPI Verification',
        description: 'Verify prescriber NPI is valid',
        category: 'verification',
        estimatedTime: 2,
        status: 'pending',
        agentId: 'npi-verification'
      },
      {
        id: 'verify-data',
        title: 'Data Validation',
        description: 'Validate extracted data patterns',
        category: 'validation',
        estimatedTime: 2,
        status: 'pending',
        agentId: 'data-validation'
      },
      {
        id: 'verify-patient-id',
        title: 'Patient ID Verification',
        description: 'Confirm patient identity',
        category: 'verification',
        estimatedTime: 1,
        status: 'pending',
        agentId: 'identity-verification-ai'
      }
    ]
  },
  {
    id: 'clinical-review-flow',
    name: 'Clinical Review Flow',
    description: 'Clinical assessment and recommendation workflow',
    icon: <Stethoscope className="h-4 w-4" />,
    applicableDocTypes: ['prescription', 'xray', 'ct-scan', 'mri', 'lab-results'],
    steps: [
      {
        id: 'clinical-extract',
        title: 'Clinical Data Extraction',
        description: 'Extract clinical findings',
        category: 'extraction',
        estimatedTime: 2,
        status: 'pending'
      },
      {
        id: 'clinical-review',
        title: 'AI Clinical Review',
        description: 'AI-powered clinical analysis',
        category: 'validation',
        estimatedTime: 3,
        status: 'pending',
        agentId: 'clinical-review'
      },
      {
        id: 'clinical-trend',
        title: 'Trend Analysis',
        description: 'Analyze clinical trends over time',
        category: 'validation',
        estimatedTime: 2,
        status: 'pending',
        agentId: 'trend-analysis'
      },
      {
        id: 'clinical-summary',
        title: 'Generate Summary',
        description: 'Compile recommendations for review',
        category: 'completion',
        estimatedTime: 2,
        status: 'pending',
        agentId: 'medical-summary'
      }
    ]
  }
];

interface GuidedWorkflowSectionProps {
  documentTypeId: string;
  extractedData?: Record<string, any>;
  onWorkflowSelect?: (workflow: GuidedWorkflow, selectedStepAgentIds: string[]) => void;
  onExecuteWorkflow?: (workflow: GuidedWorkflow) => void;
  selectedWorkflowId?: string | null;
  onSelectedWorkflowChange?: (workflowId: string | null) => void;
}

export default function GuidedWorkflowSection({
  documentTypeId,
  extractedData,
  onWorkflowSelect,
  onExecuteWorkflow,
  selectedWorkflowId,
  onSelectedWorkflowChange
}: GuidedWorkflowSectionProps) {
  const [expandedWorkflow, setExpandedWorkflow] = useState<string | null>(null);
  const [workflowStates, setWorkflowStates] = useState<Record<string, GuidedWorkflow>>({});

  // Filter applicable workflows based on document type
  const applicableWorkflows = GUIDED_WORKFLOWS.filter(w => 
    w.applicableDocTypes.includes(documentTypeId)
  );

  if (applicableWorkflows.length === 0) {
    return null;
  }

  // Get status color
  const getStatusColor = (status: GuidedStep['status']) => {
    switch (status) {
      case 'completed': return 'text-green-500';
      case 'running': return 'text-blue-500 animate-pulse';
      case 'error': return 'text-destructive';
      case 'skipped': return 'text-muted-foreground';
      default: return 'text-muted-foreground';
    }
  };

  const getStatusIcon = (status: GuidedStep['status']) => {
    switch (status) {
      case 'completed': return <CheckCircle className="h-3.5 w-3.5 text-green-500" />;
      case 'running': return <Loader2 className="h-3.5 w-3.5 text-blue-500 animate-spin" />;
      case 'error': return <XCircle className="h-3.5 w-3.5 text-destructive" />;
      case 'skipped': return <ArrowRight className="h-3.5 w-3.5 text-muted-foreground" />;
      default: return <Clock className="h-3.5 w-3.5 text-muted-foreground" />;
    }
  };

  const getCategoryBadgeColor = (category: GuidedStep['category']) => {
    const colors: Record<string, string> = {
      extraction: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
      verification: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300',
      integration: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300',
      validation: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300',
      completion: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300'
    };
    return colors[category] || 'bg-muted text-muted-foreground';
  };

  // Calculate workflow progress
  const getWorkflowProgress = (workflow: GuidedWorkflow) => {
    const state = workflowStates[workflow.id] || workflow;
    const completed = state.steps.filter(s => s.status === 'completed').length;
    return Math.round((completed / state.steps.length) * 100);
  };

  // Get agent IDs from selected workflow steps
  const getWorkflowAgentIds = (workflow: GuidedWorkflow): string[] => {
    return workflow.steps
      .filter(step => step.agentId)
      .map(step => step.agentId!);
  };

  const handleSelectWorkflow = (workflow: GuidedWorkflow) => {
    const newId = selectedWorkflowId === workflow.id ? null : workflow.id;
    onSelectedWorkflowChange?.(newId);
    
    if (newId) {
      const agentIds = getWorkflowAgentIds(workflow);
      onWorkflowSelect?.(workflow, agentIds);
    }
  };

  const handleExecuteWorkflow = (workflow: GuidedWorkflow, e: React.MouseEvent) => {
    e.stopPropagation();
    onExecuteWorkflow?.(workflow);
    toast.info(`Starting ${workflow.name}...`);
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2 px-1">
        <Sparkles className="h-3.5 w-3.5 text-primary" />
        <span className="text-xs font-semibold text-primary">Guided Workflows</span>
        <Badge variant="outline" className="text-[9px] ml-auto">Step-by-Step</Badge>
      </div>

      <div className="space-y-2">
        {applicableWorkflows.map(workflow => {
          const isSelected = selectedWorkflowId === workflow.id;
          const isExpanded = expandedWorkflow === workflow.id;
          const progress = getWorkflowProgress(workflow);
          const agentCount = workflow.steps.filter(s => s.agentId).length;

          return (
            <Collapsible 
              key={workflow.id}
              open={isExpanded}
              onOpenChange={(open) => setExpandedWorkflow(open ? workflow.id : null)}
            >
              <div
                className={cn(
                  "rounded-lg border transition-all",
                  isSelected
                    ? "border-primary bg-primary/5 ring-1 ring-primary/30"
                    : "border-border hover:border-primary/50 hover:bg-muted/30"
                )}
              >
                {/* Workflow Header */}
                <div
                  className="p-3 cursor-pointer"
                  onClick={() => handleSelectWorkflow(workflow)}
                >
                  <div className="flex items-start gap-3">
                    <div className={cn(
                      "p-2 rounded-lg",
                      isSelected ? "bg-primary text-primary-foreground" : "bg-muted"
                    )}>
                      {workflow.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-medium text-sm">{workflow.name}</span>
                        {isSelected && (
                          <CheckCircle className="h-4 w-4 text-primary" />
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5">{workflow.description}</p>
                      <div className="flex items-center gap-3 mt-2">
                        <Badge variant="outline" className="text-[9px]">
                          {workflow.steps.length} steps
                        </Badge>
                        <Badge variant="outline" className="text-[9px] bg-green-50 text-green-700 border-green-300 dark:bg-green-900/30 dark:text-green-300">
                          <Bot className="h-2.5 w-2.5 mr-0.5" />
                          {agentCount} agents
                        </Badge>
                        {progress > 0 && (
                          <span className="text-[10px] text-green-600">{progress}% complete</span>
                        )}
                      </div>
                    </div>
                    <CollapsibleTrigger asChild onClick={(e) => e.stopPropagation()}>
                      <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                        {isExpanded ? (
                          <ChevronDown className="h-4 w-4" />
                        ) : (
                          <ChevronRight className="h-4 w-4" />
                        )}
                      </Button>
                    </CollapsibleTrigger>
                  </div>

                  {/* Progress bar when selected */}
                  {isSelected && progress > 0 && (
                    <Progress value={progress} className="h-1 mt-3" />
                  )}
                </div>

                {/* Expanded Steps */}
                <CollapsibleContent>
                  <Separator />
                  <div className="p-3 space-y-2 bg-muted/20">
                    {workflow.steps.map((step, index) => {
                      const state = workflowStates[workflow.id]?.steps[index] || step;
                      return (
                        <div
                          key={step.id}
                          className="flex items-start gap-3 p-2 rounded-md bg-background/50"
                        >
                          <div className="flex items-center gap-2 min-w-[24px]">
                            <span className="text-[10px] text-muted-foreground font-mono">
                              {index + 1}.
                            </span>
                            {getStatusIcon(state.status)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className={cn(
                                "text-xs font-medium",
                                getStatusColor(state.status)
                              )}>
                                {step.title}
                              </span>
                              <Badge className={cn("text-[8px] h-4", getCategoryBadgeColor(step.category))}>
                                {step.category}
                              </Badge>
                              {step.agentId && (
                                <Badge variant="outline" className="text-[8px] h-4 bg-green-50 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-300">
                                  <Bot className="h-2 w-2 mr-0.5" />
                                  {step.agentId}
                                </Badge>
                              )}
                            </div>
                            <p className="text-[10px] text-muted-foreground mt-0.5">
                              {step.description}
                            </p>
                          </div>
                          <span className="text-[9px] text-muted-foreground whitespace-nowrap">
                            ~{step.estimatedTime}m
                          </span>
                        </div>
                      );
                    })}

                    {/* Quick Execute Button */}
                    <Button
                      size="sm"
                      className="w-full mt-2 h-8"
                      variant={isSelected ? "default" : "outline"}
                      onClick={(e) => handleExecuteWorkflow(workflow, e)}
                    >
                      <Play className="h-3 w-3 mr-1" />
                      Run Full Workflow
                    </Button>
                  </div>
                </CollapsibleContent>
              </div>
            </Collapsible>
          );
        })}
      </div>
    </div>
  );
}

// Export workflow definitions for use in other components
export { GUIDED_WORKFLOWS };
export type { GuidedWorkflow, GuidedStep };
