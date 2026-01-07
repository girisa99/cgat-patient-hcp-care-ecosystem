/**
 * GuidedWorkflowSection Component
 * Integrated guided workflow section for SubAgentRecommendationDialog
 * Shows step-by-step multi-agent workflows based on document type
 * Replaces separate FollowUpTab with inline workflow execution
 * Enhanced with per-step provider selection for multi-drug/multi-provider scenarios
 */

import React, { useState, useCallback } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
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
  Bot,
  Settings2,
  Zap
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

// Provider options for each step type
export interface ProviderOption {
  id: string;
  name: string;
  description: string;
  type: 'ai' | 'api' | 'database' | 'manual';
  capabilities: string[];
  costTier: 'free' | 'low' | 'medium' | 'high';
  avgResponseTime: number; // in seconds
}

// Available providers by category
const PROVIDER_OPTIONS: Record<string, ProviderOption[]> = {
  extraction: [
    { id: 'gpt-4o-vision', name: 'GPT-4o Vision', description: 'OpenAI vision model for document extraction', type: 'ai', capabilities: ['handwritten', 'printed', 'multi-page'], costTier: 'medium', avgResponseTime: 5 },
    { id: 'claude-3-vision', name: 'Claude 3 Vision', description: 'Anthropic vision for complex documents', type: 'ai', capabilities: ['handwritten', 'multi-language', 'tables'], costTier: 'medium', avgResponseTime: 6 },
    { id: 'google-vision', name: 'Google Vision OCR', description: 'Google Cloud OCR + Document AI', type: 'ai', capabilities: ['ocr', 'tables', 'forms'], costTier: 'low', avgResponseTime: 3 },
    { id: 'azure-form-recognizer', name: 'Azure Form Recognizer', description: 'Microsoft form extraction', type: 'ai', capabilities: ['forms', 'tables', 'receipts'], costTier: 'medium', avgResponseTime: 4 },
  ],
  verification: [
    { id: 'npi-registry', name: 'NPI Registry API', description: 'Official CMS NPI lookup', type: 'api', capabilities: ['npi-validation', 'prescriber-info'], costTier: 'free', avgResponseTime: 2 },
    { id: 'dea-validation', name: 'DEA Validation', description: 'DEA number checksum verification', type: 'api', capabilities: ['dea-checksum', 'schedule-lookup'], costTier: 'free', avgResponseTime: 1 },
    { id: 'surescripts', name: 'Surescripts EPCS', description: 'E-prescribe verification', type: 'api', capabilities: ['epcs-verify', 'pharmacy-lookup'], costTier: 'high', avgResponseTime: 3 },
    { id: 'identity-ai', name: 'Identity Verification AI', description: 'AI-powered identity matching', type: 'ai', capabilities: ['face-match', 'document-verify'], costTier: 'medium', avgResponseTime: 4 },
  ],
  integration: [
    { id: 'rxnorm-api', name: 'RxNorm API', description: 'NIH drug normalization', type: 'api', capabilities: ['drug-lookup', 'rxcui-mapping', 'ndc-lookup'], costTier: 'free', avgResponseTime: 2 },
    { id: 'fda-ndc', name: 'FDA NDC Database', description: 'Official NDC lookup', type: 'api', capabilities: ['ndc-validation', 'drug-info'], costTier: 'free', avgResponseTime: 2 },
    { id: 'openfdatabase', name: 'OpenFDA', description: 'FDA drug interactions & labels', type: 'api', capabilities: ['interactions', 'labels', 'recalls'], costTier: 'free', avgResponseTime: 3 },
    { id: 'drugbank', name: 'DrugBank API', description: 'Comprehensive drug database', type: 'api', capabilities: ['interactions', 'pharmacology', 'targets'], costTier: 'high', avgResponseTime: 2 },
    { id: 'goodrx', name: 'GoodRx Pricing', description: 'Medication pricing comparison', type: 'api', capabilities: ['pricing', 'coupons', 'alternatives'], costTier: 'medium', avgResponseTime: 3 },
  ],
  validation: [
    { id: 'clinical-ai', name: 'Clinical Review AI', description: 'AI-powered clinical validation', type: 'ai', capabilities: ['dose-check', 'interaction-check', 'contraindications'], costTier: 'medium', avgResponseTime: 5 },
    { id: 'ismp-rules', name: 'ISMP Safety Rules', description: 'ISMP dangerous abbreviation detection', type: 'database', capabilities: ['abbreviation-check', 'look-alike-sound-alike'], costTier: 'free', avgResponseTime: 1 },
    { id: 'cds-hooks', name: 'CDS Hooks', description: 'Clinical decision support', type: 'api', capabilities: ['clinical-alerts', 'guidelines'], costTier: 'medium', avgResponseTime: 4 },
    { id: 'first-databank', name: 'First Databank', description: 'Drug interaction database', type: 'api', capabilities: ['interactions', 'dosing', 'indications'], costTier: 'high', avgResponseTime: 3 },
  ],
  completion: [
    { id: 'supabase', name: 'Supabase DB', description: 'Save to local database', type: 'database', capabilities: ['storage', 'realtime'], costTier: 'low', avgResponseTime: 1 },
    { id: 'fhir-api', name: 'FHIR Server', description: 'HL7 FHIR compliant storage', type: 'api', capabilities: ['fhir-resources', 'interoperability'], costTier: 'medium', avgResponseTime: 2 },
    { id: 'pharmacy-network', name: 'Pharmacy Network', description: 'Send to pharmacy', type: 'api', capabilities: ['e-prescribe', 'pharmacy-routing'], costTier: 'high', avgResponseTime: 3 },
  ]
};

