
export interface ApiEndpoint {
  id: string;
  name: string;
  method: string;
  url: string;
  description: string;
  isPublic: boolean;
  authentication: {
    type: 'none' | 'bearer' | 'apiKey' | 'basic' | 'oauth2';
    required: boolean;
  };
  parameters: string[];
  responses: Record<string, any>;
  fullUrl?: string;
  responseSchema?: Record<string, any>;
  headers?: Record<string, string>;
  queryParams?: Record<string, any>;
  bodySchema?: Record<string, any>;
}

export interface ApiRlsPolicy {
  table: string;
  policy: string;
  type: string;
  policyName?: string;
  operation?: string;
  tableName?: string;
  condition?: string;
  roles?: string[];
}

export interface ApiDataMapping {
  internal: string;
  external: string;
  type: string;
  sourceField?: string;
  targetField?: string;
  targetTable?: string;
  transformation?: string;
  validation?: string;
}

export interface ApiIntegration {
  id: string;
  name: string;
  description: string; // Make this required consistently
  type: 'internal' | 'external';
  version: string;
  baseUrl?: string; // Make this optional to match the hook data
  status: 'active' | 'inactive' | 'draft' | 'deprecated';
  endpoints: ApiEndpoint[];
  schemas: Record<string, any>;
  rlsPolicies: ApiRlsPolicy[];
  mappings: ApiDataMapping[];
  category?: string;
  direction?: 'inbound' | 'outbound';
  externalDocumentation?: string | {
    swaggerUrl?: string;
    apiReference?: string;
    examples?: string;
  };
  createdAt?: string;
  updatedAt?: string;
  contact?: Record<string, any>;
  sla?: Record<string, any>;
  documentation?: {
    specificationUrl?: string;
    fieldMappings?: any[];
    generatedSchemas?: any[];
    databaseTables?: string[];
    rlsPolicies?: any[];
    endpoints?: any[];
  };
}

// Additional types that were missing
export interface ApiIntegrationRegistry {
  id: string;
  name: string;
  description: string;
  type: string;
  direction: ApiDirection;
  category: string;
  purpose: string;
  lifecycle_stage: string;
  base_url?: string;
  version: string;
  status: string;
  endpoints_count?: number;
  rls_policies_count?: number;
  data_mappings_count?: number;
  contact_info?: Record<string, any>;
  sla_requirements?: Record<string, any>;
  security_requirements?: Record<string, any>;
  rate_limits?: Record<string, any>;
  webhook_config?: Record<string, any>;
  documentation_url?: string;
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
  impact_level: ImpactLevel;
  requires_migration?: boolean;
  migration_instructions?: string;
  metadata?: Record<string, any>;
  created_at: string;
  created_by?: string;
}

export interface ApiConsumptionLog {
  id: string;
  api_integration_id: string;
  consumer_id?: string;
  endpoint_path: string;
  method: string;
  request_timestamp: string;
  response_status?: number;
  response_time_ms?: number;
  request_size_bytes?: number;
  response_size_bytes?: number;
  ip_address?: string;
  user_agent?: string;
  error_details?: Record<string, any>;
}

export type ApiDirection = 'inbound' | 'outbound' | 'bidirectional';

export type ApiEventType = 
  | 'created'
  | 'updated' 
  | 'deprecated'
  | 'decommissioned'
  | 'version_released'
  | 'breaking_change'
  | 'security_update';

export type ImpactLevel = 'low' | 'medium' | 'high' | 'critical';

export type ApiLifecycleStage = 'development' | 'testing' | 'staging' | 'production' | 'deprecated';

export interface PostmanCollection {
  info: {
    name: string;
    description: string;
    schema: string;
    version?: string;
  };
  item: PostmanItem[];
  variable?: PostmanVariable[];
  auth?: any;
}

export interface PostmanItem {
  name: string;
  request: {
    method: string;
    header: PostmanHeader[];
    url: string | PostmanUrl;
    body?: PostmanRequestBody;
  };
  response?: PostmanResponse[];
}

export interface PostmanHeader {
  key: string;
  value: string;
  type?: string;
}

export interface PostmanUrl {
  raw: string;
  protocol?: string;
  host?: string[];
  path?: string[];
  query?: PostmanQuery[];
}

export interface PostmanQuery {
  key: string;
  value: string;
}

export interface PostmanRequestBody {
  mode: string;
  raw?: string;
  options?: {
    raw?: {
      language: string;
    };
  };
}

export interface PostmanResponse {
  name: string;
  status: string;
  code: number;
  header: PostmanHeader[];
  body: string;
}

export interface PostmanVariable {
  key: string;
  value: string;
  type?: string;
}

// Legacy type aliases for backward compatibility
export type DataMapping = ApiDataMapping;
export type RLSPolicy = ApiRlsPolicy;
