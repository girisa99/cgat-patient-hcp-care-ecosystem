
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

export interface ApiEndpoint {
  id: string;
  name: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  url: string;
  fullUrl?: string;
  description: string;
  headers: Record<string, string>;
  isPublic: boolean;
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
  mappings: any[];
  rlsPolicies: any[];
  createdAt?: string;
  updatedAt?: string;
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