// Guided step interface - enhanced with provider selection
interface GuidedStep {
  id: string;
  title: string;
  description: string;
  category: 'extraction' | 'verification' | 'integration' | 'validation' | 'completion';
  estimatedTime: number;
  status: 'pending' | 'running' | 'completed' | 'error' | 'skipped';
  agentId?: string;
  selectedProviderId?: string;
  results?: any;
  supportedProviders?: string[]; // Provider IDs that can be used for this step
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

// Define the 5 guided workflow areas with enhanced provider support
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
        agentId: 'eligibility-ai',
        supportedProviders: ['gpt-4o-vision', 'claude-3-vision', 'google-vision', 'azure-form-recognizer']
      },
      {
        id: 'insurance-verify',
        title: 'Verify Coverage Eligibility',
        description: 'Check if plan is active and valid',
        category: 'verification',
        estimatedTime: 2,
        status: 'pending',
        agentId: 'coverage-summary',
        supportedProviders: ['npi-registry', 'surescripts', 'identity-ai']
      },
      {
        id: 'insurance-benefits',
        title: 'Lookup Benefits',
        description: 'Retrieve co-pay, deductible, OOP max',
        category: 'integration',
        estimatedTime: 2,
        status: 'pending',
        agentId: 'optum-benefits',
        supportedProviders: ['rxnorm-api', 'goodrx', 'drugbank']
      },
      {
        id: 'insurance-save',
        title: 'Save to Patient Record',
        description: 'Update enrollment_insurance_info',
        category: 'completion',
        estimatedTime: 1,
        status: 'pending',
        supportedProviders: ['supabase', 'fhir-api']
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
        status: 'pending',
        supportedProviders: ['gpt-4o-vision', 'claude-3-vision', 'google-vision', 'azure-form-recognizer']
      },
      {
        id: 'patient-duplicate-check',
        title: 'Duplicate Patient Check',
        description: 'Check for existing records',
        category: 'validation',
        estimatedTime: 2,
        status: 'pending',
        agentId: 'data-validation',
        supportedProviders: ['clinical-ai', 'supabase']
      },
      {
        id: 'patient-identity',
        title: 'Identity Verification',
        description: 'Verify patient identity documents',
        category: 'verification',
        estimatedTime: 2,
        status: 'pending',
        agentId: 'identity-verification-ai',
        supportedProviders: ['identity-ai', 'npi-registry']
      },
      {
        id: 'patient-insurance-link',
        title: 'Link Insurance',
        description: 'Associate insurance with patient',
        category: 'integration',
        estimatedTime: 1,
        status: 'pending',
        supportedProviders: ['surescripts', 'fhir-api']
      },
      {
        id: 'patient-enrollment',
        title: 'Complete Enrollment',
        description: 'Finalize patient record',
        category: 'completion',
        estimatedTime: 1,
        status: 'pending',
        supportedProviders: ['supabase', 'fhir-api']
      }
    ]
  },
  {
    id: 'prescription-processing-flow',
    name: 'Prescription Processing Flow',
    description: 'Process MULTIPLE medications, lookup NDC, check interactions per drug',
    icon: <Pill className="h-4 w-4" />,
    applicableDocTypes: ['prescription'],
    steps: [
      {
        id: 'rx-extract',
        title: 'Extract All Prescriptions',
        description: 'Extract ALL medications with handwriting recognition, ISMP abbreviation handling',
        category: 'extraction',
        estimatedTime: 2,
        status: 'pending',
        supportedProviders: ['gpt-4o-vision', 'claude-3-vision', 'google-vision', 'azure-form-recognizer']
      },
      {
        id: 'rx-prescriber-verify',
        title: 'Verify Prescriber Credentials',
        description: 'NPI/DEA checksum validation, controlled substance authorization',
        category: 'verification',
        estimatedTime: 2,
        status: 'pending',
        agentId: 'npi-verification',
        supportedProviders: ['npi-registry', 'dea-validation', 'surescripts']
      },
      {
        id: 'rx-rxnorm-mapping',
        title: 'RxNorm Drug Mapping',
        description: 'Map each medication to RxCUI, normalize drug names',
        category: 'integration',
        estimatedTime: 2,
        status: 'pending',
        agentId: 'rxnorm-lookup',
        supportedProviders: ['rxnorm-api', 'fda-ndc', 'openfdatabase', 'drugbank']
      },
      {
        id: 'rx-ndc-lookup',
        title: 'NDC Code Lookup',
        description: 'Find matching NDC codes for each medication',
        category: 'integration',
        estimatedTime: 2,
        status: 'pending',
        agentId: 'ndc-lookup',
        supportedProviders: ['fda-ndc', 'rxnorm-api', 'drugbank']
      },
      {
        id: 'rx-drug-interaction',
        title: 'Drug Interaction Check',
        description: 'Check ALL medications for interactions with each other',
        category: 'validation',
        estimatedTime: 3,
        status: 'pending',
        agentId: 'drug-interaction',
        supportedProviders: ['clinical-ai', 'first-databank', 'openfdatabase', 'drugbank']
      },
      {
        id: 'rx-dose-validation',
        title: 'Dose & Sig Validation',
        description: 'Validate dosing, frequency, dangerous abbreviations (ISMP)',
        category: 'validation',
        estimatedTime: 2,
        status: 'pending',
        agentId: 'dose-validation',
        supportedProviders: ['clinical-ai', 'ismp-rules', 'first-databank', 'cds-hooks']
      },
      {
        id: 'rx-controlled-check',
        title: 'Controlled Substance Check',
        description: 'Schedule II-V requirements, DEA validation, quantity limits',
        category: 'validation',
        estimatedTime: 2,
        status: 'pending',
        agentId: 'controlled-substance',
        supportedProviders: ['dea-validation', 'ismp-rules', 'clinical-ai']
      },
      {
        id: 'rx-cost-analysis',
        title: 'Cost & Alternative Analysis',
        description: 'Check pricing and generic alternatives for each medication',
        category: 'integration',
        estimatedTime: 2,
        status: 'pending',
        agentId: 'cost-analysis',
        supportedProviders: ['goodrx', 'drugbank', 'rxnorm-api']
      },
      {
        id: 'rx-save',
        title: 'Save Prescription Record',
        description: 'Persist all medications with validation results',
        category: 'completion',
        estimatedTime: 1,
        status: 'pending',
        supportedProviders: ['supabase', 'fhir-api', 'pharmacy-network']
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
        description: 'Verify prescriber NPI is valid and active',
        category: 'verification',
        estimatedTime: 2,
        status: 'pending',
        agentId: 'npi-verification',
        supportedProviders: ['npi-registry', 'surescripts']
      },
      {
        id: 'verify-dea',
        title: 'DEA Number Validation',
        description: 'Validate DEA checksum and schedule authorization',
        category: 'verification',
        estimatedTime: 1,
        status: 'pending',
        agentId: 'dea-verification',
        supportedProviders: ['dea-validation', 'npi-registry']
      },
      {
        id: 'verify-data',
        title: 'Data Validation',
        description: 'Validate extracted data patterns and formats',
        category: 'validation',
        estimatedTime: 2,
        status: 'pending',
        agentId: 'data-validation',
        supportedProviders: ['clinical-ai', 'ismp-rules']
      },
      {
        id: 'verify-patient-id',
        title: 'Patient ID Verification',
        description: 'Confirm patient identity matches records',
        category: 'verification',
        estimatedTime: 1,
        status: 'pending',
        agentId: 'identity-verification-ai',
        supportedProviders: ['identity-ai', 'supabase']
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
        description: 'Extract clinical findings and values',
        category: 'extraction',
        estimatedTime: 2,
        status: 'pending',
        supportedProviders: ['gpt-4o-vision', 'claude-3-vision', 'google-vision']
      },
      {
        id: 'clinical-review',
        title: 'AI Clinical Review',
        description: 'AI-powered clinical analysis and appropriateness',
        category: 'validation',
        estimatedTime: 3,
        status: 'pending',
        agentId: 'clinical-review',
        supportedProviders: ['clinical-ai', 'cds-hooks', 'first-databank']
      },
      {
        id: 'clinical-interactions',
        title: 'Interaction & Contraindication Check',
        description: 'Check for drug-drug, drug-allergy, drug-condition interactions',
        category: 'validation',
        estimatedTime: 2,
        status: 'pending',
        agentId: 'interaction-check',
        supportedProviders: ['first-databank', 'drugbank', 'openfdatabase', 'clinical-ai']
      },
      {
        id: 'clinical-trend',
        title: 'Trend Analysis',
        description: 'Analyze clinical trends over time',
        category: 'validation',
        estimatedTime: 2,
        status: 'pending',
        agentId: 'trend-analysis',
        supportedProviders: ['clinical-ai', 'supabase']
      },
      {
        id: 'clinical-summary',
        title: 'Generate Clinical Summary',
        description: 'Compile recommendations for review',
        category: 'completion',
        estimatedTime: 2,
        status: 'pending',
        agentId: 'medical-summary',
        supportedProviders: ['clinical-ai', 'supabase', 'fhir-api']
      }
    ]
  }
];

