/**
 * Framework-Aware Messaging Engine
 * 
 * Maps audience segments → marketing frameworks → hooks/CTAs/scripts
 * Implements Full Hybrid: STP + StoryBrand + 4Es + AIDA + JTBD + Blue Ocean
 * 
 * Flow: Audience → Framework Matrix → Template Tags → Script Composition → Thumbnail Context
 */

import type { Json } from '@/integrations/supabase/types';
import { supabase } from '@/integrations/supabase/client';

// ============================================================================
// Types
// ============================================================================

export type MarketingFramework = 'storybrand' | 'aida' | 'jtbd' | 'four_es' | 'blue_ocean' | 'race' | 'stp';

export type AudienceSegment = 
  | 'solo_creators' | 'content_agencies' | 'smb_marketing' | 'enterprise_marketing'
  | 'healthcare' | 'education' | 'finance' | 'real_estate' | 'travel' | 'retail'
  | 'saas_product' | 'hr_training' | 'legal_compliance' | 'nonprofit'
  | 'influencers' | 'podcasters' | 'coaches' | 'ecommerce' | 'government' | 'media';

export type MessagingTier = 'ecosystem' | 'product' | 'feature' | 'cast_meta';

export interface FrameworkConfig {
  primary: MarketingFramework;
  secondary: MarketingFramework;
  sceneStructure: 'aida' | 'storybrand_journey' | 'jtbd_outcome';
  emphasis: string;
}

export interface AudienceMessaging {
  segment: AudienceSegment;
  framework: FrameworkConfig;
  hooks: string[];
  ctas: string[];
  painPoints: string[];
  valueProps: string[];
  differentiators: string[];
  storyBrand: {
    character: string;
    problem: string;
    guide: string;
    plan: string;
    success: string;
    failure: string;
  };
  aida: {
    attention: string;
    interest: string;
    desire: string;
    action: string;
  };
  jtbd: {
    jobStatement: string;
    outcomeMetrics: string[];
  };
  fourEs: {
    experience: string;
    evangelism: string;
    exchange: string;
    everyplace: string;
  };
}

export interface SceneFrameworkTag {
  sceneIndex: number;
  aidaStage: 'attention' | 'interest' | 'desire' | 'action';
  storybrandStage: 'character_problem' | 'guide_plan' | 'success_transformation' | 'call_to_action';
  scriptOverride?: string;
  thumbnailPrompt?: string;
}

export interface FrameworkScriptComposition {
  fullScript: string;
  scenes: Array<{
    index: number;
    aidaStage: string;
    script: string;
    hook?: string;
    cta?: string;
    visualHint: string;
    thumbnailPrompt: string;
  }>;
  poweredByProducts: string[];
  poweredByModels: Record<string, string>;
  messagingTier: MessagingTier;
  frameworkUsed: string;
  characterCount: number;
  charLimitWarning?: string;
}

/**
 * Provider-specific character limits for TTS generation
 * Limits are per-provider, not per-script language
 */
export const PROVIDER_CHAR_LIMITS: Record<string, { soft: number; hard: number; warning: string }> = {
  'qwen3-tts-flash': {
    soft: 2500, // Optimal: ~5 chunks of 500 chars
    hard: 4000, // Absolute max before high risk of timeout
    warning: 'Qwen3-TTS has a 600-character per-request limit (we chunk at 500). Scripts exceeding 2500 chars will require 5+ API calls and may face timeouts. Maximum supported: 4000 chars.',
  },
  'azure': {
    soft: 5000,
    hard: 10000,
    warning: 'Azure Neural TTS supports long-form content up to 10,000 characters, but optimal performance is under 5000 chars.',
  },
  'default': {
    soft: 3000,
    hard: 5000,
    warning: 'Recommended character limit is 3000 for stable TTS generation.',
  },
};

// ============================================================================
// Audience → Framework Matrix (from Playbook)
// ============================================================================

