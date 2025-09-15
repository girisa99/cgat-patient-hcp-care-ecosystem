// External Healthcare Systems Configuration
export interface ExternalSystemConfig {
  id: string;
  name: string;
  type: 'emr' | 'crm' | 'clinical' | 'business' | 'pharmacy' | 'insurance';
  apiType: 'rest' | 'fhir' | 'soap' | 'hl7' | 'proprietary';
  baseUrl: string;
  authType: 'oauth2' | 'api_key' | 'basic' | 'certificate';
  hipaaCompliant: boolean;
  dataMappings: DataMapping[];
}

export interface DataMapping {
  sourceField: string;
  targetTable: string;
  targetField: string;
  transformation?: string;
  required: boolean;
}

export const EXTERNAL_SYSTEMS_CONFIG: Record<string, ExternalSystemConfig> = {
  // EMR Systems
  cerner: {
    id: 'cerner',
    name: 'Cerner PowerChart',
    type: 'emr',
    apiType: 'fhir',
    baseUrl: 'https://fhir-ehr.cerner.com',
    authType: 'oauth2',
    hipaaCompliant: true,
    dataMappings: [
      {
        sourceField: 'Patient.name.given[0]',
        targetTable: 'enrollment_patient_info',
        targetField: 'first_name',
        required: true
      },
      {
        sourceField: 'Patient.name.family',
        targetTable: 'enrollment_patient_info',
        targetField: 'last_name',
        required: true
      },
      {
        sourceField: 'Patient.telecom[?(@.system=="phone")].value',
        targetTable: 'enrollment_patient_info',
        targetField: 'phone',
        required: false
      }
    ]
  },

  athenahealth: {
    id: 'athenahealth',
    name: 'athenahealth EHR',
    type: 'emr',
    apiType: 'rest',
    baseUrl: 'https://api.athenahealth.com',
    authType: 'oauth2',
    hipaaCompliant: true,
    dataMappings: [
      {
        sourceField: 'providers.firstname',
        targetTable: 'provider_profiles',
        targetField: 'first_name',
        required: true
      },
      {
        sourceField: 'providers.lastname',
        targetTable: 'provider_profiles',
        targetField: 'last_name',
        required: true
      },
      {
        sourceField: 'providers.npi',
        targetTable: 'npi_verification_results',
        targetField: 'npi_number',
        required: true
      }
    ]
  },

  changeHealthcare: {
    id: 'change-healthcare',
    name: 'Change Healthcare',
    type: 'insurance',
    apiType: 'rest',
    baseUrl: 'https://api.changehealthcare.com',
    authType: 'oauth2',
    hipaaCompliant: true,
    dataMappings: [
      {
        sourceField: 'eligibility.memberId',
        targetTable: 'enrollment_insurance_info',
        targetField: 'primary_policy_number',
        required: true
      },
      {
        sourceField: 'eligibility.planName',
        targetTable: 'enrollment_insurance_info',
        targetField: 'primary_insurance_name',
        required: true
      }
    ]
  },

  // Business Systems
  salesforce: {
    id: 'salesforce',
    name: 'Salesforce Health Cloud',
    type: 'crm',
    apiType: 'rest',
    baseUrl: 'https://api.salesforce.com',
    authType: 'oauth2',
    hipaaCompliant: true,
    dataMappings: [
      {
        sourceField: 'Account.Name',
        targetTable: 'provider_profiles',
        targetField: 'organization_name',
        required: true
      },
      {
        sourceField: 'Account.Phone',
        targetTable: 'provider_profiles',
        targetField: 'phone',
        required: false
      }
    ]
  },

  veevaVault: {
    id: 'veeva-vault',
    name: 'Veeva Vault',
    type: 'clinical',
    apiType: 'rest',
    baseUrl: 'https://vault.veevavault.com',
    authType: 'oauth2',
    hipaaCompliant: true,
    dataMappings: [
      {
        sourceField: 'documents.name__v',
        targetTable: 'enrollment_documents',
        targetField: 'document_name',
        required: true
      },
      {
        sourceField: 'documents.study__v',
        targetTable: 'clinical_trials',
        targetField: 'trial_id',
        required: true
      }
    ]
  },

  oracleClinical: {
    id: 'oracle-clinical',
    name: 'Oracle Clinical One',
    type: 'clinical',
    apiType: 'rest',
    baseUrl: 'https://clinical.oracle.com',
    authType: 'basic',
    hipaaCompliant: true,
    dataMappings: [
      {
        sourceField: 'studies.studyOID',
        targetTable: 'clinical_trials',
        targetField: 'nct_number',
        required: true
      },
      {
        sourceField: 'studies.studyName',
        targetTable: 'clinical_trials',
        targetField: 'title',
        required: true
      }
    ]
  },

  sapHealthcare: {
    id: 'sap-healthcare',
    name: 'SAP for Healthcare',
    type: 'business',
    apiType: 'rest',
    baseUrl: 'https://api.sap.com',
    authType: 'oauth2',
    hipaaCompliant: false,
    dataMappings: [
      {
        sourceField: 'Patient.PatientNumber',
        targetTable: 'patient_enrollments',
        targetField: 'patient_id',
        required: true
      },
      {
        sourceField: 'Billing.BillingAmount',
        targetTable: 'enrollment_insurance_info',
        targetField: 'billing_amount',
        required: false
      }
    ]
  }
};

// Helper functions for external systems integration
export const getSystemsByType = (type: string) => {
  return Object.values(EXTERNAL_SYSTEMS_CONFIG).filter(system => system.type === type);
};

export const getHipaaComplianceSystems = () => {
  return Object.values(EXTERNAL_SYSTEMS_CONFIG).filter(system => system.hipaaCompliant);
};

export const getMappingsForTable = (tableName: string) => {
  const mappings: DataMapping[] = [];
  Object.values(EXTERNAL_SYSTEMS_CONFIG).forEach(system => {
    const tableMappings = system.dataMappings.filter(mapping => mapping.targetTable === tableName);
    mappings.push(...tableMappings);
  });
  return mappings;
};

// Validation functions
export const validateSystemConnection = (systemId: string, credentials: Record<string, string>) => {
  const system = EXTERNAL_SYSTEMS_CONFIG[systemId];
  if (!system) return false;

  switch (system.authType) {
    case 'oauth2':
      return !!(credentials.clientId && credentials.clientSecret);
    case 'api_key':
      return !!credentials.apiKey;
    case 'basic':
      return !!(credentials.username && credentials.password);
    default:
      return false;
  }
};

export const generateMappingCode = (systemId: string, targetTable: string) => {
  const system = EXTERNAL_SYSTEMS_CONFIG[systemId];
  if (!system) return null;

  const relevantMappings = system.dataMappings.filter(m => m.targetTable === targetTable);
  
  return {
    systemName: system.name,
    apiType: system.apiType,
    mappings: relevantMappings,
    sampleCode: `
// ${system.name} Integration for ${targetTable}
const sync${targetTable}From${system.name.replace(/\s+/g, '')} = async () => {
  const response = await fetch('${system.baseUrl}/endpoint', {
    headers: { 'Authorization': 'Bearer ' + apiKey }
  });
  const data = await response.json();
  
  const mapped = data.map(item => ({
    ${relevantMappings.map(m => `${m.targetField}: item.${m.sourceField}`).join(',\n    ')}
  }));
  
  await supabase.from('${targetTable}').insert(mapped);
};`
  };
};