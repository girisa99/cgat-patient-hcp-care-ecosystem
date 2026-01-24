/**
 * Genie Studio Dogfooding Marketing Engine
 * 
 * Uses Genie Studio's own capabilities to market itself across
 * all 14 regional bundles with AI avatars, voice, 3D, and auto-generated messaging.
 * 
 * "We eat our own dogfood" - generating daily showcases, demos, and campaigns
 * using the same pipelines our users access.
 */

import { LANGUAGE_BUNDLES, type BundleType } from './regionLanguageBundles';
import { VIDEO_AESTHETIC_PREFERENCES } from './regionalVideoStylesRegistry';
import { RegionalContentTypesRegistry } from './regionalContentTypesRegistry';
import { AVATAR_APPEARANCE_PREFERENCES } from './regionalAvatarGuidelines';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

export type ContentFormat = 
  | 'video_avatar'      // AI Avatar presenter video
  | 'video_animated'    // Motion graphics / animated
  | 'video_3d'          // 3D immersive content
  | 'video_journey'     // Step-by-step journey
  | 'shorts_vertical'   // TikTok/Reels/Shorts
  | 'carousel'          // LinkedIn/Instagram carousel
  | 'thread'            // Twitter/LinkedIn thread
  | 'blog_post'         // SEO blog article
  | 'infographic'       // Static visual
  | 'podcast_clip';     // Audio with visuals

export type Platform = 
  | 'linkedin' | 'youtube' | 'youtube_shorts'
  | 'tiktok' | 'instagram_reels' | 'instagram_feed'
  | 'twitter' | 'facebook' | 'blog' | 'threads';

export type ContentCategory =
  | 'feature_showcase'      // Individual feature demo
  | 'product_overview'      // Full product walkthrough
  | 'use_case_demo'         // Industry-specific use case
  | 'comparison'            // vs competitors
  | 'tutorial'              // How-to content
  | 'behind_the_scenes'     // Building Genie content
  | 'customer_story'        // Success stories
  | 'thought_leadership'    // Industry insights
  | 'quick_tip'             // 30-60s tips
  | 'release_announcement'; // New feature launches

export interface MarketingContent {
  id: string;
  category: ContentCategory;
  format: ContentFormat;
  platforms: Platform[];
  regionalBundle: BundleType;
  language: string;
  
  // Auto-generated content
  headline: string;
  hook: string;
  body: string;
  cta: string;
  hashtags: string[];
  
  // Media specifications
  mediaConfig: {
    duration: number;
    aspectRatio: '16:9' | '9:16' | '1:1' | '4:5';
    hasAvatar: boolean;
    avatarStyle?: string;
    voiceId?: string;
    musicStyle?: string;
    has3D: boolean;
    hasAnimation: boolean;
  };
  
  // Scheduling
  scheduledAt: Date;
  timezone: string;
  optimalTimeSlot: boolean;
  
  // Status
  status: 'draft' | 'generating' | 'ready' | 'scheduled' | 'published' | 'failed';
  generatedAssets?: {
    videoUrl?: string;
    thumbnailUrl?: string;
    audioUrl?: string;
    transcriptUrl?: string;
  };
}

export interface PositioningMessage {
  productId: string;
  productName: string;
  tagline: string;
  valueProposition: string;
  painPoints: string[];
  benefits: string[];
  differentiators: string[];
  targetAudience: string[];
  toneKeywords: string[];
  avoidWords: string[];
}

export interface DailyContentPlan {
  date: string;
  regionalBundles: BundleType[];
  contentItems: MarketingContent[];
  totalPieces: number;
  platformDistribution: Record<Platform, number>;
}

// ============================================================================
// PRODUCT POSITIONING & MESSAGING CATALOG
// ============================================================================

