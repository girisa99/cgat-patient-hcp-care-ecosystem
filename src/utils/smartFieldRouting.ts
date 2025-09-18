/**
 * Smart Field-to-Table Routing System
 * Universal system that maps form fields to appropriate database tables
 * regardless of which section they appear in across all enrollment agents
 */

export interface SmartFieldMapping {
  fieldKey: string;
  fieldType: 'provider' | 'patient' | 'consent' | 'insurance' | 'clinical' | 'treatment' | 'signature' | 'general';
  destinationTable: string;
  destinationColumn: string;
  required?: boolean;
  validation?: 'npi' | 'uuid' | 'date' | 'email' | 'phone';
}

export interface TableBatch {
  tableName: string;
  data: Record<string, any>;
  operation: 'update' | 'upsert';
}

// Comprehensive field mapping for ALL enrollment sections
export const SMART_FIELD_MAPPINGS: SmartFieldMapping[] = [
  // === CONSENT MANAGEMENT SECTION ===
  { fieldKey: 'consent_treatment', fieldType: 'consent', destinationTable: 'enrollment_consent', destinationColumn: 'consent_to_treatment' },
  { fieldKey: 'consent_privacy', fieldType: 'consent', destinationTable: 'enrollment_consent', destinationColumn: 'hipaa_authorization' },
  { fieldKey: 'consent_communication', fieldType: 'consent', destinationTable: 'enrollment_consent', destinationColumn: 'communication_consent' },
  { fieldKey: 'consent_date', fieldType: 'consent', destinationTable: 'enrollment_consent', destinationColumn: 'consent_date', validation: 'date' },
  { fieldKey: 'collection_method', fieldType: 'consent', destinationTable: 'enrollment_consent', destinationColumn: 'collection_method' },
  { fieldKey: 'patient_signature', fieldType: 'signature', destinationTable: 'enrollment_consent', destinationColumn: 'patient_signature' },
  { fieldKey: 'signature_date', fieldType: 'signature', destinationTable: 'enrollment_consent', destinationColumn: 'signature_date', validation: 'date' },
  
  // NEW: Treatment center/facility selection (UUID)
  { fieldKey: 'treatment_center_id', fieldType: 'provider', destinationTable: 'enrollment_consent', destinationColumn: 'facility_id', validation: 'uuid' },
  { fieldKey: 'treatment_center', fieldType: 'provider', destinationTable: 'enrollment_consent', destinationColumn: 'treatment_center' },
  { fieldKey: 'treatment_center_npi', fieldType: 'provider', destinationTable: 'enrollment_consent', destinationColumn: 'treatment_center_npi', validation: 'npi' },
  
  // Provider fields that appear in consent section (UUID references)
  { fieldKey: 'provider_id', fieldType: 'provider', destinationTable: 'enrollment_consent', destinationColumn: 'provider_id', validation: 'uuid' },
  { fieldKey: 'provider_name', fieldType: 'provider', destinationTable: 'enrollment_consent', destinationColumn: 'provider_name' },
  { fieldKey: 'provider_npi', fieldType: 'provider', destinationTable: 'enrollment_consent', destinationColumn: 'provider_npi', validation: 'npi' },
  { fieldKey: 'provider_signature', fieldType: 'signature', destinationTable: 'enrollment_consent', destinationColumn: 'provider_signature' },

  // === PATIENT INFORMATION SECTION ===
  { fieldKey: 'patient_first_name', fieldType: 'patient', destinationTable: 'patient_enrollments', destinationColumn: 'patient_first_name', required: true },
  { fieldKey: 'patient_last_name', fieldType: 'patient', destinationTable: 'patient_enrollments', destinationColumn: 'patient_last_name', required: true },
  { fieldKey: 'patient_dob', fieldType: 'patient', destinationTable: 'patient_enrollments', destinationColumn: 'patient_dob', validation: 'date' },
  
  // NEW: Add facility and provider UUID references to patient enrollments
  { fieldKey: 'primary_facility_id', fieldType: 'provider', destinationTable: 'patient_enrollments', destinationColumn: 'facility_id', validation: 'uuid' },
  { fieldKey: 'primary_provider_id', fieldType: 'provider', destinationTable: 'patient_enrollments', destinationColumn: 'primary_provider_id', validation: 'uuid' },
  
  { fieldKey: 'patient_ssn', fieldType: 'patient', destinationTable: 'enrollment_patient_info', destinationColumn: 'ssn' },
  { fieldKey: 'patient_phone', fieldType: 'patient', destinationTable: 'enrollment_patient_info', destinationColumn: 'phone_number', validation: 'phone' },
  { fieldKey: 'patient_email', fieldType: 'patient', destinationTable: 'enrollment_patient_info', destinationColumn: 'email', validation: 'email' },
  { fieldKey: 'patient_address', fieldType: 'patient', destinationTable: 'enrollment_patient_info', destinationColumn: 'address' },
  { fieldKey: 'patient_city', fieldType: 'patient', destinationTable: 'enrollment_patient_info', destinationColumn: 'city' },
  { fieldKey: 'patient_state', fieldType: 'patient', destinationTable: 'enrollment_patient_info', destinationColumn: 'state' },
  { fieldKey: 'patient_zip', fieldType: 'patient', destinationTable: 'enrollment_patient_info', destinationColumn: 'zip_code' },
  { fieldKey: 'emergency_contact_name', fieldType: 'patient', destinationTable: 'enrollment_patient_info', destinationColumn: 'emergency_contact_name' },
  { fieldKey: 'emergency_contact_phone', fieldType: 'patient', destinationTable: 'enrollment_patient_info', destinationColumn: 'emergency_contact_phone', validation: 'phone' },
  { fieldKey: 'emergency_contact_relationship', fieldType: 'patient', destinationTable: 'enrollment_patient_info', destinationColumn: 'emergency_contact_relationship' },

  // === PROVIDER AND TREATMENT SECTION ===
  // Enhanced with UUID references
  { fieldKey: 'referring_provider_id', fieldType: 'provider', destinationTable: 'enrollment_provider_info', destinationColumn: 'referring_provider_id', validation: 'uuid' },
  { fieldKey: 'pcp_provider_id', fieldType: 'provider', destinationTable: 'enrollment_provider_info', destinationColumn: 'pcp_provider_id', validation: 'uuid' },
  { fieldKey: 'facility_id', fieldType: 'provider', destinationTable: 'enrollment_provider_info', destinationColumn: 'facility_id', validation: 'uuid' },
  
  // Legacy text fields (for compatibility)
  { fieldKey: 'provider_specialty', fieldType: 'provider', destinationTable: 'enrollment_provider_info', destinationColumn: 'specialty' },
  { fieldKey: 'provider_phone', fieldType: 'provider', destinationTable: 'enrollment_provider_info', destinationColumn: 'phone', validation: 'phone' },
  { fieldKey: 'provider_email', fieldType: 'provider', destinationTable: 'enrollment_provider_info', destinationColumn: 'email', validation: 'email' },
  { fieldKey: 'provider_facility', fieldType: 'provider', destinationTable: 'enrollment_provider_info', destinationColumn: 'treatment_facility' },
  { fieldKey: 'provider_address', fieldType: 'provider', destinationTable: 'enrollment_provider_info', destinationColumn: 'facility_address' },
  
  // Treatment fields that appear in provider section
  { fieldKey: 'treatment_type', fieldType: 'treatment', destinationTable: 'enrollment_treatment_plan', destinationColumn: 'treatment_type' },
  { fieldKey: 'treatment_frequency', fieldType: 'treatment', destinationTable: 'enrollment_treatment_plan', destinationColumn: 'frequency' },
  { fieldKey: 'treatment_duration', fieldType: 'treatment', destinationTable: 'enrollment_treatment_plan', destinationColumn: 'duration' },
  { fieldKey: 'treatment_start_date', fieldType: 'treatment', destinationTable: 'enrollment_treatment_plan', destinationColumn: 'start_date', validation: 'date' },

  // === INSURANCE SECTION ===
  { fieldKey: 'insurance_provider', fieldType: 'insurance', destinationTable: 'enrollment_insurance_info', destinationColumn: 'primary_insurance_provider' },
  { fieldKey: 'insurance_policy_number', fieldType: 'insurance', destinationTable: 'enrollment_insurance_info', destinationColumn: 'policy_number' },
  { fieldKey: 'insurance_group_number', fieldType: 'insurance', destinationTable: 'enrollment_insurance_info', destinationColumn: 'group_number' },
  { fieldKey: 'insurance_subscriber_name', fieldType: 'insurance', destinationTable: 'enrollment_insurance_info', destinationColumn: 'subscriber_name' },
  { fieldKey: 'insurance_subscriber_dob', fieldType: 'insurance', destinationTable: 'enrollment_insurance_info', destinationColumn: 'subscriber_dob', validation: 'date' },
  { fieldKey: 'insurance_relationship', fieldType: 'insurance', destinationTable: 'enrollment_insurance_info', destinationColumn: 'relationship_to_patient' },
  
  // Secondary insurance
  { fieldKey: 'secondary_insurance_provider', fieldType: 'insurance', destinationTable: 'enrollment_insurance_info', destinationColumn: 'secondary_insurance_provider' },
  { fieldKey: 'secondary_policy_number', fieldType: 'insurance', destinationTable: 'enrollment_insurance_info', destinationColumn: 'secondary_policy_number' },
  { fieldKey: 'secondary_group_number', fieldType: 'insurance', destinationTable: 'enrollment_insurance_info', destinationColumn: 'secondary_group_number' },

  // === CLINICAL AND TREATMENT SECTION ===
  { fieldKey: 'primary_diagnosis', fieldType: 'clinical', destinationTable: 'enrollment_clinical_info', destinationColumn: 'primary_diagnosis' },
  { fieldKey: 'secondary_diagnosis', fieldType: 'clinical', destinationTable: 'enrollment_clinical_info', destinationColumn: 'secondary_diagnosis' },
  { fieldKey: 'medical_history', fieldType: 'clinical', destinationTable: 'enrollment_clinical_info', destinationColumn: 'medical_history' },
  { fieldKey: 'current_medications', fieldType: 'clinical', destinationTable: 'enrollment_clinical_info', destinationColumn: 'current_medications' },
  { fieldKey: 'allergies', fieldType: 'clinical', destinationTable: 'enrollment_clinical_info', destinationColumn: 'allergies' },
  { fieldKey: 'physician_name', fieldType: 'clinical', destinationTable: 'enrollment_clinical_info', destinationColumn: 'referring_physician' },
  { fieldKey: 'physician_phone', fieldType: 'clinical', destinationTable: 'enrollment_clinical_info', destinationColumn: 'physician_phone', validation: 'phone' },
  
  // Treatment goals and plan details
  { fieldKey: 'treatment_goals', fieldType: 'treatment', destinationTable: 'enrollment_treatment_plan', destinationColumn: 'goals' },
  { fieldKey: 'treatment_notes', fieldType: 'treatment', destinationTable: 'enrollment_treatment_plan', destinationColumn: 'notes' },
  { fieldKey: 'treatment_authorization', fieldType: 'treatment', destinationTable: 'enrollment_treatment_plan', destinationColumn: 'authorization_code' },

  // === SUBMIT SECTION ===
  { fieldKey: 'final_patient_signature', fieldType: 'signature', destinationTable: 'enrollment_consent', destinationColumn: 'final_signature' },
  { fieldKey: 'final_signature_date', fieldType: 'signature', destinationTable: 'enrollment_consent', destinationColumn: 'final_signature_date', validation: 'date' },
  { fieldKey: 'submission_notes', fieldType: 'general', destinationTable: 'patient_enrollments', destinationColumn: 'submission_notes' },
  { fieldKey: 'enrollment_status', fieldType: 'general', destinationTable: 'patient_enrollments', destinationColumn: 'enrollment_status' },
];

