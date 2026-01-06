import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
const AI_GATEWAY_URL = 'https://ai.gateway.lovable.dev/v1/chat/completions';

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
}

// ============================================
// REAL AI-POWERED AGENTS (using Lovable AI)
// ============================================

async function executeClinicalReviewAI(context: DocumentContext): Promise<AgentFinding> {
  const fields = context.extractedFields || {};
  
  // Build context from extracted fields
  const medication = fields.medication?.value || fields.drug_name?.value || 'Unknown medication';
  const dosage = fields.dosage?.value || fields.strength?.value || 'Not specified';
  const frequency = fields.frequency?.value || fields.sig?.value || 'Not specified';
  const patientInfo = fields.patient_name?.value || 'Patient';
  const diagnosis = fields.diagnosis?.value || fields.icd_code?.value || 'Not specified';

  const prompt = `You are a clinical pharmacist reviewing a prescription. Analyze the following prescription data and provide a clinical assessment.

PRESCRIPTION DATA:
- Medication: ${medication}
- Dosage: ${dosage}
- Frequency: ${frequency}
- Patient: ${patientInfo}
- Diagnosis/Indication: ${diagnosis}
- Document Type: ${context.documentType}

${context.rawText ? `Additional document text: ${context.rawText.slice(0, 500)}` : ''}

Provide your clinical review in the following JSON format:
{
  "summary": "Brief 1-sentence clinical assessment",
  "appropriateness": "appropriate" | "needs_review" | "concern",
  "dosageAssessment": "within_range" | "low" | "high" | "needs_verification",
  "interactions": ["List any potential drug interactions or concerns"],
  "recommendations": ["List 2-3 specific clinical recommendations"],
  "alerts": [{"level": "info|warning|error", "message": "alert message"}],
  "confidence": 0.0 to 1.0
}

Focus on:
1. Dosage appropriateness for the indication
2. Potential drug interactions
3. Duration of therapy concerns
4. Patient safety considerations

Respond ONLY with the JSON object, no additional text.`;

  try {
    const response = await fetch(AI_GATEWAY_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: 'You are an expert clinical pharmacist with 20 years of experience. Provide evidence-based clinical assessments.' },
          { role: 'user', content: prompt }
        ],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('[clinical-review-ai] API error:', response.status, errorText);
      throw new Error(`AI API error: ${response.status}`);
    }

    const data = await response.json();
    const aiResponse = data.choices?.[0]?.message?.content || '';
    
    console.log('[clinical-review-ai] Raw response:', aiResponse);
    
    // Parse AI response
    const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      return {
        summary: parsed.summary || `Clinical review: ${medication} - ${parsed.appropriateness || 'Assessment complete'}`,
        details: {
          medication,
          dosage,
          frequency,
          appropriateness: parsed.appropriateness || 'needs_review',
          dosageAssessment: parsed.dosageAssessment || 'needs_verification',
          interactions: parsed.interactions || [],
          aiAnalysis: true
        },
        recommendations: parsed.recommendations || ['Review prescription with prescriber'],
        alerts: parsed.alerts || [],
        confidence: parsed.confidence || 0.85,
        aiPowered: true,
        model: 'google/gemini-2.5-flash'
      };
    }

    throw new Error('Failed to parse AI response');
  } catch (error) {
    console.error('[clinical-review-ai] Error:', error);
    // Fallback to rule-based analysis
    return executeClinicalReviewFallback(context);
  }
}

