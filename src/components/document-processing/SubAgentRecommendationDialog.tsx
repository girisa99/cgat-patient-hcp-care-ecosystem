/**
 * Sub-Agent Recommendation Dialog
 * Clean, focused dialog for recommending sub-agents based on document type
 * Shows AI-powered agents (ready) vs integration-required agents (need setup)
 */

import React, { useState, useMemo } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { 
  Bot, 
  CheckCircle,
  XCircle,
  Brain,
  Plus,
  Zap,
  Hammer,
  Loader2,
  Sparkles,
  Settings,
  AlertCircle,
  Info
} from 'lucide-react';
import { DocumentTypeConfig } from '@/config/documentTypes';
import { cn } from '@/lib/utils';
import { useNavigate } from 'react-router-dom';
import { AddCustomAgentDialog, type CustomAgentConfig } from './studio/AddCustomAgentDialog';
import { useAgentExecution, type SubAgentSuggestion, type AgentReadyStatus } from '@/hooks/useAgentExecution';
import { toast } from 'sonner';

interface SubAgentRecommendationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  documentType: DocumentTypeConfig;
  extractedData?: Record<string, any>;
  onAgentExecutionComplete?: (results: any[]) => void;
}

export type { SubAgentSuggestion };

// Agent ready status definitions
// 'ai-powered' = Uses Universal AI multi-model routing (Claude/Gemini/OpenAI with intelligent fallback), ready to execute immediately
// 'ready' = Simple agent, ready to execute  
// 'needs-config' = Requires external API integration

