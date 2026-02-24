/**
 * useProductContext — Unified Product-First Context Hook
 * 
 * When a user selects a product (e.g., Spark, Mind, Vibe), this hook
 * auto-loads ALL related context in one place:
 * - Product metadata (from marketing_products)
 * - Product screenshots (from product_asset_inventory)
 * - Regional scripts tagged to this product (from regional_narration_scripts)
 * - TTS audio versions tagged to this product (from tts_audio_versions)
 * - Brand assets (from marketing_brand_assets)
 * 
 * This is the single source of truth that bridges CREATE, PRODUCE, and LANDING.
 */

import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

// ============================================================================
// TYPES
// ============================================================================

export interface ProductContextProduct {
  id: string;
  name: string;
  category: string | null;
  description: string | null;
  icon: string | null;
  is_system_default: boolean | null;
  // Phase 4: Location data for Google Places enrichment
  business_city: string | null;
  business_state: string | null;
  business_country: string | null;
  business_zipcode: string | null;
}

export interface GooglePlacesSnapshot {
  businessName: string;
  address: string | null;
  rating: number | null;
  totalReviews: number;
  placeId: string | null;
  businessTypes: string[];
  website: string | null;
  editorialSummary: string | null;
  competitorInsights: Array<{ name: string; snippet: string }>;
  fetchedAt: string;
}

export interface ProductContextAsset {
  id: string;
  screen_key: string;
  screen_name: string;
  public_url: string | null;
  storage_path: string | null;
  capture_method: string;
  is_outdated: boolean;
  captured_at: string;
}

export interface ProductContextScript {
  id: string;
  region_code: string;
  language_code: string;
  full_script: string | null;
  hook: string;
  solution: string;
  cta: string;
  status: string;
  version: number;
  tts_provider: string | null;
  product_id: string | null;
  created_at: string;
}

export interface ProductContextTTS {
  id: string;
  script_id: string;
  region_code: string;
  tts_provider: string;
  tts_voice_id: string | null;
  tts_voice_name: string | null;
  audio_url: string | null;
  audio_duration_seconds: number | null;
  version_number: number;
  product_id: string | null;
  created_at: string;
}

export interface ProductContextSummary {
  totalAssets: number;
  outdatedAssets: number;
  totalScripts: number;
  activeScripts: number;
  draftScripts: number;
  totalTTSVersions: number;
  regionsWithScripts: string[];
  regionsWithTTS: string[];
  coveragePercent: number;
}

export interface UseProductContextReturn {
  /** Selected product metadata */
  product: ProductContextProduct | null;
  /** All available products */
  allProducts: ProductContextProduct[];
  /** Product screenshots/assets */
  assets: ProductContextAsset[];
  /** Regional scripts tagged to this product */
  scripts: ProductContextScript[];
  /** TTS audio versions tagged to this product */
  ttsVersions: ProductContextTTS[];
  /** Computed summary stats */
  summary: ProductContextSummary;
  /** Phase 4: Google Places enrichment snapshot (fetched on product select) */
  googlePlaces: GooglePlacesSnapshot | null;
  /** Phase 4: Whether Google Places data is available for this product */
  hasGooglePlaces: boolean;
  /** Phase 4: Location string for display */
  locationDisplay: string | null;
  /** Loading state */
  isLoading: boolean;
  /** Error state */
  error: string | null;
  /** Whether a product is selected */
  hasProduct: boolean;
}

// ============================================================================
// QUERY KEYS
// ============================================================================

const PRODUCT_CONTEXT_KEYS = {
  products: ['product-context', 'products'] as const,
  assets: (productId: string) => ['product-context', 'assets', productId] as const,
  scripts: (productId: string) => ['product-context', 'scripts', productId] as const,
  tts: (productId: string) => ['product-context', 'tts', productId] as const,
};

// ============================================================================
// HOOK
// ============================================================================

