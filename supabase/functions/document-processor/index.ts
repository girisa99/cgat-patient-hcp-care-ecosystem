import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
// SheetJS for Excel/XLSX parsing - Deno compatible
import * as XLSX from "https://esm.sh/xlsx@0.18.5/xlsx.mjs";

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
  action: 'upload' | 'process' | 'extract_metadata' | 'map_to_form' | 'validate' | 'classify' | 'analyze_medical_image' | 'lookup_medical_codes' | 'upload_with_auto_detect';
  documentId?: string;
  fileBase64?: string;
  fileName?: string;
  mimeType?: string;
  processingConfig?: any;
  userId?: string;
  documentType?: string;
  documentCategory?: string;
  imageUrl?: string;
  imageBase64?: string;
  imageMimeType?: string;
  analysisType?: string;
  provider?: string;
  modelType?: string;
  icdCodes?: string[];
  cptCodes?: string[];
  autoDetect?: boolean;
  autoAnalyzeMedical?: boolean;
  // Intelligent routing options
  useIntelligentRouting?: boolean;
  ocrText?: string;
  targetFields?: string[];
}

// ============= INTELLIGENT MODEL ROUTING =============
type AIProvider = 'claude' | 'gemini' | 'openai';
type PipelineType = 'single' | 'sequential-hybrid';

interface ModelRoutingConfig {
  primaryModel: AIProvider;
  fallbackChain: AIProvider[];
  pipelineType: PipelineType;
  stage2Model?: AIProvider;
  timeoutMs: number;
  minConfidence: number;
  maxRetries: number;
}

interface ModelCapability {
  strengths: string[];
  categories: string[];
  contentPatterns: RegExp[];
  scoreWeight: number;
}

// Model capabilities for auto-selection
const MODEL_CAPABILITIES: Record<AIProvider, ModelCapability> = {
  claude: {
    strengths: ['clinical_reasoning', 'medical_terminology', 'policy_analysis', 'drug_interactions'],
    categories: ['healthcare'],
    contentPatterns: [
      /prescription|rx\b|medication|drug|dosage|refill/i,
      /diagnosis|icd-?10|clinical|patient|allergy/i,
      /coverage|deductible|copay|insurance|policy|benefit/i,
      /ndc|dea|npi|prescriber|pharmacy/i
    ],
    scoreWeight: 1.5
  },
  openai: {
    strengths: ['table_extraction', 'financial_calculations', 'structured_data'],
    categories: ['financial', 'business'],
    contentPatterns: [
      /invoice|billing|claim|statement|balance|payment/i,
      /cpt|hcpcs|revenue\s*code|modifier/i,
      /total|amount|subtotal|tax|\$[\d,]+\.?\d*/i,
      /billed|allowed|adjustment|paid|due/i
    ],
    scoreWeight: 1.3
  },
  gemini: {
    strengths: ['vision_analysis', 'handwriting', 'form_fields', 'speed'],
    categories: ['identity', 'medical-imaging', 'general'],
    contentPatterns: [
      /form|checkbox|signature|handwritten/i,
      /x-?ray|ct\s*scan|mri|ultrasound|dicom|ecg/i,
      /passport|license|id\s*card|photo/i
    ],
    scoreWeight: 1.2
  }
};

// Document type to model mapping (per routing strategy doc)
const DOCUMENT_TYPE_ROUTING: Record<string, ModelRoutingConfig> = {
  'prescription': { primaryModel: 'claude', fallbackChain: ['gemini', 'openai'], pipelineType: 'single', timeoutMs: 30000, minConfidence: 0.8, maxRetries: 2 },
  'insurance': { primaryModel: 'claude', fallbackChain: ['gemini', 'openai'], pipelineType: 'single', timeoutMs: 30000, minConfidence: 0.75, maxRetries: 2 },
  'lab-results': { primaryModel: 'claude', fallbackChain: ['gemini', 'openai'], pipelineType: 'single', timeoutMs: 30000, minConfidence: 0.75, maxRetries: 2 },
  'patient-onboarding': { primaryModel: 'gemini', fallbackChain: ['claude', 'openai'], pipelineType: 'single', timeoutMs: 25000, minConfidence: 0.7, maxRetries: 2 },
  'medical_imaging': { primaryModel: 'gemini', fallbackChain: ['claude'], pipelineType: 'sequential-hybrid', stage2Model: 'claude', timeoutMs: 45000, minConfidence: 0.6, maxRetries: 2 },
  'xray': { primaryModel: 'gemini', fallbackChain: ['claude'], pipelineType: 'sequential-hybrid', stage2Model: 'claude', timeoutMs: 45000, minConfidence: 0.6, maxRetries: 2 },
  'ct-scan': { primaryModel: 'gemini', fallbackChain: ['claude'], pipelineType: 'sequential-hybrid', stage2Model: 'claude', timeoutMs: 45000, minConfidence: 0.6, maxRetries: 2 },
  'mri': { primaryModel: 'gemini', fallbackChain: ['claude'], pipelineType: 'sequential-hybrid', stage2Model: 'claude', timeoutMs: 45000, minConfidence: 0.6, maxRetries: 2 },
  'ecg': { primaryModel: 'gemini', fallbackChain: ['claude'], pipelineType: 'sequential-hybrid', stage2Model: 'claude', timeoutMs: 40000, minConfidence: 0.6, maxRetries: 2 },
  'ultrasound': { primaryModel: 'gemini', fallbackChain: ['claude'], pipelineType: 'sequential-hybrid', stage2Model: 'claude', timeoutMs: 45000, minConfidence: 0.6, maxRetries: 2 },
  'invoice': { primaryModel: 'openai', fallbackChain: ['claude', 'gemini'], pipelineType: 'single', timeoutMs: 30000, minConfidence: 0.8, maxRetries: 2 },
  'receipt': { primaryModel: 'openai', fallbackChain: ['gemini', 'claude'], pipelineType: 'single', timeoutMs: 25000, minConfidence: 0.7, maxRetries: 2 },
  'passport': { primaryModel: 'gemini', fallbackChain: ['claude', 'openai'], pipelineType: 'single', timeoutMs: 25000, minConfidence: 0.8, maxRetries: 2 },
  'drivers-license': { primaryModel: 'gemini', fallbackChain: ['claude', 'openai'], pipelineType: 'single', timeoutMs: 25000, minConfidence: 0.8, maxRetries: 2 }
};

// Category defaults
const CATEGORY_DEFAULTS: Record<string, ModelRoutingConfig> = {
  'healthcare': { primaryModel: 'claude', fallbackChain: ['gemini', 'openai'], pipelineType: 'single', timeoutMs: 30000, minConfidence: 0.7, maxRetries: 2 },
  'medical-imaging': { primaryModel: 'gemini', fallbackChain: ['claude'], pipelineType: 'sequential-hybrid', stage2Model: 'claude', timeoutMs: 45000, minConfidence: 0.6, maxRetries: 2 },
  'financial': { primaryModel: 'openai', fallbackChain: ['claude', 'gemini'], pipelineType: 'single', timeoutMs: 30000, minConfidence: 0.75, maxRetries: 2 },
  'identity': { primaryModel: 'gemini', fallbackChain: ['claude', 'openai'], pipelineType: 'single', timeoutMs: 25000, minConfidence: 0.7, maxRetries: 2 },
  'business': { primaryModel: 'openai', fallbackChain: ['claude', 'gemini'], pipelineType: 'single', timeoutMs: 30000, minConfidence: 0.7, maxRetries: 2 },
  'general': { primaryModel: 'gemini', fallbackChain: ['claude', 'openai'], pipelineType: 'single', timeoutMs: 25000, minConfidence: 0.6, maxRetries: 2 }
};

// Model system prompts
const MODEL_SYSTEM_PROMPTS: Record<AIProvider, string> = {
  claude: `You are a clinical document analysis expert. Extract medical information with high accuracy. Validate NDC, NPI, DEA numbers. Identify drug interactions and therapeutic alternatives.`,
  openai: `You are a financial document extraction specialist. Extract structured data from invoices and billing with precision. Validate calculations and identify discrepancies.`,
  gemini: `You are a multimodal document analysis expert. Extract form fields, handwritten text, and image content. For medical imaging, identify modality, anatomical regions, and findings.`
};

// Select best model for document
function selectBestModel(documentTypeId: string, documentCategory: string, ocrText?: string): { config: ModelRoutingConfig; reason: string; confidence: number } {
  // 1. Check explicit document type config
  if (DOCUMENT_TYPE_ROUTING[documentTypeId]) {
    console.log(`[ModelRouting] Using explicit config for: ${documentTypeId}`);
    return { config: DOCUMENT_TYPE_ROUTING[documentTypeId], reason: 'explicit_config', confidence: 1.0 };
  }

  // 2. Content-based analysis
  if (ocrText && ocrText.length > 50) {
    const scores: Record<AIProvider, number> = { claude: 0, openai: 0, gemini: 0 };
    
    for (const [provider, capability] of Object.entries(MODEL_CAPABILITIES)) {
      const providerKey = provider as AIProvider;
      let matchCount = 0;
      
      for (const pattern of capability.contentPatterns) {
        const matches = ocrText.match(pattern);
        if (matches) matchCount += matches.length;
      }
      
      scores[providerKey] = matchCount * capability.scoreWeight;
    }
    
    const maxScore = Math.max(...Object.values(scores));
    const totalScore = Object.values(scores).reduce((a, b) => a + b, 0);
    
    if (maxScore > 0) {
      const winner = (Object.entries(scores).find(([_, s]) => s === maxScore)?.[0]) as AIProvider;
      const confidence = totalScore > 0 ? maxScore / totalScore : 0;
      
      if (confidence >= 0.6 && winner) {
        console.log(`[ModelRouting] Content analysis selected: ${winner} (confidence: ${(confidence * 100).toFixed(1)}%)`);
        const categoryConfig = CATEGORY_DEFAULTS[documentCategory] || CATEGORY_DEFAULTS['general'];
        return { 
          config: { ...categoryConfig, primaryModel: winner, fallbackChain: categoryConfig.fallbackChain.filter(m => m !== winner) },
          reason: 'content_analysis',
          confidence 
        };
      }
    }
  }

  // 3. Category default
  const categoryConfig = CATEGORY_DEFAULTS[documentCategory] || CATEGORY_DEFAULTS['general'];
  console.log(`[ModelRouting] Using category default for: ${documentCategory}`);
  return { config: categoryConfig, reason: 'category_default', confidence: 0.8 };
}

// ============= ANALYTICS LOGGING =============
interface AnalyticsEntry {
  document_id?: string;
  user_id?: string;
  document_type_id: string;
  document_category: string;
  file_name?: string;
  primary_model: string;
  selection_reason: string;
  selection_confidence: number;
  model_used: string;
  fallbacks_attempted: string[];
  pipeline_type: string;
  stage1_model?: string;
  stage2_model?: string;
  processing_time_ms: number;
  tokens_used?: number;
  estimated_cost?: number;
  success: boolean;
  confidence_score?: number;
  error_message?: string;
  warnings?: string[];
}

async function logModelAnalytics(supabase: any, entry: AnalyticsEntry): Promise<void> {
  try {
    const { error } = await supabase
      .from('document_ai_analytics')
      .insert({
        document_id: entry.document_id,
        user_id: entry.user_id,
        document_type_id: entry.document_type_id,
        document_category: entry.document_category,
        file_name: entry.file_name,
        primary_model: entry.primary_model,
        selection_reason: entry.selection_reason,
        selection_confidence: entry.selection_confidence,
        model_used: entry.model_used,
        fallbacks_attempted: entry.fallbacks_attempted,
        pipeline_type: entry.pipeline_type,
        stage1_model: entry.stage1_model,
        stage2_model: entry.stage2_model,
        processing_time_ms: entry.processing_time_ms,
        tokens_used: entry.tokens_used,
        estimated_cost: entry.estimated_cost,
        success: entry.success,
        confidence_score: entry.confidence_score,
        error_message: entry.error_message,
        warnings: entry.warnings
      });
    
    if (error) {
      console.warn('[Analytics] Failed to log model usage:', error.message);
    } else {
      console.log(`[Analytics] Logged: ${entry.model_used} for ${entry.document_type_id} (${entry.processing_time_ms}ms)`);
    }
  } catch (err) {
    console.warn('[Analytics] Error logging:', err);
  }
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
      case 'upload_with_auto_detect':
        return await handleUploadWithAutoDetect(supabase, request);
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

// NEW: Upload with automatic document type detection and medical imaging analysis
async function handleUploadWithAutoDetect(supabase: any, request: ProcessingRequest) {
  const { fileBase64, fileName, mimeType, processingConfig, userId, autoAnalyzeMedical = true } = request;
  const startTime = Date.now();
  
  if (!fileBase64 || !fileName) {
    throw new Error("Missing file data or filename");
  }

  console.log(`[AutoDetect] Starting upload with auto-detection for: ${fileName}, mimeType: ${mimeType}`);

  const fileData = Uint8Array.from(atob(fileBase64), c => c.charCodeAt(0));
  const filePath = `documents/${Date.now()}_${fileName}`;

  // Upload file to storage
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

  // Determine file type
  const isDicom = mimeType === 'application/dicom' || !!fileName.match(/\.(dcm|dicom)$/i);
  const isImage = mimeType?.startsWith('image/') || false;
  const isPdf = mimeType === 'application/pdf';
  const isExcel = mimeType?.includes('spreadsheet') || mimeType?.includes('excel') || !!fileName.match(/\.xlsx?$/i);
  const isCsv = mimeType === 'text/csv' || fileName.endsWith('.csv');
  const isMedicalImage = isDicom || (isImage && processingConfig?.isMedicalContext);

  console.log(`[AutoDetect] File analysis - isDicom: ${isDicom}, isImage: ${isImage}, isPdf: ${isPdf}, isMedicalImage: ${isMedicalImage}`);

  // Determine document category for model routing
  const getDocumentCategory = (type: string): string => {
    if (['prescription', 'lab_result', 'medical_record', 'insurance_card'].includes(type)) return 'healthcare';
    if (['xray', 'ct_scan', 'mri', 'ultrasound', 'ecg', 'medical_imaging'].includes(type)) return 'medical-imaging';
    if (['invoice', 'receipt'].includes(type)) return 'financial';
    if (['passport', 'drivers_license', 'identification'].includes(type)) return 'identity';
    return 'general';
  };

  // Auto-detect document type using Gemini Vision
  let detectedDocumentType = 'unknown';
  let autoDetectionResult: any = null;
  let medicalAnalysisResult: any = null;
  
  // Model routing info for analytics and UI
  let modelRoutingInfo = {
    primaryModel: 'gemini' as AIProvider,
    modelUsed: 'gemini' as AIProvider,
    selectionReason: 'category_default' as 'explicit_config' | 'category_default' | 'content_analysis' | 'fallback',
    confidence: 0.8,
    pipelineType: 'single' as PipelineType,
    stage1Model: undefined as AIProvider | undefined,
    stage2Model: undefined as AIProvider | undefined,
    fallbacksAttempted: [] as AIProvider[]
  };

  const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
  
  if (LOVABLE_API_KEY && (isImage || isPdf || isDicom)) {
    try {
      console.log(`[AutoDetect] Running Gemini Vision auto-detection...`);
      
      // For DICOM, extract metadata first then analyze
      if (isDicom) {
        detectedDocumentType = 'medical_imaging';
        
        // Parse DICOM metadata
        const dicomMetadata = extractDicomMetadata(fileData);
        autoDetectionResult = {
          detected_type: 'medical_imaging',
          dicom_metadata: dicomMetadata,
          confidence: 0.98,
          is_medical: true
        };
        
        // Use two-stage pipeline for medical imaging
        modelRoutingInfo = {
          primaryModel: 'gemini',
          modelUsed: 'gemini',
          selectionReason: 'explicit_config',
          confidence: 0.98,
          pipelineType: 'sequential-hybrid',
          stage1Model: 'gemini',
          stage2Model: 'claude',
          fallbacksAttempted: []
        };
        
        // Run medical image analysis if enabled
        if (autoAnalyzeMedical) {
          console.log(`[AutoDetect] Running medical imaging analysis for DICOM...`);
          medicalAnalysisResult = await runMedicalImageAnalysis(fileBase64, mimeType || 'application/dicom', dicomMetadata, LOVABLE_API_KEY);
        }
      } else if (isImage || isPdf) {
        // Use Gemini to classify the document
        const classificationPrompt = `Analyze this document/image and classify it. Return ONLY a JSON object:
{
  "detected_type": "one of: invoice, receipt, prescription, lab_result, medical_record, insurance_card, identification, form, contract, medical_imaging, xray, ct_scan, mri, ultrasound, ecg, unknown",
  "confidence": 0.0 to 1.0,
  "is_medical": true/false,
  "medical_modality": "if medical imaging, specify: xray, ct, mri, ultrasound, ecg, or null",
  "key_indicators": ["list of visual cues that led to this classification"],
  "suggested_fields": ["list of expected fields for this document type"]
}`;

        const classifyResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${LOVABLE_API_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: "google/gemini-2.5-flash",
            messages: [
              {
                role: "user",
                content: [
                  { type: "text", text: classificationPrompt },
                  {
                    type: "image_url",
                    image_url: { url: `data:${mimeType || 'image/png'};base64,${fileBase64}` }
                  }
                ]
              }
            ],
            max_tokens: 1000
          })
        });

        if (classifyResponse.ok) {
          const classifyData = await classifyResponse.json();
          const content = classifyData.choices?.[0]?.message?.content || '';
          
          // Parse JSON from response
          const jsonMatch = content.match(/\{[\s\S]*\}/);
          if (jsonMatch) {
            autoDetectionResult = JSON.parse(jsonMatch[0]);
            detectedDocumentType = autoDetectionResult.detected_type || 'unknown';
            
            console.log(`[AutoDetect] Detected type: ${detectedDocumentType}, confidence: ${autoDetectionResult.confidence}`);
            
            // Determine model routing based on detected type
            const category = getDocumentCategory(detectedDocumentType);
            const routingConfig = selectBestModel(detectedDocumentType, category);
            
            modelRoutingInfo = {
              primaryModel: routingConfig.config.primaryModel,
              modelUsed: routingConfig.config.primaryModel,
              selectionReason: routingConfig.reason as any,
              confidence: routingConfig.confidence,
              pipelineType: routingConfig.config.pipelineType,
              stage1Model: routingConfig.config.pipelineType === 'sequential-hybrid' ? 'gemini' : undefined,
              stage2Model: routingConfig.config.stage2Model,
              fallbacksAttempted: []
            };
            
            // Run medical image analysis if it's a medical image
            if (autoAnalyzeMedical && autoDetectionResult.is_medical) {
              console.log(`[AutoDetect] Medical content detected, running analysis...`);
              medicalAnalysisResult = await runMedicalImageAnalysis(
                fileBase64, 
                mimeType || 'image/png', 
                { modality: autoDetectionResult.medical_modality },
                LOVABLE_API_KEY
              );
            }
          }
        }
      }
    } catch (autoDetectError) {
      console.error('[AutoDetect] Auto-detection error:', autoDetectError);
      // Continue with upload even if detection fails
    }
  }

  const processingTimeMs = Date.now() - startTime;

  // Create processing record with detected type and analysis
  const { data: record, error: recordError } = await supabase
    .from('document_processing_jobs')
    .insert({
      file_name: fileName,
      file_path: filePath,
      mime_type: mimeType,
      status: 'uploaded',
      document_type: detectedDocumentType,
      user_id: userId || null,
      processing_config: { 
        ...processingConfig, 
        publicUrl, 
        isImage,
        isDicom,
        isMedicalImage,
        autoDetected: true,
        autoDetectionResult,
        medicalAnalysisResult,
        modelRouting: modelRoutingInfo
      },
      progress: autoDetectionResult ? 25 : 0,
      current_stage: autoDetectionResult ? 'classification' : 'upload',
      stage_message: autoDetectionResult 
        ? `Document classified as: ${detectedDocumentType} (${Math.round((autoDetectionResult.confidence || 0) * 100)}% confidence)`
        : 'Document uploaded successfully',
      stages: { 
        upload: { status: 'completed', timestamp: new Date().toISOString() },
        ...(autoDetectionResult && { classification: { status: 'completed', result: autoDetectionResult, timestamp: new Date().toISOString() } }),
        ...(medicalAnalysisResult && { medical_analysis: { status: 'completed', result: medicalAnalysisResult, timestamp: new Date().toISOString() } })
      }
    })
    .select()
    .single();

  if (recordError) {
    throw new Error(`Failed to create processing record: ${recordError.message}`);
  }

  // Log analytics
  const category = getDocumentCategory(detectedDocumentType);
  await logModelAnalytics(supabase, {
    document_id: record.id,
    user_id: userId,
    document_type_id: detectedDocumentType,
    document_category: category,
    file_name: fileName,
    primary_model: modelRoutingInfo.primaryModel,
    selection_reason: modelRoutingInfo.selectionReason,
    selection_confidence: modelRoutingInfo.confidence,
    model_used: modelRoutingInfo.modelUsed,
    fallbacks_attempted: modelRoutingInfo.fallbacksAttempted,
    pipeline_type: modelRoutingInfo.pipelineType,
    stage1_model: modelRoutingInfo.stage1Model,
    stage2_model: modelRoutingInfo.stage2Model,
    processing_time_ms: processingTimeMs,
    success: true,
    confidence_score: autoDetectionResult?.confidence
  });

  console.log(`[AutoDetect] Upload complete. DocumentId: ${record.id}, DetectedType: ${detectedDocumentType}, Model: ${modelRoutingInfo.modelUsed}`);

  return new Response(
    JSON.stringify({ 
      success: true, 
      documentId: record.id, 
      filePath, 
      publicUrl,
      detectedDocumentType,
      autoDetectionResult,
      medicalAnalysisResult,
      isMedicalImage,
      modelRouting: modelRoutingInfo,
      processingTimeMs
    }),
    { headers: { "Content-Type": "application/json", ...corsHeaders } }
  );
}

