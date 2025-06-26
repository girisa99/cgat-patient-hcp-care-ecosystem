
/**
 * Internal API Initialization for API Integrations
 */

import { ApiIntegration } from './ApiIntegrationTypes';
import { InternalApiDetector } from './InternalApiDetector';
import { SchemaAnalyzer } from './SchemaAnalyzer';
import { PostmanCollectionGenerator } from './PostmanCollectionGenerator';

export class InternalApiInitializer {
  static async initializeInternalApis(): Promise<{ integration: ApiIntegration; collection: any }> {
    const internalEndpoints = InternalApiDetector.detectInternalApis();
    
    const internalIntegration: ApiIntegration = {
      id: 'internal_healthcare_api',
      name: 'Healthcare Admin Internal API',
      description: 'Internal APIs for healthcare administration platform with HIPAA-compliant operations',
      baseUrl: window.location.origin,
      version: '1.0.0',
      type: 'internal',
      category: 'healthcare',
      status: 'active',
      endpoints: internalEndpoints.map(endpoint => ({
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
          credentials: endpoint.authentication === 'bearer' 
            ? { token: '{{jwt_token}}' }
            : {}
        },
        documentation: `Module: ${endpoint.module}. ${endpoint.description}`,
        responseSchema: endpoint.responses
      })),
      schemas: SchemaAnalyzer.generateInternalSchemas(),
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
      externalDocumentation: {
        swaggerUrl: `${window.location.origin}/api/docs`,
        apiReference: `${window.location.origin}/api/reference`,
        examples: `${window.location.origin}/api/examples`
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const collection = await PostmanCollectionGenerator.generatePostmanCollection(internalIntegration);
    
    return { integration: internalIntegration, collection };
  }
}
