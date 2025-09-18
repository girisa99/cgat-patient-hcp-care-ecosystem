/**
 * CONDITIONAL FIELD EXPANSION SYSTEM
 * Implements scenario-based field display logic to match online form behavior
 * Expands field sets based on treatment type, insurance complexity, and clinical needs
 */

export interface ScenarioConfig {
  id: string;
  name: string;
  conditions: Record<string, any>;
  additionalFields: string[];
  requiredFields: string[];
}

export interface FieldExpansionRules {
  section: string;
  baseFields: string[];
  scenarios: ScenarioConfig[];
}

// Define conditional field expansion rules for each section
export const FIELD_EXPANSION_RULES: FieldExpansionRules[] = [
  {
    section: 'consent_management',
    baseFields: ['consent_treatment', 'consent_privacy', 'provider_name', 'patient_signature'],
    scenarios: [
      {
        id: 'telehealth_consent',
        name: 'Telehealth Treatment',
        conditions: { treatment_type: 'telehealth', collection_method: 'digital' },
        additionalFields: ['telehealth_consent', 'technology_consent', 'recording_consent'],
        requiredFields: ['telehealth_consent']
      },
      {
        id: 'research_consent',
        name: 'Research Participation',
        conditions: { provider_specialty: 'research', consent_research: true },
        additionalFields: ['research_consent', 'data_sharing_consent', 'study_withdrawal_rights'],
        requiredFields: ['research_consent']
      }
    ]
  },
  
  {
    section: 'provider_treatment',
    baseFields: ['provider_name', 'provider_npi', 'treatment_type'],
    scenarios: [
      {
        id: 'multi_provider',
        name: 'Multiple Providers',
        conditions: { provider_count: 'multiple', treatment_type: ['inpatient', 'complex_care'] },
        additionalFields: [
          'secondary_provider_name', 'secondary_provider_npi', 'secondary_provider_specialty',
          'care_coordinator_name', 'primary_care_physician', 'specialist_referrals'
        ],
        requiredFields: ['secondary_provider_name', 'care_coordinator_name']
      },
      {
        id: 'treatment_center_details',
        name: 'Treatment Center Requirements',
        conditions: { treatment_type: ['inpatient', 'residential', 'intensive_outpatient'] },
        additionalFields: [
          'treatment_center_name', 'treatment_center_npi', 'treatment_center_address',
          'treatment_center_phone', 'treatment_center_license', 'admission_date',
          'estimated_length_of_stay', 'level_of_care'
        ],
        requiredFields: ['treatment_center_name', 'level_of_care']
      },
      {
        id: 'specialty_care',
        name: 'Specialized Treatment',
        conditions: { provider_specialty: ['cardiology', 'oncology', 'psychiatry', 'addiction'] },
        additionalFields: [
          'specialty_certification', 'board_certifications', 'subspecialty_focus',
          'treatment_protocols', 'medication_management', 'therapy_modalities'
        ],
        requiredFields: ['specialty_certification']
      }
    ]
  },

  {
    section: 'insurance_information',
    baseFields: ['insurance_provider', 'insurance_policy_number', 'insurance_group_number'],
    scenarios: [
      {
        id: 'dual_insurance',
        name: 'Dual Insurance Coverage',
        conditions: { insurance_count: 'dual' },
        additionalFields: [
          'secondary_insurance_provider', 'secondary_policy_number', 'secondary_group_number',
          'secondary_subscriber_name', 'secondary_subscriber_dob', 'coordination_of_benefits'
        ],
        requiredFields: ['secondary_insurance_provider', 'coordination_of_benefits']
      },
      {
        id: 'government_insurance',
        name: 'Government Insurance',
        conditions: { insurance_type: ['medicare', 'medicaid', 'va_benefits'] },
        additionalFields: [
          'medicare_part_a', 'medicare_part_b', 'medicare_part_d', 'medicaid_id',
          'social_security_number', 'veterans_affairs_id', 'disability_status'
        ],
        requiredFields: ['medicare_part_a', 'medicaid_id']
      },
      {
        id: 'complex_pharmacy',
        name: 'Pharmacy Benefits',
        conditions: { requires_medication: true, insurance_type: 'commercial' },
        additionalFields: [
          'pharmacy_benefits_manager', 'pharmacy_member_id', 'pharmacy_group_number',
          'pharmacy_pcn', 'pharmacy_bin', 'preferred_pharmacy', 'mail_order_pharmacy'
        ],
        requiredFields: ['pharmacy_benefits_manager']
      }
    ]
  },

  {
    section: 'clinical_treatment',
    baseFields: ['primary_diagnosis', 'current_medications', 'allergies'],
    scenarios: [
      {
        id: 'complex_medical_history',
        name: 'Complex Medical History',
        conditions: { medical_complexity: 'high', chronic_conditions: true },
        additionalFields: [
          'secondary_diagnosis', 'tertiary_diagnosis', 'chronic_conditions_list',
          'previous_hospitalizations', 'surgical_history', 'family_medical_history',
          'genetic_conditions', 'medication_allergies', 'environmental_allergies'
        ],
        requiredFields: ['chronic_conditions_list']
      },
      {
        id: 'mental_health',
        name: 'Mental Health Treatment',
        conditions: { primary_diagnosis: 'mental_health', treatment_type: 'psychiatric' },
        additionalFields: [
          'psychiatric_history', 'previous_mental_health_treatment', 'current_therapist',
          'psychiatric_medications', 'suicide_risk_assessment', 'support_system',
          'crisis_contact_information', 'advance_psychiatric_directive'
        ],
        requiredFields: ['psychiatric_history', 'crisis_contact_information']
      },
      {
        id: 'substance_abuse',
        name: 'Substance Abuse Treatment',
        conditions: { treatment_type: ['detox', 'rehabilitation', 'addiction'] },
        additionalFields: [
          'substance_use_history', 'substances_used', 'frequency_of_use',
          'date_last_used', 'previous_treatment_attempts', 'withdrawal_symptoms',
          'recovery_support_contacts', 'twelve_step_participation', 'legal_issues'
        ],
        requiredFields: ['substance_use_history', 'date_last_used']
      },
      {
        id: 'chronic_pain',
        name: 'Chronic Pain Management',
        conditions: { primary_diagnosis: 'chronic_pain', requires_pain_management: true },
        additionalFields: [
          'pain_scale_rating', 'pain_location', 'pain_triggers', 'pain_relief_methods',
          'current_pain_medications', 'pain_management_history', 'functional_limitations',
          'pain_specialist_referral', 'alternative_therapies'
        ],
        requiredFields: ['pain_scale_rating', 'current_pain_medications']
      }
    ]
  }
];

