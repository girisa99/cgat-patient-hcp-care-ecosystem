import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

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
    model: 'claude-3-5-haiku-20241022',
    fallbackProvider: 'gemini',
    fallbackModel: 'gemini-2.0-flash-exp',
    systemPrompt: 'You are an expert clinical pharmacist with 20 years of experience. Provide evidence-based clinical assessments.'
  },
  'drug-interaction': {
    provider: 'claude',
    model: 'claude-3-5-haiku-20241022',
    fallbackProvider: 'gemini',
    fallbackModel: 'gemini-2.0-flash-exp',
    systemPrompt: 'You are an expert pharmacist specialized in drug-drug interactions and medication safety.'
  },
  'medication-reconciliation': {
    provider: 'claude',
    model: 'claude-3-5-haiku-20241022',
    fallbackProvider: 'openai',
    fallbackModel: 'gpt-4o-mini',
    systemPrompt: 'You are a clinical pharmacist specializing in medication reconciliation and patient safety.'
  },
  
  // Radiology/Imaging agents → Gemini (best for vision, medical imaging)
  'radiology-ai': {
    provider: 'gemini',
    model: 'gemini-2.0-flash-exp',
    fallbackProvider: 'claude',
    fallbackModel: 'claude-3-5-haiku-20241022',
    systemPrompt: 'You are an experienced radiologist assistant. Provide structured, actionable radiology assessments.'
  },
  'ct-analysis': {
    provider: 'gemini',
    model: 'gemini-1.5-pro',
    fallbackProvider: 'claude',
    fallbackModel: 'claude-3-5-haiku-20241022',
    systemPrompt: 'You are a CT imaging specialist. Analyze CT scan findings with clinical precision.'
  },
  'mri-analysis': {
    provider: 'gemini',
    model: 'gemini-1.5-pro',
    fallbackProvider: 'claude',
    fallbackModel: 'claude-3-5-haiku-20241022',
    systemPrompt: 'You are an MRI imaging specialist. Analyze MRI findings with attention to soft tissue detail.'
  },
  'ultrasound-analysis': {
    provider: 'gemini',
    model: 'gemini-2.0-flash-exp',
    fallbackProvider: 'claude',
    fallbackModel: 'claude-3-5-haiku-20241022',
    systemPrompt: 'You are an ultrasound specialist. Provide structured sonographic assessments.'
  },
  'mammogram-analysis': {
    provider: 'gemini',
    model: 'gemini-1.5-pro',
    fallbackProvider: 'claude',
    fallbackModel: 'claude-3-5-haiku-20241022',
    systemPrompt: 'You are a breast imaging specialist. Analyze mammographic findings using BI-RADS criteria.'
  },
  
  // Lab agents → Claude (clinical interpretation)
  'critical-value-alert': {
    provider: 'claude',
    model: 'claude-3-5-haiku-20241022',
    fallbackProvider: 'openai',
    fallbackModel: 'gpt-4o-mini',
    systemPrompt: 'You are an expert clinical laboratory scientist specializing in result interpretation and critical value identification.'
  },
  'trend-analysis': {
    provider: 'claude',
    model: 'claude-3-5-haiku-20241022',
    fallbackProvider: 'openai',
    fallbackModel: 'gpt-4o-mini',
    systemPrompt: 'You are a clinical pathologist analyzing laboratory trends and patterns.'
  },
  
  // Default for unknown agents
  'default': {
    provider: 'gemini',
    model: 'gemini-2.0-flash-exp',
    fallbackProvider: 'claude',
    fallbackModel: 'claude-3-5-haiku-20241022',
    systemPrompt: 'You are a healthcare AI assistant. Provide accurate, evidence-based analysis.'
  }
};

function getModelRouting(agentId: string): ModelRoutingConfig {
  return AGENT_MODEL_ROUTING[agentId] || AGENT_MODEL_ROUTING['default'];
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
  preferredProvider?: 'claude' | 'gemini' | 'openai';
}

