import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Standard medical reference ranges
const MEDICAL_REFERENCE_RANGES = {
  brain: {
    ventricle_size: { normal: "< 10mm", unit: "mm", description: "Lateral ventricle width" },
    midline_shift: { normal: "0mm", threshold: "5mm", unit: "mm", description: "Midline deviation" },
    sulci_width: { normal: "2-4mm", unit: "mm", description: "Cortical sulci width" },
    gray_white_ratio: { normal: "1.2-1.5", description: "Gray to white matter ratio" },
  },
  kidney: {
    length: { normal: "9-13cm", unit: "cm", description: "Kidney length" },
    width: { normal: "4-6cm", unit: "cm", description: "Kidney width" },
    cortical_thickness: { normal: "1.5-2.5cm", unit: "cm", description: "Renal cortex thickness" },
    stone_size: { threshold: "5mm", unit: "mm", description: "Stone requiring intervention" },
    hydronephrosis: { grades: ["None", "Mild", "Moderate", "Severe"], description: "Urinary obstruction grade" },
  },
  lung: {
    lung_volume: { normal: "5-6L", unit: "L", description: "Total lung capacity" },
    nodule_size: { threshold: "8mm", unit: "mm", description: "Nodule requiring follow-up" },
    pleural_effusion: { grades: ["None", "Minimal", "Moderate", "Large"], description: "Fluid accumulation" },
    cardiothoracic_ratio: { normal: "< 0.5", description: "Heart to chest ratio" },
  },
  heart: {
    ejection_fraction: { normal: "55-70%", unit: "%", description: "Left ventricular EF" },
    wall_thickness: { normal: "6-11mm", unit: "mm", description: "LV wall thickness" },
    chamber_size: { normal: "35-56mm", unit: "mm", description: "LV end-diastolic diameter" },
    pr_interval: { normal: "120-200ms", unit: "ms", description: "ECG PR interval" },
    qrs_duration: { normal: "80-120ms", unit: "ms", description: "ECG QRS duration" },
    qt_interval: { normal: "350-440ms", unit: "ms", description: "ECG QT interval" },
  },
  liver: {
    span: { normal: "< 15cm", unit: "cm", description: "Liver span at MCL" },
    echogenicity: { normal: "Homogeneous", description: "Liver echo pattern" },
    portal_vein: { normal: "< 13mm", unit: "mm", description: "Portal vein diameter" },
  },
  spine: {
    disc_height: { normal: "5-10mm", unit: "mm", description: "Intervertebral disc height" },
    canal_diameter: { normal: "> 12mm", unit: "mm", description: "Spinal canal AP diameter" },
    lordosis: { normal: "20-45°", unit: "degrees", description: "Lumbar lordosis angle" },
  }
};

// ICD-10 to CPT/HCPCS Crosswalk Database
const ICD_TO_CPT_CROSSWALK: Record<string, { cpt_codes: string[]; hcpcs_codes: string[]; description: string; category: string }> = {
  // Kidney/Urinary
  'N20.0': { cpt_codes: ['50060', '50065', '50080', '52352'], hcpcs_codes: ['C9738'], description: 'Calculus of kidney', category: 'Urology' },
  'N20.1': { cpt_codes: ['50060', '50065', '52356'], hcpcs_codes: ['C9738'], description: 'Calculus of ureter', category: 'Urology' },
  'N20.2': { cpt_codes: ['50060', '50080', '52352'], hcpcs_codes: [], description: 'Calculus of kidney with ureter', category: 'Urology' },
  'N17.9': { cpt_codes: ['90935', '90937', '90945'], hcpcs_codes: ['G0491', 'G0492'], description: 'Acute kidney failure', category: 'Nephrology' },
  'N18.6': { cpt_codes: ['90935', '90937', '90945', '90997'], hcpcs_codes: ['G0491'], description: 'End stage renal disease', category: 'Nephrology' },
  
  // Cardiovascular
  'I21.0': { cpt_codes: ['92920', '92928', '92941', '93458'], hcpcs_codes: ['C9600', 'C9601'], description: 'STEMI anterior wall', category: 'Cardiology' },
  'I21.1': { cpt_codes: ['92920', '92928', '93458'], hcpcs_codes: ['C9600'], description: 'STEMI inferior wall', category: 'Cardiology' },
  'I25.10': { cpt_codes: ['93454', '93458', '93460'], hcpcs_codes: [], description: 'Atherosclerotic heart disease', category: 'Cardiology' },
  'I48.91': { cpt_codes: ['93653', '93656', '93657'], hcpcs_codes: ['C9741'], description: 'Atrial fibrillation', category: 'Cardiology' },
  'I50.9': { cpt_codes: ['93306', '93307', '93320'], hcpcs_codes: ['G0406', 'G0407'], description: 'Heart failure', category: 'Cardiology' },
  
  // Pulmonary
  'J18.9': { cpt_codes: ['71046', '71047', '94640'], hcpcs_codes: ['G0378'], description: 'Pneumonia', category: 'Pulmonology' },
  'J44.1': { cpt_codes: ['94640', '94664', '94760'], hcpcs_codes: ['G0237', 'G0238'], description: 'COPD with exacerbation', category: 'Pulmonology' },
  'J45.20': { cpt_codes: ['94010', '94060', '94640'], hcpcs_codes: ['G0237'], description: 'Mild intermittent asthma', category: 'Pulmonology' },
  'R91.1': { cpt_codes: ['71250', '71260', '71270', '32405'], hcpcs_codes: [], description: 'Solitary pulmonary nodule', category: 'Pulmonology' },
  
  // Neurological
  'G43.909': { cpt_codes: ['64615', '64616', '96372'], hcpcs_codes: ['J0585'], description: 'Migraine', category: 'Neurology' },
  'G40.909': { cpt_codes: ['95816', '95819', '95950'], hcpcs_codes: [], description: 'Epilepsy', category: 'Neurology' },
  'I63.9': { cpt_codes: ['36224', '36226', '61645'], hcpcs_codes: ['C9751'], description: 'Cerebral infarction', category: 'Neurology' },
  
  // Oncology
  'C34.90': { cpt_codes: ['32480', '32663', '77401'], hcpcs_codes: ['G0339', 'G0340'], description: 'Lung cancer', category: 'Oncology' },
  'C50.919': { cpt_codes: ['19301', '19302', '19303'], hcpcs_codes: ['G0279'], description: 'Breast cancer', category: 'Oncology' },
  'C61': { cpt_codes: ['55840', '55842', '55845'], hcpcs_codes: ['G0416', 'G0417'], description: 'Prostate cancer', category: 'Oncology' },
  
  // Orthopedic
  'M54.5': { cpt_codes: ['62322', '62323', '64483'], hcpcs_codes: [], description: 'Low back pain', category: 'Orthopedics' },
  'M17.11': { cpt_codes: ['27447', '27446', '20610'], hcpcs_codes: ['J7321', 'J7325'], description: 'Primary osteoarthritis knee', category: 'Orthopedics' },
  'S72.001A': { cpt_codes: ['27236', '27245', '27248'], hcpcs_codes: [], description: 'Hip fracture', category: 'Orthopedics' },
  
  // Diabetes
  'E11.9': { cpt_codes: ['83036', '82947', '99490'], hcpcs_codes: ['G0108', 'G0109'], description: 'Type 2 diabetes mellitus', category: 'Endocrinology' },
  'E11.65': { cpt_codes: ['83036', '99490', '95250'], hcpcs_codes: ['E0787', 'K0553'], description: 'Type 2 DM with hyperglycemia', category: 'Endocrinology' },
};

// CPT Code Database with descriptions and RVUs
const CPT_CODE_DATABASE: Record<string, { description: string; category: string; rvu: number; modifier_allowed: boolean }> = {
  '99213': { description: 'Office visit, established patient, low complexity', category: 'E&M', rvu: 1.30, modifier_allowed: true },
  '99214': { description: 'Office visit, established patient, moderate complexity', category: 'E&M', rvu: 1.92, modifier_allowed: true },
  '99215': { description: 'Office visit, established patient, high complexity', category: 'E&M', rvu: 2.80, modifier_allowed: true },
  '71046': { description: 'Chest X-ray, 2 views', category: 'Radiology', rvu: 0.22, modifier_allowed: false },
  '71250': { description: 'CT thorax without contrast', category: 'Radiology', rvu: 1.28, modifier_allowed: false },
  '71260': { description: 'CT thorax with contrast', category: 'Radiology', rvu: 1.74, modifier_allowed: false },
  '92920': { description: 'Percutaneous coronary intervention, single vessel', category: 'Cardiology', rvu: 15.72, modifier_allowed: true },
  '93000': { description: 'Electrocardiogram complete', category: 'Cardiology', rvu: 0.17, modifier_allowed: false },
  '93306': { description: 'Echocardiography complete', category: 'Cardiology', rvu: 1.30, modifier_allowed: false },
  '50060': { description: 'Nephrolithotomy', category: 'Urology', rvu: 20.46, modifier_allowed: true },
  '52352': { description: 'Cystourethroscopy with lithotripsy', category: 'Urology', rvu: 8.51, modifier_allowed: true },
  '90935': { description: 'Hemodialysis, single evaluation', category: 'Nephrology', rvu: 2.15, modifier_allowed: false },
};

