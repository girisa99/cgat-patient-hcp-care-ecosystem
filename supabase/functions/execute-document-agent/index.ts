import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { resolveModel, resolveModelSync } from '../_shared/dynamic-model-resolver.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
const SUPABASE_ANON_KEY = Deno.env.get('SUPABASE_ANON_KEY');

// ============================================
// UNIVERSAL AI MODEL ROUTING
// Based on document-processor intelligent routing
// ============================================

type AIProvider = 'claude' | 'gemini' | 'openai';

interface ModelRoutingConfig {
  provider: AIProvider;
  model: string;
  fallbackProvider: AIProvider;
  fallbackModel: string;
  systemPrompt: string;
}

// Agent-specific model routing (matching document-processor logic)
const AGENT_MODEL_ROUTING: Record<string, ModelRoutingConfig> = {
  // Clinical agents → Claude (best for clinical reasoning, medical terminology)
  'clinical-review': {
    provider: 'claude',
    model: 'claude-haiku-4-5',
    fallbackProvider: 'gemini',
    fallbackModel: 'gemini-2.5-flash',
    systemPrompt: 'You are an expert clinical pharmacist with 20 years of experience. Provide evidence-based clinical assessments.'
  },
  'drug-interaction': {
    provider: 'claude',
    model: 'claude-haiku-4-5',
    fallbackProvider: 'gemini',
    fallbackModel: 'gemini-2.5-flash',
    systemPrompt: 'You are an expert pharmacist specialized in drug-drug interactions and medication safety.'
  },
  'medication-reconciliation': {
    provider: 'claude',
    model: 'claude-haiku-4-5',
    fallbackProvider: 'openai',
    fallbackModel: 'gpt-4o-mini',
    systemPrompt: 'You are a clinical pharmacist specializing in medication reconciliation and patient safety.'
  },
  
  // Radiology/Imaging agents → Gemini (best for vision, medical imaging)
  'radiology-ai': {
    provider: 'gemini',
    model: 'gemini-2.5-flash',
    fallbackProvider: 'claude',
    fallbackModel: 'claude-haiku-4-5',
    systemPrompt: 'You are an experienced radiologist assistant. Provide structured, actionable radiology assessments.'
  },
  'ct-analysis': {
    provider: 'gemini',
    model: 'gemini-2.5-pro',
    fallbackProvider: 'claude',
    fallbackModel: 'claude-haiku-4-5',
    systemPrompt: 'You are a CT imaging specialist. Analyze CT scan findings with clinical precision.'
  },
  'mri-analysis': {
    provider: 'gemini',
    model: 'gemini-2.5-pro',
    fallbackProvider: 'claude',
    fallbackModel: 'claude-haiku-4-5',
    systemPrompt: 'You are an MRI imaging specialist. Analyze MRI findings with attention to soft tissue detail.'
  },
  'ultrasound-analysis': {
    provider: 'gemini',
    model: 'gemini-2.5-flash',
    fallbackProvider: 'claude',
    fallbackModel: 'claude-haiku-4-5',
    systemPrompt: 'You are an ultrasound specialist. Provide structured sonographic assessments.'
  },
  'mammogram-analysis': {
    provider: 'gemini',
    model: 'gemini-2.5-pro',
    fallbackProvider: 'claude',
    fallbackModel: 'claude-haiku-4-5',
    systemPrompt: 'You are a breast imaging specialist. Analyze mammographic findings using BI-RADS criteria.'
  },
  
  // Lab agents → Claude (clinical interpretation)
  'critical-value-alert': {
    provider: 'claude',
    model: 'claude-haiku-4-5',
    fallbackProvider: 'openai',
    fallbackModel: 'gpt-4o-mini',
    systemPrompt: 'You are an expert clinical laboratory scientist specializing in result interpretation and critical value identification.'
  },
  'trend-analysis': {
    provider: 'claude',
    model: 'claude-haiku-4-5',
    fallbackProvider: 'openai',
    fallbackModel: 'gpt-4o-mini',
    systemPrompt: 'You are a clinical pathologist analyzing laboratory trends and patterns.'
  },
  
  // Default for unknown agents
  'default': {
    provider: 'gemini',
    model: 'gemini-2.5-flash',
    fallbackProvider: 'claude',
    fallbackModel: 'claude-haiku-4-5',
    systemPrompt: 'You are a healthcare AI assistant. Provide accurate, evidence-based analysis.'
  }
};

// Provider-specific model mappings for when user selects a specific provider
// NOTE: Use actual API model IDs (not prefixed) - the processor handles routing
const PROVIDER_MODELS: Record<AIProvider, { primary: string; fallback: string }> = {
  'openai': { primary: 'gpt-4o', fallback: 'gpt-4o-mini' }, // Use stable OpenAI models
  'claude': { primary: 'claude-haiku-4-5', fallback: 'claude-sonnet-4-6' },
  'gemini': { primary: 'gemini-2.5-flash', fallback: 'gemini-2.5-flash' }
};

function getModelRouting(agentId: string, preferredProvider?: AIProvider): ModelRoutingConfig {
  const baseRouting = AGENT_MODEL_ROUTING[agentId] || AGENT_MODEL_ROUTING['default'];
  
  // If user specified a provider, override the default routing
  if (preferredProvider && PROVIDER_MODELS[preferredProvider]) {
    const providerModels = PROVIDER_MODELS[preferredProvider];
    console.log(`[getModelRouting] Using user-selected provider: ${preferredProvider} with model ${providerModels.primary}`);
    return {
      ...baseRouting,
      provider: preferredProvider,
      model: providerModels.primary,
      // Keep the fallback from a different provider for resilience
      fallbackProvider: baseRouting.fallbackProvider !== preferredProvider 
        ? baseRouting.fallbackProvider 
        : (preferredProvider === 'claude' ? 'gemini' : 'claude'),
      fallbackModel: baseRouting.fallbackProvider !== preferredProvider
        ? baseRouting.fallbackModel
        : (preferredProvider === 'claude' ? 'gemini-2.5-flash' : 'claude-haiku-4-5')
    };
  }
  
  return baseRouting;
}

// ============================================
// MULTI-AGENT PROVIDER CONFIGURATION
// Allows separate provider selection per agent
// ============================================

interface MultiAgentConfig {
  agentId: string;
  provider: AIProvider;
  model?: string;
  enabled: boolean;
}

interface AgentExecutionOptions {
  multiAgentConfig?: MultiAgentConfig[];
  storeResults?: boolean;
  updateLabelStudio?: boolean;
  executionMode?: 'instant' | 'guided' | 'background';
}

interface AgentConfig {
  name: string;
  architectureType: 'single' | 'agentic' | 'a2a' | 'multi-agent';
  useCase: string;
  description: string;
}

interface DocumentContext {
  documentType: string;
  extractedFields: Record<string, any>;
  rawText?: string;
  fileName?: string;
  imageBase64?: string;
  documentId?: string;
  preferredProvider?: 'claude' | 'gemini' | 'openai';
  // Multi-agent provider overrides
  agentProviders?: Record<string, AIProvider>;
}

interface ExecutionRequest {
  agentId: string;
  agentConfig: AgentConfig;
  documentContext: DocumentContext;
  options?: AgentExecutionOptions;
}

interface AgentFinding {
  summary: string;
  details: Record<string, any>;
  recommendations: string[];
  alerts: Array<{ level: 'info' | 'warning' | 'error'; message: string }>;
  confidence: number;
  aiPowered?: boolean;
  model?: string;
  provider?: string;
  dataSource?: string;
}

// ============================================
// SIG CODE INTERPRETATION
// Parse pharmacy SIG abbreviations to plain English
// ============================================

const SIG_ABBREVIATIONS: Record<string, string> = {
  // Frequency
  'qd': 'once daily',
  'bid': 'twice daily',
  'tid': 'three times daily',
  'qid': 'four times daily',
  'q4h': 'every 4 hours',
  'q6h': 'every 6 hours',
  'q8h': 'every 8 hours',
  'q12h': 'every 12 hours',
  'qhs': 'at bedtime',
  'qam': 'every morning',
  'qpm': 'every evening',
  'prn': 'as needed',
  'stat': 'immediately',
  'qod': 'every other day',
  'qwk': 'weekly',
  'biw': 'twice weekly',
  // Route
  'po': 'by mouth',
  'sl': 'under the tongue',
  'top': 'topically',
  'pr': 'rectally',
  'im': 'intramuscularly',
  'iv': 'intravenously',
  'sc': 'subcutaneously',
  'inh': 'by inhalation',
  'gtts': 'drops',
  'ou': 'both eyes',
  'od': 'right eye',
  'os': 'left eye',
  'au': 'both ears',
  'ad': 'right ear',
  'as': 'left ear',
  // Quantity
  'tab': 'tablet',
  'tabs': 'tablets',
  'cap': 'capsule',
  'caps': 'capsules',
  'ml': 'milliliter',
  'mg': 'milligram',
  'tsp': 'teaspoon',
  'tbsp': 'tablespoon',
  'gtt': 'drop',
  // Timing
  'ac': 'before meals',
  'pc': 'after meals',
  'hs': 'at bedtime',
  'ud': 'as directed',
  'c': 'with',
  's': 'without',
  'wf': 'with food',
  'wo': 'without food'
};

function interpretSigCode(sig: string): { interpretation: string; components: Array<{ abbreviation: string; meaning: string }> } {
  if (!sig) return { interpretation: 'No directions provided', components: [] };
  
  const components: Array<{ abbreviation: string; meaning: string }> = [];
  let interpretation = sig.toLowerCase();
  
  // Sort by length (longest first) to avoid partial replacements
  const sortedAbbreviations = Object.entries(SIG_ABBREVIATIONS).sort((a, b) => b[0].length - a[0].length);
  
  for (const [abbr, meaning] of sortedAbbreviations) {
    const regex = new RegExp(`\\b${abbr}\\b`, 'gi');
    if (regex.test(interpretation)) {
      components.push({ abbreviation: abbr.toUpperCase(), meaning });
      interpretation = interpretation.replace(regex, meaning);
    }
  }
  
  // Clean up and capitalize
  interpretation = interpretation.trim().replace(/\s+/g, ' ');
  interpretation = interpretation.charAt(0).toUpperCase() + interpretation.slice(1);
  
  return { interpretation, components };
}

// ============================================
// HELPER: Normalize field access across naming conventions
// ============================================

function getFieldValue(fields: Record<string, any>, ...fieldNames: string[]): string | undefined {
  for (const name of fieldNames) {
    // Try direct value (object with .value)
    if (fields[name]?.value) {
      return fields[name].value;
    }
    // Try direct string value
    if (typeof fields[name] === 'string' && fields[name]) {
      return fields[name];
    }
    // Try snake_case variations
    const snakeCase = name.replace(/([A-Z])/g, '_$1').toLowerCase();
    if (fields[snakeCase]?.value) {
      return fields[snakeCase].value;
    }
    if (typeof fields[snakeCase] === 'string' && fields[snakeCase]) {
      return fields[snakeCase];
    }
    // Try camelCase variations  
    const camelCase = name.replace(/_([a-z])/g, (_, c) => c.toUpperCase());
    if (fields[camelCase]?.value) {
      return fields[camelCase].value;
    }
    if (typeof fields[camelCase] === 'string' && fields[camelCase]) {
      return fields[camelCase];
    }
  }
  return undefined;
}

// Get medication name with comprehensive fallbacks (brand-aware)
function getMedicationName(fields: Record<string, any>): string {
  return getFieldValue(fields,
    'medication', 'medication_name', 'drug_name', 'drug',
    'brand_name', 'brandName', 'generic_name', 'genericName',
    'product_name', 'productName',
    'medicine', 'rx', 'prescription', 'med_name',
    'medicationName', 'drugName', 'medicineName'
  ) || 'Unknown';
}

// Get dosage/strength with fallbacks
function getDosage(fields: Record<string, any>): string {
  return getFieldValue(fields,
    'dosage', 'strength', 'dose', 'medication_strength',
    'dosageStrength', 'medicationStrength'
  ) || 'Not specified';
}

// Get frequency/SIG with fallbacks  
function getFrequency(fields: Record<string, any>): string {
  return getFieldValue(fields,
    'frequency', 'sig', 'sig_text', 'directions', 'instructions',
    'dosage_instructions', 'sigText', 'dosageInstructions'
  ) || 'Not specified';
}

// Get NDC with fallbacks
function getNDC(fields: Record<string, any>): string {
  return getFieldValue(fields,
    'ndc', 'ndc_code', 'ndcCode', 'national_drug_code'
  ) || 'Not available';
}

// ============================================
// HELPER: Extract ALL medications from fields
// Supports multiple formats: medications array, numbered fields, primary field
// ============================================

interface ExtractedMedication {
  name: string;
  strength?: string;
  sig?: string;
  ndc?: string;
  quantity?: string;
  refills?: string;
  route?: string;
  dosageForm?: string;
  isControlled?: boolean;
  schedule?: string;
}

function extractAllMedications(fields: Record<string, any>): ExtractedMedication[] {
  const medications: ExtractedMedication[] = [];
  const seenMedNames = new Set<string>(); // Track seen medication names to avoid duplicates
  
  // Helper to normalize medication name for comparison
  const normalizeMedName = (name: string): string => name.toLowerCase().trim().replace(/\s+/g, ' ');
  
  // Helper to check if medication already exists
  const isDuplicate = (name: string): boolean => seenMedNames.has(normalizeMedName(name));
  
  // Helper to add medication if not duplicate
  const addMedication = (med: ExtractedMedication): boolean => {
    const normalizedName = normalizeMedName(med.name);
    if (seenMedNames.has(normalizedName)) {
      console.log('[extractAllMedications] Skipping duplicate medication:', med.name);
      return false;
    }
    seenMedNames.add(normalizedName);
    medications.push(med);
    return true;
  };
  
  // Method 1: Check for medications array (new multi-drug format from extraction)
  // Handle direct array, wrapped {value: [...], confidence} format, AND JSON string
  let medicationsArray: any[] | null = null;
  
  if (Array.isArray(fields.medications)) {
    medicationsArray = fields.medications;
  } else if (fields.medications?.value) {
    // Check if value is array or JSON string
    if (Array.isArray(fields.medications.value)) {
      medicationsArray = fields.medications.value;
    } else if (typeof fields.medications.value === 'string') {
      try {
        const parsed = JSON.parse(fields.medications.value);
        if (Array.isArray(parsed)) {
          medicationsArray = parsed;
          console.log('[extractAllMedications] Parsed medications from JSON string');
        }
      } catch (e) {
        console.log('[extractAllMedications] Failed to parse medications JSON string:', e);
      }
    }
  }

  // Method 1b: Fallback to line_items (used by prescription extraction pipeline)
  // line_items contains structured rx rows with medication_name/brand_name/sig/etc.
  // Also widen to alternative container keys some extractors emit (items, rxItems, prescriptions, drugs).
  if (!medicationsArray) {
    const candidateContainerKeys = [
      'line_items', 'lineItems',
      'items', 'rx_items', 'rxItems',
      'prescriptions', 'prescription_items',
      'drugs', 'drug_list', 'medication_list', 'medications_list'
    ];
    let lineItemsArray: any[] | null = null;
    let matchedKey = '';
    for (const key of candidateContainerKeys) {
      const raw = (fields as any)[key];
      if (!raw) continue;
      if (Array.isArray(raw)) {
        lineItemsArray = raw; matchedKey = key; break;
      }
      if (raw?.value) {
        if (Array.isArray(raw.value)) {
          lineItemsArray = raw.value; matchedKey = key; break;
        }
        if (typeof raw.value === 'string') {
          try {
            const parsed = JSON.parse(raw.value);
            if (Array.isArray(parsed)) {
              lineItemsArray = parsed;
              matchedKey = key;
              console.log(`[extractAllMedications] Parsed ${key} from JSON string`);
              break;
            }
          } catch (e) {
            console.log(`[extractAllMedications] Failed to parse ${key} JSON string:`, e);
          }
        }
      }
    }
    if (lineItemsArray && lineItemsArray.length > 0) {
      // Filter to rows that look like medications — widened key matcher
      medicationsArray = lineItemsArray.filter((row: any) =>
        row && (
          row.medication_name || row.medicationName ||
          row.drug_name || row.drugName ||
          row.brand_name || row.brandName ||
          row.generic_name || row.genericName ||
          row.product_name || row.productName ||
          row.name || row.drug || row.medication || row.rx || row.description
        )
      );
      console.log(`[extractAllMedications] Using ${matchedKey} as medication source:`, medicationsArray.length);
    }
  }
    
  if (medicationsArray) {
    console.log('[extractAllMedications] Processing medications array with', medicationsArray.length, 'items');
    medicationsArray.forEach((med: any) => {
      // Widened name resolution: prefer brand_name, fall back across drug_name/medication_name/generic/product/etc.
      const brand = med.brand_name || med.brandName;
      const generic = med.generic_name || med.genericName;
      const primaryName =
        med.medication_name || med.medicationName ||
        med.drug_name || med.drugName ||
        brand || generic ||
        med.product_name || med.productName ||
        med.name || med.drug || med.medication || med.rx || med.description;

      // Compose display name: "Brand (Generic)" when both exist and differ
      let displayName = primaryName;
      if (brand && generic && brand.toLowerCase().trim() !== generic.toLowerCase().trim()) {
        displayName = `${brand} (${generic})`;
      } else if (brand && primaryName && brand.toLowerCase().trim() !== String(primaryName).toLowerCase().trim()) {
        // Surface brand alongside primary name when they differ
        displayName = `${primaryName} (${brand})`;
      }

      if (displayName) {
        addMedication({
          name: displayName,
          strength: med.strength || med.dosage || med.dose || med.form,
          sig: med.sig || med.sig_text || med.sigText || med.directions || med.instructions,
          ndc: med.ndc || med.ndc_code || med.ndcCode,
          quantity: med.quantity || med.qty || med.dispense,
          refills: med.refills || med.refill,
          route: med.route || med.route_of_administration,
          dosageForm: med.dosage_form || med.dosageForm || med.form,
          isControlled: med.is_controlled ?? med.isControlled,
          schedule: med.schedule || med.dea_schedule
        });
      }
    });
  }
  
  // Method 2: Check for numbered medications (medication_1_name, medication_2_name, etc.)
  // Only add if not already found in Method 1
  for (let i = 1; i <= 10; i++) {
    const medName = getFieldValue(fields, `medication_${i}_name`, `med_${i}_name`, `drug_${i}`, `medication_${i}`);
    if (medName && !isDuplicate(medName)) {
      addMedication({
        name: medName,
        strength: getFieldValue(fields, `medication_${i}_strength`, `med_${i}_strength`, `strength_${i}`),
        sig: getFieldValue(fields, `medication_${i}_sig`, `med_${i}_sig`, `sig_${i}`, `directions_${i}`),
        ndc: getFieldValue(fields, `medication_${i}_ndc`, `med_${i}_ndc`, `ndc_${i}`),
        quantity: getFieldValue(fields, `medication_${i}_quantity`, `qty_${i}`),
        refills: getFieldValue(fields, `medication_${i}_refills`, `refills_${i}`),
        route: getFieldValue(fields, `medication_${i}_route`, `route_${i}`),
        dosageForm: getFieldValue(fields, `medication_${i}_form`, `form_${i}`)
      });
    }
  }
  
  // Method 3: Fallback to primary medication field (single medication)
  if (medications.length === 0) {
    const primaryDrug = getMedicationName(fields);
    if (primaryDrug !== 'Unknown') {
      addMedication({
        name: primaryDrug,
        strength: getDosage(fields),
        sig: getFrequency(fields),
        ndc: getNDC(fields),
        quantity: getFieldValue(fields, 'quantity', 'qty', 'dispense'),
        refills: getFieldValue(fields, 'refills', 'refill', 'rf'),
        route: getFieldValue(fields, 'route', 'route_of_administration'),
        dosageForm: getFieldValue(fields, 'dosage_form', 'form', 'dosageForm'),
        isControlled: fields.is_controlled?.value === true || fields.is_controlled === true,
        schedule: getFieldValue(fields, 'schedule', 'dea_schedule')
      });
    }
  }
  
  console.log('[extractAllMedications] Final unique medications:', medications.length, medications.map(m => m.name));
  return medications;
}