/**
 * Determines which additional fields should be displayed based on current form data
 */
export const getExpandedFields = (
  section: string, 
  formData: Record<string, any>
): { fields: string[]; requiredFields: string[] } => {
  const sectionRules = FIELD_EXPANSION_RULES.find(rule => rule.section === section);
  
  if (!sectionRules) {
    return { fields: [], requiredFields: [] };
  }

  let additionalFields: string[] = [];
  let additionalRequired: string[] = [];

  // Check each scenario to see if conditions are met
  sectionRules.scenarios.forEach(scenario => {
    const conditionsMet = checkScenarioConditions(scenario.conditions, formData);
    
    if (conditionsMet) {
      additionalFields.push(...scenario.additionalFields);
      additionalRequired.push(...scenario.requiredFields);
    }
  });

  // Remove duplicates
  const uniqueFields = [...new Set([...sectionRules.baseFields, ...additionalFields])];
  const uniqueRequired = [...new Set(additionalRequired)];

  return {
    fields: uniqueFields,
    requiredFields: uniqueRequired
  };
};

/**
 * Checks if scenario conditions are met based on form data
 */
export const checkScenarioConditions = (
  conditions: Record<string, any>, 
  formData: Record<string, any>
): boolean => {
  return Object.entries(conditions).every(([key, expectedValue]) => {
    const formValue = formData[key];
    
    if (Array.isArray(expectedValue)) {
      return expectedValue.includes(formValue);
    }
    
    if (typeof expectedValue === 'boolean') {
      return !!formValue === expectedValue;
    }
    
    return formValue === expectedValue;
  });
};

/**
 * Gets all possible fields for a section (base + all scenario fields)
 */
export const getAllPossibleFields = (section: string): string[] => {
  const sectionRules = FIELD_EXPANSION_RULES.find(rule => rule.section === section);
  
  if (!sectionRules) {
    return [];
  }

  const allFields = [...sectionRules.baseFields];
  
  sectionRules.scenarios.forEach(scenario => {
    allFields.push(...scenario.additionalFields);
  });

  return [...new Set(allFields)];
};

/**
 * Calculates field completion percentage for a section
 */
export const calculateSectionCompletion = (
  section: string,
  formData: Record<string, any>
): { 
  completed: number; 
  total: number; 
  percentage: number;
  requiredCompleted: number;
  requiredTotal: number;
} => {
  const { fields: activeFields, requiredFields } = getExpandedFields(section, formData);
  
  const completed = activeFields.filter(field => 
    formData[field] && formData[field].toString().trim() !== ''
  ).length;
  
  const requiredCompleted = requiredFields.filter(field =>
    formData[field] && formData[field].toString().trim() !== ''
  ).length;

  return {
    completed,
    total: activeFields.length,
    percentage: activeFields.length > 0 ? Math.round((completed / activeFields.length) * 100) : 0,
    requiredCompleted,
    requiredTotal: requiredFields.length
  };
};