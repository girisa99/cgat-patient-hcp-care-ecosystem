
/**
 * API Integration Type Definitions
 */

// Authentication types
export type ApiAuthType = 'none' | 'bearer' | 'apiKey' | 'oauth2' | 'basic';

export interface ApiAuthentication {
  type: ApiAuthType;
  required: boolean;
}

// Schema types
export interface ApiBodySchema {
  type: string;
  properties: Record<string, any>;
}

export interface ApiResponseSchema {
  type: string;
  properties?: Record<string, any>;
}

// Endpoint definition
export interface ApiEndpoint {
  id: string;
  name: string;
  description: string;
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  url: string;
  fullUrl?: string;
  headers?: Record<string, string>;
  queryParams?: Record<string, string>;
  isPublic: boolean;
  authentication: ApiAuthentication;
  parameters: string[];
  responses: Record<string, string>;
  responseSchema: ApiResponseSchema;
  bodySchema?: ApiBodySchema;
}

// RLS Policy
export interface ApiRlsPolicy {
  id: string;
  table: string;
  policy: string;
  description: string;
}

// Data mapping
export interface ApiDataMapping {
  id: string;
  sourceField: string;
  targetField: string;
  transformation?: string;
}

// Main integration type
export interface ApiIntegration {
  id: string;
  name: string;
  description: string;
  baseUrl: string;
  version: string;
  type: 'internal' | 'external';
  category: string;
  status: 'active' | 'inactive' | 'draft' | 'deprecated';
  endpoints: ApiEndpoint[];
  schemas: Record<string, any>;
  mappings: ApiDataMapping[];
  rlsPolicies: ApiRlsPolicy[];
  contact?: {
    name: string;
    email: string;
    team?: string;
  };
  sla?: {
    uptime: string;
    responseTime: string;
    support: string;
  };
  externalDocumentation?: string;
  createdAt: string;
  updatedAt: string;
}

// Postman collection types
export interface PostmanAuth {
  type: 'basic' | 'bearer' | 'oauth2' | 'apikey' | 'noauth';
  bearer?: Array<{ key: string; value: string; type: string }>;
  apikey?: Array<{ key: string; value: string; type: string }>;
}

export interface PostmanQuery {
  key: string;
  value: string;
}

export interface PostmanUrl {
  raw: string;
  host: string[];
  path: string[];
  query?: PostmanQuery[];
}

export interface PostmanItem {
  name: string;
  request: {
    method: string;
    header: Array<{ key: string; value: string; type: string }>;
    url: PostmanUrl;
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

export interface PostmanCollection {
  info: {
    name: string;
    description: string;
    version: string;
    schema: string;
  };
  item: PostmanItem[];
  variable: Array<{ key: string; value: string; type: string }>;
  auth?: PostmanAuth;
}

// Query parameter for testing
export interface ApiQueryParam {
  name: string;
  value: string;
  type: 'string' | 'number' | 'boolean';
  required: boolean;
  description?: string;
}
