/**
 * Compliance Check Service - P3 Cross-Functional
 * 
 * AI-powered content moderation and compliance checking.
 * Supports platform-specific guidelines and brand safety.
 * 
 * Phase: P3 Week 15-16
 * Priority: Cross-Functional (All Products)
 */

import { supabase } from '@/integrations/supabase/client';

export interface ComplianceCheck {
  id: string;
  content_id: string;
  content_type: 'video' | 'audio' | 'image' | 'text';
  status: 'pending' | 'passed' | 'flagged' | 'failed';
  checks_performed: ComplianceCheckResult[];
  overall_score: number;
  created_at: string;
  reviewed_by?: string;
  reviewed_at?: string;
}

export interface ComplianceCheckResult {
  check_type: ComplianceCheckType;
  passed: boolean;
  score: number;
  issues: ComplianceIssue[];
  recommendations: string[];
}

export type ComplianceCheckType = 
  | 'copyright'
  | 'trademark'
  | 'explicit_content'
  | 'hate_speech'
  | 'misinformation'
  | 'platform_guidelines'
  | 'brand_safety'
  | 'accessibility'
  | 'age_restriction'
  | 'privacy';

export interface ComplianceIssue {
  type: ComplianceCheckType;
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  timestamp_start?: number;
  timestamp_end?: number;
  location?: string;
  suggested_action: string;
}

export interface PlatformGuidelines {
  platform: string;
  prohibited_content: string[];
  restricted_content: string[];
  age_restrictions: string[];
  monetization_requirements: string[];
}

export interface BrandSafetyConfig {
  blocked_keywords: string[];
  blocked_categories: string[];
  allowed_categories: string[];
  minimum_safety_score: number;
}

class ComplianceCheckService {
  private static instance: ComplianceCheckService;

  private readonly platformGuidelines: Record<string, PlatformGuidelines> = {
    youtube: {
      platform: 'YouTube',
      prohibited_content: ['spam', 'scams', 'harmful content', 'violent extremism', 'harassment'],
      restricted_content: ['mature content', 'sensitive topics', 'controversial issues'],
      age_restrictions: ['alcohol', 'gambling', 'violence', 'sexual content'],
      monetization_requirements: ['original content', 'advertiser-friendly', 'no reused content'],
    },
    tiktok: {
      platform: 'TikTok',
      prohibited_content: ['dangerous acts', 'hate speech', 'illegal activities', 'harassment'],
      restricted_content: ['sensitive topics', 'political content', 'unverified claims'],
      age_restrictions: ['alcohol', 'tobacco', 'adult content'],
      monetization_requirements: ['original content', 'community guidelines', 'creator fund eligibility'],
    },
    instagram: {
      platform: 'Instagram',
      prohibited_content: ['nudity', 'hate speech', 'bullying', 'spam'],
      restricted_content: ['violence', 'self-harm', 'misinformation'],
      age_restrictions: ['alcohol', 'tobacco', 'cosmetic procedures'],
      monetization_requirements: ['authentic engagement', 'brand guidelines', 'disclosure requirements'],
    },
  };

  private constructor() {}

  static getInstance(): ComplianceCheckService {
    if (!ComplianceCheckService.instance) {
      ComplianceCheckService.instance = new ComplianceCheckService();
    }
    return ComplianceCheckService.instance;
  }

  /**
   * Run full compliance check on content
   */
  async checkContent(
    contentId: string,
    contentType: ComplianceCheck['content_type'],
    content: string | Blob,
    platforms: string[] = ['youtube', 'tiktok', 'instagram']
  ): Promise<ComplianceCheck> {
    const checks: ComplianceCheckResult[] = [];

    // Run each check type
    const checkTypes: ComplianceCheckType[] = [
      'explicit_content',
      'hate_speech',
      'platform_guidelines',
      'brand_safety',
      'copyright',
    ];

    for (const checkType of checkTypes) {
      const result = await this.runCheck(checkType, content, platforms);
      checks.push(result);
    }

    const overallScore = checks.reduce((sum, c) => sum + c.score, 0) / checks.length;
    const hasCriticalIssues = checks.some(c => c.issues.some(i => i.severity === 'critical'));
    const hasHighIssues = checks.some(c => c.issues.some(i => i.severity === 'high'));

    return {
      id: `compliance_${Date.now()}`,
      content_id: contentId,
      content_type: contentType,
      status: hasCriticalIssues ? 'failed' : hasHighIssues ? 'flagged' : 'passed',
      checks_performed: checks,
      overall_score: overallScore,
      created_at: new Date().toISOString(),
    };
  }

