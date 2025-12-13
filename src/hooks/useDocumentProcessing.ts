/**
 * REAL-TIME DOCUMENT PROCESSING HOOK
 * Handles document upload, processing, metadata extraction, and form mapping
 * with real-time progress updates via Supabase Realtime
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface DocumentJob {
  id: string;
  file_name: string;
  file_path: string;
  mime_type: string;
  status: 'uploaded' | 'processing' | 'completed' | 'error' | 'needs_review';
  progress: number;
  current_stage: string;
  stage_message?: string;
  extracted_text?: string;
  extracted_metadata?: ExtractedMetadata;
  processing_config?: ProcessingConfig;
  created_at: string;
  completed_at?: string;
  error_message?: string;
  document_type?: DocumentType;
  validation_status?: ValidationStatus;
  batch_id?: string;
}

export type DocumentType = 
  | 'invoice' 
  | 'receipt' 
  | 'form' 
  | 'contract' 
  | 'medical_record' 
  | 'insurance_card'
  | 'prescription'
  | 'lab_result'
  | 'identification'
  | 'unknown';

export interface ValidationStatus {
  isValid: boolean;
  errors: ValidationError[];
  warnings: ValidationWarning[];
  requiresManualReview: boolean;
}

export interface ValidationError {
  field: string;
  message: string;
  severity: 'error' | 'warning';
}

export interface ValidationWarning {
  field: string;
  message: string;
  suggestion?: string;
}

export interface ExtractedMetadata {
  title?: string;
  author?: string;
  createdDate?: string;
  modifiedDate?: string;
  pageCount?: number;
  wordCount?: number;
  language?: string;
  keywords?: string[];
  entities?: EntityExtraction[];
  formFields?: FormFieldExtraction[];
  tables?: ExtractedTable[];
  signatures?: SignatureDetection[];
  documentClassification?: DocumentClassification;
  handwrittenRegions?: HandwrittenRegion[];
  extractionSummary?: ExtractionSummary;
}

export interface ExtractionSummary {
  ocrFieldCount: number;
  nlpFieldCount: number;
  totalFields: number;
  ocrProvider: string;
  nlpProvider: string;
}

export interface EntityExtraction {
  type: string;
  value: string;
  confidence: number;
  boundingBox?: BoundingBox;
  verified?: boolean;
  source?: 'ocr' | 'nlp';
}

export interface FormFieldExtraction {
  fieldName: string;
  value: string;
  confidence: number;
  boundingBox?: BoundingBox;
  fieldType?: 'text' | 'date' | 'number' | 'checkbox' | 'signature';
  verified?: boolean;
  originalValue?: string;
}

export interface ExtractedTable {
  id: string;
  rows: TableRow[];
  headers?: string[];
  confidence: number;
  pageNumber?: number;
}

export interface TableRow {
  cells: TableCell[];
}

export interface TableCell {
  value: string;
  confidence: number;
  columnIndex: number;
  rowIndex: number;
}

export interface SignatureDetection {
  id: string;
  detected: boolean;
  boundingBox?: BoundingBox;
  confidence: number;
  signedBy?: string;
  signedDate?: string;
}

export interface DocumentClassification {
  type: DocumentType;
  confidence: number;
  alternativeTypes?: { type: DocumentType; confidence: number }[];
}

export interface HandwrittenRegion {
  id: string;
  text: string;
  confidence: number;
  boundingBox?: BoundingBox;
}

export interface BoundingBox {
  x: number;
  y: number;
  width: number;
  height: number;
  pageNumber?: number;
}

export interface ProcessingConfig {
  enableOCR?: boolean;
  enableHandwritingRecognition?: boolean;
  enableTableExtraction?: boolean;
  enableSignatureDetection?: boolean;
  enableDocumentClassification?: boolean;
  enableMetadataExtraction?: boolean;
  targetFormId?: string;
  extractionFields?: string[];
  confidenceThreshold?: number;
  validationRules?: ValidationRule[];
  language?: string;
  ocrProvider?: 'google' | 'azure' | 'aws';
}

export interface ValidationRule {
  fieldName: string;
  type: 'required' | 'format' | 'range' | 'custom';
  pattern?: string;
  min?: number;
  max?: number;
  message?: string;
}

export interface FormMapping {
  [fieldName: string]: {
    value: string;
    confidence: number;
    source: string;
    verified?: boolean;
    originalValue?: string;
    fieldType?: string;
  };
}

export interface BatchProcessingResult {
  batchId: string;
  totalDocuments: number;
  processed: number;
  failed: number;
  jobs: DocumentJob[];
}

export interface ExportOptions {
  format: 'json' | 'csv' | 'xlsx';
  includeMetadata?: boolean;
  includeRawText?: boolean;
  fields?: string[];
}

export interface UseDocumentProcessingReturn {
  // State
  jobs: DocumentJob[];
  activeJob: DocumentJob | null;
  isUploading: boolean;
  isProcessing: boolean;
  uploadProgress: number;
  formMapping: FormMapping | null;
  batchProgress: { total: number; completed: number } | null;
  
  // Actions
  uploadDocument: (file: File, config?: ProcessingConfig) => Promise<string | null>;
  uploadBatch: (files: File[], config?: ProcessingConfig) => Promise<BatchProcessingResult | null>;
  processDocument: (documentId: string) => Promise<boolean>;
  extractMetadata: (documentId: string) => Promise<ExtractedMetadata | null>;
  mapToForm: (documentId: string, targetFields: string[]) => Promise<FormMapping | null>;
  cancelJob: (documentId: string) => Promise<void>;
  clearJobs: () => void;
  
  // Verification & Editing
  updateFieldValue: (documentId: string, fieldName: string, newValue: string) => Promise<boolean>;
  verifyField: (documentId: string, fieldName: string) => Promise<boolean>;
  flagForReview: (documentId: string, reason: string) => Promise<boolean>;
  
  // Export
  exportResults: (documentId: string, options: ExportOptions) => Promise<Blob | null>;
  
  // Real-time subscription
  subscribeToJob: (documentId: string) => void;
  unsubscribeFromJob: () => void;
}

export function useDocumentProcessing(): UseDocumentProcessingReturn {
  const [jobs, setJobs] = useState<DocumentJob[]>([]);
  const [activeJob, setActiveJob] = useState<DocumentJob | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [formMapping, setFormMapping] = useState<FormMapping | null>(null);
  
  const subscriptionRef = useRef<any>(null);
  const activeJobIdRef = useRef<string | null>(null);

  // Load existing jobs on mount
  useEffect(() => {
    loadJobs();
    return () => {
      if (subscriptionRef.current) {
        supabase.removeChannel(subscriptionRef.current);
      }
    };
  }, []);

  const loadJobs = async () => {
    try {
      const { data, error } = await (supabase as any)
        .from('document_processing_jobs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) {
        console.error('Failed to load jobs:', error);
        return;
      }

      setJobs(data || []);
    } catch (e) {
      console.error('Error loading jobs:', e);
    }
  };

  const subscribeToJob = useCallback((documentId: string) => {
    // Clean up existing subscription
    if (subscriptionRef.current) {
      supabase.removeChannel(subscriptionRef.current);
    }

    activeJobIdRef.current = documentId;
    console.log(`Subscribing to document job: ${documentId}`);

    const channel = supabase
      .channel(`document-job-${documentId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'document_processing_jobs',
          filter: `id=eq.${documentId}`
        },
        (payload) => {
          console.log('Real-time update received:', payload.new);
          const updatedJob = payload.new as DocumentJob;
          
          setActiveJob(updatedJob);
          setJobs(prev => prev.map(j => j.id === documentId ? updatedJob : j));
          
          // Update processing state based on status
          if (updatedJob.status === 'completed') {
            setIsProcessing(false);
            toast.success('Document processing completed!');
          } else if (updatedJob.status === 'error') {
            setIsProcessing(false);
            toast.error(`Processing failed: ${updatedJob.error_message || 'Unknown error'}`);
          }
        }
      )
      .subscribe((status) => {
        console.log(`Subscription status: ${status}`);
      });

    subscriptionRef.current = channel;
  }, []);

  const unsubscribeFromJob = useCallback(() => {
    if (subscriptionRef.current) {
      supabase.removeChannel(subscriptionRef.current);
      subscriptionRef.current = null;
    }
    activeJobIdRef.current = null;
  }, []);

  const uploadDocument = useCallback(async (
    file: File, 
    config?: ProcessingConfig
  ): Promise<string | null> => {
    setIsUploading(true);
    setUploadProgress(0);

    try {
      // Convert file to base64
      const reader = new FileReader();
      const base64Promise = new Promise<string>((resolve, reject) => {
        reader.onload = () => {
          const base64 = (reader.result as string).split(',')[1];
          resolve(base64);
        };
        reader.onerror = reject;
        reader.onprogress = (e) => {
          if (e.lengthComputable) {
            setUploadProgress(Math.round((e.loaded / e.total) * 50));
          }
        };
      });
      
      reader.readAsDataURL(file);
      const fileBase64 = await base64Promise;
      setUploadProgress(60);

      // Call edge function
      const { data, error } = await supabase.functions.invoke('document-processor', {
        body: {
          action: 'upload',
          fileBase64,
          fileName: file.name,
          mimeType: file.type,
          processingConfig: config
        }
      });

      setUploadProgress(100);

      if (error || !data?.success) {
        throw new Error(error?.message || data?.error || 'Upload failed');
      }

      const documentId = data.documentId;
      
      // Refresh jobs and subscribe
      await loadJobs();
      subscribeToJob(documentId);
      
      toast.success('Document uploaded successfully');
      return documentId;
    } catch (e) {
      console.error('Upload error:', e);
      toast.error(`Upload failed: ${e instanceof Error ? e.message : 'Unknown error'}`);
      return null;
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  }, [subscribeToJob]);

  const processDocument = useCallback(async (documentId: string): Promise<boolean> => {
    setIsProcessing(true);
    subscribeToJob(documentId);

    try {
      const { data, error } = await supabase.functions.invoke('document-processor', {
        body: {
          action: 'process',
          documentId
        }
      });

      if (error || !data?.success) {
        throw new Error(error?.message || data?.error || 'Processing failed');
      }

      // Update active job with result
      if (data.metadata) {
        setActiveJob(prev => prev ? { ...prev, extracted_metadata: data.metadata } : null);
      }

      await loadJobs();
      return true;
    } catch (e) {
      console.error('Processing error:', e);
      toast.error(`Processing failed: ${e instanceof Error ? e.message : 'Unknown error'}`);
      setIsProcessing(false);
      return false;
    }
  }, [subscribeToJob]);

  const extractMetadata = useCallback(async (documentId: string): Promise<ExtractedMetadata | null> => {
    try {
      const { data, error } = await supabase.functions.invoke('document-processor', {
        body: {
          action: 'extract_metadata',
          documentId
        }
      });

      if (error || !data?.success) {
        throw new Error(error?.message || data?.error || 'Metadata extraction failed');
      }

      return data.metadata;
    } catch (e) {
      console.error('Metadata extraction error:', e);
      toast.error(`Metadata extraction failed: ${e instanceof Error ? e.message : 'Unknown error'}`);
      return null;
    }
  }, []);

  const mapToForm = useCallback(async (
    documentId: string, 
    targetFields: string[]
  ): Promise<FormMapping | null> => {
    try {
      const { data, error } = await supabase.functions.invoke('document-processor', {
        body: {
          action: 'map_to_form',
          documentId,
          processingConfig: { extractionFields: targetFields }
        }
      });

      if (error || !data?.success) {
        throw new Error(error?.message || data?.error || 'Form mapping failed');
      }

      setFormMapping(data.formMapping);
      
      if (data.unmappedFields?.length > 0) {
        toast.info(`${data.unmappedFields.length} fields could not be mapped automatically`);
      }

      return data.formMapping;
    } catch (e) {
      console.error('Form mapping error:', e);
      toast.error(`Form mapping failed: ${e instanceof Error ? e.message : 'Unknown error'}`);
      return null;
    }
  }, []);

  const cancelJob = useCallback(async (documentId: string) => {
    try {
      await (supabase as any)
        .from('document_processing_jobs')
        .update({ status: 'cancelled' })
        .eq('id', documentId);
      
      unsubscribeFromJob();
      setIsProcessing(false);
      await loadJobs();
      toast.info('Job cancelled');
    } catch (e) {
      console.error('Cancel error:', e);
    }
  }, [unsubscribeFromJob]);

  const clearJobs = useCallback(() => {
    setJobs([]);
    setActiveJob(null);
    setFormMapping(null);
  }, []);

  // Batch upload
  const [batchProgress, setBatchProgress] = useState<{ total: number; completed: number } | null>(null);

  const uploadBatch = useCallback(async (
    files: File[], 
    config?: ProcessingConfig
  ): Promise<BatchProcessingResult | null> => {
    const batchId = `batch_${Date.now()}`;
    setBatchProgress({ total: files.length, completed: 0 });
    
    const results: DocumentJob[] = [];
    let failed = 0;

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      try {
        const documentId = await uploadDocument(file, { ...config });
        if (documentId) {
          const job = jobs.find(j => j.id === documentId);
          if (job) results.push({ ...job, batch_id: batchId });
        }
      } catch (e) {
        failed++;
      }
      setBatchProgress({ total: files.length, completed: i + 1 });
    }

    setBatchProgress(null);
    await loadJobs();

    return {
      batchId,
      totalDocuments: files.length,
      processed: results.length,
      failed,
      jobs: results
    };
  }, [uploadDocument, jobs]);

  // Update field value with verification
  const updateFieldValue = useCallback(async (
    documentId: string, 
    fieldName: string, 
    newValue: string
  ): Promise<boolean> => {
    try {
      const { data: doc, error: fetchError } = await (supabase as any)
        .from('document_processing_jobs')
        .select('extracted_metadata')
        .eq('id', documentId)
        .single();

      if (fetchError || !doc) throw new Error('Document not found');

      const metadata = doc.extracted_metadata || {};
      const formFields = metadata.formFields || [];
      const updatedFields = formFields.map((f: FormFieldExtraction) => 
        f.fieldName === fieldName 
          ? { ...f, value: newValue, verified: true, originalValue: f.originalValue || f.value }
          : f
      );

      const { error: updateError } = await (supabase as any)
        .from('document_processing_jobs')
        .update({ 
          extracted_metadata: { ...metadata, formFields: updatedFields }
        })
        .eq('id', documentId);

      if (updateError) throw updateError;

      // Update form mapping
      if (formMapping && formMapping[fieldName]) {
        setFormMapping({
          ...formMapping,
          [fieldName]: { 
            ...formMapping[fieldName], 
            value: newValue, 
            verified: true,
            originalValue: formMapping[fieldName].originalValue || formMapping[fieldName].value
          }
        });
      }

      await loadJobs();
      toast.success(`Field "${fieldName}" updated`);
      return true;
    } catch (e) {
      console.error('Update field error:', e);
      toast.error(`Failed to update field: ${e instanceof Error ? e.message : 'Unknown error'}`);
      return false;
    }
  }, [formMapping]);

  // Verify field
  const verifyField = useCallback(async (
    documentId: string, 
    fieldName: string
  ): Promise<boolean> => {
    try {
      const { data: doc, error: fetchError } = await (supabase as any)
        .from('document_processing_jobs')
        .select('extracted_metadata')
        .eq('id', documentId)
        .single();

      if (fetchError || !doc) throw new Error('Document not found');

      const metadata = doc.extracted_metadata || {};
      const formFields = metadata.formFields || [];
      const updatedFields = formFields.map((f: FormFieldExtraction) => 
        f.fieldName === fieldName ? { ...f, verified: true } : f
      );

      await (supabase as any)
        .from('document_processing_jobs')
        .update({ 
          extracted_metadata: { ...metadata, formFields: updatedFields }
        })
        .eq('id', documentId);

      if (formMapping && formMapping[fieldName]) {
        setFormMapping({
          ...formMapping,
          [fieldName]: { ...formMapping[fieldName], verified: true }
        });
      }

      return true;
    } catch (e) {
      console.error('Verify field error:', e);
      return false;
    }
  }, [formMapping]);

  // Flag for manual review
  const flagForReview = useCallback(async (
    documentId: string, 
    reason: string
  ): Promise<boolean> => {
    try {
      await (supabase as any)
        .from('document_processing_jobs')
        .update({ 
          status: 'needs_review',
          stage_message: reason
        })
        .eq('id', documentId);

      await loadJobs();
      toast.info('Document flagged for review');
      return true;
    } catch (e) {
      console.error('Flag for review error:', e);
      return false;
    }
  }, []);

  // Export results
  const exportResults = useCallback(async (
    documentId: string, 
    options: ExportOptions
  ): Promise<Blob | null> => {
    try {
      const { data: doc, error } = await (supabase as any)
        .from('document_processing_jobs')
        .select('*')
        .eq('id', documentId)
        .single();

      if (error || !doc) throw new Error('Document not found');

      let exportData: any;
      const metadata = doc.extracted_metadata || {};

      if (options.format === 'json') {
        exportData = {
          documentId: doc.id,
          fileName: doc.file_name,
          status: doc.status,
          processedAt: doc.completed_at,
          fields: options.fields 
            ? metadata.formFields?.filter((f: FormFieldExtraction) => options.fields?.includes(f.fieldName))
            : metadata.formFields,
          entities: metadata.entities,
          ...(options.includeMetadata && { metadata }),
          ...(options.includeRawText && { extractedText: doc.extracted_text })
        };
        return new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
      } else if (options.format === 'csv') {
        const fields = metadata.formFields || [];
        const headers = ['Field Name', 'Value', 'Confidence', 'Verified'];
        const rows = fields.map((f: FormFieldExtraction) => 
          [f.fieldName, f.value, (f.confidence * 100).toFixed(1) + '%', f.verified ? 'Yes' : 'No']
        );
        const csv = [headers, ...rows].map(row => row.join(',')).join('\n');
        return new Blob([csv], { type: 'text/csv' });
      }

      return null;
    } catch (e) {
      console.error('Export error:', e);
      toast.error('Export failed');
      return null;
    }
  }, []);

  return {
    jobs,
    activeJob,
    isUploading,
    isProcessing,
    uploadProgress,
    formMapping,
    batchProgress,
    uploadDocument,
    uploadBatch,
    processDocument,
    extractMetadata,
    mapToForm,
    cancelJob,
    clearJobs,
    updateFieldValue,
    verifyField,
    flagForReview,
    exportResults,
    subscribeToJob,
    unsubscribeFromJob
  };
}