export const GENIE_PRODUCT_POSITIONING: Record<string, PositioningMessage> = {
  spark: {
    productId: 'spark',
    productName: 'Genie Spark',
    tagline: 'From blank canvas to brilliant content in minutes',
    valueProposition: 'AI-guided ideation that transforms your rough ideas into polished scripts, presentations, and videos',
    painPoints: [
      'Staring at a blank page for hours',
      'Ideas stuck in your head, not on screen',
      'Struggling to structure content logically',
      'Wasting time on formatting instead of creating',
    ],
    benefits: [
      'Script-to-screen in under 5 minutes',
      'AI suggests structure, you refine',
      '10+ content frameworks built-in',
      'One idea → multiple format outputs',
    ],
    differentiators: [
      'Only tool with "Mind-to-Media" pipeline',
      'Context-aware suggestions based on industry',
      'Multi-format output from single input',
    ],
    targetAudience: ['Creators', 'Marketers', 'Educators', 'Solopreneurs'],
    toneKeywords: ['effortless', 'creative', 'quick', 'guided'],
    avoidWords: ['cheap', 'easy', 'simple'],
  },
  
  mind: {
    productId: 'mind',
    productName: 'Genie Mind',
    tagline: 'Your knowledge, amplified by AI',
    valueProposition: 'Turn your expertise into content that teaches, sells, and scales—powered by your own knowledge base',
    painPoints: [
      'Knowledge trapped in documents and notes',
      'Repeating the same explanations endlessly',
      'Content that doesn\'t sound like you',
      'AI that doesn\'t understand your domain',
    ],
    benefits: [
      'RAG-powered generation from YOUR content',
      'Consistent brand voice across all outputs',
      'Knowledge base grows with every creation',
      'Domain-specific accuracy, not generic AI',
    ],
    differentiators: [
      'Personal knowledge base integration',
      'Learns your terminology and style',
      'Enterprise-grade document processing',
    ],
    targetAudience: ['Subject Matter Experts', 'Consultants', 'Course Creators', 'Enterprises'],
    toneKeywords: ['intelligent', 'personalized', 'expert', 'authentic'],
    avoidWords: ['automated', 'robotic', 'generic'],
  },
  
  vibe: {
    productId: 'vibe',
    productName: 'Genie Vibe',
    tagline: 'Capture now, create later—anywhere',
    valueProposition: 'Mobile-first recording with AI auto-edits, meeting intelligence, and seamless cloud sync',
    painPoints: [
      'Missing great ideas because you weren\'t at your desk',
      'Hours spent editing raw footage',
      'Meeting recordings no one watches',
      'Content creation tied to expensive equipment',
    ],
    benefits: [
      'One-tap recording on any device',
      'AI auto-edits remove ums, pauses, mistakes',
      'Meeting summaries and action items extracted',
      'Offline recording with cloud sync',
    ],
    differentiators: [
      'Only platform with mobile capture-to-publish',
      'AI meeting intelligence built-in',
      'Works offline, syncs when connected',
    ],
    targetAudience: ['Remote Teams', 'Field Professionals', 'Podcasters', 'Vloggers'],
    toneKeywords: ['mobile', 'instant', 'smart', 'flexible'],
    avoidWords: ['complicated', 'desktop-only', 'manual'],
  },
  
  deck: {
    productId: 'deck',
    productName: 'Genie Deck',
    tagline: 'Presentations that don\'t break on export',
    valueProposition: 'High-fidelity slide generation with perfect PPTX exports, video conversion, and 70+ language dubbing',
    painPoints: [
      'Exports that look nothing like the preview',
      'Fonts missing, layouts shifted, colors wrong',
      'Hours reformatting for different audiences',
      'No way to turn slides into video',
    ],
    benefits: [
      'WYSIWYG exports—what you see IS what you get',
      'One deck → video with AI narrator',
      '120+ fonts for global audiences',
      'RTL and CJK layout support',
    ],
    differentiators: [
      'Only tool solving "broken export" problem',
      'Presentation-to-video in one click',
      'Enterprise template library',
    ],
    targetAudience: ['Sales Teams', 'Trainers', 'Executives', 'Agencies'],
    toneKeywords: ['professional', 'reliable', 'polished', 'global'],
    avoidWords: ['basic', 'limited', 'template-only'],
  },
  
  arc: {
    productId: 'arc',
    productName: 'Genie Arc (Production Hub)',
    tagline: 'Agency-quality production, zero agency cost',
    valueProposition: 'Full video production suite with AI avatars, lip-sync, 3D, VR, and multi-platform publishing',
    painPoints: [
      'Production costs eating your budget',
      'Weeks of turnaround for simple videos',
      'Hiring actors, studios, editors for each project',
      'Platform-specific reformatting nightmares',
    ],
    benefits: [
      'AI avatars that look and sound human',
      'Same video → every platform format',
      'Voice cloning for consistent presenters',
      'Bulk processing for content at scale',
    ],
    differentiators: [
      'Full-body AI avatars (not just faces)',
      'Lip-sync in 70+ languages',
      'Priority rendering for enterprise',
    ],
    targetAudience: ['Content Teams', 'Marketing Agencies', 'L&D Departments', 'Media Companies'],
    toneKeywords: ['production', 'scale', 'premium', 'automated'],
    avoidWords: ['cheap', 'amateur', 'DIY'],
  },
  
  hub: {
    productId: 'hub',
    productName: 'Genie Hub',
    tagline: 'Your entire content operation, unified',
    valueProposition: 'Enterprise command center for content strategy, team collaboration, compliance, and analytics',
    painPoints: [
      'Content scattered across 10+ tools',
      'No visibility into what\'s working',
      'Compliance reviews slowing everything down',
      'Teams working in silos',
    ],
    benefits: [
      'Single dashboard for all content',
      'Real-time performance analytics',
      'Built-in compliance workflows',
      'White-label for agencies',
    ],
    differentiators: [
      'HIPAA-compliant for healthcare',
      'Multi-tenant architecture',
      'API access for custom integrations',
    ],
    targetAudience: ['Enterprise Teams', 'Healthcare Organizations', 'Agencies', 'Multi-brand Companies'],
    toneKeywords: ['enterprise', 'unified', 'compliant', 'scalable'],
    avoidWords: ['startup', 'basic', 'limited'],
  },
};

