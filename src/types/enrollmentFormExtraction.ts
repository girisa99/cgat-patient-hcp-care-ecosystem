/**
 * DYNAMIC ENROLLMENT FORM EXTRACTION TYPES
 * Supports any patient assistance/enrollment form with automatic section detection
 */

// ============= SECTION DEFINITIONS =============

/**
 * Standard section types found across pharmaceutical enrollment forms
 * The system auto-detects which sections are present in each form
 */
export type EnrollmentSectionType =
  | 'patient_information'
  | 'prescriber_provider'
  | 'insurance_coverage'
  | 'income_financial'
  | 'medication_requested'
  | 'caregiver_representative'
  | 'consent_authorization'
  | 'hipaa_authorization'
  | 'shipping_delivery'
  | 'program_selection'
  | 'clinical_diagnosis'
  | 'attestation_signature'
  | 'employer_information'
  | 'pharmacy_information'
  | 'additional_documents'
  | 'unknown';

/**
 * Section metadata describing detected form sections
 */
export interface DetectedSection {
  sectionType: EnrollmentSectionType;
  sectionTitle: string; // Original title from form
  pageNumbers: number[];
  boundingBox?: { x: number; y: number; width: number; height: number };
  confidence: number;
  fieldCount: number;
}

// ============= FIELD DEFINITIONS =============

/**
 * Field types for form fields
 */
export type FieldType = 
  | 'text'
  | 'date'
  | 'phone'
  | 'email'
  | 'ssn'
  | 'currency'
  | 'number'
  | 'checkbox'
  | 'radio'
  | 'signature'
  | 'address'
  | 'dropdown'
  | 'multiline'
  | 'unknown';

/**
 * Extracted field with all metadata
 */
export interface ExtractedField {
  fieldId: string;
  fieldLabel: string;
  fieldValue: string | boolean | number | null;
  fieldType: FieldType;
  sectionType: EnrollmentSectionType;
  required: boolean;
  confidence: number;
  pageNumber: number;
  boundingBox?: { x: number; y: number; width: number; height: number };
  // Verification
  verified: boolean;
  verifiedBy?: string;
  verifiedAt?: string;
  originalValue?: string; // For tracking edits
  // Validation
  isValid: boolean;
  validationErrors?: string[];
  // Mapping
  standardFieldKey?: string; // Maps to standard field (e.g., 'patient_first_name')
}

// ============= FORM IDENTIFICATION =============

/**
 * Manufacturer/Program identification
 */
export interface FormIdentification {
  manufacturerName: string;
  programName: string;
  formTitle: string;
  formVersion?: string;
  formDate?: string;
  formLanguage: string;
  faxNumber?: string;
  phoneNumber?: string;
  websiteUrl?: string;
  logoDetected: boolean;
  totalPages: number;
}

// ============= EXTRACTION RESULT =============

/**
 * Complete extraction result for an enrollment form
 */
export interface EnrollmentFormExtractionResult {
  // Identification
  extractionId: string;
  extractedAt: string;
  processingTimeMs: number;
  
  // Form Info
  formIdentification: FormIdentification;
  
  // Sections
  detectedSections: DetectedSection[];
  
  // All Fields Organized by Section
  fieldsBySection: Record<EnrollmentSectionType, ExtractedField[]>;
  
  // Flat list of all fields
  allFields: ExtractedField[];
  
  // Validation Summary
  validationSummary: {
    totalFields: number;
    requiredFields: number;
    filledFields: number;
    emptyRequiredFields: string[];
    validationErrors: Array<{ fieldId: string; error: string }>;
    completionPercentage: number;
  };
  
  // Confidence
  overallConfidence: number;
  
  // For external push
  externalSystemMapping?: ExternalSystemMapping;
}

// ============= STANDARD FIELD MAPPING =============

/**
 * Standard field keys for mapping across different forms
 */
