
/**
 * Onboarding API Detection
 */

import { ApiIntegration, ApiEndpoint, ApiRlsPolicy, ApiDataMapping, ApiResponseSchema } from './ApiIntegrationTypes';

export class OnboardingApiDetector {
  static generateOnboardingApiIntegration(): ApiIntegration {
    const baseUrl = window.location.origin;
    
    const defaultResponseSchema: ApiResponseSchema = {
      type: 'object',
      properties: {
        message: { type: 'string' },
        data: { type: 'object' }
      }
    };

    const endpoints: ApiEndpoint[] = [
      {
        id: 'onboarding_create',
        name: 'Create Onboarding Application',
        description: 'Submit new treatment center onboarding application',
        method: 'POST',
        url: '/api/onboarding',
        fullUrl: `${baseUrl}/api/onboarding`,
        headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer {{token}}' },
        queryParams: {},
        isPublic: false,
        authentication: { type: 'bearer', required: true },
        parameters: ['organization_name', 'contact_email', 'facility_type'],
        responses: { '201': 'Onboarding application created' },
        responseSchema: defaultResponseSchema,
        bodySchema: {
          type: 'object',
          properties: {
            organization_name: { type: 'string' },
            contact_email: { type: 'string' },
            facility_type: { type: 'string' }
          }
        }
      }
    ];

    // Fix RLS policies to match interface
    const rlsPolicies: ApiRlsPolicy[] = [
      {
        id: 'onboarding_user_access',
        table: 'treatment_center_onboarding',
        policy: 'Users can manage their own onboarding applications',
        description: 'Allow users to create and manage their onboarding applications',
        policyName: 'onboarding_user_access_policy',
        operation: 'ALL',
        tableName: 'treatment_center_onboarding',
        condition: 'user_id = auth.uid()',
        roles: ['authenticated']
      }
    ] as ApiRlsPolicy[];

    // Fix data mappings to match interface
    const mappings: ApiDataMapping[] = [
      {
        id: 'onboarding_org_mapping',
        sourceField: 'organization_name',
        targetField: 'organization_name',
        targetTable: 'treatment_center_onboarding',
        transformation: 'direct',
        validation: {
          required: true,
          type: 'string',
          rules: ['not_empty']
        }
      }
    ] as ApiDataMapping[];

    return {
      id: 'onboarding_api_integration',
      name: 'Treatment Center Onboarding API',
      description: 'API for managing treatment center onboarding process',
      baseUrl,
      version: '1.0.0',
      type: 'internal',
      category: 'onboarding',
      status: 'active',
      endpoints,
      schemas: {},
      mappings,
      rlsPolicies,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
  }
}
