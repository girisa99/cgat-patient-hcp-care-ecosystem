
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

export interface PostmanCollection {
  info: {
    name: string;
    description: string;
    version: string;
    schema: string;
  };
  item: PostmanItem[];
  variable?: Array<{
    key: string;
    value: string;
    type: string;
  }>;
  auth?: {
    type: string;
    bearer?: Array<{
      key: string;
      value: string;
      type: string;
    }>;
    apikey?: Array<{
      key: string;
      value: string;
      type: string;
    }>;
  };
}

export interface PostmanItem {
  name: string;
  request: {
    method: string;
    header: Array<{
      key: string;
      value: string;
      type: string;
    }>;
    url: {
      raw: string;
      host: string[];
      path: string[];
      query?: Array<{
        key: string;
        value: string;
      }>;
    };
    body?: {
      mode: string;
      raw: string;
      options?: {
        raw: {
          language: string;
        };
      };
    };
  };
  response: any[];
}
