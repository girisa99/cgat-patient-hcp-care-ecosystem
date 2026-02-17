/**
 * MCP API Server - External API Integration
 * Provides AI context from external healthcare APIs and services
 */

import { HealthcareMCPServer, MCPServerConfig, MCPTool, MCPResource, MCPPrompt } from './healthcare-server';

export interface APIMCPConfig extends MCPServerConfig {
  apiEndpoints: APIEndpoint[];
  rateLimits: RateLimit;
  authentication: AuthConfig;
  retryPolicy: RetryConfig;
}

export interface APIEndpoint {
  id: string;
  name: string;
  baseUrl: string;
  type: 'healthcare' | 'external' | 'internal';
  authRequired: boolean;
  rateLimit?: number;
}

export interface RateLimit {
  requestsPerMinute: number;
  requestsPerHour: number;
  burstLimit: number;
}

export interface AuthConfig {
  apiKeys: Record<string, string>;
  bearerTokens: Record<string, string>;
  oauthConfigs: Record<string, any>;
}

export interface RetryConfig {
  maxRetries: number;
  backoffMultiplier: number;
  initialDelayMs: number;
}

export class APIMCPServer extends HealthcareMCPServer {
  private apiConfig: APIMCPConfig;
  private requestCounts: Map<string, { count: number; resetTime: number }> = new Map();
  private cache: Map<string, { data: any; timestamp: number; ttl: number }> = new Map();

  constructor(config: APIMCPConfig) {
    super(config);
    this.apiConfig = {
      apiEndpoints: config.apiEndpoints || [],
      rateLimits: config.rateLimits || {
        requestsPerMinute: 60,
        requestsPerHour: 1000,
        burstLimit: 10
      },
      authentication: config.authentication || {
        apiKeys: {},
        bearerTokens: {},
        oauthConfigs: {}
      },
      retryPolicy: config.retryPolicy || {
        maxRetries: 3,
        backoffMultiplier: 2,
        initialDelayMs: 1000
      },
      ...config
    };
  }

  /**
   * Get API resources for AI context
   */
  getAPIResources(): MCPResource[] {
    return [
      {
        uri: "api://healthcare/fhir",
        name: "FHIR Healthcare API",
        description: "Fast Healthcare Interoperability Resources API for clinical data",
        mimeType: "application/fhir+json"
      },
      {
        uri: "api://healthcare/npi-registry",
        name: "NPI Provider Registry API",
        description: "National Provider Identifier registry for healthcare providers",
        mimeType: "application/json"
      },
      {
        uri: "api://healthcare/drug-database",
        name: "Drug Information API",
        description: "Comprehensive drug database with interactions and dosing",
        mimeType: "application/json"
      },
      {
        uri: "api://healthcare/lab-results",
        name: "Laboratory Results API",
        description: "Laboratory test results and reference ranges",
        mimeType: "application/json"
      },
      {
        uri: "api://external/weather",
        name: "Weather Context API",
        description: "Weather data for health condition correlations",
        mimeType: "application/json"
      },
      {
        uri: "api://ai/medical-nlp",
        name: "Medical NLP API",
        description: "Natural language processing for medical text analysis",
        mimeType: "application/json"
      }
    ];
  }

  /**
   * Get API-specific AI prompts
   */
  getAPIPrompts(): MCPPrompt[] {
    return [
      {
        name: "enrich-with-external-data",
        description: "Enrich AI responses with external healthcare API data",
        arguments: [
          {
            name: "data_type",
            description: "Type of external data: provider, drug, lab, weather",
            required: true
          },
          {
            name: "search_params",
            description: "Parameters for API search",
            required: true
          }
        ]
      },
      {
        name: "cross-reference-clinical-data",
        description: "Cross-reference internal data with external clinical databases",
        arguments: [
          {
            name: "internal_data",
            description: "Internal clinical data to cross-reference",
            required: true
          },
          {
            name: "reference_apis",
            description: "APIs to use for cross-referencing",
            required: false
          }
        ]
      },
      {
        name: "real-time-health-alerts",
        description: "Generate real-time health alerts using external monitoring APIs",
        arguments: [
          {
            name: "patient_id",
            description: "Patient identifier",
            required: true
          },
          {
            name: "alert_types",
            description: "Types of alerts to monitor",
            required: false
          }
        ]
      }
    ];
  }