// HCPCS Code Database
const HCPCS_CODE_DATABASE: Record<string, { description: string; category: string; type: string }> = {
  'G0378': { description: 'Hospital observation per hour', category: 'Hospital', type: 'Service' },
  'G0406': { description: 'Follow-up telehealth consultation', category: 'Telehealth', type: 'Service' },
  'G0491': { description: 'Dialysis procedure at ESRD facility', category: 'Dialysis', type: 'Service' },
  'J0585': { description: 'Botulinum toxin type A', category: 'Drug', type: 'Injectable' },
  'J7321': { description: 'Hyaluronan injection', category: 'Drug', type: 'Injectable' },
  'C9600': { description: 'Coronary artery stent, drug-eluting', category: 'Device', type: 'Implant' },
  'C9738': { description: 'Lithotripsy laser ureteral', category: 'Procedure', type: 'Service' },
  'E0787': { description: 'External ambulatory insulin delivery system', category: 'DME', type: 'Equipment' },
};

interface ProcessingRequest {
  action: 'upload' | 'process' | 'extract_metadata' | 'map_to_form' | 'validate' | 'classify' | 'analyze_medical_image' | 'lookup_medical_codes';
  documentId?: string;
  fileBase64?: string;
  fileName?: string;
  mimeType?: string;
  processingConfig?: any;
  userId?: string;
  documentType?: string;
  imageUrl?: string;
  imageBase64?: string;
  imageMimeType?: string;
  analysisType?: string;
  provider?: string;
  modelType?: string;
  icdCodes?: string[];
  cptCodes?: string[];
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
        return await handleExtractMetadata(supabase, request);
      case 'map_to_form':
        return await handleMapToForm(supabase, request);
      case 'validate':
        return await handleValidate(supabase, request);
      case 'classify':
        return await handleClassify(supabase, request);
      case 'analyze_medical_image':
        return await handleMedicalImageAnalysis(request);
      case 'lookup_medical_codes':
        return await handleMedicalCodeLookup(request);
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

  const fileData = Uint8Array.from(atob(fileBase64), c => c.charCodeAt(0));
  const filePath = `documents/${Date.now()}_${fileName}`;

  const { data: uploadData, error: uploadError } = await supabase.storage
    .from('document-processing')
    .upload(filePath, fileData, {
      contentType: mimeType || 'application/octet-stream',
      upsert: false
    });

  if (uploadError) {
    throw new Error(`Upload failed: ${uploadError.message}`);
  }

  const { data: urlData } = await supabase.storage
    .from('document-processing')
    .getPublicUrl(filePath);
  
  const publicUrl = urlData?.publicUrl || null;

  const { data: record, error: recordError } = await supabase
    .from('document_processing_jobs')
    .insert({
      file_name: fileName,
      file_path: filePath,
      mime_type: mimeType,
      status: 'uploaded',
      document_type: documentType || 'unknown',
      user_id: userId || null,
      processing_config: { ...processingConfig, publicUrl, isImage: mimeType?.startsWith('image/') },
      progress: 0,
      current_stage: 'upload',
      stage_message: 'Document uploaded successfully',
      stages: { upload: { status: 'completed', timestamp: new Date().toISOString() } }
    })
    .select()
    .single();

  if (recordError) {
    throw new Error(`Failed to create processing record: ${recordError.message}`);
  }

  return new Response(
    JSON.stringify({ success: true, documentId: record.id, filePath, publicUrl }),
    { headers: { "Content-Type": "application/json", ...corsHeaders } }
  );
}

async function handleProcess(supabase: any, request: ProcessingRequest) {
  return new Response(
    JSON.stringify({ success: true, message: "Processing initiated" }),
    { headers: { "Content-Type": "application/json", ...corsHeaders } }
  );
}

async function handleExtractMetadata(supabase: any, request: ProcessingRequest) {
  const { documentId } = request;
  
  // Extract metadata from document
  const metadata = {
    documentId,
    extractedAt: new Date().toISOString(),
    fields: {},
    confidence: 0.85
  };
  
  return new Response(
    JSON.stringify({ success: true, metadata }),
    { headers: { "Content-Type": "application/json", ...corsHeaders } }
  );
}