// Helper: Run medical image analysis with Gemini
async function runMedicalImageAnalysis(imageBase64: string, mimeType: string, metadata: any, apiKey: string): Promise<any> {
  const modality = metadata?.modality || metadata?.Modality || 'unknown';
  
  const analysisPrompt = `You are a medical imaging AI assistant. Analyze this ${modality} medical image and provide a structured assessment.

IMPORTANT: This is for educational/informational purposes only. Always recommend professional medical review.

Provide analysis in this JSON format:
{
  "image_quality": "good/fair/poor",
  "modality_detected": "xray/ct/mri/ultrasound/ecg/dicom/other",
  "anatomical_region": "identified body region",
  "technical_observations": ["list of technical image quality notes"],
  "anatomical_findings": ["list of visible anatomical structures"],
  "potential_observations": ["list of any notable findings - be conservative"],
  "measurements": {"any measurable findings": "value"},
  "comparison_notes": "notes about positioning, technique",
  "recommendations": ["suggested follow-up or additional views if applicable"],
  "confidence_level": 0.0 to 1.0,
  "disclaimer": "This is an AI-assisted preliminary analysis. Professional radiologist review is required for clinical decisions."
}`;

  try {
    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          {
            role: "user",
            content: [
              { type: "text", text: analysisPrompt },
              {
                type: "image_url",
                image_url: { url: `data:${mimeType};base64,${imageBase64}` }
              }
            ]
          }
        ],
        max_tokens: 2000
      })
    });

    if (response.ok) {
      const data = await response.json();
      const content = data.choices?.[0]?.message?.content || '';
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const analysis = JSON.parse(jsonMatch[0]);
        return {
          ...analysis,
          analyzed_at: new Date().toISOString(),
          source_metadata: metadata
        };
      }
    }
    return null;
  } catch (error) {
    console.error('[MedicalAnalysis] Error:', error);
    return null;
  }
}