const AUDIENCE_FRAMEWORK_MATRIX: Record<AudienceSegment, FrameworkConfig> = Object.freeze({
  solo_creators: { primary: 'storybrand', secondary: 'aida', sceneStructure: 'storybrand_journey', emphasis: 'empowerment' },
  content_agencies: { primary: 'race', secondary: 'four_es', sceneStructure: 'aida', emphasis: 'scale' },
  smb_marketing: { primary: 'jtbd', secondary: 'aida', sceneStructure: 'jtbd_outcome', emphasis: 'roi' },
  enterprise_marketing: { primary: 'stp', secondary: 'jtbd', sceneStructure: 'aida', emphasis: 'governance' },
  healthcare: { primary: 'stp', secondary: 'jtbd', sceneStructure: 'aida', emphasis: 'compliance' },
  education: { primary: 'storybrand', secondary: 'four_es', sceneStructure: 'storybrand_journey', emphasis: 'engagement' },
  finance: { primary: 'stp', secondary: 'blue_ocean', sceneStructure: 'aida', emphasis: 'trust' },
  real_estate: { primary: 'four_es', secondary: 'aida', sceneStructure: 'aida', emphasis: 'visual_impact' },
  travel: { primary: 'four_es', secondary: 'storybrand', sceneStructure: 'storybrand_journey', emphasis: 'inspiration' },
  retail: { primary: 'aida', secondary: 'four_es', sceneStructure: 'aida', emphasis: 'conversion' },
  saas_product: { primary: 'jtbd', secondary: 'blue_ocean', sceneStructure: 'jtbd_outcome', emphasis: 'adoption' },
  hr_training: { primary: 'storybrand', secondary: 'jtbd', sceneStructure: 'storybrand_journey', emphasis: 'retention' },
  legal_compliance: { primary: 'stp', secondary: 'jtbd', sceneStructure: 'aida', emphasis: 'risk_mitigation' },
  nonprofit: { primary: 'storybrand', secondary: 'four_es', sceneStructure: 'storybrand_journey', emphasis: 'impact' },
  influencers: { primary: 'four_es', secondary: 'aida', sceneStructure: 'aida', emphasis: 'authenticity' },
  podcasters: { primary: 'storybrand', secondary: 'four_es', sceneStructure: 'storybrand_journey', emphasis: 'storytelling' },
  coaches: { primary: 'jtbd', secondary: 'storybrand', sceneStructure: 'jtbd_outcome', emphasis: 'transformation' },
  ecommerce: { primary: 'aida', secondary: 'race', sceneStructure: 'aida', emphasis: 'conversion' },
  government: { primary: 'stp', secondary: 'jtbd', sceneStructure: 'aida', emphasis: 'transparency' },
  media: { primary: 'four_es', secondary: 'blue_ocean', sceneStructure: 'aida', emphasis: 'innovation' },
});

// ============================================================================
// Default Audience Messaging Templates
// ============================================================================

