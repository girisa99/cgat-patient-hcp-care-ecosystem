/**
 * Security Headers Utility
 * Implements security headers and CSP for XSS protection
 */

export interface SecurityConfig {
  enableCSP?: boolean;
  enableXSSProtection?: boolean;
  enableClickjackProtection?: boolean;
  enableContentTypeNoSniff?: boolean;
  enableReferrerPolicy?: boolean;
  strictTransportSecurity?: boolean;
}

export class SecurityHeaders {
  private static readonly DEFAULT_CONFIG: SecurityConfig = {
    enableCSP: true,
    enableXSSProtection: true,
    enableClickjackProtection: true,
    enableContentTypeNoSniff: true,
    enableReferrerPolicy: true,
    strictTransportSecurity: true
  };

  /**
   * Generate Content Security Policy
   */
  static generateCSP(): string {
    const cspDirectives = [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdn.jsdelivr.net",
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "font-src 'self' https://fonts.gstatic.com",
      "img-src 'self' data: https: blob:",
      "connect-src 'self' https://*.supabase.co wss://*.supabase.co https://api.openai.com",
      "object-src 'none'",
      "base-uri 'self'",
      "form-action 'self'",
      "frame-ancestors 'none'",
      "upgrade-insecure-requests"
    ];

    return cspDirectives.join('; ');
  }

  /**
   * Apply security headers to document
   * Note: CSP and X-Frame-Options only work as HTTP headers, not meta tags
   */
  static applySecurityHeaders(config: SecurityConfig = {}): void {
    const finalConfig = { ...this.DEFAULT_CONFIG, ...config };

    // CSP and X-Frame-Options are ignored in meta tags by browsers
    // These must be set as HTTP response headers by the server
    
    // Only add meta tags that actually work in meta elements
    if (finalConfig.enableReferrerPolicy) {
      this.addMetaTag('name', 'referrer', 'strict-origin-when-cross-origin');
    }
  }

  /**
   * Note: CSP meta tags are ignored by browsers for frame-ancestors directive
   * This method is kept for reference but should not be used
   */
  private static addMetaCSP(): void {
    // Removed: CSP meta tags don't work for frame-ancestors and cause browser warnings
    console.warn('CSP meta tags are not recommended - use HTTP headers instead');
  }

  /**
   * Add meta tag helper
   */
  private static addMetaTag(type: 'name' | 'http-equiv', name: string, content: string): void {
    const selector = `meta[${type}="${name}"]`;
    const existing = document.querySelector(selector);
    if (existing) return;

    const meta = document.createElement('meta');
    if (type === 'name') {
      meta.name = name;
    } else {
      meta.httpEquiv = name;
    }
    meta.content = content;
    document.head.appendChild(meta);
  }

  /**
   * Initialize security headers on page load
   */
  static initialize(config?: SecurityConfig): void {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => {
        this.applySecurityHeaders(config);
      });
    } else {
      this.applySecurityHeaders(config);
    }
  }

  /**
   * Validate and sanitize URL for safe redirects
   */
  static validateRedirectURL(url: string, allowedDomains: string[] = []): string | null {
    try {
      const parsedUrl = new URL(url);
      
      // Only allow HTTP/HTTPS protocols
      if (!['http:', 'https:'].includes(parsedUrl.protocol)) {
        return null;
      }

      // Check against allowed domains if specified
      if (allowedDomains.length > 0) {
        const isAllowed = allowedDomains.some(domain => 
          parsedUrl.hostname === domain || 
          parsedUrl.hostname.endsWith('.' + domain)
        );
        if (!isAllowed) return null;
      }

      return parsedUrl.toString();
    } catch {
      return null;
    }
  }

  /**
   * Generate secure nonce for inline scripts
   */
  static generateNonce(): string {
    const array = new Uint8Array(16);
    crypto.getRandomValues(array);
    return btoa(String.fromCharCode(...array));
  }
}