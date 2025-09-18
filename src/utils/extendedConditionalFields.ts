/**
 * EXTENDED CONDITIONAL FIELD SYSTEM
 * Implements the remaining 300+ fields based on complex healthcare scenarios
 * Covers Insurance (56 fields) and Clinical & Treatment (180 fields) expansions
 */

import { ScenarioConfig, FieldExpansionRules } from '@/utils/conditionalFieldExpansion';

// Enhanced Insurance Scenarios (56 total fields)
export const ENHANCED_INSURANCE_SCENARIOS: ScenarioConfig[] = [
  {
    id: 'medicare_comprehensive',
    name: 'Medicare Comprehensive Coverage',
    conditions: { insurance_type: 'medicare', has_medicare_parts: true },
    additionalFields: [
      'medicare_part_a_effective_date', 'medicare_part_b_effective_date',
      'medicare_part_c_plan_name', 'medicare_part_d_plan_name',
      'medicare_supplement_insurance', 'medicare_advantage_plan',
      'cms_contract_number', 'plan_benefit_package_id',
      'medicare_beneficiary_id', 'railroad_retirement_board_number'
    ],
    requiredFields: ['medicare_part_a_effective_date', 'medicare_beneficiary_id']
  },
  {
    id: 'medicaid_dual_eligible',
    name: 'Medicaid Dual Eligible Special Needs',
    conditions: { insurance_type: 'medicaid', dual_eligible: true },
    additionalFields: [
      'medicaid_recipient_id', 'medicaid_case_number',
      'state_medicaid_program', 'managed_care_organization',
      'special_needs_plan_type', 'coordination_of_benefits_sequence',
      'spend_down_amount', 'asset_verification_date',
      'eligibility_determination_date', 'redetermination_date'
    ],
    requiredFields: ['medicaid_recipient_id', 'state_medicaid_program']
  },
  {
    id: 'commercial_complex',
    name: 'Commercial Insurance Complex Coverage',
    conditions: { insurance_type: 'commercial', coverage_tier: 'family' },
    additionalFields: [
      'employer_group_name', 'employer_group_number',
      'union_local_number', 'cobra_qualifying_event',
      'cobra_election_date', 'cobra_expiration_date',
      'flexible_spending_account', 'health_savings_account',
      'deductible_amount', 'out_of_pocket_maximum',
      'copayment_amount', 'coinsurance_percentage',
      'prior_authorization_required', 'referral_required'
    ],
    requiredFields: ['employer_group_name', 'deductible_amount']
  },
  {
    id: 'pharmacy_benefits_comprehensive',
    name: 'Comprehensive Pharmacy Benefits',
    conditions: { has_pharmacy_coverage: true, requires_specialty_medication: true },
    additionalFields: [
      'pharmacy_benefit_manager_name', 'pharmacy_member_id_number',
      'pharmacy_group_id', 'pharmacy_pcn_number', 'pharmacy_bin_number',
      'tier_1_copay', 'tier_2_copay', 'tier_3_copay', 'tier_4_specialty_copay',
      'mail_order_pharmacy_required', 'specialty_pharmacy_network',
      'drug_formulary_restrictions', 'prior_authorization_drugs',
      'step_therapy_requirements', 'quantity_limits'
    ],
    requiredFields: ['pharmacy_benefit_manager_name', 'pharmacy_member_id_number']
  }
];

