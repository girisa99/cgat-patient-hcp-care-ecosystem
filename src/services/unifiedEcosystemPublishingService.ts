/**
 * Unified Ecosystem Publishing Service
 * 
 * Shared publishing infrastructure across ALL Genie products:
 * - Spark, Mind, Vibe, Deck, Arc, Cast, Hub
 * 
 * Features:
 * - Multi-platform publishing (YouTube, LinkedIn, Facebook, Instagram, TikTok, X, Bluesky, Threads)
 * - Company page support (LinkedIn Company, Facebook Pages)
 * - Website/Blog integration via webhook/API
 * - Industry & Segment filtering for content targeting
 * - n8n/Zapier webhook integration
 * - Cross-product content routing
 */

import { supabase } from '@/integrations/supabase/client';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

export type GenieProduct = 'spark' | 'mind' | 'vibe' | 'deck' | 'arc' | 'cast' | 'hub';

export type PublishingPlatform = 
  | 'youtube'
  | 'linkedin_personal'
  | 'linkedin_company'
  | 'facebook_personal'
  | 'facebook_page'
  | 'instagram'
  | 'tiktok'
  | 'twitter'
  | 'bluesky'
  | 'threads'
  | 'pinterest'
  | 'website'
  | 'blog'
  | 'zapier'
  | 'n8n';

export type ContentType = 'video' | 'image' | 'audio' | 'text' | 'presentation' | 'carousel' | 'mixed';

export interface IndustrySegment {
  industry: string;
  segment?: string;
  subSegment?: string;
  targetAudience?: string;
  contentTone?: 'professional' | 'casual' | 'technical' | 'educational' | 'promotional';
}

export interface CompanyPage {
  id: string;
  name: string;
  platform: 'linkedin' | 'facebook';
  logoUrl?: string;
  followers?: number;
  isAdmin?: boolean;
}

export interface WebsiteConfig {
  id: string;
  name: string;
  type: 'website' | 'blog' | 'cms';
  webhookUrl: string;
  apiKey?: string;
  platform?: 'wordpress' | 'ghost' | 'webflow' | 'custom' | 'zapier';
  contentPath?: string;
}

export interface PublishingTarget {
  platform: PublishingPlatform;
  enabled: boolean;
  accountId?: string;
  pageId?: string; // For company pages
  pageName?: string;
  customCaption?: string;
  customTitle?: string;
  hashtags?: string[];
  visibility?: 'public' | 'private' | 'unlisted' | 'connections_only';
  scheduledAt?: string;
  industryTags?: string[];
  segmentTags?: string[];
}

export interface PublishingRequest {
  contentId: string;
  contentType: ContentType;
  contentUrl: string;
  thumbnailUrl?: string;
  title: string;
  description?: string;
  targets: PublishingTarget[];
  sourceProduct: GenieProduct;
  industryContext?: IndustrySegment;
  metadata?: Record<string, any>;
  publishAsCompanyAdmin?: boolean; // Admin can publish to all company pages
  companyPages?: CompanyPage[];
}

export interface PublishingResult {
  contentId: string;
  platform: PublishingPlatform;
  success: boolean;
  postId?: string;
  postUrl?: string;
  error?: string;
  publishedAt?: string;
  pageId?: string;
  pageName?: string;
}

export interface UserPublishingAccounts {
  personalAccounts: {
    platform: PublishingPlatform;
    connected: boolean;
    accountName?: string;
    expiresAt?: string;
  }[];
  companyPages: CompanyPage[];
  websites: WebsiteConfig[];
  webhooks: {
    id: string;
    name: string;
    type: 'zapier' | 'n8n' | 'custom';
    url: string;
  }[];
}

// ============================================================================
// INDUSTRY & SEGMENT REGISTRY
// ============================================================================