// Format medications for prompt text
function formatMedicationsForPrompt(medications: ExtractedMedication[]): string {
  if (medications.length === 0) return 'No medications found';
  
  if (medications.length === 1) {
    const med = medications[0];
    return `- Medication: ${med.name}
- Strength: ${med.strength || 'Not specified'}
- Directions (SIG): ${med.sig || 'Not specified'}
- Route: ${med.route || 'oral'}
- Quantity: ${med.quantity || 'Not specified'}
- Refills: ${med.refills || 'Not specified'}`;
  }
  
  return medications.map((med, index) => `
MEDICATION ${index + 1}:
- Name: ${med.name}
- Strength: ${med.strength || 'Not specified'}
- Directions (SIG): ${med.sig || 'Not specified'}
- Route: ${med.route || 'oral'}
- Quantity: ${med.quantity || 'Not specified'}
- Refills: ${med.refills || 'Not specified'}
${med.isControlled ? `- CONTROLLED SUBSTANCE: Schedule ${med.schedule || 'Unknown'}` : ''}`).join('\n');
}

// ============================================
// HELPER: Call existing edge functions
// ============================================

async function callEdgeFunction(functionName: string, body: any): Promise<any> {
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    throw new Error('Supabase configuration missing');
  }
  
  const response = await fetch(`${SUPABASE_URL}/functions/v1/${functionName}`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body)
  });
  
  if (!response.ok) {
    const errorText = await response.text();
    console.error(`[${functionName}] API error:`, response.status, errorText);
    throw new Error(`Edge function error: ${response.status} - ${errorText}`);
  }
  
  return response.json();
}

// ============================================
// UNIVERSAL AI PROCESSOR INTEGRATION
// Uses ai-universal-processor edge function
// ============================================

async function callUniversalAI(
  agentId: string,
  prompt: string,
  customSystemPrompt?: string,
  preferredProvider?: AIProvider
): Promise<{ content: string; provider: string; model: string }> {
  const routing = getModelRouting(agentId, preferredProvider);
  const systemPrompt = customSystemPrompt || routing.systemPrompt;
  
  console.log(`[universal-ai] Agent: ${agentId}, Provider: ${routing.provider}, Model: ${routing.model}, UserPreferred: ${preferredProvider || 'auto'}`);
  
  try {
    // Call ai-universal-processor edge function
    const result = await callEdgeFunction('ai-universal-processor', {
      provider: routing.provider,
      model: routing.model,
      prompt: prompt,
      systemPrompt: systemPrompt,
      temperature: 0.3,
      maxTokens: 2000,
      action: 'generate'
    });
    
    if (result.error) {
      throw new Error(result.error);
    }
    
    return {
      content: result.content || '',
      provider: result.provider || routing.provider,
      model: result.model || routing.model
    };
  } catch (primaryError) {
    console.warn(`[universal-ai] Primary provider failed (${routing.provider}), trying fallback (${routing.fallbackProvider}):`, primaryError);
    
    // Try fallback provider
    try {
      const fallbackResult = await callEdgeFunction('ai-universal-processor', {
        provider: routing.fallbackProvider,
        model: routing.fallbackModel,
        prompt: prompt,
        systemPrompt: systemPrompt,
        temperature: 0.3,
        maxTokens: 2000,
        action: 'generate'
      });
      
      if (fallbackResult.error) {
        throw new Error(fallbackResult.error);
      }
      
      return {
        content: fallbackResult.content || '',
        provider: fallbackResult.provider || routing.fallbackProvider,
        model: fallbackResult.model || routing.fallbackModel
      };
    } catch (fallbackError) {
      console.error(`[universal-ai] Both providers failed:`, fallbackError);
      throw new Error(`AI analysis failed: ${primaryError instanceof Error ? primaryError.message : 'Unknown error'}`);
    }
  }
}

// ============================================
// REAL API-POWERED AGENTS
// ============================================

/**
 * NPI Verification Agent - Uses NPPES Registry API
 */
async function executeNPIVerification(context: DocumentContext): Promise<AgentFinding> {
  const fields = context.extractedFields || {};
  
  const npi = fields.npi?.value || fields.provider_npi?.value || fields.prescriber_npi?.value;
  const providerName = fields.provider_name?.value || fields.prescriber_name?.value;
  
  if (!npi && !providerName) {
    return {
      summary: 'NPI Verification: No NPI or provider name found in document',
      details: { status: 'no_data', npiFound: false },
      recommendations: ['Manual NPI entry required for verification'],
      alerts: [{ level: 'warning', message: 'No NPI or provider name extracted from document' }],
      confidence: 0.3,
      aiPowered: false,
      dataSource: 'NPPES Registry'
    };
  }

  try {
    console.log(`[npi-verification] Calling verify-npi for NPI: ${npi}, Name: ${providerName}`);
    
    const npiResult = await callEdgeFunction('verify-npi', {
      npi: npi,
      providerName: providerName
    });

    if (npiResult.success && npiResult.data) {
      const providerData = npiResult.data;
      return {
        summary: `NPI Verified: ${providerData.providerName || providerName} (${npi})`,
        details: {
          npi: npi,
          verified: true,
          providerName: providerData.providerName,
          providerType: providerData.providerType,
          credentials: providerData.credentials,
          specialty: providerData.specialty,
          address: providerData.address,
          status: providerData.status || 'Active',
          enumerationDate: providerData.enumerationDate,
          lastUpdated: providerData.lastUpdated
        },
        recommendations: [
          'Provider verified in NPPES registry',
          providerData.status === 'Active' ? 'NPI status is active' : 'Verify NPI status with provider'
        ],
        alerts: providerData.status !== 'Active' 
          ? [{ level: 'warning', message: `NPI status: ${providerData.status}` }]
          : [{ level: 'info', message: 'Provider verified and active in NPPES' }],
        confidence: 0.95,
        aiPowered: false,
        dataSource: 'NPPES Registry (CMS)'
      };
    } else {
      return {
        summary: `NPI Verification: Provider not found - ${npi || providerName}`,
        details: { 
          npi, 
          verified: false, 
          error: npiResult.error || 'Not found in NPPES registry' 
        },
        recommendations: ['Verify NPI number is correct', 'Check provider name spelling', 'Contact provider to confirm NPI'],
        alerts: [{ level: 'error', message: npiResult.error || 'Provider not found in NPPES registry' }],
        confidence: 0.4,
        aiPowered: false,
        dataSource: 'NPPES Registry (CMS)'
      };
    }
  } catch (error) {
    console.error('[npi-verification] Error:', error);
    return {
      summary: 'NPI Verification: API error',
      details: { npi, verified: false, error: error instanceof Error ? error.message : 'Unknown error' },
      recommendations: ['Retry verification', 'Check NPPES API availability'],
      alerts: [{ level: 'error', message: `Verification failed: ${error instanceof Error ? error.message : 'Unknown error'}` }],
      confidence: 0.2,
      aiPowered: false,
      dataSource: 'NPPES Registry (CMS)'
    };
  }
}

/**
 * Drug Lookup Agent - Uses FDA OpenFDA API + RxNorm
 * ENHANCED: Supports MULTIPLE medications in a single prescription
 */
async function executeDrugLookup(context: DocumentContext): Promise<AgentFinding> {
  const fields = context.extractedFields || {};
  
  // Collect ALL medications from the prescription
  const medications: Array<{ name: string; strength?: string; sig?: string; ndc?: string }> = [];
  
  // Check for medications array (new multi-drug format)
  // Handle direct array, wrapped {value: [...], confidence} format, AND JSON string
  let medicationsArray: any[] | null = null;
  
  if (Array.isArray(fields.medications)) {
    medicationsArray = fields.medications;
  } else if (fields.medications?.value) {
    if (Array.isArray(fields.medications.value)) {
      medicationsArray = fields.medications.value;
    } else if (typeof fields.medications.value === 'string') {
      try {
        const parsed = JSON.parse(fields.medications.value);
        if (Array.isArray(parsed)) {
          medicationsArray = parsed;
          console.log('[drug-lookup] Parsed medications from JSON string');
        }
      } catch (e) {
        console.log('[drug-lookup] Failed to parse medications JSON string:', e);
      }
    }
  }
    
  if (medicationsArray) {
    console.log('[drug-lookup] Processing medications array with', medicationsArray.length, 'items');
    medicationsArray.forEach((med: any) => {
      const brand = med.brand_name || med.brandName;
      const generic = med.generic_name || med.genericName;
      const primary =
        med.medication_name || med.medicationName ||
        med.drug_name || med.drugName ||
        brand || generic ||
        med.product_name || med.productName ||
        med.name || med.drug || med.medication || med.rx;
      const medName = brand && generic && brand.toLowerCase().trim() !== generic.toLowerCase().trim()
        ? `${brand} (${generic})`
        : primary;
      if (medName) {
        medications.push({
          name: medName,
          strength: med.strength || med.dosage || med.form,
          sig: med.sig || med.directions || med.sig_text,
          ndc: med.ndc || med.ndc_code
        });
      }
    });
  }
  
  // Check for numbered medications (medication_1_name, medication_2_name, etc.)
  for (let i = 1; i <= 10; i++) {
    const medName = getFieldValue(fields, `medication_${i}_name`, `med_${i}_name`, `drug_${i}`);
    if (medName && !medications.find(m => m.name === medName)) { // Avoid duplicates
      medications.push({
        name: medName,
        strength: getFieldValue(fields, `medication_${i}_strength`, `medication_${i}_form`, `med_${i}_strength`),
        sig: getFieldValue(fields, `medication_${i}_sig`, `med_${i}_sig`),
        ndc: getFieldValue(fields, `medication_${i}_ndc`, `med_${i}_ndc`)
      });
    }
  }
  
  // Fallback to primary medication field
  if (medications.length === 0) {
    const primaryDrug = getMedicationName(fields);
    if (primaryDrug !== 'Unknown') {
      medications.push({
        name: primaryDrug,
        strength: getDosage(fields),
        sig: getFrequency(fields),
        ndc: getNDC(fields)
      });
    }
  }
  
  console.log('[drug-lookup] Found medications:', medications.length, medications.map(m => m.name));
  console.log('[drug-lookup] Available fields:', Object.keys(fields));
  
  if (medications.length === 0) {
    return {
      summary: 'Drug Lookup: No medication name or NDC found',
      details: { 
        status: 'no_data',
        medicationCount: 0,
        availableFields: Object.keys(fields),
        fieldsContent: Object.fromEntries(
          Object.entries(fields).slice(0, 10).map(([k, v]) => [k, typeof v === 'object' ? v.value : v])
        )
      },
      recommendations: ['Manual medication entry required', 'Verify document extraction worked correctly'],
      alerts: [{ level: 'warning', message: 'No medication data extracted from document' }],
      confidence: 0.3,
      aiPowered: false,
      dataSource: 'FDA OpenFDA + RxNorm'
    };
  }

  try {
    // Look up ALL medications in parallel
    console.log(`[drug-lookup] Looking up ${medications.length} medication(s) in parallel...`);
    
    const lookupPromises = medications.map(async (med) => {
      try {
        const drugResult = await callEdgeFunction('drug-lookup', {
          drugName: med.name,
          searchType: 'all'
        });
        return { medication: med, result: drugResult, error: null };
      } catch (error) {
        console.error(`[drug-lookup] Error looking up ${med.name}:`, error);
        return { medication: med, result: null, error };
      }
    });
    
    const lookupResults = await Promise.all(lookupPromises);
    
    // Aggregate results
    const allMedications: any[] = [];
    const allAlerts: Array<{ level: 'info' | 'warning' | 'error'; message: string }> = [];
    const allRecommendations: string[] = [];
    let totalConfidence = 0;
    let verifiedCount = 0;
    let controlledCount = 0;
    
    for (const { medication, result, error } of lookupResults) {
      if (error || !result) {
        allMedications.push({
          searchedDrug: medication.name,
          strength: medication.strength,
          sig: medication.sig,
          verified: false,
          error: error instanceof Error ? error.message : 'Lookup failed'
        });
        allAlerts.push({ level: 'warning', message: `Could not verify: ${medication.name}` });
        continue;
      }
      
      const ndcInfo = result.ndc?.[0];
      const rxnormInfo = result.rxnorm?.[0];
      const clinicalInfo = result.clinicalInfo || [];
      const hasData = ndcInfo || rxnormInfo;
      
      const medDetails: any = {
        searchedDrug: medication.name,
        prescribedStrength: medication.strength,
        prescribedSig: medication.sig,
        verified: hasData,
        correctedName: result.correctedName,
        wasCorrected: result.wasCorrected,
        ndcCode: ndcInfo?.code,
        genericName: ndcInfo?.genericName,
        brandName: ndcInfo?.brandName,
        manufacturer: ndcInfo?.manufacturer,
        dosageForm: ndcInfo?.dosageForm,
        route: ndcInfo?.route,
        strength: ndcInfo?.strength,
        pharmClass: ndcInfo?.pharmClass,
        rxcui: rxnormInfo?.rxcui,
        isControlled: result.isControlled,
        schedule: result.schedule,
        interactionCount: clinicalInfo.length,
        interactions: clinicalInfo.filter((c: any) => c.type === 'interaction').slice(0, 3),
        warnings: clinicalInfo.filter((c: any) => c.type === 'warning').slice(0, 3)
      };
      
      allMedications.push(medDetails);
      
      if (hasData) {
        verifiedCount++;
        totalConfidence += 0.92;
      } else {
        totalConfidence += 0.5;
      }
      
      // Add clinical alerts for this medication
      clinicalInfo.forEach((info: any) => {
        const prefix = medications.length > 1 ? `[${medication.name}] ` : '';
        if (info.severity === 'high') {
          allAlerts.push({ level: 'error', message: prefix + info.description });
        } else if (info.severity === 'medium') {
          allAlerts.push({ level: 'warning', message: prefix + info.description });
        }
      });
      
      if (result.isControlled) {
        controlledCount++;
        allAlerts.push({ level: 'warning', message: `${medication.name}: Controlled substance - Schedule ${result.schedule}` });
      }
      
      if (result.wasCorrected) {
        allRecommendations.push(`${medication.name} corrected to "${result.correctedName}"`);
      }
    }
    
    // Build summary
    const summaryParts: string[] = [];
    if (medications.length > 1) {
      summaryParts.push(`${medications.length} Medications Analyzed`);
      summaryParts.push(`${verifiedCount}/${medications.length} verified in FDA database`);
    } else {
      const firstMed = allMedications[0];
      summaryParts.push(firstMed?.verified 
        ? `Drug Found: ${firstMed.brandName || firstMed.genericName || medications[0].name}`
        : `Drug Lookup: ${medications[0].name} - No FDA data found`);
    }
    if (controlledCount > 0) {
      summaryParts.push(`${controlledCount} controlled substance(s)`);
    }
    
    // Add standard recommendations
    if (verifiedCount === medications.length) {
      allRecommendations.unshift('All medications verified in FDA database');
    } else if (verifiedCount > 0) {
      allRecommendations.unshift(`${verifiedCount}/${medications.length} medications verified`);
    } else {
      allRecommendations.unshift('Manual verification recommended for all medications');
    }
    
    if (controlledCount > 0) {
      allRecommendations.push('Verify DEA number and check PDMP for controlled substances');
    }
    
    // Calculate average confidence
    const avgConfidence = medications.length > 0 ? totalConfidence / medications.length : 0.5;
    
    // Add success info alert if no other alerts
    if (allAlerts.length === 0) {
      allAlerts.push({ 
        level: 'info', 
        message: verifiedCount > 0 
          ? `${verifiedCount} medication(s) verified in FDA database` 
          : 'No FDA data available' 
      });
    }
    
    return {
      summary: summaryParts.join(' | '),
      details: {
        medicationCount: medications.length,
        verifiedCount,
        controlledCount,
        medications: allMedications,
        // For backward compatibility, include first medication at top level
        searchedDrug: medications[0]?.name,
        correctedName: allMedications[0]?.correctedName,
        wasCorrected: allMedications[0]?.wasCorrected,
        ndcCode: allMedications[0]?.ndcCode,
        genericName: allMedications[0]?.genericName,
        brandName: allMedications[0]?.brandName,
        manufacturer: allMedications[0]?.manufacturer,
        dosageForm: allMedications[0]?.dosageForm,
        route: allMedications[0]?.route,
        strength: allMedications[0]?.strength,
        pharmClass: allMedications[0]?.pharmClass,
        rxcui: allMedications[0]?.rxcui,
        isControlled: allMedications[0]?.isControlled,
        schedule: allMedications[0]?.schedule
      },
      recommendations: allRecommendations.slice(0, 5),
      alerts: allAlerts.slice(0, 10),
      confidence: avgConfidence,
      aiPowered: false,
      dataSource: 'FDA OpenFDA + NIH RxNorm'
    };
  } catch (error) {
    console.error('[drug-lookup] Error:', error);
    return {
      summary: `Drug Lookup: API error for ${medications.map(m => m.name).join(', ')}`,
      details: { 
        medications: medications.map(m => m.name), 
        error: error instanceof Error ? error.message : 'Unknown error' 
      },
      recommendations: ['Retry drug lookup', 'Check FDA API availability'],
      alerts: [{ level: 'error', message: `Lookup failed: ${error instanceof Error ? error.message : 'Unknown error'}` }],
      confidence: 0.2,
      aiPowered: false,
      dataSource: 'FDA OpenFDA + NIH RxNorm'
    };
  }
}

