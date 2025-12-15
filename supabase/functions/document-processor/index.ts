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
  userId?: string;
  documentType?: string;
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
  ocrProvider?: 'google' | 'azure' | 'aws';
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
  entities?: { type: string; value: string; confidence: number; source?: string }[];
  formFields?: { fieldName: string; value: string; confidence: number; fieldType?: string; source?: string }[];
  tables?: ExtractedTable[];
  signatures?: SignatureDetection[];
  documentClassification?: DocumentClassification;
  handwrittenRegions?: HandwrittenRegion[];
  extractionSummary?: {
    ocrFieldCount: number;
    nlpFieldCount: number;
    totalFields: number;
    ocrProvider: string;
    nlpProvider: string;
  };
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
  const { fileBase64, fileName, mimeType, processingConfig, userId, documentType } = request;
  
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

  // Get public URL for the uploaded file
  const { data: urlData } = await supabase.storage
    .from('document-processing')
    .getPublicUrl(filePath);
  
  const publicUrl = urlData?.publicUrl || null;

  // Create processing record - only use columns that exist in the table
  const { data: record, error: recordError } = await supabase
    .from('document_processing_jobs')
    .insert({
      file_name: fileName,
      file_path: filePath,
      mime_type: mimeType,
      status: 'uploaded',
      document_type: documentType || 'unknown',
      user_id: userId || null,
      processing_config: {
        ...processingConfig,
        // Store image URL in config for preview access
        publicUrl: publicUrl,
        isImage: mimeType?.startsWith('image/')
      },
      progress: 0,
      current_stage: 'upload',
      stage_message: 'Document uploaded successfully',
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
      imageUrl: publicUrl,
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

  // Stage 1: Text Extraction (OCR if needed) + Get base64 for Vision AI
  await updateProgress(supabase, documentId, 5, 'extraction', 'in_progress', 'Starting text extraction...');
  
  let extractedText = '';
  let imageBase64 = '';
  let imageMimeType = doc.mime_type || 'image/jpeg';
  
  try {
    const { data: fileData, error: downloadError } = await supabase.storage
      .from('document-processing')
      .download(doc.file_path);

    if (downloadError) {
      throw new Error(`Failed to download file: ${downloadError.message}`);
    }

    // Convert to base64 for Vision AI (needed for handwriting recognition)
    // Use safe approach to avoid stack overflow for large files
    const arrayBuffer = await fileData.arrayBuffer();
    const uint8Array = new Uint8Array(arrayBuffer);
    
    // Build binary string byte by byte to avoid stack overflow
    const bytes: string[] = [];
    for (let i = 0; i < uint8Array.length; i++) {
      bytes.push(String.fromCharCode(uint8Array[i]));
    }
    imageBase64 = btoa(bytes.join(''));
    
    if (config.enableOCR !== false && (doc.mime_type?.includes('pdf') || doc.mime_type?.includes('image'))) {
      const providerName = config.ocrProvider || 'google';
      await updateProgress(supabase, documentId, 10, 'extraction', 'in_progress', `Running OCR with ${providerName.toUpperCase()}...`);
      extractedText = await performOCR(fileData, config);
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
  await delay(300);
  
  const analysisResult = analyzeContent(extractedText);
  await updateProgress(supabase, documentId, 35, 'analysis', 'completed');

  // Stage 3: HYBRID Entity Extraction - OCR text + Vision AI for images (especially handwritten)
  await updateProgress(supabase, documentId, 40, 'entity_extraction', 'in_progress', 'Extracting entities with OCR + Vision AI NLP...');
  
  let entities: { type: string; value: string; confidence: number; source?: string }[] = [];
  let nlpProvider = 'none';
  let ocrProvider = config.ocrProvider || 'google';
  
  const geminiApiKey = Deno.env.get("GEMINI_API_KEY");
  const docType = doc.document_type || 'unknown';
  const isImageDocument = doc.mime_type?.includes('image');
  const enableHandwriting = config.enableHandwritingRecognition !== false;
  
  try {
    if (geminiApiKey && isImageDocument && imageBase64) {
      // USE GEMINI VISION - Send actual image for better handwriting/visual extraction
      await updateProgress(supabase, documentId, 42, 'entity_extraction', 'in_progress', 'Using Vision AI for image analysis...');
      
      const visionEntities = await extractEntitiesWithGeminiVision(imageBase64, imageMimeType, docType, geminiApiKey);
      nlpProvider = 'gemini-vision';
      
      // Also get text-based entities from OCR text for fusion
      let textEntities: typeof entities = [];
      if (extractedText && extractedText.length > 50) {
        try {
          textEntities = await extractEntitiesWithGemini(extractedText, geminiApiKey, docType);
        } catch (textErr) {
          console.warn("Text NLP extraction failed, using vision only:", textErr);
        }
      }
      
      // FUSION: Merge vision + text entities, prefer higher confidence
      entities = fuseExtractionResults(visionEntities, textEntities);
      console.log(`Hybrid Vision+NLP extracted ${entities.length} entities (vision: ${visionEntities.length}, text: ${textEntities.length})`);
      
    } else if (geminiApiKey) {
      // Text-only NLP extraction (non-image documents)
      entities = await extractEntitiesWithGemini(extractedText, geminiApiKey, docType);
      nlpProvider = 'gemini-nlp';
      console.log(`AI NLP extracted ${entities.length} entities for document type: ${docType}`);
    } else {
      // Fallback to regex-based extraction
      entities = extractEntities(extractedText, docType);
      nlpProvider = 'regex-fallback';
      console.log(`Regex extracted ${entities.length} entities for document type: ${docType}`);
    }
  } catch (nlpError) {
    console.error("AI extraction failed, falling back to regex:", nlpError);
    entities = extractEntities(extractedText, docType);
    nlpProvider = 'regex-fallback';
  }
  
  // Calculate extraction summary
  const nlpFieldCount = entities.filter(e => e.source === 'nlp' || e.source === 'vision').length;
  const ocrFieldCount = entities.filter(e => e.source === 'ocr' || !e.source).length;
  
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
    handwrittenRegions: config.enableHandwritingRecognition ? extractHandwrittenRegions(extractedText) : [],
    extractionSummary: {
      ocrFieldCount,
      nlpFieldCount,
      totalFields: entities.length,
      ocrProvider,
      nlpProvider
    }
  };

  await updateProgress(supabase, documentId, 95, 'metadata', 'completed');

  // Determine final status - must be one of: uploaded, processing, completed, error, cancelled
  // If manual review needed, we still mark as 'completed' but the validation_status.requiresManualReview flag indicates review needed
  const finalStatus = 'completed';

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

async function performOCR(fileData: Blob, config: ProcessingConfig): Promise<string> {
  const provider = config.ocrProvider || 'google';
  console.log(`Performing OCR with provider: ${provider}`);
  
  const bytes = await fileData.arrayBuffer();
  const uint8Array = new Uint8Array(bytes);
  
  // Convert to base64 in chunks to avoid stack overflow for large files
  const base64 = arrayBufferToBase64(uint8Array);
  
  switch (provider) {
    case 'google':
      return await googleCloudVisionOCR(base64, config.enableHandwritingRecognition);
    case 'azure':
      return await azureFormRecognizerOCR(base64);
    case 'aws':
      return await awsTextractOCR(base64);
    default:
      return await googleCloudVisionOCR(base64, config.enableHandwritingRecognition);
  }
}

// Helper function to convert ArrayBuffer to base64 without stack overflow
function arrayBufferToBase64(bytes: Uint8Array): string {
  const CHUNK_SIZE = 0x8000; // 32KB chunks
  let binary = '';
  
  for (let i = 0; i < bytes.length; i += CHUNK_SIZE) {
    const chunk = bytes.subarray(i, Math.min(i + CHUNK_SIZE, bytes.length));
    binary += String.fromCharCode.apply(null, Array.from(chunk));
  }
  
  return btoa(binary);
}

async function googleCloudVisionOCR(base64Image: string, enableHandwriting?: boolean): Promise<string> {
  const apiKey = Deno.env.get("GOOGLE_API_KEY");
  
  if (!apiKey) {
    console.error("GOOGLE_API_KEY not configured");
    throw new Error("Google Cloud Vision API key not configured. Please add GOOGLE_API_KEY in secrets.");
  }
  
  console.log("Calling Google Cloud Vision API...");
  
  try {
    // DOCUMENT_TEXT_DETECTION handles both printed and handwritten text
    // TEXT_DETECTION is for simpler text extraction
    const features = [
      { type: "DOCUMENT_TEXT_DETECTION" },
      { type: "TEXT_DETECTION" }
    ];
    
    const response = await fetch(
      `https://vision.googleapis.com/v1/images:annotate?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          requests: [{
            image: { content: base64Image },
            features: features
          }]
        })
      }
    );
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error("Google Vision API error:", response.status, errorText);
      throw new Error(`Google Vision API error: ${response.status} - ${errorText}`);
    }
    
    const data = await response.json();
    console.log("Google Vision API response received");
    
    if (data.responses?.[0]?.error) {
      throw new Error(`Vision API error: ${data.responses[0].error.message}`);
    }
    
    // Get full text annotation (best quality)
    const fullTextAnnotation = data.responses?.[0]?.fullTextAnnotation;
    if (fullTextAnnotation?.text) {
      console.log(`Extracted ${fullTextAnnotation.text.length} characters from document`);
      return fullTextAnnotation.text;
    }
    
    // Fallback to text annotations
    const textAnnotations = data.responses?.[0]?.textAnnotations;
    if (textAnnotations && textAnnotations.length > 0) {
      const text = textAnnotations[0].description || '';
      console.log(`Extracted ${text.length} characters from text annotations`);
      return text;
    }
    
    console.warn("No text found in document");
    return "[No text detected in image]";
    
  } catch (error) {
    console.error("Google Vision OCR error:", error);
    throw error;
  }
}

async function azureFormRecognizerOCR(base64Image: string): Promise<string> {
  const apiKey = Deno.env.get("AZURE_FORM_RECOGNIZER_KEY");
  const endpoint = Deno.env.get("AZURE_FORM_RECOGNIZER_ENDPOINT");
  
  if (!apiKey || !endpoint) {
    throw new Error("Azure Form Recognizer not configured. Please add AZURE_FORM_RECOGNIZER_KEY and AZURE_FORM_RECOGNIZER_ENDPOINT in secrets.");
  }
  
  console.log("Calling Azure Form Recognizer API...");
  
  try {
    // Decode base64 to binary
    const binaryData = Uint8Array.from(atob(base64Image), c => c.charCodeAt(0));
    
    // Start analysis
    const analyzeUrl = `${endpoint}/formrecognizer/documentModels/prebuilt-read:analyze?api-version=2023-07-31`;
    const analyzeResponse = await fetch(analyzeUrl, {
      method: "POST",
      headers: {
        "Ocp-Apim-Subscription-Key": apiKey,
        "Content-Type": "application/octet-stream"
      },
      body: binaryData
    });
    
    if (!analyzeResponse.ok) {
      const errorText = await analyzeResponse.text();
      throw new Error(`Azure Form Recognizer error: ${analyzeResponse.status} - ${errorText}`);
    }
    
    // Get operation location for polling
    const operationLocation = analyzeResponse.headers.get("Operation-Location");
    if (!operationLocation) {
      throw new Error("No operation location returned from Azure");
    }
    
    // Poll for results
    let result = null;
    for (let i = 0; i < 30; i++) {
      await delay(1000);
      
      const resultResponse = await fetch(operationLocation, {
        headers: { "Ocp-Apim-Subscription-Key": apiKey }
      });
      
      const resultData = await resultResponse.json();
      
      if (resultData.status === "succeeded") {
        result = resultData;
        break;
      } else if (resultData.status === "failed") {
        throw new Error(`Azure analysis failed: ${resultData.error?.message || 'Unknown error'}`);
      }
    }
    
    if (!result) {
      throw new Error("Azure Form Recognizer timeout");
    }
    
    // Extract text from result
    const content = result.analyzeResult?.content || '';
    console.log(`Azure extracted ${content.length} characters`);
    return content || "[No text detected]";
    
  } catch (error) {
    console.error("Azure Form Recognizer error:", error);
    throw error;
  }
}

async function awsTextractOCR(base64Image: string): Promise<string> {
  const accessKeyId = Deno.env.get("AWS_ACCESS_KEY_ID");
  const secretAccessKey = Deno.env.get("AWS_SECRET_ACCESS_KEY");
  const region = Deno.env.get("AWS_REGION") || "us-east-1";
  
  if (!accessKeyId || !secretAccessKey) {
    throw new Error("AWS Textract not configured. Please add AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY in secrets.");
  }
  
  console.log("Calling AWS Textract API...");
  
  try {
    // AWS Signature V4 signing is complex - using simplified approach
    // In production, use AWS SDK or proper signing
    const service = "textract";
    const host = `${service}.${region}.amazonaws.com`;
    const endpoint = `https://${host}`;
    
    const payload = JSON.stringify({
      Document: {
        Bytes: base64Image
      }
    });
    
    // Create date strings
    const now = new Date();
    const amzDate = now.toISOString().replace(/[:-]|\.\d{3}/g, '');
    const dateStamp = amzDate.slice(0, 8);
    
    // Create canonical request
    const method = "POST";
    const canonicalUri = "/";
    const canonicalQuerystring = "";
    const canonicalHeaders = `content-type:application/x-amz-json-1.1\nhost:${host}\nx-amz-date:${amzDate}\nx-amz-target:Textract.DetectDocumentText\n`;
    const signedHeaders = "content-type;host;x-amz-date;x-amz-target";
    
    // Create payload hash
    const payloadHash = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(payload));
    const payloadHashHex = Array.from(new Uint8Array(payloadHash)).map(b => b.toString(16).padStart(2, '0')).join('');
    
    const canonicalRequest = `${method}\n${canonicalUri}\n${canonicalQuerystring}\n${canonicalHeaders}\n${signedHeaders}\n${payloadHashHex}`;
    
    // Create string to sign
    const algorithm = "AWS4-HMAC-SHA256";
    const credentialScope = `${dateStamp}/${region}/${service}/aws4_request`;
    const canonicalRequestHash = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(canonicalRequest));
    const canonicalRequestHashHex = Array.from(new Uint8Array(canonicalRequestHash)).map(b => b.toString(16).padStart(2, '0')).join('');
    const stringToSign = `${algorithm}\n${amzDate}\n${credentialScope}\n${canonicalRequestHashHex}`;
    
    // Create signing key
    const getSignatureKey = async (key: string, dateStamp: string, regionName: string, serviceName: string) => {
      const kDate = await hmacSha256(`AWS4${key}`, dateStamp);
      const kRegion = await hmacSha256Raw(kDate, regionName);
      const kService = await hmacSha256Raw(kRegion, serviceName);
      const kSigning = await hmacSha256Raw(kService, "aws4_request");
      return kSigning;
    };
    
    const hmacSha256 = async (key: string, data: string): Promise<ArrayBuffer> => {
      const cryptoKey = await crypto.subtle.importKey(
        "raw",
        new TextEncoder().encode(key),
        { name: "HMAC", hash: "SHA-256" },
        false,
        ["sign"]
      );
      return crypto.subtle.sign("HMAC", cryptoKey, new TextEncoder().encode(data));
    };
    
    const hmacSha256Raw = async (key: ArrayBuffer, data: string): Promise<ArrayBuffer> => {
      const cryptoKey = await crypto.subtle.importKey(
        "raw",
        key,
        { name: "HMAC", hash: "SHA-256" },
        false,
        ["sign"]
      );
      return crypto.subtle.sign("HMAC", cryptoKey, new TextEncoder().encode(data));
    };
    
    const signingKey = await getSignatureKey(secretAccessKey, dateStamp, region, service);
    const signatureBuffer = await hmacSha256Raw(signingKey, stringToSign);
    const signature = Array.from(new Uint8Array(signatureBuffer)).map(b => b.toString(16).padStart(2, '0')).join('');
    
    const authorizationHeader = `${algorithm} Credential=${accessKeyId}/${credentialScope}, SignedHeaders=${signedHeaders}, Signature=${signature}`;
    
    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-amz-json-1.1",
        "X-Amz-Date": amzDate,
        "X-Amz-Target": "Textract.DetectDocumentText",
        "Authorization": authorizationHeader
      },
      body: payload
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`AWS Textract error: ${response.status} - ${errorText}`);
    }
    
    const data = await response.json();
    
    // Extract text from blocks
    const blocks = data.Blocks || [];
    const lines = blocks
      .filter((b: any) => b.BlockType === "LINE")
      .map((b: any) => b.Text)
      .join("\n");
    
    console.log(`AWS Textract extracted ${lines.length} characters`);
    return lines || "[No text detected]";
    
  } catch (error) {
    console.error("AWS Textract error:", error);
    throw error;
  }
}