const DEFAULT_AUDIENCE_MESSAGING: Record<string, Partial<AudienceMessaging>> = {
  healthcare: {
    hooks: [
      'HIPAA-ready video content in 4 minutes',
      'Patient education videos in 70+ languages',
      'Compliance documentation that explains itself',
    ],
    ctas: ['Start Your Compliant Video', 'See HIPAA-Ready Templates', 'Request Healthcare Demo'],
    painPoints: ['Manual compliance documentation', 'Patient education gaps', 'Multi-language requirements'],
    valueProps: ['HIPAA-compliant by design', '70+ languages with medical terminology', 'Automated compliance badges'],
    storyBrand: {
      character: 'Healthcare administrator overwhelmed by compliance requirements',
      problem: 'Creating patient-facing content that meets regulatory standards across languages',
      guide: 'Genie Cast: AI-powered compliant content generation',
      plan: '1. Select healthcare template 2. Add your content 3. Auto-generate in any language',
      success: 'Patients understand their care plan in their native language',
      failure: 'Miscommunication leads to poor outcomes and compliance violations',
    },
    aida: {
      attention: 'Your patients deserve content they can understand—in their language',
      interest: 'AI generates HIPAA-ready videos with proper medical terminology in 70+ languages',
      desire: 'Imagine every patient education video automatically compliant and culturally adapted',
      action: 'Start with our free healthcare templates today',
    },
    jtbd: {
      jobStatement: 'When I need to educate diverse patient populations, I want compliant multi-language video content so patients understand their care plan',
      outcomeMetrics: ['Reduce patient readmission by 30%', 'Cut content creation time by 85%', 'Achieve 100% compliance audit pass rate'],
    },
    fourEs: {
      experience: 'See your first patient education video generated in real-time',
      evangelism: 'Built with Spark (medical scripts) + Mind (terminology AI) + Cast (assembly)',
      exchange: 'Replace $50k/year agency costs with automated generation',
      everyplace: 'YouTube, patient portal, waiting room displays, mobile app',
    },
  },
  enterprise_marketing: {
    hooks: [
      '10x your marketing output without 10x your team',
      'Every product update becomes a marketing video automatically',
      'One ecosystem. 8 products. 206 pipelines. Your brand.',
    ],
    ctas: ['Schedule Enterprise Demo', 'See the Full Ecosystem', 'Start Free Pilot'],
    painPoints: ['Content bottleneck', 'Inconsistent branding across teams', 'Slow time-to-market'],
    valueProps: ['Enterprise-grade governance', 'Brand consistency at scale', 'Automated content pipeline'],
    storyBrand: {
      character: 'CMO struggling to scale content production without losing quality',
      problem: 'Growing content demands with flat budgets and inconsistent output',
      guide: 'Genie Suite: Your AI-powered content operating system',
      plan: '1. Connect your brand assets 2. Set governance rules 3. Generate at scale',
      success: 'Marketing team produces 10x content with consistent quality',
      failure: 'Competitors outpace you with faster, more personalized content',
    },
    aida: {
      attention: 'Your competitors are already using AI to outproduce you 10:1',
      interest: '8 specialized AI products working together as one content engine',
      desire: 'Every product update, every feature launch—automatically becomes a marketing asset',
      action: 'Book your enterprise demo and see your brand in action',
    },
    jtbd: {
      jobStatement: 'When I need to scale marketing content, I want an automated pipeline so my team focuses on strategy, not production',
      outcomeMetrics: ['10x content velocity', '60% cost reduction', '100% brand compliance'],
    },
    fourEs: {
      experience: 'Watch your own product demo generated live during the call',
      evangelism: 'This demo was made with the same tools you\'ll use',
      exchange: 'Replace 5 vendors with one ecosystem',
      everyplace: 'LinkedIn, YouTube, internal comms, sales enablement, website',
    },
  },
  solo_creators: {
    hooks: [
      'Your ideas deserve better than a webcam and editing software',
      'Professional videos without the professional price tag',
      'From thought to published video in under 10 minutes',
    ],
    ctas: ['Create Your First Video Free', 'Try the AI Studio', 'See What Creators Build'],
    painPoints: ['Can\'t afford production team', 'Hours spent editing', 'Content looks amateur'],
    valueProps: ['Professional quality', 'One-click generation', 'Multi-platform optimization'],
    storyBrand: {
      character: 'Creator with amazing ideas but limited production resources',
      problem: 'Professional video content requires skills and tools most creators can\'t afford',
      guide: 'Genie Cast: Your AI production team',
      plan: '1. Type your idea 2. Choose your style 3. Publish everywhere',
      success: 'Your content looks like it was made by a production studio',
      failure: 'Your message gets lost because the packaging doesn\'t match the quality',
    },
    aida: {
      attention: 'What if your next video looked like a Netflix production?',
      interest: 'AI writes scripts, generates voices, assembles video—all from one prompt',
      desire: 'Imagine publishing studio-quality content every single day',
      action: 'Create your first video free—no credit card required',
    },
    jtbd: {
      jobStatement: 'When I want to grow my audience, I need professional content so I can compete with bigger creators',
      outcomeMetrics: ['Save 20+ hours/week on editing', '3x engagement rate', 'Daily publishing cadence'],
    },
    fourEs: {
      experience: 'Type an idea and watch your video materialize in real-time',
      evangelism: 'Join 10,000+ creators already using AI to scale',
      exchange: 'Free tier includes 10 videos/month',
      everyplace: 'YouTube, TikTok, Instagram, LinkedIn, Twitter',
    },
  },
};

// ============================================================================
// Product → Messaging Mapping
// ============================================================================

