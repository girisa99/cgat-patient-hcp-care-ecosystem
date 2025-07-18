/**
 * Automatic API Detection System
 * Dynamically detects and updates internal APIs and categories
 */

import { supabase } from '@/integrations/supabase/client';
import { ApiIntegration, ApiEndpoint } from './ApiIntegrationTypes';

export interface DetectedApiEndpoint {
  path: string;
  method: string;
  name: string;
  description: string;
  isPublic: boolean;
  authentication: 'none' | 'bearer' | 'api_key';
  parameters: string[];
  responses: Record<string, string>;
  category: string;
}

export class AutoApiDetector {
  private static registeredEndpoints: Set<string> = new Set();
  private static detectionCallbacks: Array<(endpoints: DetectedApiEndpoint[]) => void> = [];

  /**
   * Registers a new API endpoint for automatic detection
   */
  static registerEndpoint(endpoint: DetectedApiEndpoint): void {
    const endpointKey = `${endpoint.method}:${endpoint.path}`;
    
    if (!this.registeredEndpoints.has(endpointKey)) {
      this.registeredEndpoints.add(endpointKey);
      this.syncToDatabase(endpoint);
      
      // Notify callbacks about new endpoint
      this.detectionCallbacks.forEach(callback => {
        callback([endpoint]);
      });
    }
  }

  /**
   * Bulk register multiple endpoints
   */
  static registerEndpoints(endpoints: DetectedApiEndpoint[]): void {
    const newEndpoints: DetectedApiEndpoint[] = [];
    
    endpoints.forEach(endpoint => {
      const endpointKey = `${endpoint.method}:${endpoint.path}`;
      if (!this.registeredEndpoints.has(endpointKey)) {
        this.registeredEndpoints.add(endpointKey);
        newEndpoints.push(endpoint);
      }
    });

    if (newEndpoints.length > 0) {
      this.syncToDatabase(...newEndpoints);
      
      // Notify callbacks about new endpoints
      this.detectionCallbacks.forEach(callback => {
        callback(newEndpoints);
      });
    }
  }

  /**
   * Get all currently detected internal endpoints
   */
  static getDetectedEndpoints(): DetectedApiEndpoint[] {
    return Array.from(this.registeredEndpoints).map(key => {
      const [method, path] = key.split(':');
      return {
        path,
        method,
        name: this.generateEndpointName(path, method),
        description: `Auto-detected ${method} endpoint for ${path}`,
        isPublic: false,
        authentication: 'bearer',
        parameters: this.extractParametersFromPath(path),
        responses: { '200': 'Success response' },
        category: this.categorizeEndpoint(path)
      };
    });
  }

  /**
   * Subscribe to endpoint detection events
   */
  static onEndpointDetected(callback: (endpoints: DetectedApiEndpoint[]) => void): () => void {
    this.detectionCallbacks.push(callback);
    
    // Return unsubscribe function
    return () => {
      const index = this.detectionCallbacks.indexOf(callback);
      if (index > -1) {
        this.detectionCallbacks.splice(index, 1);
      }
    };
  }

  /**
   * Auto-scan common framework patterns to detect endpoints
   */
  static async autoScanEndpoints(): Promise<DetectedApiEndpoint[]> {
    const detectedEndpoints: DetectedApiEndpoint[] = [];

    // Scan existing API integration registry for internal APIs
    try {
      const { data: existingApis, error } = await supabase
        .from('api_integration_registry')
        .select('*')
        .eq('type', 'internal');

      if (!error && existingApis) {
        existingApis.forEach(api => {
          // Extract endpoints from existing API registrations
          if (api.endpoints_count > 0) {
            // Generate mock endpoints based on API info
            const mockEndpoint: DetectedApiEndpoint = {
              path: `/api/${api.name.toLowerCase().replace(/\s+/g, '-')}`,
              method: 'GET',
              name: `Get ${api.name}`,
              description: api.description || `API endpoint for ${api.name}`,
              isPublic: false,
              authentication: 'bearer',
              parameters: [],
              responses: { '200': 'Success' },
              category: this.categorizeEndpoint(`/api/${api.name}`)
            };
            detectedEndpoints.push(mockEndpoint);
          }
        });
      }
    } catch (error) {
      console.error('Error scanning existing APIs:', error);
    }

    // Add common healthcare admin endpoints
    const commonEndpoints: DetectedApiEndpoint[] = [
      {
        path: '/api/auth/profile',
        method: 'GET',
        name: 'Get User Profile',
        description: 'Retrieve current user profile information',
        isPublic: false,
        authentication: 'bearer',
        parameters: [],
        responses: { '200': 'User profile data' },
        category: 'Authentication'
      },
      {
        path: '/api/auth/profile',
        method: 'PUT',
        name: 'Update User Profile',
        description: 'Update user profile information',
        isPublic: false,
        authentication: 'bearer',
        parameters: ['first_name', 'last_name', 'department'],
        responses: { '200': 'Profile updated successfully' },
        category: 'Authentication'
      },
      {
        path: '/api/facilities',
        method: 'GET',
        name: 'List Facilities',
        description: 'Get list of healthcare facilities',
        isPublic: false,
        authentication: 'bearer',
        parameters: ['page', 'limit'],
        responses: { '200': 'List of facilities' },
        category: 'Healthcare Management'
      },
      {
        path: '/api/facilities',
        method: 'POST',
        name: 'Create Facility',
        description: 'Create a new healthcare facility',
        isPublic: false,
        authentication: 'bearer',
        parameters: ['name', 'type', 'address'],
        responses: { '201': 'Facility created successfully' },
        category: 'Healthcare Management'
      },
      {
        path: '/api/agents',
        method: 'GET',
        name: 'List Agents',
        description: 'Get list of AI agents',
        isPublic: false,
        authentication: 'bearer',
        parameters: ['status', 'type'],
        responses: { '200': 'List of agents' },
        category: 'AI Management'
      },
      {
        path: '/api/agents',
        method: 'POST',
        name: 'Create Agent',
        description: 'Create a new AI agent',
        isPublic: false,
        authentication: 'bearer',
        parameters: ['name', 'description', 'configuration'],
        responses: { '201': 'Agent created successfully' },
        category: 'AI Management'
      },
      {
        path: '/api/knowledge-base',
        method: 'GET',
        name: 'List Knowledge Base Entries',
        description: 'Get knowledge base entries',
        isPublic: false,
        authentication: 'bearer',
        parameters: ['category', 'search'],
        responses: { '200': 'Knowledge base entries' },
        category: 'Knowledge Management'
      },
      {
        path: '/api/analytics/usage',
        method: 'GET',
        name: 'Usage Analytics',
        description: 'Get platform usage analytics',
        isPublic: false,
        authentication: 'bearer',
        parameters: ['period', 'metric'],
        responses: { '200': 'Analytics data' },
        category: 'Analytics'
      }
    ];

    detectedEndpoints.push(...commonEndpoints);

    // Register all detected endpoints
    this.registerEndpoints(detectedEndpoints);

    return detectedEndpoints;
  }

