/**
 * AI Messaging Generator Service
 * 
 * Generates feature-specific hooks, CTAs, and positioning statements
 * using marketing pipelines with admin approval workflow.
 */

import { supabase } from '@/integrations/supabase/client';
import { featureDiscoveryService, MESSAGING_TEMPLATES, type CustomMessaging } from './featureDiscoveryService';
import { JOURNEY_TEMPLATES, FRAMEWORK_TEMPLATES } from './aiGenerationIntegration';
import { GENIE_PRODUCTS, type GenieProductId } from './productVersionTrackingService';
import { ZONE_ROUTING_CONFIG, type RoutingZone } from '@/config/master-ecosystem-registry';

// ============================================================================
// CREATIVE ANGLE SYSTEM
// ============================================================================

export type CreativeAngle = 
  | 'emotional_story' 
  | 'data_authority' 
  | 'pain_transformation' 
  | 'social_proof' 
  | 'provocative_question' 
  | 'industry_specific';

// ============================================================================
// PRODUCTION CONTEXT TONES — Maps production capability to messaging style
// ============================================================================

export type ProductionCapability = 
  | 'avatar_lipsync'
  | '3d_vr'
  | 'ppt_slides'
  | 'motion_graphics'
  | 'stock_remix'
  | 'banner_static';

export interface ProductionToneConfig {
  name: string;
  description: string;
  toneDirective: string;
  scriptConstraints: {
    maxSentenceLength: number;
    preferredFormat: string;
    avoidPatterns: string[];
  };
}

export const PRODUCTION_CONTEXT_TONES: Record<ProductionCapability, ProductionToneConfig> = {
  avatar_lipsync: {
    name: 'Avatar + Lipsync',
    description: 'Conversational tone optimized for avatar speech and lip synchronization',
    toneDirective: `PRODUCTION TONE: AVATAR + LIPSYNC
- Write as if a real person is speaking directly to camera
- Use conversational, first-person tone ("I", "you", "we")
- Sentences MUST be under 15 words for clean lipsync timing
- Avoid complex compound sentences — use simple subject-verb-object
- Include natural pauses with "..." and breath marks
- Use rhetorical questions to create engagement
- Script should feel like a TED Talk or vlog, not an ad
- Avoid jargon — use everyday language
- Add emotional inflection cues: [pause], [emphasis], [smile]`,
    scriptConstraints: {
      maxSentenceLength: 15,
      preferredFormat: 'conversational_monologue',
      avoidPatterns: ['bullet points', 'numbered lists', 'technical jargon'],
    },
  },
  '3d_vr': {
    name: '3D / VR',
    description: 'Immersive, spatial language for 3D environments and VR experiences',
    toneDirective: `PRODUCTION TONE: 3D / VR IMMERSIVE
- Write in immersive, spatial language — "step into", "explore", "surround yourself"
- Use present tense and second person ("you are standing in...")
- Create a sense of space, depth, and discovery
- Sentences can be longer and more descriptive for environmental narration
- Include sensory language: visual, tactile, auditory
- Reference perspective and movement: "look up", "turn around", "zoom in"
- Avoid flat/static descriptions — everything should feel dynamic
- Script should read like a guided experience, not a product demo`,
    scriptConstraints: {
      maxSentenceLength: 25,
      preferredFormat: 'immersive_narration',
      avoidPatterns: ['click here', 'button', 'link below'],
    },
  },
  ppt_slides: {
    name: 'PPT / Slides',
    description: 'Bullet-point friendly, data-heavy, executive presentation tone',
    toneDirective: `PRODUCTION TONE: PPT / SLIDES
- Write in concise, executive-friendly language
- Headlines must be under 8 words — punchy and declarative
- Use bullet-point-friendly phrases, not paragraphs
- Include data points, percentages, and metrics prominently
- Structure for visual hierarchy: Title → Subtitle → 3 Key Points → Takeaway
- Use "power words" for slides: Impact, Growth, ROI, Transform, Accelerate
- Avoid long narratives — every word must earn its place
- CTA should be boardroom-ready: "Let's discuss", "Schedule a deep-dive"
- Scripts should work as speaker notes beneath slide content`,
    scriptConstraints: {
      maxSentenceLength: 12,
      preferredFormat: 'bullet_executive',
      avoidPatterns: ['once upon a time', 'imagine if', 'long storytelling'],
    },
  },
  motion_graphics: {
    name: 'Motion Graphics',
    description: 'Punchy, rhythmic, action-verb heavy for animated content',
    toneDirective: `PRODUCTION TONE: MOTION GRAPHICS
- Write punchy, rhythmic copy that syncs with animated transitions
- Use strong action verbs: Launch, Build, Scale, Crush, Ignite, Accelerate
- Sentences should be 5-10 words MAX — one idea per frame
- Create a musical cadence: short-short-LONG, short-short-LONG
- Use parallel structure for visual consistency
- Include kinetic language: "zoom", "snap", "transform", "reveal"
- Headlines should work as standalone text-on-screen moments
- Think of each line as a motion keyframe — impactful and self-contained
- Avoid complex sentences — each phrase should POP on screen`,
    scriptConstraints: {
      maxSentenceLength: 10,
      preferredFormat: 'kinetic_text',
      avoidPatterns: ['paragraphs', 'complex sentences', 'passive voice'],
    },
  },
  stock_remix: {
    name: 'Stock Remix',
    description: 'Narrative voiceover style for stock footage with music overlay',
    toneDirective: `PRODUCTION TONE: STOCK REMIX / VOICEOVER
- Write as a narrative voiceover accompanying cinematic stock footage
- Use storytelling arc: Setup → Tension → Resolution → Inspiration
- Pacing should complement visual cuts — vary sentence length
- Include emotional beats that align with music cues
- Use universal, aspirational language that works with diverse footage
- Avoid product-specific visuals references — let footage tell the visual story
- Script should work even if the viewer only HEARS it (podcast-friendly)
- Add [MUSIC SWELL], [CUT], [MONTAGE] cues for editing alignment
- Closing should leave a lasting emotional impression`,
    scriptConstraints: {
      maxSentenceLength: 20,
      preferredFormat: 'narrative_voiceover',
      avoidPatterns: ['click', 'screenshot', 'UI reference'],
    },
  },
  banner_static: {
    name: 'Banner / Static',
    description: 'Ultra-concise headline + subline for static image banners',
    toneDirective: `PRODUCTION TONE: BANNER / STATIC IMAGE
- Ultra-concise: Headline MAX 6 words, Subline MAX 12 words
- Every character must earn its place — ruthless editing
- Write for INSTANT comprehension — 2-second scan time
- Use high-contrast language: "Not X. Y." or "Stop X. Start Y."
- CTA must be 2-3 words: "Try Free", "Start Now", "Get Started"
- Headlines should create curiosity gap or bold claim
- Avoid articles (a, an, the) where possible
- Think billboard on a highway — if they can't read it at 60mph, it's too long
- For multi-banner sets, create connected narrative across banners`,
    scriptConstraints: {
      maxSentenceLength: 6,
      preferredFormat: 'ultra_concise_headline',
      avoidPatterns: ['long descriptions', 'complex ideas', 'multiple clauses'],
    },
  },
};