interface GuidedWorkflowSectionProps {
  documentTypeId: string;
  extractedData?: Record<string, any>;
  onWorkflowSelect?: (workflow: GuidedWorkflow, selectedStepAgentIds: string[], stepProviders: Record<string, string>) => void;
  onExecuteWorkflow?: (workflow: GuidedWorkflow, stepProviders: Record<string, string>) => void;
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
  const [stepProviders, setStepProviders] = useState<Record<string, Record<string, string>>>({});
  const [showProviderConfig, setShowProviderConfig] = useState<Record<string, boolean>>({});

  // Filter applicable workflows based on document type
  const applicableWorkflows = GUIDED_WORKFLOWS.filter(w => 
    w.applicableDocTypes.includes(documentTypeId)
  );

  if (applicableWorkflows.length === 0) {
    return null;
  }

  // Get provider for a step
  const getSelectedProvider = (workflowId: string, stepId: string, category: string): string => {
    const workflowProviders = stepProviders[workflowId] || {};
    if (workflowProviders[stepId]) return workflowProviders[stepId];
    // Default to first available provider for category
    const categoryProviders = PROVIDER_OPTIONS[category] || [];
    return categoryProviders[0]?.id || '';
  };

  // Update provider selection for a step
  const handleProviderChange = (workflowId: string, stepId: string, providerId: string) => {
    setStepProviders(prev => ({
      ...prev,
      [workflowId]: {
        ...(prev[workflowId] || {}),
        [stepId]: providerId
      }
    }));
  };

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

