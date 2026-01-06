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
  
  const drugName = fields.medication?.value || fields.drug_name?.value || fields.medication_name?.value;
  const ndc = fields.ndc?.value || fields.ndc_code?.value;
  
  if (!drugName && !ndc) {
    return {
      summary: 'Drug Lookup: No medication name or NDC found',
      details: { status: 'no_data' },
      recommendations: ['Manual medication entry required'],
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
  
  const medication = fields.medication?.value || fields.drug_name?.value || 'Unknown medication';
  const dosage = fields.dosage?.value || fields.strength?.value || 'Not specified';
  const frequency = fields.frequency?.value || fields.sig?.value || fields.sig_text?.value || 'Not specified';
  const sigCode = fields.sig_code?.value || '';
  const patientInfo = fields.patient_name?.value || 'Patient';
  const diagnosis = fields.diagnosis?.value || fields.icd_code?.value || 'Not specified';
  const route = fields.route?.value || fields.route_of_administration?.value || 'oral';

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
  
  const medication = fields.medication?.value || fields.drug_name?.value || fields.medication_name?.value || 'Unknown';
  const dosage = fields.dosage?.value || fields.strength?.value || 'Not specified';
  const ndc = fields.ndc?.value || fields.ndc_code?.value || 'Not available';

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
  
  const medication = fields.medication?.value || fields.drug_name?.value;
  const dosage = fields.dosage?.value || fields.strength?.value;
  const frequency = fields.frequency?.value || fields.sig?.value;

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
  const medication = fields.medication?.value || fields.drug_name?.value || 'Unknown';
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