// ============================================
// UNIVERSAL AI POWERED AGENTS
// Uses ai-universal-processor with intelligent routing
// ============================================

async function executeClinicalReviewAI(context: DocumentContext): Promise<AgentFinding> {
  const fields = context.extractedFields || {};
  
  // Extract ALL medications from the prescription
  const medications = extractAllMedications(fields);
  const patientInfo = getFieldValue(fields, 'patient_name', 'patientName', 'patient') || 'Patient';
  const diagnosis = getFieldValue(fields, 'diagnosis', 'icd_code', 'indication') || 'Not specified';
  const patientWeight = getFieldValue(fields, 'patient_weight', 'weight') || '';
  const patientAge = getFieldValue(fields, 'patient_age', 'age', 'dob') || '';
  const allergies = getFieldValue(fields, 'allergies', 'patient_allergies', 'known_allergies') || 'None reported';
  
  console.log('[clinical-review-ai] Extracted medications:', medications.length, medications.map(m => m.name));
  console.log('[clinical-review-ai] Available fields:', Object.keys(fields));

  if (medications.length === 0) {
    return {
      summary: 'Clinical Review: No medications found to analyze',
      details: { medicationCount: 0, error: 'No medication data extracted' },
      recommendations: ['Verify document extraction worked correctly'],
      alerts: [{ level: 'warning', message: 'No medication data available for clinical review' }],
      confidence: 0.2,
      aiPowered: false,
      dataSource: 'No data extracted'
    };
  }

  const isMultiMed = medications.length > 1;
  const medicationsText = formatMedicationsForPrompt(medications);

  const prompt = `Analyze the following prescription data and provide a comprehensive clinical assessment.

PATIENT INFORMATION:
- Patient: ${patientInfo}
- Age: ${patientAge || 'Not specified'}
- Weight: ${patientWeight || 'Not specified'}
- Allergies: ${allergies}
- Diagnosis/Indication: ${diagnosis}
- Document Type: ${context.documentType}

PRESCRIPTION DATA (${medications.length} medication${isMultiMed ? 's' : ''}):
${medicationsText}

${context.rawText ? `Additional document text: ${context.rawText.slice(0, 500)}` : ''}

Provide your clinical review in the following JSON format:
{
  "summary": "Brief 1-sentence clinical assessment covering all medications",
  "overallAssessment": "appropriate" | "needs_review" | "concern",
  "medicationReviews": [
    {
      "medication": "drug name",
      "appropriateness": "appropriate" | "needs_review" | "concern",
      "dosageAssessment": "within_range" | "low" | "high" | "needs_verification",
      "frequencyAssessment": "appropriate" | "unusual" | "concern",
      "sigInterpretation": "Plain English translation of the sig",
      "clinicalNotes": "Any specific clinical considerations"
    }
  ],
  ${isMultiMed ? '"drugDrugInteractions": [{"drugs": ["drug1", "drug2"], "severity": "mild|moderate|severe", "effect": "description"}],' : ''}
  "therapeuticDuplication": ${isMultiMed ? '["List any therapeutic duplications"]' : '[]'},
  "allergyConflicts": ["List any potential allergy conflicts"],
  "controlledSubstanceNotes": "Notes about any controlled substances",
  "recommendations": ["List 3-5 specific clinical recommendations"],
  "alerts": [{"level": "info|warning|error", "message": "alert message"}],
  "confidence": 0.0 to 1.0
}

CLINICAL REVIEW FOCUS:
1. Dosage appropriateness for each medication and indication
2. Frequency and route appropriateness for each medication
3. ${isMultiMed ? 'Drug-drug interactions between the prescribed medications' : 'Potential interactions with common medications'}
4. Therapeutic duplication (same drug class prescribed twice)
5. Allergy cross-reactivity
6. Patient safety considerations
7. Sig interpretation - translate abbreviations to plain English
8. Controlled substance verification if applicable

Respond ONLY with the JSON object, no additional text.`;

  try {
    const aiResult = await callUniversalAI('clinical-review', prompt, undefined, context.preferredProvider);
    
    console.log('[clinical-review-ai] Provider:', aiResult.provider, 'Model:', aiResult.model);
    
    const jsonMatch = aiResult.content.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      
      // Count concerns across all medication reviews
      const concernCount = (parsed.medicationReviews || []).filter(
        (r: any) => r.appropriateness === 'concern' || r.dosageAssessment === 'high'
      ).length;
      
      const interactionCount = (parsed.drugDrugInteractions || []).length;
      const duplicationCount = (parsed.therapeuticDuplication || []).length;
      
      // Build alerts
      const alerts = parsed.alerts || [];
      if (interactionCount > 0) {
        const severeInteractions = (parsed.drugDrugInteractions || []).filter((i: any) => i.severity === 'severe');
        if (severeInteractions.length > 0) {
          alerts.push({ level: 'error', message: `${severeInteractions.length} SEVERE drug-drug interaction(s) detected!` });
        }
      }
      if (duplicationCount > 0) {
        alerts.push({ level: 'warning', message: `${duplicationCount} therapeutic duplication(s) found` });
      }
      
      return {
        summary: parsed.summary || `Clinical review: ${medications.length} medication(s) - ${parsed.overallAssessment || 'Assessment complete'}`,
        details: {
          medicationCount: medications.length,
          medications: medications.map(m => m.name),
          medicationReviews: parsed.medicationReviews || [],
          overallAssessment: parsed.overallAssessment || 'needs_review',
          drugDrugInteractions: parsed.drugDrugInteractions || [],
          therapeuticDuplication: parsed.therapeuticDuplication || [],
          allergyConflicts: parsed.allergyConflicts || [],
          controlledSubstanceNotes: parsed.controlledSubstanceNotes || '',
          concernCount,
          interactionCount,
          duplicationCount,
          aiAnalysis: true
        },
        recommendations: parsed.recommendations || ['Review prescription with prescriber'],
        alerts,
        confidence: parsed.confidence || 0.85,
        aiPowered: true,
        provider: aiResult.provider,
        model: aiResult.model,
        dataSource: `Universal AI (${aiResult.provider.charAt(0).toUpperCase() + aiResult.provider.slice(1)})`
      };
    }

    throw new Error('Failed to parse AI response');
  } catch (error) {
    console.error('[clinical-review-ai] Error:', error);
    return executeClinicalReviewFallback(context);
  }
}

async function executeDrugInteractionAI(context: DocumentContext): Promise<AgentFinding> {
  const fields = context.extractedFields || {};
  
  // Extract ALL medications from the prescription
  const medications = extractAllMedications(fields);
  
  console.log('[drug-interaction-ai] Extracted medications:', medications.length, medications.map(m => m.name));
  console.log('[drug-interaction-ai] Available fields:', Object.keys(fields));
  
  // Check if we have valid data
  if (medications.length === 0) {
    return {
      summary: 'Insufficient data to perform medication interaction analysis',
      details: { 
        medicationCount: 0, 
        availableFields: Object.keys(fields),
        error: 'No medication names found in extracted fields'
      },
      recommendations: ['Verify medication name was extracted correctly', 'Check document quality'],
      alerts: [{ level: 'warning', message: 'Insufficient data to perform medication interaction analysis' }],
      confidence: 0.1,
      aiPowered: false,
      dataSource: 'No data extracted'
    };
  }

  const isMultiMed = medications.length > 1;

  // Get FDA data for ALL medications in parallel
  const fdaDataPromises = medications.map(async (med) => {
    try {
      const drugData = await callEdgeFunction('drug-lookup', { drugName: med.name, searchType: 'all' });
      return {
        medication: med.name,
        genericName: drugData.ndc?.[0]?.genericName,
        brandName: drugData.ndc?.[0]?.brandName,
        pharmClass: drugData.ndc?.[0]?.pharmClass || [],
        route: drugData.ndc?.[0]?.route,
        isControlled: drugData.isControlled,
        schedule: drugData.schedule,
        clinicalInfo: drugData.clinicalInfo || []
      };
    } catch (e) {
      console.log(`[drug-interaction-ai] FDA lookup failed for ${med.name}`);
      return { medication: med.name, error: true };
    }
  });

  const fdaResults = await Promise.all(fdaDataPromises);
  
  // Build FDA context for prompt
  const fdaContext = fdaResults.filter(r => !r.error).map((r, i) => `
FDA DATA FOR ${r.medication}:
- Generic Name: ${r.genericName || 'Not found'}
- Brand Name: ${r.brandName || 'Not found'}
- Drug Class: ${r.pharmClass.join(', ') || 'Unknown'}
- Route: ${r.route || 'Not specified'}
${r.isControlled ? `- CONTROLLED: Schedule ${r.schedule}` : ''}
- Known Interactions: ${r.clinicalInfo.slice(0, 3).map((c: any) => c.description).join('; ').slice(0, 200)}`
  ).join('\n');

  const medicationsText = formatMedicationsForPrompt(medications);

  const prompt = `Analyze ${isMultiMed ? 'these medications' : 'this medication'} for potential interactions and safety concerns.

PRESCRIPTION MEDICATIONS (${medications.length}):
${medicationsText}

${fdaContext}

${context.rawText ? `Additional context: ${context.rawText.slice(0, 400)}` : ''}

Provide your drug interaction analysis in the following JSON format:
{
  "summary": "Brief 1-sentence summary of overall findings",
  "medicationCount": ${medications.length},
  "medicationAnalyses": [
    {
      "medication": "drug name",
      "drugClass": "Identified drug class",
      "isControlled": true/false,
      "schedule": "II/III/IV/V or null",
      "commonInteractions": [{"drug": "drug name", "severity": "mild|moderate|severe", "effect": "description"}],
      "foodInteractions": ["List food interactions"],
      "contraindications": ["List contraindications"],
      "precautions": ["List precautions"]
    }
  ],
  ${isMultiMed ? `"drugDrugInteractions": [
    {"drug1": "first drug", "drug2": "second drug", "severity": "mild|moderate|severe", "effect": "description", "mechanism": "brief mechanism", "clinicalSignificance": "high|moderate|low"}
  ],` : ''}
  "overallRiskLevel": "low|moderate|high|critical",
  "recommendations": ["3-5 specific recommendations"],
  "alerts": [{"level": "info|warning|error", "message": "alert message"}],
  "confidence": 0.0 to 1.0
}

${isMultiMed ? `CRITICAL: Analyze interactions BETWEEN the ${medications.length} medications prescribed together. This is essential for patient safety.` : ''}

Focus on:
1. ${isMultiMed ? 'Drug-drug interactions between the prescribed medications' : 'Common drug interactions'}
2. Drug-food interactions
3. Contraindications and precautions
4. Controlled substance considerations
5. Patient safety concerns

Respond ONLY with the JSON object.`;

  try {
    const aiResult = await callUniversalAI('drug-interaction', prompt, undefined, context.preferredProvider);
    
    console.log('[drug-interaction-ai] Provider:', aiResult.provider, 'Model:', aiResult.model);
    
    const jsonMatch = aiResult.content.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      
      // Count all interactions
      let totalInteractions = 0;
      (parsed.medicationAnalyses || []).forEach((ma: any) => {
        totalInteractions += (ma.commonInteractions?.length || 0);
        totalInteractions += (ma.foodInteractions?.length || 0);
      });
      const drugDrugCount = (parsed.drugDrugInteractions || []).length;
      
      // Build alerts
      const alerts = parsed.alerts || [];
      
      // Add severe interaction alerts
      if (isMultiMed && drugDrugCount > 0) {
        const severeInteractions = (parsed.drugDrugInteractions || []).filter((i: any) => i.severity === 'severe');
        if (severeInteractions.length > 0) {
          alerts.unshift({ 
            level: 'error', 
            message: `⚠️ ${severeInteractions.length} SEVERE drug-drug interaction(s) detected between prescribed medications!` 
          });
        }
        const moderateInteractions = (parsed.drugDrugInteractions || []).filter((i: any) => i.severity === 'moderate');
        if (moderateInteractions.length > 0) {
          alerts.push({ 
            level: 'warning', 
            message: `${moderateInteractions.length} moderate drug-drug interaction(s) require monitoring` 
          });
        }
      }
      
      // Add controlled substance alerts
      const controlledMeds = fdaResults.filter(r => r.isControlled);
      if (controlledMeds.length > 1) {
        alerts.push({ 
          level: 'warning', 
          message: `Multiple controlled substances prescribed: ${controlledMeds.map(c => c.medication).join(', ')}` 
        });
      }
      
      return {
        summary: parsed.summary || `Drug interaction check: ${medications.length} medication(s) - ${drugDrugCount} interaction(s)`,
        details: {
          medicationCount: medications.length,
          medications: medications.map(m => m.name),
          medicationAnalyses: parsed.medicationAnalyses || [],
          drugDrugInteractions: parsed.drugDrugInteractions || [],
          drugDrugInteractionCount: drugDrugCount,
          totalInteractionCount: totalInteractions + drugDrugCount,
          overallRiskLevel: parsed.overallRiskLevel || 'low',
          controlledSubstanceCount: controlledMeds.length,
          aiAnalysis: true
        },
        recommendations: parsed.recommendations || ['Review with pharmacist before dispensing'],
        alerts,
        confidence: parsed.confidence || 0.88,
        aiPowered: true,
        provider: aiResult.provider,
        model: aiResult.model,
        dataSource: `Universal AI (${aiResult.provider.charAt(0).toUpperCase() + aiResult.provider.slice(1)}) + FDA`
      };
    }

    throw new Error('Failed to parse AI response');
  } catch (error) {
    console.error('[drug-interaction-ai] Error:', error);
    return executeDrugInteractionFallback(context);
  }
}

async function executeRadiologyAnalysisAI(context: DocumentContext): Promise<AgentFinding> {
  const fields = context.extractedFields || {};
  
  const modality = context.documentType || fields.modality?.value || 'X-ray';
  const bodyPart = fields.body_part?.value || fields.anatomy?.value || 'Not specified';
  const findings = fields.findings?.value || fields.impression?.value || '';
  const clinicalHistory = fields.clinical_history?.value || fields.indication?.value || '';

  const prompt = `Analyze the following radiology study data and provide a structured assessment.

RADIOLOGY STUDY DATA:
- Modality: ${modality}
- Body Part/Region: ${bodyPart}
- Clinical History/Indication: ${clinicalHistory}
- Extracted Findings: ${findings || 'No findings extracted'}

${context.rawText ? `Report text: ${context.rawText.slice(0, 800)}` : ''}

Provide your radiology analysis in the following JSON format:
{
  "summary": "Brief 1-sentence impression",
  "quality": "adequate|limited|non-diagnostic",
  "findings": [
    {"finding": "description", "location": "anatomic location", "significance": "normal|incidental|abnormal|critical"}
  ],
  "differentials": ["List differential diagnoses if abnormal"],
  "followUp": "none|routine|urgent|emergent",
  "recommendations": ["2-3 specific recommendations"],
  "alerts": [{"level": "info|warning|error", "message": "alert message"}],
  "confidence": 0.0 to 1.0
}

Focus on actionable findings. If critical findings are present, flag them clearly. Respond ONLY with the JSON object.`;

  try {
    const aiResult = await callUniversalAI('radiology-ai', prompt, undefined, context.preferredProvider);
    
    console.log('[radiology-ai] Provider:', aiResult.provider, 'Model:', aiResult.model);
    
    const jsonMatch = aiResult.content.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      const abnormalFindings = (parsed.findings || []).filter((f: any) => f.significance === 'abnormal' || f.significance === 'critical');
      
      const alerts = parsed.alerts || [];
      if (parsed.followUp === 'emergent') {
        alerts.push({ level: 'error', message: 'Emergent finding - immediate attention required' });
      } else if (parsed.followUp === 'urgent') {
        alerts.push({ level: 'warning', message: 'Urgent finding - expedited follow-up recommended' });
      }
      
      return {
        summary: parsed.summary || `Radiology analysis: ${modality} - ${abnormalFindings.length} abnormal finding(s)`,
        details: {
          modality,
          bodyPart,
          quality: parsed.quality || 'adequate',
          findings: parsed.findings || [],
          differentials: parsed.differentials || [],
          followUp: parsed.followUp || 'routine',
          abnormalCount: abnormalFindings.length,
          aiAnalysis: true
        },
        recommendations: parsed.recommendations || ['Review study with radiologist'],
        alerts,
        confidence: parsed.confidence || 0.82,
        aiPowered: true,
        provider: aiResult.provider,
        model: aiResult.model,
        dataSource: `Universal AI (${aiResult.provider.charAt(0).toUpperCase() + aiResult.provider.slice(1)})`
      };
    }

    throw new Error('Failed to parse AI response');
  } catch (error) {
    console.error('[radiology-ai] Error:', error);
    return executeRadiologyAnalysisFallback(context);
  }
}

async function executeLabAnalysisAI(context: DocumentContext): Promise<AgentFinding> {
  const fields = context.extractedFields || {};
  
  const labValues: string[] = [];
  for (const [key, fieldData] of Object.entries(fields)) {
    const value = typeof fieldData === 'object' ? fieldData.value : fieldData;
    if (value && key.toLowerCase().match(/(glucose|potassium|sodium|creatinine|hemoglobin|hematocrit|wbc|rbc|platelet|bun|alt|ast|bilirubin|albumin|calcium|phosphorus|magnesium|tsh|t3|t4|inr|ptt|pt|troponin|bnp|lipase|amylase|hba1c|ldl|hdl|triglycerides|cholesterol)/)) {
      labValues.push(`${key}: ${value}`);
    }
  }

  const prompt = `Analyze these lab results and identify any critical values or concerning trends.

LAB DATA:
${labValues.length > 0 ? labValues.join('\n') : 'Lab values extracted from document'}

${context.rawText ? `Lab report text: ${context.rawText.slice(0, 600)}` : ''}

Document Type: ${context.documentType}

Provide your lab analysis in the following JSON format:
{
  "summary": "Brief 1-sentence summary of lab results",
  "criticalValues": [
    {"test": "test name", "value": "result", "normalRange": "reference range", "interpretation": "interpretation"}
  ],
  "abnormalValues": [
    {"test": "test name", "value": "result", "direction": "high|low", "significance": "mild|moderate|severe"}
  ],
  "patterns": ["Identified patterns or correlations"],
  "clinicalSignificance": "Normal|Abnormal - monitor|Abnormal - action needed|Critical",
  "recommendations": ["2-3 specific recommendations"],
  "alerts": [{"level": "info|warning|error", "message": "alert message"}],
  "confidence": 0.0 to 1.0
}

Flag any critical values that require immediate notification. Respond ONLY with the JSON object.`;

  try {
    const aiResult = await callUniversalAI('critical-value-alert', prompt, undefined, context.preferredProvider);
    
    console.log('[lab-analysis-ai] Provider:', aiResult.provider, 'Model:', aiResult.model);
    
    const jsonMatch = aiResult.content.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      const criticalCount = parsed.criticalValues?.length || 0;
      
      const alerts = parsed.alerts || [];
      if (criticalCount > 0) {
        alerts.push({ level: 'error', message: `${criticalCount} critical value(s) detected - immediate notification required` });
      }
      
      return {
        summary: parsed.summary || `Lab Analysis: ${criticalCount > 0 ? `${criticalCount} critical value(s)!` : 'Results reviewed'}`,
        details: {
          criticalValues: parsed.criticalValues || [],
          abnormalValues: parsed.abnormalValues || [],
          patterns: parsed.patterns || [],
          clinicalSignificance: parsed.clinicalSignificance || 'Normal',
          criticalCount,
          aiAnalysis: true
        },
        recommendations: parsed.recommendations || ['Review with ordering provider'],
        alerts,
        confidence: parsed.confidence || 0.9,
        aiPowered: true,
        provider: aiResult.provider,
        model: aiResult.model,
        dataSource: `Universal AI (${aiResult.provider.charAt(0).toUpperCase() + aiResult.provider.slice(1)})`
      };
    }

    throw new Error('Failed to parse AI response');
  } catch (error) {
    console.error('[lab-analysis-ai] Error:', error);
    return executeLabAnalysisFallback(context);
  }
}