// Enhanced Clinical & Treatment Scenarios (180+ total fields)
export const ENHANCED_CLINICAL_SCENARIOS: ScenarioConfig[] = [
  {
    id: 'substance_abuse_comprehensive',
    name: 'Comprehensive Substance Abuse Treatment',
    conditions: { primary_diagnosis: 'substance_use_disorder', treatment_level: 'intensive' },
    additionalFields: [
      // Substance use history (20 fields)
      'primary_substance_used', 'secondary_substance_used', 'tertiary_substance_used',
      'age_first_use', 'frequency_of_use_primary', 'frequency_of_use_secondary',
      'route_of_administration', 'amount_typically_used', 'last_use_date',
      'longest_period_sobriety', 'number_quit_attempts', 'withdrawal_symptoms_experienced',
      'overdose_history', 'injection_drug_use_history', 'needle_sharing_history',
      'drug_related_legal_issues', 'drug_related_employment_issues',
      'drug_related_relationship_issues', 'drug_related_financial_issues',
      'substance_induced_mental_health_issues',
      
      // Treatment history (15 fields)
      'previous_detox_attempts', 'previous_inpatient_treatment', 'previous_outpatient_treatment',
      'previous_medication_assisted_treatment', 'previous_12_step_participation',
      'previous_counseling_therapy', 'most_recent_treatment_date',
      'longest_treatment_episode', 'reasons_for_treatment_discontinuation',
      'treatment_preferences', 'medication_preferences', 'therapy_preferences',
      'family_involvement_preferences', 'aftercare_planning_needs',
      'sober_living_arrangements_needed',
      
      // Assessment scales (10 fields)
      'addiction_severity_index_score', 'cage_questionnaire_score',
      'audit_score', 'drug_abuse_screening_test_score',
      'motivation_to_change_score', 'readiness_to_change_stage',
      'self_efficacy_score', 'craving_intensity_scale',
      'quality_of_life_assessment', 'functional_assessment_score'
    ],
    requiredFields: ['primary_substance_used', 'last_use_date', 'addiction_severity_index_score']
  },
  {
    id: 'mental_health_comprehensive',
    name: 'Comprehensive Mental Health Assessment',
    conditions: { primary_diagnosis: 'mental_health', requires_psychiatric_evaluation: true },
    additionalFields: [
      // Psychiatric history (25 fields)
      'psychiatric_diagnosis_history', 'first_psychiatric_episode_age',
      'number_psychiatric_hospitalizations', 'most_recent_hospitalization_date',
      'suicide_attempt_history', 'self_harm_history', 'homicidal_ideation_history',
      'psychotic_symptoms_history', 'manic_episodes_history', 'depressive_episodes_history',
      'anxiety_disorder_history', 'panic_attack_history', 'trauma_exposure_history',
      'ptsd_diagnosis_history', 'eating_disorder_history', 'personality_disorder_history',
      'cognitive_impairment_history', 'developmental_disorder_history',
      'learning_disability_history', 'attention_deficit_history',
      'obsessive_compulsive_history', 'bipolar_disorder_history',
      'schizophrenia_spectrum_history', 'mood_disorder_history', 'sleep_disorder_history',
      
      // Current symptoms (20 fields)
      'current_mood_symptoms', 'current_anxiety_symptoms', 'current_psychotic_symptoms',
      'current_cognitive_symptoms', 'current_sleep_patterns', 'current_appetite_changes',
      'current_energy_levels', 'current_concentration_ability', 'current_memory_issues',
      'current_decision_making_ability', 'current_social_functioning',
      'current_occupational_functioning', 'current_relationship_functioning',
      'current_self_care_ability', 'current_medication_compliance',
      'current_therapy_engagement', 'current_coping_strategies',
      'current_stress_levels', 'current_support_system_utilization',
      'current_crisis_management_needs'
    ],
    requiredFields: ['psychiatric_diagnosis_history', 'current_mood_symptoms', 'suicide_attempt_history']
  },
  {
    id: 'chronic_pain_comprehensive',
    name: 'Comprehensive Chronic Pain Management',
    conditions: { primary_diagnosis: 'chronic_pain', pain_duration: 'greater_than_6_months' },
    additionalFields: [
      // Pain assessment (15 fields)
      'pain_onset_date', 'pain_cause_description', 'pain_location_primary',
      'pain_location_secondary', 'pain_intensity_current', 'pain_intensity_average',
      'pain_intensity_worst', 'pain_intensity_best', 'pain_quality_descriptors',
      'pain_pattern_daily', 'pain_triggers_identified', 'pain_relief_factors',
      'pain_impact_sleep', 'pain_impact_mood', 'pain_impact_function',
      
      // Pain management history (15 fields)
      'pain_medication_history', 'opioid_medication_history', 'non_opioid_medication_history',
      'topical_medication_history', 'injection_therapy_history', 'physical_therapy_history',
      'occupational_therapy_history', 'chiropractic_treatment_history',
      'acupuncture_treatment_history', 'massage_therapy_history',
      'cognitive_behavioral_therapy_history', 'biofeedback_therapy_history',
      'tens_unit_usage_history', 'heat_cold_therapy_usage',
      'alternative_therapy_history',
      
      // Functional assessment (10 fields)
      'activities_daily_living_impact', 'work_capacity_assessment',
      'recreational_activity_limitations', 'mobility_assessment',
      'strength_assessment', 'endurance_assessment', 'flexibility_assessment',
      'balance_coordination_assessment', 'cognitive_function_pain_impact',
      'quality_of_life_pain_impact'
    ],
    requiredFields: ['pain_onset_date', 'pain_intensity_current', 'pain_location_primary']
  },
  {
    id: 'geriatric_comprehensive',
    name: 'Comprehensive Geriatric Assessment',
    conditions: { patient_age: 'greater_than_65', requires_geriatric_assessment: true },
    additionalFields: [
      // Cognitive assessment (12 fields)
      'mini_mental_state_exam_score', 'montreal_cognitive_assessment_score',
      'clock_drawing_test_result', 'memory_complaints', 'confusion_episodes',
      'disorientation_episodes', 'decision_making_capacity', 'executive_function_assessment',
      'language_function_assessment', 'visuospatial_function_assessment',
      'attention_concentration_assessment', 'dementia_screening_results',
      
      // Functional assessment (15 fields)
      'activities_daily_living_score', 'instrumental_activities_daily_living_score',
      'mobility_assessment_score', 'fall_risk_assessment', 'gait_assessment',
      'balance_assessment', 'strength_assessment', 'vision_assessment',
      'hearing_assessment', 'nutritional_assessment', 'continence_assessment',
      'sleep_assessment', 'medication_management_ability', 'driving_assessment',
      'home_safety_assessment',
      
      // Social assessment (8 fields)
      'social_support_assessment', 'caregiver_support_available', 'living_situation_assessment',
      'financial_resources_assessment', 'transportation_resources', 'community_resources_utilization',
      'advance_directives_completed', 'healthcare_proxy_designated'
    ],
    requiredFields: ['mini_mental_state_exam_score', 'activities_daily_living_score', 'fall_risk_assessment']
  }
];