const PRODUCT_MESSAGING: Record<string, { name: string; tagline: string; role: string; icon: string }> = {
  spark: { name: 'Genie Spark', tagline: 'Ignite Your Ideas', role: 'Script & Content AI', icon: '⚡' },
  mind: { name: 'Genie Mind', tagline: 'AI That Understands', role: 'Intelligence & Enhancement', icon: '🧠' },
  vibe: { name: 'Genie Vibe', tagline: 'Script to Screen', role: 'Video & Audio Production', icon: '🎵' },
  deck: { name: 'Genie Deck', tagline: 'Ideas to Impact', role: 'Presentation Generation', icon: '📊' },
  hub: { name: 'Genie Hub', tagline: 'Your Creative Command Center', role: 'Production Hub & Timeline', icon: '🎯' },
  studio: { name: 'Genie Suite', tagline: 'Mind to Media', role: 'Full Creative Suite', icon: '✨' },
  cast: { name: 'Genie Cast', tagline: 'Make It. Show It. Scale It.', role: 'Distribution & Marketing Engine', icon: '📡' },
  ask_genie: { name: 'Ask Genie', tagline: 'Your Wish Is My Command', role: 'Support & Navigation AI', icon: '🧞' },
};

// ============================================================================
// Framework Messaging Engine
// ============================================================================

class FrameworkMessagingEngine {
  private cache: Map<string, AudienceMessaging> = new Map();

  /**
   * Get the framework configuration for an audience segment
   */
  getFrameworkForAudience(segment: AudienceSegment): FrameworkConfig {
    return AUDIENCE_FRAMEWORK_MATRIX[segment] || AUDIENCE_FRAMEWORK_MATRIX.solo_creators;
  }

  /**
   * Get complete audience messaging (from DB or defaults)
   */
  async getAudienceMessaging(
    segment: AudienceSegment,
    productId?: string,
    languageCode: string = 'en'
  ): Promise<AudienceMessaging> {
    const cacheKey = `${segment}-${productId || 'ecosystem'}-${languageCode}`;
    if (this.cache.has(cacheKey)) return this.cache.get(cacheKey)!;

    // Try database first
    const dbMessaging = await this.fetchFromDatabase(segment, productId, languageCode);
    if (dbMessaging) {
      this.cache.set(cacheKey, dbMessaging);
      return dbMessaging;
    }

    // Fall back to defaults
    const framework = this.getFrameworkForAudience(segment);
    const defaults = DEFAULT_AUDIENCE_MESSAGING[segment] || DEFAULT_AUDIENCE_MESSAGING.solo_creators;

    const messaging: AudienceMessaging = {
      segment,
      framework,
      hooks: defaults.hooks || ['Discover the power of AI-generated content'],
      ctas: defaults.ctas || ['Get Started Free'],
      painPoints: defaults.painPoints || ['Manual content creation is slow and expensive'],
      valueProps: defaults.valueProps || ['AI-powered automation'],
      differentiators: ['Self-demonstrating platform', '8 products in one ecosystem', '30+ AI providers'],
      storyBrand: defaults.storyBrand || {
        character: 'Content creator seeking professional quality',
        problem: 'Content creation is slow, expensive, and inconsistent',
        guide: 'Genie Suite ecosystem',
        plan: 'Select → Generate → Publish',
        success: 'Professional content at scale',
        failure: 'Falling behind competitors',
      },
      aida: defaults.aida || {
        attention: 'What if AI could create your marketing videos?',
        interest: '8 specialized AI products working as one',
        desire: 'Professional content in minutes, not weeks',
        action: 'Start creating today',
      },
      jtbd: defaults.jtbd || {
        jobStatement: 'When I need content, I want AI-powered generation so I can focus on strategy',
        outcomeMetrics: ['10x content velocity', '80% cost reduction'],
      },
      fourEs: defaults.fourEs || {
        experience: 'Watch your content generated in real-time',
        evangelism: 'Built with our own tools',
        exchange: 'Replace expensive agencies',
        everyplace: 'Every platform, every language',
      },
    };

    this.cache.set(cacheKey, messaging);
    return messaging;
  }