// ============================================
// FALLBACK RULE-BASED AGENTS
// ============================================

function executeClinicalReviewFallback(context: DocumentContext): AgentFinding {
  const fields = context.extractedFields || {};
  const alerts: Array<{ level: 'info' | 'warning' | 'error'; message: string }> = [];
  
  // Extract all medications
  const medications = extractAllMedications(fields);
  
  medications.forEach((med, index) => {
    const prefix = medications.length > 1 ? `[${med.name}] ` : '';
    
    if (med.strength) {
      const doseValue = parseFloat(med.strength);
      if (doseValue > 1000) {
        alerts.push({ level: 'warning', message: `${prefix}High dosage detected - verify with prescriber` });
      }
    }

    if (med.sig?.toLowerCase().includes('prn')) {
      alerts.push({ level: 'info', message: `${prefix}PRN medication - ensure patient instructions are clear` });
    }
    
    if (med.isControlled) {
      alerts.push({ level: 'warning', message: `${prefix}Controlled substance (Schedule ${med.schedule || 'Unknown'})` });
    }
  });

  // Check for potential therapeutic duplication in multi-med prescriptions
  if (medications.length > 1) {
    alerts.push({ level: 'info', message: `${medications.length} medications prescribed - verify for interactions` });
  }

  return {
    summary: `Clinical review: ${medications.length} medication(s) - Rule-based assessment`,
    details: { 
      medicationCount: medications.length,
      medications: medications.map(m => ({ name: m.name, strength: m.strength, sig: m.sig })),
      appropriateness: 'needs_review', 
      fallbackMode: true 
    },
    recommendations: ['AI analysis unavailable - manual clinical review recommended'],
    alerts,
    confidence: 0.5,
    aiPowered: false,
    dataSource: 'Rule-based fallback'
  };
}

function executeDrugInteractionFallback(context: DocumentContext): AgentFinding {
  const fields = context.extractedFields || {};
  const alerts: Array<{ level: 'info' | 'warning' | 'error'; message: string }> = [];
  
  // Extract all medications
  const medications = extractAllMedications(fields);
  let controlledCount = 0;

  // Check each medication for known high-alert conditions
  const highAlertDrugs = ['warfarin', 'coumadin', 'heparin', 'insulin', 'metformin', 'digoxin', 'lithium', 'phenytoin'];
  
  medications.forEach((med, index) => {
    const medNameLower = med.name.toLowerCase();
    const prefix = medications.length > 1 ? `[${med.name}] ` : '';
    
    if (medNameLower.includes('warfarin') || medNameLower.includes('coumadin')) {
      alerts.push({ level: 'warning', message: `${prefix}Warfarin - Monitor INR closely` });
    }
    
    if (highAlertDrugs.some(drug => medNameLower.includes(drug))) {
      alerts.push({ level: 'info', message: `${prefix}High-alert medication - requires extra verification` });
    }
    
    if (med.isControlled) {
      controlledCount++;
      alerts.push({ level: 'warning', message: `${prefix}Controlled substance - DEA verification required` });
    }
  });

  // Multi-drug specific alerts
  if (medications.length > 1) {
    alerts.push({ level: 'warning', message: `${medications.length} medications - manual interaction check required` });
    
    if (controlledCount > 1) {
      alerts.push({ level: 'error', message: `${controlledCount} controlled substances - additional verification required` });
    }
  }

  return {
    summary: `Drug interaction check: ${medications.length} medication(s) - Rule-based check`,
    details: { 
      medicationCount: medications.length,
      medications: medications.map(m => m.name),
      controlledCount,
      fallbackMode: true, 
      alertCount: alerts.length 
    },
    recommendations: ['AI analysis unavailable - manual pharmacist review required'],
    alerts,
    confidence: 0.4,
    aiPowered: false,
    dataSource: 'Rule-based fallback'
  };
}

function executeRadiologyAnalysisFallback(context: DocumentContext): AgentFinding {
  const fields = context.extractedFields || {};
  const findingsText = fields.findings?.value || fields.impression?.value || '';
  const alerts: Array<{ level: 'info' | 'warning' | 'error'; message: string }> = [];

  if (findingsText.toLowerCase().includes('fracture')) {
    alerts.push({ level: 'error', message: 'Fracture identified - urgent consultation needed' });
  }
  if (findingsText.toLowerCase().includes('mass') || findingsText.toLowerCase().includes('lesion')) {
    alerts.push({ level: 'warning', message: 'Mass/lesion detected - recommend follow-up' });
  }

  return {
    summary: `Radiology analysis: ${context.documentType} - Rule-based assessment`,
    details: { modality: context.documentType, fallbackMode: true, findingsCount: alerts.length },
    recommendations: ['AI analysis unavailable - radiologist review required'],
    alerts,
    confidence: 0.4,
    aiPowered: false,
    dataSource: 'Rule-based fallback'
  };
}

function executeLabAnalysisFallback(context: DocumentContext): AgentFinding {
  const fields = context.extractedFields || {};
  const alerts: Array<{ level: 'info' | 'warning' | 'error'; message: string }> = [];
  let criticalCount = 0;

  for (const [key, fieldData] of Object.entries(fields)) {
    const value = typeof fieldData === 'object' ? fieldData.value : fieldData;
    const numValue = parseFloat(value);
    
    if (key.toLowerCase().includes('glucose') && (numValue > 400 || numValue < 50)) {
      alerts.push({ level: 'error', message: `Critical glucose: ${value}` });
      criticalCount++;
    }
    if (key.toLowerCase().includes('potassium') && (numValue > 6.0 || numValue < 2.5)) {
      alerts.push({ level: 'error', message: `Critical potassium: ${value}` });
      criticalCount++;
    }
  }

  return {
    summary: criticalCount > 0 ? `Lab Analysis: ${criticalCount} critical value(s)!` : 'Lab Analysis: Rule-based check',
    details: { criticalValuesFound: criticalCount, fallbackMode: true },
    recommendations: criticalCount > 0 ? ['Immediate physician notification'] : ['AI analysis unavailable - manual review recommended'],
    alerts,
    confidence: 0.45,
    aiPowered: false,
    dataSource: 'Rule-based fallback'
  };
}

// ============================================
// CONFIGURATION-REQUIRED AGENTS
// ============================================

function executeInsuranceVerification(context: DocumentContext): AgentFinding {
  const fields = context.extractedFields || {};
  const memberId = fields.member_id?.value || fields.insurance_id?.value;
  const groupNumber = fields.group_number?.value || fields.group_id?.value;
  const payerName = fields.payer_name?.value || fields.insurance_name?.value;

  return {
    summary: `Insurance: ${payerName || 'Unknown'} - Requires payer API integration`,
    details: {
      memberIdFound: !!memberId,
      groupNumberFound: !!groupNumber,
      payerIdentified: !!payerName,
      extractedData: { memberId, groupNumber, payerName },
      status: 'pending_integration',
      requiredSetup: ['Payer API credentials (Availity, Change Healthcare)', '270/271 EDI transaction setup', 'Provider NPI registration']
    },
    recommendations: [
      'Configure payer API integration to enable real-time verification',
      'Required: 270/271 EDI eligibility transaction setup'
    ],
    alerts: [{ level: 'info', message: 'Integration required: Payer eligibility APIs not configured' }],
    confidence: 0.3,
    aiPowered: false,
    dataSource: 'Configuration Required'
  };
}

function executePriorAuth(context: DocumentContext): AgentFinding {
  return {
    summary: 'Prior Authorization - Requires payer portal integration',
    details: {
      status: 'pending_integration',
      requiredSetup: ['CoverMyMeds or SureScripts API', 'Payer PA portal credentials', 'Provider credentialing']
    },
    recommendations: [
      'Configure prior authorization portal connections',
      'Required: CoverMyMeds, SureScripts, or payer-specific PA API setup'
    ],
    alerts: [{ level: 'info', message: 'Integration required: Prior auth APIs not configured' }],
    confidence: 0.2,
    aiPowered: false,
    dataSource: 'Configuration Required'
  };
}

// ============================================
// AI-POWERED MEDICATION AGENTS
// Uses FDA API + Universal AI for comprehensive analysis
// ============================================

/**
 * NDC Code Lookup Agent - Uses FDA OpenFDA API
 */
async function executeNDCLookup(context: DocumentContext): Promise<AgentFinding> {
  return await executeDrugLookup(context); // Uses same logic
}

/**
 * Drug Alternatives & Generics Agent - AI-powered with FDA data
 */
async function executeDrugAlternatives(context: DocumentContext): Promise<AgentFinding> {
  const fields = context.extractedFields || {};
  const medication = getMedicationName(fields);
  const dosage = getDosage(fields);

  if (medication === 'Unknown') {
    return {
      summary: 'Drug Alternatives: No medication name found',
      details: { status: 'no_data', availableFields: Object.keys(fields) },
      recommendations: ['Verify medication name was extracted correctly'],
      alerts: [{ level: 'warning', message: 'No medication data for alternatives analysis' }],
      confidence: 0.2,
      aiPowered: false,
      dataSource: 'No data'
    };
  }

  // Get FDA data first
  let fdaData = '';
  try {
    const drugResult = await callEdgeFunction('drug-lookup', { drugName: medication, searchType: 'all' });
    if (drugResult.alternatives?.length > 0) {
      fdaData = `\nFDA ALTERNATIVES:\n${drugResult.alternatives.map((a: any) => `- ${a.name}: ${a.type}`).join('\n')}`;
    }
    if (drugResult.ndc?.[0]) {
      fdaData += `\nDrug Class: ${(drugResult.ndc[0].pharmClass || []).join(', ')}`;
    }
  } catch (e) {
    console.log('[drug-alternatives] FDA lookup failed, using AI only');
  }

  const prompt = `Analyze this medication and provide generic equivalents and therapeutic alternatives.

MEDICATION DATA:
- Drug Name: ${medication}
- Dosage: ${dosage}
${fdaData}

Provide alternatives in JSON format:
{
  "summary": "Brief summary of available alternatives",
  "genericEquivalent": {"name": "generic name", "available": true/false, "costSavings": "estimated %"},
  "therapeuticAlternatives": [
    {"name": "drug name", "class": "drug class", "reason": "why suitable", "costComparison": "lower/similar/higher"}
  ],
  "biosimilars": [{"name": "name", "approved": true/false}],
  "patientAssistancePrograms": ["list any manufacturer programs"],
  "recommendations": ["2-3 recommendations"],
  "alerts": [{"level": "info|warning", "message": "message"}],
  "confidence": 0.0 to 1.0
}

Focus on clinically equivalent, cost-effective alternatives. Respond ONLY with JSON.`;

  try {
    const aiResult = await callUniversalAI('drug-alternatives', prompt, undefined, context.preferredProvider);
    const jsonMatch = aiResult.content.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      return {
        summary: parsed.summary || `Alternatives for ${medication}: ${parsed.therapeuticAlternatives?.length || 0} options found`,
        details: {
          medication,
          genericEquivalent: parsed.genericEquivalent,
          therapeuticAlternatives: parsed.therapeuticAlternatives || [],
          biosimilars: parsed.biosimilars || [],
          patientAssistancePrograms: parsed.patientAssistancePrograms || [],
          aiAnalysis: true
        },
        recommendations: parsed.recommendations || ['Discuss alternatives with prescriber'],
        alerts: parsed.alerts || [],
        confidence: parsed.confidence || 0.85,
        aiPowered: true,
        provider: aiResult.provider,
        model: aiResult.model,
        dataSource: `Universal AI (${aiResult.provider}) + FDA`
      };
    }
    throw new Error('Failed to parse AI response');
  } catch (error) {
    console.error('[drug-alternatives] Error:', error);
    return {
      summary: `Drug Alternatives: ${medication} - Analysis failed`,
      details: { medication, error: error instanceof Error ? error.message : 'Unknown error' },
      recommendations: ['Manual alternatives research recommended'],
      alerts: [{ level: 'warning', message: 'AI analysis unavailable' }],
      confidence: 0.3,
      aiPowered: false,
      dataSource: 'Fallback'
    };
  }
}

/**
 * Efficacy Analysis Agent - AI-powered clinical effectiveness analysis
 */
async function executeEfficacyAnalysis(context: DocumentContext): Promise<AgentFinding> {
  const fields = context.extractedFields || {};
  const medication = getMedicationName(fields);
  const diagnosis = getFieldValue(fields, 'diagnosis', 'indication', 'icd_code', 'condition') || 'Not specified';

  if (medication === 'Unknown') {
    return {
      summary: 'Efficacy Analysis: No medication data',
      details: { status: 'no_data' },
      recommendations: ['Verify medication data extracted'],
      alerts: [{ level: 'warning', message: 'Insufficient data for efficacy analysis' }],
      confidence: 0.2,
      aiPowered: false,
      dataSource: 'No data'
    };
  }

  const prompt = `Analyze the efficacy of this medication for the given condition.

MEDICATION: ${medication}
INDICATION/DIAGNOSIS: ${diagnosis}

Provide efficacy analysis in JSON format:
{
  "summary": "Brief efficacy summary",
  "efficacyRating": "high|moderate|low|variable",
  "evidenceLevel": "Level A - Strong|Level B - Moderate|Level C - Limited",
  "onsetOfAction": "time to effect",
  "typicalDuration": "treatment duration",
  "successRate": "percentage or range",
  "clinicalTrialData": {"available": true/false, "summary": "brief summary"},
  "firstLineTherapy": true/false,
  "alternativeIfIneffective": ["list alternatives"],
  "monitoringRequired": ["what to monitor"],
  "recommendations": ["2-3 recommendations"],
  "alerts": [{"level": "info|warning", "message": "message"}],
  "confidence": 0.0 to 1.0
}

Base analysis on current clinical guidelines and evidence. Respond ONLY with JSON.`;

  try {
    const aiResult = await callUniversalAI('efficacy-analysis', prompt, undefined, context.preferredProvider);
    const jsonMatch = aiResult.content.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      return {
        summary: parsed.summary || `Efficacy: ${medication} - ${parsed.efficacyRating || 'analyzed'}`,
        details: {
          medication,
          diagnosis,
          efficacyRating: parsed.efficacyRating,
          evidenceLevel: parsed.evidenceLevel,
          onsetOfAction: parsed.onsetOfAction,
          typicalDuration: parsed.typicalDuration,
          successRate: parsed.successRate,
          firstLineTherapy: parsed.firstLineTherapy,
          clinicalTrialData: parsed.clinicalTrialData,
          alternativeIfIneffective: parsed.alternativeIfIneffective,
          monitoringRequired: parsed.monitoringRequired,
          aiAnalysis: true
        },
        recommendations: parsed.recommendations || ['Monitor treatment response'],
        alerts: parsed.alerts || [],
        confidence: parsed.confidence || 0.82,
        aiPowered: true,
        provider: aiResult.provider,
        model: aiResult.model,
        dataSource: `Universal AI (${aiResult.provider})`
      };
    }
    throw new Error('Failed to parse AI response');
  } catch (error) {
    console.error('[efficacy-analysis] Error:', error);
    return {
      summary: `Efficacy Analysis: ${medication} - Failed`,
      details: { medication, diagnosis, error: error instanceof Error ? error.message : 'Unknown' },
      recommendations: ['Manual efficacy review recommended'],
      alerts: [{ level: 'warning', message: 'AI analysis unavailable' }],
      confidence: 0.3,
      aiPowered: false,
      dataSource: 'Fallback'
    };
  }
}

/**
 * Safety & Side Effects Agent - AI-powered with FDA warnings
 */
