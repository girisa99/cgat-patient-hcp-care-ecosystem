import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface ProcessingRequest {
  action: 'upload' | 'process' | 'extract_metadata' | 'map_to_form';
  documentId?: string;
  fileBase64?: string;
  fileName?: string;
  mimeType?: string;
  processingConfig?: {
    enableOCR?: boolean;
    enableMetadataExtraction?: boolean;
    targetFormId?: string;
    extractionFields?: string[];
  };
}

interface ExtractedMetadata {
  title?: string;
  author?: string;
  createdDate?: string;
  modifiedDate?: string;
  pageCount?: number;
  wordCount?: number;
  language?: string;
  keywords?: string[];
  entities?: { type: string; value: string; confidence: number }[];
  formFields?: { fieldName: string; value: string; confidence: number }[];
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL") as string;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") as string;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const request: ProcessingRequest = await req.json();
    console.log(`Document processor action: ${request.action}`);

    switch (request.action) {
      case 'upload':
        return await handleUpload(supabase, request);
      case 'process':
        return await handleProcess(supabase, request);
      case 'extract_metadata':
        return await handleMetadataExtraction(supabase, request);
      case 'map_to_form':
        return await handleFormMapping(supabase, request);
      default:
        throw new Error(`Unknown action: ${request.action}`);
    }
  } catch (error) {
    console.error("Document processor error:", error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error'
      }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
});

async function handleUpload(supabase: any, request: ProcessingRequest) {
  const { fileBase64, fileName, mimeType, processingConfig } = request;
  
  if (!fileBase64 || !fileName) {
    throw new Error("Missing file data or filename");
  }

  console.log(`Uploading document: ${fileName}`);

  // Decode base64 and upload to storage
  const fileData = Uint8Array.from(atob(fileBase64), c => c.charCodeAt(0));
  const filePath = `documents/${Date.now()}_${fileName}`;

  const { data: uploadData, error: uploadError } = await supabase.storage
    .from('document-processing')
    .upload(filePath, fileData, {
      contentType: mimeType || 'application/octet-stream',
      upsert: false
    });

  if (uploadError) {
    console.error("Upload error:", uploadError);
    throw new Error(`Upload failed: ${uploadError.message}`);
  }

  // Create processing record
  const { data: record, error: recordError } = await supabase
    .from('document_processing_jobs')
    .insert({
      file_name: fileName,
      file_path: filePath,
      mime_type: mimeType,
      status: 'uploaded',
      processing_config: processingConfig || {},
      progress: 0,
      stages: { upload: { status: 'completed', timestamp: new Date().toISOString() } }
    })
    .select()
    .single();

  if (recordError) {
    console.error("Record creation error:", recordError);
    throw new Error(`Failed to create processing record: ${recordError.message}`);
  }

  console.log(`Document uploaded successfully: ${record.id}`);

  return new Response(
    JSON.stringify({ 
      success: true, 
      documentId: record.id,
      filePath,
      status: 'uploaded'
    }),
    { headers: { "Content-Type": "application/json", ...corsHeaders } }
  );
}