async function executeDrugInteractionAI(context: DocumentContext): Promise<AgentFinding> {
  const fields = context.extractedFields || {};
  
  const medication = fields.medication?.value || fields.drug_name?.value || fields.medication_name?.value || 'Unknown';
  const dosage = fields.dosage?.value || fields.strength?.value || 'Not specified';
  const ndc = fields.ndc?.value || 'Not available';

  const prompt = `You are a pharmacist specialized in drug interactions. Analyze this medication for potential interactions and safety concerns.

MEDICATION DATA:
- Drug Name: ${medication}
- Dosage: ${dosage}
- NDC Code: ${ndc}
- Document Type: ${context.documentType}

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
    const response = await fetch(AI_GATEWAY_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: 'You are an expert pharmacist specialized in drug-drug interactions and medication safety.' },
          { role: 'user', content: prompt }
        ],
      }),
    });

    if (!response.ok) {
      throw new Error(`AI API error: ${response.status}`);
    }

    const data = await response.json();
    const aiResponse = data.choices?.[0]?.message?.content || '';
    
    console.log('[drug-interaction-ai] Raw response:', aiResponse);
    
    const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
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
        model: 'google/gemini-2.5-flash'
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

  const prompt = `You are a radiologist assistant. Analyze the following radiology study data and provide a structured assessment.

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
    const response = await fetch(AI_GATEWAY_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: 'You are an experienced radiologist assistant. Provide structured, actionable radiology assessments.' },
          { role: 'user', content: prompt }
        ],
      }),
    });

    if (!response.ok) {
      throw new Error(`AI API error: ${response.status}`);
    }

    const data = await response.json();
    const aiResponse = data.choices?.[0]?.message?.content || '';
    
    console.log('[radiology-ai] Raw response:', aiResponse);
    
    const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      const abnormalFindings = (parsed.findings || []).filter((f: any) => f.significance === 'abnormal' || f.significance === 'critical');
      
      // Generate alerts based on findings
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
        model: 'google/gemini-2.5-flash'
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
  
  // Build lab values from extracted fields
  const labValues: string[] = [];
  for (const [key, fieldData] of Object.entries(fields)) {
    const value = typeof fieldData === 'object' ? fieldData.value : fieldData;
    if (value && key.toLowerCase().match(/(glucose|potassium|sodium|creatinine|hemoglobin|hematocrit|wbc|rbc|platelet|bun|alt|ast|bilirubin|albumin|calcium|phosphorus|magnesium)/)) {
      labValues.push(`${key}: ${value}`);
    }
  }

  const prompt = `You are a clinical laboratory scientist. Analyze these lab results and identify any critical values or concerning trends.

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
    const response = await fetch(AI_GATEWAY_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: 'You are an expert clinical laboratory scientist specializing in result interpretation and critical value identification.' },
          { role: 'user', content: prompt }
        ],
      }),
    });

    if (!response.ok) {
      throw new Error(`AI API error: ${response.status}`);
    }

    const data = await response.json();
    const aiResponse = data.choices?.[0]?.message?.content || '';
    
    const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      const criticalCount = parsed.criticalValues?.length || 0;
      
      // Generate critical alerts
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
        model: 'google/gemini-2.5-flash'
      };
    }

    throw new Error('Failed to parse AI response');
  } catch (error) {
    console.error('[lab-analysis-ai] Error:', error);
    return executeLabAnalysisFallback(context);
  }
}

// ============================================
// FALLBACK RULE-BASED AGENTS (when AI fails)
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
    details: {
      medication,
      dosage,
      frequency,
      appropriateness: 'needs_review',
      fallbackMode: true
    },
    recommendations: ['Prescription requires manual clinical review', 'AI analysis unavailable - using rule-based checks'],
    alerts,
    confidence: 0.6,
    aiPowered: false
  };
}

function executeDrugInteractionFallback(context: DocumentContext): AgentFinding {
  const fields = context.extractedFields || {};
  const medication = fields.medication?.value || fields.drug_name?.value || 'Unknown';
  const alerts: Array<{ level: 'info' | 'warning' | 'error'; message: string }> = [];

  // Basic interaction checks
  if (medication?.toLowerCase().includes('warfarin') || medication?.toLowerCase().includes('coumadin')) {
    alerts.push({ level: 'warning', message: 'Warfarin detected - Monitor INR levels closely' });
  }

  if (fields.schedule?.value || fields.controlled?.value) {
    alerts.push({ level: 'info', message: 'Controlled substance - DEA verification required' });
  }

  return {
    summary: `Drug check: ${medication} - Rule-based check`,
    details: { medication, fallbackMode: true, interactionsFound: alerts.length },
    recommendations: ['Manual drug interaction review recommended', 'AI analysis unavailable'],
    alerts,
    confidence: 0.5,
    aiPowered: false
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
    recommendations: ['Manual radiologist review required', 'AI analysis unavailable'],
    alerts,
    confidence: 0.5,
    aiPowered: false
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
    recommendations: criticalCount > 0 ? ['Immediate physician notification'] : ['Manual review recommended'],
    alerts,
    confidence: 0.55,
    aiPowered: false
  };
}

// ============================================
// NON-AI AGENTS (require external integrations)
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
      status: 'pending_integration',
      requiredSetup: ['Payer API credentials', 'Eligibility endpoint configuration', 'Provider NPI registration']
    },
    recommendations: [
      'Configure payer API integration to enable real-time verification',
      'Insurance verification requires: 270/271 EDI transaction setup'
    ],
    alerts: [{ level: 'info', message: 'Integration required: Payer eligibility APIs not configured' }],
    confidence: 0.3,
    aiPowered: false
  };
}

function executePriorAuth(context: DocumentContext): AgentFinding {
  return {
    summary: 'Prior Authorization - Requires payer portal integration',
    details: {
      status: 'pending_integration',
      requiredSetup: ['Payer portal credentials', 'Prior auth API endpoints', 'Provider credentialing']
    },
    recommendations: [
      'Configure prior authorization portal connections',
      'Requires: CoverMyMeds, SureScripts, or payer-specific API setup'
    ],
    alerts: [{ level: 'info', message: 'Integration required: Prior auth APIs not configured' }],
    confidence: 0.2,
    aiPowered: false
  };
}

function executeNPIVerification(context: DocumentContext): AgentFinding {
  const fields = context.extractedFields || {};
  const npi = fields.npi?.value || fields.provider_npi?.value;

  return {
    summary: `NPI Verification: ${npi || 'Not found'} - Requires NPPES API`,
    details: {
      npiFound: !!npi,
      npiValue: npi,
      status: 'pending_integration',
      requiredSetup: ['NPPES API integration']
    },
    recommendations: [
      'Configure NPPES registry API integration',
      'NPI verification available via: https://npiregistry.cms.hhs.gov/api'
    ],
    alerts: [{ level: 'info', message: 'Integration available: NPPES API is free to use' }],
    confidence: 0.4,
    aiPowered: false
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
    aiPowered: false
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
    console.log(`[execute-document-agent] LOVABLE_API_KEY available: ${!!LOVABLE_API_KEY}`);

    let findings: AgentFinding;

    // Route to AI-powered or integration-required agents
    switch (agentId) {
      // ===== AI-POWERED AGENTS (Real execution) =====
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

      // ===== INTEGRATION-REQUIRED AGENTS (Show requirements) =====
      case 'insurance-verification':
      case 'eligibility-check':
      case 'benefits-verification':
        findings = executeInsuranceVerification(documentContext);
        break;
      
      case 'prior-auth':
        findings = executePriorAuth(documentContext);
        break;
      
      case 'npi-verification':
      case 'npi-registry':
      case 'credentialing':
        findings = executeNPIVerification(documentContext);
        break;
      
      // ===== DEFAULT (needs configuration) =====
      default:
        findings = executeGenericAgent(agentConfig, documentContext);
    }

    console.log(`[execute-document-agent] Agent ${agentId} completed - AI: ${findings.aiPowered}, confidence: ${findings.confidence}`);

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
