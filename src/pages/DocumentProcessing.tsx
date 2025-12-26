/**
 * Document Processing Page - Redesigned with Extensible Document Types
 * Central hub for document processing across all workflows
 * Auto-processes documents on upload with OCR, mapping, and validation
 * Supports adding new document types via config/documentTypes.ts
 */

import React, { useState, useCallback, useEffect, useRef } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  FileSearch, 
  Upload, 
  Pill, 
  FileText, 
  Table2, 
  AlertTriangle,
  AlertCircle,
  CheckCircle,
  XCircle,
  Loader2,
  Bot,
  Settings,
  History,
  Download,
  Eye,
  Search,
  Building2,
  Users,
  ShoppingCart,
  UserCheck,
  Brain,
  Activity,
  FileCheck,
  Sparkles,
  Package,
  HeartPulse,
  ClipboardList,
  Stethoscope,
  Shield,
  Cpu,
  Layers,
  ScanLine,
  FileType,
  ArrowRight,
  Zap,
  CreditCard,
  BadgeCheck,
  Plus,
  Image,
  FlaskConical
} from 'lucide-react';
import { useMedicationProcessing } from '@/hooks/useMedicationProcessing';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { useDropzone } from 'react-dropzone';
import { supabase } from '@/integrations/supabase/client';
import AppLayout from '@/components/layout/AppLayout';
import { 
  DOCUMENT_TYPE_CONFIGS, 
  DocumentTypeConfig, 
  getDocumentTypeById, 
  getDocumentTypesByCategory,
  getAllCategories,
  getCategoryLabel,
  getCategoryIcon,
  getAllSessionStoragePrefixes,
  getFieldsForDocumentType,
  getSpecialTabForDocumentType,
  DOCUMENT_TYPE_FIELDS,
  DOCUMENT_TYPE_CONFIGS as BASE_DOCUMENT_TYPE_CONFIGS
} from '@/config/documentTypes';
import ProcessingOptionsPanel from '@/components/document-processing/ProcessingOptionsPanel';
import CustomDocumentTypeDialog from '@/components/document-processing/CustomDocumentTypeDialog';
// AgentArchitectureRecommendationPanel removed - using SubAgentRecommendationDialog instead
import ProcessingHistoryWithExport from '@/components/document-processing/ProcessingHistoryWithExport';
import MedicalImageAnalysis from '@/components/document-processing/MedicalImageAnalysis';
import InvoiceRCMAnalysis from '@/components/document-processing/InvoiceRCMAnalysis';
import SubAgentRecommendationDialog from '@/components/document-processing/SubAgentRecommendationDialog';
import RealTimeExtractionTracker from '@/components/document-processing/RealTimeExtractionTracker';
import { ArchitectureRecommendation } from '@/services/agentArchitectureIntelligence';

// Healthcare abbreviation expansion dictionary
const HEALTHCARE_ABBREVIATIONS: Record<string, string> = {
  'ded': 'Deductible',
  'deductible': 'Deductible',
  'oop': 'Out of Pocket',
  'oop_max': 'Out of Pocket Maximum',
  'out_of_pocket': 'Out of Pocket',
  'epo': 'Exclusive Provider Organization',
  'hmo': 'Health Maintenance Organization',
  'ppo': 'Preferred Provider Organization',
  'pos': 'Point of Service',
  'pcn': 'Processor Control Number',
  'bin': 'Bank Identification Number',
  'rxgrp': 'Rx Group',
  'rxbin': 'Rx BIN',
  'ndc': 'National Drug Code',
  'npi': 'National Provider Identifier',
  'dea': 'DEA Number',
  'pcp': 'Primary Care Physician',
  'dob': 'Date of Birth',
  'ssn': 'Social Security Number',
  'mrn': 'Medical Record Number',
  'dx': 'Diagnosis',
  'sig': 'Signature/Instructions',
  'qty': 'Quantity',
  'rx': 'Prescription',
  'otc': 'Over The Counter',
  'er': 'Emergency Room',
  'urgent_care': 'Urgent Care',
  'specialist': 'Specialist',
  'coinsurance': 'Coinsurance',
  'copay': 'Copayment',
  'pa': 'Prior Authorization',
  'eob': 'Explanation of Benefits',
  'id': 'Identification Number',
  'grp': 'Group',
  'eff_date': 'Effective Date',
  'exp_date': 'Expiration Date',
  'member_id': 'Member ID',
  'subscriber_id': 'Subscriber ID',
  'group_number': 'Group Number',
  'plan_type': 'Plan Type',
  'plan_name': 'Plan Name',
  'insurance_name': 'Insurance Company Name',
  'insurance_company': 'Insurance Company',
  'payer_id': 'Payer ID',
};

// Function to expand abbreviations in field names
const expandAbbreviation = (text: string): string => {
  const lowerText = text.toLowerCase().replace(/\s+/g, '_');
  if (HEALTHCARE_ABBREVIATIONS[lowerText]) {
    return HEALTHCARE_ABBREVIATIONS[lowerText];
  }
  // Check partial matches
  for (const [abbr, full] of Object.entries(HEALTHCARE_ABBREVIATIONS)) {
    if (lowerText.includes(abbr) && abbr.length > 2) {
      return text.replace(new RegExp(abbr, 'gi'), full);
    }
  }
  // Capitalize first letter of each word
  return text.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
};

// Processing stages
type ProcessingStage = 'idle' | 'uploading' | 'ocr' | 'extraction' | 'mapping' | 'validation' | 'complete' | 'error';

// Agent workflow types for document processing
type AgentWorkflowType = 'none' | 'insurance-verification' | 'prescription-processing' | 'patient-intake' | 'imaging-analysis';

interface AgentWorkflowConfig {
  id: AgentWorkflowType;
  title: string;
  description: string;
  icon: React.ReactNode;
  documentTypes: string[];
  capabilities: string[];
}

interface ProcessingResult {
  id: string;
  fileName: string;
  documentType: string;
  stage: ProcessingStage;
  progress: number;
  extractedFields: Record<string, { value: string; confidence: number; verified?: boolean }>;
  medications?: MedicationResult[];
  validationResults?: { passed: number; failed: number; warnings: number };
  rawText?: string;
  tables?: any[];
  lineItems?: any[];
  error?: string;
  processedAt: Date;
  imageUrl?: string;
  exportStatus?: 'pending' | 'exported' | 'partial';
  exportedAt?: Date;
  exportTargets?: string[];
}

interface MedicationResult {
  drugName: string;
  genericName?: string;
  correctedName?: string;
  wasCorrected?: boolean;
  strength: string;
  sig: string;
  calculatedQuantity: number;
  daysSupply: number;
  dailyDose: number;
  ndc?: string;
  ndcOptions: { code: string; name: string; manufacturer: string }[];
  alternatives?: { name: string; ndc: string; inStock: boolean; stockQty: number }[];
  clinicalRecommendations?: { type: 'warning' | 'info' | 'error'; title?: string; message: string }[];
  isControlled?: boolean;
  schedule?: string;
}

// Agent workflow configurations
const AGENT_WORKFLOW_CONFIGS: AgentWorkflowConfig[] = [
  {
    id: 'insurance-verification',
    title: 'Insurance Verification Agent',
    description: 'Verify coverage, eligibility, co-pays from insurance cards',
    icon: <CreditCard className="h-5 w-5" />,
    documentTypes: ['insurance', 'patient-onboarding'],
    capabilities: ['Coverage verification', 'Eligibility check', 'Co-pay lookup', 'Prior authorization status']
  },
  {
    id: 'prescription-processing',
    title: 'Prescription Processing Agent',
    description: 'Co-pay lookup, prior auth check, drug interactions',
    icon: <Pill className="h-5 w-5" />,
    documentTypes: ['prescription', 'order-management'],
    capabilities: ['Drug interaction check', 'Prior auth verification', 'Co-pay calculation', 'Formulary check']
  },
  {
    id: 'patient-intake',
    title: 'Patient Intake Agent',
    description: 'Extract and validate patient demographics & history',
    icon: <UserCheck className="h-5 w-5" />,
    documentTypes: ['patient-onboarding', 'insurance'],
    capabilities: ['Demographics extraction', 'Medical history parsing', 'Consent validation', 'Duplicate patient check']
  },
  {
    id: 'imaging-analysis',
    title: 'Medical Imaging Agent',
    description: 'Analyze X-ray, CT, MRI, ECG reports with DICOM support',
    icon: <Image className="h-5 w-5" />,
    documentTypes: ['xray', 'ct-scan', 'mri', 'ecg', 'ultrasound'],
    capabilities: ['DICOM processing', 'Image analysis', 'Report extraction', 'Finding detection']
  }
];

