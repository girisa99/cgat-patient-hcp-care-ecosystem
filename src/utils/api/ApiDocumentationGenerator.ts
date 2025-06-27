/**
 * API Documentation Generator
 * Generates comprehensive API documentation from published APIs
 */

export interface ApiDocumentation {
  title: string;
  version: string;
  description: string;
  baseUrl: string;
  authentication: {
    type: string;
    description: string;
    example: string;
  };
  endpoints: Array<{
    path: string;
    method: string;
    summary: string;
    description?: string;
    parameters?: any[];
    requestBody?: any;
    responses?: any;
    examples?: any;
  }>;
  schemas: any;
  examples: {
    curl: string[];
    javascript: string[];
    python: string[];
  };
}

export class ApiDocumentationGenerator {
  /**
   * Generate comprehensive API documentation
   */
  static generateDocumentation(apiDetails: any): ApiDocumentation {
    const baseUrl = apiDetails.base_url || `${window.location.origin}/api/v1`;
    
    const documentation: ApiDocumentation = {
      title: apiDetails.external_name || 'Healthcare API',
      version: apiDetails.version || '1.0.0',
      description: apiDetails.external_description || 'Comprehensive healthcare management API',
      baseUrl,
      authentication: {
        type: 'Bearer Token',
        description: 'Use your API key in the Authorization header',
        example: 'Authorization: Bearer YOUR_API_KEY'
      },
      endpoints: [],
      schemas: this.generateSchemas(),
      examples: {
        curl: [],
        javascript: [],
        python: []
      }
    };

    // Process endpoints
    if (apiDetails.endpoints && apiDetails.endpoints.length > 0) {
      apiDetails.endpoints.forEach((endpoint: any) => {
        // Safely handle endpoint path
        const endpointPath = endpoint.external_path || endpoint.path || endpoint.url || '/unknown';
        
        const docEndpoint = {
          path: endpointPath,
          method: (endpoint.method || 'GET').toUpperCase(),
          summary: endpoint.summary || endpoint.name || `${endpoint.method} ${endpointPath}`,
          description: endpoint.description,
          parameters: this.extractParameters(endpointPath),
          requestBody: endpoint.request_schema || this.generateDefaultRequestBody(endpointPath, endpoint.method),
          responses: endpoint.response_schema || this.generateDefaultResponse(endpointPath, endpoint.method),
          examples: {
            curl: this.generateCurlExample(baseUrl, { ...endpoint, path: endpointPath }),
            javascript: this.generateJavaScriptExample(baseUrl, { ...endpoint, path: endpointPath }),
            python: this.generatePythonExample(baseUrl, { ...endpoint, path: endpointPath })
          }
        };

        documentation.endpoints.push(docEndpoint);
        
        // Add to global examples
        documentation.examples.curl.push(docEndpoint.examples.curl);
        documentation.examples.javascript.push(docEndpoint.examples.javascript);
        documentation.examples.python.push(docEndpoint.examples.python);
      });
    } else {
      // Generate default documentation if no endpoints
      const defaultEndpoints = [
        { method: 'GET', path: '/health', summary: 'Health Check', description: 'Check API health status' },
        { method: 'GET', path: '/users', summary: 'Get Users', description: 'Retrieve list of users' },
        { method: 'POST', path: '/users', summary: 'Create User', description: 'Create a new user' },
        { method: 'GET', path: '/patients', summary: 'Get Patients', description: 'Retrieve list of patients' },
        { method: 'POST', path: '/patients', summary: 'Create Patient', description: 'Create a new patient record' }
      ];

      defaultEndpoints.forEach(endpoint => {
        const docEndpoint = {
          path: endpoint.path,
          method: endpoint.method,
          summary: endpoint.summary,
          description: endpoint.description,
          parameters: this.extractParameters(endpoint.path),
          requestBody: this.generateDefaultRequestBody(endpoint.path, endpoint.method),
          responses: this.generateDefaultResponse(endpoint.path, endpoint.method),
          examples: {
            curl: this.generateCurlExample(baseUrl, endpoint),
            javascript: this.generateJavaScriptExample(baseUrl, endpoint),
            python: this.generatePythonExample(baseUrl, endpoint)
          }
        };

        documentation.endpoints.push(docEndpoint);
        documentation.examples.curl.push(docEndpoint.examples.curl);
        documentation.examples.javascript.push(docEndpoint.examples.javascript);
        documentation.examples.python.push(docEndpoint.examples.python);
      });
    }

    return documentation;
  }

