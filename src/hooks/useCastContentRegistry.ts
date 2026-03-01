/**
 * useCastContentRegistry — Dynamic, DB-driven content categories, formats & sub-formats
 * 
 * Fetches categories, formats, and sub-formats from cast_content_* tables.
 * Supports adding new entries on-the-fly (no code changes needed).
 * Connected to universal enrichment via enrichment_config on formats.
 */

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { SEED_CATEGORIES, SEED_FORMATS, SEED_SUB_FORMATS, mergeWithSeeds, generateSeedLinks } from '@/config/cast-content-seeds';
import type { SeedSubFormat } from '@/config/cast-content-seeds';

export interface ContentCategory {
  id: string;
  name: string;
  label: string;
  icon: string;
  color: string;
  description: string | null;
  sort_order: number;
  is_active: boolean;
  metadata: Record<string, unknown>;
}

export interface ContentFormat {
  id: string;
  name: string;
  label: string;
  icon: string;
  color: string;
  description: string | null;
  requires_messaging: boolean;
  requires_tts: boolean;
  requires_video: boolean;
  enrichment_config: Record<string, unknown>;
  editor_placeholder: string | null;
  checklist: string[];
  sort_order: number;
  is_active: boolean;
}

export interface ContentSubFormat {
  id: string;
  format_id: string;
  name: string;
  label: string;
  icon: string;
  color: string;
  description: string | null;
  blueprint_template_id: string | null;
  enrichment_overrides: Record<string, unknown>;
  sort_order: number;
  is_active: boolean;
  category_id?: string | null; // When set, sub-format is category-specific; null = universal
}

export interface CategoryFormatLink {
  id: string;
  category_id: string;
  format_id: string;
  enrichment_overrides: Record<string, unknown>;
  blueprint_template_id: string | null;
  is_active: boolean;
}

export interface VisualStyle {
  id: string;
  name: string;
  label: string;
  category: string;
  icon: string;
  color: string | null;
  description: string | null;
  // Base table columns
  allows_photorealistic: boolean;
  requires_face_consent: boolean;
  sample_prompt: string | null;
  style_config: Record<string, unknown>;
  default_provider: string | null;
  provider_routing: Record<string, unknown>;
  seasonal_tags: string[] | null;
  // Phase 6B columns
  ip_safe: boolean | null;
  sort_order: number;
  is_active: boolean;
  parent_style_id: string | null;
  sub_sort_order: number | null;
  character_type: string | null;
  style_variant: string | null;
  estimated_size_mb: number | null;
  complexity_score: number | null;
  render_time_estimate: string | null;
  preview_image_url: string | null;
  character_frame_percent: number | null;
  is_user_created: boolean | null;
  created_by: string | null;
  is_saved_globally: boolean | null;
  custom_prompt: string | null;
  uploaded_reference_url: string | null;
  uploaded_reference_type: string | null;
}

export interface OutputPreset {
  id: string;
  name: string;
  label: string;
  category: string;
  width: number;
  height: number;
  aspect_ratio: string;
  description: string | null;
  icon: string;
  is_default: boolean;
  sort_order: number;
  is_active: boolean;
  // B-011: Encoding config
  codec: string;
  fps: number;
  bitrate: string;
  audio_codec: string;
  audio_bitrate: string;
  max_file_size_mb: number;
  encoding_profile: string;
}

export interface StyleCharacter {
  id: string;
  style_id: string;
  name: string;
  label: string;
  character_type: string;
  icon: string;
  description: string | null;
  thumbnail_url: string | null;
  costume_variants: { holiday_id: string; costume_url: string; label: string }[];
  region_code: string;
  gender: string;
  age_group: string;
  ethnicity_tag: string;
  sort_order: number;
  is_active: boolean;
}

export interface StyleCapabilityRule {
  id: string;
  style_id: string;
  capability_id: string;
  auto_select: boolean;
  is_recommended: boolean;
  is_locked: boolean;
  reason: string | null;
}

export interface ProductionCapability {
  id: string;
  name: string;
  label: string;
  category: string;
  icon: string;
  color: string;
  description: string | null;
  default_provider: string | null;
  provider_routing: Record<string, unknown>;
  requires_audio: boolean;
  requires_visual: boolean;
  requires_avatar: boolean;
  safety_level: string;
  requires_consent: boolean;
  sort_order: number;
  is_active: boolean;
}

