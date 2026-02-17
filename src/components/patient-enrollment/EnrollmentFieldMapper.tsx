import { supabase } from '@/integrations/supabase/client';

/**
 * Complete field mapping system for all enrollment tables
 * Maps form fields to database columns with validation and type conversion
 */

export interface TableFieldMapping {
  tableName: string;
  fields: Record<string, {
    column: string;
    type: 'text' | 'boolean' | 'jsonb' | 'timestamp' | 'uuid' | 'integer';
    required: boolean;
    defaultValue?: any;
    validation?: (value: any) => boolean;
  }>;
}

export const enrollmentTableMappings: Record<string, TableFieldMapping> = {
  // Patient Demographics - Core patient information
  enrollment_patient_info: {
    tableName: 'enrollment_patient_info',
    fields: {
      firstName: { column: 'first_name', type: 'text', required: true },
      lastName: { column: 'last_name', type: 'text', required: true },
      middleName: { column: 'middle_name', type: 'text', required: false },
      dateOfBirth: { column: 'date_of_birth', type: 'timestamp', required: true },
      ssn: { column: 'ssn', type: 'text', required: false },
      gender: { column: 'gender', type: 'text', required: true },
      preferredLanguage: { column: 'preferred_language', type: 'text', required: false, defaultValue: 'english' },
      homePhone: { column: 'phone', type: 'text', required: true },
      cellPhone: { column: 'cell_phone', type: 'text', required: false },
      email: { column: 'email', type: 'text', required: true },
      address: { column: 'address_line1', type: 'text', required: true },
      apartment: { column: 'address_line2', type: 'text', required: false },
      city: { column: 'city', type: 'text', required: true },
      state: { column: 'state', type: 'text', required: true },
      zipCode: { column: 'zip_code', type: 'text', required: true },
      alternateContactName: { column: 'emergency_contact_name', type: 'text', required: false },
      alternateContactPhone: { column: 'emergency_contact_phone', type: 'text', required: false },
      alternateContactRelationship: { column: 'emergency_contact_relationship', type: 'text', required: false },
      doNotContactPatient: { column: 'do_not_contact', type: 'boolean', required: false, defaultValue: false }
    }
  },

  // Clinical Information - Medical history and clinical data
  enrollment_clinical_info: {
    tableName: 'enrollment_clinical_info',
    fields: {
      chiefComplaint: { column: 'chief_complaint', type: 'text', required: true },
      currentMedications: { column: 'current_medications', type: 'jsonb', required: true },
      medicalHistory: { column: 'medical_history', type: 'jsonb', required: true },
      surgicalHistory: { column: 'surgical_history', type: 'jsonb', required: false },
      familyHistory: { column: 'family_history', type: 'jsonb', required: false },
      socialHistory: { column: 'social_history', type: 'jsonb', required: false },
      allergies: { column: 'allergies', type: 'jsonb', required: true },
      vitalSigns: { column: 'vital_signs', type: 'jsonb', required: false },
      labResults: { column: 'lab_results', type: 'jsonb', required: false },
      imagingResults: { column: 'imaging_results', type: 'jsonb', required: false },
      riskFactors: { column: 'risk_factors', type: 'jsonb', required: false },
      treatmentGoals: { column: 'treatment_goals', type: 'jsonb', required: false },
      clinicalNotes: { column: 'clinical_notes', type: 'text', required: false }
    }
  },

  // Insurance Information - Coverage details
  enrollment_insurance_info: {
    tableName: 'enrollment_insurance_info',
    fields: {
      primaryInsuranceName: { column: 'primary_insurance_name', type: 'text', required: true },
      primaryPolicyNumber: { column: 'primary_policy_number', type: 'text', required: true },
      primaryGroupNumber: { column: 'primary_group_number', type: 'text', required: false },
      primarySubscriberName: { column: 'primary_subscriber_name', type: 'text', required: true },
      primarySubscriberDob: { column: 'primary_subscriber_dob', type: 'timestamp', required: false },
      primarySubscriberRelation: { column: 'primary_subscriber_relation', type: 'text', required: false },
      secondaryInsuranceName: { column: 'secondary_insurance_name', type: 'text', required: false },
      secondaryPolicyNumber: { column: 'secondary_policy_number', type: 'text', required: false },
      secondaryGroupNumber: { column: 'secondary_group_number', type: 'text', required: false },
      secondarySubscriberName: { column: 'secondary_subscriber_name', type: 'text', required: false },
      pharmacyInsurance: { column: 'pharmacy_insurance_details', type: 'jsonb', required: false },
      priorAuthRequired: { column: 'prior_auth_required', type: 'boolean', required: false, defaultValue: false },
      copayAmount: { column: 'copay_amount', type: 'text', required: false },
      deductibleAmount: { column: 'deductible_amount', type: 'text', required: false }
    }
  },

  // Consent Management - Legal authorizations
  enrollment_consent: {
    tableName: 'enrollment_consent',
    fields: {
      consentToTreatment: { column: 'consent_to_treatment', type: 'boolean', required: true },
      hipaaAuthorization: { column: 'hipaa_authorization', type: 'boolean', required: true },
      financialResponsibility: { column: 'financial_responsibility', type: 'boolean', required: true },
      communicationConsent: { column: 'communication_consent', type: 'boolean', required: false, defaultValue: false },
      telehealthConsent: { column: 'telehealth_consent', type: 'boolean', required: false, defaultValue: false },
      marketingConsent: { column: 'marketing_consent', type: 'boolean', required: false, defaultValue: false },
      consentDate: { column: 'consent_date', type: 'timestamp', required: true },
      patientSignature: { column: 'patient_signature', type: 'text', required: true },
      witnessSignature: { column: 'witness_signature', type: 'text', required: false },
      consentMethod: { column: 'consent_method', type: 'text', required: true }, // facility, digital, verbal
      signatureLocation: { column: 'signature_location', type: 'text', required: false }
    }
  },

  // Provider Information - Healthcare provider details
  enrollment_provider_info: {
    tableName: 'enrollment_provider_info',
    fields: {
      referringProviderName: { column: 'referring_provider_name', type: 'text', required: true },
      referringProviderNpi: { column: 'referring_provider_npi', type: 'text', required: true },
      referringProviderPhone: { column: 'referring_provider_phone', type: 'text', required: true },
      referringProviderFax: { column: 'referring_provider_fax', type: 'text', required: false },
      referringProviderEmail: { column: 'referring_provider_email', type: 'text', required: false },
      primaryCarePhysician: { column: 'primary_care_physician', type: 'text', required: false },
      primaryCarePhysicianNpi: { column: 'primary_care_physician_npi', type: 'text', required: false },
      primaryCarePhysicianPhone: { column: 'primary_care_physician_phone', type: 'text', required: false },
      specialistPhysician: { column: 'specialist_physician', type: 'text', required: false },
      specialistPhysicianNpi: { column: 'specialist_physician_npi', type: 'text', required: false },
      hospitalAffiliation: { column: 'hospital_affiliation', type: 'text', required: false }
    }
  },

  // Treatment Planning - Care protocols and goals
  enrollment_treatment_plan: {
    tableName: 'enrollment_treatment_plan',
    fields: {
      treatmentType: { column: 'treatment_type', type: 'text', required: true },
      treatmentGoals: { column: 'treatment_goals', type: 'jsonb', required: true },
      estimatedDuration: { column: 'estimated_duration', type: 'integer', required: false },
      treatmentFacility: { column: 'treatment_facility', type: 'text', required: true },
      facilityNpi: { column: 'facility_npi', type: 'text', required: true },
      facilityAddress: { column: 'facility_address', type: 'text', required: false },
      facilityPhone: { column: 'facility_phone', type: 'text', required: false },
      treatmentProtocol: { column: 'treatment_protocol', type: 'jsonb', required: false },
      medicationProtocol: { column: 'medication_protocol', type: 'jsonb', required: false },
      monitoringPlan: { column: 'monitoring_plan', type: 'jsonb', required: false },
      careTeamMembers: { column: 'care_team_members', type: 'jsonb', required: false },
      emergencyContact: { column: 'emergency_contact', type: 'jsonb', required: false }
    }
  },

  // Document Management - File uploads and document tracking
  enrollment_documents: {
    tableName: 'enrollment_documents',
    fields: {
      documentType: { column: 'document_type', type: 'text', required: true },
      fileName: { column: 'file_name', type: 'text', required: true },
      filePath: { column: 'file_path', type: 'text', required: true },
      fileSize: { column: 'file_size', type: 'integer', required: false },
      mimeType: { column: 'mime_type', type: 'text', required: false },
      uploadedBy: { column: 'uploaded_by', type: 'uuid', required: false },
      documentStatus: { column: 'document_status', type: 'text', required: false, defaultValue: 'pending' },
      reviewedBy: { column: 'reviewed_by', type: 'uuid', required: false },
      reviewedAt: { column: 'reviewed_at', type: 'timestamp', required: false },
      documentNotes: { column: 'document_notes', type: 'text', required: false }
    }
  },

  // Care Team Collaboration - Team assignments and workflow
  enrollment_collaborations: {
    tableName: 'enrollment_collaborations',
    fields: {
      stepId: { column: 'step_id', type: 'text', required: true },
      assignedRole: { column: 'assigned_role', type: 'text', required: true },
      assignedUser: { column: 'assigned_user', type: 'uuid', required: false },
      status: { column: 'status', type: 'text', required: true, defaultValue: 'pending' },
      notes: { column: 'notes', type: 'text', required: false },
      startedAt: { column: 'started_at', type: 'timestamp', required: false },
      completedAt: { column: 'completed_at', type: 'timestamp', required: false },
      priority: { column: 'priority', type: 'text', required: false, defaultValue: 'normal' }
    }
  },

  // Main Enrollment Tracking - Overall enrollment status
  patient_enrollments: {
    tableName: 'patient_enrollments',
    fields: {
      enrollmentStatus: { column: 'enrollment_status', type: 'text', required: true, defaultValue: 'pending' },
      currentSection: { column: 'current_section', type: 'text', required: false },
      progressPercentage: { column: 'progress_percentage', type: 'integer', required: false, defaultValue: 0 },
      patientSignature: { column: 'patient_signature', type: 'text', required: false },
      providerSignature: { column: 'provider_signature', type: 'text', required: false },
      submittedAt: { column: 'submitted_at', type: 'timestamp', required: false },
      completedAt: { column: 'completed_at', type: 'timestamp', required: false },
      enrollmentNotes: { column: 'enrollment_notes', type: 'text', required: false },
      priority: { column: 'priority', type: 'text', required: false, defaultValue: 'normal' }
    }
  }
};

