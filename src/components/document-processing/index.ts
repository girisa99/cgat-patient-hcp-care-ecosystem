/**
 * Document Processing Components Export
 * Real-time document upload, processing, metadata extraction, and form mapping
 */

export { DocumentUploadProcessor } from './DocumentUploadProcessor';
export { useDocumentProcessing, DOCUMENT_TYPE_FIELDS } from '@/hooks/useDocumentProcessing';
export type { 
  DocumentJob, 
  DocumentType,
  ExtractedMetadata, 
  EntityExtraction, 
  FormFieldExtraction, 
  ProcessingConfig, 
  FormMapping,
  ExtractedTable,
  SignatureDetection,
  DocumentClassification,
  HandwrittenRegion,
  BoundingBox,
  ValidationRule,
  ValidationStatus,
  ValidationError,
  ValidationWarning,
  BatchProcessingResult,
  ExportOptions,
  ExtractionSummary,
  ExtractionStage,
  LiveExtraction
} from '@/hooks/useDocumentProcessing';