// Document-type specific sub-agent suggestions - UNIVERSAL for ALL document types
const DOCUMENT_TYPE_SUBAGENTS: Record<string, SubAgentSuggestion[]> = {
  'insurance': [
    {
      id: 'insurance-verification',
      name: 'Insurance Verification Agent',
      description: 'Verifies insurance eligibility and coverage in real-time via payer APIs',
      icon: '🔍',
      useCase: 'insurance-verification',
      triggerCondition: 'After insurance card is processed',
      architectureType: 'a2a',
      readyStatus: 'needs-config',
      requiredSetup: ['Payer API credentials (Availity, Change Healthcare)', '270/271 EDI transaction setup', 'Provider NPI registration']
    },
    {
      id: 'eligibility-check',
      name: 'Eligibility Check Agent',
      description: 'Checks patient eligibility for specific services and procedures',
      icon: '✅',
      useCase: 'eligibility-check',
      triggerCondition: 'When coverage details are extracted',
      architectureType: 'agentic',
      readyStatus: 'needs-config',
      requiredSetup: ['Payer eligibility API endpoints', 'Service/CPT code mapping']
    },
    {
      id: 'benefits-verification',
      name: 'Benefits Verification Agent',
      description: 'Checks specific benefit coverage, copays, deductibles',
      icon: '💵',
      useCase: 'benefits-verification',
      triggerCondition: 'When benefit details needed',
      architectureType: 'a2a',
      readyStatus: 'needs-config',
      requiredSetup: ['Payer benefits API', 'Plan ID mapping']
    },
    {
      id: 'prior-auth',
      name: 'Prior Authorization Agent',
      description: 'Automates prior authorization requests and status tracking',
      icon: '📋',
      useCase: 'prior-authorization',
      triggerCondition: 'When procedure requires pre-approval',
      architectureType: 'multi-agent',
      readyStatus: 'needs-config',
      requiredSetup: ['CoverMyMeds or SureScripts API', 'Payer PA portal credentials', 'Provider credentialing']
    }
  ],
  'prescription': [
    {
      id: 'ndc-lookup',
      name: 'NDC Code Lookup Agent',
      description: '✓ Real-time NDC lookup via FDA OpenFDA - drug codes, manufacturer, package info',
      icon: '🔢',
      useCase: 'ndc-lookup',
      triggerCondition: 'When drug name is extracted',
      architectureType: 'single',
      readyStatus: 'ai-powered'
    },
    {
      id: 'drug-alternatives',
      name: 'Drug Alternatives & Generics Agent',
      description: '✓ Finds generic equivalents, therapeutic alternatives with cost comparison',
      icon: '💊',
      useCase: 'drug-alternatives',
      triggerCondition: 'After drug identification',
      architectureType: 'agentic',
      readyStatus: 'ai-powered'
    },
    {
      id: 'efficacy-analysis',
      name: 'Efficacy Analysis Agent',
      description: '🤖 AI analysis of drug effectiveness for condition, treatment outcomes, success rates',
      icon: '📊',
      useCase: 'efficacy-analysis',
      triggerCondition: 'When medication + condition identified',
      architectureType: 'agentic',
      readyStatus: 'ai-powered'
    },
    {
      id: 'safety-profile',
      name: 'Safety & Side Effects Agent',
      description: '🤖 Comprehensive side effect analysis, warnings, contraindications, black box alerts',
      icon: '🛡️',
      useCase: 'safety-profile',
      triggerCondition: 'When medication identified',
      architectureType: 'agentic',
      readyStatus: 'ai-powered'
    },
    {
      id: 'dosage-validation',
      name: 'Dosage & Form Validation Agent',
      description: '✓ Validates dosage, strength, administration route, form appropriateness',
      icon: '📐',
      useCase: 'dosage-validation',
      triggerCondition: 'When dosage/SIG extracted',
      architectureType: 'single',
      readyStatus: 'ai-powered'
    },
    {
      id: 'drug-interaction',
      name: 'Drug Interaction & Compatibility Agent',
      description: '🤖 Checks medication interactions, food interactions, condition contraindications',
      icon: '⚠️',
      useCase: 'drug-interaction',
      triggerCondition: 'When medication is identified',
      architectureType: 'agentic',
      readyStatus: 'ai-powered'
    },
    {
      id: 'clinical-review',
      name: 'Clinical Appropriateness Agent',
      description: '🤖 Overall clinical review: appropriateness, SIG analysis, patient factors',
      icon: '🩺',
      useCase: 'clinical-review',
      triggerCondition: 'After all medication data extracted',
      architectureType: 'agentic',
      readyStatus: 'ai-powered'
    },
    {
      id: 'cost-analysis',
      name: 'Cost-Effectiveness Agent',
      description: '✓ Compares brand vs generic pricing, insurance coverage, patient assistance programs',
      icon: '💰',
      useCase: 'cost-analysis',
      triggerCondition: 'When alternatives identified',
      architectureType: 'single',
      readyStatus: 'ai-powered'
    },
    {
      id: 'medication-reconciliation',
      name: 'Medication Reconciliation Agent',
      description: 'Reconciles medications across care settings',
      icon: '📋',
      useCase: 'medication-reconciliation',
      triggerCondition: 'When patient transitions care',
      architectureType: 'multi-agent',
      readyStatus: 'needs-config',
      requiredSetup: ['EHR integration (Epic, Cerner)', 'Patient medication history access']
    },
    {
      id: 'pharmacy-finder',
      name: 'Pharmacy Finder Agent',
      description: 'Finds pharmacies with medication in stock and best pricing',
      icon: '🏥',
      useCase: 'pharmacy-finder',
      triggerCondition: 'When medication availability needed',
      architectureType: 'single',
      readyStatus: 'needs-config',
      requiredSetup: ['GoodRx or pharmacy network API', 'Location services']
    }
  ],
  'patient-onboarding': [
    {
      id: 'npi-verification',
      name: 'NPI Verification Agent',
      description: '✓ Real-time NPI verification via NPPES Registry API',
      icon: '✅',
      useCase: 'npi-verification',
      triggerCondition: 'When provider NPI is captured',
      architectureType: 'a2a',
      readyStatus: 'ai-powered'
    },
    {
      id: 'credentialing',
      name: 'Credentialing Agent',
      description: 'Automates provider credentialing verification',
      icon: '📜',
      useCase: 'credentialing',
      triggerCondition: 'When credentials need verification',
      architectureType: 'multi-agent',
      readyStatus: 'needs-config',
      requiredSetup: ['State licensing board APIs', 'DEA verification service', 'Hospital privilege systems']
    },
    {
      id: 'identity-verification',
      name: 'Identity Verification Agent',
      description: 'Verifies patient identity via document checks',
      icon: '🆔',
      useCase: 'identity-verification',
      triggerCondition: 'During new patient registration',
      architectureType: 'agentic',
      readyStatus: 'needs-config',
      requiredSetup: ['ID verification API (Jumio, Onfido)', 'Biometric verification service']
    }
  ],
  'treatment-center': [
    {
      id: 'npi-registry',
      name: 'NPI Registry Agent',
      description: '✓ Real-time facility/provider NPI verification via NPPES',
      icon: '✅',
      useCase: 'npi-verification',
      triggerCondition: 'When NPI captured in documents',
      architectureType: 'a2a',
      readyStatus: 'ai-powered'
    },
    {
      id: 'facility-credentialing',
      name: 'Facility Credentialing Agent',
      description: 'Handles treatment center licensing verification',
      icon: '🏢',
      useCase: 'facility-credentialing',
      triggerCondition: 'When facility onboarding initiated',
      architectureType: 'multi-agent',
      readyStatus: 'needs-config',
      requiredSetup: ['State health department API', 'CMS certification database', 'Accreditation body APIs']
    },
    {
      id: 'compliance-check',
      name: 'Compliance Verification Agent',
      description: 'Checks regulatory compliance status',
      icon: '📋',
      useCase: 'compliance-verification',
      triggerCondition: 'When compliance docs processed',
      architectureType: 'agentic',
      readyStatus: 'needs-config',
      requiredSetup: ['HIPAA compliance checklist', 'State regulations database']
    }
  ],
  'invoice': [
    {
      id: 'claims-processor',
      name: 'Claims Processing Agent',
      description: 'Automates claims submission and tracking',
      icon: '📄',
      useCase: 'claims-processing',
      triggerCondition: 'When invoice ready for claims',
      architectureType: 'multi-agent'
    },
    {
      id: 'denial-management',
      name: 'Denial Management Agent',
      description: 'Handles claim denials and appeals',
      icon: '🔄',
      useCase: 'denial-management',
      triggerCondition: 'When claim is denied',
      architectureType: 'agentic'
    },
    {
      id: 'payment-posting',
      name: 'Payment Posting Agent',
      description: 'Automates ERA/EOB processing',
      icon: '💰',
      useCase: 'payment-posting',
      triggerCondition: 'When payment received',
      architectureType: 'a2a'
    }
  ],
  'xray': [
    {
      id: 'radiology-ai',
      name: 'Radiology AI Agent',
      description: '🤖 Universal AI (Gemini → Claude fallback) powered X-ray interpretation',
      icon: '🔬',
      useCase: 'radiology-ai',
      triggerCondition: 'When X-ray image uploaded',
      architectureType: 'agentic',
      readyStatus: 'ai-powered'
    },
    {
      id: 'report-generation',
      name: 'Radiology Report Agent',
      description: 'Generates structured radiology reports',
      icon: '📝',
      useCase: 'radiology-report',
      triggerCondition: 'After AI analysis complete',
      architectureType: 'single',
      readyStatus: 'needs-config',
      requiredSetup: ['PACS integration', 'HL7/FHIR endpoint']
    }
  ],
  'ct-scan': [
    {
      id: 'ct-analysis',
      name: 'CT Analysis Agent',
      description: '🤖 Universal AI (Gemini → Claude fallback) powered CT scan interpretation',
      icon: '🧠',
      useCase: 'ct-analysis',
      triggerCondition: 'When CT scan uploaded',
      architectureType: 'agentic',
      readyStatus: 'ai-powered'
    },
    {
      id: 'ct-report',
      name: 'CT Report Generation Agent',
      description: 'Generates detailed CT scan reports with findings',
      icon: '📋',
      useCase: 'ct-report',
      triggerCondition: 'After CT analysis complete',
      architectureType: 'single',
      readyStatus: 'needs-config',
      requiredSetup: ['PACS integration', 'Radiology workflow integration']
    }
  ],
  'mri': [
    {
      id: 'mri-analysis',
      name: 'MRI Analysis Agent',
      description: '🤖 Universal AI (Gemini → Claude fallback) powered MRI interpretation',
      icon: '🧠',
      useCase: 'mri-analysis',
      triggerCondition: 'When MRI scan uploaded',
      architectureType: 'agentic',
      readyStatus: 'ai-powered'
    },
    {
      id: 'mri-report',
      name: 'MRI Report Generation Agent',
      description: 'Creates comprehensive MRI diagnostic reports',
      icon: '📝',
      useCase: 'mri-report',
      triggerCondition: 'After MRI analysis complete',
      architectureType: 'single',
      readyStatus: 'needs-config',
      requiredSetup: ['PACS integration', 'Report templating system']
    }
  ],
  'ecg': [
    {
      id: 'ecg-interpretation',
      name: 'ECG Interpretation Agent',
      description: 'AI-powered ECG rhythm analysis',
      icon: '❤️',
      useCase: 'ecg-interpretation',
      triggerCondition: 'When ECG uploaded',
      architectureType: 'agentic',
      readyStatus: 'needs-config',
      requiredSetup: ['ECG device integration', 'Cardiology workflow']
    },
    {
      id: 'cardiac-alert',
      name: 'Cardiac Alert Agent',
      description: 'Triggers alerts for critical cardiac findings',
      icon: '🚨',
      useCase: 'cardiac-alerting',
      triggerCondition: 'When abnormal rhythms detected',
      architectureType: 'a2a',
      readyStatus: 'needs-config',
      requiredSetup: ['Alert notification system', 'On-call provider directory']
    }
  ],
  'lab-results': [
    {
      id: 'critical-value-alert',
      name: 'Critical Value Alert Agent',
      description: '🤖 Universal AI (Claude → OpenAI fallback) powered critical lab value detection',
      icon: '🚨',
      useCase: 'critical-value-alerting',
      triggerCondition: 'When lab result contains critical values',
      architectureType: 'a2a',
      readyStatus: 'ai-powered'
    },
    {
      id: 'trend-analysis',
      name: 'Lab Trend Analysis Agent',
      description: '🤖 Universal AI (Claude → OpenAI fallback) powered lab trends and patterns analysis',
      icon: '📈',
      useCase: 'lab-trend-analysis',
      triggerCondition: 'When comparing with historical results',
      architectureType: 'agentic',
      readyStatus: 'ai-powered'
    }
  ],
  // NEW: Missing document types with full sub-agent support
  'passport': [
    {
      id: 'identity-verification',
      name: 'Identity Verification Agent',
      description: 'Validates passport authenticity and identity details',
      icon: '🆔',
      useCase: 'identity-verification',
      triggerCondition: 'When passport uploaded',
      architectureType: 'agentic'
    },
    {
      id: 'travel-compliance',
      name: 'Travel Compliance Agent',
      description: 'Checks visa requirements and travel eligibility',
      icon: '✈️',
      useCase: 'travel-compliance',
      triggerCondition: 'When travel documentation needed',
      architectureType: 'a2a'
    },
    {
      id: 'fraud-detection',
      name: 'Document Fraud Detection Agent',
      description: 'AI-powered fraud and forgery detection',
      icon: '🔍',
      useCase: 'fraud-detection',
      triggerCondition: 'During identity verification',
      architectureType: 'agentic'
    }
  ],
  'ultrasound': [
    {
      id: 'ultrasound-analysis',
      name: 'Ultrasound Analysis Agent',
      description: 'AI-powered ultrasound image interpretation',
      icon: '📡',
      useCase: 'ultrasound-analysis',
      triggerCondition: 'When ultrasound image uploaded',
      architectureType: 'agentic'
    },
    {
      id: 'fetal-monitoring',
      name: 'Fetal Monitoring Agent',
      description: 'Specialized fetal development analysis for OB ultrasounds',
      icon: '👶',
      useCase: 'fetal-monitoring',
      triggerCondition: 'For obstetric ultrasounds',
      architectureType: 'agentic'
    },
    {
      id: 'ultrasound-report',
      name: 'Ultrasound Report Agent',
      description: 'Generates comprehensive ultrasound reports',
      icon: '📝',
      useCase: 'ultrasound-report',
      triggerCondition: 'After ultrasound analysis',
      architectureType: 'single'
    }
  ],
  'mammogram': [
    {
      id: 'mammogram-analysis',
      name: 'Mammogram Analysis Agent',
      description: 'AI-powered breast imaging analysis and BI-RADS scoring',
      icon: '🩺',
      useCase: 'mammogram-analysis',
      triggerCondition: 'When mammogram uploaded',
      architectureType: 'agentic'
    },
    {
      id: 'breast-density',
      name: 'Breast Density Assessment Agent',
      description: 'Calculates breast tissue density classification',
      icon: '📊',
      useCase: 'breast-density',
      triggerCondition: 'During mammogram analysis',
      architectureType: 'single'
    },
    {
      id: 'follow-up-scheduler',
      name: 'Follow-up Scheduler Agent',
      description: 'Schedules follow-up appointments based on findings',
      icon: '📅',
      useCase: 'follow-up-scheduling',
      triggerCondition: 'When follow-up needed',
      architectureType: 'a2a'
    }
  ],
  'customer-onboarding': [
    {
      id: 'kyc-verification',
      name: 'KYC Verification Agent',
      description: 'Performs Know Your Customer identity verification',
      icon: '✅',
      useCase: 'kyc-verification',
      triggerCondition: 'During customer registration',
      architectureType: 'agentic'
    },
    {
      id: 'document-validation',
      name: 'Document Validation Agent',
      description: 'Validates submitted onboarding documents',
      icon: '📄',
      useCase: 'document-validation',
      triggerCondition: 'When documents uploaded',
      architectureType: 'single'
    },
    {
      id: 'credit-check',
      name: 'Credit Check Agent',
      description: 'Performs credit history and risk assessment',
      icon: '💳',
      useCase: 'credit-check',
      triggerCondition: 'When financial verification needed',
      architectureType: 'a2a'
    },
    {
      id: 'account-setup',
      name: 'Account Setup Agent',
      description: 'Automates account creation and provisioning',
      icon: '🔧',
      useCase: 'account-setup',
      triggerCondition: 'After verification complete',
      architectureType: 'multi-agent'
    }
  ],
  'order-management': [
    {
      id: 'order-tracking',
      name: 'Order Tracking Agent',
      description: 'Real-time order status tracking and updates',
      icon: '📦',
      useCase: 'order-tracking',
      triggerCondition: 'When order placed',
      architectureType: 'a2a'
    },
    {
      id: 'inventory-check',
      name: 'Inventory Check Agent',
      description: 'Verifies product availability and stock levels',
      icon: '📊',
      useCase: 'inventory-check',
      triggerCondition: 'Before order processing',
      architectureType: 'single'
    },
    {
      id: 'shipping-coordination',
      name: 'Shipping Coordination Agent',
      description: 'Coordinates shipping and logistics',
      icon: '🚚',
      useCase: 'shipping-coordination',
      triggerCondition: 'When order ready for shipment',
      architectureType: 'multi-agent'
    }
  ],
  'manufacturing-onboarding': [
    {
      id: 'supplier-verification',
      name: 'Supplier Verification Agent',
      description: 'Verifies supplier credentials and certifications',
      icon: '✅',
      useCase: 'supplier-verification',
      triggerCondition: 'During supplier onboarding',
      architectureType: 'agentic'
    },
    {
      id: 'quality-compliance',
      name: 'Quality Compliance Agent',
      description: 'Checks manufacturing quality standards compliance',
      icon: '🏭',
      useCase: 'quality-compliance',
      triggerCondition: 'When quality docs submitted',
      architectureType: 'multi-agent'
    },
    {
      id: 'contract-processing',
      name: 'Contract Processing Agent',
      description: 'Automates contract review and approval workflows',
      icon: '📋',
      useCase: 'contract-processing',
      triggerCondition: 'When contracts submitted',
      architectureType: 'agentic'
    }
  ],
  // Billing is an alias for invoice sub-agents
  'billing': [
    {
      id: 'claims-processor',
      name: 'Claims Processing Agent',
      description: 'Automates claims submission and tracking',
      icon: '📄',
      useCase: 'claims-processing',
      triggerCondition: 'When billing ready for claims',
      architectureType: 'multi-agent'
    },
    {
      id: 'denial-management',
      name: 'Denial Management Agent',
      description: 'Handles claim denials and appeals',
      icon: '🔄',
      useCase: 'denial-management',
      triggerCondition: 'When claim is denied',
      architectureType: 'agentic'
    },
    {
      id: 'payment-posting',
      name: 'Payment Posting Agent',
      description: 'Automates ERA/EOB processing',
      icon: '💰',
      useCase: 'payment-posting',
      triggerCondition: 'When payment received',
      architectureType: 'a2a'
    },
    {
      id: 'ar-follow-up',
      name: 'AR Follow-up Agent',
      description: 'Automates accounts receivable follow-up and aging management',
      icon: '📞',
      useCase: 'ar-follow-up',
      triggerCondition: 'When invoices become overdue',
      architectureType: 'agentic'
    }
  ]
};

