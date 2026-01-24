/**
 * Product Marketing Teaser Service
 * 
 * PURPOSE: Showcase Genie Studio products and capabilities as teasers
 * - Shows live demos of Spark, Mind, Vibe, Deck, Arc/Hub features
 * - Educates users on cross-product workflows
 * - Drives feature discovery and upgrades
 * 
 * STRATEGY:
 * - Mix product teasers with combination teasers
 * - Show relevant product based on user's current workflow
 * - Demonstrate "how it works" with live previews
 */

import { labelStudioService } from './labelStudioBackgroundService';

// ============================================
// TYPES
// ============================================

export type GenieProduct = 'spark' | 'mind' | 'vibe' | 'deck' | 'arc' | 'hub' | 'askGenie';

export type ProductFeatureCategory = 
  | 'core_capability'
  | 'workflow'
  | 'integration'
  | 'ai_powered'
  | 'export'
  | 'collaboration';

export interface ProductFeatureTeaser {
  id: string;
  product: GenieProduct;
  category: ProductFeatureCategory;
  featureName: string;
  title: string;
  tagline: string;
  description: string;
  howItWorks: string[];
  thumbnailUrl: string;
  demoVideoUrl?: string;
  durationSeconds: number;
  watermarkText: string;
  tier: 'free' | 'starter' | 'creator' | 'pro' | 'business' | 'enterprise';
  
  // Context matching for personalization
  matchingIndustries: string[];
  matchingContentTypes: string[];
  matchingWorkflows: string[];
  
  // Cross-product connections
  relatedProducts: GenieProduct[];
  prerequisiteProducts?: GenieProduct[];
  
  // Metrics to show
  keyMetric: { value: string; label: string };
  useCaseExample: { from: string; to: string; time: string };
}

export interface ProductMarketingProfile {
  userId: string;
  viewedFeatures: string[];
  interestedFeatures: string[];
  dismissedFeatures: string[];
  productPreferences: Record<GenieProduct, number>;
  discoveryScore: number; // 0-100, how much of the suite they've explored
  lastProductTeaser: GenieProduct | null;
  interactionHistory: Array<{
    featureId: string;
    action: 'view' | 'interested' | 'dismiss' | 'try_now';
    timestamp: string;
  }>;
}

// ============================================
// PRODUCT FEATURE CATALOG
// ============================================

