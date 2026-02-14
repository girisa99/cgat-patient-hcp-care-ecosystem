/**
 * Competitive Intelligence Service
 * 
 * Provides market analysis, competitor tracking, USP management,
 * and auto-enrichment of AI prompts with competitive context.
 */

import { supabase } from '@/integrations/supabase/client';

// ============================================================================
// TYPES
// ============================================================================

export interface CompetitorProfile {
  id: string;
  name: string;
  website_url: string | null;
  category: string;
  subcategories: string[];
  description: string | null;
  tagline: string | null;
  pricing_model: string | null;
  pricing_range: string | null;
  key_features: string[];
  weaknesses: string[];
  strengths: string[];
  target_market: string[];
  regions_active: string[];
  languages_supported: number;
  last_scraped_at: string | null;
  scraped_data: any;
  logo_url: string | null;
  founded_year: number | null;
  funding_status: string | null;
  estimated_users: string | null;
  is_active: boolean;
  created_at: string;
}

export interface FeatureComparison {
  id: string;
  feature_name: string;
  feature_category: string;
  genie_product: string;
  genie_capability: string;
  genie_details: string | null;
  is_differentiator: boolean;
  competitor_scores: Record<string, string>;
  importance_weight: number;
}

export interface MarketAnalysis {
  id: string;
  analysis_type: string;
  scope: string;
  scope_filter: string | null;
  title: string;
  summary: string;
  detailed_analysis: any;
  key_insights: string[];
  recommendations: string[];
  data_sources: string[];
  confidence_score: number;
  model_used: string | null;
  expires_at: string | null;
  created_at: string;
}

export interface TrendEntry {
  id: string;
  trend_type: string;
  source: string;
  source_url: string | null;
  title: string;
  description: string;
  impact_level: string;
  affected_products: string[];
  affected_competitors: string[];
  raw_data: any;
  action_taken: string | null;
  is_addressed: boolean;
  detected_at: string;
}

export interface USPEntry {
  id: string;
  product_id: string;
  usp_statement: string;
  supporting_evidence: string[];
  competitors_lacking: string[];
  market_segment: string | null;
  strength_score: number;
  is_validated: boolean;
  validated_by: string | null;
}

export interface CompetitiveContext {
  usps: USPEntry[];
  differentiators: FeatureComparison[];
  competitorWeaknesses: { competitor: string; weaknesses: string[] }[];
  positioningStatement: string;
}

// ============================================================================
// COMPETITOR CATEGORIES
// ============================================================================

export const COMPETITOR_CATEGORIES = [
  { id: 'ai_video', label: 'AI Video', icon: '🎬' },
  { id: 'ppt', label: 'Presentations', icon: '📊' },
  { id: 'podcast', label: 'Podcast/Audio', icon: '🎙️' },
  { id: 'translation', label: 'Translation', icon: '🌐' },
  { id: 'tts', label: 'TTS/STT', icon: '🗣️' },
  { id: 'avatar_3d', label: 'Avatar/3D', icon: '🧑‍🎨' },
  { id: 'mobile_first', label: 'Mobile-First', icon: '📱' },
  { id: 'media_production', label: 'Media Production', icon: '🎞️' },
  { id: 'script_editor', label: 'Script Editor', icon: '📝' },
  { id: 'video_editing', label: 'Video Editing', icon: '✂️' },
  { id: 'stt', label: 'Speech-to-Text', icon: '👂' },
];

// ============================================================================
// SERVICE
// ============================================================================

class CompetitiveIntelligenceService {
  private static instance: CompetitiveIntelligenceService;
  private cache: Map<string, { data: any; expiry: number }> = new Map();
  private CACHE_TTL = 5 * 60 * 1000; // 5 minutes

  static getInstance(): CompetitiveIntelligenceService {
    if (!CompetitiveIntelligenceService.instance) {
      CompetitiveIntelligenceService.instance = new CompetitiveIntelligenceService();
    }
    return CompetitiveIntelligenceService.instance;
  }

