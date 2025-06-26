
/**
 * Enhanced API Integration Types with Internal/External Classification
 */

export interface ApiEndpoint {
  id: string;
  name: string;
  description: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  url: string;
  fullUrl?: string; // Complete URL for external sharing
  headers: Record<string, string>;
  queryParams?: Record<string, string>;
  bodySchema?: any;
  responseSchema?: any;
  authentication?: {
    type: 'bearer' | 'api-key' | 'oauth' | 'basic' | 'none';
    credentials: Record<string, string>;
  };
  rateLimit?: {
    requests: number;
    period: string;
  };
  retryConfig?: {
    attempts: number;
    backoff: 'linear' | 'exponential';
  };
  isPublic: boolean; // Whether this endpoint is publicly accessible
  documentation?: string; // Additional documentation for external sharing
}

export interface ApiIntegration {
  id: string;
  name: string;
  description: string;
  baseUrl: string;
  version: string;
  type: 'internal' | 'external'; // Key classification
  category: 'healthcare' | 'auth' | 'data' | 'integration' | 'utility';
  status: 'active' | 'inactive' | 'deprecated';
  endpoints: ApiEndpoint[];
  schemas: Record<string, any>;
  mappings: DataMapping[];
  rlsPolicies: RLSPolicy[];
  webhooks?: WebhookConfig[];
  externalDocumentation?: {
    swaggerUrl?: string;
    postmanCollection?: string;
    apiReference?: string;
    examples?: string;
  };
  contact?: {
    name: string;
    email: string;
    team: string;
  };
  sla?: {
    uptime: string;
    responseTime: string;
    support: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface DataMapping {
  sourceField: string;
  targetField: string;
  targetTable: string;
  transformation?: string;
  validation?: string;
}

export interface RLSPolicy {
  tableName: string;
  policyName: string;
  operation: 'SELECT' | 'INSERT' | 'UPDATE' | 'DELETE';
  condition: string;
  roles: string[];
}

export interface WebhookConfig {
  url: string;
  events: string[];
  secret: string;
  retryAttempts: number;
}