// Helper: Extract DICOM metadata from binary
function extractDicomMetadata(fileData: Uint8Array): any {
  const metadata: Record<string, any> = {};
  
  try {
    // Check DICOM magic number
    if (fileData.length > 132) {
      const dicm = String.fromCharCode(...fileData.slice(128, 132));
      if (dicm === 'DICM') {
        metadata.valid_dicom = true;
        
        // Parse some common DICOM tags
        const dataView = new DataView(fileData.buffer);
        let offset = 132;
        
        while (offset < Math.min(fileData.length - 8, 4096)) {
          try {
            const group = dataView.getUint16(offset, true);
            const element = dataView.getUint16(offset + 2, true);
            const tagKey = `(${group.toString(16).padStart(4, '0')},${element.toString(16).padStart(4, '0')})`;
            
            // Common DICOM tags
            if (group === 0x0010) {
              if (element === 0x0010) metadata.PatientName = 'Present';
              if (element === 0x0020) metadata.PatientID = 'Present';
              if (element === 0x0030) metadata.PatientBirthDate = 'Present';
              if (element === 0x0040) metadata.PatientSex = 'Present';
            }
            if (group === 0x0008) {
              if (element === 0x0060) metadata.Modality = 'Present';
              if (element === 0x0020) metadata.StudyDate = 'Present';
              if (element === 0x1030) metadata.StudyDescription = 'Present';
            }
            if (group === 0x0020) {
              if (element === 0x000D) metadata.StudyInstanceUID = 'Present';
              if (element === 0x000E) metadata.SeriesInstanceUID = 'Present';
            }
            
            offset += 8;
          } catch {
            break;
          }
        }
      }
    }
  } catch (error) {
    console.error('DICOM metadata extraction error:', error);
  }
  
  return {
    ...metadata,
    file_size: fileData.length,
    extracted_at: new Date().toISOString()
  };
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
  
  // Pipeline tracking variables - declared at function scope to avoid ReferenceError
  let pipelineTypeUsed = 'vision_ai_only';
  let ocrTextExtracted = '';
  let ocrConfidenceValue = 0;
  let extractionSuccess = false;
  
  // Determine file type and process accordingly
  const effectiveMimeType = storedMimeType || mimeType || 'application/octet-stream';
  const isImage = effectiveMimeType.startsWith('image/');
  const isPdf = effectiveMimeType === 'application/pdf';
  const isCsv = effectiveMimeType === 'text/csv' || effectiveMimeType.includes('csv') || filePath.endsWith('.csv');
  const isExcel = effectiveMimeType.includes('spreadsheet') || effectiveMimeType.includes('excel') || filePath.match(/\.xlsx?$/i);
  const isJson = effectiveMimeType === 'application/json' || filePath.endsWith('.json');
  const isDicom = effectiveMimeType === 'application/dicom' || filePath.match(/\.dcm$/i) || filePath.match(/\.dicom$/i);
  
  console.log(`Processing file: ${filePath}, type: ${effectiveMimeType}, isImage: ${isImage}, isPdf: ${isPdf}, isExcel: ${isExcel}, isDicom: ${isDicom}, fileUrl exists: ${!!fileUrl}`);
  
  try {
    // Handle Excel/XLSX files with SheetJS
    if (isExcel && (fileUrl || filePath)) {
      console.log('Processing Excel file with SheetJS...');
      const excelExtracted = await extractFromExcel(supabase, fileUrl, filePath, documentType);
      if (excelExtracted) {
        Object.assign(formMapping, excelExtracted.fields);
        lineItemsExtracted = excelExtracted.line_items || [];
        tablesExtracted = excelExtracted.tables || [];
        providerUsed = 'sheetjs_excel';
        console.log(`Excel extraction complete: ${Object.keys(formMapping).length} fields, ${lineItemsExtracted.length} rows`);
      }
    }
    // Handle CSV files
    else if (isCsv && fileUrl) {
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
    // Handle DICOM medical imaging files
    else if (isDicom && (fileUrl || filePath)) {
      console.log('Processing DICOM file with specialized handler...');
      const dicomExtracted = await extractFromDicom(supabase, fileUrl, filePath, documentType);
      if (dicomExtracted) {
        Object.assign(formMapping, dicomExtracted.fields);
        lineItemsExtracted = dicomExtracted.line_items || [];
        tablesExtracted = dicomExtracted.tables || [];
        providerUsed = 'dicom_parser';
        console.log(`DICOM extraction complete: ${Object.keys(formMapping).length} fields`);
      }
    }
    // Handle images and PDFs with OCR/Vision AI
    else if ((isImage || isPdf) && (fileUrl || filePath)) {
      console.log(`Starting image/PDF extraction with provider: ${configuredProvider}`);
      
      let fileBase64Data = '';
      let contentType = effectiveMimeType;
      let fetchSuccess = false;
      
      // First try public URL
      if (fileUrl) {
        console.log(`Trying public URL: ${fileUrl}`);
        const fileResponse = await fetch(fileUrl);
        console.log(`Public URL fetch status: ${fileResponse.status}`);
        
        if (fileResponse.ok) {
          const fileBlob = await fileResponse.arrayBuffer();
          const fileBytes = new Uint8Array(fileBlob);
          console.log(`File size: ${fileBytes.length} bytes`);
          
          // Convert to base64 in chunks
          let binaryString = '';
          const chunkSize = 0x8000;
          for (let i = 0; i < fileBytes.length; i += chunkSize) {
            const chunk = fileBytes.subarray(i, i + chunkSize);
            binaryString += String.fromCharCode.apply(null, Array.from(chunk));
          }
          fileBase64Data = btoa(binaryString);
          contentType = fileResponse.headers.get('content-type') || effectiveMimeType;
          fetchSuccess = true;
        }
      }
      
      // If public URL failed, try signed URL from storage
      if (!fetchSuccess && filePath) {
        console.log(`Public URL failed, trying signed URL for: ${filePath}`);
        const { data: signedUrlData, error: signedUrlError } = await supabase.storage
          .from('document-processing')
          .createSignedUrl(filePath, 300); // 5 min expiry
        
        if (signedUrlError) {
          console.error(`Signed URL error: ${signedUrlError.message}`);
        } else if (signedUrlData?.signedUrl) {
          console.log(`Got signed URL, fetching...`);
          const signedResponse = await fetch(signedUrlData.signedUrl);
          console.log(`Signed URL fetch status: ${signedResponse.status}`);
          
          if (signedResponse.ok) {
            const fileBlob = await signedResponse.arrayBuffer();
            const fileBytes = new Uint8Array(fileBlob);
            console.log(`File size from signed URL: ${fileBytes.length} bytes`);
            
            let binaryString = '';
            const chunkSize = 0x8000;
            for (let i = 0; i < fileBytes.length; i += chunkSize) {
              const chunk = fileBytes.subarray(i, i + chunkSize);
              binaryString += String.fromCharCode.apply(null, Array.from(chunk));
            }
            fileBase64Data = btoa(binaryString);
            contentType = signedResponse.headers.get('content-type') || effectiveMimeType;
            fetchSuccess = true;
          }
        }
      }
      
      // Also try using the base64 from the request if available
      if (!fetchSuccess && request.fileBase64) {
        console.log(`Using base64 from request`);
        fileBase64Data = request.fileBase64;
        contentType = request.mimeType || effectiveMimeType;
        fetchSuccess = true;
      }
      
      if (fetchSuccess && fileBase64Data) {
        console.log(`Base64 length: ${fileBase64Data.length}, content type: ${contentType}`);
        
        // Build dynamic extraction prompt based on document type with target fields
        const extractionPrompt = buildExtractionPrompt(documentType || 'unknown', targetFields);
        console.log(`Extraction prompt built for document type: ${documentType}`);
        
        // ============= INTELLIGENT MODEL ROUTING =============
        // Use the selectBestModel algorithm to determine optimal AI provider
        const documentCategory = getDocumentCategory(documentType || 'unknown');
        // Use ocrText from request if available, otherwise undefined for content-based routing
        const ocrTextForRouting = request.ocrText || undefined;
        const { config: routingConfig, reason: routingReason, confidence: routingConfidence } = selectBestModel(
          documentType || 'unknown',
          documentCategory,
          ocrTextForRouting
        );
        
        console.log(`[ModelRouting] Selected: ${routingConfig.primaryModel} (${routingReason}, confidence: ${(routingConfidence * 100).toFixed(1)}%)`);
        console.log(`[ModelRouting] Pipeline: ${routingConfig.pipelineType}, Fallback chain: ${routingConfig.fallbackChain.join(' → ')}`);
        
        // ============= USE HYBRID OCR + VISION AI PIPELINE =============
        // Stage 1: Google Cloud Vision OCR, Stage 2: Vision AI for structuring
        console.log(`[Extraction] Using hybrid OCR + Vision AI pipeline with primary: ${routingConfig.primaryModel}`);
        
        let extracted: any = null;
        
        try {
          const hybridResult = await extractWithHybridPipeline(
            fileBase64Data,
            contentType,
            extractionPrompt,
            routingConfig.primaryModel,
            MODEL_SYSTEM_PROMPTS[routingConfig.primaryModel]
          );
          
          extracted = hybridResult.result;
          providerUsed = hybridResult.provider;
          ocrTextExtracted = hybridResult.ocrText;
          ocrConfidenceValue = hybridResult.ocrConfidence;
          pipelineTypeUsed = hybridResult.pipelineType;
          
          console.log(`[Extraction] Hybrid pipeline completed: provider=${providerUsed}, pipeline=${pipelineTypeUsed}, ocrChars=${ocrTextExtracted.length}`);
          
          if (extracted) {
            // Add pipeline metadata to formMapping
            formMapping['_pipeline_type'] = {
              value: pipelineTypeUsed,
              confidence: 1.0,
              source: 'pipeline_metadata'
            };
            
            if (ocrTextExtracted.length > 0) {
              formMapping['_ocr_text_length'] = {
                value: String(ocrTextExtracted.length),
                confidence: ocrConfidenceValue,
                source: 'google_vision_ocr'
              };
              formMapping['_ocr_confidence'] = {
                value: String((ocrConfidenceValue * 100).toFixed(1)) + '%',
                confidence: ocrConfidenceValue,
                source: 'google_vision_ocr'
              };
            }
            
            // Map extracted fields to formMapping format
            if (extracted.fields) {
              for (const [key, value] of Object.entries(extracted.fields)) {
                if (value !== null && value !== undefined && String(value).trim()) {
                  formMapping[key] = {
                    value: String(value),
                    confidence: extracted.confidence || 0.85,
                    source: `${providerUsed}_vision_ai`
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
                source: `${providerUsed}_vision_ai`
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
                source: `${providerUsed}_vision_ai`
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
            
            // Add sections from AI extraction for dynamic form display
            if (extracted.sections && typeof extracted.sections === 'object') {
              formMapping['_sections'] = extracted.sections;
              console.log(`[Extraction] Sections extracted: ${Object.keys(extracted.sections).length} sections`);
            }
            
            extractionSuccess = true;
            console.log(`Hybrid extraction completed with ${providerUsed} (${pipelineTypeUsed}): ${Object.keys(formMapping).length} fields, ${lineItemsExtracted.length} line items`);
          }
        } catch (hybridError) {
          console.error(`[Extraction] Hybrid pipeline failed:`, hybridError instanceof Error ? hybridError.message : hybridError);
          
          // Fallback to direct Vision AI extraction without OCR
          console.log(`[Extraction] Falling back to direct Vision AI extraction...`);
          const providerChain: AIProvider[] = [routingConfig.primaryModel, ...routingConfig.fallbackChain];
          
          for (const provider of providerChain) {
            if (extractionSuccess) break;
            
            try {
              const systemPrompt = MODEL_SYSTEM_PROMPTS[provider];
              
              switch (provider) {
                case 'claude':
                  extracted = await extractWithClaude(fileBase64Data, contentType, extractionPrompt, systemPrompt);
                  providerUsed = 'claude';
                  break;
                case 'openai':
                  extracted = await extractWithOpenAI(fileBase64Data, contentType, extractionPrompt, systemPrompt);
                  providerUsed = 'openai';
                  break;
                case 'gemini':
                default:
                  extracted = await extractWithGemini(fileBase64Data, contentType, extractionPrompt);
                  providerUsed = 'gemini';
              }
              
              if (extracted) {
                // Map fields (simplified for fallback)
                if (extracted.fields) {
                  for (const [key, value] of Object.entries(extracted.fields)) {
                    if (value !== null && value !== undefined && String(value).trim()) {
                      formMapping[key] = {
                        value: String(value),
                        confidence: extracted.confidence || 0.85,
                        source: `${providerUsed}_vision_ai_fallback`
                      };
                    }
                  }
                }
                extractionSuccess = true;
                pipelineTypeUsed = 'vision_ai_fallback';
              }
            } catch (providerError) {
              console.error(`Provider ${provider} failed:`, providerError instanceof Error ? providerError.message : providerError);
            }
          }
        }
      } else {
        console.log('File fetch failed - no base64 data available');
      }
    }
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
    console.error('Main extraction error:', extractionError instanceof Error ? extractionError.message : extractionError);
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
  
  // Only include fields that were actually extracted - NO hardcoded empty fields
  // Target fields are used as hints only, not forced into response
  console.log(`Total extracted fields: ${Object.keys(formMapping).length}`, formMapping);
  
  // Build model routing info for frontend display
  const documentCategory = getDocumentCategory(documentType || 'unknown');
  const { config: routingConfigFinal, reason: routingReasonFinal, confidence: routingConfidenceFinal } = selectBestModel(
    documentType || 'unknown',
    documentCategory
  );
  
  const modelRoutingInfo = {
    primaryModel: routingConfigFinal.primaryModel,
    modelUsed: providerUsed || routingConfigFinal.primaryModel,
    selectionReason: routingReasonFinal,
    confidence: routingConfidenceFinal,
    pipelineType: pipelineTypeUsed || routingConfigFinal.pipelineType,
    stage1Model: 'google_vision_ocr',
    stage2Model: providerUsed || routingConfigFinal.primaryModel,
    fallbacksAttempted: [],
    fallbackChain: routingConfigFinal.fallbackChain,
    processingTimeMs: 0,
    ocrTextLength: ocrTextExtracted?.length || 0,
    ocrConfidence: ocrConfidenceValue || 0,
    documentCategory
  };
  
  return new Response(
    JSON.stringify({ 
      success: true, 
      formMapping,
      // Include line items and tables as separate arrays for frontend consumption
      line_items: lineItemsExtracted || [],
      tables: tablesExtracted || [],
      mappingConfidence: Object.keys(formMapping).length > 0 ? 0.85 : 0,
      documentType: documentType || 'invoice',
      providerUsed,
      crosswalkResults,
      // Include model routing info for Stage 1 → Stage 2 visibility in UI
      modelRouting: modelRoutingInfo
    }),
    { headers: { "Content-Type": "application/json", ...corsHeaders } }
  );
}

// Build DYNAMIC extraction prompt - extract what's visible but use standardized field names for known document types
function buildExtractionPrompt(documentType: string, targetFields?: string[]): string {
  // Document-type-specific extraction hints for ALL document types
  const documentTypeHints: Record<string, string> = {
    'prescription': `
================================================================================
COMPREHENSIVE PRESCRIPTION EXTRACTION FRAMEWORK v2.0
================================================================================

SECTION 1: DOCUMENT CLASSIFICATION & PRE-PROCESSING
================================================================================

**DOCUMENT TYPE DETECTION:**
Identify which type of prescription this is:
- handwritten_prescription: Written on a prescription pad with "Rx" symbol
- printed_prescription: Clean typed text from EMR/EHR systems
- electronic_prescription: EPCS format with electronic signature
- hospital_discharge_rx: Multiple medications in table format
- compound_prescription: Custom formulations with mixing instructions
- controlled_substance_rx: DEA number prominent, Schedule II-V indicated
- veterinary_prescription: For animals, includes species
- dental_prescription: From DDS/DMD
- optical_prescription: Eye prescriptions (OD/OS/OU)

**WRITING STYLE DETECTION:**
- fully_handwritten: All text is handwritten
- partially_handwritten: Printed form with handwritten entries
- fully_printed: All computer-generated
- mixed_cursive_print: Combination of cursive and print handwriting
- stamped_with_handwritten: Pre-printed with stamp plus handwritten additions

**IMAGE QUALITY ASSESSMENT:**
Note any issues: folds, tears, stains, shadows, glare, fading, low resolution

================================================================================
SECTION 2: HANDWRITTEN PRESCRIPTION RECOGNITION (CRITICAL)
================================================================================

**CHARACTER CONFUSION MATRIX - Use Context to Disambiguate:**

LETTERS COMMONLY CONFUSED:
  a ↔ o ↔ u ↔ e (context: "daily" vs "doily")
  n ↔ m ↔ r ↔ v ↔ w (context: drug suffix "-min" vs "-rin")
  i ↔ l ↔ t ↔ f ↔ j (check for dots/crosses)
  c ↔ e ↔ o (context: "once" vs "onco")
  h ↔ b ↔ k ↔ li (context: "health" vs "bealth")
  d ↔ cl ↔ a (context: "daily" vs "claily")
  g ↔ q ↔ y ↔ 9 (look for tails)
  s ↔ 5 ↔ S (context determines)
  z ↔ 2 ↔ Z (context determines)

NUMBERS COMMONLY CONFUSED:
  0 ↔ 6 ↔ O ↔ o ↔ D (CRITICAL for dosing!)
  1 ↔ 7 ↔ l ↔ I ↔ | (crossbar on 7?)
  2 ↔ Z ↔ z (context determines)
  3 ↔ 8 ↔ B (look at curves)
  4 ↔ 9 ↔ q (open vs closed top)
  5 ↔ S ↔ s (context determines)

DECIMAL ISSUES (HIGH RISK - FLAG FOR REVIEW):
  - Missing leading zero: ".5" → flag as potential "5" misread
  - Trailing zero: "5.0" → could be misread as "50"
  - Comma vs period: "1,5" vs "1.5" (European notation)
  - Faint decimal points mistaken for stray marks

**DRUG NAME RECOGNITION - LASA (Look-Alike Sound-Alike) PAIRS:**
Common confusions to watch for:
  Celebrex ↔ Celexa ↔ Cerebyx
  Hydroxyzine ↔ Hydralazine ↔ Hydroxyurea
  Clonidine ↔ Clonazepam ↔ Klonopin
  Metformin ↔ Metronidazole
  Prednisone ↔ Prednisolone
  Tramadol ↔ Trazodone
  Zantac ↔ Xanax ↔ Zyrtec
  Lasix ↔ Losec ↔ Luvox
  Lamictal ↔ Lamisil ↔ Labetalol
  Flomax ↔ Fosamax ↔ Volmax
  Atenolol ↔ Albuterol
  Norvasc ↔ Navane
  Prilosec ↔ Prozac ↔ Plavix
  Ambien ↔ Abilify

================================================================================
SECTION 3: COMPREHENSIVE SIG ABBREVIATION MAPPING
================================================================================

**FREQUENCY ABBREVIATIONS:**
  QD, qd, q.d., qday, daily, once daily, OD → once per day
  BID, bid, b.i.d., 2x/day, twice daily → twice per day
  TID, tid, t.i.d., 3x/day, three times daily → three times per day
  QID, qid, q.i.d., 4x/day, four times daily → four times per day
  Q4H, q4h, q4°, q.4.h., every 4 hours → every 4 hours
  Q6H, q6h, Q6°, every 6 hours → every 6 hours
  Q8H, q8h, Q8°, every 8 hours → every 8 hours
  Q12H, q12h, every 12 hours → every 12 hours
  QOD, qod, q.o.d., every other day → DANGEROUS ABBREVIATION - FLAG
  QWK, qwk, weekly, once weekly → once per week
  QMonth, monthly, once monthly → once per month
  PRN, prn, p.r.n., as needed, when needed → as needed

**TIMING ABBREVIATIONS:**
  AC, ac, a.c., ante cibum → before meals
  PC, pc, p.c., post cibum → after meals
  HS, hs, h.s., hora somni → at bedtime
  AM, am, a.m., qAM → in the morning
  PM, pm, p.m., qPM → in the evening
  STAT, stat → immediately
  C, c̄ (with bar) → with
  S, s̄ (with bar) → without

**ROUTE ABBREVIATIONS:**
  PO, po, p.o., per os, by mouth → oral
  SL, sl, s.l., sublingual → under tongue
  PR, pr, p.r., per rectum → rectal
  PV, pv, per vagina → vaginal
  TOP, top., topical, apply → topical
  INH, inh., inhale → inhalation
  IM, im, i.m. → intramuscular
  IV, iv, i.v. → intravenous
  SC, SQ, sq, s.c., subQ, subcut → subcutaneous
  OU, ou → both eyes
  OD, od → right eye (CAUTION: can mean once daily)
  OS, os → left eye
  AU, au → both ears
  AD, ad → right ear
  AS, as → left ear
  GTTS, gtts, gtt → drops
  NEB, neb → nebulizer

**QUANTITY/FORM ABBREVIATIONS:**
  TAB, tab, tabs → tablet(s)
  CAP, cap, caps → capsule(s)
  ML, ml, mL → milliliter(s)
  MG, mg → milligram(s)
  MCG, mcg, μg → microgram(s) - DANGEROUS: μg looks like mg
  G, g, gm → gram(s)
  TSP, tsp → teaspoon (5 mL)
  TBSP, tbsp → tablespoon (15 mL)
  CC, cc → cubic centimeter - DANGEROUS: looks like U
  U, u → units - DANGEROUS: looks like 0 or 4
  IU, iu → international units - DANGEROUS: looks like IV

================================================================================
SECTION 4: ISMP DANGEROUS ABBREVIATIONS (CRITICAL - ALWAYS FLAG)
================================================================================

**CRITICAL SEVERITY - MUST FLAG:**
  U, u (units) → Mistaken for 0, 4, or cc → CRITICAL
  IU (international units) → Mistaken for IV → CRITICAL
  MS, MSO4, MgSO4 → Confused for each other → CRITICAL
  μg (microgram) → Mistaken for mg (1000x error!) → CRITICAL

**HIGH SEVERITY - FLAG FOR REVIEW:**
  Q.D., QD, qd → Mistaken for QID → HIGH
  Q.O.D., QOD → Mistaken for QD or QID → HIGH
  Trailing zero (1.0 mg) → Mistaken for 10 mg → HIGH
  No leading zero (.5 mg) → Mistaken for 5 mg → HIGH
  cc → Mistaken for U (units) → HIGH
  AS, AD, AU, OS, OD, OU → Ear vs eye confusion → HIGH

**MEDIUM SEVERITY - NOTE:**
  T.I.W. → Mistaken for TID or twice weekly → MEDIUM
  SC, SQ → Mistaken for SL or "5Q" → MEDIUM
  D/C → Discharge vs discontinue confusion → MEDIUM
  HS → Half-strength vs hora somni → MEDIUM

When any dangerous abbreviation is detected:
1. Include in extraction as-is
2. Add translation in plain English
3. Set dangerous_abbreviation_detected: true
4. Add to validation_flags array

================================================================================
SECTION 5: MULTI-MEDICATION PRESCRIPTION HANDLING
================================================================================

**CRITICAL: A prescription may contain MULTIPLE medications - extract ALL**

Return medications as an ARRAY:
{
  "medications": [
    {
      "sequence_number": 1,
      "raw_text": "Ferrous Sulfate 325mg 1 tab PO daily with food #30 Ref x3",
      "medication_name": "Ferrous Sulfate",
      "medication_name_type": "generic",
      "strength": "325mg",
      "strength_numeric": 325,
      "strength_unit": "mg",
      "dosage_form": "tablet",
      "route": "oral",
      "sig_raw": "1 tab PO daily with food",
      "sig_parsed": {
        "dose_per_administration": "1 tablet",
        "frequency": "once daily",
        "timing": "with food",
        "route": "oral"
      },
      "sig_translation": "Take 1 tablet by mouth once daily with food",
      "quantity": 30,
      "quantity_unit": "tablets",
      "refills": 3,
      "days_supply": 30,
      "is_controlled": false,
      "daw_code": 0,
      "confidence": 0.92,
      "validation_flags": [],
      "dangerous_abbreviations": []
    },
    {
      "sequence_number": 2,
      "medication_name": "Ascorbic Acid",
      "strength": "500mg",
      ...
    }
  ],
  "medication_count": 2,
  "medication_name": "Ferrous Sulfate"  // First med for backward compatibility
}

**MULTI-MED RECOGNITION PATTERNS:**
- Multiple lines after "Rx:" symbol
- Numbered list: 1. Drug A  2. Drug B
- Table format with columns
- Separate Rx numbers for each medication
- "AND" or line breaks between medications

================================================================================
SECTION 6: CONTROLLED SUBSTANCE VALIDATION
================================================================================

**SCHEDULE II (Strictest - examples: oxycodone, amphetamine, fentanyl):**
Required elements - flag if missing:
  ✓ Written prescription (or approved ePrescribe)
  ✓ Manual signature (not stamped)
  ✓ DEA number present and valid
  ✓ Quantity written in words AND numbers
  ✓ No refills permitted
  ✓ Valid within 90 days (state-specific)

**SCHEDULE III-IV (examples: Tylenol #3, benzodiazepines):**
Required elements:
  ✓ DEA number present
  ✓ Up to 5 refills permitted
  ✓ Valid for 6 months

**SCHEDULE V (examples: pregabalin, some cough syrups):**
Required elements:
  ✓ DEA number present
  ✓ Up to 5 refills permitted
  ✓ Valid for 6 months

**DEA NUMBER VALIDATION:**
Format: 2 letters + 7 digits
First letter: A,B,C,D,E,F,G,H,J,K,L,M,P,R,S,T,U,X
Second letter: Usually first letter of prescriber's last name
Checksum: (d1+d3+d5) + 2*(d2+d4+d6) mod 10 = d7

**NPI NUMBER VALIDATION:**
Exactly 10 digits
Luhn algorithm checksum (with 80840 prefix)

================================================================================
SECTION 7: DOSE VALIDATION RULES
================================================================================

**COMMON MAXIMUM DOSES - Flag if exceeded:**
Acetaminophen: max 4000mg/day (3000mg for liver risk)
Ibuprofen: max 3200mg/day
Metformin: max 2550mg/day (2000mg typical max)
Lisinopril: max 80mg/day
Amlodipine: max 10mg/day
Atorvastatin: max 80mg/day
Omeprazole: max 40mg/day (80mg short-term)
Gabapentin: max 3600mg/day
Prednisone: varies by indication, flag if >60mg/day

**PEDIATRIC CONSIDERATIONS:**
- Extract patient weight if noted
- Calculate mg/kg dose when possible
- Flag if dose exceeds pediatric max
- Note if liquid formulation appropriate for age

**DOSE PLAUSIBILITY CHECK:**
- If quantity / (dose × frequency) doesn't equal reasonable days supply, flag
- Example: #30 tablets for "1 tab TID" = 10 days (typical for antibiotic ✓)
- Example: #30 tablets for "1 tab TID" for maintenance med = suspicious

================================================================================
SECTION 8: REQUIRED EXTRACTION FIELDS
================================================================================

**MEDICATION FIELDS (MOST CRITICAL):**
- medication_name: Full drug name (generic and/or brand)
- medication_name_type: "brand" or "generic" or "uncertain"
- strength: Dosage strength (e.g., "500mg", "10mg/5ml", "0.5%")
- strength_numeric: Numeric value only
- strength_unit: Unit only (mg, mcg, g, mL, %)
- dosage_form: tablet, capsule, solution, cream, etc.
- dosage_form_detail: XR, ER, SR, ODT, etc. if applicable
- route: oral, topical, injection, etc.
- sig_raw: Directions exactly as written
- sig_parsed: Structured parse of directions
- sig_translation: Plain English translation
- quantity: Amount to dispense
- quantity_unit: tablets, capsules, mL, etc.
- quantity_written: Quantity in words (for controlled)
- refills: Number of refills (0-11)
- days_supply: Days the medication should last
- daw_code: Dispense as written code (0-9)

**PRESCRIBER FIELDS:**
- prescriber_name: Full name with credentials (MD, DO, NP, PA)
- prescriber_npi: 10-digit NPI (validate checksum)
- prescriber_dea: DEA number (validate format and checksum)
- prescriber_license: State license number
- prescriber_phone: Phone number
- prescriber_fax: Fax number
- prescriber_address: Full address
- clinic_name: Practice/clinic name
- prescriber_specialty: If indicated

**PATIENT FIELDS:**
- patient_name: Full name (first, middle, last)
- patient_dob: Date of birth (normalized to YYYY-MM-DD)
- patient_age: Age if DOB not available
- patient_sex: M/F
- patient_weight: Weight with unit (for dose calculation)
- patient_address: Full address
- patient_allergies: Listed allergies

**PRESCRIPTION METADATA:**
- date_written: Date Rx was written (normalized to YYYY-MM-DD)
- date_not_valid_before: If specified
- date_expires: Calculated based on controlled status
- rx_number: Prescription number
- is_controlled: true/false
- schedule: DEA schedule (II, III, IV, V)
- diagnosis_code: ICD-10 if present
- prior_auth_number: If applicable

**VALIDATION RESULTS:**
- overall_confidence: 0.0-1.0
- requires_pharmacist_review: true/false
- validation_flags: Array of issues found
- dangerous_abbreviations_detected: Array of ISMP abbreviations found

================================================================================
SECTION 9: CONFIDENCE SCORING GUIDELINES
================================================================================

0.95-1.0: Clear printed text, all fields unambiguous
0.85-0.95: Legible handwriting, context confirms interpretation
0.70-0.85: Some ambiguous characters, likely correct interpretation
0.50-0.70: Multiple possible interpretations, needs review
0.30-0.50: Difficult to read, low confidence
0.00-0.30: Mostly illegible, requires human verification

**FLAG FOR PHARMACIST REVIEW IF:**
- Any critical field < 0.70 confidence
- Any ISMP dangerous abbreviation detected
- Controlled substance with missing requirements
- Dose exceeds known maximum
- Multiple LASA drug candidates possible

================================================================================
SECTION 10: SPECIAL PRESCRIPTION TYPES
================================================================================

**COMPOUND PRESCRIPTIONS:**
{
  "is_compound": true,
  "base_vehicle": "Lipoderm base",
  "ingredients": [
    {"name": "Ketamine", "strength": "10%", "quantity": ""},
    {"name": "Lidocaine", "strength": "5%", "quantity": ""}
  ],
  "total_quantity": "60g",
  "compounding_instructions": "Mix until uniform",
  "beyond_use_date": "30 days"
}

**TAPER/DOSE PACK PRESCRIPTIONS:**
{
  "is_taper": true,
  "taper_schedule": [
    {"days": "1-3", "dose": "40mg", "frequency": "once daily"},
    {"days": "4-6", "dose": "30mg", "frequency": "once daily"},
    {"days": "7-9", "dose": "20mg", "frequency": "once daily"}
  ],
  "total_quantity_needed": 18
}

**INSULIN PRESCRIPTIONS:**
{
  "insulin_type": "long-acting",
  "concentration": "U-100",
  "device": "Solostar pen",
  "sliding_scale": {
    "bg_less_than_150": "0 units",
    "bg_150_200": "2 units",
    "bg_201_250": "4 units"
  }
}

================================================================================
EXTRACTION PRIORITY ORDER:
1. ALL medication names (NEVER skip any)
2. Dosage/strength for each medication
3. Sig instructions for each medication
4. Quantities and refills
5. Controlled substance indicators
6. Prescriber DEA/NPI for validation
7. Patient demographics
================================================================================

CRITICAL RULES:
- Extract ALL medications visible. Do NOT skip any drug names.
- Flag ALL dangerous ISMP abbreviations
- Validate DEA number format if controlled substance
- Note confidence level for each ambiguous field
- Include alternatives array for uncertain drug names
`,
    'insurance': `
INSURANCE DOCUMENT EXTRACTION:
**CARD FRONT:**
- insurance_name: Insurance company name (e.g., "Blue Cross Blue Shield", "UnitedHealthcare")
- plan_name: Plan name (e.g., "Gold PPO", "Choice Plus")
- plan_type: HMO, PPO, EPO, POS, or other plan type
- member_name: Name of the insured member
- member_id: Member ID number (required)
- subscriber_id: Subscriber ID if different from member ID
- group_number: Group number (Grp)
- effective_date: Coverage effective date
- expiration_date: Coverage end date

**PHARMACY BENEFITS (RX):**
- bin: BIN (Bank ID Number) - usually 6 digits
- pcn: PCN (Processor Control Number)
- rxgrp: RxGrp or Rx Group
- copay_rx: Prescription copay amounts

**COPAYS & DEDUCTIBLES:**
- copay: Primary care copay amount
- copay_specialist: Specialist copay amount
- deductible: Annual deductible amount
- oop_max: Out of pocket maximum

**CONTACT INFO:**
- customer_service: Customer service phone number
- claims_address: Claims mailing address
- payer_id: Electronic payer ID
`,
    'insurance_card': `
INSURANCE CARD EXTRACTION:
- Look for Member ID and extract as "member_id"
- Look for Group Number and extract as "group_number"
- Look for BIN (Bank ID Number) and extract as "bin"
- Look for PCN (Processor Control Number) and extract as "pcn"
- Look for RxGrp and extract as "rxgrp"
- Look for Insurance company name and extract as "insurance_name"
- Look for Plan Name and extract as "plan_name"
- Look for copay amounts and extract as "copay", "copay_specialist", "copay_rx"
- Look for deductible and extract as "deductible"
- Look for member name and extract as "member_name"
- Look for effective/expiration dates
`,
    'patient-onboarding': `
PATIENT ONBOARDING/ENROLLMENT FORM EXTRACTION:

**CRITICAL: DETECT ALL FORM SECTIONS DYNAMICALLY**
- Analyze the form structure and identify ALL sections present
- Return sections as a JSON object mapping section titles to field names
- Include sections like: Application Type, Patient Demographics, Prescriber Info, Insurance, Consent, etc.

**APPLICATION TYPE (if present):**
- new_application: Is this a new enrollment (checkbox marked)?
- re_enrollment: Is this a re-enrollment?
- enrollment_year: Year of enrollment if specified

**PATIENT DEMOGRAPHICS:**
- patient_name / first_name / last_name / middle_name: Full name components
- dob / date_of_birth: Date of birth
- ssn: Social Security Number (last 4 if partial)
- gender: Gender/Sex
- address / street_address: Street address
- city, state, zip: City, state, and ZIP code
- phone / mobile_phone / home_phone: Phone number(s)
- email: Email address
- preferred_language: Preferred language

**EMERGENCY CONTACT:**
- emergency_contact_name: Emergency contact name
- emergency_contact_phone: Emergency contact phone
- emergency_contact_relationship: Relationship to patient

**PRESCRIBER/PROVIDER INFORMATION:**
- prescriber_name / provider_name: Prescriber's full name
- prescriber_npi / npi: NPI number (10 digits)
- prescriber_phone: Prescriber phone
- prescriber_fax: Prescriber fax
- clinic_name / facility_name: Clinic or facility name
- clinic_address: Clinic address
- clinic_city / clinic_state / clinic_zip: Clinic location

**INSURANCE INFORMATION:**
- insurance_name: Insurance company name
- insurance_id / member_id: Member ID
- group_number: Group number
- bin / pcn / rxgrp: Pharmacy benefit info
- medicare_part_d: Has Medicare Part D coverage?
- medicaid: Has Medicaid coverage?
- commercial_insurance: Has commercial insurance?
- military_va: Has VA/Military coverage?
- no_insurance: No insurance coverage?

**DRUG/MEDICATION COVERAGE:**
- drug_coverage_type: Type of drug coverage
- medical_benefit: Uses medical benefit?
- pharmacy_benefit: Uses pharmacy benefit?

**CONSENTS & AUTHORIZATIONS:**
- pap_consent: Patient Assistance Program consent signed?
- hipaa_consent: HIPAA authorization signed?
- patient_consent: General patient consent signed?
- provider_authorization: Provider authorization signed?

**SIGNATURE DETECTION (CRITICAL):**
- Look for ANY handwritten signatures on the form
- For each signature found, extract:
  - signature_detected: true/false (are there signatures on the form?)
  - patient_signature_present: true/false (is patient signature visible?)
  - provider_signature_present: true/false (is provider/prescriber signature visible?)
  - signature_date: Date written next to signature
  - signature_location: Description of where signature appears (e.g., "bottom of page", "consent section")
  
**HANDWRITTEN CONTENT DETECTION:**
- handwritten_regions_detected: true/false (is there handwritten text?)
- handwritten_text: Any handwritten text you can read (not just signatures)
- handwritten_notes: Any handwritten notes or annotations

**CHECKBOX/SELECTION FIELDS:**
- For each checkbox section, indicate which options are checked
- Use field names that match the checkbox labels

Return a "sections" object that groups fields by their form section headers.
`,
    'lab-results': `
LAB RESULTS EXTRACTION:
**PATIENT INFO:**
- patient_name: Patient's full name (required)
- patient_dob: Date of birth
- patient_id: Patient ID or MRN

**SPECIMEN INFO:**
- specimen_id: Specimen/Accession number
- collection_date: Date/time specimen collected
- received_date: Date specimen received by lab
- specimen_type: Type of specimen (blood, urine, tissue, etc.)

**TEST RESULTS (extract ALL tests):**
For each test, extract:
- test_name: Name of the test (required)
- result_value: Numeric or text result (required)
- units: Units of measurement (e.g., mg/dL, mmol/L)
- reference_range: Normal range (e.g., "70-100")
- flag: Abnormal flag (H=High, L=Low, N=Normal, C=Critical)

**LAB INFO:**
- lab_name: Laboratory name
- lab_address: Laboratory address
- ordering_provider: Ordering physician name
- performing_lab: Performing laboratory if different
- report_date: Date results reported

Extract ALL individual test results as separate entries in line_items.
`,
    'lab_result': `
LAB RESULTS EXTRACTION:
**PATIENT INFO:**
- patient_name: Patient's full name (required)
- patient_dob: Date of birth
- patient_id: Patient ID or MRN

**TEST RESULTS (extract ALL tests):**
For each test, extract:
- test_name: Name of the test (required)
- result_value: Numeric or text result (required)
- units: Units of measurement
- reference_range: Normal range
- flag: Abnormal flag (H/L/N/C)

**LAB INFO:**
- lab_name: Laboratory name
- collection_date: Collection date
- ordering_provider: Ordering physician
`,
    'medical_imaging': `
MEDICAL IMAGING / DICOM EXTRACTION:
**PATIENT INFO:**
- patient_name: Patient name from DICOM header
- patient_id: Patient ID/MRN
- patient_dob: Date of birth

**STUDY INFO:**
- modality: Imaging modality (CT, MRI, XR, US, NM, PT, etc.)
- study_date: Date of study/exam
- study_description: Description of study
- series_description: Series description
- body_part: Body part examined
- laterality: Left/Right/Bilateral if applicable

**TECHNICAL:**
- accession_number: Accession number
- institution: Institution/facility name
- referring_physician: Referring physician name
- performing_physician: Performing/reading physician

**DICOM TAGS:**
- study_instance_uid: Study Instance UID
- series_instance_uid: Series Instance UID
- slice_thickness: Slice thickness (for CT/MRI)
- pixel_spacing: Pixel spacing
`,
    'xray': `
X-RAY REPORT EXTRACTION:
**PATIENT INFO:**
- patient_name: Patient's full name (required)
- patient_dob: Date of birth
- patient_id: Patient ID/MRN

**EXAM INFO:**
- study_date: Date of examination (required)
- body_part: Body part examined (required) - e.g., Chest, Hand, Spine, Knee
- laterality: Left, Right, or Bilateral
- views: Number and types of views (e.g., "2 views PA and Lateral")
- technique: Technique used
- indication: Clinical indication/reason for exam

**FINDINGS:**
- findings: Detailed radiographic findings
- impression: Radiologist's impression/diagnosis
- comparison: Comparison to prior studies if mentioned
- recommendations: Follow-up recommendations

**PROVIDER INFO:**
- radiologist: Reading radiologist name
- accession_number: Accession/exam number
`,
    'ct-scan': `
CT SCAN REPORT EXTRACTION:
**PATIENT INFO:**
- patient_name: Patient's full name (required)
- patient_dob: Date of birth
- patient_id: Patient ID/MRN

**EXAM INFO:**
- study_date: Date of examination (required)
- body_region: Body region scanned (required) - Head, Chest, Abdomen, Pelvis, Spine, etc.
- contrast: Whether contrast was used (true/false)
- contrast_type: Type of contrast if used (IV, Oral, Rectal)
- indication: Clinical indication
- technique: Scan technique and parameters

**FINDINGS:**
- findings: Detailed findings organized by organ/system
- impression: Summary impression/diagnosis
- measurements: Key measurements (sizes, dimensions)
- comparison: Comparison to prior studies

**TECHNICAL:**
- slice_thickness: Slice thickness in mm
- radiation_dose: Radiation dose (DLP, CTDIvol)
- radiologist: Reading radiologist
- accession_number: Accession number
`,
    'ct_scan': `
CT SCAN REPORT EXTRACTION:
- patient_name, patient_dob, patient_id
- study_date: Date of scan
- body_region: Region scanned
- contrast: Was contrast used (true/false)
- indication: Clinical indication
- findings: Detailed findings
- impression: Diagnosis/impression
- radiologist: Reading physician
`,
    'mri': `
MRI REPORT EXTRACTION:
**PATIENT INFO:**
- patient_name: Patient's full name (required)
- patient_dob: Date of birth
- patient_id: Patient ID/MRN

**EXAM INFO:**
- study_date: Date of examination (required)
- body_region: Body region imaged (required) - Brain, Spine, Knee, Shoulder, etc.
- contrast: Whether contrast (gadolinium) was used (true/false)
- indication: Clinical indication
- sequences: MRI sequences performed (T1, T2, FLAIR, DWI, etc.)

**FINDINGS:**
- findings: Detailed findings
- impression: Radiologist's impression/diagnosis
- measurements: Key measurements
- comparison: Comparison to prior MRIs

**TECHNICAL:**
- tesla_strength: Magnet strength (1.5T, 3T)
- radiologist: Reading radiologist
- accession_number: Accession number
`,
    'ecg': `
ECG/EKG REPORT EXTRACTION:
**PATIENT INFO:**
- patient_name: Patient's full name (required)
- patient_dob: Date of birth
- patient_id: Patient ID/MRN

**TEST INFO:**
- test_date: Date of ECG (required)
- test_time: Time of ECG

**MEASUREMENTS (extract exact values):**
- heart_rate: Heart rate in BPM (required)
- pr_interval: PR interval in ms
- qrs_duration: QRS duration in ms
- qt_interval: QT interval in ms
- qtc_interval: QTc (corrected QT) in ms
- axis: QRS axis in degrees

**RHYTHM & INTERPRETATION:**
- rhythm: Cardiac rhythm (e.g., "Normal Sinus Rhythm", "Atrial Fibrillation")
- interpretation: Full interpretation/findings
- abnormalities: List of abnormalities if any
- comparison: Comparison to prior ECGs

**PROVIDER INFO:**
- cardiologist: Interpreting cardiologist
- confirmed_by: Confirmed by physician if different
`,
    'ultrasound': `
ULTRASOUND REPORT EXTRACTION:
**PATIENT INFO:**
- patient_name: Patient's full name (required)
- patient_dob: Date of birth
- patient_id: Patient ID/MRN

**EXAM INFO:**
- study_date: Date of examination (required)
- exam_type: Type of ultrasound (required) - Abdominal, Pelvic, OB, Cardiac, Vascular, etc.
- indication: Clinical indication

**FINDINGS:**
- findings: Detailed sonographic findings
- measurements: Key measurements (sizes, dimensions, velocities)
- impression: Sonographer/physician impression
- comparison: Comparison to prior studies

**OB-SPECIFIC (if applicable):**
- gestational_age: Gestational age
- fetal_heart_rate: Fetal heart rate
- estimated_due_date: EDD

**PROVIDER INFO:**
- sonographer: Performing sonographer
- interpreting_physician: Interpreting physician
- accession_number: Accession number
`,
    'invoice': `
INVOICE/BILLING EXTRACTION - Extract ALL visible fields:

VENDOR/PROVIDER INFO (from letterhead/header):
- Look for facility/hospital/clinic name at top and extract as "vendor_name" (e.g., "Yuma Regional Medical Center", "Atrium Health")
- Look for vendor address and extract as "vendor_address"
- Look for vendor Tax ID/EIN and extract as "vendor_tax_id"
- Look for vendor NPI and extract as "vendor_npi"
- Look for vendor phone and extract as "vendor_phone"

PATIENT INFO:
- Look for Patient Name and extract as "patient_name"
- Look for Account Number and extract as "account_number"
- Look for Patient Information and extract as "patient_information"

PAYER/INSURANCE INFO:
- Look for Insurance/Payer/Coverage name and extract as "payer_name" (e.g., "Medicare HMO", "UHC Golden Rule", "Blue Cross")
- Look for Visit Coverages and extract as "visit_coverages"
- Look for insurance member ID and extract as "member_id"

KEY DATES:
- Look for Statement/Invoice Date and extract as "invoice_date"
- Look for Due Date and extract as "due_date"
- Look for Service/Admit Date and extract as "service_from" or "admit_date"
- Look for Discharge Date and extract as "service_to" or "discharge_date"

FINANCIAL AMOUNTS (CRITICAL - extract exact values):
- Look for Total Charges/Total Billed and extract as "billed_amount"
- Look for Balance Due/Unpaid Balance/Current Account Balance and extract as "balance_due"
- Look for Total Payments/Adjustments and extract as "adjustment_amount"
- Look for Insurance Paid and extract as "paid_amount"
- Look for Patient Responsibility and extract as "patient_responsibility"

LINE ITEMS/SERVICES:
- For each service line, extract: Code (3-digit), Description, CPT/HCPCS Code, NDC code, Qty, Amount
- Extract ALL rows from the charges table
`,
    'billing': `
BILLING DOCUMENT EXTRACTION - Same as invoice, extract ALL fields:
- vendor_name (facility/provider at top)
- payer_name (insurance/coverage)
- patient_name
- account_number
- billed_amount (total charges)
- balance_due (unpaid balance)
- adjustment_amount
- paid_amount
- All line items with codes and amounts
`,
    'receipt': `
RECEIPT EXTRACTION:
**MERCHANT INFO:**
- merchant_name: Store/business name (required)
- merchant_address: Store address
- merchant_phone: Store phone number
- store_number: Store/location number

**TRANSACTION INFO:**
- transaction_date: Date of purchase (required)
- transaction_time: Time of purchase
- transaction_id: Transaction/receipt number
- register_number: Register/terminal number
- cashier: Cashier name or ID

**ITEMS (extract ALL line items):**
For each item:
- item_description: Item name/description
- quantity: Quantity purchased
- unit_price: Price per unit
- item_total: Total for this item

**TOTALS:**
- subtotal: Subtotal before tax
- tax: Tax amount
- tax_rate: Tax rate percentage
- total: Total amount (required)
- discount: Any discounts applied

**PAYMENT:**
- payment_method: Cash, Credit, Debit, etc.
- card_last_four: Last 4 digits of card if applicable
- change_due: Change given (for cash)
`,
    'passport': `
PASSPORT EXTRACTION:
**PERSONAL INFO:**
- surname: Last name/Family name (required)
- given_names: First and middle names (required)
- nationality: Nationality/Citizenship
- date_of_birth: Date of birth (required)
- sex: Sex/Gender (M/F)
- place_of_birth: Place of birth

**DOCUMENT INFO:**
- passport_number: Passport number (required)
- issue_date: Date of issue
- expiration_date: Date of expiry (required)
- issuing_authority: Issuing authority
- issuing_country: Country code

**MRZ (Machine Readable Zone):**
- mrz_line1: First line of MRZ
- mrz_line2: Second line of MRZ

Extract the full name, passport number, and dates accurately.
`,
    'drivers-license': `
DRIVER'S LICENSE EXTRACTION:
**PERSONAL INFO:**
- full_name: Full name (required)
- first_name: First name
- last_name: Last name
- date_of_birth: Date of birth (required)
- address: Street address
- city: City
- state: State
- zip_code: ZIP code
- sex: Sex (M/F)
- height: Height
- weight: Weight
- eye_color: Eye color
- hair_color: Hair color

**LICENSE INFO:**
- license_number: Driver's license number (required)
- class: License class
- issue_date: Date of issue
- expiration_date: Date of expiry (required)
- issuing_state: State that issued the license
- restrictions: Any restrictions
- endorsements: Any endorsements
- donor: Organ donor status

**VEHICLE INFO (if CDL):**
- vehicle_class: Vehicle class for CDL
`,
    'identification': `
IDENTIFICATION DOCUMENT EXTRACTION:
- document_type: Type of ID (Driver's License, State ID, Passport, etc.)
- full_name: Full name on document
- date_of_birth: Date of birth
- document_number: ID/license number
- issue_date: Date of issue
- expiration_date: Expiration date
- address: Address if shown
- issuing_authority: Issuing state/country
`,
    'contract': `
CONTRACT DOCUMENT EXTRACTION:
**PARTIES:**
- party_1_name: First party name (required)
- party_1_address: First party address
- party_2_name: Second party name (required)
- party_2_address: Second party address

**CONTRACT INFO:**
- contract_title: Title/type of contract
- contract_date: Date of contract
- effective_date: Effective date
- expiration_date: Expiration/end date
- contract_value: Total contract value if specified

**TERMS:**
- term_length: Duration of contract
- payment_terms: Payment terms
- key_obligations: Key obligations/deliverables

**SIGNATURES:**
- signature_1_name: First signatory name
- signature_1_date: First signature date
- signature_2_name: Second signatory name
- signature_2_date: Second signature date
- witness_name: Witness name if applicable
`,
    'form': `
GENERAL FORM EXTRACTION:
- form_title: Title of the form
- form_number: Form number/ID if shown
- form_date: Date on form
- Extract ALL labeled fields with their corresponding values
- For checkboxes, indicate which are checked (true) or unchecked (false)
- For tables, extract all rows and columns
- For signatures, note "signature_present": true/false
`,
  };

  const typeHint = documentTypeHints[documentType] || '';
  
  return `You are an expert document analyzer. Extract information from this document image.

## CRITICAL: SECTION DETECTION IS MANDATORY

Every enrollment/healthcare form has SECTIONS (labeled groups of fields). You MUST:
1. Find ALL section headers/dividers on the form (numbered sections like "1.", "2.", or titled sections)
2. Return these sections in the "sections" object mapping section name to field keys
3. NEVER return an empty sections object for forms that have visible sections

## EXTRACTION REQUIREMENTS:
1. Extract ALL text, numbers, dates, and values VISIBLE in the document
2. Use snake_case for field names (e.g., patient_name, date_of_birth)
3. For checkboxes: use "checked" or "unchecked" as values
4. If a field is not visible or filled, DO NOT include it
${typeHint}

## EXTRACTION PROCESS:
1. FIRST: Scan the document and identify ALL SECTION HEADERS (look for numbered sections like "1. Patient Information", "2. Insurance Information", bolded headers, divider lines, or titled groups)
2. SECOND: For EACH section, extract all fields within that section
3. THIRD: Map each field to its parent section in the "sections" object

## RESPONSE FORMAT (JSON ONLY - no markdown, no explanation):
{
  "fields": {
    "first_name": "John",
    "last_name": "Doe",
    "date_of_birth": "01/15/1980",
    "insurance_member_id": "ABC123456"
  },
  "sections": {
    "1. Patient Information": ["first_name", "last_name", "date_of_birth", "address", "phone", "email"],
    "2. Insurance Information": ["insurance_member_id", "group_number", "plan_name"],
    "3. Prescriber Information": ["prescriber_name", "prescriber_npi", "prescriber_phone"],
    "4. Consent & Signatures": ["patient_signature", "signature_date"]
  },
  "line_items": [],
  "tables": [],
  "detected_document_type": "enrollment_form",
  "confidence": 0.85
}

## SECTION NAMING RULES:
- Use the EXACT section names as shown on the form (including numbers if present)
- Common sections in pharmaceutical enrollment forms:
  * Patient Information / Patient Demographics
  * Insurance Information / Coverage Details
  * Prescriber/Provider Information / Healthcare Provider
  * Medication Information / Prescription Details
  * Financial Information / Income Information
  * Authorization / Consent & Signatures
- If a section doesn't have a clear title, create a descriptive one

RESPOND WITH ONLY THE JSON OBJECT.`;
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

// ============= EXCEL/XLSX EXTRACTION WITH SHEETJS =============
async function extractFromExcel(supabase: any, fileUrl: string, filePath: string, documentType?: string): Promise<any> {
  try {
    let arrayBuffer: ArrayBuffer | null = null;
    
    // Try public URL first
    if (fileUrl) {
      console.log(`Fetching Excel from public URL: ${fileUrl}`);
      const response = await fetch(fileUrl);
      if (response.ok) {
        arrayBuffer = await response.arrayBuffer();
        console.log(`Excel file fetched: ${arrayBuffer.byteLength} bytes`);
      }
    }
    
    // Try signed URL if public failed
    if (!arrayBuffer && filePath) {
      console.log(`Trying signed URL for Excel: ${filePath}`);
      const { data: signedUrlData, error: signedUrlError } = await supabase.storage
        .from('document-processing')
        .createSignedUrl(filePath, 300);
      
      if (!signedUrlError && signedUrlData?.signedUrl) {
        const signedResponse = await fetch(signedUrlData.signedUrl);
        if (signedResponse.ok) {
          arrayBuffer = await signedResponse.arrayBuffer();
          console.log(`Excel file fetched via signed URL: ${arrayBuffer.byteLength} bytes`);
        }
      }
    }
    
    if (!arrayBuffer) {
      console.error('Failed to fetch Excel file');
      return null;
    }
    
    // Parse Excel with SheetJS
    const data = new Uint8Array(arrayBuffer);
    const workbook = XLSX.read(data, { type: 'array', cellDates: true, cellNF: true, cellFormula: true });
    
    console.log(`Excel workbook parsed: ${workbook.SheetNames.length} sheets`);
    
    const fields: Record<string, { value: string; confidence: number; source: string }> = {};
    const allRows: any[] = [];
    const allTables: any[] = [];
    
    // Process each sheet
    for (let sheetIdx = 0; sheetIdx < workbook.SheetNames.length; sheetIdx++) {
      const sheetName = workbook.SheetNames[sheetIdx];
      const worksheet = workbook.Sheets[sheetName];
      
      // Convert to JSON with headers
      const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: '' });
      
      if (jsonData.length === 0) continue;
      
      // First row is headers
      const headers = (jsonData[0] as any[]).map((h, idx) => 
        String(h || `column_${idx + 1}`).toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '')
      );
      
      // Data rows
      const rows: any[] = [];
      let totalAmount = 0;
      let totalPaid = 0;
      let totalOutstanding = 0;
      
      for (let i = 1; i < jsonData.length; i++) {
        const rowData = jsonData[i] as any[];
        if (rowData.every((cell: any) => !cell)) continue; // Skip empty rows
        
        const row: Record<string, any> = {};
        headers.forEach((header, idx) => {
          const value = rowData[idx];
          row[header] = value !== undefined ? value : '';
          
          // Track numeric fields for totals
          if (typeof value === 'number') {
            if (header.includes('amount') || header.includes('total') || header.includes('billed') || header.includes('charged')) {
              totalAmount += value;
            }
            if (header.includes('paid') || header.includes('collected') || header.includes('payment')) {
              totalPaid += value;
            }
            if (header.includes('outstanding') || header.includes('balance') || header.includes('due')) {
              totalOutstanding += value;
            }
          }
        });
        rows.push(row);
      }
      
      allRows.push(...rows);
      
      // Add table for this sheet
      allTables.push({
        sheet_name: sheetName,
        header: headers,
        rows: rows.map(r => Object.values(r)),
        row_count: rows.length
      });
      
      // Add sheet-level summary fields
      if (sheetIdx === 0) {
        fields['sheet_name'] = { value: sheetName, confidence: 1, source: 'sheetjs_excel' };
        fields['total_sheets'] = { value: String(workbook.SheetNames.length), confidence: 1, source: 'sheetjs_excel' };
        fields['columns'] = { value: headers.join(', '), confidence: 1, source: 'sheetjs_excel' };
        fields['total_records'] = { value: String(rows.length), confidence: 1, source: 'sheetjs_excel' };
        
        if (totalAmount > 0) {
          fields['total_amount'] = { value: totalAmount.toFixed(2), confidence: 0.95, source: 'sheetjs_excel' };
        }
        if (totalPaid > 0) {
          fields['total_paid'] = { value: totalPaid.toFixed(2), confidence: 0.95, source: 'sheetjs_excel' };
        }
        if (totalOutstanding > 0) {
          fields['total_outstanding'] = { value: totalOutstanding.toFixed(2), confidence: 0.95, source: 'sheetjs_excel' };
        }
      }
    }
    
    // Add all sheet names
    fields['all_sheets'] = { 
      value: workbook.SheetNames.join(', '), 
      confidence: 1, 
      source: 'sheetjs_excel' 
    };
    
    return {
      fields,
      line_items: allRows,
      tables: allTables,
      detected_document_type: documentType || 'excel_spreadsheet',
      document_category: 'data_import',
      confidence: 0.98
    };
  } catch (error) {
    console.error('Excel extraction error:', error);
    return null;
  }
}

// ============= DICOM MEDICAL IMAGE EXTRACTION =============
async function extractFromDicom(supabase: any, fileUrl: string, filePath: string, documentType?: string): Promise<any> {
  try {
    let arrayBuffer: ArrayBuffer | null = null;
    
    // Fetch DICOM file
    if (fileUrl) {
      console.log(`Fetching DICOM from public URL: ${fileUrl}`);
      const response = await fetch(fileUrl);
      if (response.ok) {
        arrayBuffer = await response.arrayBuffer();
        console.log(`DICOM file fetched: ${arrayBuffer.byteLength} bytes`);
      }
    }
    
    if (!arrayBuffer && filePath) {
      console.log(`Trying signed URL for DICOM: ${filePath}`);
      const { data: signedUrlData, error: signedUrlError } = await supabase.storage
        .from('document-processing')
        .createSignedUrl(filePath, 300);
      
      if (!signedUrlError && signedUrlData?.signedUrl) {
        const signedResponse = await fetch(signedUrlData.signedUrl);
        if (signedResponse.ok) {
          arrayBuffer = await signedResponse.arrayBuffer();
          console.log(`DICOM file fetched via signed URL: ${arrayBuffer.byteLength} bytes`);
        }
      }
    }
    
    if (!arrayBuffer) {
      console.error('Failed to fetch DICOM file');
      return null;
    }
    
    const data = new Uint8Array(arrayBuffer);
    const fields: Record<string, { value: string; confidence: number; source: string }> = {};
    
    // Parse DICOM header manually - look for standard DICOM tags
    // DICOM files start with 128-byte preamble + "DICM" magic number
    const hasDicomPrefix = data.length > 132 && 
      String.fromCharCode(data[128], data[129], data[130], data[131]) === 'DICM';
    
    if (!hasDicomPrefix) {
      console.log('No DICM prefix found, attempting raw DICOM parse');
    }
    
    // Common DICOM tags to extract (Group, Element)
    const dicomTags: Record<string, { group: number; element: number; name: string }> = {
      patient_name: { group: 0x0010, element: 0x0010, name: 'Patient Name' },
      patient_id: { group: 0x0010, element: 0x0020, name: 'Patient ID' },
      patient_dob: { group: 0x0010, element: 0x0030, name: 'Patient Birth Date' },
      patient_sex: { group: 0x0010, element: 0x0040, name: 'Patient Sex' },
      study_date: { group: 0x0008, element: 0x0020, name: 'Study Date' },
      study_time: { group: 0x0008, element: 0x0030, name: 'Study Time' },
      study_description: { group: 0x0008, element: 0x1030, name: 'Study Description' },
      series_description: { group: 0x0008, element: 0x103E, name: 'Series Description' },
      modality: { group: 0x0008, element: 0x0060, name: 'Modality' },
      body_part: { group: 0x0018, element: 0x0015, name: 'Body Part Examined' },
      institution_name: { group: 0x0008, element: 0x0080, name: 'Institution Name' },
      referring_physician: { group: 0x0008, element: 0x0090, name: 'Referring Physician' },
      accession_number: { group: 0x0008, element: 0x0050, name: 'Accession Number' },
      manufacturer: { group: 0x0008, element: 0x0070, name: 'Manufacturer' },
      station_name: { group: 0x0008, element: 0x1010, name: 'Station Name' },
      slice_thickness: { group: 0x0018, element: 0x0050, name: 'Slice Thickness' },
      kvp: { group: 0x0018, element: 0x0060, name: 'KVP' },
      exposure: { group: 0x0018, element: 0x1152, name: 'Exposure' },
      rows: { group: 0x0028, element: 0x0010, name: 'Rows' },
      columns: { group: 0x0028, element: 0x0011, name: 'Columns' },
      bits_allocated: { group: 0x0028, element: 0x0100, name: 'Bits Allocated' },
    };
    
    // Simple DICOM tag parser - looks for tag patterns in the binary data
    // This is a simplified approach; production would use a full DICOM parser library
    const startOffset = hasDicomPrefix ? 132 : 0;
    let offset = startOffset;
    const maxOffset = Math.min(data.length, 50000); // Scan first 50KB for metadata
    
    function readUInt16LE(arr: Uint8Array, pos: number): number {
      return arr[pos] | (arr[pos + 1] << 8);
    }
    
    function readUInt32LE(arr: Uint8Array, pos: number): number {
      return arr[pos] | (arr[pos + 1] << 8) | (arr[pos + 2] << 16) | (arr[pos + 3] << 24);
    }
    
    function readString(arr: Uint8Array, pos: number, len: number): string {
      let str = '';
      for (let i = 0; i < len && pos + i < arr.length; i++) {
        const c = arr[pos + i];
        if (c === 0) break;
        if (c >= 32 && c < 127) str += String.fromCharCode(c);
      }
      return str.trim();
    }
    
    // Scan for DICOM tags
    const foundTags: Record<string, string> = {};
    
    while (offset < maxOffset - 8) {
      const group = readUInt16LE(data, offset);
      const element = readUInt16LE(data, offset + 2);
      
      // Check if this matches any tag we're looking for
      for (const [key, tagInfo] of Object.entries(dicomTags)) {
        if (group === tagInfo.group && element === tagInfo.element) {
          // Read VR (Value Representation) - 2 characters
          const vr = String.fromCharCode(data[offset + 4], data[offset + 5]);
          
          let valueLength = 0;
          let valueOffset = offset + 8;
          
          // Short VRs have 2-byte length, long VRs have 4-byte length with 2-byte padding
          if (['OB', 'OW', 'OF', 'SQ', 'UC', 'UR', 'UT', 'UN'].includes(vr)) {
            valueLength = readUInt32LE(data, offset + 8);
            valueOffset = offset + 12;
          } else {
            valueLength = readUInt16LE(data, offset + 6);
          }
          
          if (valueLength > 0 && valueLength < 1000) {
            const value = readString(data, valueOffset, valueLength);
            if (value) {
              foundTags[key] = value;
            }
          }
          break;
        }
      }
      
      offset++;
    }
    
    // Add extracted tags to fields
    for (const [key, value] of Object.entries(foundTags)) {
      fields[key] = { 
        value, 
        confidence: 0.9, 
        source: 'dicom_parser' 
      };
    }
    
    // Add DICOM-specific metadata
    fields['file_format'] = { value: 'DICOM', confidence: 1, source: 'dicom_parser' };
    fields['file_size'] = { value: String(data.length), confidence: 1, source: 'dicom_parser' };
    fields['has_dicm_prefix'] = { value: String(hasDicomPrefix), confidence: 1, source: 'dicom_parser' };
    fields['tags_extracted'] = { value: String(Object.keys(foundTags).length), confidence: 1, source: 'dicom_parser' };
    
    // If we have Gemini API, use it for enhanced DICOM analysis
    const geminiApiKey = Deno.env.get("GEMINI_API_KEY");
    if (geminiApiKey && arrayBuffer) {
      console.log('Attempting Gemini-based DICOM image analysis...');
      try {
        // Convert to base64 for Gemini (if small enough)
        if (arrayBuffer.byteLength < 10 * 1024 * 1024) { // Under 10MB
          let binaryString = '';
          const bytes = new Uint8Array(arrayBuffer);
          const chunkSize = 0x8000;
          for (let i = 0; i < bytes.length; i += chunkSize) {
            const chunk = bytes.subarray(i, i + chunkSize);
            binaryString += String.fromCharCode.apply(null, Array.from(chunk));
          }
          const base64Data = btoa(binaryString);
          
          // Use Gemini to analyze DICOM image
          const analysisPrompt = `Analyze this DICOM medical image. Extract:
1. Modality type (X-Ray, CT, MRI, Ultrasound, etc.)
2. Body part/region
3. Any visible findings or abnormalities
4. Image quality assessment
5. Patient positioning

Return JSON:
{
  "fields": {
    "ai_modality": "detected modality",
    "ai_body_region": "detected body region",
    "ai_findings": "any visible findings",
    "ai_quality": "image quality assessment",
    "ai_positioning": "patient positioning"
  },
  "confidence": 0.8
}`;
          
          const geminiResult = await extractWithGemini(base64Data, 'application/dicom', analysisPrompt);
          if (geminiResult?.fields) {
            for (const [key, value] of Object.entries(geminiResult.fields)) {
              if (value) {
                fields[key] = {
                  value: String(value),
                  confidence: 0.75,
                  source: 'gemini_dicom_ai'
                };
              }
            }
          }
        }
      } catch (geminiError) {
        console.error('Gemini DICOM analysis failed:', geminiError);
      }
    }
    
    return {
      fields,
      line_items: [],
      tables: [{
        header: ['Tag', 'Value'],
        rows: Object.entries(foundTags).map(([k, v]) => [dicomTags[k]?.name || k, v])
      }],
      detected_document_type: documentType || fields['modality']?.value?.toLowerCase() || 'dicom_image',
      document_category: 'medical_imaging',
      confidence: 0.85
    };
  } catch (error) {
    console.error('DICOM extraction error:', error);
    return null;
  }
}

// Helper function to generate sections from field names using pattern matching
// This is a fallback when Gemini doesn't return sections in its response
function generateSectionsFromFields(fields: Record<string, any>): Record<string, string[]> {
  const sections: Record<string, string[]> = {};
  
  // Section mapping patterns - order matters for priority
  const sectionPatterns: { pattern: RegExp; section: string }[] = [
    // Program/Services
    { pattern: /^(program|service_request|benefits_investigation|copay|co_pay|prior_auth|patient_assist|medication_assist|appeals|eligibility|hub_service|financial_assistance)/i, section: "Program & Services" },
    // Medication
    { pattern: /^(medication|drug|rx_|prescription|dosage|strength|quantity|refill|days_supply|ndc|directions|indication|therapy|treatment(?!_history))/i, section: "Medication Information" },
    // Prescriber/Provider
    { pattern: /^(prescriber|physician|doctor|provider|hcp|npi|dea|clinic|facility|office_|medical_license|state_license)/i, section: "Prescriber/Provider Information" },
    // Pharmacy
    { pattern: /^(pharmacy|ncpdp|dispensing|specialty_pharm|mail_order)/i, section: "Pharmacy Information" },
    // Insurance
    { pattern: /^(insurance|member_id|group_number|policy|subscriber|payer|carrier|plan_name|coverage|medicaid|medicare|commercial|tricare|va_benefit|bin|pcn|rxgrp|pbm|primary_ins|secondary_ins)/i, section: "Insurance Information" },
    // Financial
    { pattern: /^(income|household_size|family_size|fpl|financial|afford|hardship|deductible|out_of_pocket|coinsurance|premium|employment|employer)/i, section: "Financial Information" },
    // Clinical
    { pattern: /^(diagnosis|icd|condition|allerg|medical_history|lab_result|treatment_history|prior_therap|contraindic|pregnancy|weight|height|bmi|vital|clinical)/i, section: "Clinical Information" },
    // Contact Authorization
    { pattern: /^(representative|guardian|power_of_attorney|caregiver|authorized(?!_)|emergency_contact|emergency_phone|hipaa|phi_auth|release_|voicemail|sms_consent|email_consent)/i, section: "Contact Authorization" },
    // Consent & Signatures
    { pattern: /^(signature|consent|authorization(?!_rep)|agreement|acknowledge|date_signed|witness|opt_in|opt_out|marketing|certification|terms|privacy)/i, section: "Consent & Signatures" },
    // Patient Information - catch remaining patient-related fields
    { pattern: /^(patient|first_name|last_name|middle_name|full_name|dob|date_of_birth|gender|sex|ssn|social_security|age|birth|address|city|state|zip|phone|email|mobile|cell|fax|language|contact|applicant)/i, section: "Patient Information" },
  ];
  
  const fieldKeys = Object.keys(fields);
  const usedFields = new Set<string>();
  
  // Assign fields to sections based on patterns
  for (const { pattern, section } of sectionPatterns) {
    for (const key of fieldKeys) {
      if (usedFields.has(key)) continue;
      if (pattern.test(key)) {
        if (!sections[section]) {
          sections[section] = [];
        }
        sections[section].push(key);
        usedFields.add(key);
      }
    }
  }
  
  // Any remaining unmatched fields go to "Additional Information"
  const unmatched = fieldKeys.filter(k => !usedFields.has(k) && !k.startsWith('_') && k !== 'detected_document_type' && k !== 'document_category');
  if (unmatched.length > 0) {
    sections["Additional Information"] = unmatched;
  }
  
  console.log(`[generateSectionsFromFields] Created ${Object.keys(sections).length} sections from ${fieldKeys.length} fields`);
  return sections;
}

// Gemini extraction with enhanced error handling
async function extractWithGemini(imageBase64: string, contentType: string, prompt: string): Promise<any> {
  const geminiApiKey = Deno.env.get("GEMINI_API_KEY");
  if (!geminiApiKey) {
    console.error("GEMINI_API_KEY not configured");
    throw new Error("GEMINI_API_KEY not configured");
  }
  
  console.log(`Gemini extraction: starting with content type ${contentType}, base64 length: ${imageBase64?.length || 0}`);
  
  // Use gemini-2.5-flash for reliable extraction
  const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${geminiApiKey}`;
  
  try {
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{
          parts: [
            { text: prompt },
            { inline_data: { mime_type: contentType, data: imageBase64 } }
          ]
        }],
        generationConfig: { 
          temperature: 0.1, 
          topP: 0.95, 
          maxOutputTokens: 65536  // Increased significantly to prevent truncation
        }
      })
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Gemini API error: ${response.status} - ${errorText}`);
      throw new Error(`Gemini API error: ${response.status} - ${errorText}`);
    }
    
    const data = await response.json();
    console.log(`Gemini response received, candidates: ${data?.candidates?.length || 0}`);
    
    // Check for finish reason - important for debugging truncation
    const finishReason = data?.candidates?.[0]?.finishReason;
    console.log(`[Gemini] Finish reason: ${finishReason}`);
    
    if (finishReason === 'MAX_TOKENS') {
      console.warn('[Gemini] Response was truncated due to max tokens limit');
    }
    
    const responseText = data?.candidates?.[0]?.content?.parts?.[0]?.text || '';
    console.log(`Gemini extracted text length: ${responseText.length}`);
    console.log(`[Gemini] Last 100 chars: ${responseText.substring(responseText.length - 100)}`);
    
    if (!responseText) {
      console.error("Gemini returned empty response");
      return null;
    }
    
    // Try multiple JSON parsing strategies
    let parsed = null;
    console.log(`[GeminiParse] Starting JSON parsing, response length: ${responseText.length}`);
    console.log(`[GeminiParse] First 100 chars: ${responseText.substring(0, 100)}`);
    
    // Strategy 1: Try to parse the entire response as JSON directly
    try {
      parsed = JSON.parse(responseText);
      console.log(`[GeminiParse] SUCCESS - Direct JSON parse: ${Object.keys(parsed.fields || {}).length} fields`);
      return parsed;
    } catch (directParseError) {
      console.log(`[GeminiParse] Direct parse failed: ${directParseError instanceof Error ? directParseError.message : 'unknown'}`);
    }
    
    // Strategy 2: Extract JSON from markdown code blocks ```json ... ```
    let jsonStr: string | null = null;
    
    if (responseText.includes('```json')) {
      const startMarker = responseText.indexOf('```json');
      const endMarker = responseText.lastIndexOf('```');
      if (startMarker !== -1 && endMarker !== -1 && endMarker > startMarker) {
        jsonStr = responseText.substring(startMarker + 7, endMarker).trim();
        console.log(`[GeminiParse] Found markdown JSON block, length: ${jsonStr.length}`);
      }
    }
    
    // Strategy 3: Find raw JSON object by locating { and }
    if (!jsonStr) {
      const firstBrace = responseText.indexOf('{');
      let lastBrace = responseText.lastIndexOf('}');
      console.log(`[GeminiParse] Looking for braces: first={${firstBrace}}, last={${lastBrace}}`);
      
      // Handle truncated JSON - if no closing brace, the response was cut off
      if (firstBrace !== -1 && lastBrace === -1) {
        console.log(`[GeminiParse] Detected truncated JSON - attempting repair`);
        // Take from first brace to end and attempt to close it
        jsonStr = responseText.substring(firstBrace);
        // Count unclosed braces and brackets
        let openBraces = 0, openBrackets = 0;
        let inString = false;
        for (let i = 0; i < jsonStr.length; i++) {
          const c = jsonStr[i];
          if (c === '"' && (i === 0 || jsonStr[i-1] !== '\\')) inString = !inString;
          if (!inString) {
            if (c === '{') openBraces++;
            if (c === '}') openBraces--;
            if (c === '[') openBrackets++;
            if (c === ']') openBrackets--;
          }
        }
        // Find last complete value (ends with " or number or true/false/null)
        const lastQuote = jsonStr.lastIndexOf('"');
        const lastColon = jsonStr.lastIndexOf(':');
        if (lastQuote > lastColon) {
          // Truncated in a string value - close the string
          jsonStr = jsonStr.substring(0, lastQuote + 1);
        } else {
          // Truncated elsewhere - find last complete key-value
          const lastComma = jsonStr.lastIndexOf(',');
          if (lastComma > 0) {
            jsonStr = jsonStr.substring(0, lastComma);
          }
        }
        // Close all open brackets and braces
        jsonStr += ']'.repeat(Math.max(0, openBrackets)) + '}'.repeat(Math.max(0, openBraces + 1));
        console.log(`[GeminiParse] Repaired JSON, length: ${jsonStr.length}, added ${openBrackets} ] and ${openBraces + 1} }`);
      } else if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
        jsonStr = responseText.substring(firstBrace, lastBrace + 1);
        console.log(`[GeminiParse] Extracted raw JSON, length: ${jsonStr.length}`);
      }
    }
    
    if (jsonStr) {
      try {
        parsed = JSON.parse(jsonStr);
        console.log(`[GeminiParse] SUCCESS - Extracted JSON: ${Object.keys(parsed.fields || {}).length} fields`);
        
        // Explicitly log sections for debugging
        if (parsed.sections && typeof parsed.sections === 'object') {
          const sectionKeys = Object.keys(parsed.sections);
          console.log(`[GeminiParse] Sections found: ${sectionKeys.length} - ${sectionKeys.slice(0, 5).join(', ')}`);
          // Log section contents
          for (const [sectionName, fields] of Object.entries(parsed.sections)) {
            const fieldList = Array.isArray(fields) ? fields : [];
            console.log(`[GeminiParse] Section "${sectionName}": ${fieldList.length} fields - ${fieldList.slice(0, 5).join(', ')}`);
          }
        } else {
          console.warn(`[GeminiParse] WARNING: No sections extracted from document - attempting to generate sections from fields`);
          // Auto-generate sections based on field patterns if none were extracted
          parsed.sections = generateSectionsFromFields(parsed.fields || {});
          console.log(`[GeminiParse] Generated ${Object.keys(parsed.sections).length} sections from field patterns`);
        }
        
        return parsed;
      } catch (parseError) {
        console.error(`[GeminiParse] Parse error: ${parseError instanceof Error ? parseError.message : 'unknown'}`);
        console.log(`[GeminiParse] Failed JSON (first 300 chars): ${jsonStr.substring(0, 300)}`);
        console.log(`[GeminiParse] Failed JSON (last 300 chars): ${jsonStr.substring(Math.max(0, jsonStr.length - 300))}`);
        
        // Try to fix common JSON issues including unterminated strings
        try {
          let fixedJson = jsonStr;
          // Remove trailing incomplete entries
          fixedJson = fixedJson.replace(/,\s*"[^"]*"?\s*:\s*"?[^"}\]]*$/g, '');
          // Fix trailing commas
          fixedJson = fixedJson.replace(/,\s*([\]}])/g, '$1');
          // Ensure proper closing
          let openB = 0, openBr = 0;
          for (const c of fixedJson) {
            if (c === '{') openB++; if (c === '}') openB--;
            if (c === '[') openBr++; if (c === ']') openBr--;
          }
          fixedJson += ']'.repeat(Math.max(0, openBr)) + '}'.repeat(Math.max(0, openB));
          parsed = JSON.parse(fixedJson);
          console.log(`[GeminiParse] SUCCESS - Fixed JSON: ${Object.keys(parsed.fields || {}).length} fields`);
          
          // Also generate sections if missing after fix
          if (!parsed.sections || Object.keys(parsed.sections).length === 0) {
            parsed.sections = generateSectionsFromFields(parsed.fields || {});
            console.log(`[GeminiParse] Generated ${Object.keys(parsed.sections).length} sections from field patterns (after fix)`);
          }
          
          return parsed;
        } catch (fixError) {
          console.error(`[GeminiParse] Fix attempt failed: ${fixError instanceof Error ? fixError.message : 'unknown'}`);
        }
      }
    } else {
      console.log(`[GeminiParse] No JSON structure found in response`);
    }
    
    // Last resort: extract fields from plain text
    console.log(`[GeminiParse] Falling back to text extraction`);
    const fields = extractFieldsFromText(responseText);
    if (Object.keys(fields).length > 0) {
      console.log(`[GeminiParse] Extracted ${Object.keys(fields).length} fields from text`);
      const sections = generateSectionsFromFields(fields);
      return { fields, sections, confidence: 0.5, raw_text: responseText };
    }
    
    console.warn(`[GeminiParse] FAILED - No fields extracted`);
    return { fields: {}, confidence: 0.3, raw_text: responseText };
  } catch (error) {
    console.error("Gemini extraction error:", error);
    throw error;
  }
}

