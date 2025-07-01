
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { InternalApiDetector } from '@/utils/api/InternalApiDetector';
import { OnboardingApiDetector } from '@/utils/api/OnboardingApiDetector';

interface ApiIntegration {
  id: string;
  name: string;
  type: 'internal' | 'external';
  status: 'active' | 'inactive' | 'draft' | 'deprecated';
  description?: string;
  baseUrl?: string;
  version: string;
  endpoints: any[];
  schemas: Record<string, any>;
  rlsPolicies: any[];
  mappings: any[];
  documentation?: {
    specificationUrl?: string;
    fieldMappings?: any[];
    generatedSchemas?: any[];
    databaseTables?: string[];
    rlsPolicies?: any[];
    endpoints?: any[];
  };
  category?: string;
  direction?: 'inbound' | 'outbound';
  createdAt: string;
  updatedAt: string;
}

export const useApiIntegrations = () => {
  const {
    data: integrations,
    isLoading,
    error
  } = useQuery({
    queryKey: ['api-integrations'],
    queryFn: async (): Promise<ApiIntegration[]> => {
      console.log('📊 Fetching API integrations including comprehensive external APIs...');
      
      try {
        // Fetch real API integrations from registry
        const { data: registryApis, error: registryError } = await supabase
          .from('api_integration_registry')
          .select('*');

        let allIntegrations: ApiIntegration[] = [];

        // Add registry APIs if available
        if (!registryError && registryApis) {
          allIntegrations = registryApis.map((api) => ({
            id: api.id,
            name: api.name,
            type: api.type as 'internal' | 'external',
            status: api.status as 'active' | 'inactive' | 'draft' | 'deprecated',
            description: api.description,
            baseUrl: api.base_url,
            version: api.version,
            endpoints: [],
            schemas: {},
            rlsPolicies: [],
            mappings: [],
            category: api.category,
            direction: api.direction as 'inbound' | 'outbound',
            createdAt: api.created_at,
            updatedAt: api.updated_at,
            documentation: {
              specificationUrl: api.documentation_url,
              fieldMappings: [],
              generatedSchemas: [],
              databaseTables: [],
              rlsPolicies: [],
              endpoints: []
            }
          }));
        }

        // Generate core healthcare internal API
        const coreHealthcareIntegration = InternalApiDetector.generateMockInternalIntegration();
        allIntegrations.push({
          ...coreHealthcareIntegration,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        });

        // Generate onboarding internal API
        const onboardingIntegration = OnboardingApiDetector.generateOnboardingIntegration();
        allIntegrations.push({
          ...onboardingIntegration,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        });

        // Add comprehensive external APIs with detailed integration processes
        const externalApis: ApiIntegration[] = [
          // Twilio Communications API with comprehensive integration
          {
            id: 'twilio-external-api',
            name: 'Twilio Communications Platform',
            type: 'external',
            status: 'active',
            description: 'Complete Twilio integration for SMS, voice, WhatsApp, and communication workflows with comprehensive healthcare-specific processes',
            baseUrl: 'https://api.twilio.com',
            version: '2010-04-01',
            category: 'Communications',
            direction: 'outbound',
            endpoints: [
              {
                id: 'send-sms',
                path: '/2010-04-01/Accounts/{AccountSid}/Messages.json',
                method: 'POST',
                description: 'Send SMS messages to patients and staff',
                usageExamples: [
                  'Appointment reminders to patients',
                  'Medication adherence notifications',
                  'Emergency alerts to healthcare staff',
                  'Lab result notifications'
                ]
              },
              {
                id: 'get-messages',
                path: '/2010-04-01/Accounts/{AccountSid}/Messages.json',
                method: 'GET',
                description: 'Retrieve message history and delivery status',
                usageExamples: [
                  'Track appointment reminder delivery',
                  'Monitor patient communication engagement',
                  'Audit trail for compliance'
                ]
              },
              {
                id: 'make-call',
                path: '/2010-04-01/Accounts/{AccountSid}/Calls.json',
                method: 'POST',
                description: 'Initiate voice calls for urgent communications',
                usageExamples: [
                  'Emergency patient notifications',
                  'Critical lab result alerts',
                  'Staff emergency communications'
                ]
              },
              {
                id: 'send-whatsapp',
                path: '/2010-04-01/Accounts/{AccountSid}/Messages.json',
                method: 'POST',
                description: 'Send WhatsApp messages for enhanced patient engagement',
                usageExamples: [
                  'Rich media appointment reminders',
                  'Educational content delivery',
                  'Two-way patient communication'
                ]
              }
            ],
            schemas: {
              'PatientSMSRequest': {
                type: 'object',
                properties: {
                  To: { type: 'string', description: 'Patient phone number (E.164 format)' },
                  From: { type: 'string', description: 'Facility Twilio number' },
                  Body: { type: 'string', description: 'HIPAA-compliant message content' },
                  PatientId: { type: 'string', description: 'Internal patient identifier' },
                  MessageType: { type: 'string', enum: ['appointment', 'medication', 'emergency', 'general'] }
                }
              },
              'EmergencyCallRequest': {
                type: 'object',
                properties: {
                  To: { type: 'string', description: 'Emergency contact number' },
                  From: { type: 'string', description: 'Facility main number' },
                  Url: { type: 'string', description: 'TwiML webhook for call script' },
                  Priority: { type: 'string', enum: ['high', 'critical'] }
                }
              }
            },
            rlsPolicies: [
              {
                name: 'twilio_patient_communications_policy',
                table: 'twilio_patient_messages',
                operation: 'SELECT',
                condition: 'auth.uid() = sent_by OR user_has_patient_access(auth.uid(), patient_id)',
                description: 'Users can only view messages they sent or for patients they have access to'
              },
              {
                name: 'twilio_facility_communications_policy',
                table: 'twilio_facility_messages',
                operation: 'ALL',
                condition: 'user_has_facility_access(auth.uid(), facility_id)',
                description: 'Users can manage communications for their assigned facilities'
              }
            ],
            mappings: [
              {
                name: 'Patient Phone Number Mapping',
                sourceField: 'profiles.phone',
                targetField: 'twilio.To',
                transformation: 'formatToE164',
                description: 'Converts internal phone numbers to E.164 format for Twilio',
                validationRules: ['required', 'e164Format', 'notOptedOut']
              },
              {
                name: 'Facility Number Selection',
                sourceField: 'facilities.twilio_numbers',
                targetField: 'twilio.From',
                transformation: 'selectBestTwilioNumber',
                description: 'Intelligently selects appropriate Twilio number based on facility and message type'
              },
              {
                name: 'HIPAA Message Sanitization',
                sourceField: 'message_templates.content',
                targetField: 'twilio.Body',
                transformation: 'sanitizeForHIPAA',
                description: 'Ensures message content complies with HIPAA requirements'
              }
            ],
            documentation: {
              specificationUrl: 'https://www.twilio.com/docs/api',
              fieldMappings: [
                {
                  externalField: 'To',
                  internalField: 'patient_phone',
                  description: 'Maps patient phone from profiles table with E.164 validation',
                  transformation: 'E.164 format conversion and opt-out checking',
                  validationRules: ['E.164 format', 'Not opted out', 'Valid mobile number']
                },
                {
                  externalField: 'From',
                  internalField: 'facility_twilio_number',
                  description: 'Maps facility-specific Twilio number based on patient location',
                  transformation: 'Geographic number selection for local presence'
                },
                {
                  externalField: 'Body',
                  internalField: 'message_content',
                  description: 'HIPAA-compliant message content with template variable substitution',
                  transformation: 'Template processing, PHI sanitization, 160-char compliance'
                }
              ],
              generatedSchemas: [
                'twilio_patient_messages',
                'twilio_facility_communications',
                'twilio_emergency_notifications',
                'twilio_delivery_receipts',
                'twilio_opt_out_management',
                'twilio_number_assignments'
              ],
              databaseTables: [
                'twilio_patient_messages',
                'twilio_call_logs',
                'twilio_webhook_events',
                'twilio_number_pool',
                'twilio_delivery_status',
                'twilio_opt_out_registry',
                'twilio_emergency_contacts',
                'twilio_message_templates'
              ],
              rlsPolicies: [
                {
                  table: 'twilio_patient_messages',
                  policy: 'Patient communication access control',
                  sql: 'CREATE POLICY "twilio_patient_access" ON twilio_patient_messages FOR ALL USING (user_has_patient_access(auth.uid(), patient_id))'
                },
                {
                  table: 'twilio_call_logs',
                  policy: 'Call log facility access',
                  sql: 'CREATE POLICY "twilio_call_facility" ON twilio_call_logs FOR SELECT USING (user_has_facility_access(auth.uid(), facility_id))'
                }
              ],
              endpoints: [
                {
                  internal_path: '/api/communications/sms/patient',
                  external_path: '/2010-04-01/Accounts/{AccountSid}/Messages.json',
                  method: 'POST',
                  purpose: 'Send HIPAA-compliant SMS to patients',
                  integration_flow: [
                    'Validate patient consent and opt-in status',
                    'Select appropriate facility Twilio number',
                    'Apply message template and sanitization',
                    'Send via Twilio API',
                    'Log delivery status and compliance audit trail'
                  ]
                },
                {
                  internal_path: '/api/communications/emergency/call',
                  external_path: '/2010-04-01/Accounts/{AccountSid}/Calls.json',
                  method: 'POST',
                  purpose: 'Initiate emergency voice communications',
                  integration_flow: [
                    'Validate emergency contact authorization',
                    'Generate TwiML script for call content',
                    'Initiate call via Twilio',
                    'Monitor call completion and record outcome'
                  ]
                }
              ]
            },
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          },

          // NPI Registry API with comprehensive healthcare verification
          {
            id: 'npi-registry-api',
            name: 'NPI Registry Healthcare Provider Verification',
            type: 'external',
            status: 'active',
            description: 'Comprehensive National Provider Identifier registry integration for healthcare provider verification, licensing validation, and onboarding automation',
            baseUrl: 'https://npiregistry.cms.hhs.gov',
            version: '2.1',
            category: 'Healthcare Verification',
            direction: 'outbound',
            endpoints: [
              {
                id: 'search-providers',
                path: '/api/providers',
                method: 'GET',
                description: 'Search healthcare providers by NPI, taxonomy, location',
                usageExamples: [
                  'Onboarding provider verification',
                  'Network adequacy compliance',
                  'Provider directory updates',
                  'Credentialing automation'
                ]
              },
              {
                id: 'verify-npi',
                path: '/api/providers/{npi}',
                method: 'GET',
                description: 'Verify specific NPI number and get detailed provider information',
                usageExamples: [
                  'Real-time NPI validation during onboarding',
                  'Provider profile enrichment',
                  'Licensing status verification'
                ]
              },
              {
                id: 'taxonomy-search',
                path: '/api/taxonomy',
                method: 'GET',
                description: 'Search provider taxonomies and specialties',
                usageExamples: [
                  'Specialty matching for referrals',
                  'Network gap analysis',
                  'Provider categorization'
                ]
              }
            ],
            schemas: {
              'NPIVerificationRequest': {
                type: 'object',
                properties: {
                  npi_number: { type: 'string', pattern: '^[0-9]{10}$', description: '10-digit NPI number' },
                  taxonomy_code: { type: 'string', description: 'Healthcare provider taxonomy' },
                  organization_name: { type: 'string', description: 'Organization name for Type 2 NPIs' },
                  first_name: { type: 'string', description: 'Provider first name for Type 1 NPIs' },
                  last_name: { type: 'string', description: 'Provider last name for Type 1 NPIs' },
                  state: { type: 'string', description: 'Provider state for location-based search' }
                }
              },
              'NPIVerificationResponse': {
                type: 'object',
                properties: {
                  npi: { type: 'string', description: 'Verified NPI number' },
                  entity_type: { type: 'string', enum: ['Individual', 'Organization'] },
                  provider_details: { type: 'object', description: 'Comprehensive provider information' },
                  taxonomies: { type: 'array', description: 'Provider specialties and classifications' },
                  addresses: { type: 'array', description: 'Practice locations' },
                  verification_status: { type: 'string', enum: ['verified', 'invalid', 'inactive'] }
                }
              }
            },
            rlsPolicies: [
              {
                name: 'npi_verification_access_policy',
                table: 'npi_verification_logs',
                operation: 'SELECT',
                condition: 'user_has_facility_access(auth.uid(), facility_id) OR created_by = auth.uid()',
                description: 'Users can view NPI verifications for their facilities or their own requests'
              }
            ],
            mappings: [
              {
                name: 'Provider NPI Validation',
                sourceField: 'onboarding_contacts.npi_number',
                targetField: 'npi_registry.npi',
                transformation: 'validateAndFormatNPI',
                description: 'Validates NPI format and checks against registry during onboarding'
              },
              {
                name: 'Taxonomy Code Mapping',
                sourceField: 'provider_specialties.code',
                targetField: 'npi_registry.taxonomy_code',
                transformation: 'mapInternalToNPITaxonomy',
                description: 'Maps internal specialty codes to NPI taxonomy codes'
              }
            ],
            documentation: {
              specificationUrl: 'https://npiregistry.cms.hhs.gov/api-page',
              fieldMappings: [
                {
                  externalField: 'number',
                  internalField: 'provider_npi',
                  description: 'Maps internal NPI to registry search with validation',
                  transformation: '10-digit NPI validation and checksum verification'
                },
                {
                  externalField: 'taxonomy_description',
                  internalField: 'provider_specialty',
                  description: 'Maps NPI taxonomy to internal specialty classifications',
                  transformation: 'Taxonomy code to specialty name resolution'
                }
              ],
              generatedSchemas: [
                'npi_verification_requests',
                'npi_verification_responses',
                'npi_provider_cache',
                'npi_taxonomy_mappings'
              ],
              databaseTables: [
                'npi_verification_logs',
                'npi_provider_cache',
                'npi_taxonomy_reference',
                'npi_onboarding_validations'
              ],
              rlsPolicies: [
                {
                  table: 'npi_verification_logs',
                  policy: 'Facility-based NPI verification access',
                  sql: 'CREATE POLICY "npi_facility_access" ON npi_verification_logs FOR SELECT USING (user_has_facility_access(auth.uid(), facility_id))'
                }
              ],
              endpoints: [
                {
                  internal_path: '/api/onboarding/verify-npi',
                  external_path: '/api/providers',
                  method: 'GET',
                  purpose: 'Automated NPI verification during onboarding process',
                  integration_flow: [
                    'Extract NPI from onboarding form',
                    'Validate NPI format and checksum',
                    'Query NPI registry for provider details',
                    'Cache verification results',
                    'Auto-populate onboarding form with verified data',
                    'Flag any discrepancies for manual review'
                  ]
                }
              ]
            },
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          },

          // NCPDP (National Council for Prescription Drug Programs) API
          {
            id: 'ncpdp-pharmacy-api',
            name: 'NCPDP Pharmacy Network Directory',
            type: 'external',
            status: 'active',
            description: 'NCPDP pharmacy verification and network directory integration for pharmacy onboarding and validation',
            baseUrl: 'https://api.ncpdp.org',
            version: '1.0',
            category: 'Pharmacy Verification',
            direction: 'outbound',
            endpoints: [
              {
                id: 'verify-pharmacy',
                path: '/pharmacy/verify',
                method: 'POST',
                description: 'Verify pharmacy NCPDP number and get detailed information'
              },
              {
                id: 'search-pharmacies',
                path: '/pharmacy/search',
                method: 'GET',
                description: 'Search pharmacies by location, NCPDP number, or name'
              }
            ],
            schemas: {
              'PharmacyVerificationRequest': {
                type: 'object',
                properties: {
                  ncpdp_number: { type: 'string', description: 'NCPDP pharmacy identifier' },
                  pharmacy_name: { type: 'string', description: 'Pharmacy business name' },
                  address: { type: 'object', description: 'Pharmacy address for verification' }
                }
              }
            },
            rlsPolicies: [],
            mappings: [
              {
                name: 'NCPDP Number Validation',
                sourceField: 'onboarding_pharmacy.ncpdp_number',
                targetField: 'ncpdp_api.ncpdp_number',
                transformation: 'validateNCPDPFormat'
              }
            ],
            documentation: {
              specificationUrl: 'https://www.ncpdp.org/API-Documentation',
              fieldMappings: [
                {
                  externalField: 'ncpdp_number',
                  internalField: 'pharmacy_ncpdp',
                  description: 'NCPDP number validation for pharmacy onboarding'
                }
              ],
              generatedSchemas: ['ncpdp_verification_logs'],
              databaseTables: ['ncpdp_pharmacy_verifications'],
              rlsPolicies: [],
              endpoints: [
                {
                  internal_path: '/api/onboarding/verify-pharmacy',
                  external_path: '/pharmacy/verify',
                  method: 'POST',
                  purpose: 'Pharmacy verification during onboarding'
                }
              ]
            },
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          }
        ];

        allIntegrations.push(...externalApis);

        console.log('✅ API integrations loaded with comprehensive external APIs:', {
          total: allIntegrations.length,
          internal: allIntegrations.filter(i => i.type === 'internal').length,
          external: allIntegrations.filter(i => i.type === 'external').length,
          externalDetails: allIntegrations.filter(i => i.type === 'external').map(api => ({
            name: api.name,
            category: api.category,
            endpoints: api.endpoints?.length || 0
          }))
        });
        
        return allIntegrations;

      } catch (error) {
        console.error('Error fetching API integrations:', error);
        return [];
      }
    },
    staleTime: 30000,
    refetchInterval: 60000
  });

  // Separate integrations by type for easier consumption
  const internalApis = integrations?.filter(api => api.type === 'internal') || [];
  const externalApis = integrations?.filter(api => api.type === 'external') || [];

  console.log('🔍 API integrations breakdown:', {
    total: integrations?.length || 0,
    internal: internalApis.length,
    external: externalApis.length,
    externalApiNames: externalApis.map(api => api.name)
  });

  // Mock function for downloading Postman collection
  const downloadPostmanCollection = (integrationId: string) => {
    console.log('📥 Download collection for:', integrationId);
    // This would normally generate and download a Postman collection
  };

  // Mock function for testing endpoint
  const testEndpoint = async (integrationId: string, endpointId: string) => {
    console.log('🧪 Testing endpoint:', { integrationId, endpointId });
    // This would normally test the endpoint and return results
    return { success: true, message: 'Endpoint test completed' };
  };

  return {
    integrations: integrations || [],
    internalApis,
    externalApis,
    isLoading,
    error,
    downloadPostmanCollection,
    testEndpoint
  };
};
