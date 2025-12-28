/**
 * DATA ROUTING TYPES
 * Defines routing rules for pushing extracted enrollment data to different systems
 * Patient data → Salesforce, Provider data → Veeva, etc.
 */

// ============= TARGET SYSTEMS =============

export type TargetSystemType = 
  | 'salesforce'
  | 'veeva'
  | 'hubspot'
  | 'supabase'
  | 'csv'
  | 'json'
  | 'api'
  | 'mcp';

export interface TargetSystem {
  id: string;
  name: string;
  type: TargetSystemType;
  icon: string;
  description: string;
  isEnabled: boolean;
  credentials?: {
    apiKey?: string;
    instanceUrl?: string;
    accessToken?: string;
  };
  endpoint?: string;
}

// ============= ROUTING RULES =============

/**
 * Defines which fields/sections go to which target system
 */
export interface RoutingRule {
  id: string;
  name: string;
  description: string;
  // Source conditions
  sourceSections: string[]; // e.g., ['patient_information', 'caregiver_representative']
  sourceFieldPatterns?: string[]; // e.g., ['patient_*', 'insurance_*']
  // Target
  targetSystem: TargetSystemType;
  targetObject?: string; // e.g., 'Contact' for Salesforce, 'HCP' for Veeva
  // Field mappings
  fieldMappings: FieldMapping[];
  // Options
  priority: number;
  isActive: boolean;
  requiresVerification: boolean;
}

export interface FieldMapping {
  sourceFieldKey: string; // From extracted data
  targetFieldKey: string; // In target system
  transform?: FieldTransform;
  required: boolean;
  defaultValue?: string;
}

export type FieldTransform = 
  | 'none'
  | 'uppercase'
  | 'lowercase'
  | 'trim'
  | 'date_iso'
  | 'date_us'
  | 'phone_e164'
  | 'phone_us'
  | 'ssn_mask'
  | 'currency_cents'
  | 'boolean_yn';

// ============= DEFAULT ROUTING RULES =============

/**
 * Routing rules:
 * 1. ALL data → Supabase (always, local storage)
 * 2. ALL data → Salesforce (default, entire form)
 * 3. Provider data → Veeva (OPTIONAL, only if user enables)
 */
export const DEFAULT_ROUTING_RULES: RoutingRule[] = [
  // ALWAYS: Save everything to local Supabase
  {
    id: 'all_to_supabase',
    name: 'All Data → Local Supabase',
    description: 'Always save complete extraction to local database (required)',
    sourceSections: [],
    sourceFieldPatterns: ['*'],
    targetSystem: 'supabase',
    targetObject: 'enrollment_form_extractions',
    fieldMappings: [],
    priority: 0,
    isActive: true,
    requiresVerification: false
  },
  // DEFAULT: Entire form to Salesforce
  {
    id: 'all_to_salesforce',
    name: 'Entire Form → Salesforce',
    description: 'Push all extracted data to Salesforce (default)',
    sourceSections: [], // Empty = ALL sections
    sourceFieldPatterns: ['*'], // All fields
    targetSystem: 'salesforce',
    targetObject: 'Enrollment__c',
    fieldMappings: [
      // Patient fields
      { sourceFieldKey: 'patient_first_name', targetFieldKey: 'Patient_First_Name__c', transform: 'none', required: true },
      { sourceFieldKey: 'patient_last_name', targetFieldKey: 'Patient_Last_Name__c', transform: 'none', required: true },
      { sourceFieldKey: 'patient_email', targetFieldKey: 'Patient_Email__c', transform: 'lowercase', required: false },
      { sourceFieldKey: 'patient_phone_primary', targetFieldKey: 'Patient_Phone__c', transform: 'phone_e164', required: false },
      { sourceFieldKey: 'patient_dob', targetFieldKey: 'Patient_DOB__c', transform: 'date_iso', required: true },
      { sourceFieldKey: 'patient_address_street', targetFieldKey: 'Patient_Street__c', transform: 'none', required: false },
      { sourceFieldKey: 'patient_address_city', targetFieldKey: 'Patient_City__c', transform: 'none', required: false },
      { sourceFieldKey: 'patient_address_state', targetFieldKey: 'Patient_State__c', transform: 'uppercase', required: false },
      { sourceFieldKey: 'patient_address_zip', targetFieldKey: 'Patient_Zip__c', transform: 'none', required: false },
      // Insurance fields
      { sourceFieldKey: 'insurance_primary_name', targetFieldKey: 'Insurance_Name__c', transform: 'none', required: false },
      { sourceFieldKey: 'insurance_primary_id', targetFieldKey: 'Insurance_Member_ID__c', transform: 'none', required: false },
      { sourceFieldKey: 'insurance_primary_group', targetFieldKey: 'Insurance_Group__c', transform: 'none', required: false },
      // Prescriber fields (also go to Salesforce)
      { sourceFieldKey: 'prescriber_first_name', targetFieldKey: 'Prescriber_First_Name__c', transform: 'none', required: false },
      { sourceFieldKey: 'prescriber_last_name', targetFieldKey: 'Prescriber_Last_Name__c', transform: 'none', required: false },
      { sourceFieldKey: 'prescriber_npi', targetFieldKey: 'Prescriber_NPI__c', transform: 'none', required: false },
      { sourceFieldKey: 'prescriber_phone', targetFieldKey: 'Prescriber_Phone__c', transform: 'phone_e164', required: false },
      { sourceFieldKey: 'prescriber_fax', targetFieldKey: 'Prescriber_Fax__c', transform: 'phone_e164', required: false },
      { sourceFieldKey: 'facility_name', targetFieldKey: 'Facility_Name__c', transform: 'none', required: false },
      // Medication fields
      { sourceFieldKey: 'medication_name', targetFieldKey: 'Medication_Name__c', transform: 'none', required: false },
      { sourceFieldKey: 'medication_strength', targetFieldKey: 'Medication_Strength__c', transform: 'none', required: false },
      { sourceFieldKey: 'diagnosis_icd10', targetFieldKey: 'ICD10_Code__c', transform: 'uppercase', required: false },
    ],
    priority: 1,
    isActive: true, // DEFAULT ON
    requiresVerification: true
  },
  // OPTIONAL: Provider data to Veeva (only if user enables)
  {
    id: 'provider_to_veeva',
    name: 'Provider Data → Veeva',
    description: 'Optionally push prescriber/provider information to Veeva CRM',
    sourceSections: ['prescriber_provider', 'pharmacy_information'],
    sourceFieldPatterns: ['prescriber_*', 'provider_*', 'facility_*', 'pharmacy_*'],
    targetSystem: 'veeva',
    targetObject: 'Account_vod__c',
    fieldMappings: [
      { sourceFieldKey: 'prescriber_first_name', targetFieldKey: 'First_Name_vod__c', transform: 'none', required: true },
      { sourceFieldKey: 'prescriber_last_name', targetFieldKey: 'Last_Name_vod__c', transform: 'none', required: true },
      { sourceFieldKey: 'prescriber_npi', targetFieldKey: 'NPI_vod__c', transform: 'none', required: true },
      { sourceFieldKey: 'prescriber_dea', targetFieldKey: 'DEA_vod__c', transform: 'none', required: false },
      { sourceFieldKey: 'prescriber_phone', targetFieldKey: 'Phone_vod__c', transform: 'phone_e164', required: false },
      { sourceFieldKey: 'prescriber_fax', targetFieldKey: 'Fax_vod__c', transform: 'phone_e164', required: false },
      { sourceFieldKey: 'facility_name', targetFieldKey: 'Organization_Name_vod__c', transform: 'none', required: false },
      { sourceFieldKey: 'pharmacy_name', targetFieldKey: 'Pharmacy_Name_vod__c', transform: 'none', required: false },
      { sourceFieldKey: 'pharmacy_npi', targetFieldKey: 'Pharmacy_NPI_vod__c', transform: 'none', required: false },
    ],
    priority: 2,
    isActive: false, // OPTIONAL - user must enable
    requiresVerification: true
  }
];