// ============================================================================
// FEATURE SHOWCASE CATALOG
// ============================================================================

export const FEATURE_SHOWCASE_TOPICS = [
  // Spark Features
  { product: 'spark', feature: 'Script Generator', hook: 'Turn a sentence into a full video script' },
  { product: 'spark', feature: 'Content Frameworks', hook: '10+ proven frameworks for any content type' },
  { product: 'spark', feature: 'Multi-format Output', hook: 'One idea → PPT + Video + Blog + Social' },
  
  // Mind Features
  { product: 'mind', feature: 'Knowledge Base RAG', hook: 'AI that actually knows YOUR business' },
  { product: 'mind', feature: 'Document Processing', hook: 'Upload PDFs, get content that sounds like you' },
  { product: 'mind', feature: 'Brand Voice Learning', hook: 'AI that writes in YOUR style' },
  
  // Vibe Features
  { product: 'vibe', feature: 'Mobile Recording', hook: 'Record anywhere, publish everywhere' },
  { product: 'vibe', feature: 'Auto-Edit AI', hook: 'AI removes ums, pauses, and mistakes' },
  { product: 'vibe', feature: 'Meeting Intelligence', hook: 'Turn meetings into action items automatically' },
  
  // Deck Features
  { product: 'deck', feature: 'PPTX Export', hook: 'Exports that actually look like your design' },
  { product: 'deck', feature: 'Slide-to-Video', hook: 'Turn any presentation into a video' },
  { product: 'deck', feature: '70+ Language Dubbing', hook: 'One deck, 70+ languages, one click' },
  
  // Arc Features
  { product: 'arc', feature: 'AI Avatars', hook: 'Human-like presenters without humans' },
  { product: 'arc', feature: 'Lip-Sync', hook: 'Perfect lip-sync in any language' },
  { product: 'arc', feature: 'Voice Cloning', hook: 'Clone your voice for consistent content' },
  { product: 'arc', feature: '3D & VR Content', hook: 'Immersive experiences, no 3D skills needed' },
  { product: 'arc', feature: 'Bulk Processing', hook: '100 videos, same effort as 1' },
  
  // Hub Features
  { product: 'hub', feature: 'Analytics Dashboard', hook: 'See what\'s working across all platforms' },
  { product: 'hub', feature: 'Team Collaboration', hook: 'Everyone on the same page, literally' },
  { product: 'hub', feature: 'Compliance Workflows', hook: 'HIPAA-compliant content at scale' },
  { product: 'hub', feature: 'White Label', hook: 'Your brand, our engine' },
];

// ============================================================================
// REGIONAL CONTENT VARIATIONS
// ============================================================================

interface RegionalHookStyle {
  style: string;
  ctaStyle: string;
  emotionalTone: string;
}