// Get fallback/generic sub-agents for any document type not explicitly defined
const getGenericSubAgents = (documentTypeId: string): SubAgentSuggestion[] => [
  {
    id: 'data-extraction',
    name: 'Data Extraction Agent',
    description: 'Advanced data extraction and field mapping',
    icon: '📤',
    useCase: 'data-extraction',
    triggerCondition: `When ${documentTypeId} document processed`,
    architectureType: 'agentic'
  },
  {
    id: 'validation-agent',
    name: 'Validation Agent',
    description: 'Validates extracted data against business rules',
    icon: '✅',
    useCase: 'data-validation',
    triggerCondition: 'After data extraction',
    architectureType: 'single'
  },
  {
    id: 'crm-sync',
    name: 'CRM Sync Agent',
    description: 'Syncs extracted data to CRM systems (Salesforce, HubSpot)',
    icon: '🔄',
    useCase: 'crm-sync',
    triggerCondition: 'When data ready for export',
    architectureType: 'a2a'
  }
];

const getArchitectureBadge = (type: string) => {
  switch (type) {
    case 'a2a':
      return <Badge variant="outline" className="text-[10px] bg-blue-50 text-blue-700 border-blue-200">A2A Protocol</Badge>;
    case 'agentic':
      return <Badge variant="outline" className="text-[10px] bg-purple-50 text-purple-700 border-purple-200">Agentic AI</Badge>;
    case 'multi-agent':
      return <Badge variant="outline" className="text-[10px] bg-green-50 text-green-700 border-green-200">Multi-Agent</Badge>;
    case 'single':
      return <Badge variant="outline" className="text-[10px] bg-gray-50 text-gray-700 border-gray-200">Single Agent</Badge>;
    default:
      return null;
  }
};