interface ExecutionRequest {
  agentId: string;
  agentConfig: AgentConfig;
  documentContext: DocumentContext;
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

// Get medication name with comprehensive fallbacks
function getMedicationName(fields: Record<string, any>): string {
  return getFieldValue(fields, 
    'medication', 'medication_name', 'drug_name', 'drug', 
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
  customSystemPrompt?: string
): Promise<{ content: string; provider: string; model: string }> {
  const routing = getModelRouting(agentId);
  const systemPrompt = customSystemPrompt || routing.systemPrompt;
  
  console.log(`[universal-ai] Agent: ${agentId}, Provider: ${routing.provider}, Model: ${routing.model}`);
  
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
 */
async function executeDrugLookup(context: DocumentContext): Promise<AgentFinding> {
  const fields = context.extractedFields || {};
  
  // Use helper functions for comprehensive field name fallbacks
  const drugName = getMedicationName(fields);
  const ndc = getNDC(fields);
  
  console.log('[drug-lookup] Extracted drugName:', drugName, 'ndc:', ndc);
  console.log('[drug-lookup] Available fields:', Object.keys(fields));
  
  if (drugName === 'Unknown' && ndc === 'Not available') {
    return {
      summary: 'Drug Lookup: No medication name or NDC found',
      details: { 
        status: 'no_data',
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
    console.log(`[drug-lookup] Calling drug-lookup for: ${drugName || ndc}`);
    
    const drugResult = await callEdgeFunction('drug-lookup', {
      drugName: drugName || ndc,
      searchType: 'all'
    });

    const ndcInfo = drugResult.ndc?.[0];
    const rxnormInfo = drugResult.rxnorm?.[0];
    const clinicalInfo = drugResult.clinicalInfo || [];
    const alternatives = drugResult.alternatives || [];
    
    const alerts: Array<{ level: 'info' | 'warning' | 'error'; message: string }> = [];
    
    // Add clinical alerts
    clinicalInfo.forEach((info: any) => {
      if (info.severity === 'high') {
        alerts.push({ level: 'error', message: info.description });
      } else if (info.severity === 'medium') {
        alerts.push({ level: 'warning', message: info.description });
      } else {
        alerts.push({ level: 'info', message: info.description });
      }
    });
    
    if (drugResult.isControlled) {
      alerts.push({ level: 'warning', message: `Controlled substance - Schedule ${drugResult.schedule}` });
    }

    const hasData = ndcInfo || rxnormInfo;
    
    return {
      summary: hasData 
        ? `Drug Found: ${ndcInfo?.brandName || ndcInfo?.genericName || rxnormInfo?.name || drugName}`
        : `Drug Lookup: ${drugName} - No FDA data found`,
      details: {
        searchedDrug: drugName,
        correctedName: drugResult.correctedName,
        wasCorrected: drugResult.wasCorrected,
        ndcCode: ndcInfo?.code,
        genericName: ndcInfo?.genericName,
        brandName: ndcInfo?.brandName,
        manufacturer: ndcInfo?.manufacturer,
        dosageForm: ndcInfo?.dosageForm,
        route: ndcInfo?.route,
        strength: ndcInfo?.strength,
        pharmClass: ndcInfo?.pharmClass,
        rxcui: rxnormInfo?.rxcui,
        isControlled: drugResult.isControlled,
        schedule: drugResult.schedule,
        interactions: clinicalInfo.filter((c: any) => c.type === 'interaction'),
        warnings: clinicalInfo.filter((c: any) => c.type === 'warning'),
        alternatives: alternatives.slice(0, 3)
      },
      recommendations: [
        hasData ? 'Drug verified in FDA database' : 'Manual drug verification recommended',
        drugResult.wasCorrected ? `Name corrected from "${drugName}" to "${drugResult.correctedName}"` : null,
        drugResult.isControlled ? 'Verify DEA number and check PDMP' : null,
        clinicalInfo.length > 0 ? `${clinicalInfo.length} clinical consideration(s) found` : null
      ].filter(Boolean) as string[],
      alerts: alerts.length > 0 ? alerts : [{ level: 'info', message: hasData ? 'Drug verified in FDA database' : 'No FDA data available' }],
      confidence: hasData ? 0.92 : 0.5,
      aiPowered: false,
      dataSource: 'FDA OpenFDA + NIH RxNorm'
    };
  } catch (error) {
    console.error('[drug-lookup] Error:', error);
    return {
      summary: `Drug Lookup: API error for ${drugName}`,
      details: { drugName, error: error instanceof Error ? error.message : 'Unknown error' },
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
  
  // Use helper functions for comprehensive field name fallbacks
  const medication = getMedicationName(fields);
  const dosage = getDosage(fields);
  const frequency = getFrequency(fields);
  const sigCode = getFieldValue(fields, 'sig_code', 'sigCode') || '';
  const patientInfo = getFieldValue(fields, 'patient_name', 'patientName', 'patient') || 'Patient';
  const diagnosis = getFieldValue(fields, 'diagnosis', 'icd_code', 'indication') || 'Not specified';
  const route = getFieldValue(fields, 'route', 'route_of_administration', 'routeOfAdministration') || 'oral';
  
  console.log('[clinical-review-ai] Extracted medication:', medication, 'dosage:', dosage);
  console.log('[clinical-review-ai] Available fields:', Object.keys(fields));

  const prompt = `Analyze the following prescription data and provide a clinical assessment.

PRESCRIPTION DATA:
- Medication: ${medication}
- Dosage/Strength: ${dosage}
- Frequency/SIG: ${frequency}
- SIG Code: ${sigCode}
- Route: ${route}
- Patient: ${patientInfo}
- Diagnosis/Indication: ${diagnosis}
- Document Type: ${context.documentType}

${context.rawText ? `Additional document text: ${context.rawText.slice(0, 500)}` : ''}

Provide your clinical review in the following JSON format:
{
  "summary": "Brief 1-sentence clinical assessment",
  "appropriateness": "appropriate" | "needs_review" | "concern",
  "dosageAssessment": "within_range" | "low" | "high" | "needs_verification",
  "frequencyAssessment": "appropriate" | "unusual" | "concern",
  "interactions": ["List any potential drug interactions or concerns"],
  "recommendations": ["List 2-3 specific clinical recommendations"],
  "alerts": [{"level": "info|warning|error", "message": "alert message"}],
  "confidence": 0.0 to 1.0
}

Focus on:
1. Dosage appropriateness for the indication
2. Frequency and route appropriateness
3. Potential drug interactions
4. Patient safety considerations

Respond ONLY with the JSON object, no additional text.`;

  try {
    const aiResult = await callUniversalAI('clinical-review', prompt);
    
    console.log('[clinical-review-ai] Provider:', aiResult.provider, 'Model:', aiResult.model);
    
    const jsonMatch = aiResult.content.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      return {
        summary: parsed.summary || `Clinical review: ${medication} - ${parsed.appropriateness || 'Assessment complete'}`,
        details: {
          medication,
          dosage,
          frequency,
          sigCode,
          route,
          appropriateness: parsed.appropriateness || 'needs_review',
          dosageAssessment: parsed.dosageAssessment || 'needs_verification',
          frequencyAssessment: parsed.frequencyAssessment || 'appropriate',
          interactions: parsed.interactions || [],
          aiAnalysis: true
        },
        recommendations: parsed.recommendations || ['Review prescription with prescriber'],
        alerts: parsed.alerts || [],
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
  
  // Use helper functions for comprehensive field name fallbacks
  const medication = getMedicationName(fields);
  const dosage = getDosage(fields);
  const ndc = getNDC(fields);
  
  console.log('[drug-interaction-ai] Extracted medication:', medication, 'dosage:', dosage, 'ndc:', ndc);
  console.log('[drug-interaction-ai] Available fields:', Object.keys(fields));
  
  // Check if we have valid data
  if (medication === 'Unknown') {
    return {
      summary: 'Insufficient data to perform medication interaction analysis',
      details: { 
        medication: 'Unknown', 
        dosage, 
        ndc,
        availableFields: Object.keys(fields),
        error: 'No medication name found in extracted fields'
      },
      recommendations: ['Verify medication name was extracted correctly', 'Check document quality'],
      alerts: [{ level: 'warning', message: 'Insufficient data to perform medication interaction analysis' }],
      confidence: 0.1,
      aiPowered: false,
      dataSource: 'No data extracted'
    };
  }

  // First get FDA data for context
  let fdaContext = '';
  try {
    const drugData = await callEdgeFunction('drug-lookup', { drugName: medication, searchType: 'all' });
    if (drugData.ndc?.[0]) {
      fdaContext = `\nFDA DATA:
- Generic Name: ${drugData.ndc[0].genericName}
- Brand Name: ${drugData.ndc[0].brandName}
- Drug Class: ${(drugData.ndc[0].pharmClass || []).join(', ')}
- Route: ${drugData.ndc[0].route}
- Known Interactions: ${(drugData.clinicalInfo || []).map((c: any) => c.description).join('; ').slice(0, 300)}`;
    }
  } catch (e) {
    console.log('[drug-interaction-ai] FDA lookup failed, proceeding with AI only');
  }

  const prompt = `Analyze this medication for potential interactions and safety concerns.

MEDICATION DATA:
- Drug Name: ${medication}
- Dosage: ${dosage}
- NDC Code: ${ndc}
- Document Type: ${context.documentType}
${fdaContext}

${context.rawText ? `Additional context: ${context.rawText.slice(0, 400)}` : ''}

Provide your drug interaction analysis in the following JSON format:
{
  "summary": "Brief 1-sentence summary of findings",
  "drugClass": "Identified drug class (e.g., SSRI, ACE inhibitor, etc.)",
  "commonInteractions": [
    {"drug": "drug name", "severity": "mild|moderate|severe", "effect": "description"}
  ],
  "foodInteractions": ["List food interactions if any"],
  "contraindications": ["List absolute contraindications"],
  "precautions": ["List precautions for use"],
  "recommendations": ["2-3 specific recommendations"],
  "alerts": [{"level": "info|warning|error", "message": "alert message"}],
  "confidence": 0.0 to 1.0
}

Focus on clinically significant interactions. Respond ONLY with the JSON object.`;

  try {
    const aiResult = await callUniversalAI('drug-interaction', prompt);
    
    console.log('[drug-interaction-ai] Provider:', aiResult.provider, 'Model:', aiResult.model);
    
    const jsonMatch = aiResult.content.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      const interactionCount = (parsed.commonInteractions?.length || 0) + (parsed.foodInteractions?.length || 0);
      
      return {
        summary: parsed.summary || `Drug check: ${medication} - ${interactionCount} interaction(s) identified`,
        details: {
          medication,
          dosage,
          ndc,
          drugClass: parsed.drugClass || 'Unknown class',
          commonInteractions: parsed.commonInteractions || [],
          foodInteractions: parsed.foodInteractions || [],
          contraindications: parsed.contraindications || [],
          precautions: parsed.precautions || [],
          interactionCount,
          aiAnalysis: true
        },
        recommendations: parsed.recommendations || ['Review with pharmacist before dispensing'],
        alerts: parsed.alerts || [],
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
    const aiResult = await callUniversalAI('radiology-ai', prompt);
    
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
    const aiResult = await callUniversalAI('critical-value-alert', prompt);
    
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
  
  // Use helper functions
  const medication = getMedicationName(fields);
  const dosage = getDosage(fields);
  const frequency = getFrequency(fields);

  if (dosage) {
    const doseValue = parseFloat(dosage);
    if (doseValue > 1000) {
      alerts.push({ level: 'warning', message: 'High dosage detected - verify with prescriber' });
    }
  }

  if (frequency?.toLowerCase().includes('prn')) {
    alerts.push({ level: 'info', message: 'PRN medication - ensure patient instructions are clear' });
  }

  return {
    summary: `Clinical review: ${medication || 'Prescription'} - Rule-based assessment`,
    details: { medication, dosage, frequency, appropriateness: 'needs_review', fallbackMode: true },
    recommendations: ['AI analysis unavailable - manual clinical review recommended'],
    alerts,
    confidence: 0.5,
    aiPowered: false,
    dataSource: 'Rule-based fallback'
  };
}

function executeDrugInteractionFallback(context: DocumentContext): AgentFinding {
  const fields = context.extractedFields || {};
  // Use helper function
  const medication = getMedicationName(fields);
  const alerts: Array<{ level: 'info' | 'warning' | 'error'; message: string }> = [];

  if (medication?.toLowerCase().includes('warfarin') || medication?.toLowerCase().includes('coumadin')) {
    alerts.push({ level: 'warning', message: 'Warfarin detected - Monitor INR levels closely' });
  }

  if (fields.schedule?.value || fields.controlled?.value) {
    alerts.push({ level: 'info', message: 'Controlled substance - DEA verification required' });
  }

  return {
    summary: `Drug check: ${medication} - Rule-based check`,
    details: { medication, fallbackMode: true, interactionsFound: alerts.length },
    recommendations: ['AI analysis unavailable - manual review recommended'],
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
    const aiResult = await callUniversalAI('drug-alternatives', prompt);
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
    const aiResult = await callUniversalAI('efficacy-analysis', prompt);
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
    const aiResult = await callUniversalAI('safety-profile', prompt);
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
    const aiResult = await callUniversalAI('dosage-validation', prompt);
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
    const aiResult = await callUniversalAI('cost-analysis', prompt);
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
    const aiResult = await callUniversalAI('medical-summary', prompt);
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
    const aiResult = await callUniversalAI('eligibility-ai', prompt);
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
    const aiResult = await callUniversalAI('data-validation', prompt);
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
// MAIN ROUTER
// ============================================

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { agentId, agentConfig, documentContext } = await req.json() as ExecutionRequest;
    
    console.log(`[execute-document-agent] Executing agent: ${agentId}`);
    console.log(`[execute-document-agent] Document type: ${documentContext.documentType}`);
    console.log(`[execute-document-agent] Fields count: ${Object.keys(documentContext.extractedFields || {}).length}`);
    
    const routing = getModelRouting(agentId);
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

      // ===== NEW MEDICATION AGENTS =====
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

      // ===== CONFIGURATION-REQUIRED AGENTS =====
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

    return new Response(
      JSON.stringify({
        success: true,
        agentId,
        findings,
        executedAt: new Date().toISOString()
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