// Dynamic document extraction prompt generator - discovers fields from content
function generateExtractionPrompt(text: string, documentType: string): string {
  const docText = text.substring(0, 8000);
  
  // Category hints provide context without limiting fields
  const categoryHints: Record<string, string> = {
    // Healthcare - Insurance (multiple variants)
    'insurance': `This is an insurance card or insurance document. It could be:
- PHARMACY/Rx insurance card (look for: RxBIN, RxPCN, RxGroup, pharmacy copays)
- MEDICAL insurance card (look for: member ID, group number, copays for office/specialist/ER, deductibles)
- MEDICAID card (look for: Medicaid ID, state program name, managed care organization)
- MEDICARE card (look for: Medicare number, Part A/B/C/D, QMB indicator)
- DENTAL insurance (look for: dental plan, orthodontia coverage)
- VISION insurance (look for: VSP, EyeMed, vision benefits)

CRITICAL - INSURANCE COMPANY NAME EXTRACTION:
- The INSURANCE COMPANY NAME is typically shown as the logo/branding at the TOP of the card
- Examples: "BlueCross BlueShield", "Aetna", "UnitedHealthcare", "Cigna", "Humana", "Kaiser", "UCare", "Horizon Blue Cross Blue Shield", "CVS Caremark"
- Extract this as "insurance_name" - this is the PRIMARY insurance carrier/company name
- Do NOT skip the logo/brand name - it IS the insurance company name

Extract ALL information visible on the card including the insurance company name from the logo, phone numbers, addresses, plan names, coverage details, and any identifying numbers.`,

    // Healthcare - Prescriptions
    'prescription': `This is a prescription/Rx document. Look for ALL of these if present:
- Patient information (name, DOB, address, phone, allergies)
- Prescriber information (name, NPI, DEA, address, phone, signature)
- Medication details (drug name, strength, form, quantity, sig/directions, refills, DAW)
- Pharmacy information (if pre-printed or stamped)
- Diagnosis codes, dates written/expiration
Extract every piece of information - prescriptions vary widely in format.`,

    // Healthcare - Patient Forms
    'patient-onboarding': `This is a patient intake, registration, or enrollment form. Extract ALL fields including:
- Demographics (name, DOB, SSN, gender, race, ethnicity, language)
- Contact info (address, phone, email, preferred contact method)
- Emergency contacts (name, relationship, phone)
- Insurance information (primary, secondary, subscriber info)
- Medical history (conditions, surgeries, allergies, medications)
- Consents and signatures (HIPAA, treatment consent, financial responsibility)
- Referring physician, primary care provider, specialist preferences`,

    // Healthcare - Lab Results
    'lab-results': `This is a laboratory results report. Extract ALL information:
- Patient identifiers (name, DOB, MRN, account number)
- Ordering provider and collection info
- Each test with: test name, result value, units, reference range, flags (H/L/Critical)
- Specimen type, collection date/time, received date, report date
- Lab facility info, CLIA number
- Any comments or interpretive notes`,

    // Medical Imaging
    'xray': `This is an X-ray/radiograph report. Extract:
- Patient info, MRN, accession number, study date
- Exam type and body part(s) examined
- Clinical history/indication
- Technique description
- Findings (detailed observations)
- Impression/conclusion
- Radiologist name, credentials, signature date
- Comparison to prior studies if mentioned`,

    'ct-scan': `This is a CT scan report. Extract:
- Patient info, study date, accession number
- Exam type, body regions scanned
- Contrast administration details (type, volume, timing)
- Detailed findings organized by anatomy
- Measurements of any lesions/abnormalities
- Impressions and recommendations
- Radiologist info and signature`,

    'mri': `This is an MRI report. Extract:
- Patient info, study date, accession number
- Exam type, body region, magnet strength
- Sequences performed, contrast used
- Detailed findings by anatomy
- Measurements and comparisons
- Impressions and recommendations
- Radiologist info`,

    'ecg': `This is an ECG/EKG report. Extract:
- Patient info, date/time of study
- Heart rate, rhythm interpretation
- Intervals (PR, QRS, QT/QTc)
- Axis measurements
- Detailed interpretation
- Comparison to prior ECGs
- Cardiologist/interpreter info`,

    // Financial/Business
    'invoice': `This is an invoice or bill. Extract ALL information:
- Vendor/company details (name, address, phone, email, tax ID)
- Invoice number, date, due date, PO number
- Bill-to and ship-to addresses
- Each line item (description, quantity, unit price, amount)
- Subtotal, taxes (itemized if multiple), discounts, shipping
- Total amount due, payment terms, payment instructions
- Account numbers, late fee policies`,

    'order-management': `This is a purchase order, sales order, or shipping document. Extract:
- Order/PO number, order date, ship date
- Buyer and seller information
- Shipping address, billing address
- Each item (SKU, description, quantity, price)
- Shipping method, tracking numbers
- Order status, special instructions
- Payment terms and totals`,

    // Identity Documents
    'passport': `This is a passport or travel document. Extract:
- Full legal name, nationality
- Date of birth, place of birth, gender
- Passport number, type
- Issue date, expiry date
- Issuing authority/country
- MRZ (machine readable zone) lines if visible
- Photo ID number, visa pages info if present`,

    'drivers-license': `This is a driver's license or state ID. Extract:
- Full name, address
- Date of birth, gender, height, weight, eye color
- License number, document number
- Issue date, expiry date
- Class, endorsements, restrictions
- Organ donor status
- State/jurisdiction`,

    // Facility/Organization
    'treatment-center': `This is a treatment center or healthcare facility document. Extract:
- Facility name, DBA, type of facility
- License numbers (state, federal)
- DEA registration, NPI
- Accreditation (CARF, Joint Commission, etc.)
- Address, phone, fax, email
- Administrator/medical director info
- Services offered, specialties
- Bed count, hours of operation`,

    'customer-onboarding': `This is a business/customer onboarding document. Extract:
- Company name, DBA, entity type
- Tax ID/EIN, DUNS number
- Primary contact info
- Billing address, shipping address
- Bank info if provided
- Credit terms, credit limit requested
- References, trade references
- Authorized signers`,

    'enrollment': `This is an enrollment or application form. Extract:
- Applicant information (individual or organization)
- Program/plan being enrolled in
- Eligibility information
- Effective date, coverage period
- Beneficiary information
- Premium/payment information
- Elections and options selected
- Signatures and dates`,
  };

  const hint = categoryHints[documentType] || `Analyze this document thoroughly and extract ALL structured information you can identify including names, dates, IDs, addresses, phone numbers, amounts, organizations, and any other relevant data fields.`;

  return `You are an intelligent document data extraction AI. Your job is to analyze documents and extract ALL relevant structured information.

DOCUMENT CONTEXT:
${hint}

CRITICAL INSTRUCTIONS:
1. DYNAMICALLY DISCOVER all fields - do NOT limit yourself to any predefined list
2. Extract EVERY piece of structured information visible in the document
3. Create descriptive field names in snake_case (e.g., "member_id", "effective_date", "copay_specialist")
4. For repeated/multiple values, use numbered suffixes (e.g., "medication_1", "medication_2")
5. Include confidence scores based on extraction clarity

DOCUMENT TEXT:
"""
${docText}
"""

RESPOND WITH ONLY A JSON ARRAY. Each object must have:
- type: field name in snake_case
- value: exact extracted value
- confidence: 0.0-1.0 based on clarity
- source: "nlp"

Example: [{"type":"member_id","value":"ABC123456789","confidence":0.98,"source":"nlp"},{"type":"group_number","value":"GRP-9999","confidence":0.95,"source":"nlp"}]

Extract EVERYTHING. Do not skip any visible data.`; 
}


