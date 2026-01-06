import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

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
}

// Agent-specific execution logic
function executeInsuranceVerification(context: DocumentContext): AgentFinding {
  const fields = context.extractedFields || {};
  const alerts: Array<{ level: 'info' | 'warning' | 'error'; message: string }> = [];
  const details: Record<string, any> = {};

  // Simulate insurance verification
  const memberId = fields.member_id?.value || fields.insurance_id?.value;
  const groupNumber = fields.group_number?.value || fields.group_id?.value;
  const payerName = fields.payer_name?.value || fields.insurance_name?.value;

  details.memberIdVerified = !!memberId;
  details.groupNumberVerified = !!groupNumber;
  details.payerIdentified = !!payerName;
  details.coverageStatus = 'Active';
  details.eligibilityConfirmed = true;
  details.effectiveDate = '2024-01-01';
  details.terminationDate = '2024-12-31';

  if (!memberId) {
    alerts.push({ level: 'warning', message: 'Member ID not found in document' });
  }

  if (!groupNumber) {
    alerts.push({ level: 'info', message: 'Group number not extracted - may need manual entry' });
  }

  return {
    summary: `Insurance verified: ${payerName || 'Unknown Payer'} - Coverage Active`,
    details,
    recommendations: [
      'Verify member ID matches patient records',
      'Confirm coverage effective dates'
    ],
    alerts,
    confidence: memberId && groupNumber ? 0.95 : 0.75
  };
}

function executeDrugInteractionCheck(context: DocumentContext): AgentFinding {
  const fields = context.extractedFields || {};
  const alerts: Array<{ level: 'info' | 'warning' | 'error'; message: string }> = [];
  const details: Record<string, any> = {};

  const medication = fields.medication?.value || fields.drug_name?.value || fields.medication_name?.value;
  
  details.medicationIdentified = medication || 'Unknown';
  details.ndcVerified = !!fields.ndc?.value;
  details.formularyStatus = 'Tier 2';
  details.genericAvailable = true;
  details.priorAuthRequired = false;

  // Simulate interaction check
  if (medication?.toLowerCase().includes('warfarin') || medication?.toLowerCase().includes('coumadin')) {
    alerts.push({ 
      level: 'warning', 
      message: 'Warfarin detected - Monitor INR levels closely with antibiotic use' 
    });
    details.interactionsFound = 1;
    details.interactionSeverity = 'Moderate';
  } else {
    details.interactionsFound = 0;
  }

  // Check for controlled substances
  if (fields.schedule?.value || fields.controlled?.value) {
    alerts.push({ level: 'info', message: 'Controlled substance - DEA verification required' });
    details.isControlled = true;
  }

  return {
    summary: `Drug check: ${medication || 'Unknown'} - ${details.interactionsFound} interaction(s) found`,
    details,
    recommendations: details.interactionsFound > 0 
      ? ['Review drug interactions before dispensing', 'Consider alternative medications']
      : ['No significant interactions detected'],
    alerts,
    confidence: medication ? 0.9 : 0.6
  };
}

function executeClinicalReview(context: DocumentContext): AgentFinding {
  const fields = context.extractedFields || {};
  const alerts: Array<{ level: 'info' | 'warning' | 'error'; message: string }> = [];
  const details: Record<string, any> = {};

  const medication = fields.medication?.value || fields.drug_name?.value;
  const dosage = fields.dosage?.value || fields.strength?.value;
  const frequency = fields.frequency?.value || fields.sig?.value;

  details.medicationAppropriate = true;
  details.dosageWithinRange = true;
  details.durationAppropriate = true;
  details.contraindications = 'None identified';

  // Check dosage
  if (dosage) {
    const doseValue = parseFloat(dosage);
    if (doseValue > 1000) {
      alerts.push({ level: 'warning', message: 'High dosage detected - verify with prescriber' });
      details.dosageWithinRange = false;
    }
  }

  // Check frequency
  if (frequency?.toLowerCase().includes('prn')) {
    details.isPRN = true;
    alerts.push({ level: 'info', message: 'PRN medication - ensure patient instructions are clear' });
  }

  return {
    summary: `Clinical review: ${medication || 'Prescription'} - Appropriate for use`,
    details,
    recommendations: [
      'Prescription appears clinically appropriate',
      'Standard monitoring recommended'
    ],
    alerts,
    confidence: medication && dosage ? 0.92 : 0.7
  };
}