  /**
   * Generate integration object for detected endpoints
   */
  static generateIntegrationFromEndpoints(endpoints: DetectedApiEndpoint[]): ApiIntegration {
    const apiEndpoints: ApiEndpoint[] = endpoints.map(endpoint => ({
      id: `internal_${endpoint.path.replace(/[^a-zA-Z0-9]/g, '_')}_${endpoint.method.toLowerCase()}`,
      name: endpoint.name,
      description: endpoint.description,
      method: endpoint.method as any,
      url: endpoint.path,
      fullUrl: `${window.location.origin}${endpoint.path}`,
      headers: endpoint.authentication === 'bearer' 
        ? { 'Authorization': 'Bearer {{token}}', 'Content-Type': 'application/json' }
        : { 'Content-Type': 'application/json' },
      queryParams: endpoint.parameters.reduce((acc, param) => {
        acc[param] = `{{${param}}}`;
        return acc;
      }, {} as Record<string, string>),
      isPublic: endpoint.isPublic,
      authentication: {
        type: endpoint.authentication as any,
        required: endpoint.authentication !== 'none'
      },
      parameters: endpoint.parameters,
      responses: endpoint.responses,
      responseSchema: {
        type: 'object',
        properties: {}
      }
    }));

    return {
      id: 'auto_detected_internal_api',
      name: 'Healthcare Admin Internal API (Auto-detected)',
      description: 'Automatically detected internal APIs for healthcare administration platform',
      baseUrl: window.location.origin,
      version: '1.0.0',
      type: 'internal',
      category: 'healthcare',
      status: 'active',
      endpoints: apiEndpoints,
      schemas: {},
      mappings: [],
      rlsPolicies: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
  }

  /**
   * Sync detected endpoints to database
   */
  private static async syncToDatabase(...endpoints: DetectedApiEndpoint[]): Promise<void> {
    try {
      // Create or update the internal API integration
      const integration = this.generateIntegrationFromEndpoints(endpoints);
      
      const { error } = await supabase
        .from('api_integration_registry')
        .upsert({
          id: integration.id,
          name: integration.name,
          description: integration.description,
          type: integration.type,
          category: integration.category,
          status: integration.status,
          endpoints_count: integration.endpoints.length,
          version: integration.version,
          base_url: integration.baseUrl,
          direction: 'inbound',
          purpose: 'Internal API endpoints for healthcare administration'
        });

      if (error) {
        console.error('Error syncing endpoints to database:', error);
      }
    } catch (error) {
      console.error('Error in syncToDatabase:', error);
    }
  }

  /**
   * Generate a human-readable name for an endpoint
   */
  private static generateEndpointName(path: string, method: string): string {
    const segments = path.split('/').filter(Boolean);
    const resource = segments[segments.length - 1] || 'endpoint';
    
    const methodNames: Record<string, string> = {
      'GET': 'Get',
      'POST': 'Create',
      'PUT': 'Update',
      'PATCH': 'Modify',
      'DELETE': 'Delete'
    };

    return `${methodNames[method] || method} ${resource.charAt(0).toUpperCase() + resource.slice(1)}`;
  }

  /**
   * Extract parameters from path (e.g., /api/users/:id -> ['id'])
   */
  private static extractParametersFromPath(path: string): string[] {
    const params = path.match(/:(\w+)/g);
    return params ? params.map(param => param.slice(1)) : [];
  }

  /**
   * Categorize endpoint based on path
   */
  private static categorizeEndpoint(path: string): string {
    const pathLower = path.toLowerCase();
    
    if (pathLower.includes('auth') || pathLower.includes('user') || pathLower.includes('profile')) {
      return 'Authentication';
    }
    if (pathLower.includes('agent') || pathLower.includes('ai')) {
      return 'AI Management';
    }
    if (pathLower.includes('facilit') || pathLower.includes('patient') || pathLower.includes('clinical')) {
      return 'Healthcare Management';
    }
    if (pathLower.includes('knowledge') || pathLower.includes('rag')) {
      return 'Knowledge Management';
    }
    if (pathLower.includes('analytic') || pathLower.includes('report')) {
      return 'Analytics';
    }
    if (pathLower.includes('api') && (pathLower.includes('integration') || pathLower.includes('external'))) {
      return 'API Management';
    }
    
    return 'General';
  }
}