export const STANDARD_FIELD_KEYS = {
  // Patient
  patient_first_name: 'Patient First Name',
  patient_last_name: 'Patient Last Name',
  patient_middle_name: 'Patient Middle Name',
  patient_dob: 'Date of Birth',
  patient_ssn: 'Social Security Number',
  patient_gender: 'Gender',
  patient_address_street: 'Street Address',
  patient_address_city: 'City',
  patient_address_state: 'State',
  patient_address_zip: 'ZIP Code',
  patient_phone_primary: 'Primary Phone',
  patient_phone_mobile: 'Mobile Phone',
  patient_email: 'Email',
  patient_preferred_language: 'Preferred Language',
  
  // Insurance
  insurance_primary_name: 'Primary Insurance Name',
  insurance_primary_id: 'Primary Member ID',
  insurance_primary_group: 'Primary Group Number',
  insurance_primary_bin: 'Primary BIN',
  insurance_primary_pcn: 'Primary PCN',
  insurance_secondary_name: 'Secondary Insurance Name',
  insurance_secondary_id: 'Secondary Member ID',
  medicare_part_d: 'Medicare Part D',
  medicaid: 'Medicaid',
  
  // Prescriber
  prescriber_first_name: 'Prescriber First Name',
  prescriber_last_name: 'Prescriber Last Name',
  prescriber_npi: 'Prescriber NPI',
  prescriber_dea: 'DEA Number',
  prescriber_phone: 'Prescriber Phone',
  prescriber_fax: 'Prescriber Fax',
  prescriber_address: 'Prescriber Address',
  facility_name: 'Facility/Practice Name',
  facility_tax_id: 'Facility Tax ID',
  
  // Income
  household_income: 'Annual Household Income',
  household_size: 'Household Size',
  income_verified: 'Income Verified',
  
  // Medication
  medication_name: 'Medication Name',
  medication_strength: 'Medication Strength',
  medication_quantity: 'Quantity',
  medication_refills: 'Refills',
  diagnosis_icd10: 'ICD-10 Diagnosis',
  
  // Consent
  hipaa_consent: 'HIPAA Authorization',
  program_consent: 'Program Consent',
  signature_patient: 'Patient Signature',
  signature_prescriber: 'Prescriber Signature',
  signature_date: 'Signature Date',
  
  // Caregiver
  caregiver_name: 'Caregiver Name',
  caregiver_relationship: 'Relationship to Patient',
  caregiver_phone: 'Caregiver Phone',
} as const;

export type StandardFieldKey = keyof typeof STANDARD_FIELD_KEYS;

// ============= EXTERNAL SYSTEM MAPPING =============

/**
 * Mapping configuration for external system push
 */
export interface ExternalSystemMapping {
  systemName: string;
  systemType: 'ehr' | 'crm' | 'hub' | 'pharmacy' | 'custom';
  fieldMappings: Array<{
    extractedFieldId: string;
    externalFieldKey: string;
    transform?: 'uppercase' | 'lowercase' | 'date_format' | 'phone_format' | 'none';
  }>;
  requiresValidation: boolean;
  apiEndpoint?: string;
}

// ============= VERIFICATION STATE =============

/**
 * Section verification status
 */
export interface SectionVerificationStatus {
  sectionType: EnrollmentSectionType;
  totalFields: number;
  verifiedFields: number;
  isComplete: boolean;
  lastVerifiedAt?: string;
  lastVerifiedBy?: string;
}

/**
 * Complete verification state for a form
 */
export interface FormVerificationState {
  extractionId: string;
  sections: SectionVerificationStatus[];
  allSectionsVerified: boolean;
  readyForSubmission: boolean;
  submittedAt?: string;
  submittedTo?: string;
}

// ============= EXTRACTION REQUEST =============

/**
 * Request to extract an enrollment form
 */
export interface EnrollmentFormExtractionRequest {
  fileUrl?: string;
  fileBase64?: string;
  fileName: string;
  fileType: 'pdf' | 'image';
  // Optional hints
  expectedManufacturer?: string;
  expectedProgram?: string;
  // Processing options
  extractSignatures?: boolean;
  performValidation?: boolean;
  mapToStandardFields?: boolean;
}

// ============= SECTION CONFIGS =============

/**
 * Configuration for each section type with expected fields
 */