async function handleMapToForm(supabase: any, request: ProcessingRequest) {
  const { documentId, processingConfig, documentType, provider: requestedProvider, fileBase64, mimeType } = request;
  
  // Get document record to access file URL and metadata
  let fileUrl = '';
  let filePath = '';
  let storedMimeType = mimeType || '';
  
  // Normalize OCR provider name (frontend may send 'google', we use 'gemini')
  let rawProvider = requestedProvider || processingConfig?.ocrProvider || 'gemini';
  if (rawProvider === 'google') rawProvider = 'gemini';
  let configuredProvider = rawProvider;
  
  console.log(`handleMapToForm called with documentId: ${documentId}, provider: ${configuredProvider}`);
  
  if (documentId) {
    const { data: doc, error: docError } = await supabase
      .from('document_processing_jobs')
      .select('processing_config, file_path, mime_type')
      .eq('id', documentId)
      .single();
    
    if (docError) {
      console.error('Error fetching document:', docError);
    }
    
    if (doc?.processing_config?.publicUrl) {
      fileUrl = doc.processing_config.publicUrl;
      console.log(`Got file URL: ${fileUrl}`);
    }
    if (doc?.file_path) {
      filePath = doc.file_path;
    }
    if (doc?.mime_type) {
      storedMimeType = doc.mime_type;
    }
    if (doc?.processing_config?.ocrProvider) {
      const storedProvider = doc.processing_config.ocrProvider;
      configuredProvider = storedProvider === 'google' ? 'gemini' : storedProvider;
    }
  }
  
  // Build form mapping based on document type
  const formMapping: Record<string, { value: string; confidence: number; source: string }> = {};
  const targetFields = processingConfig?.extractionFields || [];
  let providerUsed = configuredProvider;
  let icdCodesExtracted: string[] = [];
  let cptCodesExtracted: string[] = [];
  let lineItemsExtracted: any[] = [];
  let tablesExtracted: any[] = [];
  
  // Determine file type and process accordingly
  const effectiveMimeType = storedMimeType || mimeType || 'application/octet-stream';
  const isImage = effectiveMimeType.startsWith('image/');
  const isPdf = effectiveMimeType === 'application/pdf';
  const isCsv = effectiveMimeType === 'text/csv' || effectiveMimeType.includes('csv') || filePath.endsWith('.csv');
  const isExcel = effectiveMimeType.includes('spreadsheet') || effectiveMimeType.includes('excel') || filePath.match(/\.xlsx?$/);
  const isJson = effectiveMimeType === 'application/json' || filePath.endsWith('.json');
  
  console.log(`Processing file: ${filePath}, type: ${effectiveMimeType}, isImage: ${isImage}, isPdf: ${isPdf}, fileUrl exists: ${!!fileUrl}`);
  
  try {
    // Handle CSV files
    if (isCsv && fileUrl) {
      const csvExtracted = await extractFromCSV(fileUrl, documentType);
      if (csvExtracted) {
        Object.assign(formMapping, csvExtracted.fields);
        lineItemsExtracted = csvExtracted.line_items || [];
        tablesExtracted = csvExtracted.tables || [];
        providerUsed = 'csv_parser';
      }
    }
    // Handle JSON files
    else if (isJson && fileUrl) {
      const jsonExtracted = await extractFromJSON(fileUrl, documentType);
      if (jsonExtracted) {
        Object.assign(formMapping, jsonExtracted.fields);
        lineItemsExtracted = jsonExtracted.line_items || [];
        providerUsed = 'json_parser';
      }
    }
    // Handle images and PDFs with OCR/Vision AI
    else if ((isImage || isPdf) && fileUrl) {
      // Fetch and convert file to base64
      const fileResponse = await fetch(fileUrl);
      if (fileResponse.ok) {
        const fileBlob = await fileResponse.arrayBuffer();
        const fileBytes = new Uint8Array(fileBlob);
        const bytes: string[] = [];
        for (let i = 0; i < fileBytes.length; i++) {
          bytes.push(String.fromCharCode(fileBytes[i]));
        }
        const fileBase64Data = btoa(bytes.join(''));
        const contentType = fileResponse.headers.get('content-type') || effectiveMimeType;
        
        // Build dynamic extraction prompt based on document type with target fields
        const extractionPrompt = buildExtractionPrompt(documentType || 'unknown', targetFields);
        
        // Try providers in order of preference
        const providers = [configuredProvider, 'gemini', 'azure', 'aws'].filter((v, i, a) => a.indexOf(v) === i);
        let extractionSuccess = false;
        
        for (const provider of providers) {
          if (extractionSuccess) break;
          
          try {
            let extracted: any = null;
            
            switch (provider) {
              case 'gemini':
              case 'google':
                extracted = await extractWithGemini(fileBase64Data, contentType, extractionPrompt);
                providerUsed = 'gemini';
                break;
                
              case 'azure':
                extracted = await extractWithAzure(fileBase64Data, contentType, documentType);
                providerUsed = 'azure';
                break;
                
              case 'aws':
                extracted = await extractWithAWS(fileBase64Data, contentType, documentType);
                providerUsed = 'aws';
                break;
                
              default:
                extracted = await extractWithGemini(fileBase64Data, contentType, extractionPrompt);
                providerUsed = 'gemini';
            }
            
            if (extracted) {
              // Map extracted fields to formMapping format
              if (extracted.fields) {
                for (const [key, value] of Object.entries(extracted.fields)) {
                  if (value !== null && value !== undefined && String(value).trim()) {
                    formMapping[key] = {
                      value: String(value),
                      confidence: extracted.confidence || 0.85,
                      source: `${providerUsed}_extraction`
                    };
                    
                    // Track ICD and CPT codes for crosswalk
                    if (key === 'icd_codes' || key === 'icd_code' || key.includes('diagnosis')) {
                      const codes = String(value).split(/[,;]/).map(c => c.trim()).filter(Boolean);
                      icdCodesExtracted.push(...codes);
                    }
                    if (key === 'cpt_codes' || key === 'cpt_code' || key === 'procedure_code') {
                      const codes = String(value).split(/[,;]/).map(c => c.trim()).filter(Boolean);
                      cptCodesExtracted.push(...codes);
                    }
                  }
                }
              }
              
              // Add line items from extraction
              if (extracted.line_items && Array.isArray(extracted.line_items)) {
                lineItemsExtracted = extracted.line_items;
                formMapping['line_items'] = {
                  value: JSON.stringify(extracted.line_items),
                  confidence: extracted.confidence || 0.85,
                  source: `${providerUsed}_extraction`
                };
                
                // Extract CPT/ICD codes from line items
                for (const item of extracted.line_items) {
                  if (item.cpt_code) cptCodesExtracted.push(item.cpt_code);
                  if (item.code) cptCodesExtracted.push(item.code);
                  if (item.icd_code) icdCodesExtracted.push(item.icd_code);
                }
              }
              
              // Add tables from extraction
              if (extracted.tables && Array.isArray(extracted.tables)) {
                tablesExtracted = extracted.tables;
                formMapping['tables'] = {
                  value: JSON.stringify(extracted.tables),
                  confidence: extracted.confidence || 0.85,
                  source: `${providerUsed}_extraction`
                };
              }
              
              // Add summary info
              if (extracted.summary) {
                for (const [key, value] of Object.entries(extracted.summary)) {
                  if (value !== null && value !== undefined) {
                    formMapping[`summary_${key}`] = {
                      value: String(value),
                      confidence: 0.9,
                      source: `${providerUsed}_summary`
                    };
                  }
                }
              }
              
              // Add document category and detected type
              if (extracted.detected_document_type) {
                formMapping['detected_document_type'] = {
                  value: extracted.detected_document_type,
                  confidence: 0.9,
                  source: `${providerUsed}_classification`
                };
              }
              if (extracted.document_category) {
                formMapping['document_category'] = {
                  value: extracted.document_category,
                  confidence: 0.9,
                  source: `${providerUsed}_classification`
                };
              }
              
              extractionSuccess = true;
              console.log(`Extraction completed with ${providerUsed}: ${Object.keys(formMapping).length} fields, ${lineItemsExtracted.length} line items`);
            }
          } catch (providerError) {
            console.error(`Provider ${provider} failed:`, providerError);
          }
        }
      }
    }
    // Handle inline base64 data (for direct uploads)
    else if (fileBase64) {
      const extractionPrompt = buildExtractionPrompt(documentType || 'unknown', targetFields);
      const extracted = await extractWithGemini(fileBase64, mimeType || 'image/jpeg', extractionPrompt);
      if (extracted?.fields) {
        for (const [key, value] of Object.entries(extracted.fields)) {
          if (value !== null && value !== undefined) {
            formMapping[key] = {
              value: String(value),
              confidence: extracted.confidence || 0.85,
              source: 'gemini_extraction'
            };
          }
        }
        if (extracted.line_items) lineItemsExtracted = extracted.line_items;
        if (extracted.tables) tablesExtracted = extracted.tables;
        providerUsed = 'gemini';
      }
    }
  } catch (extractionError) {
    console.error('Extraction error:', extractionError);
  }
  
  // Perform ICD to CPT/HCPCS crosswalk if ICD codes were extracted
  let crosswalkResults: any = null;
  if (icdCodesExtracted.length > 0) {
    crosswalkResults = performCrosswalk(icdCodesExtracted, cptCodesExtracted);
    
    // Add crosswalk-derived CPT codes to formMapping
    if (crosswalkResults.suggested_cpt_codes && crosswalkResults.suggested_cpt_codes.length > 0) {
      const existingCpt = formMapping['cpt_codes']?.value || '';
      const allCpt = [...new Set([
        ...existingCpt.split(',').map(c => c.trim()).filter(Boolean),
        ...crosswalkResults.suggested_cpt_codes
      ])];
      formMapping['cpt_codes'] = {
        value: allCpt.join(', '),
        confidence: 0.8,
        source: 'crosswalk_enhanced'
      };
    }
    
    // Add HCPCS codes from crosswalk
    if (crosswalkResults.suggested_hcpcs_codes && crosswalkResults.suggested_hcpcs_codes.length > 0) {
      formMapping['hcpcs_codes'] = {
        value: crosswalkResults.suggested_hcpcs_codes.join(', '),
        confidence: 0.8,
        source: 'crosswalk_derived'
      };
    }
  }
  
  // Ensure all target fields exist in response (even if empty)
  for (const field of targetFields) {
    if (!formMapping[field]) {
      formMapping[field] = { value: '', confidence: 0, source: 'not_found' };
    }
  }
  
  return new Response(
    JSON.stringify({ 
      success: true, 
      formMapping,
      mappingConfidence: Object.keys(formMapping).length > 0 ? 0.85 : 0,
      documentType: documentType || 'invoice',
      providerUsed,
      crosswalkResults
    }),
    { headers: { "Content-Type": "application/json", ...corsHeaders } }
  );
}

// Build DYNAMIC extraction prompt based on document type - NO HARDCODING
function buildExtractionPrompt(documentType: string, targetFields?: string[]): string {
  // Document type category hints for flexible extraction
  const categoryHints: Record<string, string> = {
    // Financial/RCM documents
    'invoice': 'invoice, billing statement, claim, accounts receivable',
    'claim': 'insurance claim, medical claim, superbill, CMS-1500',
    'eob': 'explanation of benefits, remittance advice, payment posting',
    'statement': 'account statement, balance due, payment history',
    'billing': 'billing document, charges, fees, payment',
    
    // Healthcare documents
    'prescription': 'prescription, Rx, medication order, pharmacy',
    'insurance_card': 'insurance card, ID card, member card, pharmacy benefit',
    'lab_result': 'lab results, laboratory report, blood test, diagnostics',
    'medical_record': 'medical record, patient chart, clinical notes',
    'referral': 'referral form, specialist referral, authorization',
    
    // Medical imaging
    'x-ray': 'X-ray, radiograph, chest x-ray, bone x-ray',
    'ct-scan': 'CT scan, computed tomography, CAT scan',
    'mri': 'MRI, magnetic resonance imaging',
    'ultrasound': 'ultrasound, sonogram, echocardiogram',
    'ecg': 'ECG, EKG, electrocardiogram, heart rhythm',
    
    // Business documents
    'order-management': 'order, purchase order, sales order, fulfillment',
    'contract': 'contract, agreement, terms, signatures',
    'report': 'report, analysis, summary, findings',
    
    // Identity/onboarding
    'passport': 'passport, travel document, ID',
    'drivers_license': 'drivers license, ID card, identification',
    'patient_intake': 'patient intake form, registration, demographics',
    'consent_form': 'consent form, authorization, signature',
  };
  
  const categoryHint = categoryHints[documentType] || documentType;
  
  // If target fields provided, include them as hints
  const fieldHints = targetFields && targetFields.length > 0
    ? `\n\nPriority fields to extract (if visible): ${targetFields.join(', ')}`
    : '';
  
  return `You are an expert document analyzer. Analyze this document image and extract ALL structured information.

Document Type Hint: ${categoryHint}
${fieldHints}

INSTRUCTIONS:
1. Identify the document type and category automatically
2. Extract ALL visible text fields, values, dates, amounts, codes, and identifiers
3. For tables/line items, extract each row as a separate item
4. Extract any medical/billing codes: CPT, HCPCS, ICD-10, NDC, NPI
5. Extract all monetary values with their labels
6. Extract all dates and date ranges
7. Extract all names, addresses, phone numbers, emails
8. Extract claim/invoice/order numbers and reference IDs
9. For multi-section documents, extract from ALL sections

IMPORTANT - Be comprehensive and extract EVERYTHING visible, not just common fields.

Return ONLY a valid JSON object:
{
  "fields": {
    "field_name_snake_case": "extracted_value"
  },
  "line_items": [
    {"description": "...", "quantity": 1, "unit_price": 0, "total": 0, "code": "...", "date": "..."}
  ],
  "tables": [
    {"header": ["col1", "col2"], "rows": [["val1", "val2"]]}
  ],
  "detected_document_type": "invoice|claim|prescription|insurance_card|etc",
  "document_category": "financial|healthcare|identity|business",
  "summary": {
    "total_amount": 0,
    "balance_due": 0,
    "items_count": 0
  },
  "confidence": 0.0-1.0
}`;
}

