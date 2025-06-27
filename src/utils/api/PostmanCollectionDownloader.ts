/**
 * Postman Collection Generator and Downloader
 * Generates real Postman collections from published APIs
 */

export interface PostmanVariable {
  key: string;
  value: string;
  type?: string;
}

export interface PostmanHeader {
  key: string;
  value: string;
  type?: string;
}

export interface PostmanRequest {
  method: string;
  header: PostmanHeader[];
  url: {
    raw: string;
    host: string[];
    path: string[];
    query?: Array<{ key: string; value: string }>;
  };
  body?: {
    mode: string;
    raw?: string;
    options?: any;
  };
}

export interface PostmanItem {
  name: string;
  request: PostmanRequest;
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
  variable: PostmanVariable[];
  auth?: any;
}

export class PostmanCollectionDownloader {
  /**
   * Generate Postman collection from published API details
   */
  static generateCollection(apiDetails: any): PostmanCollection {
    const baseUrl = apiDetails.base_url || `${window.location.origin}/api/v1`;
    
    const collection: PostmanCollection = {
      info: {
        name: `${apiDetails.external_name || 'Healthcare'} API`,
        description: `${apiDetails.external_description || 'Healthcare API'}\n\nGenerated collection for ${apiDetails.external_name || 'Healthcare API'}`,
        version: apiDetails.version || '1.0.0',
        schema: 'https://schema.getpostman.com/json/collection/v2.1.0/collection.json'
      },
      item: [],
      variable: [
        {
          key: 'baseUrl',
          value: baseUrl,
          type: 'string'
        },
        {
          key: 'apiKey',
          value: 'YOUR_API_KEY_HERE',
          type: 'string'
        }
      ],
      auth: {
        type: 'bearer',
        bearer: [
          {
            key: 'token',
            value: '{{apiKey}}',
            type: 'string'
          }
        ]
      }
    };

    // Generate items from endpoints
    if (apiDetails.endpoints && apiDetails.endpoints.length > 0) {
      apiDetails.endpoints.forEach((endpoint: any) => {
        // Safely handle endpoint path
        const endpointPath = endpoint.external_path || endpoint.path || endpoint.url || '/unknown';
        const method = (endpoint.method || 'GET').toUpperCase();
        
        const item: PostmanItem = {
          name: endpoint.summary || endpoint.name || `${method} ${endpointPath}`,
          request: {
            method,
            header: [
              {
                key: 'Content-Type',
                value: 'application/json',
                type: 'text'
              },
              {
                key: 'Authorization',
                value: 'Bearer {{apiKey}}',
                type: 'text'
              }
            ],
            url: {
              raw: `{{baseUrl}}${endpointPath}`,
              host: ['{{baseUrl}}'],
              path: endpointPath.split('/').filter((p: string) => p)
            }
          },
          response: []
        };

        // Add request body for POST/PUT/PATCH methods
        if (['POST', 'PUT', 'PATCH'].includes(method)) {
          item.request.body = {
            mode: 'raw',
            raw: JSON.stringify(this.generateSampleRequestBody(endpoint), null, 2),
            options: {
              raw: {
                language: 'json'
              }
            }
          };
        }

        collection.item.push(item);
      });
    } else {
      // Generate default endpoints if none are available
      const defaultEndpoints = [
        { method: 'GET', path: '/health', name: 'Health Check' },
        { method: 'GET', path: '/users', name: 'Get Users' },
        { method: 'POST', path: '/users', name: 'Create User' },
        { method: 'GET', path: '/patients', name: 'Get Patients' },
        { method: 'POST', path: '/patients', name: 'Create Patient' }
      ];

      defaultEndpoints.forEach(endpoint => {
        const item: PostmanItem = {
          name: endpoint.name,
          request: {
            method: endpoint.method,
            header: [
              {
                key: 'Content-Type',
                value: 'application/json',
                type: 'text'
              },
              {
                key: 'Authorization',
                value: 'Bearer {{apiKey}}',
                type: 'text'
              }
            ],
            url: {
              raw: `{{baseUrl}}${endpoint.path}`,
              host: ['{{baseUrl}}'],
              path: endpoint.path.split('/').filter(p => p)
            }
          },
          response: []
        };

        if (['POST', 'PUT', 'PATCH'].includes(endpoint.method)) {
          item.request.body = {
            mode: 'raw',
            raw: JSON.stringify(this.generateDefaultRequestBody(endpoint.path), null, 2),
            options: {
              raw: {
                language: 'json'
              }
            }
          };
        }

        collection.item.push(item);
      });
    }

    return collection;
  }

  /**
   * Generate sample request body based on endpoint schema
   */
  private static generateSampleRequestBody(endpoint: any): any {
    if (endpoint.request_schema) {
      return endpoint.request_schema;
    }

    if (endpoint.example_request) {
      return endpoint.example_request;
    }

    // Generate based on endpoint path
    const path = endpoint.external_path || endpoint.path || endpoint.url || '';
    return this.generateDefaultRequestBody(path);
  }

  /**
   * Generate default request body based on endpoint path
   */
  private static generateDefaultRequestBody(path: string): any {
    if (!path) {
      return {
        name: "Sample Name",
        description: "Sample Description"
      };
    }

    if (path.includes('/users')) {
      return {
        first_name: "John",
        last_name: "Doe",
        email: "john.doe@example.com",
        role: "user"
      };
    }

    if (path.includes('/patients')) {
      return {
        first_name: "Jane",
        last_name: "Smith",
        date_of_birth: "1990-01-01",
        email: "jane.smith@example.com",
        phone: "+1234567890"
      };
    }

    if (path.includes('/facilities')) {
      return {
        name: "Healthcare Center",
        address: "123 Main St, City, State",
        phone: "+1234567890",
        facility_type: "clinic"
      };
    }

    return {
      name: "Sample Name",
      description: "Sample Description"
    };
  }

  /**
   * Download the Postman collection as a JSON file
   */
  static downloadCollection(collection: PostmanCollection, filename?: string): void {
    const collectionJson = JSON.stringify(collection, null, 2);
    const blob = new Blob([collectionJson], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = filename || `${collection.info.name.replace(/\s+/g, '_')}_postman_collection.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    URL.revokeObjectURL(url);
  }

  /**
   * Generate and download collection for a specific API
   */
  static generateAndDownload(apiDetails: any): void {
    const collection = this.generateCollection(apiDetails);
    this.downloadCollection(collection);
  }
}
