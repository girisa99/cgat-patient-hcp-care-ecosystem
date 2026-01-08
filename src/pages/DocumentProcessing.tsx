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
  FlaskConical,
  PenTool
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
import { getDocumentAIConfig } from '@/config/documentModelRouting';
import ProcessingOptionsPanel from '@/components/document-processing/ProcessingOptionsPanel';
import CustomDocumentTypeDialog from '@/components/document-processing/CustomDocumentTypeDialog';
// AgentArchitectureRecommendationPanel removed - using SubAgentRecommendationDialog instead
import ProcessingHistoryWithExport from '@/components/document-processing/ProcessingHistoryWithExport';
import MedicalImageAnalysis from '@/components/document-processing/MedicalImageAnalysis';
import InvoiceRCMAnalysis from '@/components/document-processing/InvoiceRCMAnalysis';
import SubAgentRecommendationDialog from '@/components/document-processing/SubAgentRecommendationDialog';
import RealTimeExtractionTracker from '@/components/document-processing/RealTimeExtractionTracker';
import { SmartDocumentStudio, type ExtractedField, type DocumentCharacteristics, type ModelRoutingInfo, type AgentFinding } from '@/components/document-processing/studio';
import { ArchitectureRecommendation } from '@/services/agentArchitectureIntelligence';

// Use shared healthcare abbreviation utilities
import { HEALTHCARE_ABBREVIATIONS, expandAbbreviation } from '@/utils/healthcareAbbreviations';

// Extracted tab components
import { 
  HistoryTab, 
  PatientInfoTab, 
  InsuranceTab, 
  UploadTab, 
  MedicationTab,
  DocumentProcessingHeader,
  DocumentProcessingControlBar,
  AgentWorkflowSelector,
  GenericDocumentTab
} from '@/components/document-processing/tabs';

// Extracted dialog components
import { ClinicalRecommendationDialog, SettingsDialog, VerificationDialog } from '@/components/document-processing/dialogs';