async function executeSafetyProfile(context: DocumentContext): Promise<AgentFinding> {
  const fields = context.extractedFields || {};
  const medication = getMedicationName(fields);
  const dosage = getDosage(fields);

  if (medication === 'Unknown') {
    return {
      summary: 'Safety Profile: No medication data',
      details: { status: 'no_data' },
      recommendations: ['Verify medication extracted'],
      alerts: [{ level: 'warning', message: 'No medication for safety analysis' }],
      confidence: 0.2,
      aiPowered: false,
      dataSource: 'No data'
    };
  }

  // Get FDA safety data
  let fdaSafetyData = '';
  try {
    const drugResult = await callEdgeFunction('drug-lookup', { drugName: medication, searchType: 'all' });
    const clinicalInfo = drugResult.clinicalInfo || [];
    if (clinicalInfo.length > 0) {
      fdaSafetyData = `\nFDA CLINICAL INFO:\n${clinicalInfo.map((c: any) => `- ${c.type}: ${c.description}`).join('\n')}`;
    }
    if (drugResult.isControlled) {
      fdaSafetyData += `\n- CONTROLLED SUBSTANCE: Schedule ${drugResult.schedule}`;
    }
  } catch (e) {
    console.log('[safety-profile] FDA lookup failed');
  }

  const prompt = `Provide a comprehensive safety profile for this medication.

MEDICATION: ${medication}
DOSAGE: ${dosage}
${fdaSafetyData}

Provide safety analysis in JSON format:
{
  "summary": "Brief safety summary",
  "blackBoxWarnings": ["list FDA black box warnings if any"],
  "commonSideEffects": [{"effect": "name", "frequency": "common/uncommon/rare", "severity": "mild|moderate|severe"}],
  "seriousSideEffects": [{"effect": "name", "monitoring": "how to monitor"}],
  "contraindications": ["absolute contraindications"],
  "precautions": ["use with caution in these conditions"],
  "pregnancyCategory": "A|B|C|D|X",
  "renalDosing": "adjustment needed?",
  "hepaticDosing": "adjustment needed?",
  "geriatricConsiderations": "special considerations",
  "recommendations": ["2-3 safety recommendations"],
  "alerts": [{"level": "info|warning|error", "message": "message"}],
  "confidence": 0.0 to 1.0
}

Flag any critical safety concerns. Respond ONLY with JSON.`;

  try {
    const aiResult = await callUniversalAI('safety-profile', prompt, undefined, context.preferredProvider);
    const jsonMatch = aiResult.content.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      const hasBlackBox = parsed.blackBoxWarnings?.length > 0;
      const alerts = parsed.alerts || [];
      if (hasBlackBox) {
        alerts.unshift({ level: 'error', message: `Black Box Warning: ${parsed.blackBoxWarnings[0]}` });
      }
      
      return {
        summary: parsed.summary || `Safety: ${medication} - ${hasBlackBox ? 'Black Box Warning!' : 'Reviewed'}`,
        details: {
          medication,
          dosage,
          blackBoxWarnings: parsed.blackBoxWarnings || [],
          commonSideEffects: parsed.commonSideEffects || [],
          seriousSideEffects: parsed.seriousSideEffects || [],
          contraindications: parsed.contraindications || [],
          precautions: parsed.precautions || [],
          pregnancyCategory: parsed.pregnancyCategory,
          renalDosing: parsed.renalDosing,
          hepaticDosing: parsed.hepaticDosing,
          geriatricConsiderations: parsed.geriatricConsiderations,
          aiAnalysis: true
        },
        recommendations: parsed.recommendations || ['Review safety profile with patient'],
        alerts,
        confidence: parsed.confidence || 0.88,
        aiPowered: true,
        provider: aiResult.provider,
        model: aiResult.model,
        dataSource: `Universal AI (${aiResult.provider}) + FDA`
      };
    }
    throw new Error('Failed to parse AI response');
  } catch (error) {
    console.error('[safety-profile] Error:', error);
    return {
      summary: `Safety Profile: ${medication} - Failed`,
      details: { medication, error: error instanceof Error ? error.message : 'Unknown' },
      recommendations: ['Manual safety review required'],
      alerts: [{ level: 'warning', message: 'AI analysis unavailable' }],
      confidence: 0.3,
      aiPowered: false,
      dataSource: 'Fallback'
    };
  }
}

/**
 * Dosage & Form Validation Agent - AI-powered with FDA data
 */
async function executeDosageValidation(context: DocumentContext): Promise<AgentFinding> {
  const fields = context.extractedFields || {};
  const medication = getMedicationName(fields);
  const dosage = getDosage(fields);
  const frequency = getFrequency(fields);
  const route = getFieldValue(fields, 'route', 'route_of_administration') || 'oral';
  const patientAge = getFieldValue(fields, 'patient_age', 'age', 'dob') || 'adult';

  if (medication === 'Unknown') {
    return {
      summary: 'Dosage Validation: No medication data',
      details: { status: 'no_data' },
      recommendations: ['Verify medication extracted'],
      alerts: [{ level: 'warning', message: 'No medication for dosage validation' }],
      confidence: 0.2,
      aiPowered: false,
      dataSource: 'No data'
    };
  }

  const prompt = `Validate the dosage and form for this prescription.

MEDICATION: ${medication}
DOSAGE/STRENGTH: ${dosage}
FREQUENCY/SIG: ${frequency}
ROUTE: ${route}
PATIENT AGE: ${patientAge}

Provide validation in JSON format:
{
  "summary": "Brief validation summary",
  "dosageAssessment": "appropriate|low|high|needs_review",
  "standardDoseRange": {"min": "value", "max": "value", "unit": "unit"},
  "prescribedWithinRange": true/false,
  "frequencyAssessment": "appropriate|unusual|excessive",
  "routeAppropriate": true/false,
  "formAvailable": true/false,
  "availableForms": ["tablet", "capsule", "liquid", etc],
  "ageAppropriate": true/false,
  "weightBasedDosing": "if applicable",
  "maxDailyDose": "value",
  "durationAppropriate": true/false,
  "recommendations": ["2-3 recommendations"],
  "alerts": [{"level": "info|warning|error", "message": "message"}],
  "confidence": 0.0 to 1.0
}

Flag any dosing concerns. Respond ONLY with JSON.`;

  try {
    const aiResult = await callUniversalAI('dosage-validation', prompt, undefined, context.preferredProvider);
    const jsonMatch = aiResult.content.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      return {
        summary: parsed.summary || `Dosage: ${medication} ${dosage} - ${parsed.dosageAssessment || 'reviewed'}`,
        details: {
          medication,
          dosage,
          frequency,
          route,
          dosageAssessment: parsed.dosageAssessment,
          standardDoseRange: parsed.standardDoseRange,
          prescribedWithinRange: parsed.prescribedWithinRange,
          frequencyAssessment: parsed.frequencyAssessment,
          routeAppropriate: parsed.routeAppropriate,
          formAvailable: parsed.formAvailable,
          availableForms: parsed.availableForms,
          ageAppropriate: parsed.ageAppropriate,
          maxDailyDose: parsed.maxDailyDose,
          aiAnalysis: true
        },
        recommendations: parsed.recommendations || ['Verify dosage with prescriber if concerns'],
        alerts: parsed.alerts || [],
        confidence: parsed.confidence || 0.85,
        aiPowered: true,
        provider: aiResult.provider,
        model: aiResult.model,
        dataSource: `Universal AI (${aiResult.provider})`
      };
    }
    throw new Error('Failed to parse AI response');
  } catch (error) {
    console.error('[dosage-validation] Error:', error);
    return {
      summary: `Dosage Validation: ${medication} - Failed`,
      details: { medication, dosage, error: error instanceof Error ? error.message : 'Unknown' },
      recommendations: ['Manual dosage verification required'],
      alerts: [{ level: 'warning', message: 'AI validation unavailable' }],
      confidence: 0.3,
      aiPowered: false,
      dataSource: 'Fallback'
    };
  }
}

/**
 * Cost-Effectiveness Agent - AI-powered pricing analysis
 */
async function executeCostAnalysis(context: DocumentContext): Promise<AgentFinding> {
  const fields = context.extractedFields || {};
  const medication = getMedicationName(fields);
  const dosage = getDosage(fields);

  if (medication === 'Unknown') {
    return {
      summary: 'Cost Analysis: No medication data',
      details: { status: 'no_data' },
      recommendations: ['Verify medication extracted'],
      alerts: [{ level: 'warning', message: 'No medication for cost analysis' }],
      confidence: 0.2,
      aiPowered: false,
      dataSource: 'No data'
    };
  }

  const prompt = `Analyze cost-effectiveness and provide savings options.

MEDICATION: ${medication}
DOSAGE: ${dosage}

Provide cost analysis in JSON format:
{
  "summary": "Brief cost summary",
  "estimatedBrandCost": {"monthly": "$X", "annual": "$X"},
  "estimatedGenericCost": {"monthly": "$X", "annual": "$X"},
  "potentialSavings": {"monthly": "$X", "percentage": "X%"},
  "genericAvailable": true/false,
  "genericName": "name if different",
  "therapeuticAlternativeSavings": [{"drug": "name", "savings": "amount/percentage"}],
  "patientAssistancePrograms": [{"program": "name", "eligibility": "criteria", "benefit": "description"}],
  "manufacturerCoupons": true/false,
  "tier": "Tier 1|2|3|4|Specialty",
  "recommendations": ["2-3 cost-saving recommendations"],
  "alerts": [{"level": "info|warning", "message": "message"}],
  "confidence": 0.0 to 1.0
}

Focus on actionable cost savings. Respond ONLY with JSON.`;

  try {
    const aiResult = await callUniversalAI('cost-analysis', prompt, undefined, context.preferredProvider);
    const jsonMatch = aiResult.content.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      return {
        summary: parsed.summary || `Cost: ${medication} - ${parsed.genericAvailable ? 'Generic available' : 'Brand only'}`,
        details: {
          medication,
          dosage,
          estimatedBrandCost: parsed.estimatedBrandCost,
          estimatedGenericCost: parsed.estimatedGenericCost,
          potentialSavings: parsed.potentialSavings,
          genericAvailable: parsed.genericAvailable,
          genericName: parsed.genericName,
          therapeuticAlternativeSavings: parsed.therapeuticAlternativeSavings,
          patientAssistancePrograms: parsed.patientAssistancePrograms,
          manufacturerCoupons: parsed.manufacturerCoupons,
          tier: parsed.tier,
          aiAnalysis: true
        },
        recommendations: parsed.recommendations || ['Consider generic if available'],
        alerts: parsed.alerts || [],
        confidence: parsed.confidence || 0.75,
        aiPowered: true,
        provider: aiResult.provider,
        model: aiResult.model,
        dataSource: `Universal AI (${aiResult.provider})`
      };
    }
    throw new Error('Failed to parse AI response');
  } catch (error) {
    console.error('[cost-analysis] Error:', error);
    return {
      summary: `Cost Analysis: ${medication} - Failed`,
      details: { medication, error: error instanceof Error ? error.message : 'Unknown' },
      recommendations: ['Manual cost research recommended'],
      alerts: [{ level: 'warning', message: 'AI analysis unavailable' }],
      confidence: 0.3,
      aiPowered: false,
      dataSource: 'Fallback'
    };
  }
}

/**
 * Medical Summary Agent - AI-powered document summarization
 */
async function executeMedicalSummary(context: DocumentContext): Promise<AgentFinding> {
  const fields = context.extractedFields || {};
  const fieldSummary = Object.entries(fields)
    .slice(0, 15)
    .map(([k, v]) => `${k}: ${typeof v === 'object' ? v.value : v}`)
    .join('\n');

  const prompt = `Generate a comprehensive medical summary from this document.

DOCUMENT TYPE: ${context.documentType}
EXTRACTED DATA:
${fieldSummary}

${context.rawText ? `DOCUMENT TEXT: ${context.rawText.slice(0, 800)}` : ''}

Provide summary in JSON format:
{
  "summary": "2-3 sentence executive summary",
  "keyFindings": ["list 3-5 key findings"],
  "patientInfo": {"name": "", "dob": "", "mrn": ""},
  "clinicalHighlights": ["important clinical points"],
  "actionItems": ["required follow-up actions"],
  "recommendations": ["2-3 recommendations"],
  "alerts": [{"level": "info|warning|error", "message": "message"}],
  "confidence": 0.0 to 1.0
}

Focus on actionable clinical information. Respond ONLY with JSON.`;

  try {
    const aiResult = await callUniversalAI('medical-summary', prompt, undefined, context.preferredProvider);
    const jsonMatch = aiResult.content.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      return {
        summary: parsed.summary || 'Medical summary generated',
        details: {
          documentType: context.documentType,
          keyFindings: parsed.keyFindings || [],
          patientInfo: parsed.patientInfo,
          clinicalHighlights: parsed.clinicalHighlights || [],
          actionItems: parsed.actionItems || [],
          aiAnalysis: true
        },
        recommendations: parsed.recommendations || ['Review summary with care team'],
        alerts: parsed.alerts || [],
        confidence: parsed.confidence || 0.85,
        aiPowered: true,
        provider: aiResult.provider,
        model: aiResult.model,
        dataSource: `Universal AI (${aiResult.provider})`
      };
    }
    throw new Error('Failed to parse AI response');
  } catch (error) {
    console.error('[medical-summary] Error:', error);
    return {
      summary: 'Medical Summary: Generation failed',
      details: { error: error instanceof Error ? error.message : 'Unknown' },
      recommendations: ['Manual summary creation required'],
      alerts: [{ level: 'warning', message: 'AI summary unavailable' }],
      confidence: 0.3,
      aiPowered: false,
      dataSource: 'Fallback'
    };
  }
}

/**
 * Eligibility Analysis Agent - AI-powered insurance analysis
 */
async function executeEligibilityAnalysis(context: DocumentContext): Promise<AgentFinding> {
  const fields = context.extractedFields || {};
  const fieldSummary = Object.entries(fields)
    .slice(0, 12)
    .map(([k, v]) => `${k}: ${typeof v === 'object' ? v.value : v}`)
    .join('\n');

  const prompt = `Analyze this insurance/eligibility document.

DOCUMENT TYPE: ${context.documentType}
EXTRACTED DATA:
${fieldSummary}

Provide eligibility analysis in JSON format:
{
  "summary": "Brief eligibility summary",
  "planType": "HMO|PPO|EPO|POS|Medicare|Medicaid|Commercial",
  "coverageStatus": "active|inactive|pending",
  "effectiveDate": "date",
  "terminationDate": "date or N/A",
  "memberInfo": {"memberId": "", "groupNumber": "", "subscriberName": ""},
  "benefitsHighlights": ["key benefits noted"],
  "limitations": ["coverage limitations"],
  "priorAuthRequired": true/false,
  "recommendations": ["2-3 recommendations"],
  "alerts": [{"level": "info|warning", "message": "message"}],
  "confidence": 0.0 to 1.0
}

Respond ONLY with JSON.`;

  try {
    const aiResult = await callUniversalAI('eligibility-ai', prompt, undefined, context.preferredProvider);
    const jsonMatch = aiResult.content.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      return {
        summary: parsed.summary || 'Eligibility analyzed',
        details: {
          planType: parsed.planType,
          coverageStatus: parsed.coverageStatus,
          effectiveDate: parsed.effectiveDate,
          terminationDate: parsed.terminationDate,
          memberInfo: parsed.memberInfo,
          benefitsHighlights: parsed.benefitsHighlights || [],
          limitations: parsed.limitations || [],
          priorAuthRequired: parsed.priorAuthRequired,
          aiAnalysis: true
        },
        recommendations: parsed.recommendations || ['Verify coverage with payer'],
        alerts: parsed.alerts || [],
        confidence: parsed.confidence || 0.8,
        aiPowered: true,
        provider: aiResult.provider,
        model: aiResult.model,
        dataSource: `Universal AI (${aiResult.provider})`
      };
    }
    throw new Error('Failed to parse AI response');
  } catch (error) {
    console.error('[eligibility-ai] Error:', error);
    return {
      summary: 'Eligibility Analysis: Failed',
      details: { error: error instanceof Error ? error.message : 'Unknown' },
      recommendations: ['Manual eligibility verification required'],
      alerts: [{ level: 'warning', message: 'AI analysis unavailable' }],
      confidence: 0.3,
      aiPowered: false,
      dataSource: 'Fallback'
    };
  }
}

/**
 * Data Validation Agent - AI-powered validation
 */
async function executeDataValidation(context: DocumentContext): Promise<AgentFinding> {
  const fields = context.extractedFields || {};
  const fieldCount = Object.keys(fields).length;
  const fieldSummary = Object.entries(fields)
    .slice(0, 15)
    .map(([k, v]) => `${k}: ${typeof v === 'object' ? v.value : v}`)
    .join('\n');

  const prompt = `Validate the extracted data from this ${context.documentType} document.

EXTRACTED FIELDS (${fieldCount} total):
${fieldSummary}

Check for:
1. Data format correctness (dates, phone numbers, IDs)
2. Required field completeness
3. Logical consistency between fields
4. Potential data entry errors

Provide validation in JSON format:
{
  "summary": "Overall validation summary",
  "overallStatus": "valid|needs_review|invalid",
  "fieldsValidated": ${fieldCount},
  "validationIssues": [{"field": "name", "issue": "description", "severity": "low|medium|high"}],
  "missingRequiredFields": ["list any missing required fields"],
  "formatIssues": [{"field": "name", "expected": "format", "found": "actual"}],
  "suggestions": ["correction suggestions"],
  "recommendations": ["2-3 recommendations"],
  "alerts": [{"level": "info|warning|error", "message": "message"}],
  "confidence": 0.0 to 1.0
}

Respond ONLY with JSON.`;

  try {
    const aiResult = await callUniversalAI('data-validation', prompt, undefined, context.preferredProvider);
    const jsonMatch = aiResult.content.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      const issueCount = (parsed.validationIssues?.length || 0) + (parsed.formatIssues?.length || 0);
      return {
        summary: parsed.summary || `Validation: ${issueCount} issue(s) found`,
        details: {
          overallStatus: parsed.overallStatus,
          fieldsValidated: fieldCount,
          validationIssues: parsed.validationIssues || [],
          missingRequiredFields: parsed.missingRequiredFields || [],
          formatIssues: parsed.formatIssues || [],
          suggestions: parsed.suggestions || [],
          aiAnalysis: true
        },
        recommendations: parsed.recommendations || ['Review flagged fields'],
        alerts: parsed.alerts || [],
        confidence: parsed.confidence || 0.85,
        aiPowered: true,
        provider: aiResult.provider,
        model: aiResult.model,
        dataSource: `Universal AI (${aiResult.provider})`
      };
    }
    throw new Error('Failed to parse AI response');
  } catch (error) {
    console.error('[data-validation] Error:', error);
    return {
      summary: 'Data Validation: Failed',
      details: { error: error instanceof Error ? error.message : 'Unknown' },
      recommendations: ['Manual data review required'],
      alerts: [{ level: 'warning', message: 'AI validation unavailable' }],
      confidence: 0.3,
      aiPowered: false,
      dataSource: 'Fallback'
    };
  }
}

function executeGenericAgent(agentConfig: AgentConfig, context: DocumentContext): AgentFinding {
  return {
    summary: `${agentConfig.name} - Configuration required`,
    details: {
      agentType: agentConfig.architectureType,
      useCase: agentConfig.useCase,
      status: 'needs_configuration',
      fieldsAvailable: Object.keys(context.extractedFields || {}).length
    },
    recommendations: [
      `Configure ${agentConfig.name} with required integrations`,
      'See agent documentation for setup requirements'
    ],
    alerts: [{ level: 'info', message: `Agent "${agentConfig.name}" requires additional configuration` }],
    confidence: 0.2,
    aiPowered: false,
    dataSource: 'Configuration Required'
  };
}

// ============================================
// RCM ANALYSIS AGENTS
// Revenue Cycle Management for invoices/billing
// ============================================