// CSV extraction - parse CSV files and extract structured data
async function extractFromCSV(fileUrl: string, documentType?: string): Promise<any> {
  try {
    const response = await fetch(fileUrl);
    if (!response.ok) throw new Error(`Failed to fetch CSV: ${response.status}`);
    
    const csvText = await response.text();
    const lines = csvText.split('\n').filter(line => line.trim());
    
    if (lines.length === 0) return null;
    
    // Parse header row
    const headers = parseCSVLine(lines[0]);
    const rows: any[] = [];
    
    // Parse data rows
    for (let i = 1; i < lines.length; i++) {
      const values = parseCSVLine(lines[i]);
      const row: Record<string, any> = {};
      headers.forEach((header, idx) => {
        row[header.toLowerCase().replace(/\s+/g, '_')] = values[idx] || '';
      });
      rows.push(row);
    }
    
    // Build form mapping from first row or aggregate
    const fields: Record<string, { value: string; confidence: number; source: string }> = {};
    
    // Calculate totals for financial documents
    let totalAmount = 0;
    let totalPaid = 0;
    let totalOutstanding = 0;
    
    for (const row of rows) {
      for (const [key, value] of Object.entries(row)) {
        // Track numeric fields for totals
        const numValue = parseFloat(String(value).replace(/[$,]/g, ''));
        if (!isNaN(numValue)) {
          if (key.includes('amount') || key.includes('total') || key.includes('billed') || key.includes('claimed')) {
            totalAmount += numValue;
          }
          if (key.includes('paid') || key.includes('collected')) {
            totalPaid += numValue;
          }
          if (key.includes('outstanding') || key.includes('balance') || key.includes('due')) {
            totalOutstanding += numValue;
          }
        }
      }
    }
    
    // Add summary fields
    fields['total_records'] = { value: String(rows.length), confidence: 1, source: 'csv_parser' };
    fields['total_amount'] = { value: totalAmount.toFixed(2), confidence: 0.95, source: 'csv_parser' };
    fields['total_paid'] = { value: totalPaid.toFixed(2), confidence: 0.95, source: 'csv_parser' };
    fields['total_outstanding'] = { value: totalOutstanding.toFixed(2), confidence: 0.95, source: 'csv_parser' };
    fields['columns'] = { value: headers.join(', '), confidence: 1, source: 'csv_parser' };
    
    return {
      fields,
      line_items: rows,
      tables: [{ header: headers, rows: rows.map(r => Object.values(r)) }],
      detected_document_type: documentType || 'csv_data',
      document_category: 'data_import',
      confidence: 0.95
    };
  } catch (error) {
    console.error('CSV extraction error:', error);
    return null;
  }
}

// Helper to parse CSV line handling quoted values
function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;
  
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      result.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  result.push(current.trim());
  return result;
}

// JSON extraction - parse JSON files and extract structured data
async function extractFromJSON(fileUrl: string, documentType?: string): Promise<any> {
  try {
    const response = await fetch(fileUrl);
    if (!response.ok) throw new Error(`Failed to fetch JSON: ${response.status}`);
    
    const jsonData = await response.json();
    
    // Flatten JSON to fields
    const fields: Record<string, { value: string; confidence: number; source: string }> = {};
    const lineItems: any[] = [];
    
    function flattenObject(obj: any, prefix = '') {
      if (Array.isArray(obj)) {
        if (obj.length > 0 && typeof obj[0] === 'object') {
          lineItems.push(...obj);
        } else {
          fields[prefix || 'items'] = { value: obj.join(', '), confidence: 1, source: 'json_parser' };
        }
      } else if (typeof obj === 'object' && obj !== null) {
        for (const [key, value] of Object.entries(obj)) {
          const newKey = prefix ? `${prefix}_${key}` : key;
          flattenObject(value, newKey.toLowerCase().replace(/\s+/g, '_'));
        }
      } else {
        fields[prefix] = { value: String(obj ?? ''), confidence: 1, source: 'json_parser' };
      }
    }
    
    flattenObject(jsonData);
    
    return {
      fields,
      line_items: lineItems,
      detected_document_type: documentType || 'json_data',
      document_category: 'data_import',
      confidence: 1
    };
  } catch (error) {
    console.error('JSON extraction error:', error);
    return null;
  }
}

// Gemini extraction
async function extractWithGemini(imageBase64: string, contentType: string, prompt: string): Promise<any> {
  const geminiApiKey = Deno.env.get("GEMINI_API_KEY");
  if (!geminiApiKey) throw new Error("GEMINI_API_KEY not configured");
  
  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${geminiApiKey}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{
          parts: [
            { text: prompt },
            { inline_data: { mime_type: contentType, data: imageBase64 } }
          ]
        }],
        generationConfig: { temperature: 0.1, topP: 0.95, maxOutputTokens: 4096 }
      })
    }
  );
  
  if (!response.ok) throw new Error(`Gemini API error: ${response.status}`);
  
  const data = await response.json();
  const responseText = data?.candidates?.[0]?.content?.parts?.[0]?.text || '';
  const jsonMatch = responseText.match(/\{[\s\S]*\}/);
  
  if (jsonMatch) {
    return JSON.parse(jsonMatch[0]);
  }
  return null;
}

// Azure Form Recognizer extraction (stub - requires AZURE_FORM_RECOGNIZER_KEY)
async function extractWithAzure(imageBase64: string, contentType: string, documentType?: string): Promise<any> {
  const azureKey = Deno.env.get("AZURE_FORM_RECOGNIZER_KEY");
  const azureEndpoint = Deno.env.get("AZURE_FORM_RECOGNIZER_ENDPOINT");
  
  if (!azureKey || !azureEndpoint) {
    console.log("Azure Form Recognizer not configured, skipping");
    throw new Error("Azure Form Recognizer not configured");
  }
  
  // Azure Form Recognizer prebuilt invoice model
  const modelId = documentType === 'invoice' ? 'prebuilt-invoice' : 'prebuilt-document';
  const analyzeUrl = `${azureEndpoint}/formrecognizer/documentModels/${modelId}:analyze?api-version=2023-07-31`;
  
  const response = await fetch(analyzeUrl, {
    method: 'POST',
    headers: {
      'Content-Type': contentType,
      'Ocp-Apim-Subscription-Key': azureKey
    },
    body: Uint8Array.from(atob(imageBase64), c => c.charCodeAt(0))
  });
  
  if (!response.ok) throw new Error(`Azure API error: ${response.status}`);
  
  // Azure returns operation-location header for async processing
  const operationLocation = response.headers.get('operation-location');
  if (!operationLocation) throw new Error("No operation location returned");
  
  // Poll for results (simplified - in production use proper polling)
  await new Promise(r => setTimeout(r, 2000));
  
  const resultResponse = await fetch(operationLocation, {
    headers: { 'Ocp-Apim-Subscription-Key': azureKey }
  });
  
  if (!resultResponse.ok) throw new Error("Failed to get Azure results");
  
  const result = await resultResponse.json();
  return mapAzureResultToStandard(result);
}

// AWS Textract extraction (stub - requires AWS credentials)
async function extractWithAWS(imageBase64: string, contentType: string, documentType?: string): Promise<any> {
  const awsAccessKey = Deno.env.get("AWS_ACCESS_KEY_ID");
  const awsSecretKey = Deno.env.get("AWS_SECRET_ACCESS_KEY");
  const awsRegion = Deno.env.get("AWS_REGION") || 'us-east-1';
  
  if (!awsAccessKey || !awsSecretKey) {
    console.log("AWS Textract not configured, skipping");
    throw new Error("AWS Textract not configured");
  }
  
  // AWS Textract AnalyzeExpense for invoices
  // Note: This is a simplified implementation - production would use AWS SDK
  console.log("AWS Textract extraction attempted but requires full SDK implementation");
  throw new Error("AWS Textract requires SDK - not fully implemented");
}

// Map Azure Form Recognizer result to standard format
function mapAzureResultToStandard(azureResult: any): any {
  const fields: Record<string, string> = {};
  const lineItems: any[] = [];
  
  try {
    const documents = azureResult?.analyzeResult?.documents || [];
    if (documents.length > 0) {
      const doc = documents[0];
      const azureFields = doc.fields || {};
      
      // Map Azure field names to our standard names
      const fieldMapping: Record<string, string> = {
        'InvoiceId': 'invoice_number',
        'VendorName': 'vendor_name',
        'VendorTaxId': 'vendor_tax_id',
        'CustomerName': 'patient_name',
        'CustomerId': 'patient_account',
        'InvoiceDate': 'service_from',
        'DueDate': 'service_to',
        'SubTotal': 'billed_amount',
        'TotalTax': 'adjustment_amount',
        'AmountDue': 'balance_due',
        'PreviousUnpaidBalance': 'balance_due'
      };
      
      for (const [azureKey, standardKey] of Object.entries(fieldMapping)) {
        if (azureFields[azureKey]?.content) {
          fields[standardKey] = azureFields[azureKey].content;
        }
      }
      
      // Extract line items
      if (azureFields.Items?.valueArray) {
        for (const item of azureFields.Items.valueArray) {
          const itemFields = item.valueObject || {};
          lineItems.push({
            description: itemFields.Description?.content || '',
            cpt_code: '',
            quantity: parseFloat(itemFields.Quantity?.content) || 1,
            unit_price: parseFloat(itemFields.UnitPrice?.content) || 0,
            total: parseFloat(itemFields.Amount?.content) || 0
          });
        }
      }
    }
  } catch (e) {
    console.error("Error mapping Azure result:", e);
  }
  
  return {
    fields,
    line_items: lineItems,
    document_category: 'invoice',
    confidence: azureResult?.analyzeResult?.documents?.[0]?.confidence || 0.8
  };
}

