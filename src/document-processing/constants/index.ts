/**
 * Document Processing Constants
 * 
 * Centralized constants for the Document Processing module.
 */

// ============================================================================
// PROCESSING STAGES
// ============================================================================

export const PROCESSING_STAGES = {
  UPLOAD: 'upload',
  OCR: 'ocr',
  EXTRACTION: 'extraction',
  VALIDATION: 'validation',
  ENRICHMENT: 'enrichment',
  COMPLETE: 'complete',
  ERROR: 'error',
} as const;

export const PROCESSING_STAGE_LABELS: Record<string, string> = {
  [PROCESSING_STAGES.UPLOAD]: 'Uploading Document',
  [PROCESSING_STAGES.OCR]: 'OCR Processing',
  [PROCESSING_STAGES.EXTRACTION]: 'Field Extraction',
  [PROCESSING_STAGES.VALIDATION]: 'Validation',
  [PROCESSING_STAGES.ENRICHMENT]: 'Data Enrichment',
  [PROCESSING_STAGES.COMPLETE]: 'Complete',
  [PROCESSING_STAGES.ERROR]: 'Error',
};

// ============================================================================
// AI MODELS
// ============================================================================

export const AI_MODELS = {
  GEMINI_PRO_VISION: 'gemini-2.5-flash',
  GEMINI_1_5_PRO: 'gemini-2.5-pro',
  GPT_4O_VISION: 'gpt-4o',
  GPT_4O: 'gpt-4o',
  CLAUDE_OPUS_4_5: 'claude-opus-4-5',
  CLAUDE_SONNET_4_5: 'claude-sonnet-4-5',
} as const;

export const OCR_ENGINES = {
  GOOGLE_VISION: 'google-vision',
  TESSERACT: 'tesseract',
  AWS_TEXTRACT: 'aws-textract',
} as const;

// ============================================================================
// DOCUMENT CATEGORIES
// ============================================================================

export const DOCUMENT_CATEGORIES = {
  MEDICAL: 'medical',
  FINANCIAL: 'financial',
  INSURANCE: 'insurance',
  LEGAL: 'legal',
  ADMINISTRATIVE: 'administrative',
  CUSTOM: 'custom',
} as const;

export const CATEGORY_LABELS: Record<string, string> = {
  [DOCUMENT_CATEGORIES.MEDICAL]: 'Medical Documents',
  [DOCUMENT_CATEGORIES.FINANCIAL]: 'Financial Documents',
  [DOCUMENT_CATEGORIES.INSURANCE]: 'Insurance Documents',
  [DOCUMENT_CATEGORIES.LEGAL]: 'Legal Documents',
  [DOCUMENT_CATEGORIES.ADMINISTRATIVE]: 'Administrative Documents',
  [DOCUMENT_CATEGORIES.CUSTOM]: 'Custom Documents',
};

// ============================================================================
// MEDICAL CODE TYPES
// ============================================================================

export const MEDICAL_CODE_TYPES = {
  NDC: 'ndc', // National Drug Code
  CPT: 'cpt', // Current Procedural Terminology
  ICD_10: 'icd-10', // International Classification of Diseases
  HCPCS: 'hcpcs', // Healthcare Common Procedure Coding System
  RXNORM: 'rxnorm', // RxNorm drug codes
  NPI: 'npi', // National Provider Identifier
  DEA: 'dea', // DEA registration number
} as const;

export const CODE_VALIDATION_PATTERNS: Record<string, RegExp> = {
  [MEDICAL_CODE_TYPES.NDC]: /^\d{4,5}-\d{3,4}-\d{1,2}$/,
  [MEDICAL_CODE_TYPES.CPT]: /^\d{5}$/,
  [MEDICAL_CODE_TYPES.ICD_10]: /^[A-Z]\d{2}(\.\d{1,4})?$/,
  [MEDICAL_CODE_TYPES.HCPCS]: /^[A-V]\d{4}$/,
  [MEDICAL_CODE_TYPES.NPI]: /^\d{10}$/,
  [MEDICAL_CODE_TYPES.DEA]: /^[A-Z]{2}\d{7}$/,
};

