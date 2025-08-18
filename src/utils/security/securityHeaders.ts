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
   */
  static applySecurityHeaders(config: SecurityConfig = {}): void {
    const finalConfig = { ...this.DEFAULT_CONFIG, ...config };

    if (finalConfig.enableCSP) {
      this.addMetaCSP();
    }

    // Add security-related meta tags
    if (finalConfig.enableXSSProtection) {
      this.addMetaTag('http-equiv', 'X-XSS-Protection', '1; mode=block');
    }

    if (finalConfig.enableClickjackProtection) {
      this.addMetaTag('http-equiv', 'X-Frame-Options', 'DENY');
    }

    if (finalConfig.enableContentTypeNoSniff) {
      this.addMetaTag('http-equiv', 'X-Content-Type-Options', 'nosniff');
    }

    if (finalConfig.enableReferrerPolicy) {
      this.addMetaTag('name', 'referrer', 'strict-origin-when-cross-origin');
    }
  }

  /**
   * Add CSP meta tag
   */
  private static addMetaCSP(): void {
    const existing = document.querySelector('meta[http-equiv="Content-Security-Policy"]');
    if (existing) return;

    const meta = document.createElement('meta');
    meta.httpEquiv = 'Content-Security-Policy';
    meta.content = this.generateCSP();
    document.head.appendChild(meta);
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