/**
 * DOM Security Utilities
 * Safe DOM manipulation to prevent XSS attacks
 */

export interface SecureWindowOptions {
  width?: number;
  height?: number;
  title?: string;
  features?: string;
}

export class DOMSecurity {
  /**
   * Safely create and write content to a new window
   */
  static createSecureWindow(
    htmlContent: string,
    options: SecureWindowOptions = {}
  ): Window | null {
    const {
      width = 800,
      height = 600,
      title = 'Secure Window',
      features = `width=${width},height=${height},scrollbars=yes,resizable=yes`
    } = options;

    const newWindow = window.open('', '_blank', features);
    if (!newWindow) return null;

    // Create document structure safely
    const doc = newWindow.document;
    doc.open();
    
    // Sanitize and write content
    const sanitizedContent = this.sanitizeHTML(htmlContent);
    doc.write(sanitizedContent);
    doc.close();
    
    // Set title safely
    doc.title = this.escapeHTML(title);
    
    return newWindow;
  }

  /**
   * Escape HTML to prevent XSS
   */
  static escapeHTML(unsafe: string): string {
    return unsafe
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  /**
   * Basic HTML sanitization
   */
  static sanitizeHTML(html: string): string {
    // Remove dangerous elements and attributes
    return html
      .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
      .replace(/<iframe[^>]*>[\s\S]*?<\/iframe>/gi, '')
      .replace(/on\w+="[^"]*"/gi, '') // Remove event handlers
      .replace(/on\w+='[^']*'/gi, '') // Remove event handlers
      .replace(/javascript:/gi, ''); // Remove javascript: URLs
  }

  /**
   * Safely set text content
   */
  static setTextContent(element: Element, text: string): void {
    element.textContent = text;
  }

  /**
   * Safely create HTML template with escaped values
   */
  static createTemplate(template: string, values: Record<string, string>): string {
    let result = template;
    for (const [key, value] of Object.entries(values)) {
      const escaped = this.escapeHTML(value);
      result = result.replace(new RegExp(`{{${key}}}`, 'g'), escaped);
    }
    return result;
  }

  /**
   * Create secure popup window for API details
   */
  static createAPIDetailsWindow(apiData: any, type: 'collection' | 'api' | 'external'): Window | null {
    const template = `
      <!DOCTYPE html>
      <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <meta http-equiv="Content-Security-Policy" content="default-src 'self'; style-src 'unsafe-inline';">
          <title>{{title}} - Details</title>
          <style>
            body { 
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
              padding: 20px; 
              line-height: 1.6;
              color: #333;
              background: #f8f9fa;
            }
            .header { 
              border-bottom: 1px solid #dee2e6; 
              padding-bottom: 15px; 
              margin-bottom: 20px; 
              background: white;
              padding: 20px;
              border-radius: 8px;
              box-shadow: 0 2px 4px rgba(0,0,0,0.1);
            }
            .detail-section { 
              margin-bottom: 20px; 
              padding: 15px; 
              background: white; 
              border-radius: 8px; 
              box-shadow: 0 2px 4px rgba(0,0,0,0.1);
            }
            .badge { 
              display: inline-block; 
              padding: 4px 12px; 
              background: #007bff; 
              color: white; 
              border-radius: 20px; 
              font-size: 12px; 
              font-weight: 500;
            }
            .status-active { background: #28a745; }
            .status-draft { background: #6c757d; }
            pre { 
              background: #f8f9fa; 
              padding: 15px; 
              border-radius: 5px; 
              overflow: auto; 
              border: 1px solid #e9ecef;
              font-size: 12px;
            }
            h1 { color: #495057; margin: 0; }
            h2 { color: #6c757d; margin-top: 0; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>{{name}}</h1>
            <p>{{description}}</p>
          </div>
          {{content}}
        </body>
      </html>
    `;

    let content = '';
    let title = '';
    let name = '';
    let description = '';

    if (type === 'collection') {
      title = apiData.name || 'Collection';
      name = apiData.name || 'Unknown Collection';
      description = apiData.description || 'No description available';
      content = `
        <div class="detail-section">
          <h2>Collection JSON</h2>
          <pre>${this.escapeHTML(JSON.stringify(apiData.collectionData || {}, null, 2))}</pre>
        </div>
      `;
    } else if (type === 'api') {
      title = apiData.name || 'API';
      name = apiData.name || 'Unknown API';
      description = apiData.description || 'No description available';
      content = `
        <div class="detail-section">
          <h2>Basic Information</h2>
          <p><strong>Category:</strong> {{category}}</p>
          <p><strong>Status:</strong> <span class="badge">{{status}}</span></p>
          <p><strong>Base URL:</strong> {{baseUrl}}</p>
        </div>
        <div class="detail-section">
          <h2>Timestamps</h2>
          <p><strong>Created:</strong> {{createdAt}}</p>
          <p><strong>Updated:</strong> {{updatedAt}}</p>
        </div>
      `;
    } else if (type === 'external') {
      title = apiData.external_name || 'External API';
      name = apiData.external_name || 'Unknown External API';
      description = apiData.description || 'No description available';
      content = `
        <div class="detail-section">
          <h2>External Integration</h2>
          <p><strong>Provider:</strong> {{provider}}</p>
          <p><strong>Status:</strong> <span class="badge status-{{statusClass}}">{{status}}</span></p>
          <p><strong>Base URL:</strong> {{baseUrl}}</p>
        </div>
      `;
    }

    const values: Record<string, string> = {
      title,
      name,
      description,
      content,
      category: apiData.category || 'Unknown',
      status: apiData.status || 'Unknown',
      baseUrl: apiData.base_url || apiData.endpoint_url || 'Not configured',
      createdAt: apiData.created_at ? new Date(apiData.created_at).toLocaleString() : 'Unknown',
      updatedAt: apiData.updated_at ? new Date(apiData.updated_at).toLocaleString() : 'Unknown',
      provider: apiData.provider || 'Unknown',
      statusClass: apiData.status === 'active' ? 'active' : 'draft'
    };

    const htmlContent = this.createTemplate(template, values);
    
    return this.createSecureWindow(htmlContent, {
      width: 800,
      height: 600,
      title
    });
  }
}