/** Get production tone config, returns null if no context specified */
export function getProductionTone(capability?: ProductionCapability): ProductionToneConfig | null {
  if (!capability) return null;
  return PRODUCTION_CONTEXT_TONES[capability] || null;
}

export const CREATIVE_ANGLES: Record<CreativeAngle, {
  name: string;
  description: string;
  promptDirective: string;
}> = {
  emotional_story: {
    name: 'Emotional Story',
    description: 'Human-centered narrative with emotional arc',
    promptDirective: `ANGLE: EMOTIONAL STORY — Write as a compelling human narrative. Start with a relatable person in a real situation. Build tension around their struggle. Show the transformation moment. End with emotional payoff. Example tone: "She had 3 hours before the investor pitch. No slides. No script. Then she opened Genie." Use sensory language, specific details, and emotional beats.`,
  },
  data_authority: {
    name: 'Data & Authority',
    description: 'Stats-driven positioning with authority signals',
    promptDirective: `ANGLE: DATA & AUTHORITY — Lead with compelling statistics and metrics. Use specific numbers, percentages, and comparisons. Position as industry-defining. Example tone: "200+ AI pipelines. 50+ languages. 62+ sub-regions. The numbers don't lie." Include concrete ROI metrics, time savings data, and market position. Sound authoritative, not salesy.`,
  },
  pain_transformation: {
    name: 'Pain → Transformation',
    description: 'Agitate the problem, reveal the solution dramatically',
    promptDirective: `ANGLE: PAIN → TRANSFORMATION — Start with a visceral description of the audience's biggest pain point. Make them feel it. Then pivot dramatically with "But what if..." or "Until now..." Show the complete before/after transformation. Example tone: "Drowning in 7 separate tools? Fragmented workflows? Missed deadlines? One ecosystem. Done." Make the contrast stark and undeniable.`,
  },
  social_proof: {
    name: 'Social Proof & Vision',
    description: 'Community-driven with aspirational positioning',
    promptDirective: `ANGLE: SOCIAL PROOF & VISION — Lead with community momentum and aspirational positioning. Reference the movement, the community, the future being built. Example tone: "Join 10,000+ creators who stopped compromising. The future of content isn't coming — it's here." Use collective language ("we", "together", "movement"), reference early adopters, and paint an aspirational future state.`,
  },
  provocative_question: {
    name: 'Provocative Question',
    description: 'Challenge assumptions with bold questions',
    promptDirective: `ANGLE: PROVOCATIVE QUESTION — Open with a bold, assumption-challenging question that stops the scroll. Make the reader question their current approach. Example tone: "What if your next campaign took 10 minutes instead of 10 days?" or "Why are you still paying for 7 tools when one does it all?" Follow up with the undeniable answer. Create cognitive dissonance.`,
  },
  industry_specific: {
    name: 'Industry-Specific',
    description: 'Tailored to selected audience vertical with domain language',
    promptDirective: `ANGLE: INDUSTRY-SPECIFIC — Use the selected audience's industry jargon, workflows, and specific pain points. Reference their actual daily challenges and tools. If Healthcare: mention HIPAA, patient education, clinical training. If Enterprise: mention compliance, governance, ROI reporting. If Creator: mention algorithm changes, content burnout, monetization. Sound like an insider, not a vendor.`,
  },
};

/** Get the optimal creative angles for a given variant count */
export function getCreativeAnglesForCount(count: number): CreativeAngle[] {
  const ordered: CreativeAngle[] = [
    'emotional_story',
    'data_authority', 
    'pain_transformation',
    'social_proof',
    'provocative_question',
    'industry_specific',
  ];
  return ordered.slice(0, Math.min(count, ordered.length));
}

/** Resolve zone-based LLM provider for messaging generation */
function getMessagingProvider(regionCode?: string): { provider: string; model: string } {
  // Default to fallback zone if no region
  if (!regionCode) {
    return { provider: 'openai', model: 'gpt-4o' };
  }

  // Find the zone for this region
  for (const [zone, config] of Object.entries(ZONE_ROUTING_CONFIG)) {
    if (config.regions.some(r => regionCode.toUpperCase().includes(r.toUpperCase()))) {
      switch (config.primaryLLM) {
        case 'claude':
          return { provider: 'claude', model: 'claude-sonnet-4-20250514' };
        case 'alibaba':
          return { provider: 'alibaba', model: 'qwen-max' };
        case 'gemini':
          return { provider: 'gemini', model: 'gemini-2.5-pro' };
        default:
          return { provider: 'openai', model: 'gpt-4o' };
      }
    }
  }
  
  return { provider: 'openai', model: 'gpt-4o' };
}

// ============================================================================
// TYPES
// ============================================================================

export interface MessagingRequest {
  id: string;
  productId: GenieProductId;
  featureId?: string;
  featureName?: string;
  type: 'product' | 'feature' | 'comparison' | 'tutorial';
  targetAudience: string[];
  competitors?: string[];
  variantCount?: number; // 1-6 variants
  regionCode?: string;  // For zone-based LLM routing
  creativeAngle?: CreativeAngle; // Auto-assigned per variant
  productionCapability?: ProductionCapability; // Production context tone
  status: 'pending' | 'generating' | 'pending_approval' | 'approved' | 'rejected';
  generatedAt?: Date;
  approvedAt?: Date;
  approvedBy?: string;
  rejectionReason?: string;
}

export interface GeneratedMessaging {
  requestId: string;
  productId: string;
  featureId?: string;
  
  // Core Messaging
  headline: string;
  hook: string;
  subHook: string;
  cta: string;
  ctaSecondary: string;
  
  // Value Proposition
  valueProposition: string;
  painPoints: string[];
  benefits: string[];
  differentiators: string[];
  
  // Script Components
  openingLine: string;
  closingLine: string;
  transitionPhrases: string[];
  
  // Full Script
  shortScript: string; // 30 seconds
  mediumScript: string; // 60 seconds
  longScript: string; // 90 seconds
  
  // SEO/Social
  hashtags: string[];
  keywords: string[];
  metaDescription: string;
  
  // Confidence & Metadata
  confidence: number;
  generatedBy: string;
  version: number;
  isApproved: boolean;
  creativeAngle?: CreativeAngle;
  productionCapability?: ProductionCapability;
  variantIndex?: number;
}

export interface CompetitorAnalysis {
  competitor: string;
  theirClaim: string;
  ourAdvantage: string;
  battleCard: string;
}

// ============================================================================
// MESSAGING FRAMEWORKS
// ============================================================================

export const MESSAGING_FRAMEWORKS = {
  problemSolution: {
    name: 'Problem → Solution',
    structure: ['State the problem', 'Agitate the pain', 'Present the solution', 'Show the result'],
  },
  beforeAfter: {
    name: 'Before → After',
    structure: ['Show the before state', 'Transform with product', 'Reveal the after', 'Call to action'],
  },
  featureBenefit: {
    name: 'Feature → Benefit',
    structure: ['Introduce feature', 'Explain how it works', 'Show the benefit', 'Prove with example'],
  },
  storyDriven: {
    name: 'Story Driven',
    structure: ['Hook with emotion', 'Share the journey', 'Reveal the transformation', 'Inspire action'],
  },
};