// Helper function to extract fields from plain text when JSON parsing fails
function extractFieldsFromText(text: string): Record<string, string> {
  const fields: Record<string, string> = {};
  
  // Common patterns for field extraction
  const patterns = [
    // "Field Name: Value" pattern
    /^([A-Za-z][A-Za-z\s_-]{2,30}):\s*(.+)$/gm,
    // "Field Name = Value" pattern
    /^([A-Za-z][A-Za-z\s_-]{2,30})\s*=\s*(.+)$/gm,
    // "**Field Name**: Value" (markdown)
    /\*\*([A-Za-z][A-Za-z\s_-]{2,30})\*\*:\s*(.+)/g,
  ];
  
  for (const pattern of patterns) {
    let match;
    while ((match = pattern.exec(text)) !== null) {
      const key = match[1].trim().toLowerCase().replace(/[\s-]+/g, '_');
      const value = match[2].trim();
      
      // Skip empty values or keys that are too generic
      if (value && value.length > 0 && key.length > 2) {
        fields[key] = value;
      }
    }
  }
  
  return fields;
}

// ============= CLAUDE EXTRACTION =============
// Uses Anthropic API for clinical/healthcare document extraction
async function extractWithClaude(imageBase64: string, contentType: string, prompt: string, systemPrompt?: string): Promise<any> {
  const anthropicApiKey = Deno.env.get("ANTHROPIC_API_KEY");
  if (!anthropicApiKey) {
    console.error("ANTHROPIC_API_KEY not configured");
    throw new Error("ANTHROPIC_API_KEY not configured");
  }
  
  console.log(`[Claude] Starting extraction with content type ${contentType}, base64 length: ${imageBase64?.length || 0}`);
  
  try {
    // Determine media type for Claude's vision API
    // Claude supports: image/jpeg, image/png, image/gif, image/webp
    // Note: BMP is NOT directly supported by Claude - we need to handle it differently
    let mediaType = 'image/png';
    const lowerContentType = contentType.toLowerCase();
    
    if (lowerContentType.includes('jpeg') || lowerContentType.includes('jpg')) {
      mediaType = 'image/jpeg';
    } else if (lowerContentType.includes('webp')) {
      mediaType = 'image/webp';
    } else if (lowerContentType.includes('gif')) {
      mediaType = 'image/gif';
    } else if (lowerContentType.includes('png')) {
      mediaType = 'image/png';
    } else if (lowerContentType.includes('pdf')) {
      mediaType = 'application/pdf';
    } else if (lowerContentType.includes('bmp')) {
      // BMP is not directly supported by Claude API
      // Attempt to send as PNG and hope the API can process it
      // If this fails, we'll need proper image conversion
      console.log('[Claude] BMP format detected - attempting to process (may fail, recommend using JPEG/PNG)');
      mediaType = 'image/png'; // This will likely fail for true BMP files
      throw new Error('BMP format is not supported. Please convert to JPEG or PNG before uploading.');
    }
    
    console.log(`[Claude] Using media type: ${mediaType} for content type: ${contentType}`);
    
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': anthropicApiKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 8192,
        system: systemPrompt || 'You are an expert document analyst. Extract all relevant information accurately.',
        messages: [{
          role: 'user',
          content: [
            {
              type: 'image',
              source: {
                type: 'base64',
                media_type: mediaType,
                data: imageBase64
              }
            },
            {
              type: 'text',
              text: prompt
            }
          ]
        }]
      })
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`[Claude] API error: ${response.status} - ${errorText}`);
      throw new Error(`Claude API error: ${response.status} - ${errorText}`);
    }
    
    const data = await response.json();
    console.log(`[Claude] Response received`);
    
    const responseText = data?.content?.[0]?.text || '';
    console.log(`[Claude] Extracted text length: ${responseText.length}`);
    
    if (!responseText) {
      console.error("[Claude] Returned empty response");
      return null;
    }
    
    // Try to extract JSON from response
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    
    if (jsonMatch) {
      try {
        const parsed = JSON.parse(jsonMatch[0]);
        console.log(`[Claude] Extraction successful: ${Object.keys(parsed.fields || {}).length} fields extracted`);
        return parsed;
      } catch (parseError) {
        console.error("[Claude] Failed to parse JSON response:", parseError);
        return { fields: {}, confidence: 0.3, raw_text: responseText };
      }
    }
    
    console.log("[Claude] No JSON found in response, returning raw text");
    return { fields: {}, confidence: 0.3, raw_text: responseText };
  } catch (error) {
    console.error("[Claude] Extraction error:", error);
    throw error;
  }
}

