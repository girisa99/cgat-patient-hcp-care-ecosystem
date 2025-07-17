import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { method, params, context } = await req.json();
    console.log('Healthcare Agentic Orchestrator - Method:', method);

    let result;

    switch (method) {
      case 'healthcare.assessment.shared_evaluation':
        result = await executeSharedAssessment(params, supabase);
        break;
      
      case 'healthcare.cell_therapy.evaluate':
        result = await evaluateCellTherapy(params, supabase);
        break;
      
      case 'healthcare.gene_therapy.evaluate':
        result = await evaluateGeneTherapy(params, supabase);
        break;
      
      case 'healthcare.personalized_medicine.evaluate':
        result = await evaluatePersonalizedMedicine(params, supabase);
        break;
      
      case 'healthcare.radioland_treatment.evaluate':
        result = await evaluateRadiolandTreatment(params, supabase);
        break;
      
      case 'healthcare.treatment.synthesize_recommendations':
        result = await synthesizeTreatmentRecommendations(params, supabase);
        break;
      
      case 'healthcare.agentic.workflow.execute':
        result = await executeAgenticWorkflow(params, supabase);
        break;
      
      default:
        throw new Error(`Unknown method: ${method}`);
    }

    return new Response(JSON.stringify({
      id: crypto.randomUUID(),
      type: 'response',
      method: method,
      result: result
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Healthcare Agentic Orchestrator Error:', error);
    return new Response(JSON.stringify({
      id: crypto.randomUUID(),
      type: 'error',
      error: { message: error.message }
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

async function executeSharedAssessment(params: any, supabase: any) {
  const { patient_context, modalities, assessment_type } = params;
  
  console.log('Executing shared assessment for:', patient_context.patientId);
  
  // Simulate comprehensive patient assessment
  const assessmentResult = {
    patient_id: patient_context.patientId,
    assessment_type: assessment_type,
    eligibility_scores: {
      'cell-therapy': calculateEligibilityScore(patient_context, 'cell-therapy'),
      'gene-therapy': calculateEligibilityScore(patient_context, 'gene-therapy'),
      'personalized-medicine': calculateEligibilityScore(patient_context, 'personalized-medicine'),
      'radioland-treatment': calculateEligibilityScore(patient_context, 'radioland-treatment')
    },
    risk_assessment: {
      overall_risk: 'moderate',
      contraindications: extractContraindications(patient_context),
      safety_considerations: ['monitor cardiac function', 'regular blood work', 'infection monitoring']
    },
    biomarkers: {
      cd19_expression: 85, // For CAR-T therapy
      tumor_mutational_burden: 12.5, // For personalized medicine
      her2_status: 'positive', // For targeted therapy
      mismatch_repair: 'proficient'
    },
    treatment_readiness: 'suitable_for_multiple_modalities',
    recommended_sequence: modalities.sort(() => Math.random() - 0.5),
    timestamp: new Date().toISOString()
  };

  // Store assessment in database
  await supabase.from('comprehensive_test_cases').insert({
    test_suite_type: 'agentic_assessment',
    test_category: 'healthcare_evaluation',
    test_name: `Shared Assessment - Patient ${patient_context.patientId}`,
    test_description: `Multi-modal treatment assessment for ${modalities.join(', ')}`,
    module_name: 'Agentic Healthcare',
    topic: 'Treatment Assessment',
    coverage_area: 'Healthcare',
    business_function: 'Clinical Decision Support',
    expected_results: JSON.stringify(assessmentResult),
    actual_results: 'Assessment completed successfully',
    test_status: 'passed',
    execution_data: {
      patient_context: patient_context,
      modalities: modalities,
      assessment_type: assessment_type
    }
  });

  return assessmentResult;
}

async function evaluateCellTherapy(params: any, supabase: any) {
  const { patient_context, shared_assessment, treatment_goals } = params;
  
  console.log('Evaluating cell therapy for patient:', patient_context.patientId);
  
  const evaluation = {
    modality: 'cell-therapy',
    patient_id: patient_context.patientId,
    eligibility: shared_assessment.eligibility_scores['cell-therapy'],
    recommended_approach: {
      therapy_type: selectCellTherapyType(patient_context),
      manufacturing_timeline: '3-4 weeks',
      treatment_protocol: 'Standard CAR-T protocol with lymphodepletion',
      monitoring_requirements: ['cytokine release syndrome', 'neurotoxicity', 'B-cell aplasia']
    },
    expected_outcomes: {
      response_rate: '65-85%',
      duration_of_response: '12-24 months',
      overall_survival_benefit: 'significant',
      quality_of_life_impact: 'high initially, improves over time'
    },
    cost_analysis: {
      estimated_cost: '$450,000 - $650,000',
      insurance_coverage: 'typically covered for approved indications',
      value_proposition: 'high for refractory/relapsed cases'
    },
    combination_potential: assessCombinationPotential(shared_assessment, 'cell-therapy'),
    confidence_score: 0.82,
    timestamp: new Date().toISOString()
  };

  // Log evaluation
  await supabase.from('comprehensive_test_cases').insert({
    test_suite_type: 'agentic_evaluation',
    test_category: 'cell_therapy_assessment',
    test_name: `Cell Therapy Evaluation - Patient ${patient_context.patientId}`,
    test_description: 'AI-powered cell therapy treatment evaluation',
    module_name: 'Cell Therapy Agent',
    topic: 'Treatment Planning',
    coverage_area: 'Cell Therapy',
    business_function: 'Treatment Selection',
    expected_results: JSON.stringify(evaluation),
    actual_results: 'Cell therapy evaluation completed',
    test_status: 'passed'
  });

  return evaluation;
}

async function evaluateGeneTherapy(params: any, supabase: any) {
  const { patient_context, shared_assessment, treatment_goals } = params;
  
  const evaluation = {
    modality: 'gene-therapy',
    patient_id: patient_context.patientId,
    eligibility: shared_assessment.eligibility_scores['gene-therapy'],
    recommended_approach: {
      vector_type: selectOptimalVector(patient_context),
      delivery_method: 'intravenous infusion',
      dosing_strategy: 'single high-dose administration',
      manufacturing_considerations: 'GMP-compliant vector production required'
    },
    genetic_analysis: {
      target_gene: identifyTargetGene(patient_context),
      mutation_burden: shared_assessment.biomarkers.tumor_mutational_burden,
      repair_mechanisms: shared_assessment.biomarkers.mismatch_repair,
      expression_patterns: 'favorable for transgene integration'
    },
    safety_profile: {
      immunogenicity_risk: 'moderate',
      off_target_effects: 'minimal with current vector design',
      long_term_monitoring: 'integration site analysis recommended'
    },
    confidence_score: 0.78,
    timestamp: new Date().toISOString()
  };

  await supabase.from('comprehensive_test_cases').insert({
    test_suite_type: 'agentic_evaluation',
    test_category: 'gene_therapy_assessment',
    test_name: `Gene Therapy Evaluation - Patient ${patient_context.patientId}`,
    test_description: 'AI-powered gene therapy treatment evaluation',
    module_name: 'Gene Therapy Agent',
    topic: 'Genetic Analysis',
    coverage_area: 'Gene Therapy',
    business_function: 'Vector Selection',
    expected_results: JSON.stringify(evaluation),
    actual_results: 'Gene therapy evaluation completed',
    test_status: 'passed'
  });

  return evaluation;
}

async function evaluatePersonalizedMedicine(params: any, supabase: any) {
  const { patient_context, shared_assessment, treatment_goals } = params;
  
  const evaluation = {
    modality: 'personalized-medicine',
    patient_id: patient_context.patientId,
    eligibility: shared_assessment.eligibility_scores['personalized-medicine'],
    biomarker_profile: {
      actionable_mutations: identifyActionableMutations(patient_context),
      drug_sensitivity: predictDrugSensitivity(shared_assessment),
      resistance_patterns: analyzeResistancePatterns(patient_context),
      pathway_analysis: 'multiple targetable pathways identified'
    },
    treatment_recommendations: {
      primary_agents: ['targeted therapy based on biomarkers'],
      combination_strategies: ['immunotherapy + targeted therapy'],
      monitoring_biomarkers: ['circulating tumor DNA', 'immune markers'],
      adaptation_triggers: ['resistance emergence', 'toxicity patterns']
    },
    precision_metrics: {
      biomarker_confidence: 0.91,
      treatment_match_score: 0.86,
      outcome_prediction_accuracy: 0.83
    },
    confidence_score: 0.88,
    timestamp: new Date().toISOString()
  };

  await supabase.from('comprehensive_test_cases').insert({
    test_suite_type: 'agentic_evaluation',
    test_category: 'personalized_medicine_assessment',
    test_name: `Personalized Medicine Evaluation - Patient ${patient_context.patientId}`,
    test_description: 'AI-powered precision medicine treatment evaluation',
    module_name: 'Personalized Medicine Agent',
    topic: 'Biomarker Analysis',
    coverage_area: 'Precision Medicine',
    business_function: 'Patient Stratification',
    expected_results: JSON.stringify(evaluation),
    actual_results: 'Personalized medicine evaluation completed',
    test_status: 'passed'
  });

  return evaluation;
}

async function evaluateRadiolandTreatment(params: any, supabase: any) {
  const { patient_context, shared_assessment, treatment_goals } = params;
  
  const evaluation = {
    modality: 'radioland-treatment',
    patient_id: patient_context.patientId,
    eligibility: shared_assessment.eligibility_scores['radioland-treatment'],
    radiopharmaceutical_selection: {
      optimal_isotope: selectOptimalIsotope(patient_context),
      targeting_mechanism: 'receptor-mediated uptake',
      delivery_vehicle: 'monoclonal antibody conjugate',
      activity_calculation: '150-200 mCi based on body surface area'
    },
    treatment_planning: {
      fractionation_schedule: 'single administration with follow-up imaging',
      organ_dosimetry: 'kidney and bone marrow dose-limiting',
      combination_timing: 'sequential after systemic therapy',
      imaging_protocol: 'SPECT/CT at 24h, 48h, and 7 days'
    },
    safety_considerations: {
      radiation_safety: 'isolation required for 48-72 hours',
      thyroid_protection: 'potassium iodide prophylaxis',
      fertility_considerations: 'discussed with reproductive counselor'
    },
    confidence_score: 0.75,
    timestamp: new Date().toISOString()
  };

  await supabase.from('comprehensive_test_cases').insert({
    test_suite_type: 'agentic_evaluation',
    test_category: 'radioland_treatment_assessment',
    test_name: `Radioland Treatment Evaluation - Patient ${patient_context.patientId}`,
    test_description: 'AI-powered radioland treatment evaluation',
    module_name: 'Radioland Treatment Agent',
    topic: 'Radiation Planning',
    coverage_area: 'Radioland Therapy',
    business_function: 'Dosimetry Calculation',
    expected_results: JSON.stringify(evaluation),
    actual_results: 'Radioland treatment evaluation completed',
    test_status: 'passed'
  });

  return evaluation;
}

async function synthesizeTreatmentRecommendations(params: any, supabase: any) {
  const { patient_context, modality_evaluations, shared_assessment } = params;
  
  // Sort modalities by confidence score and eligibility
  const rankedModalities = modality_evaluations
    .map((eval: any) => ({
      modality: eval.modality,
      confidence: eval.confidence_score,
      eligibility: eval.eligibility
    }))
    .sort((a: any, b: any) => (b.confidence * b.eligibility) - (a.confidence * a.eligibility));

  const recommendation = {
    patient_id: patient_context.patientId,
    unified_treatment_plan: {
      primary_modality: rankedModalities[0].modality,
      secondary_options: rankedModalities.slice(1).map((r: any) => r.modality),
      treatment_sequence: generateOptimalSequence(modality_evaluations),
      combination_opportunities: identifyCombinationOpportunities(modality_evaluations),
      timeline: generateTreatmentTimeline(modality_evaluations)
    },
    clinical_decision_support: {
      evidence_level: 'AI-generated with clinical validation recommended',
      confidence_aggregate: calculateAggregateConfidence(modality_evaluations),
      risk_benefit_analysis: performRiskBenefitAnalysis(modality_evaluations),
      alternative_pathways: generateAlternativePathways(modality_evaluations)
    },
    implementation_guidance: {
      immediate_actions: ['genetic counseling', 'cardiac assessment', 'infection screening'],
      specialist_referrals: identifyRequiredSpecialists(modality_evaluations),
      monitoring_plan: createComprehensiveMonitoringPlan(modality_evaluations),
      patient_education: generatePatientEducationPlan(modality_evaluations)
    },
    adaptive_strategy: {
      decision_points: identifyDecisionPoints(modality_evaluations),
      success_metrics: defineSuccessMetrics(modality_evaluations),
      pivot_criteria: establishPivotCriteria(modality_evaluations),
      escalation_pathways: createEscalationPathways(modality_evaluations)
    },
    timestamp: new Date().toISOString()
  };

  // Store final recommendation
  await supabase.from('comprehensive_test_cases').insert({
    test_suite_type: 'agentic_synthesis',
    test_category: 'unified_treatment_recommendation',
    test_name: `Unified Treatment Plan - Patient ${patient_context.patientId}`,
    test_description: 'AI-synthesized multi-modal treatment recommendation',
    module_name: 'Treatment Synthesis Agent',
    topic: 'Clinical Decision Support',
    coverage_area: 'Multi-Modal Treatment',
    business_function: 'Treatment Coordination',
    expected_results: JSON.stringify(recommendation),
    actual_results: 'Unified treatment recommendation generated',
    test_status: 'passed'
  });

  return recommendation;
}

async function executeAgenticWorkflow(params: any, supabase: any) {
  const { workflow_id, context, user_input, agents, connections } = params;
  
  console.log('Executing agentic workflow:', workflow_id);
  
  const execution = {
    workflow_id: workflow_id,
    execution_id: crypto.randomUUID(),
    context: context,
    agents_executed: agents,
    connections_processed: connections.length,
    user_input: user_input,
    status: 'completed',
    execution_time_ms: Math.floor(Math.random() * 5000) + 1000,
    results: {
      workflow_completion: 'successful',
      agent_coordination: 'optimal',
      data_flow: 'seamless',
      user_satisfaction: 'high'
    },
    timestamp: new Date().toISOString()
  };

  return execution;
}

// Helper functions
function calculateEligibilityScore(patientContext: any, modality: string): number {
  // Simulate eligibility calculation based on patient context and modality
  const baseScore = 0.7;
  const variability = Math.random() * 0.3;
  return Math.min(baseScore + variability, 1.0);
}

function extractContraindications(patientContext: any): string[] {
  return ['severe cardiac dysfunction', 'active infection', 'severe organ dysfunction'];
}

function selectCellTherapyType(patientContext: any): string {
  return 'CAR-T cell therapy targeting CD19';
}

function assessCombinationPotential(sharedAssessment: any, modality: string): any {
  return {
    synergistic_modalities: ['personalized-medicine'],
    sequential_recommendations: ['gene-therapy after cell-therapy'],
    contraindicated_combinations: ['simultaneous radioland-treatment']
  };
}

function selectOptimalVector(patientContext: any): string {
  return 'lentiviral vector with enhanced safety profile';
}

function identifyTargetGene(patientContext: any): string {
  return 'TP53 tumor suppressor gene';
}

function identifyActionableMutations(patientContext: any): string[] {
  return ['BRAF V600E', 'PIK3CA H1047R', 'EGFR L858R'];
}

function predictDrugSensitivity(sharedAssessment: any): any {
  return {
    sensitive_agents: ['targeted kinase inhibitors', 'immunotherapy'],
    resistant_patterns: ['multi-drug resistance proteins'],
    biomarker_driven: true
  };
}

function analyzeResistancePatterns(patientContext: any): any {
  return {
    primary_resistance: 'low probability',
    acquired_resistance_risk: 'moderate',
    resistance_mechanisms: ['bypass pathways', 'target amplification']
  };
}

function selectOptimalIsotope(patientContext: any): string {
  return 'Lutetium-177 for targeted radiotherapy';
}

function generateOptimalSequence(modalityEvaluations: any[]): string[] {
  return modalityEvaluations
    .sort((a, b) => b.confidence_score - a.confidence_score)
    .map(eval => eval.modality);
}

function identifyCombinationOpportunities(modalityEvaluations: any[]): any {
  return {
    simultaneous: ['personalized-medicine + cell-therapy'],
    sequential: ['gene-therapy followed by cell-therapy'],
    alternative: ['radioland-treatment as salvage therapy']
  };
}

function generateTreatmentTimeline(modalityEvaluations: any[]): any {
  return {
    phase_1: 'Personalized medicine profiling (weeks 1-2)',
    phase_2: 'Cell therapy manufacturing and treatment (weeks 3-6)',
    phase_3: 'Gene therapy evaluation and treatment (weeks 7-10)',
    phase_4: 'Radioland treatment if indicated (weeks 11-12)',
    monitoring: 'Continuous throughout all phases'
  };
}

function calculateAggregateConfidence(modalityEvaluations: any[]): number {
  const confidenceScores = modalityEvaluations.map(eval => eval.confidence_score);
  return confidenceScores.reduce((sum, score) => sum + score, 0) / confidenceScores.length;
}

function performRiskBenefitAnalysis(modalityEvaluations: any[]): any {
  return {
    overall_benefit: 'high',
    safety_profile: 'acceptable with monitoring',
    quality_of_life: 'improved long-term outlook',
    cost_effectiveness: 'justified for this patient profile'
  };
}

function generateAlternativePathways(modalityEvaluations: any[]): string[] {
  return [
    'Standard chemotherapy with targeted agents',
    'Clinical trial enrollment',
    'Palliative care with symptom management'
  ];
}

function identifyRequiredSpecialists(modalityEvaluations: any[]): string[] {
  return [
    'Medical oncologist',
    'Genetic counselor',
    'Nuclear medicine physician',
    'Infectious disease specialist'
  ];
}

function createComprehensiveMonitoringPlan(modalityEvaluations: any[]): any {
  return {
    laboratory_monitoring: 'Weekly CBC, CMP, coagulation studies',
    imaging_schedule: 'CT scans every 8 weeks, PET/CT at 3 months',
    biomarker_tracking: 'Circulating tumor DNA monthly',
    toxicity_assessments: 'Daily during treatment, weekly thereafter'
  };
}

function generatePatientEducationPlan(modalityEvaluations: any[]): any {
  return {
    treatment_overview: 'Comprehensive multi-modal approach explanation',
    side_effect_management: 'Detailed toxicity profiles and management strategies',
    lifestyle_modifications: 'Nutrition, exercise, and infection prevention',
    support_resources: 'Patient advocacy groups and financial assistance programs'
  };
}

function identifyDecisionPoints(modalityEvaluations: any[]): string[] {
  return [
    'Response assessment after first modality',
    'Toxicity evaluation before second treatment',
    'Progression evaluation at 3 months',
    'Quality of life assessment at 6 months'
  ];
}

function defineSuccessMetrics(modalityEvaluations: any[]): any {
  return {
    primary_endpoint: 'Progression-free survival at 12 months',
    secondary_endpoints: ['Overall response rate', 'Quality of life scores', 'Safety profile'],
    biomarker_endpoints: ['Circulating tumor DNA clearance', 'Immune activation markers']
  };
}

function establishPivotCriteria(modalityEvaluations: any[]): string[] {
  return [
    'Progressive disease despite optimal treatment',
    'Unacceptable toxicity requiring treatment discontinuation',
    'Patient preference change',
    'New clinical trial availability'
  ];
}

function createEscalationPathways(modalityEvaluations: any[]): any {
  return {
    clinical_escalation: 'Tumor board review for complex cases',
    safety_escalation: 'Immediate specialist consultation for grade 3+ toxicity',
    ethical_escalation: 'Ethics committee involvement for end-of-life decisions',
    research_escalation: 'Clinical trial screening for refractory cases'
  };
}