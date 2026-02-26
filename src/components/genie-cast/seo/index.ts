/**
 * SEO Premium Features - Barrel Export
 * 
 * Genie Cast SEO Differentiators vs Traditional Agencies:
 * 
 * | Traditional Agencies | Genie Cast SEO |
 * |---------------------|----------------|
 * | Website-focused SEO | Video-first SEO (YouTube, TikTok, LinkedIn) |
 * | Manual keyword research | AI-automated keyword extraction |
 * | Monthly reports | Real-time optimization |
 * | Separate tools | Unified cross-platform |
 * | Text-only | Multimodal (script → video → SEO) |
 * | $3K-$20K/mo retainer | Built into workflow |
 * | No content generation | End-to-end create + optimize |
 * 
 * Pricing Model (Hybrid Freemium):
 * - FREE: Basic SEO analysis, platform optimization, keyword extraction
 * - PRO: SERP Preview, enhanced recommendations
 * - BUSINESS: Real-time Trends, Performance Tracking
 * - ENTERPRISE: Competitor Analysis, API access, white-label
 */

export { CompetitorAnalysisPanel } from './CompetitorAnalysisPanel';
export { RealTimeTrendsPanel } from './RealTimeTrendsPanel';
export { SERPPreviewPanel } from './SERPPreviewPanel';
export { PerformanceTrackingPanel } from './PerformanceTrackingPanel';

// Feature tier mapping
export const SEO_FEATURE_TIERS = {
  free: [
    'basic_seo_analysis',
    'platform_optimization',
    'keyword_extraction',
    'hashtag_suggestions',
  ],
  pro: [
    'serp_preview',
    'enhanced_recommendations',
    'multi_platform_copy',
    'character_optimization',
  ],
  business: [
    'real_time_trends',
    'performance_tracking',
    'rank_monitoring',
    'velocity_analysis',
    'posting_time_optimizer',
  ],
  enterprise: [
    'competitor_analysis',
    'content_gap_detection',
    'api_access',
    'white_label',
    'custom_reports',
  ],
} as const;

// Premium feature check
export const isPremiumSEOFeature = (feature: string, userTier: 'free' | 'pro' | 'business' | 'enterprise'): boolean => {
  const tierHierarchy: Array<keyof typeof SEO_FEATURE_TIERS> = ['free', 'pro', 'business', 'enterprise'];
  const userTierIndex = tierHierarchy.indexOf(userTier);
  
  for (let i = 0; i <= userTierIndex; i++) {
    const tier = tierHierarchy[i];
    const features = SEO_FEATURE_TIERS[tier] as readonly string[];
    if (features.includes(feature)) {
      return true;
    }
  }
  return false;
};
