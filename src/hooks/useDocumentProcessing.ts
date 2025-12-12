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
  status: 'uploaded' | 'processing' | 'completed' | 'error';
  progress: number;
  current_stage: string;
  stage_message?: string;
  extracted_text?: string;
  extracted_metadata?: ExtractedMetadata;
  processing_config?: ProcessingConfig;
  created_at: string;
  completed_at?: string;
  error_message?: string;
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
}

export interface EntityExtraction {
  type: string;
  value: string;
  confidence: number;
}

export interface FormFieldExtraction {
  fieldName: string;
  value: string;
  confidence: number;
}

export interface ProcessingConfig {
  enableOCR?: boolean;
  enableMetadataExtraction?: boolean;
  targetFormId?: string;
  extractionFields?: string[];
}

export interface FormMapping {
  [fieldName: string]: {
    value: string;
    confidence: number;
    source: string;
  };
}

export interface UseDocumentProcessingReturn {
  // State
  jobs: DocumentJob[];
  activeJob: DocumentJob | null;
  isUploading: boolean;
  isProcessing: boolean;
  uploadProgress: number;
  formMapping: FormMapping | null;
  
  // Actions
  uploadDocument: (file: File, config?: ProcessingConfig) => Promise<string | null>;
  processDocument: (documentId: string) => Promise<boolean>;
  extractMetadata: (documentId: string) => Promise<ExtractedMetadata | null>;
  mapToForm: (documentId: string, targetFields: string[]) => Promise<FormMapping | null>;
  cancelJob: (documentId: string) => Promise<void>;
  clearJobs: () => void;
  
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

  return {
    jobs,
    activeJob,
    isUploading,
    isProcessing,
    uploadProgress,
    formMapping,
    uploadDocument,
    processDocument,
    extractMetadata,
    mapToForm,
    cancelJob,
    clearJobs,
    subscribeToJob,
    unsubscribeFromJob
  };
}
