/**
 * Dynamic Marketing Registry Service
 * 
 * Loads products, audiences, languages, and brand assets from database
 * instead of hardcoded constants. Enables white-label, enterprise,
 * and freelancer use cases.
 */

import { supabase } from '@/integrations/supabase/client';

// ============================================================================
// TYPES (Database-aligned)
// ============================================================================

export interface MarketingProduct {
  id: string;
  user_id: string | null;
  name: string;
  tagline: string | null;
  description: string | null;
  icon: string;
  category: string;
  features: string[];
  primary_color: string | null;
  secondary_color: string | null;
  is_system_default: boolean;
  is_active: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface MarketingAudience {
  id: string;
  user_id: string | null;
  label: string;
  description: string | null;
  industry: string | null;
  pain_points: string[];
  messaging_angles: string[];
  is_system_default: boolean;
  is_active: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface MarketingBrandAsset {
  id: string;
  product_id: string | null;
  user_id: string | null;
  asset_type: 'logo' | 'icon' | 'screenshot' | 'banner' | 'color_palette' | 'font';
  asset_url: string | null;
  asset_metadata: Record<string, any>;
  is_primary: boolean;
  created_at: string;
  updated_at: string;
}

export interface MarketingLanguage {
  id: string;
  user_id: string | null;
  language_code: string;
  language_name: string;
  region: string | null;
  is_rtl: boolean;
  tts_provider: string | null;
  tts_voice_id: string | null;
  is_enabled: boolean;
  is_system_default: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

// Legacy compatibility types
export interface LegacyProduct {
  id: string;
  name: string;
  tagline: string;
  category: string;
  features: { id: string; name: string; screens: string[] }[];
}

export interface LegacyAudience {
  id: string;
  label: string;
  painPoints: string[];
}

// ============================================================================
// FALLBACK DATA (Used when database is unavailable)
// ============================================================================

const FALLBACK_PRODUCTS: LegacyProduct[] = [
  { id: 'studio', name: 'Genie Suite', tagline: 'Mind to Media', category: 'HUB', features: [] },
  { id: 'spark', name: 'Genie Spark', tagline: 'Ignite Your Ideas', category: 'CREATE', features: [] },
  { id: 'mind', name: 'Genie Mind', tagline: 'AI That Understands', category: 'CREATE', features: [] },
  { id: 'vibe', name: 'Genie Vibe', tagline: 'Script to Screen', category: 'PRODUCE', features: [] },
  { id: 'hub', name: 'Genie Hub', tagline: 'Your Creative Command Center', category: 'MANAGE', features: [] },
  { id: 'deck', name: 'Genie Deck', tagline: 'Ideas to Impact', category: 'PRODUCE', features: [] },
  { id: 'cast', name: 'Genie Cast', tagline: 'Make It. Show It. Scale It.', category: 'PUBLISH', features: [] },
  { id: 'ask_genie', name: 'Ask Genie', tagline: 'Your Wish is My Command', category: 'SUPPORT', features: [] },
];

const FALLBACK_AUDIENCES: LegacyAudience[] = [
  { id: 'content_creators', label: 'Content Creators', painPoints: ['time-consuming editing'] },
  { id: 'marketers', label: 'Marketing Teams', painPoints: ['content velocity'] },
  { id: 'enterprises', label: 'Enterprise Teams', painPoints: ['compliance', 'brand governance'] },
];

// ============================================================================
// DYNAMIC MARKETING REGISTRY SERVICE
// ============================================================================

class DynamicMarketingRegistryService {
  private static instance: DynamicMarketingRegistryService;
  private productsCache: MarketingProduct[] | null = null;
  private audiencesCache: MarketingAudience[] | null = null;
  private languagesCache: MarketingLanguage[] | null = null;
  private brandAssetsCache: MarketingBrandAsset[] | null = null;
  private lastFetch: Date | null = null;
  private cacheTTL = 5 * 60 * 1000; // 5 minutes

  static getInstance(): DynamicMarketingRegistryService {
    if (!this.instance) {
      this.instance = new DynamicMarketingRegistryService();
    }
    return this.instance;
  }

  private isCacheValid(): boolean {
    if (!this.lastFetch) return false;
    return Date.now() - this.lastFetch.getTime() < this.cacheTTL;
  }

  private invalidateCache(): void {
    this.productsCache = null;
    this.audiencesCache = null;
    this.languagesCache = null;
    this.brandAssetsCache = null;
    this.lastFetch = null;
  }

  // ============================================================================
  // PRODUCTS
  // ============================================================================

  async getProducts(options?: { 
    includeInactive?: boolean; 
    systemOnly?: boolean;
    userOnly?: boolean;
  }): Promise<MarketingProduct[]> {
    if (this.productsCache && this.isCacheValid() && !options?.systemOnly && !options?.userOnly) {
      return this.productsCache;
    }

    try {
      let query = supabase
        .from('marketing_products')
        .select('*')
        .order('sort_order', { ascending: true });

      if (!options?.includeInactive) {
        query = query.eq('is_active', true);
      }
      if (options?.systemOnly) {
        query = query.eq('is_system_default', true);
      }

      const { data, error } = await query;

      if (error) throw error;

      const products = (data || []).map(p => ({
        ...p,
        features: Array.isArray(p.features) ? p.features : [],
      })) as MarketingProduct[];

      if (!options?.systemOnly && !options?.userOnly) {
        this.productsCache = products;
        this.lastFetch = new Date();
      }

      console.log(`[DynamicRegistry] Loaded ${products.length} products from database`);
      return products;
    } catch (error) {
      console.error('[DynamicRegistry] Failed to load products:', error);
      // Return cached data if available, otherwise fallback
      if (this.productsCache) return this.productsCache;
      return this.convertFallbackProducts();
    }
  }

  async getProductById(id: string): Promise<MarketingProduct | null> {
    const products = await this.getProducts();
    return products.find(p => p.id === id) || null;
  }

  async createProduct(product: Omit<MarketingProduct, 'id' | 'created_at' | 'updated_at'>): Promise<MarketingProduct> {
    const { data, error } = await supabase
      .from('marketing_products')
      .insert(product)
      .select()
      .single();

    if (error) throw error;
    this.invalidateCache();
    
    return {
      ...data,
      features: Array.isArray(data.features) ? data.features : [],
    } as MarketingProduct;
  }

  async updateProduct(id: string, updates: Partial<MarketingProduct>): Promise<MarketingProduct> {
    const { data, error } = await supabase
      .from('marketing_products')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    this.invalidateCache();
    
    return {
      ...data,
      features: Array.isArray(data.features) ? data.features : [],
    } as MarketingProduct;
  }

  async deleteProduct(id: string): Promise<void> {
    const { error } = await supabase
      .from('marketing_products')
      .delete()
      .eq('id', id);

    if (error) throw error;
    this.invalidateCache();
  }

  // ============================================================================
  // AUDIENCES
  // ============================================================================

  async getAudiences(options?: { 
    includeInactive?: boolean; 
    systemOnly?: boolean;
    industry?: string;
  }): Promise<MarketingAudience[]> {
    if (this.audiencesCache && this.isCacheValid() && !options?.systemOnly && !options?.industry) {
      return this.audiencesCache;
    }

    try {
      let query = supabase
        .from('marketing_audiences')
        .select('*')
        .order('sort_order', { ascending: true });

      if (!options?.includeInactive) {
        query = query.eq('is_active', true);
      }
      if (options?.systemOnly) {
        query = query.eq('is_system_default', true);
      }
      if (options?.industry) {
        query = query.eq('industry', options.industry);
      }

      const { data, error } = await query;

      if (error) throw error;

      const audiences = (data || []).map(a => ({
        ...a,
        pain_points: Array.isArray(a.pain_points) ? a.pain_points : [],
        messaging_angles: Array.isArray(a.messaging_angles) ? a.messaging_angles : [],
      })) as MarketingAudience[];

      if (!options?.systemOnly && !options?.industry) {
        this.audiencesCache = audiences;
        this.lastFetch = new Date();
      }

      console.log(`[DynamicRegistry] Loaded ${audiences.length} audiences from database`);
      return audiences;
    } catch (error) {
      console.error('[DynamicRegistry] Failed to load audiences:', error);
      if (this.audiencesCache) return this.audiencesCache;
      return this.convertFallbackAudiences();
    }
  }

  async getAudienceById(id: string): Promise<MarketingAudience | null> {
    const audiences = await this.getAudiences();
    return audiences.find(a => a.id === id) || null;
  }

  async createAudience(audience: Omit<MarketingAudience, 'id' | 'created_at' | 'updated_at'>): Promise<MarketingAudience> {
    const { data, error } = await supabase
      .from('marketing_audiences')
      .insert(audience)
      .select()
      .single();

    if (error) throw error;
    this.invalidateCache();
    
    return {
      ...data,
      pain_points: Array.isArray(data.pain_points) ? data.pain_points : [],
      messaging_angles: Array.isArray(data.messaging_angles) ? data.messaging_angles : [],
    } as MarketingAudience;
  }

  async updateAudience(id: string, updates: Partial<MarketingAudience>): Promise<MarketingAudience> {
    const { data, error } = await supabase
      .from('marketing_audiences')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    this.invalidateCache();
    
    return {
      ...data,
      pain_points: Array.isArray(data.pain_points) ? data.pain_points : [],
      messaging_angles: Array.isArray(data.messaging_angles) ? data.messaging_angles : [],
    } as MarketingAudience;
  }

  async deleteAudience(id: string): Promise<void> {
    const { error } = await supabase
      .from('marketing_audiences')
      .delete()
      .eq('id', id);

    if (error) throw error;
    this.invalidateCache();
  }

  // ============================================================================
  // LANGUAGES
  // ============================================================================

  async getLanguages(options?: { 
    enabledOnly?: boolean; 
    systemOnly?: boolean;
  }): Promise<MarketingLanguage[]> {
    if (this.languagesCache && this.isCacheValid() && !options?.systemOnly) {
      return this.languagesCache;
    }

    try {
      let query = supabase
        .from('marketing_languages')
        .select('*')
        .order('sort_order', { ascending: true });

      if (options?.enabledOnly !== false) {
        query = query.eq('is_enabled', true);
      }
      if (options?.systemOnly) {
        query = query.eq('is_system_default', true);
      }

      const { data, error } = await query;

      if (error) throw error;

      const languages = (data || []) as MarketingLanguage[];

      if (!options?.systemOnly) {
        this.languagesCache = languages;
        this.lastFetch = new Date();
      }

      console.log(`[DynamicRegistry] Loaded ${languages.length} languages from database`);
      return languages;
    } catch (error) {
      console.error('[DynamicRegistry] Failed to load languages:', error);
      if (this.languagesCache) return this.languagesCache;
      return [];
    }
  }

  async createLanguage(language: Omit<MarketingLanguage, 'id' | 'created_at' | 'updated_at'>): Promise<MarketingLanguage> {
    const { data, error } = await supabase
      .from('marketing_languages')
      .insert(language)
      .select()
      .single();

    if (error) throw error;
    this.invalidateCache();
    return data as MarketingLanguage;
  }

  async updateLanguage(id: string, updates: Partial<MarketingLanguage>): Promise<MarketingLanguage> {
    const { data, error } = await supabase
      .from('marketing_languages')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    this.invalidateCache();
    return data as MarketingLanguage;
  }

  // ============================================================================
  // BRAND ASSETS
  // ============================================================================

  async getBrandAssets(productId?: string): Promise<MarketingBrandAsset[]> {
    try {
      let query = supabase
        .from('marketing_brand_assets')
        .select('*')
        .order('created_at', { ascending: false });

      if (productId) {
        query = query.eq('product_id', productId);
      }

      const { data, error } = await query;

      if (error) throw error;

      return (data || []).map(a => ({
        ...a,
        asset_metadata: typeof a.asset_metadata === 'object' ? a.asset_metadata : {},
      })) as MarketingBrandAsset[];
    } catch (error) {
      console.error('[DynamicRegistry] Failed to load brand assets:', error);
      return [];
    }
  }

  async createBrandAsset(asset: Omit<MarketingBrandAsset, 'id' | 'created_at' | 'updated_at'>): Promise<MarketingBrandAsset> {
    const { data, error } = await supabase
      .from('marketing_brand_assets')
      .insert(asset)
      .select()
      .single();

    if (error) throw error;
    return data as MarketingBrandAsset;
  }

  async deleteBrandAsset(id: string): Promise<void> {
    const { error } = await supabase
      .from('marketing_brand_assets')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }

  // ============================================================================
  // LEGACY COMPATIBILITY HELPERS
  // ============================================================================

  private convertFallbackProducts(): MarketingProduct[] {
    return FALLBACK_PRODUCTS.map(p => ({
      id: p.id,
      user_id: null,
      name: p.name,
      tagline: p.tagline,
      description: null,
      icon: 'Package',
      category: p.category,
      features: [],
      primary_color: null,
      secondary_color: null,
      is_system_default: true,
      is_active: true,
      sort_order: 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }));
  }

  private convertFallbackAudiences(): MarketingAudience[] {
    return FALLBACK_AUDIENCES.map(a => ({
      id: a.id,
      user_id: null,
      label: a.label,
      description: null,
      industry: null,
      pain_points: a.painPoints,
      messaging_angles: [],
      is_system_default: true,
      is_active: true,
      sort_order: 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }));
  }

  /**
   * Convert to legacy format for backward compatibility
   */
  async getLegacyProducts(): Promise<Record<string, LegacyProduct>> {
    const products = await this.getProducts();
    const result: Record<string, LegacyProduct> = {};
    
    products.forEach(p => {
      // Create a slug-friendly ID for legacy compatibility
      const legacyId = p.name.toLowerCase().replace(/^genie\s+/, '').replace(/\s+/g, '_');
      result[legacyId] = {
        id: legacyId,
        name: p.name,
        tagline: p.tagline || '',
        category: p.category.toUpperCase(),
        features: [], // Would need separate features table for full compatibility
      };
    });
    
    return result;
  }

  /**
   * Convert to legacy audience format
   */
  async getLegacyAudiences(): Promise<LegacyAudience[]> {
    const audiences = await this.getAudiences();
    return audiences.map(a => ({
      id: a.id,
      label: a.label,
      painPoints: a.pain_points,
    }));
  }

  /**
   * Get product by name (for messaging service compatibility)
   */
  async getProductByName(name: string): Promise<MarketingProduct | null> {
    const products = await this.getProducts();
    return products.find(p => 
      p.name.toLowerCase() === name.toLowerCase() ||
      p.name.toLowerCase().includes(name.toLowerCase())
    ) || null;
  }

  /**
   * Refresh cache manually
   */
  refreshCache(): void {
    this.invalidateCache();
    console.log('[DynamicRegistry] Cache invalidated');
  }
}

// Export singleton instance
export const dynamicMarketingRegistryService = DynamicMarketingRegistryService.getInstance();

export default dynamicMarketingRegistryService;
