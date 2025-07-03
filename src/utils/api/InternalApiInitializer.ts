
/**
 * Internal API Initialization
 */

import { ApiIntegration, ApiEndpoint, ApiResponseSchema } from './ApiIntegrationTypes';

export class InternalApiInitializer {
  static async initializeInternalApis(): Promise<ApiIntegration[]> {
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
        id: 'internal_profile_get',
        name: 'Get User Profile',
        description: 'Retrieve current user profile information',
        method: 'GET',
        url: '/api/profile',
        fullUrl: `${baseUrl}/api/profile`,
        headers: { 'Authorization': 'Bearer {{token}}', 'Content-Type': 'application/json' },
        queryParams: {},
        isPublic: false,
        authentication: { type: 'bearer', required: true },
        parameters: [],
        responses: { '200': 'User profile data' },
        responseSchema: defaultResponseSchema
      }
    ];

    const internalIntegration: ApiIntegration = {
      id: 'internal_healthcare_api',
      name: 'Healthcare Admin Internal API',
      description: 'Internal APIs for healthcare administration platform',
      baseUrl,
      version: '1.0.0',
      type: 'internal',
      category: 'healthcare',
      status: 'active',
      endpoints,
      schemas: {},
      mappings: [],
      rlsPolicies: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    return [internalIntegration];
  }
}