  /**
   * Extract path parameters from endpoint path
   */
  private static extractParameters(path: string): any[] {
    const params: any[] = [];
    
    // Safely handle undefined or null paths
    if (!path || typeof path !== 'string') {
      return params;
    }
    
    const pathParts = path.split('/');
    
    pathParts.forEach(part => {
      if (part.startsWith('{') && part.endsWith('}')) {
        const paramName = part.slice(1, -1);
        params.push({
          name: paramName,
          in: 'path',
          required: true,
          type: 'string',
          description: `${paramName} identifier`
        });
      }
    });

    return params;
  }

  /**
   * Generate example curl command
   */
  private static generateCurlExample(baseUrl: string, endpoint: any): string {
    const method = (endpoint.method || 'GET').toUpperCase();
    const path = endpoint.path || endpoint.external_path || '/unknown';
    
    let curl = `curl -X ${method} "${baseUrl}${path}" \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json"`;

    if (['POST', 'PUT', 'PATCH'].includes(method)) {
      const sampleData = this.generateDefaultRequestBody(path, endpoint.method);
      curl += ` \\
  -d '${JSON.stringify(sampleData, null, 2)}'`;
    }

    return curl;
  }

  /**
   * Generate JavaScript example
   */
  private static generateJavaScriptExample(baseUrl: string, endpoint: any): string {
    const method = (endpoint.method || 'GET').toUpperCase();
    const path = endpoint.path || endpoint.external_path || '/unknown';
    
    let js = `const response = await fetch('${baseUrl}${path}', {
  method: '${method}',
  headers: {
    'Authorization': 'Bearer YOUR_API_KEY',
    'Content-Type': 'application/json'
  }`;

    if (['POST', 'PUT', 'PATCH'].includes(method)) {
      const sampleData = this.generateDefaultRequestBody(path, endpoint.method);
      js += `,
  body: JSON.stringify(${JSON.stringify(sampleData, null, 2)})`;
    }

    js += `
});

const data = await response.json();
console.log(data);`;

    return js;
  }

  /**
   * Generate Python example
   */
  private static generatePythonExample(baseUrl: string, endpoint: any): string {
    const method = (endpoint.method || 'GET').toLowerCase();
    const path = endpoint.path || endpoint.external_path || '/unknown';
    
    let python = `import requests
import json

url = "${baseUrl}${path}"
headers = {
    "Authorization": "Bearer YOUR_API_KEY",
    "Content-Type": "application/json"
}`;

    if (['POST', 'PUT', 'PATCH'].includes(method.toUpperCase())) {
      const sampleData = this.generateDefaultRequestBody(path, endpoint.method);
      python += `
data = ${JSON.stringify(sampleData, null, 2)}

response = requests.${method}(url, headers=headers, json=data)`;
    } else {
      python += `

response = requests.${method}(url, headers=headers)`;
    }

    python += `
print(response.json())`;

    return python;
  }

  /**
   * Generate default request body based on path
   */
  private static generateDefaultRequestBody(path: string, method: string): any {
    if (!method || !['POST', 'PUT', 'PATCH'].includes(method.toUpperCase())) {
      return null;
    }

    if (path && path.includes('/users')) {
      return {
        first_name: "John",
        last_name: "Doe",
        email: "john.doe@example.com",
        role: "user"
      };
    }

    if (path && path.includes('/patients')) {
      return {
        first_name: "Jane",
        last_name: "Smith",
        date_of_birth: "1990-01-01",
        email: "jane.smith@example.com",
        phone: "+1234567890"
      };
    }

    return {
      name: "Sample Name",
      description: "Sample Description"
    };
  }

