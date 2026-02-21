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
  ip_safe: boolean;
  sort_order: number;
  is_active: boolean;
  parent_style_id: string | null;
  sub_sort_order: number;
  character_type: string | null;
  style_variant: string | null;
  estimated_size_mb: number;
  complexity_score: number;
  render_time_estimate: string;
  preview_image_url: string | null;
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
  icon: string;
  description: string | null;
  sort_order: number;
  is_active: boolean;
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
  const [isLoading, setIsLoading] = useState(true);

  const fetchAll = useCallback(async () => {
    setIsLoading(true);
    try {
      const [catRes, fmtRes, sfRes, cfRes, vsRes, pcRes, asRes, fcRes, scRes, scrRes, opRes] = await Promise.all([
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
        supabase.from('cast_output_presets' as any).select('*').eq('is_active', true).order('sort_order'),
      ]);

      if (catRes.error) throw catRes.error;
      if (fmtRes.error) throw fmtRes.error;
      if (sfRes.error) throw sfRes.error;
      if (cfRes.error) throw cfRes.error;

      setCategories((catRes.data || []) as unknown as ContentCategory[]);
      setFormats((fmtRes.data || []) as unknown as ContentFormat[]);
      setSubFormats((sfRes.data || []) as unknown as ContentSubFormat[]);
      setCategoryFormats((cfRes.data || []) as unknown as CategoryFormatLink[]);
      setVisualStyles((vsRes.data || []) as unknown as VisualStyle[]);
      setProductionCapabilities((pcRes.data || []) as unknown as ProductionCapability[]);
      setAssetSourceTypes((asRes.data || []) as unknown as AssetSourceType[]);
      setFormatCapabilities((fcRes.data || []) as unknown as FormatCapabilityLink[]);
      setStyleCharacters((scRes.data || []) as unknown as StyleCharacter[]);
      setStyleCapabilityRules((scrRes.data || []) as unknown as StyleCapabilityRule[]);
      setOutputPresets((opRes.data || []) as unknown as OutputPreset[]);
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

  /** Get sub-formats for a given format */
  const getSubFormatsForFormat = useCallback((formatId: string): ContentSubFormat[] => {
    return subFormats.filter(sf => sf.format_id === formatId);
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
      toast.success(`Category "${data.label}" added`);
      await fetchAll();
      return newCat;
    } catch (err: any) {
      console.error('[useCastContentRegistry] Failed to add category:', err);
      toast.error('Failed to add category');
      return null;
    }
  }, [categories.length, fetchAll]);

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

  /** Get characters available for a given style (including parent) */
  const getCharactersForStyle = useCallback((styleId: string): StyleCharacter[] => {
    const style = visualStyles.find(s => s.id === styleId);
    if (!style) return [];
    // Get characters for this style AND parent style
    const ids = new Set([styleId]);
    if (style.parent_style_id) ids.add(style.parent_style_id);
    return styleCharacters.filter(sc => ids.has(sc.style_id)).sort((a, b) => a.sort_order - b.sort_order);
  }, [styleCharacters, visualStyles]);

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
    isLoading,
    refresh: fetchAll,
    getFormatsForCategory,
    getSubFormatsForFormat,
    getCapabilitiesForFormat,
    getCharactersForStyle,
    getCapabilityRulesForStyle,
    estimateScenes,
    requiresMessaging,
    addCategory,
    addFormat,
    addSubFormat,
  };
}
