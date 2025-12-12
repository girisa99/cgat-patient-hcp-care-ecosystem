/**
 * Document Processing Components Export
 * Real-time document upload, processing, metadata extraction, and form mapping
 */

export { DocumentUploadProcessor } from './DocumentUploadProcessor';
export { useDocumentProcessing } from '@/hooks/useDocumentProcessing';
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
  ExportOptions
} from '@/hooks/useDocumentProcessing';
