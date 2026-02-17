export type EnrollmentSource = 'mcp' | 'conversational' | 'structured_ai' | 'online_form' | 'ocr' | 'online_pdf_submit';

export type ConsentMethod = 'whatsapp' | 'verbal' | 'email' | 'sms' | 'voice' | 'digital_signature' | 'physical_signature';

export interface PatientEnrollmentSession {
  patient_id: string; // Primary key
  session_id: string;
  enrollment_source: EnrollmentSource;
  consent_method: ConsentMethod;
  current_section: EnrollmentSectionKey;
  enrollment_status: 'draft' | 'in_progress' | 'consent_pending' | 'provider_review' | 'completed' | 'cancelled';
  progress_percentage: number;
  created_at: string;
  updated_at: string;
  metadata: Record<string, any>;
}

export type EnrollmentSectionKey = 
  | 'submission_method'
  | 'consent_management' 
  | 'patient_information'
  | 'provider_treatment_center'
  | 'insurance_information'
  | 'clinical_treatment'
  | 'final_submit';

export interface EnrollmentSectionMapping {
  sectionKey: EnrollmentSectionKey;
  sectionTitle: string;
  description: string;
  destinationTable: string;
  primaryKey: string;
  fields: EnrollmentField[];
  requiredFields: string[];
  validationRules: Record<string, any>;
  realtimeEnabled: boolean;
  triggerActions?: string[]; // Actions to trigger after section completion
}

export interface EnrollmentField {
  fieldKey: string;
  fieldLabel: string;
  fieldType: 'text' | 'email' | 'phone' | 'date' | 'select' | 'checkbox' | 'textarea' | 'signature' | 'file';
  destinationColumn: string;
  required: boolean;
  validation?: any;
  options?: string[]; // For select fields
  placeholder?: string;
}

