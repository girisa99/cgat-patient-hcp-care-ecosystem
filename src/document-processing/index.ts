/**
 * Document Processing Module
 * 
 * Central export file for all Document Processing functionality.
 * Isolated from other products (Genie Studio, Healthcare) for clean separation.
 */

// ============================================================================
// PRODUCT METADATA
// ============================================================================

export const DOCUMENT_PROCESSING_PRODUCT = {
  id: 'document-processing',
  name: 'Document Processing',
  version: '1.0.0',
  description: 'AI-Powered Document Intelligence - Multi-Model OCR & Extraction Suite',
  commercialLaunch: false, // Part of Healthcare platform
} as const;

// ============================================================================
// METRICS - Document Processing Specific
// ============================================================================

export const DOCUMENT_PROCESSING_METRICS = {
  edgeFunctions: 7,
  hooks: 8,
  components: 50,
  databaseTables: 4,
  aiModelsSupported: 5,
  documentTypesSupported: 15,
} as const;

export const DOCUMENT_PROCESSING_EDGE_FUNCTIONS = [
  { name: 'document-processor', purpose: 'Core multi-model OCR/Extraction', phase: 'P0', status: 'production' },
  { name: 'process-documents', purpose: 'Legacy document extraction', phase: 'P0', status: 'production' },
  { name: 'execute-document-agent', purpose: 'Workflow integration', phase: 'P1', status: 'production' },
  { name: 'pdf-voice-processor', purpose: 'Voice-enabled PDF reading', phase: 'P1', status: 'production' },
  { name: 'fax-processing', purpose: 'Fax-specific OCR', phase: 'P1', status: 'production' },
  { name: 'extract-enrollment-form', purpose: 'Enrollment form extraction', phase: 'P1', status: 'production' },
  { name: 'medical-imaging-cnn', purpose: 'CNN-based medical imaging', phase: 'P2', status: 'production' },
] as const;

export const DOCUMENT_PROCESSING_TABLES = [
  { name: 'document_processing_jobs', purpose: 'Job tracking' },
  { name: 'document_processing_queue', purpose: 'Processing queue' },
  { name: 'document_metadata', purpose: 'Document metadata' },
  { name: 'extracted_entities', purpose: 'Extracted data entities' },
] as const;

// ============================================================================
// HOOKS - Re-exports from src/hooks
// ============================================================================

export { useDocumentExtraction } from '@/hooks/useDocumentExtraction';
export { useDocumentProcessingState } from '@/hooks/useDocumentProcessingState';
export { useMedicationSearch } from '@/hooks/useMedicationSearch';
export { useMedicationProcessing } from '@/hooks/useMedicationProcessing';
export { useDocumentRouterOrchestrator } from '@/hooks/useDocumentRouterOrchestrator';
export { useModelRouting } from '@/hooks/useModelRouting';
export { useDocumentAI } from '@/hooks/useDocumentAI';
export { useDocumentProcessing } from '@/hooks/useDocumentProcessing';
export { useConfigDrivenDocumentRouter } from '@/hooks/useConfigDrivenDocumentRouter';
export { useMedicalCoding } from '@/hooks/useMedicalCoding';
export { useInsurancePipeline } from '@/hooks/useInsurancePipeline';

// ============================================================================
// CONFIGURATION - Re-exports from src/config
// ============================================================================

export { 
  DOCUMENT_TYPE_CONFIGS,
  getDocumentTypeById,
  getDocumentTypesByCategory,
  getAllCategories,
  getCategoryLabel,
  getCategoryIcon,
  getAllSessionStoragePrefixes,
  getFieldsForDocumentType,
  getSpecialTabForDocumentType,
  DOCUMENT_TYPE_FIELDS,
} from '@/config/documentTypes';

export {
  getDocumentAIConfig,
} from '@/config/documentModelRouting';

// ============================================================================
// COMPONENTS - Re-exports from src/components/document-processing
// ============================================================================

// Tab Components
export { 
  HistoryTab, 
  PatientInfoTab, 
  InsuranceTab, 
  UploadTab, 
  MedicationTab,
  DocumentProcessingHeader,
  DocumentProcessingControlBar,
  AgentWorkflowSelector,
  GenericDocumentTab,
} from '@/components/document-processing/tabs';

// Dialog Components
export { 
  ClinicalRecommendationDialog, 
  SettingsDialog, 
  VerificationDialog,
} from '@/components/document-processing/dialogs';

// Studio Components
export { SmartDocumentStudio } from '@/components/document-processing/studio';

// Core Components
export { default as ProcessingOptionsPanel } from '@/components/document-processing/ProcessingOptionsPanel';
export { default as CustomDocumentTypeDialog } from '@/components/document-processing/CustomDocumentTypeDialog';
export { default as ProcessingHistoryWithExport } from '@/components/document-processing/ProcessingHistoryWithExport';
export { MedicalImageAnalysis } from '@/components/document-processing/MedicalImageAnalysis';
export { default as InvoiceRCMAnalysis } from '@/components/document-processing/InvoiceRCMAnalysis';
export { default as SubAgentRecommendationDialog } from '@/components/document-processing/SubAgentRecommendationDialog';
export { default as RealTimeExtractionTracker } from '@/components/document-processing/RealTimeExtractionTracker';

// Diagram Components
export { default as SolutionArchitectureDiagram } from '@/components/document-processing/SolutionArchitectureDiagram';
export { default as TwoStagePipelineDiagram } from '@/components/document-processing/TwoStagePipelineDiagram';
export { default as OCRVisionAIComparisonView } from '@/components/document-processing/OCRVisionAIComparisonView';
export { default as DocumentProcessingArchitectureDiagram } from '@/components/document-processing/DocumentProcessingArchitectureDiagram';
export { default as ContentTypeRoutingDiagram } from '@/components/document-processing/ContentTypeRoutingDiagram';

// ============================================================================
// PRODUCT ROUTES
// ============================================================================

export const DOCUMENT_PROCESSING_ROUTES = {
  main: '/document-processing',
  upload: '/document-processing?tab=upload',
  medications: '/document-processing?tab=medications',
  insurance: '/document-processing?tab=insurance',
  patientInfo: '/document-processing?tab=patient-info',
  history: '/document-processing?tab=history',
} as const;

// ============================================================================
// FEATURE FLAGS
// ============================================================================

export const DOCUMENT_PROCESSING_FEATURES = {
  twoStagePipeline: true,
  multiModelRouting: true,
  medicalDocuments: true,
  invoiceRCM: true,
  medicalImaging: true,
  faxProcessing: true,
  voiceEnabledPDF: true,
  realTimeTracking: true,
  agentWorkflowIntegration: true,
} as const;

// ============================================================================
// AI MODEL PROVIDERS
// ============================================================================

export const DOCUMENT_AI_PROVIDERS = [
  { id: 'gemini', name: 'Google Gemini', specialty: 'Vision AI', status: 'active' },
  { id: 'openai', name: 'OpenAI GPT-4V', specialty: 'Text Extraction', status: 'active' },
  { id: 'anthropic', name: 'Claude', specialty: 'Document Analysis', status: 'active' },
  { id: 'google-vision', name: 'Google Cloud Vision', specialty: 'OCR', status: 'active' },
  { id: 'tesseract', name: 'Tesseract', specialty: 'OCR Fallback', status: 'active' },
] as const;