export const INDUSTRY_SEGMENTS: Record<string, string[]> = {
  'Healthcare': ['Pharma', 'Medical Devices', 'Hospitals', 'Telemedicine', 'Biotech', 'Health Insurance'],
  'Technology': ['SaaS', 'AI/ML', 'Cybersecurity', 'Cloud', 'FinTech', 'EdTech', 'HealthTech'],
  'Finance': ['Banking', 'Investment', 'Insurance', 'Wealth Management', 'Crypto', 'Lending'],
  'Education': ['K-12', 'Higher Education', 'Corporate Training', 'E-Learning', 'EdTech'],
  'Retail': ['E-commerce', 'Fashion', 'Consumer Goods', 'Luxury', 'D2C', 'Marketplace'],
  'Manufacturing': ['Automotive', 'Aerospace', 'Electronics', 'Industrial', 'Chemicals'],
  'Real Estate': ['Commercial', 'Residential', 'PropTech', 'Construction', 'Property Management'],
  'Media & Entertainment': ['Streaming', 'Gaming', 'Publishing', 'Advertising', 'Sports'],
  'Professional Services': ['Consulting', 'Legal', 'Accounting', 'HR', 'Marketing Agencies'],
  'Energy': ['Oil & Gas', 'Renewables', 'Utilities', 'Clean Tech', 'Mining'],
  'Government': ['Federal', 'State/Local', 'Defense', 'Public Health', 'Education'],
  'Non-Profit': ['Foundations', 'NGOs', 'Associations', 'Social Enterprise'],
  'Travel & Hospitality': ['Airlines', 'Hotels', 'Tourism', 'Food & Beverage', 'Events'],
  'Telecommunications': ['Carriers', 'ISPs', 'Infrastructure', '5G/IoT'],
  'Agriculture': ['AgTech', 'Farming', 'Food Production', 'Sustainability'],
};

export const PLATFORM_CONTENT_LIMITS: Record<PublishingPlatform, { titleMax: number; descMax: number; hashtagMax: number }> = {
  youtube: { titleMax: 100, descMax: 5000, hashtagMax: 15 },
  linkedin_personal: { titleMax: 200, descMax: 3000, hashtagMax: 30 },
  linkedin_company: { titleMax: 200, descMax: 3000, hashtagMax: 30 },
  facebook_personal: { titleMax: 0, descMax: 63206, hashtagMax: 30 },
  facebook_page: { titleMax: 0, descMax: 63206, hashtagMax: 30 },
  instagram: { titleMax: 0, descMax: 2200, hashtagMax: 30 },
  tiktok: { titleMax: 0, descMax: 2200, hashtagMax: 100 },
  twitter: { titleMax: 0, descMax: 280, hashtagMax: 10 },
  bluesky: { titleMax: 0, descMax: 300, hashtagMax: 10 },
  threads: { titleMax: 0, descMax: 500, hashtagMax: 30 },
  pinterest: { titleMax: 100, descMax: 500, hashtagMax: 20 },
  website: { titleMax: 200, descMax: 10000, hashtagMax: 10 },
  blog: { titleMax: 200, descMax: 50000, hashtagMax: 10 },
  zapier: { titleMax: 200, descMax: 10000, hashtagMax: 50 },
  n8n: { titleMax: 200, descMax: 10000, hashtagMax: 50 },
};

// ============================================================================
// UNIFIED PUBLISHING SERVICE
// ============================================================================

class UnifiedEcosystemPublishingService {
  private static instance: UnifiedEcosystemPublishingService;

  private constructor() {}

  static getInstance(): UnifiedEcosystemPublishingService {
    if (!UnifiedEcosystemPublishingService.instance) {
      UnifiedEcosystemPublishingService.instance = new UnifiedEcosystemPublishingService();
    }
    return UnifiedEcosystemPublishingService.instance;
  }

  // ============================================================================
  // ACCOUNT MANAGEMENT
  // ============================================================================

