/**
 * useContentPool - Unified Content Source for CREATE/PRODUCE/PUBLISH
 * 
 * Single hook that aggregates:
 * 1. Product metadata (8 Genie products for internal, or subscriber's products)
 * 2. Brand assets (logos per product)
 * 3. Audiences (personas with messaging angles)
 * 4. Regional scripts (transcreated per language + region)
 * 5. TTS audio versions (pre-generated, cached per voice)
 * 
 * Serves both:
 * - Internal Mode: Genie Suite marketing (is_system_default = true)
 * - External Mode: Subscriber's products via RLS
 * 
 * Used by: CREATE wizard, PRODUCE pipelines, Asset Lab derivatives, PUBLISH scheduling
 */

import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

// ============================================================================
// TYPES - Aligned to actual DB schema
// ============================================================================

export interface ContentPoolProduct {
  id: string;
  name: string;
  tagline: string;
  description: string;
  user_id: string | null;
  is_system_default: boolean;
  is_active: boolean;
  category: string;
  icon: string;
  features: string[];
  primary_color: string;
  secondary_color: string;
  sort_order: number;
}

export interface ContentPoolBrandAsset {
  id: string;
  product_id: string;
  user_id: string | null;
  asset_type: string;
  asset_url: string;
  asset_metadata: Record<string, unknown>;
  is_primary: boolean;
}

export interface ContentPoolAudience {
  id: string;
  user_id: string | null;
  is_system_default: boolean;
  is_active: boolean;
  label: string;
  description: string;
  industry: string;
  pain_points: string[];
  messaging_angles: string[];
  sort_order: number;
}

export interface ContentPoolRegionalScript {
  id: string;
  product_id: string;
  region_code: string;
  language_code: string;
  script_type: 'english_base' | 'transcreated' | 'regional_variant';
  content: string;
  character_count: number;
  estimated_duration_seconds: number;
  framework_tags: string[];
  status: 'draft' | 'feedback' | 'approved' | 'active';
  created_at: string;
  updated_at: string;
  llm_provider: string;
  llm_model: string;
  routing_confidence_score: number;
  routing_zone: string;
}

export interface ContentPoolTTSAudio {
  id: string;
  script_id: string;
  language_code: string;
  voice_id: string;
  voice_name: string;
  voice_gender: 'male' | 'female' | 'neutral';
  provider: string;
  audio_url: string;
  duration_ms: number;
  generated_at: string;
  is_default_for_region: boolean;
}

export interface ContentPoolContext {
  products: ContentPoolProduct[];
  brandAssets: ContentPoolBrandAsset[];
  audiences: ContentPoolAudience[];
  regionalScripts: ContentPoolRegionalScript[];
  ttsAudio: ContentPoolTTSAudio[];
  
  selectedProductId: string | null;
  selectedRegionCode: string | null;
  selectedLanguageCode: string | null;
  
  getProductById: (id: string) => ContentPoolProduct | undefined;
  getScriptsForProduct: (productId: string) => ContentPoolRegionalScript[];
  getScriptForRegion: (productId: string, regionCode: string) => ContentPoolRegionalScript | undefined;
  getTTSForScript: (scriptId: string) => ContentPoolTTSAudio[];
  getAudienceByFramework: (framework: string) => ContentPoolAudience[];
  getBrandAssetsForProduct: (productId: string) => ContentPoolBrandAsset[];
}

// ============================================================================
// FETCH LOGIC - Aligned to actual table schemas
// ============================================================================

const fetchContentPool = async (userId: string): Promise<ContentPoolContext> => {
  const productsData: ContentPoolProduct[] = [];
  const brandAssetsData: ContentPoolBrandAsset[] = [];
  const audiencesData: ContentPoolAudience[] = [];
  const scriptsData: ContentPoolRegionalScript[] = [];
  const ttsData: ContentPoolTTSAudio[] = [];

  try {
    // Fetch products (system defaults + user's) — use correct column names
    const { data: pd, error: pdError } = await supabase
      .from('marketing_products')
      .select('*')
      .eq('is_active', true)
      .or(`is_system_default.eq.true,user_id.eq.${userId}`)
      .order('sort_order', { ascending: true });
    if (pdError) console.error('[useContentPool] Products fetch error:', pdError);
    if (pd) {
      productsData.push(...(pd as unknown as ContentPoolProduct[]));
      console.log('[useContentPool] Loaded', pd.length, 'products');
    }

    // Fetch brand assets for those products
    if (productsData.length > 0) {
      const productIds = productsData.map(p => p.id);
      const { data: bd } = await supabase
        .from('marketing_brand_assets')
        .select('*')
        .in('product_id', productIds);
      if (bd) brandAssetsData.push(...(bd as unknown as ContentPoolBrandAsset[]));
    }

    // Fetch audiences (system defaults + user's)
    const { data: ad } = await supabase
      .from('marketing_audiences')
      .select('*')
      .eq('is_active', true)
      .or(`is_system_default.eq.true,user_id.eq.${userId}`)
      .order('sort_order', { ascending: true });
    if (ad) audiencesData.push(...(ad as unknown as ContentPoolAudience[]));

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
    console.error('[useContentPool] Fetch error, using fallback:', error);
  }

  return {
    products: productsData,
    brandAssets: brandAssetsData,
    audiences: audiencesData,
    regionalScripts: scriptsData,
    ttsAudio: ttsData,
    selectedProductId: null,
    selectedRegionCode: null,
    selectedLanguageCode: null,
    
    getProductById: (id: string) => productsData.find(p => p.id === id),
    getScriptsForProduct: (productId: string) => 
      scriptsData.filter(s => s.product_id === productId),
    getScriptForRegion: (productId: string, regionCode: string) => 
      scriptsData.find(s => s.product_id === productId && s.region_code === regionCode),
    getTTSForScript: (scriptId: string) =>
      ttsData.filter(t => t.script_id === scriptId),
    getAudienceByFramework: (framework: string) =>
      audiencesData.filter(a => a.messaging_angles?.includes(framework)),
    getBrandAssetsForProduct: (productId: string) =>
      brandAssetsData.filter(b => b.product_id === productId),
  };
};

// ============================================================================
// HOOK
// ============================================================================

export const useContentPool = () => {
  const [userId, setUserId] = useState<string | null>(null);
  const queryKey = ['content_pool', userId];

  useEffect(() => {
    // Get initial user
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user?.id) {
        setUserId(user.id);
        console.log('[useContentPool] User resolved:', user.id);
      }
    });
    
    // Also listen for auth state changes (covers delayed auth)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      const uid = session?.user?.id || null;
      setUserId(uid);
      if (uid) console.log('[useContentPool] Auth state changed, user:', uid);
    });
    
    return () => subscription.unsubscribe();
  }, []);

  const query = useQuery({
    queryKey,
    queryFn: () => fetchContentPool(userId || ''),
    enabled: !!userId,
    staleTime: 10 * 60 * 1000,
  });

  const pool = query.data;

  return {
    pool,
    isLoading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
    
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
