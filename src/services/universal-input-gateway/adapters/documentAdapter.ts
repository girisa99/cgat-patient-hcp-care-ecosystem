/**
 * Document Input Adapter
 * 
 * Handles PDF, DOCX, PPTX, and other document formats.
 * Uses the document-processor edge function for extraction.
 */

import { v4 as uuidv4 } from 'uuid';
import { supabase } from '@/integrations/supabase/client';
import type { InputAdapter, RawInput, StandardizedInput, ProcessingOptions } from '../types';

export const documentAdapter: InputAdapter = {
  type: 'document',
  supportedMimeTypes: [
    'application/pdf',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/msword',
    'application/vnd.ms-powerpoint',
    'application/vnd.ms-excel'
  ],

  canHandle(input: RawInput): boolean {
    if (input.type === 'document') return true;
    if (input.source instanceof File) {
      return this.supportedMimeTypes.includes(input.source.type) ||
             /\.(pdf|docx?|pptx?|xlsx?)$/i.test(input.source.name);
    }
    return false;
  },

  validate(input: RawInput) {
    const errors: string[] = [];
    
    if (!(input.source instanceof File) && !(input.source instanceof Blob)) {
      errors.push('Document input must be a File or Blob');
    }
    
    const file = input.source as File;
    if (file.size > 50 * 1024 * 1024) {
      errors.push('Document exceeds maximum size (50MB)');
    }
    
    return { valid: errors.length === 0, errors };
  },

  async process(input: RawInput, options?: ProcessingOptions): Promise<StandardizedInput> {
    const file = input.source as File;
    const startTime = new Date();
    
    options?.onProgress?.(10, 'Uploading document...');
    
    // Convert file to base64
    const arrayBuffer = await file.arrayBuffer();
    const base64 = btoa(
      new Uint8Array(arrayBuffer).reduce((data, byte) => data + String.fromCharCode(byte), '')
    );
    
    options?.onProgress?.(30, 'Processing document...');
    
    // Call document processor edge function
    const { data, error } = await supabase.functions.invoke('document-processor', {
      body: {
        file: base64,
        fileName: file.name,
        mimeType: file.type,
        options: {
          extractTables: options?.extractTables ?? true,
          extractImages: options?.extractImages ?? true,
          ocrEnabled: options?.ocrEnabled ?? true
        }
      }
    });
    
    if (error) {
      throw new Error(`Document processing failed: ${error.message}`);
    }
    
    options?.onProgress?.(70, 'Analyzing content...');
    
    const extractedText = data?.text || '';
    const wordCount = extractedText.split(/\s+/).filter(Boolean).length;
    
    // Generate compatibility hints based on extracted content
    const compatibility = generateDocumentCompatibility(extractedText, file.name);
    
    options?.onProgress?.(100, 'Complete');
    
    const result: StandardizedInput = {
      id: uuidv4(),
      type: 'document',
      mode: options?.mode || 'auto',
      raw: {
        source: file,
        fileName: file.name,
        mimeType: file.type
      },
      content: {
        text: extractedText,
        markdown: data?.markdown || extractedText,
        tables: data?.tables || [],
        images: data?.images || [],
        headings: data?.headings || []
      },
      metadata: {
        fileSize: file.size,
        mimeType: file.type,
        pageCount: data?.pageCount,
        author: data?.metadata?.author,
        createdDate: data?.metadata?.createdDate
      },
      analysis: options?.skipAnalysis ? undefined : {
        language: {
          code: data?.language || 'en',
          name: getLanguageName(data?.language || 'en'),
          confidence: 0.9
        },
        contentType: {
          primary: inferDocumentType(file.name, extractedText),
          confidence: 0.8
        },
        sentiment: 'neutral',
        tone: ['professional'],
        entities: data?.entities || [],
        topics: data?.topics || [],
        keywords: data?.keywords || [],
        wordCount,
        readingTime: Math.ceil(wordCount / 200),
        complexity: wordCount > 5000 ? 'complex' : wordCount > 1000 ? 'moderate' : 'simple'
      },
      compatibility,
      processing: {
        status: 'complete',
        startedAt: startTime,
        completedAt: new Date(),
        duration: Date.now() - startTime.getTime(),
        provider: 'document-processor'
      },
      createdAt: startTime,
      updatedAt: new Date()
    };

    return result;
  }
};