const REGIONAL_HOOKS: Partial<Record<BundleType, RegionalHookStyle>> & Record<string, RegionalHookStyle> = {
  english_core: { 
    style: 'Direct benefit-focused', 
    ctaStyle: 'Action-oriented (Try now, Get started)', 
    emotionalTone: 'Confident, ambitious' 
  },
  europe: { 
    style: 'Quality and precision emphasis', 
    ctaStyle: 'Professional (Learn more, Discover)', 
    emotionalTone: 'Sophisticated, reliable' 
  },
  asia: { 
    style: 'Harmony and efficiency focus', 
    ctaStyle: 'Respectful (Explore, Experience)', 
    emotionalTone: 'Refined, innovative' 
  },
  india: { 
    style: 'Value and growth emphasis', 
    ctaStyle: 'Aspirational (Unlock, Transform)', 
    emotionalTone: 'Optimistic, ambitious' 
  },
  mea: { 
    style: 'Trust and partnership focus', 
    ctaStyle: 'Relationship-based (Connect, Partner)', 
    emotionalTone: 'Respectful, premium' 
  },
  africa: { 
    style: 'Empowerment and opportunity', 
    ctaStyle: 'Inspiring (Build, Create)', 
    emotionalTone: 'Energetic, hopeful' 
  },
  latam: { 
    style: 'Passion and connection', 
    ctaStyle: 'Warm (Join us, Let\'s go)', 
    emotionalTone: 'Enthusiastic, friendly' 
  },
};

// ============================================================================
// DAILY CONTENT GENERATION ENGINE
// ============================================================================

class DogfoodingMarketingEngine {
  private static instance: DogfoodingMarketingEngine;

  static getInstance(): DogfoodingMarketingEngine {
    if (!this.instance) {
      this.instance = new DogfoodingMarketingEngine();
    }
    return this.instance;
  }

  /**
   * Generate daily content plan for all regions
   */
  generateDailyPlan(date: Date = new Date()): DailyContentPlan {
    const bundles = Object.keys(LANGUAGE_BUNDLES) as BundleType[];
    const contentItems: MarketingContent[] = [];

    // Rotate through features each day
    const dayOfYear = Math.floor((date.getTime() - new Date(date.getFullYear(), 0, 0).getTime()) / 86400000);
    const featureIndex = dayOfYear % FEATURE_SHOWCASE_TOPICS.length;
    const todayFeature = FEATURE_SHOWCASE_TOPICS[featureIndex];

    // Generate content for each regional bundle
    for (const bundle of bundles) {
      const bundleConfig = LANGUAGE_BUNDLES[bundle];
      const regionalHook = REGIONAL_HOOKS[bundle] || REGIONAL_HOOKS.english_core;
      
      // Generate multiple format variations per region
      const formats: { format: ContentFormat; platforms: Platform[] }[] = [
        { format: 'video_avatar', platforms: ['linkedin', 'youtube'] },
        { format: 'shorts_vertical', platforms: ['tiktok', 'instagram_reels', 'youtube_shorts'] },
        { format: 'carousel', platforms: ['linkedin', 'instagram_feed'] },
        { format: 'thread', platforms: ['twitter', 'linkedin'] },
      ];

      for (const { format, platforms } of formats) {
        const content = this.generateContent({
          category: 'feature_showcase',
          format,
          platforms,
          bundle,
          language: bundleConfig.primaryLanguage,
          feature: todayFeature,
          regionalHook,
          date,
        });
        contentItems.push(content);
      }
    }

    return {
      date: date.toISOString().split('T')[0],
      regionalBundles: bundles,
      contentItems,
      totalPieces: contentItems.length,
      platformDistribution: this.calculatePlatformDistribution(contentItems),
    };
  }

  /**
   * Generate individual content piece with auto-generated messaging
   */
  private generateContent(params: {
    category: ContentCategory;
    format: ContentFormat;
    platforms: Platform[];
    bundle: BundleType;
    language: string;
    feature: typeof FEATURE_SHOWCASE_TOPICS[0];
    regionalHook: typeof REGIONAL_HOOKS[BundleType];
    date: Date;
  }): MarketingContent {
    const { category, format, platforms, bundle, language, feature, regionalHook, date } = params;
    const product = GENIE_PRODUCT_POSITIONING[feature.product];
    
    // Auto-generate messaging based on product positioning + regional style
    const headline = this.generateHeadline(product, feature, regionalHook);
    const hook = this.generateHook(feature, regionalHook);
    const body = this.generateBody(product, feature, regionalHook);
    const cta = this.generateCTA(product, regionalHook);
    const hashtags = this.generateHashtags(product, feature, bundle);

    // Determine media config based on format
    const mediaConfig = this.getMediaConfig(format, bundle);

    return {
      id: `${date.toISOString().split('T')[0]}-${bundle}-${format}-${feature.product}`,
      category,
      format,
      platforms,
      regionalBundle: bundle,
      language,
      headline,
      hook,
      body,
      cta,
      hashtags,
      mediaConfig,
      scheduledAt: this.getOptimalScheduleTime(platforms[0], bundle, date),
      timezone: this.getBundleTimezone(bundle),
      optimalTimeSlot: true,
      status: 'draft',
    };
  }