async function executeRCMAnalysis(context: DocumentContext): Promise<AgentFinding> {
  const fields = context.extractedFields || {};
  const fieldSummary = Object.entries(fields)
    .slice(0, 20)
    .map(([k, v]) => `${k}: ${typeof v === 'object' ? v.value : v}`)
    .join('\n');

  const prompt = `Analyze this healthcare billing/invoice document for Revenue Cycle Management (RCM).

DOCUMENT TYPE: ${context.documentType}
EXTRACTED DATA:
${fieldSummary}

Perform comprehensive RCM analysis in JSON format:
{
  "summary": "Brief RCM assessment summary",
  "totalBilled": "amount",
  "totalAllowed": "amount",
  "totalPaid": "amount",
  "patientResponsibility": "amount",
  "collectionRate": "percentage",
  "claimStatus": "clean|pending|denied|partial",
  "cptCodes": [{"code": "code", "description": "desc", "billed": 0, "allowed": 0, "modifier": ""}],
  "icdCodes": [{"code": "code", "description": "desc", "primary": true/false}],
  "codingIssues": [{"issue": "description", "severity": "low|medium|high", "recommendation": "fix"}],
  "denialRisks": [{"reason": "description", "probability": "low|medium|high", "prevention": "action"}],
  "agingBucket": "0-30|31-60|61-90|90+",
  "payerType": "Medicare|Medicaid|Commercial|Self-Pay",
  "recommendations": ["3-5 actionable RCM recommendations"],
  "alerts": [{"level": "info|warning|error", "message": "message"}],
  "confidence": 0.0 to 1.0
}

Focus on revenue optimization and denial prevention. Respond ONLY with JSON.`;

  try {
    const aiResult = await callUniversalAI('rcm-analysis', prompt, undefined, context.preferredProvider);
    const jsonMatch = aiResult.content.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      return {
        summary: parsed.summary || `RCM Analysis: ${parsed.claimStatus || 'analyzed'}`,
        details: {
          totalBilled: parsed.totalBilled,
          totalAllowed: parsed.totalAllowed,
          totalPaid: parsed.totalPaid,
          patientResponsibility: parsed.patientResponsibility,
          collectionRate: parsed.collectionRate,
          claimStatus: parsed.claimStatus,
          cptCodes: parsed.cptCodes || [],
          icdCodes: parsed.icdCodes || [],
          codingIssues: parsed.codingIssues || [],
          denialRisks: parsed.denialRisks || [],
          agingBucket: parsed.agingBucket,
          payerType: parsed.payerType,
          aiAnalysis: true
        },
        recommendations: parsed.recommendations || ['Review coding accuracy'],
        alerts: parsed.alerts || [],
        confidence: parsed.confidence || 0.82,
        aiPowered: true,
        provider: aiResult.provider,
        model: aiResult.model,
        dataSource: `Universal AI (${aiResult.provider})`
      };
    }
    throw new Error('Failed to parse AI response');
  } catch (error) {
    console.error('[rcm-analysis] Error:', error);
    return {
      summary: 'RCM Analysis: Failed',
      details: { error: error instanceof Error ? error.message : 'Unknown' },
      recommendations: ['Manual RCM review required'],
      alerts: [{ level: 'warning', message: 'AI analysis unavailable' }],
      confidence: 0.3,
      aiPowered: false,
      dataSource: 'Fallback'
    };
  }
}

async function executeCodingValidation(context: DocumentContext): Promise<AgentFinding> {
  const fields = context.extractedFields || {};
  const cptCodes = fields.cpt_codes || fields.procedure_codes || [];
  const icdCodes = fields.icd_codes || fields.diagnosis_codes || [];
  
  const prompt = `Validate the medical coding for this billing document.

CPT/HCPCS CODES: ${JSON.stringify(cptCodes)}
ICD-10 CODES: ${JSON.stringify(icdCodes)}
DOCUMENT TYPE: ${context.documentType}

Provide coding validation in JSON format:
{
  "summary": "Coding validation summary",
  "cptValidation": [{"code": "code", "valid": true/false, "description": "desc", "issues": []}],
  "icdValidation": [{"code": "code", "valid": true/false, "description": "desc", "issues": []}],
  "cptIcdCompatibility": {"compatible": true/false, "issues": []},
  "modifierAnalysis": [{"modifier": "mod", "appropriate": true/false, "reason": ""}],
  "upcoding_downcoding_risk": "none|low|medium|high",
  "bundlingIssues": [{"issue": "description", "codes": ["affected codes"]}],
  "ncdLcdCompliance": {"compliant": true/false, "issues": []},
  "recommendations": ["2-3 recommendations"],
  "alerts": [{"level": "info|warning|error", "message": "message"}],
  "confidence": 0.0 to 1.0
}

Respond ONLY with JSON.`;

  try {
    const aiResult = await callUniversalAI('coding-validation', prompt, undefined, context.preferredProvider);
    const jsonMatch = aiResult.content.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      return {
        summary: parsed.summary || 'Coding validation complete',
        details: {
          cptValidation: parsed.cptValidation || [],
          icdValidation: parsed.icdValidation || [],
          cptIcdCompatibility: parsed.cptIcdCompatibility,
          modifierAnalysis: parsed.modifierAnalysis || [],
          upcoding_downcoding_risk: parsed.upcoding_downcoding_risk,
          bundlingIssues: parsed.bundlingIssues || [],
          ncdLcdCompliance: parsed.ncdLcdCompliance,
          aiAnalysis: true
        },
        recommendations: parsed.recommendations || ['Review coding accuracy'],
        alerts: parsed.alerts || [],
        confidence: parsed.confidence || 0.85,
        aiPowered: true,
        provider: aiResult.provider,
        model: aiResult.model,
        dataSource: `Universal AI (${aiResult.provider})`
      };
    }
    throw new Error('Failed to parse AI response');
  } catch (error) {
    console.error('[coding-validation] Error:', error);
    return {
      summary: 'Coding Validation: Failed',
      details: { error: error instanceof Error ? error.message : 'Unknown' },
      recommendations: ['Manual coding review required'],
      alerts: [{ level: 'warning', message: 'AI analysis unavailable' }],
      confidence: 0.3,
      aiPowered: false,
      dataSource: 'Fallback'
    };
  }
}

async function executeDenialPrevention(context: DocumentContext): Promise<AgentFinding> {
  const fields = context.extractedFields || {};
  const fieldSummary = Object.entries(fields)
    .slice(0, 15)
    .map(([k, v]) => `${k}: ${typeof v === 'object' ? v.value : v}`)
    .join('\n');

  const prompt = `Analyze this claim/billing document for denial risks and prevention strategies.

DOCUMENT DATA:
${fieldSummary}

Provide denial prevention analysis in JSON format:
{
  "summary": "Denial risk assessment summary",
  "overallDenialRisk": "low|medium|high",
  "denialCategories": [
    {"category": "category name", "risk": "low|medium|high", "reason": "explanation", "prevention": "action"}
  ],
  "missingDocumentation": ["list missing required documentation"],
  "timingIssues": {"atRisk": true/false, "deadlines": ["list any filing deadlines"]},
  "priorAuthStatus": "not_required|required_obtained|required_missing|expired",
  "medicalNecessityRisk": "low|medium|high",
  "appealStrategies": ["strategies if denied"],
  "recommendations": ["3-5 actionable prevention steps"],
  "alerts": [{"level": "info|warning|error", "message": "message"}],
  "confidence": 0.0 to 1.0
}

Focus on actionable denial prevention. Respond ONLY with JSON.`;

  try {
    const aiResult = await callUniversalAI('denial-prevention', prompt, undefined, context.preferredProvider);
    const jsonMatch = aiResult.content.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      return {
        summary: parsed.summary || `Denial Risk: ${parsed.overallDenialRisk || 'assessed'}`,
        details: {
          overallDenialRisk: parsed.overallDenialRisk,
          denialCategories: parsed.denialCategories || [],
          missingDocumentation: parsed.missingDocumentation || [],
          timingIssues: parsed.timingIssues,
          priorAuthStatus: parsed.priorAuthStatus,
          medicalNecessityRisk: parsed.medicalNecessityRisk,
          appealStrategies: parsed.appealStrategies || [],
          aiAnalysis: true
        },
        recommendations: parsed.recommendations || ['Review claim for completeness'],
        alerts: parsed.alerts || [],
        confidence: parsed.confidence || 0.8,
        aiPowered: true,
        provider: aiResult.provider,
        model: aiResult.model,
        dataSource: `Universal AI (${aiResult.provider})`
      };
    }
    throw new Error('Failed to parse AI response');
  } catch (error) {
    console.error('[denial-prevention] Error:', error);
    return {
      summary: 'Denial Prevention: Failed',
      details: { error: error instanceof Error ? error.message : 'Unknown' },
      recommendations: ['Manual denial risk review required'],
      alerts: [{ level: 'warning', message: 'AI analysis unavailable' }],
      confidence: 0.3,
      aiPowered: false,
      dataSource: 'Fallback'
    };
  }
}

// ============================================
// SIG CODE ANALYSIS AGENT
// Full SIG interpretation with clinical context
// ============================================

async function executeSigCodeAnalysis(context: DocumentContext): Promise<AgentFinding> {
  const fields = context.extractedFields || {};
  const medications = extractAllMedications(fields);
  
  if (medications.length === 0) {
    return {
      summary: 'SIG Analysis: No medications found',
      details: { medicationCount: 0 },
      recommendations: ['Verify medication extraction'],
      alerts: [{ level: 'warning', message: 'No SIG codes to analyze' }],
      confidence: 0.2,
      aiPowered: false,
      dataSource: 'No data'
    };
  }

  // Interpret all SIG codes
  const sigAnalysis = medications.map(med => {
    const interpretation = interpretSigCode(med.sig || '');
    return {
      medication: med.name,
      originalSig: med.sig || 'Not specified',
      interpretation: interpretation.interpretation,
      components: interpretation.components,
      strength: med.strength,
      route: med.route,
      quantity: med.quantity,
      refills: med.refills
    };
  });

  // Get AI enhancement for clinical context
  const sigSummary = sigAnalysis.map(s => `${s.medication}: ${s.originalSig} → ${s.interpretation}`).join('\n');
  
  const prompt = `Review these medication SIG code interpretations and provide clinical context.

SIG INTERPRETATIONS:
${sigSummary}

Provide enhanced analysis in JSON format:
{
  "summary": "Overall SIG analysis summary",
  "interpretations": [
    {
      "medication": "name",
      "plainEnglish": "full plain English instructions for patient",
      "clinicalNotes": "any clinical considerations",
      "patientEducation": "key points to tell patient",
      "administrationTiming": "specific timing guidance"
    }
  ],
  "interactionTimingRisks": ["any timing conflicts between medications"],
  "adherenceConsiderations": ["factors affecting adherence"],
  "recommendations": ["2-3 recommendations"],
  "alerts": [{"level": "info|warning", "message": "message"}],
  "confidence": 0.0 to 1.0
}

Respond ONLY with JSON.`;

  try {
    const aiResult = await callUniversalAI('sig-analysis', prompt, undefined, context.preferredProvider);
    const jsonMatch = aiResult.content.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      return {
        summary: parsed.summary || `SIG Analysis: ${medications.length} medication(s) interpreted`,
        details: {
          medicationCount: medications.length,
          sigAnalysis,
          aiInterpretations: parsed.interpretations || [],
          interactionTimingRisks: parsed.interactionTimingRisks || [],
          adherenceConsiderations: parsed.adherenceConsiderations || [],
          aiEnhanced: true
        },
        recommendations: parsed.recommendations || ['Review SIG with patient'],
        alerts: parsed.alerts || [],
        confidence: parsed.confidence || 0.88,
        aiPowered: true,
        provider: aiResult.provider,
        model: aiResult.model,
        dataSource: `SIG Parser + Universal AI (${aiResult.provider})`
      };
    }
    throw new Error('Failed to parse AI response');
  } catch (error) {
    // Return rule-based interpretation as fallback
    return {
      summary: `SIG Analysis: ${medications.length} medication(s) interpreted (rule-based)`,
      details: {
        medicationCount: medications.length,
        sigAnalysis,
        aiEnhanced: false
      },
      recommendations: ['Review SIG codes with patient', 'Verify interpretation accuracy'],
      alerts: [{ level: 'info', message: 'Using rule-based SIG interpretation' }],
      confidence: 0.75,
      aiPowered: false,
      dataSource: 'SIG Parser (rule-based)'
    };
  }
}

// ============================================
// RESULT STORAGE & LABEL STUDIO UPDATE
// ============================================

async function storeAgentResults(
  documentId: string,
  agentId: string,
  findings: AgentFinding
): Promise<boolean> {
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY || !documentId) {
    console.log('[storeAgentResults] Missing required parameters, skipping storage');
    return false;
  }
  
  try {
    // Store in document_agent_results table (if exists)
    const response = await fetch(`${SUPABASE_URL}/rest/v1/document_agent_results`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        'apikey': SUPABASE_ANON_KEY,
        'Content-Type': 'application/json',
        'Prefer': 'return=minimal'
      },
      body: JSON.stringify({
        document_id: documentId,
        agent_id: agentId,
        findings: findings,
        ai_powered: findings.aiPowered,
        provider: findings.provider,
        model: findings.model,
        confidence: findings.confidence,
        executed_at: new Date().toISOString()
      })
    });
    
    if (response.ok || response.status === 201) {
      console.log(`[storeAgentResults] Stored results for agent ${agentId} on document ${documentId}`);
      return true;
    } else {
      console.warn(`[storeAgentResults] Storage failed: ${response.status}`);
      return false;
    }
  } catch (error) {
    console.warn('[storeAgentResults] Error:', error);
    return false;
  }
}

async function updateLabelStudioWithResults(
  documentId: string,
  agentId: string,
  findings: AgentFinding,
  documentType: string
): Promise<boolean> {
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) return false;
  
  try {
    const response = await fetch(`${SUPABASE_URL}/functions/v1/label-studio-connector`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        action: 'recordTrainingEvents',
        events: [{
          eventType: 'agent_execution',
          context: {
            document_id: documentId,
            agent_id: agentId,
            document_type: documentType,
            success: findings.confidence > 0.5,
            confidence: findings.confidence,
            ai_powered: findings.aiPowered,
            provider: findings.provider
          },
          metadata: {
            summary: findings.summary,
            alerts_count: findings.alerts?.length || 0,
            recommendations_count: findings.recommendations?.length || 0,
            timestamp: new Date().toISOString()
          }
        }]
      })
    });
    
    if (response.ok) {
      console.log(`[updateLabelStudio] Recorded agent execution for ${agentId}`);
      return true;
    }
    return false;
  } catch (error) {
    console.warn('[updateLabelStudio] Error:', error);
    return false;
  }
}

// ============================================
// ALL DOCUMENT TYPE AGENTS
// Insurance, Patient Onboarding, Medical Imaging, Billing/Invoice
// ============================================

/**
 * Insurance Verification AI Agent
 * Handles: Insurance cards, EOB, claims, coverage documents
 */
async function executeInsuranceVerificationAI(context: DocumentContext): Promise<AgentFinding> {
  const fields = context.extractedFields || {};
  
  const insuranceInfo = {
    memberId: getFieldValue(fields, 'member_id', 'subscriber_id', 'policy_number', 'id_number') || '',
    groupNumber: getFieldValue(fields, 'group_number', 'group_id', 'group') || '',
    planName: getFieldValue(fields, 'plan_name', 'insurance_plan', 'plan_type') || '',
    payerName: getFieldValue(fields, 'payer_name', 'insurance_company', 'carrier', 'insurer') || '',
    effectiveDate: getFieldValue(fields, 'effective_date', 'start_date', 'coverage_start') || '',
    terminationDate: getFieldValue(fields, 'termination_date', 'end_date', 'coverage_end') || '',
    copay: getFieldValue(fields, 'copay', 'copayment', 'office_visit_copay') || '',
    deductible: getFieldValue(fields, 'deductible', 'annual_deductible') || '',
    bin: getFieldValue(fields, 'bin', 'rx_bin') || '',
    pcn: getFieldValue(fields, 'pcn', 'rx_pcn') || '',
    rxGroup: getFieldValue(fields, 'rx_group', 'pharmacy_group') || ''
  };

  const prompt = `Analyze this insurance document and verify coverage details.

INSURANCE DOCUMENT DATA:
- Member ID: ${insuranceInfo.memberId || 'Not extracted'}
- Group Number: ${insuranceInfo.groupNumber || 'Not extracted'}
- Plan Name: ${insuranceInfo.planName || 'Not extracted'}
- Payer/Carrier: ${insuranceInfo.payerName || 'Not extracted'}
- Effective Date: ${insuranceInfo.effectiveDate || 'Not extracted'}
- Termination Date: ${insuranceInfo.terminationDate || 'Not extracted'}
- Copay: ${insuranceInfo.copay || 'Not extracted'}
- Deductible: ${insuranceInfo.deductible || 'Not extracted'}
- RX BIN: ${insuranceInfo.bin || 'Not extracted'}
- RX PCN: ${insuranceInfo.pcn || 'Not extracted'}
- RX Group: ${insuranceInfo.rxGroup || 'Not extracted'}

Document Type: ${context.documentType}
${context.rawText ? `Additional text: ${context.rawText.slice(0, 600)}` : ''}

Provide insurance analysis in JSON format:
{
  "summary": "Brief coverage summary",
  "coverageStatus": "active|inactive|pending|unknown",
  "coverageType": "PPO|HMO|EPO|POS|Medicare|Medicaid|Commercial|Unknown",
  "validationResults": {
    "memberIdValid": true/false,
    "groupNumberValid": true/false,
    "datesValid": true/false,
    "rxBenefitsPresent": true/false
  },
  "benefits": {
    "medicalCopay": "amount",
    "specialistCopay": "amount",
    "deductible": "amount",
    "outOfPocketMax": "amount",
    "rxTier1": "amount",
    "rxTier2": "amount",
    "rxTier3": "amount"
  },
  "networkRestrictions": ["in-network requirements"],
  "priorAuthRequired": ["services requiring PA"],
  "missingFields": ["list of missing critical fields"],
  "recommendations": ["2-4 recommendations"],
  "alerts": [{"level": "info|warning|error", "message": "message"}],
  "confidence": 0.0 to 1.0
}

Validate all fields and identify any coverage gaps. Respond ONLY with JSON.`;

  try {
    const aiResult = await callUniversalAI('insurance-verification-ai', prompt, undefined, context.preferredProvider);
    const jsonMatch = aiResult.content.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      return {
        summary: parsed.summary || `Insurance: ${insuranceInfo.payerName || 'Unknown'} - ${parsed.coverageStatus || 'Verified'}`,
        details: {
          ...insuranceInfo,
          coverageStatus: parsed.coverageStatus,
          coverageType: parsed.coverageType,
          validationResults: parsed.validationResults,
          benefits: parsed.benefits,
          networkRestrictions: parsed.networkRestrictions,
          priorAuthRequired: parsed.priorAuthRequired,
          missingFields: parsed.missingFields,
          aiAnalysis: true
        },
        recommendations: parsed.recommendations || ['Verify coverage with payer'],
        alerts: parsed.alerts || [],
        confidence: parsed.confidence || 0.85,
        aiPowered: true,
        provider: aiResult.provider,
        model: aiResult.model,
        dataSource: `Universal AI (${aiResult.provider})`
      };
    }
    throw new Error('Failed to parse AI response');
  } catch (error) {
    console.error('[insurance-verification-ai] Error:', error);
    return {
      summary: 'Insurance Verification: Analysis failed',
      details: { ...insuranceInfo, error: error instanceof Error ? error.message : 'Unknown' },
      recommendations: ['Manual verification required'],
      alerts: [{ level: 'warning', message: 'AI analysis unavailable' }],
      confidence: 0.3,
      aiPowered: false,
      dataSource: 'Fallback'
    };
  }
}

