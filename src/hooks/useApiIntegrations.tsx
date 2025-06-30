
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

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
      console.log('📊 Fetching API integrations with comprehensive processes...');
      
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
            endpoints: [], // Would be populated from endpoints table in real implementation
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

        // Add Twilio as a consumed external API with comprehensive processes
        const twilioIntegration: ApiIntegration = {
          id: 'twilio-external-api',
          name: 'Twilio Communications API',
          type: 'external',
          status: 'active',
          description: 'External Twilio API for SMS, voice, and communication services with comprehensive integration processes',
          baseUrl: 'https://api.twilio.com',
          version: '2010-04-01',
          category: 'Communications',
          direction: 'outbound',
          endpoints: [
            {
              id: 'send-sms',
              path: '/2010-04-01/Accounts/{AccountSid}/Messages.json',
              method: 'POST',
              description: 'Send SMS messages',
              documentation: 'https://www.twilio.com/docs/sms/api/message-resource'
            },
            {
              id: 'get-messages',
              path: '/2010-04-01/Accounts/{AccountSid}/Messages.json',
              method: 'GET',
              description: 'Retrieve message history',
              documentation: 'https://www.twilio.com/docs/sms/api/message-resource'
            },
            {
              id: 'make-call',
              path: '/2010-04-01/Accounts/{AccountSid}/Calls.json',
              method: 'POST',
              description: 'Initiate voice calls',
              documentation: 'https://www.twilio.com/docs/voice/api/call-resource'
            }
          ],
          schemas: {
            'MessageRequest': {
              type: 'object',
              properties: {
                To: { type: 'string', description: 'Destination phone number' },
                From: { type: 'string', description: 'Twilio phone number' },
                Body: { type: 'string', description: 'Message content' }
              }
            },
            'MessageResponse': {
              type: 'object',
              properties: {
                sid: { type: 'string', description: 'Message SID' },
                status: { type: 'string', description: 'Message status' },
                date_created: { type: 'string', description: 'Creation timestamp' }
              }
            }
          },
          rlsPolicies: [
            {
              name: 'twilio_message_logs_policy',
              table: 'twilio_message_logs',
              operation: 'SELECT',
              condition: 'auth.uid() = user_id'
            }
          ],
          mappings: [
            {
              name: 'Patient SMS Notifications',
              sourceField: 'patient.phone',
              targetField: 'twilio.To',
              transformation: 'formatPhoneNumber'
            },
            {
              name: 'Facility Phone Mapping',
              sourceField: 'facility.contact_phone',
              targetField: 'twilio.From',
              transformation: 'selectTwilioNumber'
            }
          ],
          documentation: {
            specificationUrl: 'https://www.twilio.com/docs/api',
            fieldMappings: [
              {
                externalField: 'To',
                internalField: 'recipient_phone',
                description: 'Maps internal phone numbers to Twilio To field',
                transformation: 'E.164 format validation'
              },
              {
                externalField: 'From',
                internalField: 'facility_phone',
                description: 'Maps facility phone to registered Twilio number',
                transformation: 'Twilio number selection'
              },
              {
                externalField: 'Body',
                internalField: 'message_content',
                description: 'Maps internal message content to SMS body',
                transformation: 'Character limit validation (160 chars)'
              }
            ],
            generatedSchemas: [
              'twilio_message_requests',
              'twilio_message_responses',
              'twilio_call_logs',
              'twilio_webhook_events'
            ],
            databaseTables: [
              'twilio_message_logs',
              'twilio_call_history',
              'twilio_webhook_events',
              'twilio_rate_limits'
            ],
            rlsPolicies: [
              {
                table: 'twilio_message_logs',
                policy: 'Users can view their own message logs',
                sql: 'CREATE POLICY "twilio_user_messages" ON twilio_message_logs FOR SELECT USING (auth.uid() = user_id)'
              },
              {
                table: 'twilio_call_history',
                policy: 'Facility staff can view facility call logs',
                sql: 'CREATE POLICY "twilio_facility_calls" ON twilio_call_history FOR SELECT USING (user_has_facility_access(auth.uid(), facility_id))'
              }
            ],
            endpoints: [
              {
                internal_path: '/api/sms/send',
                external_path: '/2010-04-01/Accounts/{AccountSid}/Messages.json',
                method: 'POST',
                purpose: 'Send SMS to patients'
              },
              {
                internal_path: '/api/calls/initiate',
                external_path: '/2010-04-01/Accounts/{AccountSid}/Calls.json',
                method: 'POST',
                purpose: 'Initiate patient calls'
              }
            ]
          },
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };

        // Add Twilio to the integrations
        allIntegrations.push(twilioIntegration);

        // Add other external APIs we might be consuming
        const externalApis: ApiIntegration[] = [
          {
            id: 'npi-registry-api',
            name: 'NPI Registry API',
            type: 'external',
            status: 'active',
            description: 'National Provider Identifier registry for healthcare provider verification',
            baseUrl: 'https://npiregistry.cms.hhs.gov',
            version: '2.1',
            category: 'Healthcare Verification',
            direction: 'outbound',
            endpoints: [
              {
                id: 'search-providers',
                path: '/api/providers',
                method: 'GET',
                description: 'Search healthcare providers by NPI'
              }
            ],
            schemas: {
              'ProviderSearchRequest': {
                type: 'object',
                properties: {
                  number: { type: 'string', description: 'NPI number' },
                  organization_name: { type: 'string', description: 'Organization name' }
                }
              }
            },
            rlsPolicies: [],
            mappings: [
              {
                name: 'Provider NPI Verification',
                sourceField: 'provider.npi_number',
                targetField: 'npi_registry.number',
                transformation: 'validateNPI'
              }
            ],
            documentation: {
              specificationUrl: 'https://npiregistry.cms.hhs.gov/api-page',
              fieldMappings: [
                {
                  externalField: 'number',
                  internalField: 'provider_npi',
                  description: 'Maps internal NPI to registry search',
                  transformation: '10-digit NPI validation'
                }
              ],
              generatedSchemas: ['npi_verification_requests', 'npi_verification_responses'],
              databaseTables: ['provider_npi_verifications', 'npi_lookup_cache'],
              rlsPolicies: [
                {
                  table: 'provider_npi_verifications',
                  policy: 'Facility staff can verify their providers',
                  sql: 'CREATE POLICY "npi_facility_verification" ON provider_npi_verifications FOR SELECT USING (user_has_facility_access(auth.uid(), facility_id))'
                }
              ],
              endpoints: [
                {
                  internal_path: '/api/providers/verify-npi',
                  external_path: '/api/providers',
                  method: 'GET',
                  purpose: 'Verify provider NPI numbers'
                }
              ]
            },
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          }
        ];

        allIntegrations.push(...externalApis);

        console.log('✅ API integrations loaded with comprehensive processes:', allIntegrations.length);
        return allIntegrations;

      } catch (error) {
        console.error('Error fetching API integrations:', error);
        // Return at least Twilio as fallback
        return [{
          id: 'twilio-external-api',
          name: 'Twilio Communications API',
          type: 'external',
          status: 'active',
          description: 'External Twilio API for SMS and voice communications',
          baseUrl: 'https://api.twilio.com',
          version: '2010-04-01',
          category: 'Communications',
          direction: 'outbound',
          endpoints: [],
          schemas: {},
          rlsPolicies: [],
          mappings: [],
          documentation: {
            specificationUrl: 'https://www.twilio.com/docs/api'
          },
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }];
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
