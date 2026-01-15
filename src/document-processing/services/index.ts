/**
 * Document Processing Services
 * 
 * Service layer for Document Processing functionality.
 */

import { supabase } from '@/integrations/supabase/client';
import type { 
  DocumentProcessingRequest, 
  DocumentProcessingResponse,
  ExtractionResult,
  ProcessingJob,
  ProcessingOptions,
} from '../types';
import { EDGE_FUNCTIONS, DATABASE_TABLES, ERROR_CODES, ERROR_MESSAGES } from '../constants';

// ============================================================================
// DOCUMENT PROCESSING SERVICE
// ============================================================================

export const documentProcessingService = {
  /**
   * Process a document through the AI pipeline
   */
  async processDocument(
    request: DocumentProcessingRequest
  ): Promise<DocumentProcessingResponse> {
    try {
      const { data, error } = await supabase.functions.invoke(
        EDGE_FUNCTIONS.DOCUMENT_PROCESSOR,
        {
          body: request,
        }
      );

      if (error) {
        throw new Error(error.message);
      }

      return {
        success: true,
        jobId: data.jobId,
        result: data.result,
      };
    } catch (error) {
      console.error('Document processing error:', error);
      return {
        success: false,
        jobId: '',
        error: error instanceof Error ? error.message : ERROR_MESSAGES[ERROR_CODES.PROCESSING_ERROR],
      };
    }
  },

  /**
   * Get processing job status
   */
  async getJobStatus(jobId: string): Promise<any | null> {
    const { data, error } = await supabase
      .from(DATABASE_TABLES.PROCESSING_QUEUE)
      .select('*')
      .eq('id', jobId)
      .single();

    if (error) {
      console.error('Error fetching job status:', error);
      return null;
    }

    return data;
  },

  /**
   * Get processing history
   */
  async getProcessingHistory(
    userId?: string,
    limit = 50
  ): Promise<any[]> {
    let query = supabase
      .from(DATABASE_TABLES.PROCESSING_JOBS)
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (userId) {
      query = query.eq('user_id', userId);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching processing history:', error);
      return [];
    }

    return data || [];
  },

  /**
   * Cancel a processing job
   */
  async cancelJob(jobId: string): Promise<boolean> {
    const { error } = await supabase
      .from(DATABASE_TABLES.PROCESSING_QUEUE)
      .update({ status: 'cancelled' })
      .eq('id', jobId);

    if (error) {
      console.error('Error cancelling job:', error);
      return false;
    }

    return true;
  },
};

// ============================================================================
// OCR SERVICE
// ============================================================================

export const ocrService = {
  /**
   * Perform OCR on a document
   */
  async performOCR(
    documentUrl: string,
    engine: 'google-vision' | 'tesseract' = 'google-vision'
  ): Promise<{ text: string; confidence: number } | null> {
    try {
      const { data, error } = await supabase.functions.invoke(
        EDGE_FUNCTIONS.DOCUMENT_PROCESSOR,
        {
          body: {
            action: 'ocr',
            documentUrl,
            engine,
          },
        }
      );

      if (error) {
        throw new Error(error.message);
      }

      return {
        text: data.text,
        confidence: data.confidence,
      };
    } catch (error) {
      console.error('OCR error:', error);
      return null;
    }
  },
};

// ============================================================================
// MEDICAL DOCUMENT SERVICE
// ============================================================================

export const medicalDocumentService = {
  /**
   * Process a prescription document
   */
  async processPrescription(documentId: string) {
    return documentProcessingService.processDocument({
      documentId,
      documentType: 'prescription',
      options: {
        enrichWithLookups: true,
        validateResults: true,
      },
    });
  },

  /**
   * Process an insurance card
   */
  async processInsuranceCard(documentId: string) {
    return documentProcessingService.processDocument({
      documentId,
      documentType: 'insurance-card',
      options: {
        validateResults: true,
      },
    });
  },

  /**
   * Process a lab result
   */
  async processLabResult(documentId: string) {
    return documentProcessingService.processDocument({
      documentId,
      documentType: 'lab-result',
      options: {
        enrichWithLookups: true,
      },
    });
  },
};

// ============================================================================
// INVOICE SERVICE
// ============================================================================

export const invoiceService = {
  /**
   * Process an invoice document
   */
  async processInvoice(documentId: string) {
    return documentProcessingService.processDocument({
      documentId,
      documentType: 'invoice',
      options: {
        validateResults: true,
      },
    });
  },

  /**
   * Process a medical claim
   */
  async processClaim(documentId: string) {
    return documentProcessingService.processDocument({
      documentId,
      documentType: 'medical-claim',
      options: {
        enrichWithLookups: true,
        validateResults: true,
      },
    });
  },
};

// ============================================================================
// FAX PROCESSING SERVICE
// ============================================================================

export const faxProcessingService = {
  /**
   * Process a fax document
   */
  async processFax(documentId: string) {
    try {
      const { data, error } = await supabase.functions.invoke(
        EDGE_FUNCTIONS.FAX_PROCESSING,
        {
          body: { documentId },
        }
      );

      if (error) {
        throw new Error(error.message);
      }

      return {
        success: true,
        result: data,
      };
    } catch (error) {
      console.error('Fax processing error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Fax processing failed',
      };
    }
  },
};

// ============================================================================
// EXPORT ALL SERVICES
// ============================================================================

export default {
  document: documentProcessingService,
  ocr: ocrService,
  medical: medicalDocumentService,
  invoice: invoiceService,
  fax: faxProcessingService,
};
