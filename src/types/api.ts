export interface ApiEndpoint {
  id: string;
  path: string;
  method: string;
  description?: string;
}

export interface ApiSummary {
  id: string;
  name: string;
  external_name?: string;
  description?: string;
  external_description?: string;
  status?: 'draft' | 'review' | 'published' | 'deprecated';
  version?: string;
  endpoints?: ApiEndpoint[];
  published_at?: string;
  // Regular columns for better performance
  contact_email?: string;
  contact_phone?: string;
  contact_name?: string;
  rate_limit_requests_per_hour?: number;
  rate_limit_requests_per_minute?: number;
  requires_approval?: boolean;
  requires_authentication?: boolean;
  webhook_url?: string;
  sla_response_time_ms?: number;
  sla_uptime_percentage?: number;
  // Catch-all for future, still typed — better than any
  [key: string]: unknown;
}

export interface ApiDiff {
  recommended: ApiSummary;
  deprecated: ApiSummary[];
  differences: {
    endpoints: {
      deprecated: number[];
    };
  };
  validationResults?: {
    safeToRemove: boolean;
    missingData?: string[];
  };
}

export interface ConsolidationOutcome {
  apisRemoved: number;
  endpointsMigrated: number;
  errors: string[];
  message?: string;
}