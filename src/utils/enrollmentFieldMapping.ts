/**
 * Field-to-Table Mapping System
 * Routes form fields to appropriate database tables based on field types, not sections
 */

export interface FieldTableMapping {
  fieldKey: string;
  fieldType: 'provider' | 'patient' | 'consent' | 'insurance' | 'clinical' | 'treatment' | 'signature' | 'general';
  destinationTable: string;
  destinationColumn: string;
  required?: boolean;
}

export interface TableUpdateBatch {
  tableName: string;
  data: Record<string, any>;
  operation: 'update' | 'upsert';
}

// Comprehensive field mapping that routes fields to correct tables
export const FIELD_TABLE_MAPPINGS: FieldTableMapping[] = [
  // Provider fields - always go to enrollment_provider_info
  { fieldKey: 'provider_name', fieldType: 'provider', destinationTable: 'enrollment_provider_info', destinationColumn: 'provider_name' },
  { fieldKey: 'provider_npi', fieldType: 'provider', destinationTable: 'enrollment_provider_info', destinationColumn: 'npi_number' },
  { fieldKey: 'provider_license', fieldType: 'provider', destinationTable: 'enrollment_provider_info', destinationColumn: 'license_number' },
  { fieldKey: 'provider_specialty', fieldType: 'provider', destinationTable: 'enrollment_provider_info', destinationColumn: 'specialty' },
  { fieldKey: 'provider_phone', fieldType: 'provider', destinationTable: 'enrollment_provider_info', destinationColumn: 'phone' },
  { fieldKey: 'provider_email', fieldType: 'provider', destinationTable: 'enrollment_provider_info', destinationColumn: 'email' },
  
  // Patient fields - go to patient_enrollments or enrollment_patient_info
  { fieldKey: 'patient_first_name', fieldType: 'patient', destinationTable: 'patient_enrollments', destinationColumn: 'patient_first_name' },
  { fieldKey: 'patient_last_name', fieldType: 'patient', destinationTable: 'patient_enrollments', destinationColumn: 'patient_last_name' },
  { fieldKey: 'patient_dob', fieldType: 'patient', destinationTable: 'patient_enrollments', destinationColumn: 'patient_dob' },
  { fieldKey: 'patient_ssn', fieldType: 'patient', destinationTable: 'enrollment_patient_info', destinationColumn: 'ssn' },
  { fieldKey: 'patient_phone', fieldType: 'patient', destinationTable: 'enrollment_patient_info', destinationColumn: 'phone_number' },
  { fieldKey: 'patient_email', fieldType: 'patient', destinationTable: 'enrollment_patient_info', destinationColumn: 'email' },
  { fieldKey: 'patient_address', fieldType: 'patient', destinationTable: 'enrollment_patient_info', destinationColumn: 'address' },
  { fieldKey: 'emergency_contact_name', fieldType: 'patient', destinationTable: 'enrollment_patient_info', destinationColumn: 'emergency_contact_name' },
  { fieldKey: 'emergency_contact_phone', fieldType: 'patient', destinationTable: 'enrollment_patient_info', destinationColumn: 'emergency_contact_phone' },
  
  // Consent fields - go to enrollment_consent
  { fieldKey: 'consent_treatment', fieldType: 'consent', destinationTable: 'enrollment_consent', destinationColumn: 'treatment_consent' },
  { fieldKey: 'consent_privacy', fieldType: 'consent', destinationTable: 'enrollment_consent', destinationColumn: 'privacy_consent' },
  { fieldKey: 'consent_communication', fieldType: 'consent', destinationTable: 'enrollment_consent', destinationColumn: 'communication_consent' },
  { fieldKey: 'consent_date', fieldType: 'consent', destinationTable: 'enrollment_consent', destinationColumn: 'consent_date' },
  { fieldKey: 'collection_method', fieldType: 'consent', destinationTable: 'enrollment_consent', destinationColumn: 'collection_method' },
  
  // Insurance fields - go to enrollment_insurance_info
  { fieldKey: 'insurance_provider', fieldType: 'insurance', destinationTable: 'enrollment_insurance_info', destinationColumn: 'primary_insurance_provider' },
  { fieldKey: 'insurance_policy_number', fieldType: 'insurance', destinationTable: 'enrollment_insurance_info', destinationColumn: 'policy_number' },
  { fieldKey: 'insurance_group_number', fieldType: 'insurance', destinationTable: 'enrollment_insurance_info', destinationColumn: 'group_number' },
  { fieldKey: 'insurance_subscriber_name', fieldType: 'insurance', destinationTable: 'enrollment_insurance_info', destinationColumn: 'subscriber_name' },
  
  // Clinical fields - go to enrollment_clinical_info
  { fieldKey: 'primary_diagnosis', fieldType: 'clinical', destinationTable: 'enrollment_clinical_info', destinationColumn: 'primary_diagnosis' },
  { fieldKey: 'medical_history', fieldType: 'clinical', destinationTable: 'enrollment_clinical_info', destinationColumn: 'medical_history' },
  { fieldKey: 'current_medications', fieldType: 'clinical', destinationTable: 'enrollment_clinical_info', destinationColumn: 'current_medications' },
  { fieldKey: 'allergies', fieldType: 'clinical', destinationTable: 'enrollment_clinical_info', destinationColumn: 'allergies' },
  
  // Treatment fields - go to enrollment_treatment_plan
  { fieldKey: 'treatment_type', fieldType: 'treatment', destinationTable: 'enrollment_treatment_plan', destinationColumn: 'treatment_type' },
  { fieldKey: 'treatment_frequency', fieldType: 'treatment', destinationTable: 'enrollment_treatment_plan', destinationColumn: 'frequency' },
  { fieldKey: 'treatment_duration', fieldType: 'treatment', destinationTable: 'enrollment_treatment_plan', destinationColumn: 'duration' },
  { fieldKey: 'treatment_goals', fieldType: 'treatment', destinationTable: 'enrollment_treatment_plan', destinationColumn: 'goals' },
  
  // Signature fields - can go to multiple tables depending on context
  { fieldKey: 'patient_signature', fieldType: 'signature', destinationTable: 'enrollment_consent', destinationColumn: 'patient_signature' },
  { fieldKey: 'provider_signature', fieldType: 'signature', destinationTable: 'enrollment_provider_info', destinationColumn: 'provider_signature' },
  { fieldKey: 'signature_date', fieldType: 'signature', destinationTable: 'enrollment_consent', destinationColumn: 'signature_date' },
];

