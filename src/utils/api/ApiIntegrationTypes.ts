
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
}

export interface ApiIntegration {
  id: string;
  name: string;
  description: string;
  type: 'internal' | 'external';
  version: string;
  baseUrl: string;
  status: 'active' | 'inactive' | 'draft' | 'deprecated';
  endpoints: ApiEndpoint[];
  schemas: Record<string, any>;
  rlsPolicies: Array<{
    table: string;
    policy: string;
    type: string;
  }>;
  mappings: Array<{
    internal: string;
    external: string;
    type: string;
  }>;
}