// Processing stages
type ProcessingStage = 'idle' | 'uploading' | 'ocr' | 'extraction' | 'entity_extraction' | 'table_extraction' | 'mapping' | 'validation' | 'complete' | 'error';

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
  // Model routing info for Stage 1 → Stage 2 pipeline visibility
  modelRouting?: {
    primaryModel: 'claude' | 'gemini' | 'openai' | 'google_vision_ocr';
    modelUsed: 'claude' | 'gemini' | 'openai' | 'google_vision_ocr';
    selectionReason: 'explicit_config' | 'category_default' | 'content_analysis' | 'fallback';
    confidence: number;
    pipelineType: 'single' | 'sequential-hybrid' | 'hybrid_ocr_vision_ai' | 'vision_ai_only' | 'ocr_only' | 'vision_ai_fallback';
    stage1Model?: 'claude' | 'gemini' | 'openai' | 'google_vision_ocr';
    stage2Model?: 'claude' | 'gemini' | 'openai';
    fallbacksAttempted?: ('claude' | 'gemini' | 'openai')[];
    fallbackChain?: ('claude' | 'gemini' | 'openai')[];
    processingTimeMs?: number;
    ocrTextLength?: number;
    ocrConfidence?: number;
    documentCategory?: string;
  };
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
  
  // CRITICAL: Track active processing to prevent state restoration from overwriting in-progress extraction
  const isProcessingActiveRef = useRef(false);
  
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
    
    // Follow-Up tab removed - now integrated into SubAgentRecommendationDialog as Guided Workflows
    
    // Always add history at the end
    baseTabs.push({ id: 'history', label: 'History', icon: <History className="h-4 w-4" /> });
    
    return baseTabs;
  }, [customDocTypes]);

  const dynamicTabs = getTabsForDocumentType(selectedDocType);
  
  // Track previous document type to detect changes
  const prevDocTypeRef = useRef<string>(selectedDocType);
  
  // NOTE: Document type change cleanup moved to after all state definitions (see below)
  
  // Track if we restored state from sessionStorage (for toast notification)
  const [restoredFromStorage, setRestoredFromStorage] = useState(false);
  
  // Initialize processingResult from sessionStorage if available
  const [processingResult, setProcessingResult] = useState<ProcessingResult | null>(() => {
    try {
      const saved = sessionStorage.getItem('docProcessing_currentResult');
      const activeStage = sessionStorage.getItem('docProcessing_activeStage');
      
      if (saved) {
        const parsed = JSON.parse(saved);
        // Restore Date objects
        if (parsed.processedAt) parsed.processedAt = new Date(parsed.processedAt);
        if (parsed.exportedAt) parsed.exportedAt = new Date(parsed.exportedAt);
        
        // If there was an active processing stage, the page was refreshed during processing
        // Mark the stage as 'error' to indicate incomplete processing
        if (activeStage && parsed._isProcessingActive) {
          console.log('[State Restore] Detected incomplete processing - stage:', activeStage);
          parsed.stage = 'error';
          parsed.error = 'Processing was interrupted. Please try uploading the document again.';
          // Clear the active stage marker
          sessionStorage.removeItem('docProcessing_activeStage');
        }
        
        // Remove internal processing flag before returning
        delete parsed._isProcessingActive;
        
        return parsed;
      }
    } catch (e) {
      console.warn('Failed to restore processing result from sessionStorage:', e);
    }
    return null;
  });
  const [processingHistory, setProcessingHistory] = useState<ProcessingResult[]>([]);
  const [isAutoProcessing, setIsAutoProcessing] = useState(true);
  const [useSmartStudio, setUseSmartStudio] = useState(true); // Smart Document Studio mode
  const [showSettingsDialog, setShowSettingsDialog] = useState(false);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [showVerificationDialog, setShowVerificationDialog] = useState(false);
  // Initialize pendingResult from sessionStorage if available
  const [pendingResult, setPendingResult] = useState<ProcessingResult | null>(() => {
    try {
      const saved = sessionStorage.getItem('docProcessing_pendingResult');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.processedAt) parsed.processedAt = new Date(parsed.processedAt);
        if (parsed.exportedAt) parsed.exportedAt = new Date(parsed.exportedAt);
        return parsed;
      }
    } catch (e) {
      console.warn('Failed to restore pending result from sessionStorage:', e);
    }
    return null;
  });
  const [showSubAgentDialog, setShowSubAgentDialog] = useState(false);
  const [agentFindings, setAgentFindings] = useState<Array<{
    agentId: string;
    agentName: string;
    status: 'pending' | 'running' | 'completed' | 'failed';
    findings: Record<string, any>;
    confidence: number;
    executionTimeMs: number;
    timestamp: string;
    alerts?: Array<{ level: 'info' | 'warning' | 'error'; message: string }>;
  }>>([]);
  
  // Track if data has been confirmed and saved - controls when medication tab populates
  const [isDataConfirmed, setIsDataConfirmed] = useState(false);
  
  // Store pending medication data until user confirms and saves
  const [pendingMedicationData, setPendingMedicationData] = useState<{
    drugName: string;
    sigText: string;
    baseName: string;
    preservedStrength: string;
    extractedFields: Record<string, { value: string; confidence: number }>;
    // Multi-medication support
    allMedications?: any[];
  } | null>(null);
  
  // Handler for when agents complete execution in-place
  const handleAgentExecutionComplete = useCallback((results: any[], mergeWithExtraction?: boolean) => {
    console.log('[handleAgentExecutionComplete] Received results:', results.length, 'Merge:', mergeWithExtraction);
    
    // Update agent findings state - this triggers MedicationTab to display results
    setAgentFindings(results);
    
    // Update processing result to store agent findings for persistence
    if (processingResult) {
      setProcessingResult(prev => {
        if (!prev) return prev;
        
        return {
          ...prev,
          agentFindings: results,
        };
      });
    }
    
    toast.success(`${results.length} agent(s) executed`, {
      description: mergeWithExtraction 
        ? 'Results merged with extracted data' 
        : 'Results attached to document'
    });
  }, [processingResult]);

  // NOTE: SmartDocumentStudio conversion functions are defined after processing settings (enableHandwriting, etc.)
  
  // Show toast if state was restored from sessionStorage
  useEffect(() => {
    const hadSavedResult = sessionStorage.getItem('docProcessing_currentResult');
    if (hadSavedResult && processingResult && !restoredFromStorage) {
      setRestoredFromStorage(true);
      // Delay toast slightly to ensure UI is ready
      setTimeout(() => {
        toast.success('Previous document processing state restored', {
          description: `Document: ${processingResult.fileName}`,
          duration: 4000,
        });
      }, 500);
    }
  }, []);
  
  // Persist processingResult to sessionStorage whenever it changes
  // CRITICAL: Also persist the processing lock state to help with tab switch recovery
  useEffect(() => {
    if (processingResult) {
      try {
        // Include processing lock state in the persisted data
        const dataToSave = {
          ...processingResult,
          _isProcessingActive: isProcessingActiveRef.current
        };
        sessionStorage.setItem('docProcessing_currentResult', JSON.stringify(dataToSave));
        
        // Also save the processing stage separately for quick access
        if (processingResult.stage && processingResult.stage !== 'complete' && processingResult.stage !== 'error') {
          sessionStorage.setItem('docProcessing_activeStage', processingResult.stage);
        } else {
          sessionStorage.removeItem('docProcessing_activeStage');
        }
      } catch (e) {
        console.warn('Failed to save processing result to sessionStorage:', e);
      }
    } else {
      sessionStorage.removeItem('docProcessing_currentResult');
      sessionStorage.removeItem('docProcessing_activeStage');
    }
  }, [processingResult]);
  
  // Persist pendingResult to sessionStorage whenever it changes
  useEffect(() => {
    if (pendingResult) {
      try {
        sessionStorage.setItem('docProcessing_pendingResult', JSON.stringify(pendingResult));
      } catch (e) {
        console.warn('Failed to save pending result to sessionStorage:', e);
      }
    } else {
      sessionStorage.removeItem('docProcessing_pendingResult');
    }
  }, [pendingResult]);
  
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
          // Derive a robust URL for the stored file - prioritize base64 data URL from processing_config
          let publicUrl: string | undefined;
          
          // Try from processing_config.imageUrl first (base64 data URL stored during save)
          if (job.processing_config?.imageUrl) {
            publicUrl = job.processing_config.imageUrl;
            console.log('[loadHistory] Using imageUrl from processing_config');
          }
          // Then try publicUrl from processing_config (legacy storage URL)
          else if (job.processing_config?.publicUrl) {
            publicUrl = job.processing_config.publicUrl;
            console.log('[loadHistory] Using publicUrl from processing_config');
          } 
          // Finally fallback to storage URL
          else if (job.file_path) {
            try {
              const { data: urlData } = supabase.storage
                .from('document-processing')
                .getPublicUrl(job.file_path);
              publicUrl = urlData?.publicUrl;
              console.log('[loadHistory] Using storage publicUrl');
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

  // Handler to reset the document processing state for a fresh upload
  const handleNewDocument = useCallback(() => {
    // Release processing lock if somehow still held
    isProcessingActiveRef.current = false;
    
    // Clear all processing state
    setProcessingResult(null);
    setPendingResult(null);
    setAgentFindings([]);
    
    // Reset confirmation state for new document flow
    setIsDataConfirmed(false);
    setPendingMedicationData(null);
    
    // Clear medication tab state
    setDrugSearchQuery('');
    setSearchResults(null);
    setSelectedNdc(null);
    setSelectedDose('1 tablet');
    setSelectedRoute('Oral');
    setSelectedFrequency('Once daily');
    setSelectedDuration('30 days');
    setSigInstructions('');
    setParsedSig(null);
    
    // Clear session storage
    sessionStorage.removeItem('docProcessing_currentResult');
    sessionStorage.removeItem('docProcessing_pendingResult');
    sessionStorage.removeItem('docProcessing_fullState');
    sessionStorage.removeItem('docProcessing_drugQuery');
    sessionStorage.removeItem('docProcessing_sigInstructions');
    sessionStorage.removeItem('docProcessing_searchResults');
    sessionStorage.removeItem('docProcessing_selectedNdc');
    sessionStorage.removeItem('docProcessing_parsedSig');
    
    // Reset recommendation flag
    setHasShownAutoRecommendation(false);
    
    // Switch to upload tab
    setActiveTab('upload');
    
    toast.success('Ready for new document', {
      description: `Upload a new ${currentConfig.title} document`
    });
  }, [currentConfig.title]);
  
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

  // ============= SmartDocumentStudio Conversion Functions =============
  // Convert processing result fields to SmartDocumentStudio format
  const smartStudioExtractedFields = React.useMemo((): Record<string, ExtractedField> => {
    if (!processingResult?.extractedFields) return {};
    
    // Determine the NLP model used from routing
    const stage2Model = processingResult.modelRouting?.stage2Model || processingResult.modelRouting?.modelUsed || 'nlp';
    
    const fields: Record<string, ExtractedField> = {};
    Object.entries(processingResult.extractedFields).forEach(([key, field]) => {
      // Skip internal/meta fields
      if (key.startsWith('_') || ['line_items', 'tables', 'raw_text'].includes(key)) return;
      
      // Determine source based on field metadata or model routing
      const fieldObj = field as Record<string, any>;
      const fieldSource = typeof fieldObj === 'object' && fieldObj !== null && fieldObj.source 
        ? fieldObj.source 
        : stage2Model; // Use the actual NLP model that processed the document
      
      fields[key] = {
        key,
        value: typeof field === 'object' && field !== null ? ((field as any).value || '') : String(field),
        confidence: typeof field === 'object' && field !== null ? ((field as any).confidence || 0.8) : 0.8,
        verified: typeof field === 'object' && field !== null ? ((field as any).verified || false) : false,
        source: fieldSource as 'ocr' | 'vision_ai' | 'nlp',
        originalValue: typeof field === 'object' && field !== null ? (field as any).value : String(field)
      };
    });
    return fields;
  }, [processingResult?.extractedFields, processingResult?.modelRouting]);

  // Convert model routing to SmartDocumentStudio format
  const smartStudioModelRouting = React.useMemo((): ModelRoutingInfo | null => {
    if (!processingResult?.modelRouting) return null;
    
    // Get document-type-specific config for correct defaults
    const docCategory = currentConfig?.category || 'general';
    const docTypeAIConfig = getDocumentAIConfig(selectedDocType, docCategory);
    
    return {
      stage1Model: processingResult.modelRouting.stage1Model || 'google_vision_ocr',
      stage2Model: processingResult.modelRouting.stage2Model || processingResult.modelRouting.modelUsed || docTypeAIConfig.stage2Model || docTypeAIConfig.primaryModel,
      pipelineType: processingResult.modelRouting.pipelineType || docTypeAIConfig.pipelineType || 'single',
      selectionReason: processingResult.modelRouting.selectionReason || 'auto',
      confidence: processingResult.modelRouting.confidence || 0.8,
      processingTimeMs: processingResult.modelRouting.processingTimeMs
    };
  }, [processingResult?.modelRouting, selectedDocType, currentConfig]);

  // Document characteristics derived from processing result
  const smartStudioDocCharacteristics = React.useMemo((): DocumentCharacteristics | null => {
    if (!processingResult) return null;
    
    const docType = processingResult.documentType || selectedDocType;
    
    // Medical images - special handling, no handwriting, specific format detection
    const medicalImageTypes = ['xray', 'ct-scan', 'mri', 'ecg', 'ultrasound', 'mammogram', 'medical-image'];
    const isMedicalImage = medicalImageTypes.some(t => docType?.includes(t));
    
    // Document types that are NEVER handwritten (images, typed forms, etc.)
    const neverHandwritten = ['insurance', ...medicalImageTypes, 'order-management', 'treatment-center'];
    const isNeverHandwrittenType = neverHandwritten.some(t => docType?.includes(t));
    
    // Only check for handwriting on forms that could reasonably be handwritten
    const hasHandwrittenFields = !isNeverHandwrittenType && Object.values(processingResult.extractedFields || {}).some(
      (field: any) => field?.isHandwritten === true
    );
    
    // Only show handwriting if field-level detection confirmed AND it's an enrollment/patient form
    const isActuallyHandwritten = hasHandwrittenFields && (docType === 'enrollment_form' || docType === 'patient-onboarding');
    
    // Determine format - medical images get special treatment
    let format: 'pdf' | 'image' | 'dicom' = 'image';
    if (processingResult.fileName?.toLowerCase().endsWith('.pdf')) {
      format = 'pdf';
    } else if (processingResult.fileName?.toLowerCase().match(/\.(dcm|dicom)$/i)) {
      format = 'dicom';
    }
    
    return {
      format,
      pageCount: 1,
      quality: 'high',
      isHandwritten: isActuallyHandwritten,
      isFilledForm: docType === 'enrollment_form' || docType === 'patient-onboarding',
      isMachineTyped: !isActuallyHandwritten,
      detectedLanguage: 'English',
      orientation: 'portrait'
    };
  }, [processingResult, selectedDocType]);

  // Convert agent findings to SmartDocumentStudio format
  const smartStudioAgentFindings = React.useMemo((): AgentFinding[] => {
    return agentFindings.map(f => ({
      agentId: f.agentId,
      agentName: f.agentName,
      status: f.status,
      executedAt: f.timestamp,
      findings: f.findings,
      confidence: f.confidence,
      executionTimeMs: f.executionTimeMs,
      alerts: f.alerts
    }));
  }, [agentFindings]);

  // Handlers for SmartDocumentStudio
  const handleSmartStudioFieldUpdate = useCallback((key: string, value: string) => {
    setProcessingResult(prev => {
      if (!prev) return prev;
      const updatedFields = { ...prev.extractedFields };
      if (updatedFields[key]) {
        updatedFields[key] = { ...updatedFields[key], value };
      } else {
        updatedFields[key] = { value, confidence: 1, verified: true };
      }
      return { ...prev, extractedFields: updatedFields };
    });
    
    // Also update pendingMedicationData if this is a medication-related field
    // This ensures edits in Studio flow to Medication Lookup tab
    const isMedicationField = key.includes('medication') || 
                              key.includes('drug') || 
                              key.includes('sig') || 
                              key.includes('strength') ||
                              key.includes('ndc') ||
                              key.includes('rx');
    
    if (isMedicationField) {
      setPendingMedicationData(prev => {
        if (!prev) return prev;
        
        // Update extractedFields in pendingMedicationData
        const updatedExtractedFields = { ...prev.extractedFields };
        updatedExtractedFields[key] = { value, confidence: 1 };
        
        // Update allMedications array if this is a numbered medication field
        const medMatch = key.match(/^medication_(\d+)_(.+)$/);
        if (medMatch && prev.allMedications) {
          const medIndex = parseInt(medMatch[1], 10) - 1;
          const fieldName = medMatch[2];
          
          const updatedMedications = [...prev.allMedications];
          if (updatedMedications[medIndex]) {
            // Map field names to medication object properties
            const propMap: Record<string, string> = {
              'name': 'drugName',
              'medication_name': 'drugName',
              'sig': 'sig',
              'strength': 'strength',
              'ndc': 'ndc'
            };
            const propName = propMap[fieldName] || fieldName;
            updatedMedications[medIndex] = {
              ...updatedMedications[medIndex],
              [propName]: value
            };
          }
          
          return {
            ...prev,
            extractedFields: updatedExtractedFields,
            allMedications: updatedMedications,
            // Update primary drugName/sigText if editing medication_1
            ...(medIndex === 0 && fieldName === 'name' ? { drugName: value, baseName: value.split(' ')[0] } : {}),
            ...(medIndex === 0 && fieldName === 'sig' ? { sigText: value } : {}),
            ...(medIndex === 0 && fieldName === 'strength' ? { preservedStrength: value } : {})
          };
        }
        
        // Handle non-numbered medication fields (primary medication)
        if (key === 'medication_name' || key === 'medication' || key === 'drug_name') {
          return {
            ...prev,
            drugName: value,
            baseName: value.split(' ')[0],
            extractedFields: updatedExtractedFields
          };
        }
        if (key === 'sig' || key === 'directions') {
          return {
            ...prev,
            sigText: value,
            extractedFields: updatedExtractedFields
          };
        }
        if (key === 'strength') {
          return {
            ...prev,
            preservedStrength: value,
            extractedFields: updatedExtractedFields
          };
        }
        
        return {
          ...prev,
          extractedFields: updatedExtractedFields
        };
      });
    }
  }, []);

  const handleSmartStudioFieldVerify = useCallback((key: string) => {
    setProcessingResult(prev => {
      if (!prev) return prev;
      const updatedFields = { ...prev.extractedFields };
      if (updatedFields[key]) {
        updatedFields[key] = { ...updatedFields[key], verified: true };
      }
      return { ...prev, extractedFields: updatedFields };
    });
  }, []);

  // Handler for deleting fields in SmartDocumentStudio
  const handleSmartStudioFieldDelete = useCallback((key: string) => {
    setProcessingResult(prev => {
      if (!prev) return prev;
      const updatedFields = { ...prev.extractedFields };
      delete updatedFields[key];
      return { ...prev, extractedFields: updatedFields };
    });
    toast.success(`Field "${key.replace(/_/g, ' ')}" deleted`);
  }, []);

  // Note: handleSmartStudioFileUpload is defined after onDrop below

  const handleSmartStudioRunAgents = useCallback((_agentIds: string[]) => {
    // Open sub-agent dialog with pre-selected agents
    setShowSubAgentDialog(true);
  }, []);
  // ============= End SmartDocumentStudio Functions =============
  
  // Get recommended agent workflows for current document type
  const recommendedAgentWorkflows = AGENT_WORKFLOW_CONFIGS.filter(
    config => config.documentTypes.includes(selectedDocType)
  );
  
  // Medication search state - initialize from sessionStorage for persistence
  const [drugSearchQuery, setDrugSearchQuery] = useState(() => sessionStorage.getItem('docProcessing_drugQuery') || '');
  const [sigInstructions, setSigInstructions] = useState(() => sessionStorage.getItem('docProcessing_sigInstructions') || '');
  const [searchResults, setSearchResults] = useState<MedicationResult | null>(() => {
    try {
      const saved = sessionStorage.getItem('docProcessing_searchResults');
      return saved ? JSON.parse(saved) : null;
    } catch { return null; }
  });
  // Multi-medication results - keyed by medication name
  const [multiMedicationResults, setMultiMedicationResults] = useState<Record<string, MedicationResult>>(() => {
    try {
      const saved = sessionStorage.getItem('docProcessing_multiMedicationResults');
      return saved ? JSON.parse(saved) : {};
    } catch { return {}; }
  });
  // Multi-medication NDC selections - keyed by medication name
  const [multiSelectedNdcs, setMultiSelectedNdcs] = useState<Record<string, string>>(() => {
    try {
      const saved = sessionStorage.getItem('docProcessing_multiSelectedNdcs');
      return saved ? JSON.parse(saved) : {};
    } catch { return {}; }
  });
  const [isSearching, setIsSearching] = useState(false);
  const [selectedNdc, setSelectedNdc] = useState<string | null>(() => sessionStorage.getItem('docProcessing_selectedNdc'));
  const [parsedSig, setParsedSig] = useState<any>(() => {
    try {
      const saved = sessionStorage.getItem('docProcessing_parsedSig');
      return saved ? JSON.parse(saved) : null;
    } catch { return null; }
  });
  const [selectedRecommendation, setSelectedRecommendation] = useState<{ title: string; message: string; type: string } | null>(null);
  
  // Separate editable fields for dose/route/frequency - with sessionStorage persistence
  const [selectedDose, setSelectedDose] = useState(() => sessionStorage.getItem('docProcessing_selectedDose') || '1 tablet');
  const [selectedRoute, setSelectedRoute] = useState(() => sessionStorage.getItem('docProcessing_selectedRoute') || 'by mouth (oral)');
  const [selectedFrequency, setSelectedFrequency] = useState(() => sessionStorage.getItem('docProcessing_selectedFrequency') || 'once daily');
  const [selectedDuration, setSelectedDuration] = useState(() => sessionStorage.getItem('docProcessing_selectedDuration') || '30 days');
  
  // NDC-specific dosing info
  const [ndcDosageInfo, setNdcDosageInfo] = useState<{
    dose: string;
    route: string;
    frequency: string;
    duration: string;
    dosageForm: string;
    strength: string;
  } | null>(() => {
    try {
      const saved = sessionStorage.getItem('docProcessing_ndcDosageInfo');
      return saved ? JSON.parse(saved) : null;
    } catch { return null; }
  });
  
  // Persist medication-related fields to sessionStorage
  useEffect(() => {
    if (drugSearchQuery) sessionStorage.setItem('docProcessing_drugQuery', drugSearchQuery);
    else sessionStorage.removeItem('docProcessing_drugQuery');
  }, [drugSearchQuery]);
  
  useEffect(() => {
    if (sigInstructions) sessionStorage.setItem('docProcessing_sigInstructions', sigInstructions);
    else sessionStorage.removeItem('docProcessing_sigInstructions');
  }, [sigInstructions]);
  
  useEffect(() => {
    if (searchResults) sessionStorage.setItem('docProcessing_searchResults', JSON.stringify(searchResults));
    else sessionStorage.removeItem('docProcessing_searchResults');
  }, [searchResults]);
  
  useEffect(() => {
    if (selectedNdc) sessionStorage.setItem('docProcessing_selectedNdc', selectedNdc);
    else sessionStorage.removeItem('docProcessing_selectedNdc');
  }, [selectedNdc]);
  
  useEffect(() => {
    if (parsedSig) sessionStorage.setItem('docProcessing_parsedSig', JSON.stringify(parsedSig));
    else sessionStorage.removeItem('docProcessing_parsedSig');
  }, [parsedSig]);
  
  useEffect(() => {
    sessionStorage.setItem('docProcessing_selectedDose', selectedDose);
  }, [selectedDose]);
  
  useEffect(() => {
    sessionStorage.setItem('docProcessing_selectedRoute', selectedRoute);
  }, [selectedRoute]);
  
  useEffect(() => {
    sessionStorage.setItem('docProcessing_selectedFrequency', selectedFrequency);
  }, [selectedFrequency]);
  
  useEffect(() => {
    sessionStorage.setItem('docProcessing_selectedDuration', selectedDuration);
  }, [selectedDuration]);
  
  useEffect(() => {
    if (ndcDosageInfo) sessionStorage.setItem('docProcessing_ndcDosageInfo', JSON.stringify(ndcDosageInfo));
    else sessionStorage.removeItem('docProcessing_ndcDosageInfo');
  }, [ndcDosageInfo]);
  
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
  // Returns the parsed values for immediate use (state updates are async)
  const parseSigToSelectors = useCallback((sigText: string): {
    dose: string;
    route: string;
    frequency: string;
    duration: string;
  } => {
    // Default values
    const defaults = {
      dose: '1 tablet',
      route: 'by mouth (oral)',
      frequency: 'once daily',
      duration: '30 days'
    };
    
    if (!sigText) {
      console.log('[parseSigToSelectors] No SIG text provided, using defaults');
      return defaults;
    }
    
    console.log('[parseSigToSelectors] Parsing SIG:', sigText);
    
    // Mark that we're extracting to prevent useEffect cascading updates
    isExtractingRef.current = true;
    
    const lowerSig = sigText.toLowerCase();
    
    // Collect all values first, then update states once
    let newDose = defaults.dose;
    let newRoute = defaults.route;
    let newFrequency = defaults.frequency;
    let newDuration = defaults.duration;
    
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
    
    console.log('[parseSigToSelectors] Parsed values:', { newDose, newRoute, newFrequency, newDuration });
    
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
    
    // Return parsed values for immediate use (since state updates are async)
    return {
      dose: newDose,
      route: newRoute,
      frequency: newFrequency,
      duration: newDuration
    };
  }, [doseOptions, durationOptions, frequencyOptions]);

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

  // Sync medications from processingResult to searchResults when loading from history
  // This ensures MedicationTab shows the extracted medication data even when navigating back
  // ENHANCED: Now supports ALL medications in a prescription for multi-medication results
  useEffect(() => {
    // Only sync if we have medications in processingResult but no searchResults
    if (processingResult?.medications && 
        processingResult.medications.length > 0 && 
        !searchResults &&
        (selectedDocType === 'prescription' || selectedDocType === 'order-management')) {
      
      // Sync first medication to primary search results
      const med = processingResult.medications[0];
      console.log('Syncing medications from processingResult - total:', processingResult.medications.length);
      
      // Populate drug search query if empty
      if (!drugSearchQuery && med.drugName && med.drugName !== 'Unknown') {
        setDrugSearchQuery(med.drugName);
      }
      
      // Populate sig instructions if empty
      if (!sigInstructions && med.sig && med.sig !== 'Take as directed') {
        setSigInstructions(med.sig);
        parseSigToSelectors(med.sig);
      }
      
      // Set search results from first medication data
      setSearchResults({
        drugName: med.drugName,
        genericName: med.genericName,
        strength: med.strength,
        sig: med.sig || 'Take as directed',
        calculatedQuantity: med.calculatedQuantity,
        daysSupply: med.daysSupply,
        dailyDose: med.dailyDose,
        isControlled: med.isControlled,
        schedule: med.schedule,
        ndcOptions: med.ndcOptions || [],
        clinicalRecommendations: med.clinicalRecommendations || [],
        alternatives: med.alternatives || []
      });
      
      // Auto-select first NDC if available
      if (med.ndcOptions && med.ndcOptions.length > 0) {
        setSelectedNdc(med.ndcOptions[0].code);
      } else if (med.ndc) {
        setSelectedNdc(med.ndc);
      }
      
      // ENHANCED: Populate multiMedicationResults for ALL medications
      if (processingResult.medications.length > 1) {
        const multiResults: Record<string, MedicationResult> = {};
        const multiNdcs: Record<string, string> = {};
        
        processingResult.medications.forEach((medication: any) => {
          const medName = medication.drugName || medication.medication_name || medication.name;
          if (medName && medName !== 'Unknown') {
            multiResults[medName] = {
              drugName: medication.drugName || medName,
              genericName: medication.genericName,
              strength: medication.strength,
              sig: medication.sig || 'Take as directed',
              calculatedQuantity: medication.calculatedQuantity || 0,
              daysSupply: medication.daysSupply || 0,
              dailyDose: medication.dailyDose || 0,
              isControlled: medication.isControlled,
              schedule: medication.schedule,
              ndcOptions: medication.ndcOptions || [],
              clinicalRecommendations: medication.clinicalRecommendations || [],
              alternatives: medication.alternatives || []
            };
            
            // Auto-select first NDC for each medication
            if (medication.ndcOptions && medication.ndcOptions.length > 0) {
              multiNdcs[medName] = medication.ndcOptions[0].code;
            } else if (medication.ndc) {
              multiNdcs[medName] = medication.ndc;
            }
          }
        });
        
        console.log('Setting multiMedicationResults:', Object.keys(multiResults).length, 'medications');
        setMultiMedicationResults(multiResults);
        setMultiSelectedNdcs(multiNdcs);
      }
    }
  }, [processingResult, searchResults, selectedDocType, drugSearchQuery, sigInstructions, parseSigToSelectors]);

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

  // Handler for setting multi-selected NDC per medication
  const handleSetMultiSelectedNdc = useCallback((medName: string, ndc: string) => {
    setMultiSelectedNdcs(prev => ({
      ...prev,
      [medName]: ndc
    }));
  }, []);

  // Document upload and auto-processing
  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) return;
    
    const file = acceptedFiles[0];
    
    // CRITICAL: Reset medication-specific fields when uploading a new prescription
    // This prevents stale data from previous prescriptions showing in Medication Lookup tab
    if (selectedDocType === 'prescription' || currentConfig.processingHints?.enableMedicationLookup) {
      console.log('New prescription upload - resetting medication state');
      setDrugSearchQuery('');
      setSigInstructions('');
      setSearchResults(null);
      setSelectedNdc(null);
      setParsedSig(null);
      setSelectedDose('1 tablet');
      setSelectedRoute('by mouth (oral)');
      setSelectedFrequency('once daily');
      setSelectedDuration('30 days');
      setNdcDosageInfo(null);
      // Reset multi-medication state
      setMultiMedicationResults({});
      setMultiSelectedNdcs({});
      // Also clear sessionStorage to prevent stale data on page reload
      sessionStorage.removeItem('docProcessing_drugQuery');
      sessionStorage.removeItem('docProcessing_sigInstructions');
      sessionStorage.removeItem('docProcessing_searchResults');
      sessionStorage.removeItem('docProcessing_selectedNdc');
      sessionStorage.removeItem('docProcessing_parsedSig');
      sessionStorage.removeItem('docProcessing_multiMedicationResults');
      sessionStorage.removeItem('docProcessing_multiSelectedNdcs');
    }
    
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

  // Store base64 data for medical imaging analysis - with sessionStorage persistence
  const [medicalImageBase64, setMedicalImageBase64] = useState<string>(() => 
    sessionStorage.getItem('docProcessing_medicalImageBase64') || ''
  );
  const [medicalImageMimeType, setMedicalImageMimeType] = useState<string>(() => 
    sessionStorage.getItem('docProcessing_medicalImageMimeType') || ''
  );
  
  // Persist medical imaging base64 to sessionStorage
  useEffect(() => {
    if (medicalImageBase64) {
      try {
        sessionStorage.setItem('docProcessing_medicalImageBase64', medicalImageBase64);
      } catch (e) {
        // Base64 images can be large, if it fails just log it
        console.warn('Failed to save medical image to sessionStorage (may be too large):', e);
      }
    } else {
      sessionStorage.removeItem('docProcessing_medicalImageBase64');
    }
  }, [medicalImageBase64]);
  
  useEffect(() => {
    if (medicalImageMimeType) sessionStorage.setItem('docProcessing_medicalImageMimeType', medicalImageMimeType);
    else sessionStorage.removeItem('docProcessing_medicalImageMimeType');
  }, [medicalImageMimeType]);
  
  // Single consolidated useEffect to restore ALL states from sessionStorage
  // This runs once on mount and restores all document type states in one pass
  useEffect(() => {
    // CRITICAL: Don't restore state if processing is actively running
    // This prevents tab switches from overwriting in-progress extraction
    if (isProcessingActiveRef.current) {
      console.log('[State Restoration] Skipped - processing is active');
      return;
    }
    
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
  
  // Reset to upload tab AND clear state when document type changes
  // This effect is placed here after all state definitions to ensure all setters are available
  useEffect(() => {
    const validTabIds = dynamicTabs.map(t => t.id);
    if (!validTabIds.includes(activeTab)) {
      setActiveTab('upload');
    }
    
    // CRITICAL: Don't clear state if processing is actively running
    // This prevents accidental state loss during tab switches
    if (isProcessingActiveRef.current) {
      console.log('[Document Type Change] Skipped state clear - processing is active');
      return;
    }
    
    // Clear extracted data when document type changes to prevent data carryover
    if (prevDocTypeRef.current !== selectedDocType) {
      console.log('DocumentProcessing - Document type changed from', prevDocTypeRef.current, 'to', selectedDocType);
      
      // Clear current processing result to prevent stale data
      setProcessingResult(null);
      setPendingResult(null);
      
      // Reset medication-specific fields when switching away from prescription
      setDrugSearchQuery('');
      setSigInstructions('');
      setSearchResults(null);
      setSelectedNdc(null);
      setParsedSig(null);
      setSelectedDose('1 tablet');
      setSelectedRoute('by mouth (oral)');
      setSelectedFrequency('once daily');
      setSelectedDuration('30 days');
      setNdcDosageInfo(null);
      
      // Reset medical imaging fields
      setMedicalImageBase64('');
      setMedicalImageMimeType('');
      
      // Clear any document-type-specific sessionStorage using DYNAMIC prefixes
      // BUT preserve the core docProcessing_ keys that are used for basic navigation
      const allPrefixes = getAllSessionStoragePrefixes();
      const keysToRemove: string[] = [];
      
      // Keys that should be preserved across document type switches
      const preserveKeys = [
        'docProcessing_selectedDocType',
        'docProcessing_activeTab'
      ];
      
      for (let i = 0; i < sessionStorage.length; i++) {
        const key = sessionStorage.key(i);
        if (key && allPrefixes.some(prefix => key.startsWith(prefix))) {
          // Don't remove the preserve keys
          if (!preserveKeys.includes(key)) {
            keysToRemove.push(key);
          }
        }
      }
      
      keysToRemove.forEach(key => {
        console.log('DocumentProcessing - Removing sessionStorage key:', key);
        sessionStorage.removeItem(key);
      });
      
      prevDocTypeRef.current = selectedDocType;
    }
  }, [selectedDocType, dynamicTabs, activeTab]);

  const runAutoProcessing = async (result: ProcessingResult, file: File) => {
    // CRITICAL: Set processing lock to prevent state restoration from overwriting in-progress extraction
    isProcessingActiveRef.current = true;
    console.log('[runAutoProcessing] Processing lock ACQUIRED');
    
    try {
      // Check if this is a medical imaging document that needs image analysis (not OCR extraction)
      const isMedicalImaging = currentConfig.processingHints?.enableImageAnalysis === true;
      
      console.log('[runAutoProcessing] Document type:', selectedDocType, 
        'Category:', currentConfig.category, 
        'isMedicalImaging:', isMedicalImaging,
        'enableImageAnalysis:', currentConfig.processingHints?.enableImageAnalysis);
      
      // Stage 1: Upload
      setProcessingResult(prev => prev ? { ...prev, stage: 'uploading', progress: 10 } : null);
      toast.info(isMedicalImaging ? 'Uploading medical image for AI analysis...' : 'Uploading document...');

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
        
        // Auto-switch to image analysis tab
        setActiveTab('image-analysis');
        
        // Automatically run medical image analysis
        toast.info('Analyzing medical image with Vision AI...', { duration: 3000 });
        
        try {
          const { data: analysisResult, error: analysisError } = await supabase.functions.invoke('document-processor', {
            body: {
              action: 'analyze_medical_image',
              imageBase64: fileBase64,
              imageMimeType: file.type,
              documentType: selectedDocType,
              analysisType: 'comprehensive',
              provider: 'gemini'
            }
          });
          
          if (analysisError) {
            console.error('Auto medical analysis error:', analysisError);
            toast.warning('Auto-analysis failed. Click "Analyze with Vision AI" to retry.', {
              description: 'Manual analysis is available in the Image Analysis tab'
            });
          } else if (analysisResult?.success) {
            // Store analysis results for the MedicalImageAnalysis component to pick up
            const insights = analysisResult.insights || [];
            const measurements = analysisResult.measurements || [];
            const abnormalCount = insights.filter((i: any) => 
              i.status === 'abnormal' || 
              i.clinicalSignificance === 'high' || 
              i.clinicalSignificance === 'critical'
            ).length;
            
            // Update processing result with AI analysis data
            setProcessingResult(prev => prev ? {
              ...prev,
              extractedFields: {
                ...prev.extractedFields,
                ai_analysis_complete: { value: 'true', confidence: 1 },
                ai_insights_count: { value: String(insights.length), confidence: 1 },
                ai_abnormal_count: { value: String(abnormalCount), confidence: 1 },
                detected_modality: { value: analysisResult.detectedModality || selectedDocType, confidence: 0.9 },
                model_used: { value: analysisResult.modelUsed || 'Vision AI', confidence: 1 }
              }
            } : prev);
            
            toast.success(`Medical image analyzed: ${insights.length} findings`, {
              description: abnormalCount > 0 
                ? `⚠️ ${abnormalCount} abnormal finding(s) detected` 
                : 'View results in Image Analysis tab'
            });
          }
        } catch (autoAnalysisError) {
          console.error('Auto medical analysis exception:', autoAnalysisError);
          toast.warning('Click "Analyze with Vision AI" for detailed analysis');
        }
        
        return;
      }
      
      setProcessingResult(prev => prev ? { ...prev, progress: 40 } : null);
      
      // Stage 2: OCR Processing (non-imaging documents)
      setProcessingResult(prev => prev ? { ...prev, stage: 'ocr', progress: 45 } : null);
      toast.info(enableOCR ? 'Running OCR extraction...' : 'Processing document...');
      
      // Small delay to allow UI to show OCR stage
      await new Promise(resolve => setTimeout(resolve, 200));
      
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
      
      // Update progress and show entity extraction stage with partial fields
      setProcessingResult(prev => prev ? { ...prev, stage: 'entity_extraction', progress: 65 } : null);
      
      // Feed initial entities to show live extraction progress
      const earlyMetadata = processResult?.metadata || {};
      const earlyEntities = earlyMetadata.entities || [];
      if (earlyEntities.length > 0) {
        const earlyFields: Record<string, { value: string; confidence: number; source?: string }> = {};
        earlyEntities.slice(0, Math.ceil(earlyEntities.length / 2)).forEach((entity: any) => {
          if (entity.value) {
            const fieldKey = entity.type.toLowerCase().replace(/\s+/g, '_');
            earlyFields[fieldKey] = {
              value: entity.value,
              confidence: entity.confidence || 0.5,
              source: 'gemini_vision_ai'
            };
          }
        });
        // Progressively add fields to show live extraction
        setProcessingResult(prev => prev ? { ...prev, extractedFields: earlyFields, progress: 70 } : null);
        await new Promise(resolve => setTimeout(resolve, 300));
        
        // Add remaining fields
        earlyEntities.slice(Math.ceil(earlyEntities.length / 2)).forEach((entity: any) => {
          if (entity.value) {
            const fieldKey = entity.type.toLowerCase().replace(/\s+/g, '_');
            earlyFields[fieldKey] = {
              value: entity.value,
              confidence: entity.confidence || 0.5,
              source: 'gemini_vision_ai'
            };
          }
        });
        setProcessingResult(prev => prev ? { ...prev, extractedFields: earlyFields, progress: 75 } : null);
      } else {
        setProcessingResult(prev => prev ? { ...prev, progress: 70 } : null);
      }
      
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
        
        // Check if AI returned a medications array (multiple medications support)
        const aiMedications = extractedFields['medications']?.value;
        let parsedMedications: any[] = [];
        
        if (aiMedications) {
          try {
            // Try to parse the medications array from the AI response
            parsedMedications = typeof aiMedications === 'string' ? JSON.parse(aiMedications) : aiMedications;
            if (Array.isArray(parsedMedications) && parsedMedications.length > 0) {
              console.log('[Extraction] Found multiple medications from AI:', parsedMedications.length);
            }
          } catch (e) {
            console.log('[Extraction] Could not parse medications array:', e);
          }
        }
        
        // Also check mapResult for medications array
        if (parsedMedications.length === 0 && Array.isArray(mapResult?.medications)) {
          parsedMedications = mapResult.medications;
        }
        
        // If we have multiple medications from AI, process them all
        if (parsedMedications.length > 0) {
          console.log('[Extraction] Processing multiple medications:', parsedMedications);
          medications = parsedMedications.map((med: any, idx: number) => {
            const medName = med.medication_name || med.drug_name || med.name || '';
            const sigText = med.sig || med.directions || med.instructions || 'Take as directed';
            const calculation = calculateQuantityAndDaySupply(sigText);
            
            // Also add individual medication fields to extractedFields for display
            const prefix = parsedMedications.length > 1 ? `medication_${idx + 1}_` : '';
            if (medName) {
              extractedFields[`${prefix}medication_name`] = { value: medName, confidence: 0.9 };
            }
            if (med.strength) {
              extractedFields[`${prefix}strength`] = { value: med.strength, confidence: 0.9 };
            }
            if (sigText && sigText !== 'Take as directed') {
              extractedFields[`${prefix}sig`] = { value: sigText, confidence: 0.9 };
            }
            if (med.quantity) {
              extractedFields[`${prefix}quantity`] = { value: String(med.quantity), confidence: 0.9 };
            }
            
            return {
              drugName: medName,
              genericName: medName,
              strength: med.strength || '',
              sig: sigText,
              calculatedQuantity: parseInt(med.quantity) || calculation.totalQuantity,
              daysSupply: parseInt(med.days_supply) || calculation.daysSupply,
              dailyDose: calculation.dailyDose,
              ndc: med.ndc || undefined,
              ndcOptions: [],
              clinicalRecommendations: enableClinicalRecommendations ? [] : []
            };
          });
          
          // Set the first medication as the primary extracted drug name
          if (medications.length > 0) {
            extractedDrugName = medications[0].drugName;
            extractedSig = medications[0].sig;
          }
          
          // Add medication count to extracted fields
          extractedFields['medication_count'] = { value: String(medications.length), confidence: 1.0 };
          
          console.log('[Extraction] Created medications array:', medications.length, 'medications');
        } else {
          // Fallback: Extract single medication from text patterns and fields
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
          // CRITICAL: Check numbered medication fields (medication_1_name) from backend normalization
          const drugName = extractedDrugName || 
                           extractedFields['medication_name']?.value?.trim() || 
                           extractedFields['medication']?.value?.trim() ||
                           extractedFields['drug_name']?.value?.trim() ||
                           extractedFields['drug']?.value?.trim() ||
                           extractedFields['medication_1_name']?.value?.trim() ||  // Numbered field from backend
                           extractedFields['medication_1_medication_name']?.value?.trim() ||  // Alternative numbered format
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
                          extractedFields['medication_1_sig']?.value ||  // Numbered SIG field
                          extractedFields['signature']?.value || 
                          extractedFields['directions']?.value ||
                          extractedFields['instructions']?.value ||
                          extractedFields['dosage_instructions']?.value ||
                          'Take as directed';
          
          // Auto-populate dose, route, frequency, duration selectors from SIG
          parseSigToSelectors(sigText);
          
          const calculation = calculateQuantityAndDaySupply(sigText);
          
          const resolvedDrugName = drugName !== 'Unknown' ? drugName : extractedFields['rx']?.value?.replace(/[()]/g, '')?.trim() || 'Unknown';
          
          medications = [{
            drugName: resolvedDrugName,
            genericName: resolvedDrugName !== 'Unknown' ? resolvedDrugName : 'Unknown',
            strength: extractedFields['strength']?.value || extractedFields['medication_1_strength']?.value || '',
            sig: sigText,
            calculatedQuantity: calculation.totalQuantity,
            daysSupply: calculation.daysSupply,
            dailyDose: calculation.dailyDose,
            ndc: enableNdcMatching ? (extractedFields['ndc']?.value || extractedFields['medication_1_ndc']?.value) : undefined,
            ndcOptions: [],
            clinicalRecommendations: enableClinicalRecommendations ? [] : []
          }];
        }
        
        // Store pending medication data for later - will be processed after user confirms and saves
        // Data flows to Medication Lookup tab ONLY after "Confirm & Save to History"
        // Use the first medication from the array or extracted values
        const primaryMed = medications && medications.length > 0 ? medications[0] : null;
        const finalDrugName = primaryMed?.drugName && primaryMed.drugName !== 'Unknown' ? primaryMed.drugName : null;
        const finalSigText = primaryMed?.sig || extractedFields['sig']?.value || 'Take as directed';
        
        console.log('[Extraction] Medication data extracted:', {
          finalDrugName,
          sigText: finalSigText,
          medicationCount: medications?.length || 0,
          hasStrengthField: !!extractedFields['strength']?.value,
          frequency: extractedFields['frequency']?.value,
          route: extractedFields['route']?.value,
          dose: extractedFields['dose']?.value
        });
        
        if (finalDrugName) {
          const { baseName, extractedStrength } = normalizeDrugName(finalDrugName);
          const preservedStrength = extractedFields['strength']?.value || extractedStrength || '';
          
          // Store pending data - will be used after confirmation
          // Store ALL medications for multi-drug prescriptions
          const pendingData = {
            drugName: finalDrugName,
            sigText: finalSigText,
            baseName: baseName,
            preservedStrength: preservedStrength,
            extractedFields: extractedFields,
            // NEW: Store all medications for multi-drug support
            allMedications: medications || []
          };
          
          console.log('[Extraction] Setting pendingMedicationData:', pendingData);
          setPendingMedicationData(pendingData);
          
          const medicationCount = medications?.length || 1;
          const additionalMeds = medications?.slice(1).map((m: any) => m.drugName || m.medication_name).join(', ');
          toast.info(`Extracted ${medicationCount} medication${medicationCount > 1 ? 's' : ''}: ${finalDrugName}${medicationCount > 1 ? ` + ${additionalMeds}` : ''}`, {
            description: `Review and confirm to populate Medication Lookup${medicationCount > 1 ? ' (all medications will be processed)' : ''}`
          });
        }
        
        // Auto-populate dose, route, frequency, duration selectors from primary SIG
        parseSigToSelectors(finalSigText);
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
        // CRITICAL: Use base64DataUrl for image preview - works for PDFs and images
        imageUrl: base64DataUrl || result.imageUrl,
        validationResults: {
          passed: Object.keys(extractedFields).filter(k => extractedFields[k]?.value && extractedFields[k].confidence >= confidenceThreshold).length,
          failed: 0, // No longer counting "missing" hardcoded fields as failures
          warnings: Object.keys(extractedFields).filter(k => 
            extractedFields[k]?.confidence >= confidenceThreshold * 0.8 && 
            extractedFields[k]?.confidence < confidenceThreshold
          ).length
        },
        processedAt: new Date(),
        // Use document-type-specific config for defaults instead of hardcoded 'gemini'
        modelRouting: mapResult?.modelRouting ? (() => {
          const docCategory = currentConfig?.category || 'general';
          const docTypeAIConfig = getDocumentAIConfig(selectedDocType, docCategory);
          return {
            primaryModel: mapResult.modelRouting.primaryModel || docTypeAIConfig.primaryModel,
            modelUsed: mapResult.modelRouting.modelUsed || mapResult.modelRouting.primaryModel || docTypeAIConfig.primaryModel,
            selectionReason: mapResult.modelRouting.selectionReason || 'category_default',
            confidence: mapResult.modelRouting.confidence || 0.8,
            pipelineType: mapResult.modelRouting.pipelineType || docTypeAIConfig.pipelineType || 'hybrid_ocr_vision_ai',
            stage1Model: mapResult.modelRouting.stage1Model || 'google_vision_ocr',
            stage2Model: mapResult.modelRouting.stage2Model || mapResult.modelRouting.modelUsed || docTypeAIConfig.stage2Model || docTypeAIConfig.primaryModel,
            fallbacksAttempted: mapResult.modelRouting.fallbacksAttempted || [],
            fallbackChain: mapResult.modelRouting.fallbackChain || docTypeAIConfig.fallbackChain,
            processingTimeMs: mapResult.modelRouting.processingTimeMs,
            ocrTextLength: mapResult.modelRouting.ocrTextLength,
            ocrConfidence: mapResult.modelRouting.ocrConfidence,
            documentCategory: mapResult.modelRouting.documentCategory || docCategory
          };
        })() : undefined
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
    } finally {
      // CRITICAL: Release processing lock when done (success or error)
      isProcessingActiveRef.current = false;
      console.log('[runAutoProcessing] Processing lock RELEASED');
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

  // SmartDocumentStudio file upload handler (defined after onDrop)
  const handleSmartStudioFileUpload = useCallback((file: File) => {
    onDrop([file]);
  }, [onDrop]);

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

  // State for medication data saving
  const [isSavingMedicationData, setIsSavingMedicationData] = useState(false);
  const [medicationDataModified, setMedicationDataModified] = useState(false);

  // Track medication data changes
  useEffect(() => {
    if (searchResults || agentFindings.length > 0) {
      setMedicationDataModified(true);
    }
  }, [searchResults, selectedNdc, selectedDose, selectedRoute, selectedFrequency, selectedDuration, agentFindings]);

  // Handle saving medication data (drug search, NDC, clinical, agent findings) to database
  const handleSaveMedicationData = useCallback(async () => {
    if (!processingResult) {
      toast.error('No document to save medication data for');
      return;
    }
    
    // Check if document has been saved to history first (isDataConfirmed)
    if (!isDataConfirmed) {
      toast.error('Please confirm and save the document first', {
        description: 'Click "Confirm & Save to History" in the Upload tab before saving medication data'
      });
      return;
    }
    
    setIsSavingMedicationData(true);
    
    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError || !user) {
        toast.error('Please login to save');
        setIsSavingMedicationData(false);
        return;
      }
      
      // Verify the record exists in database before updating
      const { data: existingRecord, error: checkError } = await supabase
        .from('document_processing_jobs')
        .select('id')
        .eq('id', processingResult.id)
        .single();
      
      if (checkError || !existingRecord) {
        toast.error('Document not saved to history yet', {
          description: 'Please click "Confirm & Save to History" first'
        });
        setIsSavingMedicationData(false);
        return;
      }
      
      // Build medication data object with all relevant fields
      const medicationData = {
        drugName: searchResults?.drugName || drugSearchQuery,
        genericName: searchResults?.genericName,
        strength: searchResults?.strength,
        sig: `Take ${selectedDose} ${selectedRoute} ${selectedFrequency} for ${selectedDuration}`,
        calculatedQuantity: calculatedQuantity?.totalQuantity || searchResults?.calculatedQuantity,
        daysSupply: calculatedQuantity?.daysSupply || searchResults?.daysSupply,
        dailyDose: calculatedQuantity?.dailyDose || searchResults?.dailyDose,
        selectedNdc: selectedNdc,
        ndcOptions: searchResults?.ndcOptions || [],
        clinicalRecommendations: searchResults?.clinicalRecommendations || [],
        alternatives: searchResults?.alternatives || [],
        isControlled: searchResults?.isControlled,
        schedule: searchResults?.schedule,
        agentFindings: agentFindings.map(f => ({
          agentId: f.agentId,
          agentName: f.agentName,
          status: f.status,
          findings: f.findings,
          confidence: f.confidence,
          executionTimeMs: f.executionTimeMs,
          alerts: f.alerts
        })),
        savedAt: new Date().toISOString()
      };
      
      // Update the document_processing_jobs record with medication data
      const { error: updateError } = await supabase
        .from('document_processing_jobs')
        .update({
          processing_config: {
            ...((processingResult as any).processing_config || {}),
            medications: [medicationData],
            medicationLookupData: medicationData,
            agentFindings: agentFindings.length > 0 ? JSON.stringify(agentFindings) : null
          },
          agent_findings: agentFindings.length > 0 ? JSON.stringify(agentFindings) : null,
          agent_execution_status: agentFindings.length > 0 ? 'completed' : 'none',
          updated_at: new Date().toISOString()
        })
        .eq('id', processingResult.id);
      
      if (updateError) {
        throw updateError;
      }
      
      // Update local processing result to reflect saved data
      setProcessingResult(prev => prev ? {
        ...prev,
        medications: [medicationData as any]
      } : prev);
      
      setMedicationDataModified(false);
      toast.success('Medication data saved', {
        description: `Saved ${searchResults?.drugName || 'medication'} with ${agentFindings.length} agent findings`
      });
    } catch (err) {
      console.error('Failed to save medication data:', err);
      toast.error('Failed to save medication data', {
        description: err instanceof Error ? err.message : 'Unknown error'
      });
    } finally {
      setIsSavingMedicationData(false);
    }
  }, [processingResult, searchResults, selectedNdc, selectedDose, selectedRoute, selectedFrequency, selectedDuration, calculatedQuantity, drugSearchQuery, agentFindings, isDataConfirmed]);

  // Handle verify and save to history - with proper image storage
  const handleVerifyAndSave = useCallback(async () => {
    if (!processingResult) {
      toast.error('No processing result to save');
      return;
    }
    
    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError) {
        toast.error('Authentication error', { description: authError.message });
        return;
      }
      if (!user) {
        toast.error('Please login to save');
        return;
      }
      
      // Ensure we have a valid ID
      const documentId = processingResult.id || crypto.randomUUID();
      
      // Upload image to storage if it's base64
      let imageUrl = processingResult.imageUrl;
      let thumbnailUrl: string | undefined;
      
      if (processingResult.imageUrl?.startsWith('data:')) {
        toast.loading('Uploading document image...', { id: 'image-upload' });
        
        try {
          // Import storage helpers dynamically to avoid circular dependencies
          const { uploadDocumentImage, generateThumbnail } = await import('@/utils/storageHelpers');
          
          // Generate thumbnail first
          const thumbnailBase64 = await generateThumbnail(processingResult.imageUrl, 200);
          
          // Upload main image
          const uploadResult = await uploadDocumentImage(
            processingResult.imageUrl,
            user.id,
            documentId,
            `${processingResult.fileName || 'document'}_${Date.now()}`
          );
          
          if (uploadResult) {
            imageUrl = uploadResult.imageUrl;
            thumbnailUrl = uploadResult.thumbnailUrl;
            toast.success('Document image uploaded', { id: 'image-upload' });
          } else {
            // Fallback: store placeholder if upload fails
            console.warn('Image upload failed, storing placeholder');
            imageUrl = undefined;
            toast.warning('Image upload failed', { id: 'image-upload', description: 'Document saved without image' });
          }
        } catch (uploadErr) {
          console.error('Image upload error:', uploadErr);
          imageUrl = undefined;
          toast.warning('Image upload failed', { id: 'image-upload' });
        }
      }
      
      // Build processing config with safe serialization
      const processingConfig: Record<string, unknown> = {
        extractedFields: JSON.parse(JSON.stringify(processingResult.extractedFields || {})),
        lineItems: JSON.parse(JSON.stringify(processingResult.lineItems || [])),
        tables: JSON.parse(JSON.stringify(processingResult.tables || [])),
        medications: JSON.parse(JSON.stringify(processingResult.medications || [])),
        validationResults: processingResult.validationResults ? JSON.parse(JSON.stringify(processingResult.validationResults)) : null,
        imageUrl: imageUrl, // Now stores actual URL, not base64
        savedAt: new Date().toISOString()
      };
      
      const { error: upsertError } = await supabase
        .from('document_processing_jobs')
        .upsert({
          id: documentId,
          user_id: user.id,
          document_type: selectedDocType,
          file_name: processingResult.fileName || 'Unknown Document',
          file_path: processingResult.fileName || 'unknown',
          status: 'completed',
          progress: 100,
          processing_config: processingConfig as any,
          image_url: imageUrl,
          thumbnail_url: thumbnailUrl,
          agent_findings: agentFindings.length > 0 ? JSON.stringify(agentFindings) : null,
          agent_execution_status: agentFindings.length > 0 ? 'completed' : 'none'
        });
      
      if (upsertError) {
        console.error('Database save error:', upsertError);
        toast.error('Failed to save', { 
          description: upsertError.message || 'Database error - check console for details' 
        });
        return;
      }
      
      // Update local history
      const updatedResult = { ...processingResult, id: documentId, imageUrl };
      setProcessingHistory(prev => {
        const existing = prev.find(p => p.id === documentId);
        if (existing) {
          return prev.map(p => p.id === documentId ? updatedResult : p);
        }
        return [updatedResult, ...prev];
      });
      
      toast.success('Saved to history');
      
      // Mark data as confirmed - this controls when Medication Lookup populates
      setIsDataConfirmed(true);
      
      // Now process pending medication data and populate Medication Lookup tab
      if (pendingMedicationData && (selectedDocType === 'prescription' || selectedDocType.includes('medication'))) {
        const { drugName, sigText, baseName, preservedStrength, extractedFields: pendingExtractedFields, allMedications } = pendingMedicationData;
        
        const medicationCount = allMedications?.length || 1;
        console.log('[handleVerifyAndSave] Processing pending medication data:', {
          drugName,
          sigText,
          baseName,
          preservedStrength,
          medicationCount,
          allMedications: allMedications?.map((m: any) => m.drugName || m.medication_name)
        });
        
        // Set drug search query and SIG instructions for PRIMARY medication
        setDrugSearchQuery(drugName);
        if (sigText && sigText !== 'Take as directed') {
          setSigInstructions(sigText);
        }
        
        // Parse SIG to populate selectors - get values immediately
        const parsedValues = parseSigToSelectors(sigText);
        console.log('[handleVerifyAndSave] Parsed SIG values:', parsedValues);
        
        // Switch to medication tab
        setActiveTab('medication');
        
        toast.info(`Processing ${medicationCount} medication${medicationCount > 1 ? 's' : ''}: ${drugName}${medicationCount > 1 ? ` (+${medicationCount - 1} more)` : ''}`, {
          description: medicationCount > 1 
            ? 'Looking up all medications in parallel...' 
            : 'Searching for NDC codes and clinical data...'
        });
        
        // Process ALL medications in parallel
        try {
          const medicationsToProcess = allMedications && allMedications.length > 0 
            ? allMedications 
            : [{ drugName: baseName, sig: sigText }];
          
          // Parallel lookup for all medications
          const lookupPromises = medicationsToProcess.map(async (med: any) => {
            const medName = med.drugName || med.medication_name || med.name;
            if (!medName || medName === 'Unknown') return null;
            
            try {
              const { baseName: medBaseName } = normalizeDrugName(medName);
              const { data, error } = await supabase.functions.invoke('drug-lookup', {
                body: { drugName: medBaseName, searchType: 'all' }
              });
              
              if (error) throw error;
              return { medication: med, lookupData: data };
            } catch (err) {
              console.error(`Drug lookup failed for ${medName}:`, err);
              return { medication: med, lookupData: null, error: err };
            }
          });
          
          const lookupResults = await Promise.all(lookupPromises);
          const successfulLookups = lookupResults.filter(r => r && r.lookupData);
          
          console.log('[handleVerifyAndSave] Lookup results:', {
            total: medicationsToProcess.length,
            successful: successfulLookups.length,
            results: successfulLookups.map(r => r?.lookupData?.drugName || 'Unknown')
          });
          
          // Process PRIMARY medication for the search results display
          const primaryLookup = lookupResults[0];
          if (primaryLookup?.lookupData) {
            const data = primaryLookup.lookupData;
            const calculation = calculateQuantityAndDaySupply(sigText || 'Take 1 tablet daily for 30 days');
            
            const ndcOptions = (data.ndc || []).map((ndc: any) => ({
              code: ndc.code,
              name: `${ndc.brandName || ndc.genericName} ${ndc.strength}`,
              manufacturer: ndc.manufacturer,
              dosageForm: ndc.dosageForm,
              country: 'USA'
            }));
            
            const clinicalRecommendations: { type: 'warning' | 'info' | 'error'; title?: string; message: string }[] = [];
            
            // Add multi-medication alert
            if (medicationCount > 1) {
              clinicalRecommendations.push({
                type: 'info',
                title: 'Multiple Medications',
                message: `This prescription contains ${medicationCount} medications. Review Agent Results for drug-drug interaction analysis.`
              });
            }
            
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
            
            const autoSearchResult: MedicationResult = {
              drugName: primaryNdc?.brandName || data.drugName || drugName,
              genericName: primaryNdc?.genericName || data.rxnorm?.[0]?.name || drugName,
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
            
            if (ndcOptions.length > 0) {
              setSelectedNdc(ndcOptions[0].code);
            }
            
            const msg = medicationCount > 1
              ? `Processed ${successfulLookups.length}/${medicationCount} medications. Primary: ${ndcOptions.length} NDC codes found.`
              : ndcOptions.length > 0 || (data.rxnorm?.length > 0)
                ? `Found ${ndcOptions.length} NDC codes + ${data.rxnorm?.length || 0} RxNorm entries`
                : 'Clinical info loaded (no NDC matches)';
            toast.success(msg, {
              description: medicationCount > 1 ? 'Click medications in summary panel to lookup individually' : undefined
            });
            
            // Store ALL medications in multiMedicationResults for multi-drug prescriptions
            if (medicationCount > 1 && successfulLookups.length > 0) {
              const newMultiMedResults: Record<string, MedicationResult> = {};
              
              successfulLookups.forEach((lookup: any) => {
                if (lookup?.lookupData) {
                  const medData = lookup.lookupData;
                  const medInfo = lookup.medication;
                  const medName = medInfo?.drugName || medInfo?.medication_name || medData.drugName || 'Unknown';
                  const medSig = medInfo?.sig || 'Take as directed';
                  const medCalc = calculateQuantityAndDaySupply(medSig);
                  
                  const medNdcOptions = (medData.ndc || []).map((ndc: any) => ({
                    code: ndc.code,
                    name: `${ndc.brandName || ndc.genericName} ${ndc.strength}`,
                    manufacturer: ndc.manufacturer,
                    dosageForm: ndc.dosageForm,
                    country: 'USA'
                  }));
                  
                  const primaryNdc = medData.ndc?.[0];
                  
                  newMultiMedResults[medName] = {
                    drugName: primaryNdc?.brandName || medData.drugName || medName,
                    genericName: primaryNdc?.genericName || medName,
                    strength: primaryNdc?.strength || medInfo?.strength || '',
                    sig: medSig,
                    calculatedQuantity: medCalc.totalQuantity,
                    daysSupply: medCalc.daysSupply,
                    dailyDose: medCalc.dailyDose,
                    ndc: primaryNdc?.code,
                    ndcOptions: medNdcOptions,
                    alternatives: (medData.alternatives || []).map((alt: any) => ({
                      name: alt.name,
                      ndc: alt.rxcui,
                      inStock: Math.random() > 0.3,
                      stockQty: Math.floor(Math.random() * 500)
                    })),
                    clinicalRecommendations: [],
                    isControlled: medData.isControlled,
                    schedule: medData.schedule
                  };
                }
              });
              
              console.log('[handleVerifyAndSave] Storing multi-medication results:', Object.keys(newMultiMedResults));
              setMultiMedicationResults(prev => ({ ...prev, ...newMultiMedResults }));
            }
          }
        } catch (err) {
          console.error('Drug search error after confirmation:', err);
        }
        
        // Clear pending medication data
        setPendingMedicationData(null);
      } else if ((selectedDocType === 'prescription' || selectedDocType.includes('medication')) && processingResult?.extractedFields) {
        // FALLBACK: If pendingMedicationData was null, use extractedFields (which may contain user edits)
        const fields = processingResult.extractedFields;
        
        // Helper to get field value safely
        const getFieldValue = (key: string): string | undefined => {
          const fieldValue = fields[key]?.value;
          return typeof fieldValue === 'string' ? fieldValue.trim() : undefined;
        };
        
        // Collect ALL medications from numbered fields (medication_1, medication_2, etc.)
        const medicationsFromFields: Array<{ name: string; sig: string; strength?: string }> = [];
        
        // Check for numbered medications (medication_1_name, medication_2_name, etc.)
        for (let i = 1; i <= 10; i++) {
          const medName = getFieldValue(`medication_${i}_name`) ||
                          getFieldValue(`medication_${i}_medication_name`) ||
                          getFieldValue(`medication_${i}`);
          if (medName) {
            medicationsFromFields.push({
              name: medName,
              sig: getFieldValue(`medication_${i}_sig`) || 'Take as directed',
              strength: getFieldValue(`medication_${i}_strength`)
            });
          }
        }
        
        // Also check non-numbered medication fields
        const primaryDrugName = getFieldValue('medication_name') ||
                        getFieldValue('medication') ||
                        getFieldValue('drug_name') ||
                        getFieldValue('rx')?.replace(/[()]/g, '') ||
                        getFieldValue('medicine') ||
                        null;
        
        const primarySigText = getFieldValue('sig') ||
                       getFieldValue('directions') ||
                       getFieldValue('instructions') ||
                       'Take as directed';
        
        // If no numbered medications found, use primary
        if (medicationsFromFields.length === 0 && primaryDrugName) {
          medicationsFromFields.push({
            name: primaryDrugName,
            sig: primarySigText,
            strength: getFieldValue('strength')
          });
        }
        
        console.log('[handleVerifyAndSave] FALLBACK: Found medications from fields:', medicationsFromFields);
        
        if (medicationsFromFields.length > 0) {
          const firstMed = medicationsFromFields[0];
          
          setDrugSearchQuery(firstMed.name);
          if (firstMed.sig && firstMed.sig !== 'Take as directed') {
            setSigInstructions(firstMed.sig);
          }
          
          setActiveTab('medication');
          toast.info(`Processing ${medicationsFromFields.length} medication(s): ${firstMed.name}${medicationsFromFields.length > 1 ? ` (+${medicationsFromFields.length - 1} more)` : ''}`, {
            description: 'Searching for NDC codes and clinical data...'
          });
          
          // Process ALL medications in parallel
          try {
            const lookupPromises = medicationsFromFields.map(async (med) => {
              if (!med.name || med.name === 'Unknown') return null;
              
              try {
                const { baseName } = normalizeDrugName(med.name);
                const { data, error } = await supabase.functions.invoke('drug-lookup', {
                  body: { drugName: baseName, searchType: 'all' }
                });
                
                if (error) throw error;
                return { medication: med, lookupData: data };
              } catch (err) {
                console.error(`Drug lookup failed for ${med.name}:`, err);
                return { medication: med, lookupData: null, error: err };
              }
            });
            
            const lookupResults = await Promise.all(lookupPromises);
            const successfulLookups = lookupResults.filter(r => r && r.lookupData);
            
            // Set primary medication result
            const primaryLookup = lookupResults[0];
            if (primaryLookup?.lookupData) {
              const data = primaryLookup.lookupData;
              const calculation = calculateQuantityAndDaySupply(firstMed.sig);
              const ndcOptions = (data.ndc || []).map((ndc: any) => ({
                code: ndc.code,
                name: `${ndc.brandName || ndc.genericName} ${ndc.strength}`,
                manufacturer: ndc.manufacturer,
                dosageForm: ndc.dosageForm,
                country: 'USA'
              }));
              
              const primaryNdc = data.ndc?.[0];
              
              setSearchResults({
                drugName: primaryNdc?.brandName || data.drugName || firstMed.name,
                genericName: primaryNdc?.genericName || firstMed.name,
                strength: primaryNdc?.strength || firstMed.strength || '',
                sig: firstMed.sig,
                calculatedQuantity: calculation.totalQuantity,
                daysSupply: calculation.daysSupply,
                dailyDose: calculation.dailyDose,
                ndc: primaryNdc?.code,
                ndcOptions,
                alternatives: (data.alternatives || []).map((alt: any) => ({
                  name: alt.name,
                  ndc: alt.rxcui,
                  savings: alt.savings
                })),
                clinicalRecommendations: medicationsFromFields.length > 1 ? [{
                  type: 'info' as const,
                  title: 'Multiple Medications',
                  message: `This prescription contains ${medicationsFromFields.length} medications. Check Agent Results for interactions.`
                }] : [],
                isControlled: data.isControlled,
                schedule: data.schedule
              });
              
              toast.success(`Found ${ndcOptions.length} NDC codes for ${firstMed.name}${successfulLookups.length > 1 ? ` (+${successfulLookups.length - 1} more medications processed)` : ''}`);
            }
            
            // Store ALL medications in multiMedicationResults
            if (successfulLookups.length > 0) {
              const newMultiMedResults: Record<string, MedicationResult> = {};
              
              successfulLookups.forEach((lookup: any) => {
                if (lookup?.lookupData) {
                  const medData = lookup.lookupData;
                  const medInfo = lookup.medication;
                  const medName = medInfo?.name || medData.drugName || 'Unknown';
                  const medSig = medInfo?.sig || 'Take as directed';
                  const medCalc = calculateQuantityAndDaySupply(medSig);
                  
                  const medNdcOptions = (medData.ndc || []).map((ndc: any) => ({
                    code: ndc.code,
                    name: `${ndc.brandName || ndc.genericName} ${ndc.strength}`,
                    manufacturer: ndc.manufacturer,
                    dosageForm: ndc.dosageForm,
                    country: 'USA'
                  }));
                  
                  const primaryNdc = medData.ndc?.[0];
                  
                  newMultiMedResults[medName] = {
                    drugName: primaryNdc?.brandName || medData.drugName || medName,
                    genericName: primaryNdc?.genericName || medName,
                    strength: primaryNdc?.strength || medInfo?.strength || '',
                    sig: medSig,
                    calculatedQuantity: medCalc.totalQuantity,
                    daysSupply: medCalc.daysSupply,
                    dailyDose: medCalc.dailyDose,
                    ndc: primaryNdc?.code,
                    ndcOptions: medNdcOptions,
                    alternatives: [],
                    clinicalRecommendations: [],
                    isControlled: medData.isControlled,
                    schedule: medData.schedule
                  };
                }
              });
              
              console.log('[handleVerifyAndSave] FALLBACK: Storing multi-medication results:', Object.keys(newMultiMedResults));
              setMultiMedicationResults(prev => ({ ...prev, ...newMultiMedResults }));
            }
          } catch (err) {
            console.error('[handleVerifyAndSave] Drug lookup error:', err);
          }
        }
      }
      
      if (selectedDocType === 'patient-onboarding') {
        setActiveTab('patient-info');
      }
      
      // Show sub-agent dialog after successful save (user has verified fields)
      setShowSubAgentDialog(true);
    } catch (err) {
      console.error('Save error:', err);
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      toast.error('Failed to save', { description: errorMessage });
    }
  }, [processingResult, selectedDocType, agentFindings]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      // Images
      'image/*': ['.png', '.jpg', '.jpeg', '.tiff', '.tif', '.heic', '.heif', '.bmp', '.gif'],
      'application/pdf': ['.pdf'],
      'image/tiff': ['.tiff', '.tif'],
      'image/heic': ['.heic', '.heif'],
      // Excel/Spreadsheets
      'application/vnd.ms-excel': ['.xls'],
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
      'text/csv': ['.csv'],
      // DICOM Medical Imaging
      'application/dicom': ['.dcm', '.dicom'],
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
        {/* Header - Using extracted component */}
        <DocumentProcessingHeader
          isAutoProcessing={isAutoProcessing}
          setIsAutoProcessing={setIsAutoProcessing}
          onOpenSettings={() => setShowSettingsDialog(true)}
        />

        {/* Control Bar - Using extracted component */}
        <DocumentProcessingControlBar
          selectedDocType={selectedDocType}
          setSelectedDocType={setSelectedDocType}
          currentConfig={currentConfig}
          customDocTypes={customDocTypes}
          processingResult={processingResult}
          processingMode={processingMode}
          setProcessingMode={setProcessingMode}
          onOpenSubAgentDialog={() => setShowSubAgentDialog(true)}
          onOpenSettingsDialog={() => setShowSettingsDialog(true)}
          onOpenCustomTypeDialog={() => setShowCustomTypeDialog(true)}
          onNewDocument={handleNewDocument}
        />

        {/* Agent Workflow Selection - Using extracted component */}
        {processingMode === 'agent' && (
          <AgentWorkflowSelector
            currentConfig={currentConfig}
            recommendedWorkflows={recommendedAgentWorkflows}
            selectedWorkflow={selectedAgentWorkflow}
            setSelectedWorkflow={setSelectedAgentWorkflow}
          />
        )}

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          {/* Dynamic Tabs based on selected document type */}
          <TabsList className={`grid w-full ${
            dynamicTabs.length === 2 ? 'grid-cols-2' : 
            dynamicTabs.length === 3 ? 'grid-cols-3' : 
            dynamicTabs.length === 4 ? 'grid-cols-4' : 
            'grid-cols-5'
          }`}>
            {dynamicTabs.map(tab => (
              <TabsTrigger key={tab.id} value={tab.id} className="flex items-center gap-2">
                {tab.icon}
                <span className="hidden sm:inline">{tab.label}</span>
              </TabsTrigger>
            ))}
          </TabsList>

          {/* Upload Tab - Conditionally render SmartDocumentStudio or classic UploadTab */}
          <TabsContent value="upload" className="space-y-4">
            {/* Smart Studio Mode Toggle */}
            <div className="flex items-center justify-end gap-2 mb-2">
              <Label htmlFor="smart-studio-toggle" className="text-sm text-muted-foreground">
                Smart Studio
              </Label>
              <Switch
                id="smart-studio-toggle"
                checked={useSmartStudio}
                onCheckedChange={setUseSmartStudio}
              />
            </div>

            {useSmartStudio ? (
              <SmartDocumentStudio
                documentConfig={currentConfig}
                processingResult={processingResult}
                isProcessing={processingResult?.stage !== 'complete' && processingResult?.stage !== 'error' && processingResult?.stage !== 'idle' && processingResult !== null}
                onFileUpload={handleSmartStudioFileUpload}
                onFieldUpdate={handleSmartStudioFieldUpdate}
                onFieldDelete={handleSmartStudioFieldDelete}
                onFieldVerify={handleSmartStudioFieldVerify}
                onSave={handleVerifyAndSave}
                onRunAgents={handleSmartStudioRunAgents}
                extractedFields={smartStudioExtractedFields}
                documentCharacteristics={smartStudioDocCharacteristics}
                modelRouting={smartStudioModelRouting}
                agentFindings={smartStudioAgentFindings}
                imageUrl={processingResult?.imageUrl}
              />
            ) : (
              <UploadTab
                currentConfig={currentConfig}
                processingResult={processingResult}
                setProcessingResult={setProcessingResult}
                onDrop={onDrop}
                onVerifyAndSave={handleVerifyAndSave}
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
            )}
          </TabsContent>

          {/* Medication Lookup Tab - Using extracted component */}
          <TabsContent value="medication" className="space-y-4">
            <MedicationTab
              processingResult={processingResult}
              drugSearchQuery={drugSearchQuery}
              setDrugSearchQuery={setDrugSearchQuery}
              handleDrugSearch={handleDrugSearch}
              isSearching={isSearching}
              searchResults={searchResults}
              multiMedicationResults={multiMedicationResults}
              selectedNdc={selectedNdc || ''}
              setSelectedNdc={setSelectedNdc}
              multiSelectedNdcs={multiSelectedNdcs}
              setMultiSelectedNdc={handleSetMultiSelectedNdc}
              selectedDose={selectedDose}
              setSelectedDose={setSelectedDose}
              selectedRoute={selectedRoute}
              setSelectedRoute={setSelectedRoute}
              selectedFrequency={selectedFrequency}
              setSelectedFrequency={setSelectedFrequency}
              selectedDuration={selectedDuration}
              setSelectedDuration={setSelectedDuration}
              calculatedQuantity={calculatedQuantity}
              ndcDosageInfo={ndcDosageInfo}
              doseOptions={doseOptions}
              routeOptions={routeOptions}
              frequencyOptions={frequencyOptions}
              durationOptions={durationOptions}
              setSelectedRecommendation={setSelectedRecommendation}
              agentFindings={agentFindings}
              onSaveMedicationData={handleSaveMedicationData}
              isSaving={isSavingMedicationData}
              hasUnsavedChanges={medicationDataModified}
              isDataConfirmed={isDataConfirmed}
              hasPendingData={!!pendingMedicationData}
            />
          </TabsContent>

          {/* Insurance Details Tab - Using extracted component */}
          {selectedDocType === 'insurance' && (
            <TabsContent value="insurance-details" className="space-y-4">
              <InsuranceTab
                processingResult={processingResult}
                setProcessingResult={setProcessingResult}
                setProcessingHistory={setProcessingHistory}
                setShowSubAgentDialog={setShowSubAgentDialog}
              />
            </TabsContent>
          )}

          {/* Patient Info Tab - Using extracted component */}
          {selectedDocType === 'patient-onboarding' && (
            <TabsContent value="patient-info" className="space-y-4">
              <PatientInfoTab 
                processingResult={processingResult} 
                setProcessingHistory={setProcessingHistory}
                setProcessingResult={setProcessingResult}
                onSaveComplete={() => setShowSubAgentDialog(true)}
              />
            </TabsContent>
          )}

          {/* Order Details Tab - Using GenericDocumentTab */}
          {selectedDocType === 'order-management' && (
            <TabsContent value="order-details" className="space-y-4">
              <GenericDocumentTab
                title="Order Details"
                icon={ShoppingCart}
                processingResult={processingResult}
                emptyStateMessage="No order document processed"
                documentType="order"
                setProcessingHistory={setProcessingHistory}
                onSaveComplete={() => setShowSubAgentDialog(true)}
              />
            </TabsContent>
          )}

          {/* Treatment Center Tab - Using GenericDocumentTab */}
          {selectedDocType === 'treatment-center' && (
            <TabsContent value="treatment-info" className="space-y-4">
              <GenericDocumentTab
                title="Treatment Center Information"
                icon={Building2}
                processingResult={processingResult}
                emptyStateMessage="No treatment center document processed"
                documentType="treatment_center"
                setProcessingHistory={setProcessingHistory}
                onSaveComplete={() => setShowSubAgentDialog(true)}
              />
            </TabsContent>
          )}

          {/* Customer Onboarding Tab - Using GenericDocumentTab */}
          {selectedDocType === 'customer-onboarding' && (
            <TabsContent value="customer-info" className="space-y-4">
              <GenericDocumentTab
                title="Customer Information"
                icon={UserCheck}
                processingResult={processingResult}
                emptyStateMessage="No customer document processed"
                documentType="customer"
                setProcessingHistory={setProcessingHistory}
                onSaveComplete={() => setShowSubAgentDialog(true)}
              />
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
                    
                    // Show sub-agent dialog after successful save
                    setShowSubAgentDialog(true);
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
                onClassificationChange={(classification) => {
                  console.log('Invoice Classification:', classification);
                  // Could update tab label dynamically here if needed
                }}
              />
            </TabsContent>
          )}

          {/* Follow-Up Tab removed - Guided Workflows now integrated into SubAgentRecommendationDialog */}

          {/* History Tab - Using extracted component */}
          <TabsContent value="history">
            <HistoryTab
              processingHistory={processingHistory}
              setProcessingHistory={setProcessingHistory}
              selectedDocType={selectedDocType}
              setProcessingResult={setProcessingResult}
              setSelectedDocType={setSelectedDocType}
              setActiveTab={setActiveTab}
              setShowVerificationDialog={setShowVerificationDialog}
              setPendingResult={setPendingResult}
              setIsDataConfirmed={setIsDataConfirmed}
            />
          </TabsContent>
        </Tabs>

        {/* Settings Dialog - Using extracted component */}
        <SettingsDialog
          open={showSettingsDialog}
          onOpenChange={setShowSettingsDialog}
          ocrProvider={ocrProvider}
          setOcrProvider={setOcrProvider}
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
        />

        {/* Clinical Recommendation Dialog - Using extracted component */}
        <ClinicalRecommendationDialog
          recommendation={selectedRecommendation}
          onClose={() => setSelectedRecommendation(null)}
        />

        {/* Verification Dialog - Using extracted component */}
        <VerificationDialog
          open={showVerificationDialog}
          onOpenChange={setShowVerificationDialog}
          pendingResult={pendingResult}
          setPendingResult={setPendingResult}
          confidenceThreshold={confidenceThreshold}
          setProcessingHistory={setProcessingHistory}
          setShowSubAgentDialog={setShowSubAgentDialog}
          loadHistory={loadHistory}
          selectedDocType={selectedDocType}
          setActiveTab={setActiveTab}
        />

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
            // Pending medication data from extraction - critical for agents to have medication info
            pendingMedicationData,
            // Prescription/Medication-specific states (populated after save)
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
            // Multi-medication results - ALL medications from prescription
            multiMedicationResults,
            multiSelectedNdcs,
            // Medical imaging states
            medicalImageBase64,
            medicalImageMimeType,
            // Flag to know if data has been confirmed
            isDataConfirmed,
          }}
          onAgentExecutionComplete={handleAgentExecutionComplete}
        />
      </div>
    </AppLayout>
  );
}
