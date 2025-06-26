
/**
 * Enhanced API Integration Types
 * Supports comprehensive API classification and lifecycle management
 */

export type ApiDirection = 'inbound' | 'outbound' | 'bidirectional';
export type ApiType = 'internal' | 'external';
export type ApiPurpose = 'consuming' | 'publishing' | 'hybrid';
export type ApiCategory = 'healthcare' | 'auth' | 'data' | 'integration' | 'utility';
export type ApiStatus = 'active' | 'inactive' | 'deprecated' | 'maintenance';
export type ApiLifecycleStage = 'development' | 'staging' | 'production' | 'deprecated';
export type ApiEventType = 'created' | 'updated' | 'deprecated' | 'activated' | 'deactivated' | 'version_released' | 'breaking_change';
export type ImpactLevel = 'low' | 'medium' | 'high' | 'critical';

export interface ApiAuthentication {
  type: 'none' | 'apiKey' | 'bearer' | 'basic' | 'oauth2';
  location?: 'header' | 'query' | 'body';
  name?: string;
  value?: string;
}

export interface ApiEndpoint {
  id: string;
  name: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  url: string;
  fullUrl?: string;
  description: string;
  headers: Record<string, string>;
  isPublic: boolean;
  authentication?: ApiAuthentication;
  queryParams?: Record<string, any>;
  bodySchema?: Record<string, any>;
  responseSchema?: Record<string, any>;
  documentation?: string;
  responses?: Record<string, any>;
}

export interface ApiIntegrationRegistry {
  id: string;
  name: string;
  description?: string;
  direction: ApiDirection;
  type: ApiType;
  purpose: ApiPurpose;
  category: ApiCategory;
  base_url?: string;
  version: string;
  status: ApiStatus;
  lifecycle_stage: ApiLifecycleStage;
  endpoints_count: number;
  rls_policies_count: number;
  data_mappings_count: number;
  documentation_url?: string;
  contact_info: Record<string, any>;
  sla_requirements: Record<string, any>;
  security_requirements: Record<string, any>;
  rate_limits: Record<string, any>;
  webhook_config: Record<string, any>;
  created_at: string;
  updated_at: string;
  created_by?: string;
  last_modified_by?: string;
}

export interface ApiLifecycleEvent {
  id: string;
  api_integration_id: string;
  event_type: ApiEventType;
  from_stage?: string;
  to_stage?: string;
  description: string;
  metadata: Record<string, any>;
  impact_level: ImpactLevel;
  requires_migration: boolean;
  migration_instructions?: string;
  created_at: string;
  created_by?: string;
}

export interface ApiConsumptionLog {
  id: string;
  api_integration_id: string;
  endpoint_path: string;
  method: string;
  consumer_id?: string;
  request_timestamp: string;
  response_status?: number;
  response_time_ms?: number;
  request_size_bytes?: number;
  response_size_bytes?: number;
  error_details?: Record<string, any>;
  ip_address?: string;
  user_agent?: string;
}

// Data mapping interfaces
export interface DataMapping {
  id?: string;
  sourceField: string;
  targetField: string;
  targetTable: string;
  transformation?: string;
  validation?: string;
  isRequired?: boolean;
  dataType?: string;
}

// RLS Policy interfaces
export interface RLSPolicy {
  id?: string;
  policyName: string;
  tableName: string;
  operation: 'SELECT' | 'INSERT' | 'UPDATE' | 'DELETE' | 'ALL';
  condition: string;
  roles: string[];
  isEnabled?: boolean;
  description?: string;
}

// Postman collection interfaces
export interface PostmanItem {
  name: string;
  request: {
    method: string;
    header: Array<{
      key: string;
      value: string;
      type?: string;
    }>;
    url: {
      raw: string;
      host?: string[];
      path?: string[];
      query?: Array<{
        key: string;
        value: string;
      }>;
    };
    body?: {
      mode: string;
      raw?: string;
      options?: {
        raw?: {
          language: string;
        };
      };
    };
  };
  response?: any[];
}

export interface PostmanCollection {
  info: {
    name: string;
    description?: string;
    schema: string;
    version?: string;
  };
  item: PostmanItem[];
  variable?: Array<{
    key: string;
    value: string;
    type?: string;
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

// Legacy interface for backward compatibility
export interface ApiIntegration {
  id: string;
  name: string;
  description: string;
  type: ApiType;
  baseUrl: string;
  version: string;
  category: ApiCategory;
  status: ApiStatus;
  endpoints: ApiEndpoint[];
  schemas: Record<string, any>;
  mappings: DataMapping[];
  rlsPolicies: RLSPolicy[];
  createdAt?: string;
  updatedAt?: string;
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
  externalDocumentation?: {
    swaggerUrl: string;
    apiReference: string;
    examples: string;
  };
}

export interface ApiIntegrationStats {
  totalIntegrations: number;
  internalApis: number;
  externalApis: number;
  totalEndpoints: number;
  totalPolicies: number;
  totalMappings: number;
  byCategory: Record<ApiCategory, number>;
  byStatus: Record<ApiStatus, number>;
  byDirection: Record<ApiDirection, number>;
  byLifecycleStage: Record<ApiLifecycleStage, number>;
}

export interface ApiChangeTracking {
  id: string;
  type: string;
  api_name: string;
  direction: ApiDirection;
  lifecycle_stage: ApiLifecycleStage;
  impact_assessment: Record<string, any>;
  migration_notes?: string;
  detected_at: string;
  created_at: string;
}