  const getCostBadgeColor = (costTier: ProviderOption['costTier']) => {
    const colors: Record<string, string> = {
      free: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300',
      low: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
      medium: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300',
      high: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300'
    };
    return colors[costTier] || 'bg-muted text-muted-foreground';
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

  // Get providers for all steps
  const getWorkflowStepProviders = (workflow: GuidedWorkflow): Record<string, string> => {
    const providers: Record<string, string> = {};
    workflow.steps.forEach(step => {
      providers[step.id] = getSelectedProvider(workflow.id, step.id, step.category);
    });
    return providers;
  };

  const handleSelectWorkflow = (workflow: GuidedWorkflow) => {
    const newId = selectedWorkflowId === workflow.id ? null : workflow.id;
    onSelectedWorkflowChange?.(newId);
    
    if (newId) {
      const agentIds = getWorkflowAgentIds(workflow);
      const providers = getWorkflowStepProviders(workflow);
      onWorkflowSelect?.(workflow, agentIds, providers);
    }
  };

  const handleExecuteWorkflow = (workflow: GuidedWorkflow, e: React.MouseEvent) => {
    e.stopPropagation();
    const providers = getWorkflowStepProviders(workflow);
    onExecuteWorkflow?.(workflow, providers);
    toast.info(`Starting ${workflow.name} with configured providers...`);
  };

  const toggleProviderConfig = (workflowId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setShowProviderConfig(prev => ({
      ...prev,
      [workflowId]: !prev[workflowId]
    }));
  };

  // Get available providers for a step based on supportedProviders or category
  const getAvailableProviders = (step: GuidedStep): ProviderOption[] => {
    const categoryProviders = PROVIDER_OPTIONS[step.category] || [];
    if (step.supportedProviders && step.supportedProviders.length > 0) {
      return categoryProviders.filter(p => step.supportedProviders!.includes(p.id));
    }
    return categoryProviders;
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
          const showConfig = showProviderConfig[workflow.id] || false;

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
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0"
                        onClick={(e) => toggleProviderConfig(workflow.id, e)}
                        title="Configure providers"
                      >
                        <Settings2 className={cn("h-3.5 w-3.5", showConfig && "text-primary")} />
                      </Button>
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
                      const availableProviders = getAvailableProviders(step);
                      const selectedProvider = getSelectedProvider(workflow.id, step.id, step.category);
                      const providerInfo = availableProviders.find(p => p.id === selectedProvider);

                      return (
                        <div
                          key={step.id}
                          className="flex flex-col gap-2 p-2 rounded-md bg-background/50"
                        >
                          <div className="flex items-start gap-3">
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

                          {/* Provider Selection (shown when config mode is on) */}
                          {showConfig && availableProviders.length > 0 && (
                            <div className="ml-8 pl-3 border-l-2 border-primary/20">
                              <div className="flex items-center gap-2">
                                <Zap className="h-3 w-3 text-primary" />
                                <span className="text-[10px] font-medium text-muted-foreground">Provider:</span>
                                <Select
                                  value={selectedProvider}
                                  onValueChange={(value) => handleProviderChange(workflow.id, step.id, value)}
                                >
                                  <SelectTrigger className="h-6 text-[10px] w-auto min-w-[140px]">
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {availableProviders.map(provider => (
                                      <SelectItem key={provider.id} value={provider.id} className="text-xs">
                                        <div className="flex items-center gap-2">
                                          <span>{provider.name}</span>
                                          <Badge className={cn("text-[8px] h-3", getCostBadgeColor(provider.costTier))}>
                                            {provider.costTier}
                                          </Badge>
                                        </div>
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                                {providerInfo && (
                                  <span className="text-[9px] text-muted-foreground">
                                    ~{providerInfo.avgResponseTime}s
                                  </span>
                                )}
                              </div>
                              {providerInfo && (
                                <p className="text-[9px] text-muted-foreground mt-1">
                                  {providerInfo.description}
                                </p>
                              )}
                            </div>
                          )}
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
export { GUIDED_WORKFLOWS, PROVIDER_OPTIONS };
export type { GuidedWorkflow, GuidedStep };