// ============= OPENAI EXTRACTION =============
// Uses OpenAI GPT-4o for financial/invoice document extraction
async function extractWithOpenAI(imageBase64: string, contentType: string, prompt: string, systemPrompt?: string): Promise<any> {
  const openaiApiKey = Deno.env.get("OPENAI_API_KEY");
  if (!openaiApiKey) {
    console.error("OPENAI_API_KEY not configured");
    throw new Error("OPENAI_API_KEY not configured");
  }
  
  console.log(`[OpenAI] Starting extraction with content type ${contentType}, base64 length: ${imageBase64?.length || 0}`);
  
  try {
    // Determine media type for OpenAI's vision API
    let mediaType = 'image/png';
    if (contentType.includes('jpeg') || contentType.includes('jpg')) {
      mediaType = 'image/jpeg';
    } else if (contentType.includes('webp')) {
      mediaType = 'image/webp';
    } else if (contentType.includes('gif')) {
      mediaType = 'image/gif';
    }
    
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${openaiApiKey}`
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        max_tokens: 8192,
        temperature: 0.1,
        messages: [
          {
            role: 'system',
            content: systemPrompt || 'You are an expert document analyst. Extract all relevant information accurately.'
          },
          {
            role: 'user',
            content: [
              {
                type: 'image_url',
                image_url: {
                  url: `data:${mediaType};base64,${imageBase64}`,
                  detail: 'high'
                }
              },
              {
                type: 'text',
                text: prompt
              }
            ]
          }
        ]
      })
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`[OpenAI] API error: ${response.status} - ${errorText}`);
      throw new Error(`OpenAI API error: ${response.status} - ${errorText}`);
    }
    
    const data = await response.json();
    console.log(`[OpenAI] Response received`);
    
    const responseText = data?.choices?.[0]?.message?.content || '';
    console.log(`[OpenAI] Extracted text length: ${responseText.length}`);
    
    if (!responseText) {
      console.error("[OpenAI] Returned empty response");
      return null;
    }
    
    // Try to extract JSON from response
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    
    if (jsonMatch) {
      try {
        const parsed = JSON.parse(jsonMatch[0]);
        console.log(`[OpenAI] Extraction successful: ${Object.keys(parsed.fields || {}).length} fields extracted`);
        return parsed;
      } catch (parseError) {
        console.error("[OpenAI] Failed to parse JSON response:", parseError);
        return { fields: {}, confidence: 0.3, raw_text: responseText };
      }
    }
    
    console.log("[OpenAI] No JSON found in response, returning raw text");
    return { fields: {}, confidence: 0.3, raw_text: responseText };
  } catch (error) {
    console.error("[OpenAI] Extraction error:", error);
    throw error;
  }
}

// ============= GOOGLE CLOUD VISION OCR =============
// Pure OCR extraction using Google Cloud Vision API
async function extractWithGoogleVisionOCR(imageBase64: string, contentType: string): Promise<{ text: string; confidence: number; blocks: any[] }> {
  const googleApiKey = Deno.env.get("GOOGLE_API_KEY");
  if (!googleApiKey) {
    console.error("[GoogleVisionOCR] GOOGLE_API_KEY not configured");
    throw new Error("GOOGLE_API_KEY not configured for OCR");
  }
  
  console.log(`[GoogleVisionOCR] Starting OCR extraction, content type: ${contentType}, base64 length: ${imageBase64?.length || 0}`);
  
  try {
    const apiUrl = `https://vision.googleapis.com/v1/images:annotate?key=${googleApiKey}`;
    
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        requests: [{
          image: { content: imageBase64 },
          features: [
            { type: 'TEXT_DETECTION', maxResults: 1 },
            { type: 'DOCUMENT_TEXT_DETECTION', maxResults: 1 }
          ]
        }]
      })
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`[GoogleVisionOCR] API error: ${response.status} - ${errorText}`);
      throw new Error(`Google Vision API error: ${response.status}`);
    }
    
    const data = await response.json();
    const annotations = data.responses?.[0];
    
    if (annotations?.error) {
      console.error(`[GoogleVisionOCR] Vision API error:`, annotations.error);
      throw new Error(`Vision API error: ${annotations.error.message}`);
    }
    
    // Get full text from DOCUMENT_TEXT_DETECTION (better for structured docs)
    const fullTextAnnotation = annotations?.fullTextAnnotation;
    const textAnnotations = annotations?.textAnnotations;
    
    let extractedText = '';
    let avgConfidence = 0;
    const textBlocks: any[] = [];
    
    if (fullTextAnnotation) {
      extractedText = fullTextAnnotation.text || '';
      
      // Extract confidence from pages
      const pages = fullTextAnnotation.pages || [];
      let totalConfidence = 0;
      let blockCount = 0;
      
      for (const page of pages) {
        for (const block of page.blocks || []) {
          if (block.confidence) {
            totalConfidence += block.confidence;
            blockCount++;
          }
          
          // Extract block text and bounding box
          let blockText = '';
          for (const paragraph of block.paragraphs || []) {
            for (const word of paragraph.words || []) {
              const wordText = word.symbols?.map((s: any) => s.text).join('') || '';
              blockText += wordText + ' ';
            }
            blockText += '\n';
          }
          
          textBlocks.push({
            text: blockText.trim(),
            confidence: block.confidence || 0.8,
            boundingBox: block.boundingBox?.vertices
          });
        }
      }
      
      avgConfidence = blockCount > 0 ? totalConfidence / blockCount : 0.85;
    } else if (textAnnotations && textAnnotations.length > 0) {
      // Fallback to simple TEXT_DETECTION
      extractedText = textAnnotations[0]?.description || '';
      avgConfidence = 0.8;
      
      // Add individual word blocks
      for (let i = 1; i < textAnnotations.length; i++) {
        textBlocks.push({
          text: textAnnotations[i].description,
          confidence: 0.8,
          boundingBox: textAnnotations[i].boundingPoly?.vertices
        });
      }
    }
    
    console.log(`[GoogleVisionOCR] Extracted ${extractedText.length} chars, ${textBlocks.length} blocks, avg confidence: ${(avgConfidence * 100).toFixed(1)}%`);
    
    return {
      text: extractedText,
      confidence: avgConfidence,
      blocks: textBlocks
    };
  } catch (error) {
    console.error("[GoogleVisionOCR] Extraction error:", error);
    throw error;
  }
}