// ============= ROUTING CONFIG =============

export interface DataRoutingConfig {
  rules: RoutingRule[];
  enabledSystems: TargetSystemType[];
  defaultExportFormat: 'json' | 'csv';
  batchExport: boolean;
}

// ============= ROUTING RESULT =============

export interface RoutingResult {
  ruleId: string;
  ruleName: string;
  targetSystem: TargetSystemType;
  targetObject?: string;
  fieldsRouted: number;
  success: boolean;
  error?: string;
  externalId?: string;
  timestamp: string;
}

export interface DataRoutingExecution {
  extractionId: string;
  executedAt: string;
  results: RoutingResult[];
  totalFieldsProcessed: number;
  successCount: number;
  errorCount: number;
}

// ============= AI MODEL CONFIG =============

export type AIModelProvider = 'gemini' | 'claude' | 'openai';

export interface AIModelConfig {
  provider: AIModelProvider;
  modelId: string;
  displayName: string;
  description: string;
  strengths: string[];
  costTier: 'low' | 'medium' | 'high';
  speedTier: 'fast' | 'medium' | 'slow';
  supportsVision: boolean;
  supportsHandwriting: boolean;
}

export const AVAILABLE_AI_MODELS: Record<string, AIModelConfig> = {
  'gemini-flash': {
    provider: 'gemini',
    modelId: 'google/gemini-2.5-flash',
    displayName: 'Gemini 2.5 Flash',
    description: 'Fast classification and section detection',
    strengths: ['Speed', 'Vision', 'Cost-effective'],
    costTier: 'low',
    speedTier: 'fast',
    supportsVision: true,
    supportsHandwriting: true
  },
  'gemini-pro': {
    provider: 'gemini',
    modelId: 'google/gemini-2.5-pro',
    displayName: 'Gemini 2.5 Pro',
    description: 'Accurate deep extraction with excellent OCR',
    strengths: ['Accuracy', 'Handwriting OCR', 'Tables'],
    costTier: 'medium',
    speedTier: 'medium',
    supportsVision: true,
    supportsHandwriting: true
  },
  'gpt-5': {
    provider: 'openai',
    modelId: 'openai/gpt-5',
    displayName: 'GPT-5',
    description: 'High accuracy general purpose model',
    strengths: ['Reasoning', 'Accuracy', 'Context'],
    costTier: 'high',
    speedTier: 'slow',
    supportsVision: true,
    supportsHandwriting: true
  },
  'gpt-5-mini': {
    provider: 'openai',
    modelId: 'openai/gpt-5-mini',
    displayName: 'GPT-5 Mini',
    description: 'Balanced speed and accuracy',
    strengths: ['Balance', 'Cost', 'Speed'],
    costTier: 'medium',
    speedTier: 'medium',
    supportsVision: true,
    supportsHandwriting: true
  }
};

// ============= MULTI-MODEL PIPELINE =============

export interface MultiModelPipelineConfig {
  stage1Model: string; // Model key from AVAILABLE_AI_MODELS
  stage2Model: string;
  enableComparison: boolean;
  comparisonModels?: string[]; // Additional models to compare
  consensusThreshold: number; // 0-1, require this agreement for high confidence
}

export const DEFAULT_PIPELINE_CONFIG: MultiModelPipelineConfig = {
  stage1Model: 'gemini-flash',
  stage2Model: 'gemini-pro',
  enableComparison: false,
  consensusThreshold: 0.8
};
