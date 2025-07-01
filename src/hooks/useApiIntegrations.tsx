import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { InternalApiDetector } from '@/utils/api/InternalApiDetector';
import { OnboardingApiDetector } from '@/utils/api/OnboardingApiDetector';

interface ApiIntegration {
  id: string;
  name: string;
  type: 'internal' | 'external';
  status: 'active' | 'inactive' | 'draft' | 'deprecated';
  description: string; // Make required
  baseUrl?: string; // Make optional to match actual data
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
  const queryClient = useQueryClient();

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
            description: api.description || 'No description provided',
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
          description: coreHealthcareIntegration.description || 'Core healthcare API integration',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        });

        // Generate onboarding internal API
        const onboardingIntegration = OnboardingApiDetector.generateOnboardingIntegration();
        allIntegrations.push({
          ...onboardingIntegration,
          description: onboardingIntegration.description || 'Onboarding API integration',
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
                }
              ],
              generatedSchemas: [
                'twilio_patient_messages',
                'twilio_facility_communications',
                'twilio_emergency_notifications'
              ],
              databaseTables: [
                'twilio_patient_messages',
                'twilio_call_logs',
                'twilio_webhook_events'
              ],
              rlsPolicies: [
                {
                  table: 'twilio_patient_messages',
                  policy: 'Patient communication access control',
                  sql: 'CREATE POLICY "twilio_patient_access" ON twilio_patient_messages FOR ALL USING (user_has_patient_access(auth.uid(), patient_id))'
                }
              ],
              endpoints: [
                {
                  internal_path: '/api/communications/sms/patient',
                  external_path: '/2010-04-01/Accounts/{AccountSid}/Messages.json',
                  method: 'POST',
                  purpose: 'Send HIPAA-compliant SMS to patients'
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
                description: 'Search healthcare providers by NPI, taxonomy, location'
              }
            ],
            schemas: {},
            rlsPolicies: [],
            mappings: [],
            documentation: {
              specificationUrl: 'https://npiregistry.cms.hhs.gov/api-page',
              fieldMappings: [],
              generatedSchemas: [],
              databaseTables: [],
              rlsPolicies: [],
              endpoints: []
            },
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          },

          // NCPDP Pharmacy API
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
              }
            ],
            schemas: {},
            rlsPolicies: [],
            mappings: [],
            documentation: {
              specificationUrl: 'https://www.ncpdp.org/API-Documentation',
              fieldMappings: [],
              generatedSchemas: [],
              databaseTables: [],
              rlsPolicies: [],
              endpoints: []
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

  // Add registerIntegration mutation
  const registerIntegrationMutation = useMutation({
    mutationFn: async (integration: Partial<ApiIntegration>) => {
      console.log('📝 Registering new integration:', integration);
      
      const { data, error } = await supabase
        .from('api_integration_registry')
        .insert({
          name: integration.name || '',
          description: integration.description || '',
          type: integration.type || 'external',
          category: integration.category || 'integration',
          purpose: integration.category || 'integration', // Add the required purpose field
          version: integration.version || '1.0.0',
          base_url: integration.baseUrl || '',
          status: integration.status || 'active',
          direction: integration.direction || 'outbound'
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['api-integrations'] });
    }
  });

  const registerIntegration = (integration: Partial<ApiIntegration>) => {
    registerIntegrationMutation.mutate(integration);
  };

  console.log('🔍 API integrations breakdown:', {
    total: integrations?.length || 0,
    internal: internalApis.length,
    external: externalApis.length,
    externalApiNames: externalApis.map(api => api.name)
  });

  return {
    integrations: integrations || [],
    internalApis,
    externalApis,
    isLoading,
    error,
    downloadPostmanCollection,
    testEndpoint,
    registerIntegration,
    isRegistering: registerIntegrationMutation.isPending
  };
};