export const PRODUCT_FEATURES: ProductFeatureTeaser[] = [
  // ========== GENIE SPARK ==========
  {
    id: 'spark_script_gen',
    product: 'spark',
    category: 'core_capability',
    featureName: 'AI Script Generation',
    title: 'Scripts in Seconds',
    tagline: 'From idea to complete script in under a minute',
    description: 'Transform rough ideas, notes, or bullet points into polished scripts with the right tone, structure, and hooks.',
    howItWorks: [
      'Paste your idea, notes, or topic keywords',
      'Select tone (professional, casual, educational, etc.)',
      'AI generates complete script with intro, body, and CTA',
      'Edit inline or regenerate sections you want different'
    ],
    thumbnailUrl: '/teasers/products/spark-script-thumb.jpg',
    demoVideoUrl: '/teasers/products/spark-script-demo.mp4',
    durationSeconds: 30,
    watermarkText: 'Genie Spark • Included in all plans',
    tier: 'free',
    matchingIndustries: ['marketing', 'education', 'media', 'content'],
    matchingContentTypes: ['video', 'podcast', 'presentation', 'course'],
    matchingWorkflows: ['content_creation', 'video_production'],
    relatedProducts: ['mind', 'vibe', 'deck'],
    keyMetric: { value: '10x', label: 'Faster than manual writing' },
    useCaseExample: { from: 'Rough idea', to: 'Polished script', time: '30 seconds' }
  },
  {
    id: 'spark_templates',
    product: 'spark',
    category: 'workflow',
    featureName: 'Template Library',
    title: '50+ Starting Points',
    tagline: 'Never start from scratch again',
    description: 'Professional templates for every content type - product demos, tutorials, podcasts, webcasts, and more.',
    howItWorks: [
      'Browse 50+ categorized templates',
      'Preview structure and sample content',
      'Select and customize for your brand',
      'AI adapts template to your specific topic'
    ],
    thumbnailUrl: '/teasers/products/spark-templates-thumb.jpg',
    demoVideoUrl: '/teasers/products/spark-templates-demo.mp4',
    durationSeconds: 30,
    watermarkText: 'Genie Spark • Quick-start your content',
    tier: 'free',
    matchingIndustries: ['all'],
    matchingContentTypes: ['all'],
    matchingWorkflows: ['quick_start', 'structured_content'],
    relatedProducts: ['deck'],
    keyMetric: { value: '50+', label: 'Ready-to-use templates' },
    useCaseExample: { from: 'Template selection', to: 'Custom script', time: '2 minutes' }
  },

  // ========== GENIE MIND ==========
  {
    id: 'mind_rag',
    product: 'mind',
    category: 'ai_powered',
    featureName: 'Knowledge Base (RAG)',
    title: 'AI That Knows Your Brand',
    tagline: 'Upload once, stay on-brand forever',
    description: 'Feed Mind your brand guidelines, product docs, and past content. Every output automatically reflects your voice.',
    howItWorks: [
      'Upload brand guidelines, docs, or past content',
      'Mind analyzes and indexes your knowledge',
      'All AI outputs reference your context',
      'Content stays consistent across the team'
    ],
    thumbnailUrl: '/teasers/products/mind-rag-thumb.jpg',
    demoVideoUrl: '/teasers/products/mind-rag-demo.mp4',
    durationSeconds: 45,
    watermarkText: 'Genie Mind • Your AI memory',
    tier: 'starter',
    matchingIndustries: ['enterprise', 'corporate', 'agency', 'brand'],
    matchingContentTypes: ['branded_content', 'marketing', 'training'],
    matchingWorkflows: ['brand_consistency', 'enterprise_content'],
    relatedProducts: ['spark', 'deck', 'vibe'],
    keyMetric: { value: '95%', label: 'Brand accuracy' },
    useCaseExample: { from: 'Brand docs upload', to: 'On-brand content', time: 'Automatic' }
  },
  {
    id: 'mind_document_analysis',
    product: 'mind',
    category: 'core_capability',
    featureName: 'Document Intelligence',
    title: 'Understand Any Document',
    tagline: '100+ formats. Instant insights.',
    description: 'Upload PDFs, spreadsheets, presentations, or research papers. Mind extracts key insights and makes them actionable.',
    howItWorks: [
      'Upload any document (PDF, DOCX, PPTX, XLSX)',
      'Mind extracts structure, data, and key points',
      'Ask questions about the content',
      'Generate summaries, presentations, or action items'
    ],
    thumbnailUrl: '/teasers/products/mind-docs-thumb.jpg',
    demoVideoUrl: '/teasers/products/mind-docs-demo.mp4',
    durationSeconds: 40,
    watermarkText: 'Genie Mind • Document to insight',
    tier: 'free',
    matchingIndustries: ['consulting', 'research', 'legal', 'finance'],
    matchingContentTypes: ['report', 'analysis', 'summary', 'research'],
    matchingWorkflows: ['document_processing', 'research'],
    relatedProducts: ['deck', 'spark'],
    keyMetric: { value: '100+', label: 'Document formats' },
    useCaseExample: { from: '50-page report', to: 'Executive summary', time: '1 minute' }
  },

  // ========== GENIE VIBE ==========
  {
    id: 'vibe_teleprompter',
    product: 'vibe',
    category: 'core_capability',
    featureName: 'Smart Teleprompter',
    title: 'Record Like a Pro',
    tagline: 'Script on screen, confidence in delivery',
    description: 'Professional teleprompter with smart scrolling that adapts to your speaking pace. Perfect takes, every time.',
    howItWorks: [
      'Import script from Spark or paste your own',
      'Teleprompter adjusts scroll speed to your voice',
      'Record directly with webcam or phone',
      'One-click export or continue to editing'
    ],
    thumbnailUrl: '/teasers/products/vibe-teleprompter-thumb.jpg',
    demoVideoUrl: '/teasers/products/vibe-teleprompter-demo.mp4',
    durationSeconds: 35,
    watermarkText: 'Genie Vibe • Studio-quality recording',
    tier: 'free',
    matchingIndustries: ['content_creator', 'education', 'training', 'media'],
    matchingContentTypes: ['video', 'course', 'presentation_video'],
    matchingWorkflows: ['video_recording', 'training_production'],
    relatedProducts: ['spark', 'arc'],
    keyMetric: { value: '80%', label: 'Fewer retakes' },
    useCaseExample: { from: 'Script ready', to: 'Recorded video', time: '15 minutes' }
  },
  {
    id: 'vibe_dubbing',
    product: 'vibe',
    category: 'ai_powered',
    featureName: '70+ Language Dubbing',
    title: 'One Video, Global Reach',
    tagline: 'Dub your content into 70+ languages instantly',
    description: 'AI voice cloning maintains your voice character while speaking any language. Lip-sync included for Pro tier.',
    howItWorks: [
      'Upload or record your video',
      'Select target languages (up to 10 at once)',
      'AI clones your voice in each language',
      'Pro tier adds AI lip-sync for natural look'
    ],
    thumbnailUrl: '/teasers/products/vibe-dubbing-thumb.jpg',
    demoVideoUrl: '/teasers/products/vibe-dubbing-demo.mp4',
    durationSeconds: 45,
    watermarkText: 'Genie Vibe • Go global instantly',
    tier: 'creator',
    matchingIndustries: ['global', 'enterprise', 'education', 'ecommerce'],
    matchingContentTypes: ['global_content', 'training', 'marketing'],
    matchingWorkflows: ['localization', 'global_rollout'],
    relatedProducts: ['deck', 'arc'],
    keyMetric: { value: '70+', label: 'Languages supported' },
    useCaseExample: { from: 'English video', to: '10 language versions', time: '5 minutes' }
  },

  // ========== GENIE DECK ==========
  {
    id: 'deck_ai_slides',
    product: 'deck',
    category: 'core_capability',
    featureName: 'AI Slide Generation',
    title: 'Ideas to Slides Instantly',
    tagline: 'Describe it, and watch slides appear',
    description: 'Turn documents, outlines, or prompts into complete, professionally designed presentations in minutes.',
    howItWorks: [
      'Input: document, outline, or describe your topic',
      'AI analyzes structure and creates slide flow',
      'Smart visuals auto-generated for each slide',
      'Export as PPTX, PDF, or video presentation'
    ],
    thumbnailUrl: '/teasers/products/deck-slides-thumb.jpg',
    demoVideoUrl: '/teasers/products/deck-slides-demo.mp4',
    durationSeconds: 40,
    watermarkText: 'Genie Deck • Ideas to impact',
    tier: 'free',
    matchingIndustries: ['all'],
    matchingContentTypes: ['presentation', 'pitch', 'report', 'proposal'],
    matchingWorkflows: ['presentation_creation', 'content_repurposing'],
    relatedProducts: ['spark', 'mind', 'vibe'],
    keyMetric: { value: '10min', label: 'End-to-end creation' },
    useCaseExample: { from: 'Document upload', to: 'Complete deck', time: '5 minutes' }
  },
  {
    id: 'deck_multi_language',
    product: 'deck',
    category: 'export',
    featureName: '120+ Language Export',
    title: 'Present in Any Language',
    tagline: 'One deck, 120+ language versions',
    description: 'Generate presentations in any language with proper fonts, RTL support, and culturally appropriate layouts.',
    howItWorks: [
      'Create or import your presentation',
      'Select target languages from 120+ options',
      'AI translates with context awareness',
      'Fonts auto-adjust for CJK, RTL, Indic scripts'
    ],
    thumbnailUrl: '/teasers/products/deck-languages-thumb.jpg',
    demoVideoUrl: '/teasers/products/deck-languages-demo.mp4',
    durationSeconds: 35,
    watermarkText: 'Genie Deck • Global-ready presentations',
    tier: 'creator',
    matchingIndustries: ['global', 'enterprise', 'multinational'],
    matchingContentTypes: ['global_presentation', 'training', 'sales'],
    matchingWorkflows: ['localization', 'global_rollout'],
    relatedProducts: ['vibe', 'mind'],
    keyMetric: { value: '120+', label: 'Languages with native fonts' },
    useCaseExample: { from: 'English deck', to: 'Japanese version', time: '2 minutes' }
  },

  // ========== GENIE ARC ==========
  {
    id: 'arc_calendar',
    product: 'arc',
    category: 'workflow',
    featureName: 'Content Calendar',
    title: 'Plan Your Content Empire',
    tagline: 'AI-optimized scheduling for maximum impact',
    description: 'Visual content calendar with AI suggestions for optimal posting times, content mix, and team assignments.',
    howItWorks: [
      'View all content across products in one calendar',
      'AI suggests optimal publishing times',
      'Assign team members to content items',
      'Track progress from draft to published'
    ],
    thumbnailUrl: '/teasers/products/arc-calendar-thumb.jpg',
    demoVideoUrl: '/teasers/products/arc-calendar-demo.mp4',
    durationSeconds: 30,
    watermarkText: 'Genie Arc • Production command center',
    tier: 'starter',
    matchingIndustries: ['media', 'marketing', 'agency', 'content_team'],
    matchingContentTypes: ['scheduled_content', 'campaigns'],
    matchingWorkflows: ['content_planning', 'team_production'],
    relatedProducts: ['spark', 'vibe', 'deck', 'hub'],
    keyMetric: { value: '5x', label: 'Team productivity' },
    useCaseExample: { from: 'Content ideas', to: 'Published schedule', time: 'Continuous' }
  },
  {
    id: 'arc_batch',
    product: 'arc',
    category: 'workflow',
    featureName: 'Batch Production',
    title: 'Create at Scale',
    tagline: '100 videos from one template',
    description: 'Create personalized content at scale - one template, hundreds of variations with dynamic data.',
    howItWorks: [
      'Create master template with variable placeholders',
      'Upload CSV with personalization data',
      'AI generates unique version for each row',
      'Batch export all variations at once'
    ],
    thumbnailUrl: '/teasers/products/arc-batch-thumb.jpg',
    demoVideoUrl: '/teasers/products/arc-batch-demo.mp4',
    durationSeconds: 40,
    watermarkText: 'Genie Arc • Scale without limits',
    tier: 'pro',
    matchingIndustries: ['ecommerce', 'real_estate', 'recruitment', 'sales'],
    matchingContentTypes: ['personalized_content', 'campaigns', 'catalogs'],
    matchingWorkflows: ['mass_personalization', 'catalog_creation'],
    relatedProducts: ['deck', 'vibe'],
    keyMetric: { value: '100+', label: 'Variations per hour' },
    useCaseExample: { from: '1 template + CSV', to: '500 personalized videos', time: '1 hour' }
  },

  // ========== GENIE HUB ==========
  {
    id: 'hub_publishing',
    product: 'hub',
    category: 'integration',
    featureName: 'Multi-Platform Publishing',
    title: 'Publish Everywhere',
    tagline: 'One click to all your channels',
    description: 'Connect YouTube, LinkedIn, TikTok, and more. Schedule and publish content to all platforms simultaneously.',
    howItWorks: [
      'Connect your social and video platforms',
      'Create content in Spark, Vibe, or Deck',
      'One-click publish to multiple platforms',
      'Track performance across all channels'
    ],
    thumbnailUrl: '/teasers/products/hub-publish-thumb.jpg',
    demoVideoUrl: '/teasers/products/hub-publish-demo.mp4',
    durationSeconds: 35,
    watermarkText: 'Genie Hub • Master orchestrator',
    tier: 'creator',
    matchingIndustries: ['content_creator', 'marketing', 'social_media'],
    matchingContentTypes: ['social_content', 'video', 'multi_platform'],
    matchingWorkflows: ['multi_platform_publishing', 'social_strategy'],
    relatedProducts: ['vibe', 'deck', 'arc'],
    keyMetric: { value: '15+', label: 'Platform integrations' },
    useCaseExample: { from: 'Finished video', to: 'Published on 5 platforms', time: '1 click' }
  },
  {
    id: 'hub_analytics',
    product: 'hub',
    category: 'workflow',
    featureName: 'Cross-Platform Analytics',
    title: 'See the Full Picture',
    tagline: 'All your content performance in one dashboard',
    description: 'Unified analytics across all platforms. Compare performance, identify trends, and optimize your strategy.',
    howItWorks: [
      'Connect all your publishing platforms',
      'Dashboard aggregates all performance data',
      'AI identifies top-performing content patterns',
      'Get recommendations for content optimization'
    ],
    thumbnailUrl: '/teasers/products/hub-analytics-thumb.jpg',
    demoVideoUrl: '/teasers/products/hub-analytics-demo.mp4',
    durationSeconds: 35,
    watermarkText: 'Genie Hub • Data-driven content',
    tier: 'pro',
    matchingIndustries: ['marketing', 'agency', 'enterprise'],
    matchingContentTypes: ['data_driven', 'optimization'],
    matchingWorkflows: ['performance_tracking', 'content_optimization'],
    relatedProducts: ['arc', 'vibe', 'deck'],
    keyMetric: { value: '360°', label: 'Content visibility' },
    useCaseExample: { from: 'Multiple platforms', to: 'Unified insights', time: 'Real-time' }
  },

  // ========== ASK GENIE ==========
  {
    id: 'askgenie_commands',
    product: 'askGenie',
    category: 'ai_powered',
    featureName: 'Natural Language Commands',
    title: 'Just Ask',
    tagline: 'Describe what you want, Genie does the rest',
    description: 'Skip the menus. Just describe what you need in plain language, and Ask Genie executes across all products.',
    howItWorks: [
      'Type or speak your request naturally',
      'Genie understands context and intent',
      'Executes across Spark, Mind, Vibe, Deck, Arc',
      'Confirms completion and asks what\'s next'
    ],
    thumbnailUrl: '/teasers/products/askgenie-commands-thumb.jpg',
    demoVideoUrl: '/teasers/products/askgenie-commands-demo.mp4',
    durationSeconds: 30,
    watermarkText: 'Ask Genie • Your creative companion',
    tier: 'free',
    matchingIndustries: ['all'],
    matchingContentTypes: ['all'],
    matchingWorkflows: ['quick_actions', 'voice_first'],
    relatedProducts: ['spark', 'mind', 'vibe', 'deck', 'arc', 'hub'],
    keyMetric: { value: '∞', label: 'Natural language commands' },
    useCaseExample: { from: '"Create a video about..."', to: 'Complete workflow', time: 'Automated' }
  }
];