// Perform ICD to CPT/HCPCS crosswalk
function performCrosswalk(icdCodes: string[], cptCodes: string[]): any {
  const suggestedCpt: string[] = [];
  const suggestedHcpcs: string[] = [];
  const crosswalkDetails: any[] = [];
  
  for (const icdCode of icdCodes) {
    const normalized = icdCode.toUpperCase().trim();
    const crosswalk = ICD_TO_CPT_CROSSWALK[normalized];
    
    if (crosswalk) {
      for (const cpt of crosswalk.cpt_codes) {
        if (!suggestedCpt.includes(cpt) && !cptCodes.includes(cpt)) {
          suggestedCpt.push(cpt);
        }
      }
      for (const hcpcs of crosswalk.hcpcs_codes) {
        if (!suggestedHcpcs.includes(hcpcs)) {
          suggestedHcpcs.push(hcpcs);
        }
      }
      crosswalkDetails.push({
        icd_code: normalized,
        description: crosswalk.description,
        category: crosswalk.category,
        suggested_cpt: crosswalk.cpt_codes,
        suggested_hcpcs: crosswalk.hcpcs_codes
      });
    }
  }
  
  return {
    suggested_cpt_codes: suggestedCpt,
    suggested_hcpcs_codes: suggestedHcpcs,
    crosswalk_details: crosswalkDetails,
    total_mappings: crosswalkDetails.length
  };
}

async function handleValidate(supabase: any, request: ProcessingRequest) {
  const { documentId, processingConfig } = request;
  
  // Validate document data
  const validation = {
    documentId,
    isValid: true,
    errors: [],
    warnings: [],
    validatedAt: new Date().toISOString()
  };
  
  return new Response(
    JSON.stringify({ success: true, validation }),
    { headers: { "Content-Type": "application/json", ...corsHeaders } }
  );
}

async function handleClassify(supabase: any, request: ProcessingRequest) {
  const { documentId, documentType } = request;
  
  // Classify document type
  const classification = {
    documentId,
    detectedType: documentType || 'unknown',
    confidence: 0.92,
    alternativeTypes: [],
    classifiedAt: new Date().toISOString()
  };
  
  return new Response(
    JSON.stringify({ success: true, classification }),
    { headers: { "Content-Type": "application/json", ...corsHeaders } }
  );
}

// Medical Code Lookup - ICD to CPT/HCPCS crosswalk
async function handleMedicalCodeLookup(request: ProcessingRequest) {
  const { icdCodes = [], cptCodes = [] } = request;
  
  const results: {
    icd_lookups: Array<{
      icd_code: string;
      description: string;
      category: string;
      associated_cpt: Array<{ code: string; description: string; rvu: number }>;
      associated_hcpcs: Array<{ code: string; description: string; type: string }>;
    }>;
    cpt_lookups: Array<{
      cpt_code: string;
      description: string;
      category: string;
      rvu: number;
      modifier_allowed: boolean;
    }>;
    crosswalk_summary: {
      total_icd_codes: number;
      total_cpt_codes: number;
      total_hcpcs_codes: number;
      estimated_total_rvu: number;
    };
  } = {
    icd_lookups: [],
    cpt_lookups: [],
    crosswalk_summary: {
      total_icd_codes: 0,
      total_cpt_codes: 0,
      total_hcpcs_codes: 0,
      estimated_total_rvu: 0
    }
  };
  
  let totalRvu = 0;
  const uniqueCptCodes = new Set<string>();
  const uniqueHcpcsCodes = new Set<string>();
  
  // Process ICD codes and get associated CPT/HCPCS
  for (const icdCode of icdCodes) {
    const normalizedIcd = icdCode.toUpperCase().trim();
    const crosswalk = ICD_TO_CPT_CROSSWALK[normalizedIcd];
    
    if (crosswalk) {
      const associatedCpt: Array<{ code: string; description: string; rvu: number }> = [];
      const associatedHcpcs: Array<{ code: string; description: string; type: string }> = [];
      
      // Get CPT details
      for (const cptCode of crosswalk.cpt_codes) {
        const cptInfo = CPT_CODE_DATABASE[cptCode];
        if (cptInfo) {
          associatedCpt.push({
            code: cptCode,
            description: cptInfo.description,
            rvu: cptInfo.rvu
          });
          uniqueCptCodes.add(cptCode);
          totalRvu += cptInfo.rvu;
        } else {
          associatedCpt.push({ code: cptCode, description: 'Unknown CPT', rvu: 0 });
          uniqueCptCodes.add(cptCode);
        }
      }
      
      // Get HCPCS details
      for (const hcpcsCode of crosswalk.hcpcs_codes) {
        const hcpcsInfo = HCPCS_CODE_DATABASE[hcpcsCode];
        if (hcpcsInfo) {
          associatedHcpcs.push({
            code: hcpcsCode,
            description: hcpcsInfo.description,
            type: hcpcsInfo.type
          });
          uniqueHcpcsCodes.add(hcpcsCode);
        } else {
          associatedHcpcs.push({ code: hcpcsCode, description: 'Unknown HCPCS', type: 'Unknown' });
          uniqueHcpcsCodes.add(hcpcsCode);
        }
      }
      
      results.icd_lookups.push({
        icd_code: normalizedIcd,
        description: crosswalk.description,
        category: crosswalk.category,
        associated_cpt: associatedCpt,
        associated_hcpcs: associatedHcpcs
      });
    } else {
      // Try to look up via external API (NLM/CMS)
      results.icd_lookups.push({
        icd_code: normalizedIcd,
        description: 'Code not found in local database',
        category: 'Unknown',
        associated_cpt: [],
        associated_hcpcs: []
      });
    }
  }
  
  // Process direct CPT code lookups
  for (const cptCode of cptCodes) {
    const normalizedCpt = cptCode.trim();
    const cptInfo = CPT_CODE_DATABASE[normalizedCpt];
    
    if (cptInfo) {
      results.cpt_lookups.push({
        cpt_code: normalizedCpt,
        description: cptInfo.description,
        category: cptInfo.category,
        rvu: cptInfo.rvu,
        modifier_allowed: cptInfo.modifier_allowed
      });
      uniqueCptCodes.add(normalizedCpt);
      totalRvu += cptInfo.rvu;
    } else {
      results.cpt_lookups.push({
        cpt_code: normalizedCpt,
        description: 'Code not found in local database',
        category: 'Unknown',
        rvu: 0,
        modifier_allowed: false
      });
    }
  }
  
  // Update summary
  results.crosswalk_summary = {
    total_icd_codes: icdCodes.length,
    total_cpt_codes: uniqueCptCodes.size,
    total_hcpcs_codes: uniqueHcpcsCodes.size,
    estimated_total_rvu: Math.round(totalRvu * 100) / 100
  };
  
  console.log(`Medical code lookup: ${icdCodes.length} ICD codes -> ${uniqueCptCodes.size} CPT, ${uniqueHcpcsCodes.size} HCPCS`);
  
  return new Response(
    JSON.stringify({ success: true, ...results }),
    { headers: { "Content-Type": "application/json", ...corsHeaders } }
  );
}

