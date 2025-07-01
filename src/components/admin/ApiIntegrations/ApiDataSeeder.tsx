
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Database, Zap, CheckCircle, AlertTriangle } from 'lucide-react';

export const ApiDataSeeder: React.FC = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const seedApiDataMutation = useMutation({
    mutationFn: async () => {
      console.log('🌱 Starting comprehensive API data seeding for single source of truth...');
      
      // First, ensure we have the internal_healthcare_api
      const { data: existingApi, error: fetchError } = await supabase
        .from('api_integration_registry')
        .select('*')
        .eq('name', 'internal_healthcare_api')
        .single();

      if (fetchError && fetchError.code !== 'PGRST116') {
        throw fetchError;
      }

      let apiId = existingApi?.id;

      // If it doesn't exist, create it
      if (!existingApi) {
        const { data: newApi, error: createError } = await supabase
          .from('api_integration_registry')
          .insert({
            name: 'internal_healthcare_api',
            description: 'Complete internal API for healthcare administration with comprehensive endpoints and schemas',
            type: 'internal',
            direction: 'bidirectional',
            category: 'healthcare',
            purpose: 'comprehensive_platform',
            lifecycle_stage: 'production',
            status: 'active',
            version: '2.0.0',
            base_url: 'https://api.healthcare.internal',
            documentation_url: 'https://docs.healthcare.internal/api/v2',
            endpoints_count: 0,
            rls_policies_count: 15,
            data_mappings_count: 8,
            contact_info: {
              team: 'Healthcare API Team',
              email: 'api-team@healthcare.internal',
              slack: '#healthcare-api'
            },
            sla_requirements: {
              uptime: '99.9%',
              response_time: '< 200ms',
              support_hours: '24/7'
            },
            security_requirements: {
              authentication: 'JWT + API Key',
              authorization: 'RBAC + RLS',
              encryption: 'TLS 1.3',
              audit: 'Full audit trail'
            },
            rate_limits: {
              default: '1000/hour',
              premium: '10000/hour',
              burst: '100/minute'
            }
          })
          .select()
          .single();

        if (createError) throw createError;
        apiId = newApi.id;
        console.log('✅ Created internal_healthcare_api:', apiId);
      }

      // Now seed comprehensive endpoints - using INSERT without ON CONFLICT
      const endpoints = [
        {
          external_api_id: apiId,
          method: 'GET',
          external_path: '/api/v2/health',
          summary: 'Health Check Endpoint',
          description: 'Returns API health status and system metrics',
          requires_authentication: false,
          is_public: true,
          request_schema: {},
          response_schema: {
            type: 'object',
            properties: {
              status: { type: 'string' },
              version: { type: 'string' },
              timestamp: { type: 'string' },
              uptime: { type: 'number' }
            }
          },
          tags: ['system', 'health']
        },
        {
          external_api_id: apiId,
          method: 'GET',
          external_path: '/api/v2/patients',
          summary: 'List Patients',
          description: 'Retrieve paginated list of patients with filtering options',
          requires_authentication: true,
          is_public: false,
          request_schema: {
            type: 'object',
            properties: {
              page: { type: 'number', minimum: 1 },
              limit: { type: 'number', minimum: 1, maximum: 100 },
              search: { type: 'string' },
              status: { type: 'string', enum: ['active', 'inactive'] }
            }
          },
          response_schema: {
            type: 'object',
            properties: {
              data: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    id: { type: 'string' },
                    firstName: { type: 'string' },
                    lastName: { type: 'string' },
                    email: { type: 'string' },
                    phone: { type: 'string' },
                    status: { type: 'string' }
                  }
                }
              },
              pagination: {
                type: 'object',
                properties: {
                  page: { type: 'number' },
                  limit: { type: 'number' },
                  total: { type: 'number' },
                  pages: { type: 'number' }
                }
              }
            }
          },
          tags: ['patients', 'healthcare']
        },
        {
          external_api_id: apiId,
          method: 'POST',
          external_path: '/api/v2/patients',
          summary: 'Create Patient',
          description: 'Create a new patient record with comprehensive data validation',
          requires_authentication: true,
          is_public: false,
          request_schema: {
            type: 'object',
            required: ['firstName', 'lastName', 'email'],
            properties: {
              firstName: { type: 'string', minLength: 1, maxLength: 100 },
              lastName: { type: 'string', minLength: 1, maxLength: 100 },
              email: { type: 'string', format: 'email' },
              phone: { type: 'string', pattern: '^\\+?[1-9]\\d{1,14}$' },
              dateOfBirth: { type: 'string', format: 'date' }
            }
          },
          response_schema: {
            type: 'object',
            properties: {
              id: { type: 'string' },
              firstName: { type: 'string' },
              lastName: { type: 'string' },
              email: { type: 'string' },
              status: { type: 'string' },
              createdAt: { type: 'string', format: 'date-time' }
            }
          },
          tags: ['patients', 'create']
        },
        {
          external_api_id: apiId,
          method: 'GET',
          external_path: '/api/v2/facilities',
          summary: 'List Healthcare Facilities',
          description: 'Retrieve comprehensive list of healthcare facilities with location data',
          requires_authentication: true,
          is_public: false,
          request_schema: {
            type: 'object',
            properties: {
              page: { type: 'number', minimum: 1 },
              limit: { type: 'number', minimum: 1, maximum: 100 },
              location: { type: 'string' },
              type: { type: 'string', enum: ['hospital', 'clinic', 'pharmacy', 'laboratory'] }
            }
          },
          response_schema: {
            type: 'object',
            properties: {
              data: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    id: { type: 'string' },
                    name: { type: 'string' },
                    type: { type: 'string' },
                    address: { type: 'string' },
                    phone: { type: 'string' },
                    email: { type: 'string' },
                    licenseNumber: { type: 'string' }
                  }
                }
              }
            }
          },
          tags: ['facilities', 'healthcare']
        }
      ];

      // Clear existing endpoints for this API first to avoid duplicates
      const { error: deleteError } = await supabase
        .from('external_api_endpoints')
        .delete()
        .eq('external_api_id', apiId);

      if (deleteError) {
        console.warn('Warning: Could not clear existing endpoints:', deleteError);
      }

      // Insert all endpoints without ON CONFLICT
      const { data: insertedEndpoints, error: endpointsError } = await supabase
        .from('external_api_endpoints')
        .insert(endpoints)
        .select();

      if (endpointsError) throw endpointsError;

      // Update the API registry with correct counts
      const { error: updateError } = await supabase
        .from('api_integration_registry')
        .update({
          endpoints_count: endpoints.length,
          rls_policies_count: 15,
          data_mappings_count: 8,
          updated_at: new Date().toISOString()
        })
        .eq('id', apiId);

      if (updateError) throw updateError;

      console.log(`✅ Seeded ${endpoints.length} endpoints for single source of truth`);
      
      return {
        apiId,
        endpointsCreated: endpoints.length,
        totalSchemas: endpoints.filter(e => e.request_schema || e.response_schema).length,
        securedEndpoints: endpoints.filter(e => e.requires_authentication).length,
        publicEndpoints: endpoints.filter(e => e.is_public).length
      };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['api-services'] });
      queryClient.invalidateQueries({ queryKey: ['api-endpoints-consolidated'] });
      queryClient.invalidateQueries({ queryKey: ['api-registrations-consolidated'] });
      
      toast({
        title: "✅ Single Source of Truth Seeded",
        description: `Created ${data.endpointsCreated} endpoints with ${data.totalSchemas} schemas, ${data.securedEndpoints} secured, ${data.publicEndpoints} public`,
      });
    },
    onError: (error: any) => {
      console.error('❌ Seeding error details:', error);
      toast({
        title: "❌ Seeding Failed",
        description: error.message || "Failed to seed API data",
        variant: "destructive",
      });
    }
  });

  return (
    <Card className="border-green-200 bg-green-50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Database className="h-5 w-5 text-green-600" />
          API Data Seeder - Single Source of Truth
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Alert className="mb-4">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            This will populate the <strong>internal_healthcare_api</strong> with comprehensive endpoints, schemas, and real data to establish the single source of truth.
          </AlertDescription>
        </Alert>
        
        <div className="space-y-3">
          <p className="text-sm text-green-800">
            <strong>What will be created:</strong>
          </p>
          <ul className="text-sm text-green-700 space-y-1 ml-4">
            <li>• 4 comprehensive API endpoints with full schemas</li>
            <li>• Patient management endpoints (GET, POST)</li>
            <li>• Facility management endpoints</li>
            <li>• Health check and system endpoints</li>
            <li>• Authentication and security validation</li>
          </ul>
        </div>

        <Button 
          onClick={() => seedApiDataMutation.mutate()}
          disabled={seedApiDataMutation.isPending}
          className="w-full mt-4"
          size="lg"
        >
          {seedApiDataMutation.isPending ? (
            <>
              <Zap className="h-4 w-4 mr-2 animate-spin" />
              Seeding Single Source of Truth...
            </>
          ) : (
            <>
              <CheckCircle className="h-4 w-4 mr-2" />
              Seed API Data (Single Source of Truth)
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
};
