/**
 * Document Processing Metrics
 * 
 * Centralized metrics for Document Processing module.
 * Used by Command Center for architecture views.
 */

import { METRICS } from './constants';

// ============================================================================
// DOCUMENT PROCESSING SPECIFIC METRICS
// ============================================================================

export const DOCUMENT_PROCESSING_COUNTS = {
  edgeFunctions: METRICS.EDGE_FUNCTIONS,
  hooks: METRICS.HOOKS,
  components: METRICS.COMPONENTS,
  databaseTables: METRICS.DATABASE_TABLES,
  aiModelsSupported: METRICS.AI_MODELS_SUPPORTED,
  documentTypesSupported: METRICS.DOCUMENT_TYPES_SUPPORTED,
  pipelineStages: 5, // OCR, Extraction, Validation, Enrichment, Complete
  ocrEngines: 2, // Google Vision, Tesseract
} as const;

// ============================================================================
// EDGE FUNCTION DETAILS
// ============================================================================

export const DOCUMENT_PROCESSING_EDGE_FUNCTIONS = [
  {
    name: 'document-processor',
    purpose: 'Core multi-model OCR/Extraction',
    phase: 'P0',
    status: 'production',
    aiModels: ['gemini-pro-vision', 'gpt-4-vision'],
  },
  {
    name: 'process-documents',
    purpose: 'Legacy document extraction',
    phase: 'P0',
    status: 'production',
    aiModels: ['gemini-pro'],
  },
  {
    name: 'execute-document-agent',
    purpose: 'Workflow integration',
    phase: 'P1',
    status: 'production',
    aiModels: ['gemini-pro'],
  },
  {
    name: 'pdf-voice-processor',
    purpose: 'Voice-enabled PDF reading',
    phase: 'P1',
    status: 'production',
    aiModels: ['elevenlabs', 'google-tts'],
  },
  {
    name: 'fax-processing',
    purpose: 'Fax-specific OCR',
    phase: 'P1',
    status: 'production',
    aiModels: ['google-vision'],
  },
  {
    name: 'extract-enrollment-form',
    purpose: 'Enrollment form extraction',
    phase: 'P1',
    status: 'production',
    aiModels: ['gemini-pro-vision'],
  },
  {
    name: 'medical-imaging-cnn',
    purpose: 'CNN-based medical imaging',
    phase: 'P2',
    status: 'production',
    aiModels: ['custom-cnn'],
  },
] as const;

// ============================================================================
// HOOK DETAILS
// ============================================================================

export const DOCUMENT_PROCESSING_HOOKS = [
  {
    name: 'useDocumentExtraction',
    purpose: 'OCR + extraction pipeline',
    lines: 610,
    complexity: 'high',
  },
  {
    name: 'useDocumentProcessingState',
    purpose: 'Central state management',
    lines: 326,
    complexity: 'high',
    variables: 50,
  },
  {
    name: 'useMedicationSearch',
    purpose: 'RxNorm/NDC lookups',
    lines: 509,
    complexity: 'medium',
  },
  {
    name: 'useMedicationProcessing',
    purpose: 'Medication data processing',
    lines: 200,
    complexity: 'medium',
  },
  {
    name: 'useDocumentRouterOrchestrator',
    purpose: 'Multi-model routing',
    lines: 150,
    complexity: 'medium',
  },
  {
    name: 'useModelRouting',
    purpose: 'AI model selection',
    lines: 100,
    complexity: 'low',
  },
  {
    name: 'useDocumentAI',
    purpose: 'AI document analysis',
    lines: 180,
    complexity: 'medium',
  },
  {
    name: 'useInsurancePipeline',
    purpose: 'Insurance document processing',
    lines: 250,
    complexity: 'medium',
  },
] as const;

// ============================================================================
// DATABASE TABLE DETAILS
// ============================================================================

export const DOCUMENT_PROCESSING_TABLES = [
  {
    name: 'document_processing_jobs',
    purpose: 'Job tracking',
    columns: 15,
    hasRLS: true,
  },
  {
    name: 'document_processing_queue',
    purpose: 'Processing queue',
    columns: 12,
    hasRLS: true,
  },
  {
    name: 'document_metadata',
    purpose: 'Document metadata',
    columns: 18,
    hasRLS: true,
  },
  {
    name: 'extracted_entities',
    purpose: 'Extracted data entities',
    columns: 20,
    hasRLS: true,
  },
] as const;

// ============================================================================
// AI PIPELINE METRICS
// ============================================================================

export const AI_PIPELINE_METRICS = {
  avgProcessingTime: '3.2s',
  avgConfidenceScore: 0.94,
  successRate: 0.987,
  documentTypesProcessed: 15,
  dailyVolume: '500+',
} as const;

// ============================================================================
// PHASE BREAKDOWN
// ============================================================================

export const DOCUMENT_PROCESSING_PHASES = {
  P0: {
    name: 'Core OCR Pipeline',
    status: 'complete',
    features: ['Two-stage pipeline', 'Multi-model routing', 'Basic extraction'],
    completionPercentage: 100,
  },
  P1: {
    name: 'Medical Documents',
    status: 'complete',
    features: ['Prescription processing', 'Insurance cards', 'Fax processing'],
    completionPercentage: 100,
  },
  P2: {
    name: 'Advanced Processing',
    status: 'complete',
    features: ['Medical imaging CNN', 'Invoice RCM', 'Real-time tracking'],
    completionPercentage: 100,
  },
  P3: {
    name: 'Agent Integration',
    status: 'in-progress',
    features: ['Workflow agents', 'Auto-routing', 'Quality scoring'],
    completionPercentage: 60,
  },
} as const;

// ============================================================================
// EXPORT SUMMARY FOR COMMAND CENTER
// ============================================================================

export const DOCUMENT_PROCESSING_SUMMARY = {
  product: 'Document Processing',
  phase: 'P0-P2 Complete, P3 In Progress',
  overallCompletion: 90,
  metrics: DOCUMENT_PROCESSING_COUNTS,
  edgeFunctions: DOCUMENT_PROCESSING_EDGE_FUNCTIONS,
  hooks: DOCUMENT_PROCESSING_HOOKS,
  tables: DOCUMENT_PROCESSING_TABLES,
  phases: DOCUMENT_PROCESSING_PHASES,
  pipeline: AI_PIPELINE_METRICS,
} as const;

export default DOCUMENT_PROCESSING_SUMMARY;