// ============================================
// SERVICE CLASS
// ============================================

class ProductMarketingTeaserService {
  private static instance: ProductMarketingTeaserService;
  private profile: ProductMarketingProfile | null = null;
  private sessionViewCount: number = 0;

  private constructor() {
    this.loadProfile();
  }

  static getInstance(): ProductMarketingTeaserService {
    if (!ProductMarketingTeaserService.instance) {
      ProductMarketingTeaserService.instance = new ProductMarketingTeaserService();
    }
    return ProductMarketingTeaserService.instance;
  }

  /**
   * Get a product feature teaser based on current context
   */
  getProductTeaser(context: {
    currentProduct: GenieProduct;
    industry?: string;
    contentType?: string;
    workflow?: string;
    generationNumber: number;
  }): ProductFeatureTeaser | null {
    const profile = this.getProfile();
    
    // Show product teasers less frequently than combination teasers
    // Every 4th-5th generation, show a product teaser instead
    if (context.generationNumber % 4 !== 0 && context.generationNumber % 5 !== 0) {
      return null;
    }

    // Filter to teasers not yet viewed or dismissed
    const available = PRODUCT_FEATURES.filter(f => 
      !profile.dismissedFeatures.includes(f.id) &&
      f.product !== context.currentProduct // Show OTHER products
    );

    if (available.length === 0) return null;

    // Score teasers by relevance
    const scored = available.map(feature => {
      let score = 0;
      
      // Match industry
      if (context.industry && feature.matchingIndustries.includes(context.industry.toLowerCase())) {
        score += 30;
      }
      if (feature.matchingIndustries.includes('all')) {
        score += 10;
      }

      // Match content type
      if (context.contentType && feature.matchingContentTypes.includes(context.contentType.toLowerCase())) {
        score += 25;
      }

      // Match workflow
      if (context.workflow && feature.matchingWorkflows.includes(context.workflow.toLowerCase())) {
        score += 20;
      }

      // Boost related products to current
      if (feature.relatedProducts.includes(context.currentProduct)) {
        score += 15;
      }

      // Boost unseen features
      if (!profile.viewedFeatures.includes(feature.id)) {
        score += 20;
      }

      // Apply user preferences
      score += (profile.productPreferences[feature.product] || 0);

      return { feature, score };
    });

    // Sort by score and return top
    scored.sort((a, b) => b.score - a.score);
    return scored[0]?.feature || null;
  }