  /**
   * Get all publishing accounts for a user (personal + company pages + websites)
   */
  async getUserPublishingAccounts(userId: string): Promise<UserPublishingAccounts> {
    const accounts: UserPublishingAccounts = {
      personalAccounts: [],
      companyPages: [],
      websites: [],
      webhooks: []
    };

    try {
      // Get LinkedIn tokens and company pages
      const { data: linkedinTokens } = await supabase
        .from('linkedin_oauth_tokens')
        .select('expires_at, linkedin_id, profile_name, company_pages')
        .eq('user_id', userId)
        .maybeSingle();

      if (linkedinTokens && new Date(linkedinTokens.expires_at) > new Date()) {
        accounts.personalAccounts.push({
          platform: 'linkedin_personal',
          connected: true,
          accountName: linkedinTokens.profile_name,
          expiresAt: linkedinTokens.expires_at
        });

        // Add company pages
        if (linkedinTokens.company_pages) {
          const pages = linkedinTokens.company_pages as unknown as CompanyPage[];
          pages.forEach(page => {
            accounts.companyPages.push({
              ...page,
              platform: 'linkedin',
              isAdmin: true
            });
          });
        }
      }

      // Get YouTube tokens
      const { data: youtubeTokens } = await supabase
        .from('youtube_oauth_tokens')
        .select('expires_at, channel_id, channel_name')
        .eq('user_id', userId)
        .maybeSingle();

      if (youtubeTokens && new Date(youtubeTokens.expires_at) > new Date()) {
        accounts.personalAccounts.push({
          platform: 'youtube',
          connected: true,
          accountName: youtubeTokens.channel_name,
          expiresAt: youtubeTokens.expires_at
        });
      }

      // Note: webhook_configurations and website_publishing_configs tables
      // will be created via migration when user sets up integrations
      // For now, return empty arrays for these

    } catch (error) {
      console.error('[UnifiedPublishing] Error fetching accounts:', error);
    }

    return accounts;
  }

  // ============================================================================
  // PUBLISHING OPERATIONS
  // ============================================================================

  /**
   * Publish content to multiple platforms (including company pages)
   */
  async publishToMultiple(request: PublishingRequest): Promise<PublishingResult[]> {
    const results: PublishingResult[] = [];
    
    console.log('[UnifiedPublishing] Publishing to:', request.targets.map(t => t.platform).join(', '));
    console.log('[UnifiedPublishing] Source product:', request.sourceProduct);
    console.log('[UnifiedPublishing] Industry context:', request.industryContext);

    for (const target of request.targets) {
      if (!target.enabled) continue;

      try {
        const result = await this.publishToSinglePlatform(request, target);
        results.push(result);
      } catch (error) {
        console.error(`[UnifiedPublishing] Failed to publish to ${target.platform}:`, error);
        results.push({
          contentId: request.contentId,
          platform: target.platform,
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error',
          pageId: target.pageId,
          pageName: target.pageName
        });
      }
    }

    // Log publishing activity
    await this.logPublishingActivity(request, results);

    return results;
  }

  /**
   * Publish to a single platform
   */
  private async publishToSinglePlatform(
    request: PublishingRequest, 
    target: PublishingTarget
  ): Promise<PublishingResult> {
    const content = this.prepareContentForPlatform(request, target);

    // Route to appropriate handler
    switch (target.platform) {
      case 'linkedin_personal':
      case 'linkedin_company':
        return this.publishToLinkedIn(request, target, content);
      
      case 'facebook_personal':
      case 'facebook_page':
        return this.publishToFacebook(request, target, content);
      
      case 'youtube':
        return this.publishToYouTube(request, target, content);
      
      case 'twitter':
        return this.publishToTwitter(request, target, content);
      
      case 'bluesky':
        return this.publishToBluesky(request, target, content);
      
      case 'website':
      case 'blog':
        return this.publishToWebsite(request, target, content);
      
      case 'zapier':
      case 'n8n':
        return this.publishViaWebhook(request, target, content);
      
      case 'instagram':
      case 'tiktok':
      case 'threads':
      case 'pinterest':
        return this.publishToGenericSocial(request, target, content);

      default:
        return {
          contentId: request.contentId,
          platform: target.platform,
          success: false,
          error: `Platform ${target.platform} not yet implemented`
        };
    }
  }

