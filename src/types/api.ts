// API Response Types
export interface ApiResponse<T = unknown> {
  data: T;
  success: boolean;
  message?: string;
  error?: string;
}

export interface PaginatedResponse<T = unknown> {
  data: T[];
  count: number;
  page: number;
  limit: number;
  totalPages: number;
}

// Error Types
export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, unknown>;
}

// HTTP Method Types
export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

// Request Configuration
export interface ApiRequest {
  method: HttpMethod;
  url: string;
  headers?: Record<string, string>;
  params?: Record<string, unknown>;
  body?: Record<string, unknown>;
}

// API Integration Types
export interface ApiIntegration {
  id: string;
  name: string;
  description?: string;
  baseUrl: string;
  version: string;
  status: 'active' | 'inactive' | 'deprecated';
  authentication?: ApiAuthentication;
  endpoints: ApiEndpoint[];
  documentation?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ApiAuthentication {
  type: 'bearer' | 'apiKey' | 'basic' | 'oauth2';
  credentials: Record<string, string>;
}

export interface ApiEndpoint {
  id: string;
  path: string;
  method: HttpMethod;
  description?: string;
  parameters?: ApiParameter[];
  requestSchema?: Record<string, unknown>;
  responseSchema?: Record<string, unknown>;
  examples?: ApiExample[];
}

export interface ApiParameter {
  name: string;
  type: 'string' | 'number' | 'boolean' | 'object' | 'array';
  required: boolean;
  description?: string;
  example?: unknown;
}

export interface ApiExample {
  name: string;
  description?: string;
  request?: Record<string, unknown>;
  response?: Record<string, unknown>;
}

// API Testing Types
export interface ApiTestCase {
  id: string;
  name: string;
  endpoint: string;
  method: HttpMethod;
  request: Record<string, unknown>;
  expectedResponse: Record<string, unknown>;
  status: 'pending' | 'running' | 'passed' | 'failed';
  lastRun?: string;
  duration?: number;
}

export interface ApiTestSuite {
  id: string;
  name: string;
  description?: string;
  testCases: ApiTestCase[];
  status: 'pending' | 'running' | 'completed' | 'failed';
  results?: ApiTestResults;
}

export interface ApiTestResults {
  total: number;
  passed: number;
  failed: number;
  duration: number;
  startTime: string;
  endTime: string;
  details: ApiTestCase[];
}

// External API Types
export interface ExternalApi {
  id: string;
  name: string;
  provider: string;
  category: string;
  baseUrl: string;
  documentation: string;
  authentication: ApiAuthentication;
  rateLimits?: RateLimit;
  pricing?: ApiPricing;
  status: 'active' | 'inactive' | 'maintenance';
}

export interface RateLimit {
  requests: number;
  period: 'second' | 'minute' | 'hour' | 'day';
  burst?: number;
}

export interface ApiPricing {
  model: 'free' | 'subscription' | 'pay-per-use';
  cost?: number;
  currency?: string;
  limits?: Record<string, number>;
}

// API Consumption Analytics
export interface ApiConsumptionMetrics {
  apiId: string;
  period: string;
  totalRequests: number;
  successfulRequests: number;
  failedRequests: number;
  averageResponseTime: number;
  errorRate: number;
  topEndpoints: EndpointMetric[];
  timeSeriesData: TimeSeriesPoint[];
}

export interface EndpointMetric {
  endpoint: string;
  requests: number;
  averageResponseTime: number;
  errorRate: number;
}

export interface TimeSeriesPoint {
  timestamp: string;
  requests: number;
  errors: number;
  averageResponseTime: number;
}

// API Keys and Security
export interface ApiKey {
  id: string;
  name: string;
  key: string;
  permissions: string[];
  expiresAt?: string;
  lastUsed?: string;
  isActive: boolean;
  createdBy: string;
  createdAt: string;
}

export interface ApiPermission {
  id: string;
  name: string;
  description: string;
  resource: string;
  actions: string[];
}