/**
 * Routes form data to appropriate database tables based on field types
 */
export const routeFieldsToTables = (formData: Record<string, any>): TableUpdateBatch[] => {
  const tableUpdates = new Map<string, Record<string, any>>();
  
  // Process each field in the form data
  Object.entries(formData).forEach(([fieldKey, value]) => {
    const mapping = FIELD_TABLE_MAPPINGS.find(m => m.fieldKey === fieldKey);
    
    if (mapping && value !== undefined) {
      // Initialize table data if not exists
      if (!tableUpdates.has(mapping.destinationTable)) {
        tableUpdates.set(mapping.destinationTable, {});
      }
      
      // Add field to appropriate table
      const tableData = tableUpdates.get(mapping.destinationTable)!;
      tableData[mapping.destinationColumn] = value;
    }
  });
  
  // Convert to batch updates
  const batches: TableUpdateBatch[] = [];
  
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
 * Validates required fields for a specific table
 */
export const validateTableData = (tableName: string, data: Record<string, any>): string[] => {
  const errors: string[] = [];
  const requiredFields = FIELD_TABLE_MAPPINGS
    .filter(m => m.destinationTable === tableName && m.required)
    .map(m => m.destinationColumn);
  
  requiredFields.forEach(field => {
    if (!data[field]) {
      errors.push(`Missing required field: ${field}`);
    }
  });
  
  return errors;
};