export function useProductContext(productId: string | null): UseProductContextReturn {
  // 1. Fetch all products (always)
  const productsQuery = useQuery({
    queryKey: PRODUCT_CONTEXT_KEYS.products,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('marketing_products')
        .select('id, name, category, description, icon, is_system_default, business_city, business_state, business_country, business_zipcode')
        .eq('is_active', true)
        .order('sort_order');
      if (error) throw error;
      return (data || []) as ProductContextProduct[];
    },
    staleTime: 5 * 60 * 1000,
  });

  // 2. Fetch product assets (when product selected)
  const assetsQuery = useQuery({
    queryKey: PRODUCT_CONTEXT_KEYS.assets(productId || ''),
    queryFn: async () => {
      const { data, error } = await supabase
        .from('product_asset_inventory')
        .select('id, screen_key, screen_name, public_url, storage_path, capture_method, is_outdated, captured_at')
        .eq('product_id', productId!)
        .eq('is_outdated', false)
        .order('captured_at', { ascending: false });
      if (error) throw error;
      return (data || []) as ProductContextAsset[];
    },
    enabled: !!productId,
    staleTime: 30 * 1000,
  });

  // 3. Fetch regional scripts for this product (latest version only)
  const scriptsQuery = useQuery({
    queryKey: PRODUCT_CONTEXT_KEYS.scripts(productId || ''),
    queryFn: async () => {
      const { data, error } = await supabase
        .from('regional_narration_scripts')
        .select('id, region_code, language_code, full_script, hook, solution, cta, status, version, tts_provider, product_id, created_at')
        .eq('product_id', productId!)
        .order('version', { ascending: false });
      if (error) throw error;
      return (data || []) as ProductContextScript[];
    },
    enabled: !!productId,
    staleTime: 30 * 1000,
  });

  // 4. Fetch TTS versions for this product
  const ttsQuery = useQuery({
    queryKey: PRODUCT_CONTEXT_KEYS.tts(productId || ''),
    queryFn: async () => {
      const { data, error } = await supabase
        .from('tts_audio_versions')
        .select('id, script_id, region_code, tts_provider, tts_voice_id, tts_voice_name, audio_url, audio_duration_seconds, version_number, product_id, created_at')
        .eq('product_id', productId!)
        .order('version_number', { ascending: false });
      if (error) throw error;
      return (data || []) as ProductContextTTS[];
    },
    enabled: !!productId,
    staleTime: 30 * 1000,
  });

  // Derive current product
  const product = useMemo(() => {
    if (!productId || !productsQuery.data) return null;
    return productsQuery.data.find(p => p.id === productId) || null;
  }, [productId, productsQuery.data]);

  // Phase 4: Google Places enrichment (lazy — fetches when product has location)
  const hasLocation = !!(product?.business_city || product?.business_state);
  const locationDisplay = useMemo(() => {
    if (!product) return null;
    const parts = [product.business_city, product.business_state, product.business_country].filter(Boolean);
    return parts.length > 0 ? parts.join(', ') : null;
  }, [product]);

  const googlePlacesQuery = useQuery({
    queryKey: ['product-context', 'google-places', productId, locationDisplay],
    queryFn: async (): Promise<GooglePlacesSnapshot | null> => {
      if (!product || !locationDisplay) return null;
      try {
        const { data, error } = await supabase.functions.invoke('local-business-enrichment', {
          body: {
            businessName: product.name,
            city: product.business_city || undefined,
            state: product.business_state || undefined,
            country: product.business_country || undefined,
            zipcode: product.business_zipcode || undefined,
            vertical: product.category || undefined,
          },
        });
        if (error || !data?.success) return null;
        const place = data.data;
        return {
          businessName: place?.place?.name || product.name,
          address: place?.place?.formatted_address || null,
          rating: place?.place?.rating || null,
          totalReviews: place?.details?.reviews?.length || 0,
          placeId: place?.place?.place_id || null,
          businessTypes: place?.place?.types || [],
          website: place?.details?.website || null,
          editorialSummary: place?.details?.editorialSummary || null,
          competitorInsights: (place?.competitors || []).map((c: any) => ({
            name: c.title || c.name || '',
            snippet: c.snippet || c.markdown?.substring(0, 200) || '',
          })),
          fetchedAt: new Date().toISOString(),
        };
      } catch {
        return null;
      }
    },
    enabled: !!productId && hasLocation,
    staleTime: 15 * 60 * 1000, // Cache for 15 minutes
  });

  // Compute summary
  const summary = useMemo((): ProductContextSummary => {
    const assets = assetsQuery.data || [];
    const scripts = scriptsQuery.data || [];
    const tts = ttsQuery.data || [];

    // Dedupe scripts to latest version per region
    const latestByRegion = new Map<string, ProductContextScript>();
    for (const s of scripts) {
      const existing = latestByRegion.get(s.region_code);
      if (!existing || s.version > existing.version) {
        latestByRegion.set(s.region_code, s);
      }
    }
    const dedupedScripts = Array.from(latestByRegion.values());

    const activeScripts = dedupedScripts.filter(s => s.status === 'active').length;
    const draftScripts = dedupedScripts.filter(s => s.status === 'draft').length;
    const regionsWithScripts = [...new Set(dedupedScripts.map(s => s.region_code))];
    const regionsWithTTS = [...new Set(tts.map(t => t.region_code))];

    // Coverage: regions with active script + TTS audio
    const regionsFullyCovered = regionsWithScripts.filter(r => regionsWithTTS.includes(r));
    const coveragePercent = regionsWithScripts.length > 0
      ? Math.round((regionsFullyCovered.length / regionsWithScripts.length) * 100)
      : 0;

    return {
      totalAssets: assets.length,
      outdatedAssets: assets.filter(a => a.is_outdated).length,
      totalScripts: dedupedScripts.length,
      activeScripts,
      draftScripts,
      totalTTSVersions: tts.length,
      regionsWithScripts,
      regionsWithTTS,
      coveragePercent,
    };
  }, [assetsQuery.data, scriptsQuery.data, ttsQuery.data]);

  const isLoading = productsQuery.isLoading || 
    (!!productId && (assetsQuery.isLoading || scriptsQuery.isLoading || ttsQuery.isLoading));

  const error = productsQuery.error?.message || 
    assetsQuery.error?.message || 
    scriptsQuery.error?.message || 
    ttsQuery.error?.message || null;

  return {
    product,
    allProducts: productsQuery.data || [],
    assets: assetsQuery.data || [],
    scripts: scriptsQuery.data || [],
    ttsVersions: ttsQuery.data || [],
    summary,
    googlePlaces: googlePlacesQuery.data || null,
    hasGooglePlaces: !!googlePlacesQuery.data,
    locationDisplay,
    isLoading,
    error,
    hasProduct: !!productId && !!product,
  };
}