/**
 * Patient Onboarding AI Agent
 * Handles: Enrollment forms, demographics, consent, history
 */
async function executePatientOnboardingAI(context: DocumentContext): Promise<AgentFinding> {
  const fields = context.extractedFields || {};
  
  const patientInfo = {
    firstName: getFieldValue(fields, 'first_name', 'patient_first_name', 'given_name') || '',
    lastName: getFieldValue(fields, 'last_name', 'patient_last_name', 'family_name') || '',
    dob: getFieldValue(fields, 'date_of_birth', 'dob', 'birth_date') || '',
    ssn: getFieldValue(fields, 'ssn', 'social_security', 'ssn_last4') || '',
    address: getFieldValue(fields, 'address', 'street_address', 'home_address') || '',
    city: getFieldValue(fields, 'city') || '',
    state: getFieldValue(fields, 'state') || '',
    zip: getFieldValue(fields, 'zip', 'zip_code', 'postal_code') || '',
    phone: getFieldValue(fields, 'phone', 'phone_number', 'mobile') || '',
    email: getFieldValue(fields, 'email', 'email_address') || '',
    emergencyContact: getFieldValue(fields, 'emergency_contact', 'emergency_name') || '',
    emergencyPhone: getFieldValue(fields, 'emergency_phone', 'emergency_number') || '',
    allergies: getFieldValue(fields, 'allergies', 'drug_allergies', 'known_allergies') || '',
    medications: getFieldValue(fields, 'current_medications', 'medications', 'med_list') || '',
    conditions: getFieldValue(fields, 'medical_conditions', 'conditions', 'diagnoses') || '',
    consentSigned: fields.consent_signed?.value || fields.signature_present?.value || false,
    hipaaAcknowledged: fields.hipaa_acknowledged?.value || fields.hipaa_signed?.value || false
  };

  const prompt = `Analyze this patient onboarding document and validate completeness.

PATIENT ONBOARDING DATA:
- Name: ${patientInfo.firstName} ${patientInfo.lastName}
- DOB: ${patientInfo.dob || 'Not provided'}
- SSN (last 4): ${patientInfo.ssn ? '****' + patientInfo.ssn.slice(-4) : 'Not provided'}
- Address: ${patientInfo.address}, ${patientInfo.city}, ${patientInfo.state} ${patientInfo.zip}
- Phone: ${patientInfo.phone || 'Not provided'}
- Email: ${patientInfo.email || 'Not provided'}
- Emergency Contact: ${patientInfo.emergencyContact || 'Not provided'} - ${patientInfo.emergencyPhone || 'No phone'}
- Allergies: ${patientInfo.allergies || 'None reported'}
- Current Medications: ${patientInfo.medications || 'None reported'}
- Medical Conditions: ${patientInfo.conditions || 'None reported'}
- Consent Signed: ${patientInfo.consentSigned ? 'Yes' : 'No'}
- HIPAA Acknowledged: ${patientInfo.hipaaAcknowledged ? 'Yes' : 'No'}

Document Type: ${context.documentType}
${context.rawText ? `Additional text: ${context.rawText.slice(0, 500)}` : ''}

Provide onboarding analysis in JSON format:
{
  "summary": "Brief onboarding status",
  "completenessScore": 0-100,
  "status": "complete|incomplete|needs_review",
  "validationResults": {
    "nameValid": true/false,
    "dobValid": true/false,
    "addressValid": true/false,
    "phoneValid": true/false,
    "emailValid": true/false,
    "emergencyContactPresent": true/false,
    "consentObtained": true/false,
    "hipaaCompliant": true/false
  },
  "missingRequired": ["list of missing required fields"],
  "missingOptional": ["list of missing optional fields"],
  "dataQualityIssues": [{"field": "name", "issue": "description"}],
  "complianceStatus": {
    "hipaa": "compliant|non-compliant|pending",
    "consent": "obtained|missing|partial",
    "idVerification": "verified|pending|failed"
  },
  "nextSteps": ["list of next steps to complete onboarding"],
  "recommendations": ["2-4 recommendations"],
  "alerts": [{"level": "info|warning|error", "message": "message"}],
  "confidence": 0.0 to 1.0
}

Identify any compliance gaps or missing information. Respond ONLY with JSON.`;

  try {
    const aiResult = await callUniversalAI('patient-onboarding-ai', prompt, undefined, context.preferredProvider);
    const jsonMatch = aiResult.content.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      return {
        summary: parsed.summary || `Onboarding: ${patientInfo.firstName} ${patientInfo.lastName} - ${parsed.status || 'Analyzed'}`,
        details: {
          ...patientInfo,
          completenessScore: parsed.completenessScore,
          status: parsed.status,
          validationResults: parsed.validationResults,
          missingRequired: parsed.missingRequired,
          missingOptional: parsed.missingOptional,
          dataQualityIssues: parsed.dataQualityIssues,
          complianceStatus: parsed.complianceStatus,
          nextSteps: parsed.nextSteps,
          aiAnalysis: true
        },
        recommendations: parsed.recommendations || ['Complete missing fields'],
        alerts: parsed.alerts || [],
        confidence: parsed.confidence || 0.88,
        aiPowered: true,
        provider: aiResult.provider,
        model: aiResult.model,
        dataSource: `Universal AI (${aiResult.provider})`
      };
    }
    throw new Error('Failed to parse AI response');
  } catch (error) {
    console.error('[patient-onboarding-ai] Error:', error);
    return {
      summary: 'Patient Onboarding: Analysis failed',
      details: { ...patientInfo, error: error instanceof Error ? error.message : 'Unknown' },
      recommendations: ['Manual review required'],
      alerts: [{ level: 'warning', message: 'AI analysis unavailable' }],
      confidence: 0.3,
      aiPowered: false,
      dataSource: 'Fallback'
    };
  }
}

/**
 * Medical Imaging AI Agent - Enhanced with Abnormality & Measurement Detection
 * Handles: X-ray, CT, MRI, ECG, Ultrasound, Mammogram with highlighting
 */
async function executeMedicalImagingAI(context: DocumentContext): Promise<AgentFinding> {
  const fields = context.extractedFields || {};
  const docType = context.documentType?.toLowerCase() || 'unknown';
  
  const imagingInfo = {
    modality: getFieldValue(fields, 'modality', 'imaging_type', 'study_type') || 
      (docType.includes('xray') || docType.includes('x-ray') ? 'X-Ray' :
       docType.includes('ct') ? 'CT Scan' :
       docType.includes('mri') ? 'MRI' :
       docType.includes('ecg') || docType.includes('ekg') ? 'ECG/EKG' :
       docType.includes('ultrasound') ? 'Ultrasound' :
       docType.includes('mammogram') ? 'Mammogram' : 'Unknown'),
    bodyPart: getFieldValue(fields, 'body_part', 'anatomy', 'region', 'study_area') || '',
    indication: getFieldValue(fields, 'clinical_indication', 'indication', 'reason') || '',
    findings: getFieldValue(fields, 'findings', 'impression', 'report_text') || '',
    technique: getFieldValue(fields, 'technique', 'protocol') || '',
    comparison: getFieldValue(fields, 'comparison', 'prior_study') || '',
    radiologist: getFieldValue(fields, 'radiologist', 'interpreting_physician') || ''
  };

  const prompt = `Analyze this ${imagingInfo.modality} study and identify abnormalities with measurements.

IMAGING STUDY DATA:
- Modality: ${imagingInfo.modality}
- Body Part/Region: ${imagingInfo.bodyPart || 'Not specified'}
- Clinical Indication: ${imagingInfo.indication || 'Not provided'}
- Technique: ${imagingInfo.technique || 'Standard protocol'}
- Comparison: ${imagingInfo.comparison || 'No prior studies'}
- Reported Findings: ${imagingInfo.findings || 'None extracted'}
- Interpreting Radiologist: ${imagingInfo.radiologist || 'Not specified'}

${context.rawText ? `Full Report Text: ${context.rawText.slice(0, 1000)}` : ''}

Provide comprehensive imaging analysis in JSON format:
{
  "summary": "Brief overall impression",
  "studyQuality": "diagnostic|adequate|limited|non-diagnostic",
  "abnormalityDetection": {
    "abnormalitiesFound": true/false,
    "totalAbnormalities": 0,
    "findings": [
      {
        "id": "ABN-001",
        "type": "mass|fracture|effusion|nodule|lesion|calcification|opacity|other",
        "location": "anatomic location",
        "description": "detailed description",
        "severity": "mild|moderate|severe|critical",
        "characteristics": ["list of imaging characteristics"],
        "boundingBox": {"x": 0, "y": 0, "width": 100, "height": 100, "unit": "percent"},
        "confidence": 0.0-1.0
      }
    ]
  },
  "measurements": {
    "measuredValues": [
      {
        "name": "measurement name (e.g., nodule size, heart size)",
        "value": "numeric value",
        "unit": "mm|cm|ratio|other",
        "referenceRange": {"min": 0, "max": 0, "unit": "same"},
        "status": "normal|abnormal|borderline|critical",
        "percentileOrRatio": "if applicable"
      }
    ],
    "comparedToPrior": [
      {"measurement": "name", "priorValue": "x", "currentValue": "y", "change": "increased|decreased|stable", "percentChange": 0}
    ]
  },
  "modalitySpecific": {
    "ecgFindings": {"rhythm": "", "rate": "", "intervals": {}, "axisDeviation": "", "stChanges": ""},
    "mammogramBIRADS": "0|1|2|3|4A|4B|4C|5|6",
    "ctHounsfieldUnits": [],
    "mriSignalCharacteristics": []
  },
  "differentialDiagnosis": ["list of differential diagnoses in order of likelihood"],
  "criticalFindings": [{"finding": "description", "urgency": "emergent|urgent|routine"}],
  "followUpRecommendations": {
    "timing": "immediate|24-48h|1-2weeks|3months|6months|annual|none",
    "modality": "recommended follow-up modality",
    "reason": "reason for follow-up"
  },
  "labelStudioAnnotations": {
    "highlightRegions": [{"id": "ABN-001", "color": "#FF0000", "label": "Abnormality"}],
    "measurementLines": [{"id": "MEAS-001", "startPoint": [0,0], "endPoint": [100,100], "label": "10mm"}]
  },
  "recommendations": ["2-4 clinical recommendations"],
  "alerts": [{"level": "info|warning|error", "message": "message"}],
  "confidence": 0.0 to 1.0
}

IMPORTANT: For ${imagingInfo.modality}:
- Identify ALL visible abnormalities with bounding box coordinates for Label Studio highlighting
- Provide measurements with reference ranges for comparison
- Flag any CRITICAL findings requiring immediate attention
- Generate coordinates suitable for image annotation overlay

Respond ONLY with JSON.`;

  try {
    const aiResult = await callUniversalAI('medical-imaging-ai', prompt, undefined, context.preferredProvider);
    const jsonMatch = aiResult.content.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      
      // Build alerts based on critical findings
      const alerts = parsed.alerts || [];
      if (parsed.criticalFindings?.length > 0) {
        const emergentFindings = parsed.criticalFindings.filter((f: any) => f.urgency === 'emergent');
        if (emergentFindings.length > 0) {
          alerts.unshift({ level: 'error', message: `EMERGENT: ${emergentFindings[0].finding}` });
        }
      }
      if (parsed.abnormalityDetection?.abnormalitiesFound) {
        alerts.push({ level: 'warning', message: `${parsed.abnormalityDetection.totalAbnormalities} abnormality(s) detected` });
      }
      
      return {
        summary: parsed.summary || `${imagingInfo.modality} Analysis: ${parsed.abnormalityDetection?.abnormalitiesFound ? 'Abnormalities detected' : 'Normal study'}`,
        details: {
          ...imagingInfo,
          studyQuality: parsed.studyQuality,
          abnormalityDetection: parsed.abnormalityDetection,
          measurements: parsed.measurements,
          modalitySpecific: parsed.modalitySpecific,
          differentialDiagnosis: parsed.differentialDiagnosis,
          criticalFindings: parsed.criticalFindings,
          followUpRecommendations: parsed.followUpRecommendations,
          labelStudioAnnotations: parsed.labelStudioAnnotations,
          aiAnalysis: true
        },
        recommendations: parsed.recommendations || ['Review with radiologist'],
        alerts,
        confidence: parsed.confidence || 0.82,
        aiPowered: true,
        provider: aiResult.provider,
        model: aiResult.model,
        dataSource: `Universal AI (${aiResult.provider}) - Gemini Vision + Clinical Analysis`
      };
    }
    throw new Error('Failed to parse AI response');
  } catch (error) {
    console.error('[medical-imaging-ai] Error:', error);
    return {
      summary: `${imagingInfo.modality} Analysis: Failed`,
      details: { ...imagingInfo, error: error instanceof Error ? error.message : 'Unknown' },
      recommendations: ['Manual radiologist review required'],
      alerts: [{ level: 'warning', message: 'AI imaging analysis unavailable' }],
      confidence: 0.3,
      aiPowered: false,
      dataSource: 'Fallback'
    };
  }
}

/**
 * Invoice & Billing Analysis AI Agent
 * Handles: Medical invoices, EOB, claims, billing statements
 */
async function executeInvoiceBillingAI(context: DocumentContext): Promise<AgentFinding> {
  const fields = context.extractedFields || {};
  
  const billingInfo = {
    invoiceNumber: getFieldValue(fields, 'invoice_number', 'claim_number', 'statement_number') || '',
    patientName: getFieldValue(fields, 'patient_name', 'subscriber_name', 'member_name') || '',
    accountNumber: getFieldValue(fields, 'account_number', 'patient_account') || '',
    dateOfService: getFieldValue(fields, 'date_of_service', 'service_date', 'dos') || '',
    provider: getFieldValue(fields, 'provider_name', 'billing_provider', 'facility') || '',
    totalCharges: getFieldValue(fields, 'total_charges', 'total_amount', 'billed_amount') || '',
    insurancePayment: getFieldValue(fields, 'insurance_payment', 'payer_payment', 'plan_paid') || '',
    patientResponsibility: getFieldValue(fields, 'patient_responsibility', 'patient_balance', 'amount_due') || '',
    adjustments: getFieldValue(fields, 'adjustments', 'contractual_adjustment', 'discount') || '',
    cptCodes: getFieldValue(fields, 'cpt_codes', 'procedure_codes', 'hcpcs') || '',
    icdCodes: getFieldValue(fields, 'icd_codes', 'diagnosis_codes', 'icd10') || '',
    npi: getFieldValue(fields, 'npi', 'provider_npi', 'billing_npi') || ''
  };

  const prompt = `Analyze this medical billing document for RCM analysis and validation.

BILLING/INVOICE DATA:
- Invoice/Claim #: ${billingInfo.invoiceNumber || 'Not found'}
- Patient: ${billingInfo.patientName || 'Not found'}
- Account #: ${billingInfo.accountNumber || 'Not found'}
- Date of Service: ${billingInfo.dateOfService || 'Not found'}
- Provider: ${billingInfo.provider || 'Not found'}
- Provider NPI: ${billingInfo.npi || 'Not found'}
- Total Charges: ${billingInfo.totalCharges || 'Not found'}
- Insurance Payment: ${billingInfo.insurancePayment || 'Not found'}
- Adjustments: ${billingInfo.adjustments || 'Not found'}
- Patient Responsibility: ${billingInfo.patientResponsibility || 'Not found'}
- CPT/HCPCS Codes: ${billingInfo.cptCodes || 'Not found'}
- ICD-10 Codes: ${billingInfo.icdCodes || 'Not found'}

Document Type: ${context.documentType}
${context.rawText ? `Additional text: ${context.rawText.slice(0, 800)}` : ''}

Provide comprehensive billing analysis in JSON format:
{
  "summary": "Brief billing summary",
  "documentType": "invoice|claim|eob|statement|superbill",
  "financialSummary": {
    "totalBilled": 0,
    "insurancePaid": 0,
    "adjustments": 0,
    "patientOwes": 0,
    "collectionRate": 0
  },
  "codingAnalysis": {
    "cptCodes": [{"code": "code", "description": "desc", "units": 1, "charge": 0}],
    "icdCodes": [{"code": "code", "description": "desc"}],
    "modifiers": ["list of modifiers"],
    "cptIcdLinkageValid": true/false,
    "bundlingIssues": [{"codes": ["code1", "code2"], "issue": "description"}],
    "upcoding": {"risk": "none|low|medium|high", "flaggedCodes": []},
    "missingCodes": ["list of potentially missing codes"]
  },
  "denialRiskAssessment": {
    "overallRisk": "low|medium|high|critical",
    "riskFactors": [{"factor": "description", "impact": "dollar amount or percentage", "prevention": "action"}],
    "commonDenialReasons": ["list of likely denial reasons"],
    "priorAuthRequired": true/false,
    "timely Filing": true/false
  },
  "complianceFlags": {
    "ncdLcdCompliance": "compliant|non-compliant|review_needed",
    "medicalNecessity": "documented|unclear|missing",
    "modifierUsage": "correct|incorrect|missing"
  },
  "rcmMetrics": {
    "daysInAR": 0,
    "cleanClaimRate": 0,
    "expectedReimbursement": 0,
    "varianceFromExpected": 0
  },
  "actionItems": [{"priority": "high|medium|low", "action": "description", "deadline": "timeframe"}],
  "recommendations": ["2-4 recommendations"],
  "alerts": [{"level": "info|warning|error", "message": "message"}],
  "confidence": 0.0 to 1.0
}

Identify coding issues, denial risks, and compliance concerns. Respond ONLY with JSON.`;

  try {
    const aiResult = await callUniversalAI('invoice-billing-ai', prompt, undefined, context.preferredProvider);
    const jsonMatch = aiResult.content.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      
      const alerts = parsed.alerts || [];
      if (parsed.denialRiskAssessment?.overallRisk === 'critical' || parsed.denialRiskAssessment?.overallRisk === 'high') {
        alerts.unshift({ level: 'error', message: `High denial risk: ${parsed.denialRiskAssessment.riskFactors?.[0]?.factor || 'Review required'}` });
      }
      if (parsed.codingAnalysis?.bundlingIssues?.length > 0) {
        alerts.push({ level: 'warning', message: `${parsed.codingAnalysis.bundlingIssues.length} potential bundling issue(s)` });
      }
      
      return {
        summary: parsed.summary || `Billing Analysis: $${billingInfo.totalCharges || '0'} - ${parsed.denialRiskAssessment?.overallRisk || 'Low'} denial risk`,
        details: {
          ...billingInfo,
          documentType: parsed.documentType,
          financialSummary: parsed.financialSummary,
          codingAnalysis: parsed.codingAnalysis,
          denialRiskAssessment: parsed.denialRiskAssessment,
          complianceFlags: parsed.complianceFlags,
          rcmMetrics: parsed.rcmMetrics,
          actionItems: parsed.actionItems,
          aiAnalysis: true
        },
        recommendations: parsed.recommendations || ['Review coding accuracy'],
        alerts,
        confidence: parsed.confidence || 0.87,
        aiPowered: true,
        provider: aiResult.provider,
        model: aiResult.model,
        dataSource: `Universal AI (${aiResult.provider}) - RCM Analysis`
      };
    }
    throw new Error('Failed to parse AI response');
  } catch (error) {
    console.error('[invoice-billing-ai] Error:', error);
    return {
      summary: 'Billing Analysis: Failed',
      details: { ...billingInfo, error: error instanceof Error ? error.message : 'Unknown' },
      recommendations: ['Manual billing review required'],
      alerts: [{ level: 'warning', message: 'AI billing analysis unavailable' }],
      confidence: 0.3,
      aiPowered: false,
      dataSource: 'Fallback'
    };
  }
}

