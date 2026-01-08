/**
 * Sub-Agent Recommendation Dialog
 * Clean, focused dialog for recommending sub-agents based on document type
 * Shows AI-powered agents (ready) vs integration-required agents (need setup)
 * Includes live execution progress and results confirmation flow
 * Integrated with AgentSetupWizard for configuring needs-config agents
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
import { Alert, AlertDescription } from '@/components/ui/alert';
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
  Info,
  Upload,
  FileText,
  CreditCard,
  Link2,
  ChevronDown,
  Workflow
} from 'lucide-react';
import GuidedWorkflowSection, { type GuidedWorkflow } from './GuidedWorkflowSection';
import { DocumentTypeConfig } from '@/config/documentTypes';
import { cn } from '@/lib/utils';
import { useNavigate } from 'react-router-dom';
import { AddCustomAgentDialog, type CustomAgentConfig } from './studio/AddCustomAgentDialog';
import { useAgentExecution, type SubAgentSuggestion, type AgentReadyStatus, type AgentExecutionResult } from '@/hooks/useAgentExecution';
import { toast } from 'sonner';
import { AgentExecutionProgress } from './AgentExecutionProgress';
import { AgentResultsConfirmation } from './AgentResultsConfirmation';
import { AgentSetupWizard } from './AgentSetupWizard';
import { APISelectionPanel } from './APISelectionPanel';

interface SubAgentRecommendationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  documentType: DocumentTypeConfig;
  extractedData?: Record<string, any>;
  onAgentExecutionComplete?: (results: any[], mergedWithExtraction?: boolean) => void;
}

export type { SubAgentSuggestion };

// Agent ready status definitions
// 'ai-powered' = Uses Universal AI multi-model routing (Claude/Gemini/OpenAI with intelligent fallback), ready to execute immediately
// 'ready' = Simple agent, ready to execute  
// 'needs-config' = Requires external API integration

// ============================================
// SHARED/REUSABLE AGENTS - Use across multiple document types
// ============================================

const SHARED_AGENTS: Record<string, SubAgentSuggestion> = {
  // === MEDICATION & CLINICAL AGENTS (Prescription, Patient Onboarding, Lab Results) ===
  'ndc-lookup': {
    id: 'ndc-lookup',
    name: 'NDC Code Lookup Agent',
    description: '✓ Real-time NDC lookup via FDA OpenFDA - drug codes, manufacturer, package info',
    icon: '🔢',
    useCase: 'ndc-lookup',
    triggerCondition: 'When drug name is extracted',
    architectureType: 'single',
    readyStatus: 'ai-powered'
  },
  'drug-alternatives': {
    id: 'drug-alternatives',
    name: 'Drug Alternatives & Generics Agent',
    description: '✓ Finds generic equivalents, therapeutic alternatives with cost comparison',
    icon: '💊',
    useCase: 'drug-alternatives',
    triggerCondition: 'After drug identification',
    architectureType: 'agentic',
    readyStatus: 'ai-powered'
  },
  'efficacy-analysis': {
    id: 'efficacy-analysis',
    name: 'Efficacy Analysis Agent',
    description: '🤖 AI analysis of drug effectiveness for condition, treatment outcomes, success rates',
    icon: '📊',
    useCase: 'efficacy-analysis',
    triggerCondition: 'When medication + condition identified',
    architectureType: 'agentic',
    readyStatus: 'ai-powered'
  },
  'safety-profile': {
    id: 'safety-profile',
    name: 'Safety & Side Effects Agent',
    description: '🤖 Comprehensive side effect analysis, warnings, contraindications, black box alerts',
    icon: '🛡️',
    useCase: 'safety-profile',
    triggerCondition: 'When medication identified',
    architectureType: 'agentic',
    readyStatus: 'ai-powered'
  },
  'dosage-validation': {
    id: 'dosage-validation',
    name: 'Dosage & Form Validation Agent',
    description: '✓ Validates dosage, strength, administration route, form appropriateness',
    icon: '📐',
    useCase: 'dosage-validation',
    triggerCondition: 'When dosage/SIG extracted',
    architectureType: 'single',
    readyStatus: 'ai-powered'
  },
  'drug-interaction': {
    id: 'drug-interaction',
    name: 'Drug Interaction & Compatibility Agent',
    description: '🤖 Checks medication interactions, food interactions, condition contraindications',
    icon: '⚠️',
    useCase: 'drug-interaction',
    triggerCondition: 'When medication is identified',
    architectureType: 'agentic',
    readyStatus: 'ai-powered'
  },
  'clinical-review': {
    id: 'clinical-review',
    name: 'Clinical Appropriateness Agent',
    description: '🤖 Overall clinical review: appropriateness, SIG analysis, patient factors',
    icon: '🩺',
    useCase: 'clinical-review',
    triggerCondition: 'After all medication data extracted',
    architectureType: 'agentic',
    readyStatus: 'ai-powered'
  },
  'cost-analysis': {
    id: 'cost-analysis',
    name: 'Cost & Pricing Agent',
    description: '✓ Real-time drug pricing via RxNav + GoodRx public widgets, generic alternatives, patient assistance',
    icon: '💰',
    useCase: 'cost-analysis',
    triggerCondition: 'When medication identified',
    architectureType: 'agentic',
    readyStatus: 'ai-powered'
  },
  
  // === VERIFICATION AGENTS (Patient Onboarding, Treatment Center, Insurance) ===
  'npi-verification': {
    id: 'npi-verification',
    name: 'NPI Verification Agent',
    description: '✓ Real-time NPI verification via NPPES Registry API',
    icon: '✅',
    useCase: 'npi-verification',
    triggerCondition: 'When provider NPI is captured',
    architectureType: 'a2a',
    readyStatus: 'ai-powered'
  },
  'identity-verification-ai': {
    id: 'identity-verification-ai',
    name: 'Identity Verification Agent',
    description: '🤖 AI-powered identity document validation and data extraction',
    icon: '🆔',
    useCase: 'identity-verification',
    triggerCondition: 'When ID document uploaded',
    architectureType: 'agentic',
    readyStatus: 'ai-powered'
  },
  'data-validation': {
    id: 'data-validation',
    name: 'Data Validation Agent',
    description: '🤖 AI validates extracted data against business rules and patterns',
    icon: '✓',
    useCase: 'data-validation',
    triggerCondition: 'After data extraction',
    architectureType: 'agentic',
    readyStatus: 'ai-powered'
  },
  
  // === INSURANCE AGENTS (Insurance, Billing, Prior Auth) ===
  'eligibility-ai': {
    id: 'eligibility-ai',
    name: 'Eligibility Analysis Agent',
    description: '🤖 AI analysis of coverage details, plan type identification, benefit interpretation',
    icon: '📋',
    useCase: 'eligibility-analysis',
    triggerCondition: 'When insurance info extracted',
    architectureType: 'agentic',
    readyStatus: 'ai-powered'
  },
  'coverage-summary': {
    id: 'coverage-summary',
    name: 'Coverage Summary Agent',
    description: '🤖 Generates patient-friendly coverage summary from extracted insurance data',
    icon: '📄',
    useCase: 'coverage-summary',
    triggerCondition: 'After insurance data validated',
    architectureType: 'single',
    readyStatus: 'ai-powered'
  },
  
  // === OPTUM API AGENTS (Insurance, Billing, Prescription, Copay, Benefits) ===
  'optum-eligibility': {
    id: 'optum-eligibility',
    name: 'Optum Eligibility Agent',
    description: '✓ Real-time eligibility verification via Optum/Change Healthcare APIs',
    icon: '🔍',
    useCase: 'optum-eligibility',
    triggerCondition: 'When insurance card data extracted',
    architectureType: 'a2a',
    readyStatus: 'needs-config',
    requiredSetup: ['Optum Developer API credentials', 'Provider NPI registration', 'Sandbox access at developer.optum.com']
  },
  'optum-benefits': {
    id: 'optum-benefits',
    name: 'Optum Benefits & Copay Agent',
    description: '✓ Real-time copay, deductible, out-of-pocket maximums via Optum APIs',
    icon: '💵',
    useCase: 'optum-benefits',
    triggerCondition: 'When member eligibility confirmed',
    architectureType: 'a2a',
    readyStatus: 'needs-config',
    requiredSetup: ['Optum Eligibility API access', 'Plan benefit mapping', 'Service type codes']
  },
  'optum-pharmacy': {
    id: 'optum-pharmacy',
    name: 'Optum Pharmacy Agent',
    description: '✓ Pharmacy benefits, drug coverage, formulary status via Optum Pharmacy Solutions',
    icon: '💊',
    useCase: 'optum-pharmacy',
    triggerCondition: 'When prescription medication identified',
    architectureType: 'a2a',
    readyStatus: 'needs-config',
    requiredSetup: ['Optum Pharmacy Solutions API', 'PBM integration credentials', 'Formulary access']
  },
  'optum-claims': {
    id: 'optum-claims',
    name: 'Optum Claims Submission Agent',
    description: '✓ Electronic claims submission and status tracking via Optum',
    icon: '📤',
    useCase: 'optum-claims',
    triggerCondition: 'When invoice/claim ready for submission',
    architectureType: 'a2a',
    readyStatus: 'needs-config',
    requiredSetup: ['Optum Claims API access', '837 EDI configuration', 'Clearinghouse enrollment']
  },
  'optum-payment': {
    id: 'optum-payment',
    name: 'Optum Payment & ERA Agent',
    description: '✓ Payment processing, ERA/EOB automation via Optum Payment & Reimbursement',
    icon: '💰',
    useCase: 'optum-payment',
    triggerCondition: 'When payment/remittance received',
    architectureType: 'a2a',
    readyStatus: 'needs-config',
    requiredSetup: ['Optum Payment API access', '835 ERA enrollment', 'Bank account linking']
  },
  'optum-real': {
    id: 'optum-real',
    name: 'Optum Real-Time Exchange Agent',
    description: '✓ Real-time eligibility + claims adjudication in single transaction',
    icon: '⚡',
    useCase: 'optum-real',
    triggerCondition: 'When immediate verification needed',
    architectureType: 'a2a',
    readyStatus: 'needs-config',
    requiredSetup: ['Optum Real API access', 'Real-time transaction enrollment', 'Provider credentialing']
  },
  
  // === CLINICAL ANALYSIS AGENTS (Lab Results, Imaging, Patient Records) ===
  'critical-value-alert': {
    id: 'critical-value-alert',
    name: 'Critical Value Alert Agent',
    description: '🤖 AI detection of critical lab values requiring immediate attention',
    icon: '🚨',
    useCase: 'critical-value-alerting',
    triggerCondition: 'When lab result contains values outside range',
    architectureType: 'a2a',
    readyStatus: 'ai-powered'
  },
  'trend-analysis': {
    id: 'trend-analysis',
    name: 'Clinical Trend Analysis Agent',
    description: '🤖 AI analysis of clinical trends and patterns over time',
    icon: '📈',
    useCase: 'trend-analysis',
    triggerCondition: 'When historical data available',
    architectureType: 'agentic',
    readyStatus: 'ai-powered'
  },
  'medical-summary': {
    id: 'medical-summary',
    name: 'Medical Summary Agent',
    description: '🤖 Generates comprehensive medical summaries from extracted data',
    icon: '📝',
    useCase: 'medical-summary',
    triggerCondition: 'After all data extracted',
    architectureType: 'agentic',
    readyStatus: 'ai-powered'
  }
};

// Helper to get shared agents by IDs
const getSharedAgents = (...ids: string[]): SubAgentSuggestion[] => 
  ids.map(id => SHARED_AGENTS[id]).filter(Boolean);

// Document-type specific sub-agent suggestions - composed from shared agents
const DOCUMENT_TYPE_SUBAGENTS: Record<string, SubAgentSuggestion[]> = {
  'insurance': [
    // AI-Powered Agents (Ready to use)
    SHARED_AGENTS['eligibility-ai'],
    SHARED_AGENTS['coverage-summary'],
    SHARED_AGENTS['data-validation'],
    // Optum API Agents
    SHARED_AGENTS['optum-eligibility'],
    SHARED_AGENTS['optum-benefits'],
    SHARED_AGENTS['optum-real'],
    // Other Integration Agents
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
    // All medication agents - fully AI-powered
    SHARED_AGENTS['ndc-lookup'],
    SHARED_AGENTS['drug-alternatives'],
    SHARED_AGENTS['efficacy-analysis'],
    SHARED_AGENTS['safety-profile'],
    SHARED_AGENTS['dosage-validation'],
    SHARED_AGENTS['drug-interaction'],
    SHARED_AGENTS['clinical-review'],
    SHARED_AGENTS['cost-analysis'],
    // Optum Pharmacy Agent for formulary/copay
    SHARED_AGENTS['optum-pharmacy'],
    SHARED_AGENTS['optum-benefits'],
    // Integration-required agents
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
    // Shared verification agents
    SHARED_AGENTS['npi-verification'],
    SHARED_AGENTS['identity-verification-ai'],
    SHARED_AGENTS['data-validation'],
    SHARED_AGENTS['medical-summary'],
    // Medication agents for patient history
    SHARED_AGENTS['drug-interaction'],
    SHARED_AGENTS['safety-profile'],
    // Optum for patient eligibility
    SHARED_AGENTS['optum-eligibility'],
    SHARED_AGENTS['optum-benefits'],
    // Integration-required agents
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
      id: 'identity-verification-biometric',
      name: 'Biometric Identity Verification',
      description: 'Verifies patient identity via biometric checks',
      icon: '👤',
      useCase: 'biometric-verification',
      triggerCondition: 'During new patient registration',
      architectureType: 'agentic',
      readyStatus: 'needs-config',
      requiredSetup: ['ID verification API (Jumio, Onfido)', 'Biometric verification service']
    }
  ],
  'treatment-center': [
    // Shared verification agents
    SHARED_AGENTS['npi-verification'],
    SHARED_AGENTS['data-validation'],
    SHARED_AGENTS['medical-summary'],
    // Medication agents for treatment protocols
    SHARED_AGENTS['drug-interaction'],
    SHARED_AGENTS['clinical-review'],
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
    // AI-Powered Agents
    SHARED_AGENTS['data-validation'],
    SHARED_AGENTS['medical-summary'],
    // Optum Billing & Payment Agents
    SHARED_AGENTS['optum-claims'],
    SHARED_AGENTS['optum-payment'],
    SHARED_AGENTS['optum-eligibility'],
    SHARED_AGENTS['optum-benefits'],
    // Standard Billing Agents
    {
      id: 'claims-processor',
      name: 'Claims Processing Agent',
      description: 'Automates claims submission and tracking via multiple clearinghouses',
      icon: '📄',
      useCase: 'claims-processing',
      triggerCondition: 'When invoice ready for claims',
      architectureType: 'multi-agent',
      readyStatus: 'needs-config',
      requiredSetup: ['Clearinghouse API (Availity, Trizetto)', '837 EDI setup', 'Provider enrollment']
    },
    {
      id: 'denial-management',
      name: 'Denial Management Agent',
      description: '🤖 AI-powered denial analysis and appeal letter generation',
      icon: '🔄',
      useCase: 'denial-management',
      triggerCondition: 'When claim is denied',
      architectureType: 'agentic',
      readyStatus: 'ai-powered'
    },
    {
      id: 'payment-posting',
      name: 'Payment Posting Agent',
      description: 'Automates ERA/EOB processing and payment reconciliation',
      icon: '💰',
      useCase: 'payment-posting',
      triggerCondition: 'When payment received',
      architectureType: 'a2a',
      readyStatus: 'needs-config',
      requiredSetup: ['835 ERA enrollment', 'Bank account linking', 'Practice management integration']
    },
    {
      id: 'patient-responsibility',
      name: 'Patient Responsibility Agent',
      description: '🤖 Calculates patient copay, coinsurance, deductible amounts',
      icon: '💳',
      useCase: 'patient-responsibility',
      triggerCondition: 'After eligibility verified',
      architectureType: 'agentic',
      readyStatus: 'ai-powered'
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
    // Shared clinical analysis agents
    SHARED_AGENTS['critical-value-alert'],
    SHARED_AGENTS['trend-analysis'],
    SHARED_AGENTS['medical-summary'],
    SHARED_AGENTS['clinical-review'],
    // Medication context for lab interpretation
    SHARED_AGENTS['drug-interaction'],
    SHARED_AGENTS['safety-profile']
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

// Architecture type explanations for user understanding
const ARCHITECTURE_EXPLANATIONS: Record<string, { title: string; description: string }> = {
  'a2a': {
    title: 'Agent-to-Agent (A2A) Protocol',
    description: 'Uses Google\'s A2A protocol for secure inter-agent communication. These agents connect to external services and APIs to fetch real-time data (e.g., NPI verification, insurance eligibility).'
  },
  'agentic': {
    title: 'Agentic AI',
    description: 'AI-powered agents that use reasoning and decision-making. They analyze data using large language models (Claude, Gemini, OpenAI) with intelligent routing and fallback capabilities.'
  },
  'multi-agent': {
    title: 'Multi-Agent Orchestration',
    description: 'Coordinates multiple specialized agents working together. Each agent handles a specific task, and they share information to complete complex workflows.'
  },
  'single': {
    title: 'Single Agent',
    description: 'A focused agent that performs one specific task efficiently. Fast execution with deterministic results, ideal for lookups and simple validations.'
  }
};

const getArchitectureBadge = (type: string) => {
  const explanation = ARCHITECTURE_EXPLANATIONS[type];
  const badge = (() => {
    switch (type) {
      case 'a2a':
        return <Badge variant="outline" className="text-[10px] bg-blue-50 text-blue-700 border-blue-200 cursor-help">A2A Protocol</Badge>;
      case 'agentic':
        return <Badge variant="outline" className="text-[10px] bg-purple-50 text-purple-700 border-purple-200 cursor-help">Agentic AI</Badge>;
      case 'multi-agent':
        return <Badge variant="outline" className="text-[10px] bg-green-50 text-green-700 border-green-200 cursor-help">Multi-Agent</Badge>;
      case 'single':
        return <Badge variant="outline" className="text-[10px] bg-gray-50 text-gray-700 border-gray-200 cursor-help">Single Agent</Badge>;
      default:
        return null;
    }
  })();
  
  if (!badge || !explanation) return badge;
  
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>{badge}</TooltipTrigger>
        <TooltipContent side="top" className="max-w-xs">
          <div className="space-y-1">
            <p className="font-semibold text-sm">{explanation.title}</p>
            <p className="text-xs text-muted-foreground">{explanation.description}</p>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
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
  const [selectedAPIs, setSelectedAPIs] = useState<string[]>([]);
  const [showAPISelection, setShowAPISelection] = useState(false);
  const [showGuidedWorkflows, setShowGuidedWorkflows] = useState(true);
  const [selectedWorkflowId, setSelectedWorkflowId] = useState<string | null>(null);
  const [executeMode, setExecuteMode] = useState<'execute' | 'build'>('execute');
  const [showAddAgentDialog, setShowAddAgentDialog] = useState(false);
  const [customAgents, setCustomAgents] = useState<SubAgentSuggestion[]>([]);
  const [selectedProvider, setSelectedProvider] = useState<'auto' | 'claude' | 'gemini' | 'openai'>('auto');
  // Per-agent provider overrides: { agentId: provider }
  const [agentProviders, setAgentProviders] = useState<Record<string, 'auto' | 'claude' | 'gemini' | 'openai'>>({});
  // Per-agent medication selection: { agentId: medicationIndex } - used when multiple medications detected
  const [agentMedicationSelection, setAgentMedicationSelection] = useState<Record<string, number | 'all'>>({});
  
  // Setup wizard state
  const [showSetupWizard, setShowSetupWizard] = useState(false);
  const [setupAgentId, setSetupAgentId] = useState<string>('');
  const [setupAgentName, setSetupAgentName] = useState<string>('');
  
  // Cross-document data prompt state
  const [showDataPrompt, setShowDataPrompt] = useState(false);
  const [missingDocumentType, setMissingDocumentType] = useState<'insurance' | 'prescription' | null>(null);
  
  // Execution state
  const [showExecutionProgress, setShowExecutionProgress] = useState(false);
  const [showResultsConfirmation, setShowResultsConfirmation] = useState(false);
  const [executionResults, setExecutionResults] = useState<AgentExecutionResult[]>([]);
  const [executingAgents, setExecutingAgents] = useState<SubAgentSuggestion[]>([]);
  
  const { executeAgents, isExecuting, executionProgress, currentAgent, results } = useAgentExecution();

  // Get suggestions for current document type - with fallback for any unknown types
  const suggestions = useMemo(() => {
    const docTypeAgents = DOCUMENT_TYPE_SUBAGENTS[documentType.id];
    const baseAgents = docTypeAgents && docTypeAgents.length > 0 
      ? docTypeAgents 
      : getGenericSubAgents(documentType.id);
    
    // Include custom agents
    return [...baseAgents, ...customAgents];
  }, [documentType.id, customAgents]);

  // Check if cross-document data is needed based on selected agents
  const needsInsuranceData = useMemo(() => {
    if (documentType.id === 'insurance') return false;
    const selectedAgentsList = suggestions.filter(s => selectedAgents.includes(s.id));
    const insuranceAgentIds = ['insurance-verification', 'benefits-verification', 'prior-auth', 'eligibility-ai'];
    return selectedAgentsList.some(a => insuranceAgentIds.includes(a.id));
  }, [selectedAgents, suggestions, documentType.id]);

  const needsPrescriptionData = useMemo(() => {
    if (documentType.id === 'prescription') return false;
    const selectedAgentsList = suggestions.filter(s => selectedAgents.includes(s.id));
    const rxAgentIds = ['ndc-lookup', 'drug-alternatives', 'cost-analysis', 'prior-auth', 'drug-interaction'];
    return selectedAgentsList.some(a => rxAgentIds.includes(a.id));
  }, [selectedAgents, suggestions, documentType.id]);

  // Check if we have insurance/prescription data in extracted fields
  const hasInsuranceData = useMemo(() => {
    return !!(extractedData?.member_id || extractedData?.insurance_name || extractedData?.payer_id);
  }, [extractedData]);

  const hasPrescriptionData = useMemo(() => {
    return !!(extractedData?.medication || extractedData?.medication_name || extractedData?.ndc);
  }, [extractedData]);

  // CRITICAL: Compute medications list from all sources for the UI
  // This ensures multi-medication selectors show even when processingResult.medications isn't populated
  const computedMedications = useMemo(() => {
    // First try processingResult.medications array
    const processingMeds = extractedData?.processingResult?.medications;
    if (Array.isArray(processingMeds) && processingMeds.length > 0) {
      return processingMeds;
    }
    
    // Fallback: Build from numbered medication fields (medication_1_name, medication_2_name, etc.)
    const baseExtractedFields = extractedData?.processingResult?.extractedFields || extractedData?.extractedFields || {};
    const medicationPattern = /^medication_(\d+)_(\w+)$/;
    const medicationsByIndex: Record<string, Record<string, any>> = {};
    
    Object.entries(baseExtractedFields).forEach(([key, field]: [string, any]) => {
      const match = key.match(medicationPattern);
      if (match) {
        const [, index, property] = match;
        if (!medicationsByIndex[index]) {
          medicationsByIndex[index] = {};
        }
        medicationsByIndex[index][property] = typeof field === 'object' ? field.value : field;
      }
    });
    
    // Build medications array from indexed data
    const indices = Object.keys(medicationsByIndex).sort((a, b) => parseInt(a) - parseInt(b));
    if (indices.length > 0) {
      const meds = indices.map(index => {
        const med = medicationsByIndex[index];
        return {
          medication_name: med.name || med.medication_name || '',
          name: med.name || med.medication_name || '',
          strength: med.strength || '',
          sig: med.sig || med.directions || '',
          quantity: med.quantity || ''
        };
      }).filter(med => med.medication_name || med.name);
      
      if (meds.length > 0) {
        console.log('[SubAgentDialog] Computed medications from numbered fields:', meds.length);
        return meds;
      }
    }
    
    return [];
  }, [extractedData]);

  const toggleAgent = (agentId: string) => {
    const agent = suggestions.find(s => s.id === agentId);
    
    // If selecting a needs-config agent, open setup wizard
    if (agent && agent.readyStatus === 'needs-config' && !selectedAgents.includes(agentId)) {
      setSetupAgentId(agentId);
      setSetupAgentName(agent.name);
      setShowSetupWizard(true);
    }
    
    setSelectedAgents(prev => 
      prev.includes(agentId)
        ? prev.filter(id => id !== agentId)
        : [...prev, agentId]
    );
  };

  const handleSetupComplete = () => {
    setShowSetupWizard(false);
    toast.success(`${setupAgentName} configured successfully`);
  };

  const handleDataCollectionRequest = (method: string, missingFields: string[]) => {
    if (method === 'navigate_upload') {
      navigate('/dashboard/documents');
    } else if (method === 'inline_upload') {
      toast.info('Upload functionality coming soon', {
        description: 'For now, please use the document upload section'
      });
    }
    setShowSetupWizard(false);
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

  // Agent-type specific data requirements mapping
  const AGENT_DATA_REQUIREMENTS: Record<string, string[]> = {
    // Medication agents
    'ndc-lookup': ['medication', 'medication_name', 'ndc', 'strength'],
    'drug-alternatives': ['medication', 'medication_name', 'strength', 'generic_name'],
    'efficacy-analysis': ['medication', 'diagnosis', 'condition', 'sig'],
    'safety-profile': ['medication', 'medication_name', 'dose', 'frequency', 'patient_allergies', 'allergies'],
    'dosage-validation': ['medication', 'dose', 'route', 'frequency', 'strength', 'sig'],
    'drug-interaction': ['medication', 'medication_name', 'current_medications', 'all_medications', 'medication_list', 'allergies'],
    'clinical-review': ['medication', 'sig', 'dose', 'route', 'frequency', 'duration', 'diagnosis', 'patient_name'],
    'cost-analysis': ['medication', 'medication_name', 'strength', 'quantity', 'days_supply'],
    // Insurance agents
    'eligibility-ai': ['insurance_name', 'member_id', 'group_number', 'plan_type', 'payer_id'],
    'coverage-summary': ['insurance_name', 'member_id', 'copay', 'deductible', 'oop_max', 'coinsurance'],
    'insurance-verification': ['insurance_name', 'member_id', 'group_number', 'payer_id', 'patient_name', 'patient_dob'],
    'benefits-verification': ['insurance_name', 'member_id', 'plan_name', 'copay', 'copay_specialist', 'copay_rx'],
    'prior-auth': ['insurance_name', 'member_id', 'medication', 'diagnosis', 'prescriber_npi', 'payer_id'],
    // Patient agents
    'npi-verification': ['prescriber_npi', 'prescriber_name', 'prescriber_dea'],
    'identity-verification-ai': ['patient_name', 'patient_dob', 'ssn', 'address'],
    'data-validation': ['patient_name', 'patient_dob', 'email', 'phone'],
    // Clinical agents
    'critical-value-alert': ['test_name', 'result_value', 'reference_range', 'flag'],
    'trend-analysis': ['test_name', 'result_value', 'collection_date'],
    'medical-summary': ['patient_name', 'diagnosis', 'medication', 'allergies']
  };

  // Prepare agent-specific data based on what each agent needs
  const prepareAgentData = (agentId: string, allFields: Record<string, any>) => {
    const requiredFields = AGENT_DATA_REQUIREMENTS[agentId] || [];
    const agentData: Record<string, any> = {};
    
    // Always include all available fields, but log which required ones are missing
    const missingFields: string[] = [];
    
    requiredFields.forEach(field => {
      // Check multiple possible sources for each field
      const value = allFields[field]?.value || 
                   allFields[field] ||
                   allFields[`${field}_name`]?.value ||
                   allFields[field.replace('_', '')]?.value;
      if (value) {
        agentData[field] = { value, confidence: allFields[field]?.confidence || 0.9 };
      } else {
        missingFields.push(field);
      }
    });
    
    if (missingFields.length > 0) {
      console.warn(`[Agent ${agentId}] Missing recommended fields:`, missingFields);
    }
    
    return { agentData, missingFields, hasMinimumData: missingFields.length < requiredFields.length };
  };

  const handleExecuteNow = async () => {
    const selectedSubAgents = suggestions.filter(s => selectedAgents.includes(s.id));
    
    if (selectedSubAgents.length === 0) {
      toast.error('Please select at least one agent');
      return;
    }
    
    // Show live execution progress
    setExecutingAgents(selectedSubAgents);
    setShowExecutionProgress(true);

    // Build comprehensive extracted fields from ALL available data sources
    const baseExtractedFields = extractedData?.processingResult?.extractedFields || extractedData?.extractedFields || {};
    
    console.log('[SubAgentDialog] All available data sources:', {
      processingResult: !!extractedData?.processingResult,
      pendingMedicationData: extractedData?.pendingMedicationData ? {
        drugName: extractedData.pendingMedicationData.drugName,
        sigText: extractedData.pendingMedicationData.sigText,
        baseName: extractedData.pendingMedicationData.baseName,
        preservedStrength: extractedData.pendingMedicationData.preservedStrength
      } : null,
      drugSearchQuery: extractedData?.drugSearchQuery,
      selectedValues: {
        dose: extractedData?.selectedDose,
        frequency: extractedData?.selectedFrequency,
        route: extractedData?.selectedRoute,
        duration: extractedData?.selectedDuration
      },
      parsedSig: extractedData?.parsedSig,
      searchResults: extractedData?.searchResults ? {
        drugName: extractedData.searchResults.drugName,
        genericName: extractedData.searchResults.genericName
      } : null,
      isDataConfirmed: extractedData?.isDataConfirmed
    });
    
    // Merge all data sources into enhanced fields
    const enhancedFields = { ...baseExtractedFields };
    
    // 0. COLLECT ALL NUMBERED MEDICATIONS (medication_1_name, medication_2_name, etc.)
    // This is CRITICAL for prescriptions with multiple drugs
    const allMedications: Array<{name: string; quantity?: string; sig?: string; form?: string; strength?: string}> = [];
    
    // Scan all base extracted fields for numbered medication patterns
    const medicationPattern = /^medication_(\d+)_(\w+)$/;
    const medicationsByIndex: Record<string, Record<string, any>> = {};
    
    Object.entries(baseExtractedFields).forEach(([key, field]: [string, any]) => {
      const match = key.match(medicationPattern);
      if (match) {
        const [, index, property] = match;
        if (!medicationsByIndex[index]) {
          medicationsByIndex[index] = {};
        }
        medicationsByIndex[index][property] = typeof field === 'object' ? field.value : field;
      }
    });
    
    // Build medications array from indexed data
    Object.keys(medicationsByIndex).sort((a, b) => parseInt(a) - parseInt(b)).forEach(index => {
      const med = medicationsByIndex[index];
      if (med.name) {
        allMedications.push({
          name: med.name,
          quantity: med.quantity,
          sig: med.sig,
          form: med.form,
          strength: med.strength
        });
      }
    });
    
    console.log('[SubAgentDialog] Found numbered medications:', allMedications);
    
    // Store medications array in enhanced fields for agents
    if (allMedications.length > 0) {
      enhancedFields.medications = { value: allMedications, confidence: 0.95 };
      // Also set first medication as primary if no other medication field exists
      if (!enhancedFields.medication?.value && !enhancedFields.medication_name?.value) {
        enhancedFields.medication = { value: allMedications[0].name, confidence: 0.95 };
        enhancedFields.medication_name = { value: allMedications[0].name, confidence: 0.95 };
      }
      // If we have sigs in the medications, use the first one as primary
      if (!enhancedFields.sig?.value && allMedications[0]?.sig) {
        enhancedFields.sig = { value: allMedications[0].sig, confidence: 0.9 };
      }
    }
    
    // 1. PENDING MEDICATION DATA (highest priority for prescriptions)
    if (extractedData?.pendingMedicationData) {
      const pending = extractedData.pendingMedicationData;
      if (pending.drugName) {
        enhancedFields.medication = { value: pending.drugName, confidence: 0.95 };
        enhancedFields.medication_name = { value: pending.drugName, confidence: 0.95 };
      }
      if (pending.baseName) {
        enhancedFields.base_name = { value: pending.baseName, confidence: 0.95 };
      }
      if (pending.sigText) {
        enhancedFields.sig = { value: pending.sigText, confidence: 0.9 };
      }
      if (pending.preservedStrength) {
        enhancedFields.strength = { value: pending.preservedStrength, confidence: 0.9 };
      }
      // Merge all extracted fields from pending
      if (pending.extractedFields) {
        Object.entries(pending.extractedFields).forEach(([key, value]) => {
          if (!enhancedFields[key] || !enhancedFields[key].value) {
            enhancedFields[key] = value;
          }
        });
      }
    }
    
    // 2. SELECTED SELECTOR VALUES (user's current selections in Medication Lookup)
    if (extractedData?.selectedDose) {
      enhancedFields.dose = { value: extractedData.selectedDose, confidence: 0.95 };
    }
    if (extractedData?.selectedFrequency) {
      enhancedFields.frequency = { value: extractedData.selectedFrequency, confidence: 0.95 };
    }
    if (extractedData?.selectedRoute) {
      enhancedFields.route = { value: extractedData.selectedRoute, confidence: 0.95 };
    }
    if (extractedData?.selectedDuration) {
      enhancedFields.duration = { value: extractedData.selectedDuration, confidence: 0.95 };
    }
    
    // 3. PARSED SIG (from SIG parsing function)
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
    
    // 4. DRUG SEARCH QUERY (fallback for medication name)
    if (extractedData?.drugSearchQuery && !enhancedFields.medication?.value) {
      enhancedFields.medication = { value: extractedData.drugSearchQuery, confidence: 0.95 };
      enhancedFields.medication_name = { value: extractedData.drugSearchQuery, confidence: 0.95 };
    }
    
    // 5. SEARCH RESULTS (from drug search API)
    if (extractedData?.searchResults) {
      if (extractedData.searchResults.drugName && !enhancedFields.medication?.value) {
        enhancedFields.medication = { value: extractedData.searchResults.drugName, confidence: 0.95 };
      }
      if (extractedData.searchResults.genericName) {
        enhancedFields.generic_name = { value: extractedData.searchResults.genericName, confidence: 0.9 };
      }
      if (extractedData.searchResults.strength && !enhancedFields.strength?.value) {
        enhancedFields.strength = { value: extractedData.searchResults.strength, confidence: 0.9 };
      }
    }
    
    // 6. MULTI-MEDICATION RESULTS (enriched data with NDC codes for ALL medications)
    // This provides complete medication data for drug-drug interaction analysis
    if (extractedData?.multiMedicationResults && Object.keys(extractedData.multiMedicationResults).length > 0) {
      const multiMedResults = extractedData.multiMedicationResults;
      const multiMedArray = Object.entries(multiMedResults).map(([name, result]: [string, any]) => ({
        name: result.drugName || name,
        genericName: result.genericName,
        strength: result.strength,
        sig: result.sig,
        ndc: result.ndc,
        ndcOptions: result.ndcOptions,
        isControlled: result.isControlled,
        schedule: result.schedule,
        calculatedQuantity: result.calculatedQuantity,
        daysSupply: result.daysSupply
      }));
      
      console.log('[SubAgentDialog] Multi-medication results available:', multiMedArray.length, 'medications');
      
      // Store complete multi-medication data for agents that need drug-drug interactions
      enhancedFields.all_medications = { value: multiMedArray, confidence: 0.95 };
      enhancedFields.medication_count = { value: multiMedArray.length, confidence: 1.0 };
      
      // Build medication names list for drug interaction checks
      const medicationNames = multiMedArray.map(m => m.name).filter(Boolean);
      if (medicationNames.length > 0) {
        enhancedFields.medication_list = { value: medicationNames.join(', '), confidence: 0.95 };
        enhancedFields.current_medications = { value: medicationNames.join(', '), confidence: 0.95 };
      }
      
      // Set primary medication from multi-med if not already set
      if (!enhancedFields.medication?.value && multiMedArray[0]?.name) {
        enhancedFields.medication = { value: multiMedArray[0].name, confidence: 0.95 };
        enhancedFields.medication_name = { value: multiMedArray[0].name, confidence: 0.95 };
      }
      
      // Set NDC from selected NDCs if available
      if (extractedData?.multiSelectedNdcs) {
        const firstMedName = Object.keys(extractedData.multiSelectedNdcs)[0];
        if (firstMedName && !enhancedFields.ndc?.value) {
          enhancedFields.ndc = { value: extractedData.multiSelectedNdcs[firstMedName], confidence: 0.95 };
        }
      }
    }
    
    // 7. SELECTED NDC
    if (extractedData?.selectedNdc && !enhancedFields.ndc?.value) {
      enhancedFields.ndc = { value: extractedData.selectedNdc, confidence: 0.95 };
    }
    
    // 8. SIG INSTRUCTIONS
    if (extractedData?.sigInstructions && !enhancedFields.sig?.value) {
      enhancedFields.sig = { value: extractedData.sigInstructions, confidence: 0.9 };
    }
    
    // 9. Build combined SIG if we have selector values but no SIG
    if (!enhancedFields.sig?.value && enhancedFields.dose?.value && enhancedFields.route?.value && enhancedFields.frequency?.value) {
      const combinedSig = `Take ${enhancedFields.dose.value} ${enhancedFields.route.value} ${enhancedFields.frequency.value}${enhancedFields.duration?.value ? ` for ${enhancedFields.duration.value}` : ''}`;
      enhancedFields.sig = { value: combinedSig, confidence: 0.85 };
    }
    
    // Log what each selected agent will receive
    console.log('[SubAgentDialog] Final enhanced fields:', enhancedFields);
    selectedSubAgents.forEach(agent => {
      const { agentData, missingFields, hasMinimumData } = prepareAgentData(agent.id, enhancedFields);
      console.log(`[Agent: ${agent.name}] Data ready:`, {
        hasMinimumData,
        availableFields: Object.keys(agentData),
        missingFields
      });
    });

    const documentContext = {
      documentType: documentType.id,
      extractedFields: enhancedFields,
      rawText: extractedData?.processingResult?.rawText || extractedData?.rawText,
      fileName: extractedData?.processingResult?.fileName || extractedData?.fileName,
      imageBase64: extractedData?.medicalImageBase64,
      preferredProvider: selectedProvider === 'auto' ? undefined : selectedProvider,
      selectedAPIs: selectedAPIs, // Pass selected APIs for context
      // Pass per-agent provider overrides
      agentProviderOverrides: agentProviders,
      // Pass per-agent medication selection for multi-medication prescriptions
      agentMedicationSelection: agentMedicationSelection,
      // Pass all medications for agents that need specific medication context (use computed list)
      allMedications: computedMedications.length > 0 ? computedMedications : (extractedData?.processingResult?.medications || [])
    };

    const executedResults = await executeAgents(selectedSubAgents, documentContext);
    
    // Store results and show confirmation dialog
    setExecutionResults(executedResults);
    setShowExecutionProgress(false);
    setShowResultsConfirmation(true);
  };

  const handleAcceptResults = (selectedResults: AgentExecutionResult[], mergeWithExtraction: boolean) => {
    // Pass results to parent with merge flag
    onAgentExecutionComplete?.(selectedResults, mergeWithExtraction);
    
    // Close dialogs
    setShowResultsConfirmation(false);
    onOpenChange(false);
    
    toast.success(`Applied ${selectedResults.length} agent result(s)`, {
      description: mergeWithExtraction 
        ? 'Results merged with extracted data' 
        : 'Results added as new findings'
    });
  };

  const handleRejectResults = () => {
    setShowResultsConfirmation(false);
    setExecutionResults([]);
    toast.info('Agent results discarded');
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
          subAgents: selectedSubAgents.map(agent => ({ id: agent.id, name: agent.name, useCase: agent.useCase, triggerCondition: agent.triggerCondition, architectureType: agent.architectureType, icon: agent.icon })),
          selectedAPIs: selectedAPIs // Pass selected APIs to canvas
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
      <DialogContent className="max-w-lg max-h-[85vh] overflow-hidden p-0">
        {/* Fixed Header */}
        <div className="p-6 pb-3 border-b bg-background">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-base">
              <Bot className="h-5 w-5 text-primary" />
              Would you like to add follow-up agents?
            </DialogTitle>
            <DialogDescription className="text-sm">
              Select agents to automate processing for {documentType.title}
            </DialogDescription>
          </DialogHeader>
        </div>

        {/* Scrollable Content Area */}
        <div className="flex-1 overflow-y-auto max-h-[45vh] p-4">
          {/* Guided Workflows Section - Show at top for step-by-step multi-agent flows */}
          <div className="border rounded-lg overflow-hidden mb-3">
            <button
              onClick={() => setShowGuidedWorkflows(!showGuidedWorkflows)}
              className="w-full flex items-center justify-between p-3 bg-primary/5 hover:bg-primary/10 transition-colors"
            >
              <div className="flex items-center gap-2">
                <Workflow className="h-4 w-4 text-primary" />
                <span className="text-sm font-medium text-primary">Guided Workflows</span>
                {selectedWorkflowId && (
                  <Badge variant="default" className="text-xs">
                    1 selected
                  </Badge>
                )}
              </div>
              <ChevronDown className={cn(
                "h-4 w-4 text-primary transition-transform",
                showGuidedWorkflows && "rotate-180"
              )} />
            </button>
            {showGuidedWorkflows && (
              <div className="p-3 border-t bg-background">
                <GuidedWorkflowSection
                  documentTypeId={documentType.id}
                  extractedData={extractedData}
                  selectedWorkflowId={selectedWorkflowId}
                  onSelectedWorkflowChange={(workflowId) => {
                    setSelectedWorkflowId(workflowId);
                  }}
                  onWorkflowSelect={(workflow, agentIds) => {
                    // Auto-select agents from the workflow
                    setSelectedAgents(prev => {
                      const newAgents = [...prev];
                      agentIds.forEach(id => {
                        if (!newAgents.includes(id)) {
                          newAgents.push(id);
                        }
                      });
                      return newAgents;
                    });
                  }}
                  onExecuteWorkflow={(workflow) => {
                    // Execute all agents in the workflow
                    const workflowAgents = workflow.steps
                      .filter(s => s.agentId)
                      .map(s => suggestions.find(a => a.id === s.agentId))
                      .filter(Boolean) as SubAgentSuggestion[];
                    
                    if (workflowAgents.length > 0) {
                      setExecutingAgents(workflowAgents);
                      setShowExecutionProgress(true);
                      handleExecuteNow();
                    }
                  }}
                />
              </div>
            )}
          </div>

          {/* API Selection Collapsible Section */}
          <div className="border rounded-lg overflow-hidden mb-3">
            <button
              onClick={() => setShowAPISelection(!showAPISelection)}
              className="w-full flex items-center justify-between p-3 bg-muted/50 hover:bg-muted transition-colors"
            >
              <div className="flex items-center gap-2">
                <Link2 className="h-4 w-4 text-primary" />
                <span className="text-sm font-medium">Select API Sources</span>
                {selectedAPIs.length > 0 && (
                  <Badge variant="secondary" className="text-xs">
                    {selectedAPIs.length} selected
                  </Badge>
                )}
              </div>
              <ChevronDown className={cn(
                "h-4 w-4 text-muted-foreground transition-transform",
                showAPISelection && "rotate-180"
              )} />
            </button>
            {showAPISelection && (
              <div className="p-3 border-t bg-background max-h-[150px] overflow-y-auto">
                <APISelectionPanel
                  documentTypeId={documentType.id}
                  selectedAPIs={selectedAPIs}
                  onSelectionChange={setSelectedAPIs}
                  onAPISetupRequested={(apiId) => {
                    const matchingAgent = suggestions.find(a => a.id === apiId || a.id.includes(apiId.replace('optum-', '')));
                    if (matchingAgent) {
                      setSetupAgentId(matchingAgent.id);
                      setSetupAgentName(matchingAgent.name);
                      setShowSetupWizard(true);
                    }
                  }}
                  compact
                />
              </div>
            )}
          </div>

          {/* Individual Agents List */}
          <div className="space-y-2">
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
                      "p-3 rounded-lg border transition-all mb-2",
                      selectedAgents.includes(agent.id)
                        ? "border-green-500 bg-green-50 dark:bg-green-950/30 ring-1 ring-green-300"
                        : "border-green-200 dark:border-green-800 hover:border-green-400 hover:bg-green-50/50 dark:hover:bg-green-950/20 cursor-pointer"
                    )}
                  >
                    <div 
                      className="flex items-start gap-3 cursor-pointer"
                      onClick={() => toggleAgent(agent.id)}
                    >
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
                    {/* Per-Agent Provider Selection - Show when selected */}
                    {selectedAgents.includes(agent.id) && executeMode === 'execute' && (
                      <div 
                        className="mt-2 pt-2 border-t border-green-200 dark:border-green-800 space-y-2"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] text-muted-foreground">AI Provider:</span>
                          <div className="flex gap-1">
                            {[
                              { id: 'auto', label: '⚡ Auto', title: 'Auto-select best provider' },
                              { id: 'claude', label: '🤖 Claude', title: 'Claude Sonnet 4' },
                              { id: 'gemini', label: '✨ Gemini', title: 'Gemini 2.5 Flash' },
                              { id: 'openai', label: '🧠 GPT-5', title: 'GPT-5' }
                            ].map(p => (
                              <button
                                key={p.id}
                                title={p.title}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setAgentProviders(prev => ({ ...prev, [agent.id]: p.id as any }));
                                }}
                                className={cn(
                                  "px-2 py-0.5 rounded text-[10px] border transition-all",
                                  (agentProviders[agent.id] || 'auto') === p.id
                                    ? "bg-primary text-primary-foreground border-primary"
                                    : "bg-background border-border hover:border-primary/50"
                                )}
                              >
                                {p.label}
                              </button>
                            ))}
                          </div>
                        </div>
                        
                        {/* Per-Agent Medication Selection - Show when multiple medications detected for Rx agents */}
                        {(() => {
                          // Use computedMedications which handles both processingResult.medications and numbered fields
                          const medications = computedMedications;
                          const isMedicationAgent = ['ndc-lookup', 'drug-alternatives', 'efficacy-analysis', 'safety-profile', 'dosage-validation', 'drug-interaction', 'clinical-review', 'cost-analysis'].includes(agent.id);
                          
                          if (medications.length > 1 && isMedicationAgent) {
                            return (
                              <div className="flex items-center gap-2">
                                <span className="text-[10px] text-muted-foreground">Medication:</span>
                                <div className="flex gap-1 flex-wrap">
                                  <button
                                    title="Run for all medications"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setAgentMedicationSelection(prev => ({ ...prev, [agent.id]: 'all' }));
                                    }}
                                    className={cn(
                                      "px-2 py-0.5 rounded text-[10px] border transition-all",
                                      (agentMedicationSelection[agent.id] === 'all' || agentMedicationSelection[agent.id] === undefined)
                                        ? "bg-blue-600 text-white border-blue-600"
                                        : "bg-background border-border hover:border-blue-400"
                                    )}
                                  >
                                    All ({medications.length})
                                  </button>
                                  {medications.map((med: any, idx: number) => {
                                    const medName = med.medication_name || med.name || `Med ${idx + 1}`;
                                    const displayName = medName.length > 12 ? medName.substring(0, 12) + '...' : medName;
                                    return (
                                      <button
                                        key={idx}
                                        title={medName}
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          setAgentMedicationSelection(prev => ({ ...prev, [agent.id]: idx }));
                                        }}
                                        className={cn(
                                          "px-2 py-0.5 rounded text-[10px] border transition-all",
                                          agentMedicationSelection[agent.id] === idx
                                            ? "bg-primary text-primary-foreground border-primary"
                                            : "bg-background border-border hover:border-primary/50"
                                        )}
                                      >
                                        #{idx + 1} {displayName}
                                      </button>
                                    );
                                  })}
                                </div>
                              </div>
                            );
                          }
                          return null;
                        })()}
                      </div>
                    )}
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

        {/* Fixed Footer */}
        <div className="p-4 pt-3 border-t bg-background space-y-3">
          {/* Cross-Document Data Prompt */}
          {((needsInsuranceData && !hasInsuranceData) || (needsPrescriptionData && !hasPrescriptionData)) && (
            <Alert className="bg-blue-50 dark:bg-blue-950/30 border-blue-200">
              <FileText className="h-4 w-4 text-blue-500" />
              <AlertDescription className="text-sm">
                <div className="space-y-2">
                  {needsInsuranceData && !hasInsuranceData && (
                    <div className="flex items-center justify-between gap-2">
                      <span className="flex items-center gap-2">
                        <CreditCard className="h-4 w-4" />
                        <span className="text-xs">Insurance data needed</span>
                      </span>
                      <Button 
                        size="sm" 
                        variant="outline" 
                        className="h-6 text-xs"
                        onClick={() => navigate('/dashboard/documents', { state: { documentType: 'insurance' } })}
                      >
                        <Upload className="h-3 w-3 mr-1" /> Upload
                      </Button>
                    </div>
                  )}
                  {needsPrescriptionData && !hasPrescriptionData && (
                    <div className="flex items-center justify-between gap-2">
                      <span className="flex items-center gap-2">
                        <FileText className="h-4 w-4" />
                        <span className="text-xs">Prescription data needed</span>
                      </span>
                      <Button 
                        size="sm" 
                        variant="outline" 
                        className="h-6 text-xs"
                        onClick={() => navigate('/dashboard/documents', { state: { documentType: 'prescription' } })}
                      >
                        <Upload className="h-3 w-3 mr-1" /> Upload
                      </Button>
                    </div>
                  )}
                </div>
              </AlertDescription>
            </Alert>
          )}

          {/* Mode & Provider Selection - Compact */}
          <div className="flex items-center gap-3 p-2 rounded-lg bg-muted/50 text-xs flex-wrap">
            <div className="flex items-center gap-2">
              <span className="text-muted-foreground">Mode:</span>
              <RadioGroup value={executeMode} onValueChange={(v) => setExecuteMode(v as 'execute' | 'build')} className="flex gap-2">
                <div className="flex items-center gap-1">
                  <RadioGroupItem value="execute" id="exec-mode" className="h-3 w-3" />
                  <Label htmlFor="exec-mode" className="text-xs cursor-pointer flex items-center gap-0.5">
                    <Zap className="h-3 w-3" /> Execute
                  </Label>
                </div>
                <div className="flex items-center gap-1">
                  <RadioGroupItem value="build" id="build-mode" className="h-3 w-3" />
                  <Label htmlFor="build-mode" className="text-xs cursor-pointer flex items-center gap-0.5">
                    <Hammer className="h-3 w-3" /> Build
                  </Label>
                </div>
              </RadioGroup>
            </div>
            
            {executeMode === 'execute' && (
              <div className="flex items-center gap-2 ml-auto">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <span className="text-muted-foreground cursor-help flex items-center gap-1">
                        <Info className="h-3 w-3" /> Default AI:
                      </span>
                    </TooltipTrigger>
                    <TooltipContent side="top" className="max-w-[200px]">
                      <p className="text-xs">Default provider for all agents. Override per-agent in the agent cards above.</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
                <RadioGroup 
                  value={selectedProvider} 
                  onValueChange={(v) => setSelectedProvider(v as 'auto' | 'claude' | 'gemini' | 'openai')} 
                  className="flex gap-1"
                >
                  {[
                    { id: 'auto', label: '⚡ Auto' },
                    { id: 'claude', label: '🤖' },
                    { id: 'gemini', label: '✨' },
                    { id: 'openai', label: '🧠' }
                  ].map(p => (
                    <div key={p.id} className="flex items-center gap-0.5">
                      <RadioGroupItem value={p.id} id={`prov-${p.id}`} className="h-3 w-3" />
                      <Label htmlFor={`prov-${p.id}`} className="text-[10px] cursor-pointer">{p.label}</Label>
                    </div>
                  ))}
                </RadioGroup>
              </div>
            )}
          </div>

          {/* Selected Count with Provider Info */}
          {selectedAgents.length > 0 && (
            <div className="text-center text-sm text-green-700 dark:text-green-300 font-medium">
              {selectedAgents.length} agent(s) selected
              {Object.keys(agentProviders).filter(id => selectedAgents.includes(id) && agentProviders[id] !== 'auto').length > 0 && (
                <span className="text-xs text-muted-foreground ml-2">
                  ({Object.keys(agentProviders).filter(id => selectedAgents.includes(id) && agentProviders[id] !== 'auto').length} with custom provider)
                </span>
              )}
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3">
            <Button variant="outline" className="flex-1" onClick={handleSkip} disabled={isExecuting}>
              <XCircle className="h-4 w-4 mr-2" />
              No, Skip
            </Button>
            <Button className="flex-1" onClick={handleAction} disabled={selectedAgents.length === 0 || isExecuting}>
              {isExecuting ? (
                <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Running...</>
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

      {/* Live Execution Progress Dialog */}
      <Dialog open={showExecutionProgress} onOpenChange={setShowExecutionProgress}>
        <DialogContent className="max-w-lg max-h-[85vh] flex flex-col" style={{ display: 'flex', flexDirection: 'column' }}>
          <DialogHeader className="flex-shrink-0">
            <DialogTitle className="flex items-center gap-2">
              <Bot className="h-5 w-5 text-primary" />
              Agent Execution Progress
            </DialogTitle>
            <DialogDescription>
              {isExecuting ? 'Running agents...' : 'Execution complete'}
            </DialogDescription>
          </DialogHeader>
          <div className="flex-1 min-h-0 overflow-y-auto max-h-[55vh] border rounded-lg p-3">
            <AgentExecutionProgress
              agents={executingAgents}
              currentAgent={currentAgent}
              progress={executionProgress}
              results={results}
              isExecuting={isExecuting}
            />
          </div>
        </DialogContent>
      </Dialog>

      {/* Results Confirmation Dialog */}
      <AgentResultsConfirmation
        open={showResultsConfirmation}
        onOpenChange={setShowResultsConfirmation}
        results={executionResults}
        extractedData={extractedData}
        onAccept={handleAcceptResults}
        onReject={handleRejectResults}
      />

      {/* Agent Setup Wizard for needs-config agents */}
      <AgentSetupWizard
        open={showSetupWizard}
        onOpenChange={setShowSetupWizard}
        agentTypeId={setupAgentId}
        agentName={setupAgentName}
        extractedData={extractedData}
        onConfigured={handleSetupComplete}
        onDataCollectionRequest={handleDataCollectionRequest}
      />
    </Dialog>
  );
}