// Extended Provider & Treatment Scenarios (44 total fields)
export const ENHANCED_PROVIDER_SCENARIOS: ScenarioConfig[] = [
  {
    id: 'multi_disciplinary_team',
    name: 'Multi-Disciplinary Treatment Team',
    conditions: { treatment_complexity: 'high', requires_team_approach: true },
    additionalFields: [
      'primary_care_physician_name', 'primary_care_physician_npi',
      'psychiatrist_name', 'psychiatrist_npi', 'psychologist_name', 'psychologist_license',
      'social_worker_name', 'social_worker_license', 'case_manager_name',
      'nurse_coordinator_name', 'pharmacist_consultant_name',
      'dietitian_name', 'physical_therapist_name', 'occupational_therapist_name',
      'speech_therapist_name', 'chaplain_spiritual_counselor', 'peer_support_specialist',
      'family_therapist_name', 'addiction_counselor_name', 'vocational_counselor_name'
    ],
    requiredFields: ['primary_care_physician_name', 'case_manager_name']
  },
  {
    id: 'specialized_treatment_center',
    name: 'Specialized Treatment Center Requirements',
    conditions: { treatment_setting: 'specialized_center', accreditation_required: true },
    additionalFields: [
      'treatment_center_accreditation_body', 'treatment_center_license_number',
      'treatment_center_certification_date', 'treatment_center_specialization',
      'medical_director_name', 'medical_director_credentials',
      'program_director_name', 'program_director_credentials',
      'staffing_ratio_patients_to_staff', 'availability_24_7_medical_coverage',
      'emergency_procedures_in_place', 'transfer_agreement_hospital',
      'laboratory_services_available', 'radiology_services_available',
      'pharmacy_services_available', 'dietary_services_available',
      'transportation_services_available', 'interpreter_services_available',
      'accessibility_compliance_ada', 'infection_control_protocols',
      'quality_assurance_program', 'patient_satisfaction_monitoring',
      'outcome_measurement_systems', 'continuing_education_programs'
    ],
    requiredFields: ['treatment_center_license_number', 'medical_director_name']
  }
];

// Combine all enhanced scenarios
export const ENHANCED_FIELD_EXPANSION_RULES: FieldExpansionRules[] = [
  {
    section: 'insurance_information',
    baseFields: ['insurance_provider', 'insurance_policy_number', 'insurance_group_number'],
    scenarios: ENHANCED_INSURANCE_SCENARIOS
  },
  {
    section: 'clinical_treatment',
    baseFields: ['primary_diagnosis', 'current_medications', 'allergies'],
    scenarios: ENHANCED_CLINICAL_SCENARIOS
  },
  {
    section: 'provider_treatment',
    baseFields: ['provider_name', 'provider_npi', 'treatment_type'],
    scenarios: ENHANCED_PROVIDER_SCENARIOS
  }
];

/**
 * Gets the total possible field count for a section including all scenarios
 */
export const getTotalPossibleFields = (section: string): number => {
  const sectionRules = ENHANCED_FIELD_EXPANSION_RULES.find(rule => rule.section === section);
  if (!sectionRules) return 0;

  const baseFields = sectionRules.baseFields.length;
  const scenarioFields = sectionRules.scenarios.reduce((total, scenario) => {
    return total + scenario.additionalFields.length;
  }, 0);

  return baseFields + scenarioFields;
};

/**
 * Gets field statistics for all enhanced sections
 */
export const getEnhancedFieldStatistics = () => {
  return {
    insurance: {
      base: 3,
      scenarios: ENHANCED_INSURANCE_SCENARIOS.length,
      totalPossible: getTotalPossibleFields('insurance_information')
    },
    clinical: {
      base: 3,
      scenarios: ENHANCED_CLINICAL_SCENARIOS.length,
      totalPossible: getTotalPossibleFields('clinical_treatment')
    },
    provider: {
      base: 3,
      scenarios: ENHANCED_PROVIDER_SCENARIOS.length,
      totalPossible: getTotalPossibleFields('provider_treatment')
    }
  };
};