  /**
   * Schedule content for later publishing
   */
  async schedulePublish(request: PublishingRequest, scheduledAt: string): Promise<PublishingResult[]> {
    console.log('[UnifiedPublishing] Scheduling publish for:', scheduledAt);

    // Import scheduled publishing service dynamically to avoid circular deps
    const { scheduledPublishingService } = await import('./scheduledPublishingService');

    const scheduled = await scheduledPublishingService.scheduleContent({
      content_id: request.contentId,
      content_type: request.contentType as 'video' | 'image' | 'audio' | 'text' | 'mixed',
      title: request.title,
      description: request.description,
      platforms: request.targets.map(t => ({
        platform: t.platform as any,
        enabled: t.enabled,
        custom_caption: t.customCaption,
        custom_title: t.customTitle,
        hashtags: t.hashtags,
        visibility: t.visibility as any,
      })),
      scheduled_at: scheduledAt,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      status: 'scheduled',
      created_by: 'current_user',
    });

    if (!scheduled) {
      return request.targets.map(t => ({
        contentId: request.contentId,
        platform: t.platform,
        success: false,
        error: 'Failed to schedule',
      }));
    }

    return request.targets.map(t => ({
      contentId: request.contentId,
      platform: t.platform,
      success: true,
      postId: scheduled.id,
      publishedAt: scheduledAt,
    }));
  }

  /**
   * Generic handler for platforms without dedicated handlers (Pinterest, Spotify, Reddit, etc.)
   */
  private async publishToGenericSocial(
    request: PublishingRequest,
    target: PublishingTarget,
    content: { title: string; description: string; hashtags: string[] }
  ): Promise<PublishingResult> {
    console.log(`[UnifiedPublishing] Publishing to ${target.platform} via social-publish`);

    const { data, error } = await supabase.functions.invoke('social-publish', {
      body: {
        platform: target.platform,
        content: {
          title: content.title,
          text: content.description,
          mediaUrl: request.contentUrl,
          thumbnailUrl: request.thumbnailUrl,
          contentType: request.contentType,
          tags: content.hashtags.map(h => h.replace('#', '')),
          visibility: target.visibility || 'public',
        },
        industryContext: request.industryContext,
      },
    });

    if (error) throw error;

    return {
      contentId: request.contentId,
      platform: target.platform,
      success: true,
      postId: data?.postId,
      postUrl: data?.postUrl,
      publishedAt: new Date().toISOString(),
    };
  }

  /**
   * Prepare content with platform-specific limits and formatting
   */
  private prepareContentForPlatform(
    request: PublishingRequest, 
    target: PublishingTarget
  ): { title: string; description: string; hashtags: string[] } {
    const limits = PLATFORM_CONTENT_LIMITS[target.platform];
    
    // Apply industry/segment hashtags if available
    let hashtags = [...(target.hashtags || [])];
    if (request.industryContext) {
      const industryTag = `#${request.industryContext.industry.replace(/\s+/g, '')}`;
      if (!hashtags.includes(industryTag)) {
        hashtags.unshift(industryTag);
      }
      if (request.industryContext.segment) {
        const segmentTag = `#${request.industryContext.segment.replace(/\s+/g, '')}`;
        if (!hashtags.includes(segmentTag)) {
          hashtags.push(segmentTag);
        }
      }
    }

    // Limit hashtags
    hashtags = hashtags.slice(0, limits.hashtagMax);

    // Format title and description
    let title = target.customTitle || request.title;
    let description = target.customCaption || request.description || '';

    if (limits.titleMax > 0) {
      title = title.substring(0, limits.titleMax);
    }

    // Append hashtags to description for platforms that support it
    const hashtagString = hashtags.join(' ');
    const maxDescWithHashtags = limits.descMax - hashtagString.length - 2;
    description = description.substring(0, maxDescWithHashtags) + '\n\n' + hashtagString;

    return { title, description, hashtags };
  }

