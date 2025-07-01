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
    example: string;
  };
  endpoints: ApiEndpointDoc[];
}

export interface ApiEndpointDoc {
  method: string;
  path: string;
  summary: string;
  description?: string;
  parameters?: Array<{
    name: string;
    type: string;
    required: boolean;
    description: string;
  }>;
  examples: {
    curl: string;
    javascript: string;
    python: string;
  };
}

export class ApiDocumentationGenerator {
  /**
   * Generate comprehensive API documentation
   */
  static generateDocumentation(apiDetails: any): ApiDocumentation {
    const baseUrl = apiDetails.base_url || `${window.location.origin}/api/v1`;
    
    return {
      title: apiDetails.name || 'API Documentation',
      version: apiDetails.version || '1.0.0',
      description: apiDetails.description || 'API documentation',
      baseUrl,
      authentication: {
        type: 'Bearer Token',
        example: 'Authorization: Bearer your-api-key-here'
      },
      endpoints: this.generateEndpoints(apiDetails, baseUrl)
    };
  }

  /**
   * Generate endpoint documentation
   */
  private static generateEndpoints(apiDetails: any, baseUrl: string): ApiEndpointDoc[] {
    // If endpoints are provided, use them
    if (apiDetails.endpoints && Array.isArray(apiDetails.endpoints)) {
      return apiDetails.endpoints.map((endpoint: any) => this.formatEndpoint(endpoint, baseUrl));
    }

    // Otherwise generate common endpoints based on API type
    const commonEndpoints = [
      {
        method: 'GET',
        path: '/health',
        summary: 'Health Check',
        description: 'Check API health status'
      },
      {
        method: 'GET',
        path: '/status',
        summary: 'API Status',
        description: 'Get current API status and metrics'
      }
    ];

    return commonEndpoints.map(endpoint => this.formatEndpoint(endpoint, baseUrl));
  }

  /**
   * Format endpoint for documentation
   */
  private static formatEndpoint(endpoint: any, baseUrl: string): ApiEndpointDoc {
    return {
      method: endpoint.method || 'GET',
      path: endpoint.path || '/',
      summary: endpoint.summary || 'API Endpoint',
      description: endpoint.description,
      parameters: endpoint.parameters || [],
      examples: this.generateExamples(endpoint, baseUrl)
    };
  }

  /**
   * Generate code examples for endpoints
   */
  private static generateExamples(endpoint: any, baseUrl: string) {
    const method = endpoint.method || 'GET';
    const path = endpoint.path || '/';
    const fullUrl = `${baseUrl}${path}`;

    return {
      curl: this.generateCurlExample(method, fullUrl),
      javascript: this.generateJavaScriptExample(method, fullUrl),
      python: this.generatePythonExample(method, fullUrl)
    };
  }

  /**
   * Generate cURL example
   */
  private static generateCurlExample(method: string, url: string): string {
    return `curl -X ${method} \\
  "${url}" \\
  -H "Authorization: Bearer your-api-key-here" \\
  -H "Content-Type: application/json"`;
  }

  /**
   * Generate JavaScript example
   */
  private static generateJavaScriptExample(method: string, url: string): string {
    return `const response = await fetch('${url}', {
  method: '${method}',
  headers: {
    'Authorization': 'Bearer your-api-key-here',
    'Content-Type': 'application/json'
  }
});

const data = await response.json();
console.log(data);`;
  }

  /**
   * Generate Python example
   */
  private static generatePythonExample(method: string, url: string): string {
    return `import requests

headers = {
    'Authorization': 'Bearer your-api-key-here',
    'Content-Type': 'application/json'
}

response = requests.${method.toLowerCase()}('${url}', headers=headers)
data = response.json()
print(data)`;
  }

  /**
   * Open documentation in new window
   */
  static viewDocumentation(apiDetails: any): void {
    const doc = this.generateDocumentation(apiDetails);
    const htmlContent = this.generateHtmlDocumentation(doc);
    
    const newWindow = window.open('', '_blank');
    if (newWindow) {
      newWindow.document.write(htmlContent);
      newWindow.document.close();
    }
  }

  /**
   * Generate HTML documentation
   */
  static generateHtmlDocumentation(doc: ApiDocumentation): string {
    return `
<!DOCTYPE html>
<html>
<head>
    <title>${doc.title} - API Documentation</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 40px; }
        .header { border-bottom: 2px solid #eee; padding-bottom: 20px; margin-bottom: 30px; }
        .endpoint { margin: 20px 0; padding: 15px; border: 1px solid #ddd; border-radius: 5px; }
        .method { padding: 4px 8px; border-radius: 3px; color: white; font-weight: bold; }
        .get { background-color: #61affe; }
        .post { background-color: #49cc90; }
        .put { background-color: #fca130; }
        .delete { background-color: #f93e3e; }
        pre { background-color: #f5f5f5; padding: 10px; border-radius: 3px; overflow-x: auto; }
        code { background-color: #f5f5f5; padding: 2px 4px; border-radius: 2px; }
    </style>
</head>
<body>
    <div class="header">
        <h1>${doc.title}</h1>
        <p><strong>Version:</strong> ${doc.version}</p>
        <p><strong>Base URL:</strong> <code>${doc.baseUrl}</code></p>
        <p>${doc.description}</p>
        <p><strong>Authentication:</strong> ${doc.authentication.example}</p>
    </div>
    
    <h2>Endpoints</h2>
    ${doc.endpoints.map(endpoint => `
        <div class="endpoint">
            <h3>
                <span class="method ${endpoint.method.toLowerCase()}">${endpoint.method}</span>
                <code>${endpoint.path}</code>
            </h3>
            <p>${endpoint.summary}</p>
            ${endpoint.description ? `<p>${endpoint.description}</p>` : ''}
            
            <h4>cURL Example</h4>
            <pre><code>${endpoint.examples.curl}</code></pre>
            
            <h4>JavaScript Example</h4>
            <pre><code>${endpoint.examples.javascript}</code></pre>
            
            <h4>Python Example</h4>
            <pre><code>${endpoint.examples.python}</code></pre>
        </div>
    `).join('')}
</body>
</html>`;
  }
}
