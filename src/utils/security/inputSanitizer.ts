/**
 * Input Sanitization Utility
 * Comprehensive input validation and sanitization to prevent XSS and injection attacks
 */

import { APIValidator } from './apiValidation';

export interface SanitizationOptions {
  allowHTML?: boolean;
  maxLength?: number;
  removeScripts?: boolean;
  removeEventHandlers?: boolean;
  whitelist?: string[];
}

export class InputSanitizer {
  private static readonly DEFAULT_OPTIONS: SanitizationOptions = {
    allowHTML: false,
    maxLength: 10000,
    removeScripts: true,
    removeEventHandlers: true,
    whitelist: []
  };

  /**
   * Comprehensive input sanitization
   */
  static sanitizeInput(
    input: any, 
    options: SanitizationOptions = {}
  ): string {
    if (input === null || input === undefined) {
      return '';
    }

    const opts = { ...this.DEFAULT_OPTIONS, ...options };
    let sanitized = String(input);

    // Apply length limit
    if (opts.maxLength && sanitized.length > opts.maxLength) {
      sanitized = sanitized.substring(0, opts.maxLength);
    }

    // Remove scripts if not allowing HTML or always if specified
    if (opts.removeScripts) {
      sanitized = this.removeScriptTags(sanitized);
    }

    // Remove event handlers
    if (opts.removeEventHandlers) {
      sanitized = this.removeEventHandlers(sanitized);
    }

    // If HTML is not allowed, escape it
    if (!opts.allowHTML) {
      sanitized = this.escapeHTML(sanitized);
    } else if (opts.whitelist && opts.whitelist.length > 0) {
      sanitized = this.whitelistTags(sanitized, opts.whitelist);
    }

    return sanitized;
  }

  /**
   * Remove script tags and javascript: URLs
   */
  private static removeScriptTags(input: string): string {
    return input
      .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
      .replace(/<iframe[^>]*>[\s\S]*?<\/iframe>/gi, '')
      .replace(/javascript:/gi, 'removed:')
      .replace(/vbscript:/gi, 'removed:')
      .replace(/data:/gi, 'removed:');
  }

  /**
   * Remove event handlers
   */
  private static removeEventHandlers(input: string): string {
    return input.replace(/on\w+\s*=\s*["'][^"']*["']/gi, '');
  }

  /**
   * Escape HTML characters
   */
  private static escapeHTML(input: string): string {
    const div = document.createElement('div');
    div.textContent = input;
    return div.innerHTML;
  }

  /**
   * Allow only whitelisted HTML tags
   */
  private static whitelistTags(input: string, whitelist: string[]): string {
    const allowedTags = whitelist.map(tag => tag.toLowerCase());
    return input.replace(/<\/?([a-zA-Z][a-zA-Z0-9]*)[^>]*>/g, (match, tagName) => {
      return allowedTags.includes(tagName.toLowerCase()) ? match : '';
    });
  }

  /**
   * Sanitize form data object
   */
  static sanitizeFormData(
    formData: Record<string, any>,
    fieldOptions: Record<string, SanitizationOptions> = {}
  ): Record<string, any> {
    const sanitized: Record<string, any> = {};

    for (const [key, value] of Object.entries(formData)) {
      const options = fieldOptions[key] || {};
      
      if (Array.isArray(value)) {
        sanitized[key] = value.map(item => this.sanitizeInput(item, options));
      } else if (typeof value === 'object' && value !== null) {
        sanitized[key] = this.sanitizeFormData(value, fieldOptions);
      } else {
        sanitized[key] = this.sanitizeInput(value, options);
      }
    }

    return sanitized;
  }

  /**
   * Validate and sanitize API request data
   */
  static sanitizeAPIRequest(data: any): any {
    // Use existing API validation
    const validationResult = APIValidator.validateApiInput(data);
    
    if (!validationResult.success) {
      throw new Error(`Invalid input: ${validationResult.errors.join(', ')}`);
    }

    // Apply sanitization
    return this.sanitizeFormData(data, {
      email: { maxLength: 254 },
      password: { maxLength: 128, allowHTML: false },
      name: { maxLength: 100, allowHTML: false },
      description: { maxLength: 1000, allowHTML: false },
      url: { maxLength: 2048, allowHTML: false }
    });
  }

  /**
   * Rate limiting check
   */
  private static rateLimitMap = new Map<string, { count: number; resetTime: number }>();

  static checkRateLimit(
    identifier: string,
    maxRequests: number = 100,
    windowMs: number = 60000
  ): boolean {
    const now = Date.now();
    const key = identifier;
    const current = this.rateLimitMap.get(key);

    if (!current || now > current.resetTime) {
      this.rateLimitMap.set(key, {
        count: 1,
        resetTime: now + windowMs
      });
      return true;
    }

    if (current.count >= maxRequests) {
      return false;
    }

    current.count++;
    return true;
  }

  /**
   * Clean expired rate limit entries
   */
  static cleanupRateLimit(): void {
    const now = Date.now();
    for (const [key, value] of this.rateLimitMap.entries()) {
      if (now > value.resetTime) {
        this.rateLimitMap.delete(key);
      }
    }
  }

  /**
   * Initialize rate limit cleanup interval
   */
  static initializeRateLimit(): void {
    // Clean up every 5 minutes
    setInterval(() => {
      this.cleanupRateLimit();
    }, 5 * 60 * 1000);
  }
}