/**
 * Save data to specific enrollment table with proper field mapping
 */
export const saveEnrollmentSection = async (
  enrollmentId: string,
  sectionId: string,
  formData: any
): Promise<{ success: boolean; error?: string }> => {
  try {
    const mapping = enrollmentTableMappings[sectionId];
    if (!mapping) {
      throw new Error(`No mapping found for section: ${sectionId}`);
    }

    // Transform form data to database format
    const dbData: Record<string, any> = {
      enrollment_id: enrollmentId // Common foreign key
    };

    // Handle enrollment_instance_id for specific tables
    if (['enrollment_documents', 'enrollment_collaborations'].includes(mapping.tableName)) {
      dbData.enrollment_instance_id = enrollmentId;
    }

    // Map form fields to database columns
    Object.entries(mapping.fields).forEach(([formField, config]) => {
      const value = formData[formField];
      
      if (value !== undefined && value !== null && value !== '') {
        // Type conversion and validation
        switch (config.type) {
          case 'boolean':
            dbData[config.column] = Boolean(value);
            break;
          case 'integer':
            dbData[config.column] = parseInt(value) || config.defaultValue || 0;
            break;
          case 'jsonb':
            dbData[config.column] = typeof value === 'object' ? value : [value];
            break;
          case 'timestamp':
            dbData[config.column] = new Date(value).toISOString();
            break;
          default:
            dbData[config.column] = String(value);
        }
      } else if (config.required && config.defaultValue !== undefined) {
        dbData[config.column] = config.defaultValue;
      }
    });

    console.log(`Saving to ${mapping.tableName}:`, dbData);

    // Use upsert for tables that might have existing records
    const { error } = await supabase
      .from(mapping.tableName as any)
      .upsert(dbData);

    if (error) {
      console.error(`Error saving to ${mapping.tableName}:`, error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error) {
    console.error('Failed to save enrollment section:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
};

/**
 * Get all required fields for validation
 */
export const getRequiredFields = (sectionId: string): string[] => {
  const mapping = enrollmentTableMappings[sectionId];
  if (!mapping) return [];
  
  return Object.entries(mapping.fields)
    .filter(([_, config]) => config.required)
    .map(([formField]) => formField);
};

/**
 * Validate section data against required fields
 */
export const validateSectionData = (sectionId: string, formData: any): { valid: boolean; missingFields: string[] } => {
  const requiredFields = getRequiredFields(sectionId);
  const missingFields = requiredFields.filter(field => {
    const value = formData[field];
    return value === undefined || value === null || value === '';
  });
  
  return {
    valid: missingFields.length === 0,
    missingFields
  };
};