export const ENROLLMENT_SECTION_MAPPINGS: Record<EnrollmentSectionKey, EnrollmentSectionMapping> = {
  submission_method: {
    sectionKey: 'submission_method',
    sectionTitle: 'Consent Submission Method',
    description: 'Choose your preferred method for providing consent',
    destinationTable: 'patient_enrollments',
    primaryKey: 'patient_id',
    realtimeEnabled: true,
    fields: [
      {
        fieldKey: 'submission_method',
        fieldLabel: 'Submission Method',
        fieldType: 'select',
        destinationColumn: 'enrollment_source',
        required: true,
        options: ['mcp', 'conversational', 'structured_ai', 'online_form', 'ocr', 'online_pdf_submit']
      }
    ],
    requiredFields: ['submission_method'],
    validationRules: {
      submission_method: { required: true }
    }
  },

  consent_management: {
    sectionKey: 'consent_management',
    sectionTitle: 'Consent Management',
    description: 'Capture consent information including provider details and patient consent method',
    destinationTable: 'enrollment_consent',
    primaryKey: 'patient_id',
    realtimeEnabled: true,
    fields: [
      // Provider Information Sub-section
      {
        fieldKey: 'provider_name',
        fieldLabel: 'Provider Name',
        fieldType: 'text',
        destinationColumn: 'provider_name',
        required: true,
        placeholder: 'Enter provider full name'
      },
      {
        fieldKey: 'provider_npi',
        fieldLabel: 'Provider NPI',
        fieldType: 'text',
        destinationColumn: 'provider_npi',
        required: true,
        placeholder: 'Enter 10-digit NPI number'
      },
      {
        fieldKey: 'treatment_center',
        fieldLabel: 'Treatment Center',
        fieldType: 'text',
        destinationColumn: 'treatment_center',
        required: true,
        placeholder: 'Enter treatment center name'
      },
      {
        fieldKey: 'treatment_center_npi',
        fieldLabel: 'Treatment Center NPI',
        fieldType: 'text',
        destinationColumn: 'treatment_center_npi',
        required: false,
        placeholder: 'Enter treatment center NPI if applicable'
      },
      // Patient Consent Method Sub-section
      {
        fieldKey: 'patient_consent_method',
        fieldLabel: 'Patient Consent Method',
        fieldType: 'select',
        destinationColumn: 'collection_method',
        required: true,
        options: ['whatsapp', 'verbal', 'email', 'sms', 'voice', 'digital_signature', 'physical_signature']
      },
      {
        fieldKey: 'provider_signature',
        fieldLabel: 'Provider Authorization Signature',
        fieldType: 'signature',
        destinationColumn: 'provider_signature',
        required: true
      }
    ],
    requiredFields: ['provider_name', 'provider_npi', 'treatment_center', 'patient_consent_method', 'provider_signature'],
    validationRules: {
      provider_npi: { required: true, pattern: '^[0-9]{10}$' },
      provider_name: { required: true, minLength: 2 },
      treatment_center: { required: true, minLength: 2 },
      patient_consent_method: { required: true }
    },
    triggerActions: ['initiate_consent_collection'] // Trigger WhatsApp/SMS/etc. based on method
  },

  patient_information: {
    sectionKey: 'patient_information',
    sectionTitle: 'Patient Information',
    description: 'Collect complete patient demographics and contact information',
    destinationTable: 'enrollment_patient_info',
    primaryKey: 'patient_id',
    realtimeEnabled: true,
    fields: [
      {
        fieldKey: 'first_name',
        fieldLabel: 'First Name',
        fieldType: 'text',
        destinationColumn: 'first_name',
        required: true,
        placeholder: 'Enter first name'
      },
      {
        fieldKey: 'last_name',
        fieldLabel: 'Last Name',
        fieldType: 'text',
        destinationColumn: 'last_name',
        required: true,
        placeholder: 'Enter last name'
      },
      {
        fieldKey: 'middle_name',
        fieldLabel: 'Middle Name',
        fieldType: 'text',
        destinationColumn: 'middle_name',
        required: false,
        placeholder: 'Enter middle name (optional)'
      },
      {
        fieldKey: 'date_of_birth',
        fieldLabel: 'Date of Birth',
        fieldType: 'date',
        destinationColumn: 'date_of_birth',
        required: true
      },
      {
        fieldKey: 'preferred_language',
        fieldLabel: 'Preferred Language',
        fieldType: 'select',
        destinationColumn: 'preferred_language',
        required: true,
        options: ['English', 'Spanish', 'Other']
      },
      {
        fieldKey: 'gender',
        fieldLabel: 'Gender',
        fieldType: 'select',
        destinationColumn: 'gender',
        required: true,
        options: ['Male', 'Female', 'Other']
      },
      {
        fieldKey: 'ssn',
        fieldLabel: 'Social Security Number',
        fieldType: 'text',
        destinationColumn: 'ssn',
        required: false,
        placeholder: 'XXX-XX-XXXX (optional)'
      },
      {
        fieldKey: 'address_line1',
        fieldLabel: 'Street Address',
        fieldType: 'text',
        destinationColumn: 'address_line1',
        required: true,
        placeholder: 'Enter street address'
      },
      {
        fieldKey: 'address_line2',
        fieldLabel: 'Apt/Unit',
        fieldType: 'text',
        destinationColumn: 'address_line2',
        required: false,
        placeholder: 'Apt, Unit, etc.'
      },
      {
        fieldKey: 'city',
        fieldLabel: 'City',
        fieldType: 'text',
        destinationColumn: 'city',
        required: true,
        placeholder: 'Enter city'
      },
      {
        fieldKey: 'state',
        fieldLabel: 'State',
        fieldType: 'text',
        destinationColumn: 'state',
        required: true,
        placeholder: 'Enter state'
      },
      {
        fieldKey: 'zip_code',
        fieldLabel: 'ZIP Code',
        fieldType: 'text',
        destinationColumn: 'zip_code',
        required: true,
        placeholder: 'Enter ZIP code'
      },
      {
        fieldKey: 'phone',
        fieldLabel: 'Primary Phone',
        fieldType: 'phone',
        destinationColumn: 'phone',
        required: true,
        placeholder: '(555) 123-4567'
      },
      {
        fieldKey: 'email',
        fieldLabel: 'Email Address',
        fieldType: 'email',
        destinationColumn: 'email',
        required: true,
        placeholder: 'Enter email address'
      },
      {
        fieldKey: 'emergency_contact_name',
        fieldLabel: 'Emergency Contact Name',
        fieldType: 'text',
        destinationColumn: 'emergency_contact_name',
        required: false,
        placeholder: 'Emergency contact name'
      },
      {
        fieldKey: 'emergency_contact_relationship',
        fieldLabel: 'Relationship',
        fieldType: 'text',
        destinationColumn: 'emergency_contact_relationship',
        required: false,
        placeholder: 'Relationship to patient'
      },
      {
        fieldKey: 'emergency_contact_phone',
        fieldLabel: 'Emergency Contact Phone',
        fieldType: 'phone',
        destinationColumn: 'emergency_contact_phone',
        required: false,
        placeholder: '(555) 123-4567'
      },
      {
        fieldKey: 'marital_status',
        fieldLabel: 'Marital Status',
        fieldType: 'select',
        destinationColumn: 'marital_status',
        required: false,
        options: ['Single', 'Married', 'Divorced', 'Widowed', 'Other']
      },
      {
        fieldKey: 'occupation',
        fieldLabel: 'Occupation',
        fieldType: 'text',
        destinationColumn: 'occupation',
        required: false,
        placeholder: 'Current occupation'
      },
      {
        fieldKey: 'employer',
        fieldLabel: 'Employer',
        fieldType: 'text',
        destinationColumn: 'employer',
        required: false,
        placeholder: 'Current employer'
      }
    ],
    requiredFields: ['first_name', 'last_name', 'date_of_birth', 'preferred_language', 'gender', 'address_line1', 'city', 'state', 'zip_code', 'phone', 'email'],
    validationRules: {
      email: { required: true, format: 'email' },
      phone: { required: true, format: 'phone' },
      zip_code: { required: true, pattern: '^[0-9]{5}(-[0-9]{4})?$' }
    }
  },

  provider_treatment_center: {
    sectionKey: 'provider_treatment_center',
    sectionTitle: 'Provider & Treatment Center',
    description: 'NPI verification and credentialing information',
    destinationTable: 'enrollment_provider_info',
    primaryKey: 'patient_id',
    realtimeEnabled: true,
    fields: [
      {
        fieldKey: 'referring_provider_npi',
        fieldLabel: 'Referring Provider NPI',
        fieldType: 'text',
        destinationColumn: 'referring_provider_npi',
        required: true,
        placeholder: 'Enter referring provider NPI'
      },
      {
        fieldKey: 'facility_npi',
        fieldLabel: 'Treatment Facility NPI',
        fieldType: 'text',
        destinationColumn: 'facility_npi',
        required: false,
        placeholder: 'Enter facility NPI if different'
      }
    ],
    requiredFields: ['referring_provider_npi'],
    validationRules: {
      referring_provider_npi: { required: true, pattern: '^[0-9]{10}$' },
      facility_npi: { pattern: '^[0-9]{10}$' }
    },
    triggerActions: ['verify_npi', 'check_credentials']
  },

  insurance_information: {
    sectionKey: 'insurance_information',
    sectionTitle: 'Insurance Information',
    description: 'Insurance coverage and benefit verification',
    destinationTable: 'enrollment_insurance_info',
    primaryKey: 'patient_id',
    realtimeEnabled: true,
    fields: [
      {
        fieldKey: 'insurance_provider',
        fieldLabel: 'Insurance Provider',
        fieldType: 'text',
        destinationColumn: 'insurance_provider',
        required: true,
        placeholder: 'Enter insurance company name'
      },
      {
        fieldKey: 'member_id',
        fieldLabel: 'Member ID',
        fieldType: 'text',
        destinationColumn: 'member_id',
        required: true,
        placeholder: 'Enter member/policy ID'
      },
      {
        fieldKey: 'group_number',
        fieldLabel: 'Group Number',
        fieldType: 'text',
        destinationColumn: 'group_number',
        required: false,
        placeholder: 'Enter group number'
      },
      {
        fieldKey: 'policy_holder',
        fieldLabel: 'Policy Holder Name',
        fieldType: 'text',
        destinationColumn: 'policy_holder',
        required: true,
        placeholder: 'Name on insurance card'
      }
    ],
    requiredFields: ['insurance_provider', 'member_id', 'policy_holder'],
    validationRules: {
      insurance_provider: { required: true, minLength: 2 },
      member_id: { required: true, minLength: 3 },
      policy_holder: { required: true, minLength: 2 }
    },
    triggerActions: ['verify_insurance_benefits']
  },

  clinical_treatment: {
    sectionKey: 'clinical_treatment',
    sectionTitle: 'Clinical & Treatment Assessment',
    description: 'Clinical information and treatment planning',
    destinationTable: 'enrollment_clinical_info',
    primaryKey: 'patient_id',
    realtimeEnabled: true,
    fields: [
      {
        fieldKey: 'primary_diagnosis',
        fieldLabel: 'Primary Diagnosis',
        fieldType: 'text',
        destinationColumn: 'chief_complaint',
        required: true,
        placeholder: 'Enter primary diagnosis or chief complaint'
      },
      {
        fieldKey: 'treatment_goals',
        fieldLabel: 'Treatment Goals',
        fieldType: 'textarea',
        destinationColumn: 'treatment_goals',
        required: true,
        placeholder: 'Describe expected treatment outcomes'
      }
    ],
    requiredFields: ['primary_diagnosis', 'treatment_goals'],
    validationRules: {
      primary_diagnosis: { required: true, minLength: 5 },
      treatment_goals: { required: true, minLength: 10 }
    }
  },

  final_submit: {
    sectionKey: 'final_submit',
    sectionTitle: 'Final Submission',
    description: 'Review and submit enrollment',
    destinationTable: 'patient_enrollments',
    primaryKey: 'patient_id',
    realtimeEnabled: true,
    fields: [
      {
        fieldKey: 'final_review_complete',
        fieldLabel: 'Final Review Complete',
        fieldType: 'checkbox',
        destinationColumn: 'final_review_complete',
        required: true
      }
    ],
    requiredFields: ['final_review_complete'],
    validationRules: {
      final_review_complete: { required: true }
    },
    triggerActions: ['generate_enrollment_pdf', 'notify_provider', 'update_status_completed']
  }
};

export const getSectionByKey = (key: EnrollmentSectionKey): EnrollmentSectionMapping => {
  return ENROLLMENT_SECTION_MAPPINGS[key];
};

export const getAllSections = (): EnrollmentSectionMapping[] => {
  return Object.values(ENROLLMENT_SECTION_MAPPINGS);
};

export const getFieldsBySection = (sectionKey: EnrollmentSectionKey): EnrollmentField[] => {
  return ENROLLMENT_SECTION_MAPPINGS[sectionKey]?.fields || [];
};

export const getNextSection = (currentSection: EnrollmentSectionKey): EnrollmentSectionKey | null => {
  const sections = Object.keys(ENROLLMENT_SECTION_MAPPINGS) as EnrollmentSectionKey[];
  const currentIndex = sections.indexOf(currentSection);
  return currentIndex < sections.length - 1 ? sections[currentIndex + 1] : null;
};

export const getPreviousSection = (currentSection: EnrollmentSectionKey): EnrollmentSectionKey | null => {
  const sections = Object.keys(ENROLLMENT_SECTION_MAPPINGS) as EnrollmentSectionKey[];
  const currentIndex = sections.indexOf(currentSection);
  return currentIndex > 0 ? sections[currentIndex - 1] : null;
};