async function handleProcess(supabase: any, request: ProcessingRequest) {
  const { documentId } = request;
  
  if (!documentId) {
    throw new Error("Missing documentId");
  }

  console.log(`Processing document: ${documentId}`);

  // Get document record
  const { data: doc, error: docError } = await supabase
    .from('document_processing_jobs')
    .select('*')
    .eq('id', documentId)
    .single();

  if (docError || !doc) {
    throw new Error(`Document not found: ${docError?.message}`);
  }

  const stages = doc.stages || {};
  const config = doc.processing_config || {};

  // Stage 1: Text Extraction (OCR if needed)
  await updateProgress(supabase, documentId, 10, 'extraction', 'in_progress');
  
  let extractedText = '';
  try {
    // Download file from storage
    const { data: fileData, error: downloadError } = await supabase.storage
      .from('document-processing')
      .download(doc.file_path);

    if (downloadError) {
      throw new Error(`Failed to download file: ${downloadError.message}`);
    }

    // Simulate OCR/text extraction based on file type
    if (doc.mime_type?.includes('pdf') || doc.mime_type?.includes('image')) {
      await updateProgress(supabase, documentId, 20, 'extraction', 'in_progress', 'Running OCR...');
      // Simulate OCR processing time
      await delay(1000);
      extractedText = await simulateOCRExtraction(fileData);
    } else {
      extractedText = await fileData.text();
    }

    await updateProgress(supabase, documentId, 30, 'extraction', 'completed');
  } catch (e) {
    console.error("Extraction error:", e);
    await updateProgress(supabase, documentId, 30, 'extraction', 'error', String(e));
    throw e;
  }

  // Stage 2: Content Analysis
  await updateProgress(supabase, documentId, 40, 'analysis', 'in_progress');
  await delay(800);
  
  const analysisResult = analyzeContent(extractedText);
  await updateProgress(supabase, documentId, 50, 'analysis', 'completed');

  // Stage 3: Entity Extraction
  await updateProgress(supabase, documentId, 60, 'entity_extraction', 'in_progress');
  await delay(600);
  
  const entities = extractEntities(extractedText);
  await updateProgress(supabase, documentId, 70, 'entity_extraction', 'completed');

  // Stage 4: Metadata Generation
  await updateProgress(supabase, documentId, 80, 'metadata', 'in_progress');
  await delay(400);
  
  const metadata: ExtractedMetadata = {
    title: doc.file_name.replace(/\.[^.]+$/, ''),
    pageCount: analysisResult.pageCount,
    wordCount: analysisResult.wordCount,
    language: analysisResult.language,
    keywords: analysisResult.keywords,
    entities,
    formFields: config.extractionFields ? extractFormFields(extractedText, config.extractionFields) : []
  };

  await updateProgress(supabase, documentId, 90, 'metadata', 'completed');

  // Stage 5: Finalize
  const { error: updateError } = await supabase
    .from('document_processing_jobs')
    .update({
      status: 'completed',
      progress: 100,
      extracted_text: extractedText.substring(0, 50000), // Limit stored text
      extracted_metadata: metadata,
      completed_at: new Date().toISOString(),
      stages: {
        ...stages,
        extraction: { status: 'completed', timestamp: new Date().toISOString() },
        analysis: { status: 'completed', timestamp: new Date().toISOString() },
        entity_extraction: { status: 'completed', timestamp: new Date().toISOString() },
        metadata: { status: 'completed', timestamp: new Date().toISOString() },
        finalized: { status: 'completed', timestamp: new Date().toISOString() }
      }
    })
    .eq('id', documentId);

  if (updateError) {
    throw new Error(`Failed to finalize: ${updateError.message}`);
  }

  console.log(`Document processing completed: ${documentId}`);

  return new Response(
    JSON.stringify({ 
      success: true, 
      documentId,
      status: 'completed',
      metadata,
      extractedTextPreview: extractedText.substring(0, 500)
    }),
    { headers: { "Content-Type": "application/json", ...corsHeaders } }
  );
}

async function handleMetadataExtraction(supabase: any, request: ProcessingRequest) {
  const { documentId } = request;
  
  if (!documentId) {
    throw new Error("Missing documentId");
  }

  const { data: doc, error } = await supabase
    .from('document_processing_jobs')
    .select('extracted_metadata, extracted_text, status')
    .eq('id', documentId)
    .single();

  if (error || !doc) {
    throw new Error(`Document not found: ${error?.message}`);
  }

  return new Response(
    JSON.stringify({ 
      success: true, 
      documentId,
      metadata: doc.extracted_metadata,
      status: doc.status
    }),
    { headers: { "Content-Type": "application/json", ...corsHeaders } }
  );
}

async function handleFormMapping(supabase: any, request: ProcessingRequest) {
  const { documentId, processingConfig } = request;
  
  if (!documentId) {
    throw new Error("Missing documentId");
  }

  const { data: doc, error } = await supabase
    .from('document_processing_jobs')
    .select('extracted_metadata, extracted_text')
    .eq('id', documentId)
    .single();

  if (error || !doc) {
    throw new Error(`Document not found: ${error?.message}`);
  }

  const targetFields = processingConfig?.extractionFields || [];
  const formMapping: Record<string, { value: string; confidence: number; source: string }> = {};

  // Map extracted data to form fields
  const metadata = doc.extracted_metadata || {};
  const formFields = metadata.formFields || [];

  for (const field of targetFields) {
    const matchedField = formFields.find((f: any) => 
      f.fieldName.toLowerCase().includes(field.toLowerCase()) ||
      field.toLowerCase().includes(f.fieldName.toLowerCase())
    );

    if (matchedField) {
      formMapping[field] = {
        value: matchedField.value,
        confidence: matchedField.confidence,
        source: 'extracted'
      };
    } else {
      // Try to find in entities
      const entity = metadata.entities?.find((e: any) => 
        e.type.toLowerCase().includes(field.toLowerCase())
      );
      if (entity) {
        formMapping[field] = {
          value: entity.value,
          confidence: entity.confidence,
          source: 'entity'
        };
      }
    }
  }

  return new Response(
    JSON.stringify({ 
      success: true, 
      documentId,
      formMapping,
      unmappedFields: targetFields.filter(f => !formMapping[f])
    }),
    { headers: { "Content-Type": "application/json", ...corsHeaders } }
  );
}