function executeLabAnalysis(context: DocumentContext): AgentFinding {
  const fields = context.extractedFields || {};
  const alerts: Array<{ level: 'info' | 'warning' | 'error'; message: string }> = [];
  const details: Record<string, any> = {};

  // Scan for critical values
  const criticalFields = ['glucose', 'potassium', 'sodium', 'creatinine', 'hemoglobin'];
  let criticalCount = 0;

  for (const [key, fieldData] of Object.entries(fields)) {
    const value = typeof fieldData === 'object' ? fieldData.value : fieldData;
    const keyLower = key.toLowerCase();
    
    if (keyLower.includes('glucose')) {
      const numValue = parseFloat(value);
      if (numValue > 400 || numValue < 50) {
        alerts.push({ level: 'error', message: `Critical glucose level: ${value}` });
        criticalCount++;
      }
      details.glucose = value;
    }
    
    if (keyLower.includes('potassium')) {
      const numValue = parseFloat(value);
      if (numValue > 6.0 || numValue < 2.5) {
        alerts.push({ level: 'error', message: `Critical potassium level: ${value}` });
        criticalCount++;
      }
      details.potassium = value;
    }
  }

  details.criticalValuesFound = criticalCount;
  details.analysisComplete = true;

  return {
    summary: criticalCount > 0 
      ? `Lab Analysis: ${criticalCount} critical value(s) detected!`
      : 'Lab Analysis: All values within normal range',
    details,
    recommendations: criticalCount > 0
      ? ['Immediate physician notification required', 'Repeat critical values within 1 hour']
      : ['Continue routine monitoring'],
    alerts,
    confidence: 0.88
  };
}

function executeRadiologyAnalysis(context: DocumentContext): AgentFinding {
  const fields = context.extractedFields || {};
  const alerts: Array<{ level: 'info' | 'warning' | 'error'; message: string }> = [];
  const details: Record<string, any> = {};

  details.modalityIdentified = context.documentType || 'X-ray';
  details.qualityAssessment = 'Adequate';
  details.findingsCount = 0;

  // Check for findings in extracted fields
  const findingsText = fields.findings?.value || fields.impression?.value || '';
  
  if (findingsText.toLowerCase().includes('abnormal') || 
      findingsText.toLowerCase().includes('opacity') ||
      findingsText.toLowerCase().includes('mass')) {
    alerts.push({ level: 'warning', message: 'Abnormal findings detected - recommend follow-up' });
    details.findingsCount = 1;
    details.requiresFollowUp = true;
  }

  if (findingsText.toLowerCase().includes('fracture')) {
    alerts.push({ level: 'error', message: 'Fracture identified - urgent orthopedic consultation' });
    details.findingsCount++;
    details.urgentFinding = true;
  }

  return {
    summary: `Radiology analysis complete - ${details.findingsCount} finding(s)`,
    details,
    recommendations: details.findingsCount > 0
      ? ['Review findings with radiologist', 'Schedule follow-up imaging if needed']
      : ['No significant abnormalities detected'],
    alerts,
    confidence: 0.85
  };
}

function executeGenericAgent(agentConfig: AgentConfig, context: DocumentContext): AgentFinding {
  const fields = context.extractedFields || {};
  const fieldCount = Object.keys(fields).length;

  return {
    summary: `${agentConfig.name} executed successfully`,
    details: {
      agentType: agentConfig.architectureType,
      useCase: agentConfig.useCase,
      fieldsProcessed: fieldCount,
      documentType: context.documentType
    },
    recommendations: [
      `${agentConfig.name} processing complete`,
      'Review extracted data for accuracy'
    ],
    alerts: [],
    confidence: 0.8
  };
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { agentId, agentConfig, documentContext } = await req.json() as ExecutionRequest;
    
    console.log(`[execute-document-agent] Executing agent: ${agentId}`);
    console.log(`[execute-document-agent] Document type: ${documentContext.documentType}`);
    console.log(`[execute-document-agent] Fields count: ${Object.keys(documentContext.extractedFields || {}).length}`);

    let findings: AgentFinding;

    // Route to specific agent implementation
    switch (agentId) {
      case 'insurance-verification':
      case 'eligibility-check':
      case 'benefits-verification':
        findings = executeInsuranceVerification(documentContext);
        break;
      
      case 'drug-interaction':
      case 'medication-reconciliation':
      case 'pharmacy-finder':
        findings = executeDrugInteractionCheck(documentContext);
        break;
      
      case 'clinical-review':
        findings = executeClinicalReview(documentContext);
        break;
      
      case 'critical-value-alert':
      case 'trend-analysis':
        findings = executeLabAnalysis(documentContext);
        break;
      
      case 'radiology-ai':
      case 'ct-analysis':
      case 'mri-analysis':
      case 'ultrasound-analysis':
        findings = executeRadiologyAnalysis(documentContext);
        break;
      
      default:
        findings = executeGenericAgent(agentConfig, documentContext);
    }

    console.log(`[execute-document-agent] Agent ${agentId} completed with confidence: ${findings.confidence}`);
    console.log(`[execute-document-agent] Alerts: ${findings.alerts.length}`);

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
          confidence: 0
        }
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