  /**
   * Get all features for a specific product
   */
  getProductFeatures(product: GenieProduct): ProductFeatureTeaser[] {
    return PRODUCT_FEATURES.filter(f => f.product === product);
  }

  /**
   * Get cross-product workflow suggestions
   */
  getCrossProductSuggestions(fromProduct: GenieProduct): ProductFeatureTeaser[] {
    // Get features that connect TO the current product
    return PRODUCT_FEATURES.filter(f => 
      f.relatedProducts.includes(fromProduct) && 
      f.product !== fromProduct
    );
  }

  /**
   * Record user interaction with product teaser
   */
  recordInteraction(
    featureId: string, 
    action: 'view' | 'interested' | 'dismiss' | 'try_now'
  ): void {
    const profile = this.getProfile();
    const feature = PRODUCT_FEATURES.find(f => f.id === featureId);

    if (!feature) return;

    // Update profile
    profile.interactionHistory.push({
      featureId,
      action,
      timestamp: new Date().toISOString()
    });

    // Track actions
    if (action === 'view' && !profile.viewedFeatures.includes(featureId)) {
      profile.viewedFeatures.push(featureId);
    }
    if (action === 'interested') {
      profile.interestedFeatures.push(featureId);
      profile.productPreferences[feature.product] = 
        (profile.productPreferences[feature.product] || 0) + 10;
    }
    if (action === 'dismiss') {
      profile.dismissedFeatures.push(featureId);
      profile.productPreferences[feature.product] = 
        (profile.productPreferences[feature.product] || 0) - 5;
    }
    if (action === 'try_now') {
      profile.productPreferences[feature.product] = 
        (profile.productPreferences[feature.product] || 0) + 20;
    }

    // Update discovery score
    profile.discoveryScore = Math.min(100, 
      (profile.viewedFeatures.length / PRODUCT_FEATURES.length) * 100
    );

    this.saveProfile(profile);

    // Send to Label Studio - using compatible event type
    const mappedProduct = feature.product === 'askGenie' ? 'spark' : 
                          feature.product === 'deck' ? 'spark' : feature.product;
    labelStudioService.recordEvent({
      eventType: 'thumbnail_chosen',
      context: {
        product: mappedProduct as 'mind' | 'spark' | 'vibe' | 'arc' | 'hub',
        contentType: feature.category,
        originalValue: featureId,
        selectedValue: action,
        userAction: action === 'interested' || action === 'try_now' ? 'accept' : 
                    action === 'dismiss' ? 'reject' : 'ignore'
      },
      metadata: {
        featureName: feature.featureName,
        productTeaser: true
      }
    });
  }