  /**
   * Generate default response schema
   */
  private static generateDefaultResponse(path: string, method: string): any {
    if (method && method.toUpperCase() === 'GET') {
      if (path && path.includes('/users')) {
        return {
          200: {
            description: 'Success',
            content: {
              'application/json': {
                schema: {
                  type: 'array',
                  items: { $ref: '#/components/schemas/User' }
                }
              }
            }
          }
        };
      }
    }

    return {
      200: {
        description: 'Success',
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                success: { type: 'boolean' },
                message: { type: 'string' },
                data: { type: 'object' }
              }
            }
          }
        }
      }
    };
  }

  /**
   * Generate common schemas
   */
  private static generateSchemas(): any {
    return {
      User: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' },
          first_name: { type: 'string' },
          last_name: { type: 'string' },
          email: { type: 'string', format: 'email' },
          role: { type: 'string' },
          created_at: { type: 'string', format: 'date-time' }
        }
      },
      Patient: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' },
          first_name: { type: 'string' },
          last_name: { type: 'string' },
          email: { type: 'string', format: 'email' },
          phone: { type: 'string' },
          date_of_birth: { type: 'string', format: 'date' },
          created_at: { type: 'string', format: 'date-time' }
        }
      }
    };
  }

  /**
   * Generate and display documentation in a new window
   */
  static viewDocumentation(apiDetails: any): void {
    const documentation = this.generateDocumentation(apiDetails);
    const htmlContent = this.generateHtmlDocumentation(documentation);
    
    const newWindow = window.open('', '_blank');
    if (newWindow) {
      newWindow.document.write(htmlContent);
      newWindow.document.close();
    }
  }

  /**
   * Generate HTML documentation
   */
  private static generateHtmlDocumentation(doc: ApiDocumentation): string {
    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${doc.title} - API Documentation</title>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; margin: 0; padding: 20px; background: #f8fafc; }
        .container { max-width: 1200px; margin: 0 auto; background: white; padding: 40px; border-radius: 10px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
        h1 { color: #1a202c; border-bottom: 3px solid #3182ce; padding-bottom: 10px; }
        h2 { color: #2d3748; margin-top: 30px; }
        h3 { color: #4a5568; }
        .endpoint { background: #f7fafc; padding: 20px; margin: 20px 0; border-radius: 8px; border-left: 4px solid #3182ce; }
        .method { display: inline-block; padding: 4px 8px; border-radius: 4px; color: white; font-weight: bold; margin-right: 10px; }
        .GET { background: #38a169; }
        .POST { background: #3182ce; }
        .PUT { background: #d69e2e; }
        .DELETE { background: #e53e3e; }
        pre { background: #2d3748; color: #e2e8f0; padding: 15px; border-radius: 6px; overflow-x: auto; }
        code { background: #edf2f7; padding: 2px 4px; border-radius: 3px; font-family: 'Courier New', monospace; }
        .auth-info { background: #fed7d7; padding: 15px; border-radius: 6px; margin: 20px 0; }
    </style>
</head>
<body>
    <div class="container">
        <h1>${doc.title}</h1>
        <p><strong>Version:</strong> ${doc.version}</p>
        <p><strong>Base URL:</strong> <code>${doc.baseUrl}</code></p>
        <p>${doc.description}</p>
        
        <div class="auth-info">
            <h3>Authentication</h3>
            <p><strong>Type:</strong> ${doc.authentication.type}</p>
            <p>${doc.authentication.description}</p>
            <p><strong>Example:</strong> <code>${doc.authentication.example}</code></p>
        </div>
        
        <h2>Endpoints</h2>
        ${doc.endpoints.map(endpoint => `
            <div class="endpoint">
                <h3>
                    <span class="method ${endpoint.method}">${endpoint.method}</span>
                    <code>${endpoint.path}</code>
                </h3>
                <p><strong>${endpoint.summary}</strong></p>
                ${endpoint.description ? `<p>${endpoint.description}</p>` : ''}
                
                <h4>Example Request (cURL)</h4>
                <pre><code>${endpoint.examples.curl}</code></pre>
                
                <h4>Example Request (JavaScript)</h4>
                <pre><code>${endpoint.examples.javascript}</code></pre>
                
                <h4>Example Request (Python)</h4>
                <pre><code>${endpoint.examples.python}</code></pre>
            </div>
        `).join('')}
        
        <p style="margin-top: 40px; text-align: center; color: #718096;">
            Generated on ${new Date().toLocaleString()}
        </p>
    </div>
</body>
</html>`;
  }
}
