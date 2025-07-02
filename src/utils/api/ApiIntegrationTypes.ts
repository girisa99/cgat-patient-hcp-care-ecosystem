// Base response schema types
export interface ApiResponseSchema {
  type: 'object' | 'array' | 'string' | 'number' | 'boolean' | 'null';
  properties?: Record<string, ApiPropertySchema>;
  items?: ApiPropertySchema;
  required?: string[];
  example?: unknown;
}

export interface ApiPropertySchema {
  type: string;
  description?: string;
  format?: string;
  example?: unknown;
  enum?: string[];
  properties?: Record<string, ApiPropertySchema>;
  items?: ApiPropertySchema;
}

// Request/Response body schemas
export interface ApiBodySchema {
  type: string;
  properties: Record<string, ApiPropertySchema>;
  required?: string[];
  additionalProperties?: boolean;
}

// Query parameters types
export interface ApiQueryParam {
  name: string;
  type: 'string' | 'number' | 'boolean' | 'array';
  required?: boolean;
  description?: string;
  default?: string | number | boolean;
}

// Contact information
export interface ApiContactInfo {
  name?: string;
  email?: string;
  url?: string;
  phone?: string;
  team?: string;
  department?: string;
}

// SLA requirements
export interface ApiSlaRequirements {
  availability?: number; // percentage
  responseTime?: number; // milliseconds
  throughput?: number; // requests per second
  errorRate?: number; // percentage
  maintenanceWindow?: string;
  supportLevel?: 'basic' | 'standard' | 'premium' | 'enterprise';
}

// Security requirements
export interface ApiSecurityRequirements {
  authentication?: string[];
  authorization?: string[];
  encryption?: 'none' | 'tls' | 'end-to-end';
  dataClassification?: 'public' | 'internal' | 'confidential' | 'restricted';
  auditLogging?: boolean;
  compliance?: string[];
}

// Rate limiting configuration
export interface ApiRateLimits {
  requestsPerMinute?: number;
  requestsPerHour?: number;
  requestsPerDay?: number;
  burstLimit?: number;
  concurrentConnections?: number;
}

// Webhook configuration
export interface ApiWebhookConfig {
  url: string;
  events: string[];
  secret?: string;
  retryPolicy?: {
    maxRetries: number;
    backoffStrategy: 'linear' | 'exponential';
    initialDelay: number;
  };
  timeout?: number;
}

// Documentation metadata
export interface ApiDocumentationMetadata {
  fieldMappings?: ApiFieldMapping[];
  generatedSchemas?: ApiResponseSchema[];
  databaseTables?: string[];
  rlsPolicies?: ApiRlsPolicy[];
  endpoints?: ApiEndpoint[];
}

export interface ApiFieldMapping {
  sourceField: string;
  targetField: string;
  transformation?: string;
  validation?: string;
  required: boolean;
}

// Error details for consumption logs
export interface ApiErrorDetails {
  code: string;
  message: string;
  details?: Record<string, unknown>;
  stack?: string;
  timestamp: string;
}

// Event metadata
export interface ApiEventMetadata {
  changeDescription?: string;
  affectedEndpoints?: string[];
  migrationRequired?: boolean;
  rollbackPlan?: string;
  communicationPlan?: string;
  [key: string]: unknown;
}

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
  responses: Record<string, ApiResponseSchema>;
  fullUrl?: string;
  responseSchema?: ApiResponseSchema;
  headers?: Record<string, string>;
  queryParams?: Record<string, ApiQueryParam>;
  bodySchema?: ApiBodySchema;
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
  schemas: Record<string, ApiResponseSchema>;
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
  contact?: ApiContactInfo;
  sla?: ApiSlaRequirements;
  documentation?: {
    specificationUrl?: string;
    fieldMappings?: ApiFieldMapping[];
    generatedSchemas?: ApiResponseSchema[];
    databaseTables?: string[];
    rlsPolicies?: ApiRlsPolicy[];
    endpoints?: ApiEndpoint[];
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
  contact_info?: ApiContactInfo;
  sla_requirements?: ApiSlaRequirements;
  security_requirements?: ApiSecurityRequirements;
  rate_limits?: ApiRateLimits;
  webhook_config?: ApiWebhookConfig;
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
  metadata?: ApiEventMetadata;
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
  error_details?: ApiErrorDetails;
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

// Postman types with proper typing
export interface PostmanAuth {
  type: 'bearer' | 'basic' | 'apikey' | 'oauth2' | 'noauth';
  bearer?: { token: string }[];
  basic?: { username: string; password: string }[];
  apikey?: { key: string; value: string; in: 'header' | 'query' }[];
}

export interface PostmanCollection {
  info: {
    name: string;
    description: string;
    schema: string;
    version?: string;
  };
  item: PostmanItem[];
  variable?: PostmanVariable[];
  auth?: PostmanAuth;
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