// ============================================
// MCP SDK DATA PUSH WITH LABEL STUDIO MAPPING
// Pushes processed data to target systems (SF, Veeva, HubSpot, Supabase)
// ============================================

interface MCPDataPushOptions {
  targetSystem: 'salesforce' | 'veeva' | 'hubspot' | 'supabase' | 'webhook';
  objectType?: string; // Salesforce object, Veeva vault type, HubSpot object
  operation?: 'create' | 'update' | 'upsert';
  fieldMapping?: Record<string, string>; // Source field -> Target field
  labelStudioSync?: boolean; // Also record to Label Studio
  labelStudioProject?: number | string;
}

async function pushDataViaMCP(
  documentId: string,
  documentType: string,
  extractedData: Record<string, any>,
  agentResults: Record<string, AgentFinding>,
  options: MCPDataPushOptions
): Promise<{ success: boolean; recordId?: string; error?: string; labelStudioTaskId?: string }> {
  console.log(`[MCP-DataPush] Pushing ${documentType} to ${options.targetSystem}`);
  
  try {
    // Build payload based on document type and target system
    const payload = buildMCPPayload(documentType, extractedData, agentResults, options);
    
    // Call MCP CRM Tools edge function
    const mcpResult = await callEdgeFunction('mcp-crm-tools', {
      method: 'tools/call',
      params: {
        name: getMCPToolName(options.targetSystem, options.operation || 'create'),
        arguments: {
          ...payload,
          objectType: options.objectType,
          operation: options.operation
        }
      },
      id: Date.now()
    });
    
    let recordId: string | undefined;
    if (mcpResult.result?.content?.[0]?.text) {
      try {
        const parsed = JSON.parse(mcpResult.result.content[0].text);
        recordId = parsed.id;
      } catch (e) {
        console.log('[MCP-DataPush] Could not parse record ID');
      }
    }
    
    // Sync to Label Studio if enabled
    let labelStudioTaskId: string | undefined;
    if (options.labelStudioSync) {
      try {
        const lsResult = await callEdgeFunction('label-studio-connector', {
          action: 'createTask',
          projectId: options.labelStudioProject,
          taskData: {
            data: {
              document_id: documentId,
              document_type: documentType,
              target_system: options.targetSystem,
              record_id: recordId,
              extracted_data: extractedData,
              agent_results: Object.fromEntries(
                Object.entries(agentResults).map(([k, v]) => [k, v.summary])
              ),
              pushed_at: new Date().toISOString()
            },
            meta: {
              source: 'mcp_data_push',
              target: options.targetSystem,
              document_type: documentType
            }
          }
        });
        labelStudioTaskId = lsResult.data?.id;
      } catch (lsError) {
        console.warn('[MCP-DataPush] Label Studio sync failed:', lsError);
      }
    }
    
    console.log(`[MCP-DataPush] Success - Record ID: ${recordId}, LS Task: ${labelStudioTaskId}`);
    
    return {
      success: true,
      recordId,
      labelStudioTaskId
    };
  } catch (error) {
    console.error('[MCP-DataPush] Error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

function getMCPToolName(targetSystem: string, operation: string): string {
  switch (targetSystem) {
    case 'salesforce':
      return operation === 'update' ? 'salesforce_update_record' : 'salesforce_create_record';
    case 'veeva':
      return 'veeva_create_record';
    case 'hubspot':
      return operation === 'update' ? 'hubspot_update_contact' : 'hubspot_create_contact';
    case 'supabase':
      return 'sync_to_database';
    default:
      return 'generic_api_call';
  }
}

function buildMCPPayload(
  documentType: string,
  extractedData: Record<string, any>,
  agentResults: Record<string, AgentFinding>,
  options: MCPDataPushOptions
): Record<string, any> {
  const docTypeLower = documentType.toLowerCase();
  
  // Base payload from extracted data
  let payload: Record<string, any> = {};
  
  // Apply field mapping if provided
  if (options.fieldMapping) {
    for (const [sourceField, targetField] of Object.entries(options.fieldMapping)) {
      const value = extractedData[sourceField]?.value || extractedData[sourceField];
      if (value) {
        payload[targetField] = value;
      }
    }
  } else {
    // Default mappings based on document type and target system
    if (docTypeLower.includes('prescription') || docTypeLower.includes('rx')) {
      payload = {
        patient_name: extractedData.patient_name?.value || extractedData.patient_name,
        medication_name: extractedData.medication?.value || extractedData.medication,
        prescriber_name: extractedData.prescriber_name?.value || extractedData.prescriber,
        prescriber_npi: extractedData.npi?.value || extractedData.npi,
        sig_code: extractedData.sig?.value || extractedData.sig,
        quantity: extractedData.quantity?.value || extractedData.quantity,
        refills: extractedData.refills?.value || extractedData.refills,
        date_written: extractedData.date_written?.value || extractedData.date,
        // Add agent analysis
        clinical_review: agentResults['clinical-review']?.summary,
        drug_interactions: agentResults['drug-interaction']?.details?.drugDrugInteractionCount || 0,
        npi_verified: agentResults['npi-verification']?.details?.verified,
        confidence_score: Object.values(agentResults).reduce((sum, r) => sum + (r.confidence || 0), 0) / Object.keys(agentResults).length
      };
    } else if (docTypeLower.includes('insurance')) {
      payload = {
        member_id: extractedData.member_id?.value || extractedData.member_id,
        group_number: extractedData.group_number?.value || extractedData.group_number,
        payer_name: extractedData.payer_name?.value || extractedData.insurance_company,
        plan_name: extractedData.plan_name?.value || extractedData.plan,
        effective_date: extractedData.effective_date?.value || extractedData.effective_date,
        coverage_status: agentResults['insurance-verification-ai']?.details?.coverageStatus,
        rx_bin: extractedData.bin?.value || extractedData.rx_bin,
        rx_pcn: extractedData.pcn?.value || extractedData.rx_pcn
      };
    } else if (docTypeLower.includes('patient') || docTypeLower.includes('onboarding')) {
      payload = {
        first_name: extractedData.first_name?.value || extractedData.first_name,
        last_name: extractedData.last_name?.value || extractedData.last_name,
        date_of_birth: extractedData.dob?.value || extractedData.date_of_birth,
        email: extractedData.email?.value || extractedData.email,
        phone: extractedData.phone?.value || extractedData.phone,
        address: extractedData.address?.value || extractedData.address,
        onboarding_status: agentResults['patient-onboarding-ai']?.details?.status,
        completeness_score: agentResults['patient-onboarding-ai']?.details?.completenessScore
      };
    } else if (docTypeLower.includes('imaging') || docTypeLower.includes('xray') || docTypeLower.includes('mri') || docTypeLower.includes('ct')) {
      payload = {
        modality: extractedData.modality?.value || documentType,
        body_part: extractedData.body_part?.value || extractedData.anatomy,
        findings: extractedData.findings?.value || extractedData.findings,
        impression: extractedData.impression?.value || extractedData.impression,
        abnormalities_detected: agentResults['medical-imaging-ai']?.details?.abnormalityDetection?.abnormalitiesFound,
        abnormality_count: agentResults['medical-imaging-ai']?.details?.abnormalityDetection?.totalAbnormalities,
        critical_findings: agentResults['medical-imaging-ai']?.details?.criticalFindings?.length || 0,
        measurements: JSON.stringify(agentResults['medical-imaging-ai']?.details?.measurements?.measuredValues || [])
      };
    } else if (docTypeLower.includes('invoice') || docTypeLower.includes('billing') || docTypeLower.includes('claim')) {
      payload = {
        invoice_number: extractedData.invoice_number?.value || extractedData.claim_number,
        total_charges: extractedData.total_charges?.value || extractedData.total_amount,
        insurance_paid: extractedData.insurance_payment?.value,
        patient_responsibility: extractedData.patient_responsibility?.value,
        cpt_codes: extractedData.cpt_codes?.value,
        icd_codes: extractedData.icd_codes?.value,
        denial_risk: agentResults['invoice-billing-ai']?.details?.denialRiskAssessment?.overallRisk,
        collection_rate: agentResults['invoice-billing-ai']?.details?.financialSummary?.collectionRate
      };
    }
  }
  
  // Add common metadata
  payload.source = 'document_processing';
  payload.processed_at = new Date().toISOString();
  payload.document_type = documentType;
  
  return payload;
}

// ============================================
// INTELLIGENT OCR ROUTING
// Gemini Vision for handwritten, Label Studio for review/training
// ============================================

interface OCRRoutingResult {
  ocrProvider: 'gemini_vision' | 'label_studio' | 'hybrid';
  isHandwritten: boolean;
  confidence: number;
  processingPath: string[];
}

function determineOCRRouting(documentType: string, imageData?: string): OCRRoutingResult {
  const docTypeLower = documentType.toLowerCase();
  
  // Default to hybrid for most healthcare documents
  let isHandwritten = false;
  let ocrProvider: 'gemini_vision' | 'label_studio' | 'hybrid' = 'hybrid';
  let processingPath: string[] = [];
  
  // Document types that commonly have handwritten content
  const handwrittenDocTypes = [
    'prescription', 'rx', 'prescription_form', 'handwritten',
    'notes', 'clinical_notes', 'physician_notes', 'chart_notes'
  ];
  
  // Document types that are typically typed/printed
  const typedDocTypes = [
    'insurance_card', 'eob', 'invoice', 'billing', 'lab_result',
    'electronic', 'printed', 'pdf', 'claim'
  ];
  
  // Determine handwritten likelihood
  if (handwrittenDocTypes.some(t => docTypeLower.includes(t))) {
    isHandwritten = true;
    ocrProvider = 'gemini_vision'; // Gemini Vision excels at handwriting
    processingPath = ['gemini_vision_ocr', 'text_extraction', 'label_studio_review'];
  } else if (typedDocTypes.some(t => docTypeLower.includes(t))) {
    isHandwritten = false;
    ocrProvider = 'hybrid'; // Use standard OCR + AI verification
    processingPath = ['standard_ocr', 'gemini_verification', 'label_studio_training'];
  } else {
    // For medical imaging and mixed content
    ocrProvider = 'hybrid';
    processingPath = ['gemini_vision_analysis', 'text_extraction', 'label_studio_annotation'];
  }
  
  // Medical imaging always uses Gemini Vision first
  if (['xray', 'x-ray', 'ct', 'mri', 'ecg', 'ultrasound', 'mammogram', 'dicom'].some(t => docTypeLower.includes(t))) {
    ocrProvider = 'gemini_vision';
    processingPath = ['gemini_vision_analysis', 'abnormality_detection', 'measurement_extraction', 'label_studio_annotation'];
  }
  
  return {
    ocrProvider,
    isHandwritten,
    confidence: 0.85,
    processingPath
  };
}

// ============================================
// MAIN ROUTER

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { agentId, agentConfig, documentContext, options } = await req.json() as ExecutionRequest;
    
    console.log(`[execute-document-agent] Executing agent: ${agentId}`);
    console.log(`[execute-document-agent] Document type: ${documentContext.documentType}`);
    console.log(`[execute-document-agent] Fields count: ${Object.keys(documentContext.extractedFields || {}).length}`);
    
    // Check for agent-specific provider override
    const agentProvider = documentContext.agentProviders?.[agentId];
    if (agentProvider) {
      console.log(`[execute-document-agent] Using agent-specific provider: ${agentProvider}`);
      documentContext.preferredProvider = agentProvider;
    }
    
    const routing = getModelRouting(agentId, documentContext.preferredProvider);
    console.log(`[execute-document-agent] Model routing: ${routing.provider}/${routing.model} (fallback: ${routing.fallbackProvider}/${routing.fallbackModel})`);

    let findings: AgentFinding;

    // Route to appropriate agent implementation
    switch (agentId) {
      // ===== REAL API AGENTS (NPPES, FDA) =====
      case 'npi-verification':
      case 'npi-registry':
      case 'credentialing':
        findings = await executeNPIVerification(documentContext);
        break;

      case 'drug-lookup':
      case 'pharmacy-finder':
        findings = await executeDrugLookup(documentContext);
        break;

      // ===== MEDICATION AGENTS =====
      case 'ndc-lookup':
        findings = await executeNDCLookup(documentContext);
        break;
      
      case 'drug-alternatives':
        findings = await executeDrugAlternatives(documentContext);
        break;
      
      case 'efficacy-analysis':
        findings = await executeEfficacyAnalysis(documentContext);
        break;
      
      case 'safety-profile':
        findings = await executeSafetyProfile(documentContext);
        break;
      
      case 'dosage-validation':
        findings = await executeDosageValidation(documentContext);
        break;
      
      case 'cost-analysis':
        findings = await executeCostAnalysis(documentContext);
        break;
      
      // ===== SIG CODE ANALYSIS =====
      case 'sig-analysis':
      case 'sig-interpretation':
      case 'sig-code':
        findings = await executeSigCodeAnalysis(documentContext);
        break;

      // ===== UNIVERSAL AI AGENTS =====
      case 'clinical-review':
        findings = await executeClinicalReviewAI(documentContext);
        break;
      
      case 'drug-interaction':
      case 'medication-reconciliation':
        findings = await executeDrugInteractionAI(documentContext);
        break;
      
      case 'radiology-ai':
      case 'ct-analysis':
      case 'mri-analysis':
      case 'ultrasound-analysis':
      case 'mammogram-analysis':
        findings = await executeRadiologyAnalysisAI(documentContext);
        break;
      
      case 'critical-value-alert':
      case 'trend-analysis':
        findings = await executeLabAnalysisAI(documentContext);
        break;
      
      case 'medical-summary':
        findings = await executeMedicalSummary(documentContext);
        break;
      
      case 'eligibility-ai':
      case 'coverage-summary':
        findings = await executeEligibilityAnalysis(documentContext);
        break;
      
      case 'data-validation':
      case 'identity-verification-ai':
        findings = await executeDataValidation(documentContext);
        break;

      // ===== RCM & BILLING AGENTS =====
      case 'rcm-analysis':
      case 'revenue-cycle':
      case 'billing-analysis':
        findings = await executeRCMAnalysis(documentContext);
        break;
      
      case 'coding-validation':
      case 'cpt-validation':
      case 'icd-validation':
        findings = await executeCodingValidation(documentContext);
        break;
      
      case 'denial-prevention':
      case 'denial-risk':
      case 'claim-scrubbing':
        findings = await executeDenialPrevention(documentContext);
        break;

      // ===== ALL DOCUMENT TYPE AI AGENTS =====
      case 'insurance-verification-ai':
      case 'insurance-analysis':
      case 'coverage-verification':
        findings = await executeInsuranceVerificationAI(documentContext);
        break;
      
      case 'patient-onboarding-ai':
      case 'enrollment-analysis':
      case 'demographics-validation':
        findings = await executePatientOnboardingAI(documentContext);
        break;
      
      case 'medical-imaging-ai':
      case 'xray-analysis':
      case 'ct-analysis-ai':
      case 'mri-analysis-ai':
      case 'ecg-analysis':
      case 'ultrasound-analysis-ai':
      case 'mammogram-analysis-ai':
      case 'dicom-analysis':
        findings = await executeMedicalImagingAI(documentContext);
        break;
      
      case 'invoice-billing-ai':
      case 'claim-analysis':
      case 'eob-analysis':
      case 'superbill-analysis':
        findings = await executeInvoiceBillingAI(documentContext);
        break;

      // ===== CONFIGURATION-REQUIRED AGENTS (Legacy) =====
      case 'insurance-verification':
      case 'eligibility-check':
      case 'benefits-verification':
        findings = executeInsuranceVerification(documentContext);
        break;
      
      case 'prior-auth':
        findings = executePriorAuth(documentContext);
        break;
      
      // ===== DEFAULT =====
      default:
        findings = executeGenericAgent(agentConfig, documentContext);
    }

    console.log(`[execute-document-agent] Agent ${agentId} completed - AI: ${findings.aiPowered}, Provider: ${findings.provider || 'N/A'}, Source: ${findings.dataSource}, Confidence: ${findings.confidence}`);

    // Store results if requested and document ID provided
    if (options?.storeResults && documentContext.documentId) {
      await storeAgentResults(documentContext.documentId, agentId, findings);
    }
    
    // Update Label Studio if requested
    if (options?.updateLabelStudio && documentContext.documentId) {
      await updateLabelStudioWithResults(
        documentContext.documentId,
        agentId,
        findings,
        documentContext.documentType
      );
    }

    return new Response(
      JSON.stringify({
        success: true,
        agentId,
        findings,
        provider: findings.provider,
        model: findings.model,
        executedAt: new Date().toISOString(),
        resultsStored: options?.storeResults && documentContext.documentId ? true : false,
        labelStudioUpdated: options?.updateLabelStudio && documentContext.documentId ? true : false
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('[execute-document-agent] Error:', error);
    
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        findings: {
          summary: 'Agent execution failed',
          details: { error: true },
          recommendations: ['Retry agent execution', 'Check configuration'],
          alerts: [{ level: 'error', message: error instanceof Error ? error.message : 'Unknown error' }],
          confidence: 0,
          aiPowered: false
        }
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