export const TARGET_AUDIENCES = [
  // Core Creator Segments
  { id: 'content_creators', label: 'Content Creators', painPoints: ['time-consuming editing', 'creative blocks', 'platform algorithm changes'] },
  { id: 'influencers', label: 'Influencers', painPoints: ['content fatigue', 'audience engagement', 'multi-platform demands'] },
  { id: 'knowledge_sharers', label: 'Knowledge Sharers', painPoints: ['monetizing expertise', 'production quality', 'audience building'] },
  
  // Business & Marketing
  { id: 'marketers', label: 'Marketing Teams', painPoints: ['content velocity', 'brand consistency', 'campaign ROI'] },
  { id: 'sales_teams', label: 'Sales Teams', painPoints: ['pitch personalization', 'demo creation', 'proposal turnaround'] },
  { id: 'agencies', label: 'Agencies & Freelancers', painPoints: ['client deliverables', 'scaling projects', 'white-label needs'] },
  { id: 'entrepreneurs', label: 'Entrepreneurs', painPoints: ['resource constraints', 'professional output', 'time-to-market'] },
  { id: 'smb', label: 'Small & Medium Business', painPoints: ['limited marketing budget', 'competing with big brands', 'DIY content'] },
  
  // Enterprise & Corporate
  { id: 'enterprises', label: 'Enterprise Teams', painPoints: ['compliance', 'collaboration', 'brand governance'] },
  { id: 'product_managers', label: 'Product Managers', painPoints: ['stakeholder communication', 'roadmap visualization', 'feature demos'] },
  { id: 'customer_success', label: 'Customer Success', painPoints: ['onboarding content', 'tutorial creation', 'support scalability'] },
  { id: 'executive_leadership', label: 'Executive Leadership', painPoints: ['board presentations', 'investor updates', 'internal comms'] },
  { id: 'developers', label: 'Developers & Tech Teams', painPoints: ['documentation', 'API demos', 'technical tutorials'] },
  
  // HR & People
  { id: 'hr_recruiters', label: 'HR & Recruiters', painPoints: ['employer branding', 'onboarding videos', 'culture content'] },
  { id: 'trainers', label: 'L&D Professionals', painPoints: ['engagement', 'scalability', 'learning retention'] },
  
  // Education
  { id: 'educators', label: 'Educators', painPoints: ['student engagement', 'content creation time', 'remote learning'] },
  
  // Specialized Industries
  { id: 'healthcare', label: 'Healthcare Professionals', painPoints: ['patient education', 'compliance requirements', 'clinical training'] },
  { id: 'compliance', label: 'Compliance & Legal', painPoints: ['policy communication', 'audit documentation', 'training requirements'] },
  { id: 'travelers', label: 'Travel & Hospitality', painPoints: ['destination marketing', 'multilingual content', 'seasonal campaigns'] },
];

// Legacy hardcoded competitor data — kept as fallback only
export const COMPETITOR_DATABASE = [
  { id: 'canva', name: 'Canva', category: 'design', weakness: 'Limited AI generation' },
  { id: 'beautiful_ai', name: 'Beautiful.AI', category: 'presentations', weakness: 'No video output' },
  { id: 'lumen5', name: 'Lumen5', category: 'video', weakness: 'Template-based only' },
  { id: 'synthesia', name: 'Synthesia', category: 'avatar', weakness: 'No presentation integration' },
  { id: 'tome', name: 'Tome', category: 'presentations', weakness: 'Limited customization' },
  { id: 'gamma', name: 'Gamma', category: 'presentations', weakness: 'No audio/video' },
  { id: 'pictory', name: 'Pictory', category: 'video', weakness: 'Basic editing only' },
  { id: 'descript', name: 'Descript', category: 'video', weakness: 'Steep learning curve' },
];

// ============================================================================
// DB-DRIVEN KNOWLEDGE LOADER
// ============================================================================

export interface ProductKnowledge {
  value_proposition: string | null;
  positioning_statement: string | null;
  tagline: string | null;
  elevator_pitch: string | null;
  pain_points: string[];
  key_benefits: string[];
  use_cases: string[];
  differentiators: string[];
  competitive_edge: string | null;
  regional_positioning: Record<string, any>;
  regional_pain_points: Record<string, any>;
  regional_benefits: Record<string, any>;
}

export interface CompetitorEntry {
  competitor_category: string;
  competitor_weakness: string | null;
  our_advantage: string;
  battle_card: string | null;
  positioning_against: string | null;
  scope: string;
  region_code: string | null;
}

/**
 * Load product knowledge from DB (product_knowledge_registry).
 * Falls back to hardcoded GENIE_PRODUCTS if no DB entry exists.
 */
async function loadProductKnowledge(productDbId: string): Promise<ProductKnowledge | null> {
  try {
    const { data, error } = await supabase
      .from('product_knowledge_registry')
      .select('*')
      .eq('product_id', productDbId)
      .eq('is_current', true)
      .eq('status', 'active')
      .maybeSingle();

    if (error || !data) return null;
    return {
      value_proposition: data.value_proposition,
      positioning_statement: data.positioning_statement,
      tagline: data.tagline,
      elevator_pitch: data.elevator_pitch,
      pain_points: (data.pain_points as string[]) || [],
      key_benefits: (data.key_benefits as string[]) || [],
      use_cases: (data.use_cases as string[]) || [],
      differentiators: (data.differentiators as string[]) || [],
      competitive_edge: data.competitive_edge,
      regional_positioning: (data.regional_positioning as Record<string, any>) || {},
      regional_pain_points: (data.regional_pain_points as Record<string, any>) || {},
      regional_benefits: (data.regional_benefits as Record<string, any>) || {},
    };
  } catch (e) {
    console.warn('[AIMessaging] Failed to load product knowledge from DB:', e);
    return null;
  }
}

/**
 * Load competitor landscape from DB for a given product.
 * Never exposes competitor names in AI output — only our_advantage and positioning.
 */
async function loadCompetitorLandscape(productDbId: string, regionCode?: string): Promise<CompetitorEntry[]> {
  try {
    let query = supabase
      .from('competitor_landscape')
      .select('competitor_category, competitor_weakness, our_advantage, battle_card, positioning_against, scope, region_code')
      .eq('product_id', productDbId)
      .eq('is_active', true);

    // Include global + regional if region specified
    if (regionCode) {
      query = query.or(`scope.eq.global,region_code.eq.${regionCode}`);
    }

    const { data, error } = await query;
    if (error || !data) return [];
    return data as CompetitorEntry[];
  } catch (e) {
    console.warn('[AIMessaging] Failed to load competitors from DB:', e);
    return [];
  }
}

/**
 * Load enriched competitor profiles from the intelligence DB (seeded from Command Center).
 * Returns aggregated competitive intelligence for stronger messaging differentiation.
 */