/**
 * Routes form data to appropriate database tables using smart field mapping
 */
export const smartRouteFieldsToTables = (formData: Record<string, any>): TableBatch[] => {
  const tableUpdates = new Map<string, Record<string, any>>();
  
  // Process each field in the form data
  Object.entries(formData).forEach(([fieldKey, value]) => {
    const mapping = SMART_FIELD_MAPPINGS.find(m => m.fieldKey === fieldKey);
    
    if (mapping && value !== undefined && value !== '') {
      // Initialize table data if not exists
      if (!tableUpdates.has(mapping.destinationTable)) {
        tableUpdates.set(mapping.destinationTable, {});
      }
      
      // Validate and transform value based on field type
      let processedValue = processFieldValue(value, mapping);
      
      // Add field to appropriate table
      const tableData = tableUpdates.get(mapping.destinationTable)!;
      tableData[mapping.destinationColumn] = processedValue;
    }
  });
  
  // Convert to batch updates
  const batches: TableBatch[] = [];
  
  tableUpdates.forEach((data, tableName) => {
    // Add timestamps
    data.updated_at = new Date().toISOString();
    
    batches.push({
      tableName,
      data,
      operation: tableName === 'patient_enrollments' ? 'update' : 'upsert'
    });
  });
  
  return batches;
};

