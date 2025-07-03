
/**
 * Internal API Detection and Generation
 */

import { ApiIntegration, ApiEndpoint, ApiAuthentication, ApiBodySchema, ApiResponseSchema } from './ApiIntegrationTypes';

interface InternalEndpoint {
  name: string;
  path: string;
  method: string;
  description: string;
  isPublic: boolean;
  authentication: 'none' | 'bearer';
  parameters?: string[];
  responses?: Record<string, string>;
}

export class InternalApiDetector {
  static detectInternalApis(): InternalEndpoint[] {
    return [
      {
        name: 'User Profile',
        path: '/api/profile',
        method: 'GET',
        description: 'Get current user profile information',
        isPublic: false,
        authentication: 'bearer',
        parameters: [],
        responses: { '200': 'User profile data' }
      },
      {
        name: 'Update Profile',
        path: '/api/profile',
        method: 'PUT',
        description: 'Update user profile information',
        isPublic: false,
        authentication: 'bearer',
        parameters: ['first_name', 'last_name', 'department'],
        responses: { '200': 'Profile updated successfully' }
      },
      {
        name: 'List Facilities',
        path: '/api/facilities',
        method: 'GET',
        description: 'Get list of healthcare facilities',
        isPublic: false,
        authentication: 'bearer',
        parameters: ['page', 'limit'],
        responses: { '200': 'List of facilities' }
      }
    ];
  }

  static generateMockInternalIntegration(): ApiIntegration {
    const endpoints = this.detectInternalApis();
    
    const apiEndpoints: ApiEndpoint[] = endpoints.map(endpoint => ({
      id: `internal_${endpoint.path.replace(/[^a-zA-Z0-9]/g, '_')}`,
      name: endpoint.name,
      description: endpoint.description,
      method: endpoint.method as any,
      url: endpoint.path,
      fullUrl: `${window.location.origin}${endpoint.path}`,
      headers: endpoint.authentication === 'bearer' 
        ? { 'Authorization': 'Bearer {{token}}', 'Content-Type': 'application/json' }
        : { 'Content-Type': 'application/json' },
      queryParams: endpoint.parameters?.reduce((acc, param) => {
        acc[param] = `{{${param}}}`;
        return acc;
      }, {} as Record<string, string>) || {},
      isPublic: endpoint.isPublic,
      authentication: {
        type: endpoint.authentication as any,
        required: endpoint.authentication !== 'none'
      },
      parameters: endpoint.parameters || [],
      responses: endpoint.responses || { '200': 'Success' },
      responseSchema: {
        type: 'object',
        properties: {}
      },
      bodySchema: ['POST', 'PUT', 'PATCH'].includes(endpoint.method) ? {
        type: 'object',
        properties: {}
      } : undefined
    }));

    return {
      id: 'internal_healthcare_api',
      name: 'Healthcare Admin Internal API',
      description: 'Internal APIs for healthcare administration platform with HIPAA-compliant operations',
      baseUrl: window.location.origin,
      version: '1.0.0',
      type: 'internal',
      category: 'healthcare',
      status: 'active',
      endpoints: apiEndpoints,
      schemas: {},
      mappings: [],
      rlsPolicies: [],
      contact: {
        name: 'Internal Development Team',
        email: 'dev-team@healthcare-admin.com',
        team: 'Platform Engineering'
      },
      sla: {
        uptime: '99.9%',
        responseTime: '<200ms',
        support: '24/7 Internal Support'
      },
      externalDocumentation: `${window.location.origin}/api/docs`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
  }
}