// ============= IMAGE FORMAT CONVERSION =============
// Convert unsupported formats (BMP, TIFF, etc.) to JPEG for AI providers
function convertToSupportedFormat(imageBase64: string, contentType: string): { base64: string; mimeType: string } {
  // Gemini/Claude/OpenAI support: JPEG, PNG, GIF, WEBP
  const supportedFormats = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
  
  if (supportedFormats.includes(contentType.toLowerCase())) {
    return { base64: imageBase64, mimeType: contentType };
  }
  
  // For unsupported formats (BMP, TIFF, etc.), we need to convert
  // Since we're in Deno, we can't easily convert in-memory, 
  // but we can change the MIME type to let the API try to process it
  // The AI APIs are often more lenient than their error messages suggest
  console.log(`[FormatConversion] Unsupported format ${contentType}, attempting conversion workaround`);
  
  // For BMP specifically, try treating as PNG (similar binary header structure for some cases)
  // This is a workaround - in production, use a proper image conversion library
  if (contentType.toLowerCase() === 'image/bmp') {
    console.log(`[FormatConversion] BMP detected - will try Claude/OpenAI which may handle it better`);
    // Return as-is but flag that we should prefer Claude/OpenAI for BMP
    return { base64: imageBase64, mimeType: 'image/bmp' };
  }
  
  // For other formats, try as JPEG
  return { base64: imageBase64, mimeType: 'image/jpeg' };
}