  /**
   * Get API tools for external integrations
   */
  getAPITools(): MCPTool[] {
    return [
      {
        name: "call-healthcare-api",
        description: "Make authenticated calls to healthcare APIs with rate limiting",
        inputSchema: {
          type: "object",
          properties: {
            api_id: {
              type: "string",
              description: "API endpoint identifier"
            },
            endpoint: {
              type: "string", 
              description: "Specific API endpoint path"
            },
            method: {
              type: "string",
              enum: ["GET", "POST", "PUT", "DELETE"],
              description: "HTTP method"
            },
            params: {
              type: "object",
              description: "Query parameters or request body"
            },
            headers: {
              type: "object",
              description: "Additional headers"
            },
            cache_ttl: {
              type: "number",
              description: "Cache time-to-live in seconds",
              default: 300
            }
          },
          required: ["api_id", "endpoint", "method"]
        }
      },
      {
        name: "batch-api-calls",
        description: "Execute multiple API calls efficiently with parallel processing",
        inputSchema: {
          type: "object",
          properties: {
            calls: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  api_id: { type: "string" },
                  endpoint: { type: "string" },
                  method: { type: "string" },
                  params: { type: "object" }
                }
              },
              description: "Array of API calls to execute"
            },
            max_concurrent: {
              type: "number",
              description: "Maximum concurrent requests",
              default: 5
            },
            fail_fast: {
              type: "boolean",
              description: "Stop on first failure",
              default: false
            }
          },
          required: ["calls"]
        }
      },
      {
        name: "api-health-check",
        description: "Check health and availability of configured API endpoints",
        inputSchema: {
          type: "object",
          properties: {
            api_ids: {
              type: "array",
              items: { type: "string" },
              description: "Specific APIs to check (empty = all)"
            },
            include_response_time: {
              type: "boolean",
              description: "Include response time metrics",
              default: true
            }
          }
        }
      },
      {
        name: "smart-data-aggregation",
        description: "Intelligently aggregate data from multiple healthcare APIs",
        inputSchema: {
          type: "object",
          properties: {
            query: {
              type: "string",
              description: "Natural language query for data aggregation"
            },
            data_sources: {
              type: "array",
              items: { type: "string" },
              description: "API sources to include in aggregation"
            },
            aggregation_strategy: {
              type: "string",
              enum: ["comprehensive", "prioritized", "fastest", "most_recent"],
              description: "Strategy for data aggregation"
            },
            max_response_time: {
              type: "number",
              description: "Maximum acceptable response time in ms",
              default: 5000
            }
          },
          required: ["query"]
        }
      }
    ];
  }

  /**
   * Execute API tools with proper rate limiting and authentication
   */
  async executeAPITool(toolName: string, args: any): Promise<any> {
    console.log(`🌐 Executing API tool: ${toolName}`);

    try {
      switch (toolName) {
        case "call-healthcare-api":
          return await this.callHealthcareAPI(args);
          
        case "batch-api-calls":
          return await this.executeBatchAPIcalls(args);
          
        case "api-health-check":
          return await this.performAPIHealthCheck(args);
          
        case "smart-data-aggregation":
          return await this.performSmartDataAggregation(args);
          
        default:
          // Fallback to parent healthcare tools
          return await this.executeTool(toolName, args);
      }
    } catch (error) {
      console.error(`API tool execution failed: ${error}`);
      throw error;
    }
  }

  /**
   * Make authenticated API call with rate limiting
   */
  private async callHealthcareAPI(args: any) {
    const apiEndpoint = this.apiConfig.apiEndpoints.find(ep => ep.id === args.api_id);
    if (!apiEndpoint) {
      throw new Error(`API endpoint not found: ${args.api_id}`);
    }

    // Check rate limits
    if (!this.checkRateLimit(args.api_id)) {
      throw new Error(`Rate limit exceeded for API: ${args.api_id}`);
    }

    // Check cache first
    const cacheKey = `${args.api_id}_${args.endpoint}_${JSON.stringify(args.params)}`;
    if (this.cache.has(cacheKey)) {
      const cached = this.cache.get(cacheKey)!;
      if (Date.now() - cached.timestamp < cached.ttl * 1000) {
        console.log("🚀 Returning cached API response");
        return { ...cached.data, source: "cache" };
      }
    }

    // Prepare request
    const url = `${apiEndpoint.baseUrl}${args.endpoint}`;
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...args.headers
    };

    // Add authentication
    if (apiEndpoint.authRequired) {
      const apiKey = this.apiConfig.authentication.apiKeys[args.api_id];
      const bearerToken = this.apiConfig.authentication.bearerTokens[args.api_id];
      
      if (apiKey) {
        headers['X-API-Key'] = apiKey;
      } else if (bearerToken) {
        headers['Authorization'] = `Bearer ${bearerToken}`;
      }
    }

    // Make request with retry logic
    const response = await this.makeRequestWithRetry(url, {
      method: args.method,
      headers,
      body: args.method !== 'GET' ? JSON.stringify(args.params) : undefined
    });

    const result = {
      tool: "call-healthcare-api",
      api_id: args.api_id,
      endpoint: args.endpoint,
      status: response.status,
      data: response.data,
      response_time_ms: response.responseTime,
      timestamp: new Date().toISOString(),
      source: "api"
    };

    // Cache the result
    const ttl = args.cache_ttl || 300;
    this.cache.set(cacheKey, { 
      data: result, 
      timestamp: Date.now(), 
      ttl 
    });

    // Update rate limit counter
    this.updateRateLimit(args.api_id);

    return result;
  }

  /**
   * Execute multiple API calls in batch
   */
  private async executeBatchAPIcalls(args: any) {
    const results: any[] = [];
    const errors: any[] = [];
    
    // Process calls in batches to respect concurrency limits
    const batchSize = args.max_concurrent || 5;
    
    for (let i = 0; i < args.calls.length; i += batchSize) {
      const batch = args.calls.slice(i, i + batchSize);
      
      const batchPromises = batch.map(async (call: any) => {
        try {
          const result = await this.callHealthcareAPI(call);
          return { success: true, data: result };
        } catch (error) {
          const errorResult = { 
            success: false, 
            error: error instanceof Error ? error.message : 'Unknown error',
            call: call
          };
          
          if (args.fail_fast) {
            throw errorResult;
          }
          
          return errorResult;
        }
      });

      const batchResults = await Promise.all(batchPromises);
      
      batchResults.forEach(result => {
        if (result.success) {
          results.push(result.data);
        } else {
          errors.push(result);
        }
      });
    }

    return {
      tool: "batch-api-calls",
      total_calls: args.calls.length,
      successful_calls: results.length,
      failed_calls: errors.length,
      results: results,
      errors: errors,
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Perform health check on API endpoints
   */
  private async performAPIHealthCheck(args: any) {
    const apisToCheck = args.api_ids && args.api_ids.length > 0 
      ? this.apiConfig.apiEndpoints.filter(ep => args.api_ids.includes(ep.id))
      : this.apiConfig.apiEndpoints;

    const healthResults = [];

    for (const api of apisToCheck) {
      const startTime = Date.now();
      let status = 'unknown';
      let responseTime = 0;
      let error = null;

      try {
        // Simple health check endpoint (usually /health or root)
        const healthUrl = `${api.baseUrl}/health`;
        const response = await fetch(healthUrl, { 
          method: 'GET',
          signal: AbortSignal.timeout(5000) // 5 second timeout
        });
        
        responseTime = Date.now() - startTime;
        status = response.ok ? 'healthy' : 'unhealthy';
      } catch (e) {
        responseTime = Date.now() - startTime;
        status = 'unreachable';
        error = e instanceof Error ? e.message : 'Unknown error';
      }

      healthResults.push({
        api_id: api.id,
        name: api.name,
        status,
        response_time_ms: args.include_response_time ? responseTime : undefined,
        error,
        last_checked: new Date().toISOString()
      });
    }

    return {
      tool: "api-health-check",
      total_apis: apisToCheck.length,
      healthy_apis: healthResults.filter(r => r.status === 'healthy').length,
      results: healthResults,
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Perform smart data aggregation from multiple APIs
   */
  private async performSmartDataAggregation(args: any) {
    const startTime = Date.now();
    const aggregatedData: any[] = [];
    const metadata = {
      sources_queried: 0,
      sources_successful: 0,
      sources_failed: 0,
      total_records: 0
    };

    // Determine which APIs to query based on the query content
    const relevantAPIs = this.selectRelevantAPIs(args.query, args.data_sources);
    
    for (const apiId of relevantAPIs) {
      if (Date.now() - startTime > args.max_response_time) {
        console.log(`⏰ Timeout reached, stopping aggregation`);
        break;
      }

      metadata.sources_queried++;

      try {
        // Generate API-specific query parameters
        const apiParams = this.generateAPIParams(args.query, apiId);
        
        const result = await this.callHealthcareAPI({
          api_id: apiId,
          endpoint: this.getDefaultEndpoint(apiId),
          method: 'GET',
          params: apiParams,
          cache_ttl: 60 // Short cache for aggregation
        });

        if (result.data) {
          aggregatedData.push({
            source: apiId,
            data: result.data,
            response_time: result.response_time_ms
          });
          metadata.sources_successful++;
          metadata.total_records += Array.isArray(result.data) ? result.data.length : 1;
        }
      } catch (error) {
        metadata.sources_failed++;
        console.error(`Failed to query ${apiId}:`, error);
      }
    }

    // Apply aggregation strategy
    const processedData = this.applyAggregationStrategy(
      aggregatedData, 
      args.aggregation_strategy || 'comprehensive'
    );

    return {
      tool: "smart-data-aggregation",
      query: args.query,
      strategy: args.aggregation_strategy || 'comprehensive',
      metadata,
      aggregated_data: processedData,
      response_time_ms: Date.now() - startTime,
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Helper methods
   */
  private checkRateLimit(apiId: string): boolean {
    const now = Date.now();
    const key = `${apiId}_minute`;
    
    if (!this.requestCounts.has(key)) {
      this.requestCounts.set(key, { count: 0, resetTime: now + 60000 });
      return true;
    }

    const counter = this.requestCounts.get(key)!;
    
    if (now > counter.resetTime) {
      counter.count = 0;
      counter.resetTime = now + 60000;
    }

    return counter.count < this.apiConfig.rateLimits.requestsPerMinute;
  }

  private updateRateLimit(apiId: string): void {
    const key = `${apiId}_minute`;
    const counter = this.requestCounts.get(key);
    if (counter) {
      counter.count++;
    }
  }

  private async makeRequestWithRetry(url: string, options: any): Promise<any> {
    let lastError;
    
    for (let attempt = 0; attempt <= this.apiConfig.retryPolicy.maxRetries; attempt++) {
      try {
        const startTime = Date.now();
        const response = await fetch(url, options);
        const responseTime = Date.now() - startTime;
        
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        const data = await response.json();
        return { status: response.status, data, responseTime };
        
      } catch (error) {
        lastError = error;
        
        if (attempt < this.apiConfig.retryPolicy.maxRetries) {
          const delay = this.apiConfig.retryPolicy.initialDelayMs * 
                        Math.pow(this.apiConfig.retryPolicy.backoffMultiplier, attempt);
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
    }
    
    throw lastError;
  }

  private selectRelevantAPIs(query: string, dataSources?: string[]): string[] {
    if (dataSources && dataSources.length > 0) {
      return dataSources.filter(source => 
        this.apiConfig.apiEndpoints.some(ep => ep.id === source)
      );
    }

    // Use keyword matching to select relevant APIs
    const queryLower = query.toLowerCase();
    return this.apiConfig.apiEndpoints
      .filter(api => {
        const keywords = [api.name.toLowerCase(), api.type];
        return keywords.some(keyword => queryLower.includes(keyword));
      })
      .map(api => api.id);
  }

  private generateAPIParams(query: string, apiId: string): any {
    // Simple parameter generation based on API type
    const api = this.apiConfig.apiEndpoints.find(ep => ep.id === apiId);
    if (!api) return {};

    const baseParams: any = { q: query, limit: 10 };

    switch (api.type) {
      case 'healthcare':
        return { ...baseParams, category: 'clinical' };
      case 'external':
        return { ...baseParams, format: 'json' };
      default:
        return baseParams;
    }
  }

  private getDefaultEndpoint(apiId: string): string {
    const api = this.apiConfig.apiEndpoints.find(ep => ep.id === apiId);
    return api?.type === 'healthcare' ? '/search' : '/api/v1/search';
  }

  private applyAggregationStrategy(data: any[], strategy: string): any {
    switch (strategy) {
      case 'prioritized':
        return data.sort((a, b) => a.response_time - b.response_time);
      case 'fastest':
        return data.slice(0, 1); // Only fastest response
      case 'most_recent':
        return data.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
      case 'comprehensive':
      default:
        return data; // Return all data
    }
  }

  /**
   * Get comprehensive server info
   */
  getAPIServerInfo() {
    const baseInfo = this.getServerInfo();
    return {
      ...baseInfo,
      api_integration: {
        total_endpoints: this.apiConfig.apiEndpoints.length,
        healthcare_apis: this.apiConfig.apiEndpoints.filter(ep => ep.type === 'healthcare').length,
        external_apis: this.apiConfig.apiEndpoints.filter(ep => ep.type === 'external').length,
        rate_limits: this.apiConfig.rateLimits,
        cache_size: this.cache.size,
        active_requests: this.requestCounts.size
      },
      additional_resources: this.getAPIResources().length,
      additional_prompts: this.getAPIPrompts().length, 
      additional_tools: this.getAPITools().length
    };
  }
}

// Factory function
export const createAPIMCPServer = (config: APIMCPConfig): APIMCPServer => {
  return new APIMCPServer(config);
};

// Default API server with healthcare endpoints
export const defaultAPIServer = createAPIMCPServer({
  name: "healthcare-api-mcp-server",
  version: "1.0.0",
  description: "External API integration MCP server for healthcare data enrichment",
  apiEndpoints: [
    {
      id: "fhir-api",
      name: "FHIR Healthcare API",
      baseUrl: "https://hapi.fhir.org/baseR4",
      type: "healthcare",
      authRequired: false
    },
    {
      id: "npi-registry",
      name: "NPI Provider Registry",
      baseUrl: "https://npiregistry.cms.hhs.gov/api",
      type: "healthcare", 
      authRequired: false
    },
    {
      id: "drug-database",
      name: "OpenFDA Drug Database",
      baseUrl: "https://api.fda.gov/drug",
      type: "healthcare",
      authRequired: false
    }
  ],
  rateLimits: {
    requestsPerMinute: 60,
    requestsPerHour: 1000,
    burstLimit: 10
  },
  authentication: {
    apiKeys: {},
    bearerTokens: {},
    oauthConfigs: {}
  },
  retryPolicy: {
    maxRetries: 3,
    backoffMultiplier: 2,
    initialDelayMs: 1000
  },
  capabilities: ["api-integration", "rate-limiting", "caching", "batch-processing", "health-monitoring"]
});