import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface ProcessingRequest {
  action: 'upload' | 'process' | 'extract_metadata' | 'map_to_form' | 'validate' | 'classify';
  documentId?: string;
  fileBase64?: string;
  fileName?: string;
  mimeType?: string;
  processingConfig?: ProcessingConfig;
}

interface ProcessingConfig {
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
}

interface ValidationRule {
  fieldName: string;
  type: 'required' | 'format' | 'range' | 'custom';
  pattern?: string;
  min?: number;
  max?: number;
  message?: string;
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
  formFields?: { fieldName: string; value: string; confidence: number; fieldType?: string }[];
  tables?: ExtractedTable[];
  signatures?: SignatureDetection[];
  documentClassification?: DocumentClassification;
  handwrittenRegions?: HandwrittenRegion[];
}

interface ExtractedTable {
  id: string;
  rows: { cells: { value: string; confidence: number; columnIndex: number; rowIndex: number }[] }[];
  headers?: string[];
  confidence: number;
  pageNumber?: number;
}

interface SignatureDetection {
  id: string;
  detected: boolean;
  confidence: number;
  signedBy?: string;
  signedDate?: string;
}

interface DocumentClassification {
  type: string;
  confidence: number;
  alternativeTypes?: { type: string; confidence: number }[];
}

interface HandwrittenRegion {
  id: string;
  text: string;
  confidence: number;
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
      case 'validate':
        return await handleValidation(supabase, request);
      case 'classify':
        return await handleClassification(supabase, request);
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

  // Create processing record with enhanced fields
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
  const config: ProcessingConfig = doc.processing_config || {};

  // Stage 1: Text Extraction (OCR if needed)
  await updateProgress(supabase, documentId, 5, 'extraction', 'in_progress', 'Starting text extraction...');
  
  let extractedText = '';
  try {
    const { data: fileData, error: downloadError } = await supabase.storage
      .from('document-processing')
      .download(doc.file_path);

    if (downloadError) {
      throw new Error(`Failed to download file: ${downloadError.message}`);
    }

    if (config.enableOCR !== false && (doc.mime_type?.includes('pdf') || doc.mime_type?.includes('image'))) {
      await updateProgress(supabase, documentId, 10, 'extraction', 'in_progress', 'Running OCR...');
      await delay(800);
      extractedText = await simulateOCRExtraction(fileData, config.enableHandwritingRecognition);
    } else {
      extractedText = await fileData.text();
    }

    await updateProgress(supabase, documentId, 20, 'extraction', 'completed');
  } catch (e) {
    console.error("Extraction error:", e);
    await updateProgress(supabase, documentId, 20, 'extraction', 'error', String(e));
    throw e;
  }

  // Stage 2: Content Analysis
  await updateProgress(supabase, documentId, 25, 'analysis', 'in_progress', 'Analyzing content structure...');
  await delay(500);
  
  const analysisResult = analyzeContent(extractedText);
  await updateProgress(supabase, documentId, 35, 'analysis', 'completed');

  // Stage 3: Entity Extraction
  await updateProgress(supabase, documentId, 40, 'entity_extraction', 'in_progress', 'Extracting entities...');
  await delay(400);
  
  const entities = extractEntities(extractedText);
  await updateProgress(supabase, documentId, 50, 'entity_extraction', 'completed');

  // Stage 4: Table Extraction
  let tables: ExtractedTable[] = [];
  if (config.enableTableExtraction !== false) {
    await updateProgress(supabase, documentId, 55, 'table_extraction', 'in_progress', 'Detecting tables...');
    await delay(400);
    tables = extractTables(extractedText);
    await updateProgress(supabase, documentId, 60, 'table_extraction', 'completed');
  }

  // Stage 5: Signature Detection
  let signatures: SignatureDetection[] = [];
  if (config.enableSignatureDetection !== false) {
    await updateProgress(supabase, documentId, 65, 'signature_detection', 'in_progress', 'Detecting signatures...');
    await delay(300);
    signatures = detectSignatures(extractedText);
    await updateProgress(supabase, documentId, 70, 'signature_detection', 'completed');
  }