  /**
   * Get discovery progress for gamification
   */
  getDiscoveryProgress(): {
    totalFeatures: number;
    viewedCount: number;
    discoveryScore: number;
    nextSuggestion: ProductFeatureTeaser | null;
  } {
    const profile = this.getProfile();
    const unviewed = PRODUCT_FEATURES.filter(f => 
      !profile.viewedFeatures.includes(f.id)
    );

    return {
      totalFeatures: PRODUCT_FEATURES.length,
      viewedCount: profile.viewedFeatures.length,
      discoveryScore: profile.discoveryScore,
      nextSuggestion: unviewed[0] || null
    };
  }

  /**
   * Get all products with their feature counts
   */
  getProductOverview(): Array<{
    product: GenieProduct;
    name: string;
    icon: string;
    tagline: string;
    featureCount: number;
    viewedCount: number;
  }> {
    const profile = this.getProfile();
    const productMeta: Record<GenieProduct, { name: string; icon: string; tagline: string }> = {
      spark: { name: 'Genie Spark', icon: '✨', tagline: 'Ignite Your Ideas' },
      mind: { name: 'Genie Mind', icon: '🧠', tagline: 'AI That Understands' },
      vibe: { name: 'Genie Vibe', icon: '🎬', tagline: 'Script to Screen' },
      deck: { name: 'Genie Deck', icon: '📊', tagline: 'Ideas to Impact' },
      arc: { name: 'Genie Arc', icon: '🎯', tagline: 'Infinite Possibilities' },
      hub: { name: 'Genie Hub', icon: '🧞', tagline: 'Master Orchestrator' },
      askGenie: { name: 'Ask Genie', icon: '🧞', tagline: 'Your Wish Is My Command' }
    };

    return Object.entries(productMeta).map(([key, meta]) => {
      const product = key as GenieProduct;
      const features = PRODUCT_FEATURES.filter(f => f.product === product);
      const viewedFeatures = features.filter(f => 
        profile.viewedFeatures.includes(f.id)
      );

      return {
        product,
        ...meta,
        featureCount: features.length,
        viewedCount: viewedFeatures.length
      };
    });
  }

