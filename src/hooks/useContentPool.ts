/**
 * useContentPool - Unified Content Source for CREATE/PRODUCE/PUBLISH
 * 
 * Single hook that aggregates:
 * 1. Product metadata (8 Genie products for internal, or subscriber's products)
 * 2. Brand assets (logos, colors, typography)
 * 3. Regional scripts (transcreated per language + region)
 * 4. TTS audio versions (pre-generated, cached per voice)
 * 5. Messaging context (frameworks, CTAs, value props per persona)
 * 
 * Serves both:
 * - Internal Mode: Genie Suite marketing (is_system_default = true)
 * - External Mode: Subscriber's products via RLS
 * 
 * Used by: CREATE wizard, PRODUCE pipelines, Asset Lab derivatives, PUBLISH scheduling
 */

import { useEffect, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

// ============================================================================
// TYPES - Complete Content Pool Schema
// ============================================================================

export interface ContentPoolProduct {
  id: string;
  name: string;
  tagline: string;
  description: string;
  created_by: string | null;
  is_system_default: boolean;
  categories: string[];
  target_industries: string[];
  key_features: string[];
  value_propositions: string[];
  screenshots_asset_keys: string[];
  positioning_statement: string;
  competitive_advantage: string;
}

export interface ContentPoolBrandAsset {
  id: string;
  created_by: string | null;
  is_system_default: boolean;
  logo_light_url: string | null;
  logo_dark_url: string | null;
  primary_color: string; // HSL
  secondary_color: string;
  accent_color: string;
  font_family_display: string;
  font_family_body: string;
  voice_tone: string; // 'professional', 'friendly', 'edgy', etc.
  brand_guidelines_url: string | null;
  compliance_rules: Record<string, unknown>;
}

export interface ContentPoolAudience {
  id: string;
  created_by: string | null;
  is_system_default: boolean;
  persona_name: string;
  industry: string;
  job_title: string;
  pain_points: string[];
  success_metrics: string[];
  preferred_framework: 'StoryBrand' | 'AIDA' | 'JTBD' | 'STP' | '4Es' | 'BlueOcean';
  language_complexity: 'technical' | 'business' | 'casual';
}

export interface ContentPoolRegionalScript {
  id: string;
  product_id: string;
  region_code: string; // e.g., 'LATAM', 'LATAM_MX', 'MENA_SA'
  language_code: string; // BCP47 e.g., 'es-MX', 'ar-SA'
  script_type: 'english_base' | 'transcreated' | 'regional_variant';
  content: string; // Full narration script
  character_count: number;
  estimated_duration_seconds: number;
  framework_tags: string[]; // ['aida_attention', 'storybrand_guide', etc.]
  status: 'draft' | 'feedback' | 'approved' | 'active';
  created_at: string;
  updated_at: string;
  llm_provider: string;
  llm_model: string;
  routing_confidence_score: number; // 0.0-1.0
  routing_zone: string; // 'western', 'latam', 'mena', 'cjk', 'india', etc.
}

export interface ContentPoolTTSAudio {
  id: string;
  script_id: string;
  language_code: string;
  voice_id: string;
  voice_name: string;
  voice_gender: 'male' | 'female' | 'neutral';
  provider: string; // 'azure', 'google', 'eleven_labs', 'alibaba', etc.
  audio_url: string;
  duration_ms: number;
  generated_at: string;
  is_default_for_region: boolean;
}

export interface ContentPoolContext {
  // Primary data
  products: ContentPoolProduct[];
  brandAssets: ContentPoolBrandAsset | null;
  audiences: ContentPoolAudience[];
  
  // Production data
  regionalScripts: ContentPoolRegionalScript[];
  ttsAudio: ContentPoolTTSAudio[];
  
  // Convenience helpers
  selectedProductId: string | null;
  selectedRegionCode: string | null;
  selectedLanguageCode: string | null;
  
  // Lookup functions
  getProductById: (id: string) => ContentPoolProduct | undefined;
  getScriptsForProduct: (productId: string) => ContentPoolRegionalScript[];
  getScriptForRegion: (productId: string, regionCode: string) => ContentPoolRegionalScript | undefined;
  getTTSForScript: (scriptId: string) => ContentPoolTTSAudio[];
  getAudienceByFramework: (framework: string) => ContentPoolAudience[];
}

// ============================================================================
// FETCH LOGIC - Aggregates all tables into unified context
// ============================================================================

const fetchContentPool = async (userId: string): Promise<ContentPoolContext> => {
  const productsData: ContentPoolProduct[] = [];
  const audiencesData: ContentPoolAudience[] = [];
  const scriptsData: ContentPoolRegionalScript[] = [];
  const ttsData: ContentPoolTTSAudio[] = [];
  let brandData: ContentPoolBrandAsset | null = null;

  try {
    // Fetch all products (system defaults + user's)
    const { data: pd } = await (supabase as any)
      .from('marketing_products')
      .select('*')
      .or(`is_system_default.eq.true,created_by.eq.${userId}`);
    if (pd) productsData.push(...(pd as ContentPoolProduct[]));

    // Fetch brand assets (system + user's)
    const { data: bd } = await (supabase as any)
      .from('marketing_brand_assets')
      .select('*')
      .or(`is_system_default.eq.true,created_by.eq.${userId}`)
      .order('is_system_default', { ascending: false })
      .limit(1)
      .single();
    if (bd) brandData = bd as ContentPoolBrandAsset;

    // Fetch audiences
    const { data: ad } = await (supabase as any)
      .from('marketing_audiences')
      .select('*')
      .or(`is_system_default.eq.true,created_by.eq.${userId}`);
    if (ad) audiencesData.push(...(ad as ContentPoolAudience[]));

    // Fetch regional scripts
    const { data: sd } = await (supabase as any)
      .from('regional_narration_scripts')
      .select('*')
      .eq('status', 'active');
    if (sd) scriptsData.push(...(sd as ContentPoolRegionalScript[]));

    // Fetch TTS audio
    const { data: td } = await (supabase as any)
      .from('tts_audio_versions')
      .select('*');
    if (td) ttsData.push(...(td as ContentPoolTTSAudio[]));
  } catch (error) {
    console.warn('[useContentPool] Fetch error, using fallback:', error);
  }

  return {
    products: productsData,
    brandAssets: brandData,
    audiences: audiencesData,
    regionalScripts: scriptsData,
    ttsAudio: ttsData,
    selectedProductId: null,
    selectedRegionCode: null,
    selectedLanguageCode: null,
    
    // Helpers
    getProductById: (id: string) => productsData.find(p => p.id === id),
    getScriptsForProduct: (productId: string) => 
      scriptsData.filter(s => s.product_id === productId),
    getScriptForRegion: (productId: string, regionCode: string) => 
      scriptsData.find(s => s.product_id === productId && s.region_code === regionCode),
    getTTSForScript: (scriptId: string) =>
      ttsData.filter(t => t.script_id === scriptId),
    getAudienceByFramework: (framework: string) =>
      audiencesData.filter(a => a.preferred_framework === framework),
  };
};

// ============================================================================
// HOOK
// ============================================================================

export const useContentPool = () => {
  const [userId, setUserId] = useState<string | null>(null);
  const queryClient = useQueryClient();
  const queryKey = ['content_pool', userId];

  // Get user ID on mount
  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUserId(user?.id || null);
    });
  }, []);

  const query = useQuery({
    queryKey,
    queryFn: () => fetchContentPool(userId || ''),
    enabled: !!userId,
    staleTime: 10 * 60 * 1000, // 10 min cache
  });

  const pool = query.data;

  return {
    pool,
    isLoading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
    
    // Mutations for future use
    updateProductContext: (productId: string, regionCode: string, languageCode: string) => {
      if (!pool) return null;
      return {
        ...pool,
        selectedProductId: productId,
        selectedRegionCode: regionCode,
        selectedLanguageCode: languageCode,
        currentProduct: pool.getProductById(productId),
        currentScript: pool.getScriptForRegion(productId, regionCode),
        currentAudio: pool.getTTSForScript(
          pool.getScriptForRegion(productId, regionCode)?.id || ''
        ),
      };
    },
  };
};

export default useContentPool;