  // ── Competitor Profiles ──────────────────────────────────────────────

  async getCompetitors(category?: string): Promise<CompetitorProfile[]> {
    const cacheKey = `competitors_${category || 'all'}`;
    const cached = this.getFromCache(cacheKey);
    if (cached) return cached;

    let query = supabase
      .from('competitor_profiles')
      .select('*')
      .eq('is_active', true)
      .order('name');

    if (category) {
      query = query.eq('category', category);
    }

    const { data, error } = await query;
    if (error) throw error;

    const result = (data || []) as unknown as CompetitorProfile[];
    this.setCache(cacheKey, result);
    return result;
  }

  async getCompetitorsByCategories(categories: string[]): Promise<CompetitorProfile[]> {
    const { data, error } = await supabase
      .from('competitor_profiles')
      .select('*')
      .eq('is_active', true)
      .in('category', categories)
      .order('name');

    if (error) throw error;
    return (data || []) as unknown as CompetitorProfile[];
  }

  // ── Feature Comparison Matrix ────────────────────────────────────────

  async getFeatureMatrix(categoryFilter?: string): Promise<FeatureComparison[]> {
    const cacheKey = `features_${categoryFilter || 'all'}`;
    const cached = this.getFromCache(cacheKey);
    if (cached) return cached;

    let query = supabase
      .from('feature_comparison_matrix')
      .select('*')
      .order('importance_weight', { ascending: false });

    if (categoryFilter) {
      query = query.eq('feature_category', categoryFilter);
    }

    const { data, error } = await query;
    if (error) throw error;

    const result = (data || []) as unknown as FeatureComparison[];
    this.setCache(cacheKey, result);
    return result;
  }

  async getDifferentiators(): Promise<FeatureComparison[]> {
    const { data, error } = await supabase
      .from('feature_comparison_matrix')
      .select('*')
      .eq('is_differentiator', true)
      .order('importance_weight', { ascending: false });

    if (error) throw error;
    return (data || []) as unknown as FeatureComparison[];
  }

  // ── USP Registry ────────────────────────────────────────────────────

  async getUSPs(productId?: string): Promise<USPEntry[]> {
    let query = supabase
      .from('usp_registry')
      .select('*')
      .order('strength_score', { ascending: false });

    if (productId) {
      query = query.eq('product_id', productId);
    }

    const { data, error } = await query;
    if (error) throw error;
    return (data || []) as unknown as USPEntry[];
  }

  // ── Market Analysis ─────────────────────────────────────────────────

  async getAnalyses(type?: string): Promise<MarketAnalysis[]> {
    let query = supabase
      .from('market_analysis_results')
      .select('*')
      .eq('is_active', true)
      .order('created_at', { ascending: false });

    if (type) {
      query = query.eq('analysis_type', type);
    }

    const { data, error } = await query;
    if (error) throw error;
    return (data || []) as unknown as MarketAnalysis[];
  }

  async runAIAnalysis(analysisType: string, scope: string, scopeFilter?: string): Promise<MarketAnalysis> {
    const { data, error } = await supabase.functions.invoke('competitive-intelligence', {
      body: {
        action: 'analyze',
        analysisType,
        scope,
        scopeFilter,
        region: scope,
        subRegion: scopeFilter,
      }
    });

    if (error) throw error;
    return data.analysis;
  }

  // ── Trend Monitoring ────────────────────────────────────────────────