// Now supports document-type-specific extraction prompts with OCR+NLP fusion
async function extractEntitiesWithGemini(text: string, apiKey: string, documentType: string = 'prescription'): Promise<{ type: string; value: string; confidence: number; source: string }[]> {
  // Use GEMINI_API_KEY from Universal AI infrastructure (same as useUniversalAI hook)
  const geminiApiKey = Deno.env.get("GEMINI_API_KEY") || apiKey;
  
  if (!geminiApiKey) {
    throw new Error("GEMINI_API_KEY not configured - add it in Supabase secrets");
  }
  
  console.log(`Using Gemini API for NLP entity extraction - document type: ${documentType}, text length: ${text.length}`);
  
  // Generate document-type-specific prompt
  const prompt = generateExtractionPrompt(text, documentType);

  let responseText = '';
  
  // Try multiple Gemini models in order of preference
  const models = [
    'gemini-2.5-flash-preview-05-20',
    'gemini-2.0-flash',
    'gemini-1.5-flash',
    'gemini-pro'
  ];
  
  let lastError: Error | null = null;
  
  for (const model of models) {
    try {
      console.log(`Trying Gemini model: ${model}`);
      
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${geminiApiKey}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: {
              temperature: 0.1,
              maxOutputTokens: 4096,
              responseMimeType: "application/json"
            }
          })
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        console.warn(`Gemini model ${model} error: ${response.status}`, errorText);
        lastError = new Error(`Gemini ${model} error: ${response.status}`);
        continue; // Try next model
      }

      const data = await response.json();
      responseText = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
      
      if (!responseText) {
        console.warn(`Gemini model ${model} returned empty response`);
        continue;
      }
      
      // Parse JSON from response - handle potential markdown code blocks
      let jsonStr = responseText.trim();
      if (jsonStr.startsWith('```')) {
        jsonStr = jsonStr.replace(/```json?\n?/g, '').replace(/```/g, '').trim();
      }
      
      const entities = JSON.parse(jsonStr);
      
      if (Array.isArray(entities) && entities.length > 0) {
        console.log(`AI NLP (${model}) extracted ${entities.length} entities successfully`);
        return entities.map(e => ({
          type: String(e.type || 'unknown'),
          value: String(e.value || ''),
          confidence: Number(e.confidence) || 0.8,
          source: 'nlp'
        })).filter(e => e.value.length > 0);
      }
      
      console.warn(`Gemini model ${model} returned empty or invalid array`);
    } catch (error) {
      console.warn(`Gemini model ${model} failed:`, error);
      lastError = error instanceof Error ? error : new Error(String(error));
    }
  }
  
  // All models failed
  console.error("All Gemini models failed, throwing last error");
  throw lastError || new Error("All Gemini models failed");
}