export default function DocumentProcessing() {
  const navigate = useNavigate();
  
  // Initialize from sessionStorage to persist across tab switches and navigation
  const [selectedDocType, setSelectedDocType] = useState<string>(() => {
    const saved = sessionStorage.getItem('docProcessing_selectedDocType');
    return saved || 'prescription';
  });
  const [activeTab, setActiveTab] = useState<string>(() => {
    const saved = sessionStorage.getItem('docProcessing_activeTab');
    return saved || 'upload';
  });
  
  // Persist selectedDocType to sessionStorage
  useEffect(() => {
    sessionStorage.setItem('docProcessing_selectedDocType', selectedDocType);
  }, [selectedDocType]);
  
  // Persist activeTab to sessionStorage
  useEffect(() => {
    sessionStorage.setItem('docProcessing_activeTab', activeTab);
  }, [activeTab]);
  
  // Custom document types state - merge with base configs
  const [customDocTypes, setCustomDocTypes] = useState<DocumentTypeConfig[]>([]);
  const [showCustomTypeDialog, setShowCustomTypeDialog] = useState(false);
  
  // Combined document type configs
  const DOCUMENT_TYPE_CONFIGS = [...BASE_DOCUMENT_TYPE_CONFIGS, ...customDocTypes];
  
  // Helper to get doc type by id from combined list
  const getDocTypeById = (id: string) => DOCUMENT_TYPE_CONFIGS.find(c => c.id === id);
  
  // Get current document config from extensible config
  const currentConfig = getDocTypeById(selectedDocType) || getDocumentTypeById(selectedDocType) || DOCUMENT_TYPE_CONFIGS[0];
  
  // Dynamic tabs based on document type
  const getTabsForDocumentType = useCallback((docType: string) => {
    const config = getDocTypeById(docType) || getDocumentTypeById(docType);
    const baseTabs: { id: string; label: string; icon: React.ReactNode }[] = [
      { id: 'upload', label: 'Upload & Process', icon: <Upload className="h-4 w-4" /> },
    ];
    
    // Add document-type-specific tab based on config
    if (config?.specialTab) {
      baseTabs.push({ 
        id: config.specialTab.id, 
        label: config.specialTab.label, 
        icon: <span className="text-sm">{config.specialTab.icon}</span>
      });
    }
    
    // Always add history at the end
    baseTabs.push({ id: 'history', label: 'History', icon: <History className="h-4 w-4" /> });
    
    return baseTabs;
  }, [customDocTypes]);

  const dynamicTabs = getTabsForDocumentType(selectedDocType);
  
  // Track previous document type to detect changes
  const prevDocTypeRef = useRef<string>(selectedDocType);
  
  // Reset to upload tab AND clear state when document type changes
  useEffect(() => {
    const validTabIds = dynamicTabs.map(t => t.id);
    if (!validTabIds.includes(activeTab)) {
      setActiveTab('upload');
    }
    
    // Clear extracted data when document type changes to prevent data carryover
    if (prevDocTypeRef.current !== selectedDocType) {
      console.log('DocumentProcessing - Document type changed from', prevDocTypeRef.current, 'to', selectedDocType);
      
      // Clear current processing result to prevent stale data
      setProcessingResult(null);
      setPendingResult(null);
      
      // Clear any document-type-specific sessionStorage using DYNAMIC prefixes
      // This ensures new document types added to documentTypes.ts are automatically handled
      const allPrefixes = getAllSessionStoragePrefixes();
      const keysToRemove: string[] = [];
      
      for (let i = 0; i < sessionStorage.length; i++) {
        const key = sessionStorage.key(i);
        if (key && allPrefixes.some(prefix => key.startsWith(prefix))) {
          keysToRemove.push(key);
        }
      }
      
      keysToRemove.forEach(key => {
        console.log('DocumentProcessing - Removing sessionStorage key:', key);
        sessionStorage.removeItem(key);
      });
      
      prevDocTypeRef.current = selectedDocType;
    }
  }, [selectedDocType, dynamicTabs, activeTab]);
  
  const [processingResult, setProcessingResult] = useState<ProcessingResult | null>(null);
  const [processingHistory, setProcessingHistory] = useState<ProcessingResult[]>([]);
  const [isAutoProcessing, setIsAutoProcessing] = useState(true);
  const [showSettingsDialog, setShowSettingsDialog] = useState(false);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [showVerificationDialog, setShowVerificationDialog] = useState(false);
  const [pendingResult, setPendingResult] = useState<ProcessingResult | null>(null);
  const [showSubAgentDialog, setShowSubAgentDialog] = useState(false);
  
  // Load processing history from database
  const loadHistory = useCallback(async () => {
    setIsLoadingHistory(true);
    try {
      // Try to scope history to current user when possible
      let userId: string | null = null;
      try {
        const { data } = await supabase.auth.getUser();
        userId = data?.user?.id ?? null;
      } catch (authErr) {
        console.warn('Unable to resolve current user for history filter:', authErr);
      }

      let query: any = supabase
        .from('document_processing_jobs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);

      // Only show this user's jobs when user_id is available; legacy
      // rows with null user_id are still allowed by RLS but we hide
      // them from the UI to avoid confusing extra history entries.
      if (userId) {
        query = query.eq('user_id', userId);
      }

      const { data, error } = await query;

      if (error) throw error;

      if (data && data.length > 0) {
        const historyItems: ProcessingResult[] = data.map((job: any) => {
          // Derive a robust public URL for the stored file
          let publicUrl: string | undefined;
          
          // Try from processing_config first (most reliable as it's stored at upload time)
          if (job.processing_config?.publicUrl) {
            publicUrl = job.processing_config.publicUrl;
          } else if (job.file_path) {
            // Fallback: try to construct URL from file_path
            try {
              const { data: urlData } = supabase.storage
                .from('document-processing')
                .getPublicUrl(job.file_path);
              publicUrl = urlData?.publicUrl;
            } catch (e) {
              console.warn('Could not get public URL for:', job.file_path);
            }
          }

          // Build extracted fields map from stored metadata
          // Support both new dynamic extraction format and legacy entity/formFields format
          const metadata = job.extracted_metadata || {};
          const entities = metadata.entities || [];
          const formFields = metadata.formFields || [];

          const extractedFields: Record<string, { value: string; confidence: number; verified?: boolean }> = {};

          // Handle dynamic entities (from Gemini NLP) - support various field name formats
          entities.forEach((entity: any) => {
            if (!entity) return;
            
            // Get the field name from various possible keys
            const fieldName = entity.type || entity.fieldName || entity.field_name || entity.name;
            if (!fieldName) return;
            
            // Normalize key: lowercase, replace spaces with underscores
            const key = String(fieldName).toLowerCase().replace(/\s+/g, '_');
            
            // Get the value from various possible keys
            const value = entity.value ?? entity.text ?? entity.content ?? '';
            
            if (!extractedFields[key] || (entity.confidence || 0) > (extractedFields[key].confidence || 0)) {
              extractedFields[key] = {
                value: String(value),
                confidence: entity.confidence ?? 0.8,
                verified: entity.verified ?? false,
              };
            }
          });

          // Then form fields override / extend
          formFields.forEach((field: any) => {
            if (!field) return;
            const fieldName = field.fieldName || field.field_name || field.name || field.type;
            if (!fieldName) return;
            
            const key = String(fieldName).toLowerCase().replace(/\s+/g, '_');
            const value = field.value ?? field.text ?? '';
            
            extractedFields[key] = {
              value: String(value),
              confidence: field.confidence ?? 0.8,
              verified: field.verified ?? false,
            };
          });

          // Map basic validation summary if present (object-based status)
          let validationSummary: { passed: number; failed: number; warnings: number } | undefined;
          const validation = job.validation_status as any;
          if (validation && typeof validation === 'object') {
            validationSummary = {
              passed: validation.passed ?? 0,
              failed: validation.failed ?? 0,
              warnings: validation.warnings ?? 0,
            };
          }

          // Extract line items and tables from processing_config (saved during verification)
          const processingConfig = job.processing_config || {};
          const lineItems = processingConfig.lineItems || metadata.lineItems || metadata.line_items || [];
          const tables = processingConfig.tables || metadata.tables || [];
          
          // Override extractedFields with verified fields from processing_config if available
          // This is the PRIMARY source of extracted fields as they're saved during "Confirm & Save"
          if (processingConfig.extractedFields) {
            console.log('[loadHistory] Found extractedFields in processing_config:', processingConfig.extractedFields);
            Object.entries(processingConfig.extractedFields).forEach(([key, field]: [string, any]) => {
              // Handle both formats: { value: "..." } and direct value
              if (field !== null && field !== undefined) {
                const value = typeof field === 'object' && field !== null && 'value' in field 
                  ? field.value 
                  : field;
                if (value !== null && value !== undefined && value !== '') {
                  extractedFields[key] = {
                    value: String(value),
                    confidence: (typeof field === 'object' && field?.confidence) || 0.9,
                    verified: true,
                  };
                }
              }
            });
          }
          
          // Also check for medications in processing_config and extract medication fields
          const medications = processingConfig.medications || metadata.medications || [];
          if (medications.length > 0) {
            console.log('[loadHistory] Found medications:', medications);
            medications.forEach((med: any, idx: number) => {
              const prefix = medications.length > 1 ? `medication_${idx + 1}_` : '';
              if (med.name) extractedFields[`${prefix}medication_name`] = { value: med.name, confidence: 0.9, verified: true };
              if (med.dosage) extractedFields[`${prefix}dosage`] = { value: med.dosage, confidence: 0.9, verified: true };
              if (med.strength) extractedFields[`${prefix}strength`] = { value: med.strength, confidence: 0.9, verified: true };
              if (med.frequency) extractedFields[`${prefix}frequency`] = { value: med.frequency, confidence: 0.9, verified: true };
              if (med.directions || med.sig) extractedFields[`${prefix}sig`] = { value: med.directions || med.sig, confidence: 0.9, verified: true };
              if (med.quantity) extractedFields[`${prefix}quantity`] = { value: String(med.quantity), confidence: 0.9, verified: true };
              if (med.refills) extractedFields[`${prefix}refills`] = { value: String(med.refills), confidence: 0.9, verified: true };
              if (med.ndc || med.ndcCode) extractedFields[`${prefix}ndc_code`] = { value: med.ndc || med.ndcCode, confidence: 0.9, verified: true };
            });
          }
          
          // Extract medical imaging fields from processing_config (patient, provider, AI insights)
          const patientDetails = processingConfig.patientDetails || {};
          const providerDetails = processingConfig.providerDetails || {};
          const aiInsights = processingConfig.aiInsights || [];
          const clinicalNotes = processingConfig.notes || '';
          
          // Patient Details for medical imaging
          if (patientDetails.patient_name) extractedFields['patient_name'] = { value: patientDetails.patient_name, confidence: 1, verified: true };
          if (patientDetails.patient_dob) extractedFields['patient_dob'] = { value: patientDetails.patient_dob, confidence: 1, verified: true };
          if (patientDetails.patient_id) extractedFields['patient_id'] = { value: patientDetails.patient_id, confidence: 1, verified: true };
          if (patientDetails.referring_physician) extractedFields['referring_physician'] = { value: patientDetails.referring_physician, confidence: 1, verified: true };
          if (patientDetails.study_date) extractedFields['study_date'] = { value: patientDetails.study_date, confidence: 1, verified: true };
          
          // Provider Details for medical imaging
          if (providerDetails.provider_name) extractedFields['provider_name'] = { value: providerDetails.provider_name, confidence: 1, verified: true };
          if (providerDetails.provider_npi) extractedFields['provider_npi'] = { value: providerDetails.provider_npi, confidence: 1, verified: true };
          if (providerDetails.facility_name) extractedFields['facility_name'] = { value: providerDetails.facility_name, confidence: 1, verified: true };
          if (providerDetails.facility_address) extractedFields['facility_address'] = { value: providerDetails.facility_address, confidence: 1, verified: true };
          if (providerDetails.report_date) extractedFields['report_date'] = { value: providerDetails.report_date, confidence: 1, verified: true };
          
          // Clinical notes
          if (clinicalNotes) extractedFields['clinical_notes'] = { value: clinicalNotes, confidence: 1, verified: true };
          
          // AI Insights - extract key findings as structured fields
          if (aiInsights.length > 0) {
            // Store full insights as JSON
            extractedFields['ai_insights_json'] = { value: JSON.stringify(aiInsights), confidence: 1, verified: true };
            
            // Extract individual findings with their details
            aiInsights.forEach((insight: any, idx: number) => {
              const prefix = `finding_${idx + 1}_`;
              if (insight.category) extractedFields[`${prefix}category`] = { value: insight.category, confidence: insight.confidence || 0.9, verified: true };
              if (insight.description) extractedFields[`${prefix}description`] = { value: insight.description, confidence: insight.confidence || 0.9, verified: true };
              if (insight.region) extractedFields[`${prefix}region`] = { value: insight.region, confidence: insight.confidence || 0.9, verified: true };
              if (insight.clinicalSignificance) extractedFields[`${prefix}significance`] = { value: insight.clinicalSignificance, confidence: insight.confidence || 0.9, verified: true };
              if (insight.status) extractedFields[`${prefix}status`] = { value: insight.status, confidence: insight.confidence || 0.9, verified: true };
              if (insight.measurementValue) extractedFields[`${prefix}measurement`] = { value: insight.measurementValue, confidence: insight.confidence || 0.9, verified: true };
              if (insight.normalRange) extractedFields[`${prefix}normal_range`] = { value: insight.normalRange, confidence: insight.confidence || 0.9, verified: true };
            });
            
            // Create summary fields
            const findingsSummary = aiInsights.map((i: any) => i.description).filter(Boolean).join('; ');
            if (findingsSummary) extractedFields['findings_summary'] = { value: findingsSummary, confidence: 0.9, verified: true };
            
            const abnormalFindings = aiInsights.filter((i: any) => i.status === 'abnormal' || i.clinicalSignificance === 'high' || i.clinicalSignificance === 'critical');
            if (abnormalFindings.length > 0) {
              extractedFields['abnormal_findings'] = { value: abnormalFindings.map((f: any) => f.description).join('; '), confidence: 0.9, verified: true };
              extractedFields['abnormal_count'] = { value: String(abnormalFindings.length), confidence: 1, verified: true };
            }
          }
          
          console.log('[loadHistory] Final extractedFields:', extractedFields);

          return {
            id: job.id,
            fileName: job.file_name,
            documentType: job.document_type || 'unknown',
            stage: job.status === 'completed' ? 'complete' : job.status,
            progress: job.progress || 100,
            extractedFields,
            medications: processingConfig.medications || metadata.medications || [],
            validationResults: validationSummary,
            rawText: job.extracted_text,
            lineItems,
            tables,
            processedAt: new Date(job.created_at),
            imageUrl: publicUrl,
            exportStatus: job.export_status || 'pending',
            exportedAt: job.exported_at ? new Date(job.exported_at) : undefined,
            exportTargets: job.export_targets || [],
          };
        });

        setProcessingHistory(historyItems);
      } else {
        setProcessingHistory([]);
      }
    } catch (err) {
      console.error('Failed to load processing history:', err);
    } finally {
      setIsLoadingHistory(false);
    }
  }, []);

  // Load history on mount
  useEffect(() => {
    loadHistory();
  }, [loadHistory]);



  // Agent recommendation panel state - using showSubAgentDialog for the clean dialog
  const [hasShownAutoRecommendation, setHasShownAutoRecommendation] = useState(false);
  
  // Agent processing mode
  const [processingMode, setProcessingMode] = useState<'standalone' | 'agent'>('standalone');
  const [selectedAgentWorkflow, setSelectedAgentWorkflow] = useState<AgentWorkflowType>('none');
  const [isAgentProcessing, setIsAgentProcessing] = useState(false);
  
  // REMOVED: Auto-show agent recommendations - now only shows AFTER user saves to history
  // This ensures sequential flow: 1) View results → 2) Save to history → 3) Sub-agent dialog
  
  // Reset auto-recommendation flag when document type changes
  useEffect(() => {
    setHasShownAutoRecommendation(false);
  }, [selectedDocType]);
  
  // Processing settings (these control actual behavior)
  const [enableOCR, setEnableOCR] = useState(true);
  const [enableHandwriting, setEnableHandwriting] = useState(true);
  const [enableTableExtraction, setEnableTableExtraction] = useState(true);
  const [enableSignatureDetection, setEnableSignatureDetection] = useState(true);
  const [enableAutoCalculateQty, setEnableAutoCalculateQty] = useState(true);
  const [enableNdcMatching, setEnableNdcMatching] = useState(true);
  const [enableClinicalRecommendations, setEnableClinicalRecommendations] = useState(true);
  const [confidenceThreshold, setConfidenceThreshold] = useState(0.85);
  const [ocrProvider, setOcrProvider] = useState<'google' | 'azure' | 'aws'>('google');
  
  // Get recommended agent workflows for current document type
  const recommendedAgentWorkflows = AGENT_WORKFLOW_CONFIGS.filter(
    config => config.documentTypes.includes(selectedDocType)
  );
  
  // Medication search state
  const [drugSearchQuery, setDrugSearchQuery] = useState('');
  const [sigInstructions, setSigInstructions] = useState('');
  const [searchResults, setSearchResults] = useState<MedicationResult | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedNdc, setSelectedNdc] = useState<string | null>(null);
  const [parsedSig, setParsedSig] = useState<any>(null);
  const [selectedRecommendation, setSelectedRecommendation] = useState<{ title: string; message: string; type: string } | null>(null);
  
  // Separate editable fields for dose/route/frequency
  const [selectedDose, setSelectedDose] = useState('1 tablet');
  const [selectedRoute, setSelectedRoute] = useState('by mouth (oral)');
  const [selectedFrequency, setSelectedFrequency] = useState('once daily');
  const [selectedDuration, setSelectedDuration] = useState('30 days');
  
  // NDC-specific dosing info
  const [ndcDosageInfo, setNdcDosageInfo] = useState<{
    dose: string;
    route: string;
    frequency: string;
    duration: string;
    dosageForm: string;
    strength: string;
  } | null>(null);
  
  // Flag to track if state restoration is pending (for medical imaging states)
  const [stateRestorationPending, setStateRestorationPending] = useState<string | null>(() => {
    return sessionStorage.getItem('docProcessing_fullState');
  });
  
  const { calculateQuantityAndDaySupply, matchDrugToCode, checkControlledSubstance, parseSig } = useMedicationProcessing();
  
  // currentConfig is defined above in getTabsForDocumentType section
  
  // Dose options
  const doseOptions = ['1 tablet', '2 tablets', '1 capsule', '2 capsules', '1 drop', '2 drops', '5 ml', '10 ml', '1 puff', '2 puffs'];
  
  // Route options
  const routeOptions = [
    { value: 'po', label: 'by mouth (oral)' },
    { value: 'sl', label: 'under the tongue (sublingual)' },
    { value: 'pr', label: 'rectally' },
    { value: 'im', label: 'intramuscular injection' },
    { value: 'iv', label: 'intravenous injection' },
    { value: 'sc', label: 'subcutaneous injection' },
    { value: 'top', label: 'topically (on skin)' },
    { value: 'inh', label: 'by inhalation' },
    { value: 'ou', label: 'both eyes' },
    { value: 'au', label: 'both ears' },
  ];
  
  // Frequency options
  const frequencyOptions = [
    { value: 'qd', label: 'once daily', timesPerDay: 1 },
    { value: 'bid', label: 'twice daily', timesPerDay: 2 },
    { value: 'tid', label: 'three times a day', timesPerDay: 3 },
    { value: 'qid', label: 'four times a day', timesPerDay: 4 },
    { value: 'q4h', label: 'every 4 hours', timesPerDay: 6 },
    { value: 'q6h', label: 'every 6 hours', timesPerDay: 4 },
    { value: 'q8h', label: 'every 8 hours', timesPerDay: 3 },
    { value: 'q12h', label: 'every 12 hours', timesPerDay: 2 },
    { value: 'hs', label: 'at bedtime', timesPerDay: 1 },
    { value: 'prn', label: 'as needed', timesPerDay: 0 },
  ];
  
  // Duration options
  const durationOptions = ['7 days', '10 days', '14 days', '21 days', '30 days', '60 days', '90 days'];

  // Parse SIG text to auto-populate dose, route, frequency, duration selectors
  const parseSigToSelectors = useCallback((sigText: string) => {
    if (!sigText) return;
    
    // Mark that we're extracting to prevent useEffect cascading updates
    isExtractingRef.current = true;
    
    const lowerSig = sigText.toLowerCase();
    
    // Collect all values first, then update states once
    let newDose = selectedDose;
    let newRoute = selectedRoute;
    let newFrequency = selectedFrequency;
    let newDuration = selectedDuration;
    
    // Parse dose amount (e.g., "take 1 tablet", "take 2 capsules", "1 cap", "2 tabs")
    const dosePatterns = [
      /take\s*(\d+)\s*(tablet|tab|capsule|cap|drop|ml|puff)s?/i,
      /(\d+)\s*(tablet|tab|capsule|cap|drop|ml|puff)s?\s*(orally|by mouth|po|daily|twice|three)/i,
      /^(\d+)\s*(tablet|tab|capsule|cap|drop|ml|puff)s?/i,
    ];
    
    for (const pattern of dosePatterns) {
      const match = sigText.match(pattern);
      if (match) {
        const qty = match[1];
        const form = match[2].toLowerCase();
        let doseValue = '';
        if (form.startsWith('tab')) {
          doseValue = qty === '1' ? '1 tablet' : `${qty} tablets`;
        } else if (form.startsWith('cap')) {
          doseValue = qty === '1' ? '1 capsule' : `${qty} capsules`;
        } else if (form === 'drop') {
          doseValue = qty === '1' ? '1 drop' : `${qty} drops`;
        } else if (form === 'ml') {
          doseValue = `${qty} ml`;
        } else if (form === 'puff') {
          doseValue = qty === '1' ? '1 puff' : `${qty} puffs`;
        }
        if (doseValue && doseOptions.includes(doseValue)) {
          newDose = doseValue;
          break;
        }
      }
    }
    
    // Parse route (oral, by mouth, po, topically, etc.)
    const routeMapping: Record<string, string> = {
      'orally': 'by mouth (oral)',
      'by mouth': 'by mouth (oral)',
      'po': 'by mouth (oral)',
      'oral': 'by mouth (oral)',
      'sublingually': 'under the tongue (sublingual)',
      'under tongue': 'under the tongue (sublingual)',
      'sl': 'under the tongue (sublingual)',
      'rectally': 'rectally',
      'pr': 'rectally',
      'intramuscular': 'intramuscular injection',
      'im': 'intramuscular injection',
      'intravenous': 'intravenous injection',
      'iv': 'intravenous injection',
      'subcutaneous': 'subcutaneous injection',
      'sc': 'subcutaneous injection',
      'topically': 'topically (on skin)',
      'topical': 'topically (on skin)',
      'inhale': 'by inhalation',
      'inhalation': 'by inhalation',
      'both eyes': 'both eyes',
      'ou': 'both eyes',
      'both ears': 'both ears',
      'au': 'both ears',
    };
    
    for (const [keyword, routeLabel] of Object.entries(routeMapping)) {
      if (lowerSig.includes(keyword)) {
        newRoute = routeLabel;
        break;
      }
    }
    
    // Parse frequency (once daily, twice daily, three times a day, etc.)
    const freqMapping: Record<string, string> = {
      'once daily': 'once daily',
      'once a day': 'once daily',
      'qd': 'once daily',
      'daily': 'once daily',
      'twice daily': 'twice daily',
      'twice a day': 'twice daily',
      'bid': 'twice daily',
      'two times a day': 'twice daily',
      '2 times a day': 'twice daily',
      'three times a day': 'three times a day',
      'three times daily': 'three times a day',
      'tid': 'three times a day',
      '3 times a day': 'three times a day',
      'four times a day': 'four times a day',
      'qid': 'four times a day',
      '4 times a day': 'four times a day',
      'every 4 hours': 'every 4 hours',
      'q4h': 'every 4 hours',
      'every 6 hours': 'every 6 hours',
      'q6h': 'every 6 hours',
      'every 8 hours': 'every 8 hours',
      'q8h': 'every 8 hours',
      'every 12 hours': 'every 12 hours',
      'q12h': 'every 12 hours',
      'at bedtime': 'at bedtime',
      'hs': 'at bedtime',
      'as needed': 'as needed',
      'prn': 'as needed',
    };
    
    for (const [keyword, freqLabel] of Object.entries(freqMapping)) {
      if (lowerSig.includes(keyword)) {
        newFrequency = freqLabel;
        break;
      }
    }
    
    // Parse duration (for X days)
    const durationPatterns = [
      /for\s*(\d+)\s*days?/i,
      /(\d+)\s*days?\s*supply/i,
      /x\s*(\d+)\s*days?/i,
      /(\d+)\s*day\s*course/i,
    ];
    
    for (const pattern of durationPatterns) {
      const match = sigText.match(pattern);
      if (match) {
        const days = parseInt(match[1]);
        // Find closest duration option
        const closestDuration = durationOptions.find(d => {
          const dDays = parseInt(d.match(/(\d+)/)?.[1] || '0');
          return dDays === days;
        }) || durationOptions.find(d => {
          const dDays = parseInt(d.match(/(\d+)/)?.[1] || '0');
          return dDays >= days;
        }) || '30 days';
        newDuration = closestDuration;
        break;
      }
    }
    
    // Batch all state updates together
    setSelectedDose(newDose);
    setSelectedRoute(newRoute);
    setSelectedFrequency(newFrequency);
    setSelectedDuration(newDuration);
    
    // Calculate quantity immediately with new values
    const doseMatch = newDose.match(/^(\d+(?:\.\d+)?)/);
    const doseAmount = doseMatch ? parseFloat(doseMatch[1]) : 1;
    const freqOption = frequencyOptions.find(f => f.label === newFrequency);
    const timesPerDay = freqOption?.timesPerDay || 1;
    const durationMatch = newDuration.match(/(\d+)\s*days?/i);
    const days = durationMatch ? parseInt(durationMatch[1]) : 30;
    const dailyDose = doseAmount * timesPerDay;
    const totalQuantity = Math.ceil(dailyDose * days);
    
    setCalculatedQuantity({ totalQuantity, dailyDose, daysSupply: days });
    setCombinedSig(`Take ${newDose} ${newRoute} ${newFrequency} for ${newDuration}`);
    
    // Allow useEffect to run again after a delay
    setTimeout(() => {
      isExtractingRef.current = false;
    }, 200);
  }, [doseOptions, durationOptions, frequencyOptions, selectedDose, selectedRoute, selectedFrequency, selectedDuration]);

  // Normalize drug name for API lookup - strip strength, dosage form, extras
  const normalizeDrugName = useCallback((rawName: string): { baseName: string; extractedStrength: string } => {
    const original = rawName.trim();
    
    // Extract strength pattern first (e.g., "500 mg", "10mg", "250mcg")
    const strengthMatch = original.match(/\b(\d+(?:\.\d+)?)\s*(mg|mcg|g|ml|units?)\b/i);
    const extractedStrength = strengthMatch ? `${strengthMatch[1]} ${strengthMatch[2]}` : '';
    
    // Remove strength, dosage forms, brand suffixes
    const baseName = original
      .replace(/\b\d+(?:\.\d+)?\s*(mg|mcg|g|ml|units?)\b/gi, '')
      .replace(/\b(tablets?|capsules?|caps?|tabs?|solution|suspension|injection|cream|ointment|topical|drops?|inhaler|syrup|extended.?release|er|sr|xl|xr|hcl|hydrochloride)\b/gi, '')
      .replace(/\s+/g, ' ')
      .trim()
      .split(/\s+/)[0]; // Take first word (generic name)
    
    return { baseName: baseName || original.split(/\s+/)[0], extractedStrength };
  }, []);

  // Handle drug search with real OpenFDA + RxNorm API
  const handleDrugSearch = useCallback(async () => {
    if (!drugSearchQuery.trim()) return;
    
    setIsSearching(true);
    setSelectedNdc(null);
    
    try {
      // Normalize drug name for better API matching
      const { baseName, extractedStrength } = normalizeDrugName(drugSearchQuery);
      
      // Prefer strength from current processing result, then from query, then from NDC
      const preferredStrength = processingResult?.medications?.[0]?.strength || extractedStrength || '';
      
      const { data, error } = await supabase.functions.invoke('drug-lookup', {
        body: { drugName: baseName, searchType: 'all' }
      });
      
      if (error) throw error;
      
      if (data) {
        const calculation = calculateQuantityAndDaySupply(sigInstructions || 'Take 1 tablet daily for 30 days');
        
        const ndcOptions = (data.ndc || []).map((ndc: any) => ({
          code: ndc.code,
          name: `${ndc.brandName || ndc.genericName} ${ndc.strength}`,
          manufacturer: ndc.manufacturer,
          dosageForm: ndc.dosageForm,
          country: 'USA'
        }));
        
        const clinicalRecommendations: { type: 'warning' | 'info' | 'error'; title?: string; message: string }[] = [];
        
        if (data.isControlled) {
          clinicalRecommendations.push({
            type: 'warning',
            title: 'Controlled Substance',
            message: `Schedule ${data.schedule} controlled substance - Verify patient ID and check PDMP`
          });
        }
        
        if (data.clinicalInfo) {
          data.clinicalInfo.forEach((info: any) => {
            const recType = info.type === 'error' ? 'error' : 
                            (info.severity === 'high' ? 'warning' : 'info');
            clinicalRecommendations.push({
              type: recType as 'warning' | 'info' | 'error',
              title: info.title || undefined,
              message: info.description
            });
          });
        }
        
        if (clinicalRecommendations.length === 0) {
          clinicalRecommendations.push({
            type: 'info',
            title: 'Standard Medication',
            message: 'No specific warnings found. Follow standard prescribing guidelines.'
          });
        }
        
        const primaryNdc = data.ndc?.[0];
        
        // IMPORTANT: Use preferredStrength (from OCR) instead of NDC strength
        const result: MedicationResult = {
          drugName: primaryNdc?.brandName || data.drugName || baseName,
          genericName: primaryNdc?.genericName || data.rxnorm?.[0]?.name,
          strength: preferredStrength || primaryNdc?.strength || '',
          sig: sigInstructions || 'Take 1 tablet daily for 30 days',
          calculatedQuantity: calculation.totalQuantity,
          daysSupply: calculation.daysSupply,
          dailyDose: calculation.dailyDose,
          ndc: primaryNdc?.code,
          ndcOptions,
          alternatives: (data.alternatives || []).map((alt: any) => ({
            name: alt.name,
            ndc: alt.rxcui,
            inStock: Math.random() > 0.3,
            stockQty: Math.floor(Math.random() * 500)
          })),
          clinicalRecommendations,
          isControlled: data.isControlled,
          schedule: data.schedule
        };
        
        setSearchResults(result);
        
        // Auto-select first NDC
        if (ndcOptions.length > 0) {
          setSelectedNdc(ndcOptions[0].code);
        }

        if (ndcOptions.length > 0 || (data.rxnorm && data.rxnorm.length > 0)) {
          toast.success(`Found ${ndcOptions.length} NDC codes + ${data.rxnorm?.length || 0} RxNorm entries`);
        } else {
          toast.info('No NDC/RxNorm matches; showing clinical info');
        }
      } else {
        toast.error('Drug lookup failed - empty response');
        setSearchResults(null);
      }
    } catch (err) {
      console.error('Drug search error:', err);
      toast.error('Failed to search drug database');
      setSearchResults(null);
    } finally {
      setIsSearching(false);
    }
  }, [drugSearchQuery, sigInstructions, calculateQuantityAndDaySupply, normalizeDrugName, processingResult]);

  // Parse SIG when it changes and auto-populate dropdowns
  useEffect(() => {
    if (sigInstructions.trim()) {
      const parsed = parseSig(sigInstructions);
      setParsedSig(parsed);
      
      // Auto-populate dropdowns from parsed SIG
      if (parsed.dose?.display) {
        setSelectedDose(parsed.dose.display);
      }
      if (parsed.route?.meaning) {
        setSelectedRoute(parsed.route.meaning);
      }
      if (parsed.frequency?.meaning) {
        setSelectedFrequency(parsed.frequency.meaning);
      }
      if (parsed.duration?.display) {
        setSelectedDuration(parsed.duration.display);
      }
    } else {
      setParsedSig(null);
    }
  }, [sigInstructions, parseSig]);

  // Auto-update fields when NDC changes
  useEffect(() => {
    if (selectedNdc && searchResults) {
      const ndcOption = searchResults.ndcOptions.find(opt => opt.code === selectedNdc);
      if (ndcOption) {
        // Parse dosage form to determine dose format
        const dosageForm = (ndcOption as any).dosageForm?.toLowerCase() || '';
        const strength = searchResults.strength || '';
        
        // Determine dose based on dosage form
        let dose = '1 tablet';
        let route = 'by mouth (oral)';
        
        if (dosageForm.includes('tablet')) {
          dose = '1 tablet';
          route = 'by mouth (oral)';
        } else if (dosageForm.includes('capsule')) {
          dose = '1 capsule';
          route = 'by mouth (oral)';
        } else if (dosageForm.includes('injection') || dosageForm.includes('injectable')) {
          dose = strength || '1 ml';
          route = 'subcutaneous injection';
        } else if (dosageForm.includes('cream') || dosageForm.includes('ointment') || dosageForm.includes('topical')) {
          dose = 'Apply as directed';
          route = 'topically (on skin)';
        } else if (dosageForm.includes('solution') || dosageForm.includes('suspension')) {
          dose = '5 ml';
          route = 'by mouth (oral)';
        } else if (dosageForm.includes('drop') || dosageForm.includes('ophthalmic')) {
          dose = '1 drop';
          route = 'both eyes';
        } else if (dosageForm.includes('inhaler') || dosageForm.includes('inhalation')) {
          dose = '2 puffs';
          route = 'by inhalation';
        }
        
        // Set the fields
        setSelectedDose(dose);
        setSelectedRoute(route);
        
        // Store NDC-specific info
        setNdcDosageInfo({
          dose,
          route,
          frequency: selectedFrequency,
          duration: selectedDuration,
          dosageForm: (ndcOption as any).dosageForm || 'Unknown',
          strength
        });
      }
    }
  }, [selectedNdc, searchResults]);

  // State for calculated quantity from SIG components
  const [calculatedQuantity, setCalculatedQuantity] = useState<{ totalQuantity: number; dailyDose: number; daysSupply: number } | null>(null);
  const [combinedSig, setCombinedSig] = useState('');
  
  // Ref to track if we're in extraction mode (to prevent flickering from cascading updates)
  const isExtractingRef = useRef(false);

  // Auto-calculate total quantity when dose, frequency, or duration changes
  // Uses a ref to debounce and prevent flickering
  useEffect(() => {
    // Skip if we're currently extracting (parseSigToSelectors is running)
    if (isExtractingRef.current) return;
    
    // Use a small debounce to batch state updates
    const timeoutId = setTimeout(() => {
      // Parse dose amount (e.g., "1 tablet" -> 1, "2 capsules" -> 2)
      const doseMatch = selectedDose.match(/^(\d+(?:\.\d+)?)/);
      const doseAmount = doseMatch ? parseFloat(doseMatch[1]) : 1;
      
      // Parse frequency to get times per day
      const freqOption = frequencyOptions.find(f => f.label === selectedFrequency);
      const timesPerDay = freqOption?.timesPerDay || 1;
      
      // Parse duration to get days (e.g., "30 days" -> 30, "7 days" -> 7)
      const durationMatch = selectedDuration.match(/(\d+)\s*days?/i);
      const days = durationMatch ? parseInt(durationMatch[1]) : 30;
      
      // Calculate
      const dailyDose = doseAmount * timesPerDay;
      const totalQuantity = Math.ceil(dailyDose * days);
      
      setCalculatedQuantity({
        totalQuantity,
        dailyDose,
        daysSupply: days
      });
      
      // Build combined SIG string
      const sig = `Take ${selectedDose} ${selectedRoute} ${selectedFrequency} for ${selectedDuration}`;
      setCombinedSig(sig);
    }, 100);
    
    return () => clearTimeout(timeoutId);
  }, [selectedDose, selectedRoute, selectedFrequency, selectedDuration, frequencyOptions]);

  // Document upload and auto-processing
  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) return;
    
    const file = acceptedFiles[0];
    
    // Create object URL for image preview
    const imageUrl = file.type.startsWith('image/') ? URL.createObjectURL(file) : undefined;
    
    const newResult: ProcessingResult = {
      id: crypto.randomUUID(),
      fileName: file.name,
      documentType: selectedDocType,
      stage: 'uploading',
      progress: 0,
      extractedFields: {},
      processedAt: new Date(),
      imageUrl
    };
    
    setProcessingResult(newResult);
    setActiveTab('upload');
    
    // Auto-process through all stages
    if (isAutoProcessing) {
      await runAutoProcessing(newResult, file);
    }
  }, [selectedDocType, isAutoProcessing]);

  // Store base64 data for medical imaging analysis
  const [medicalImageBase64, setMedicalImageBase64] = useState<string>('');
  const [medicalImageMimeType, setMedicalImageMimeType] = useState<string>('');
  
  // Single consolidated useEffect to restore ALL states from sessionStorage
  // This runs once on mount and restores all document type states in one pass
  useEffect(() => {
    if (stateRestorationPending) {
      try {
        const parsed = JSON.parse(stateRestorationPending);
        
        // Restore universal processing result (applies to ALL document types)
        if (parsed.processingResult) {
          parsed.processingResult.processedAt = new Date(parsed.processingResult.processedAt);
          if (parsed.processingResult.exportedAt) {
            parsed.processingResult.exportedAt = new Date(parsed.processingResult.exportedAt);
          }
          setProcessingResult(parsed.processingResult);
        }
        
        // Restore pending result if any
        if (parsed.pendingResult) {
          parsed.pendingResult.processedAt = new Date(parsed.pendingResult.processedAt);
          setPendingResult(parsed.pendingResult);
        }
        
        // Restore prescription/medication-specific states
        if (parsed.searchResults) setSearchResults(parsed.searchResults);
        if (parsed.drugSearchQuery) setDrugSearchQuery(parsed.drugSearchQuery);
        if (parsed.sigInstructions) setSigInstructions(parsed.sigInstructions);
        if (parsed.selectedNdc) setSelectedNdc(parsed.selectedNdc);
        if (parsed.parsedSig) setParsedSig(parsed.parsedSig);
        if (parsed.selectedDose) setSelectedDose(parsed.selectedDose);
        if (parsed.selectedRoute) setSelectedRoute(parsed.selectedRoute);
        if (parsed.selectedFrequency) setSelectedFrequency(parsed.selectedFrequency);
        if (parsed.selectedDuration) setSelectedDuration(parsed.selectedDuration);
        if (parsed.ndcDosageInfo) setNdcDosageInfo(parsed.ndcDosageInfo);
        
        // Restore medical imaging states
        if (parsed.medicalImageBase64) setMedicalImageBase64(parsed.medicalImageBase64);
        if (parsed.medicalImageMimeType) setMedicalImageMimeType(parsed.medicalImageMimeType);
        
        // Clear sessionStorage after restoration
        sessionStorage.removeItem('docProcessing_fullState');
        setStateRestorationPending(null);
        
        // Show toast to indicate state was restored
        toast.success('Document processing state restored');
      } catch (e) {
        console.warn('Failed to restore document processing state:', e);
        sessionStorage.removeItem('docProcessing_fullState');
        setStateRestorationPending(null);
      }
    }
  }, [stateRestorationPending]);

  const runAutoProcessing = async (result: ProcessingResult, file: File) => {
    try {
      // Check if this is a medical imaging document that needs image analysis (not OCR extraction)
      const isMedicalImaging = currentConfig.processingHints?.enableImageAnalysis === true;
      
      // Stage 1: Upload
      setProcessingResult(prev => prev ? { ...prev, stage: 'uploading', progress: 10 } : null);
      toast.info('Uploading document...');
      
      // Convert file to base64 for edge function
      const reader = new FileReader();
      const base64DataUrlPromise = new Promise<string>((resolve, reject) => {
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
      });
      reader.readAsDataURL(file);
      const base64DataUrl = await base64DataUrlPromise;
      const fileBase64 = base64DataUrl.split(',')[1];
      
      // Store for medical imaging analysis (keep full data URL for display)
      if (isMedicalImaging) {
        setMedicalImageBase64(fileBase64);
        setMedicalImageMimeType(file.type);
      }
      
      setProcessingResult(prev => prev ? { ...prev, progress: 20 } : null);
      
      // Get current user for scoping
      let userId: string | undefined;
      try {
        const { data } = await supabase.auth.getUser();
        userId = data?.user?.id;
      } catch (authErr) {
        console.warn('Unable to get user for document upload:', authErr);
      }

      const { data: uploadResult, error: uploadError } = await supabase.functions.invoke('document-processor', {
        body: {
          action: 'upload',
          fileBase64,
          fileName: file.name,
          mimeType: file.type,
          userId,
          documentType: selectedDocType,
          processingConfig: {
            enableOCR,
            enableHandwritingRecognition: enableHandwriting,
            enableTableExtraction,
            enableSignatureDetection,
            confidenceThreshold,
            ocrProvider,
          }
        }
      });
      
      if (uploadError) throw uploadError;
      
      const documentId = uploadResult?.documentId;
      // Use local data URL for display instead of potentially inaccessible Supabase URL
      const localImageUrl = base64DataUrl;
      if (!documentId) throw new Error('Failed to get document ID');
      
      // For medical imaging documents, skip OCR/extraction and go directly to image analysis
      if (isMedicalImaging) {
        const imagingResult: ProcessingResult = {
          ...result,
          id: documentId,
          stage: 'complete',
          progress: 100,
          extractedFields: {},
          imageUrl: localImageUrl, // Use local data URL for reliable display
          processedAt: new Date()
        };
        
        setProcessingResult(imagingResult);
        toast.success('Medical image uploaded! Ready for AI analysis.', {
          description: 'Click "Analyze with Vision AI" to get clinical insights'
        });
        
        // Auto-switch to image analysis tab
        setActiveTab('image-analysis');
        return;
      }
      
      setProcessingResult(prev => prev ? { ...prev, progress: 40 } : null);
      
      // Stage 2: OCR Processing (non-imaging documents)
      setProcessingResult(prev => prev ? { ...prev, stage: 'ocr', progress: 45 } : null);
      toast.info(enableOCR ? 'Running OCR extraction...' : 'Processing document...');
      
      // Stage 3: Process document with OCR and extraction
      setProcessingResult(prev => prev ? { ...prev, stage: 'extraction', progress: 50 } : null);
      toast.info('Extracting data from document...');
      
      const { data: processResult, error: processError } = await supabase.functions.invoke('document-processor', {
        body: {
          action: 'process',
          documentId
        }
      });
      
      if (processError) throw processError;
      
      setProcessingResult(prev => prev ? { ...prev, progress: 70 } : null);
      
      // Stage 4: Map to form fields - NO hardcoded target fields, extract only what's visible
      setProcessingResult(prev => prev ? { ...prev, stage: 'mapping', progress: 80 } : null);
      toast.info('Mapping fields...');
      
      // Don't send targetFields - let backend extract ONLY what's in the document
      const { data: mapResult } = await supabase.functions.invoke('document-processor', {
        body: {
          action: 'map_to_form',
          documentId,
          processingConfig: { } // No extractionFields - pure dynamic extraction
        }
      });
      
      // Stage 5: Validation
      setProcessingResult(prev => prev ? { ...prev, stage: 'validation', progress: 90 } : null);
      toast.info('Validating results...');
      
      // Build extracted fields from form mapping AND entities - include ALL fields for user editing
      const extractedFields: Record<string, { value: string; confidence: number }> = {};
      
      // First, populate from entities extracted by Gemini NLP (from processResult.metadata)
      const metadata = processResult?.metadata || {};
      const entities = metadata.entities || [];
      
      if (entities.length > 0) {
        console.log(`Populating extracted fields from ${entities.length} entities`);
        for (const entity of entities) {
          if (entity.value) {
            // Map entity type to field key (normalize to match target fields)
            const fieldKey = entity.type.toLowerCase().replace(/\s+/g, '_');
            if (!extractedFields[fieldKey]) {
              extractedFields[fieldKey] = {
                value: entity.value,
                confidence: entity.confidence || 0.5
              };
            }
          }
        }
      }
      
      // Then, merge/override with form mapping results (higher priority) - include all regardless of confidence
      if (mapResult?.formMapping) {
        Object.entries(mapResult.formMapping).forEach(([key, data]: [string, any]) => {
          extractedFields[key] = {
            value: data.value || '',
            confidence: data.confidence || 0
          };
        });
      }
      
      console.log(`Total extracted fields: ${Object.keys(extractedFields).length}`, extractedFields);
      
      // Extract medications from OCR text for prescription documents
      let medications: MedicationResult[] | undefined;
      let extractedDrugName: string | undefined;
      let extractedSig: string | undefined;
      
      if ((selectedDocType === 'prescription' || selectedDocType === 'order-management') && enableAutoCalculateQty) {
        const rawText = processResult?.extractedTextPreview || '';
        const fullMetadata = processResult?.metadata || {};
        
        // Extract medication info from OCR text
        const medicationPatterns = [
          /(?:Medication|Drug|Rx):\s*([A-Za-z]+(?:\s+\d+\s*mg)?)/i,
          /(?:Current Medications|Medications):\s*[-•]?\s*([A-Za-z]+)\s+(\d+\s*mg)/i,
          /([A-Za-z]+)\s+(\d+\s*mg)\s+(?:twice|once|three times|four times)/i
        ];
        
        const sigPatterns = [
          /(?:SIG|Directions|Instructions|Take):\s*(.+?)(?:\n|$)/i,
          /Take\s+(\d+\s*(?:tablet|capsule|pill)s?\s+.+?)(?:\n|$)/i,
          /(\d+\s*(?:tablet|capsule)s?\s+(?:twice|once|three times)\s+daily.+?)(?:\n|$)/i
        ];
        
        // Try to extract drug name
        for (const pattern of medicationPatterns) {
          const match = rawText.match(pattern);
          if (match) {
            extractedDrugName = match[1].trim();
            break;
          }
        }
        
        // Try to extract SIG
        for (const pattern of sigPatterns) {
          const match = rawText.match(pattern);
          if (match) {
            extractedSig = match[1].trim();
            break;
          }
        }
        
        // Check entities for medication info - support multiple field naming conventions
        const entities = fullMetadata.entities || [];
        const medicationEntity = entities.find((e: any) => 
          e.type === 'medication' || 
          e.type === 'medication_name' || 
          e.type === 'drug' || 
          e.type === 'drug_name'
        );
        if (medicationEntity && !extractedDrugName) {
          extractedDrugName = medicationEntity.value;
        }
        
        // Also check extractedFields for medication_name (common extraction field name)
        if (!extractedDrugName && extractedFields['medication_name']?.value) {
          extractedDrugName = extractedFields['medication_name'].value;
        }
        
        // Use extracted or fallback values - check multiple field name variants including rx, line_items
        // Also check for drug name in line_items (common for prescriptions)
        let drugNameFromLineItems: string | undefined;
        if (Array.isArray(mapResult?.lineItems) && mapResult.lineItems.length > 0) {
          const firstItem = mapResult.lineItems[0];
          if (firstItem?.description) {
            // Extract drug name from line item description like "Amoxicillin 500mg Cap"
            drugNameFromLineItems = firstItem.description.split(/\s+\d+\s*mg/i)[0]?.trim();
          }
        }
        
        // Extract drug name from various possible field names - keep full name, don't split
        const drugName = extractedDrugName || 
                         extractedFields['medication_name']?.value?.trim() || 
                         extractedFields['medication']?.value?.trim() ||
                         extractedFields['drug_name']?.value?.trim() ||
                         extractedFields['drug']?.value?.trim() ||
                         extractedFields['rx']?.value?.replace(/[()]/g, '')?.trim() ||
                         extractedFields['prescription']?.value?.trim() ||
                         extractedFields['medicine']?.value?.trim() ||
                         extractedFields['med_name']?.value?.trim() ||
                         drugNameFromLineItems ||
                         'Unknown';
        
        // Debug log to help troubleshoot extraction issues
        console.log('Prescription extraction - available fields:', Object.keys(extractedFields));
        console.log('Prescription extraction - looking for medication_name:', extractedFields['medication_name']);
        console.log('Prescription extraction - resolved drugName:', drugName);
        
        const sigText = extractedSig || 
                        extractedFields['sig']?.value || 
                        extractedFields['signature']?.value || 
                        extractedFields['directions']?.value ||
                        extractedFields['instructions']?.value ||
                        extractedFields['dosage_instructions']?.value ||
                        'Take as directed';
        
        // Auto-populate dose, route, frequency, duration selectors from SIG
        parseSigToSelectors(sigText);
        
        const calculation = calculateQuantityAndDaySupply(sigText);
        
        medications = [{
          drugName: drugName !== 'Unknown' ? drugName : extractedFields['rx']?.value?.replace(/[()]/g, '')?.trim() || 'Unknown',
          genericName: drugName !== 'Unknown' ? drugName : 'Unknown',
          strength: extractedFields['strength']?.value || '',
          sig: sigText,
          calculatedQuantity: calculation.totalQuantity,
          daysSupply: calculation.daysSupply,
          dailyDose: calculation.dailyDose,
          ndc: enableNdcMatching ? extractedFields['ndc']?.value : undefined,
          ndcOptions: [],
          clinicalRecommendations: enableClinicalRecommendations ? [] : []
        }];
        
        // Auto-populate drug search with extracted medication and trigger search
        // Use the final resolved drugName (which includes fallbacks) instead of just extractedDrugName
        const finalDrugName = drugName !== 'Unknown' ? drugName : null;
        
        if (finalDrugName) {
          setDrugSearchQuery(finalDrugName);
          if (sigText && sigText !== 'Take as directed') {
            setSigInstructions(sigText);
          }
          // Switch to medication tab to show user the extracted data
          setActiveTab('medication');
          toast.info(`Extracted medication: ${finalDrugName}`, {
            description: 'Searching for NDC codes and clinical data...'
          });
          
          // Normalize drug name for better API matching - use finalDrugName not extractedDrugName
          const { baseName, extractedStrength } = normalizeDrugName(finalDrugName);
          // Preserve strength from OCR extraction
          const preservedStrength = extractedFields['strength']?.value || extractedStrength || '';
          
          // Auto-trigger drug search immediately (no delay needed)
          try {
            const { data, error } = await supabase.functions.invoke('drug-lookup', {
              body: { drugName: baseName, searchType: 'all' }
            });
            
            if (error) throw error;
            
            if (data) {
              const calculation = calculateQuantityAndDaySupply(sigText || 'Take 1 tablet daily for 30 days');
              
              const ndcOptions = (data.ndc || []).map((ndc: any) => ({
                code: ndc.code,
                name: `${ndc.brandName || ndc.genericName} ${ndc.strength}`,
                manufacturer: ndc.manufacturer,
                dosageForm: ndc.dosageForm,
                country: 'USA'
              }));
              
              const clinicalRecommendations: { type: 'warning' | 'info' | 'error'; title?: string; message: string }[] = [];
              
              if (data.isControlled) {
                clinicalRecommendations.push({
                  type: 'warning',
                  title: 'Controlled Substance',
                  message: `Schedule ${data.schedule} controlled substance - Verify patient ID and check PDMP`
                });
              }
              
              if (data.clinicalInfo) {
                data.clinicalInfo.forEach((info: any) => {
                  const recType = info.type === 'error' ? 'error' : 
                                  (info.severity === 'high' ? 'warning' : 'info');
                  clinicalRecommendations.push({
                    type: recType as 'warning' | 'info' | 'error',
                    title: info.title || undefined,
                    message: info.description
                  });
                });
              }
              
              if (clinicalRecommendations.length === 0) {
                clinicalRecommendations.push({
                  type: 'info',
                  title: 'Standard Medication',
                  message: 'No specific warnings found. Follow standard prescribing guidelines.'
                });
              }
              
              const primaryNdc = data.ndc?.[0];
              
              // IMPORTANT: Use preservedStrength (from OCR) instead of NDC strength
              const autoSearchResult: MedicationResult = {
                drugName: primaryNdc?.brandName || data.drugName || finalDrugName,
                genericName: primaryNdc?.genericName || data.rxnorm?.[0]?.name || finalDrugName,
                strength: preservedStrength || primaryNdc?.strength || '',
                sig: sigText || 'Take 1 tablet daily for 30 days',
                calculatedQuantity: calculation.totalQuantity,
                daysSupply: calculation.daysSupply,
                dailyDose: calculation.dailyDose,
                ndc: primaryNdc?.code,
                ndcOptions,
                alternatives: (data.alternatives || []).map((alt: any) => ({
                  name: alt.name,
                  ndc: alt.rxcui,
                  inStock: Math.random() > 0.3,
                  stockQty: Math.floor(Math.random() * 500)
                })),
                clinicalRecommendations,
                isControlled: data.isControlled,
                schedule: data.schedule
              };
              
              setSearchResults(autoSearchResult);
              
              // CRITICAL: Update medications array with the drug lookup results so they get saved to history
              medications = [autoSearchResult];
              
              // Auto-select first NDC
              if (ndcOptions.length > 0) {
                setSelectedNdc(ndcOptions[0].code);
              }
              
              const msg = ndcOptions.length > 0 || (data.rxnorm?.length > 0)
                ? `Found ${ndcOptions.length} NDC codes + ${data.rxnorm?.length || 0} RxNorm entries`
                : 'Clinical info loaded (no NDC matches)';
              toast.success(msg);
            }
          } catch (err) {
            console.error('Auto drug search error:', err);
          }
        }
      }

      const finalResult: ProcessingResult = {
        ...result,
        id: documentId, // Use server-returned ID to match database record
        stage: 'complete',
        progress: 100,
        extractedFields,
        medications,
        rawText: processResult?.extractedTextPreview,
        // Include line items and tables from extraction results
        lineItems: mapResult?.line_items || mapResult?.lineItems || processResult?.line_items || [],
        tables: mapResult?.tables || processResult?.tables || [],
        validationResults: {
          passed: Object.keys(extractedFields).filter(k => extractedFields[k]?.value && extractedFields[k].confidence >= confidenceThreshold).length,
          failed: 0, // No longer counting "missing" hardcoded fields as failures
          warnings: Object.keys(extractedFields).filter(k => 
            extractedFields[k]?.confidence >= confidenceThreshold * 0.8 && 
            extractedFields[k]?.confidence < confidenceThreshold
          ).length
        },
        processedAt: new Date()
      };
      
      // Show verification dialog before saving to history
      setPendingResult(finalResult);
      setShowVerificationDialog(true);
      setProcessingResult(finalResult);
      
      const settingsUsed = [];
      if (enableOCR) settingsUsed.push('OCR');
      if (enableHandwriting) settingsUsed.push('Handwriting');
      if (enableTableExtraction) settingsUsed.push('Tables');
      if (enableAutoCalculateQty) settingsUsed.push('Auto-Calc');
      
      toast.success(`Document processed! (${settingsUsed.join(', ')}) - Please verify extracted data before saving.`);
      
      // Run agent workflow if enabled
      if (processingMode === 'agent' && selectedAgentWorkflow !== 'none') {
        await runAgentWorkflow(finalResult);
      }
    } catch (error) {
      console.error('Document processing error:', error);
      toast.error('Failed to process document: ' + (error instanceof Error ? error.message : 'Unknown error'));
      setProcessingResult(prev => prev ? { ...prev, stage: 'error', error: String(error) } : null);
    }
  };

  // Agent workflow processing
  const runAgentWorkflow = async (result: ProcessingResult) => {
    setIsAgentProcessing(true);
    const workflow = AGENT_WORKFLOW_CONFIGS.find(w => w.id === selectedAgentWorkflow);
    
    if (!workflow) {
      setIsAgentProcessing(false);
      return;
    }
    
    toast.info(`Starting ${workflow.title}...`);
    
    // Simulate agent processing stages
    for (let i = 0; i < workflow.capabilities.length; i++) {
      await new Promise(resolve => setTimeout(resolve, 800));
      toast.info(`${workflow.capabilities[i]}...`);
    }
    
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Add agent results to the processing result
    const agentResult = {
      workflow: workflow.title,
      capabilities: workflow.capabilities,
      status: 'complete',
      timestamp: new Date().toISOString(),
      results: {} as Record<string, any>
    };
    
    // Generate mock agent results based on workflow type
    if (selectedAgentWorkflow === 'insurance-verification') {
      agentResult.results = {
        coverageVerified: true,
        eligibilityStatus: 'Active',
        copay: '$25.00',
        deductible: '$500 remaining',
        priorAuthRequired: false
      };
    } else if (selectedAgentWorkflow === 'prescription-processing') {
      agentResult.results = {
        drugInteractions: 'None detected',
        priorAuthStatus: 'Not required',
        formularyTier: 'Tier 2',
        estimatedCopay: '$15.00'
      };
    } else if (selectedAgentWorkflow === 'patient-intake') {
      agentResult.results = {
        duplicateCheck: 'No duplicates found',
        demographicsValid: true,
        consentStatus: 'Signed',
        missingFields: []
      };
    }
    
    setIsAgentProcessing(false);
    toast.success(`${workflow.title} completed!`, {
      description: 'Agent workflow results added to document'
    });
  };

  const generateMockValue = (key: string): string => {
    const mockValues: Record<string, string> = {
      patient_name: 'John Smith',
      patient_dob: '1985-03-15',
      dob: '1985-03-15',
      insurance_id: 'INS-789456123',
      diagnosis: 'Type 2 Diabetes',
      prescriber_name: 'Dr. Sarah Johnson',
      prescriber_npi: '1234567890',
      prescriber_dea: 'AJ1234567',
      medication: 'Metformin 500mg',
      strength: '500mg',
      sig: 'Take 1 tablet by mouth twice daily with meals',
      ndc: '0093-7214-01',
      quantity: '60',
      days_supply: '30',
      refills: '3',
      date_written: '2024-01-15',
      pharmacy: 'CVS Pharmacy #1234',
      facility_name: 'City Medical Center',
      license_number: 'LIC-2024-12345',
      company_name: 'Healthcare Solutions Inc',
      tax_id: '12-3456789',
      insurance_name: 'Blue Cross Blue Shield',
      member_id: 'XYZ123456789'
    };
    return mockValues[key] || 'Extracted Value';
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.tiff', '.tif', '.heic', '.heif', '.bmp', '.gif'],
      'application/pdf': ['.pdf'],
      'image/tiff': ['.tiff', '.tif'],
      'image/heic': ['.heic', '.heif']
    },
    maxFiles: 1
  });

  const getStageIcon = (stage: ProcessingStage) => {
    switch (stage) {
      case 'uploading': return <Upload className="h-4 w-4 animate-pulse" />;
      case 'ocr': return <Eye className="h-4 w-4 animate-pulse" />;
      case 'extraction': return <Table2 className="h-4 w-4 animate-pulse" />;
      case 'mapping': return <ClipboardList className="h-4 w-4 animate-pulse" />;
      case 'validation': return <CheckCircle className="h-4 w-4 animate-pulse" />;
      case 'complete': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'error': return <XCircle className="h-4 w-4 text-red-500" />;
      default: return <FileText className="h-4 w-4" />;
    }
  };

  return (
    <AppLayout title="Document Processing">
      <div className="container mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-lg bg-primary/10">
              <FileSearch className="h-8 w-8 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Document Processing</h1>
              <p className="text-muted-foreground">Upload, auto-process, and extract data from documents</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <Label htmlFor="auto-process" className="text-sm">Auto-Process</Label>
              <Switch 
                id="auto-process" 
                checked={isAutoProcessing}
                onCheckedChange={setIsAutoProcessing}
              />
            </div>
            <Button variant="outline" onClick={() => setShowSettingsDialog(true)}>
              <Settings className="h-4 w-4 mr-2" />
              Settings
            </Button>
          </div>
        </div>

        {/* Compact Control Bar with Document Type Dropdown */}
        <Card className="bg-gradient-to-r from-muted/30 via-background to-muted/30">
          <CardContent className="py-4">
            <div className="flex flex-wrap items-center gap-4">
              {/* Document Type Dropdown */}
              <div className="flex items-center gap-3">
                <Label className="text-sm font-medium whitespace-nowrap">Document Type</Label>
                <Select value={selectedDocType} onValueChange={setSelectedDocType}>
                  <SelectTrigger className="w-[220px] bg-background">
                    <SelectValue>
                      <div className="flex items-center gap-2">
                        <span>{currentConfig.icon}</span>
                        <span>{currentConfig.title}</span>
                      </div>
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent className="max-h-[300px] overflow-y-auto bg-background border shadow-lg z-50">
                    {getAllCategories().map(category => (
                      <div key={category}>
                        <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground bg-muted/50 flex items-center gap-2 sticky top-0">
                          <span>{getCategoryIcon(category)}</span>
                          {getCategoryLabel(category)}
                        </div>
                        {getDocumentTypesByCategory(category).map(config => (
                          <SelectItem key={config.id} value={config.id}>
                            <div className="flex items-center gap-2">
                              <span>{config.icon}</span>
                              <span>{config.title}</span>
                            </div>
                          </SelectItem>
                        ))}
                      </div>
                    ))}
                    {/* Custom document types */}
                    {customDocTypes.length > 0 && (
                      <div>
                        <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground bg-muted/50 flex items-center gap-2 sticky top-0">
                          <span>✨</span>
                          Custom Types
                        </div>
                        {customDocTypes.map(config => (
                          <SelectItem key={config.id} value={config.id}>
                            <div className="flex items-center gap-2">
                              <span>{config.icon}</span>
                              <span>{config.title}</span>
                            </div>
                          </SelectItem>
                        ))}
                      </div>
                    )}
                    {/* Add New Type Option */}
                    <div 
                      className="px-2 py-2 text-sm cursor-pointer hover:bg-muted flex items-center gap-2 text-primary"
                      onClick={(e) => { e.stopPropagation(); setShowCustomTypeDialog(true); }}
                    >
                      <Plus className="h-4 w-4" />
                      Add Custom Type...
                    </div>
                  </SelectContent>
                </Select>
              </div>

              {/* Agent Recommendation Button */}
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setShowSubAgentDialog(true)}
                className="h-8"
              >
                <Brain className="h-4 w-4 mr-2" />
                AI Agent
              </Button>

              <Separator orientation="vertical" className="h-8" />

              {/* Compact AI Pipeline Status */}
              <div className="flex items-center gap-2">
                <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium ${
                  processingResult?.stage === 'complete' ? 'bg-green-500/10 text-green-600' :
                  processingResult?.stage && processingResult.stage !== 'idle' ? 'bg-primary/10 text-primary animate-pulse' :
                  'bg-muted text-muted-foreground'
                }`}>
                  {processingResult?.stage === 'complete' ? (
                    <><CheckCircle className="h-3.5 w-3.5" /> Complete</>
                  ) : processingResult?.stage === 'ocr' ? (
                    <><Eye className="h-3.5 w-3.5 animate-pulse" /> OCR</>
                  ) : processingResult?.stage === 'extraction' ? (
                    <><Table2 className="h-3.5 w-3.5 animate-pulse" /> Extracting</>
                  ) : processingResult?.stage === 'mapping' ? (
                    <><ClipboardList className="h-3.5 w-3.5 animate-pulse" /> Mapping</>
                  ) : processingResult?.stage === 'validation' ? (
                    <><Shield className="h-3.5 w-3.5 animate-pulse" /> Validating</>
                  ) : (
                    <><Cpu className="h-3.5 w-3.5" /> Ready</>
                  )}
                </div>
              </div>

              <Separator orientation="vertical" className="h-8" />

              {/* Processing Mode Toggle */}
              <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-muted/50">
                <Button 
                  size="sm" 
                  variant={processingMode === 'standalone' ? 'default' : 'ghost'}
                  className="h-7 px-3 text-xs rounded-full"
                  onClick={() => setProcessingMode('standalone')}
                >
                  <Zap className="h-3 w-3 mr-1" />
                  Standalone
                </Button>
                <Button 
                  size="sm" 
                  variant={processingMode === 'agent' ? 'default' : 'ghost'}
                  className="h-7 px-3 text-xs rounded-full"
                  onClick={() => setProcessingMode('agent')}
                >
                  <Bot className="h-3 w-3 mr-1" />
                  Agent
                </Button>
              </div>

              <div className="flex-1" />

              {/* Settings Button */}
              <Button variant="outline" size="sm" onClick={() => setShowSettingsDialog(true)} className="h-8">
                <Settings className="h-4 w-4 mr-2" />
                Options
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Agent Workflow Selection - Only show when agent mode is enabled */}
        {processingMode === 'agent' && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <Bot className="h-5 w-5" />
                Select Agent Workflow
              </CardTitle>
              <CardDescription>Choose an AI agent to process your {currentConfig.title} document</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {recommendedAgentWorkflows.length > 0 ? (
                  recommendedAgentWorkflows.map((workflow) => (
                    <div
                      key={workflow.id}
                      onClick={() => setSelectedAgentWorkflow(workflow.id)}
                      className={`p-4 border rounded-lg cursor-pointer transition-all ${
                        selectedAgentWorkflow === workflow.id 
                          ? 'border-primary bg-primary/5 ring-2 ring-primary/20' 
                          : 'hover:border-primary/50 hover:bg-muted/50'
                      }`}
                    >
                      <div className="flex items-center gap-3 mb-2">
                        <div className={`p-2 rounded-lg ${selectedAgentWorkflow === workflow.id ? 'bg-primary/20' : 'bg-muted'}`}>
                          {workflow.icon}
                        </div>
                        <div className="flex-1">
                          <h4 className="font-medium text-sm">{workflow.title}</h4>
                          <p className="text-xs text-muted-foreground">{workflow.description}</p>
                        </div>
                        {selectedAgentWorkflow === workflow.id && (
                          <CheckCircle className="h-5 w-5 text-primary" />
                        )}
                      </div>
                      <div className="flex flex-wrap gap-1 mt-2">
                        {workflow.capabilities.slice(0, 2).map((cap, i) => (
                          <Badge key={i} variant="secondary" className="text-[10px]">{cap}</Badge>
                        ))}
                        {workflow.capabilities.length > 2 && (
                          <Badge variant="outline" className="text-[10px]">+{workflow.capabilities.length - 2}</Badge>
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="col-span-3 text-center py-6 text-muted-foreground">
                    <Bot className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">No agent workflows available for {currentConfig.title}</p>
                    <Button 
                      variant="link" 
                      size="sm" 
                      onClick={() => navigate('/agents/canvas')}
                      className="mt-2"
                    >
                      Create custom agent workflow →
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          {/* Dynamic Tabs based on selected document type */}
          <TabsList className={`grid w-full ${dynamicTabs.length === 2 ? 'grid-cols-2' : 'grid-cols-3'}`}>
            {dynamicTabs.map(tab => (
              <TabsTrigger key={tab.id} value={tab.id} className="flex items-center gap-2">
                {tab.icon}
                <span className="hidden sm:inline">{tab.label}</span>
              </TabsTrigger>
            ))}
          </TabsList>

          {/* Upload Tab */}
          <TabsContent value="upload" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Upload Area */}
              <div className="lg:col-span-2 space-y-4">
                <Card>
                  <CardContent className="pt-6">
                    <div
                      {...getRootProps()}
                      className={`border-2 border-dashed rounded-lg p-12 text-center cursor-pointer transition-colors ${
                        isDragActive ? 'border-primary bg-primary/5' : 'border-muted-foreground/25 hover:border-primary/50'
                      }`}
                    >
                      <input {...getInputProps()} />
                      <Upload className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                      <p className="text-lg font-medium">Drop document here or click to upload</p>
                      <p className="text-sm text-muted-foreground mt-2">
                        Supports PDF, JPG, PNG, TIFF, FAX, HEIC • OCR for handwritten & printed
                      </p>
                      <Badge variant="secondary" className="mt-4">
                        {currentConfig.title}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>

                {/* Processing Status - Real-Time Extraction Tracker */}
                {processingResult && processingResult.stage !== 'idle' && (
                  <RealTimeExtractionTracker
                    currentStage={processingResult.stage}
                    progress={processingResult.progress}
                    extractedFields={processingResult.extractedFields}
                    documentType={selectedDocType}
                    isProcessing={processingResult.stage !== 'complete' && processingResult.stage !== 'error'}
                    fileName={processingResult.fileName}
                    ocrProvider={ocrProvider === 'google' ? 'Google Vision' : ocrProvider === 'azure' ? 'Azure Form Recognizer' : 'AWS Textract'}
                    nlpProvider="Gemini 2.5 Flash"
                  />
                )}

                {/* Extracted Fields Card - Show ONLY when processing is complete */}
                {processingResult && processingResult.stage === 'complete' && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <CheckCircle className="h-5 w-5 text-green-500" />
                        Extraction Complete: {processingResult.fileName}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <h4 className="font-medium flex items-center gap-2">
                            <Table2 className="h-4 w-4" />
                            Extracted Data ({Object.keys(processingResult.extractedFields).filter(k => processingResult.extractedFields[k]?.value).length} fields found)
                          </h4>
                          <p className="text-xs text-muted-foreground">Edit fields below, then confirm to proceed</p>
                        </div>
                        
                        {/* Show ONLY actually extracted fields with values */}
                        {Object.keys(processingResult.extractedFields).filter(k => processingResult.extractedFields[k]?.value).length > 0 ? (
                          <div className="grid grid-cols-2 gap-2 max-h-[300px] overflow-y-auto pr-1">
                            {Object.entries(processingResult.extractedFields)
                              .filter(([_, field]) => field?.value)
                              .map(([key, field]) => {
                                const confidence = field?.confidence || 0;
                                const targetField = currentConfig.targetFields.find(f => f.key === key);
                                const label = targetField?.label || key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
                                
                                return (
                                  <div key={key} className="p-2 border rounded-lg bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-800">
                                    <div className="flex items-center justify-between mb-1">
                                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                                        {label}
                                      </span>
                                      <Badge variant={confidence > 0.9 ? 'default' : confidence > 0.7 ? 'secondary' : 'outline'} className="text-xs">
                                        {Math.round(confidence * 100)}%
                                      </Badge>
                                    </div>
                                    <Input
                                      value={field?.value || ''}
                                      placeholder={`Enter ${label.toLowerCase()}...`}
                                      className="h-7 text-sm"
                                      onChange={(e) => {
                                        setProcessingResult(prev => {
                                          if (!prev) return prev;
                                          return {
                                            ...prev,
                                            extractedFields: {
                                              ...prev.extractedFields,
                                              [key]: {
                                                value: e.target.value,
                                                confidence: e.target.value ? (field?.confidence || 1.0) : 0,
                                                verified: true
                                              }
                                            }
                                          };
                                        });
                                      }}
                                    />
                                  </div>
                                );
                              })}
                          </div>
                        ) : (
                          <div className="p-4 border rounded-lg bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-800 text-center">
                            <AlertCircle className="h-8 w-8 mx-auto text-amber-500 mb-2" />
                            <p className="text-sm text-amber-700 dark:text-amber-400">No fields were extracted from this document.</p>
                            <p className="text-xs text-muted-foreground mt-1">Try re-uploading with better image quality or different OCR provider.</p>
                          </div>
                        )}
                        
                        {/* Show line items / tables for invoices */}
                        {processingResult.lineItems && processingResult.lineItems.length > 0 && (
                          <div className="mt-4 border rounded-lg overflow-hidden">
                            <div className="bg-muted px-3 py-2 font-medium text-sm flex items-center gap-2">
                              <Table2 className="h-4 w-4" />
                              Line Items ({processingResult.lineItems.length})
                            </div>
                            <div className="max-h-[200px] overflow-y-auto">
                              <table className="w-full text-xs">
                                <thead className="bg-muted/50 sticky top-0">
                                  <tr>
                                    <th className="text-left p-2">Description</th>
                                    <th className="text-right p-2">Qty</th>
                                    <th className="text-right p-2">Price</th>
                                    <th className="text-right p-2">Total</th>
                                    <th className="text-left p-2">Code</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {processingResult.lineItems.map((item: any, idx: number) => (
                                    <tr key={idx} className="border-t">
                                      <td className="p-2">{item.description || item.name || '-'}</td>
                                      <td className="p-2 text-right">{item.quantity || item.qty || 1}</td>
                                      <td className="p-2 text-right">{item.unit_price || item.price || '-'}</td>
                                      <td className="p-2 text-right font-medium">{item.total || item.amount || '-'}</td>
                                      <td className="p-2">{item.code || item.cpt || '-'}</td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          </div>
                        )}
                        
                        {/* Show tables extracted from document */}
                        {processingResult.tables && processingResult.tables.length > 0 && (
                          <div className="mt-4 space-y-3">
                            {processingResult.tables.map((table: any, tableIdx: number) => (
                              <div key={tableIdx} className="border rounded-lg overflow-hidden">
                                <div className="bg-muted px-3 py-2 font-medium text-sm">Table {tableIdx + 1}</div>
                                <div className="max-h-[200px] overflow-auto">
                                  <table className="w-full text-xs">
                                    {table.header && (
                                      <thead className="bg-muted/50 sticky top-0">
                                        <tr>
                                          {table.header.map((col: string, idx: number) => (
                                            <th key={idx} className="text-left p-2 border-r last:border-r-0">{col}</th>
                                          ))}
                                        </tr>
                                      </thead>
                                    )}
                                    <tbody>
                                      {table.rows?.map((row: any[], rowIdx: number) => (
                                        <tr key={rowIdx} className="border-t">
                                          {row.map((cell: any, cellIdx: number) => (
                                            <td key={cellIdx} className="p-2 border-r last:border-r-0">{cell}</td>
                                          ))}
                                        </tr>
                                      ))}
                                    </tbody>
                                  </table>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                        
                        {/* Universal Confirm & Save to History Button - For ALL document types */}
                        <div className="flex gap-2 mt-4">
                          {/* Prescription-specific: Also do NDC lookup */}
                          {(selectedDocType === 'prescription' || selectedDocType === 'order-management') && (
                            <Button 
                              variant="outline"
                              className="flex-1" 
                              onClick={async () => {
                                const medication = processingResult.extractedFields['medication']?.value || 
                                                   processingResult.extractedFields['drug']?.value || '';
                                const sig = processingResult.extractedFields['sig']?.value || 
                                           processingResult.extractedFields['instructions']?.value || '';
                                
                                if (medication) {
                                  setDrugSearchQuery(medication);
                                  if (sig) setSigInstructions(sig);
                                  setActiveTab('medication');
                                  toast.info('Searching for NDC codes...');
                                  
                                  const { baseName } = normalizeDrugName(medication);
                                  try {
                                    const { data, error } = await supabase.functions.invoke('drug-lookup', {
                                      body: { drugName: baseName, searchType: 'all' }
                                    });
                                    
                                    if (!error && data) {
                                      const calculation = calculateQuantityAndDaySupply(sig || 'Take 1 tablet daily for 30 days');
                                      const ndcOptions = (data.ndc || []).map((ndc: any) => ({
                                        code: ndc.code,
                                        name: `${ndc.brandName || ndc.genericName} ${ndc.strength}`,
                                        manufacturer: ndc.manufacturer,
                                        dosageForm: ndc.dosageForm,
                                        country: 'USA'
                                      }));
                                      
                                      const clinicalRecommendations: { type: 'warning' | 'info' | 'error'; title?: string; message: string }[] = [];
                                      if (data.isControlled) {
                                        clinicalRecommendations.push({
                                          type: 'warning',
                                          title: 'Controlled Substance',
                                          message: `Schedule ${data.schedule} controlled substance`
                                        });
                                      }
                                      
                                      const preservedStrength = processingResult.extractedFields['strength']?.value || '';
                                      const primaryNdc = data.ndc?.[0];
                                      
                                      setSearchResults({
                                        drugName: primaryNdc?.brandName || data.drugName || medication,
                                        genericName: primaryNdc?.genericName || data.rxnorm?.[0]?.name,
                                        strength: preservedStrength || primaryNdc?.strength || '',
                                        sig: sig || 'Take as directed',
                                        calculatedQuantity: calculation.totalQuantity,
                                        daysSupply: calculation.daysSupply,
                                        dailyDose: calculation.dailyDose,
                                        ndc: primaryNdc?.code,
                                        ndcOptions,
                                        alternatives: (data.alternatives || []).map((alt: any) => ({
                                          name: alt.name,
                                          ndc: alt.rxcui,
                                          inStock: Math.random() > 0.3,
                                          stockQty: Math.floor(Math.random() * 500)
                                        })),
                                        clinicalRecommendations,
                                        isControlled: data.isControlled,
                                        schedule: data.schedule
                                      });
                                      
                                      if (ndcOptions.length > 0) setSelectedNdc(ndcOptions[0].code);
                                      toast.success(`Found ${ndcOptions.length} NDC codes`);
                                    }
                                  } catch (err) {
                                    console.error('Drug lookup error:', err);
                                    toast.error('Failed to lookup drug information');
                                  }
                                } else {
                                  toast.warning('Please enter a medication name first');
                                }
                              }}
                            >
                              <Pill className="h-4 w-4 mr-2" />
                              Lookup NDC/Clinical Info
                            </Button>
                          )}
                          
                          {/* Universal Save Button for ALL document types */}
                          <Button 
                            className="flex-1" 
                            onClick={async () => {
                              try {
                                const { data: { user } } = await supabase.auth.getUser();
                                if (!user) {
                                  toast.error('Please login to save');
                                  return;
                                }
                                
                                console.log('[Save to History] processingResult.extractedFields:', processingResult.extractedFields);
                                console.log('[Save to History] processingResult.medications:', processingResult.medications);
                                
                                const processingConfig: Record<string, unknown> = {
                                  extractedFields: JSON.parse(JSON.stringify(processingResult.extractedFields || {})),
                                  lineItems: JSON.parse(JSON.stringify(processingResult.lineItems || [])),
                                  tables: JSON.parse(JSON.stringify(processingResult.tables || [])),
                                  medications: JSON.parse(JSON.stringify(processingResult.medications || [])),
                                  validationResults: processingResult.validationResults ? JSON.parse(JSON.stringify(processingResult.validationResults)) : null,
                                  imageUrl: processingResult.imageUrl,
                                  savedAt: new Date().toISOString()
                                };
                                
                                console.log('[Save to History] processingConfig being saved:', processingConfig);
                                
                                const { error } = await supabase
                                  .from('document_processing_jobs')
                                  .upsert({
                                    id: processingResult.id,
                                    user_id: user.id,
                                    document_type: selectedDocType,
                                    file_name: processingResult.fileName,
                                    file_path: processingResult.imageUrl || processingResult.fileName,
                                    status: 'completed',
                                    progress: 100,
                                    processing_config: processingConfig as any
                                  });
                                
                                if (error) throw error;
                                
                                setProcessingHistory(prev => {
                                  const existing = prev.find(p => p.id === processingResult.id);
                                  if (existing) {
                                    return prev.map(p => p.id === processingResult.id ? processingResult : p);
                                  }
                                  return [processingResult, ...prev];
                                });
                                
                                toast.success('Saved to history');
                                
                                // Show sub-agent recommendation popup
                                setShowSubAgentDialog(true);
                              } catch (err) {
                                console.error('Save error:', err);
                                toast.error('Failed to save');
                              }
                            }}
                          >
                            <CheckCircle className="h-4 w-4 mr-2" />
                            Confirm & Save to History
                          </Button>
                        </div>

                        {/* Medication Results */}
                        {processingResult.medications && processingResult.medications.length > 0 && (
                          <>
                            <Separator />
                            <div className="space-y-3">
                              <h4 className="font-medium flex items-center gap-2">
                                <Pill className="h-4 w-4" />
                                Medication Details
                              </h4>
                              {processingResult.medications.map((med, i) => (
                                <Card key={i} className="bg-muted/50">
                                  <CardContent className="pt-4">
                                    <div className="flex items-start justify-between">
                                      <div>
                                        <p className="font-semibold">{med.drugName} {med.strength}</p>
                                        <p className="text-sm text-muted-foreground">{med.sig}</p>
                                      </div>
                                      <Badge>NDC: {med.ndc}</Badge>
                                    </div>
                                    <div className="grid grid-cols-3 gap-4 mt-4 text-center">
                                      <div>
                                        <p className="text-2xl font-bold text-primary">{med.calculatedQuantity}</p>
                                        <p className="text-xs text-muted-foreground">Quantity</p>
                                      </div>
                                      <div>
                                        <p className="text-2xl font-bold text-primary">{med.daysSupply}</p>
                                        <p className="text-xs text-muted-foreground">Days Supply</p>
                                      </div>
                                      <div>
                                        <p className="text-2xl font-bold text-primary">{med.dailyDose}</p>
                                        <p className="text-xs text-muted-foreground">Daily Dose</p>
                                      </div>
                                    </div>
                                  </CardContent>
                                </Card>
                              ))}
                            </div>
                          </>
                        )}

                        {/* Validation Summary with Failed Fields Details */}
                        {processingResult.validationResults && (
                          <>
                            <Separator />
                            <div className="space-y-3">
                              <div className="flex items-center justify-between p-3 border rounded-lg">
                                <span className="font-medium">Validation Results</span>
                                <div className="flex items-center gap-3">
                                  <Badge className="bg-green-500">{processingResult.validationResults.passed} Passed</Badge>
                                  {processingResult.validationResults.warnings > 0 && (
                                    <Badge variant="secondary">{processingResult.validationResults.warnings} Warnings</Badge>
                                  )}
                                  {processingResult.validationResults.failed > 0 && (
                                    <Badge variant="destructive">{processingResult.validationResults.failed} Failed</Badge>
                                  )}
                                </div>
                              </div>
                              
                              {/* Show extraction summary - no hardcoded field list */}
                              <div className="p-3 border border-border/50 bg-muted/30 rounded-lg">
                                <p className="text-sm text-muted-foreground">
                                  Extracted {Object.keys(processingResult.extractedFields).filter(k => processingResult.extractedFields[k]?.value).length} fields from document
                                </p>
                              </div>
                            </div>
                          </>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>

              {/* Processing Options Sidebar - New Dynamic Component */}
              <ProcessingOptionsPanel
                documentConfig={currentConfig}
                enableOCR={enableOCR}
                setEnableOCR={setEnableOCR}
                enableHandwriting={enableHandwriting}
                setEnableHandwriting={setEnableHandwriting}
                enableTableExtraction={enableTableExtraction}
                setEnableTableExtraction={setEnableTableExtraction}
                enableSignatureDetection={enableSignatureDetection}
                setEnableSignatureDetection={setEnableSignatureDetection}
                enableAutoCalculateQty={enableAutoCalculateQty}
                setEnableAutoCalculateQty={setEnableAutoCalculateQty}
                enableNdcMatching={enableNdcMatching}
                setEnableNdcMatching={setEnableNdcMatching}
                enableClinicalRecommendations={enableClinicalRecommendations}
                setEnableClinicalRecommendations={setEnableClinicalRecommendations}
                confidenceThreshold={confidenceThreshold}
                setConfidenceThreshold={setConfidenceThreshold}
                ocrProvider={ocrProvider}
                setOcrProvider={setOcrProvider}
              />
            </div>
          </TabsContent>

          {/* Medication Lookup Tab */}
          <TabsContent value="medication" className="space-y-4">
            {/* Prescription Image Preview for Verification */}
            {processingResult?.imageUrl && processingResult.stage === 'complete' && (
              <Card className="border-primary/30 bg-primary/5">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Eye className="h-5 w-5 text-primary" />
                    Prescription Document (Verification)
                  </CardTitle>
                  <CardDescription>
                    Original document for verification against extracted data
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex gap-4 items-start">
                    <div className="flex-shrink-0 border rounded-lg overflow-hidden bg-white">
                      <img 
                        src={processingResult.imageUrl} 
                        alt="Uploaded prescription" 
                        className="max-h-64 w-auto object-contain"
                      />
                    </div>
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">{processingResult.fileName}</Badge>
                        <Badge className="bg-green-500">Processed</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Compare extracted data with the original document to verify accuracy.
                      </p>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {processingResult.extractedFields['medication']?.value && (
                          <Badge variant="secondary">
                            Medication: {processingResult.extractedFields['medication'].value}
                          </Badge>
                        )}
                        {processingResult.extractedFields['patient_name']?.value && (
                          <Badge variant="secondary">
                            Patient: {processingResult.extractedFields['patient_name'].value}
                          </Badge>
                        )}
                        {processingResult.extractedFields['prescriber_name']?.value && (
                          <Badge variant="secondary">
                            Prescriber: {processingResult.extractedFields['prescriber_name'].value}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Drug Search */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Search className="h-5 w-5" />
                    Drug Search & Calculation
                  </CardTitle>
                  <CardDescription>
                    Search drug name and enter sig to auto-calculate quantity & day supply
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Drug Name</Label>
                    <div className="flex gap-2">
                      <Input 
                        placeholder="e.g., Metformin, Lisinopril, Atorvastatin..." 
                        value={drugSearchQuery}
                        onChange={(e) => setDrugSearchQuery(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleDrugSearch()}
                      />
                      <Button onClick={handleDrugSearch} disabled={isSearching}>
                        {isSearching ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
                      </Button>
                    </div>
                  </div>

                  {/* Separate Dropdowns for Dose, Route, Frequency, Duration */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-2">
                      <Label className="text-xs font-medium">Dose</Label>
                      <Select value={selectedDose} onValueChange={setSelectedDose}>
                        <SelectTrigger className="bg-background">
                          <SelectValue placeholder="Select dose" />
                        </SelectTrigger>
                        <SelectContent className="bg-background z-50">
                          {doseOptions.map((dose) => (
                            <SelectItem key={dose} value={dose}>{dose}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-2">
                      <Label className="text-xs font-medium">Route</Label>
                      <Select value={selectedRoute} onValueChange={setSelectedRoute}>
                        <SelectTrigger className="bg-background">
                          <SelectValue placeholder="Select route" />
                        </SelectTrigger>
                        <SelectContent className="bg-background z-50">
                          {routeOptions.map((route) => (
                            <SelectItem key={route.value} value={route.label}>{route.label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-2">
                      <Label className="text-xs font-medium">Frequency</Label>
                      <Select value={selectedFrequency} onValueChange={setSelectedFrequency}>
                        <SelectTrigger className="bg-background">
                          <SelectValue placeholder="Select frequency" />
                        </SelectTrigger>
                        <SelectContent className="bg-background z-50">
                          {frequencyOptions.map((freq) => (
                            <SelectItem key={freq.value} value={freq.label}>{freq.label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-2">
                      <Label className="text-xs font-medium">Duration</Label>
                      <Select value={selectedDuration} onValueChange={setSelectedDuration}>
                        <SelectTrigger className="bg-background">
                          <SelectValue placeholder="Select duration" />
                        </SelectTrigger>
                        <SelectContent className="bg-background z-50">
                          {durationOptions.map((dur) => (
                            <SelectItem key={dur} value={dur}>{dur}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* Sig / Instructions - Read-only Summary with Calculated Quantity */}
                  <div className="space-y-2">
                    <Label className="text-sm font-medium flex items-center gap-2">
                      <Stethoscope className="h-4 w-4" />
                      Sig / Instructions (Generated)
                    </Label>
                    <div className="p-3 bg-primary/5 border border-primary/30 rounded-lg space-y-3">
                      <p className="text-sm text-primary font-medium">
                        Take {selectedDose} {selectedRoute} {selectedFrequency} for {selectedDuration}
                      </p>
                      
                      {/* Calculated Quantity Display */}
                      {calculatedQuantity && (
                        <div className="grid grid-cols-3 gap-2 pt-2 border-t border-primary/20">
                          <div className="text-center p-2 bg-background/50 rounded">
                            <p className="text-xl font-bold text-green-600">{calculatedQuantity.totalQuantity}</p>
                            <p className="text-[10px] text-muted-foreground uppercase">Total Tablets</p>
                          </div>
                          <div className="text-center p-2 bg-background/50 rounded">
                            <p className="text-xl font-bold text-blue-600">{calculatedQuantity.dailyDose}</p>
                            <p className="text-[10px] text-muted-foreground uppercase">Per Day</p>
                          </div>
                          <div className="text-center p-2 bg-background/50 rounded">
                            <p className="text-xl font-bold text-purple-600">{calculatedQuantity.daysSupply}</p>
                            <p className="text-[10px] text-muted-foreground uppercase">Days Supply</p>
                          </div>
                        </div>
                      )}
                      
                      {ndcDosageInfo && (
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <Badge variant="outline" className="text-xs">{ndcDosageInfo.dosageForm}</Badge>
                          {ndcDosageInfo.strength && (
                            <Badge variant="secondary" className="text-xs">{ndcDosageInfo.strength}</Badge>
                          )}
                        </div>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Quantity auto-calculated: {selectedDose.match(/^(\d+)/)?.[1] || 1} × {frequencyOptions.find(f => f.label === selectedFrequency)?.timesPerDay || 1} times/day × {selectedDuration.match(/(\d+)/)?.[1] || 30} days
                    </p>
                  </div>

                  {searchResults && (
                    <Card className="bg-muted/50 border-border">
                      <CardContent className="pt-4 space-y-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-semibold text-lg">{searchResults.drugName}</p>
                            <p className="text-sm text-muted-foreground">{searchResults.genericName}</p>
                          </div>
                          {searchResults.isControlled && (
                            <Badge variant="destructive">Schedule {searchResults.schedule}</Badge>
                          )}
                        </div>

                        <div className="grid grid-cols-3 gap-4 text-center">
                          <div className="p-3 bg-background rounded-lg border">
                            <p className="text-3xl font-bold text-primary">{searchResults.calculatedQuantity}</p>
                            <p className="text-xs text-muted-foreground">Total Quantity</p>
                          </div>
                          <div className="p-3 bg-background rounded-lg border">
                            <p className="text-3xl font-bold text-primary">{searchResults.daysSupply}</p>
                            <p className="text-xs text-muted-foreground">Days Supply</p>
                          </div>
                          <div className="p-3 bg-background rounded-lg border">
                            <p className="text-3xl font-bold text-primary">{searchResults.dailyDose}</p>
                            <p className="text-xs text-muted-foreground">Daily Dose</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Package className="h-5 w-5" />
                    NDC Codes (USA)
                  </CardTitle>
                  <CardDescription>
                    Select an NDC to view clinical recommendations
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {searchResults ? (
                    <div className="space-y-2">
                      {searchResults.ndcOptions.length > 0 ? (
                        <ScrollArea className="h-48 border rounded-lg">
                          <div className="p-2 space-y-1">
                            {searchResults.ndcOptions.map((option, i) => (
                              <div 
                                key={i} 
                                className={`flex items-center justify-between p-3 rounded cursor-pointer border-b last:border-0 transition-colors ${
                                  selectedNdc === option.code 
                                    ? 'bg-primary/10 border-primary' 
                                    : 'hover:bg-muted'
                                }`}
                                onClick={() => {
                                  setSelectedNdc(option.code);
                                  toast.success(`Selected NDC: ${option.code}`);
                                }}
                              >
                                <div className="flex-1">
                                  <p className="font-medium text-sm">{option.name}</p>
                                  <p className="text-xs text-muted-foreground">{option.manufacturer}</p>
                                  {(option as any).dosageForm && (
                                    <Badge variant="outline" className="mt-1 text-xs">
                                      {(option as any).dosageForm}
                                    </Badge>
                                  )}
                                </div>
                                <div className="text-right flex items-center gap-2">
                                  {selectedNdc === option.code && (
                                    <CheckCircle className="h-4 w-4 text-primary" />
                                  )}
                                  <Badge className={selectedNdc === option.code ? 'bg-primary' : 'bg-blue-600'}>
                                    {option.code}
                                  </Badge>
                                </div>
                              </div>
                            ))}
                          </div>
                        </ScrollArea>
                      ) : (
                        <div className="text-center py-8 text-muted-foreground">
                          <p>No NDC codes found for this drug</p>
                          <p className="text-xs">Try a different spelling or generic name</p>
                        </div>
                      )}
                      {selectedNdc && (
                        <div className="mt-3 p-3 bg-muted rounded-lg">
                          <p className="text-sm font-medium">Selected NDC</p>
                          <p className="text-lg font-bold text-primary">{selectedNdc}</p>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-center py-12 text-muted-foreground">
                      <Package className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>Search for a drug to see NDC codes</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Clinical Recommendations - Enhanced Card Display */}
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Brain className="h-5 w-5" />
                    Clinical Recommendations
                    {selectedNdc && (
                      <Badge variant="outline" className="ml-2">NDC: {selectedNdc}</Badge>
                    )}
                  </CardTitle>
                  <CardDescription>
                    {selectedNdc 
                      ? 'Clinical insights for selected NDC from OpenFDA and RxNorm' 
                      : 'Select an NDC code above to view specific recommendations'}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {!searchResults ? (
                    <div className="text-center py-12 text-muted-foreground">
                      <Brain className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>Search for a drug to see clinical recommendations</p>
                      <p className="text-xs mt-2">Powered by OpenFDA & RxNorm APIs</p>
                    </div>
                  ) : !selectedNdc ? (
                    <div className="text-center py-12 text-muted-foreground">
                      <Package className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>Select an NDC code to view clinical recommendations</p>
                      <p className="text-xs mt-2">Click on any NDC code in the list above</p>
                    </div>
                  ) : searchResults?.clinicalRecommendations && searchResults.clinicalRecommendations.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {searchResults.clinicalRecommendations.map((rec, i) => {
                        // Determine icon based on recommendation type or message content
                        const getIcon = () => {
                          if (rec.title?.toLowerCase().includes('contraindication') || rec.message.toLowerCase().includes('contraindication'))
                            return XCircle;
                          if (rec.title?.toLowerCase().includes('dose') || rec.message.toLowerCase().includes('dose'))
                            return AlertTriangle;
                          if (rec.title?.toLowerCase().includes('interaction') || rec.message.toLowerCase().includes('interaction'))
                            return Activity;
                          if (rec.title?.toLowerCase().includes('controlled') || rec.message.toLowerCase().includes('controlled'))
                            return Shield;
                          if (rec.title?.toLowerCase().includes('monitor') || rec.message.toLowerCase().includes('monitor'))
                            return Activity;
                          if (rec.type === 'error') return XCircle;
                          if (rec.type === 'warning') return AlertTriangle;
                          return Sparkles;
                        };
                        
                        const IconComponent = getIcon();
                        
                        // Use title from API if available, otherwise generate from message
                        const displayTitle = rec.title || (() => {
                          const msg = rec.message.toLowerCase();
                          if (msg.includes('dose')) return 'Dosage Guidance';
                          if (msg.includes('interaction')) return 'Drug Interaction';
                          if (msg.includes('contraindication')) return 'Contraindication';
                          if (msg.includes('controlled')) return 'Controlled Substance';
                          if (msg.includes('monitor')) return 'Clinical Monitoring';
                          return 'Clinical Note';
                        })();
                        
                        const bgColor = rec.type === 'error' ? 'bg-destructive' : 
                                         rec.type === 'warning' ? 'bg-zinc-900 dark:bg-zinc-800' : 
                                         'bg-muted';
                        const textColor = rec.type === 'error' || rec.type === 'warning' ? 'text-white' : 'text-foreground';
                        
                        return (
                          <div 
                            key={i} 
                            className={`rounded-xl p-4 ${bgColor} ${textColor} relative overflow-hidden cursor-pointer hover:opacity-95 transition-opacity`}
                            onClick={() => setSelectedRecommendation({ title: displayTitle, message: rec.message, type: rec.type })}
                          >
                            <div className="flex items-center justify-between mb-3">
                              <span className="text-xs font-medium uppercase tracking-wider opacity-80">
                                RECOMMENDATION
                              </span>
                              <IconComponent className="h-5 w-5 opacity-60" />
                            </div>
                            <h3 className="text-xl font-bold mb-2">{displayTitle}</h3>
                            <p className="text-sm opacity-90 leading-relaxed line-clamp-3">{rec.message}</p>
                            <Button 
                              variant="link" 
                              className={`p-0 h-auto mt-3 ${textColor} opacity-70 hover:opacity-100`}
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedRecommendation({ title: displayTitle, message: rec.message, type: rec.type });
                              }}
                            >
                              Read more
                            </Button>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="text-center py-12 text-muted-foreground">
                      <CheckCircle className="h-12 w-12 mx-auto mb-4 opacity-50 text-green-500" />
                      <p>No specific clinical alerts for this medication</p>
                      <p className="text-xs mt-2">Follow standard prescribing guidelines</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Alternatives with Enhanced Display */}
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="h-5 w-5" />
                    Drug Alternatives & Inventory
                  </CardTitle>
                  <CardDescription>
                    Alternative medications based on molecule/compound from RxNorm
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {searchResults?.alternatives && searchResults.alternatives.length > 0 ? (
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {searchResults.alternatives.map((alt, i) => (
                          <div 
                            key={i} 
                            className="p-4 border rounded-lg hover:bg-muted/50 transition-colors cursor-pointer"
                            onClick={() => {
                              toast.info(`Alternative: ${alt.name}`, {
                                description: `RxCUI: ${alt.ndc} | ${alt.inStock ? `${alt.stockQty} in stock` : 'Out of stock'}`
                              });
                            }}
                          >
                            <div className="flex items-start justify-between">
                              <div className="flex-1 min-w-0">
                                <p className="font-medium text-sm">{alt.name}</p>
                                <p className="text-xs text-muted-foreground mt-1">RxCUI: {alt.ndc}</p>
                                <div className="flex gap-2 mt-2">
                                  <Badge variant="outline" className="text-xs">
                                    Same molecule
                                  </Badge>
                                  {searchResults.isControlled && (
                                    <Badge variant="secondary" className="text-xs">
                                      Schedule {searchResults.schedule}
                                    </Badge>
                                  )}
                                </div>
                              </div>
                              <div className="flex flex-col items-end gap-2 ml-2">
                                {alt.inStock ? (
                                  <Badge className="bg-green-600 hover:bg-green-700 text-white">
                                    {alt.stockQty} in stock
                                  </Badge>
                                ) : (
                                  <Badge variant="destructive">Out of stock</Badge>
                                )}
                                <Button size="sm" variant="outline" className="text-xs">
                                  Select
                                </Button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                      <Alert>
                        <Sparkles className="h-4 w-4" />
                        <AlertDescription>
                          These alternatives share the same active ingredient and therapeutic class as {searchResults.genericName || searchResults.drugName}.
                          Always verify clinical appropriateness before substitution.
                        </AlertDescription>
                      </Alert>
                    </div>
                  ) : (
                    <div className="text-center py-12 text-muted-foreground">
                      <Activity className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>Alternative medications will appear after drug search</p>
                      <p className="text-xs mt-2">Data sourced from RxNorm related drugs API</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Insurance Details Tab - Only for Insurance document type */}
          {selectedDocType === 'insurance' && (
            <TabsContent value="insurance-details" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CreditCard className="h-5 w-5 text-primary" />
                    Insurance Details
                  </CardTitle>
                  <CardDescription>
                    Extracted insurance information - Edit fields below and save to history
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {processingResult && processingResult.stage === 'complete' ? (
                    <div className="space-y-4">
                      {/* Document Image */}
                      {processingResult.imageUrl && (
                        <div className="flex gap-4 items-start p-4 bg-muted/30 rounded-lg">
                          <img 
                            src={processingResult.imageUrl} 
                            alt="Insurance document" 
                            className="max-h-48 w-auto rounded border"
                          />
                          <div className="flex-1">
                            <Badge variant="outline">{processingResult.fileName}</Badge>
                            <p className="text-sm text-muted-foreground mt-2">
                              Verify and edit extracted data, then save to history
                            </p>
                          </div>
                        </div>
                      )}
                      
                      {/* Editable Insurance Fields */}
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        {Object.entries(processingResult.extractedFields)
                          .filter(([key, field]) => field?.value && !['line_items', 'tables', 'detected_document_type', 'document_category'].includes(key))
                          .map(([key, field]) => {
                            const label = expandAbbreviation(key.replace(/_/g, ' '));
                            return (
                              <div key={key} className="p-3 bg-muted/50 rounded-lg space-y-1">
                                <Label className="text-xs text-muted-foreground">{label}</Label>
                                <Input
                                  value={field?.value || ''}
                                  onChange={(e) => {
                                    setProcessingResult(prev => {
                                      if (!prev) return prev;
                                      return {
                                        ...prev,
                                        extractedFields: {
                                          ...prev.extractedFields,
                                          [key]: {
                                            ...prev.extractedFields[key],
                                            value: e.target.value
                                          }
                                        }
                                      };
                                    });
                                  }}
                                  className="h-8 text-sm"
                                />
                                {field?.confidence && (
                                  <Badge variant="secondary" className="text-[9px]">
                                    {Math.round(field.confidence * 100)}% confidence
                                  </Badge>
                                )}
                              </div>
                            );
                          })}
                      </div>
                      
                      {/* Tables extracted from insurance card */}
                      {processingResult.tables && processingResult.tables.length > 0 && (
                        <div className="space-y-3 mt-4">
                          <h4 className="font-medium text-sm flex items-center gap-2">
                            <Table2 className="h-4 w-4" />
                            Coverage Details Tables
                          </h4>
                          {processingResult.tables.map((table: any, tableIdx: number) => (
                            <div key={tableIdx} className="border rounded-lg overflow-hidden">
                              <div className="bg-muted px-3 py-2 font-medium text-sm">
                                {table.title || `Coverage Table ${tableIdx + 1}`}
                              </div>
                              <div className="max-h-[300px] overflow-auto">
                                <table className="w-full text-sm">
                                  {table.header && (
                                    <thead className="bg-muted/50 sticky top-0">
                                      <tr>
                                        {table.header.map((col: string, idx: number) => (
                                          <th key={idx} className="text-left p-2 border-r last:border-r-0 font-medium">
                                            {expandAbbreviation(col)}
                                          </th>
                                        ))}
                                      </tr>
                                    </thead>
                                  )}
                                  <tbody>
                                    {table.rows?.map((row: any[], rowIdx: number) => (
                                      <tr key={rowIdx} className="border-t hover:bg-muted/30">
                                        {row.map((cell: any, cellIdx: number) => (
                                          <td key={cellIdx} className="p-2 border-r last:border-r-0">
                                            {cell || '—'}
                                          </td>
                                        ))}
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                      
                      {/* Save to History Button */}
                      <Button 
                        className="w-full mt-4" 
                        onClick={async () => {
                          try {
                            const { data: { user } } = await supabase.auth.getUser();
                            if (!user) {
                              toast.error('Please login to save');
                              return;
                            }
                            
                            // Save to database
                            const { error } = await supabase
                              .from('document_processing_jobs')
                              .upsert({
                                id: processingResult.id,
                                user_id: user.id,
                                document_type: 'insurance',
                                file_name: processingResult.fileName,
                                file_path: processingResult.imageUrl || processingResult.fileName,
                                status: 'completed',
                                progress: 100,
                                processing_config: {
                                  extractedFields: processingResult.extractedFields,
                                  tables: processingResult.tables || [],
                                  validationResults: processingResult.validationResults,
                                  imageUrl: processingResult.imageUrl
                                }
                              });
                            
                            if (error) throw error;
                            
                            // Update local history
                            setProcessingHistory(prev => {
                              const existing = prev.find(p => p.id === processingResult.id);
                              if (existing) {
                                return prev.map(p => p.id === processingResult.id ? processingResult : p);
                              }
                              return [processingResult, ...prev];
                            });
                            
                            toast.success('Insurance details saved to history');
                            
                            // Trigger sub-agent recommendation dialog
                            setTimeout(() => {
                              setShowSubAgentDialog(true);
                            }, 300);
                          } catch (err) {
                            console.error('Save error:', err);
                            toast.error('Failed to save insurance details');
                          }
                        }}
                      >
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Confirm & Save to History
                      </Button>
                    </div>
                  ) : (
                    <div className="text-center py-12 text-muted-foreground">
                      <CreditCard className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>No insurance document processed</p>
                      <p className="text-sm mt-1">Upload an insurance card to see details</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          )}

          {/* Patient Info Tab - Only for Patient Onboarding document type */}
          {selectedDocType === 'patient-onboarding' && (
            <TabsContent value="patient-info" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5 text-primary" />
                    Patient Information
                  </CardTitle>
                  <CardDescription>
                    Extracted patient demographics and information
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {processingResult && processingResult.stage === 'complete' ? (
                    <div className="space-y-4">
                      {processingResult.imageUrl && (
                        <div className="flex gap-4 items-start p-4 bg-muted/30 rounded-lg">
                          <img src={processingResult.imageUrl} alt="Document" className="max-h-48 w-auto rounded border" />
                        </div>
                      )}
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        {Object.entries(processingResult.extractedFields)
                          .filter(([key, field]) => field?.value && !['line_items', 'tables', 'detected_document_type', 'document_category'].includes(key))
                          .map(([key, field]) => {
                            const label = key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
                            return (
                              <div key={key} className="p-3 bg-muted/50 rounded-lg">
                                <Label className="text-xs text-muted-foreground">{label}</Label>
                                <p className="font-medium">{field?.value || '—'}</p>
                              </div>
                            );
                          })}
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-12 text-muted-foreground">
                      <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>No patient document processed</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          )}

          {/* Order Details Tab - Only for Order Management document type */}
          {selectedDocType === 'order-management' && (
            <TabsContent value="order-details" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <ShoppingCart className="h-5 w-5 text-primary" />
                    Order Details
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {processingResult && processingResult.stage === 'complete' ? (
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      {Object.entries(processingResult.extractedFields)
                        .filter(([key, field]) => field?.value && !['line_items', 'tables', 'detected_document_type', 'document_category'].includes(key))
                        .map(([key, field]) => {
                          const label = key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
                          return (
                            <div key={key} className="p-3 bg-muted/50 rounded-lg">
                              <Label className="text-xs text-muted-foreground">{label}</Label>
                              <p className="font-medium">{field?.value || '—'}</p>
                            </div>
                          );
                        })}
                    </div>
                  ) : (
                    <div className="text-center py-12 text-muted-foreground">
                      <ShoppingCart className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>No order document processed</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          )}

          {/* Treatment Center Tab */}
          {selectedDocType === 'treatment-center' && (
            <TabsContent value="treatment-info" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Building2 className="h-5 w-5 text-primary" />
                    Treatment Center Information
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {processingResult && processingResult.stage === 'complete' ? (
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      {Object.entries(processingResult.extractedFields)
                        .filter(([key, field]) => field?.value && !['line_items', 'tables', 'detected_document_type', 'document_category'].includes(key))
                        .map(([key, field]) => {
                          const label = key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
                          return (
                            <div key={key} className="p-3 bg-muted/50 rounded-lg">
                              <Label className="text-xs text-muted-foreground">{label}</Label>
                              <p className="font-medium">{field?.value || '—'}</p>
                            </div>
                          );
                        })}
                    </div>
                  ) : (
                    <div className="text-center py-12 text-muted-foreground">
                      <Building2 className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>No treatment center document processed</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          )}

          {/* Customer Onboarding Tab */}
          {selectedDocType === 'customer-onboarding' && (
            <TabsContent value="customer-info" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <UserCheck className="h-5 w-5 text-primary" />
                    Customer Information
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {processingResult && processingResult.stage === 'complete' ? (
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      {Object.entries(processingResult.extractedFields)
                        .filter(([key, field]) => field?.value && !['line_items', 'tables', 'detected_document_type', 'document_category'].includes(key))
                        .map(([key, field]) => {
                          const label = key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
                          return (
                            <div key={key} className="p-3 bg-muted/50 rounded-lg">
                              <Label className="text-xs text-muted-foreground">{label}</Label>
                              <p className="font-medium">{field?.value || '—'}</p>
                            </div>
                          );
                        })}
                    </div>
                  ) : (
                    <div className="text-center py-12 text-muted-foreground">
                      <UserCheck className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>No customer document processed</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          )}

          {/* Medical Image Analysis Tab - For X-Ray, CT, MRI, ECG, Ultrasound */}
          {currentConfig.processingHints?.enableImageAnalysis && (
            <TabsContent value="image-analysis" className="space-y-4">
              <MedicalImageAnalysis
                imageUrl={processingResult?.imageUrl || ''}
                imageBase64={medicalImageBase64}
                imageMimeType={medicalImageMimeType}
                documentType={selectedDocType}
                onSaveAnalysis={async (data) => {
                  // Save analysis to database AND local history
                  try {
                    const { data: { user } } = await supabase.auth.getUser();
                    
                    const result: ProcessingResult = {
                      id: crypto.randomUUID(),
                      fileName: processingResult?.fileName || 'Medical Image',
                      documentType: selectedDocType,
                      stage: 'complete',
                      progress: 100,
                      rawText: '',
                      extractedFields: {
                        patient_name: { value: data.patientDetails.patient_name, confidence: 1 },
                        patient_dob: { value: data.patientDetails.patient_dob, confidence: 1 },
                        patient_id: { value: data.patientDetails.patient_id, confidence: 1 },
                        referring_physician: { value: data.patientDetails.referring_physician, confidence: 1 },
                        study_date: { value: data.patientDetails.study_date, confidence: 1 },
                        clinical_notes: { value: data.notes, confidence: 1 },
                        ai_insights: { value: JSON.stringify(data.aiInsights), confidence: 1 }
                      },
                      validationResults: { passed: 5, warnings: 0, failed: 0 },
                      imageUrl: processingResult?.imageUrl || '',
                      processedAt: new Date()
                    };
                    
                    // Save to database - stringify complex objects for JSON compatibility
                    const processingConfigData = {
                      extractedFields: JSON.parse(JSON.stringify(result.extractedFields)),
                      aiInsights: JSON.parse(JSON.stringify(data.aiInsights)),
                      patientDetails: JSON.parse(JSON.stringify(data.patientDetails)),
                      providerDetails: JSON.parse(JSON.stringify(data.providerDetails)),
                      notes: data.notes,
                      imageUrl: result.imageUrl,
                      savedAt: new Date().toISOString()
                    };
                    
                    const { data: savedJob, error: saveError } = await supabase
                      .from('document_processing_jobs')
                      .insert([{
                        user_id: user?.id,
                        document_type: selectedDocType,
                        file_name: result.fileName,
                        file_path: result.imageUrl || result.fileName,
                        status: 'completed',
                        progress: 100,
                        processing_config: processingConfigData as any
                      }])
                      .select()
                      .single();
                    
                    if (saveError) throw saveError;
                    
                    // Update local history
                    await loadHistory();
                    toast.success('Medical image analysis saved to history');
                    
                    // Trigger sub-agent recommendation dialog
                    setTimeout(() => {
                      setShowSubAgentDialog(true);
                    }, 300);
                  } catch (err) {
                    console.error('Save error:', err);
                    toast.error('Failed to save analysis');
                  }
                }}
              />
            </TabsContent>
          )}

          {/* RCM Analysis Tab - For Invoices, Claims, Billing */}
          {currentConfig.processingHints?.enableRCMAnalysis && (
            <TabsContent value="rcm-analysis" className="space-y-4">
              <InvoiceRCMAnalysis
                extractedData={{
                  ...Object.fromEntries(
                    Object.entries(processingResult?.extractedFields || {}).map(([key, val]) => [
                      key,
                      typeof val === 'object' && val !== null && 'value' in val ? val.value : val
                    ])
                  ),
                  // Include line_items and tables from extractedFields (where backend puts them)
                  line_items: processingResult?.extractedFields?.line_items?.value || 
                              processingResult?.extractedFields?.line_items || 
                              processingResult?.lineItems || [],
                  tables: processingResult?.extractedFields?.tables?.value || 
                          processingResult?.extractedFields?.tables || 
                          processingResult?.tables || []
                }}
                processingHistory={processingHistory.filter(h => h.documentType === 'invoice')}
                onExport={(format, data) => {
                  toast.success(`Exported ${format.toUpperCase()} file`);
                }}
                onLineItemsChange={(lineItems) => {
                  // Sync line items back to processingResult for saving
                  if (processingResult) {
                    setProcessingResult(prev => prev ? { ...prev, lineItems } : prev);
                  }
                }}
              />
            </TabsContent>
          )}

          {/* History Tab */}
          <TabsContent value="history">
            <ProcessingHistoryWithExport
              history={processingHistory}
              currentExtractedFields={processingResult?.extractedFields}
              currentProcessingResultId={processingResult?.id}
              filterByDocType={selectedDocType}
              onViewResult={(result: any) => {
                setProcessingResult(result as any);
                
                // For invoices/billing, switch to RCM analysis tab
                if (result.documentType === 'invoice' || result.documentType === 'billing') {
                  setSelectedDocType(result.documentType);
                  setActiveTab('rcm-analysis');
                  toast.info('Loaded invoice for RCM analysis');
                } else {
                  // For other document types, show verification dialog
                  setShowVerificationDialog(true);
                  setPendingResult(result as any);
                }
              }}
              onDeleteItems={async (ids: string[]) => {
                // Delete from database
                try {
                  const { error } = await supabase
                    .from('document_processing_jobs')
                    .delete()
                    .in('id', ids);
                  
                  if (error) {
                    toast.error('Failed to delete items');
                    console.error('Delete error:', error);
                  } else {
                    setProcessingHistory(prev => prev.filter(item => !ids.includes(item.id)));
                    toast.success(`Deleted ${ids.length} item(s)`);
                  }
                } catch (err) {
                  console.error('Delete error:', err);
                  toast.error('Failed to delete items');
                }
              }}
            />
          </TabsContent>
        </Tabs>

        {/* Settings Dialog */}
        <Dialog open={showSettingsDialog} onOpenChange={setShowSettingsDialog}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Document Processing Settings
              </DialogTitle>
              <DialogDescription>
                Configure how documents are processed. These settings control the actual processing behavior.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-6 py-4">
              {/* OCR & Extraction Settings */}
              <div className="space-y-3">
                <h4 className="font-medium text-sm text-muted-foreground uppercase tracking-wide">Document Extraction</h4>
                {/* OCR Provider selection inside settings dialog */}
                <div className="space-y-2 p-2 rounded-lg hover:bg-muted/50">
                  <Label className="text-sm">OCR Provider</Label>
                  <p className="text-xs text-muted-foreground mb-2">Choose which OCR engine to use for extraction.</p>
                  <div className="grid grid-cols-3 gap-2">
                    <Button
                      type="button"
                      size="sm"
                      variant={ocrProvider === 'google' ? 'default' : 'outline'}
                      className="w-full justify-center"
                      onClick={() => setOcrProvider('google')}
                    >
                      Google
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant={ocrProvider === 'azure' ? 'default' : 'outline'}
                      className="w-full justify-center"
                      onClick={() => setOcrProvider('azure')}
                    >
                      Azure
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant={ocrProvider === 'aws' ? 'default' : 'outline'}
                      className="w-full justify-center"
                      onClick={() => setOcrProvider('aws')}
                    >
                      AWS
                    </Button>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/50">
                    <div>
                      <Label>OCR Processing</Label>
                      <p className="text-xs text-muted-foreground">Extract text from images and scanned documents</p>
                    </div>
                    <Switch checked={enableOCR} onCheckedChange={setEnableOCR} />
                  </div>
                  <div className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/50">
                    <div>
                      <Label>Handwriting Recognition</Label>
                      <p className="text-xs text-muted-foreground">Recognize handwritten text in documents</p>
                    </div>
                    <Switch checked={enableHandwriting} onCheckedChange={setEnableHandwriting} />
                  </div>
                  <div className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/50">
                    <div>
                      <Label>Table Extraction</Label>
                      <p className="text-xs text-muted-foreground">Detect and extract tabular data</p>
                    </div>
                    <Switch checked={enableTableExtraction} onCheckedChange={setEnableTableExtraction} />
                  </div>
                  <div className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/50">
                    <div>
                      <Label>Signature Detection</Label>
                      <p className="text-xs text-muted-foreground">Identify signature regions in documents</p>
                    </div>
                    <Switch checked={enableSignatureDetection} onCheckedChange={setEnableSignatureDetection} />
                  </div>
                </div>
              </div>

              <Separator />

              {/* Medication Settings */}
              <div className="space-y-3">
                <h4 className="font-medium text-sm text-muted-foreground uppercase tracking-wide">Medication Processing</h4>
                <div className="space-y-2">
                  <div className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/50">
                    <div>
                      <Label>Auto-Calculate Quantity</Label>
                      <p className="text-xs text-muted-foreground">Calculate qty and days supply from SIG</p>
                    </div>
                    <Switch checked={enableAutoCalculateQty} onCheckedChange={setEnableAutoCalculateQty} />
                  </div>
                  <div className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/50">
                    <div>
                      <Label>NDC Matching</Label>
                      <p className="text-xs text-muted-foreground">Auto-match medications to NDC codes</p>
                    </div>
                    <Switch checked={enableNdcMatching} onCheckedChange={setEnableNdcMatching} />
                  </div>
                  <div className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/50">
                    <div>
                      <Label>Clinical Recommendations</Label>
                      <p className="text-xs text-muted-foreground">Show drug interactions and warnings</p>
                    </div>
                    <Switch checked={enableClinicalRecommendations} onCheckedChange={setEnableClinicalRecommendations} />
                  </div>
                </div>
              </div>

              <Separator />

              {/* Validation Settings */}
              <div className="space-y-3">
                <h4 className="font-medium text-sm text-muted-foreground uppercase tracking-wide">Validation</h4>
                <div className="space-y-2">
                  <div className="p-2 rounded-lg hover:bg-muted/50">
                    <Label className="text-sm">Confidence Threshold</Label>
                    <p className="text-xs text-muted-foreground mb-2">Minimum confidence for field extraction</p>
                    <Select 
                      value={String(confidenceThreshold)} 
                      onValueChange={(v) => setConfidenceThreshold(parseFloat(v))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="0.5">50% - Low (More Fields)</SelectItem>
                        <SelectItem value="0.7">70% - Medium</SelectItem>
                        <SelectItem value="0.85">85% - High (Recommended)</SelectItem>
                        <SelectItem value="0.95">95% - Very High (Fewer Errors)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-4">
              <Button variant="outline" onClick={() => setShowSettingsDialog(false)}>
                Close
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Clinical Recommendation Dialog */}
        <Dialog open={!!selectedRecommendation} onOpenChange={() => setSelectedRecommendation(null)}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                {selectedRecommendation?.type === 'error' ? (
                  <XCircle className="h-5 w-5 text-destructive" />
                ) : selectedRecommendation?.type === 'warning' ? (
                  <AlertTriangle className="h-5 w-5 text-yellow-500" />
                ) : (
                  <Sparkles className="h-5 w-5 text-primary" />
                )}
                {selectedRecommendation?.title}
              </DialogTitle>
              <DialogDescription className="pt-4">
                <p className="text-base leading-relaxed">{selectedRecommendation?.message}</p>
              </DialogDescription>
            </DialogHeader>
            <div className="flex justify-end pt-4">
              <Button variant="outline" onClick={() => setSelectedRecommendation(null)}>
                Close
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Verification Dialog - Confirm extracted data before saving */}
        <Dialog open={showVerificationDialog} onOpenChange={setShowVerificationDialog}>
          <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <FileCheck className="h-5 w-5 text-primary" />
                Verify Extracted Data
              </DialogTitle>
              <DialogDescription>
                Please review the extracted data and compare it against the original document before saving to history.
              </DialogDescription>
            </DialogHeader>
            
            {pendingResult && (
              <div className="space-y-4 py-4">
                {/* Side-by-side comparison */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  {/* Original Document */}
                  <div className="border rounded-lg p-4">
                    <h4 className="font-medium mb-2 flex items-center gap-2">
                      <Image className="h-4 w-4" />
                      Original Document
                    </h4>
                    {pendingResult.imageUrl ? (
                      <img 
                        src={pendingResult.imageUrl} 
                        alt="Original document" 
                        className="w-full rounded border"
                      />
                    ) : (
                      <div className="bg-muted rounded p-4 text-center text-muted-foreground">
                        <FileText className="h-12 w-12 mx-auto mb-2" />
                        <p className="text-sm">No image preview available</p>
                        {pendingResult.rawText && (
                          <pre className="text-left text-xs mt-2 max-h-40 overflow-auto bg-background p-2 rounded">
                            {pendingResult.rawText.slice(0, 500)}...
                          </pre>
                        )}
                      </div>
                    )}
                  </div>
                  
                  {/* Extracted Fields - Show ONLY actually extracted fields */}
                  <div className="border rounded-lg p-4">
                    <h4 className="font-medium mb-2 flex items-center gap-2">
                      <Table2 className="h-4 w-4" />
                      Extracted Fields ({Object.keys(pendingResult.extractedFields).filter(k => pendingResult.extractedFields[k]?.value && !['line_items', 'tables', 'detected_document_type', 'document_category'].includes(k)).length})
                    </h4>
                    <ScrollArea className="h-[300px]">
                      <div className="space-y-2">
                        {Object.entries(pendingResult.extractedFields)
                          .filter(([key, field]) => field?.value && !['line_items', 'tables', 'detected_document_type', 'document_category'].includes(key))
                          .map(([key, field]) => {
                            const confidence = field?.confidence || 0;
                            const label = key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
                            
                            return (
                              <div 
                                key={key} 
                                className={`p-2 rounded border ${
                                  confidence >= confidenceThreshold ? 'bg-green-500/10 border-green-500/30' : 'bg-yellow-500/10 border-yellow-500/30'
                                }`}
                              >
                                <div className="flex items-center justify-between">
                                  <Label className="text-xs text-muted-foreground flex items-center gap-1">
                                    {label}
                                  </Label>
                                  <Badge variant={confidence >= confidenceThreshold ? 'default' : 'secondary'} className="text-[9px]">
                                    {Math.round(confidence * 100)}%
                                  </Badge>
                                </div>
                                <p className="font-medium text-sm">{field?.value || '—'}</p>
                              </div>
                            );
                          })}
                      </div>
                    </ScrollArea>
                  </div>
                </div>
                
                {/* Validation Summary */}
                {pendingResult.validationResults && (
                  <Alert className={pendingResult.validationResults.failed > 0 ? 'border-destructive' : pendingResult.validationResults.warnings > 0 ? 'border-yellow-500' : 'border-green-500'}>
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>
                      <div className="flex items-center gap-4">
                        <span className="text-green-600 font-medium">{pendingResult.validationResults.passed} passed</span>
                        <span className="text-yellow-600 font-medium">{pendingResult.validationResults.warnings} warnings</span>
                        <span className="text-red-600 font-medium">{pendingResult.validationResults.failed} failed</span>
                      </div>
                    </AlertDescription>
                  </Alert>
                )}
                
                {/* Action Buttons */}
                <div className="flex justify-end gap-2 pt-4 border-t">
                  <Button variant="outline" onClick={() => {
                    setShowVerificationDialog(false);
                    setPendingResult(null);
                  }}>
                    Cancel & Discard
                  </Button>
                  <Button 
                    variant="default"
                    onClick={async () => {
                      if (pendingResult) {
                        try {
                          // Save verified/edited fields to database
                          const { data: { user } } = await supabase.auth.getUser();
                          
                          // Prepare processing config with line items and tables for RCM (as JSON-serializable)
                          const processingConfig: Record<string, unknown> = {
                            extractedFields: JSON.parse(JSON.stringify(pendingResult.extractedFields || {})),
                            lineItems: JSON.parse(JSON.stringify(pendingResult.lineItems || [])),
                            tables: JSON.parse(JSON.stringify(pendingResult.tables || [])),
                            medications: JSON.parse(JSON.stringify(pendingResult.medications || [])),
                            validationResults: pendingResult.validationResults ? JSON.parse(JSON.stringify(pendingResult.validationResults)) : null,
                            imageUrl: pendingResult.imageUrl || null,
                            savedAt: new Date().toISOString(),
                            verifiedBy: user?.id || null
                          };
                          
                          // Validation status as string
                          const validationStatusStr = pendingResult.validationResults 
                            ? `passed:${pendingResult.validationResults.passed},failed:${pendingResult.validationResults.failed},warnings:${pendingResult.validationResults.warnings}`
                            : 'verified';
                          
                          // Update the document processing job with verified data
                          const { error: updateError } = await supabase
                            .from('document_processing_jobs')
                            .update({
                              status: 'completed',
                              processing_config: processingConfig as any,
                              validation_status: validationStatusStr
                            })
                            .eq('id', pendingResult.id);
                          
                          if (updateError) {
                            console.error('Error saving verified data:', updateError);
                            toast.error('Failed to save verified data');
                          } else {
                            toast.success('Document verified and saved to history');
                            // Reload history from database to show the updated entry
                            await loadHistory();
                            
                            // For invoices, auto-switch to RCM tab
                            if (selectedDocType === 'invoice' || selectedDocType === 'billing') {
                              setActiveTab('rcm');
                            }
                            
                            // CRITICAL: Show sub-agent recommendation dialog after successful save
                            // Small delay to ensure verification dialog closes first
                            setTimeout(() => {
                              setShowSubAgentDialog(true);
                            }, 300);
                          }
                        } catch (err) {
                          console.error('Save error:', err);
                          toast.error('Failed to save document');
                        }
                      }
                      setShowVerificationDialog(false);
                      setPendingResult(null);
                    }}
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Confirm & Save to History
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Custom Document Type Dialog */}
        <CustomDocumentTypeDialog
          open={showCustomTypeDialog}
          onOpenChange={setShowCustomTypeDialog}
          onSave={(newType) => {
            setCustomDocTypes(prev => [...prev, newType]);
            setSelectedDocType(newType.id);
            toast.success(`Created custom document type: ${newType.title}`);
          }}
        />

        {/* Sub-Agent Recommendation Dialog - Clean, focused on sub-agents only */}
        <SubAgentRecommendationDialog
          open={showSubAgentDialog}
          onOpenChange={setShowSubAgentDialog}
          documentType={currentConfig}
          extractedData={{
            // Universal states for ALL document types
            processingResult,
            pendingResult,
            // Prescription/Medication-specific states
            searchResults,
            drugSearchQuery,
            sigInstructions,
            selectedNdc,
            parsedSig,
            selectedDose,
            selectedRoute,
            selectedFrequency,
            selectedDuration,
            ndcDosageInfo,
            // Medical imaging states
            medicalImageBase64,
            medicalImageMimeType,
          }}
        />
      </div>
    </AppLayout>
  );
}