  private generateHeadline(
    product: PositioningMessage, 
    feature: typeof FEATURE_SHOWCASE_TOPICS[0],
    _regional: typeof REGIONAL_HOOKS[BundleType]
  ): string {
    return `${feature.hook} with ${product.productName}`;
  }

  private generateHook(
    feature: typeof FEATURE_SHOWCASE_TOPICS[0],
    regional: typeof REGIONAL_HOOKS[BundleType]
  ): string {
    const hooks: Record<string, string> = {
      'Direct benefit-focused': `Stop wasting time. ${feature.hook}.`,
      'Quality and precision emphasis': `Precision matters. ${feature.hook}.`,
      'Harmony and efficiency focus': `Work smarter. ${feature.hook}.`,
      'Value and growth emphasis': `Unlock your potential. ${feature.hook}.`,
      'Trust and partnership focus': `Partner with AI. ${feature.hook}.`,
      'Empowerment and opportunity': `Build your future. ${feature.hook}.`,
      'Passion and connection': `Create with passion. ${feature.hook}.`,
      'Technical excellence': `Technical excellence. ${feature.hook}.`,
      'Engineering precision': `Engineered for perfection. ${feature.hook}.`,
      'Artistic and elegant': `Elegance meets innovation. ${feature.hook}.`,
      'Minimal and functional': `Simple. Powerful. ${feature.hook}.`,
      'Warm and expressive': `Express yourself. ${feature.hook}.`,
      'Practical and value-focused': `Real results. ${feature.hook}.`,
      'Casual and authentic': `Just works. ${feature.hook}.`,
    };
    return hooks[regional.style] || feature.hook;
  }

  private generateBody(
    product: PositioningMessage,
    feature: typeof FEATURE_SHOWCASE_TOPICS[0],
    _regional: typeof REGIONAL_HOOKS[BundleType]
  ): string {
    const painPoint = product.painPoints[Math.floor(Math.random() * product.painPoints.length)];
    const benefit = product.benefits[Math.floor(Math.random() * product.benefits.length)];
    
    return `Tired of ${painPoint.toLowerCase()}? ${product.productName}'s ${feature.feature} delivers ${benefit.toLowerCase()}. ${product.valueProposition}`;
  }

  private generateCTA(
    _product: PositioningMessage,
    regional: typeof REGIONAL_HOOKS[BundleType]
  ): string {
    const ctas: Record<string, string[]> = {
      'Action-oriented (Try now, Get started)': ['Try it free', 'Get started now', 'Start creating'],
      'Professional (Learn more, Discover)': ['Learn more', 'Discover how', 'See it in action'],
      'Respectful (Explore, Experience)': ['Explore now', 'Experience it', 'See for yourself'],
      'Aspirational (Unlock, Transform)': ['Unlock your potential', 'Transform your workflow'],
      'Relationship-based (Connect, Partner)': ['Connect with us', 'Start your journey'],
      'Inspiring (Build, Create)': ['Start building', 'Create today'],
      'Warm (Join us, Let\'s go)': ['Join us', 'Let\'s create together'],
      'Subtle (Discover more)': ['Discover more', 'Learn the details'],
      'Informative (Learn details)': ['See the details', 'Learn how it works'],
      'Sophisticated (Explore)': ['Explore the possibilities', 'Discover elegance'],
      'Clean (Start simple)': ['Start simple', 'Begin now'],
      'Personal (Connect with us)': ['Connect with us', 'Let\'s talk'],
      'Direct (Get started)': ['Get started', 'Try now'],
      'Friendly (Give it a go)': ['Give it a go', 'Try it out'],
    };
    const options = ctas[regional.ctaStyle] || ['Get started'];
    return options[Math.floor(Math.random() * options.length)];
  }