  // Stage 6: Document Classification
  let documentClassification: DocumentClassification | undefined;
  let documentType = 'unknown';
  if (config.enableDocumentClassification !== false) {
    await updateProgress(supabase, documentId, 75, 'classification', 'in_progress', 'Classifying document...');
    await delay(300);
    documentClassification = classifyDocument(extractedText, doc.file_name);
    documentType = documentClassification.type;
    await updateProgress(supabase, documentId, 80, 'classification', 'completed');
  }

  // Stage 7: Validation
  await updateProgress(supabase, documentId, 85, 'validation', 'in_progress', 'Validating extracted data...');
  await delay(200);
  const validationStatus = validateExtractedData(entities, config);
  await updateProgress(supabase, documentId, 90, 'validation', 'completed');

  // Stage 8: Metadata Generation
  await updateProgress(supabase, documentId, 92, 'metadata', 'in_progress', 'Generating metadata...');
  await delay(200);
  
  const metadata: ExtractedMetadata = {
    title: doc.file_name.replace(/\.[^.]+$/, ''),
    pageCount: analysisResult.pageCount,
    wordCount: analysisResult.wordCount,
    language: analysisResult.language,
    keywords: analysisResult.keywords,
    entities,
    formFields: config.extractionFields ? extractFormFields(extractedText, config.extractionFields) : [],
    tables,
    signatures,
    documentClassification,
    handwrittenRegions: config.enableHandwritingRecognition ? extractHandwrittenRegions(extractedText) : []
  };

  await updateProgress(supabase, documentId, 95, 'metadata', 'completed');

  // Determine final status based on validation
  const finalStatus = validationStatus.requiresManualReview ? 'needs_review' : 'completed';

  // Stage 9: Finalize
  const { error: updateError } = await supabase
    .from('document_processing_jobs')
    .update({
      status: finalStatus,
      progress: 100,
      extracted_text: extractedText.substring(0, 50000),
      extracted_metadata: metadata,
      document_type: documentType,
      validation_status: validationStatus,
      completed_at: new Date().toISOString(),
      stages: {
        ...stages,
        extraction: { status: 'completed', timestamp: new Date().toISOString() },
        analysis: { status: 'completed', timestamp: new Date().toISOString() },
        entity_extraction: { status: 'completed', timestamp: new Date().toISOString() },
        table_extraction: { status: 'completed', timestamp: new Date().toISOString() },
        signature_detection: { status: 'completed', timestamp: new Date().toISOString() },
        classification: { status: 'completed', timestamp: new Date().toISOString() },
        validation: { status: 'completed', timestamp: new Date().toISOString() },
        metadata: { status: 'completed', timestamp: new Date().toISOString() },
        finalized: { status: 'completed', timestamp: new Date().toISOString() }
      }
    })
    .eq('id', documentId);

  if (updateError) {
    throw new Error(`Failed to finalize: ${updateError.message}`);
  }

  console.log(`Document processing completed: ${documentId} (status: ${finalStatus})`);