async function loadEnrichedCompetitorProfiles(): Promise<string> {
  try {
    const { data, error } = await supabase
      .from('competitor_profiles')
      .select('name, category, strengths, weaknesses, revenue_estimate, genie_differentiator, video_editing_rating, ai_capabilities_rating, ease_of_use_rating')
      .limit(15) as { data: any[] | null; error: any };

    if (error || !data || data.length === 0) return '';

    const lines = data.map((c: any) => {
      const ratings = [
        c.video_editing_rating ? `Video:${c.video_editing_rating}/10` : '',
        c.ai_capabilities_rating ? `AI:${c.ai_capabilities_rating}/10` : '',
        c.ease_of_use_rating ? `Ease:${c.ease_of_use_rating}/10` : '',
      ].filter(Boolean).join(', ');
      return `- ${c.category || 'Direct'}: Weakness="${c.weaknesses?.[0] || 'N/A'}" | Our Edge="${c.genie_differentiator || 'Full ecosystem'}" | Their Ratings: ${ratings || 'N/A'}`;
    });

    return `\n=== COMPETITIVE INTELLIGENCE (${data.length} competitors analyzed, never mention names) ===\n${lines.join('\n')}`;
  } catch (e) {
    console.warn('[AIMessaging] Failed to load enriched competitor profiles:', e);
    return '';
  }
}

/**
 * Load market segment intelligence for audience-aware messaging.
 */
async function loadMarketSegmentIntelligence(audienceIds: string[]): Promise<string> {
  try {
    const { data, error } = await supabase
      .from('market_segments')
      .select('segment_name, tam_value, pain_points, messaging_themes, pricing_sensitivity, decision_drivers, buying_triggers')
      .limit(8) as { data: any[] | null; error: any };

    if (error || !data || data.length === 0) return '';

    const relevantSegments = data.slice(0, 5);
    const lines = relevantSegments.map((s: any) => {
      const painPoints = Array.isArray(s.pain_points) ? (s.pain_points as string[]).slice(0, 3).join('; ') : '';
      const themes = Array.isArray(s.messaging_themes) ? (s.messaging_themes as string[]).slice(0, 3).join('; ') : '';
      const triggers = Array.isArray(s.buying_triggers) ? (s.buying_triggers as string[]).slice(0, 2).join('; ') : '';
      return `- ${s.segment_name}: Pain="${painPoints}" | Themes="${themes}" | Triggers="${triggers}" | TAM=$${s.tam_value || 'N/A'}`;
    });

    return `\n=== MARKET INTELLIGENCE ===\n${lines.join('\n')}`;
  } catch (e) {
    console.warn('[AIMessaging] Failed to load market segments:', e);
    return '';
  }
}

/**
 * Load trending industry insights for timely, relevant messaging.
 */
async function loadTrendIntelligence(): Promise<string> {
  try {
    const { data, error } = await supabase
      .from('trend_monitoring_log')
      .select('trend_name, trend_category, impact_assessment, relevance_score')
      .gte('relevance_score', 7)
      .order('relevance_score', { ascending: false })
      .limit(5) as { data: any[] | null; error: any };

    if (error || !data || data.length === 0) return '';

    const lines = data.map((t: any) => `- ${t.trend_name} (${t.trend_category}): ${t.impact_assessment || 'High impact'}`);
    return `\n=== INDUSTRY TRENDS (leverage these for timely messaging) ===\n${lines.join('\n')}`;
  } catch (e) {
    console.warn('[AIMessaging] Failed to load trends:', e);
    return '';
  }
}

/**
 * Resolve product DB UUID from GenieProductId key.
 */
const PRODUCT_KEY_TO_DB_ID: Record<string, string> = {
  spark: '8526e2cc-3db2-4d5f-9d17-34cff668743b',
  mind: 'c7e199a9-08d7-4fd8-9388-53d60e1e96a4',
  vibe: '021192bf-c66f-4c36-a015-579840928c56',
  deck: '23ac1d25-03c3-43f2-9dbc-53ee0c389b77',
  arc: '8fd4faae-bd5b-4bc9-825a-3484db800fd3',
  cast: '63f0fc4b-411b-4f9c-8df6-0fac366e4735',
  ask_genie: '63a1f612-133b-40ba-adbe-84403d7b1498',
  studio: '3da815ca-3801-41dc-b9e4-8451c5d38590',
};

// ============================================================================
// AI MESSAGING GENERATOR SERVICE
// ============================================================================

class AIMessagingGeneratorService {
  private static instance: AIMessagingGeneratorService;
  private pendingRequests: Map<string, MessagingRequest> = new Map();
  private generatedMessaging: Map<string, GeneratedMessaging> = new Map();
  private hasLoadedFromDb = false;

  static getInstance(): AIMessagingGeneratorService {
    if (!this.instance) {
      this.instance = new AIMessagingGeneratorService();
    }
    return this.instance;
  }