  private generateHashtags(
    product: PositioningMessage,
    _feature: typeof FEATURE_SHOWCASE_TOPICS[0],
    _bundle: BundleType
  ): string[] {
    const baseHashtags = ['#GenieStudio', '#AIContent', '#ContentCreation'];
    const productHashtag = `#${product.productName.replace(' ', '')}`;
    const audienceHashtags = product.targetAudience.slice(0, 2).map(a => `#${a.replace(/\s/g, '')}`);
    
    return [...baseHashtags, productHashtag, ...audienceHashtags];
  }

  private getMediaConfig(format: ContentFormat, bundle: BundleType): MarketingContent['mediaConfig'] {
    const aesthetics = VIDEO_AESTHETIC_PREFERENCES[bundle.toUpperCase()] || VIDEO_AESTHETIC_PREFERENCES['US_CORPORATE'];
    
    const configs: Record<ContentFormat, Partial<MarketingContent['mediaConfig']>> = {
      video_avatar: { duration: 60, aspectRatio: '16:9', hasAvatar: true, has3D: false, hasAnimation: true },
      video_animated: { duration: 45, aspectRatio: '16:9', hasAvatar: false, has3D: false, hasAnimation: true },
      video_3d: { duration: 30, aspectRatio: '16:9', hasAvatar: false, has3D: true, hasAnimation: true },
      video_journey: { duration: 90, aspectRatio: '16:9', hasAvatar: true, has3D: false, hasAnimation: true },
      shorts_vertical: { duration: 30, aspectRatio: '9:16', hasAvatar: true, has3D: false, hasAnimation: true },
      carousel: { duration: 0, aspectRatio: '1:1', hasAvatar: false, has3D: false, hasAnimation: false },
      thread: { duration: 0, aspectRatio: '16:9', hasAvatar: false, has3D: false, hasAnimation: false },
      blog_post: { duration: 0, aspectRatio: '16:9', hasAvatar: false, has3D: false, hasAnimation: false },
      infographic: { duration: 0, aspectRatio: '1:1', hasAvatar: false, has3D: false, hasAnimation: false },
      podcast_clip: { duration: 60, aspectRatio: '1:1', hasAvatar: false, has3D: false, hasAnimation: true },
    };

    return {
      ...configs[format],
      musicStyle: aesthetics?.musicStyle?.[0],
      avatarStyle: aesthetics?.visualStyle,
    } as MarketingContent['mediaConfig'];
  }

  private getOptimalScheduleTime(platform: Platform, bundle: BundleType, date: Date): Date {
    const scheduleMap: Record<Platform, number> = {
      linkedin: 10, youtube: 14, youtube_shorts: 12,
      tiktok: 19, instagram_reels: 11, instagram_feed: 11,
      twitter: 9, facebook: 13, blog: 8, threads: 10,
    };
    
    const hour = scheduleMap[platform] || 12;
    const scheduled = new Date(date);
    scheduled.setHours(hour, 0, 0, 0);
    return scheduled;
  }

  private getBundleTimezone(bundle: BundleType): string {
    const timezones: Partial<Record<BundleType, string>> = {
      english_core: 'America/New_York',
      europe: 'Europe/London',
      asia: 'Asia/Tokyo',
      india: 'Asia/Kolkata',
      mea: 'Asia/Dubai',
      africa: 'Africa/Lagos',
      latam: 'America/Sao_Paulo',
    };
    return timezones[bundle] || 'UTC';
  }

  private calculatePlatformDistribution(items: MarketingContent[]): Record<Platform, number> {
    const distribution: Record<Platform, number> = {} as Record<Platform, number>;
    for (const item of items) {
      for (const platform of item.platforms) {
        distribution[platform] = (distribution[platform] || 0) + 1;
      }
    }
    return distribution;
  }

  /**
   * Get all available products for marketing
   */
  getProducts(): PositioningMessage[] {
    return Object.values(GENIE_PRODUCT_POSITIONING);
  }

  /**
   * Get all feature topics for showcases
   */
  getFeatureTopics(): typeof FEATURE_SHOWCASE_TOPICS {
    return FEATURE_SHOWCASE_TOPICS;
  }

  /**
   * Get regional bundles
   */
  getRegionalBundles(): BundleType[] {
    return Object.keys(LANGUAGE_BUNDLES) as BundleType[];
  }
}

export const dogfoodingMarketingEngine = DogfoodingMarketingEngine.getInstance();
export default dogfoodingMarketingEngine;
