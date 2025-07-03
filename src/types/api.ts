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
  // Catch-all for future, still typed — better than any
  [key: string]: unknown;
}