  return new Response(
    JSON.stringify({ 
      success: true, 
      documentId,
      status: finalStatus,
      documentType,
      metadata,
      validationStatus,
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
    .select('extracted_metadata, extracted_text, status, document_type, validation_status')
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
      documentType: doc.document_type,
      validationStatus: doc.validation_status,
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
  const formMapping: Record<string, { value: string; confidence: number; source: string; fieldType?: string }> = {};

  const metadata = doc.extracted_metadata || {};
  const formFields = metadata.formFields || [];

  for (const field of targetFields) {
    // First try exact field match
    const matchedField = formFields.find((f: any) => 
      f.fieldName.toLowerCase() === field.toLowerCase() ||
      f.fieldName.toLowerCase().includes(field.toLowerCase()) ||
      field.toLowerCase().includes(f.fieldName.toLowerCase())
    );

    if (matchedField) {
      formMapping[field] = {
        value: matchedField.value,
        confidence: matchedField.confidence,
        source: 'form_field',
        fieldType: matchedField.fieldType
      };
    } else {
      // Try to find in entities with fuzzy matching
      const entityTypeMap: Record<string, string[]> = {
        patient_name: ['patient_name', 'name', 'person'],
        date_of_birth: ['date', 'dob', 'birth'],
        npi: ['npi', 'number'],
        insurance_id: ['insurance_id', 'insurance'],
        phone: ['phone', 'telephone'],
        email: ['email'],
        address: ['address', 'location'],
        provider: ['provider', 'doctor'],
        diagnosis: ['diagnosis', 'condition'],
        facility: ['facility', 'hospital', 'clinic']
      };

      const possibleTypes = entityTypeMap[field.toLowerCase()] || [field.toLowerCase()];
      const entity = metadata.entities?.find((e: any) => 
        possibleTypes.some(t => e.type.toLowerCase().includes(t))
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
      mappedCount: Object.keys(formMapping).length,
      totalFields: targetFields.length,
      unmappedFields: targetFields.filter(f => !formMapping[f])
    }),
    { headers: { "Content-Type": "application/json", ...corsHeaders } }
  );
}

async function handleValidation(supabase: any, request: ProcessingRequest) {
  const { documentId, processingConfig } = request;
  
  if (!documentId) {
    throw new Error("Missing documentId");
  }

  const { data: doc, error } = await supabase
    .from('document_processing_jobs')
    .select('extracted_metadata')
    .eq('id', documentId)
    .single();

  if (error || !doc) {
    throw new Error(`Document not found: ${error?.message}`);
  }

  const metadata = doc.extracted_metadata || {};
  const entities = metadata.entities || [];
  const validationStatus = validateExtractedData(entities, processingConfig || {});

  await supabase
    .from('document_processing_jobs')
    .update({ validation_status: validationStatus })
    .eq('id', documentId);

  return new Response(
    JSON.stringify({ 
      success: true, 
      documentId,
      validationStatus
    }),
    { headers: { "Content-Type": "application/json", ...corsHeaders } }
  );
}

async function handleClassification(supabase: any, request: ProcessingRequest) {
  const { documentId } = request;
  
  if (!documentId) {
    throw new Error("Missing documentId");
  }

  const { data: doc, error } = await supabase
    .from('document_processing_jobs')
    .select('extracted_text, file_name')
    .eq('id', documentId)
    .single();

  if (error || !doc) {
    throw new Error(`Document not found: ${error?.message}`);
  }

  const classification = classifyDocument(doc.extracted_text || '', doc.file_name);

  await supabase
    .from('document_processing_jobs')
    .update({ 
      document_type: classification.type,
      extracted_metadata: {
        ...(doc.extracted_metadata || {}),
        documentClassification: classification
      }
    })
    .eq('id', documentId);

  return new Response(
    JSON.stringify({ 
      success: true, 
      documentId,
      classification
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

  console.log(`Progress update: ${documentId} - ${stage} (${progress}%) ${message || ''}`);
}

function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function simulateOCRExtraction(fileData: Blob, enableHandwriting?: boolean): Promise<string> {
  const bytes = await fileData.arrayBuffer();
  
  // Simulate comprehensive OCR output
  let text = `[OCR Extracted Content - ${enableHandwriting ? 'Including Handwriting' : 'Print Only'}]

Document Analysis Report
========================

PATIENT INFORMATION
-------------------
Patient Name: John Michael Doe
Date of Birth: 01/15/1980
Patient ID: PT-2024-00789
Social Security: XXX-XX-5678

PROVIDER INFORMATION
--------------------
Provider Name: Dr. Jane Smith, MD
NPI Number: 1234567890
License: CA-MD-98765
Specialty: Internal Medicine

FACILITY INFORMATION
--------------------
Facility Name: Metro Health Center
Address: 123 Medical Center Dr, Suite 100
City: Los Angeles, CA 90210
Phone: (555) 123-4567
Fax: (555) 123-4568

INSURANCE INFORMATION
---------------------
Insurance Provider: Blue Cross Blue Shield
Insurance ID: INS-12345678
Group Number: GRP-9876543
Policy Type: PPO
Effective Date: 01/01/2024

CONTACT INFORMATION
-------------------
Email: john.doe@email.com
Phone: (555) 987-6543
Emergency Contact: Mary Doe (555) 111-2222

MEDICAL INFORMATION
-------------------
Primary Diagnosis: Type 2 Diabetes Mellitus (E11.9)
Secondary Diagnosis: Hypertension (I10)
Allergies: Penicillin, Sulfa drugs
Current Medications:
  - Metformin 500mg twice daily
  - Lisinopril 10mg once daily
  - Aspirin 81mg once daily

VISIT DETAILS
-------------
Date of Service: 12/12/2024
Time: 10:30 AM
Visit Type: Follow-up Consultation
Chief Complaint: Routine diabetes management

SIGNATURES
----------
[Signature Area Detected]
Patient Signature: [Signed] Date: 12/12/2024
Provider Signature: [Signed] Date: 12/12/2024

TABLES
------
| Medication    | Dosage  | Frequency  | Start Date |
|---------------|---------|------------|------------|
| Metformin     | 500mg   | Twice daily| 01/01/2023 |
| Lisinopril    | 10mg    | Once daily | 03/15/2023 |
| Aspirin       | 81mg    | Once daily | 01/01/2023 |

Lab Results:
| Test          | Result  | Range      | Status     |
|---------------|---------|------------|------------|
| HbA1c         | 7.2%    | <7.0%      | High       |
| Glucose       | 145     | 70-100     | High       |
| Blood Pressure| 135/85  | <120/80    | Elevated   |
`;

  if (enableHandwriting) {
    text += `
HANDWRITTEN NOTES
-----------------
[Handwritten Region 1]: "Follow up in 3 months"
[Handwritten Region 2]: "Increase Metformin if needed"
[Handwritten Region 3]: "Patient understanding good"
`;
  }

  return text;
}

function analyzeContent(text: string) {
  const words = text.split(/\s+/).filter(w => w.length > 0);
  const lines = text.split('\n').filter(l => l.trim().length > 0);
  
  return {
    wordCount: words.length,
    pageCount: Math.max(1, Math.ceil(lines.length / 50)),
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
    .slice(0, 15)
    .map(([word]) => word);
}

function extractEntities(text: string): { type: string; value: string; confidence: number }[] {
  const entities: { type: string; value: string; confidence: number }[] = [];
  
  const patterns: { type: string; regex: RegExp; confidence: number }[] = [
    { type: 'email', regex: /[\w.-]+@[\w.-]+\.\w+/gi, confidence: 0.95 },
    { type: 'phone', regex: /\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/g, confidence: 0.9 },
    { type: 'npi', regex: /NPI[:\s#]*(\d{10})/gi, confidence: 0.95 },
    { type: 'npi', regex: /\b\d{10}\b/g, confidence: 0.7 },
    { type: 'date', regex: /\d{1,2}\/\d{1,2}\/\d{2,4}/g, confidence: 0.85 },
    { type: 'ssn', regex: /\d{3}-\d{2}-\d{4}/g, confidence: 0.9 },
    { type: 'insurance_id', regex: /INS-[\w-]+/gi, confidence: 0.9 },
    { type: 'patient_id', regex: /PT-[\w-]+/gi, confidence: 0.9 },
    { type: 'group_number', regex: /GRP-[\w]+/gi, confidence: 0.85 },
    { type: 'license', regex: /[A-Z]{2}-[A-Z]{2}-\d+/g, confidence: 0.85 },
    { type: 'icd_code', regex: /[A-Z]\d{2}\.\d{1,2}/g, confidence: 0.9 },
    { type: 'ndc', regex: /NDC[:\s#]*(\d{4,5}-\d{3,4}-\d{1,2})/gi, confidence: 0.95 },
    { type: 'dea', regex: /DEA[:\s#]*([A-Z]{2}\d{7})/gi, confidence: 0.95 },
  ];

  for (const { type, regex, confidence } of patterns) {
    const matches = text.match(regex);
    if (matches) {
      for (const match of matches) {
        const value = type === 'npi' && match.includes('NPI') 
          ? match.replace(/NPI[:\s#]*/i, '') 
          : type === 'ndc' && match.includes('NDC')
          ? match.replace(/NDC[:\s#]*/i, '')
          : type === 'dea' && match.includes('DEA')
          ? match.replace(/DEA[:\s#]*/i, '')
          : match;
        if (!entities.find(e => e.value === value && e.type === type)) {
          entities.push({ type, value, confidence });
        }
      }
    }
  }

  // Extract name patterns
  const namePatterns = [
    { regex: /Patient\s+Name:\s*([A-Z][a-z]+(?:\s+[A-Z][a-z]+)+)/i, type: 'patient_name' },
    { regex: /Provider\s+Name:\s*([A-Z][a-z]+(?:\s+[A-Z][a-z]+)+)/i, type: 'provider' },
    { regex: /Prescriber:\s*([A-Z][a-z]+(?:\s+[A-Z][a-z]+)+)/i, type: 'prescriber' },
    { regex: /Dr\.\s*([A-Z][a-z]+(?:\s+[A-Z][a-z]+)+)/i, type: 'provider' },
    { regex: /Facility\s+Name:\s*(.+?)(?:\n|$)/i, type: 'facility' },
  ];

  for (const { regex, type } of namePatterns) {
    const match = text.match(regex);
    if (match && match[1]) {
      entities.push({ type, value: match[1].trim(), confidence: 0.85 });
    }
  }

  // Extract medication-specific information (critical for prescriptions)
  const medicationPatterns = [
    { regex: /(?:Medication|Drug|Rx|Prescription):\s*([A-Za-z]+(?:\s+\d+\s*(?:mg|mcg|ml|g))?)/i, type: 'medication', confidence: 0.9 },
    { regex: /(?:Current\s+)?Medications?:\s*[-•]?\s*([A-Za-z]+)\s+(\d+\s*(?:mg|mcg|ml|g))/gi, type: 'medication', confidence: 0.85 },
    // Common drug names pattern
    { regex: /\b(Metformin|Lisinopril|Atorvastatin|Levothyroxine|Amlodipine|Omeprazole|Losartan|Gabapentin|Hydrocodone|Sertraline|Simvastatin|Metoprolol|Pantoprazole|Escitalopram|Tramadol|Prednisone|Amoxicillin|Azithromycin|Alprazolam|Trazodone)\s*(\d+\s*(?:mg|mcg|ml|g))?/gi, type: 'medication', confidence: 0.95 },
  ];

  for (const { regex, type, confidence } of medicationPatterns) {
    const globalRegex = new RegExp(regex.source, regex.flags.includes('g') ? regex.flags : regex.flags + 'g');
    let match;
    while ((match = globalRegex.exec(text)) !== null) {
      const value = match[2] ? `${match[1]} ${match[2]}`.trim() : match[1].trim();
      if (value && !entities.find(e => e.value.toLowerCase() === value.toLowerCase() && e.type === type)) {
        entities.push({ type, value, confidence });
      }
    }
  }

  // Extract SIG/Instructions
  const sigPatterns = [
    { regex: /(?:SIG|Sig|Directions|Instructions):\s*(.+?)(?:\n|$)/i, type: 'sig', confidence: 0.9 },
    { regex: /Take\s+(\d+\s*(?:tablet|capsule|pill|drop|puff)s?\s+(?:by mouth|orally|twice|once|three times|four times)\s*.+?)(?:\n|$)/i, type: 'sig', confidence: 0.85 },
  ];

  for (const { regex, type, confidence } of sigPatterns) {
    const match = text.match(regex);
    if (match && match[1]) {
      if (!entities.find(e => e.type === type)) {
        entities.push({ type, value: match[1].trim(), confidence });
      }
    }
  }

  // Extract quantity and refills
  const quantityMatch = text.match(/(?:Qty|Quantity|Disp|Dispense)[:\s#]*(\d+)/i);
  if (quantityMatch) {
    entities.push({ type: 'quantity', value: quantityMatch[1], confidence: 0.9 });
  }

  const refillsMatch = text.match(/(?:Refills?|Ref)[:\s#]*(\d+)/i);
  if (refillsMatch) {
    entities.push({ type: 'refills', value: refillsMatch[1], confidence: 0.9 });
  }

  const daysSupplyMatch = text.match(/(?:Days?\s*Supply|DS)[:\s#]*(\d+)/i);
  if (daysSupplyMatch) {
    entities.push({ type: 'days_supply', value: daysSupplyMatch[1], confidence: 0.9 });
  }

  // Extract diagnoses
  const diagnosisMatch = text.match(/(?:Primary\s+)?Diagnosis:\s*(.+?)(?:\n|$)/gi);
  if (diagnosisMatch) {
    for (const match of diagnosisMatch) {
      const value = match.replace(/(?:Primary\s+)?Diagnosis:\s*/i, '').trim();
      if (value) {
        entities.push({ type: 'diagnosis', value, confidence: 0.8 });
      }
    }
  }

  return entities;
}

function extractFormFields(text: string, targetFields: string[]): { fieldName: string; value: string; confidence: number; fieldType?: string }[] {
  const fields: { fieldName: string; value: string; confidence: number; fieldType?: string }[] = [];
  
  const fieldPatterns: Record<string, { patterns: RegExp[]; type: string }> = {
    patient_name: { patterns: [/Patient\s+Name:\s*(.+?)(?:\n|$)/i, /Name:\s*([A-Z][a-z]+(?:\s+[A-Z][a-z]+)+)/i], type: 'text' },
    date_of_birth: { patterns: [/Date\s+of\s+Birth:\s*(.+?)(?:\n|$)/i, /DOB:\s*(.+?)(?:\n|$)/i], type: 'date' },
    npi: { patterns: [/NPI[:\s#]*(\d{10})/i], type: 'number' },
    prescriber_npi: { patterns: [/(?:Prescriber\s+)?NPI[:\s#]*(\d{10})/i], type: 'number' },
    prescriber_dea: { patterns: [/DEA[:\s#]*([A-Z]{2}\d{7})/i], type: 'text' },
    insurance_id: { patterns: [/Insurance\s+ID:\s*(.+?)(?:\n|$)/i], type: 'text' },
    phone: { patterns: [/Phone:\s*(.+?)(?:\n|$)/i], type: 'text' },
    email: { patterns: [/Email:\s*(.+?)(?:\n|$)/i], type: 'text' },
    address: { patterns: [/Address:\s*(.+?)(?:\n|$)/i], type: 'text' },
    provider: { patterns: [/Provider\s+Name:\s*(.+?)(?:\n|$)/i], type: 'text' },
    prescriber_name: { patterns: [/Prescriber:\s*(.+?)(?:\n|$)/i, /Dr\.\s*([A-Z][a-z]+(?:\s+[A-Z][a-z]+)+)/i], type: 'text' },
    diagnosis: { patterns: [/Primary\s+Diagnosis:\s*(.+?)(?:\n|$)/i], type: 'text' },
    facility: { patterns: [/Facility\s+Name:\s*(.+?)(?:\n|$)/i], type: 'text' },
    // Medication-specific fields
    medication: { patterns: [
      /(?:Medication|Drug|Rx):\s*([A-Za-z]+(?:\s+\d+\s*(?:mg|mcg|ml|g))?)/i,
      /\b(Metformin|Lisinopril|Atorvastatin|Levothyroxine|Amlodipine|Omeprazole|Losartan|Gabapentin|Hydrocodone|Sertraline)\s*(\d+\s*mg)?/i
    ], type: 'text' },
    strength: { patterns: [/(?:Strength|Dose):\s*(\d+\s*(?:mg|mcg|ml|g))/i, /([0-9.]+\s*(?:mg|mcg|ml|g))/i], type: 'text' },
    sig: { patterns: [
      /(?:SIG|Sig|Directions|Instructions):\s*(.+?)(?:\n|$)/i,
      /Take\s+(\d+\s*(?:tablet|capsule)s?\s+.+?)(?:\n|$)/i
    ], type: 'text' },
    quantity: { patterns: [/(?:Qty|Quantity|Disp|Dispense)[:\s#]*(\d+)/i], type: 'number' },
    days_supply: { patterns: [/(?:Days?\s*Supply|DS)[:\s#]*(\d+)/i], type: 'number' },
    refills: { patterns: [/(?:Refills?|Ref)[:\s#]*(\d+)/i], type: 'number' },
    ndc: { patterns: [/NDC[:\s#]*(\d{4,5}-\d{3,4}-\d{1,2})/i], type: 'text' },
    date_written: { patterns: [/(?:Date\s+Written|Written|Rx\s+Date)[:\s]*(\d{1,2}\/\d{1,2}\/\d{2,4})/i], type: 'date' },
    pharmacy: { patterns: [/(?:Pharmacy|Send\s+to)[:\s]*(.+?)(?:\n|$)/i], type: 'text' },
  };

  for (const fieldName of targetFields) {
    const config = fieldPatterns[fieldName.toLowerCase()];
    if (config) {
      for (const pattern of config.patterns) {
        const match = text.match(pattern);
        if (match && match[1]) {
          fields.push({
            fieldName,
            value: match[2] ? `${match[1]} ${match[2]}`.trim() : match[1].trim(),
            confidence: 0.85,
            fieldType: config.type
          });
          break;
        }
      }
    } else {
      // Generic pattern
      const patterns = [
        new RegExp(`${fieldName}[:\\s]+([^\\n]+)`, 'i'),
        new RegExp(`${fieldName.replace(/_/g, '\\s*')}[:\\s]+([^\\n]+)`, 'i'),
      ];

      for (const pattern of patterns) {
        const match = text.match(pattern);
        if (match && match[1]) {
          fields.push({
            fieldName,
            value: match[1].trim(),
            confidence: 0.75,
            fieldType: 'text'
          });
          break;
        }
      }
    }
  }

  return fields;
}

function extractTables(text: string): ExtractedTable[] {
  const tables: ExtractedTable[] = [];
  
  // Look for pipe-delimited tables
  const tableMatches = text.match(/\|[^\n]+\|(?:\n\|[^\n]+\|)+/g);
  
  if (tableMatches) {
    for (let i = 0; i < tableMatches.length; i++) {
      const tableText = tableMatches[i];
      const lines = tableText.split('\n').filter(l => l.trim());
      
      const rows = lines
        .filter(line => !line.match(/^\|[\s-]+\|$/)) // Filter out separator lines
        .map((line, rowIndex) => ({
          cells: line.split('|')
            .filter(c => c.trim())
            .map((cell, colIndex) => ({
              value: cell.trim(),
              confidence: 0.85,
              columnIndex: colIndex,
              rowIndex
            }))
        }));

      if (rows.length > 0) {
        tables.push({
          id: `table_${i + 1}`,
          rows: rows.slice(1), // Skip header row
          headers: rows[0]?.cells.map(c => c.value),
          confidence: 0.85,
          pageNumber: 1
        });
      }
    }
  }

  return tables;
}

function detectSignatures(text: string): SignatureDetection[] {
  const signatures: SignatureDetection[] = [];
  
  const signaturePatterns = [
    { regex: /Patient\s+Signature:\s*\[([^\]]+)\]\s*Date:\s*(\d{1,2}\/\d{1,2}\/\d{2,4})/i, type: 'patient' },
    { regex: /Provider\s+Signature:\s*\[([^\]]+)\]\s*Date:\s*(\d{1,2}\/\d{1,2}\/\d{2,4})/i, type: 'provider' },
    { regex: /\[Signature[^\]]*\]/gi, type: 'generic' },
  ];

  let id = 1;
  for (const { regex, type } of signaturePatterns) {
    const matches = text.match(regex);
    if (matches) {
      for (const match of matches) {
        const dateMatch = match.match(/(\d{1,2}\/\d{1,2}\/\d{2,4})/);
        signatures.push({
          id: `sig_${id++}`,
          detected: match.toLowerCase().includes('signed'),
          confidence: match.toLowerCase().includes('signed') ? 0.9 : 0.7,
          signedBy: type,
          signedDate: dateMatch ? dateMatch[1] : undefined
        });
      }
    }
  }

  return signatures;
}

function classifyDocument(text: string, fileName: string): DocumentClassification {
  const lowerText = text.toLowerCase();
  const lowerFileName = fileName.toLowerCase();
  
  const classifications: { type: string; score: number }[] = [];

  // Keywords for each document type
  const typeKeywords: Record<string, string[]> = {
    medical_record: ['patient', 'diagnosis', 'medication', 'treatment', 'medical history', 'symptoms', 'examination'],
    insurance_card: ['insurance', 'member', 'group number', 'policy', 'coverage', 'subscriber'],
    prescription: ['prescription', 'rx', 'medication', 'dosage', 'refill', 'pharmacy'],
    lab_result: ['lab', 'result', 'test', 'specimen', 'reference range', 'blood', 'urine'],
    invoice: ['invoice', 'bill', 'amount due', 'payment', 'total', 'charges'],
    receipt: ['receipt', 'paid', 'transaction', 'total', 'purchase'],
    form: ['form', 'please fill', 'signature required', 'checkbox', 'application'],
    contract: ['agreement', 'contract', 'terms', 'conditions', 'party', 'hereby'],
    identification: ['identification', 'id', 'license', 'passport', 'ssn', 'social security'],
  };

  for (const [type, keywords] of Object.entries(typeKeywords)) {
    let score = 0;
    for (const keyword of keywords) {
      if (lowerText.includes(keyword) || lowerFileName.includes(keyword)) {
        score += 1;
      }
    }
    if (score > 0) {
      classifications.push({ type, score: score / keywords.length });
    }
  }

  // Sort by score
  classifications.sort((a, b) => b.score - a.score);

  const primary = classifications[0] || { type: 'unknown', score: 0.5 };
  
  return {
    type: primary.type as any,
    confidence: Math.min(0.95, primary.score * 1.2),
    alternativeTypes: classifications.slice(1, 3).map(c => ({
      type: c.type as any,
      confidence: c.score
    }))
  };
}

function extractHandwrittenRegions(text: string): HandwrittenRegion[] {
  const regions: HandwrittenRegion[] = [];
  
  const handwrittenMatches = text.matchAll(/\[Handwritten Region \d+\]:\s*"([^"]+)"/g);
  
  let id = 1;
  for (const match of handwrittenMatches) {
    regions.push({
      id: `hw_${id++}`,
      text: match[1],
      confidence: 0.75
    });
  }

  return regions;
}

function validateExtractedData(
  entities: { type: string; value: string; confidence: number }[],
  config: ProcessingConfig
): { isValid: boolean; errors: any[]; warnings: any[]; requiresManualReview: boolean } {
  const errors: { field: string; message: string; severity: string }[] = [];
  const warnings: { field: string; message: string; suggestion?: string }[] = [];
  
  const threshold = config.confidenceThreshold || 0.7;
  
  // Check confidence levels
  for (const entity of entities) {
    if (entity.confidence < threshold) {
      warnings.push({
        field: entity.type,
        message: `Low confidence (${Math.round(entity.confidence * 100)}%) for ${entity.type}`,
        suggestion: 'Manual verification recommended'
      });
    }
  }

  // Validate specific rules
  if (config.validationRules) {
    for (const rule of config.validationRules) {
      const entity = entities.find(e => e.type === rule.fieldName);
      
      if (rule.type === 'required' && !entity) {
        errors.push({
          field: rule.fieldName,
          message: rule.message || `${rule.fieldName} is required`,
          severity: 'error'
        });
      }
      
      if (rule.type === 'format' && entity && rule.pattern) {
        if (!new RegExp(rule.pattern).test(entity.value)) {
          errors.push({
            field: rule.fieldName,
            message: rule.message || `${rule.fieldName} format is invalid`,
            severity: 'error'
          });
        }
      }
    }
  }

  const requiresManualReview = errors.length > 0 || warnings.length > 2;

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    requiresManualReview
  };
}