  async getTrends(limit = 50): Promise<TrendEntry[]> {
    const { data, error } = await supabase
      .from('trend_monitoring_log')
      .select('*')
      .order('detected_at', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return (data || []) as unknown as TrendEntry[];
  }

  async getUnaddressedTrends(): Promise<TrendEntry[]> {
    const { data, error } = await supabase
      .from('trend_monitoring_log')
      .select('*')
      .eq('is_addressed', false)
      .order('detected_at', { ascending: false });

    if (error) throw error;
    return (data || []) as unknown as TrendEntry[];
  }

  // ── Competitive Context for AI Enrichment ───────────────────────────

  async getCompetitiveContext(productId?: string, category?: string): Promise<CompetitiveContext> {
    const cacheKey = `context_${productId || 'all'}_${category || 'all'}`;
    const cached = this.getFromCache(cacheKey);
    if (cached) return cached;

    const [usps, differentiators, competitors] = await Promise.all([
      this.getUSPs(productId),
      this.getDifferentiators(),
      this.getCompetitors(category),
    ]);

    const competitorWeaknesses = competitors.map(c => ({
      competitor: c.name,
      weaknesses: c.weaknesses,
    }));

    const topUSP = usps[0]?.usp_statement || 'End-to-end AI content pipeline';
    const topDiffs = differentiators.slice(0, 3).map(d => d.feature_name).join(', ');

    const positioningStatement = `Genie Suite is the only platform offering ${topUSP}. Key differentiators include: ${topDiffs}. Unlike competitors who offer point solutions, Genie provides a unified Knowledge → Script → Video → Publish pipeline with healthcare compliance, 30+ AI providers, and AI transcreation across 62+ regions.`;

    const result: CompetitiveContext = {
      usps,
      differentiators,
      competitorWeaknesses,
      positioningStatement,
    };

    this.setCache(cacheKey, result);
    return result;
  }

  /**
   * Generate competitive enrichment text for AI prompt injection
   */
  async getPromptEnrichment(productId?: string): Promise<string> {
    const context = await this.getCompetitiveContext(productId);

    const uspBlock = context.usps.slice(0, 5)
      .map(u => `- ${u.usp_statement} (vs ${u.competitors_lacking.join(', ')})`)
      .join('\n');

    const diffBlock = context.differentiators.slice(0, 6)
      .map(d => `- ${d.feature_name}: ${d.genie_details} [${d.genie_capability}]`)
      .join('\n');

    const weakBlock = context.competitorWeaknesses.slice(0, 5)
      .map(c => `- ${c.competitor}: ${c.weaknesses.slice(0, 2).join(', ')}`)
      .join('\n');

    return `
## Competitive Intelligence Context

### Our Unique Selling Propositions
${uspBlock}

### Key Differentiators (competitors lack these)
${diffBlock}

### Competitor Weaknesses to Leverage
${weakBlock}

### Positioning
${context.positioningStatement}

Use this competitive context to make messaging sharper, highlight unique advantages, and position against specific competitor weaknesses.
`.trim();
  }

  // ── Dashboard Stats ─────────────────────────────────────────────────

  async getDashboardStats() {
    const [competitors, features, usps, trends] = await Promise.all([
      this.getCompetitors(),
      this.getFeatureMatrix(),
      this.getUSPs(),
      this.getUnaddressedTrends(),
    ]);

    const differentiators = features.filter(f => f.is_differentiator);
    const avgDiffScore = differentiators.length > 0
      ? differentiators.reduce((sum, d) => sum + d.importance_weight, 0) / differentiators.length
      : 0;

    return {
      totalCompetitors: competitors.length,
      categoriesCovered: new Set(competitors.map(c => c.category)).size,
      totalFeatures: features.length,
      differentiatorCount: differentiators.length,
      differentiatorScore: Math.round(avgDiffScore * 100),
      totalUSPs: usps.length,
      validatedUSPs: usps.filter(u => u.is_validated).length,
      unaddressedTrends: trends.length,
    };
  }

  // ── Cache Helpers ───────────────────────────────────────────────────

  private getFromCache(key: string): any | null {
    const entry = this.cache.get(key);
    if (entry && Date.now() < entry.expiry) return entry.data;
    this.cache.delete(key);
    return null;
  }

  private setCache(key: string, data: any): void {
    this.cache.set(key, { data, expiry: Date.now() + this.CACHE_TTL });
  }

  clearCache(): void {
    this.cache.clear();
  }
}

export const competitiveIntelligenceService = CompetitiveIntelligenceService.getInstance();