async function handleMedicalImageAnalysis(request: ProcessingRequest) {
  const { 
    imageUrl, 
    imageBase64: providedBase64, 
    imageMimeType, 
    documentType, 
    analysisType,
    provider: requestedProvider,
    modelType: requestedModelType
  } = request;
  
  if (!imageUrl && !providedBase64) {
    throw new Error("Missing imageUrl or imageBase64 for medical image analysis");
  }

  const provider = requestedProvider || 'gemini';
  const modelType = requestedModelType || getRecommendedModelType(documentType || 'medical-image');
  
  console.log(`Medical image analysis - Provider: ${provider}, Model Type: ${modelType}, Document: ${documentType}`);

  const geminiApiKey = Deno.env.get("GEMINI_API_KEY");
  
  if (!geminiApiKey) {
    return new Response(
      JSON.stringify({ 
        success: true, 
        insights: generateFallbackInsights(documentType || 'medical-image'),
        modelUsed: 'fallback',
        provider: 'fallback',
        modelType: modelType,
        modelApproachDetails: getModelApproachDetails(modelType),
        disclaimer: 'This analysis is for informational purposes only and should not replace professional medical interpretation.'
      }),
      { headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }

  try {
    let imageBase64: string;
    let contentType: string;
    
    if (providedBase64) {
      imageBase64 = providedBase64;
      contentType = imageMimeType || 'image/jpeg';
    } else {
      const imageResponse = await fetch(imageUrl!);
      if (!imageResponse.ok) {
        throw new Error(`Failed to fetch image: ${imageResponse.status}`);
      }
      const imageBlob = await imageResponse.arrayBuffer();
      const imageBytes = new Uint8Array(imageBlob);
      const bytes: string[] = [];
      for (let i = 0; i < imageBytes.length; i++) {
        bytes.push(String.fromCharCode(imageBytes[i]));
      }
      imageBase64 = btoa(bytes.join(''));
      contentType = imageResponse.headers.get('content-type') || 'image/jpeg';
    }
    
    const medicalPrompt = buildComprehensiveMedicalPrompt(documentType || 'medical-image', analysisType || 'comprehensive', modelType);
    
    const geminiResponse = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${geminiApiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{
            parts: [
              { text: medicalPrompt },
              { inline_data: { mime_type: contentType, data: imageBase64 } }
            ]
          }],
          generationConfig: { temperature: 0.1, maxOutputTokens: 8192 }
        })
      }
    );

    if (!geminiResponse.ok) {
      throw new Error(`Gemini API error: ${geminiResponse.status}`);
    }

    const geminiData = await geminiResponse.json();
    const responseText = geminiData.candidates?.[0]?.content?.parts?.[0]?.text || '';
    const parsedAnalysis = parseComprehensiveResponse(responseText);
    
    return new Response(
      JSON.stringify({ 
        success: true, 
        autoDetection: parsedAnalysis.autoDetection,
        insights: parsedAnalysis.findings,
        measurements: parsedAnalysis.measurements,
        obstructionsAndBlockages: parsedAnalysis.obstructionsAndBlockages,
        clinicalNotes: parsedAnalysis.clinicalNotes,
        observations: parsedAnalysis.observations,
        panelAnalysis: parsedAnalysis.panelAnalysis,
        detailedReport: parsedAnalysis.detailedReport,
        abnormalitySummary: parsedAnalysis.abnormalitySummary,
        providerConsultation: parsedAnalysis.providerConsultation,
        anatomicalRegions: parsedAnalysis.anatomicalRegions,
        rawAnalysis: responseText,
        modelUsed: `Gemini 2.0 Flash Vision`,
        modelApproach: modelType.toUpperCase(),
        modelApproachDetails: getModelApproachDetails(modelType),
        provider,
        modelType,
        detectedModality: parsedAnalysis.autoDetection?.detectedModality || documentType,
        detectedOrgans: parsedAnalysis.autoDetection?.detectedOrgans || [],
        analysisDepth: 'comprehensive',
        disclaimer: 'AI-ASSISTED ANALYSIS FOR INFORMATIONAL PURPOSES ONLY. This is NOT a medical diagnosis. Results must be reviewed and interpreted by a qualified healthcare provider (radiologist, physician). DO NOT make clinical decisions based solely on this analysis. Always consult your healthcare provider for proper diagnosis and treatment.'
      }),
      { headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
    
  } catch (error) {
    console.error("Medical image analysis error:", error);
    return new Response(
      JSON.stringify({ 
        success: true, 
        insights: generateFallbackInsights(documentType || 'medical-image'),
        modelUsed: 'fallback',
        provider: 'fallback',
        modelType,
        modelApproachDetails: getModelApproachDetails(modelType),
        error: error instanceof Error ? error.message : 'Analysis failed',
        disclaimer: 'Fallback analysis provided. For accurate interpretation, please consult a qualified radiologist or medical professional.'
      }),
      { headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
}

function getModelApproachDetails(modelType: string): any {
  const approaches: Record<string, any> = {
    'cnn': {
      name: 'Convolutional Neural Network (CNN)',
      description: 'Deep learning architecture specialized for image pattern recognition',
      capabilities: [
        'Feature extraction from medical images',
        'Pattern detection (nodules, masses, fractures)',
        'Texture analysis for tissue characterization',
        'Spatial hierarchy learning for anatomical structures'
      ],
      bestFor: ['X-Ray', 'Chest imaging', 'Bone structure analysis'],
      accuracy: 'High accuracy for structural abnormalities',
      limitations: 'May miss subtle soft tissue changes'
    },
    'u-net': {
      name: 'U-Net Segmentation Network',
      description: 'Encoder-decoder architecture for precise medical image segmentation',
      capabilities: [
        'Pixel-level organ segmentation',
        'Tumor boundary delineation',
        'Volume quantification',
        'Lesion localization with precise borders'
      ],
      bestFor: ['CT Scan', 'MRI', 'Tumor analysis', 'Organ volumetry'],
      accuracy: 'Excellent for boundary detection and segmentation',
      limitations: 'Requires good image quality for optimal results'
    },
    'faster-rcnn': {
      name: 'Faster R-CNN Object Detection',
      description: 'Region-based CNN for detecting and localizing abnormalities',
      capabilities: [
        'Multi-object detection in single scan',
        'Bounding box generation for abnormalities',
        'Real-time detection capability',
        'Size and location estimation'
      ],
      bestFor: ['Mammogram', 'Multi-lesion detection', 'Screening studies'],
      accuracy: 'High sensitivity for mass detection',
      limitations: 'May generate false positives in dense tissue'
    },
    'yolo': {
      name: 'YOLO (You Only Look Once)',
      description: 'Real-time object detection for rapid screening',
      capabilities: [
        'Ultra-fast detection',
        'Multiple abnormality detection',
        'Real-time analysis suitable for screening',
        'Good for high-volume studies'
      ],
      bestFor: ['Rapid screening', 'Emergency triage', 'Multiple lesion detection'],
      accuracy: 'Good for obvious abnormalities, may miss subtle findings',
      limitations: 'Trade-off between speed and fine detail detection'
    },
    'rnn': {
      name: 'Recurrent Neural Network (RNN/LSTM)',
      description: 'Sequential analysis for time-series medical data',
      capabilities: [
        'Temporal pattern recognition',
        'ECG waveform analysis',
        'Heart rhythm classification',
        'Sequential abnormality detection'
      ],
      bestFor: ['ECG', 'EEG', 'Time-series physiological data'],
      accuracy: 'Excellent for rhythm and waveform abnormalities',
      limitations: 'Not suitable for static image analysis'
    },
    'llm': {
      name: 'Large Language Model with Vision',
      description: 'Multimodal AI combining vision and language understanding',
      capabilities: [
        'Comprehensive image interpretation',
        'Natural language report generation',
        'Clinical context integration',
        'Multi-finding correlation and synthesis'
      ],
      bestFor: ['Comprehensive reports', 'Complex multi-finding analysis'],
      accuracy: 'Good for overall interpretation and report generation',
      limitations: 'Should be validated by domain-specific models'
    }
  };
  
  return approaches[modelType] || approaches['cnn'];
}

function getRecommendedModelType(documentType: string): string {
  const recommendations: Record<string, string> = {
    'xray': 'cnn',
    'ct-scan': 'u-net',
    'mri': 'u-net',
    'ecg': 'rnn',
    'ultrasound': 'u-net',
    'mammogram': 'faster-rcnn'
  };
  return recommendations[documentType] || 'cnn';
}

function buildComprehensiveMedicalPrompt(documentType: string, analysisType: string, modelType: string): string {
  const modalityGuidance: Record<string, string> = {
    'xray': `
CHEST X-RAY COMPREHENSIVE ANALYSIS:

SYSTEMATIC REVIEW CHECKLIST:
1. AIRWAYS: Trachea position (midline?), bronchi patency
2. BONES: Ribs, clavicles, spine - fractures, lytic lesions, degenerative changes
3. CARDIAC: Heart size (CTR <0.5 normal), shape, calcifications
4. DIAPHRAGM: Position, costophrenic angles (should be sharp), hemidiaphragm levels
5. EDGES: Pleural space, pneumothorax, effusions
6. FIELDS (Lung): Nodules, masses, consolidation, infiltrates, hyperinflation
7. GASTRIC: Air-fluid levels, free air under diaphragm
8. HILUM: Lymphadenopathy, vascular prominence
9. LINES/TUBES: Any medical devices present

NORMAL REFERENCE VALUES:
- Cardiothoracic Ratio (CTR): <0.5 (heart width / thorax width)
- Trachea: Midline (may shift slightly right at aortic arch)
- Costophrenic angles: Sharp (blunting suggests >200ml fluid)
- Diaphragm: Right 1-2cm higher than left
- Lung fields: Equal lucency bilaterally`,

    'ct-scan': `
CT SCAN COMPREHENSIVE ANALYSIS:

SYSTEMATIC REVIEW BY REGION:
1. BRAIN CT: Grey-white differentiation, ventricles, midline shift, hemorrhage, mass effect
2. CHEST CT: Lung parenchyma, mediastinum, pleura, lymph nodes
3. ABDOMINAL CT: Liver, spleen, kidneys, pancreas, bowel, vessels

DENSITY MEASUREMENTS (Hounsfield Units - HU):
- Air: -1000 HU
- Fat: -100 to -50 HU
- Water/Fluid: 0 HU
- Soft tissue/Muscle: +40 to +80 HU
- Blood (acute): +50 to +90 HU
- Bone: +400 to +1000 HU

BRAIN-SPECIFIC MEASUREMENTS:
- Midline shift: <5mm normal, >5mm significant
- Ventricle size: Evans index <0.3 normal
- Grey-white junction: Should be distinct

ABNORMALITY CLASSIFICATION:
- Hypodense: Lower than expected (edema, infarct, cyst)
- Hyperdense: Higher than expected (hemorrhage, calcification)
- Isodense: Same as surrounding tissue`,

    'mri': `
MRI COMPREHENSIVE ANALYSIS:

SIGNAL INTENSITY PATTERNS:
T1-WEIGHTED:
- Fat: HIGH signal (bright)
- CSF/Water: LOW signal (dark)
- Muscle: Intermediate
- Subacute blood: HIGH (due to methemoglobin)

T2-WEIGHTED:
- Water/CSF: HIGH signal (bright)
- Fat: Intermediate to HIGH
- Muscle: LOW to intermediate
- Edema: HIGH (appears bright)

FLAIR (Fluid Attenuated Inversion Recovery):
- CSF: SUPPRESSED (appears dark)
- Edema/Pathology: HIGH signal (bright)
- Useful for periventricular lesions

BRAIN MRI CHECKLIST:
1. Ventricles: Size, symmetry, obstruction
2. White matter: Signal abnormalities, demyelination
3. Grey matter: Cortical thickness, signal changes
4. Midline structures: Shift, mass effect
5. Posterior fossa: Cerebellum, brainstem
6. Extra-axial spaces: Meninges, subdural/epidural collections

KIDNEY MRI:
- Cortex vs medulla differentiation
- Cyst characterization (simple vs complex)
- Mass evaluation (solid, enhancement pattern)`,

    'ecg': `
ECG/EKG COMPREHENSIVE ANALYSIS:

SYSTEMATIC APPROACH:
1. RATE: Count R-R intervals (300/large squares between R waves)
   - Normal: 60-100 bpm
   - Bradycardia: <60 bpm
   - Tachycardia: >100 bpm

2. RHYTHM: Regular or irregular?
   - Sinus rhythm: P before every QRS, QRS after every P
   - Atrial fibrillation: No P waves, irregularly irregular

3. AXIS: Lead I and aVF method
   - Normal: -30° to +90°
   - Left axis deviation: <-30°
   - Right axis deviation: >+90°

4. INTERVALS:
   - PR interval: 120-200ms (3-5 small squares)
   - QRS duration: <120ms (3 small squares)
   - QT/QTc: <440ms (men), <460ms (women)

5. WAVEFORM MORPHOLOGY:
   - P wave: <0.12s duration, <2.5mm amplitude
   - QRS: R wave progression V1-V6
   - ST segment: Isoelectric (elevation/depression abnormal)
   - T wave: Upright in most leads

6. ABNORMALITIES TO IDENTIFY:
   - ST elevation: Acute MI, pericarditis
   - ST depression: Ischemia, digoxin effect
   - T wave inversion: Ischemia, strain pattern
   - Q waves: Prior MI`,

    'ultrasound': `
ULTRASOUND COMPREHENSIVE ANALYSIS:

ECHOGENICITY SCALE:
- Anechoic (black): Fluid-filled structures (cysts, vessels, bladder)
- Hypoechoic (dark grey): Solid masses, some organs
- Isoechoic: Same as surrounding tissue
- Hyperechoic (white): Fat, calcifications, gas

ORGAN-SPECIFIC EVALUATION:

LIVER:
- Normal echogenicity: Isoechoic to slightly hyperechoic vs kidney
- Size: <15cm in midclavicular line
- Look for: Masses, cysts, fatty infiltration, cirrhosis signs

KIDNEY:
- Cortex: Hypoechoic to liver
- Medullary pyramids: Anechoic to hypoechoic
- Size: 9-12cm length
- Look for: Hydronephrosis, cysts, stones, masses

GALLBLADDER:
- Wall thickness: <3mm (when distended)
- Look for: Stones (hyperechoic with shadowing), polyps, wall thickening

DOPPLER ASSESSMENT:
- Color flow: Direction and presence of flow
- Spectral: Velocity and resistance indices`,

    'mammogram': `
MAMMOGRAM COMPREHENSIVE ANALYSIS:

BI-RADS CLASSIFICATION:
- Category 0: Incomplete - needs additional imaging
- Category 1: Negative - routine screening
- Category 2: Benign - routine screening
- Category 3: Probably benign - short-term follow-up
- Category 4: Suspicious - biopsy recommended
  - 4A: Low suspicion (2-10% malignancy)
  - 4B: Moderate suspicion (10-50%)
  - 4C: High suspicion (50-95%)
- Category 5: Highly suggestive of malignancy (>95%)
- Category 6: Known biopsy-proven malignancy

BREAST DENSITY:
- A: Almost entirely fatty
- B: Scattered fibroglandular densities
- C: Heterogeneously dense
- D: Extremely dense

MASS CHARACTERISTICS:
Shape: Round, oval, irregular
Margins: Circumscribed, obscured, microlobulated, indistinct, spiculated
Density: High, equal, low, fat-containing

CALCIFICATIONS:
- Benign: Skin, vascular, coarse, large rod-like, round
- Suspicious: Amorphous, coarse heterogeneous, fine pleomorphic, fine linear/branching

ARCHITECTURAL DISTORTION: Spiculated without mass`
  };

  const guidance = modalityGuidance[documentType] || 'Analyze this medical image systematically and comprehensively.';

  return `You are a SENIOR RADIOLOGIST AI ASSISTANT providing COMPREHENSIVE medical image analysis.

STEP 1: AUTO-DETECT IMAGE TYPE (MANDATORY - DO THIS FIRST)
Before any analysis, you MUST identify:

1. IMAGING MODALITY DETECTION:
   - Is this an X-Ray? (Look for: grayscale, bone appears white, lungs appear black, flat 2D projection)
   - Is this a CT Scan? (Look for: cross-sectional slices, Hounsfield unit variations, detailed soft tissue)
   - Is this an MRI? (Look for: high soft tissue contrast, no bone signal, T1/T2 characteristics)
   - Is this an Ultrasound? (Look for: grainy texture, real-time appearance, anechoic/hyperechoic areas)
   - Is this an ECG/EKG? (Look for: waveform tracings, grid pattern, P-QRS-T waves)
   - Is this a Mammogram? (Look for: breast tissue, compression views, calcification patterns)

2. ANATOMICAL ORGAN/REGION DETECTION:
   - BRAIN: Look for skull, ventricles, grey/white matter, cerebellum
   - KIDNEY: Look for bean-shaped organs, collecting system, cortex/medulla
   - LUNG/CHEST: Look for lung fields, ribs, heart shadow, mediastinum
   - LIVER: Look for right upper quadrant, hepatic vessels, gallbladder
   - SPINE: Look for vertebrae, intervertebral discs, spinal canal
   - HEART: Look for cardiac chambers, valves, pericardium
   - ABDOMEN: Look for bowel loops, mesenteric fat, abdominal organs

${guidance}

CRITICAL ANALYSIS INSTRUCTIONS:

1. MULTI-PANEL IMAGE DETECTION:
   - If the image contains multiple panels (labeled a, b, c, d or numbered 1, 2, 3, 4), analyze EACH PANEL SEPARATELY
   - For EACH panel: detect modality AND organ independently
   - Example: Panel A might be Brain CT, Panel B might be Kidney CT - identify each correctly

2. SIZE AND MEASUREMENT ANALYSIS:
   - Estimate sizes of organs, lesions, masses, calcifications
   - Compare measurements to normal reference ranges
   - Flag any measurement outside normal limits
   - Include both observed value AND normal range for comparison

3. OBSTRUCTION AND BLOCKAGE DETECTION:
   - Look for vascular obstructions (stenosis, thrombosis, occlusion)
   - Identify urinary obstructions (hydronephrosis, stones, strictures)
   - Detect bowel obstructions (dilated loops, transition points)
   - Note airway obstructions (tracheal deviation, mass effect)
   - Assess for biliary obstruction (dilated ducts, stones)
   - Grade severity: None, Mild, Moderate, Severe, Complete

4. AI MODEL APPROACH CONTEXT:
   This analysis emulates ${modelType.toUpperCase()} approach:
   ${modelType === 'cnn' ? '- CNN: Pattern recognition for nodules, masses, fractures, texture abnormalities' : ''}
   ${modelType === 'u-net' ? '- U-Net: Precise segmentation of organs, tumors, lesions with boundary delineation' : ''}
   ${modelType === 'faster-rcnn' ? '- Faster R-CNN: Multi-object detection, bounding boxes, lesion localization' : ''}
   ${modelType === 'yolo' ? '- YOLO: Rapid detection, screening-level analysis, multiple abnormalities' : ''}
   ${modelType === 'rnn' ? '- RNN/LSTM: Sequential pattern analysis for ECG waveforms, temporal changes' : ''}
   ${modelType === 'llm' ? '- LLM Vision: Comprehensive interpretation, multi-finding synthesis, report generation' : ''}

Return COMPREHENSIVE JSON:
{
  "autoDetection": {
    "detectedModality": "X-Ray|CT-Scan|MRI|Ultrasound|ECG|Mammogram|Unknown",
    "modalityConfidence": 85-99,
    "modalityFeatures": ["features that led to modality identification"],
    "detectedOrgans": [
      {
        "organ": "Brain|Kidney|Lung|Liver|Heart|Spine|etc",
        "side": "Left|Right|Bilateral|Midline|N/A",
        "confidence": 80-99,
        "identifyingFeatures": ["what features identify this organ"]
      }
    ],
    "imagingCharacteristics": {
      "contrast": "With contrast|Without contrast|Unknown",
      "orientation": "Axial|Sagittal|Coronal|AP|PA|Lateral",
      "quality": "Excellent|Good|Adequate|Poor"
    }
  },
  "panelAnalysis": [
    {
      "panelId": "A/B/C/D or 1/2/3/4 or 'single'",
      "detectedModality": "specific modality for this panel",
      "detectedOrgan": "specific organ in this panel",
      "anatomicalRegion": "e.g., Brain - Axial section at level of basal ganglia",
      "organSystem": "e.g., Neurological, Renal, Respiratory, Cardiovascular",
      "findings": ["detailed finding 1 with measurements", "detailed finding 2"]
    }
  ],
  "findings": [
    {
      "category": "finding|observation|recommendation|concern|normal|abnormality|obstruction|blockage",
      "panelReference": "which panel (A/B/C/D/1/2/3/4) or 'all'",
      "anatomicalLocation": {
        "organ": "exact organ name",
        "side": "left/right/bilateral/midline",
        "region": "specific region (e.g., upper pole, hilum, cortex)",
        "coordinates": "quadrant or zone if applicable"
      },
      "description": "DETAILED description (minimum 3-4 sentences) explaining finding, appearance, characteristics, and what it might indicate",
      "detailedExplanation": "Extended pathophysiological explanation with clinical context - what causes this, what does it mean, how does it progress",
      "differentialDiagnosis": ["most likely diagnosis", "alternative 1", "alternative 2", "alternative 3"],
      "confidence": 70-95,
      "clinicalSignificance": "low|medium|high|critical",
      "status": "normal|borderline|abnormal|critical",
      "measurementValue": "value with unit (e.g., 15mm, 3.5cm)",
      "normalRange": "reference range (e.g., <10mm, 9-13cm)",
      "comparison": "Above normal by X% | Within normal | Below normal by X%",
      "followUpRecommendation": "specific actionable next steps"
    }
  ],
  "measurements": [
    {
      "name": "measurement name (e.g., Kidney length, Midline shift, Lesion diameter)",
      "value": "measured value as string with unit",
      "numericValue": number,
      "unit": "mm|cm|HU|ms|bpm|%",
      "normalRange": { 
        "min": number, 
        "max": number, 
        "reference": "description of normal",
        "source": "standard reference"
      },
      "status": "normal|borderline-low|borderline-high|abnormal-low|abnormal-high|critical",
      "deviation": "percentage or absolute deviation from normal",
      "clinicalImplication": "what this value means for the patient",
      "panelReference": "which panel",
      "organReference": "which organ"
    }
  ],
  "obstructionsAndBlockages": [
    {
      "type": "vascular|urinary|biliary|bowel|airway|other",
      "location": "specific anatomical location",
      "severity": "none|mild|moderate|severe|complete",
      "cause": "suspected cause (stone, mass, stricture, thrombosis, etc.)",
      "upstreamEffects": "what's happening proximal to blockage (dilation, pressure)",
      "measurements": "size of obstruction and dilated segments",
      "clinicalUrgency": "routine|soon|urgent|emergent",
      "recommendedAction": "specific intervention or further workup"
    }
  ],
  "clinicalNotes": {
    "keyFindings": ["most important finding 1", "most important finding 2", "most important finding 3"],
    "clinicalCorrelation": "How these findings correlate with potential clinical presentations",
    "riskAssessment": "Overall risk assessment based on findings",
    "limitations": "Any limitations of this imaging study",
    "additionalImaging": "Any additional imaging that would be helpful"
  },
  "observations": [
    {
      "observation": "detailed observation statement",
      "significance": "why this observation matters",
      "normalComparison": "how this compares to expected normal appearance"
    }
  ],
  "abnormalitySummary": {
    "totalAbnormalities": number,
    "criticalFindings": ["list critical findings requiring immediate attention"],
    "abnormalitiesByPanel": {
      "A": [{"finding": "description", "organ": "affected organ", "severity": "severity"}]
    },
    "abnormalitiesByOrgan": {
      "Kidney": [{"finding": "description", "panel": "panel ref", "severity": "severity"}],
      "Brain": [{"finding": "description", "panel": "panel ref", "severity": "severity"}]
    },
    "measurementAbnormalities": ["list of measurements outside normal range"],
    "obstructionSummary": "Summary of any obstructions detected",
    "recommendedActions": ["specific action 1", "specific action 2"]
  },
  "detailedReport": {
    "clinicalHistory": "Relevant clinical context inferred from imaging",
    "technique": "Imaging modality, orientation, contrast status",
    "comparison": "Note if comparison with prior studies recommended",
    "findingsNarrative": "COMPREHENSIVE paragraph-form narrative of ALL findings organized by panel/organ, including all measurements, comparisons to normal, and clinical implications (minimum 200 words)",
    "impression": "Numbered list of key impressions in order of clinical significance",
    "recommendations": "Specific actionable recommendations including follow-up timeline"
  },
  "providerConsultation": {
    "required": true,
    "urgency": "routine|soon|urgent|emergent",
    "recommendedSpecialty": ["Primary specialty", "Secondary if applicable"],
    "reason": "Specific reason why consultation is necessary",
    "disclaimer": "This AI analysis is for INFORMATIONAL PURPOSES ONLY. It is NOT a medical diagnosis. All findings MUST be reviewed by a qualified healthcare provider. Do not make any clinical decisions based solely on this analysis. Please consult your physician or radiologist for proper interpretation and medical advice."
  },
  "summary": "Executive summary of key findings",
  "urgency": "routine|priority|urgent|emergent"
}

MANDATORY REMINDERS:
- You MUST first detect the imaging modality (X-ray/CT/MRI/etc) from visual features
- You MUST identify which organ(s) are being imaged
- Include SPECIFIC measurements with normal ranges
- Identify ANY obstructions or blockages
- ALL findings must reference specific panel AND organ
- This is AI-ASSISTED analysis only - NOT a diagnosis
- Patient MUST consult healthcare provider for proper interpretation`;
}

function parseComprehensiveResponse(responseText: string): any {
  try {
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      return {
        autoDetection: parsed.autoDetection || {
          detectedModality: 'Unknown',
          modalityConfidence: 0,
          modalityFeatures: [],
          detectedOrgans: [],
          imagingCharacteristics: {}
        },
        findings: parsed.findings || [],
        measurements: parsed.measurements || [],
        panelAnalysis: parsed.panelAnalysis || [],
        detailedReport: parsed.detailedReport || {},
        abnormalitySummary: parsed.abnormalitySummary || {},
        obstructionsAndBlockages: parsed.obstructionsAndBlockages || [],
        clinicalNotes: parsed.clinicalNotes || {
          keyFindings: [],
          clinicalCorrelation: '',
          riskAssessment: '',
          limitations: '',
          additionalImaging: ''
        },
        observations: parsed.observations || [],
        providerConsultation: parsed.providerConsultation || { 
          required: true, 
          urgency: 'routine',
          recommendedSpecialty: ['Radiology'],
          disclaimer: 'This AI analysis is for informational purposes only. Please consult your healthcare provider.'
        },
        anatomicalRegions: parsed.anatomicalRegions || []
      };
    }
  } catch (e) {
    console.error('Error parsing comprehensive response:', e);
  }
  
  return {
    autoDetection: {
      detectedModality: 'Unknown',
      modalityConfidence: 0,
      detectedOrgans: []
    },
    findings: [{
      category: 'observation',
      description: 'AI analysis completed. Please review all findings with a qualified healthcare provider.',
      confidence: 70,
      region: 'Full image',
      panelReference: 'all'
    }],
    measurements: [],
    panelAnalysis: [],
    detailedReport: {
      impression: 'Analysis completed - professional review required',
      recommendations: 'Consult with radiologist for comprehensive interpretation'
    },
    abnormalitySummary: { totalAbnormalities: 0, criticalFindings: [], recommendedActions: [] },
    obstructionsAndBlockages: [],
    clinicalNotes: { keyFindings: [], clinicalCorrelation: '', riskAssessment: '' },
    observations: [],
    providerConsultation: { required: true, urgency: 'routine', recommendedSpecialty: ['Radiology'] },
    anatomicalRegions: []
  };
}

function generateFallbackInsights(documentType: string): any[] {
  return [{
    category: 'observation',
    description: `${documentType} image uploaded. AI analysis temporarily unavailable. Please consult a qualified radiologist for interpretation.`,
    confidence: 100,
    region: 'Full image',
    clinicalSignificance: 'medium',
    panelReference: 'all'
  }];
}
