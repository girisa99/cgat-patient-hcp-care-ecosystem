/**
 * Document Processing Components Export
 * Real-time document upload, processing, metadata extraction, and form mapping
 */

export { DocumentUploadProcessor } from './DocumentUploadProcessor';
export { useDocumentProcessing } from '@/hooks/useDocumentProcessing';
export type { 
  DocumentJob, 
  ExtractedMetadata, 
  EntityExtraction, 
  FormFieldExtraction, 
  ProcessingConfig, 
  FormMapping 
} from '@/hooks/useDocumentProcessing';