  // ============================================================================
  // PLATFORM-SPECIFIC HANDLERS
  // ============================================================================

  private async publishToLinkedIn(
    request: PublishingRequest, 
    target: PublishingTarget,
    content: { title: string; description: string; hashtags: string[] }
  ): Promise<PublishingResult> {
    const isCompanyPage = target.platform === 'linkedin_company';
    
    console.log(`[UnifiedPublishing] Publishing to LinkedIn ${isCompanyPage ? 'Company Page' : 'Personal'}`);

    // Call edge function for LinkedIn publishing
    const { data, error } = await supabase.functions.invoke('social-publish', {
      body: {
        platform: 'linkedin',
        isCompanyPage,
        pageId: target.pageId,
        content: {
          text: content.description,
          mediaUrl: request.contentUrl,
          thumbnailUrl: request.thumbnailUrl,
          contentType: request.contentType
        },
        industryContext: request.industryContext
      }
    });

    if (error) throw error;

    return {
      contentId: request.contentId,
      platform: target.platform,
      success: true,
      postId: data?.postId,
      postUrl: data?.postUrl,
      publishedAt: new Date().toISOString(),
      pageId: target.pageId,
      pageName: target.pageName
    };
  }

  private async publishToFacebook(
    request: PublishingRequest, 
    target: PublishingTarget,
    content: { title: string; description: string; hashtags: string[] }
  ): Promise<PublishingResult> {
    const isPage = target.platform === 'facebook_page';
    
    console.log(`[UnifiedPublishing] Publishing to Facebook ${isPage ? 'Page' : 'Personal'}`);

    const { data, error } = await supabase.functions.invoke('social-publish', {
      body: {
        platform: 'facebook',
        isPage,
        pageId: target.pageId,
        content: {
          message: content.description,
          mediaUrl: request.contentUrl,
          contentType: request.contentType
        },
        industryContext: request.industryContext
      }
    });

    if (error) throw error;

    return {
      contentId: request.contentId,
      platform: target.platform,
      success: true,
      postId: data?.postId,
      postUrl: data?.postUrl,
      publishedAt: new Date().toISOString(),
      pageId: target.pageId,
      pageName: target.pageName
    };
  }

  private async publishToYouTube(
    request: PublishingRequest, 
    target: PublishingTarget,
    content: { title: string; description: string; hashtags: string[] }
  ): Promise<PublishingResult> {
    console.log('[UnifiedPublishing] Publishing to YouTube');

    const { data, error } = await supabase.functions.invoke('social-publish', {
      body: {
        platform: 'youtube',
        content: {
          title: content.title,
          description: content.description,
          videoUrl: request.contentUrl,
          thumbnailUrl: request.thumbnailUrl,
          visibility: target.visibility || 'public',
          tags: content.hashtags.map(h => h.replace('#', ''))
        },
        industryContext: request.industryContext
      }
    });

    if (error) throw error;

    return {
      contentId: request.contentId,
      platform: target.platform,
      success: true,
      postId: data?.videoId,
      postUrl: data?.videoUrl,
      publishedAt: new Date().toISOString()
    };
  }

  private async publishToTwitter(
    request: PublishingRequest, 
    target: PublishingTarget,
    content: { title: string; description: string; hashtags: string[] }
  ): Promise<PublishingResult> {
    console.log('[UnifiedPublishing] Publishing to Twitter/X');

    const { data, error } = await supabase.functions.invoke('social-publish', {
      body: {
        platform: 'twitter',
        content: {
          text: content.description.substring(0, 280),
          mediaUrl: request.contentUrl
        },
        industryContext: request.industryContext
      }
    });

    if (error) throw error;

    return {
      contentId: request.contentId,
      platform: target.platform,
      success: true,
      postId: data?.tweetId,
      postUrl: data?.tweetUrl,
      publishedAt: new Date().toISOString()
    };
  }