  /**
   * Load previously approved messaging from database into memory cache
   */
  async loadPersistedMessaging(): Promise<GeneratedMessaging[]> {
    if (this.hasLoadedFromDb) {
      return Array.from(this.generatedMessaging.values()).filter(m => m.isApproved);
    }

    try {
      const { data, error } = await supabase
        .from('ecosystem_messaging')
        .select('*')
        .eq('is_approved', true)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('[AIMessaging] Failed to load persisted messaging:', error);
        return [];
      }

      const loaded: GeneratedMessaging[] = (data || []).map((row: any) => ({
        requestId: row.request_id || row.id,
        productId: row.product_id || '',
        featureId: row.feature_id || undefined,
        headline: row.headline || row.hero_narrative || '',
        hook: row.hook || (row.hooks?.[0]) || '',
        subHook: row.sub_hook || '',
        cta: row.cta || (row.ctas?.[0]) || '',
        ctaSecondary: row.cta_secondary || '',
        valueProposition: row.value_proposition || (row.value_propositions?.[0]) || '',
        painPoints: row.pain_points || [],
        benefits: row.benefits || [],
        differentiators: row.differentiators || [],
        openingLine: row.opening_line || '',
        closingLine: row.closing_line || '',
        transitionPhrases: row.transition_phrases || [],
        shortScript: row.short_script || '',
        mediumScript: row.medium_script || '',
        longScript: row.long_script || '',
        hashtags: row.hashtags || [],
        keywords: row.keywords || [],
        metaDescription: row.meta_description || '',
        confidence: row.confidence || 0,
        generatedBy: row.generated_by || 'ai',
        version: row.version || 1,
        isApproved: true,
        creativeAngle: row.creative_angle || undefined,
        productionCapability: row.production_capability || undefined,
      }));

      // Cache in memory
      loaded.forEach(m => {
        this.generatedMessaging.set(m.requestId, m);
      });

      this.hasLoadedFromDb = true;
      console.log(`[AIMessaging] Loaded ${loaded.length} persisted messaging from database`);
      return loaded;
    } catch (err) {
      console.error('[AIMessaging] Load error:', err);
      return [];
    }
  }

  /**
   * Create a messaging generation request
   */
  createRequest(
    productId: GenieProductId,
    options: {
      featureId?: string;
      featureName?: string;
      type: MessagingRequest['type'];
      targetAudience: string[];
      competitors?: string[];
      variantCount?: number;
      regionCode?: string;
      creativeAngle?: CreativeAngle;
      productionCapability?: ProductionCapability;
    }
  ): MessagingRequest {
    const id = `msg_${productId}_${Date.now()}`;
    
    const request: MessagingRequest = {
      id,
      productId,
      featureId: options.featureId,
      featureName: options.featureName,
      type: options.type,
      targetAudience: options.targetAudience,
      competitors: options.competitors,
      variantCount: options.variantCount || 1,
      regionCode: options.regionCode,
      creativeAngle: options.creativeAngle,
      productionCapability: options.productionCapability,
      status: 'pending',
    };

    this.pendingRequests.set(id, request);
    return request;
  }

  /**
   * Generate messaging using AI
   */
  async generateMessaging(requestId: string): Promise<GeneratedMessaging> {
    const request = this.pendingRequests.get(requestId);
    if (!request) throw new Error(`Request not found: ${requestId}`);

    request.status = 'generating';
    
    const product = GENIE_PRODUCTS[request.productId];
    const feature = request.featureId 
      ? product.features.find(f => f.id === request.featureId)
      : null;

    // === DB-DRIVEN KNOWLEDGE (subscriber-safe) ===
    const productDbId = PRODUCT_KEY_TO_DB_ID[request.productId];
    const [dbKnowledge, dbCompetitors, enrichedCompetitors, marketIntel, trendIntel] = await Promise.all([
      productDbId ? loadProductKnowledge(productDbId) : Promise.resolve(null),
      productDbId ? loadCompetitorLandscape(productDbId) : Promise.resolve([]),
      loadEnrichedCompetitorProfiles(),
      loadMarketSegmentIntelligence(request.targetAudience),
      loadTrendIntelligence(),
    ]);

    // Get audience pain points
    const audiencePainPoints = request.targetAudience
      .map(a => TARGET_AUDIENCES.find(t => t.id === a))
      .filter(Boolean)
      .flatMap(a => a!.painPoints);

    // Competitor advantages from DB (never expose names, only our advantages)
    const competitorAdvantages = dbCompetitors.map(c => c.our_advantage);
    const competitorWeaknesses = dbCompetitors.map(c => c.competitor_weakness).filter(Boolean) as string[];
    // Fallback to hardcoded if no DB entries
    if (competitorAdvantages.length === 0) {
      const fallbackWeaknesses = (request.competitors || [])
        .map(c => COMPETITOR_DATABASE.find(comp => comp.id === c))
        .filter(Boolean)
        .map(c => c!.weakness);
      competitorWeaknesses.push(...fallbackWeaknesses);
    }

    // Generate using AI
    try {
      // Build comprehensive prompt — prefer DB knowledge, fallback to hardcoded
      const p = product as any;
      const k = dbKnowledge; // DB-driven knowledge (null if not available)
      
      const productContext = [
        `Product: ${p.name} — "${k?.tagline || p.tagline}"`,
        `Category: ${p.category}`,
        `Description: ${k?.elevator_pitch || p.description || ''}`,
        `Value Proposition: ${k?.value_proposition || p.valueProposition || ''}`,
        `Positioning: ${k?.positioning_statement || p.positioning || ''}`,
        `Key Benefits: ${(k?.key_benefits || p.keyBenefits || []).join('; ')}`,
        `Use Cases: ${(k?.use_cases || p.useCases || []).join('; ')}`,
        `Competitive Edge: ${k?.competitive_edge || p.competitiveEdge || ''}`,
        `Pain Points Addressed: ${(k?.pain_points || p.painPoints || []).join('; ')}`,
        `Differentiators: ${(k?.differentiators || []).join('; ')}`,
      ].filter(line => !line.endsWith(': ')).join('\n');

      // Build competitive differentiation context (never mention competitor names!)
      const competitiveContext = competitorAdvantages.length > 0
        ? `\n=== COMPETITIVE DIFFERENTIATION (do NOT mention competitor names) ===\nOur Key Advantages:\n${competitorAdvantages.map((a, i) => `${i + 1}. ${a}`).join('\n')}`
        : competitorWeaknesses.length > 0
          ? `\nCompetitor Weaknesses to Exploit (do NOT name competitors): ${competitorWeaknesses.join(', ')}`
          : '';

      // Detect if this is the unified Genie Suite product (ecosystem-level messaging)
      const isEcosystemProduct = p.id === 'studio' || p.name === 'Genie Suite';

      const ecosystemPositioning = isEcosystemProduct ? `
=== ECOSYSTEM-LEVEL POSITIONING (THIS IS THE UNIFIED PLATFORM, NOT A SINGLE PRODUCT) ===
Genie Suite is NOT just another AI tool — it is the ONLY unified ecosystem that takes you from Mind to Media.
It combines 7 specialized products into ONE seamless creative command center:

1. **Genie Spark** — AI Ideation Engine: Turn a blank page into a full creative brief in seconds
2. **Genie Mind** — Script Writing & Enhancement: Professional scripts with emotional arc, pacing, and audience hooks
3. **Genie Vibe** — Video Production Studio: Multi-modal video generation (Avatar, 3D, Motion Graphics, Stock Remix)
4. **Genie Deck** — Presentation Intelligence: AI-powered pitch decks, sales presentations, and training modules
5. **Genie Hub** — Creative Command Center: Project management, asset library, team collaboration
6. **Genie Cast** — Publishing & Distribution: Multi-platform publishing with transcreation for 50+ languages
7. **Ask Genie** — AI Creative Coach: Real-time guidance across every product and workflow

THE ECOSYSTEM ADVANTAGE (emphasize this heavily):
- No other platform offers this. Competitors sell ONE tool. We sell the ENTIRE creative workflow.
- Shared intelligence: What you create in Spark flows into Mind, which feeds Vibe, which publishes via Cast.
- 200+ AI pipelines, 30+ AI providers, 50+ languages, 62+ sub-regions, 140+ regional dialects
- One subscription replaces 5-7 separate tools ($500+/month savings)
- Enterprise-grade: SOC2-ready, HIPAA-aligned, multi-tenant, role-based access

HERO-LEVEL MESSAGING EXAMPLES (match this caliber):
- "One Ecosystem. Every Creative Need. Zero Compromise."
- "Stop Juggling 7 Tools. Command One Suite."
- "From Spark of Idea to Global Campaign — Without Leaving Genie."
- "The World's First Mind-to-Media AI Ecosystem"
- "Create in English. Publish in 50 Languages. Dominate Every Market."

LANDING PAGE ANGLE:
- This messaging will be used on hero banners, landing pages, and marketing campaigns
- It must convey the FULL POWER of the ecosystem, not just one feature
- Show the JOURNEY: Idea → Script → Video → Presentation → Publish → Analyze
- Emphasize the elimination of tool fragmentation and creative bottlenecks
- Position against the market: "While others sell hammers, we built the entire workshop"
` : '';

      const messagingPrompt = `You are a world-class creative director and marketing strategist at a top agency. Generate BOLD, emotionally resonant, and strategically differentiated messaging that makes people stop scrolling.

=== PRODUCT CONTEXT ===
${productContext}
${competitiveContext}
${enrichedCompetitors}
${marketIntel}
${trendIntel}
${ecosystemPositioning}

=== TARGET ===
Feature Focus: ${feature?.name || p.name}
Messaging Type: ${request.type}
Audience Pain Points: ${audiencePainPoints.join(', ') || 'General content creators and marketing teams'}

=== ECOSYSTEM CONTEXT ===
${isEcosystemProduct
  ? 'THIS IS THE UNIFIED GENIE SUITE PLATFORM. Generate messaging that showcases the FULL ECOSYSTEM — all 7 products working together as one seamless creative command center. Do NOT treat this as a single tool. Show the complete Mind-to-Media journey. Every headline, hook, and script must convey ecosystem-level power and differentiation.'
  : `This product is part of the Genie Suite — an 8-product AI content creation ecosystem ("Mind to Media"): Spark (ideation), Mind (scripting), Vibe (video production), Deck (presentations), Hub (project management), Cast (publishing & distribution), Ask Genie (AI assistant), and Genie Suite (the unified platform). All products share context and intelligence. 200+ AI pipelines, 30+ AI providers, 50+ languages, 62+ sub-regions.`
}

=== CREATIVE MANDATE ===
- Write like Apple's creative team meets Nike's emotional storytelling — BOLD, VISCERAL, UNFORGETTABLE
${isEcosystemProduct
  ? `- This is for LANDING PAGES and HERO BANNERS — messaging must be EPIC, ecosystem-level, and convey the full Mind-to-Media journey
- Show how 7 products work as ONE unified platform — the creative workflow revolution
- Emphasize the elimination of tool fragmentation: "One ecosystem replaces 7 separate subscriptions"
- Highlight shared intelligence across products: ideas flow seamlessly from Spark → Mind → Vibe → Cast
- Include global reach: 50+ languages, 62+ sub-regions, 140+ dialects
- Position as category-defining: "The world's first Mind-to-Media AI ecosystem"`
  : `- Make messaging SPECIFIC to ${p.name}, not generic AI tool copy
- Reference the product's unique capabilities and positioning`
}
- NEVER mention competitor names — only highlight our unique advantages and differentiation
- Address specific audience pain points with EMOTIONALLY charged solutions
- Use competitive intelligence to create razor-sharp differentiation
- Scripts should tell a COMPELLING STORY with tension, transformation, and triumph
- Every headline must pass the "Would I stop scrolling?" test
- Use power words: Transform, Unleash, Dominate, Revolutionize, Command, Ignite
- Leverage current industry trends for timely relevance
- All output must feel like it was crafted by a Cannes Lions-winning creative director
${request.creativeAngle ? `\n=== CREATIVE ANGLE (MUST FOLLOW) ===\n${CREATIVE_ANGLES[request.creativeAngle].promptDirective}\n` : ''}
${(() => {
  const tone = getProductionTone(request.productionCapability);
  if (!tone) return '';
  return `\n=== PRODUCTION CONTEXT TONE (MUST ADAPT ALL OUTPUT TO THIS FORMAT) ===\n${tone.toneDirective}\n\nSCRIPT CONSTRAINTS:\n- Max sentence length: ${tone.scriptConstraints.maxSentenceLength} words\n- Preferred format: ${tone.scriptConstraints.preferredFormat}\n- AVOID: ${tone.scriptConstraints.avoidPatterns.join(', ')}\n`;
})()}
Generate the following in JSON format:
{
  "headline": "Compelling headline under 60 chars specific to ${p.name}",
  "hook": "Attention-grabbing opening hook that references a specific ${p.name} capability",
  "subHook": "Supporting sub-hook with concrete value",
  "cta": "Primary call to action",
  "ctaSecondary": "Secondary call to action",
  "valueProposition": "Core value proposition specific to ${p.name}",
  "painPoints": ["3 specific audience pain points that ${p.name} solves"],
  "benefits": ["3 concrete benefits with metrics where possible"],
  "differentiators": ["3 competitive differentiators unique to ${p.name}"],
  "openingLine": "Video/script opening line that hooks in 3 seconds",
  "closingLine": "Memorable closing line with brand recall",
  "transitionPhrases": ["3 transition phrases for video scripts"],
  "shortScript": "Complete 30-second script (4-5 sentences) following the creative angle",
  "hashtags": ["5 relevant hashtags"],
  "keywords": ["5 SEO keywords"],
  "metaDescription": "SEO meta description under 160 chars",
  "confidence": 0.85
}`;

      // Zone-based routing — use the 4-zone config from master-ecosystem-registry
      const routing = getMessagingProvider(request.regionCode);
      console.log(`[AIMessaging] Zone routing: region=${request.regionCode || 'default'} → provider=${routing.provider}, model=${routing.model}`);

      const { data, error } = await supabase.functions.invoke('ai-universal-processor', {
        body: {
          provider: routing.provider,
          model: routing.model,
          prompt: messagingPrompt,
          action: 'generate_marketing_messaging',
          temperature: 0.9, // High creativity for diverse messaging
          maxTokens: 4000,
          productName: p.name,
          productTagline: p.tagline,
          productDescription: p.description || undefined,
          productPositioning: p.positioning || undefined,
          featureName: feature?.name || p.name,
          type: request.type,
          audiencePainPoints,
          competitorWeaknesses,
          frameworks: Object.keys(MESSAGING_FRAMEWORKS),
          templates: MESSAGING_TEMPLATES.map(t => t.template),
          responseFormat: 'json',
        },
      });

      if (error) throw error;

      // Parse AI response or use fallback generation
      const messaging = this.parseAIResponse(data, request, product, feature);
      
      request.status = 'pending_approval';
      request.generatedAt = new Date();
      
      this.generatedMessaging.set(requestId, messaging);
      
      console.log(`[AIMessaging] Generated messaging for ${product.name}${feature ? ` - ${feature.name}` : ''}`);
      return messaging;
      
    } catch (error) {
      console.warn('[AIMessaging] AI generation failed, using template-based fallback');
      
      // Fallback to template-based generation
      const messaging = this.generateFromTemplates(request, product, feature);
      request.status = 'pending_approval';
      request.generatedAt = new Date();
      
      this.generatedMessaging.set(requestId, messaging);
      return messaging;
    }
  }

  /**
   * Generate multiple messaging variants with different creative angles.
   * Uses zone-based LLM routing and assigns a unique angle per variant.
   */
  async generateMessagingVariants(
    productId: GenieProductId,
    options: {
      featureId?: string;
      featureName?: string;
      type: MessagingRequest['type'];
      targetAudience: string[];
      competitors?: string[];
      variantCount: number;
      regionCode?: string;
      productionCapability?: ProductionCapability;
    }
  ): Promise<GeneratedMessaging[]> {
    const count = Math.max(1, Math.min(6, options.variantCount));
    const angles = getCreativeAnglesForCount(count);
    
    console.log(`[AIMessaging] Generating ${count} variants with angles: ${angles.join(', ')}`);

    const results: GeneratedMessaging[] = [];
    
    // Generate variants sequentially to avoid rate limiting
    for (let i = 0; i < count; i++) {
      const request = this.createRequest(productId, {
        ...options,
        creativeAngle: angles[i],
        regionCode: options.regionCode,
        productionCapability: options.productionCapability,
      });
      
      try {
        const messaging = await this.generateMessaging(request.id);
        messaging.creativeAngle = angles[i];
        messaging.productionCapability = options.productionCapability;
        messaging.variantIndex = i + 1;
        results.push(messaging);
      } catch (error) {
        console.warn(`[AIMessaging] Variant ${i + 1} (${angles[i]}) failed:`, error);
      }
    }
    
    console.log(`[AIMessaging] Generated ${results.length}/${count} variants successfully`);
    return results;
  }

  /**
   * Parse AI response into GeneratedMessaging structure
   */
  private parseAIResponse(
    data: any,
    request: MessagingRequest,
    product: typeof GENIE_PRODUCTS[GenieProductId],
    feature: { id: string; name: string } | null
  ): GeneratedMessaging {
    // Robustly extract AI content - handle string JSON, nested objects, etc.
    let aiContent: any = {};
    
    try {
      const rawContent = data?.content || data?.messaging || data?.data?.content || data;
      
      if (typeof rawContent === 'string') {
        // Try to extract JSON from string (may have markdown code fences)
        const jsonMatch = rawContent.match(/```json\s*([\s\S]*?)\s*```/) 
          || rawContent.match(/```\s*([\s\S]*?)\s*```/)
          || rawContent.match(/(\{[\s\S]*\})/);
        if (jsonMatch?.[1]) {
          aiContent = JSON.parse(jsonMatch[1]);
        } else {
          aiContent = JSON.parse(rawContent);
        }
      } else if (typeof rawContent === 'object' && rawContent !== null) {
        // Check if it's already structured with messaging fields
        if (rawContent.headline || rawContent.hook) {
          aiContent = rawContent;
        } else if (rawContent.content) {
          // Nested content field
          aiContent = typeof rawContent.content === 'string' 
            ? JSON.parse(rawContent.content) 
            : rawContent.content;
        } else {
          aiContent = rawContent;
        }
      }
      
      console.log('[AIMessaging] Parsed AI content keys:', Object.keys(aiContent));
    } catch (parseError) {
      console.warn('[AIMessaging] Failed to parse AI response as JSON:', parseError);
      console.log('[AIMessaging] Raw data type:', typeof data, 'Keys:', data ? Object.keys(data) : 'null');
    }

    const hasAIContent = aiContent.headline || aiContent.hook || aiContent.valueProposition;
    if (!hasAIContent) {
      console.warn('[AIMessaging] AI content empty or unparseable, falling back to templates');
    }
    
    return {
      requestId: request.id,
      productId: request.productId,
      featureId: request.featureId,
      
      headline: aiContent.headline || this.generateHeadline(product, feature),
      hook: aiContent.hook || this.generateHook(product, feature),
      subHook: aiContent.subHook || `Discover how ${product.name} transforms your workflow`,
      cta: aiContent.cta || `Try ${product.name} Free`,
      ctaSecondary: aiContent.ctaSecondary || 'Watch Demo',
      
      valueProposition: aiContent.valueProposition || product.tagline,
      painPoints: aiContent.painPoints || ['Time-consuming manual work', 'Inconsistent quality', 'Scalability challenges'],
      benefits: aiContent.benefits || ['Save 10x time', 'Professional results', 'Scale effortlessly'],
      differentiators: aiContent.differentiators || ['Multi-modal AI', 'Regional intelligence', '200+ pipelines'],
      
      openingLine: aiContent.openingLine || `What if ${feature?.name || product.name} was just one click away?`,
      closingLine: aiContent.closingLine || `Start creating with ${product.name} today.`,
      transitionPhrases: aiContent.transitionPhrases || ['But that\'s not all...', 'Here\'s where it gets interesting...', 'Watch this...'],
      
      shortScript: aiContent.shortScript || this.generateScript('short', product, feature),
      mediumScript: aiContent.mediumScript || this.generateScript('medium', product, feature),
      longScript: aiContent.longScript || this.generateScript('long', product, feature),
      
      hashtags: aiContent.hashtags || this.generateHashtags(product, feature),
      keywords: aiContent.keywords || [product.name.toLowerCase(), 'ai', 'content creation', 'automation'],
      metaDescription: aiContent.metaDescription || `${product.name}: ${product.tagline}. Transform your content workflow with AI.`,
      
      confidence: aiContent.confidence || 0.85,
      generatedBy: hasAIContent ? 'ai-universal-processor' : 'template-fallback',
      version: 1,
      isApproved: false,
    };
  }

  /**
   * Generate messaging from templates (fallback)
   */
  private generateFromTemplates(
    request: MessagingRequest,
    product: typeof GENIE_PRODUCTS[GenieProductId],
    feature: { id: string; name: string } | null
  ): GeneratedMessaging {
    return {
      requestId: request.id,
      productId: request.productId,
      featureId: request.featureId,
      
      headline: this.generateHeadline(product, feature),
      hook: this.generateHook(product, feature),
      subHook: `See how ${feature?.name || product.name} eliminates hours of manual work`,
      cta: `Start with ${product.name}`,
      ctaSecondary: 'See It In Action',
      
      valueProposition: product.tagline,
      painPoints: ['Wasting hours on repetitive tasks', 'Inconsistent output quality', 'Limited creative bandwidth'],
      benefits: ['Reclaim your time', 'Consistent professional results', 'Unlimited creative potential'],
      differentiators: [
        'Only platform with 200+ AI pipelines',
        'Regional AI for authentic localization',
        'From idea to multi-format output in minutes',
      ],
      
      openingLine: `Tired of spending hours on ${feature?.name?.toLowerCase() || 'content creation'}?`,
      closingLine: `${product.name}: ${product.tagline}. Try it free today.`,
      transitionPhrases: ['And the best part?', 'But here\'s what makes it different...', 'See for yourself...'],
      
      shortScript: this.generateScript('short', product, feature),
      mediumScript: this.generateScript('medium', product, feature),
      longScript: this.generateScript('long', product, feature),
      
      hashtags: this.generateHashtags(product, feature),
      keywords: [product.id, 'ai content', 'automation', feature?.id || ''].filter(Boolean),
      metaDescription: `${product.name} - ${product.tagline}. Create professional content 10x faster with AI.`,
      
      confidence: 0.75,
      generatedBy: 'template-fallback',
      version: 1,
      isApproved: false,
    };
  }

  private generateHeadline(product: typeof GENIE_PRODUCTS[GenieProductId], feature: { name: string } | null): string {
    const isEcosystem = product.name === 'Genie Suite' || (product as any).id === 'studio';
    const templates = isEcosystem 
      ? [
          'One Ecosystem. Every Creative Need. Zero Compromise.',
          'The World\'s First Mind-to-Media AI Ecosystem',
          'Stop Juggling 7 Tools. Command One Suite.',
          'From Spark of Idea to Global Campaign — One Platform.',
        ]
      : [
          `${feature?.name || product.name}: ${product.tagline}`,
          `Transform Your Workflow with ${product.name}`,
          `${product.name} - AI That Actually Works`,
        ];
    return templates[Math.floor(Math.random() * templates.length)];
  }

  private generateHook(product: typeof GENIE_PRODUCTS[GenieProductId], feature: { name: string } | null): string {
    const isEcosystem = product.name === 'Genie Suite' || (product as any).id === 'studio';
    const templates = isEcosystem
      ? [
          'What if one platform could replace your entire creative stack? Spark → Mind → Vibe → Cast. Watch.',
          '7 AI products. 200+ pipelines. 50+ languages. One ecosystem. This changes everything.',
          'You\'re paying for 7 separate tools. We built them all into one. Here\'s proof.',
          'From blank page to global campaign in minutes. Not a demo. Not a promise. Reality.',
        ]
      : [
          `In 30 seconds, I'll show you how ${product.name} changed everything`,
          `What if ${feature?.name || 'AI content creation'} was this easy?`,
          `Stop struggling with ${feature?.name?.toLowerCase() || 'content'}. Watch this.`,
          `The secret weapon top creators use for ${feature?.name?.toLowerCase() || 'professional content'}`,
        ];
    return templates[Math.floor(Math.random() * templates.length)];
  }

  private generateScript(
    length: 'short' | 'medium' | 'long',
    product: typeof GENIE_PRODUCTS[GenieProductId],
    feature: { name: string } | null
  ): string {
    const name = feature?.name || product.name;
    
    if (length === 'short') {
      return `Stop wasting hours on ${name.toLowerCase()}. ${product.name} uses AI to do it in seconds. Watch. [Demo] That's ${product.tagline.toLowerCase()}. Try it free.`;
    }
    
    if (length === 'medium') {
      return `What if I told you ${name.toLowerCase()} could take seconds instead of hours? Meet ${product.name}. [Show problem] We've all been there - staring at a blank screen. [Show solution] With ${product.name}, just describe what you want. [Demo] The AI handles the rest. Professional results. Every time. ${product.tagline}. Link in bio.`;
    }
    
    return `There's a problem with traditional ${name.toLowerCase()}. It takes too long. The quality is inconsistent. And scaling? Forget about it. [Pause] But what if there was a better way? [Transition] Introducing ${product.name}. [Demo sequence] Watch as I create ${feature?.name || 'professional content'} in real-time. No templates. No tedious editing. Just describe what you want, and let the AI work its magic. [Show results] That's the power of 200+ AI pipelines, regional intelligence, and multi-modal generation - all in one platform. ${product.name}: ${product.tagline}. Start free today.`;
  }

  private generateHashtags(product: typeof GENIE_PRODUCTS[GenieProductId], feature: { name: string } | null): string[] {
    const base = [`#${product.name.replace(/\s/g, '')}`, '#AIContent', '#ContentCreation', '#Productivity'];
    if (feature) {
      base.push(`#${feature.name.replace(/\s/g, '')}`);
    }
    return base;
  }

  /**
   * Approve generated messaging and persist to database
   */
  async approveMessaging(requestId: string, approvedBy: string): Promise<void> {
    const request = this.pendingRequests.get(requestId);
    const messaging = this.generatedMessaging.get(requestId);
    
    if (!request || !messaging) {
      throw new Error(`Messaging not found: ${requestId}`);
    }

    request.status = 'approved';
    request.approvedAt = new Date();
    request.approvedBy = approvedBy;
    messaging.isApproved = true;

    // Register with feature discovery service
    if (request.featureId) {
      featureDiscoveryService.updateFeatureMessaging(request.featureId, {
        headline: messaging.headline,
        hook: messaging.hook,
        description: messaging.valueProposition,
        painPoints: messaging.painPoints,
        benefits: messaging.benefits,
        hashtags: messaging.hashtags,
      });
    }

    // Persist to database
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { error } = await supabase.from('ecosystem_messaging').insert({
          user_id: user.id,
          request_id: requestId,
          product_id: messaging.productId,
          feature_id: messaging.featureId || null,
          audience_segment: request.targetAudience?.[0] || 'general',
          framework_type: 'ai_generated',
          messaging_tier: 'product',
          headline: messaging.headline,
          hook: messaging.hook,
          sub_hook: messaging.subHook,
          cta: messaging.cta,
          cta_secondary: messaging.ctaSecondary,
          value_proposition: messaging.valueProposition,
          hero_narrative: messaging.headline,
          guide_positioning: messaging.valueProposition,
          pain_points: messaging.painPoints,
          hooks: [messaging.hook, messaging.subHook].filter(Boolean),
          ctas: [messaging.cta, messaging.ctaSecondary].filter(Boolean),
          value_propositions: [messaging.valueProposition],
          benefits: messaging.benefits,
          differentiators: messaging.differentiators,
          opening_line: messaging.openingLine,
          closing_line: messaging.closingLine,
          transition_phrases: messaging.transitionPhrases,
          short_script: messaging.shortScript,
          medium_script: messaging.mediumScript,
          long_script: messaging.longScript,
          hashtags: messaging.hashtags,
          keywords: messaging.keywords,
          meta_description: messaging.metaDescription,
          confidence: messaging.confidence,
          generated_by: messaging.generatedBy,
          version: messaging.version,
          creative_angle: messaging.creativeAngle || null,
          production_capability: messaging.productionCapability || null,
          is_approved: true,
          approved_by: approvedBy,
          approved_at: new Date().toISOString(),
        } as any);

        if (error) {
          console.error('[AIMessaging] Failed to persist messaging:', error);
        } else {
          console.log(`[AIMessaging] Persisted approved messaging to database for ${request.productId}`);
        }
      }
    } catch (err) {
      console.error('[AIMessaging] DB persistence error:', err);
    }

    console.log(`[AIMessaging] Approved messaging for ${request.productId}${request.featureId ? `/${request.featureId}` : ''}`);
  }

  /**
   * Reject generated messaging
   */
  rejectMessaging(requestId: string, reason: string): void {
    const request = this.pendingRequests.get(requestId);
    if (!request) throw new Error(`Request not found: ${requestId}`);

    request.status = 'rejected';
    request.rejectionReason = reason;

    console.log(`[AIMessaging] Rejected messaging for ${requestId}: ${reason}`);
  }

  /**
   * Get messaging by request ID
   */
  getMessaging(requestId: string): GeneratedMessaging | null {
    return this.generatedMessaging.get(requestId) || null;
  }

  /**
   * Get pending approvals
   */
  getPendingApprovals(): MessagingRequest[] {
    return Array.from(this.pendingRequests.values())
      .filter(r => r.status === 'pending_approval');
  }

  /**
   * Get approved messaging for a product/feature
   */
  getApprovedMessaging(productId: string, featureId?: string): GeneratedMessaging | null {
    for (const [_, messaging] of this.generatedMessaging) {
      if (messaging.productId === productId && 
          messaging.isApproved && 
          (!featureId || messaging.featureId === featureId)) {
        return messaging;
      }
    }
    return null;
  }

  /**
   * Generate competitor battle card
   */
  generateBattleCard(productId: GenieProductId, competitorId: string): CompetitorAnalysis | null {
    const product = GENIE_PRODUCTS[productId];
    const competitor = COMPETITOR_DATABASE.find(c => c.id === competitorId);
    
    if (!product || !competitor) return null;

    return {
      competitor: competitor.name,
      theirClaim: `Leading ${competitor.category} platform`,
      ourAdvantage: `${product.name} offers ${competitor.weakness ? 'what they lack: ' + competitor.weakness : 'superior AI integration'}`,
      battleCard: `When prospects mention ${competitor.name}, highlight ${product.name}'s unique multi-modal AI capabilities and 200+ pipeline ecosystem.`,
    };
  }

  /**
   * Get all competitors for comparison
   */
  getCompetitors(): typeof COMPETITOR_DATABASE {
    return COMPETITOR_DATABASE;
  }

  /**
   * Get target audiences
   */
  getTargetAudiences(): typeof TARGET_AUDIENCES {
    return TARGET_AUDIENCES;
  }
}

export const aiMessagingGeneratorService = AIMessagingGeneratorService.getInstance();