// GEMINI VISION - Direct image analysis for handwritten documents
async function extractEntitiesWithGeminiVision(
  imageBase64: string, 
  mimeType: string, 
  documentType: string,
  apiKey: string
): Promise<{ type: string; value: string; confidence: number; source: string }[]> {
  console.log(`Using Gemini Vision for direct image extraction - document type: ${documentType}`);
  
  const prompt = `You are an expert document analysis AI with advanced OCR and handwriting recognition capabilities.

TASK: Analyze this ${documentType} document image and extract ALL visible information, including:
- Printed text
- HANDWRITTEN text (signatures, notes, filled forms)
- Numbers, dates, IDs
- Checkboxes, selections
- Any stamps or marks

DOCUMENT TYPE CONTEXT: ${documentType}
${getVisionDocumentHint(documentType)}

CRITICAL INSTRUCTIONS:
1. For HANDWRITTEN text, try your best to interpret - even partial recognition is valuable
2. Mark handwritten fields with higher uncertainty if hard to read
3. Extract EVERY visible field, even if partially legible
4. Use snake_case for field names

RESPOND WITH ONLY A JSON ARRAY:
[{"type":"field_name","value":"extracted_value","confidence":0.0-1.0,"source":"vision"}]

Extract everything visible in this image.`;

  const models = ['gemini-2.5-flash-preview-05-20', 'gemini-2.0-flash', 'gemini-1.5-flash'];
  
  for (const model of models) {
    try {
      console.log(`Trying Gemini Vision model: ${model}`);
      
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{
              parts: [
                { text: prompt },
                { 
                  inlineData: { 
                    mimeType: mimeType.includes('image') ? mimeType : 'image/jpeg',
                    data: imageBase64 
                  }
                }
              ]
            }],
            generationConfig: {
              temperature: 0.1,
              maxOutputTokens: 4096,
              responseMimeType: "application/json"
            }
          })
        }
      );

      if (!response.ok) {
        console.warn(`Vision model ${model} error: ${response.status}`);
        continue;
      }

      const data = await response.json();
      let responseText = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
      
      if (!responseText) continue;
      
      // Clean JSON response
      let jsonStr = responseText.trim();
      if (jsonStr.startsWith('```')) {
        jsonStr = jsonStr.replace(/```json?\n?/g, '').replace(/```/g, '').trim();
      }
      
      const entities = JSON.parse(jsonStr);
      
      if (Array.isArray(entities) && entities.length > 0) {
        console.log(`Gemini Vision (${model}) extracted ${entities.length} entities`);
        return entities.map(e => ({
          type: String(e.type || 'unknown'),
          value: String(e.value || ''),
          confidence: Number(e.confidence) || 0.75,
          source: 'vision'
        })).filter(e => e.value.length > 0);
      }
    } catch (error) {
      console.warn(`Vision model ${model} failed:`, error);
    }
  }
  
  return [];
}

// Document type hints for Vision AI
function getVisionDocumentHint(documentType: string): string {
  const hints: Record<string, string> = {
    'prescription': 'Look for: patient name, DOB, medication name, dosage, sig/directions, prescriber name, NPI, DEA, date, refills, quantity, handwritten signatures',
    'insurance': 'Look for: member name, member ID, group number, BIN, PCN, plan name, copays, effective date, insurance company name',
    'patient-onboarding': 'Look for: full name, DOB, SSN, address, phone, email, emergency contact, insurance info, medical history checkboxes, signatures, dates',
    'lab-results': 'Look for: patient info, test names, result values with units, reference ranges, flags (H/L), specimen info, ordering physician',
    'invoice': 'Look for: vendor name, invoice number, date, line items, quantities, prices, subtotal, tax, total, payment terms',
    'drivers-license': 'Look for: full name, address, DOB, license number, expiry date, class, restrictions, photo ID',
    'passport': 'Look for: full name, nationality, DOB, passport number, issue/expiry dates, MRZ code lines'
  };
  return hints[documentType] || 'Extract all visible text, numbers, dates, names, IDs, and any handwritten content.';
}