  /**
   * Compose a framework-aware script from audience messaging + template
   */
  async composeFrameworkScript(
    segment: AudienceSegment,
    productId: string,
    sceneCount: number = 4,
    languageCode: string = 'en'
  ): Promise<FrameworkScriptComposition> {
    const messaging = await this.getAudienceMessaging(segment, productId, languageCode);
    const product = PRODUCT_MESSAGING[productId] || PRODUCT_MESSAGING.studio;
    const framework = messaging.framework;

    // Build scenes based on framework structure
    const scenes = this.buildFrameworkScenes(messaging, product, sceneCount, framework);

    // Compose full script
    const fullScript = scenes.map(s => s.script).join('\n\n');
    
    // Calculate character count and determine warnings
    const charCount = fullScript.length;
    const isCJK = ['zh', 'ja', 'ko'].some(code => languageCode.startsWith(code));
    const ttsProvider = isCJK ? 'qwen3-tts-flash' : 'azure';
    
    const providerLimits = PROVIDER_CHAR_LIMITS[ttsProvider] || PROVIDER_CHAR_LIMITS.default;
    let charLimitWarning: string | undefined;
    
    if (charCount > providerLimits.hard) {
      charLimitWarning = `⚠️ ALERT: Script exceeds ${ttsProvider} hard limit (${providerLimits.hard} chars). Current: ${charCount} chars. ${providerLimits.warning}`;
    } else if (charCount > providerLimits.soft) {
      charLimitWarning = `⚡ WARNING: Script approaches soft limit. Optimal: ≤${providerLimits.soft} chars, Current: ${charCount} chars. Generation may be slower.`;
    }

    // Determine powered-by products
    const poweredByProducts = this.determinePoweredByProducts(productId);
    const poweredByModels = this.determinePoweredByModels();

    return {
      fullScript,
      scenes,
      poweredByProducts,
      poweredByModels,
      messagingTier: productId === 'studio' ? 'ecosystem' : 'product',
      frameworkUsed: `${framework.primary}+${framework.secondary}`,
      characterCount: charCount,
      charLimitWarning,
    };
  }

  /**
   * Generate thumbnail prompt based on product + audience + framework
   */
  generateThumbnailPrompt(
    segment: AudienceSegment,
    productId: string,
    sceneIndex: number = 0
  ): string {
    const product = PRODUCT_MESSAGING[productId] || PRODUCT_MESSAGING.studio;
    const framework = this.getFrameworkForAudience(segment);
    const defaults = DEFAULT_AUDIENCE_MESSAGING[segment];

    const basePrompt = `Professional ${segment.replace(/_/g, ' ')} marketing thumbnail for ${product.name}`;
    const hook = defaults?.hooks?.[0] || product.tagline;
    
    const styleByFramework: Record<string, string> = {
      storybrand: 'hero transformation narrative, before/after visual, bold headline overlay',
      aida: 'attention-grabbing, vibrant colors, clear CTA button, urgency elements',
      jtbd: 'outcome-focused, metrics display, professional results showcase',
      four_es: 'experiential, immersive preview, interactive feel, modern aesthetic',
      blue_ocean: 'innovative, unique positioning, competitive comparison, futuristic',
      race: 'data-driven, funnel visualization, conversion metrics, professional',
      stp: 'targeted, segment-specific imagery, personalized feel, trust indicators',
    };

    const frameworkStyle = styleByFramework[framework.primary] || styleByFramework.aida;

    return `${basePrompt}. "${hook}". Style: ${frameworkStyle}. ${product.icon} ${product.role}. High quality, 1280x720, YouTube thumbnail aspect ratio.`;
  }

  /**
   * Get scene-level AIDA/StoryBrand tags for a blueprint
   */
  getSceneFrameworkTags(sceneCount: number, framework: FrameworkConfig): SceneFrameworkTag[] {
    const aidaStages: Array<'attention' | 'interest' | 'desire' | 'action'> = ['attention', 'interest', 'desire', 'action'];
    const storybrandStages: Array<'character_problem' | 'guide_plan' | 'success_transformation' | 'call_to_action'> = [
      'character_problem', 'guide_plan', 'success_transformation', 'call_to_action'
    ];

    return Array.from({ length: sceneCount }, (_, i) => ({
      sceneIndex: i,
      aidaStage: aidaStages[Math.min(i, aidaStages.length - 1)],
      storybrandStage: storybrandStages[Math.min(i, storybrandStages.length - 1)],
    }));
  }