  // ============================================
  // PROFILE MANAGEMENT
  // ============================================

  private getProfile(): ProductMarketingProfile {
    if (!this.profile) {
      this.loadProfile();
    }
    return this.profile!;
  }

  private loadProfile(): void {
    try {
      const stored = localStorage.getItem('genie_product_marketing_profile');
      if (stored) {
        this.profile = JSON.parse(stored);
      }
    } catch {
      // Ignore errors
    }

    if (!this.profile) {
      this.profile = {
        userId: 'anonymous',
        viewedFeatures: [],
        interestedFeatures: [],
        dismissedFeatures: [],
        productPreferences: {
          spark: 0,
          mind: 0,
          vibe: 0,
          deck: 0,
          arc: 0,
          hub: 0,
          askGenie: 0
        },
        discoveryScore: 0,
        lastProductTeaser: null,
        interactionHistory: []
      };
    }
  }

  private saveProfile(profile: ProductMarketingProfile): void {
    this.profile = profile;
    try {
      localStorage.setItem('genie_product_marketing_profile', JSON.stringify(profile));
    } catch {
      // Ignore storage errors
    }
  }

  resetSession(): void {
    this.sessionViewCount = 0;
  }
}

// ============================================
// EXPORTS
// ============================================

export const productMarketingTeaserService = ProductMarketingTeaserService.getInstance();

/**
 * React hook for product marketing teasers
 */
export function useProductMarketingTeaser() {
  const service = ProductMarketingTeaserService.getInstance();

  return {
    getProductTeaser: service.getProductTeaser.bind(service),
    getProductFeatures: service.getProductFeatures.bind(service),
    getCrossProductSuggestions: service.getCrossProductSuggestions.bind(service),
    recordInteraction: service.recordInteraction.bind(service),
    getDiscoveryProgress: service.getDiscoveryProgress.bind(service),
    getProductOverview: service.getProductOverview.bind(service),
    PRODUCT_FEATURES
  };
}