// FUSION: Merge Vision + Text NLP results, prefer higher confidence, deduplicate
function fuseExtractionResults(
  visionEntities: { type: string; value: string; confidence: number; source: string }[],
  textEntities: { type: string; value: string; confidence: number; source: string }[]
): { type: string; value: string; confidence: number; source: string }[] {
  const merged: Map<string, { type: string; value: string; confidence: number; source: string }> = new Map();
  
  // Add vision entities first (usually better for handwritten)
  for (const entity of visionEntities) {
    const key = `${entity.type}:${entity.value.toLowerCase().trim()}`;
    const existing = merged.get(entity.type);
    
    if (!existing || entity.confidence > existing.confidence) {
      merged.set(entity.type, entity);
    }
  }
  
  // Add text entities, but only if better confidence or new field
  for (const entity of textEntities) {
    const existing = merged.get(entity.type);
    
    if (!existing) {
      merged.set(entity.type, entity);
    } else if (entity.confidence > existing.confidence + 0.1) {
      // Only replace if significantly better
      merged.set(entity.type, { ...entity, source: 'nlp+vision' });
    } else if (existing.value !== entity.value && entity.confidence > 0.7) {
      // Different value with good confidence - keep both with suffix
      merged.set(`${entity.type}_alt`, entity);
    }
  }
  
  return Array.from(merged.values());
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

function extractEntities(text: string, documentType: string = 'prescription'): { type: string; value: string; confidence: number; source: string }[] {
  const entities: { type: string; value: string; confidence: number; source: string }[] = [];
  
  // Common patterns for all document types
  const commonPatterns: { type: string; regex: RegExp; confidence: number }[] = [
    { type: 'email', regex: /[\w.-]+@[\w.-]+\.\w+/gi, confidence: 0.95 },
    { type: 'phone', regex: /\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/g, confidence: 0.9 },
    { type: 'date', regex: /\d{1,2}\/\d{1,2}\/\d{2,4}/g, confidence: 0.85 },
  ];
  
  // Document-type-specific patterns
  const insurancePatterns: { type: string; regex: RegExp; confidence: number }[] = [
    // Insurance company name
    { type: 'insurance_name', regex: /(?:Blue\s*Cross|Aetna|United\s*Healthcare|Cigna|Humana|Kaiser|Anthem|BCBS|Medicare|Medicaid|TRICARE)/gi, confidence: 0.95 },
    { type: 'insurance_name', regex: /(?:Insurance|Carrier|Plan)[:\s]*([A-Za-z\s]+?)(?:\n|Member|Group|ID)/i, confidence: 0.85 },
    // Member ID
    { type: 'member_id', regex: /(?:Member\s*ID|Subscriber\s*ID|ID\s*Number|Member\s*#)[:\s#]*([A-Z0-9-]+)/gi, confidence: 0.95 },
    { type: 'member_id', regex: /(?:ID)[:\s#]*([A-Z]{2,3}[0-9]{6,12})/gi, confidence: 0.85 },
    // Group number
    { type: 'group_number', regex: /(?:Group\s*(?:Number|No|#)?|GRP)[:\s#]*([A-Z0-9-]+)/gi, confidence: 0.9 },
    // BIN (Bank Identification Number) - typically 6 digits
    { type: 'bin', regex: /(?:BIN|Rx\s*BIN)[:\s#]*(\d{6})/gi, confidence: 0.95 },
    // PCN (Processor Control Number)
    { type: 'pcn', regex: /(?:PCN|Rx\s*PCN)[:\s#]*([A-Z0-9]+)/gi, confidence: 0.9 },
    // Plan type
    { type: 'plan_type', regex: /(?:Plan\s*Type|Coverage)[:\s]*(HMO|PPO|POS|EPO|HDHP|Indemnity)/gi, confidence: 0.95 },
    // Copay amounts
    { type: 'copay', regex: /(?:Copay|Co-?pay|Office\s*Visit)[:\s]*\$?(\d+(?:\.\d{2})?)/gi, confidence: 0.9 },
    // Deductible
    { type: 'deductible', regex: /(?:Deductible)[:\s]*\$?(\d+(?:,\d{3})?(?:\.\d{2})?)/gi, confidence: 0.9 },
    // Effective date
    { type: 'effective_date', regex: /(?:Effective|Eff\.?\s*Date|Coverage\s*Start)[:\s]*(\d{1,2}\/\d{1,2}\/\d{2,4})/gi, confidence: 0.9 },
    // Expiration date
    { type: 'expiration_date', regex: /(?:Expir(?:ation|es)?|Exp\.?\s*Date|Term\s*Date|Coverage\s*End)[:\s]*(\d{1,2}\/\d{1,2}\/\d{2,4})/gi, confidence: 0.9 },
    // Subscriber name
    { type: 'subscriber_name', regex: /(?:Subscriber|Member)\s*Name[:\s]*([A-Za-z]+(?:\s+[A-Za-z]+)+)/gi, confidence: 0.9 },
    // Customer service phone
    { type: 'issuer_phone', regex: /(?:Customer\s*Service|Call|For\s*Claims)[:\s]*\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/gi, confidence: 0.85 },
    // Rx-specific fields
    { type: 'rx_bin', regex: /(?:Rx\s*BIN)[:\s#]*(\d{6})/gi, confidence: 0.95 },
    { type: 'rx_pcn', regex: /(?:Rx\s*PCN)[:\s#]*([A-Z0-9]+)/gi, confidence: 0.9 },
    { type: 'rx_group', regex: /(?:Rx\s*Group|Rx\s*Grp)[:\s#]*([A-Z0-9-]+)/gi, confidence: 0.9 },
  ];
  
  const prescriptionPatterns: { type: string; regex: RegExp; confidence: number }[] = [
    { type: 'npi', regex: /NPI[:\s#]*(\d{10})/gi, confidence: 0.95 },
    { type: 'npi', regex: /\b\d{10}\b/g, confidence: 0.7 },
    { type: 'ssn', regex: /\d{3}-\d{2}-\d{4}/g, confidence: 0.9 },
    { type: 'insurance_id', regex: /INS-[\w-]+/gi, confidence: 0.9 },
    { type: 'patient_id', regex: /PT-[\w-]+/gi, confidence: 0.9 },
    { type: 'group_number', regex: /GRP-[\w]+/gi, confidence: 0.85 },
    { type: 'license', regex: /[A-Z]{2}-[A-Z]{2}-\d+/g, confidence: 0.85 },
    { type: 'icd_code', regex: /[A-Z]\d{2}\.\d{1,2}/g, confidence: 0.9 },
    { type: 'ndc', regex: /NDC[:\s#]*(\d{4,5}-\d{3,4}-\d{1,2})/gi, confidence: 0.95 },
    { type: 'dea', regex: /DEA[:\s#]*([A-Z]{2}\d{7})/gi, confidence: 0.95 },
  ];
  
  const invoicePatterns: { type: string; regex: RegExp; confidence: number }[] = [
    { type: 'invoice_number', regex: /(?:Invoice\s*(?:No|#|Number)?)[:\s#]*([A-Z0-9-]+)/gi, confidence: 0.95 },
    { type: 'po_number', regex: /(?:PO\s*(?:No|#|Number)?|Purchase\s*Order)[:\s#]*([A-Z0-9-]+)/gi, confidence: 0.9 },
    { type: 'vendor_name', regex: /(?:From|Vendor|Seller|Bill\s*From)[:\s]*([A-Za-z\s]+?)(?:\n|Address)/gi, confidence: 0.85 },
    { type: 'invoice_date', regex: /(?:Invoice\s*Date|Date)[:\s]*(\d{1,2}\/\d{1,2}\/\d{2,4})/gi, confidence: 0.9 },
    { type: 'due_date', regex: /(?:Due\s*Date|Payment\s*Due)[:\s]*(\d{1,2}\/\d{1,2}\/\d{2,4})/gi, confidence: 0.9 },
    { type: 'subtotal', regex: /(?:Subtotal|Sub-?Total)[:\s]*\$?(\d+(?:,\d{3})*(?:\.\d{2})?)/gi, confidence: 0.9 },
    { type: 'tax', regex: /(?:Tax|Sales\s*Tax|VAT)[:\s]*\$?(\d+(?:,\d{3})*(?:\.\d{2})?)/gi, confidence: 0.85 },
    { type: 'total', regex: /(?:Total|Amount\s*Due|Grand\s*Total)[:\s]*\$?(\d+(?:,\d{3})*(?:\.\d{2})?)/gi, confidence: 0.9 },
    { type: 'payment_terms', regex: /(?:Terms|Payment\s*Terms)[:\s]*(Net\s*\d+|Due\s*on\s*Receipt)/gi, confidence: 0.85 },
  ];
  
  const identityPatterns: { type: string; regex: RegExp; confidence: number }[] = [
    { type: 'full_name', regex: /(?:Name|Full\s*Name)[:\s]*([A-Za-z]+(?:\s+[A-Za-z]+)+)/gi, confidence: 0.9 },
    { type: 'license_number', regex: /(?:License\s*(?:No|#|Number)?|DL\s*#)[:\s#]*([A-Z0-9-]+)/gi, confidence: 0.95 },
    { type: 'passport_number', regex: /(?:Passport\s*(?:No|#|Number)?)[:\s#]*([A-Z0-9]+)/gi, confidence: 0.95 },
    { type: 'date_of_birth', regex: /(?:DOB|Date\s*of\s*Birth|Birth\s*Date)[:\s]*(\d{1,2}\/\d{1,2}\/\d{2,4})/gi, confidence: 0.95 },
    { type: 'issue_date', regex: /(?:Issue\s*Date|Issued)[:\s]*(\d{1,2}\/\d{1,2}\/\d{2,4})/gi, confidence: 0.9 },
    { type: 'expiry_date', regex: /(?:Expir(?:y|ation)\s*Date|Expires?)[:\s]*(\d{1,2}\/\d{1,2}\/\d{2,4})/gi, confidence: 0.9 },
    { type: 'nationality', regex: /(?:Nationality|Citizenship)[:\s]*([A-Za-z\s]+)/gi, confidence: 0.85 },
    { type: 'gender', regex: /(?:Sex|Gender)[:\s]*(Male|Female|M|F)/gi, confidence: 0.9 },
  ];
  
  // Select patterns based on document type
  let patterns: { type: string; regex: RegExp; confidence: number }[] = [...commonPatterns];
  
  switch (documentType) {
    case 'insurance':
      patterns = [...patterns, ...insurancePatterns];
      break;
    case 'prescription':
      patterns = [...patterns, ...prescriptionPatterns];
      break;
    case 'invoice':
    case 'receipt':
      patterns = [...patterns, ...invoicePatterns];
      break;
    case 'passport':
    case 'drivers-license':
      patterns = [...patterns, ...identityPatterns];
      break;
    case 'patient-onboarding':
    case 'lab-results':
      patterns = [...patterns, ...prescriptionPatterns]; // Use healthcare patterns
      break;
    default:
      // For unknown types, use all patterns
      patterns = [...patterns, ...prescriptionPatterns, ...insurancePatterns];
  }

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
          entities.push({ type, value, confidence, source: 'ocr' });
        }
      }
    }
  }

  // Enhanced patient name extraction - look for patterns in prescription documents
  const patientNamePatterns = [
    { regex: /Patient\s+Name[:\s]*([A-Z][a-z]+(?:\s+[A-Z][a-z]+)+)/i, confidence: 0.95 },
    { regex: /PATIENT\s+NAME\s*\n?\s*([A-Z][a-z]+)\s*\n?\s*[•·]?\s*Patient\s+name\s*\n?\s*([A-Z][a-z]+)/i, confidence: 0.9, combineGroups: true },
    { regex: /Name:\s*([A-Z][a-z]+(?:\s+[A-Z][a-z]+)+)/i, confidence: 0.85 },
    { regex: /([A-Z][a-z]+)\s+([A-Z][a-z]+)\s*\n\s*(?:Date of birth|DOB)/i, confidence: 0.85, combineGroups: true },
  ];

  for (const pattern of patientNamePatterns) {
    if (entities.find(e => e.type === 'patient_name')) break;
    const match = text.match(pattern.regex);
    if (match) {
      let value = '';
      if ((pattern as any).combineGroups && match[1] && match[2]) {
        value = `${match[1].trim()} ${match[2].trim()}`;
      } else if (match[1]) {
        value = match[1].trim();
      }
      if (value && value.length > 2) {
        entities.push({ type: 'patient_name', value, confidence: pattern.confidence });
      }
    }
  }

  // Enhanced DOB extraction
  const dobPatterns = [
    { regex: /DOB[:\s]*(\d{1,2}\/\d{1,2}\/\d{2,4})/i, confidence: 0.95 },
    { regex: /Date\s+of\s+birth[:\s]*(\d{1,2}\/\d{1,2}\/\d{2,4})/i, confidence: 0.95 },
    { regex: /Birth\s*Date[:\s]*(\d{1,2}\/\d{1,2}\/\d{2,4})/i, confidence: 0.9 },
  ];

  for (const { regex, confidence } of dobPatterns) {
    if (entities.find(e => e.type === 'date_of_birth' || e.type === 'patient_dob')) break;
    const match = text.match(regex);
    if (match && match[1]) {
      entities.push({ type: 'patient_dob', value: match[1].trim(), confidence });
      entities.push({ type: 'date_of_birth', value: match[1].trim(), confidence });
    }
  }

  // Enhanced medication extraction - handle formats like "Colace 100mg"
  const medicationPatterns = [
    // Standard drug + strength format
    { regex: /([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)\s+(\d+\s*(?:mg|mcg|ml|g|mg\/ml))/gi, confidence: 0.9 },
    // Prescription with bullet point format
    { regex: /[•·]\s*([A-Z][a-z]+)\s+(\d+\s*(?:mg|mcg|ml|g|mg\/ml))/gi, confidence: 0.9 },
    // Medication label format
    { regex: /(?:Medication|Drug|Rx)[:\s]+([A-Z][a-z]+(?:\s+\d+\s*(?:mg|mcg|ml|g))?)/i, confidence: 0.85 },
  ];

  // Common drug name list for better matching
  const commonDrugs = [
    'Colace', 'Metformin', 'Lisinopril', 'Atorvastatin', 'Levothyroxine', 'Amlodipine', 
    'Omeprazole', 'Losartan', 'Gabapentin', 'Hydrocodone', 'Sertraline', 'Simvastatin',
    'Metoprolol', 'Pantoprazole', 'Escitalopram', 'Tramadol', 'Prednisone', 'Amoxicillin',
    'Azithromycin', 'Alprazolam', 'Trazodone', 'Atenolol', 'Clopidogrel', 'Montelukast',
    'Furosemide', 'Fluoxetine', 'Citalopram', 'Zoloft', 'Lipitor', 'Norvasc', 'Glucophage',
    'Aspirin', 'Ibuprofen', 'Acetaminophen', 'Tylenol', 'Advil', 'Motrin'
  ];

  // Try to find common drug names with strength
  for (const drug of commonDrugs) {
    const drugRegex = new RegExp(`(${drug})\\s*(\\d+\\s*(?:mg|mcg|ml|g|mg\\/ml))?`, 'gi');
    const match = text.match(drugRegex);
    if (match && match[0]) {
      const value = match[0].trim();
      if (!entities.find(e => e.type === 'medication' && e.value.toLowerCase().includes(drug.toLowerCase()))) {
        entities.push({ type: 'medication', value, confidence: 0.95 });
        // Also extract strength separately
        const strengthMatch = match[0].match(/(\d+\s*(?:mg|mcg|ml|g|mg\/ml))/i);
        if (strengthMatch && !entities.find(e => e.type === 'strength')) {
          entities.push({ type: 'strength', value: strengthMatch[1].trim(), confidence: 0.9 });
        }
        break;
      }
    }
  }

  // Extract name patterns (provider/prescriber)
  const namePatterns = [
    { regex: /Provider\s+Name:\s*(.+?)(?:\n|$)/i, type: 'provider' },
    { regex: /Prescriber:\s*(.+?)(?:\n|$)/i, type: 'prescriber' },
    { regex: /Dr\.\s*([A-Za-z]+(?:\s+[A-Za-z]+)*(?:,?\s*(?:MD|DO|NP|PA|PharmD))?)/i, type: 'prescriber' },
    { regex: /Facility\s+Name:\s*(.+?)(?:\n|$)/i, type: 'facility' },
  ];

  for (const { regex, type } of namePatterns) {
    const match = text.match(regex);
    if (match && match[1]) {
      if (!entities.find(e => e.type === type)) {
        entities.push({ type, value: match[1].trim(), confidence: 0.85 });
      }
    }
  }

  // Extract address patterns
  const addressPatterns = [
    { regex: /Patient\s+Address:\s*(.+?)(?:\n|$)/i, type: 'patient_address', confidence: 0.9 },
    { regex: /Prescriber\s+Address:\s*(.+?)(?:\n|$)/i, type: 'prescriber_address', confidence: 0.9 },
    { regex: /Pharmacy\s+Address:\s*(.+?)(?:\n|$)/i, type: 'pharmacy_address', confidence: 0.9 },
    { regex: /Address:\s*(\d+.+?,\s*[A-Za-z\s]+,\s*[A-Z]{2}\s*\d{5})/i, type: 'address', confidence: 0.85 },
  ];

  for (const { regex, type, confidence } of addressPatterns) {
    const match = text.match(regex);
    if (match && match[1]) {
      if (!entities.find(e => e.type === type)) {
        entities.push({ type, value: match[1].trim(), confidence });
      }
    }
  }

  // DOB extraction already handled above with dobPatterns

  // Extract pharmacy information
  const pharmacyPatterns = [
    { regex: /Pharmacy:\s*(.+?)(?:\n|$)/i, type: 'pharmacy', confidence: 0.9 },
    { regex: /Pharmacy\s+Name:\s*(.+?)(?:\n|$)/i, type: 'pharmacy', confidence: 0.9 },
    { regex: /Send\s+to:\s*(.+?)(?:\n|$)/i, type: 'pharmacy', confidence: 0.85 },
    { regex: /Pharmacy\s+Phone:\s*(.+?)(?:\n|$)/i, type: 'pharmacy_phone', confidence: 0.9 },
    { regex: /Pharmacy\s+NPI:\s*(\d{10})/i, type: 'pharmacy_npi', confidence: 0.95 },
  ];

  for (const { regex, type, confidence } of pharmacyPatterns) {
    const match = text.match(regex);
    if (match && match[1]) {
      if (!entities.find(e => e.type === type)) {
        entities.push({ type, value: match[1].trim(), confidence });
      }
    }
  }

  // Extract refill status
  const refillStatusPatterns = [
    { regex: /Refill\s+Status:\s*(.+?)(?:\n|$)/i, type: 'refill_status', confidence: 0.9 },
    { regex: /(?:New\s+Prescription|Refill\s+Request|Transfer)/i, type: 'refill_status', confidence: 0.85 },
  ];

  for (const { regex, type, confidence } of refillStatusPatterns) {
    const match = text.match(regex);
    if (match) {
      const value = match[1] ? match[1].trim() : match[0].trim();
      if (!entities.find(e => e.type === type)) {
        entities.push({ type, value, confidence });
      }
    }
  }

  // Medication extraction already handled above with commonDrugs list

  // Extract SIG/Instructions - enhanced patterns for prescription abbreviations
  const sigPatterns = [
    { regex: /(?:SIG|Sig|Directions|Instructions):\s*(.+?)(?:\n|$)/i, type: 'sig', confidence: 0.95 },
    { regex: /Take\s+(\d+\s*(?:tablet|capsule|pill|drop|puff)s?\s+(?:by mouth|orally|twice|once|three times|four times|daily|p\.?o\.?|bid|tid|qid|prn).+?)(?:\n|$)/i, type: 'sig', confidence: 0.9 },
    // Match prescription abbreviation patterns like "TT tablets p.o. T.i.d. X 7 days"
    { regex: /((?:TT|T{1,2}|I{1,3}|[I1-9])\s*(?:tablet|tab|cap|capsule)s?\s*(?:p\.?o\.?|by mouth|orally)?\s*(?:T\.?i\.?d\.?|t\.?i\.?d\.?|B\.?i\.?d\.?|b\.?i\.?d\.?|Q\.?d\.?|q\.?d\.?|Q\.?i\.?d\.?|q\.?i\.?d\.?|PRN|prn|daily|twice daily|three times daily|four times daily)\.?\s*(?:X\s*\d+\s*days?|for\s*\d+\s*days?)?)/i, type: 'sig', confidence: 0.9 },
    // Match lines after Rx containing dosing instructions
    { regex: /Rx\s+[A-Za-z]+.*?\n\s*((?:TT|T{1,2}|[I1-9]\s*(?:tablet|tab|capsule|cap)s?|Take\s+\d+).+?(?:daily|days?|prn|p\.o\.|bid|tid|qid)[^\n]*)/i, type: 'sig', confidence: 0.85 },
  ];

  for (const { regex, type, confidence } of sigPatterns) {
    const match = text.match(regex);
    if (match && match[1]) {
      if (!entities.find(e => e.type === type)) {
        // Expand abbreviations for clarity
        let sigValue = match[1].trim();
        sigValue = sigValue.replace(/\bTT\b/gi, '2');
        sigValue = sigValue.replace(/\bp\.?o\.?\b/gi, 'by mouth');
        sigValue = sigValue.replace(/\bT\.?i\.?d\.?\b/gi, '3 times daily');
        sigValue = sigValue.replace(/\bB\.?i\.?d\.?\b/gi, 'twice daily');
        sigValue = sigValue.replace(/\bQ\.?i\.?d\.?\b/gi, '4 times daily');
        sigValue = sigValue.replace(/\bQ\.?d\.?\b/gi, 'once daily');
        entities.push({ type, value: sigValue, confidence, source: 'ocr' });
      }
    }
  }

  // Extract quantity - enhanced patterns for "#42" format
  const quantityPatterns = [
    { regex: /#\s*(\d+)/i, confidence: 0.95 }, // "#42" or "# 42"
    { regex: /(?:Qty|Quantity|Disp|Dispense)[:\s#]*(\d+)/i, confidence: 0.9 },
    { regex: /(?:^|\s)QTY[:\s]*(\d+)/i, confidence: 0.9 },
    { regex: /Dispense:\s*(\d+)/i, confidence: 0.9 },
  ];

  for (const { regex, confidence } of quantityPatterns) {
    if (entities.find(e => e.type === 'quantity')) break;
    const match = text.match(regex);
    if (match && match[1]) {
      entities.push({ type: 'quantity', value: match[1], confidence, source: 'ocr' });
    }
  }

  // Extract refills - enhanced patterns
  const refillsPatterns = [
    { regex: /(?:Refills?|Ref)[:\s#]*(\d+)/i, confidence: 0.9 },
    { regex: /Refill\s+(\d+)\s*Times/i, confidence: 0.9 },
    { regex: /Do\s+Not\s+Refill/i, confidence: 0.95, value: '0' }, // Explicit no refill
  ];

  for (const { regex, confidence, value } of refillsPatterns) {
    if (entities.find(e => e.type === 'refills')) break;
    const match = text.match(regex);
    if (match) {
      const refillValue = value || (match[1] ? match[1] : '0');
      entities.push({ type: 'refills', value: refillValue, confidence, source: 'ocr' });
    }
  }

  const daysSupplyMatch = text.match(/(?:Days?\s*Supply|DS)[:\s#]*(\d+)/i);
  if (daysSupplyMatch) {
    entities.push({ type: 'days_supply', value: daysSupplyMatch[1], confidence: 0.9, source: 'ocr' });
  }

  // Extract strength
  const strengthMatch = text.match(/(?:Strength|Dose):\s*(\d+\s*(?:mg|mcg|ml|g))/i);
  if (strengthMatch) {
    entities.push({ type: 'strength', value: strengthMatch[1], confidence: 0.9, source: 'ocr' });
  }

  // Extract date written - enhanced patterns
  const dateWrittenPatterns = [
    { regex: /(?:Date\s+Written|Written|Rx\s+Date)[:\s]*(\d{1,2}\/\d{1,2}\/\d{2,4})/i, confidence: 0.95 },
    { regex: /^Date\s+(\d{1,2}\/\d{1,2}\/\d{2,4})/im, confidence: 0.9 }, // "Date 10/3/00" at start of line
    { regex: /Date[:\s]+(\d{1,2}\/\d{1,2}\/\d{2,4})/i, confidence: 0.85 },
  ];

  for (const { regex, confidence } of dateWrittenPatterns) {
    if (entities.find(e => e.type === 'date_written')) break;
    const match = text.match(regex);
    if (match && match[1]) {
      entities.push({ type: 'date_written', value: match[1], confidence, source: 'ocr' });
    }
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

  // Extract allergies
  const allergiesMatch = text.match(/(?:Allergies|Known\s+Allergies):\s*(.+?)(?:\n|$)/i);
  if (allergiesMatch) {
    entities.push({ type: 'allergies', value: allergiesMatch[1].trim(), confidence: 0.85 });
  }

  return entities;
}

function extractFormFields(text: string, targetFields: string[]): { fieldName: string; value: string; confidence: number; fieldType?: string }[] {
  const fields: { fieldName: string; value: string; confidence: number; fieldType?: string }[] = [];
  
  const fieldPatterns: Record<string, { patterns: RegExp[]; type: string }> = {
    // Patient information
    patient_name: { patterns: [/Patient\s+Name:\s*(.+?)(?:\n|$)/i, /Name:\s*([A-Z][a-z]+(?:\s+[A-Z][a-z]+)+)/i], type: 'text' },
    patient_dob: { patterns: [/Date\s+of\s+Birth:\s*(.+?)(?:\n|$)/i, /DOB:\s*(.+?)(?:\n|$)/i], type: 'date' },
    date_of_birth: { patterns: [/Date\s+of\s+Birth:\s*(.+?)(?:\n|$)/i, /DOB:\s*(.+?)(?:\n|$)/i], type: 'date' },
    patient_address: { patterns: [/Patient\s+Address:\s*(.+?)(?:\n|$)/i], type: 'text' },
    patient_phone: { patterns: [/Patient\s+Phone:\s*(.+?)(?:\n|$)/i], type: 'text' },
    
    // Prescriber/Provider information
    prescriber_name: { patterns: [/Prescriber:\s*(.+?)(?:\n|$)/i, /Provider\s+Name:\s*(.+?)(?:\n|$)/i, /Dr\.\s*([A-Za-z]+(?:\s+[A-Za-z]+)*(?:,?\s*(?:MD|DO|NP|PA))?)/i], type: 'text' },
    prescriber_npi: { patterns: [/(?:Prescriber\s+)?NPI[:\s#]*(\d{10})/i, /NPI:\s*(\d{10})/i], type: 'number' },
    prescriber_dea: { patterns: [/DEA[:\s#]*([A-Z]{2}\d{7})/i], type: 'text' },
    prescriber_address: { patterns: [/Prescriber\s+Address:\s*(.+?)(?:\n|$)/i], type: 'text' },
    npi: { patterns: [/NPI[:\s#]*(\d{10})/i], type: 'number' },
    provider: { patterns: [/Provider\s+Name:\s*(.+?)(?:\n|$)/i], type: 'text' },
    
    // Medication fields
    medication: { patterns: [
      /(?:Medication|Drug):\s*([A-Za-z]+(?:\s+\d+\s*(?:mg|mcg|ml|g))?)/i,
      /\b(Metformin|Lisinopril|Atorvastatin|Levothyroxine|Amlodipine|Omeprazole|Losartan|Gabapentin|Hydrocodone|Sertraline|Atenolol|Clopidogrel|Montelukast|Furosemide|Fluoxetine)\s*(\d+\s*mg)?/i
    ], type: 'text' },
    strength: { patterns: [/(?:Strength|Dose):\s*(\d+\s*(?:mg|mcg|ml|g))/i], type: 'text' },
    sig: { patterns: [
      /(?:SIG|Sig|Directions|Instructions):\s*(.+?)(?:\n|$)/i,
      /Take\s+(\d+\s*(?:tablet|capsule)s?\s+.+?)(?:\n|$)/i
    ], type: 'text' },
    quantity: { patterns: [/(?:Qty|Quantity|Disp|Dispense)[:\s#]*(\d+)/i], type: 'number' },
    days_supply: { patterns: [/(?:Days?\s*Supply|DS)[:\s#]*(\d+)/i], type: 'number' },
    refills: { patterns: [/(?:Refills?|Ref)[:\s#]*(\d+)/i], type: 'number' },
    refill_status: { patterns: [/Refill\s+Status:\s*(.+?)(?:\n|$)/i, /(New\s+Prescription|Refill\s+Request|Transfer)/i], type: 'text' },
    ndc: { patterns: [/NDC[:\s#]*(\d{4,5}-\d{3,4}-\d{1,2})/i], type: 'text' },
    date_written: { patterns: [/(?:Date\s+Written|Written|Rx\s+Date)[:\s]*(\d{1,2}\/\d{1,2}\/\d{2,4})/i], type: 'date' },
    
    // Pharmacy information
    pharmacy: { patterns: [/Pharmacy:\s*(.+?)(?:\n|$)/i, /Pharmacy\s+Name:\s*(.+?)(?:\n|$)/i, /Send\s+to:\s*(.+?)(?:\n|$)/i], type: 'text' },
    pharmacy_address: { patterns: [/Pharmacy\s+Address:\s*(.+?)(?:\n|$)/i], type: 'text' },
    pharmacy_phone: { patterns: [/Pharmacy\s+Phone:\s*(.+?)(?:\n|$)/i], type: 'text' },
    pharmacy_npi: { patterns: [/Pharmacy\s+NPI:\s*(\d{10})/i], type: 'number' },
    
    // Insurance information
    insurance_id: { patterns: [/Insurance\s+ID:\s*(.+?)(?:\n|$)/i], type: 'text' },
    insurance_name: { patterns: [/Insurance\s+Provider:\s*(.+?)(?:\n|$)/i, /Insurance:\s*(.+?)(?:\n|$)/i], type: 'text' },
    group_number: { patterns: [/Group\s+Number:\s*(.+?)(?:\n|$)/i, /GRP-(\w+)/i], type: 'text' },
    bin: { patterns: [/BIN:\s*(\d+)/i], type: 'text' },
    pcn: { patterns: [/PCN:\s*(.+?)(?:\n|$)/i], type: 'text' },
    
    // Clinical information
    diagnosis: { patterns: [/Primary\s+Diagnosis:\s*(.+?)(?:\n|$)/i, /Diagnosis:\s*(.+?)(?:\n|$)/i], type: 'text' },
    allergies: { patterns: [/Allergies:\s*(.+?)(?:\n|$)/i], type: 'text' },
    
    // Other
    phone: { patterns: [/Phone:\s*(.+?)(?:\n|$)/i], type: 'text' },
    email: { patterns: [/Email:\s*(.+?)(?:\n|$)/i], type: 'text' },
    address: { patterns: [/Address:\s*(.+?)(?:\n|$)/i], type: 'text' },
    facility: { patterns: [/Facility\s+Name:\s*(.+?)(?:\n|$)/i], type: 'text' },
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