  /**
   * Save framework messaging to database
   */
  async saveMessagingToDatabase(messaging: AudienceMessaging, productId?: string): Promise<void> {
    const { error } = await supabase.from('ecosystem_messaging').upsert({
      audience_segment: messaging.segment,
      framework_type: messaging.framework.primary,
      product_id: productId || null,
      messaging_tier: productId ? 'product' : 'ecosystem',
      hero_narrative: messaging.storyBrand.character,
      guide_positioning: messaging.storyBrand.guide,
      pain_points: messaging.painPoints,
      hooks: messaging.hooks,
      ctas: messaging.ctas,
      value_propositions: messaging.valueProps,
      differentiators: messaging.differentiators,
      aida_attention: messaging.aida.attention,
      aida_interest: messaging.aida.interest,
      aida_desire: messaging.aida.desire,
      aida_action: messaging.aida.action,
      storybrand_character: messaging.storyBrand.character,
      storybrand_problem: messaging.storyBrand.problem,
      storybrand_guide: messaging.storyBrand.guide,
      storybrand_plan: messaging.storyBrand.plan,
      storybrand_success: messaging.storyBrand.success,
      storybrand_failure: messaging.storyBrand.failure,
      jtbd_job_statement: messaging.jtbd.jobStatement,
      jtbd_outcome_metrics: messaging.jtbd.outcomeMetrics,
      four_es_experience: messaging.fourEs.experience,
      four_es_evangelism: messaging.fourEs.evangelism,
      four_es_exchange: messaging.fourEs.exchange,
      four_es_everyplace: messaging.fourEs.everyplace,
    }, { onConflict: 'audience_segment,framework_type,product_id' });

    if (error) console.error('[FrameworkEngine] Save error:', error);
  }

  /**
   * Record product chain metadata for a generation
   */
  async recordProductChain(config: {
    videoId?: string;
    blueprintId?: string;
    productsUsed: string[];
    aiModels: Record<string, string>;
    audience: AudienceSegment;
    framework: string;
    generationTimeSec: number;
    credits: number;
  }): Promise<void> {
    const poweredByDisplay = this.buildPoweredByDisplay(config.productsUsed, config.aiModels);

    await supabase.from('product_chain_metadata').insert([{
      video_id: config.videoId || null,
      blueprint_id: config.blueprintId || null,
      products_used: config.productsUsed,
      ai_models_used: config.aiModels as unknown as Json,
      tts_provider: config.aiModels.tts || 'azure',
      video_provider: config.aiModels.video || 'vertex_veo_3',
      image_provider: config.aiModels.image || 'gemini_3_pro',
      llm_provider: config.aiModels.llm || 'gemini',
      audience_segment: config.audience,
      framework_used: config.framework,
      generation_time_seconds: config.generationTimeSec,
      total_credits_used: config.credits,
      powered_by_display: poweredByDisplay as unknown as Json,
    }]);
  }

  // =========================================================================
  // Private Helpers
  // =========================================================================

  private async fetchFromDatabase(
    segment: AudienceSegment,
    productId?: string,
    languageCode?: string
  ): Promise<AudienceMessaging | null> {
    try {
      let query = supabase
        .from('ecosystem_messaging')
        .select('*')
        .eq('audience_segment', segment)
        .eq('language_code', languageCode || 'en');

      if (productId) {
        query = query.eq('product_id', productId);
      }

      const { data, error } = await query.maybeSingle();
      if (error || !data) return null;

      const framework = this.getFrameworkForAudience(segment);

      return {
        segment,
        framework,
        hooks: data.hooks || [],
        ctas: data.ctas || [],
        painPoints: data.pain_points || [],
        valueProps: data.value_propositions || [],
        differentiators: data.differentiators || [],
        storyBrand: {
          character: data.storybrand_character || '',
          problem: data.storybrand_problem || '',
          guide: data.storybrand_guide || '',
          plan: data.storybrand_plan || '',
          success: data.storybrand_success || '',
          failure: data.storybrand_failure || '',
        },
        aida: {
          attention: data.aida_attention || '',
          interest: data.aida_interest || '',
          desire: data.aida_desire || '',
          action: data.aida_action || '',
        },
        jtbd: {
          jobStatement: data.jtbd_job_statement || '',
          outcomeMetrics: data.jtbd_outcome_metrics || [],
        },
        fourEs: {
          experience: data.four_es_experience || '',
          evangelism: data.four_es_evangelism || '',
          exchange: data.four_es_exchange || '',
          everyplace: data.four_es_everyplace || '',
        },
      };
    } catch {
      return null;
    }
  }