  private async publishToBluesky(
    request: PublishingRequest, 
    target: PublishingTarget,
    content: { title: string; description: string; hashtags: string[] }
  ): Promise<PublishingResult> {
    console.log('[UnifiedPublishing] Publishing to Bluesky');

    const { data, error } = await supabase.functions.invoke('social-publish', {
      body: {
        platform: 'bluesky',
        content: {
          text: content.description.substring(0, 300),
          mediaUrl: request.contentUrl
        },
        industryContext: request.industryContext
      }
    });

    if (error) throw error;

    return {
      contentId: request.contentId,
      platform: target.platform,
      success: true,
      postId: data?.postId,
      postUrl: data?.postUrl,
      publishedAt: new Date().toISOString()
    };
  }

  private async publishToWebsite(
    request: PublishingRequest, 
    target: PublishingTarget,
    content: { title: string; description: string; hashtags: string[] }
  ): Promise<PublishingResult> {
    console.log('[UnifiedPublishing] Publishing to Website/Blog');

    // Website publishing requires webhook URL in target metadata
    const webhookUrl = request.metadata?.websiteWebhookUrl || target.customCaption;
    const apiKey = request.metadata?.websiteApiKey;

    if (!webhookUrl) {
      throw new Error('Website webhook URL not configured');
    }

    // Call webhook with content
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(apiKey ? { 'Authorization': `Bearer ${apiKey}` } : {})
      },
      body: JSON.stringify({
        title: content.title,
        content: content.description,
        mediaUrl: request.contentUrl,
        thumbnailUrl: request.thumbnailUrl,
        contentType: request.contentType,
        tags: content.hashtags,
        industryContext: request.industryContext,
        source: request.sourceProduct,
        publishedAt: new Date().toISOString()
      })
    });

    if (!response.ok) {
      throw new Error(`Website publish failed: ${response.statusText}`);
    }

    let result = {};
    try {
      result = await response.json();
    } catch {
      // Response may not be JSON
    }

    return {
      contentId: request.contentId,
      platform: target.platform,
      success: true,
      postId: (result as any).postId,
      postUrl: (result as any).postUrl,
      publishedAt: new Date().toISOString()
    };
  }

  private async publishViaWebhook(
    request: PublishingRequest, 
    target: PublishingTarget,
    content: { title: string; description: string; hashtags: string[] }
  ): Promise<PublishingResult> {
    console.log(`[UnifiedPublishing] Publishing via ${target.platform} webhook`);

    // Webhook URL should be in target metadata or accountId
    const webhookUrl = request.metadata?.webhookUrl || target.customCaption;

    if (!webhookUrl) {
      throw new Error('Webhook URL not configured');
    }

    // Call webhook
    await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      mode: 'no-cors', // Handle CORS for external webhooks
      body: JSON.stringify({
        title: content.title,
        description: content.description,
        mediaUrl: request.contentUrl,
        thumbnailUrl: request.thumbnailUrl,
        contentType: request.contentType,
        hashtags: content.hashtags,
        industryContext: request.industryContext,
        sourceProduct: request.sourceProduct,
        timestamp: new Date().toISOString(),
        metadata: request.metadata
      })
    });

    return {
      contentId: request.contentId,
      platform: target.platform,
      success: true,
      publishedAt: new Date().toISOString()
    };
  }

  // ============================================================================
  // COMPANY ADMIN OPERATIONS
  // ============================================================================

  /**
   * Admin publish to all company pages at once
   */
  async adminPublishToAllCompanyPages(
    request: PublishingRequest,
    companyPages: CompanyPage[]
  ): Promise<PublishingResult[]> {
    console.log(`[UnifiedPublishing] Admin publishing to ${companyPages.length} company pages`);

    const targets: PublishingTarget[] = companyPages.map(page => ({
      platform: page.platform === 'linkedin' ? 'linkedin_company' : 'facebook_page',
      enabled: true,
      pageId: page.id,
      pageName: page.name,
      hashtags: request.targets[0]?.hashtags,
      customCaption: request.targets[0]?.customCaption
    }));

    return this.publishToMultiple({
      ...request,
      targets,
      publishAsCompanyAdmin: true
    });
  }

  // ============================================================================
  // INDUSTRY/SEGMENT FILTERING
  // ============================================================================

  /**
   * Filter content suggestions based on industry/segment
   */
  getIndustryHashtags(industry: string, segment?: string): string[] {
    const industryHashtags: Record<string, string[]> = {
      'Healthcare': ['#healthcare', '#healthtech', '#medtech', '#digitalhealth', '#patientcare'],
      'Technology': ['#tech', '#innovation', '#digital', '#startup', '#saas', '#ai'],
      'Finance': ['#fintech', '#banking', '#investment', '#finance', '#wealthmanagement'],
      'Education': ['#edtech', '#learning', '#education', '#elearning', '#training'],
      'Retail': ['#retail', '#ecommerce', '#shopping', '#d2c', '#marketplace'],
      'Manufacturing': ['#manufacturing', '#industry40', '#automation', '#supply chain'],
      'Real Estate': ['#realestate', '#property', '#proptech', '#commercial', '#residential'],
      'Media & Entertainment': ['#media', '#entertainment', '#streaming', '#content', '#creative'],
    };

    const tags = industryHashtags[industry] || [`#${industry.toLowerCase().replace(/\s+/g, '')}`];
    
    if (segment) {
      tags.push(`#${segment.toLowerCase().replace(/\s+/g, '')}`);
    }

    return tags;
  }

  /**
   * Get optimal posting times for industry/segment
   */
  getOptimalPostingTimes(industry: string, platform: PublishingPlatform): { day: number; hour: number }[] {
    // B2B industries work better on weekdays, B2C on evenings/weekends
    const b2bIndustries = ['Healthcare', 'Technology', 'Finance', 'Professional Services', 'Manufacturing'];
    const isB2B = b2bIndustries.includes(industry);

    if (isB2B) {
      // B2B: Tuesday-Thursday, business hours
      return [
        { day: 2, hour: 10 }, // Tuesday 10am
        { day: 3, hour: 14 }, // Wednesday 2pm
        { day: 4, hour: 9 },  // Thursday 9am
      ];
    } else {
      // B2C: Evenings and weekends
      return [
        { day: 5, hour: 19 }, // Friday 7pm
        { day: 6, hour: 11 }, // Saturday 11am
        { day: 0, hour: 15 }, // Sunday 3pm
      ];
    }
  }

  // ============================================================================
  // LOGGING & ANALYTICS
  // ============================================================================

  private async logPublishingActivity(
    request: PublishingRequest,
    results: PublishingResult[]
  ): Promise<void> {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      // Log to console for now - publishing_activity_log table can be added later
      console.log('[UnifiedPublishing] Activity log:', {
        user_id: session.user.id,
        content_id: request.contentId,
        content_type: request.contentType,
        source_product: request.sourceProduct,
        platforms_targeted: request.targets.map(t => t.platform),
        platforms_succeeded: results.filter(r => r.success).map(r => r.platform),
        platforms_failed: results.filter(r => !r.success).map(r => r.platform),
        industry_context: request.industryContext,
        company_pages_used: request.companyPages?.map(p => p.id) || [],
        published_as_admin: request.publishAsCompanyAdmin || false
      });
    } catch (error) {
      console.error('[UnifiedPublishing] Failed to log activity:', error);
    }
  }
}

export const unifiedEcosystemPublishingService = UnifiedEcosystemPublishingService.getInstance();
