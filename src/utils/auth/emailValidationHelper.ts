
/**
 * Email Validation Helper
 * Helps debug and resolve email validation issues with Supabase Auth
 */

import { supabase } from '@/integrations/supabase/client';

export interface EmailValidationResult {
  isValid: boolean;
  error?: string;
  suggestions?: string[];
}

export class EmailValidationHelper {
  /**
   * Validate email format using multiple validation methods
   */
  static validateEmailFormat(email: string): EmailValidationResult {
    const suggestions: string[] = [];
    
    // Basic format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return {
        isValid: false,
        error: 'Invalid email format',
        suggestions: ['Please check the email format (example@domain.com)']
      };
    }

    // Check for common issues
    const cleanEmail = email.trim().toLowerCase();
    
    // Check for double @ symbols
    if ((email.match(/@/g) || []).length > 1) {
      suggestions.push('Email contains multiple @ symbols');
    }

    // Check for spaces
    if (email.includes(' ')) {
      suggestions.push('Email contains spaces - remove all spaces');
    }

    // Check for consecutive dots
    if (email.includes('..')) {
      suggestions.push('Email contains consecutive dots');
    }

    // Check domain validity
    const domain = email.split('@')[1];
    if (domain) {
      // Check for valid TLD
      const tldRegex = /\.[a-zA-Z]{2,}$/;
      if (!tldRegex.test(domain)) {
        suggestions.push('Domain appears to have an invalid top-level domain');
      }

      // Check for common typos in domains
      const commonDomains = ['gmail.com', 'yahoo.com', 'outlook.com', 'hotmail.com'];
      const similarDomain = commonDomains.find(d => 
        this.calculateSimilarity(domain, d) > 0.7 && domain !== d
      );
      
      if (similarDomain) {
        suggestions.push(`Did you mean ${email.replace(domain, similarDomain)}?`);
      }
    }

    return {
      isValid: suggestions.length === 0,
      error: suggestions.length > 0 ? 'Email format issues detected' : undefined,
      suggestions: suggestions.length > 0 ? suggestions : undefined
    };
  }

  /**
   * Test email with Supabase Auth to get specific error details
   */
  static async testEmailWithSupabase(email: string): Promise<EmailValidationResult> {
    try {
      console.log('🧪 Testing email validation with Supabase:', email);
      
      // Try to request a password recovery to test email validation
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/reset-password`
      });

      if (error) {
        console.error('❌ Supabase email validation error:', error);
        
        // Parse Supabase error messages
        const errorMessage = error.message.toLowerCase();
        const suggestions: string[] = [];

        if (errorMessage.includes('email address') && errorMessage.includes('invalid')) {
          suggestions.push('Supabase rejected this email address as invalid');
          suggestions.push('Try using a different email address (Gmail, Outlook, etc.)');
          suggestions.push('Check if your organization email domain is properly configured');
        }

        if (errorMessage.includes('rate limit')) {
          suggestions.push('Too many attempts - wait a few minutes before trying again');
        }

        return {
          isValid: false,
          error: error.message,
          suggestions
        };
      }

      console.log('✅ Email passed Supabase validation');
      return {
        isValid: true
      };

    } catch (error: any) {
      console.error('💥 Error testing email with Supabase:', error);
      return {
        isValid: false,
        error: 'Failed to test email with Supabase',
        suggestions: ['Check your internet connection and try again']
      };
    }
  }

  /**
   * Comprehensive email validation that combines format and Supabase checks
   */
  static async validateEmail(email: string): Promise<EmailValidationResult> {
    console.log('🔍 Starting comprehensive email validation for:', email);
    
    // First check format
    const formatResult = this.validateEmailFormat(email);
    if (!formatResult.isValid) {
      return formatResult;
    }

    // Then test with Supabase
    const supabaseResult = await this.testEmailWithSupabase(email);
    return supabaseResult;
  }

  /**
   * Calculate similarity between two strings (for domain suggestions)
   */
  private static calculateSimilarity(str1: string, str2: string): number {
    const longer = str1.length > str2.length ? str1 : str2;
    const shorter = str1.length > str2.length ? str2 : str1;
    
    if (longer.length === 0) return 1.0;
    
    const editDistance = this.levenshteinDistance(longer, shorter);
    return (longer.length - editDistance) / longer.length;
  }

  /**
   * Calculate Levenshtein distance between two strings
   */
  private static levenshteinDistance(str1: string, str2: string): number {
    const matrix = [];
    
    for (let i = 0; i <= str2.length; i++) {
      matrix[i] = [i];
    }
    
    for (let j = 0; j <= str1.length; j++) {
      matrix[0][j] = j;
    }
    
    for (let i = 1; i <= str2.length; i++) {
      for (let j = 1; j <= str1.length; j++) {
        if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
          matrix[i][j] = matrix[i - 1][j - 1];
        } else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j - 1] + 1,
            matrix[i][j - 1] + 1,
            matrix[i - 1][j] + 1
          );
        }
      }
    }
    
    return matrix[str2.length][str1.length];
  }

  /**
   * Get suggestions for fixing common email issues
   */
  static getEmailFixSuggestions(email: string): string[] {
    const suggestions: string[] = [];
    
    // Check for the specific problematic email
    if (email.includes('onboarding@geniecellgene.com')) {
      suggestions.push('Try using a personal email address (Gmail, Yahoo, Outlook) instead of the organization email');
      suggestions.push('The domain geniecellgene.com might not be properly configured for email delivery');
      suggestions.push('Contact your IT administrator to verify email domain setup');
    }

    // General suggestions
    suggestions.push('Ensure the email address is typed correctly');
    suggestions.push('Try using a well-known email provider (Gmail, Yahoo, Outlook)');
    suggestions.push('Check if your email domain supports receiving emails from external services');
    
    return suggestions;
  }
}