export default function SubAgentRecommendationDialog({
  open,
  onOpenChange,
  documentType,
  extractedData,
  onAgentExecutionComplete
}: SubAgentRecommendationDialogProps) {
  const navigate = useNavigate();
  const [selectedAgents, setSelectedAgents] = useState<string[]>([]);
  const [executeMode, setExecuteMode] = useState<'execute' | 'build'>('execute');
  const [showAddAgentDialog, setShowAddAgentDialog] = useState(false);
  const [customAgents, setCustomAgents] = useState<SubAgentSuggestion[]>([]);
  const [selectedProvider, setSelectedProvider] = useState<'auto' | 'claude' | 'gemini' | 'openai'>('auto');
  
  const { executeAgents, isExecuting, executionProgress, currentAgent } = useAgentExecution();

  // Get suggestions for current document type - with fallback for any unknown types
  const suggestions = useMemo(() => {
    const docTypeAgents = DOCUMENT_TYPE_SUBAGENTS[documentType.id];
    const baseAgents = docTypeAgents && docTypeAgents.length > 0 
      ? docTypeAgents 
      : getGenericSubAgents(documentType.id);
    
    // Include custom agents
    return [...baseAgents, ...customAgents];
  }, [documentType.id, customAgents]);

  const toggleAgent = (agentId: string) => {
    setSelectedAgents(prev => 
      prev.includes(agentId)
        ? prev.filter(id => id !== agentId)
        : [...prev, agentId]
    );
  };

  const handleCustomAgentCreated = (agent: CustomAgentConfig) => {
    const newAgent: SubAgentSuggestion = {
      id: agent.id,
      name: agent.name,
      description: agent.description,
      icon: '🤖',
      useCase: agent.documentTypeId,
      triggerCondition: agent.triggerCondition,
      architectureType: agent.architectureType
    };
    setCustomAgents(prev => [...prev, newAgent]);
    setSelectedAgents(prev => [...prev, agent.id]);
  };

  const handleExecuteNow = async () => {
    const selectedSubAgents = suggestions.filter(s => selectedAgents.includes(s.id));
    
    if (selectedSubAgents.length === 0) {
      toast.error('Please select at least one agent');
      return;
    }

    // Build comprehensive extracted fields from all available data sources
    const baseExtractedFields = extractedData?.processingResult?.extractedFields || extractedData?.extractedFields || {};
    
    // Merge in additional medication-specific data if available
    const enhancedFields = { ...baseExtractedFields };
    
    // Add medication name from drug search query if not in extractedFields
    if (extractedData?.drugSearchQuery && !enhancedFields.medication?.value && !enhancedFields.medication_name?.value) {
      enhancedFields.medication = { value: extractedData.drugSearchQuery, confidence: 0.95 };
    }
    
    // Add SIG from instructions if available
    if (extractedData?.sigInstructions && !enhancedFields.sig?.value) {
      enhancedFields.sig = { value: extractedData.sigInstructions, confidence: 0.9 };
    }
    
    // Add NDC if available
    if (extractedData?.selectedNdc && !enhancedFields.ndc?.value) {
      enhancedFields.ndc = { value: extractedData.selectedNdc, confidence: 0.95 };
    }
    
    // Add parsed SIG components
    if (extractedData?.parsedSig) {
      if (extractedData.parsedSig.dose && !enhancedFields.dose?.value) {
        enhancedFields.dose = { value: extractedData.parsedSig.dose, confidence: 0.9 };
      }
      if (extractedData.parsedSig.frequency && !enhancedFields.frequency?.value) {
        enhancedFields.frequency = { value: extractedData.parsedSig.frequency, confidence: 0.9 };
      }
      if (extractedData.parsedSig.route && !enhancedFields.route?.value) {
        enhancedFields.route = { value: extractedData.parsedSig.route, confidence: 0.9 };
      }
      if (extractedData.parsedSig.duration && !enhancedFields.duration?.value) {
        enhancedFields.duration = { value: extractedData.parsedSig.duration, confidence: 0.9 };
      }
    }
    
    // Add search results data for medication details
    if (extractedData?.searchResults) {
      if (extractedData.searchResults.drugName && !enhancedFields.medication?.value) {
        enhancedFields.medication = { value: extractedData.searchResults.drugName, confidence: 0.95 };
      }
      if (extractedData.searchResults.genericName) {
        enhancedFields.generic_name = { value: extractedData.searchResults.genericName, confidence: 0.9 };
      }
      if (extractedData.searchResults.strength) {
        enhancedFields.strength = { value: extractedData.searchResults.strength, confidence: 0.9 };
      }
    }
    
    console.log('[SubAgentDialog] Enhanced fields for agent execution:', Object.keys(enhancedFields));
    console.log('[SubAgentDialog] Medication:', enhancedFields.medication?.value || enhancedFields.medication_name?.value);

    const documentContext = {
      documentType: documentType.id,
      extractedFields: enhancedFields,
      rawText: extractedData?.processingResult?.rawText || extractedData?.rawText,
      fileName: extractedData?.processingResult?.fileName || extractedData?.fileName,
      imageBase64: extractedData?.medicalImageBase64,
      // Pass selected provider preference (auto means use intelligent routing)
      preferredProvider: selectedProvider === 'auto' ? undefined : selectedProvider
    };

    const results = await executeAgents(selectedSubAgents, documentContext);
    
    onAgentExecutionComplete?.(results);
    onOpenChange(false);
    
    toast.success(`Executed ${results.length} agent(s)`, {
      description: `${results.filter(r => r.status === 'completed').length} completed successfully`
    });
  };

  const handleBuildAgents = () => {
    const selectedSubAgents = suggestions.filter(s => selectedAgents.includes(s.id));
    
    // Auto-generate workflow nodes with BIDIRECTIONAL linking back to document processing
    const generatedNodes = [
      {
        id: 'start-node',
        type: 'enhanced',
        position: { x: 100, y: 200 },
        data: {
          label: 'Document Input',
          type_key: 'trigger',
          intent: `Receive ${documentType.title} document for processing`,
          configuration: { documentType: documentType.id, sourceModule: 'document-processing', bidirectional: true }
        }
      },
      ...selectedSubAgents.map((agent, idx) => ({
        id: `agent-${agent.id}`,
        type: 'enhanced',
        position: { x: 400 + (idx % 2) * 300, y: 100 + Math.floor(idx / 2) * 180 },
        data: {
          label: agent.name,
          type_key: agent.architectureType === 'a2a' ? 'a2a-agent' : agent.architectureType === 'multi-agent' ? 'agent-team' : agent.architectureType === 'agentic' ? 'react-loop' : 'ai-agent',
          intent: agent.triggerCondition,
          icon: agent.icon,
          configuration: { useCase: agent.useCase, architectureType: agent.architectureType, description: agent.description, linkedDocumentType: documentType.id }
        }
      })),
      { id: 'return-doc-node', type: 'enhanced', position: { x: 400 + Math.ceil(selectedSubAgents.length / 2) * 300, y: 100 }, data: { label: '↩️ Return to Document Processing', type_key: 'connector', intent: 'Send results back', configuration: { targetModule: 'document-processing', bidirectional: true } } },
      { id: 'end-node', type: 'enhanced', position: { x: 400 + Math.ceil(selectedSubAgents.length / 2) * 300 + 200, y: 200 }, data: { label: 'Process Complete', type_key: 'output', intent: 'Workflow completion', configuration: {} } }
    ];

    const generatedEdges = [
      ...(selectedSubAgents.length > 0 ? [{ id: 'e-start-first', source: 'start-node', target: `agent-${selectedSubAgents[0].id}`, type: 'smoothstep', animated: true, label: 'Document Data' }] : []),
      ...selectedSubAgents.slice(0, -1).map((agent, idx) => ({ id: `e-${agent.id}-${selectedSubAgents[idx + 1].id}`, source: `agent-${agent.id}`, target: `agent-${selectedSubAgents[idx + 1].id}`, type: 'smoothstep', animated: true })),
      ...(selectedSubAgents.length > 0 ? [{ id: 'e-last-return', source: `agent-${selectedSubAgents[selectedSubAgents.length - 1].id}`, target: 'return-doc-node', type: 'smoothstep', animated: true, label: 'Results' }] : []),
      { id: 'e-return-end', source: 'return-doc-node', target: 'end-node', type: 'smoothstep', animated: true }
    ];
    
    if (extractedData) {
      sessionStorage.setItem('docProcessing_fullState', JSON.stringify({
        processingResult: extractedData.processingResult || null,
        pendingResult: extractedData.pendingResult || null,
      }));
    }
    
    navigate('/agents/canvas', {
      state: {
        autoGenerated: true,
        generatedNodes,
        generatedEdges,
        fromDocumentProcessing: true,
        documentType: documentType.id,
        prefillContext: {
          name: `${documentType.title} Processing Workflow`,
          useCase: documentType.id,
          description: `Automated workflow for processing ${documentType.title.toLowerCase()} documents`,
          subAgents: selectedSubAgents.map(agent => ({ id: agent.id, name: agent.name, useCase: agent.useCase, triggerCondition: agent.triggerCondition, architectureType: agent.architectureType, icon: agent.icon }))
        }
      }
    });
    
    onOpenChange(false);
  };

  const handleAction = () => {
    if (executeMode === 'execute') {
      handleExecuteNow();
    } else {
      handleBuildAgents();
    }
  };

  const handleSkip = () => {
    onOpenChange(false);
  };

  if (suggestions.length === 0) {
    return null;
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] flex flex-col overflow-hidden">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle className="flex items-center gap-2 text-base">
            <Bot className="h-5 w-5 text-primary" />
            Would you like to add follow-up agents?
          </DialogTitle>
          <DialogDescription className="text-sm">
            Select agents to automate processing for {documentType.title}
          </DialogDescription>
        </DialogHeader>

        {/* Scrollable Agent List - Proper scrolling with visible scrollbar */}
        <div className="flex-1 min-h-0 overflow-y-auto max-h-[45vh] pr-1" style={{ scrollbarGutter: 'stable' }}>
          <div className="space-y-2 py-2 pr-2">
            {/* Ready Agents Section (Universal AI + Real APIs) - Show first and prominently */}
            {suggestions.filter(a => a.readyStatus === 'ai-powered').length > 0 && (
              <div className="mb-4">
                <div className="flex items-center gap-2 mb-3 px-1 py-1.5 bg-green-50 dark:bg-green-950/40 rounded-lg">
                  <Sparkles className="h-4 w-4 text-green-600" />
                  <span className="text-sm font-semibold text-green-700 dark:text-green-300">
                    Ready to Execute ({suggestions.filter(a => a.readyStatus === 'ai-powered').length} agents)
                  </span>
                  <Badge variant="outline" className="ml-auto text-[9px] bg-green-100 text-green-700 border-green-300">
                    AI-Powered
                  </Badge>
                </div>
                {suggestions.filter(a => a.readyStatus === 'ai-powered').map(agent => (
                  <div
                    key={agent.id}
                    className={cn(
                      "p-3 rounded-lg border cursor-pointer transition-all mb-2",
                      selectedAgents.includes(agent.id)
                        ? "border-green-500 bg-green-50 dark:bg-green-950/30 ring-1 ring-green-300"
                        : "border-green-200 dark:border-green-800 hover:border-green-400 hover:bg-green-50/50 dark:hover:bg-green-950/20"
                    )}
                    onClick={() => toggleAgent(agent.id)}
                  >
                    <div className="flex items-start gap-3">
                      <div className="text-xl">{agent.icon}</div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-medium text-sm">{agent.name}</span>
                          <Badge variant="outline" className="text-[9px] bg-green-100 text-green-700 border-green-300 dark:bg-green-900/50 dark:text-green-300 dark:border-green-700">
                            <Sparkles className="h-2.5 w-2.5 mr-0.5" /> Ready
                          </Badge>
                          {selectedAgents.includes(agent.id) && (
                            <CheckCircle className="h-4 w-4 text-green-500" />
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground mt-0.5">{agent.description}</p>
                        <div className="mt-1.5 flex items-center gap-2 flex-wrap">
                          {getArchitectureBadge(agent.architectureType)}
                          <span className="text-[10px] text-amber-600">⚡ {agent.triggerCondition}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Integration-Required Agents Section */}
            {suggestions.filter(a => a.readyStatus === 'needs-config' || !a.readyStatus).length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-2 px-1">
                  <Settings className="h-3.5 w-3.5 text-amber-500" />
                  <span className="text-xs font-medium text-amber-700 dark:text-amber-300">Requires Configuration</span>
                </div>
                {suggestions.filter(a => a.readyStatus === 'needs-config' || !a.readyStatus).map(agent => (
                  <TooltipProvider key={agent.id}>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div
                          className={cn(
                            "p-3 rounded-lg border cursor-pointer transition-all mb-2 relative",
                            selectedAgents.includes(agent.id)
                              ? "border-amber-400 bg-amber-50 dark:bg-amber-950/30"
                              : "border-border hover:border-amber-300 hover:bg-muted/30"
                          )}
                          onClick={() => toggleAgent(agent.id)}
                        >
                          <div className="flex items-start gap-3">
                            <div className="text-xl opacity-75">{agent.icon}</div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="font-medium text-sm">{agent.name}</span>
                                <Badge variant="outline" className="text-[9px] bg-amber-50 text-amber-700 border-amber-300 dark:bg-amber-900/50 dark:text-amber-300 dark:border-amber-700">
                                  <Settings className="h-2.5 w-2.5 mr-0.5" /> Setup Needed
                                </Badge>
                                {selectedAgents.includes(agent.id) && (
                                  <CheckCircle className="h-4 w-4 text-amber-500" />
                                )}
                              </div>
                              <p className="text-xs text-muted-foreground mt-0.5">{agent.description}</p>
                              <div className="mt-1.5 flex items-center gap-2 flex-wrap">
                                {getArchitectureBadge(agent.architectureType)}
                                <span className="text-[10px] text-amber-600">⚡ {agent.triggerCondition}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </TooltipTrigger>
                      <TooltipContent side="left" className="max-w-[280px] p-3">
                        <div className="space-y-2">
                          <div className="flex items-center gap-2 font-medium text-sm">
                            <AlertCircle className="h-4 w-4 text-amber-500" />
                            Configuration Required
                          </div>
                          <p className="text-xs text-muted-foreground">
                            This agent requires external integrations to function:
                          </p>
                          <ul className="text-xs space-y-1">
                            {(agent.requiredSetup || ['API credentials', 'Endpoint configuration']).map((req, idx) => (
                              <li key={idx} className="flex items-start gap-1.5">
                                <span className="text-amber-500 mt-0.5">•</span>
                                <span>{req}</span>
                              </li>
                            ))}
                          </ul>
                          <p className="text-[10px] text-muted-foreground italic pt-1">
                            Click to select anyway - will show requirements on execution
                          </p>
                        </div>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                ))}
              </div>
            )}

            {/* Add Custom Agent Card */}
            <div
              className="p-3 rounded-lg border border-dashed border-primary/50 cursor-pointer transition-all hover:bg-primary/5 hover:border-primary"
              onClick={() => setShowAddAgentDialog(true)}
            >
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-full bg-primary/10">
                  <Plus className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <span className="font-medium text-sm text-primary">Add Custom Agent</span>
                  <p className="text-xs text-muted-foreground">Create a new agent for this workflow</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Execute Mode Toggle & Provider Selection */}
        <div className="flex-shrink-0 pt-3 border-t space-y-3">
          <div className="flex items-center gap-4 p-2 rounded-lg bg-muted/50 flex-wrap">
            {/* Mode Selection */}
            <div className="flex items-center gap-2">
              <Label className="text-xs text-muted-foreground">Mode:</Label>
              <RadioGroup value={executeMode} onValueChange={(v) => setExecuteMode(v as 'execute' | 'build')} className="flex gap-3">
                <div className="flex items-center gap-1.5">
                  <RadioGroupItem value="execute" id="execute" />
                  <Label htmlFor="execute" className="text-xs flex items-center gap-1 cursor-pointer">
                    <Zap className="h-3 w-3" /> Execute Now
                  </Label>
                </div>
                <div className="flex items-center gap-1.5">
                  <RadioGroupItem value="build" id="build" />
                  <Label htmlFor="build" className="text-xs flex items-center gap-1 cursor-pointer">
                    <Hammer className="h-3 w-3" /> Build Workflow
                  </Label>
                </div>
              </RadioGroup>
            </div>
            
            {/* AI Provider Selection */}
            {executeMode === 'execute' && (
              <div className="flex items-center gap-2 ml-auto">
                <Label className="text-xs text-muted-foreground">AI Provider:</Label>
                <RadioGroup 
                  value={selectedProvider} 
                  onValueChange={(v) => setSelectedProvider(v as 'auto' | 'claude' | 'gemini' | 'openai')} 
                  className="flex gap-2"
                >
                  <div className="flex items-center gap-1">
                    <RadioGroupItem value="auto" id="auto" className="h-3 w-3" />
                    <Label htmlFor="auto" className="text-[10px] cursor-pointer flex items-center gap-0.5">
                      <Sparkles className="h-2.5 w-2.5 text-primary" /> Auto
                    </Label>
                  </div>
                  <div className="flex items-center gap-1">
                    <RadioGroupItem value="claude" id="claude" className="h-3 w-3" />
                    <Label htmlFor="claude" className="text-[10px] cursor-pointer">🤖 Claude</Label>
                  </div>
                  <div className="flex items-center gap-1">
                    <RadioGroupItem value="gemini" id="gemini" className="h-3 w-3" />
                    <Label htmlFor="gemini" className="text-[10px] cursor-pointer">✨ Gemini</Label>
                  </div>
                  <div className="flex items-center gap-1">
                    <RadioGroupItem value="openai" id="openai" className="h-3 w-3" />
                    <Label htmlFor="openai" className="text-[10px] cursor-pointer">🧠 OpenAI</Label>
                  </div>
                </RadioGroup>
              </div>
            )}
          </div>

          {selectedAgents.length > 0 && (
            <div className="p-2 rounded-lg bg-green-50 dark:bg-green-950/30">
              <div className="text-center">
                <span className="text-sm text-green-700 dark:text-green-300 font-medium">
                  {selectedAgents.length} agent(s) selected
                </span>
              </div>
              {executeMode === 'execute' && (
                <div className="flex justify-center gap-3 mt-1 text-[10px]">
                  {suggestions.filter(s => selectedAgents.includes(s.id) && s.readyStatus === 'ai-powered').length > 0 && (
                    <span className="flex items-center gap-1 text-green-600">
                      <Sparkles className="h-3 w-3" />
                      {suggestions.filter(s => selectedAgents.includes(s.id) && s.readyStatus === 'ai-powered').length} ready
                    </span>
                  )}
                  {suggestions.filter(s => selectedAgents.includes(s.id) && (s.readyStatus === 'needs-config' || !s.readyStatus)).length > 0 && (
                    <span className="flex items-center gap-1 text-amber-600">
                      <Info className="h-3 w-3" />
                      {suggestions.filter(s => selectedAgents.includes(s.id) && (s.readyStatus === 'needs-config' || !s.readyStatus)).length} need setup
                    </span>
                  )}
                </div>
              )}
            </div>
          )}

          <div className="flex gap-3">
            <Button variant="outline" className="flex-1" onClick={handleSkip} disabled={isExecuting}>
              <XCircle className="h-4 w-4 mr-2" />
              No, Skip
            </Button>
            <Button className="flex-1" onClick={handleAction} disabled={selectedAgents.length === 0 || isExecuting}>
              {isExecuting ? (
                <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> {currentAgent?.slice(0, 15)}...</>
              ) : executeMode === 'execute' ? (
                <><Zap className="h-4 w-4 mr-2" /> Execute</>
              ) : (
                <><CheckCircle className="h-4 w-4 mr-2" /> Build</>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>

      <AddCustomAgentDialog
        open={showAddAgentDialog}
        onOpenChange={setShowAddAgentDialog}
        documentTypeId={documentType.id}
        onAgentCreated={handleCustomAgentCreated}
      />
    </Dialog>
  );
}