function getLanguageName(code: string): string {
  const names: Record<string, string> = {
    en: 'English', zh: 'Chinese', ja: 'Japanese', ko: 'Korean',
    ar: 'Arabic', ru: 'Russian', es: 'Spanish', fr: 'French',
    de: 'German', pt: 'Portuguese', it: 'Italian', hi: 'Hindi'
  };
  return names[code] || 'Unknown';
}

function inferDocumentType(fileName: string, text: string): string {
  const lowerName = fileName.toLowerCase();
  const lowerText = text.toLowerCase();
  
  if (lowerName.includes('pitch') || lowerName.includes('investor')) return 'pitch-deck';
  if (lowerName.includes('proposal')) return 'proposal';
  if (lowerName.includes('report')) return 'report';
  if (lowerName.includes('manual') || lowerName.includes('guide')) return 'documentation';
  
  if (/\b(quarter|q[1-4]|fiscal|revenue)\b/.test(lowerText)) return 'financial';
  if (/\b(patient|clinical|diagnosis)\b/.test(lowerText)) return 'healthcare';
  if (/\b(contract|agreement|terms)\b/.test(lowerText)) return 'legal';
  
  return 'general';
}

function generateDocumentCompatibility(text: string, fileName: string) {
  const lowerText = text.toLowerCase();
  const lowerName = fileName.toLowerCase();
  
  const industries: StandardizedInput['compatibility']['industries'] = [];
  const frameworks: StandardizedInput['compatibility']['frameworks'] = [];
  const visualFeatures: StandardizedInput['compatibility']['visualFeatures'] = [];
  const outputFormats: StandardizedInput['compatibility']['outputFormats'] = [];
  
  // Industry detection
  if (/\b(patient|hospital|pharma|clinical)\b/.test(lowerText)) {
    industries.push({ id: 'healthcare', name: 'Healthcare', confidence: 0.9, reason: 'Healthcare terminology detected' });
  }
  if (/\b(software|saas|api|cloud)\b/.test(lowerText)) {
    industries.push({ id: 'technology', name: 'Technology', confidence: 0.85, reason: 'Tech terms found' });
  }
  if (/\b(investment|portfolio|trading|banking)\b/.test(lowerText)) {
    industries.push({ id: 'finance', name: 'Finance', confidence: 0.85, reason: 'Financial content detected' });
  }
  
  // Template suggestions based on document type
  const templates: StandardizedInput['compatibility']['templates'] = [];
  
  if (lowerName.includes('pitch') || /\b(investor|funding|startup)\b/.test(lowerText)) {
    templates.push({ id: 'pitch-deck', name: 'Pitch Deck', confidence: 0.9, reason: 'Investor-focused content' });
    frameworks.push({ id: 'lean-startup', name: 'Lean Startup', confidence: 0.8, reason: 'Startup content' });
  }
  
  if (/\b(quarterly|annual|report)\b/.test(lowerText)) {
    templates.push({ id: 'quarterly-review', name: 'Quarterly Review', confidence: 0.85, reason: 'Report structure detected' });
  }
  
  // Visual features based on content
  if (/\b(chart|graph|data|metric|%|percent)\b/.test(lowerText)) {
    visualFeatures.push({ id: 'charts', name: 'Charts', confidence: 0.9, reason: 'Data references found' });
  }
  if (/\b(table|comparison|matrix)\b/.test(lowerText)) {
    visualFeatures.push({ id: 'data-tables', name: 'Data Tables', confidence: 0.85, reason: 'Tabular data detected' });
  }
  if (/\b(process|workflow|step|stage)\b/.test(lowerText)) {
    visualFeatures.push({ id: 'diagrams', name: 'Diagrams', confidence: 0.8, reason: 'Process content' });
  }
  
  // Default output formats
  outputFormats.push({ id: 'pptx-export', name: 'PowerPoint', confidence: 0.9, reason: 'Standard presentation' });
  outputFormats.push({ id: 'pdf-export', name: 'PDF', confidence: 0.85, reason: 'Universal format' });
  
  return {
    industries,
    frameworks,
    visualFeatures,
    outputFormats,
    templates,
    warnings: []
  };
}

export default documentAdapter;