export interface CastLanguage {
  id: string;
  code: string;
  name: string;
  native_name: string;
  flag: string;
  region_code: string;
  subregion_code: string | null;
  script_direction: 'ltr' | 'rtl';
  tts_provider_primary: string | null;
  tts_provider_fallback: string | null;
  tts_voice_id_male: string | null;
  tts_voice_id_female: string | null;
  deepl_supported: boolean;
  google_translate_supported: boolean;
  sort_order: number;
  is_active: boolean;
}

export interface CapabilityProviderRoute {
  id: string;
  capability_id: string;
  provider_name: string;
  provider_type: 'primary' | 'fallback' | 'regional';
  edge_function: string;
  region_codes: string[];
  priority: number;
  cost_per_unit: number;
  max_concurrent: number;
  is_active: boolean;
  config: Record<string, unknown>;
}

export interface AssetSourceType {
  id: string;
  name: string;
  label: string;
  icon: string;
  description: string | null;
  sort_order: number;
  is_active: boolean;
}

export interface FormatCapabilityLink {
  id: string;
  format_id: string;
  capability_id: string;
  is_active: boolean;
}

export function useCastContentRegistry() {
  const [categories, setCategories] = useState<ContentCategory[]>([]);
  const [formats, setFormats] = useState<ContentFormat[]>([]);
  const [subFormats, setSubFormats] = useState<ContentSubFormat[]>([]);
  const [categoryFormats, setCategoryFormats] = useState<CategoryFormatLink[]>([]);
  const [visualStyles, setVisualStyles] = useState<VisualStyle[]>([]);
  const [productionCapabilities, setProductionCapabilities] = useState<ProductionCapability[]>([]);
  const [assetSourceTypes, setAssetSourceTypes] = useState<AssetSourceType[]>([]);
  const [formatCapabilities, setFormatCapabilities] = useState<FormatCapabilityLink[]>([]);
  const [styleCharacters, setStyleCharacters] = useState<StyleCharacter[]>([]);
  const [styleCapabilityRules, setStyleCapabilityRules] = useState<StyleCapabilityRule[]>([]);
  const [outputPresets, setOutputPresets] = useState<OutputPreset[]>([]);
  const [languages, setLanguages] = useState<CastLanguage[]>([]);
  const [capabilityProviderRoutes, setCapabilityProviderRoutes] = useState<CapabilityProviderRoute[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchAll = useCallback(async () => {
    setIsLoading(true);
    try {
      const [catRes, fmtRes, sfRes, cfRes, vsRes, pcRes, asRes, fcRes, scRes, scrRes, opRes, langRes, cprRes] = await Promise.all([
        supabase.from('cast_content_categories').select('*').eq('is_active', true).order('sort_order'),
        supabase.from('cast_content_formats').select('*').eq('is_active', true).order('sort_order'),
        supabase.from('cast_content_sub_formats').select('*').eq('is_active', true).order('sort_order'),
        supabase.from('cast_category_formats').select('*').eq('is_active', true),
        supabase.from('cast_visual_styles').select('*').eq('is_active', true).order('sort_order'),
        supabase.from('cast_production_capabilities').select('*').eq('is_active', true).order('sort_order'),
        supabase.from('cast_asset_source_types').select('*').eq('is_active', true).order('sort_order'),
        supabase.from('cast_format_capabilities').select('*').eq('is_active', true),
        supabase.from('cast_style_characters').select('*').eq('is_active', true).order('sort_order'),
        supabase.from('cast_style_capability_rules').select('*'),
        supabase.from('cast_output_presets').select('*').eq('is_active', true).order('sort_order'),
        (supabase.from as any)('cast_languages').select('*').eq('is_active', true).order('sort_order'),
        (supabase.from as any)('cast_production_capability_provider_map').select('*').eq('is_active', true).order('priority'),
      ]);

      if (catRes.error) throw catRes.error;
      if (fmtRes.error) throw fmtRes.error;
      if (sfRes.error) throw sfRes.error;
      if (cfRes.error) throw cfRes.error;

      // Merge DB data with code-defined seeds — DB entries with same name take precedence
      const mergedCats = mergeWithSeeds((catRes.data || []) as unknown as ContentCategory[], SEED_CATEGORIES);
      const mergedFmts = mergeWithSeeds((fmtRes.data || []) as unknown as ContentFormat[], SEED_FORMATS);
      setCategories(mergedCats);
      setFormats(mergedFmts);

      // Merge sub-format seeds with DB data (resolve format_name → format_id)
      const dbSubFormats = (sfRes.data || []) as unknown as ContentSubFormat[];
      const dbSubNames = new Set(dbSubFormats.map(sf => sf.name));
      const seedSubFormats: ContentSubFormat[] = SEED_SUB_FORMATS
        .filter(ss => !dbSubNames.has(ss.name))
        .map((ss, i) => {
          const parentFormat = mergedFmts.find(f => f.name === ss.format_name);
          return {
            id: `seed-sf-${ss.name}`,
            format_id: parentFormat?.id || '',
            name: ss.name,
            label: ss.label,
            icon: ss.icon || 'FileText',
            color: ss.color || 'text-primary',
            description: ss.description || null,
            blueprint_template_id: null,
            enrichment_overrides: {},
            sort_order: 900 + i,
            is_active: true,
            category_id: null, // Universal — available to all categories
          };
        })
        .filter(sf => sf.format_id); // Drop if parent format not found
      setSubFormats([...dbSubFormats, ...seedSubFormats]);

      // Generate category-format links using actual merged IDs (solves seed-ID vs DB-UUID mismatch)
      const dbLinks = (cfRes.data || []) as unknown as CategoryFormatLink[];
      const dynamicSeedLinks = generateSeedLinks(mergedCats, mergedFmts);
      // Deduplicate: DB links take precedence over seed links for the same cat+fmt pair
      const dbLinkKeys = new Set(dbLinks.map(l => `${l.category_id}::${l.format_id}`));
      const uniqueSeedLinks = dynamicSeedLinks.filter(l => !dbLinkKeys.has(`${l.category_id}::${l.format_id}`));
      setCategoryFormats([...dbLinks, ...uniqueSeedLinks]);
      setVisualStyles((vsRes.data || []) as unknown as VisualStyle[]);
      setProductionCapabilities((pcRes.data || []) as unknown as ProductionCapability[]);
      setAssetSourceTypes((asRes.data || []) as unknown as AssetSourceType[]);
      setFormatCapabilities((fcRes.data || []) as unknown as FormatCapabilityLink[]);
      setStyleCharacters((scRes.data || []) as unknown as StyleCharacter[]);
      setStyleCapabilityRules((scrRes.data || []) as unknown as StyleCapabilityRule[]);
      setOutputPresets((opRes.data || []) as unknown as OutputPreset[]);
      setLanguages((langRes.data || []) as unknown as CastLanguage[]);
      setCapabilityProviderRoutes((cprRes.data || []) as unknown as CapabilityProviderRoute[]);
    } catch (err: any) {
      console.error('[useCastContentRegistry] Failed to fetch:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  /** Get formats available for a given category. If no links exist, all formats are available. */
  const getFormatsForCategory = useCallback((categoryId: string): ContentFormat[] => {
    const links = categoryFormats.filter(cf => cf.category_id === categoryId);
    if (links.length === 0) return formats; // All formats available
    const linkedFormatIds = new Set(links.map(l => l.format_id));
    return formats.filter(f => linkedFormatIds.has(f.id));
  }, [formats, categoryFormats]);

  /** Get sub-formats for a given format, optionally filtered by category.
   *  When categoryId is provided, returns category-specific + universal (null category_id) sub-formats. */
  const getSubFormatsForFormat = useCallback((formatId: string, categoryId?: string): ContentSubFormat[] => {
    const formatSubs = subFormats.filter(sf => sf.format_id === formatId);
    if (!categoryId) return formatSubs;
    // Show: category-specific sub-formats + universal ones (null category_id)
    return formatSubs.filter(sf => !sf.category_id || sf.category_id === categoryId);
  }, [subFormats]);

  /** Check if a format requires a separate messaging/positioning step */
  const requiresMessaging = useCallback((formatId: string, categoryId?: string): boolean => {
    if (categoryId) {
      const link = categoryFormats.find(cf => cf.category_id === categoryId && cf.format_id === formatId);
      if (link?.enrichment_overrides && typeof (link.enrichment_overrides as any).requires_messaging === 'boolean') {
        return (link.enrichment_overrides as any).requires_messaging;
      }
    }
    const format = formats.find(f => f.id === formatId);
    return format?.requires_messaging ?? false;
  }, [formats, categoryFormats]);

  /** Add a new category dynamically */
  const addCategory = useCallback(async (data: { name: string; label: string; icon?: string; color?: string; description?: string }) => {
    try {
      const { data: newCat, error } = await supabase
        .from('cast_content_categories')
        .insert({
          name: data.name.toLowerCase().replace(/\s+/g, '_'),
          label: data.label,
          icon: data.icon || 'Folder',
          color: data.color || 'text-primary',
          description: data.description || null,
          sort_order: categories.length + 1,
        })
        .select()
        .single();

      if (error) throw error;

      // Auto-create category-format links for all core formats
      const coreFormatNames = new Set([
        'podcast', 'webcast', 'video', 'presentation', 'script', 'tts', 'voice', 'ugc',
        'training', 'infographic', 'live_streaming',
      ]);
      const coreFormats = formats.filter(f => coreFormatNames.has(f.name));
      if (coreFormats.length > 0 && newCat) {
        const links = coreFormats.map(f => ({
          category_id: (newCat as any).id,
          format_id: f.id,
          enrichment_overrides: {},
          is_active: true,
        }));
        await supabase.from('cast_category_formats').insert(links).throwOnError();
      }

      toast.success(`Category "${data.label}" added`);
      await fetchAll();
      return newCat;
    } catch (err: any) {
      console.error('[useCastContentRegistry] Failed to add category:', err);
      toast.error('Failed to add category');
      return null;
    }
  }, [categories.length, formats, fetchAll]);

  /** Add a new format dynamically */
  const addFormat = useCallback(async (data: {
    name: string;
    label: string;
    icon?: string;
    color?: string;
    description?: string;
    requires_messaging?: boolean;
    requires_tts?: boolean;
    requires_video?: boolean;
  }) => {
    try {
      const { data: newFmt, error } = await supabase
        .from('cast_content_formats')
        .insert({
          name: data.name.toLowerCase().replace(/\s+/g, '_'),
          label: data.label,
          icon: data.icon || 'FileText',
          color: data.color || 'text-primary',
          description: data.description || null,
          requires_messaging: data.requires_messaging ?? false,
          requires_tts: data.requires_tts ?? false,
          requires_video: data.requires_video ?? false,
          sort_order: formats.length + 1,
        })
        .select()
        .single();

      if (error) throw error;
      toast.success(`Format "${data.label}" added`);
      await fetchAll();
      return newFmt;
    } catch (err: any) {
      console.error('[useCastContentRegistry] Failed to add format:', err);
      toast.error('Failed to add format');
      return null;
    }
  }, [formats.length, fetchAll]);

  /** Add a new sub-format dynamically */
  const addSubFormat = useCallback(async (data: {
    format_id: string;
    name: string;
    label: string;
    icon?: string;
    color?: string;
    description?: string;
  }) => {
    try {
      const formatSubFormats = subFormats.filter(sf => sf.format_id === data.format_id);
      const { data: newSf, error } = await supabase
        .from('cast_content_sub_formats')
        .insert({
          format_id: data.format_id,
          name: data.name.toLowerCase().replace(/\s+/g, '_'),
          label: data.label,
          icon: data.icon || 'FileText',
          color: data.color || 'text-primary',
          description: data.description || null,
          sort_order: formatSubFormats.length + 1,
        })
        .select()
        .single();

      if (error) throw error;
      toast.success(`Sub-format "${data.label}" added`);
      await fetchAll();
      return newSf;
    } catch (err: any) {
      console.error('[useCastContentRegistry] Failed to add sub-format:', err);
      toast.error('Failed to add sub-format');
      return null;
    }
  }, [subFormats, fetchAll]);

  /** Get capabilities available for a given format */
  const getCapabilitiesForFormat = useCallback((formatId: string): ProductionCapability[] => {
    const links = formatCapabilities.filter(fc => fc.format_id === formatId);
    if (links.length === 0) return productionCapabilities; // All capabilities available
    const linkedCapIds = new Set(links.map(l => l.capability_id));
    return productionCapabilities.filter(pc => linkedCapIds.has(pc.id));
  }, [productionCapabilities, formatCapabilities]);

  /** Get characters available for a given style (including parent), optionally filtered by region */
  const getCharactersForStyle = useCallback((styleId: string, regionCode?: string): StyleCharacter[] => {
    const style = visualStyles.find(s => s.id === styleId);
    if (!style) return [];
    // Get characters for this style AND parent style
    const ids = new Set([styleId]);
    if (style.parent_style_id) ids.add(style.parent_style_id);
    let chars = styleCharacters.filter(sc => ids.has(sc.style_id));
    // Filter by region if specified
    if (regionCode) {
      chars = chars.filter(sc => sc.region_code === 'global' || sc.region_code === regionCode);
    }
    return chars.sort((a, b) => a.sort_order - b.sort_order);
  }, [styleCharacters, visualStyles]);

  /** Get languages for a given region code */
  const getLanguagesForRegion = useCallback((regionCode: string): CastLanguage[] => {
    return languages.filter(l => l.region_code === regionCode);
  }, [languages]);

  /** Get all languages grouped by region */
  const getLanguagesByRegion = useCallback((): Record<string, CastLanguage[]> => {
    return languages.reduce((acc, l) => {
      if (!acc[l.region_code]) acc[l.region_code] = [];
      acc[l.region_code].push(l);
      return acc;
    }, {} as Record<string, CastLanguage[]>);
  }, [languages]);

  /** Get the primary provider for a capability, optionally region-specific */
  const getProviderForCapability = useCallback((capabilityId: string, regionCode?: string): CapabilityProviderRoute | null => {
    let routes = capabilityProviderRoutes.filter(r => r.capability_id === capabilityId);
    // Prefer regional match
    if (regionCode) {
      const regional = routes.find(r => r.provider_type === 'regional' && r.region_codes.includes(regionCode));
      if (regional) return regional;
    }
    // Fallback to primary
    return routes.find(r => r.provider_type === 'primary') || routes[0] || null;
  }, [capabilityProviderRoutes]);

  /** Get auto-select capability rules for a given style */
  const getCapabilityRulesForStyle = useCallback((styleId: string): StyleCapabilityRule[] => {
    const style = visualStyles.find(s => s.id === styleId);
    if (!style) return [];
    const ids = new Set([styleId]);
    if (style.parent_style_id) ids.add(style.parent_style_id);
    return styleCapabilityRules.filter(r => ids.has(r.style_id));
  }, [styleCapabilityRules, visualStyles]);

  /** Calculate estimated scenes from target duration and style complexity */
  const estimateScenes = useCallback((targetDurationSeconds: number, styleId: string | null): { scenes: number; perSceneDuration: number; totalSizeMb: number; renderTime: string } => {
    const style = styleId ? visualStyles.find(s => s.id === styleId) : null;
    const complexity = style?.complexity_score || 5;
    // Higher complexity = longer per-scene duration (5-15s range)
    const perSceneDuration = Math.round(5 + (complexity / 10) * 10);
    const scenes = Math.max(1, Math.round(targetDurationSeconds / perSceneDuration));
    const baseSizeMb = style?.estimated_size_mb || 80;
    const totalSizeMb = Math.round(baseSizeMb * (scenes / 5)); // base is for ~5 scenes
    const renderTime = style?.render_time_estimate || 'medium';
    return { scenes, perSceneDuration, totalSizeMb, renderTime };
  }, [visualStyles]);

  return {
    categories,
    formats,
    subFormats,
    categoryFormats,
    visualStyles,
    productionCapabilities,
    assetSourceTypes,
    formatCapabilities,
    styleCharacters,
    styleCapabilityRules,
    outputPresets,
    languages,
    capabilityProviderRoutes,
    isLoading,
    refresh: fetchAll,
    getFormatsForCategory,
    getSubFormatsForFormat,
    getCapabilitiesForFormat,
    getCharactersForStyle,
    getCapabilityRulesForStyle,
    getLanguagesForRegion,
    getLanguagesByRegion,
    getProviderForCapability,
    estimateScenes,
    requiresMessaging,
    addCategory,
    addFormat,
    addSubFormat,
  };
}
