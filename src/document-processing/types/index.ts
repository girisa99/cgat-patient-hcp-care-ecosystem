/**
 * Document Processing Type Definitions
 * 
 * Central type definitions for the Document Processing module.
 */

// ============================================================================
// DOCUMENT TYPES
// ============================================================================

export interface DocumentType {
  id: string;
  name: string;
  category: DocumentCategory;
  icon: string;
  description: string;
  fields: DocumentField[];
  aiModel: string;
  processingPipeline: ProcessingPipeline;
}

export type DocumentCategory = 
  | 'medical'
  | 'financial'
  | 'insurance'
  | 'legal'
  | 'administrative'
  | 'custom';

export interface DocumentField {
  id: string;
  name: string;
  type: FieldType;
  required: boolean;
  validation?: FieldValidation;
  mapping?: string;
}

export type FieldType = 
  | 'text'
  | 'number'
  | 'date'
  | 'currency'
  | 'code' // NDC, CPT, ICD, etc.
  | 'phone'
  | 'email'
  | 'address'
  | 'signature'
  | 'checkbox';

export interface FieldValidation {
  pattern?: string;
  minLength?: number;
  maxLength?: number;
  min?: number;
  max?: number;
  custom?: (value: any) => boolean;
}

// ============================================================================
// PROCESSING TYPES
// ============================================================================

export interface ProcessingPipeline {
  stages: ProcessingStage[];
  fallbackModel?: string;
  confidenceThreshold: number;
}

export interface ProcessingStage {
  id: string;
  name: string;
  type: 'ocr' | 'extraction' | 'validation' | 'enrichment';
  provider: string;
  config: Record<string, any>;
}

export interface ProcessingJob {
  id: string;
  documentId: string;
  status: ProcessingStatus;
  stage: string;
  progress: number;
  startedAt: string;
  completedAt?: string;
  error?: string;
  result?: ExtractionResult;
}

export type ProcessingStatus = 
  | 'pending'
  | 'processing'
  | 'completed'
  | 'failed'
  | 'cancelled';

// ============================================================================
// EXTRACTION TYPES
// ============================================================================

export interface ExtractionResult {
  documentType: string;
  confidence: number;
  fields: ExtractedField[];
  rawText?: string;
  metadata: DocumentMetadata;
  processingTime: number;
  modelUsed: string;
}

export interface ExtractedField {
  id: string;
  name: string;
  value: any;
  confidence: number;
  boundingBox?: BoundingBox;
  source: 'ocr' | 'vision' | 'nlp';
  validated: boolean;
  validationErrors?: string[];
}

export interface BoundingBox {
  x: number;
  y: number;
  width: number;
  height: number;
  page: number;
}

export interface DocumentMetadata {
  fileName: string;
  fileSize: number;
  mimeType: string;
  pageCount: number;
  uploadedAt: string;
  processedAt?: string;
  hash: string;
}

// ============================================================================
// MODEL ROUTING TYPES
// ============================================================================

export interface ModelRoutingConfig {
  documentType: string;
  primaryModel: AIModelConfig;
  fallbackModel?: AIModelConfig;
  routingRules: RoutingRule[];
}

export interface AIModelConfig {
  provider: string;
  modelId: string;
  maxTokens: number;
  temperature: number;
  systemPrompt?: string;
}

export interface RoutingRule {
  condition: RoutingCondition;
  targetModel: string;
  priority: number;
}

export type RoutingCondition = 
  | { type: 'documentType'; value: string }
  | { type: 'fileSize'; operator: 'gt' | 'lt' | 'eq'; value: number }
  | { type: 'pageCount'; operator: 'gt' | 'lt' | 'eq'; value: number }
  | { type: 'confidence'; operator: 'gt' | 'lt'; value: number }
  | { type: 'category'; value: DocumentCategory };

// ============================================================================
// MEDICAL DOCUMENT TYPES
// ============================================================================

export interface MedicalDocument extends ExtractionResult {
  patientInfo?: PatientInfo;
  medications?: Medication[];
  diagnoses?: Diagnosis[];
  procedures?: Procedure[];
  insuranceInfo?: InsuranceInfo;
}

export interface PatientInfo {
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  ssn?: string;
  mrn?: string;
  address?: string;
  phone?: string;
  email?: string;
}

export interface Medication {
  name: string;
  dosage: string;
  frequency: string;
  ndcCode?: string;
  rxNormCode?: string;
  prescriber?: string;
  startDate?: string;
  endDate?: string;
  refills?: number;
}

export interface Diagnosis {
  description: string;
  icdCode: string;
  type: 'primary' | 'secondary';
  date?: string;
}

export interface Procedure {
  description: string;
  cptCode: string;
  modifier?: string;
  units?: number;
  date?: string;
}

export interface InsuranceInfo {
  payerId: string;
  payerName: string;
  memberId: string;
  groupNumber?: string;
  planType?: string;
  effectiveDate?: string;
  terminationDate?: string;
  copay?: number;
  deductible?: number;
}

// ============================================================================
// INVOICE/RCM TYPES
// ============================================================================

export interface InvoiceDocument extends ExtractionResult {
  invoiceNumber: string;
  invoiceDate: string;
  dueDate?: string;
  vendor?: VendorInfo;
  lineItems: InvoiceLineItem[];
  subtotal: number;
  tax?: number;
  total: number;
  paymentTerms?: string;
}

export interface VendorInfo {
  name: string;
  address?: string;
  phone?: string;
  taxId?: string;
}

export interface InvoiceLineItem {
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
  cptCode?: string;
  hcpcsCode?: string;
}

// ============================================================================
// PROCESSING STATE TYPES
// ============================================================================

export interface DocumentProcessingState {
  // Upload state
  files: File[];
  uploadProgress: number;
  isUploading: boolean;
  
  // Processing state
  currentJob: ProcessingJob | null;
  processingStage: string;
  processingProgress: number;
  
  // Results state
  extractionResult: ExtractionResult | null;
  validationErrors: string[];
  
  // UI state
  activeTab: string;
  selectedModel: string;
  showSettings: boolean;
  
  // History
  processingHistory: ProcessingJob[];
}

// ============================================================================
// API TYPES
// ============================================================================

export interface DocumentProcessingRequest {
  documentId: string;
  documentType?: string;
  options?: ProcessingOptions;
}

export interface ProcessingOptions {
  ocrEngine?: 'google-vision' | 'tesseract';
  visionModel?: string;
  confidenceThreshold?: number;
  validateResults?: boolean;
  enrichWithLookups?: boolean;
}

export interface DocumentProcessingResponse {
  success: boolean;
  jobId: string;
  result?: ExtractionResult;
  error?: string;
}