export const SECTION_CONFIGS: Record<EnrollmentSectionType, {
  displayName: string;
  icon: string;
  color: string;
  expectedFields: string[];
  requiredFields: string[];
}> = {
  patient_information: {
    displayName: 'Patient Information',
    icon: '👤',
    color: 'bg-blue-500',
    expectedFields: ['first_name', 'last_name', 'dob', 'ssn', 'address', 'phone', 'email', 'gender', 'language'],
    requiredFields: ['first_name', 'last_name', 'dob']
  },
  prescriber_provider: {
    displayName: 'Prescriber / Provider',
    icon: '🩺',
    color: 'bg-green-500',
    expectedFields: ['provider_name', 'npi', 'dea', 'phone', 'fax', 'address', 'facility_name', 'specialty'],
    requiredFields: ['provider_name', 'npi']
  },
  insurance_coverage: {
    displayName: 'Insurance / Coverage',
    icon: '🏥',
    color: 'bg-purple-500',
    expectedFields: ['insurance_name', 'member_id', 'group', 'bin', 'pcn', 'phone', 'policyholder', 'relationship'],
    requiredFields: ['insurance_name', 'member_id']
  },
  income_financial: {
    displayName: 'Income / Financial',
    icon: '💰',
    color: 'bg-amber-500',
    expectedFields: ['annual_income', 'household_size', 'income_source', 'tax_filing_status', 'assets'],
    requiredFields: ['annual_income', 'household_size']
  },
  medication_requested: {
    displayName: 'Medication Requested',
    icon: '💊',
    color: 'bg-red-500',
    expectedFields: ['medication_name', 'strength', 'quantity', 'days_supply', 'refills', 'diagnosis', 'icd10'],
    requiredFields: ['medication_name']
  },
  caregiver_representative: {
    displayName: 'Caregiver / Representative',
    icon: '🤝',
    color: 'bg-teal-500',
    expectedFields: ['caregiver_name', 'relationship', 'phone', 'address', 'email', 'authorized'],
    requiredFields: []
  },
  consent_authorization: {
    displayName: 'Consent & Authorization',
    icon: '✍️',
    color: 'bg-indigo-500',
    expectedFields: ['patient_signature', 'date', 'consent_type', 'witness_signature'],
    requiredFields: ['patient_signature', 'date']
  },
  hipaa_authorization: {
    displayName: 'HIPAA Authorization',
    icon: '🔒',
    color: 'bg-slate-500',
    expectedFields: ['hipaa_consent', 'signature', 'date', 'expiration', 'revocation_terms'],
    requiredFields: ['hipaa_consent', 'signature']
  },
  shipping_delivery: {
    displayName: 'Shipping / Delivery',
    icon: '📦',
    color: 'bg-orange-500',
    expectedFields: ['ship_to_address', 'ship_to_name', 'delivery_preference', 'special_instructions'],
    requiredFields: []
  },
  program_selection: {
    displayName: 'Program Selection',
    icon: '📋',
    color: 'bg-cyan-500',
    expectedFields: ['program_type', 'copay_assistance', 'patient_assistance', 'bridge_program'],
    requiredFields: ['program_type']
  },
  clinical_diagnosis: {
    displayName: 'Clinical / Diagnosis',
    icon: '📊',
    color: 'bg-rose-500',
    expectedFields: ['diagnosis', 'icd10_codes', 'prior_treatments', 'lab_values', 'contraindications'],
    requiredFields: ['diagnosis']
  },
  attestation_signature: {
    displayName: 'Attestation & Signature',
    icon: '📝',
    color: 'bg-emerald-500',
    expectedFields: ['attestation_text', 'prescriber_signature', 'date', 'license_number'],
    requiredFields: ['prescriber_signature', 'date']
  },
  employer_information: {
    displayName: 'Employer Information',
    icon: '🏢',
    color: 'bg-gray-500',
    expectedFields: ['employer_name', 'employer_address', 'employer_phone', 'employment_status'],
    requiredFields: []
  },
  pharmacy_information: {
    displayName: 'Pharmacy Information',
    icon: '💊',
    color: 'bg-pink-500',
    expectedFields: ['pharmacy_name', 'pharmacy_npi', 'pharmacy_phone', 'pharmacy_address', 'specialty_pharmacy'],
    requiredFields: []
  },
  additional_documents: {
    displayName: 'Additional Documents',
    icon: '📄',
    color: 'bg-yellow-500',
    expectedFields: ['document_type', 'document_date', 'notes'],
    requiredFields: []
  },
  unknown: {
    displayName: 'Other Information',
    icon: '❓',
    color: 'bg-neutral-500',
    expectedFields: [],
    requiredFields: []
  }
};