  private buildFrameworkScenes(
    messaging: AudienceMessaging,
    product: { name: string; tagline: string; role: string; icon: string },
    sceneCount: number,
    framework: FrameworkConfig
  ): FrameworkScriptComposition['scenes'] {
    const scenes: FrameworkScriptComposition['scenes'] = [];

    // Scene 1: Attention / Character & Problem
    scenes.push({
      index: 0,
      aidaStage: 'attention',
      script: messaging.aida.attention || `${messaging.hooks[0] || product.tagline}`,
      hook: messaging.hooks[0],
      visualHint: 'Bold text overlay, problem visualization, emotional hook',
      thumbnailPrompt: `Attention-grabbing thumbnail: "${messaging.hooks[0] || product.tagline}". Bold typography, vibrant colors.`,
    });

    // Scene 2: Interest / Guide & Plan
    if (sceneCount >= 2) {
      scenes.push({
        index: 1,
        aidaStage: 'interest',
        script: messaging.aida.interest || `${product.name} ${messaging.valueProps[0] || 'transforms your workflow'}`,
        visualHint: 'Product screenshot, feature demonstration, capability showcase',
        thumbnailPrompt: `Feature showcase thumbnail: ${product.name} in action. Professional, clean interface.`,
      });
    }

    // Scene 3: Desire / Success Transformation
    if (sceneCount >= 3) {
      scenes.push({
        index: 2,
        aidaStage: 'desire',
        script: messaging.aida.desire || `${messaging.jtbd.outcomeMetrics[0] || 'Transform your content creation'}`,
        visualHint: 'Results, metrics, transformation before/after',
        thumbnailPrompt: `Results-focused thumbnail: metrics, outcomes, success indicators. Professional data visualization.`,
      });
    }

    // Scene 4: Action / CTA
    if (sceneCount >= 4) {
      scenes.push({
        index: 3,
        aidaStage: 'action',
        cta: messaging.ctas[0],
        script: messaging.aida.action || `${messaging.ctas[0] || 'Get started today'}`,
        visualHint: 'CTA button, urgency, clear next step',
        thumbnailPrompt: `CTA thumbnail: "${messaging.ctas[0] || 'Start Free'}". Action-oriented, conversion-focused.`,
      });
    }

    // Additional scenes for longer templates
    for (let i = 4; i < sceneCount; i++) {
      const extraHook = messaging.hooks[i % messaging.hooks.length] || '';
      const extraValue = messaging.valueProps[i % messaging.valueProps.length] || '';
      scenes.push({
        index: i,
        aidaStage: i % 2 === 0 ? 'interest' : 'desire',
        script: extraHook || extraValue || `Discover more with ${product.name}`,
        visualHint: 'Supporting content, additional features',
        thumbnailPrompt: `Supporting content thumbnail for ${product.name}. Clean, professional.`,
      });
    }

    return scenes;
  }

  private determinePoweredByProducts(productId: string): string[] {
    // Every video uses Cast + the featured product
    const products = new Set(['cast']);
    if (productId !== 'cast') products.add(productId);

    // Common supporting products
    products.add('spark'); // Script generation
    if (['vibe', 'studio', 'arc'].includes(productId)) {
      products.add('mind'); // AI enhancement
    }

    return Array.from(products);
  }

  private determinePoweredByModels(): Record<string, string> {
    return {
      llm: 'Gemini 3.0',
      tts: 'Azure Neural',
      video: 'Vertex Veo 3',
      image: 'Gemini 3 Pro',
      assembly: 'RunPod FFmpeg',
    };
  }

  private buildPoweredByDisplay(products: string[], models: Record<string, string>): Record<string, unknown> {
    return {
      products: products.map(id => ({
        id,
        ...PRODUCT_MESSAGING[id],
      })),
      models: Object.entries(models).map(([task, model]) => ({
        task,
        model,
      })),
      ecosystemMessage: `Built with ${products.length} Genie products and ${Object.keys(models).length} AI models`,
    };
  }

  /**
   * Clear cache
   */
  clearCache(): void {
    this.cache.clear();
  }
}

// Singleton
export const frameworkMessagingEngine = new FrameworkMessagingEngine();

// Export constants for external use
export { AUDIENCE_FRAMEWORK_MATRIX, PRODUCT_MESSAGING, DEFAULT_AUDIENCE_MESSAGING };