// ============================================================================
// CONFIDENCE THRESHOLDS
// ============================================================================

export const CONFIDENCE_THRESHOLDS = {
  HIGH: 0.95,
  MEDIUM: 0.80,
  LOW: 0.60,
  MINIMUM: 0.40,
} as const;

export const CONFIDENCE_LABELS: Record<string, string> = {
  high: 'High Confidence',
  medium: 'Medium Confidence',
  low: 'Low Confidence',
  review: 'Requires Review',
};

// ============================================================================
// FILE CONSTRAINTS
// ============================================================================

export const FILE_CONSTRAINTS = {
  MAX_SIZE_MB: 50,
  MAX_PAGES: 100,
  SUPPORTED_TYPES: [
    'application/pdf',
    'image/png',
    'image/jpeg',
    'image/tiff',
    'image/webp',
  ],
  SUPPORTED_EXTENSIONS: ['.pdf', '.png', '.jpg', '.jpeg', '.tiff', '.webp'],
} as const;

// ============================================================================
// API ENDPOINTS
// ============================================================================

export const EDGE_FUNCTIONS = {
  DOCUMENT_PROCESSOR: 'document-processor',
  PROCESS_DOCUMENTS: 'process-documents',
  EXECUTE_DOCUMENT_AGENT: 'execute-document-agent',
  PDF_VOICE_PROCESSOR: 'pdf-voice-processor',
  FAX_PROCESSING: 'fax-processing',
  EXTRACT_ENROLLMENT_FORM: 'extract-enrollment-form',
  MEDICAL_IMAGING_CNN: 'medical-imaging-cnn',
} as const;

// ============================================================================
// DATABASE TABLES
// ============================================================================

export const DATABASE_TABLES = {
  PROCESSING_JOBS: 'document_processing_jobs',
  PROCESSING_QUEUE: 'document_processing_queue',
  DOCUMENT_METADATA: 'document_metadata',
  EXTRACTED_ENTITIES: 'extracted_entities',
} as const;

// ============================================================================
// ERROR CODES
// ============================================================================

export const ERROR_CODES = {
  UPLOAD_FAILED: 'DOC_001',
  OCR_FAILED: 'DOC_002',
  EXTRACTION_FAILED: 'DOC_003',
  VALIDATION_FAILED: 'DOC_004',
  TIMEOUT: 'DOC_005',
  UNSUPPORTED_FORMAT: 'DOC_006',
  FILE_TOO_LARGE: 'DOC_007',
  PROCESSING_ERROR: 'DOC_008',
} as const;

export const ERROR_MESSAGES: Record<string, string> = {
  [ERROR_CODES.UPLOAD_FAILED]: 'Failed to upload document',
  [ERROR_CODES.OCR_FAILED]: 'OCR processing failed',
  [ERROR_CODES.EXTRACTION_FAILED]: 'Field extraction failed',
  [ERROR_CODES.VALIDATION_FAILED]: 'Validation failed',
  [ERROR_CODES.TIMEOUT]: 'Processing timeout',
  [ERROR_CODES.UNSUPPORTED_FORMAT]: 'Unsupported file format',
  [ERROR_CODES.FILE_TOO_LARGE]: 'File size exceeds limit',
  [ERROR_CODES.PROCESSING_ERROR]: 'General processing error',
};

// ============================================================================
// UI CONSTANTS
// ============================================================================

export const TAB_IDS = {
  UPLOAD: 'upload',
  MEDICATIONS: 'medications',
  INSURANCE: 'insurance',
  PATIENT_INFO: 'patient-info',
  HISTORY: 'history',
  SETTINGS: 'settings',
} as const;

export const DEFAULT_TAB = TAB_IDS.UPLOAD;

// ============================================================================
// METRICS
// ============================================================================

export const DOCUMENT_PROCESSING_PHASE = 'P0-P2' as const;

export const METRICS = {
  EDGE_FUNCTIONS: 7,
  HOOKS: 8,
  COMPONENTS: 50,
  DATABASE_TABLES: 4,
  AI_MODELS_SUPPORTED: 5,
  DOCUMENT_TYPES_SUPPORTED: 15,
} as const;