// Helper functions
async function updateProgress(
  supabase: any, 
  documentId: string, 
  progress: number, 
  stage: string, 
  stageStatus: string,
  message?: string
) {
  const updateData: any = {
    progress,
    status: 'processing',
    current_stage: stage
  };

  if (message) {
    updateData.stage_message = message;
  }

  await supabase
    .from('document_processing_jobs')
    .update(updateData)
    .eq('id', documentId);

  console.log(`Progress update: ${documentId} - ${stage} (${progress}%)`);
}

function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function simulateOCRExtraction(fileData: Blob): Promise<string> {
  // In production, integrate with actual OCR service (Google Vision, AWS Textract, etc.)
  // For now, simulate extraction
  const bytes = await fileData.arrayBuffer();
  const text = `[OCR Extracted Content]\n\nDocument contains ${Math.floor(bytes.byteLength / 100)} estimated words.\n\nSample extracted text would appear here from OCR processing.\n\nPatient Name: John Doe\nDate of Birth: 01/15/1980\nNPI Number: 1234567890\nInsurance ID: INS-12345678\nPhone: (555) 123-4567\nEmail: john.doe@email.com\nAddress: 123 Medical Center Dr, Suite 100\nDiagnosis: Type 2 Diabetes\nProvider: Dr. Jane Smith\nFacility: Metro Health Center`;
  
  return text;
}

function analyzeContent(text: string) {
  const words = text.split(/\s+/).filter(w => w.length > 0);
  const lines = text.split('\n').filter(l => l.trim().length > 0);
  
  return {
    wordCount: words.length,
    pageCount: Math.ceil(lines.length / 40), // Estimate pages
    language: 'en',
    keywords: extractKeywords(text)
  };
}

function extractKeywords(text: string): string[] {
  const commonWords = new Set(['the', 'a', 'an', 'is', 'are', 'was', 'were', 'be', 'been', 'being', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could', 'should', 'may', 'might', 'must', 'shall', 'can', 'need', 'dare', 'ought', 'used', 'to', 'of', 'in', 'for', 'on', 'with', 'at', 'by', 'from', 'as', 'into', 'through', 'during', 'before', 'after', 'above', 'below', 'between', 'under', 'again', 'further', 'then', 'once', 'and', 'but', 'or', 'nor', 'so', 'yet', 'both', 'either', 'neither', 'not', 'only', 'own', 'same', 'than', 'too', 'very', 'just']);
  
  const words = text.toLowerCase().replace(/[^a-z\s]/g, '').split(/\s+/);
  const wordCounts: Record<string, number> = {};
  
  for (const word of words) {
    if (word.length > 3 && !commonWords.has(word)) {
      wordCounts[word] = (wordCounts[word] || 0) + 1;
    }
  }
  
  return Object.entries(wordCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([word]) => word);
}

function extractEntities(text: string): { type: string; value: string; confidence: number }[] {
  const entities: { type: string; value: string; confidence: number }[] = [];
  
  // Extract common patterns
  const patterns: { type: string; regex: RegExp; confidence: number }[] = [
    { type: 'email', regex: /[\w.-]+@[\w.-]+\.\w+/gi, confidence: 0.95 },
    { type: 'phone', regex: /\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/g, confidence: 0.9 },
    { type: 'npi', regex: /\b\d{10}\b/g, confidence: 0.7 },
    { type: 'date', regex: /\d{1,2}\/\d{1,2}\/\d{2,4}/g, confidence: 0.85 },
    { type: 'ssn', regex: /\d{3}-\d{2}-\d{4}/g, confidence: 0.9 },
    { type: 'insurance_id', regex: /INS-\w+/gi, confidence: 0.85 },
  ];

  for (const { type, regex, confidence } of patterns) {
    const matches = text.match(regex);
    if (matches) {
      for (const value of matches) {
        if (!entities.find(e => e.value === value)) {
          entities.push({ type, value, confidence });
        }
      }
    }
  }

  // Extract name patterns (simple heuristic)
  const nameMatch = text.match(/(?:Patient\s+Name|Name):\s*([A-Z][a-z]+\s+[A-Z][a-z]+)/);
  if (nameMatch) {
    entities.push({ type: 'patient_name', value: nameMatch[1], confidence: 0.85 });
  }

  return entities;
}

function extractFormFields(text: string, targetFields: string[]): { fieldName: string; value: string; confidence: number }[] {
  const fields: { fieldName: string; value: string; confidence: number }[] = [];
  
  for (const fieldName of targetFields) {
    // Look for field:value patterns
    const patterns = [
      new RegExp(`${fieldName}[:\\s]+([^\\n]+)`, 'i'),
      new RegExp(`${fieldName.replace(/_/g, '\\s*')}[:\\s]+([^\\n]+)`, 'i'),
    ];

    for (const pattern of patterns) {
      const match = text.match(pattern);
      if (match) {
        fields.push({
          fieldName,
          value: match[1].trim(),
          confidence: 0.8
        });
        break;
      }
    }
  }

  return fields;
}
