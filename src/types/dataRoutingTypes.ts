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

export const DEFAULT_ROUTING_RULES: RoutingRule[] = [
  {
    id: 'patient_to_salesforce',
    name: 'Patient Data → Salesforce',
    description: 'Route patient information, insurance, and income data to Salesforce',
    sourceSections: ['patient_information', 'insurance_coverage', 'income_financial', 'caregiver_representative'],
    sourceFieldPatterns: ['patient_*', 'insurance_*', 'caregiver_*'],
    targetSystem: 'salesforce',
    targetObject: 'Contact',
    fieldMappings: [
      { sourceFieldKey: 'patient_first_name', targetFieldKey: 'FirstName', transform: 'none', required: true },
      { sourceFieldKey: 'patient_last_name', targetFieldKey: 'LastName', transform: 'none', required: true },
      { sourceFieldKey: 'patient_email', targetFieldKey: 'Email', transform: 'lowercase', required: false },
      { sourceFieldKey: 'patient_phone_primary', targetFieldKey: 'Phone', transform: 'phone_e164', required: false },
      { sourceFieldKey: 'patient_dob', targetFieldKey: 'Birthdate', transform: 'date_iso', required: true },
      { sourceFieldKey: 'patient_address_street', targetFieldKey: 'MailingStreet', transform: 'none', required: false },
      { sourceFieldKey: 'patient_address_city', targetFieldKey: 'MailingCity', transform: 'none', required: false },
      { sourceFieldKey: 'patient_address_state', targetFieldKey: 'MailingState', transform: 'uppercase', required: false },
      { sourceFieldKey: 'patient_address_zip', targetFieldKey: 'MailingPostalCode', transform: 'none', required: false },
    ],
    priority: 1,
    isActive: true,
    requiresVerification: true
  },
  {
    id: 'provider_to_veeva',
    name: 'Provider Data → Veeva',
    description: 'Route prescriber/provider information to Veeva CRM',
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
    ],
    priority: 2,
    isActive: true,
    requiresVerification: true
  },
  {
    id: 'medication_to_salesforce',
    name: 'Medication Data → Salesforce',
    description: 'Route medication and clinical data to Salesforce as Case/Enrollment',
    sourceSections: ['medication_requested', 'clinical_diagnosis', 'program_selection'],
    sourceFieldPatterns: ['medication_*', 'diagnosis_*'],
    targetSystem: 'salesforce',
    targetObject: 'Case',
    fieldMappings: [
      { sourceFieldKey: 'medication_name', targetFieldKey: 'Product_Name__c', transform: 'none', required: true },
      { sourceFieldKey: 'medication_strength', targetFieldKey: 'Strength__c', transform: 'none', required: false },
      { sourceFieldKey: 'diagnosis_icd10', targetFieldKey: 'ICD10_Code__c', transform: 'uppercase', required: false },
    ],
    priority: 3,
    isActive: true,
    requiresVerification: true
  },
  {
    id: 'all_to_supabase',
    name: 'All Data → Local Supabase',
    description: 'Save complete extraction to local Supabase database',
    sourceSections: [],
    sourceFieldPatterns: ['*'],
    targetSystem: 'supabase',
    targetObject: 'enrollment_form_extractions',
    fieldMappings: [],
    priority: 0,
    isActive: true,
    requiresVerification: false
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