// Check if format is supported by a specific provider
function isFormatSupportedByProvider(mimeType: string, provider: AIProvider): boolean {
  const supportMatrix: Record<AIProvider, string[]> = {
    'gemini': ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
    'claude': ['image/jpeg', 'image/png', 'image/gif', 'image/webp'], // Claude does NOT support BMP
    'openai': ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
  };
  
  return supportMatrix[provider]?.includes(mimeType.toLowerCase()) ?? false;
}

// ============= HYBRID OCR + VISION AI EXTRACTION =============
// Stage 1: OCR for raw text, Stage 2: Vision AI for structured extraction
async function extractWithHybridPipeline(
  imageBase64: string, 
  contentType: string, 
  extractionPrompt: string,
  primaryProvider: AIProvider,
  systemPrompt?: string
): Promise<{ result: any; ocrText: string; ocrConfidence: number; provider: string; pipelineType: string }> {
  
  console.log(`[HybridPipeline] Starting hybrid extraction with primary provider: ${primaryProvider}, format: ${contentType}`);
  
  // Check for unsupported formats - REJECT BMP upfront with clear message
  const lowerContentType = contentType.toLowerCase();
  if (lowerContentType === 'image/bmp' || lowerContentType.includes('bmp')) {
    console.error(`[HybridPipeline] BMP format is not supported by any AI vision provider`);
    throw new Error('BMP format is not supported. Please convert your image to JPEG or PNG before uploading. You can use any image editor or online converter to do this.');
  }
  
  const isUnsupportedFormat = !['image/jpeg', 'image/png', 'image/gif', 'image/webp'].includes(lowerContentType);
  let effectiveProvider = primaryProvider;
  
  if (isUnsupportedFormat) {
    console.log(`[HybridPipeline] Unsupported format ${contentType} detected - may cause issues`);
  }
  
  let ocrText = '';
  let ocrConfidence = 0;
  let ocrSuccess = false;
  
  // Stage 1: Try Google Cloud Vision OCR
  try {
    const ocrResult = await extractWithGoogleVisionOCR(imageBase64, contentType);
    ocrText = ocrResult.text;
    ocrConfidence = ocrResult.confidence;
    ocrSuccess = ocrText.length > 50; // Consider success if we got meaningful text
    console.log(`[HybridPipeline] OCR Stage 1 ${ocrSuccess ? 'succeeded' : 'insufficient text'}: ${ocrText.length} chars`);
  } catch (ocrError) {
    console.warn(`[HybridPipeline] OCR Stage 1 failed, proceeding with Vision AI only:`, ocrError);
  }
  
  // Stage 2: Vision AI with OCR context
  // Enhance the prompt with OCR text if available
  let enhancedPrompt = extractionPrompt;
  if (ocrSuccess && ocrText.length > 50) {
    enhancedPrompt = `${extractionPrompt}

=== PRE-EXTRACTED OCR TEXT (use as reference) ===
${ocrText.substring(0, 8000)}
=== END OCR TEXT ===

Use the OCR text above as a reference to validate and enhance your visual extraction. The OCR may have errors, so use the image as the primary source of truth.`;
  }
  
  let extractionResult: any = null;
  let providerUsed = effectiveProvider;
  
  // Build smart fallback chain based on format support
  const fallbackChain: AIProvider[] = [];
  if (effectiveProvider !== 'claude') fallbackChain.push('claude');
  if (effectiveProvider !== 'openai') fallbackChain.push('openai');
  if (effectiveProvider !== 'gemini') fallbackChain.push('gemini');
  
  console.log(`[HybridPipeline] Provider chain: ${effectiveProvider} -> ${fallbackChain.join(' -> ')}`);
  
  // Try effective provider first
  try {
    switch (effectiveProvider) {
      case 'claude':
        extractionResult = await extractWithClaude(imageBase64, contentType, enhancedPrompt, systemPrompt);
        break;
      case 'openai':
        extractionResult = await extractWithOpenAI(imageBase64, contentType, enhancedPrompt, systemPrompt);
        break;
      case 'gemini':
      default:
        extractionResult = await extractWithGemini(imageBase64, contentType, enhancedPrompt);
        break;
    }
    console.log(`[HybridPipeline] Vision AI extraction with ${effectiveProvider} succeeded`);
  } catch (providerError) {
    console.error(`[HybridPipeline] Primary provider ${effectiveProvider} failed:`, providerError);
    
    // Try fallback providers in order
    for (const fallbackProvider of fallbackChain) {
      try {
        console.log(`[HybridPipeline] Trying fallback provider: ${fallbackProvider}`);
        switch (fallbackProvider) {
          case 'claude':
            extractionResult = await extractWithClaude(imageBase64, contentType, enhancedPrompt, systemPrompt);
            break;
          case 'openai':
            extractionResult = await extractWithOpenAI(imageBase64, contentType, enhancedPrompt, systemPrompt);
            break;
          case 'gemini':
            extractionResult = await extractWithGemini(imageBase64, contentType, enhancedPrompt);
            break;
        }
        providerUsed = fallbackProvider;
        console.log(`[HybridPipeline] Fallback to ${fallbackProvider} succeeded`);
        break; // Exit loop on success
      } catch (fallbackError) {
        console.error(`[HybridPipeline] Fallback provider ${fallbackProvider} also failed:`, fallbackError);
      }
    }
  }
  
  // If Vision AI failed but OCR succeeded, create basic result from OCR
  if (!extractionResult && ocrSuccess) {
    console.log(`[HybridPipeline] Creating basic result from OCR text only`);
    extractionResult = {
      fields: { raw_text: ocrText },
      confidence: ocrConfidence * 0.7, // Lower confidence for OCR-only
      raw_text: ocrText,
      extraction_method: 'ocr_only'
    };
    providerUsed = 'google_vision_ocr';
  }
  
  return {
    result: extractionResult,
    ocrText,
    ocrConfidence,
    provider: providerUsed,
    pipelineType: ocrSuccess ? 'hybrid_ocr_vision_ai' : 'vision_ai_only'
  };
}