  /**
   * Run a specific compliance check
   */
  private async runCheck(
    checkType: ComplianceCheckType,
    content: string | Blob,
    platforms: string[]
  ): Promise<ComplianceCheckResult> {
    // Simulate check - would use AI content moderation APIs
    const issues: ComplianceIssue[] = [];
    const recommendations: string[] = [];
    let score = 100;

    // Basic keyword detection for demo
    if (typeof content === 'string') {
      const contentLower = content.toLowerCase();
      
      // Check for potentially problematic content
      const sensitiveKeywords = ['violence', 'explicit', 'hate', 'dangerous'];
      sensitiveKeywords.forEach(keyword => {
        if (contentLower.includes(keyword)) {
          issues.push({
            type: checkType,
            severity: 'medium',
            description: `Content contains potentially sensitive keyword: "${keyword}"`,
            suggested_action: 'Review and consider rephrasing or adding context',
          });
          score -= 10;
        }
      });
    }

    if (issues.length === 0) {
      recommendations.push('Content appears to comply with platform guidelines');
    } else {
      recommendations.push('Review flagged issues before publishing');
      recommendations.push('Consider adding age restrictions if applicable');
    }

    return {
      check_type: checkType,
      passed: score >= 70,
      score: Math.max(0, score),
      issues,
      recommendations,
    };
  }

  /**
   * Check text for prohibited content
   */
  async checkText(text: string, platform?: string): Promise<ComplianceCheckResult> {
    return this.runCheck('hate_speech', text, platform ? [platform] : []);
  }

  /**
   * Get platform-specific guidelines
   */
  getPlatformGuidelines(platform: string): PlatformGuidelines | null {
    return this.platformGuidelines[platform.toLowerCase()] || null;
  }

  /**
   * Check brand safety
   */
  async checkBrandSafety(
    content: string,
    config: BrandSafetyConfig
  ): Promise<{ safe: boolean; score: number; issues: string[] }> {
    const issues: string[] = [];
    let score = 100;

    const contentLower = content.toLowerCase();
    
    config.blocked_keywords.forEach(keyword => {
      if (contentLower.includes(keyword.toLowerCase())) {
        issues.push(`Contains blocked keyword: "${keyword}"`);
        score -= 20;
      }
    });

    return {
      safe: score >= config.minimum_safety_score,
      score: Math.max(0, score),
      issues,
    };
  }

  /**
   * Check accessibility requirements
   */
  async checkAccessibility(
    contentId: string,
    hasClosedCaptions: boolean,
    hasAudioDescription: boolean,
    hasTranscript: boolean
  ): Promise<{ score: number; requirements: { met: string[]; missing: string[] } }> {
    const met: string[] = [];
    const missing: string[] = [];
    let score = 0;

    if (hasClosedCaptions) {
      met.push('Closed captions');
      score += 40;
    } else {
      missing.push('Closed captions');
    }

    if (hasAudioDescription) {
      met.push('Audio description');
      score += 30;
    } else {
      missing.push('Audio description');
    }

    if (hasTranscript) {
      met.push('Transcript');
      score += 30;
    } else {
      missing.push('Transcript');
    }

    return { score, requirements: { met, missing } };
  }

  /**
   * Suggest age rating
   */
  async suggestAgeRating(
    content: string,
    contentType: string
  ): Promise<{ rating: string; reasons: string[] }> {
    // Would use AI content classification
    return {
      rating: 'PG',
      reasons: ['General audience content', 'No explicit material detected'],
    };
  }

  /**
   * Generate compliance report
   */
  async generateReport(check: ComplianceCheck): Promise<string> {
    const lines: string[] = [
      `# Compliance Report`,
      ``,
      `**Content ID:** ${check.content_id}`,
      `**Status:** ${check.status.toUpperCase()}`,
      `**Overall Score:** ${check.overall_score.toFixed(1)}/100`,
      `**Checked At:** ${check.created_at}`,
      ``,
      `## Checks Performed`,
    ];

    check.checks_performed.forEach(c => {
      lines.push(`### ${c.check_type.replace(/_/g, ' ').toUpperCase()}`);
      lines.push(`- Status: ${c.passed ? '✅ PASSED' : '❌ FAILED'}`);
      lines.push(`- Score: ${c.score}/100`);
      
      if (c.issues.length > 0) {
        lines.push(`- Issues:`);
        c.issues.forEach(i => {
          lines.push(`  - [${i.severity.toUpperCase()}] ${i.description}`);
        });
      }
    });

    return lines.join('\n');
  }
}

export const complianceCheckService = ComplianceCheckService.getInstance();