/**
 * Processes and validates field values based on their type and validation rules
 */
export const processFieldValue = (value: any, mapping: SmartFieldMapping): any => {
  // Handle null/empty values
  if (value === '' || value === undefined) {
    return null;
  }
  
  // Apply validation rules
  switch (mapping.validation) {
    case 'npi':
      if (typeof value === 'string') {
        const digits = value.replace(/\D/g, '');
        return digits.length === 10 ? digits : null;
      }
      break;
      
    case 'uuid':
      if (typeof value === 'string') {
        const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
        return uuidPattern.test(value) ? value : null;
      }
      break;
      
    case 'date':
      if (typeof value === 'string') {
        try {
          const date = new Date(value);
          return !isNaN(date.getTime()) ? date.toISOString() : null;
        } catch {
          return null;
        }
      }
      break;
      
    case 'email':
      if (typeof value === 'string') {
        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailPattern.test(value) ? value.toLowerCase() : null;
      }
      break;
      
    case 'phone':
      if (typeof value === 'string') {
        const digits = value.replace(/\D/g, '');
        return digits.length >= 10 ? digits : null;
      }
      break;
  }
  
  return value;
};

/**
 * Normalizes collection method values to match database constraints
 */
export const normalizeCollectionMethod = (method: string): string => {
  const methodMap: Record<string, string> = {
    'digital_signature': 'digital',
    'whatsapp': 'phone', 
    'electronic': 'digital',
    'paper': 'paper',
    'verbal': 'phone',
    'phone': 'phone',
    'digital': 'digital'
  };
  
  return methodMap[method?.toLowerCase()] || 'digital';
};

/**
 * Validates required fields for enrollment completion
 */
export const validateEnrollmentData = (allData: Record<string, any>): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];
  
  // Check required fields
  const requiredMappings = SMART_FIELD_MAPPINGS.filter(m => m.required);
  
  requiredMappings.forEach(mapping => {
    if (!allData[mapping.fieldKey]) {
      errors.push(`${mapping.fieldKey} is required`);
    }
  });
  
  return {
    isValid: errors.length === 0,
    errors
  };
};