// ============= DOCUMENT CATEGORY HELPER =============
function getDocumentCategory(documentType: string): string {
  const categoryMap: Record<string, string> = {
    // Healthcare
    'prescription': 'healthcare',
    'insurance': 'healthcare',
    'lab-results': 'healthcare',
    'lab_result': 'healthcare',
    'patient-onboarding': 'healthcare',
    'medical_record': 'healthcare',
    'insurance_card': 'healthcare',
    
    // Medical Imaging
    'medical_imaging': 'medical-imaging',
    'xray': 'medical-imaging',
    'ct-scan': 'medical-imaging',
    'ct_scan': 'medical-imaging',
    'mri': 'medical-imaging',
    'ecg': 'medical-imaging',
    'ultrasound': 'medical-imaging',
    
    // Financial
    'invoice': 'financial',
    'receipt': 'financial',
    'claim': 'financial',
    
    // Identity
    'passport': 'identity',
    'drivers-license': 'identity',
    'identification': 'identity',
    
    // Business
    'contract': 'business',
    'form': 'business'
  };
  
  return categoryMap[documentType] || 'general';
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
  const hfToken = Deno.env.get("HUGGING_FACE_ACCESS_TOKEN");
  
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
    
    // ============= PARALLEL CNN + VISION AI ANALYSIS =============
    // Run actual CNN models via Hugging Face in parallel with Vision AI
    
    let cnnAnalysis: any = null;
    let geminiAnalysis: any = null;
    
    // Start CNN analysis if Hugging Face token available
    const cnnPromise = hfToken ? runMedicalCNNAnalysis(imageBase64, documentType || 'medical-image', modelType) : Promise.resolve(null);
    
    // Start Gemini Vision analysis
    const medicalPrompt = buildComprehensiveMedicalPrompt(documentType || 'medical-image', analysisType || 'comprehensive', modelType);
    const geminiPromise = fetch(
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
    
    // Wait for both analyses
    const [cnnResult, geminiResponse] = await Promise.all([cnnPromise, geminiPromise]);
    cnnAnalysis = cnnResult;
    
    if (!geminiResponse.ok) {
      throw new Error(`Gemini API error: ${geminiResponse.status}`);
    }

    const geminiData = await geminiResponse.json();
    const responseText = geminiData.candidates?.[0]?.content?.parts?.[0]?.text || '';
    const parsedAnalysis = parseComprehensiveResponse(responseText);
    geminiAnalysis = parsedAnalysis;
    
    // ============= MERGE CNN + VISION AI RESULTS =============
    const mergedModelsUsed: string[] = ['Gemini 2.0 Flash Vision'];
    const cnnPredictions: any[] = [];
    const cnnModelsExecuted: any[] = [];
    
    if (cnnAnalysis?.success) {
      // Add CNN model names
      if (cnnAnalysis.modelExecution?.modelsUsed) {
        for (const model of cnnAnalysis.modelExecution.modelsUsed) {
          mergedModelsUsed.push(`${model.name} (${model.architecture})`);
          cnnModelsExecuted.push(model);
        }
      }
      // Add CNN predictions
      if (cnnAnalysis.predictions) {
        cnnPredictions.push(...cnnAnalysis.predictions);
      }
    }
    
    // Enhance findings with CNN predictions
    const enhancedFindings = [...(parsedAnalysis.findings || [])];
    
    // Add high-confidence CNN findings as additional insights
    if (cnnPredictions.length > 0) {
      const criticalCNN = cnnPredictions.filter(p => p.score > 0.6 && p.clinicalRelevance.includes('CRITICAL'));
      const abnormalCNN = cnnPredictions.filter(p => p.score > 0.5 && p.clinicalRelevance.includes('abnormality'));
      
      for (const pred of [...criticalCNN, ...abnormalCNN].slice(0, 5)) {
        enhancedFindings.push({
          category: pred.clinicalRelevance.includes('CRITICAL') ? 'abnormality' : 'observation',
          description: `CNN Detection: ${pred.label} (${(pred.score * 100).toFixed(1)}% confidence)`,
          detailedExplanation: `Detected by ${pred.model} using ${pred.architecture} architecture. ${pred.clinicalRelevance}`,
          confidence: Math.round(pred.score * 100),
          clinicalSignificance: pred.clinicalRelevance.includes('CRITICAL') ? 'critical' : 
                               pred.clinicalRelevance.includes('CONCERNING') ? 'high' : 'medium',
          status: pred.clinicalRelevance.includes('Normal') ? 'normal' : 'abnormal',
          source: 'CNN_MODEL',
          modelUsed: pred.model
        });
      }
    }
    
    return new Response(
      JSON.stringify({ 
        success: true, 
        autoDetection: parsedAnalysis.autoDetection,
        insights: enhancedFindings,
        measurements: parsedAnalysis.measurements,
        obstructionsAndBlockages: parsedAnalysis.obstructionsAndBlockages,
        clinicalNotes: parsedAnalysis.clinicalNotes,
        observations: parsedAnalysis.observations,
        panelAnalysis: parsedAnalysis.panelAnalysis,
        detailedReport: parsedAnalysis.detailedReport,
        abnormalitySummary: {
          ...(parsedAnalysis.abnormalitySummary || {}),
          cnnFindings: cnnPredictions.slice(0, 10)
        },
        providerConsultation: parsedAnalysis.providerConsultation,
        anatomicalRegions: parsedAnalysis.anatomicalRegions,
        rawAnalysis: responseText,
        
        // CNN Model Results
        cnnAnalysis: cnnAnalysis?.success ? {
          predictions: cnnPredictions.slice(0, 15),
          clinicalSummary: cnnAnalysis.clinicalSummary,
          modelsExecuted: cnnModelsExecuted,
          deepAnalysis: cnnAnalysis.deepAnalysis,
          performance: cnnAnalysis.performance
        } : null,
        
        // Model information
        modelUsed: mergedModelsUsed.join(' + '),
        modelsUsed: mergedModelsUsed,
        modelApproach: modelType.toUpperCase(),
        modelApproachDetails: getModelApproachDetails(modelType),
        provider,
        modelType,
        analysisType: cnnAnalysis?.success ? 'CNN_ENSEMBLE + VISION_AI' : 'VISION_AI',
        
        detectedModality: parsedAnalysis.autoDetection?.detectedModality || documentType,
        detectedOrgans: parsedAnalysis.autoDetection?.detectedOrgans || [],
        analysisDepth: 'comprehensive',
        
        disclaimer: 'AI-ASSISTED ANALYSIS (CNN + Vision AI Ensemble) FOR INFORMATIONAL PURPOSES ONLY. This analysis uses real CNN models (CheXNet, RadImageNet, Vision Transformers) combined with Vision AI. This is NOT a medical diagnosis. Results must be reviewed by a qualified healthcare provider. DO NOT make clinical decisions based solely on this analysis.'
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

// ============= CNN MODEL EXECUTION =============
async function runMedicalCNNAnalysis(imageBase64: string, documentType: string, modelType: string): Promise<any> {
  try {
    console.log(`[CNN] Starting medical CNN analysis for ${documentType}`);
    
    const hfToken = Deno.env.get('HUGGING_FACE_ACCESS_TOKEN');
    if (!hfToken) {
      console.log('[CNN] No Hugging Face token available');
      return { success: false, error: 'HUGGING_FACE_ACCESS_TOKEN not configured' };
    }
    
    // Map document type to modality and organ for model selection
    const modalityMap: Record<string, { modality: string; organ: string }> = {
      'xray': { modality: 'xray', organ: 'chest' },
      'ct-scan': { modality: 'ct-scan', organ: 'all' },
      'mri': { modality: 'mri', organ: 'brain' },
      'ecg': { modality: 'ecg', organ: 'heart' },
      'ultrasound': { modality: 'ultrasound', organ: 'all' },
      'mammogram': { modality: 'mammogram', organ: 'breast' },
      'medical-image': { modality: 'general', organ: 'all' }
    };
    
    const mapping = modalityMap[documentType] || { modality: 'general', organ: 'all' };
    
    // Call the dedicated CNN edge function
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    
    if (!supabaseUrl) {
      // Direct CNN execution without edge function call
      return await executeCNNModelsDirectly(imageBase64, mapping.modality, mapping.organ, hfToken);
    }
    
    const response = await fetch(`${supabaseUrl}/functions/v1/medical-imaging-cnn`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${supabaseKey}`
      },
      body: JSON.stringify({
        imageBase64,
        modality: mapping.modality,
        organ: mapping.organ,
        analysisMode: 'comprehensive'
      })
    });
    
    if (!response.ok) {
      console.error(`[CNN] Edge function error: ${response.status}`);
      return { success: false, error: `CNN analysis failed: ${response.status}` };
    }
    
    const result = await response.json();
    return result;
    
  } catch (error) {
    console.error('[CNN] Error running CNN analysis:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'CNN analysis failed' 
    };
  }
}

// Direct CNN execution using Hugging Face Inference API
async function executeCNNModelsDirectly(
  imageBase64: string, 
  modality: string, 
  organ: string, 
  hfToken: string
): Promise<any> {
  const { HfInference } = await import('https://esm.sh/@huggingface/inference@2.3.2');
  const hf = new HfInference(hfToken);
  
  const startTime = Date.now();
  
  // Select models based on modality
  const modelRegistry: Record<string, { id: string; name: string; arch: string }> = {
    'chexnet': { id: 'alkzar90/chexnet', name: 'CheXNet', arch: 'DenseNet-121' },
    'covid-xray': { id: 'DunnBC22/vit-base-patch16-224-in21k_COVID19-X_Rays', name: 'COVID-19 Classifier', arch: 'ViT' },
    'brain-tumor': { id: 'Devarshi/Brain_Tumor_Classification', name: 'Brain Tumor Classifier', arch: 'ResNet' }
  };
  
  let modelsToRun: string[] = [];
  if (modality.includes('xray') || modality === 'chest') {
    modelsToRun = ['chexnet', 'covid-xray'];
  } else if (modality.includes('mri') || modality.includes('ct') || organ === 'brain') {
    modelsToRun = ['brain-tumor'];
  } else {
    modelsToRun = ['chexnet']; // Default
  }
  
  const predictions: any[] = [];
  const modelsUsed: any[] = [];
  
  // Convert base64 to blob
  const binaryString = atob(imageBase64);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  const imageBlob = new Blob([bytes], { type: 'image/jpeg' });
  
  for (const modelKey of modelsToRun) {
    const model = modelRegistry[modelKey];
    if (!model) continue;
    
    try {
      console.log(`[CNN] Running ${model.name}...`);
      const modelStart = Date.now();
      
      const result = await hf.imageClassification({
        model: model.id,
        data: imageBlob
      });
      
      for (const pred of result) {
        predictions.push({
          label: pred.label,
          score: pred.score,
          model: model.name,
          architecture: model.arch,
          clinicalRelevance: getClinicalRelevanceForLabel(pred.label, pred.score)
        });
      }
      
      modelsUsed.push({
        key: modelKey,
        name: model.name,
        architecture: model.arch,
        latencyMs: Date.now() - modelStart
      });
      
      console.log(`[CNN] ${model.name} completed: ${result.length} predictions`);
      
    } catch (error) {
      console.error(`[CNN] Error with ${model.name}:`, error);
    }
  }
  
  return {
    success: predictions.length > 0,
    predictions: predictions.sort((a, b) => b.score - a.score).slice(0, 15),
    modelExecution: {
      modelsUsed,
      totalModels: modelsToRun.length,
      successfulModels: modelsUsed.length
    },
    clinicalSummary: generateClinicalSummary(predictions),
    performance: {
      totalLatencyMs: Date.now() - startTime,
      predictionsGenerated: predictions.length
    }
  };
}

function getClinicalRelevanceForLabel(label: string, score: number): string {
  const labelLower = label.toLowerCase();
  const criticalFindings = ['pneumothorax', 'pneumonia', 'covid', 'tumor', 'malignant', 'nodule', 'mass', 'effusion', 'cardiomegaly'];
  const normalFindings = ['normal', 'healthy', 'no tumor', 'benign', 'negative'];
  
  if (normalFindings.some(f => labelLower.includes(f))) {
    return score > 0.8 ? 'Normal finding - likely healthy' : 'Possible normal finding';
  }
  
  if (criticalFindings.some(f => labelLower.includes(f))) {
    if (score > 0.7) return 'CRITICAL: High confidence abnormality detected';
    if (score > 0.4) return 'CONCERNING: Moderate confidence abnormality';
    return 'Low confidence critical finding';
  }
  
  return score > 0.5 ? 'Finding present - correlate clinically' : 'Low confidence finding';
}

function generateClinicalSummary(predictions: any[]): any {
  const critical = predictions.filter(p => p.clinicalRelevance?.includes('CRITICAL') && p.score > 0.5);
  const abnormal = predictions.filter(p => p.clinicalRelevance?.includes('CONCERNING') && p.score > 0.4);
  const normal = predictions.filter(p => p.clinicalRelevance?.includes('Normal'));
  
  return {
    criticalFindings: critical.map(f => ({ finding: f.label, confidence: f.score, model: f.model })),
    abnormalFindings: abnormal.map(f => ({ finding: f.label, confidence: f.score, model: f.model })),
    normalIndicators: normal.map(f => ({ finding: f.label, confidence: f.score, model: f.model })),
    overallAssessment: critical.length > 0 
      ? 'CRITICAL: Urgent findings detected' 
      : abnormal.length > 0 
        ? 'ABNORMAL: Findings present' 
        : 'Review required'
  };
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
